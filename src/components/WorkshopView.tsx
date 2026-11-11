"use client";

import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { useState } from "react";
import type { ProjectCardData } from "@/data/model";
import { withBase } from "@/lib/base";
import { useWorkshop, workshop, type ProgressEntry } from "@/lib/workshop";
import { ProgressBar } from "./ProgressBar";
import { ProjectCard } from "./ProjectCard";

export type WorkshopProject = { card: ProjectCardData; steps: string[] };

function ChecklistCard({ p, entry }: { p: WorkshopProject; entry: ProgressEntry }) {
  const total = p.steps.length;
  const done = entry.steps.length;
  const [open, setOpen] = useState(entry.status !== "concluido");
  return (
    <motion.li layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.98 }} className="card p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <Link href={`/projetos/${p.card.slug}/`} className="font-display text-xl font-bold hover:text-wood-600">
            {p.card.title}
          </Link>
          <p className="text-xs text-bark-600">Começado em {new Date(entry.startedAt).toLocaleDateString("pt-BR")}</p>
        </div>
        <div className="flex gap-2">
          {entry.status === "concluido" ? (
            <button className="btn-ghost py-1.5 text-xs" onClick={() => workshop.setStatus(p.card.slug, "em_progresso", total)}>
              Reabrir
            </button>
          ) : (
            <button className="btn-cta py-1.5 text-xs" onClick={() => workshop.setStatus(p.card.slug, "concluido", total)}>
              Marcar concluído
            </button>
          )}
          <button className="btn-ghost py-1.5 text-xs" onClick={() => confirm("Remover este projeto da sua oficina?") && workshop.remove(p.card.slug)}>
            Remover
          </button>
        </div>
      </div>
      <div className="mt-4">
        <ProgressBar value={(done / total) * 100} label={`${done} de ${total} passos`} />
      </div>
      <button onClick={() => setOpen((v) => !v)} className="mt-3 text-sm font-semibold text-wood-600 hover:underline" aria-expanded={open}>
        {open ? "Esconder checklist" : "Mostrar checklist"}
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.ol initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="mt-3 space-y-1 overflow-hidden">
            {p.steps.map((s, i) => {
              const checked = entry.steps.includes(i + 1);
              return (
                <li key={i}>
                  <label className={`flex cursor-pointer gap-3 rounded-lg p-2 text-sm leading-6 hover:bg-wood-50 ${checked ? "text-bark-500 line-through" : "text-bark-800"}`}>
                    <input type="checkbox" checked={checked} onChange={() => workshop.toggleStep(p.card.slug, i + 1, total)} className="mt-1 h-4 w-4 shrink-0 accent-leaf-600" />
                    <span>
                      <strong className="num mr-1">{i + 1}.</strong>
                      {s}
                    </span>
                  </label>
                </li>
              );
            })}
          </motion.ol>
        )}
      </AnimatePresence>
    </motion.li>
  );
}

const TABS = [
  ["salvos", "Projetos salvos"],
  ["andamento", "Em progresso"],
  ["concluidos", "Concluídos"],
  ["favoritos", "Favoritos"],
] as const;

export function WorkshopView({ projects }: { projects: WorkshopProject[] }) {
  const { favorites, progress, salvos } = useWorkshop();
  const [tab, setTab] = useState<(typeof TABS)[number][0]>("salvos");
  const bySlug = new Map(projects.map((p) => [p.card.slug, p]));

  const entries = Object.entries(progress)
    .filter(([slug]) => bySlug.has(slug))
    .sort((a, b) => b[1].startedAt.localeCompare(a[1].startedAt));
  const inProgress = entries.filter(([, e]) => e.status === "em_progresso");
  const finished = entries.filter(([, e]) => e.status === "concluido");
  const favs = favorites.map((s) => bySlug.get(s)).filter(Boolean) as WorkshopProject[];
  const counts = { salvos: salvos.length, andamento: inProgress.length, concluidos: finished.length, favoritos: favs.length };

  const list = tab === "andamento" ? inProgress : finished;

  return (
    <div>
      <div className="mb-6 flex gap-1 overflow-x-auto rounded-xl bg-wood-100 p-1" role="tablist">
        {TABS.map(([k, l]) => (
          <button
            key={k}
            role="tab"
            aria-selected={tab === k}
            onClick={() => setTab(k)}
            className={`relative flex-1 rounded-lg px-4 py-2 text-sm font-semibold whitespace-nowrap ${tab === k ? "text-bark-950" : "text-bark-600 hover:text-bark-900"}`}
          >
            {tab === k && <motion.span layoutId="tab" className="absolute inset-0 rounded-lg bg-white shadow-sm" transition={{ duration: 0.2 }} />}
            <span className="relative">
              {l} <span className="num text-bark-500">({counts[k]})</span>
            </span>
          </button>
        ))}
      </div>

      {tab === "salvos" ? (
        salvos.length ? (
          <ul className="grid gap-4 sm:grid-cols-2">
            {salvos.map((c) => (
              <li key={c.id} className="card flex flex-col p-5">
                <p className="text-xs font-semibold tracking-wide text-wood-600 uppercase">{c.tipoNome}</p>
                <p className="mt-1 font-display text-xl font-bold">{c.cliente}</p>
                <p className="num mt-1 text-sm text-bark-700">
                  {c.dims[0]} × {c.dims[1]} × {c.dims[2]} mm · salvo em {new Date(c.data).toLocaleDateString("pt-BR")}
                </p>
                <div className="mt-4 flex gap-2">
                  <a href={`${withBase(`/configurador/${c.tipo}/`)}#c=${btoa(unescape(encodeURIComponent(JSON.stringify({ v: c.valores, cx: c.caixa, fr: c.frente }))))}`} className="btn-cta py-2">
                    Abrir
                  </a>
                  <button onClick={() => confirm(`Apagar o projeto de ${c.cliente}?`) && workshop.removerSalvo(c.id)} className="btn-ghost py-2">
                    Apagar
                  </button>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <Empty text="Nenhum projeto salvo. Em Sob medida, ajuste um móvel com as medidas do cliente e toque em “Salvar projeto”." />
        )
      ) : tab === "favoritos" ? (
        favs.length ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {favs.map((p, i) => (
              <ProjectCard key={p.card.slug} p={p.card} index={i} />
            ))}
          </div>
        ) : (
          <Empty text="Você ainda não favoritou nenhum projeto. Use o botão ♡ Favoritar na ficha do projeto." />
        )
      ) : list.length ? (
        <ul className="space-y-4">
          <AnimatePresence>
            {list.map(([slug, e]) => (
              <ChecklistCard key={slug} p={bySlug.get(slug)!} entry={e} />
            ))}
          </AnimatePresence>
        </ul>
      ) : (
        <Empty
          text={
            tab === "andamento"
              ? "Nenhum projeto em andamento. Abra uma ficha e clique em “Começar este projeto” para ter o checklist de montagem aqui."
              : "Nenhum projeto concluído ainda. Quando marcar todos os passos, ele aparece aqui."
          }
        />
      )}
    </div>
  );
}

function Empty({ text }: { text: string }) {
  return (
    <div className="card p-10 text-center">
      <p className="mx-auto max-w-md text-bark-700">{text}</p>
      <Link href="/catalogo/" className="btn-cta mt-5">
        Explorar catálogo
      </Link>
    </div>
  );
}
