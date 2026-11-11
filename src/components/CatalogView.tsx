"use client";

import { AnimatePresence, motion } from "framer-motion";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import type { ProjectCardData } from "@/data/model";
import { CATEGORIES, DIFFICULTIES, ENVIRONMENTS, MATERIALS } from "@/lib/taxonomy";
import { ProjectCard } from "./ProjectCard";
import { SeloSabado } from "./SeloSabado";
import { useProjetosNovos } from "@/lib/novidades";

const normalize = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();

const LEVEL_ORDER: Record<string, number> = { iniciante: 0, intermediario: 1, avancado: 2 };

const FILTERS = [
  { key: "categoria", label: "Categoria", options: CATEGORIES, field: "category" },
  { key: "material", label: "Material", options: MATERIALS, field: "primaryMaterial" },
  { key: "nivel", label: "Nível", options: DIFFICULTIES, field: "difficulty" },
  { key: "ambiente", label: "Ambiente", options: ENVIRONMENTS, field: "environment" },
] as const;

export function CatalogView({ items }: { items: ProjectCardData[] }) {
  const sp = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [q, setQ] = useState(sp.get("q") ?? "");

  const active = Object.fromEntries(FILTERS.map((f) => [f.key, sp.get(f.key) ?? ""])) as Record<string, string>;
  const ordem = sp.get("ordem") ?? "";
  const query = sp.get("q") ?? "";

  const setParam = (key: string, value: string) => {
    const next = new URLSearchParams(sp.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    const s = next.toString();
    router.replace(s ? `${pathname}?${s}` : pathname, { scroll: false });
  };

  const results = useMemo(() => {
    let rows = items.filter((p) => FILTERS.every((f) => !active[f.key] || p[f.field] === active[f.key]));
    const terms = normalize(query).split(/\s+/).filter(Boolean);
    if (terms.length) rows = rows.filter((p) => terms.every((t) => normalize(`${p.title} ${p.summary} ${CATEGORIES[p.category as keyof typeof CATEGORIES] ?? ""}`).includes(t)));
    if (ordem === "facil") rows = [...rows].sort((a, b) => LEVEL_ORDER[a.difficulty] - LEVEL_ORDER[b.difficulty] || a.title.localeCompare(b.title, "pt-BR"));
    if (ordem === "custo") rows = [...rows].sort((a, b) => a.costMin - b.costMin);
    return rows;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items, sp]);

  const anyFilter = query || FILTERS.some((f) => active[f.key]);
  const slugs = useMemo(() => items.map((p) => p.slug), [items]);
  const novos = useProjetosNovos(slugs);
  const nFiltros = FILTERS.filter((f) => active[f.key]).length + (ordem ? 1 : 0);
  const [filtros, setFiltros] = useState(false);

  return (
    <div className="grid grid-cols-[minmax(0,1fr)] gap-6 lg:grid-cols-[250px_minmax(0,1fr)] lg:gap-8">
      <aside className="space-y-3 lg:space-y-5 lg:sticky lg:top-24 lg:self-start">
        <form
          role="search"
          onSubmit={(e) => {
            e.preventDefault();
            setParam("q", q.trim());
          }}
        >
          <label htmlFor="q" className="label">
            Buscar
          </label>
          <div className="flex gap-2">
            <input id="q" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Ex.: sapateira" className="input" />
            <button className="btn-dark px-3" aria-label="Buscar">
              →
            </button>
          </div>
        </form>

        <button
          type="button"
          onClick={() => setFiltros((v) => !v)}
          aria-expanded={filtros}
          className="flex w-full items-center justify-between rounded-xl border border-bark-900/15 bg-white px-4 py-3 text-sm font-semibold text-bark-800 lg:hidden"
        >
          <span>Filtros e ordem{nFiltros ? ` (${nFiltros})` : ""}</span>
          <span aria-hidden>{filtros ? "▲" : "▼"}</span>
        </button>

        <div className={`space-y-5 ${filtros ? "" : "hidden"} lg:block`}>
        {FILTERS.map((f) => (
          <div key={f.key}>
            <label htmlFor={f.key} className="label">
              {f.label}
            </label>
            <select id={f.key} value={active[f.key]} onChange={(e) => setParam(f.key, e.target.value)} className="input">
              <option value="">Todos</option>
              {Object.entries(f.options).map(([k, v]) => (
                <option key={k} value={k}>
                  {v}
                </option>
              ))}
            </select>
          </div>
        ))}

        <div>
          <label htmlFor="ordem" className="label">
            Ordenar
          </label>
          <select id="ordem" value={ordem} onChange={(e) => setParam("ordem", e.target.value)} className="input">
            <option value="">Destaques</option>
            <option value="facil">Mais fáceis primeiro</option>
            <option value="custo">Menor custo</option>
          </select>
        </div>

        {anyFilter && (
          <button
            onClick={() => {
              setQ("");
              router.replace(pathname, { scroll: false });
            }}
            className="text-sm font-semibold text-wood-600 hover:underline"
          >
            Limpar filtros
          </button>
        )}
        </div>
      </aside>

      <div>
        <SeloSabado novos={novos.size} className="mb-4" />
        <p className="mb-4 text-sm text-bark-700" aria-live="polite">
          <strong className="num">{results.length}</strong> {results.length === 1 ? "projeto encontrado" : "projetos encontrados"}
          {query && (
            <>
              {" "}
              para “{query}”
            </>
          )}
        </p>
        <AnimatePresence mode="wait">
          {results.length ? (
            <motion.div key="grid" className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {results.map((p, i) => (
                <ProjectCard key={p.slug} p={p} index={i} novo={novos.has(p.slug)} />
              ))}
            </motion.div>
          ) : (
            <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card p-10 text-center">
              <p className="font-display text-xl">Nenhum projeto com esses filtros.</p>
              <p className="mt-2 text-sm text-bark-700">Tente outro termo ou limpe algum filtro.</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
