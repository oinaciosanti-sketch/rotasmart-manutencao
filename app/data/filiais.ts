
export type Filial = {
  id: number;
  cloudId?: string;
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

// Base inicial vazia para a versão demonstrativa.
// Novas filiais poderão ser cadastradas pelo sistema.
const rawInitialBranches: Filial[] = [];

// Mantida para compatibilidade com outras funcionalidades
// do RotaSmart que utilizam o número da filial.
export function branchNumberFromCnpj(cnpj: string): string | null {
  const digits = String(cnpj || "").replace(/\D/g, "");

  if (digits.length !== 14) return null;

  const establishment = Number(digits.slice(8, 12));

  if (
    !Number.isInteger(establishment) ||
    establishment < 1
  ) {
    return null;
  }

  return String(establishment - 1).padStart(2, "0");
}

export const initialBranches: Filial[] =
  rawInitialBranches.map((branch) => ({
    ...branch,
    numeroFilial:
      branchNumberFromCnpj(branch.cnpj) ??
      branch.numeroFilial,
  }));

export const filiais = initialBranches;

export const cidadesFiliais = Array.from(
  new Set(
    initialBranches
      .map((branch) => branch.cidade)
      .filter(Boolean)
  )
).sort();
