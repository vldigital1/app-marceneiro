// Otimizador de plano de corte — MaxRects (Best Short Side Fit), várias chapas.
// Sem dependências de DOM: usado pela calculadora (cliente) e pelo seed (quantidade de chapas).

export type PieceInput = {
  id: string;
  name: string;
  length: number; // mm
  width: number; // mm
  quantity: number;
  /** false quando o veio/padrão da chapa precisa seguir o comprimento da peça */
  canRotate: boolean;
};

export type SheetSpec = {
  length: number; // mm (eixo X)
  width: number; // mm (eixo Y)
  kerf: number; // espessura da serra, mm
  trim: number; // refilo em cada borda, mm
};

export type Placement = {
  pieceId: string;
  name: string;
  x: number;
  y: number;
  length: number; // dimensão final no eixo X
  width: number; // dimensão final no eixo Y
  rotated: boolean;
};

export type SheetLayout = {
  placements: Placement[];
  usedArea: number;
  utilization: number; // 0..1 em relação à área útil da chapa
};

export type PackResult = {
  sheets: SheetLayout[];
  unplaced: { pieceId: string; name: string; length: number; width: number }[];
  totalPieces: number;
  utilization: number;
};

export const DEFAULT_SHEET: SheetSpec = { length: 2750, width: 1830, kerf: 4, trim: 10 };

type Rect = { x: number; y: number; w: number; h: number };

class MaxRectsBin {
  free: Rect[];
  constructor(w: number, h: number) {
    this.free = [{ x: 0, y: 0, w, h }];
  }

  find(w: number, h: number, canRotate: boolean) {
    let best: { rect: Rect; rotated: boolean; score: number; score2: number } | null = null;
    for (const fr of this.free) {
      const tries: [number, number, boolean][] = [[w, h, false]];
      if (canRotate && w !== h) tries.push([h, w, true]);
      for (const [tw, th, rotated] of tries) {
        if (tw <= fr.w && th <= fr.h) {
          const leftH = fr.w - tw;
          const leftV = fr.h - th;
          const score = Math.min(leftH, leftV);
          const score2 = Math.max(leftH, leftV);
          if (!best || score < best.score || (score === best.score && score2 < best.score2)) {
            best = { rect: { x: fr.x, y: fr.y, w: tw, h: th }, rotated, score, score2 };
          }
        }
      }
    }
    return best;
  }

  place(r: Rect) {
    const next: Rect[] = [];
    for (const fr of this.free) {
      if (r.x >= fr.x + fr.w || r.x + r.w <= fr.x || r.y >= fr.y + fr.h || r.y + r.h <= fr.y) {
        next.push(fr);
        continue;
      }
      if (r.x > fr.x) next.push({ x: fr.x, y: fr.y, w: r.x - fr.x, h: fr.h });
      if (r.x + r.w < fr.x + fr.w) next.push({ x: r.x + r.w, y: fr.y, w: fr.x + fr.w - (r.x + r.w), h: fr.h });
      if (r.y > fr.y) next.push({ x: fr.x, y: fr.y, w: fr.w, h: r.y - fr.y });
      if (r.y + r.h < fr.y + fr.h) next.push({ x: fr.x, y: r.y + r.h, w: fr.w, h: fr.y + fr.h - (r.y + r.h) });
    }
    // remove retângulos contidos em outros
    this.free = next.filter(
      (a, i) =>
        a.w > 0 &&
        a.h > 0 &&
        !next.some(
          (b, j) =>
            i !== j &&
            a.x >= b.x &&
            a.y >= b.y &&
            a.x + a.w <= b.x + b.w &&
            a.y + a.h <= b.y + b.h &&
            (j < i || a.x !== b.x || a.y !== b.y || a.w !== b.w || a.h !== b.h),
        ),
    );
  }
}

export function packPieces(pieces: PieceInput[], sheet: SheetSpec = DEFAULT_SHEET): PackResult {
  const usableL = sheet.length - 2 * sheet.trim;
  const usableW = sheet.width - 2 * sheet.trim;

  const expanded = pieces
    .flatMap((p) =>
      Array.from({ length: Math.max(0, Math.floor(p.quantity)) }, () => ({ ...p })),
    )
    .filter((p) => p.length > 0 && p.width > 0)
    .sort((a, b) => b.length * b.width - a.length * a.width || Math.max(b.length, b.width) - Math.max(a.length, a.width));

  const bins: { bin: MaxRectsBin; layout: SheetLayout }[] = [];
  const unplaced: PackResult["unplaced"] = [];

  for (const p of expanded) {
    // a serra consome `kerf` entre peças: reservamos kerf em cada peça
    const w = p.length + sheet.kerf;
    const h = p.width + sheet.kerf;
    const fitsEmpty =
      (w <= usableL + sheet.kerf && h <= usableW + sheet.kerf) ||
      (p.canRotate && h <= usableL + sheet.kerf && w <= usableW + sheet.kerf);
    if (!fitsEmpty) {
      unplaced.push({ pieceId: p.id, name: p.name, length: p.length, width: p.width });
      continue;
    }

    let chosen: { entry: (typeof bins)[number]; hit: NonNullable<ReturnType<MaxRectsBin["find"]>> } | null = null;
    for (const entry of bins) {
      const hit = entry.bin.find(w, h, p.canRotate);
      if (hit && (!chosen || hit.score < chosen.hit.score)) chosen = { entry, hit };
    }
    if (!chosen) {
      const entry = {
        bin: new MaxRectsBin(usableL + sheet.kerf, usableW + sheet.kerf),
        layout: { placements: [], usedArea: 0, utilization: 0 } as SheetLayout,
      };
      bins.push(entry);
      const hit = entry.bin.find(w, h, p.canRotate)!;
      chosen = { entry, hit };
    }
    const { entry, hit } = chosen;
    entry.bin.place(hit.rect);
    const finalL = hit.rotated ? p.width : p.length;
    const finalW = hit.rotated ? p.length : p.width;
    entry.layout.placements.push({
      pieceId: p.id,
      name: p.name,
      x: hit.rect.x + sheet.trim,
      y: hit.rect.y + sheet.trim,
      length: finalL,
      width: finalW,
      rotated: hit.rotated,
    });
    entry.layout.usedArea += p.length * p.width;
  }

  const usable = usableL * usableW;
  const sheets = bins.map((b) => ({ ...b.layout, utilization: b.layout.usedArea / usable }));
  const used = sheets.reduce((s, x) => s + x.usedArea, 0);
  return {
    sheets,
    unplaced,
    totalPieces: expanded.length,
    utilization: sheets.length ? used / (usable * sheets.length) : 0,
  };
}
