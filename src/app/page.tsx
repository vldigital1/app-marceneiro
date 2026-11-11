import Link from "next/link";
import { Counter } from "@/components/Counter";
import { ProjectCard } from "@/components/ProjectCard";
import { SearchBox } from "@/components/SearchBox";
import { SeloSabado } from "@/components/SeloSabado";
import { getCards, getPosts, getStats } from "@/data";
import { withBase } from "@/lib/base";
import { CATEGORIES } from "@/lib/taxonomy";

const CAT_ICON: Record<string, string> = {
  quarto: "🛏️",
  sala: "🛋️",
  entrada: "🚪",
  cozinha: "🍳",
  banheiro: "🚿",
  organizacao: "🗂️",
  prateleiras: "📚",
  jardim: "🌿",
  pallet: "🪵",
  adega: "🍷",
  oficina: "🛠️",
  pet: "🐾",
  infantil: "🧸",
  decoracao: "🖼️",
};

export default function Home() {
  const cards = getCards();
  const featured = cards.filter((c) => c.featured).slice(0, 6);
  const stats = getStats();
  const posts = getPosts().slice(0, 3);
  const heroImg = cards.find((c) => c.slug === "guarda-roupa-5-portas-4-gavetas")?.images[0] ?? featured[0]?.images[0];
  const countByCat = cards.reduce<Record<string, number>>((acc, c) => ((acc[c.category] = (acc[c.category] ?? 0) + 1), acc), {});

  return (
    <>
      {/* HERO */}
      <section className="wood-grain relative overflow-hidden text-wood-50">
        <div className="container-page grid items-center gap-10 py-16 md:grid-cols-[1.2fr_1fr] md:py-24">
          <div>
            <p className="mb-3 text-sm font-semibold tracking-widest text-wood-300 uppercase">Projetos prontos para executar</p>
            <h1 className="text-4xl leading-tight sm:text-5xl">
              Chegue na oficina com a <span className="text-wood-300">lista de corte</span> na mão.
            </h1>
            <p className="mt-5 max-w-xl text-lg text-wood-100/85">
              Medidas, material, plano de corte para chapa 2750 × 1830 mm e passo a passo de montagem. Sem enrolação, direto ao que você precisa para
              serrar.
            </p>
            <div className="mt-8">
              <SearchBox />
            </div>
            <div className="mt-6 flex flex-wrap gap-2 text-sm">
              {["Sapateira", "Rack", "Horta vertical", "Pallet", "Guarda-roupa"].map((t) => (
                <Link key={t} href={`/catalogo/?q=${encodeURIComponent(t)}`} className="rounded-full border border-wood-300/30 px-3 py-1 text-wood-100/85 hover:bg-white/10">
                  {t}
                </Link>
              ))}
            </div>
          </div>
          <div className="relative hidden md:block">
            <div className="absolute inset-6 rounded-full bg-wood-400/10 blur-3xl" />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={heroImg} alt="Render 3D de um guarda-roupa do catálogo" className="relative mx-auto w-full max-w-lg rounded-2xl shadow-2xl ring-1 ring-white/10" />
          </div>
        </div>
      </section>

      {/* NÚMEROS */}
      <section className="border-b border-bark-900/10 bg-wood-100">
        <div className="container-page grid grid-cols-3 gap-4 py-8 text-center">
          {[
            { n: stats.projects, s: "", l: "projetos completos" },
            { n: stats.pieces, s: "", l: "peças já calculadas" },
            { n: stats.categories, s: "", l: "categorias" },
          ].map((x) => (
            <div key={x.l}>
              <p className="font-display text-3xl font-bold text-bark-900 sm:text-4xl">
                <Counter to={x.n} prefix="+" suffix={x.s} />
              </p>
              <p className="mt-1 text-xs text-bark-700 sm:text-sm">{x.l}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="container-page pt-6">
        <SeloSabado />
      </div>

      {/* O APP */}
      <section className="border-b border-bark-900/10 bg-wood-100">
        <div className="container-page grid gap-4 py-12 md:grid-cols-3">
          {[
            { href: "/configurador/", kicker: "Projetos dinâmicos", titulo: "Monte sob medida", texto: "Mude medidas, cores, portas e prateleiras e veja o móvel em 3D com lista de corte e ferragens na hora." },
            { href: "/aulas/", kicker: "Curso com pontos", titulo: "Aulas do marceneiro", texto: "7 módulos curtos com checagem rápida no fim de cada tópico. Cada acerto soma pontos no seu placar do dia." },
            { href: "/oferta/#pix", kicker: "App completo", titulo: "Desbloqueie tudo", texto: "Pague via PIX, receba a senha no WhatsApp e libere todas as aulas, projetos exclusivos e PDFs." },
          ].map((c) => (
            <Link key={c.href} href={c.href} className="app-card group p-6 transition-transform hover:-translate-y-1">
              <p className="app-kicker">{c.kicker}</p>
              <h2 className="app-title mt-2 text-3xl text-bark-900">{c.titulo}</h2>
              <p className="mt-2 text-sm text-bark-700">{c.texto}</p>
              <span className="mt-4 inline-block font-semibold text-wood-600 group-hover:underline">Abrir →</span>
            </Link>
          ))}
        </div>
      </section>

      {/* DESTAQUES */}
      <section className="container-page py-16">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <h2 className="text-3xl">Projetos em destaque</h2>
            <p className="mt-2 text-bark-700">Do primeiro caixote ao guarda-roupa de casal.</p>
          </div>
          <Link href="/catalogo/" className="hidden text-sm font-semibold text-wood-600 hover:underline sm:block">
            Ver catálogo completo →
          </Link>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((p, i) => (
            <ProjectCard key={p.slug} p={p} index={i} />
          ))}
        </div>
      </section>

      {/* CATEGORIAS */}
      <section className="bg-white py-16">
        <div className="container-page">
          <h2 className="mb-8 text-3xl">Explore por categoria</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {Object.entries(CATEGORIES)
              .filter(([k]) => countByCat[k])
              .map(([k, v]) => (
                <Link
                  key={k}
                  href={`/catalogo/?categoria=${k}`}
                  className="group flex items-center gap-3 rounded-xl border border-bark-900/10 bg-paper p-4 transition hover:-translate-y-0.5 hover:border-wood-400 hover:shadow-(--shadow-card)"
                >
                  <span className="text-2xl" aria-hidden>
                    {CAT_ICON[k]}
                  </span>
                  <span>
                    <span className="block text-sm font-semibold text-bark-900 group-hover:text-wood-600">{v}</span>
                    <span className="text-xs text-bark-600">{countByCat[k]} projetos</span>
                  </span>
                </Link>
              ))}
          </div>
        </div>
      </section>

      {/* CALCULADORA */}
      <section className="container-page py-16">
        <div className="card grid items-center gap-8 overflow-hidden p-8 md:grid-cols-2">
          <div>
            <p className="mb-2 text-sm font-semibold tracking-widest text-wood-600 uppercase">Ferramenta grátis</p>
            <h2 className="text-3xl">Plano de corte otimizado</h2>
            <p className="mt-3 text-bark-700">
              Informe as peças e veja o melhor arranjo na chapa de 2750 × 1830 mm, com desconto da espessura da serra e porcentagem de
              aproveitamento. Funciona com qualquer projeto do catálogo.
            </p>
            <a href={withBase("/plano-de-corte/")} className="btn-cta mt-6">
              Abrir plano de corte
            </a>
          </div>
          <svg viewBox="0 0 275 183" className="w-full rounded-lg border border-bark-900/10 bg-wood-50" aria-hidden>
            {[
              [4, 4, 120, 52],
              [4, 60, 120, 52],
              [128, 4, 80, 108],
              [212, 4, 59, 70],
              [4, 116, 90, 63],
              [98, 116, 110, 30],
              [98, 150, 110, 29],
              [212, 78, 59, 50],
            ].map(([x, y, w, h], i) => (
              <rect key={i} x={x} y={y} width={w} height={h} rx="2" fill={["#e8bf82", "#dcb883", "#cd9a54", "#ead5b3"][i % 4]} stroke="#9a6528" strokeWidth="0.8" />
            ))}
          </svg>
        </div>
      </section>

      {/* BLOG */}
      <section className="container-page pb-4">
        <div className="mb-6 flex items-end justify-between">
          <h2 className="text-3xl">Técnicas no blog</h2>
          <Link href="/blog/" className="text-sm font-semibold text-wood-600 hover:underline">
            Todos os posts →
          </Link>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {posts.map((p) => (
            <Link key={p.slug} href={`/blog/${p.slug}/`} className="card p-5 transition hover:-translate-y-0.5 hover:shadow-(--shadow-lift)">
              <p className="text-xs font-semibold text-wood-600 uppercase">{p.tags[0]}</p>
              <h3 className="mt-2 text-lg">{p.title}</h3>
              <p className="mt-2 line-clamp-3 text-sm text-bark-700">{p.excerpt}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="container-page pt-16">
        <div className="wood-grain rounded-2xl p-10 text-center text-wood-50">
          <h2 className="text-3xl">Todos os projetos em PDF, para imprimir e levar para a oficina</h2>
          <p className="mx-auto mt-3 max-w-2xl text-wood-100/80">Acesso a todo o catálogo, às atualizações e ao plano de corte.</p>
          <Link href="/oferta/" className="btn-cta mt-6 px-8 py-3 text-base">
            Liberar o app completo
          </Link>
        </div>
      </section>
    </>
  );
}
