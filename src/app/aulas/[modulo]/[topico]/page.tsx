import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { TopicView } from "@/components/TopicView";
import { MODULOS, localizar } from "@/content/curso";

export const dynamicParams = false;

export function generateStaticParams() {
  return MODULOS.flatMap((m) => m.topicos.map((t) => ({ modulo: m.id, topico: t.id })));
}

type P = { params: Promise<{ modulo: string; topico: string }> };

export async function generateMetadata({ params }: P): Promise<Metadata> {
  const { modulo, topico } = await params;
  const l = localizar(modulo, topico);
  return l ? { title: `${l.topico.titulo} — Módulo ${l.modulo.numero}` } : {};
}

export default async function TopicoPage({ params }: P) {
  const { modulo, topico } = await params;
  const l = localizar(modulo, topico);
  if (!l) notFound();
  const nav = {
    moduloId: l.modulo.id,
    numero: l.modulo.numero,
    moduloTitulo: l.modulo.titulo,
    indice: l.indice,
    total: l.modulo.topicos.length,
    topicos: l.modulo.topicos.map((t) => ({ id: t.id, perguntas: t.perguntas.map((q) => q.id) })),
    titulo: l.topico.titulo,
    prev: l.prev,
    next: l.next,
  };
  return (
    <div className="app-wood min-h-screen">
      <div className="container-page max-w-2xl py-6">
        {/* módulos exclusivos: o conteúdo NÃO vai no HTML; vem do servidor depois da senha */}
        {l.modulo.livre ? <TopicView nav={nav} topico={l.topico} /> : <TopicView nav={nav} bloqueadoId={l.topico.id} />}
      </div>
    </div>
  );
}
