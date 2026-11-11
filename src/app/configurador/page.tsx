import type { Metadata } from "next";
import Link from "next/link";
import { withBase } from "@/lib/base";
import { TIPOS } from "@/lib/configurador";

export const metadata: Metadata = {
  title: "Projetos dinâmicos (sob medida)",
  description: "Mude medidas, cores, portas e prateleiras e veja o móvel em 3D com a lista de corte e as ferragens na hora.",
};

export default function ConfiguradorIndex() {
  return (
    <div className="app-wood min-h-screen">
      <div className="container-page max-w-3xl py-8">
        <p className="app-kicker">Projetos dinâmicos</p>
        <h1 className="app-title mt-2 text-5xl">Monte sob medida</h1>
        <p className="mt-3 text-bark-700">
          Digite as medidas do cliente, escolha cores, colunas, portas e prateleiras. O móvel aparece em 3D e a lista de corte, as ferragens e o plano de corte saem
          prontos.
        </p>
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {TIPOS.map((t) => (
            <Link key={t.id} href={`/configurador/${t.id}/`} className="app-card group overflow-hidden transition-transform hover:-translate-y-1">
              <div className="relative aspect-[4/3] bg-white">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={withBase(`/renders/configurador/${t.id}.svg`)} alt="" className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" loading="lazy" />
                <span className={`absolute top-3 left-3 rounded-full px-3 py-1 text-xs font-bold ${t.livre ? "bg-leaf-600 text-white" : "bg-white/90 text-wood-600"}`}>{t.livre ? "Livre" : "🔒 Exclusivo"}</span>
              </div>
              <div className="p-4">
                <h2 className="app-title text-2xl">{t.nome}</h2>
                <p className="mt-1 text-sm text-bark-700">{t.descricao}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
