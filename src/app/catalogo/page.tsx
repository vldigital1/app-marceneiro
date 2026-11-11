import type { Metadata } from "next";
import { Suspense } from "react";
import { CatalogView } from "@/components/CatalogView";
import { GridSkeleton } from "@/components/Skeletons";
import { getCards } from "@/data";

export const metadata: Metadata = {
  title: "Catálogo de projetos",
  description: "Projetos de marcenaria com lista de corte, materiais e montagem. Filtre por categoria, material, nível e ambiente.",
};

export default function CatalogoPage() {
  const items = getCards();
  return (
    <div className="container-page py-6 lg:py-10">
      <header className="mb-5 lg:mb-8">
        <h1 className="text-3xl lg:text-4xl">Catálogo de projetos</h1>
        <p className="mt-2 max-w-2xl text-bark-700">
          Cada ficha traz medidas finais, lista de material com perda, lista de corte com sentido do veio, ferragens e montagem passo a passo.
        </p>
      </header>
      {/* os filtros leem a URL no navegador; o skeleton aparece enquanto isso carrega */}
      <Suspense
        fallback={
          <div className="grid gap-8 lg:grid-cols-[250px_1fr]">
            <div className="hidden space-y-4 lg:block">
              {Array.from({ length: 5 }, (_, i) => (
                <div key={i} className="h-14 animate-pulse rounded-lg bg-wood-100" />
              ))}
            </div>
            <GridSkeleton />
          </div>
        }
      >
        <CatalogView items={items} />
      </Suspense>
    </div>
  );
}
