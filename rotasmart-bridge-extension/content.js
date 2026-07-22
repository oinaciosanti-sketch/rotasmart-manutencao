(function () {
  "use strict";
  if (window.__rotaSmartBridgeLoaded) return;
  window.__rotaSmartBridgeLoaded = true;

  const utils = window.RotaSmartBridgeUtils;
  const COLUMN_SELECTORS = [
    "[data-testid*='kanban-column']", "[data-testid*='column']", "[data-column-id]",
    "[class*='kanban-column']", "[class*='kanbanColumn']", "[class*='board-column']",
    "[class*='boardColumn']", "[class*='lane']"
  ];
  const CARD_SELECTORS = [
    "[data-testid*='ticket-card']", "[data-testid*='card']", "[data-ticket-id]",
    ".field-item.kanban-dragable-item[data-number]", "[data-number]",
    "[class*='ticket-card']", "[class*='ticketCard']", "[class*='kanban-card']",
    "[class*='kanbanCard']", "[class*='board-card']", "[class*='card-item']"
  ];

  function visible(element) {
    if (!(element instanceof HTMLElement)) return false;
    const style = getComputedStyle(element);
    const box = element.getBoundingClientRect();
    return style.display !== "none" && style.visibility !== "hidden" && box.width > 20 && box.height > 10;
  }

  function uniqueElements(elements) {
    return Array.from(new Set(elements)).filter(visible);
  }

  function headingFor(column) {
    const selectors = ["[data-testid*='title']", "[class*='column-title']", "[class*='columnTitle']", "header", "h1", "h2", "h3", "h4", "strong", "b"];
    for (const selector of selectors) {
      const element = column.querySelector(selector);
      const text = utils.cleanText(element?.textContent).split("\n")[0];
      if (text && text.length <= 80) return text.replace(/\s*\(?\d+\)?\s*$/, "").trim();
    }
    return utils.cleanText(column.textContent).split("\n")[0].replace(/\s*\(?\d+\)?\s*$/, "").trim();
  }

  function candidateColumns() {
    let columns = uniqueElements(COLUMN_SELECTORS.flatMap(selector => Array.from(document.querySelectorAll(selector))));
    if (columns.length) return columns;
    const headings = uniqueElements(Array.from(document.querySelectorAll("h1,h2,h3,h4,[role='heading'],strong,b")));
    const statusHeadings = headings.filter(element => utils.KNOWN_STATUS_WORDS.some(status => utils.normalize(element.textContent).includes(status)));
    columns = statusHeadings.map(heading => heading.closest("[role='group'],section,article,div")).filter(Boolean);
    return uniqueElements(columns);
  }

  function movideskPairedColumns() {
    return uniqueElements(Array.from(document.querySelectorAll(".column-header.column-kanban[data-id]"))).map(header => {
      const id = header.getAttribute("data-id");
      const status = utils.cleanText(header.querySelector(".column-name")?.textContent || headingFor(header));
      const body = id ? document.querySelector(`.column-group.column-kanban[data-id="${CSS.escape(id)}"]`) : null;
      return body && status ? { element: body, status } : null;
    }).filter(Boolean);
  }

  function candidateCards(column) {
    let cards = uniqueElements(CARD_SELECTORS.flatMap(selector => Array.from(column.querySelectorAll(selector))));
    if (cards.length) return cards.filter(card => card !== column);
    const links = uniqueElements(Array.from(column.querySelectorAll("a[href]"))).filter(link => utils.extractTicketNumber(link.textContent, link.href));
    cards = links.map(link => link.closest("article,li,[role='listitem'],[draggable='true'],div") || link);
    if (cards.length) return uniqueElements(cards);
    return uniqueElements(Array.from(column.querySelectorAll("article,li,[role='listitem'],[draggable='true']"))).filter(card => utils.cleanText(card.textContent).length > 3);
  }

  function parseCard(card, status) {
    const rawText = utils.cleanText(card.innerText || card.textContent);
    const link = card.matches("a[href]") ? card : card.querySelector("a[href]");
    const href = link?.href || null;
    const movideskId = card.getAttribute("data-number") || card.getAttribute("data-ticket-id") || utils.extractTicketNumber(rawText, href) || card.dataset?.id;
    const numeroChamado = utils.extractTicketNumber(rawText, href) || movideskId || "";
    const lines = rawText.split("\n").map(utils.cleanText).filter(Boolean);
    const titleElement = card.querySelector("[data-testid*='title'],[class*='title'],h3,h4,strong,b");
    let titulo = utils.cleanText(titleElement?.textContent);
    if (!titulo || titulo === numeroChamado || /^#?\d+$/.test(titulo)) {
      titulo = lines.find(line => line !== numeroChamado && !line.includes(numeroChamado) && utils.normalize(line) !== utils.normalize(status)) || "Sem título identificado";
    }
    const descricao = lines.filter(line => line !== titulo && line !== numeroChamado && !/^#?\d+$/.test(line)).slice(0, 3).join(" — ") || titulo;
    const mapped = utils.mapStatus(status);
    const filial = utils.extractBranch(rawText);
    const cidade = utils.extractCity(rawText);
    return {
      origem: "Movidesk",
      movideskId: movideskId ? String(movideskId) : null,
      numeroChamado: String(numeroChamado || ""),
      statusOrigem: status,
      statusRotaSmart: mapped.statusRotaSmart,
      titulo,
      descricao,
      filial,
      cidade,
      urgencia: "Média",
      analistaResponsavel: "Não definido",
      linkOrigem: href,
      rawText,
      extraidoEm: new Date().toISOString(),
      needsReview: mapped.needsReview || !numeroChamado || !filial || !cidade
    };
  }

  function analyzeKanban(selectedStatuses) {
    const pairedColumns = movideskPairedColumns();
    const sourceColumns = pairedColumns.length ? pairedColumns : candidateColumns().map((element, index) => ({ element, status: headingFor(element) || `Coluna ${index + 1}` }));
    const columns = sourceColumns.map(({ element, status }) => {
      const cards = candidateCards(element);
      return { element, status, cardCount: cards.length };
    }).filter(column => column.status);
    const selected = Array.isArray(selectedStatuses) && selectedStatuses.length ? new Set(selectedStatuses) : null;
    const tickets = columns.filter(column => !selected || selected.has(column.status)).flatMap(column => candidateCards(column.element).map(card => parseCard(card, column.status)));
    const deduplicated = Array.from(new Map(tickets.map((ticket, index) => [`${ticket.statusOrigem}|${ticket.numeroChamado || ticket.movideskId || index}`, ticket])).values());
    return {
      ok: columns.length > 0,
      url: location.href,
      title: document.title,
      isMovidesk: /movidesk/i.test(location.hostname + document.title + document.body.innerText.slice(0, 1000)),
      columns: columns.map(({ status, cardCount }) => ({ status, cardCount })),
      tickets: deduplicated,
      diagnostics: {
        columnsFound: columns.length,
        cardsFound: deduplicated.length,
        validTickets: deduplicated.filter(ticket => ticket.numeroChamado).length,
        withoutNumber: deduplicated.filter(ticket => !ticket.numeroChamado).length,
        needsReview: deduplicated.filter(ticket => ticket.needsReview).length
      }
    };
  }

  chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (!message || !["ROTASMART_ANALYZE", "ROTASMART_EXTRACT"].includes(message.type)) return;
    try {
      sendResponse(analyzeKanban(message.type === "ROTASMART_EXTRACT" ? message.statuses : undefined));
    } catch (error) {
      sendResponse({ ok: false, error: error instanceof Error ? error.message : String(error), columns: [], tickets: [] });
    }
  });
})();
