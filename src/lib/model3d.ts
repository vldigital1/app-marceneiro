// Modelo 3D dos projetos: cada peça é um paralelepípedo (origem + 3 vetores de aresta), em mm.
// Eixos: x = largura (direita), y = altura (cima), z = profundidade (frente em z = D).
// As mesmas peças geram a lista de corte e as ilustrações (render, vista explodida, vistas técnicas).

export type Vec = [number, number, number];
export type Grain = "comprimento" | "largura" | "livre";

export type Part = {
  name: string;
  /** chave do material de compra (projetos gerados) ou visual direto (ver LOOKS) */
  mat: string;
  o: Vec;
  u: Vec;
  v: Vec;
  w: Vec;
  /** false = não entra na lista de corte (ferragem, vidro, estofado, metal comprado pronto) */
  cut?: boolean;
  grain?: Grain;
};

export const add = (a: Vec, b: Vec): Vec => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
export const scale = (a: Vec, k: number): Vec => [a[0] * k, a[1] * k, a[2] * k];
const len = (a: Vec) => Math.hypot(a[0], a[1], a[2]);

/** Peça alinhada aos eixos: canto mínimo (x, y, z) e tamanhos (sx, sy, sz). */
export function bx(name: string, mat: string, x: number, y: number, z: number, sx: number, sy: number, sz: number, opts: Partial<Part> = {}): Part {
  return { name, mat, o: [x, y, z], u: [sx, 0, 0], v: [0, sy, 0], w: [0, 0, sz], ...opts };
}

/** Peça inclinada: gira a peça em torno do eixo X (encostos, tampas, telhados), ângulo em graus. */
export function tiltX(p: Part, deg: number, pivot: Vec = p.o): Part {
  const r = (deg * Math.PI) / 180;
  const rot = (a: Vec): Vec => [a[0], a[1] * Math.cos(r) - a[2] * Math.sin(r), a[1] * Math.sin(r) + a[2] * Math.cos(r)];
  const rel: Vec = [p.o[0] - pivot[0], p.o[1] - pivot[1], p.o[2] - pivot[2]];
  return { ...p, o: add(pivot, rot(rel)), u: rot(p.u), v: rot(p.v), w: rot(p.w) };
}

/** Gira em torno do eixo Z (telhado em duas águas, peças em X). */
export function tiltZ(p: Part, deg: number, pivot: Vec = p.o): Part {
  const r = (deg * Math.PI) / 180;
  const rot = (a: Vec): Vec => [a[0] * Math.cos(r) - a[1] * Math.sin(r), a[0] * Math.sin(r) + a[1] * Math.cos(r), a[2]];
  const rel: Vec = [p.o[0] - pivot[0], p.o[1] - pivot[1], p.o[2] - pivot[2]];
  return { ...p, o: add(pivot, rot(rel)), u: rot(p.u), v: rot(p.v), w: rot(p.w) };
}

/** Gira em torno do eixo vertical (Y): módulos em L, peças de canto. */
export function rotY(p: Part, deg: number, pivot: Vec = [0, 0, 0]): Part {
  const r = (deg * Math.PI) / 180;
  const rot = (a: Vec): Vec => [a[0] * Math.cos(r) + a[2] * Math.sin(r), a[1], -a[0] * Math.sin(r) + a[2] * Math.cos(r)];
  const rel: Vec = [p.o[0] - pivot[0], p.o[1] - pivot[1], p.o[2] - pivot[2]];
  return { ...p, o: add(pivot, rot(rel)), u: rot(p.u), v: rot(p.v), w: rot(p.w) };
}

export const mover = (parts: Part[], dx: number, dy: number, dz: number): Part[] => parts.map((p) => ({ ...p, o: [p.o[0] + dx, p.o[1] + dy, p.o[2] + dz] }));

export function corners(p: Part): Vec[] {
  const out: Vec[] = [];
  for (const a of [0, 1]) for (const b of [0, 1]) for (const c of [0, 1]) out.push(add(add(add(p.o, scale(p.u, a)), scale(p.v, b)), scale(p.w, c)));
  return out;
}

export function center(p: Part): Vec {
  return add(p.o, scale(add(add(p.u, p.v), p.w), 0.5));
}

export function bounds(parts: Part[]) {
  const min: Vec = [Infinity, Infinity, Infinity];
  const max: Vec = [-Infinity, -Infinity, -Infinity];
  for (const p of parts)
    for (const c of corners(p))
      for (let i = 0; i < 3; i++) {
        min[i] = Math.min(min[i], c[i]);
        max[i] = Math.max(max[i], c[i]);
      }
  return { min, max, size: [max[0] - min[0], max[1] - min[1], max[2] - min[2]] as Vec };
}

/** Medidas de corte da peça: comprimento (veio), largura, espessura — em mm inteiros. */
export function pieceDims(p: Part): { length: number; width: number; thickness: number } {
  const d = [len(p.u), len(p.v), len(p.w)].map((x) => Math.round(x)).sort((a, b) => b - a);
  return { length: d[0], width: d[1], thickness: d[2] };
}

// ───────────────────────────── BUILDERS ─────────────────────────────

export type CarcassOpts = {
  W: number;
  H: number;
  D: number;
  t: number;
  mat: string;
  frontMat?: string;
  backMat?: string;
  backT?: number;
  /** altura de rodapé recuado (0 = sem) */
  plinth?: number;
  /** pés (altura) no lugar do rodapé */
  legs?: { h: number; mat: string; size?: number; /** true = pés feitos na marcenaria (entram no corte) */ cut?: boolean };
  topOver?: boolean;
  /** posições x (internas, a partir da face interna da lateral esquerda) das divisórias */
  dividers?: number[];
  /** prateleiras: alturas (a partir da face de cima da base) por vão; `all` aplica em todos */
  shelves?: { bay: number | "all"; ys: number[] }[];
  /** portas por vão: nº de folhas; y de início/fim relativos à caixa */
  doors?: { bay: number | "all"; leaves: number; y0?: number; y1?: number }[];
  /** gavetas por vão: lista de alturas de frente, empilhadas de baixo para cima a partir de y0 */
  drawers?: { bay: number | "all"; fronts: number[]; y0?: number }[];
  /** tubo cabideiro por vão, altura */
  rods?: { bay: number; y: number }[];
  /** sem fundo */
  openBack?: boolean;
  gap?: number;
  /** portas distribuídas igualmente pela frente inteira, independentes das colunas */
  frontDoors?: { count: number; y0?: number; y1?: number };
  /** puxadores (ilustração): barra metálica, botão ou nenhum (cava/fecho toque) */
  handles?: "bar" | "knob" | "none";
  handleMat?: string;
};

/** Caixa de marcenaria (armários, estantes, nichos, racks, gaveteiros). Retorna peças + vãos. */
export function carcass(o: CarcassOpts): Part[] {
  const { W, H, D, t } = o;
  const gap = o.gap ?? 3;
  const base = o.legs ? o.legs.h : 0;
  const plinth = o.plinth ?? 0;
  const topOver = o.topOver ?? true;
  const backT = o.openBack ? 0 : (o.backT ?? 3);
  const bodyD = D - (o.doors?.length || o.drawers?.length || o.frontDoors?.count ? t : 0); // frentes sobrepostas ficam à frente
  const zFront = bodyD;
  const parts: Part[] = [];
  const fm = o.frontMat ?? o.mat;

  const sideH = topOver ? H - base - t : H - base;
  parts.push(bx("Lateral", o.mat, 0, base, 0, t, sideH, bodyD));
  parts.push(bx("Lateral", o.mat, W - t, base, 0, t, sideH, bodyD));
  if (topOver) parts.push(bx("Tampo", o.mat, 0, H - t, 0, W, t, bodyD));
  else parts.push(bx("Tampo", o.mat, t, H - t, 0, W - 2 * t, t, bodyD));
  const bottomY = base + plinth;
  parts.push(bx("Base", o.mat, t, bottomY, 0, W - 2 * t, t, bodyD));
  if (plinth > 0) parts.push(bx("Rodapé", o.mat, t, base, 30, W - 2 * t, plinth, t));
  if (o.legs) {
    const s = o.legs.size ?? 40;
    const inset = 40;
    for (const [x, z] of [
      [inset, inset],
      [W - inset - s, inset],
      [inset, bodyD - inset - s],
      [W - inset - s, bodyD - inset - s],
    ])
      parts.push(bx("Pé", o.legs.mat, x, 0, z, s, base, s, { cut: o.legs.cut ? undefined : false }));
  }
  if (backT) parts.push(bx("Fundo", o.backMat ?? "hdf3", 0, base, -backT, W, H - base, backT));

  // vãos internos
  const innerX0 = t;
  const innerX1 = W - t;
  const innerY0 = bottomY + t;
  const innerY1 = H - t;
  const divs = (o.dividers ?? []).map((x) => innerX0 + x);
  const bays: [number, number][] = [];
  let cur = innerX0;
  for (const dx of divs) {
    bays.push([cur, dx]);
    parts.push(bx("Divisória", o.mat, dx, innerY0, 0, t, innerY1 - innerY0, bodyD - (o.openBack ? 0 : 0)));
    cur = dx + t;
  }
  bays.push([cur, innerX1]);
  const bayIdx = (b: number | "all") => (b === "all" ? bays.map((_, i) => i) : [b]);

  for (const s of o.shelves ?? [])
    for (const bi of bayIdx(s.bay)) {
      const [x0, x1] = bays[bi];
      for (const y of s.ys) parts.push(bx("Prateleira", o.mat, x0 + 1, innerY0 + y, 0, x1 - x0 - 2, t, bodyD - 20));
    }

  for (const r of o.rods ?? []) {
    const [x0, x1] = bays[r.bay];
    parts.push(bx("Tubo cabideiro", "inox", x0, innerY0 + r.y, bodyD / 2 - 12, x1 - x0, 25, 15, { cut: false }));
  }

  // frentes: cobrem do x da borda externa até metade das divisórias
  const frontX = (bi: number): [number, number] => {
    const [x0, x1] = bays[bi];
    const left = bi === 0 ? 0 : x0 - t / 2;
    const right = bi === bays.length - 1 ? W : x1 + t / 2;
    return [left, right];
  };
  const frontY0 = base + plinth;
  for (const d of o.drawers ?? [])
    for (const bi of bayIdx(d.bay)) {
      const [fx0, fx1] = frontX(bi);
      const [x0, x1] = bays[bi];
      let y = frontY0 + (d.y0 ?? 0);
      for (const fh of d.fronts) {
        parts.push(bx("Frente de gaveta", fm, fx0 + gap / 2, y + gap / 2, zFront, fx1 - fx0 - gap, fh - gap, t));
        if ((o.handles ?? "bar") !== "none") {
          const hw = o.handles === "knob" ? 25 : Math.min(160, (fx1 - fx0) * 0.35);
          parts.push(bx("Puxador", o.handleMat ?? "metal", (fx0 + fx1) / 2 - hw / 2, y + fh / 2 - 6, zFront + t, hw, 12, 14, { cut: false }));
        }
        // caixa da gaveta (corrediça de 12,5 mm de cada lado)
        const bw = x1 - x0 - 25;
        // gaveta baixa (caixa de ferramentas, gavetinhas) não pode ter caixa mais alta que a frente
        const bh = fh > 120 ? fh - 60 : Math.max(25, fh - 25);
        const bd = Math.min(500, Math.floor((bodyD - 40) / 50) * 50);
        const by = y + (fh > 120 ? 20 : 10);
        const bxx = x0 + 12.5;
        parts.push(bx("Lateral de gaveta", o.mat, bxx, by, zFront - bd, t, bh, bd));
        parts.push(bx("Lateral de gaveta", o.mat, bxx + bw - t, by, zFront - bd, t, bh, bd));
        parts.push(bx("Contrafrente/traseira de gaveta", o.mat, bxx + t, by, zFront - t, bw - 2 * t, bh, t));
        parts.push(bx("Contrafrente/traseira de gaveta", o.mat, bxx + t, by, zFront - bd, bw - 2 * t, bh, t));
        parts.push(bx("Fundo de gaveta", "hdf3", bxx, by - 3, zFront - bd, bw, 3, bd));
        y += fh;
      }
    }
  for (const d of o.doors ?? [])
    for (const bi of bayIdx(d.bay)) {
      const [fx0, fx1] = frontX(bi);
      const y0 = frontY0 + (d.y0 ?? 0);
      const y1 = d.y1 ?? H;
      const leafW = (fx1 - fx0) / d.leaves;
      for (let k = 0; k < d.leaves; k++) {
        const px = fx0 + k * leafW + gap / 2;
        parts.push(bx("Porta", fm, px, y0 + gap / 2, zFront, leafW - gap, y1 - y0 - gap, t));
        if ((o.handles ?? "bar") !== "none") {
          // puxador do lado que abre: folhas pares abrem no meio
          const opensRight = d.leaves === 1 ? bi % 2 === 0 : k % 2 === 1 ? false : true;
          const hx = opensRight ? px + leafW - gap - 40 : px + 26;
          const hh = o.handles === "knob" ? 25 : Math.min(300, (y1 - y0) * 0.25);
          const hy = y1 - y0 > 1200 ? y0 + 1000 - hh / 2 : y0 + (y1 - y0) / 2 - hh / 2;
          parts.push(bx("Puxador", o.handleMat ?? "metal", hx, Math.min(hy, y1 - hh - 60), zFront + t, 14, hh, 14, { cut: false }));
        }
      }
    }
  if (o.frontDoors && o.frontDoors.count > 0) {
    const n = o.frontDoors.count;
    const y0 = frontY0 + (o.frontDoors.y0 ?? 0);
    const y1 = o.frontDoors.y1 ?? H;
    const leafW = W / n;
    for (let k = 0; k < n; k++) {
      const px = k * leafW + gap / 2;
      parts.push(bx("Porta", fm, px, y0 + gap / 2, zFront, leafW - gap, y1 - y0 - gap, t));
      if ((o.handles ?? "bar") !== "none") {
        // pares abrem um contra o outro; a última porta ímpar abre para a esquerda
        const opensRight = n === 1 ? true : k % 2 === 0 && k + 1 < n;
        const hh = o.handles === "knob" ? 25 : Math.min(300, (y1 - y0) * 0.25);
        const hx = opensRight ? px + leafW - gap - 40 : px + 26;
        const hy = y1 - y0 > 1200 ? y0 + 1000 - hh / 2 : y0 + (y1 - y0) / 2 - hh / 2;
        parts.push(bx("Puxador", o.handleMat ?? "metal", hx, Math.min(hy, y1 - hh - 60), zFront + t, 14, hh, 14, { cut: false }));
      }
    }
  }
  return parts;
}

export type TableOpts = {
  W: number;
  H: number;
  D: number;
  topT: number;
  leg: number;
  apronH: number;
  apronT?: number;
  inset?: number;
  mat: string;
  topMat?: string;
  legMat?: string;
  /** tampo em réguas (quantidade) */
  topBoards?: number;
  /** prateleira inferior de ripas: altura e nº de ripas */
  shelf?: { y: number; slats: number };
  /** travessas baixas nas cabeceiras */
  stretchers?: number;
};

/** Mesas, bancos, banquetas, bancadas, suportes: pés + saias + tampo. */
export function table(o: TableOpts): Part[] {
  const inset = o.inset ?? 20;
  const aT = o.apronT ?? 20;
  const lm = o.legMat ?? o.mat;
  const tm = o.topMat ?? o.mat;
  const parts: Part[] = [];
  const legH = o.H - o.topT;
  const lx0 = inset,
    lx1 = o.W - inset - o.leg,
    lz0 = inset,
    lz1 = o.D - inset - o.leg;
  for (const [x, z] of [
    [lx0, lz0],
    [lx1, lz0],
    [lx0, lz1],
    [lx1, lz1],
  ])
    parts.push(bx("Pé", lm, x, 0, z, o.leg, legH, o.leg));
  const longL = lx1 - lx0 - o.leg;
  const shortL = lz1 - lz0 - o.leg;
  const ay = legH - o.apronH;
  if (o.apronH > 0) {
    parts.push(bx("Saia longa", o.mat, lx0 + o.leg, ay, lz0 + (o.leg - aT) / 2, longL, o.apronH, aT));
    parts.push(bx("Saia longa", o.mat, lx0 + o.leg, ay, lz1 + (o.leg - aT) / 2, longL, o.apronH, aT));
    parts.push(bx("Saia curta", o.mat, lx0 + (o.leg - aT) / 2, ay, lz0 + o.leg, aT, o.apronH, shortL));
    parts.push(bx("Saia curta", o.mat, lx1 + (o.leg - aT) / 2, ay, lz0 + o.leg, aT, o.apronH, shortL));
  }
  if (o.stretchers) {
    parts.push(bx("Travessa inferior", o.mat, lx0 + (o.leg - aT) / 2, o.stretchers, lz0 + o.leg, aT, Math.min(60, o.leg), shortL));
    parts.push(bx("Travessa inferior", o.mat, lx1 + (o.leg - aT) / 2, o.stretchers, lz0 + o.leg, aT, Math.min(60, o.leg), shortL));
  }
  if (o.shelf) {
    const sw = (shortL - (o.shelf.slats - 1) * 10) / o.shelf.slats;
    parts.push(bx("Apoio da prateleira", o.mat, lx0 + o.leg, o.shelf.y - 30, lz0 + o.leg, aT, 30, shortL));
    parts.push(bx("Apoio da prateleira", o.mat, lx1 - aT, o.shelf.y - 30, lz0 + o.leg, aT, 30, shortL));
    for (let i = 0; i < o.shelf.slats; i++) parts.push(bx("Ripa da prateleira", o.mat, lx0 + o.leg, o.shelf.y, lz0 + o.leg + i * (sw + 10), longL, 20, sw));
  }
  const n = o.topBoards ?? 1;
  const bw = o.D / n;
  for (let i = 0; i < n; i++) parts.push(bx(n > 1 ? "Tábua do tampo" : "Tampo", tm, 0, legH, i * bw, o.W, o.topT, bw - (n > 1 && i < n - 1 ? 0 : 0)));
  return parts;
}

/** Caixa aberta (caixote, bandeja, jardineira, organizador). Ripas opcionais nas laterais. */
export function openBox(o: {
  W: number;
  H: number;
  D: number;
  t: number;
  mat: string;
  bottomT?: number;
  bottomMat?: string;
  slats?: number; // nº de ripas por lateral (0 = painel inteiro)
  dividersX?: number[];
  dividersZ?: number[];
  handleEnds?: boolean;
  corners?: number; // sarrafo de canto
  cornerMat?: string;
}): Part[] {
  const { W, H, D, t } = o;
  const bt = o.bottomT ?? t;
  const parts: Part[] = [];
  parts.push(bx("Fundo", o.bottomMat ?? o.mat, 0, 0, 0, W, bt, D));
  const hIn = H - bt;
  const endH = o.handleEnds ? hIn : hIn;
  if (o.slats) {
    const sh = (hIn - (o.slats - 1) * 8) / o.slats;
    for (let i = 0; i < o.slats; i++) {
      const y = bt + i * (sh + 8);
      parts.push(bx("Ripa lateral longa", o.mat, 0, y, 0, W, sh, t));
      parts.push(bx("Ripa lateral longa", o.mat, 0, y, D - t, W, sh, t));
      parts.push(bx("Ripa lateral curta", o.mat, 0, y, t, t, sh, D - 2 * t));
      parts.push(bx("Ripa lateral curta", o.mat, W - t, y, t, t, sh, D - 2 * t));
    }
    const c = o.corners ?? 20;
    for (const [x, z] of [
      [t, t],
      [W - t - c, t],
      [t, D - t - c],
      [W - t - c, D - t - c],
    ])
      parts.push(bx("Sarrafo de canto", o.cornerMat ?? o.mat, x, bt, z, c, hIn, c));
  } else {
    parts.push(bx("Lateral longa", o.mat, 0, bt, 0, W, hIn, t));
    parts.push(bx("Lateral longa", o.mat, 0, bt, D - t, W, hIn, t));
    parts.push(bx(o.handleEnds ? "Cabeceira com alça" : "Cabeceira", o.mat, 0, bt, t, t, endH, D - 2 * t));
    parts.push(bx(o.handleEnds ? "Cabeceira com alça" : "Cabeceira", o.mat, W - t, bt, t, t, endH, D - 2 * t));
  }
  for (const x of o.dividersX ?? []) parts.push(bx("Divisória", o.mat, x, bt, t, t, hIn * 0.85, D - 2 * t));
  for (const z of o.dividersZ ?? []) parts.push(bx("Divisória", o.mat, t, bt, z, W - 2 * t, hIn * 0.85, t));
  return parts;
}

/** Tábua / painel feito de réguas coladas lado a lado. */
export function board(o: { W: number; D: number; T: number; strips: number; mats: string[]; name?: string }): Part[] {
  const sw = o.D / o.strips;
  return Array.from({ length: o.strips }, (_, i) => bx(o.name ?? "Régua", o.mats[i % o.mats.length], 0, 0, i * sw, o.W, o.T, sw));
}

/** Moldura com fundo opcional (quadro, espelho, painel). Fica em pé no plano XY. */
export function frame(o: { W: number; H: number; bw: number; t: number; mat: string; fill?: string; fillName?: string }): Part[] {
  const parts: Part[] = [
    bx("Moldura (topo/base)", o.mat, 0, o.H - o.bw, 0, o.W, o.bw, o.t),
    bx("Moldura (topo/base)", o.mat, 0, 0, 0, o.W, o.bw, o.t),
    bx("Moldura (lateral)", o.mat, 0, o.bw, 0, o.bw, o.H - 2 * o.bw, o.t),
    bx("Moldura (lateral)", o.mat, o.W - o.bw, o.bw, 0, o.bw, o.H - 2 * o.bw, o.t),
  ];
  if (o.fill) parts.push(bx(o.fillName ?? "Painel", o.fill, o.bw, o.bw, 2, o.W - 2 * o.bw, o.H - 2 * o.bw, 4, { cut: false }));
  return parts;
}

/** Pallet (PBR ou europeu) montado: tábuas de cima, 3 travessas com blocos, tábuas de baixo. */
export function pallet(x: number, y: number, z: number, W = 1200, D = 1000, mat = "pallet", name = "Pallet"): Part[] {
  const parts: Part[] = [];
  const bt = 20,
    blockH = 78,
    bw = 100;
  for (let i = 0; i < 3; i++) {
    const zz = z + (i * (D - bw)) / 2;
    parts.push(bx(`${name}: tábua de baixo`, mat, x, y, zz, W, bt, bw, { cut: false }));
    for (let j = 0; j < 3; j++) parts.push(bx(`${name}: bloco`, mat, x + (j * (W - bw)) / 2, y + bt, zz, bw, blockH, bw, { cut: false }));
  }
  for (let j = 0; j < 3; j++) parts.push(bx(`${name}: travessa`, mat, x + (j * (W - bw)) / 2, y + bt + blockH, z, bw, 22, D, { cut: false }));
  const n = 7;
  for (let k = 0; k < n; k++) parts.push(bx(`${name}: tábua de cima`, mat, x, y + bt + blockH + 22, z + (k * (D - bw)) / (n - 1), W, bt, bw, { cut: false }));
  return parts;
}
