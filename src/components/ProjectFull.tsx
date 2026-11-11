"use client";

import { useEffect, useState } from "react";
import type { Project } from "@/data/model";
import { buscarBloqueado, useAcesso } from "@/lib/acesso";
import { withBase } from "@/lib/base";
import { GRAIN_LABEL, mmToCm } from "@/lib/taxonomy";
import { FavoriteButton, StartButton } from "./ProjectActions";
import { UnlockBox } from "./UnlockBox";

const SECTIONS = [
  ["ficha", "Ficha técnica"],
  ["materiais", "Materiais"],
  ["corte", "Lista de corte"],
  ["juncao", "Junção"],
  ["ferragens", "Ferragens"],
  ["acabamento", "Acabamento"],
  ["montagem", "Montagem"],
  ["atencao", "Atenção"],
] as const;

function Section({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="scroll-mt-24 border-t border-bark-900/10 pt-8">
      <h2 className="mb-4 text-2xl">{title}</h2>
      {children}
    </section>
  );
}

/** Ficha técnica completa + ações (PDF, favoritar, plano de corte, começar). */
export function ProjectFull({ p }: { p: Project }) {
  const hasSheets = p.cutList.some((c) => c.isSheet);
  const groups = new Map<string, (string | number)[][]>();
  for (const c of p.cutList.filter((c) => c.isSheet)) {
    const g = groups.get(c.material) ?? [];
    g.push([c.pieceName, c.quantity, c.length, c.width, c.grainDirection === "livre" ? 1 : 0]);
    groups.set(c.material, g);
  }
  const planUrl = `${withBase("/plano-de-corte/")}#d=${encodeURIComponent(JSON.stringify({ t: p.title, g: [...groups].map(([m, pc]) => ({ m, p: pc })) }))}`;

  return (
    <>
      <div className="mt-8 grid gap-2 sm:grid-cols-2 lg:max-w-xl">
        <a href={p.downloadPdfUrl} download={`${p.slug}.pdf`} className="btn-cta w-full py-3 text-base sm:col-span-2">
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
            <path d="M12 3v12m0 0-4-4m4 4 4-4M4 19h16" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Baixar projeto em PDF
        </a>
        <FavoriteButton slug={p.slug} />
        {hasSheets ? (
          <a href={planUrl} className="btn-ghost w-full">
            Otimizar corte
          </a>
        ) : (
          <a href="#corte" className="btn-ghost w-full">
            Ver lista de corte
          </a>
        )}
        <div className="sm:col-span-2">
          <StartButton slug={p.slug} totalSteps={p.assemblySteps.length} />
        </div>
      </div>

      {p.extraImages.length > 0 && (
        <div className="mt-10 grid gap-4 md:grid-cols-2">
          {p.extraImages.map((src) => (
            <a key={src} href={src} target="_blank" rel="noreferrer" className="overflow-hidden rounded-xl border border-bark-900/10 bg-[#fbf8f2]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt={`${p.title} — ilustração técnica`} className="w-full" loading="lazy" />
            </a>
          ))}
        </div>
      )}

      <div className="mt-12 grid gap-10 lg:grid-cols-[200px_1fr]">
        <nav className="no-print hidden lg:block" aria-label="Seções da ficha">
          <ul className="sticky top-24 space-y-1 text-sm">
            {SECTIONS.map(([id, t]) => (
              <li key={id}>
                <a href={`#${id}`} className="block rounded-md px-3 py-1.5 text-bark-700 hover:bg-wood-100 hover:text-bark-900">
                  {t}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="min-w-0 space-y-10">
          <Section id="ficha" title="Ficha técnica">
            <div className="grid gap-4 sm:grid-cols-3">
              {(
                [
                  ["Altura", p.heightMm],
                  ["Largura", p.widthMm],
                  ["Profundidade", p.depthMm],
                ] as const
              ).map(([k, v]) => (
                <div key={k} className="card p-4">
                  <p className="text-xs text-bark-600">{k}</p>
                  <p className="num font-display text-2xl font-bold">
                    {v} <span className="text-sm font-normal text-bark-600">mm</span>
                  </p>
                  <p className="num text-xs text-bark-600">{mmToCm(v)} cm</p>
                </div>
              ))}
            </div>
            <h3 className="mt-6 mb-2 font-sans text-sm font-semibold tracking-wide text-bark-700 uppercase">Ferramentas</h3>
            <ul className="flex flex-wrap gap-2">
              {p.toolsRequired.map((t) => (
                <li key={t} className="chip border-bark-900/10 bg-white text-bark-800">
                  {t}
                </li>
              ))}
            </ul>
          </Section>

          <Section id="materiais" title="Lista de materiais">
            <div className="overflow-x-auto rounded-xl border border-bark-900/10 bg-white">
              <table className="table-tech">
                <thead>
                  <tr>
                    <th>Item</th>
                    <th>Material</th>
                    <th>Espessura</th>
                    <th>Quantidade</th>
                    <th>Perda</th>
                  </tr>
                </thead>
                <tbody>
                  {p.materialsList.map((m) => (
                    <tr key={m.item + m.material}>
                      <td className="font-medium">{m.item}</td>
                      <td>{m.material}</td>
                      <td className="num">{m.thickness ? `${m.thickness.toLocaleString("pt-BR")} mm` : "—"}</td>
                      <td>{m.quantity}</td>
                      <td className="num">{Math.round(m.wasteFactor * 100)}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Section>

          <Section id="corte" title="Lista de corte">
            <p className="mb-3 text-sm text-bark-700">Medidas finais em milímetros. O comprimento acompanha o sentido do veio quando indicado.</p>
            <div className="overflow-x-auto rounded-xl border border-bark-900/10 bg-white">
              <table className="table-tech">
                <thead>
                  <tr>
                    <th>Peça</th>
                    <th className="text-right">Qtd</th>
                    <th className="text-right">Compr.</th>
                    <th className="text-right">Larg.</th>
                    <th className="text-right">Esp.</th>
                    <th>Veio</th>
                    <th>Material</th>
                  </tr>
                </thead>
                <tbody>
                  {p.cutList.map((c, i) => (
                    <tr key={i}>
                      <td className="font-medium">{c.pieceName}</td>
                      <td className="num text-right">{c.quantity}</td>
                      <td className="num text-right">{c.length}</td>
                      <td className="num text-right">{c.width}</td>
                      <td className="num text-right">{c.thickness}</td>
                      <td>{GRAIN_LABEL[c.grainDirection]}</td>
                      <td className="text-bark-600">{c.material}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {hasSheets && (
              <a href={planUrl} className="mt-3 inline-block text-sm font-semibold text-wood-600 hover:underline">
                Ver o plano de corte desta lista na chapa 2750 × 1830 →
              </a>
            )}
          </Section>

          <Section id="juncao" title="Tipo de junção">
            <div className="card p-5">
              <p className="font-semibold text-bark-900">{p.joineryType}</p>
              <p className="mt-2 text-bark-700">{p.joineryJustification}</p>
            </div>
          </Section>

          <Section id="ferragens" title="Ferragens e consumíveis">
            <ul className="divide-y divide-bark-900/10 rounded-xl border border-bark-900/10 bg-white">
              {p.hardware.map((h) => (
                <li key={h.item} className="flex justify-between gap-4 px-4 py-2.5 text-sm">
                  <span>{h.item}</span>
                  <span className="num shrink-0 font-semibold">{h.quantity}</span>
                </li>
              ))}
            </ul>
          </Section>

          <Section id="acabamento" title="Acabamento recomendado">
            <p className="leading-7 text-bark-800">{p.finish}</p>
          </Section>

          <Section id="montagem" title="Montagem passo a passo">
            <ol className="space-y-3">
              {p.assemblySteps.map((s, i) => (
                <li key={i} className="flex gap-4">
                  <span className="num flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-bark-900 font-display text-sm font-bold text-wood-300">{i + 1}</span>
                  <p className="pt-1 leading-7 text-bark-800">{s}</p>
                </li>
              ))}
            </ol>
          </Section>

          <Section id="atencao" title="Pontos de atenção">
            <ul className="space-y-2">
              {p.warnings.map((w) => (
                <li key={w} className="flex gap-3 rounded-lg border-l-4 border-wood-500 bg-wood-100/70 p-3 text-sm leading-6 text-bark-800">
                  <span aria-hidden>⚠️</span>
                  {w}
                </li>
              ))}
            </ul>
          </Section>
        </div>
      </div>
    </>
  );
}

/** Projeto exclusivo: a ficha só é baixada do servidor depois da senha. */
export function LockedProject({ slug }: { slug: string }) {
  const acesso = useAcesso();
  const [p, setP] = useState<Project | null>(null);
  const [falhou, setFalhou] = useState(false);

  useEffect(() => {
    if (!acesso.liberado || p) return;
    void buscarBloqueado<Project>("projeto", slug).then((r) => (r ? setP(r) : setFalhou(true)));
  }, [acesso.liberado, slug, p]);

  if (p) return <ProjectFull p={p} />;
  if (acesso.carregando || (acesso.liberado && !falhou)) return <div className="mt-10 h-72 animate-pulse rounded-xl bg-wood-100" />;
  if (falhou) return <p className="mt-10 rounded-xl bg-wood-100 p-5">Não foi possível carregar o projeto. Verifique sua internet e recarregue a página.</p>;
  return (
    <div className="mt-10 max-w-2xl">
      <UnlockBox titulo="Projeto exclusivo" texto="Lista de corte, materiais, ferragens, montagem, vistas técnicas e PDF deste projeto fazem parte do app completo. Digite a senha de desbloqueio para liberar." />
    </div>
  );
}
