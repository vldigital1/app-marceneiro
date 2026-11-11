import { mmToCm } from "@/lib/taxonomy";

type Props = {
  h: number;
  w: number;
  d: number;
  material?: string;
  showDims?: boolean;
  className?: string;
};

const PALETTE: Record<string, { top: string; front: string; side: string; line: string }> = {
  mdf: { top: "#f1e6d3", front: "#e4d2b4", side: "#cdb690", line: "#b39a74" },
  macica: { top: "#e3b77a", front: "#cd9a54", side: "#a8773c", line: "#8a5f2c" },
  pallet: { top: "#dcc091", front: "#c9a56a", side: "#a8864f", line: "#86683a" },
  sobras: { top: "#d9a86a", front: "#b97f35", side: "#935f24", line: "#74481a" },
};

/**
 * Ilustração isométrica gerada a partir das dimensões reais do projeto.
 * Fica no lugar da foto até você colocar as imagens geradas em public/images/projetos/<slug>/.
 */
export function ProjectIllustration({ h, w, d, material = "macica", showDims = true, className = "" }: Props) {
  const c = PALETTE[material] ?? PALETTE.macica;
  const cos = Math.cos(Math.PI / 6);
  const sin = 0.5;
  // projeção isométrica sem escala
  const rawW = (w + d) * cos;
  const rawH = h + (w + d) * sin;
  const box = 150;
  const s = Math.min(box / rawW, box / rawH);
  const W = w * s,
    D = d * s,
    H = h * s;
  const ox = 100 - ((W - D) * cos) / 2;
  const oy = 100 + (H - (W + D) * sin) / 2;
  const P = (x: number, y: number, z: number) => [ox + (x - z) * cos, oy + (x + z) * sin - y] as const;
  const pt = (p: readonly [number, number]) => `${p[0].toFixed(1)},${p[1].toFixed(1)}`;

  const top = [P(0, H, 0), P(W, H, 0), P(W, H, D), P(0, H, D)];
  const front = [P(0, 0, D), P(W, 0, D), P(W, H, D), P(0, H, D)];
  const side = [P(W, 0, 0), P(W, 0, D), P(W, H, D), P(W, H, 0)];

  // veios na face frontal
  const grains = Array.from({ length: 5 }, (_, i) => {
    const y = (H * (i + 1)) / 6;
    const a = P(0, y, D),
      b = P(W * 0.45, y + H * 0.015, D),
      e = P(W, y, D);
    return `M${pt(a)} Q${pt(b)} ${pt(e)}`;
  });

  const label = (p: readonly [number, number], text: string, anchor: "start" | "middle" | "end" = "middle") => (
    <text x={p[0]} y={p[1]} textAnchor={anchor} fontSize="8.5" fontFamily="ui-sans-serif, system-ui" fill="#4a3526" fontWeight={600}>
      {text}
    </text>
  );

  return (
    <svg viewBox="0 0 200 200" className={className} role="img" aria-label={`Volume aproximado: ${mmToCm(h)} × ${mmToCm(w)} × ${mmToCm(d)} cm`}>
      <ellipse cx="100" cy={Math.min(188, oy + (W + D) * sin * 0.5 + 12)} rx={Math.max(40, (W + D) * cos * 0.55)} ry="7" fill="#24180f" opacity="0.08" />
      <polygon points={side.map(pt).join(" ")} fill={c.side} stroke={c.line} strokeWidth="0.8" />
      <polygon points={front.map(pt).join(" ")} fill={c.front} stroke={c.line} strokeWidth="0.8" />
      <polygon points={top.map(pt).join(" ")} fill={c.top} stroke={c.line} strokeWidth="0.8" />
      {grains.map((g, i) => (
        <path key={i} d={g} fill="none" stroke={c.line} strokeOpacity="0.35" strokeWidth="0.6" />
      ))}
      {showDims && (
        <>
          {label([P(0, 0, D)[0] - 6, P(0, H / 2, D)[1]], `${mmToCm(h)}`, "end")}
          {label([(P(0, 0, D)[0] + P(W, 0, D)[0]) / 2 - 4, (P(0, 0, D)[1] + P(W, 0, D)[1]) / 2 + 13], `${mmToCm(w)}`)}
          {label([(P(W, 0, 0)[0] + P(W, 0, D)[0]) / 2 + 10, (P(W, 0, 0)[1] + P(W, 0, D)[1]) / 2 + 10], `${mmToCm(d)}`, "start")}
        </>
      )}
    </svg>
  );
}
