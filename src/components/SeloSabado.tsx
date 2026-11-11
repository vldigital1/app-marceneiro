"use client";

import { motion } from "framer-motion";
import { useSininho } from "@/lib/novidades";

/** Selo "Projetos novos todo sábado" com o sininho de aviso. */
export function SeloSabado({ novos = 0, className = "" }: { novos?: number; className?: string }) {
  const { ligado, alternar } = useSininho();
  return (
    <div className={`flex flex-col gap-3 rounded-2xl border border-wood-400/50 bg-gradient-to-r from-wood-100 to-wood-50 p-4 sm:flex-row sm:items-center ${className}`}>
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <span className="flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-xl bg-bark-900 text-wood-300">
          <span className="text-[9px] font-bold tracking-wider uppercase">Todo</span>
          <span className="text-xs leading-none font-extrabold">SÁB</span>
        </span>
        <div className="min-w-0">
          <p className="font-display text-lg leading-tight text-bark-900">
            Projetos novos todo sábado
            {novos > 0 && <span className="ml-2 rounded-full bg-leaf-600 px-2 py-0.5 align-middle font-sans text-xs font-bold text-white">{novos} novo{novos > 1 ? "s" : ""}</span>}
          </p>
          <p className="text-sm text-bark-700">Ative o sininho para não perder quando for lançado.</p>
        </div>
      </div>
      <button
        type="button"
        onClick={() => void alternar()}
        aria-pressed={ligado}
        className={`flex shrink-0 items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition-colors ${ligado ? "bg-leaf-600 text-white" : "bg-bark-900 text-wood-50 hover:bg-bark-800"}`}
      >
        <motion.span
          key={String(ligado)}
          initial={{ rotate: 0 }}
          animate={ligado ? { rotate: [0, -18, 16, -10, 6, 0] } : { rotate: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-block"
          aria-hidden
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill={ligado ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 8a6 6 0 1 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
            <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
          </svg>
        </motion.span>
        {ligado ? "Sininho ativado" : "Ativar sininho"}
      </button>
    </div>
  );
}
