"use client";

// Pontuação do curso: cada pergunta vale 10 pontos se acertar de primeira,
// 5 na segunda tentativa e 2 depois disso. Tudo fica salvo neste aparelho.
import { useSyncExternalStore } from "react";

export type Resposta = { acertou: boolean; tentativas: number; pontos: number; dia: string };
export type Placar = { respostas: Record<string, Resposta>; dias: Record<string, number>; vistos: string[] };

const KEY = "app-marceneiro:pontos:v1";
const VAZIO: Placar = { respostas: {}, dias: {}, vistos: [] };
const ouvintes = new Set<() => void>();
let snap: Placar | null = null;

export const hoje = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

function ler(): Placar {
  if (snap) return snap;
  try {
    const p = JSON.parse(localStorage.getItem(KEY) ?? "null") as Partial<Placar> | null;
    snap = { respostas: p?.respostas ?? {}, dias: p?.dias ?? {}, vistos: p?.vistos ?? [] };
  } catch {
    snap = VAZIO;
  }
  return snap;
}
function gravar(p: Placar) {
  snap = p;
  try {
    localStorage.setItem(KEY, JSON.stringify(p));
  } catch {
    /* sem armazenamento: só na memória */
  }
  ouvintes.forEach((l) => l());
}
function sub(cb: () => void) {
  ouvintes.add(cb);
  return () => ouvintes.delete(cb);
}

export function usePlacar() {
  return useSyncExternalStore(sub, ler, () => VAZIO);
}

export const PONTOS = [10, 5, 2] as const;

export const placar = {
  /** Registra o resultado final de uma pergunta (chamado quando a pessoa acerta). */
  responder(qid: string, tentativas: number) {
    const p = ler();
    if (p.respostas[qid]) return 0; // pontos só na primeira vez
    const pts = PONTOS[Math.min(tentativas - 1, 2)];
    const dia = hoje();
    gravar({ ...p, respostas: { ...p.respostas, [qid]: { acertou: tentativas === 1, tentativas, pontos: pts, dia } }, dias: { ...p.dias, [dia]: (p.dias[dia] ?? 0) + pts } });
    return pts;
  },
  visto(topicoId: string) {
    const p = ler();
    if (p.vistos.includes(topicoId)) return;
    gravar({ ...p, vistos: [...p.vistos, topicoId] });
  },
  zerar() {
    gravar(VAZIO);
  },
};

export function resumo(p: Placar) {
  const r = Object.values(p.respostas);
  return {
    total: r.reduce((s, x) => s + x.pontos, 0),
    hoje: p.dias[hoje()] ?? 0,
    acertos: r.filter((x) => x.acertou).length,
    erros: r.filter((x) => !x.acertou).length,
    respondidas: r.length,
  };
}
