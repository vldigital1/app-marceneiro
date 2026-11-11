export const CATEGORIES = {
  quarto: "Quarto e closet",
  sala: "Sala e escritório",
  entrada: "Entrada",
  cozinha: "Cozinha",
  banheiro: "Banheiro",
  organizacao: "Organização",
  prateleiras: "Prateleiras e nichos",
  jardim: "Plantas e jardim",
  pallet: "Pallet",
  adega: "Adega e bar",
  oficina: "Oficina",
  pet: "Pet",
  infantil: "Infantil",
  decoracao: "Decoração",
} as const;

export const ENVIRONMENTS = {
  quarto: "Quarto",
  sala: "Sala",
  escritorio: "Escritório",
  cozinha: "Cozinha",
  banheiro: "Banheiro",
  entrada: "Entrada",
  externa: "Área externa",
  oficina: "Oficina",
  qualquer: "Qualquer ambiente",
} as const;

export const MATERIALS = {
  mdf: "MDF",
  macica: "Madeira maciça",
  pallet: "Pallet",
  sobras: "Sobras",
} as const;

export const DIFFICULTIES = {
  iniciante: "Iniciante",
  intermediario: "Intermediário",
  avancado: "Avançado",
} as const;

export const GRAIN_LABEL: Record<string, string> = {
  comprimento: "No comprimento",
  largura: "Na largura",
  livre: "Livre",
};

export type CategoryKey = keyof typeof CATEGORIES;
export type EnvironmentKey = keyof typeof ENVIRONMENTS;
export type MaterialKey = keyof typeof MATERIALS;
export type DifficultyKey = keyof typeof DIFFICULTIES;

export function label<T extends Record<string, string>>(map: T, key: string) {
  return (map as Record<string, string>)[key] ?? key;
}

export function formatBRL(n: number) {
  return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
}

export function costRange(min: number, max: number) {
  return `${formatBRL(min)} – ${formatBRL(max)}`;
}

export function mmToCm(mm: number) {
  const cm = mm / 10;
  return Number.isInteger(cm) ? `${cm}` : cm.toLocaleString("pt-BR", { maximumFractionDigits: 1 });
}

export function dims(h: number, w: number, d: number) {
  return `${mmToCm(h)} × ${mmToCm(w)} × ${mmToCm(d)} cm`;
}
