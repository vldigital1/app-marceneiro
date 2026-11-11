import type { Metadata } from "next";
import { AcessoStatus } from "@/components/AcessoStatus";
import { WorkshopView } from "@/components/WorkshopView";
import { getProjects, toCard } from "@/data";

export const metadata: Metadata = { title: "Minha oficina", robots: { index: false } };

export default function MembroPage() {
  // exclusivos: só a quantidade de passos vai para o navegador (o texto fica no servidor)
  const projects = getProjects().map((p) => ({ card: toCard(p), steps: p.locked ? p.assemblySteps.map((_, i) => `Passo ${i + 1} — veja a montagem na ficha do projeto`) : p.assemblySteps }));
  return (
    <div className="container-page py-10">
      <header className="mb-8">
        <h1 className="text-4xl">Minha oficina</h1>
        <p className="mt-2 max-w-2xl text-bark-700">
          Seus projetos sob medida salvos para clientes, os favoritos e os projetos que você está executando, com checklist de montagem. Tudo fica salvo neste navegador — use sempre o mesmo
          aparelho para continuar de onde parou.
        </p>
      </header>
      <div className="mb-8">
        <AcessoStatus />
      </div>
      <WorkshopView projects={projects} />
    </div>
  );
}
