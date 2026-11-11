// Renderiza o modelo 3D em SVG: render montado (estúdio futurista), vista explodida e vistas técnicas.
import { bounds, center, corners, pieceDims, type Part, type Vec } from "./model3d";

export type Look = { base: string; kind: "wood" | "flat" | "metal" | "glass" | "fabric" };

export const LOOKS: Record<string, Look> = {
  pinus: { base: "#e4b97f", kind: "wood" },
  madeira: { base: "#c98c4c", kind: "wood" },
  escura: { base: "#7b4a2b", kind: "wood" },
  cambara: { base: "#a5643a", kind: "wood" },
  clara: { base: "#ecd2a6", kind: "wood" },
  pallet: { base: "#c9a473", kind: "wood" },
  carvalho: { base: "#d3ad7e", kind: "wood" },
  freijo: { base: "#bc8b55", kind: "wood" },
  "mdf-cru": { base: "#c8ad86", kind: "flat" },
  branco: { base: "#f2f0eb", kind: "flat" },
  preto: { base: "#2f2d2c", kind: "flat" },
  cinza: { base: "#8e9194", kind: "flat" },
  grafite: { base: "#4b4e53", kind: "flat" },
  salvia: { base: "#9fb29a", kind: "flat" },
  azul: { base: "#5c7890", kind: "flat" },
  verde: { base: "#6f8f6a", kind: "flat" },
  terracota: { base: "#c07a57", kind: "flat" },
  hdf: { base: "#8b6d4f", kind: "flat" },
  hdf3: { base: "#8b6d4f", kind: "flat" },
  metal: { base: "#2c2f34", kind: "metal" },
  inox: { base: "#b9c0c8", kind: "metal" },
  latao: { base: "#c9a55a", kind: "metal" },
  vidro: { base: "#bfe4ef", kind: "glass" },
  espelho: { base: "#d5e6ee", kind: "glass" },
  tecido: { base: "#d8d0c2", kind: "fabric" },
  "tecido-escuro": { base: "#5d5a55", kind: "fabric" },
  planta: { base: "#5d8f4e", kind: "fabric" },
  // cores do configurador
  offwhite: { base: "#ece6da", kind: "flat" },
  cristal: { base: "#c3c8cc", kind: "flat" },
  nogueira: { base: "#6e4a32", kind: "wood" },
  louro: { base: "#a8764b", kind: "wood" },
  mel: { base: "#c7955c", kind: "wood" },
  oliva: { base: "#717a4c", kind: "flat" },
  petroleo: { base: "#2f5864", kind: "flat" },
  marinho: { base: "#2b3654", kind: "flat" },
  mostarda: { base: "#d4a334", kind: "flat" },
  rosa: { base: "#ddb5ae", kind: "flat" },
};

export type LookResolver = (mat: string) => Look;
export const directLook: LookResolver = (m) => LOOKS[m] ?? LOOKS.pinus;

// câmera ortográfica (vista três-quartos): frente (+z) e lado direito (+x) visíveis
let CAM: Vec = [0, 0, 1];
let RIGHT: Vec = [1, 0, 0];
let UP: Vec = [0, 1, 0];
const LIGHT = norm([-0.45, 0.85, 0.55]);

export const DEFAULT_CAMERA = { th: 38, ph: 24 };

/** Ângulos em graus: th gira em volta do móvel, ph inclina (vista de cima). */
function setCamera(thDeg: number, phDeg: number) {
  const th = (thDeg * Math.PI) / 180;
  const ph = (Math.max(2, Math.min(80, phDeg)) * Math.PI) / 180;
  CAM = [Math.sin(th) * Math.cos(ph), Math.sin(ph), Math.cos(th) * Math.cos(ph)];
  RIGHT = [Math.cos(th), 0, -Math.sin(th)];
  UP = [-Math.sin(th) * Math.sin(ph), Math.cos(ph), -Math.cos(th) * Math.sin(ph)];
}
setCamera(DEFAULT_CAMERA.th, DEFAULT_CAMERA.ph);

function norm(a: Vec): Vec {
  const l = Math.hypot(...a) || 1;
  return [a[0] / l, a[1] / l, a[2] / l];
}
const dot = (a: Vec, b: Vec) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const cross = (a: Vec, b: Vec): Vec => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const sub = (a: Vec, b: Vec): Vec => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];

const proj = (p: Vec): [number, number] => [dot(p, RIGHT), -dot(p, UP)];

function hex(c: string): [number, number, number] {
  const n = parseInt(c.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
function shade(c: string, k: number, mix?: [number, number, number, number]) {
  let [r, g, b] = hex(c).map((x) => Math.max(0, Math.min(255, x * k)));
  if (mix) {
    r = r * (1 - mix[3]) + mix[0] * mix[3];
    g = g * (1 - mix[3]) + mix[1] * mix[3];
    b = b * (1 - mix[3]) + mix[2] * mix[3];
  }
  return `rgb(${Math.round(r)},${Math.round(g)},${Math.round(b)})`;
}

type Face = { pts: Vec[]; n: Vec };
function faces(p: Part): Face[] {
  const c = corners(p); // índice = a*4 + b*2 + c  (u, v, w)
  const q = (i: number[]) => i.map((k) => c[k]);
  const ctr = center(p);
  const list = [
    q([0, 2, 3, 1]), // u=0
    q([4, 5, 7, 6]), // u=1
    q([0, 1, 5, 4]), // v=0
    q([2, 6, 7, 3]), // v=1
    q([0, 4, 6, 2]), // w=0
    q([1, 3, 7, 5]), // w=1
  ];
  return list.map((pts) => {
    let n = norm(cross(sub(pts[1], pts[0]), sub(pts[3], pts[0])));
    const fc = scale3(add3(add3(pts[0], pts[1]), add3(pts[2], pts[3])), 0.25);
    if (dot(n, sub(fc, ctr)) < 0) n = [-n[0], -n[1], -n[2]];
    return { pts, n };
  });
}
const add3 = (a: Vec, b: Vec): Vec => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const scale3 = (a: Vec, k: number): Vec => [a[0] * k, a[1] * k, a[2] * k];

/** Ordem de pintura: separação por eixo quando existir, senão profundidade do centro. */
export function paintOrder(parts: Part[], debug = false): Part[] {
  const n = parts.length;
  const bb = parts.map((p) => {
    const cs = corners(p);
    const mn = [0, 1, 2].map((i) => Math.min(...cs.map((c) => c[i])));
    const mx = [0, 1, 2].map((i) => Math.max(...cs.map((c) => c[i])));
    const sp = cs.map(proj);
    return {
      mn,
      mx,
      depth: dot(center(p), CAM),
      sx0: Math.min(...sp.map((s) => s[0])),
      sx1: Math.max(...sp.map((s) => s[0])),
      sy0: Math.min(...sp.map((s) => s[1])),
      sy1: Math.max(...sp.map((s) => s[1])),
    };
  });
  const behind: number[][] = Array.from({ length: n }, () => []);
  const indeg = new Array(n).fill(0);
  const eps = 0.5;
  for (let i = 0; i < n; i++)
    for (let j = i + 1; j < n; j++) {
      const a = bb[i],
        b = bb[j];
      if (a.sx1 <= b.sx0 || b.sx1 <= a.sx0 || a.sy1 <= b.sy0 || b.sy1 <= a.sy0) continue;
      // -1: i atrás de j. Separação em eixos com sentidos opostos = as peças não se cobrem de fato.
      let back = false,
        front = false,
        sep = false;
      for (let k = 0; k < 3; k++) {
        // quem tem coordenada menor fica atrás quando a câmera olha do lado positivo do eixo
        const lowIsBack = CAM[k] >= 0;
        if (a.mx[k] <= b.mn[k] + eps) lowIsBack ? (back = true) : (front = true), (sep = true);
        else if (b.mx[k] <= a.mn[k] + eps) lowIsBack ? (front = true) : (back = true), (sep = true);
      }
      if (back && front) continue;
      const rel = sep ? (back ? -1 : 1) : a.depth < b.depth ? -1 : 1;
      if (rel === -1) {
        behind[i].push(j);
        indeg[j]++;
      } else {
        behind[j].push(i);
        indeg[i]++;
      }
    }
  const order: number[] = [];
  const done = new Array(n).fill(false);
  while (order.length < n) {
    let pick = -1;
    for (let i = 0; i < n; i++) if (!done[i] && indeg[i] === 0 && (pick < 0 || bb[i].depth < bb[pick].depth)) pick = i;
    if (pick < 0) {
      for (let i = 0; i < n; i++) if (!done[i] && (pick < 0 || bb[i].depth < bb[pick].depth)) pick = i; // ciclo
      if (debug) console.log("ciclo; forçando", parts[pick].name, parts[pick].o.map(Math.round));
    }
    done[pick] = true;
    order.push(pick);
    for (const j of behind[pick]) indeg[j]--;
  }
  return order.map((i) => parts[i]);
}

type Fit = { s: number; tx: number; ty: number };
function fit(pts: [number, number][], box: [number, number, number, number]): Fit {
  const xs = pts.map((p) => p[0]),
    ys = pts.map((p) => p[1]);
  const [x0, x1, y0, y1] = [Math.min(...xs), Math.max(...xs), Math.min(...ys), Math.max(...ys)];
  const [bx0, by0, bw, bh] = box;
  const s = Math.min(bw / (x1 - x0 || 1), bh / (y1 - y0 || 1));
  return { s, tx: bx0 + (bw - (x1 - x0) * s) / 2 - x0 * s, ty: by0 + (bh - (y1 - y0) * s) / 2 - y0 * s };
}
const f2 = (n: number) => n.toFixed(1);

function drawParts(parts: Part[], look: LookResolver, F: Fit, opts: { edge: string; grain: boolean }) {
  const P = (v: Vec) => {
    const [x, y] = proj(v);
    return [x * F.s + F.tx, y * F.s + F.ty] as [number, number];
  };
  let out = "";
  for (const p of paintOrder(parts)) {
    const L = look(p.mat);
    for (const f of faces(p)) {
      if (dot(f.n, CAM) <= 0.001) continue;
      const lit = Math.max(0, dot(f.n, LIGHT));
      const k = L.kind === "metal" ? 0.55 + 0.9 * lit : L.kind === "glass" ? 0.9 + 0.2 * lit : 0.62 + 0.5 * lit;
      const sp = f.pts.map(P);
      const pts = sp.map((q) => `${f2(q[0])},${f2(q[1])}`).join(" ");
      const top = f.n[1] > 0.7;
      const col = shade(L.base, top ? k * 1.06 : k);
      const opacity = L.kind === "glass" ? ' fill-opacity="0.55"' : "";
      out += `<polygon points="${pts}" fill="${col}"${opacity} stroke="${opts.edge}" stroke-width="0.7" stroke-linejoin="round"/>`;
      // veio: linhas paralelas à maior aresta da face
      if (opts.grain && L.kind === "wood") {
        const e1 = Math.hypot(sp[1][0] - sp[0][0], sp[1][1] - sp[0][1]);
        const e2 = Math.hypot(sp[3][0] - sp[0][0], sp[3][1] - sp[0][1]);
        const [a0, a1, b0, b1] = e1 >= e2 ? [sp[0], sp[1], sp[3], sp[2]] : [sp[0], sp[3], sp[1], sp[2]];
        const across = Math.min(e1, e2);
        const lines = Math.min(7, Math.floor(across / 7));
        const gc = shade(L.base, k * 0.8);
        for (let i = 1; i <= lines; i++) {
          const t = (i - 0.5 + ((i * 37) % 10) / 25) / (lines + 0.2);
          const s0 = [a0[0] + (b0[0] - a0[0]) * t, a0[1] + (b0[1] - a0[1]) * t];
          const s1 = [a1[0] + (b1[0] - a1[0]) * t, a1[1] + (b1[1] - a1[1]) * t];
          const mx = (s0[0] + s1[0]) / 2 + (((i * 13) % 7) - 3) * 0.35;
          const my = (s0[1] + s1[1]) / 2 + (((i * 17) % 5) - 2) * 0.35;
          out += `<path d="M${f2(s0[0])},${f2(s0[1])} Q${f2(mx)},${f2(my)} ${f2(s1[0])},${f2(s1[1])}" stroke="${gc}" stroke-width="0.5" fill="none" opacity="0.45"/>`;
        }
      }
      if (L.kind === "glass" || (L.kind === "metal" && top))
        out += `<polygon points="${pts}" fill="url(#shine)" opacity="0.5"/>`;
    }
  }
  return out;
}

/** Render do móvel montado, estúdio escuro com piso em grade. */
export type AssembledOpts = { th?: number; ph?: number; dims?: boolean; id?: string; frame?: boolean; claro?: boolean };

export function renderAssembled(parts: Part[], look: LookResolver = directLook, W = 800, H = 600, opts: AssembledOpts = {}): string {
  setCamera(opts.th ?? DEFAULT_CAMERA.th, opts.ph ?? DEFAULT_CAMERA.ph);
  try {
    return assembled(parts, look, W, H, opts);
  } finally {
    setCamera(DEFAULT_CAMERA.th, DEFAULT_CAMERA.ph);
  }
}

function assembled(parts: Part[], look: LookResolver, W: number, H: number, opts: AssembledOpts): string {
  const b = bounds(parts);
  const pad = Math.max(...b.size) * 0.35;
  const floor: Vec[] = [
    [b.min[0] - pad, 0, b.min[2] - pad],
    [b.max[0] + pad, 0, b.min[2] - pad],
    [b.max[0] + pad, 0, b.max[2] + pad],
    [b.min[0] - pad, 0, b.max[2] + pad],
  ];
  const all = parts.flatMap(corners).map(proj);
  const F = fit(all, [W * 0.14, H * 0.1, W * 0.72, H * 0.72]);
  const P = (v: Vec) => {
    const [x, y] = proj(v);
    return [x * F.s + F.tx, y * F.s + F.ty] as [number, number];
  };
  // grade do piso
  let grid = "";
  const step = Math.max(100, Math.round(Math.max(...b.size) / 6 / 50) * 50);
  const gx0 = Math.floor((b.min[0] - pad * 2) / step) * step;
  const gx1 = b.max[0] + pad * 2;
  const gz0 = Math.floor((b.min[2] - pad * 2) / step) * step;
  const gz1 = b.max[2] + pad * 2;
  for (let x = gx0; x <= gx1; x += step) {
    const a = P([x, 0, gz0]),
      c = P([x, 0, gz1]);
    grid += `<line x1="${f2(a[0])}" y1="${f2(a[1])}" x2="${f2(c[0])}" y2="${f2(c[1])}"/>`;
  }
  for (let z = gz0; z <= gz1; z += step) {
    const a = P([gx0, 0, z]),
      c = P([gx1, 0, z]);
    grid += `<line x1="${f2(a[0])}" y1="${f2(a[1])}" x2="${f2(c[0])}" y2="${f2(c[1])}"/>`;
  }
  const fp = [
    [b.min[0], 0, b.min[2]],
    [b.max[0], 0, b.min[2]],
    [b.max[0], 0, b.max[2]],
    [b.min[0], 0, b.max[2]],
  ].map((v) => P(v as Vec));
  const ctr = P([(b.min[0] + b.max[0]) / 2, 0, (b.min[2] + b.max[2]) / 2]);
  void floor;
  const dimsSvg = opts.dims ? dimensionCallouts(b, P, opts.claro) : "";
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">
<defs>
${opts.claro ? `<radialGradient id="bg" cx="50%" cy="40%" r="80%"><stop offset="0" stop-color="#ffffff"/><stop offset="0.6" stop-color="#f7f1e7"/><stop offset="1" stop-color="#ebe0cf"/></radialGradient>` : `<radialGradient id="bg" cx="50%" cy="42%" r="75%"><stop offset="0" stop-color="#2d3545"/><stop offset="0.55" stop-color="#171c26"/><stop offset="1" stop-color="#0b0e14"/></radialGradient>`}
<radialGradient id="glow" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#6fd6ff" stop-opacity="0.28"/><stop offset="1" stop-color="#6fd6ff" stop-opacity="0"/></radialGradient>
<radialGradient id="gridfade" cx="${f2((ctr[0] / W) * 100)}%" cy="${f2((ctr[1] / H) * 100)}%" r="55%"><stop offset="0" stop-color="#fff" stop-opacity="1"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>
<mask id="gm"><rect width="${W}" height="${H}" fill="url(#gridfade)"/></mask>
<linearGradient id="shine" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff" stop-opacity="0.7"/><stop offset="0.5" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#fff" stop-opacity="0.25"/></linearGradient>
<filter id="blur" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="14"/></filter>
<filter id="blur2" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="4"/></filter>
</defs>
<rect width="${W}" height="${H}" fill="url(#bg)"/>
${opts.claro ? "" : `<ellipse cx="${f2(ctr[0])}" cy="${f2(ctr[1])}" rx="${f2(W * 0.42)}" ry="${f2(H * 0.16)}" fill="url(#glow)"/>`}
<g stroke="${opts.claro ? "#9a6528" : "#7fdcff"}" stroke-opacity="${opts.claro ? 0.14 : 0.22}" stroke-width="0.8" mask="url(#gm)">${grid}</g>
<polygon points="${fp.map((q) => `${f2(q[0])},${f2(q[1])}`).join(" ")}" fill="#000" opacity="${opts.claro ? 0.22 : 0.55}" filter="url(#blur)"/>
<polygon points="${fp.map((q) => `${f2(q[0])},${f2(q[1])}`).join(" ")}" fill="#000" opacity="${opts.claro ? 0.18 : 0.35}" filter="url(#blur2)"/>
<g>${drawParts(parts, look, F, { edge: "rgba(20,14,8,0.55)", grain: true })}</g>
${dimsSvg}
${opts.frame === false ? "" : `<rect x="0.5" y="0.5" width="${W - 1}" height="${H - 1}" fill="none" stroke="#6fd6ff" stroke-opacity="0.12"/>`}
</svg>`;
  // ids únicos quando há vários renders na mesma página
  return opts.id ? svg.replace(/id="(\w+)"/g, `id="$1-${opts.id}"`).replace(/url\(#(\w+)\)/g, `url(#$1-${opts.id})`) : svg;
}

/** Cotas de largura, altura e profundidade nas arestas visíveis do volume (estilo HUD). */
function dimensionCallouts(b: ReturnType<typeof bounds>, P: (v: Vec) => [number, number], claro = false) {
  const cor = claro ? "#9a6528" : "#7fdcff";
  const fundo = claro ? "#ffffff" : "#0d1a22";
  const tx = claro ? "#24180f" : "#e8f7ff";
  const [x0, y0, z0] = b.min;
  const [x1, y1, z1] = b.max;
  // aresta frontal visível (z do lado da câmera) e lateral visível (x do lado da câmera)
  const zf = CAM[2] >= 0 ? z1 : z0;
  const xs = CAM[0] >= 0 ? x1 : x0;
  const label = (a: [number, number], c: [number, number], text: string, off: [number, number]) => {
    const mx = (a[0] + c[0]) / 2 + off[0],
      my = (a[1] + c[1]) / 2 + off[1];
    const w = text.length * 7.2 + 14;
    return `<line x1="${f2(a[0] + off[0])}" y1="${f2(a[1] + off[1])}" x2="${f2(c[0] + off[0])}" y2="${f2(c[1] + off[1])}" stroke="${cor}" stroke-width="1.2" stroke-opacity="0.85"/>
<circle cx="${f2(a[0] + off[0])}" cy="${f2(a[1] + off[1])}" r="2.2" fill="${cor}"/><circle cx="${f2(c[0] + off[0])}" cy="${f2(c[1] + off[1])}" r="2.2" fill="${cor}"/>
<rect x="${f2(mx - w / 2)}" y="${f2(my - 11)}" width="${f2(w)}" height="22" rx="3" fill="${fundo}" fill-opacity="0.92" stroke="${cor}" stroke-opacity="0.8"/>
<text x="${f2(mx)}" y="${f2(my + 4.5)}" text-anchor="middle" font-size="12" font-weight="700" fill="${tx}" font-family="ui-monospace, Menlo, Consolas, monospace">${text}</text>`;
  };
  const mm = (n: number) => `${Math.round(n)} mm`;
  return `<g>
${label(P([x0, y0, zf]), P([x1, y0, zf]), mm(x1 - x0), [0, 26])}
${label(P([xs, y0, zf]), P([xs, y1, zf]), mm(y1 - y0), [34, 0])}
${label(P([xs, y0, z0]), P([xs, y0, z1]), mm(z1 - z0), [22, 22])}
</g>`;
}

/** Vista explodida com letras por tipo de peça e legenda, em fundo claro (estilo manual técnico). */
export function renderExploded(parts: Part[], look: LookResolver = directLook, W = 900, H = 600): string {
  const b = bounds(parts);
  const C: Vec = [(b.min[0] + b.max[0]) / 2, (b.min[1] + b.max[1]) / 2, (b.min[2] + b.max[2]) / 2];
  const k = parts.length > 40 ? 0.38 : 0.55;
  const moved = parts.map((p) => {
    const c = center(p);
    const d: Vec = [(c[0] - C[0]) * k, (c[1] - C[1]) * k, (c[2] - C[2]) * k];
    return { ...p, o: add3(p.o, d) };
  });
  const names: string[] = [];
  for (const p of parts) if (p.cut !== false && !names.includes(p.name)) names.push(p.name);
  const letter = (i: number) => (i < 26 ? String.fromCharCode(65 + i) : `A${String.fromCharCode(65 + i - 26)}`);
  const legendW = 250;
  const all = moved.flatMap(corners).map(proj);
  const F = fit(all, [30, 60, W - legendW - 60, H - 90]);
  const P = (v: Vec) => {
    const [x, y] = proj(v);
    return [x * F.s + F.tx, y * F.s + F.ty] as [number, number];
  };
  let labels = "";
  const placed = new Set<string>();
  for (const p of moved) {
    const i = names.indexOf(p.name);
    if (i < 0 || placed.has(p.name)) continue;
    placed.add(p.name);
    const c = P(center(p));
    const lx = c[0] + 18,
      ly = c[1] - 18;
    labels += `<line x1="${f2(c[0])}" y1="${f2(c[1])}" x2="${f2(lx)}" y2="${f2(ly)}" stroke="#24180f" stroke-width="0.8"/><circle cx="${f2(c[0])}" cy="${f2(c[1])}" r="2" fill="#24180f"/><circle cx="${f2(lx)}" cy="${f2(ly)}" r="10" fill="#24180f"/><text x="${f2(lx)}" y="${f2(ly + 3.6)}" text-anchor="middle" font-size="10" font-weight="700" fill="#e8bf82" font-family="Arial, Helvetica, sans-serif">${letter(i)}</text>`;
  }
  const count = (n: string) => parts.filter((p) => p.name === n).length;
  const rows = names.slice(0, 22);
  const lh = Math.min(22, (H - 110) / Math.max(1, rows.length));
  let legend = `<text x="${W - legendW}" y="70" font-size="12" font-weight="700" fill="#4a3526" font-family="Arial, Helvetica, sans-serif" letter-spacing="1">PEÇAS</text>`;
  rows.forEach((n, i) => {
    const y = 92 + i * lh;
    const d = pieceDims(parts.find((p) => p.name === n)!);
    legend += `<circle cx="${W - legendW + 8}" cy="${f2(y - 4)}" r="8" fill="#24180f"/><text x="${W - legendW + 8}" y="${f2(y - 0.6)}" text-anchor="middle" font-size="8.5" font-weight="700" fill="#e8bf82" font-family="Arial, Helvetica, sans-serif">${letter(names.indexOf(n))}</text><text x="${W - legendW + 22}" y="${f2(y)}" font-size="10.5" fill="#24180f" font-family="Arial, Helvetica, sans-serif">${esc(n.length > 26 ? n.slice(0, 25) + "…" : n)} ×${count(n)}</text><text x="${W - 10}" y="${f2(y)}" text-anchor="end" font-size="9" fill="#8a6a50" font-family="Arial, Helvetica, sans-serif">${d.length}×${d.width}×${d.thickness}</text>`;
  });
  if (names.length > rows.length) legend += `<text x="${W - legendW}" y="${f2(92 + rows.length * lh)}" font-size="9.5" fill="#8a6a50" font-family="Arial, Helvetica, sans-serif">+ ${names.length - rows.length} tipos na lista de corte</text>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">
<defs><linearGradient id="shine" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff" stop-opacity="0.7"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient></defs>
<rect width="${W}" height="${H}" fill="#fbf8f2"/>
<rect x="0" y="0" width="${W}" height="40" fill="#24180f"/>
<text x="20" y="26" font-size="14" font-weight="700" fill="#e8bf82" font-family="Arial, Helvetica, sans-serif" letter-spacing="2">VISTA EXPLODIDA</text>
<line x1="${W - legendW - 20}" y1="60" x2="${W - legendW - 20}" y2="${H - 20}" stroke="#e3d6c2"/>
<g>${drawParts(moved, look, F, { edge: "rgba(36,24,15,0.7)", grain: true })}</g>
${labels}${legend}
</svg>`;
}

function hull(pts: [number, number][]): [number, number][] {
  const p = [...pts].sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  const cr = (o: number[], a: number[], b: number[]) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
  const lo: [number, number][] = [];
  for (const q of p) {
    while (lo.length >= 2 && cr(lo[lo.length - 2], lo[lo.length - 1], q) <= 0) lo.pop();
    lo.push(q);
  }
  const up: [number, number][] = [];
  for (const q of p.reverse()) {
    while (up.length >= 2 && cr(up[up.length - 2], up[up.length - 1], q) <= 0) up.pop();
    up.push(q);
  }
  return [...lo.slice(0, -1), ...up.slice(0, -1)];
}

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;");

/** Vistas técnicas frontal, lateral e superior com cotas em cm. */
export function renderViews(parts: Part[], look: LookResolver = directLook, W = 900, H = 420): string {
  const b = bounds(parts);
  const [sx, sy, sz] = b.size;
  const panels = [
    { t: "VISTA FRONTAL", a: 0, bAx: 1, depth: 2, w: sx, h: sy, flipY: true },
    { t: "VISTA LATERAL", a: 2, bAx: 1, depth: 0, w: sz, h: sy, flipY: true },
    { t: "VISTA SUPERIOR", a: 0, bAx: 2, depth: 1, w: sx, h: sz, flipY: false },
  ];
  const colW = W / 3;
  const s = Math.min(...panels.map((p) => Math.min((colW - 70) / (p.w || 1), (H - 130) / (p.h || 1))));
  let out = "";
  panels.forEach((pn, i) => {
    const ox = i * colW + (colW - pn.w * s) / 2 + 10;
    const oy = 70 + (H - 130 - pn.h * s) / 2;
    const map = (v: Vec): [number, number] => {
      const u = (v[pn.a] - b.min[pn.a]) * s + ox;
      const vv = pn.flipY ? oy + (b.max[pn.bAx] - v[pn.bAx]) * s : oy + (v[pn.bAx] - b.min[pn.bAx]) * s;
      return [u, vv];
    };
    const sorted = [...parts].sort((p, q) => {
      const dp = center(p)[pn.depth],
        dq = center(q)[pn.depth];
      return dp - dq;
    });
    for (const p of sorted) {
      const L = look(p.mat);
      const hl = hull(corners(p).map(map));
      out += `<polygon points="${hl.map((q) => `${f2(q[0])},${f2(q[1])}`).join(" ")}" fill="${shade(L.base, 1, [255, 255, 255, 0.55])}" stroke="#4a3526" stroke-width="0.6"/>`;
    }
    const x0 = ox,
      x1 = ox + pn.w * s,
      y0 = oy,
      y1 = oy + pn.h * s;
    const cm = (mm: number) => `${(mm / 10).toLocaleString("pt-BR", { maximumFractionDigits: 1 })} cm`;
    // cota horizontal (embaixo) e vertical (esquerda)
    out += `<g stroke="#9a6528" stroke-width="0.8" fill="none"><line x1="${f2(x0)}" y1="${f2(y1 + 16)}" x2="${f2(x1)}" y2="${f2(y1 + 16)}"/><line x1="${f2(x0)}" y1="${f2(y1 + 10)}" x2="${f2(x0)}" y2="${f2(y1 + 22)}"/><line x1="${f2(x1)}" y1="${f2(y1 + 10)}" x2="${f2(x1)}" y2="${f2(y1 + 22)}"/><line x1="${f2(x0 - 16)}" y1="${f2(y0)}" x2="${f2(x0 - 16)}" y2="${f2(y1)}"/><line x1="${f2(x0 - 22)}" y1="${f2(y0)}" x2="${f2(x0 - 10)}" y2="${f2(y0)}"/><line x1="${f2(x0 - 22)}" y1="${f2(y1)}" x2="${f2(x0 - 10)}" y2="${f2(y1)}"/></g>`;
    out += `<text x="${f2((x0 + x1) / 2)}" y="${f2(y1 + 32)}" text-anchor="middle" font-size="11" fill="#6b4d36" font-family="Arial, Helvetica, sans-serif">${cm(pn.w)}</text>`;
    out += `<text x="${f2(x0 - 22)}" y="${f2((y0 + y1) / 2)}" text-anchor="middle" font-size="11" fill="#6b4d36" font-family="Arial, Helvetica, sans-serif" transform="rotate(-90 ${f2(x0 - 22)} ${f2((y0 + y1) / 2)})">${cm(pn.h)}</text>`;
    out += `<text x="${f2(i * colW + colW / 2)}" y="60" text-anchor="middle" font-size="11" font-weight="700" fill="#24180f" font-family="Arial, Helvetica, sans-serif" letter-spacing="1">${pn.t}</text>`;
  });
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">
<rect width="${W}" height="${H}" fill="#fbf8f2"/>
<rect x="0" y="0" width="${W}" height="36" fill="#24180f"/>
<text x="20" y="24" font-size="13" font-weight="700" fill="#e8bf82" font-family="Arial, Helvetica, sans-serif" letter-spacing="2">VISTAS TÉCNICAS · MEDIDAS FINAIS</text>
<line x1="${colW}" y1="46" x2="${colW}" y2="${H - 14}" stroke="#e3d6c2"/><line x1="${2 * colW}" y1="46" x2="${2 * colW}" y2="${H - 14}" stroke="#e3d6c2"/>
${out}
</svg>`;
}
