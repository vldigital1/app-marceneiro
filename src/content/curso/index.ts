// Curso completo. Importe só em componentes de servidor e no build:
// o conteúdo dos módulos bloqueados nunca vai para o JavaScript do navegador.
import { modulo3, modulo4, modulo5, modulo6, modulo7 } from "./modulos-exclusivos";
import { modulo1, modulo2 } from "./modulos-livres";
import type { Modulo, Topico } from "./tipos";

export const MODULOS: Modulo[] = [modulo1, modulo2, modulo3, modulo4, modulo5, modulo6, modulo7];

/** Resumo público (títulos e quantidades) — pode ir para o navegador. */
export type ModuloResumo = {
  id: string;
  numero: number;
  titulo: string;
  descricao: string;
  livre: boolean;
  topicos: { id: string; titulo: string; perguntas: string[] }[];
};

export const resumoCurso = (): ModuloResumo[] =>
  MODULOS.map((m) => ({ id: m.id, numero: m.numero, titulo: m.titulo, descricao: m.descricao, livre: m.livre, topicos: m.topicos.map((t) => ({ id: t.id, titulo: t.titulo, perguntas: t.perguntas.map((p) => p.id) })) }));

export function localizar(moduloId: string, topicoId: string) {
  const m = MODULOS.find((x) => x.id === moduloId);
  const i = m?.topicos.findIndex((t) => t.id === topicoId) ?? -1;
  if (!m || i < 0) return null;
  const flat = MODULOS.flatMap((mm) => mm.topicos.map((t) => ({ m: mm, t })));
  const k = flat.findIndex((x) => x.t.id === topicoId);
  const prev = flat[k - 1];
  const next = flat[k + 1];
  return {
    modulo: m,
    topico: m.topicos[i] as Topico,
    indice: i,
    prev: prev ? { href: `/aulas/${prev.m.id}/${prev.t.id}/`, titulo: prev.t.titulo } : null,
    next: next ? { href: `/aulas/${next.m.id}/${next.t.id}/`, titulo: next.t.titulo, outroModulo: next.m.id !== m.id } : null,
  };
}
