"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import type { ModuloResumo } from "@/content/curso";
import { useAcesso } from "@/lib/acesso";
import { hoje, placar, resumo, usePlacar } from "@/lib/pontos";
import { ProgressBar } from "./ProgressBar";

export function AulasHome({ modulos }: { modulos: ModuloResumo[] }) {
  const p = usePlacar();
  const r = resumo(p);
  const { liberado } = useAcesso();
  const totalPerguntas = modulos.reduce((s, m) => s + m.topicos.reduce((t, x) => t + x.perguntas.length, 0), 0);
  // últimos 7 dias de estudo
  const dias = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const k = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    return { k, label: d.toLocaleDateString("pt-BR", { weekday: "short" }).replace(".", ""), pts: p.dias[k] ?? 0 };
  });
  const max = Math.max(10, ...dias.map((d) => d.pts));

  return (
    <div className="space-y-6">
      {/* PLACAR */}
      <section className="app-card p-5">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="app-kicker">Seu placar</p>
            <p className="app-title mt-1 text-6xl text-wood-600">
              {r.hoje}
              <span className="ml-2 text-2xl text-bark-700">pontos hoje</span>
            </p>
          </div>
          <div className="grid grid-cols-3 gap-3 text-center">
            {[
              [r.total, "total"],
              [r.acertos, "acertos"],
              [r.erros, "erros"],
            ].map(([n, l]) => (
              <div key={String(l)} className="rounded-xl bg-wood-50 px-3 py-2">
                <p className="num font-mono text-xl font-bold">{n}</p>
                <p className="text-[11px] text-bark-500 uppercase">{l}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-5 flex h-24 items-end gap-2" aria-label="Pontos nos últimos 7 dias">
          {dias.map((d) => (
            <div key={d.k} className="flex flex-1 flex-col items-center gap-1">
              <span className="num font-mono text-[10px] text-bark-700">{d.pts || ""}</span>
              <motion.div initial={{ height: 0 }} animate={{ height: `${Math.max(4, (d.pts / max) * 64)}px` }} transition={{ duration: 0.35 }} className={`w-full rounded-t-md ${d.k === hoje() ? "bg-wood-400" : "bg-leaf-600/70"}`} />
              <span className="text-[10px] text-bark-500 uppercase">{d.label}</span>
            </div>
          ))}
        </div>
        <p className="mt-3 text-sm text-bark-700">
          Acerte de primeira: 10 pontos. Na segunda tentativa: 5. Depois disso: 2. São {totalPerguntas} perguntas no curso — {r.respondidas} já respondidas.
        </p>
      </section>

      {/* MÓDULOS */}
      <div className="space-y-4">
        {modulos.map((m) => {
          const qs = m.topicos.flatMap((t) => t.perguntas);
          const feitas = qs.filter((q) => p.respostas[q]).length;
          const pts = qs.reduce((s, q) => s + (p.respostas[q]?.pontos ?? 0), 0);
          const aberto = m.livre || liberado;
          const primeiro = m.topicos.find((t) => !t.perguntas.every((q) => p.respostas[q])) ?? m.topicos[0];
          return (
            <section key={m.id} className="app-card overflow-hidden">
              <div className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="app-kicker">Módulo {String(m.numero).padStart(2, "0")}</p>
                    <h2 className="app-title mt-1 text-3xl">{m.titulo}</h2>
                    <p className="mt-1 text-sm text-bark-700">{m.descricao}</p>
                  </div>
                  <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-bold ${aberto ? "bg-leaf-600 text-white" : "bg-white/90 text-wood-600"}`}>{m.livre ? "Livre" : aberto ? "Liberado" : "🔒 Exclusivo"}</span>
                </div>
                <div className="mt-4">
                  <ProgressBar value={qs.length ? (feitas / qs.length) * 100 : 0} label={`${feitas} de ${qs.length} perguntas · ${pts} pts`} />
                </div>
                <Link href={`/aulas/${m.id}/${primeiro.id}/`} className="app-btn mt-4 w-full sm:w-auto">
                  {feitas === 0 ? "Começar módulo" : feitas === qs.length ? "Revisar módulo" : "Continuar de onde parei"}
                </Link>
              </div>
              <ol className="border-t border-bark-900/10 bg-wood-50 px-5 py-3 text-sm">
                {m.topicos.map((t, i) => {
                  const ok = t.perguntas.length > 0 && t.perguntas.every((q) => p.respostas[q]);
                  return (
                    <li key={t.id}>
                      <Link href={`/aulas/${m.id}/${t.id}/`} className="flex items-center gap-3 py-1.5 text-bark-700 hover:text-bark-950">
                        <span className={`num flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-bold ${ok ? "bg-leaf-600 text-white" : "bg-wood-100"}`}>{ok ? "✓" : i + 1}</span>
                        {t.titulo}
                        {!aberto && <span className="ml-auto text-xs">🔒</span>}
                      </Link>
                    </li>
                  );
                })}
              </ol>
            </section>
          );
        })}
      </div>
      {r.respondidas > 0 && (
        <button type="button" onClick={() => confirm("Zerar todos os pontos e respostas deste aparelho?") && placar.zerar()} className="app-btn-ghost">
          Zerar meu placar
        </button>
      )}
    </div>
  );
}
