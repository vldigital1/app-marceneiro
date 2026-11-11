import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { getPost, getPosts } from "@/data";

export const dynamicParams = false;

export function generateStaticParams() {
  return getPosts().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const p = getPost((await params).slug);
  return p ? { title: p.title, description: p.excerpt } : {};
}

export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  const post = getPost((await params).slug);
  if (!post) notFound();
  const others = getPosts()
    .filter((p) => p.slug !== post.slug)
    .slice(0, 2);

  return (
    <article className="container-page max-w-3xl py-10">
      <Link href="/blog/" className="text-sm font-semibold text-wood-600 hover:underline">
        ← Blog
      </Link>
      <h1 className="mt-4 text-4xl">{post.title}</h1>
      <p className="mt-3 text-lg text-bark-700">{post.excerpt}</p>
      <p className="mt-3 text-xs text-bark-600">
        {new Date(`${post.publishedAt}T12:00:00`).toLocaleDateString("pt-BR", { day: "numeric", month: "long", year: "numeric" })} · {post.readingMinutes} min
      </p>
      <div className="prose-post mt-8">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{post.content}</ReactMarkdown>
      </div>
      <aside className="mt-14 rounded-xl bg-wood-100 p-6">
        <p className="font-display text-xl font-bold">Coloque em prática</p>
        <p className="mt-1 text-sm text-bark-700">Todos os projetos do catálogo trazem lista de corte e montagem passo a passo.</p>
        <Link href="/catalogo/" className="btn-cta mt-4">
          Ver projetos
        </Link>
      </aside>
      {others.length > 0 && (
        <nav className="mt-10 grid gap-4 sm:grid-cols-2" aria-label="Outros posts">
          {others.map((o) => (
            <Link key={o.slug} href={`/blog/${o.slug}/`} className="card p-4 hover:shadow-(--shadow-lift)">
              <p className="text-xs text-bark-600">Leia também</p>
              <p className="mt-1 font-semibold">{o.title}</p>
            </Link>
          ))}
        </nav>
      )}
    </article>
  );
}
