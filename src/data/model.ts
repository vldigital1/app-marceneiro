// Tipos usados pelas páginas e componentes (sem dependência de Node — seguro no navegador).

export type MaterialRow = { item: string; material: string; thickness: number; quantity: string; wasteFactor: number };
export type CutRow = {
  pieceName: string;
  quantity: number;
  length: number;
  width: number;
  thickness: number;
  grainDirection: "comprimento" | "largura" | "livre";
  material: string;
  /** true quando o material é chapa (entra na calculadora de plano de corte) */
  isSheet: boolean;
};

export type Project = {
  slug: string;
  title: string;
  category: string;
  environment: string;
  primaryMaterial: string;
  difficulty: string;
  estimatedTime: string;
  toolsRequired: string[];
  heightMm: number;
  widthMm: number;
  depthMm: number;
  summary: string;
  materialsList: MaterialRow[];
  cutList: CutRow[];
  joineryType: string;
  joineryJustification: string;
  hardware: { item: string; quantity: string }[];
  finish: string;
  assemblySteps: string[];
  warnings: string[];
  costMin: number;
  costMax: number;
  images: string[];
  imagePrompts: string[];
  downloadPdfUrl: string;
  featured: boolean;
  /** exclusivo: ficha, PDF e vistas técnicas só pelo servidor, depois da senha */
  locked: boolean;
  /** vistas técnicas servidas pelo servidor (projetos exclusivos já liberados) */
  extraImages: string[];
};

/** Versão enxuta para cards e para o filtro do catálogo */
export type ProjectCardData = Pick<
  Project,
  | "slug"
  | "title"
  | "category"
  | "environment"
  | "primaryMaterial"
  | "difficulty"
  | "estimatedTime"
  | "summary"
  | "heightMm"
  | "widthMm"
  | "depthMm"
  | "costMin"
  | "costMax"
  | "images"
  | "featured"
  | "locked"
>;

export type Post = {
  slug: string;
  title: string;
  excerpt: string;
  tags: string[];
  publishedAt: string;
  readingMinutes: number;
  coverPrompt: string;
  content: string;
};
