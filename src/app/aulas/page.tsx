import type { Metadata } from "next";
import { AulasHome } from "@/components/AulasHome";
import { resumoCurso } from "@/content/curso";

export const metadata: Metadata = { title: "Aulas", description: "Curso de marcenaria em módulos curtos, com perguntas de checagem e pontos." };

export default function AulasPage() {
  return (
    <div className="app-wood min-h-screen">
      <div className="container-page max-w-2xl py-8">
        <p className="app-kicker">Curso</p>
        <h1 className="app-title mt-2 text-5xl">Aulas do marceneiro</h1>
        <p className="mt-3 mb-6 text-bark-700">Tópicos curtos, direto ao ponto, com uma checagem rápida no fim de cada um. Cada acerto soma pontos no seu placar do dia.</p>
        <AulasHome modulos={resumoCurso()} />
      </div>
    </div>
  );
}
