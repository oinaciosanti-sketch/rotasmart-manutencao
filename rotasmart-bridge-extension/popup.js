(function () {
  "use strict";
  const utils = window.RotaSmartBridgeUtils;
  const state = { tab: null, analysis: null, tickets: [] };
  const $ = id => document.getElementById(id);

  function setBusy(busy) {
    ["analyze", "extract", "exportJson", "exportCsv"].forEach(id => { if ($(id)) $(id).disabled = busy; });
  }

  function message(text, type = "") {
    const element = $("message");
    element.hidden = !text;
    element.textContent = text;
    element.className = `message ${type}`;
  }

  function log(value) {
    $("logs").textContent = typeof value === "string" ? value : JSON.stringify(value, null, 2);
  }

  async function currentTab() {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab?.id) throw new Error("Nenhuma aba ativa encontrada.");
    state.tab = tab;
    return tab;
  }

  async function send(type, statuses) {
    const tab = state.tab || await currentTab();
    try {
      return await chrome.tabs.sendMessage(tab.id, { type, statuses });
    } catch (_error) {
      await chrome.scripting.executeScript({ target: { tabId: tab.id }, files: ["utils.js", "content.js"] });
      return chrome.tabs.sendMessage(tab.id, { type, statuses });
    }
  }

  function selectedStatuses() {
    return Array.from(document.querySelectorAll("#statuses input:checked")).map(input => input.value);
  }

  function renderStatuses(columns) {
    $("statuses").innerHTML = columns.map((column, index) => `<label class="status-option"><input type="checkbox" value="${escapeHtml(column.status)}" checked><b>${escapeHtml(column.status)}</b><span>${column.cardCount}</span></label>`).join("");
    $("statusSection").hidden = !columns.length;
  }

  function escapeHtml(value) {
    return String(value ?? "").replace(/[&<>"']/g, character => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[character]);
  }

  function renderResult(result) {
    const tickets = result.tickets || [];
    state.tickets = tickets;
    const diagnostics = result.diagnostics || {};
    $("summary").innerHTML = [
      [tickets.length, "Encontrados"],
      [diagnostics.validTickets || 0, "Com número"],
      [diagnostics.withoutNumber || 0, "Sem número"],
      [diagnostics.needsReview || 0, "Para revisar"]
    ].map(([value, label]) => `<div class="metric"><b>${value}</b><span>${label}</span></div>`).join("");
    $("preview").innerHTML = tickets.slice(0, 100).map(ticket => `<tr><td><b>#${escapeHtml(ticket.numeroChamado || "—")}</b></td><td>${escapeHtml(ticket.statusRotaSmart)}</td><td><span class="ticket-title" title="${escapeHtml(ticket.titulo)}">${escapeHtml(ticket.titulo)}</span><span class="ticket-place">${escapeHtml(ticket.filial || ticket.cidade || "Local não identificado")}</span></td><td>${ticket.needsReview ? '<span class="review">Revisar</span>' : '<span class="ok">OK</span>'}</td></tr>`).join("");
    $("resultSection").hidden = !tickets.length;
    log({ url: result.url, isMovidesk: result.isMovidesk, columns: result.columns, diagnostics: result.diagnostics });
  }

  async function analyze() {
    setBusy(true); message("");
    try {
      const tab = await currentTab();
      if (!/^https?:/.test(tab.url || "")) throw new Error("Abra a página do Kanban do Movidesk antes de analisar.");
      const result = await send("ROTASMART_ANALYZE");
      state.analysis = result;
      if (!result?.isMovidesk) message("Esta página não parece ser o Kanban do Movidesk.", "error");
      else if (!result.ok || !result.columns?.length) message("Nenhuma coluna encontrada. Role o Kanban para carregar os cards e tente novamente.", "error");
      else message(`${result.columns.length} status e ${result.tickets.length} cards visíveis encontrados.`, "success");
      renderStatuses(result.columns || []);
      if (result.tickets?.length) renderResult(result);
      else $("resultSection").hidden = true;
    } catch (error) {
      message(error instanceof Error ? error.message : String(error), "error"); log(error instanceof Error ? error.stack || error.message : error);
    } finally { setBusy(false); }
  }

  async function extract() {
    const statuses = selectedStatuses();
    if (!statuses.length) { message("Selecione pelo menos um status.", "error"); return; }
    setBusy(true); message("");
    try {
      const result = await send("ROTASMART_EXTRACT", statuses);
      if (!result?.tickets?.length) { message("Nenhum card encontrado nos status selecionados.", "error"); $("resultSection").hidden = true; return; }
      renderResult(result);
      message(`${result.tickets.length} chamados extraídos. ${result.diagnostics.needsReview} precisam de revisão.`, "success");
    } catch (error) { message(error instanceof Error ? error.message : String(error), "error"); log(error); }
    finally { setBusy(false); }
  }

  function download(content, mime, extension) {
    const url = URL.createObjectURL(new Blob([content], { type: mime }));
    chrome.downloads.download({ url, filename: utils.exportFileName(extension), saveAs: true }, () => setTimeout(() => URL.revokeObjectURL(url), 1500));
  }

  $("analyze").addEventListener("click", analyze);
  $("extract").addEventListener("click", extract);
  $("toggleAll").addEventListener("click", event => {
    const boxes = Array.from(document.querySelectorAll("#statuses input"));
    const check = boxes.some(box => !box.checked);
    boxes.forEach(box => { box.checked = check; });
    event.currentTarget.textContent = check ? "Desmarcar todos" : "Marcar todos";
  });
  $("exportJson").addEventListener("click", () => {
    const payload = { source: "movidesk-kanban-extension", version: "1.0", exportedAt: new Date().toISOString(), url: state.tab?.url || state.analysis?.url || "", statuses: selectedStatuses(), tickets: state.tickets };
    download(JSON.stringify(payload, null, 2), "application/json;charset=utf-8", "json");
  });
  $("exportCsv").addEventListener("click", () => download("\uFEFF" + utils.ticketsToCsv(state.tickets), "text/csv;charset=utf-8", "csv"));
})();
