"use client";

import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { useEffect, useState } from "react";
import type { Bloco, Pergunta, Topico } from "@/content/curso/tipos";
import { buscarBloqueado, useAcesso } from "@/lib/acesso";
import { placar, resumo, usePlacar } from "@/lib/pontos";
import { IconeTile } from "./Icone";
import { UnlockBox } from "./UnlockBox";

export type TopicNav = {
  moduloId: string;
  numero: number;
  moduloTitulo: string;
  indice: number;
  total: number;
  topicos: { id: string; perguntas: string[] }[];
  titulo: string;
  prev: { href: string; titulo: string } | null;
  next: { href: string; titulo: string; outroModulo: boolean } | null;
};

function Quiz({ q }: { q: Pergunta }) {
  const p = usePlacar();
  const ja = p.respostas[q.id];
  const [erradas, setErradas] = useState<number[]>([]);
  const [certa, setCerta] = useState(false);
  const [ganho, setGanho] = useState<number | null>(null);
  const resolvido = certa || Boolean(ja);

  const clicar = (i: number) => {
    if (resolvido || erradas.includes(i)) return;
    if (i === q.correta) {
      setCerta(true);
      const pts = placar.responder(q.id, erradas.length + 1);
      setGanho(pts);
    } else setErradas((e) => [...e, i]);
  };

  return (
    <section className="app-card relative p-4 sm:p-5">
      <p className="app-kicker !text-sky-300">Checagem rápida</p>
      <h3 className="mt-2 text-lg font-bold text-bark-900">{q.enunciado}</h3>
      <div className="mt-3 space-y-2.5">
        {q.opcoes.map((o, i) => {
          const isRight = resolvido && i === q.correta;
          const isWrong = erradas.includes(i);
          return (
            <motion.button
              key={i}
              type="button"
              onClick={() => clicar(i)}
              animate={isWrong ? { x: [0, -6, 6, -3, 0] } : {}}
              transition={{ duration: 0.3 }}
              disabled={resolvido}
              className={`block w-full rounded-xl border px-4 py-3 text-left transition-colors ${
                isRight ? "border-leaf-500 bg-leaf-50 text-bark-900" : isWrong ? "border-red-400 bg-red-50 text-bark-500 line-through" : "border-bark-900/10 bg-wood-50 text-bark-700 hover:border-wood-400/60"
              }`}
            >
              {o}
            </motion.button>
          );
        })}
      </div>
      <AnimatePresence>
        {resolvido && (
          <motion.p initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="mt-3 text-sm text-bark-700">
            <strong className="text-leaf-700">{ja && !certa ? "Já respondida." : erradas.length === 0 ? "Certo!" : "Agora sim!"}</strong> {q.explicacao}
          </motion.p>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {ganho !== null && (
          <motion.span
            key="pts"
            initial={{ opacity: 0, scale: 0.6, y: 0 }}
            animate={{ opacity: 1, scale: 1, y: -6 }}
            exit={{ opacity: 0 }}
            className="absolute top-3 right-3 rounded-full bg-wood-400 px-3 py-1 text-sm font-extrabold text-bark-950 shadow-lg"
          >
            +{ganho} pontos
          </motion.span>
        )}
      </AnimatePresence>
      {ja && !certa && <span className="absolute top-3 right-3 rounded-full bg-wood-100 px-3 py-1 text-xs font-bold text-wood-600">{ja.acertou ? `✓ acertou · ${ja.pontos} pts` : `${ja.pontos} pts`}</span>}
    </section>
  );
}

function BlocoView({ b }: { b: Bloco }) {
  if (b.t === "lista")
    return (
      <section className="app-card p-4 sm:p-5">
        <p className="app-kicker">{b.titulo}</p>
        <ul className="mt-3 space-y-3">
          {b.itens.map((it, i) => (
            <li key={i} className="flex items-start gap-3">
              <IconeTile nome={it.icone} />
              <p className="pt-1 leading-6 text-bark-700">{it.texto}</p>
            </li>
          ))}
        </ul>
      </section>
    );
  if (b.t === "dica")
    return (
      <section className="rounded-2xl border border-bark-900/10 border-l-4 border-l-wood-400 bg-white p-4">
        <p className="app-kicker">{b.titulo ?? "Na oficina"}</p>
        <p className="mt-1.5 leading-6 text-bark-900">{b.texto}</p>
      </section>
    );
  if (b.t === "passos")
    return (
      <section className="app-card p-4 sm:p-5">
        <p className="app-kicker">{b.titulo}</p>
        <ol className="mt-3 space-y-2">
          {b.itens.map((t, i) => (
            <li key={i} className="flex gap-3">
              <span className="num flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-wood-400 font-bold text-bark-950">{i + 1}</span>
              <span className="pt-0.5 text-bark-700">{t}</span>
            </li>
          ))}
        </ol>
      </section>
    );
  return <p className="leading-7 text-bark-700">{b.texto}</p>;
}

export function TopicView({ nav, topico, bloqueadoId }: { nav: TopicNav; topico?: Topico; bloqueadoId?: string }) {
  const acesso = useAcesso();
  const [dados, setDados] = useState<Topico | null>(topico ?? null);
  const [falhou, setFalhou] = useState(false);
  const p = usePlacar();
  const r = resumo(p);

  useEffect(() => {
    if (topico || !bloqueadoId || !acesso.liberado) return;
    let vivo = true;
    void buscarBloqueado<Topico>("aula", bloqueadoId).then((t) => {
      if (!vivo) return;
      if (t) setDados(t);
      else setFalhou(true);
    });
    return () => {
      vivo = false;
    };
  }, [topico, bloqueadoId, acesso.liberado]);

  useEffect(() => {
    if (dados) placar.visto(dados.id);
  }, [dados]);

  const feito = (t: { id: string; perguntas: string[] }) => t.perguntas.every((q) => p.respostas[q]) && (t.perguntas.length > 0 || p.vistos.includes(t.id));

  return (
    <div className="space-y-4">
      {/* cabeçalho: módulo · tópico + barra segmentada */}
      <div>
        <div className="flex items-center justify-between gap-3">
          <p className="app-kicker">
            Módulo {String(nav.numero).padStart(2, "0")} · {nav.moduloTitulo} · Tópico {nav.indice + 1} de {nav.total}
          </p>
          <Link href="/aulas/" className="shrink-0 rounded-full bg-white px-3 py-1 font-mono text-xs font-bold text-wood-600" title="Pontos de hoje">
            ★ {r.hoje} hoje
          </Link>
        </div>
        <div className="mt-2 flex gap-1.5" aria-hidden>
          {nav.topicos.map((t, i) => (
            <span key={t.id} className={`h-1.5 flex-1 rounded-full ${i === nav.indice ? "bg-transparent ring-2 ring-wood-400" : feito(t) ? "bg-leaf-500" : "bg-bark-900/10"}`} />
          ))}
        </div>
      </div>

      <h1 className="app-title text-4xl sm:text-5xl">{nav.titulo}</h1>

      {dados ? (
        <>
          <div className="flex items-center gap-4">
            <IconeTile nome={dados.icone} size="lg" />
            <p className="text-lg leading-7 text-bark-900">{dados.intro}</p>
          </div>
          {dados.blocos.map((b, i) => (
            <BlocoView key={i} b={b} />
          ))}
          {dados.perguntas.map((q) => (
            <Quiz key={q.id} q={q} />
          ))}
        </>
      ) : acesso.carregando ? (
        <div className="app-card h-64 animate-pulse" />
      ) : falhou ? (
        <div className="app-card p-5 text-bark-700">Não foi possível carregar esta aula. Verifique sua internet e recarregue a página.</div>
      ) : (
        <UnlockBox titulo="Aula exclusiva" texto="Este módulo faz parte do app completo. Digite a senha de desbloqueio para liberar todas as aulas e projetos." />
      )}

      <div className="space-y-2 pt-2">
        {nav.next ? (
          <Link href={nav.next.href} className="app-btn w-full py-4 text-lg">
            {nav.next.outroModulo ? "Próximo módulo" : "Próximo tópico"}
          </Link>
        ) : (
          <Link href="/aulas/" className="app-btn w-full py-4 text-lg">
            Concluir o curso
          </Link>
        )}
        {nav.prev && (
          <Link href={nav.prev.href} className="app-btn-ghost">
            Anterior
          </Link>
        )}
      </div>
    </div>
  );
}
