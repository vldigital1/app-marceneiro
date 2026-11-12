import type { Metadata } from "next";
import { VideosView } from "@/components/VideosView";
import { TEMAS, VIDEOS } from "@/content/videos";
import { LOJA } from "@/lib/loja";
import { notFound } from "next/navigation";

export const metadata: Metadata = { title: "Vídeos de marcenaria" };

export default function VideosPage() {
  if (LOJA) notFound(); // a versão da Play Store não tem vídeos
  // códigos de vídeos exclusivos não vão para a página: o servidor entrega depois da senha
  const lista = VIDEOS.map((v) => ({ id: v.id, titulo: v.titulo, descricao: v.descricao, livre: v.livre, tema: v.tema, youtubeId: v.livre ? v.youtubeId : undefined }));
  const temas = TEMAS.filter((t) => VIDEOS.some((v) => v.tema === t));
  return (
    <div className="container-page py-10">
      <header className="mb-6">
        <h1 className="text-4xl">Vídeos de marcenaria</h1>
        <p className="mt-2 max-w-2xl text-bark-700">Encaixes, ferramentas caseiras e projetos que vendem, separados por tema. Toque num vídeo da lista para assistir.</p>
      </header>
      <VideosView videos={lista} temas={[...temas]} />
    </div>
  );
}
