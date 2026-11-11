"use client";

// Player próprio: só play/pausa e volume, sem nada do YouTube à vista.
// - o iframe é mais alto que a área visível: a faixa do título (em cima) e a marca (embaixo) ficam cortadas;
// - antes de começar e no fim aparece a capa do vídeo; pausado, uma película escura cobre a tela de pausa;
// - uma camada por cima de tudo bloqueia cliques, então ninguém chega ao YouTube pelo player.
import { useEffect, useRef, useState } from "react";

type YTPlayer = {
  playVideo(): void;
  pauseVideo(): void;
  setVolume(v: number): void;
  mute(): void;
  unMute(): void;
  getCurrentTime(): number;
  getDuration(): number;
  destroy(): void;
};
type YTNamespace = { Player: new (el: HTMLElement, opts: unknown) => YTPlayer; PlayerState: { PLAYING: number; PAUSED: number; ENDED: number } };
declare global {
  interface Window {
    YT?: YTNamespace;
    onYouTubeIframeAPIReady?: () => void;
  }
}

let apiPromise: Promise<YTNamespace> | null = null;
function carregarApi(): Promise<YTNamespace> {
  if (window.YT?.Player) return Promise.resolve(window.YT);
  if (!apiPromise)
    apiPromise = new Promise((resolve) => {
      const anterior = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => {
        anterior?.();
        resolve(window.YT!);
      };
      const s = document.createElement("script");
      s.src = "https://www.youtube.com/iframe_api";
      document.head.appendChild(s);
    });
  return apiPromise;
}

const mmss = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;

export function VideoPlayer({ youtubeId, titulo }: { youtubeId: string; titulo: string }) {
  const host = useRef<HTMLDivElement>(null);
  const player = useRef<YTPlayer | null>(null);
  const [pronto, setPronto] = useState(false);
  const [tocando, setTocando] = useState(false);
  const [volume, setVolume] = useState(80);
  const [mudo, setMudo] = useState(false);
  const [tempo, setTempo] = useState({ t: 0, d: 0 });
  const [fase, setFase] = useState<"inicio" | "tocando" | "pausado" | "fim">("inicio");

  useEffect(() => {
    let vivo = true;
    void carregarApi().then((YT) => {
      if (!vivo || !host.current) return;
      const alvo = document.createElement("div");
      host.current.appendChild(alvo);
      player.current = new YT.Player(alvo, {
        videoId: youtubeId,
        width: "100%",
        height: "100%",
        playerVars: { controls: 0, disablekb: 1, fs: 0, rel: 0, iv_load_policy: 3, modestbranding: 1, playsinline: 1, cc_load_policy: 0 },
        events: {
          onReady: () => {
            player.current?.setVolume(80);
            setPronto(true);
          },
          onStateChange: (e: { data: number }) => {
            setTocando(e.data === YT.PlayerState.PLAYING);
            if (e.data === YT.PlayerState.PLAYING) setFase("tocando");
            else if (e.data === YT.PlayerState.PAUSED) setFase("pausado");
            else if (e.data === YT.PlayerState.ENDED) setFase("fim");
          },
        },
      });
    });
    return () => {
      vivo = false;
      player.current?.destroy();
    };
  }, [youtubeId]);

  useEffect(() => {
    if (!tocando) return;
    const id = setInterval(() => {
      const p = player.current;
      if (p) setTempo({ t: p.getCurrentTime(), d: p.getDuration() });
    }, 500);
    return () => clearInterval(id);
  }, [tocando]);

  const alternar = () => {
    const p = player.current;
    if (!p) return;
    if (tocando) p.pauseVideo();
    else p.playVideo();
  };

  return (
    <div className="min-w-0 overflow-hidden rounded-2xl border border-bark-900/10 bg-black shadow-(--shadow-card) select-none" onContextMenu={(e) => e.preventDefault()}>
      <div className="relative aspect-video overflow-hidden">
        <div ref={host} className="absolute inset-x-0 -top-1/4 -bottom-1/4 [&>iframe]:h-full [&>iframe]:w-full [&_iframe]:pointer-events-none" />
        {(fase === "inicio" || fase === "fim") && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={`https://i.ytimg.com/vi/${youtubeId}/hqdefault.jpg`} alt="" draggable={false} className="absolute inset-0 z-[5] h-full w-full object-cover" />
        )}
        {fase === "pausado" && <div className="absolute inset-0 z-[5] bg-black/85" />}
        {/* camada que bloqueia cliques no player do YouTube */}
        <button type="button" aria-label={tocando ? "Pausar" : "Reproduzir"} onClick={alternar} className="absolute inset-0 z-10 flex items-center justify-center bg-transparent">
          {!tocando && pronto && (
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-leaf-600 text-white shadow-lg">
              <svg viewBox="0 0 24 24" className="ml-1 h-8 w-8" fill="currentColor" aria-hidden>
                <path d="M8 5v14l11-7z" />
              </svg>
            </span>
          )}
        </button>
        {!pronto && <div className="absolute inset-0 z-20 flex items-center justify-center bg-black text-sm text-white/70">Carregando vídeo…</div>}
      </div>
      <div className="flex min-w-0 items-center gap-3 bg-white px-3 py-2.5 text-bark-900 sm:px-4 sm:py-3">
        <button type="button" onClick={alternar} disabled={!pronto} aria-label={tocando ? "Pausar" : "Reproduzir"} className="flex h-10 w-10 items-center justify-center rounded-full bg-leaf-600 text-white disabled:opacity-50">
          {tocando ? (
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden>
              <path d="M7 5h4v14H7zM13 5h4v14h-4z" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" className="ml-0.5 h-5 w-5" fill="currentColor" aria-hidden>
              <path d="M8 5v14l11-7z" />
            </svg>
          )}
        </button>
        <span className="num font-mono text-xs text-bark-500">
          {mmss(tempo.t)} / {tempo.d ? mmss(tempo.d) : "--:--"}
        </span>
        <span className="hidden min-w-0 flex-1 truncate text-sm font-semibold sm:block">{titulo}</span>
        <span className="flex-1 sm:hidden" />
        <button
          type="button"
          aria-label={mudo ? "Ativar som" : "Silenciar"}
          onClick={() => {
            const p = player.current;
            if (!p) return;
            if (mudo) p.unMute();
            else p.mute();
            setMudo(!mudo);
          }}
          className="text-bark-700"
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
            <path d="M4 9h4l5-4v14l-5-4H4z" fill="currentColor" />
            {mudo ? <path d="m17 9 4 6M21 9l-4 6" /> : <path d="M16.5 8.5a5 5 0 0 1 0 7M19 6a8.5 8.5 0 0 1 0 12" />}
          </svg>
        </button>
        <input
          type="range"
          min={0}
          max={100}
          value={mudo ? 0 : volume}
          aria-label="Volume"
          onChange={(e) => {
            const v = Number(e.target.value);
            setVolume(v);
            setMudo(v === 0);
            player.current?.unMute();
            player.current?.setVolume(v);
          }}
          className="w-20 accent-leaf-500 sm:w-28"
        />
      </div>
    </div>
  );
}
