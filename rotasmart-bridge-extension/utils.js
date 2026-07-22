(function (global) {
  "use strict";

  const STATUS_MAP = new Map([
    ["novo", "Novo"],
    ["programado", "Programado"],
    ["em atendimento", "Em atendimento"],
    ["atendimento", "Em atendimento"],
    ["aguardando compra", "Aguardando compra"],
    ["aguardando entrega", "Aguardando entrega"],
    ["concluido", "Concluído"],
    ["finalizado", "Concluído"],
    ["fechado", "Fechado"],
    ["cancelado", "Cancelado"]
  ]);

  const KNOWN_STATUS_WORDS = Array.from(STATUS_MAP.keys());

  function cleanText(value) {
    return String(value || "").replace(/\u00a0/g, " ").replace(/[ \t]+/g, " ").replace(/\n\s*\n+/g, "\n").trim();
  }

  function normalize(value) {
    return cleanText(value).normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  }

  function mapStatus(status) {
    const normalized = normalize(status);
    for (const [source, target] of STATUS_MAP) {
      if (normalized === source || normalized.includes(source)) return { statusRotaSmart: target, needsReview: false };
    }
    return { statusRotaSmart: "Novo", needsReview: true };
  }

  function extractTicketNumber(text, href) {
    const url = String(href || "");
    const fromUrl = url.match(/[?&](?:id|ticketid|ticket|chamado)=#?(\d{3,})/i) || url.match(/\/(?:ticket|tickets|chamado)s?\/(\d{3,})/i);
    if (fromUrl) return fromUrl[1];
    const source = cleanText(text);
    const labelled = source.match(/(?:chamado|ticket|protocolo|n[º°o.]?)\s*[:#-]?\s*#?(\d{3,})/i);
    if (labelled) return labelled[1];
    const firstLine = source.split("\n")[0] || "";
    const prominent = firstLine.match(/(?:^|\s)#?(\d{4,})(?:\s|$)/);
    return prominent ? prominent[1] : null;
  }

  function extractBranch(text) {
    const source = cleanText(text);
    const match = source.match(/\b((?:posto\s+[^\n,;|]*?\s+)?filial\s*(?:n[º°o.]?\s*)?#?\s*[a-z0-9-]+[^\n,;|]*)/i) || source.match(/\b(FL\s*[-#]?\s*\d+[a-z0-9-]*)\b/i) || source.match(/\b(Posto\s+[^\n,;|]{2,70})/i);
    return match ? cleanText(match[1]) : null;
  }

  function extractCity(text) {
    const source = cleanText(text);
    const labelled = source.match(/(?:cidade|munic[ií]pio)\s*[:\-]\s*([^\n,;|]{2,60})/i);
    if (labelled) return cleanText(labelled[1]);
    const cityUf = source.match(/\b([A-ZÀ-Ü][A-Za-zÀ-ÿ' .-]{2,50})\s*[,\/-]\s*(AC|AL|AP|AM|BA|CE|DF|ES|GO|MA|MT|MS|MG|PA|PB|PR|PE|PI|RJ|RN|RS|RO|RR|SC|SP|SE|TO)\b/i);
    return cityUf ? `${cleanText(cityUf[1])}, ${cityUf[2].toUpperCase()}` : null;
  }

  function csvEscape(value) {
    const text = String(value ?? "");
    return /[;"\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
  }

  function ticketsToCsv(tickets) {
    const headers = ["numeroChamado", "statusOrigem", "statusRotaSmart", "titulo", "descricao", "filial", "cidade", "urgencia", "analistaResponsavel", "linkOrigem", "needsReview", "rawText"];
    return [headers.join(";"), ...tickets.map(ticket => headers.map(header => csvEscape(ticket[header])).join(";"))].join("\r\n");
  }

  function exportFileName(extension) {
    const now = new Date();
    const pad = value => String(value).padStart(2, "0");
    return `rotasmart-movidesk-export-${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}-${pad(now.getHours())}-${pad(now.getMinutes())}.${extension}`;
  }

  global.RotaSmartBridgeUtils = { cleanText, normalize, mapStatus, extractTicketNumber, extractBranch, extractCity, ticketsToCsv, exportFileName, KNOWN_STATUS_WORDS };
})(typeof window !== "undefined" ? window : globalThis);
