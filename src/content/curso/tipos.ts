// Estrutura do curso. Os módulos marcados como `livre: false` só chegam ao navegador
// pelo servidor (api/conteudo.php) depois da senha de desbloqueio.

export type Item = { icone: string; texto: string };

export type Bloco =
  | { t: "lista"; titulo: string; itens: Item[] }
  | { t: "dica"; titulo?: string; texto: string }
  | { t: "texto"; texto: string }
  | { t: "passos"; titulo: string; itens: string[] };

export type Pergunta = { id: string; enunciado: string; opcoes: string[]; correta: number; explicacao: string };

export type Topico = {
  id: string;
  titulo: string;
  icone: string;
  intro: string;
  blocos: Bloco[];
  perguntas: Pergunta[];
  /** id de um vídeo de src/content/videos.ts (opcional) */
  video?: string;
};

export type Modulo = { id: string; numero: number; titulo: string; descricao: string; livre: boolean; topicos: Topico[] };

/** Atalho para escrever tópicos: pergunta(s) recebem id automático. */
export function topico(id: string, t: Omit<Topico, "id" | "perguntas"> & { perguntas: Omit<Pergunta, "id">[] }): Topico {
  return { ...t, id, perguntas: t.perguntas.map((p, i) => ({ ...p, id: `${id}-q${i + 1}` })) };
}
