"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { buscarBloqueado, useAcesso } from "@/lib/acesso";
import { UnlockBox } from "./UnlockBox";
import { VideoPlayer } from "./VideoPlayer";
import { LOJA } from "@/lib/loja";

export type VideoPublico = { id: string; titulo: string; descricao?: string; livre: boolean; youtubeId?: string; tema: string };

/** Lista de vídeos por tema. Os exclusivos só recebem o código do vídeo do servidor, depois da senha. */
export function VideosView({ videos, temas }: { videos: VideoPublico[]; temas: string[] }) {
  const { liberado } = useAcesso();
  const topo = useRef<HTMLDivElement>(null);
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
    <div className="grid grid-cols-[minmax(0,1fr)] gap-5 lg:grid-cols-[minmax(0,1fr)_380px] lg:items-start">
      <div ref={topo} className="min-w-0 scroll-mt-16 space-y-2 lg:sticky lg:top-24">
        {atual &&
          (ytId ? (
            LOJA ? (
              <div className="aspect-video overflow-hidden rounded-2xl border border-bark-900/10 bg-black shadow-(--shadow-card)">
                <iframe
                  key={ytId}
                  src={`https://www.youtube-nocookie.com/embed/${ytId}?rel=0&playsinline=1`}
                  title={atual.titulo}
                  className="h-full w-full"
                  allow="accelerometer; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            ) : (
              <VideoPlayer key={ytId} youtubeId={ytId} titulo={atual.titulo} />
            )
          ) : (
            <UnlockBox titulo="Vídeo exclusivo" />
          ))}
        {atual && (
          <div className="px-1">
            <h2 className="font-display text-xl text-bark-900">{atual.titulo}</h2>
            <p className="mt-1 text-sm text-bark-500">{atual.tema}</p>
          </div>
        )}
      </div>

      <div className="min-w-0">
        <div className="-mx-4 mb-3 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] lg:mx-0 lg:flex-wrap lg:overflow-visible lg:px-0">
          {["Todos", ...temas].map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTema(t)}
              className={`shrink-0 rounded-full border px-3 py-1.5 text-sm font-semibold transition-colors ${tema === t ? "border-wood-500 bg-wood-500 text-white" : "border-bark-900/15 bg-white text-bark-700 hover:bg-wood-100"}`}
            >
              {t}
            </button>
          ))}
        </div>
        <ul className="space-y-2 lg:max-h-[70vh] lg:overflow-y-auto lg:pr-1">
          {lista.map((v) => (
            <li key={v.id}>
              <button
                type="button"
                onClick={() => {
                  setAtual(v);
                  // no celular a lista fica embaixo: sobe até o player
                  if (window.innerWidth < 1024) topo.current?.scrollIntoView({ behavior: "smooth", block: "start" });
                }}
                className={`app-card flex w-full items-center gap-3 p-2 text-left transition-colors hover:bg-wood-50 ${atual?.id === v.id ? "ring-2 ring-wood-400" : ""}`}
              >
                <span className="relative aspect-video w-28 shrink-0 overflow-hidden rounded-lg bg-wood-100">
                  {v.youtubeId ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={`https://i.ytimg.com/vi/${v.youtubeId}/mqdefault.jpg`} alt="" loading="lazy" className="h-full w-full object-cover" draggable={false} />
                  ) : (
                    <span className="flex h-full items-center justify-center bg-gradient-to-br from-wood-200 to-wood-400 text-xl">{liberado ? "▶" : "🔒"}</span>
                  )}
                </span>
                <span className="min-w-0">
                  <span className="line-clamp-2 block text-sm font-semibold text-bark-900">{v.titulo}</span>
                  <span className="mt-0.5 block text-xs text-bark-500">
                    {!v.livre && !liberado && <strong className="text-wood-600">🔒 Exclusivo · </strong>}
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
