import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { LevelBadge } from "@/components/Badges";
import { Gallery } from "@/components/Gallery";
import { LockedProject, ProjectFull } from "@/components/ProjectFull";
import { ProjectCard } from "@/components/ProjectCard";
import { getProject, getProjects, getRelated } from "@/data";
import { CATEGORIES, ENVIRONMENTS, MATERIALS, costRange, dims, label } from "@/lib/taxonomy";

export const dynamicParams = false;

export function generateStaticParams() {
  return getProjects().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const p = getProject((await params).slug);
  if (!p) return {};
  return { title: p.title, description: p.summary };
}

export default async function ProjetoPage({ params }: { params: Promise<{ slug: string }> }) {
  const p = getProject((await params).slug);
  if (!p) notFound();
  const related = getRelated(p);
  const totalPieces = p.cutList.reduce((s, c) => s + c.quantity, 0);

  return (
    <article className="container-page py-8">
      <nav className="mb-6 text-sm text-bark-600" aria-label="Trilha">
        <Link href="/catalogo/" className="hover:text-wood-600">
          Catálogo
        </Link>
        <span className="mx-2">/</span>
        <Link href={`/catalogo/?categoria=${p.category}`} className="hover:text-wood-600">
          {label(CATEGORIES, p.category)}
        </Link>
      </nav>

      <div className="grid gap-10 lg:grid-cols-[1.4fr_1fr]">
        <Gallery title={p.title} images={p.images} h={p.heightMm} w={p.widthMm} d={p.depthMm} material={p.primaryMaterial} />

        <div>
          <div className="flex flex-wrap gap-2">
            <LevelBadge level={p.difficulty} />
            <span className="chip border-bark-900/10 bg-wood-100 text-bark-700">{label(MATERIALS, p.primaryMaterial)}</span>
            <span className="chip border-bark-900/10 bg-wood-100 text-bark-700">{label(ENVIRONMENTS, p.environment)}</span>
            {p.locked && <span className="chip border-transparent bg-bark-900 text-wood-200">🔒 Exclusivo</span>}
          </div>
          <h1 className="mt-4 text-3xl sm:text-4xl">{p.title}</h1>
          <p className="mt-4 text-bark-700">{p.summary}</p>

          <dl className="mt-6 grid grid-cols-2 gap-3 text-sm">
            {[
              ["Medidas finais", dims(p.heightMm, p.widthMm, p.depthMm)],
              ["Tempo estimado", p.estimatedTime],
              ["Custo estimado", costRange(p.costMin, p.costMax)],
              ["Peças no corte", `${totalPieces} peças`],
            ].map(([k, v]) => (
              <div key={k} className="rounded-lg border border-bark-900/10 bg-white p-3">
                <dt className="text-xs text-bark-600">{k}</dt>
                <dd className="num mt-0.5 font-semibold text-bark-900">{v}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>

      {/* projeto exclusivo: a ficha NÃO está nesta página — vem do servidor depois da senha */}
      {p.locked ? <LockedProject slug={p.slug} /> : <ProjectFull p={p} />}

      {related.length > 0 && (
        <section className="mt-16">
          <h2 className="mb-6 text-2xl">Outros projetos de {label(CATEGORIES, p.category).toLowerCase()}</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((r, i) => (
              <ProjectCard key={r.slug} p={r} index={i} />
            ))}
          </div>
        </section>
      )}
    </article>
  );
}
