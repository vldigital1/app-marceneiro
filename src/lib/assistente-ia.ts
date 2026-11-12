// Assistente de orçamento (servidor, Vercel): transforma o que o marceneiro falou em itens de orçamento.
// Usa o Claude com saída em JSON (schema fixo). Precisa da variável ANTHROPIC_API_KEY no projeto da Vercel.
import Anthropic from "@anthropic-ai/sdk";

export type PedidoIA = {
  texto: string;
  clientes: string[]; // nomes já cadastrados (para a IA reconhecer)
};

export type RespostaIA = {
  resumo: string;
  cliente: { nome: string; telefone: string; endereco: string };
  itens: { descricao: string; detalhes: string; quantidade: number; unidade: string; valorUnitario: number }[];
  desconto: { tipo: "%" | "R$" | ""; valor: number };
  adicional: { nome: string; valor: number };
  prazoDias: number;
  pagamento: string;
  observacoes: string;
};

const SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["resumo", "cliente", "itens", "desconto", "adicional", "prazoDias", "pagamento", "observacoes"],
  properties: {
    resumo: { type: "string", description: "Uma frase curta em português confirmando o que foi entendido." },
    cliente: {
      type: "object",
      additionalProperties: false,
      required: ["nome", "telefone", "endereco"],
      properties: { nome: { type: "string" }, telefone: { type: "string" }, endereco: { type: "string" } },
    },
    itens: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["descricao", "detalhes", "quantidade", "unidade", "valorUnitario"],
        properties: {
          descricao: { type: "string" },
          detalhes: { type: "string" },
          quantidade: { type: "number" },
          unidade: { type: "string" },
          valorUnitario: { type: "number" },
        },
      },
    },
    desconto: {
      type: "object",
      additionalProperties: false,
      required: ["tipo", "valor"],
      properties: { tipo: { type: "string", enum: ["%", "R$", ""] }, valor: { type: "number" } },
    },
    adicional: {
      type: "object",
      additionalProperties: false,
      required: ["nome", "valor"],
      properties: { nome: { type: "string" }, valor: { type: "number" } },
    },
    prazoDias: { type: "number" },
    pagamento: { type: "string" },
    observacoes: { type: "string" },
  },
} as const;

const SISTEMA = `Você é o assistente de orçamentos do App do Marceneiro. Um marceneiro brasileiro ditou (por voz, então pode haver erros de transcrição) o que quer no orçamento de um cliente. Extraia os dados para preencher o orçamento.

Regras:
- Cada móvel ou serviço é um item. "descricao" é o nome curto (ex.: "Guarda-roupa 3 portas"); "detalhes" traz medidas, material, cor e acabamento citados (ex.: "2,10 x 1,80 x 0,55 m · MDF branco 18 mm · puxadores pretos").
- Converta medidas faladas para metros ou centímetros de forma legível. Converta valores falados para número (ex.: "mil e quinhentos" = 1500; "dois mil e trezentos e cinquenta" = 2350).
- "valorUnitario" é o preço de UMA unidade. Se o marceneiro falou o total de várias unidades, divida pela quantidade. Se ele não falou preço, use 0.
- "unidade": "un" para móveis, "m²" ou "m" se ele falar assim, "serviço" para mão de obra.
- Frete, entrega, instalação ou montagem cobrados à parte vão em "adicional" (nome + valor), não como item — a não ser que ele diga que é um item.
- Desconto: "%" para porcentagem, "R$" para valor fixo; se não houver, tipo "" e valor 0.
- prazoDias: prazo de entrega em dias corridos (semanas x 7; "um mês" = 30). Se não falou, 0.
- pagamento: forma de pagamento citada, por extenso e curta; se não falou, "".
- cliente: nome, telefone (só números com DDD, se falado) e endereço/bairro; use "" no que não foi dito. Se o nome se parecer com um destes clientes já cadastrados, use exatamente a grafia cadastrada: {{CLIENTES}}.
- observacoes: outras condições ditas (garantia, cor a confirmar, medidas a conferir no local). Se nada, "".
- Não invente itens, valores ou dados que não foram ditos.
- "resumo": uma frase em português, simpática, dizendo o que você preencheu (ex.: "Montei 2 itens para a Maria: guarda-roupa e cômoda, total de R$ 4.300.").`;

export async function interpretarPedido(p: PedidoIA): Promise<RespostaIA> {
  const client = new Anthropic(); // lê ANTHROPIC_API_KEY do ambiente
  const response = await client.beta.messages.create({
    model: "claude-opus-5-5",
    max_tokens: 4000,
    betas: ["server-side-fallback-2026-07-01"],
    fallbacks: "default",
    system: SISTEMA.replace("{{CLIENTES}}", p.clientes.length ? p.clientes.slice(0, 200).join("; ") : "(nenhum)"),
    output_config: { effort: "low", format: { type: "json_schema", schema: SCHEMA } },
    messages: [{ role: "user", content: `Fala do marceneiro:\n"""${p.texto}"""` }],
  });

  if (response.stop_reason === "refusal") throw new Error("A IA não conseguiu processar esse pedido. Tente falar de outro jeito.");
  const texto = response.content.find((b) => b.type === "text");
  if (!texto || texto.type !== "text") throw new Error("A IA não devolveu resposta.");
  const r = JSON.parse(texto.text) as RespostaIA;
  r.itens = (r.itens ?? []).filter((i) => i.descricao?.trim()).slice(0, 40);
  return r;
}
