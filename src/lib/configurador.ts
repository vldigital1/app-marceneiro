// Configurador de móveis sob medida: tudo aqui é puro (roda no navegador).
// Cada tipo recebe as medidas do cliente e devolve as peças 3D; lista de corte,
// ferragens e conferência de medidas saem dessas mesmas peças.
import { cutFromParts } from "@/data/gen/kit";
import type { Cut, MaterialDef } from "@/data/types";
import { DEFAULT_SHEET, packPieces } from "./cutting/packer";
import { bounds, bx, carcass, openBox, pieceDims, table, type Part } from "./model3d";
import { LOOKS } from "./render3d";

export type Valores = Record<string, number | string | boolean>;

export type Param =
  | { key: string; label: string; kind: "mm"; min: number; max: number; step?: number; def: number }
  | { key: string; label: string; kind: "count"; min: number; max: number; def: number }
  | { key: string; label: string; kind: "select"; options: { value: string; label: string }[]; def: string }
  | { key: string; label: string; kind: "toggle"; def: boolean };

export type Cor = { look: string; nome: string };

/** Paleta de chapas (MDF BP) — a mesma para caixa e frentes. */
export const CORES: Cor[] = [
  { look: "branco", nome: "Branco" },
  { look: "offwhite", nome: "Off-white" },
  { look: "cristal", nome: "Cinza cristal" },
  { look: "grafite", nome: "Grafite" },
  { look: "preto", nome: "Preto" },
  { look: "louro", nome: "Louro freijó" },
  { look: "carvalho", nome: "Carvalho" },
  { look: "mel", nome: "Mel" },
  { look: "nogueira", nome: "Nogueira" },
  { look: "salvia", nome: "Sálvia" },
  { look: "oliva", nome: "Verde oliva" },
  { look: "petroleo", nome: "Azul petróleo" },
  { look: "marinho", nome: "Azul marinho" },
  { look: "mostarda", nome: "Mostarda" },
  { look: "rosa", nome: "Rosa antigo" },
];
export const corHex = (look: string) => LOOKS[look]?.base ?? "#ccc";
const corNome = (look: string) => CORES.find((c) => c.look === look)?.nome ?? look;

export const MADEIRAS = [
  { value: "pinus", label: "Pinus", look: "pinus", m2: 95 },
  { value: "tauari", label: "Tauari", look: "clara", m2: 230 },
  { value: "cambara", label: "Cambará (área externa)", look: "cambara", m2: 190 },
];

export type Resultado = {
  parts: Part[];
  materials: MaterialDef[];
  cut: Cut[];
  hardware: { item: string; qtd: string }[];
  avisos: string[];
  dims: [number, number, number];
  grupos: { key: string; nome: string; cor: string; pecas: number; linhas: Cut[] }[];
};

type Ctx = { v: Valores; caixa: string; frente: string };
type Tipo = {
  id: string;
  nome: string;
  descricao: string;
  livre: boolean;
  usaCores: boolean;
  params: Param[];
  coresPadrao: [string, string];
  build: (c: Ctx) => { parts: Part[]; materials: MaterialDef[]; avisos?: string[]; extras?: { item: string; qtd: string }[] };
};

const num = (v: Valores, k: string) => Number(v[k]);

/** Chapas com nome no formato "MDF 18 mm · Off-white". */
function chapa(t: number, look: string): MaterialDef {
  return { key: `mdf${t}-${look}`, item: `Chapa de MDF ${t} mm`, material: `MDF ${t} mm · ${corNome(look)}`, thickness: t, waste: 0.12, kind: "chapa", look };
}
function madeira(id: string, t: number, bw: number): MaterialDef {
  const m = MADEIRAS.find((x) => x.value === id) ?? MADEIRAS[0];
  return { key: `${m.value}${t}x${bw}`, item: `Tábua ${t} × ${bw} mm`, material: `${m.label.replace(/ \(.*\)/, "")} ${t} mm`, thickness: t, waste: 0.15, kind: "tabua", boardWidth: bw, look: m.look };
}
const fundo = (look: string) => chapa(6, look);

const esp: Param = { key: "t", label: "Espessura", kind: "select", options: [{ value: "15", label: "MDF 15 mm" }, { value: "18", label: "MDF 18 mm" }], def: "18" };

/** Divisórias igualmente espaçadas (posição interna) */
const divisorias = (innerW: number, t: number, cols: number) => Array.from({ length: cols - 1 }, (_, i) => Math.round(((i + 1) * (innerW - (cols - 1) * t)) / cols + i * t));
const alturas = (n: number, inner: number, t: number) => Array.from({ length: n }, (_, i) => Math.round(((i + 1) * inner) / (n + 1) - t / 2));

function caixaMats(c: Ctx, t: number, comFundo = true) {
  const cx = chapa(t, c.caixa);
  const fr = chapa(t, c.frente);
  const mats = [cx];
  if (fr.key !== cx.key) mats.push(fr);
  if (comFundo) mats.push(fundo(c.caixa));
  return { cx, fr, mats };
}
/** troca o material das peças de fundo (o construtor usa "hdf3") */
const fundoPara = (parts: Part[], key: string) => parts.map((p) => (p.mat === "hdf3" ? { ...p, mat: key } : p));

export const TIPOS: Tipo[] = [
  {
    id: "guarda-roupa",
    nome: "Guarda-roupa",
    descricao: "Colunas largas, cabideiro com maleiro na primeira coluna e prateleiras nas outras. Portas de abrir em toda a frente.",
    livre: false,
    usaCores: true,
    coresPadrao: ["offwhite", "cristal"],
    params: [
      { key: "W", label: "Largura", kind: "mm", min: 1400, max: 2700, step: 10, def: 1800 },
      { key: "H", label: "Altura", kind: "mm", min: 1900, max: 2600, step: 10, def: 2300 },
      { key: "D", label: "Profundidade", kind: "mm", min: 500, max: 650, step: 10, def: 580 },
      esp,
      { key: "cols", label: "Colunas", kind: "count", min: 2, max: 4, def: 2 },
      { key: "prat", label: "Prateleiras por coluna", kind: "count", min: 2, max: 9, def: 7 },
      { key: "portas", label: "Portas", kind: "count", min: 2, max: 8, def: 3 },
      { key: "gav", label: "Gavetas na base", kind: "count", min: 0, max: 3, def: 0 },
    ],
    build: (c) => {
      const t = Number(c.v.t),
        W = num(c.v, "W"),
        H = num(c.v, "H"),
        D = num(c.v, "D"),
        cols = num(c.v, "cols"),
        n = num(c.v, "prat"),
        gav = num(c.v, "gav");
      const { cx, fr, mats } = caixaMats(c, t);
      const plinth = 80;
      const inner = H - plinth - 3 * t;
      const dividers = divisorias(W - 2 * t, t, cols);
      const drawerH = gav ? gav * 180 : 0;
      const shelves = [
        { bay: 0, ys: [inner - 380] },
        ...Array.from({ length: cols - 1 }, (_, i) => ({ bay: i + 1, ys: alturas(n, inner - drawerH, t).map((y) => y + drawerH) })),
      ];
      if (gav) shelves.push({ bay: 0, ys: [drawerH - t] });
      const parts = carcass({
        W,
        H,
        D,
        t,
        mat: cx.key,
        frontMat: fr.key,
        plinth,
        dividers,
        shelves,
        rods: [{ bay: 0, y: inner - 460 }],
        drawers: gav ? [{ bay: 0, fronts: Array(gav).fill(180) }] : [],
        frontDoors: { count: num(c.v, "portas"), y0: drawerH },
      }).map((p) => (p.name === "Prateleira" && p.o[1] > H - plinth - 450 && p.o[0] < W / cols ? { ...p, name: "Prateleira (maleiro)" } : p));
      return { parts: fundoPara(parts, `mdf6-${c.caixa}`), materials: mats };
    },
  },
  {
    id: "armario",
    nome: "Armário com portas",
    descricao: "Armário de despensa, lavanderia ou escritório: colunas com prateleiras e portas na frente toda.",
    livre: false,
    usaCores: true,
    coresPadrao: ["branco", "carvalho"],
    params: [
      { key: "W", label: "Largura", kind: "mm", min: 400, max: 1600, step: 10, def: 800 },
      { key: "H", label: "Altura", kind: "mm", min: 600, max: 2200, step: 10, def: 1800 },
      { key: "D", label: "Profundidade", kind: "mm", min: 300, max: 600, step: 10, def: 450 },
      esp,
      { key: "cols", label: "Colunas", kind: "count", min: 1, max: 3, def: 1 },
      { key: "prat", label: "Prateleiras por coluna", kind: "count", min: 0, max: 8, def: 4 },
      { key: "portas", label: "Portas", kind: "count", min: 0, max: 6, def: 2 },
      { key: "base", label: "Base", kind: "select", options: [{ value: "rodape", label: "Rodapé recuado" }, { value: "pes", label: "Pés metálicos 15 cm" }], def: "rodape" },
    ],
    build: (c) => {
      const t = Number(c.v.t),
        W = num(c.v, "W"),
        H = num(c.v, "H"),
        D = num(c.v, "D"),
        cols = num(c.v, "cols"),
        pes = c.v.base === "pes";
      const { cx, fr, mats } = caixaMats(c, t);
      const plinth = pes ? 0 : 60;
      const inner = H - (pes ? 150 : plinth) - 3 * t;
      const parts = carcass({
        W,
        H,
        D,
        t,
        mat: cx.key,
        frontMat: fr.key,
        plinth,
        legs: pes ? { h: 150, mat: "metal", size: 30 } : undefined,
        dividers: divisorias(W - 2 * t, t, cols),
        shelves: [{ bay: "all", ys: alturas(num(c.v, "prat"), inner, t) }],
        frontDoors: { count: num(c.v, "portas") },
      });
      return { parts: fundoPara(parts, `mdf6-${c.caixa}`), materials: mats, extras: pes ? [{ item: "Pé metálico 15 cm", qtd: "4 un" }] : [] };
    },
  },
  {
    id: "estante",
    nome: "Estante aberta",
    descricao: "Estante de livros ou divisória de ambiente, com colunas e prateleiras fixas.",
    livre: true,
    usaCores: true,
    coresPadrao: ["carvalho", "carvalho"],
    params: [
      { key: "W", label: "Largura", kind: "mm", min: 400, max: 2000, step: 10, def: 900 },
      { key: "H", label: "Altura", kind: "mm", min: 400, max: 2400, step: 10, def: 1800 },
      { key: "D", label: "Profundidade", kind: "mm", min: 200, max: 450, step: 10, def: 300 },
      esp,
      { key: "cols", label: "Colunas", kind: "count", min: 1, max: 5, def: 2 },
      { key: "prat", label: "Prateleiras por coluna", kind: "count", min: 1, max: 10, def: 4 },
      { key: "fundo", label: "Fundo fechado", kind: "toggle", def: true },
    ],
    build: (c) => {
      const t = Number(c.v.t),
        W = num(c.v, "W"),
        H = num(c.v, "H"),
        D = num(c.v, "D");
      const comFundo = Boolean(c.v.fundo);
      const { cx, mats } = caixaMats({ ...c, frente: c.caixa }, t, comFundo);
      const inner = H - 50 - 3 * t;
      const parts = carcass({ W, H, D, t, mat: cx.key, plinth: 50, dividers: divisorias(W - 2 * t, t, num(c.v, "cols")), shelves: [{ bay: "all", ys: alturas(num(c.v, "prat"), inner, t) }], openBack: !comFundo });
      return { parts: fundoPara(parts, `mdf6-${c.caixa}`), materials: mats, avisos: comFundo ? [] : ["Sem fundo, a estante depende das prateleiras fixas para não balançar: parafuse todas e prenda na parede."] };
    },
  },
  {
    id: "nicho",
    nome: "Nicho de parede",
    descricao: "Nicho flutuante com divisórias, fixado por suporte invisível.",
    livre: true,
    usaCores: true,
    coresPadrao: ["preto", "preto"],
    params: [
      { key: "W", label: "Largura", kind: "mm", min: 200, max: 1500, step: 10, def: 600 },
      { key: "H", label: "Altura", kind: "mm", min: 200, max: 800, step: 10, def: 300 },
      { key: "D", label: "Profundidade", kind: "mm", min: 100, max: 400, step: 10, def: 200 },
      { key: "t", label: "Espessura", kind: "select", options: [{ value: "15", label: "MDF 15 mm" }, { value: "18", label: "MDF 18 mm" }], def: "15" },
      { key: "div", label: "Divisórias", kind: "count", min: 0, max: 5, def: 1 },
      { key: "fundo", label: "Fundo fechado", kind: "toggle", def: false },
    ],
    build: (c) => {
      const t = Number(c.v.t),
        W = num(c.v, "W");
      const comFundo = Boolean(c.v.fundo);
      const { cx, mats } = caixaMats({ ...c, frente: c.caixa }, t, comFundo);
      const parts = carcass({ W, H: num(c.v, "H"), D: num(c.v, "D"), t, mat: cx.key, topOver: false, dividers: divisorias(W - 2 * t, t, num(c.v, "div") + 1), openBack: !comFundo });
      return { parts: fundoPara(parts, `mdf6-${c.caixa}`), materials: mats, extras: [{ item: "Suporte invisível para nicho", qtd: W > 600 ? "3 un" : "2 un" }] };
    },
  },
  {
    id: "comoda",
    nome: "Cômoda / gaveteiro",
    descricao: "Gavetas com corrediça telescópica em uma ou mais colunas, sobre rodapé ou pés.",
    livre: false,
    usaCores: true,
    coresPadrao: ["branco", "louro"],
    params: [
      { key: "W", label: "Largura", kind: "mm", min: 400, max: 1800, step: 10, def: 900 },
      { key: "H", label: "Altura", kind: "mm", min: 500, max: 1300, step: 10, def: 850 },
      { key: "D", label: "Profundidade", kind: "mm", min: 350, max: 550, step: 10, def: 450 },
      esp,
      { key: "cols", label: "Colunas", kind: "count", min: 1, max: 3, def: 1 },
      { key: "gav", label: "Gavetas por coluna", kind: "count", min: 2, max: 8, def: 4 },
      { key: "pes", label: "Pés metálicos", kind: "toggle", def: false },
    ],
    build: (c) => {
      const t = Number(c.v.t),
        W = num(c.v, "W"),
        H = num(c.v, "H"),
        D = num(c.v, "D"),
        gav = num(c.v, "gav"),
        pes = Boolean(c.v.pes);
      const { cx, fr, mats } = caixaMats(c, t);
      const base = pes ? 150 : 0,
        plinth = pes ? 0 : 60;
      const frontH = H - base - plinth;
      const fh = Math.floor(frontH / gav);
      const fronts = Array.from({ length: gav }, (_, i) => (i === gav - 1 ? frontH - fh * (gav - 1) : fh));
      const parts = carcass({ W, H, D, t, mat: cx.key, frontMat: fr.key, plinth, legs: pes ? { h: base, mat: "metal", size: 30 } : undefined, dividers: divisorias(W - 2 * t, t, num(c.v, "cols")), drawers: [{ bay: "all", fronts }] });
      const avisos = fh < 100 ? ["Gavetas com menos de 10 cm de frente ficam muito rasas: diminua a quantidade ou aumente a altura."] : [];
      return { parts: fundoPara(parts, `mdf6-${c.caixa}`), materials: mats, avisos, extras: pes ? [{ item: "Pé metálico 15 cm", qtd: "4 un" }] : [] };
    },
  },
  {
    id: "rack",
    nome: "Rack de TV",
    descricao: "Rack com nichos e portas nas pontas, abertura por fecho toque.",
    livre: false,
    usaCores: true,
    coresPadrao: ["carvalho", "grafite"],
    params: [
      { key: "W", label: "Largura", kind: "mm", min: 900, max: 2400, step: 10, def: 1600 },
      { key: "H", label: "Altura", kind: "mm", min: 350, max: 700, step: 10, def: 500 },
      { key: "D", label: "Profundidade", kind: "mm", min: 300, max: 500, step: 10, def: 400 },
      esp,
      { key: "cols", label: "Vãos", kind: "count", min: 2, max: 5, def: 3 },
      { key: "portas", label: "Vãos com porta", kind: "count", min: 0, max: 5, def: 2 },
      { key: "pes", label: "Pés metálicos 12 cm", kind: "toggle", def: true },
    ],
    build: (c) => {
      const t = Number(c.v.t),
        W = num(c.v, "W"),
        H = num(c.v, "H"),
        D = num(c.v, "D"),
        cols = num(c.v, "cols"),
        pes = Boolean(c.v.pes);
      const nP = Math.min(cols, num(c.v, "portas"));
      const { cx, fr, mats } = caixaMats(c, t);
      // portas nas pontas primeiro, depois para o centro
      const order = Array.from({ length: cols }, (_, i) => i).sort((a, b) => Math.min(a, cols - 1 - a) - Math.min(b, cols - 1 - b));
      const doorBays = order.slice(0, nP);
      const parts = carcass({ W, H, D, t, mat: cx.key, frontMat: fr.key, legs: pes ? { h: 120, mat: "metal", size: 30 } : undefined, dividers: divisorias(W - 2 * t, t, cols), doors: doorBays.map((b) => ({ bay: b, leaves: 1 })), handles: "none" });
      return { parts: fundoPara(parts, `mdf6-${c.caixa}`), materials: mats, extras: [{ item: "Fecho toque (push)", qtd: `${nP} un` }, { item: "Passa-fio 35 mm", qtd: `${cols - 1} un` }] };
    },
  },
  {
    id: "sapateira",
    nome: "Sapateira",
    descricao: "Níveis de 19 cm (altura de tênis), aberta ou com portas.",
    livre: false,
    usaCores: true,
    coresPadrao: ["branco", "branco"],
    params: [
      { key: "W", label: "Largura", kind: "mm", min: 400, max: 1200, step: 10, def: 800 },
      { key: "H", label: "Altura", kind: "mm", min: 400, max: 1800, step: 10, def: 1000 },
      { key: "D", label: "Profundidade", kind: "mm", min: 300, max: 400, step: 10, def: 350 },
      { key: "t", label: "Espessura", kind: "select", options: [{ value: "15", label: "MDF 15 mm" }, { value: "18", label: "MDF 18 mm" }], def: "15" },
      { key: "niveis", label: "Níveis", kind: "count", min: 2, max: 10, def: 5 },
      { key: "portas", label: "Portas", kind: "count", min: 0, max: 4, def: 2 },
    ],
    build: (c) => {
      const t = Number(c.v.t),
        W = num(c.v, "W"),
        H = num(c.v, "H");
      const { cx, fr, mats } = caixaMats(c, t);
      const inner = H - 50 - 3 * t;
      const niveis = num(c.v, "niveis");
      const parts = carcass({ W, H, D: num(c.v, "D"), t, mat: cx.key, frontMat: fr.key, plinth: 50, dividers: W - 2 * t > 800 ? divisorias(W - 2 * t, t, 2) : [], shelves: [{ bay: "all", ys: alturas(niveis - 1, inner, t) }], frontDoors: { count: num(c.v, "portas") } });
      const vao = inner / niveis;
      return { parts: fundoPara(parts, `mdf6-${c.caixa}`), materials: mats, avisos: vao < 150 ? [`Cada nível ficou com ${Math.round(vao / 10)} cm — tênis precisa de ~17 cm. Tire um nível ou aumente a altura.`] : [] };
    },
  },
  {
    id: "aereo",
    nome: "Armário aéreo",
    descricao: "Aéreo de cozinha ou lavanderia, pendurado em suporte regulável.",
    livre: false,
    usaCores: true,
    coresPadrao: ["branco", "salvia"],
    params: [
      { key: "W", label: "Largura", kind: "mm", min: 300, max: 2000, step: 10, def: 1200 },
      { key: "H", label: "Altura", kind: "mm", min: 300, max: 1000, step: 10, def: 700 },
      { key: "D", label: "Profundidade", kind: "mm", min: 280, max: 400, step: 10, def: 330 },
      { key: "t", label: "Espessura", kind: "select", options: [{ value: "15", label: "MDF 15 mm" }, { value: "18", label: "MDF 18 mm" }], def: "15" },
      { key: "portas", label: "Portas", kind: "count", min: 1, max: 6, def: 3 },
      { key: "prat", label: "Prateleiras", kind: "count", min: 0, max: 3, def: 1 },
    ],
    build: (c) => {
      const t = Number(c.v.t),
        W = num(c.v, "W"),
        H = num(c.v, "H");
      const { cx, fr, mats } = caixaMats(c, t);
      const parts = carcass({ W, H, D: num(c.v, "D"), t, mat: cx.key, frontMat: fr.key, dividers: W - 2 * t > 900 ? divisorias(W - 2 * t, t, Math.ceil((W - 2 * t) / 900)) : [], shelves: [{ bay: "all", ys: alturas(num(c.v, "prat"), H - 2 * t, t) }], frontDoors: { count: num(c.v, "portas") } });
      return { parts: fundoPara(parts, `mdf6-${c.caixa}`), materials: mats, extras: [{ item: "Suporte regulável para armário aéreo", qtd: "1 par" }] };
    },
  },
  {
    id: "gabinete-cozinha",
    nome: "Módulo de cozinha (base)",
    descricao: "Módulo inferior com gavetas em cima e portas embaixo, sobre pés reguláveis de 10 cm.",
    livre: false,
    usaCores: true,
    coresPadrao: ["branco", "grafite"],
    params: [
      { key: "W", label: "Largura", kind: "mm", min: 300, max: 1200, step: 10, def: 800 },
      { key: "D", label: "Profundidade", kind: "mm", min: 450, max: 600, step: 10, def: 580 },
      { key: "gav", label: "Gavetas", kind: "count", min: 0, max: 4, def: 1 },
      { key: "portas", label: "Portas", kind: "count", min: 0, max: 2, def: 2 },
    ],
    build: (c) => {
      const t = 15,
        W = num(c.v, "W"),
        H = 820,
        gav = num(c.v, "gav");
      const { cx, fr, mats } = caixaMats(c, t);
      const nP = num(c.v, "portas");
      const box = H - 100;
      const drawerH = nP ? gav * 170 : box;
      const fronts = gav ? (nP ? Array(gav).fill(170) : Array.from({ length: gav }, (_, i) => (i === gav - 1 ? box - Math.floor(box / gav) * (gav - 1) : Math.floor(box / gav)))) : [];
      const parts = carcass({ W, H, D: num(c.v, "D"), t, mat: cx.key, frontMat: fr.key, legs: { h: 100, mat: "metal", size: 35 }, shelves: nP && gav < 3 ? [{ bay: 0, ys: [250] }] : [], drawers: gav ? [{ bay: 0, fronts, y0: nP ? box - drawerH : 0 }] : [], frontDoors: nP ? { count: nP, y1: H - (gav ? drawerH : 0) } : undefined });
      return { parts: fundoPara(parts, `mdf6-${c.caixa}`), materials: mats, extras: [{ item: "Pé regulável 100 mm", qtd: "4 un" }, { item: "Tampo de pedra ou MDF 30 mm", qtd: `${Math.round(W / 10)} × 60 cm` }], avisos: gav * 170 > box - 250 && nP ? ["Gavetas demais para ter porta embaixo: tire uma gaveta ou zere as portas (vira gaveteiro)."] : [] };
    },
  },
  {
    id: "mesa",
    nome: "Mesa de madeira",
    descricao: "Mesa de centro, lateral ou de jantar com tampo de réguas coladas e prateleira opcional.",
    livre: true,
    usaCores: false,
    coresPadrao: ["pinus", "pinus"],
    params: [
      { key: "W", label: "Comprimento", kind: "mm", min: 400, max: 2200, step: 10, def: 1200 },
      { key: "D", label: "Largura", kind: "mm", min: 350, max: 1000, step: 10, def: 800 },
      { key: "H", label: "Altura", kind: "mm", min: 350, max: 780, step: 10, def: 760 },
      { key: "madeira", label: "Madeira", kind: "select", options: MADEIRAS.map((m) => ({ value: m.value, label: m.label })), def: "pinus" },
      { key: "reguas", label: "Réguas no tampo", kind: "count", min: 1, max: 8, def: 5 },
      { key: "prat", label: "Prateleira embaixo", kind: "toggle", def: false },
    ],
    build: (c) => {
      const W = num(c.v, "W"),
        D = num(c.v, "D"),
        H = num(c.v, "H");
      const md = String(c.v.madeira);
      const topT = W >= 1400 ? 30 : 20;
      const leg = H >= 700 ? 70 : 45;
      const reguas = num(c.v, "reguas");
      const top = madeira(md, topT, Math.min(300, Math.ceil(D / reguas / 10) * 10 + 10));
      const legM = madeira(md, leg, leg);
      const rail = madeira(md, 20, 100);
      const parts = table({ W, H, D, topT, leg, apronH: leg >= 70 ? 90 : 70, mat: rail.key, topMat: top.key, legMat: legM.key, topBoards: reguas, inset: leg >= 70 ? 60 : 25, shelf: c.v.prat ? { y: Math.round(H * 0.2), slats: Math.max(2, Math.round((D - 100) / 90)) } : undefined });
      return { parts, materials: [top, legM, rail], avisos: W > 1800 && topT < 30 ? ["Tampo longo: use 30 mm e uma travessa central para não embarrigar."] : [] };
    },
  },
  {
    id: "banco",
    nome: "Banco de madeira",
    descricao: "Banco ou banqueta alta com travessas baixas — para entrada, mesa ou balcão.",
    livre: true,
    usaCores: false,
    coresPadrao: ["pinus", "pinus"],
    params: [
      { key: "W", label: "Comprimento", kind: "mm", min: 300, max: 2000, step: 10, def: 1200 },
      { key: "H", label: "Altura", kind: "mm", min: 250, max: 800, step: 10, def: 450 },
      { key: "D", label: "Profundidade", kind: "mm", min: 280, max: 450, step: 10, def: 350 },
      { key: "madeira", label: "Madeira", kind: "select", options: MADEIRAS.map((m) => ({ value: m.value, label: m.label })), def: "pinus" },
    ],
    build: (c) => {
      const W = num(c.v, "W"),
        H = num(c.v, "H"),
        D = num(c.v, "D");
      const md = String(c.v.madeira);
      const seatT = W > 1000 ? 30 : 25;
      const seat = madeira(md, seatT, 120);
      const legM = madeira(md, 45, 45);
      const rail = madeira(md, 20, 100);
      const parts = table({ W, H, D, topT: seatT, leg: 45, apronH: 70, mat: rail.key, topMat: seat.key, legMat: legM.key, topBoards: Math.max(1, Math.round(D / 115)), inset: 25, stretchers: H > 550 ? Math.round(H * 0.35) : 90 });
      return { parts, materials: [seat, legM, rail], avisos: W > 1500 && seatT < 30 ? ["Banco acima de 1,5 m precisa de travessa central sob o assento."] : [] };
    },
  },
  {
    id: "cubos",
    nome: "Estante de cubos",
    descricao: "Nichos de 33 cm na medida das caixas de tecido do mercado — funciona em pé ou deitada.",
    livre: true,
    usaCores: true,
    coresPadrao: ["branco", "branco"],
    params: [
      { key: "cols", label: "Colunas", kind: "count", min: 1, max: 6, def: 3 },
      { key: "rows", label: "Linhas", kind: "count", min: 1, max: 6, def: 3 },
      { key: "cubo", label: "Vão do cubo", kind: "mm", min: 250, max: 400, step: 5, def: 330 },
      { key: "t", label: "Espessura", kind: "select", options: [{ value: "15", label: "MDF 15 mm" }, { value: "18", label: "MDF 18 mm" }], def: "15" },
    ],
    build: (c) => {
      const t = Number(c.v.t),
        cols = num(c.v, "cols"),
        rows = num(c.v, "rows"),
        cubo = num(c.v, "cubo");
      const { cx, mats } = caixaMats({ ...c, frente: c.caixa }, t);
      const W = cols * cubo + (cols + 1) * t;
      const H = rows * cubo + (rows + 1) * t;
      const parts = carcass({ W, H, D: cubo, t, mat: cx.key, topOver: false, dividers: Array.from({ length: cols - 1 }, (_, i) => (i + 1) * cubo + i * t), shelves: [{ bay: "all", ys: Array.from({ length: rows - 1 }, (_, i) => (i + 1) * cubo + i * t) }] });
      return { parts: fundoPara(parts, `mdf6-${c.caixa}`), materials: mats };
    },
  },
];

export const tipoPorId = (id: string) => TIPOS.find((t) => t.id === id);

export const valoresPadrao = (tipo: Tipo): Valores => Object.fromEntries(tipo.params.map((p) => [p.key, p.def]));

/** Mantém cada valor dentro da faixa permitida. */
export function normalizar(tipo: Tipo, v: Valores): Valores {
  const out: Valores = {};
  for (const p of tipo.params) {
    const raw = v[p.key] ?? p.def;
    if (p.kind === "mm" || p.kind === "count") out[p.key] = Math.min(p.max, Math.max(p.min, Math.round(Number(raw) || p.def)));
    else if (p.kind === "toggle") out[p.key] = Boolean(raw);
    else out[p.key] = p.options.some((o) => o.value === String(raw)) ? String(raw) : p.def;
  }
  return out;
}

const dobradicas = (h: number) => (h <= 900 ? 2 : h <= 1600 ? 3 : h <= 2400 ? 4 : 5);

export function calcular(tipo: Tipo, valores: Valores, caixa: string, frente: string): Resultado {
  const v = normalizar(tipo, valores);
  const { parts, materials, avisos = [], extras = [] } = tipo.build({ v, caixa, frente });
  const cut = cutFromParts(parts, materials);
  const b = bounds(parts);
  const dims: [number, number, number] = [Math.round(b.size[0]), Math.round(b.size[1]), Math.round(b.size[2])];

  // ── ferragens a partir das peças
  const portas = parts.filter((p) => p.name === "Porta");
  const gavetas = parts.filter((p) => p.name === "Frente de gaveta");
  const rods = parts.filter((p) => p.name === "Tubo cabideiro");
  const hardware: { item: string; qtd: string }[] = [];
  if (portas.length) hardware.push({ item: "Dobradiças de caneco 35 mm", qtd: `${portas.reduce((s, p) => s + dobradicas(pieceDims(p).length), 0)} un` });
  if (gavetas.length) hardware.push({ item: "Corrediça telescópica", qtd: `${gavetas.length} par${gavetas.length > 1 ? "es" : ""}` });
  const puxadores = parts.filter((p) => p.name === "Puxador").length;
  if (puxadores) hardware.push({ item: "Puxadores", qtd: `${puxadores} un` });
  if (rods.length) hardware.push({ item: `Tubo de cabideiro + ${rods.length * 2} suportes`, qtd: `${rods.map((r) => pieceDims(r).length).join(" + ")} mm` });
  hardware.push(...extras);
  // fita de borda: bordas da frente da caixa + perímetro de portas e frentes (+10 %)
  let fita = 0;
  for (const p of parts) {
    if (p.cut === false) continue;
    const m = materials.find((x) => x.key === p.mat);
    if (m?.kind !== "chapa" || m.thickness < 15) continue;
    const d = pieceDims(p);
    fita += /Porta|Frente de gaveta/.test(p.name) ? 2 * (d.length + d.width) : d.length;
  }
  if (fita) hardware.push({ item: "Fita de borda (com 10% de sobra)", qtd: `${Math.ceil((fita * 1.1) / 1000)} m` });
  hardware.push({ item: "Parafusos, cavilhas ou minifix", qtd: "ver Módulo 4" });

  // ── conferência
  const lista = [...avisos];
  for (const m of materials.filter((x) => x.kind === "chapa")) {
    const mine = cut.filter((c) => c[6] === m.key);
    const res = packPieces(mine.map((c, i) => ({ id: String(i), name: c[0], quantity: c[1], length: c[2], width: c[3], canRotate: c[5] === "livre" })), DEFAULT_SHEET);
    for (const u of res.unplaced) lista.push(`"${u.name}" (${u.length} × ${u.width} mm) não cabe na chapa de 2750 × 1830 mm.`);
  }
  for (const c of cut) {
    if (!/Prateleira/.test(c[0])) continue;
    const limit = c[4] <= 15 ? 800 : 900;
    if (c[2] > limit) {
      lista.push(`Prateleira com ${Math.round(c[2] / 10)} cm de vão passa do limite de ~${limit / 10} cm do MDF ${c[4]} mm: aumente as colunas.`);
      break;
    }
  }
  for (const p of portas) {
    const d = pieceDims(p);
    const w = Math.min(d.length, d.width);
    if (w > 620) {
      lista.push(`Portas com ${Math.round(w / 10)} cm de largura empenam e forçam a dobradiça: aumente o número de portas.`);
      break;
    }
    if (w < 200) {
      lista.push(`Portas com ${Math.round(w / 10)} cm ficam estreitas demais: diminua o número de portas.`);
      break;
    }
  }
  if (rods.length && dims[2] < 540) lista.push("Para cabide, a profundidade interna precisa de pelo menos 52 cm (≈ 54 cm por fora).");

  const grupos = materials
    .filter((m) => m.kind !== "outro")
    .map((m) => {
      const linhas = cut.filter((c) => c[6] === m.key);
      return { key: m.key, nome: m.material, cor: corHex(m.look ?? "pinus"), pecas: linhas.reduce((s, c) => s + c[1], 0), linhas };
    })
    .filter((g) => g.linhas.length);

  return { parts, materials, cut, hardware, avisos: [...new Set(lista)], dims, grupos };
}
