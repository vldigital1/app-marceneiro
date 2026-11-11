"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useWorkshop, workshop } from "@/lib/workshop";

export function FavoriteButton({ slug }: { slug: string }) {
  const { favorites } = useWorkshop();
  const on = favorites.includes(slug);
  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      onClick={() => workshop.toggleFavorite(slug)}
      aria-pressed={on}
      className={`btn w-full border ${on ? "border-wood-500 bg-wood-100 text-wood-600" : "border-bark-900/15 bg-white text-bark-800 hover:bg-wood-50"}`}
    >
      <motion.svg key={String(on)} initial={{ scale: 0.6 }} animate={{ scale: 1 }} viewBox="0 0 24 24" className="h-5 w-5" aria-hidden>
        <path
          d="M12 21s-7.5-4.6-9.6-9.2C.9 8.3 3.2 4.5 6.9 4.5c2.1 0 3.6 1.2 4.3 2.5.8-1.3 2.3-2.5 4.4-2.5 3.7 0 6 3.8 4.4 7.3C19.5 16.4 12 21 12 21Z"
          fill={on ? "currentColor" : "none"}
          stroke="currentColor"
          strokeWidth="1.8"
        />
      </motion.svg>
      {on ? "Nos favoritos" : "Favoritar"}
    </motion.button>
  );
}

export function StartButton({ slug, totalSteps }: { slug: string; totalSteps: number }) {
  const { progress } = useWorkshop();
  const p = progress[slug];
  if (p) {
    const pct = Math.round((p.steps.length / totalSteps) * 100);
    return (
      <Link href="/membro/" className="btn w-full border border-leaf-600/30 bg-leaf-50 text-leaf-700 hover:bg-leaf-50/60">
        {p.status === "concluido" ? "✓ Concluído — ver na oficina" : `Em progresso: ${pct}% — abrir checklist`}
      </Link>
    );
  }
  return (
    <button onClick={() => workshop.start(slug)} className="btn-dark w-full">
      Começar este projeto
    </button>
  );
}
