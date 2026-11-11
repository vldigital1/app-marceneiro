"use client";

import { motion } from "framer-motion";

export function ProgressBar({ value, label, dark = false }: { value: number; label?: string; dark?: boolean }) {
  const pct = Math.max(0, Math.min(100, value));
  return (
    <div>
      <div className={`mb-1 flex justify-between text-xs font-semibold ${dark ? "text-bark-700" : "text-bark-700"}`}>
        <span>{label ?? "Progresso"}</span>
        <span className="num">{Math.round(pct)}%</span>
      </div>
      <div className={`h-2.5 overflow-hidden rounded-full ${dark ? "bg-wood-100" : "bg-wood-100"}`} role="progressbar" aria-valuenow={Math.round(pct)} aria-valuemin={0} aria-valuemax={100}>
        <motion.div
          className={`h-full rounded-full ${pct >= 100 ? "bg-leaf-600" : "bg-wood-400"}`}
          initial={false}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.35, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}
