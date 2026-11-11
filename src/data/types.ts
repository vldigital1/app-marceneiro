import type { Part } from "../lib/model3d";
import type { CategoryKey, DifficultyKey, EnvironmentKey, MaterialKey } from "../lib/taxonomy";

/** Material de compra. `kind` define como a quantidade é calculada quando `quantity` é omitida. */
export type MaterialDef = {
  key: string;
  item: string;
  material: string;
  thickness: number;
  waste: number; // 0.10 – 0.15
  /** chapa = otimizada em 2750×1830; tabua = metros lineares numa largura comercial */
  kind: "chapa" | "tabua" | "outro";
  /** para tabua: largura comercial da tábua em mm */
  boardWidth?: number;
  quantity?: string;
  /** aparência na ilustração 3D (chave de LOOKS em src/lib/render3d.ts) */
  look?: string;
  /** preço de referência: por chapa (chapa), por m² (tabua) ou total (outro), em R$ */
  price?: number;
};

/** [peça, qtd, comprimento, largura, espessura, veio, chaveDoMaterial?] — medidas em mm */
export type Cut = [string, number, number, number, number, "comprimento" | "largura" | "livre", string?];

export type ProjectDef = {
  slug: string;
  title: string;
  category: CategoryKey;
  environment: EnvironmentKey;
  primaryMaterial: MaterialKey;
  difficulty: DifficultyKey;
  estimatedTime: string;
  tools: string[];
  /** altura × largura × profundidade, mm */
  dims: [number, number, number];
  summary: string;
  materials: MaterialDef[];
  cut: Cut[];
  joinery: string;
  joineryWhy: string;
  hardware: [string, string][];
  finish: string;
  steps: string[];
  warnings: string[];
  cost: [number, number];
  /** descrição visual do objeto, usada nos prompts de imagem */
  visual: string;
  /** cena de uso para o segundo prompt */
  scene: string;
  featured?: boolean;
  /** modelo 3D (ilustrações). Nos projetos gerados, a lista de corte sai dele. */
  parts?: Part[];
  /** materiais usados só para a aparência do modelo 3D (projetos escritos à mão) */
  lookMaterials?: MaterialDef[];
};
