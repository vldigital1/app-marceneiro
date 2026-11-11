import type { Metadata } from "next";
import Link from "next/link";
import { Counter } from "@/components/Counter";
import { Faq } from "@/components/Faq";
import { PixCard } from "@/components/PixCard";
import { benefits, faq, guaranteeDays, testimonials } from "@/content/oferta";
import { getCards, getStats } from "@/data";
import { CATEGORIES, label } from "@/lib/taxonomy";

export const metadata: Metadata = {
  title: "Acesso ao catálogo de projetos",
  description: "Projetos de marcenaria em PDF com lista de corte, plano de corte na chapa e montagem passo a passo.",
};

/** Mockup de PDF em CSS: mostra como a ficha sai impressa, sem usar imagem externa. */
function PdfMockup({ title, img, className = "" }: { title: string; img?: string; className?: string }) {
  return (
    <div className={`w-56 rounded-md bg-white p-3 shadow-(--shadow-lift) ring-1 ring-black/5 ${className}`}>
      <div className="rounded-sm bg-bark-900 px-2 py-1.5">
        <p className="truncate font-display text-[10px] font-bold text-wood-300">{title}</p>
      </div>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      {img && <img src={img} alt="" className="my-2 aspect-[4/3] w-full rounded-sm object-cover" />}
      <div className="space-y-1">
        {[100, 92, 96, 70].map((wd, i) => (
          <div key={i} className="h-1.5 rounded bg-wood-200" style={{ width: `${wd}%` }} />
        ))}
      </div>
      <div className="mt-2 grid grid-cols-4 gap-0.5">
        {Array.from({ length: 16 }, (_, i) => (
          <div key={i} className={`h-1.5 ${i < 4 ? "bg-wood-300" : "bg-wood-100"}`} />
        ))}
      </div>
    </div>
  );
}

export default function OfertaPage() {
  const stats = getStats();
  const cards = getCards();
  const gallery = cards.filter((c) => c.featured).slice(0, 8);
  const [a, b, c] = gallery;

  return (
    <>
      {/* HERO */}
      <section className="wood-grain overflow-hidden text-wood-50">
        <div className="container-page grid items-center gap-12 py-16 md:grid-cols-2 md:py-24">
          <div>
            <p className="mb-3 text-sm font-semibold tracking-widest text-wood-300 uppercase">Catálogo de projetos de marcenaria</p>
            <h1 className="text-4xl sm:text-5xl">Pare de adivinhar medidas. Comece a cortar com plano.</h1>
            <p className="mt-5 text-lg text-wood-100/85">
              {stats.projects} projetos com lista de material, lista de corte otimizada para a chapa de 2750 × 1830 mm e montagem passo a passo — em PDF, prontos para a
              bancada.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a href="#pix" className="btn-cta px-7 py-3 text-base">
                Quero acesso agora
              </a>
              <Link href="/catalogo/" className="btn border border-wood-300/40 px-7 py-3 text-base text-wood-50 hover:bg-white/10">
                Ver os projetos
              </Link>
            </div>
            <p className="mt-4 text-sm text-wood-100/70">✓ Pagamento via PIX · ✓ Senha enviada pelo WhatsApp · ✓ Garantia de {guaranteeDays} dias</p>
          </div>
          {a && b && c && (
            <div className="relative mx-auto h-80 w-full max-w-md">
              <PdfMockup title={b.title} img={b.images[0]} className="absolute top-6 left-0 -rotate-6" />
              <PdfMockup title={c.title} img={c.images[0]} className="absolute top-2 right-0 rotate-6" />
              <PdfMockup title={a.title} img={a.images[0]} className="absolute top-12 left-1/2 -translate-x-1/2" />
            </div>
          )}
        </div>
      </section>

      {/* PROVA SOCIAL */}
      <section className="border-b border-bark-900/10 bg-wood-100">
        <div className="container-page grid grid-cols-3 gap-4 py-10 text-center">
          {[
            [stats.projects, "projetos completos"],
            [stats.pieces, "peças com medida calculada"],
            [stats.categories, "categorias"],
          ].map(([n, l]) => (
            <div key={String(l)}>
              <p className="font-display text-4xl font-bold">
                <Counter to={Number(n)} prefix="+" />
              </p>
              <p className="text-sm text-bark-700">{l}</p>
            </div>
          ))}
        </div>
      </section>

      {testimonials.length > 0 && (
        <section className="container-page py-16">
          <h2 className="mb-8 text-center text-3xl">Quem já está usando</h2>
          <div className="grid gap-6 md:grid-cols-3">
            {testimonials.map((t) => (
              <figure key={t.name} className="card p-6">
                <blockquote className="text-bark-800">“{t.text}”</blockquote>
                <figcaption className="mt-4 text-sm">
                  <strong>{t.name}</strong> · {t.city}
                  {t.project && <span className="block text-xs text-bark-600">Fez: {t.project}</span>}
                </figcaption>
              </figure>
            ))}
          </div>
        </section>
      )}

      {/* GALERIA */}
      <section className="container-page py-16">
        <h2 className="text-center text-3xl">Alguns projetos do catálogo</h2>
        <p className="mx-auto mt-2 max-w-xl text-center text-bark-700">De peças de fim de semana a móveis completos em MDF.</p>
        <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">
          {gallery.map((p) => (
            <Link key={p.slug} href={`/projetos/${p.slug}/`} className="group card overflow-hidden">
              <div className="aspect-square bg-gradient-to-br from-wood-100 to-wood-200/70">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p.images[0]} alt={p.title} loading="lazy" className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
              </div>
              <div className="p-3">
                <p className="text-sm font-semibold">{p.title}</p>
                <p className="text-xs text-bark-600">{label(CATEGORIES, p.category)}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* BENEFÍCIOS */}
      <section className="bg-white py-16">
        <div className="container-page">
          <h2 className="text-center text-3xl">O que vem em cada projeto</h2>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {benefits.map((b) => (
              <div key={b.title} className="rounded-xl border border-bark-900/10 bg-paper p-6">
                <span className="text-3xl" aria-hidden>
                  {b.icon}
                </span>
                <h3 className="mt-3 text-xl">{b.title}</h3>
                <p className="mt-2 text-sm leading-6 text-bark-700">{b.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PAGAMENTO PIX */}
      <section id="pix" className="container-page scroll-mt-20 py-16">
        <h2 className="text-center text-3xl">Libere o app completo</h2>
        <p className="mx-auto mt-2 max-w-xl text-center text-bark-700">Pagamento via PIX. Você recebe a senha de desbloqueio no WhatsApp e libera todas as aulas e todos os projetos.</p>
        <div className="mx-auto mt-10 max-w-4xl">
          <PixCard />
        </div>
      </section>

      {/* GARANTIA */}
      <section className="container-page pb-16">
        <div className="mx-auto flex max-w-3xl flex-col items-center gap-6 rounded-2xl border-2 border-dashed border-wood-400 bg-wood-50 p-8 text-center sm:flex-row sm:text-left">
          <div className="flex h-24 w-24 shrink-0 flex-col items-center justify-center rounded-full bg-bark-900 text-wood-300">
            <span className="font-display text-3xl leading-none font-bold">{guaranteeDays}</span>
            <span className="text-xs">dias</span>
          </div>
          <div>
            <h2 className="text-2xl">Garantia incondicional de {guaranteeDays} dias</h2>
            <p className="mt-2 text-bark-700">Baixe, leia, vá para a oficina. Se não for o que você esperava, peça o reembolso dentro do prazo e devolvemos 100% do valor.</p>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="container-page max-w-3xl pb-8">
        <h2 className="mb-6 text-center text-3xl">Perguntas frequentes</h2>
        <Faq items={faq} />
      </section>

      <section className="container-page pt-12">
        <div className="wood-grain rounded-2xl p-10 text-center text-wood-50">
          <h2 className="text-3xl">Seu próximo móvel começa com a lista de corte certa.</h2>
          <a href="#pix" className="btn-cta mt-6 px-8 py-3 text-base">
            Quero acesso
          </a>
        </div>
      </section>
    </>
  );
}
