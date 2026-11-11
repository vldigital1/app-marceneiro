// Kit para gerar projetos a partir de um modelo 3D paramétrico.
// Lista de corte, medidas finais, custo e parte dos avisos saem das próprias peças.
import { DEFAULT_SHEET, packPieces } from "../../lib/cutting/packer";
import { bounds, pieceDims, type Part } from "../../lib/model3d";
import type { CategoryKey, DifficultyKey, EnvironmentKey, MaterialKey } from "../../lib/taxonomy";
import type { Cut, MaterialDef, ProjectDef } from "../types";

// ───────────── materiais de compra (com aparência 3D e preço de referência) ─────────────
const chapa = (key: string, item: string, material: string, t: number, look: string, price: number): MaterialDef => ({
  key,
  item,
  material,
  thickness: t,
  waste: 0.12,
  kind: "chapa",
  look,
  price,
});
const tab = (key: string, material: string, t: number, bw: number, look: string, pricePerM2: number, waste = 0.15): MaterialDef => ({
  key,
  item: bw <= 70 ? `Sarrafo/ripa ${t} × ${bw} mm` : `Tábua aparelhada ${t} × ${bw} mm`,
  material,
  thickness: t,
  waste,
  kind: "tabua",
  boardWidth: bw,
  look,
  price: pricePerM2,
});

export const MAT = {
  bp15: (cor = "branco", look = "branco") => chapa(`bp15-${look}`, "Chapa de MDF BP 15 mm", `MDF BP ${cor}`, 15, look, 330),
  bp18: (cor = "branco", look = "branco") => chapa(`bp18-${look}`, "Chapa de MDF BP 18 mm", `MDF BP ${cor}`, 18, look, 390),
  mdf15: (look = "mdf-cru") => chapa(`mdf15-${look}`, "Chapa de MDF cru 15 mm (para pintar)", "MDF cru", 15, look, 230),
  mdf18: (look = "mdf-cru") => chapa(`mdf18-${look}`, "Chapa de MDF cru 18 mm (para pintar)", "MDF cru", 18, look, 260),
  ru18: (cor = "branco", look = "branco") => chapa(`ru18-${look}`, "Chapa de MDF RU 18 mm", `MDF resistente à umidade, BP ${cor}`, 18, look, 460),
  mdf6: () => chapa("mdf6", "Chapa de MDF 6 mm", "MDF cru", 6, "mdf-cru", 120),
  hdf3: () => ({ ...chapa("hdf3", "Chapa de fundo 3 mm", "HDF (chapa de fibra)", 3, "hdf", 85), waste: 0.1 }),
  comp15: () => chapa("comp15", "Chapa de compensado 15 mm", "Compensado", 15, "clara", 290),
  naval15: () => chapa("naval15", "Chapa de compensado naval 15 mm", "Compensado naval", 15, "madeira", 420),
  pinus: (t: number, bw: number, look = "pinus") => tab(`pinus${t}x${bw}${look === "pinus" ? "" : `-${look}`}`, "Pinus aparelhado seco", t, bw, look, t >= 40 ? 260 : t >= 30 ? 150 : 95),
  cambara: (t: number, bw: number) => tab(`cambara${t}x${bw}`, "Cambará aparelhado", t, bw, "cambara", t >= 40 ? 420 : 190),
  tauari: (t: number, bw: number) => tab(`tauari${t}x${bw}`, "Tauari aparelhado", t, bw, "clara", 230),
  eucalipto: (t: number, bw: number) => tab(`euca${t}x${bw}`, "Eucalipto tratado aparelhado", t, bw, "madeira", t >= 40 ? 300 : 150),
  dura: (t: number, bw: number, look: "clara" | "escura" | "madeira" = "madeira") =>
    tab(`dura${t}x${bw}${look}`, look === "escura" ? "Madeira dura escura (roxinho, ipê ou jatobá)" : look === "clara" ? "Madeira dura clara (marfim, tauari)" : "Madeira dura (eucalipto, cumaru)", t, bw, look, 520),
  pallet: (n: number) =>
    ({ key: "pallet", item: "Pallet PBR com carimbo HT", material: "Madeira de pallet", thickness: 20, waste: 0.2, kind: "outro", quantity: `${n} un`, look: "pallet", price: n * 25 }) as MaterialDef,
  metalon: (bars: number) =>
    ({ key: "metalon", item: "Metalon 30 × 30 mm", material: "Aço carbono com pintura preta", thickness: 30, waste: 0.05, kind: "outro", quantity: `${bars} barra(s) de 6 m`, look: "metal", price: bars * 95 }) as MaterialDef,
  outro: (key: string, item: string, material: string, quantity: string, look: string, price: number, thickness = 0) =>
    ({ key, item, material, thickness, waste: 0.1, kind: "outro", quantity, look, price }) as MaterialDef,
};

export const TOOLS = {
  base: ["Trena", "Esquadro de carpinteiro", "Lápis de marceneiro", "Furadeira/parafusadeira", "Brocas para madeira 3, 5 e 8 mm", "Lixadeira orbital (lixas 80, 120 e 220)", "Grampos sargento (mín. 2)"],
  mdf: ["Serra circular com guia (ou corte na loja de chapas)", "Ferro de passar ou coladeira de borda + refilador", "Gabarito para cavilha 8 mm"],
  portas: ["Broca de caneco 35 mm (Forstner)", "Gabarito de furação sistema 32 mm"],
  madeira: ["Serra circular com guia", "Serra de esquadria (ou caixa de meia-esquadria)"],
  kreg: ["Gabarito de furo oblíquo (pocket hole)"],
  tico: ["Serra tico-tico"],
  pallet: ["Pé de cabra e marreta de borracha", "Serra sabre ou serrote para cortar pregos"],
  plaina: ["Plaina elétrica ou desengrossadeira"],
  tupia: ["Tupia manual"],
  nivel: ["Nível de bolha"],
};

export const FIN = {
  bp: "Chapa BP já vem revestida: não precisa pintar. Aplique fita de borda PVC na cor da chapa em todas as bordas visíveis, refile o excesso e quebre a quina com lixa 320.",
  pintura:
    "Lixe com 150, aplique fundo preparador para MDF (duas demãos nas bordas), lixe com 320 e aplique 2 demãos de esmalte acrílico ou PU base água com rolo de espuma, lixando com 400 entre demãos.",
  verniz:
    "Lixe 80 → 120 → 220 no sentido do veio, tire o pó, aplique seladora e, depois de seca, 2 demãos de verniz PU base água acetinado com lixa 400 entre demãos.",
  oleo: "Lixe até 220, aplique óleo para madeira com pano, deixe penetrar 15 minutos e retire todo o excesso. Repita após 24 h e renove uma vez por ano.",
  alimento:
    "Somente óleo mineral de grau alimentício ou mistura de óleo mineral com cera de abelha (4:1). Aplique generosamente, deixe agir 6 h e retire o excesso. Nunca use verniz em superfície que toca alimento.",
  externo: "Stain impregnante com filtro UV em 2 a 3 demãos (ou óleo para deck). Evite verniz em área externa: ele descasca com sol e chuva. Refaça a manutenção a cada 12 meses.",
  pallet: "Lixe tudo com 60 e depois 120 para tirar farpas (áreas de contato até 180). Escove o pó, aplique stain impregnante e, em área interna, finalize com verniz PU base água fosco.",
  atoxico: "Somente acabamentos atóxicos: óleo mineral, cera de abelha ou verniz/tinta com certificação para brinquedos. Lixe até 220 e arredonde todas as quinas.",
};

export const WARN = {
  tombamento: "Móvel alto: prenda na parede com suporte antitombamento. Sem isso ele pode tombar ao abrir portas e gavetas carregadas.",
  parede: "Móvel fixado em parede: use bucha e parafuso compatíveis com a parede. Em drywall, use bucha basculante ou fixe no montante metálico.",
  prefuro: "Faça pré-furo de 3 mm no MDF antes de parafusar em topo, a pelo menos 20 mm da ponta — senão a chapa abre.",
  corteLoja: "Sem serra de bancada, leve a lista de corte à loja de chapas: corte e fita de borda saem mais precisos que fazer em casa.",
  esquadro: "Confira o esquadro medindo as duas diagonais antes de fixar o fundo: elas devem ser iguais (tolerância de 2 mm).",
  pallet: "Use só pallets com carimbo HT (tratamento térmico). Descarte os com carimbo MB (brometo de metila), manchados de óleo ou sem carimbo.",
  pregos: "Retire todos os pregos antes de passar a madeira em qualquer serra ou plaina.",
  umidade: "Madeira maciça precisa estar seca (umidade abaixo de 15 %). Madeira úmida empena depois de montada.",
  tampoMacico: "Não cole nem parafuse rigidamente um tampo maciço na estrutura: use fixadores em Z ou furos oblongos para a madeira poder dilatar.",
  brinquedo: "Para vender brinquedo no Brasil é obrigatória a certificação compulsória do INMETRO. Sem ela, faça só para uso próprio.",
  epi: "Use óculos de proteção, protetor auricular e máscara PFF2 ao cortar e lixar.",
  cambara: "Em área externa não deixe a madeira em contato direto com o chão: use sapatas ou pés plásticos.",
};

// ───────────── utilidades ─────────────
export const slugify = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/×/g, "x")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

export const cm = (mm: number) => (mm / 10).toLocaleString("pt-BR", { maximumFractionDigits: 1 });
const round10 = (n: number) => Math.max(10, Math.round(n / 10) * 10);

/** Agrupa peças iguais (nome + medidas + material) na lista de corte. */
export function cutFromParts(parts: Part[], materials: MaterialDef[]): Cut[] {
  const byKey = new Map(materials.map((m) => [m.key, m]));
  const groups = new Map<string, Cut>();
  for (const p of parts) {
    if (p.cut === false) continue;
    const m = byKey.get(p.mat);
    if (!m) throw new Error(`peça "${p.name}" usa material sem cadastro: ${p.mat}`);
    if (m.kind === "outro" && m.key !== "pallet") continue;
    const d = pieceDims(p);
    const grain = p.grain ?? (m.kind === "chapa" ? (m.look === "carvalho" || m.look === "freijo" ? "comprimento" : "livre") : "comprimento");
    const k = `${p.name}|${d.length}|${d.width}|${d.thickness}|${p.mat}`;
    const g = groups.get(k);
    if (g) g[1]++;
    else groups.set(k, [p.name, 1, d.length, d.width, d.thickness, grain, p.mat]);
  }
  return [...groups.values()];
}

/** Custo estimado: chapas pelo plano de corte, madeira por m², resto pelo preço informado. */
export function estimateCost(materials: MaterialDef[], cut: Cut[], hardware: number): [number, number] {
  let total = hardware;
  for (const m of materials) {
    const mine = cut.filter((c) => c[6] === m.key);
    if (m.kind === "chapa") {
      if (!mine.length) continue;
      const area = mine.reduce((s, c) => s + c[1] * c[2] * c[3], 0) / 1e6;
      const sheetArea = (DEFAULT_SHEET.length * DEFAULT_SHEET.width) / 1e6;
      const res = packPieces(mine.map((c, i) => ({ id: String(i), name: c[0], quantity: c[1], length: c[2], width: c[3], canRotate: c[5] === "livre" })));
      const sheets = area * (1 + m.waste) < sheetArea * 0.35 ? (area * 1.4) / sheetArea : res.sheets.length;
      total += sheets * (m.price ?? 300);
    } else if (m.kind === "tabua") {
      const area = mine.reduce((s, c) => s + c[1] * c[2] * c[3], 0) / 1e6;
      total += area * (1 + m.waste) * (m.price ?? 100);
    } else total += m.price ?? 0;
  }
  return [round10(total * 0.9), round10(total * 1.3)];
}

export type GenInput = {
  title: string;
  slug?: string;
  category: CategoryKey;
  environment: EnvironmentKey;
  primaryMaterial: MaterialKey;
  difficulty: DifficultyKey;
  estimatedTime: string;
  tools: string[];
  summary: string;
  materials: MaterialDef[];
  parts: Part[];
  joinery: string;
  joineryWhy: string;
  hardware: [string, string][];
  hwCost: number;
  finish: string;
  steps: string[];
  warnings: string[];
  visual: string;
  scene: string;
  featured?: boolean;
  /** linhas extras na lista de corte (ex.: pallets usados inteiros) */
  extraCut?: Cut[];
};

/** Transforma um modelo paramétrico em ficha completa. */
export function gen(g: GenInput): ProjectDef {
  const b = bounds(g.parts);
  const dims: [number, number, number] = [Math.round(b.size[1]), Math.round(b.size[0]), Math.round(b.size[2])];
  const cut = [...cutFromParts(g.parts, g.materials), ...(g.extraCut ?? [])];
  const used = new Set(cut.map((c) => c[6]));
  const materials = g.materials.filter((m) => m.kind === "outro" || used.has(m.key));
  const warnings = [...g.warnings];
  // aviso automático de vão de prateleira
  for (const c of cut) {
    if (!/Prateleira/i.test(c[0])) continue;
    const m = materials.find((x) => x.key === c[6]);
    const limit = m?.kind === "chapa" ? (c[4] <= 15 ? 800 : 900) : c[4] >= 30 ? 1000 : 900;
    if (c[2] > limit) {
      warnings.push(`A ${c[0].toLowerCase()} tem ${cm(c[2])} cm de vão — acima do limite prático de ~${cm(limit)} cm para ${c[4]} mm. Coloque uma testeira colada sob a borda frontal ou um apoio central.`);
      break;
    }
  }
  if (dims[0] > 1400 && dims[2] < dims[0] / 3 && !warnings.includes(WARN.tombamento)) warnings.unshift(WARN.tombamento);
  return {
    slug: g.slug ?? slugify(g.title),
    title: g.title,
    category: g.category,
    environment: g.environment,
    primaryMaterial: g.primaryMaterial,
    difficulty: g.difficulty,
    estimatedTime: g.estimatedTime,
    tools: [...new Set(g.tools)],
    dims,
    summary: g.summary,
    materials,
    cut,
    joinery: g.joinery,
    joineryWhy: g.joineryWhy,
    hardware: g.hardware,
    finish: g.finish,
    steps: g.steps,
    warnings,
    cost: estimateCost(materials, cut, g.hwCost),
    visual: g.visual,
    scene: g.scene,
    featured: g.featured,
    parts: g.parts,
  };
}
