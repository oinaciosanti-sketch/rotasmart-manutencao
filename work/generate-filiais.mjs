import fs from "node:fs";

const inspection = JSON.parse(fs.readFileSync("work/filiais-inspect.ndjson", "utf8"));
const rows = inspection.values.slice(1).filter((row) => row[1]);

const asText = (value) => (value == null ? "" : String(value).trim());
const asCoordinate = (value) => {
  const parsed = Number(asText(value).replace(",", "."));
  return Number.isFinite(parsed) ? parsed : null;
};

const branches = rows.map((row, index) => {
  const latitude = asCoordinate(row[7]);
  const longitude = asCoordinate(row[8]);
  const validCoordinates = latitude !== null && longitude !== null
    && latitude >= -90 && latitude <= 90
    && longitude >= -180 && longitude <= 180;
  const establishment = asText(row[1]).match(/\/(\d{4})-/)?.[1] ?? String(index + 1);

  return {
    id: index + 1,
    numeroFilial: String(Number(establishment)).padStart(2, "0"),
    nome: asText(row[0]),
    cidade: asText(row[4]),
    uf: asText(row[5]),
    endereco: asText(row[2]),
    bairro: asText(row[3]),
    cep: asText(row[6]),
    cnpj: asText(row[1]),
    inscricaoEstadual: "",
    telefone: "",
    status: "ativo",
    latitude: validCoordinates ? latitude : null,
    longitude: validCoordinates ? longitude : null,
    geocodeStatus: validCoordinates ? "preenchida" : "pendente",
    statusDados: validCoordinates ? "ok" : "sem_coordenadas",
    fonteCoordenada: asText(row[10]),
    linkMapa: asText(row[11]),
    observacoes: validCoordinates ? "" : "Coordenadas ausentes ou inválidas na planilha de origem",
  };
});

const header = `export type Filial = {
  id: number;
  numeroFilial: string;
  nome: string;
  cidade: string;
  uf: string;
  endereco: string;
  bairro: string;
  cep: string;
  cnpj: string;
  inscricaoEstadual: string;
  telefone: string;
  status: "ativo" | "desativado";
  latitude: number | null;
  longitude: number | null;
  geocodeStatus: "pendente" | "preenchida";
  statusDados: "ok" | "incompleto" | "sem_coordenadas";
  fonteCoordenada: string;
  linkMapa: string;
  observacoes: string;
};

// Base inicial importada da aba "Coordenadas" da planilha fornecida.
// Coordenadas fora dos limites geográficos são mantidas como nulas.
export const initialBranches: Filial[] = `;

const footer = `;

export const filiais = initialBranches;
export const cidadesFiliais = Array.from(new Set(initialBranches.map((branch) => branch.cidade).filter(Boolean))).sort();
`;
fs.writeFileSync("app/data/filiais.ts", `${header}${JSON.stringify(branches, null, 2)}${footer}`, "utf8");
console.log(JSON.stringify({
  total: branches.length,
  comCoordenadas: branches.filter((branch) => branch.statusDados === "ok").length,
  semCoordenadas: branches.filter((branch) => branch.statusDados !== "ok").map((branch) => branch.cnpj),
}));
