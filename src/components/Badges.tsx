import { DIFFICULTIES, label } from "@/lib/taxonomy";

const LEVEL_STYLE: Record<string, string> = {
  iniciante: "border-leaf-600/30 bg-leaf-50 text-leaf-700",
  intermediario: "border-wood-500/40 bg-wood-100 text-wood-600",
  avancado: "border-danger/30 bg-red-50 text-danger",
};

export function LevelBadge({ level }: { level: string }) {
  const bars = level === "iniciante" ? 1 : level === "intermediario" ? 2 : 3;
  return (
    <span className={`chip ${LEVEL_STYLE[level] ?? ""}`}>
      <span className="flex items-end gap-0.5" aria-hidden>
        {[1, 2, 3].map((i) => (
          <span key={i} className={`w-1 rounded-sm ${i <= bars ? "bg-current" : "bg-current/25"}`} style={{ height: 4 + i * 2 }} />
        ))}
      </span>
      {label(DIFFICULTIES, level)}
    </span>
  );
}
