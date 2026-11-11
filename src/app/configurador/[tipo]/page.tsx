import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Configurator } from "@/components/Configurator";
import { TIPOS, tipoPorId } from "@/lib/configurador";

export const dynamicParams = false;
export function generateStaticParams() {
  return TIPOS.map((t) => ({ tipo: t.id }));
}
export async function generateMetadata({ params }: { params: Promise<{ tipo: string }> }): Promise<Metadata> {
  const t = tipoPorId((await params).tipo);
  return t ? { title: `${t.nome} sob medida`, description: t.descricao } : {};
}

export default async function ConfiguradorTipo({ params }: { params: Promise<{ tipo: string }> }) {
  const t = tipoPorId((await params).tipo);
  if (!t) notFound();
  return (
    <div className="app-wood min-h-screen">
      <div className="container-page max-w-2xl py-6">
        <Link href="/configurador/" className="app-btn-ghost mb-5">
          ← Todos os móveis
        </Link>
        <p className="app-kicker">Projeto dinâmico {t.livre ? "· livre" : "· exclusivo"}</p>
        <h1 className="app-title mt-1 text-5xl">{t.nome}</h1>
        <p className="mt-2 mb-5 text-bark-700">{t.descricao}</p>
        <Configurator tipoId={t.id} />
      </div>
    </div>
  );
}
