// Fonte de dados do site. Roda só no build (usa node:fs para achar as imagens geradas).
// Não importe este arquivo em componentes "use client" — passe os dados por props.
import { existsSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { DEFAULT_SHEET, packPieces } from "../lib/cutting/packer";
import type { Post, Project, ProjectCardData } from "./model";
import { posts as postDefs } from "./posts";
import { casa } from "./projects-casa";
import { externos } from "./projects-externos";
import { moveis } from "./projects-moveis";
import { petInfantil } from "./projects-pet-infantil";
import { withBase } from "../lib/base";
import { LOOKS, type LookResolver } from "../lib/render3d";
import { woodProjects } from "./gen/templates-madeira";
import { mdfProjects } from "./gen/templates-mdf";
import { novosProjetos } from "./gen/templates-novos";
import { handModels } from "./models-handwritten";
import type { Cut, MaterialDef, ProjectDef } from "./types";

function buildDefs(): ProjectDef[] {
  const hand = [...moveis, ...casa, ...externos, ...petInfantil].map((p) => {
    const m = handModels[p.slug]?.();
    return m ? { ...p, parts: m.parts, lookMaterials: m.lookMaterials } : p;
  });
  const seen = new Set(hand.map((p) => p.slug));
  const generated = [...mdfProjects(), ...woodProjects(), ...novosProjetos()].map((p) => {
    let slug = p.slug;
    for (let i = 2; seen.has(slug); i++) slug = `${p.slug}-${i}`;
    seen.add(slug);
    return { ...p, slug };
  });
  return [...hand, ...generated];
}

export const projectDefs: ProjectDef[] = buildDefs();

/** Aparência 3D: material de compra do projeto → LOOKS; senão a própria chave é um LOOK. */
export function lookResolverFor(p: ProjectDef): LookResolver {
  const mats = new Map([...(p.lookMaterials ?? []), ...p.materials].map((m) => [m.key, m]));
  return (key) => {
    const m = mats.get(key);
    if (m?.look && LOOKS[m.look]) return LOOKS[m.look];
    if (LOOKS[key]) return LOOKS[key];
    const txt = `${m?.material ?? ""} ${m?.item ?? ""}`.toLowerCase();
    if (/branco/.test(txt)) return LOOKS.branco;
    if (/preto/.test(txt)) return LOOKS.preto;
    if (/cinza/.test(txt)) return LOOKS.cinza;
    if (/hdf/.test(txt)) return LOOKS.hdf;
    if (/pallet/.test(txt)) return LOOKS.pallet;
    if (/metal|aço/.test(txt)) return LOOKS.metal;
    if (/escura|roxinho|ipê|jatobá/.test(txt)) return LOOKS.escura;
    if (/cambar/.test(txt)) return LOOKS.cambara;
    return LOOKS.pinus;
  };
}

export const RENDER_VIEWS = [
  ["3d", "Render 3D"],
  ["explodida", "Vista explodida"],
  ["vistas", "Vistas técnicas"],
] as const;

const fmt = (n: number, d = 1) => n.toLocaleString("pt-BR", { maximumFractionDigits: d, minimumFractionDigits: d });

export const defaultKeyOf = (p: ProjectDef) => p.materials.find((m) => m.kind !== "outro")?.key ?? p.materials[0].key;

/** Quantidade de compra calculada a partir da lista de corte (quando a ficha não fixa uma). */
export function resolveQuantity(m: MaterialDef, cuts: Cut[], defaultKey: string): string {
  if (m.quantity) return m.quantity;
  const mine = cuts.filter((c) => (c[6] ?? defaultKey) === m.key);
  if (!mine.length) return "—";

  if (m.kind === "chapa") {
    const res = packPieces(
      mine.map((c, i) => ({ id: String(i), name: c[0], quantity: c[1], length: c[2], width: c[3], canRotate: c[5] === "livre" })),
      DEFAULT_SHEET,
    );
    const area = mine.reduce((s, c) => s + c[1] * c[2] * c[3], 0) / 1e6;
    const sheetArea = (DEFAULT_SHEET.length * DEFAULT_SHEET.width) / 1e6;
    if (res.sheets.length === 1 && area * (1 + m.waste) < sheetArea * 0.35) {
      return `Retalho ou meia chapa: ≈ ${fmt(area * (1 + m.waste), 2)} m² (com perda)`;
    }
    return `${res.sheets.length} chapa${res.sheets.length > 1 ? "s" : ""} 2750 × 1830 mm (aproveitamento ${Math.round(res.utilization * 100)}%)`;
  }

  if (m.kind === "tabua") {
    const bw = m.boardWidth ?? 200;
    let linear = 0;
    for (const [, qty, len, width] of mine) {
      if (width <= bw) linear += (len * qty) / Math.max(1, Math.floor((bw + 4) / (width + 4)));
      else linear += len * qty * Math.ceil(width / bw);
    }
    const meters = (linear / 1000) * (1 + m.waste);
    return `≈ ${fmt(Math.ceil(meters * 10) / 10)} m lineares`;
  }
  return "—";
}

export function imagePrompts(p: ProjectDef): string[] {
  const [h, w, d] = p.dims;
  const size = `aproximadamente ${h / 10} cm de altura, ${w / 10} cm de largura e ${d / 10} cm de profundidade`;
  return [
    `Fotografia de produto em estúdio: ${p.visual}. Peça com ${size}. Fundo neutro cinza-claro liso, luz suave difusa vinda da esquerda, ângulo três-quartos levemente elevado, sombra suave no chão, foco nítido em toda a peça, lente 50 mm, cores naturais da madeira, sem texto, sem logotipo, sem marca d'água.`,
    `Fotografia de ambiente, estilo editorial de decoração: ${p.visual}, em uso — ${p.scene}. Composição horizontal, profundidade de campo rasa com a peça em foco, luz natural quente, aparência realista, sem pessoas olhando para a câmera, sem texto, sem marca d'água.`,
    `Ilustração técnica em vista explodida: ${p.visual}. Peças separadas ao longo de eixos, linhas finas em cinza-escuro, preenchimento em tons de madeira clara, fundo branco, estilo manual de montagem limpo e moderno, sem cotas, sem texto.`,
  ];
}

/** O que fica bloqueado: projetos intermediários e avançados ("metade do conteúdo"). */
/** Os primeiros projetos do catálogo ficam livres (vitrine); do PROJETOS_LIVRES em diante, exclusivos. */
export const PROJETOS_LIVRES = 36;
export const isLocked = (posicao: number) => posicao >= PROJETOS_LIVRES;

/** Renders do modelo 3D (gerados no build) + fotos que você colocar em public/images/projetos/<slug>/ */
function generatedImages(slug: string, hasModel: boolean, locked: boolean): string[] {
  // exclusivos: só o render 3D é público; vista explodida e vistas técnicas ficam no servidor
  const views = locked ? RENDER_VIEWS.filter(([f]) => f === "3d") : RENDER_VIEWS;
  const renders = hasModel ? views.map(([f]) => withBase(`/renders/${slug}/${f}.svg`)) : [];
  return [...renders, ...photos(slug)];
}

export const arquivoProtegido = (tipo: "pdf" | "render", id: string, v?: string) => withBase(`/api/arquivo.php?tipo=${tipo}&id=${encodeURIComponent(id)}${v ? `&v=${v}` : ""}`);
function photos(slug: string): string[] {
  const dir = join(process.cwd(), "public", "images", "projetos", slug);
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((f) => /\.(jpe?g|png|webp|avif)$/i.test(f))
    .sort()
    .map((f) => withBase(`/images/projetos/${slug}/${f}`));
}

export function montarProjeto(p: ProjectDef, posicao: number): Project {
  const locked = isLocked(posicao);
  const defaultKey = defaultKeyOf(p);
  const matByKey = new Map(p.materials.map((m) => [m.key, m]));
  return {
    slug: p.slug,
    title: p.title,
    category: p.category,
    environment: p.environment,
    primaryMaterial: p.primaryMaterial,
    difficulty: p.difficulty,
    estimatedTime: p.estimatedTime,
    toolsRequired: [...new Set(p.tools)],
    heightMm: p.dims[0],
    widthMm: p.dims[1],
    depthMm: p.dims[2],
    summary: p.summary,
    materialsList: p.materials.map((m) => ({
      item: m.item,
      material: m.material,
      thickness: m.thickness,
      quantity: resolveQuantity(m, p.cut, defaultKey),
      wasteFactor: m.waste,
    })),
    cutList: p.cut.map((c) => {
      const m = matByKey.get(c[6] ?? defaultKey);
      if (!m) throw new Error(`${p.slug}: peça "${c[0]}" usa material inexistente "${c[6] ?? defaultKey}"`);
      return {
        pieceName: c[0],
        quantity: c[1],
        length: c[2],
        width: c[3],
        thickness: c[4],
        grainDirection: c[5],
        material: m.kind === "chapa" ? `${m.material} ${m.thickness} mm` : m.material,
        isSheet: m.kind === "chapa",
      };
    }),
    joineryType: p.joinery,
    joineryJustification: p.joineryWhy,
    hardware: p.hardware.map(([item, quantity]) => ({ item, quantity })),
    finish: p.finish,
    assemblySteps: p.steps,
    warnings: p.warnings,
    costMin: p.cost[0],
    costMax: p.cost[1],
    images: generatedImages(p.slug, !!p.parts?.length, locked),
    imagePrompts: imagePrompts(p),
    downloadPdfUrl: locked ? arquivoProtegido("pdf", p.slug) : withBase(`/pdf/${p.slug}.pdf`),
    featured: p.featured ?? false,
    locked,
    extraImages: [],
  };
}

/** Versão completa de um projeto exclusivo, entregue pelo servidor depois da senha. */
export function projetoParaServidor(p: Project): Project {
  return { ...p, extraImages: p.images.some((i) => i.endsWith("/3d.svg")) ? ["explodida", "vistas"].map((v) => arquivoProtegido("render", p.slug, v)) : [] };
}

let cache: Project[] | null = null;

export function getProjects(): Project[] {
  if (!cache) {
    const seen = new Set<string>();
    cache = projectDefs.map((p, i) => {
      if (seen.has(p.slug)) throw new Error(`slug duplicado: ${p.slug}`);
      seen.add(p.slug);
      return montarProjeto(p, i);
    });
  }
  return cache;
}

export const getProject = (slug: string) => getProjects().find((p) => p.slug === slug) ?? null;

export const toCard = (p: Project): ProjectCardData => ({
  slug: p.slug,
  title: p.title,
  category: p.category,
  environment: p.environment,
  primaryMaterial: p.primaryMaterial,
  difficulty: p.difficulty,
  estimatedTime: p.estimatedTime,
  summary: p.summary,
  heightMm: p.heightMm,
  widthMm: p.widthMm,
  depthMm: p.depthMm,
  costMin: p.costMin,
  costMax: p.costMax,
  images: p.images,
  featured: p.featured,
  locked: p.locked,
});

export function getCards(): ProjectCardData[] {
  return getProjects()
    .map(toCard)
    .sort((a, b) => Number(a.locked) - Number(b.locked) || Number(b.featured) - Number(a.featured) || a.title.localeCompare(b.title, "pt-BR")); // livres primeiro (vitrine), depois os exclusivos
}

export function getRelated(p: Project, limit = 3) {
  return getProjects()
    .filter((x) => x.category === p.category && x.slug !== p.slug)
    .slice(0, limit)
    .map(toCard);
}

export function getStats() {
  const all = getProjects();
  return {
    projects: all.length,
    pieces: all.reduce((s, p) => s + p.cutList.reduce((t, c) => t + c.quantity, 0), 0),
    categories: new Set(all.map((p) => p.category)).size,
  };
}

export function getPosts(): Post[] {
  return postDefs
    .map((p) => ({ ...p, readingMinutes: Math.max(2, Math.round(p.content.split(/\s+/).length / 200)) }))
    .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
}

export const getPost = (slug: string) => getPosts().find((p) => p.slug === slug) ?? null;
