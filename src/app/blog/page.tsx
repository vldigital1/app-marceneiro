import type { Metadata } from "next";
import Link from "next/link";
import { getPosts } from "@/data";

export const metadata: Metadata = {
  title: "Blog de técnicas de marcenaria",
  description: "Técnicas, ferramentas, acabamento e dicas para vender peças de marcenaria.",
};

export default function BlogPage() {
  const posts = getPosts();
  return (
    <div className="container-page py-10">
      <header className="mb-10 max-w-2xl">
        <h1 className="text-4xl">Blog</h1>
        <p className="mt-2 text-bark-700">Técnica direta ao ponto, para quem está com a serragem no chão.</p>
      </header>
      <div className="grid gap-6 md:grid-cols-2">
        {posts.map((p) => (
          <Link key={p.slug} href={`/blog/${p.slug}/`} className="card group p-6 transition hover:-translate-y-0.5 hover:shadow-(--shadow-lift)">
            <div className="flex flex-wrap gap-2">
              {p.tags.map((t) => (
                <span key={t} className="chip border-wood-400/40 bg-wood-100 text-wood-600">
                  {t}
                </span>
              ))}
            </div>
            <h2 className="mt-3 text-2xl group-hover:text-wood-600">{p.title}</h2>
            <p className="mt-2 text-bark-700">{p.excerpt}</p>
            <p className="mt-4 text-xs text-bark-600">
              {new Date(`${p.publishedAt}T12:00:00`).toLocaleDateString("pt-BR", { day: "numeric", month: "long", year: "numeric" })} · {p.readingMinutes} min de leitura
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
