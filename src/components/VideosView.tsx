"use client";

import { useEffect, useMemo, useState } from "react";
import { buscarBloqueado, useAcesso } from "@/lib/acesso";
import { UnlockBox } from "./UnlockBox";
import { VideoPlayer } from "./VideoPlayer";

export type VideoPublico = { id: string; titulo: string; descricao?: string; livre: boolean; youtubeId?: string; tema: string };

/** Lista de vídeos por tema. Os exclusivos só recebem o código do vídeo do servidor, depois da senha. */
export function VideosView({ videos, temas }: { videos: VideoPublico[]; temas: string[] }) {
  const { liberado } = useAcesso();
  const [tema, setTema] = useState<string>("Todos");
  const lista = useMemo(() => (tema === "Todos" ? videos : videos.filter((v) => v.tema === tema)), [videos, tema]);
  const [atual, setAtual] = useState<VideoPublico | null>(videos[0] ?? null);
  const [ytId, setYtId] = useState<string | null>(videos[0]?.youtubeId ?? null);

  useEffect(() => {
    if (!atual) return;
    if (atual.youtubeId) return setYtId(atual.youtubeId);
    setYtId(null);
    if (!liberado) return;
    void buscarBloqueado<{ youtubeId: string }>("video", atual.id).then((v) => setYtId(v?.youtubeId ?? null));
  }, [atual, liberado]);

  if (!videos.length)
    return (
      <div className="app-card p-6 text-center">
        <p className="app-title text-3xl">Vídeos em breve</p>
        <p className="mt-2 text-bark-700">Os vídeos aparecem aqui assim que forem publicados.</p>
      </div>
    );

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_380px] lg:items-start">
      <div className="space-y-2 lg:sticky lg:top-24">
        {atual && (ytId ? <VideoPlayer key={ytId} youtubeId={ytId} titulo={atual.titulo} /> : <UnlockBox titulo="Vídeo exclusivo" />)}
        {atual && (
          <div className="px-1">
            <h2 className="font-display text-xl text-bark-900">{atual.titulo}</h2>
            <p className="mt-1 text-sm text-bark-500">{atual.tema}</p>
          </div>
        )}
      </div>

      <div>
        <div className="mb-3 flex flex-wrap gap-2">
          {["Todos", ...temas].map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTema(t)}
              className={`rounded-full border px-3 py-1.5 text-sm font-semibold transition-colors ${tema === t ? "border-wood-500 bg-wood-500 text-white" : "border-bark-900/15 bg-white text-bark-700 hover:bg-wood-100"}`}
            >
              {t}
            </button>
          ))}
        </div>
        <ul className="max-h-[70vh] space-y-2 overflow-y-auto pr-1">
          {lista.map((v) => (
            <li key={v.id}>
              <button
                type="button"
                onClick={() => setAtual(v)}
                className={`app-card flex w-full items-center gap-3 p-2 text-left transition-colors hover:bg-wood-50 ${atual?.id === v.id ? "ring-2 ring-wood-400" : ""}`}
              >
                <span className="relative aspect-video w-28 shrink-0 overflow-hidden rounded-lg bg-wood-100">
                  {v.youtubeId ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={`https://i.ytimg.com/vi/${v.youtubeId}/mqdefault.jpg`} alt="" loading="lazy" className="h-full w-full object-cover" draggable={false} />
                  ) : (
                    <span className="flex h-full items-center justify-center text-lg">{liberado ? "▶" : "🔒"}</span>
                  )}
                </span>
                <span className="min-w-0">
                  <span className="line-clamp-2 block text-sm font-semibold text-bark-900">{v.titulo}</span>
                  <span className="mt-0.5 block text-xs text-bark-500">
                    {v.tema}
                  </span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
