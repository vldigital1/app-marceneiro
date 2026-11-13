"use client";

// Assistente de orçamento por perguntas (sem custo): pergunta uma coisa por vez e monta o orçamento.
// Cada resposta pode ser digitada, escolhida nos botões prontos ou falada (reconhecimento de voz do próprio celular).
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { brl, PAGAMENTOS, type Cliente } from "@/lib/orcamentos";

export type ItemPergunta = { descricao: string; detalhes: string; quantidade: number; valorUnitario: number };
export type RespostasAssistente = {
  cliente: { id?: string; nome: string; telefone: string };
  titulo: string;
  itens: ItemPergunta[];
  prazoDias: number;
  pagamento: string;
  adicional: number;
  descontoPct: number;
};

// ───────── números falados em português ─────────
const UN: Record<string, number> = { zero: 0, um: 1, uma: 1, dois: 2, duas: 2, "três": 3, tres: 3, quatro: 4, cinco: 5, seis: 6, sete: 7, oito: 8, nove: 9, dez: 10, onze: 11, doze: 12, treze: 13, catorze: 14, quatorze: 14, quinze: 15, dezesseis: 16, dezessete: 17, dezoito: 18, dezenove: 19, vinte: 20, trinta: 30, quarenta: 40, cinquenta: 50, sessenta: 60, setenta: 70, oitenta: 80, noventa: 90, cem: 100, cento: 100, duzentos: 200, duzentas: 200, trezentos: 300, quatrocentos: 400, quinhentos: 500, seiscentos: 600, setecentos: 700, oitocentos: 800, novecentos: 900 };

/** "3.800", "R$ 3800,50", "3 mil e 800", "três mil e oitocentos", "1,5 mil" → número */
export function lerValor(txt: string): number {
  const t = txt.toLowerCase().replace(/r\$|reais|real/g, " ").replace(/\s+/g, " ").trim();
  if (!t) return 0;
  // só dígitos com milhar/centavos
  const d = t.match(/^(\d{1,3}(?:\.\d{3})+|\d+)(?:,(\d{1,2}))?$/);
  if (d) return Number(d[1].replace(/\./g, "")) + (d[2] ? Number(`0.${d[2].padEnd(2, "0")}`) : 0);
  let total = 0;
  let parcial = 0;
  for (const p of t.split(/\s+/).filter(Boolean)) {
    if (p === "e") continue;
    if (p === "mil") {
      total += (parcial || 1) * 1000;
      parcial = 0;
      continue;
    }
    const num = /^\d+([.,]\d+)?$/.test(p) ? Number(p.replace(/\.(?=\d{3})/g, "").replace(",", ".")) : UN[p];
    if (num !== undefined) parcial += num;
  }
  return Math.round((total + parcial) * 100) / 100;
}

type Reconhecedor = { lang: string; continuous: boolean; interimResults: boolean; start(): void; stop(): void; onresult: ((ev: { results: ArrayLike<{ 0: { transcript: string } }> }) => void) | null; onerror: (() => void) | null; onend: (() => void) | null };
function criarReconhecedor(): Reconhecedor | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as { SpeechRecognition?: new () => Reconhecedor; webkitSpeechRecognition?: new () => Reconhecedor };
  const C = w.SpeechRecognition ?? w.webkitSpeechRecognition;
  return C ? new C() : null;
}

type Passo = "cliente" | "telefone" | "movel" | "detalhes" | "quantidade" | "valor" | "mais" | "prazo" | "pagamento" | "adicional" | "desconto" | "fim";

const PERGUNTA: Record<Passo, string> = {
  cliente: "Para qual cliente é o orçamento?",
  telefone: "Qual o WhatsApp do cliente? (pode pular)",
  movel: "Qual móvel ou serviço?",
  detalhes: "Medidas, material ou cor? (pode pular)",
  quantidade: "Quantas unidades?",
  valor: "Qual o valor de cada unidade?",
  mais: "Tem mais algum item?",
  prazo: "Qual o prazo de entrega?",
  pagamento: "Qual a forma de pagamento?",
  adicional: "Vai cobrar entrega ou instalação à parte?",
  desconto: "Vai dar algum desconto?",
  fim: "",
};

const MOVEIS = ["Guarda-roupa", "Cozinha planejada", "Armário", "Painel de TV", "Rack", "Cômoda", "Gabinete de banheiro", "Mesa", "Estante", "Closet"];

export function AssistentePerguntas({ clientes, moveisSalvos, aoConcluir }: { clientes: Cliente[]; moveisSalvos: { id: string; nome: string; detalhes: string; valor: number }[]; aoConcluir: (r: RespostasAssistente) => void }) {
  const [aberto, setAberto] = useState(false);
  const [passo, setPasso] = useState<Passo>("cliente");
  const [resp, setResp] = useState<RespostasAssistente>({ cliente: { nome: "", telefone: "" }, titulo: "", itens: [], prazoDias: 0, pagamento: "", adicional: 0, descontoPct: 0 });
  const [item, setItem] = useState<ItemPergunta>({ descricao: "", detalhes: "", quantidade: 1, valorUnitario: 0 });
  const [entrada, setEntrada] = useState("");
  const [ouvindo, setOuvindo] = useState(false);
  const [temVoz, setTemVoz] = useState(false);
  const [historico, setHistorico] = useState<{ p: string; r: string }[]>([]);
  const rec = useRef<Reconhecedor | null>(null);
  const fimRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setTemVoz(Boolean(criarReconhecedor()));
  }, []);
  useEffect(() => {
    fimRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [historico, passo]);

  const reiniciar = () => {
    setPasso("cliente");
    setResp({ cliente: { nome: "", telefone: "" }, titulo: "", itens: [], prazoDias: 0, pagamento: "", adicional: 0, descontoPct: 0 });
    setItem({ descricao: "", detalhes: "", quantidade: 1, valorUnitario: 0 });
    setHistorico([]);
    setEntrada("");
  };

  const falar = () => {
    const r = criarReconhecedor();
    if (!r) return;
    r.lang = "pt-BR";
    r.continuous = false;
    r.interimResults = true;
    r.onresult = (ev) => {
      let t = "";
      for (let i = 0; i < ev.results.length; i++) t += ev.results[i][0].transcript;
      setEntrada(t.trim());
    };
    r.onerror = () => setOuvindo(false);
    r.onend = () => setOuvindo(false);
    rec.current = r;
    try {
      r.start();
      setOuvindo(true);
    } catch {
      setOuvindo(false);
    }
  };

  /** registra a resposta e avança */
  const responder = (valor: string, mostrar = valor) => {
    rec.current?.stop();
    const v = valor.trim();
    setHistorico((h) => [...h, { p: PERGUNTA[passo], r: mostrar || "—" }]);
    setEntrada("");
    switch (passo) {
      case "cliente": {
        const achado = clientes.find((c) => c.nome.toLowerCase() === v.toLowerCase());
        setResp((r) => ({ ...r, cliente: achado ? { id: achado.id, nome: achado.nome, telefone: achado.telefone } : { nome: v.toLowerCase().replace(/(^|\s)(\S)/g, (_, e, c) => e + c.toUpperCase()).replace(/\s(Da|De|Do|Das|Dos|E)\s/g, (m) => m.toLowerCase()), telefone: "" } }));
        setPasso(achado?.telefone ? "movel" : "telefone");
        break;
      }
      case "telefone":
        setResp((r) => ({ ...r, cliente: { ...r.cliente, telefone: v.replace(/\D/g, "") } }));
        setPasso("movel");
        break;
      case "movel":
        setItem({ descricao: v.replace(/^\w/, (c) => c.toUpperCase()), detalhes: "", quantidade: 1, valorUnitario: 0 });
        setPasso("detalhes");
        break;
      case "detalhes":
        setItem((i) => ({ ...i, detalhes: v }));
        setPasso("quantidade");
        break;
      case "quantidade":
        setItem((i) => ({ ...i, quantidade: Math.max(1, Math.round(lerValor(v)) || 1) }));
        setPasso("valor");
        break;
      case "valor": {
        const novo = { ...item, valorUnitario: lerValor(v) };
        setResp((r) => ({ ...r, itens: [...r.itens, novo], titulo: r.titulo || novo.descricao }));
        setPasso("mais");
        break;
      }
      case "mais":
        setPasso(/^s/i.test(v) ? "movel" : "prazo");
        break;
      case "prazo": {
        const n = lerValor(v.replace(/dias?|semanas?|m[eê]s(es)?/gi, ""));
        const dias = /semana/i.test(v) ? n * 7 : /m[eê]s/i.test(v) ? (n || 1) * 30 : n;
        setResp((r) => ({ ...r, prazoDias: Math.round(dias) }));
        setPasso("pagamento");
        break;
      }
      case "pagamento":
        setResp((r) => ({ ...r, pagamento: v }));
        setPasso("adicional");
        break;
      case "adicional":
        setResp((r) => ({ ...r, adicional: /^n[aã]o/i.test(v) ? 0 : lerValor(v) }));
        setPasso("desconto");
        break;
      case "desconto": {
        const final = { ...resp, descontoPct: /^n[aã]o/i.test(v) ? 0 : lerValor(v.replace("%", "")) };
        setResp(final);
        setPasso("fim");
        aoConcluir(final);
        break;
      }
    }
  };

  const opcoes: { rotulo: string; valor: string }[] =
    passo === "cliente"
      ? clientes.slice(0, 6).map((c) => ({ rotulo: c.nome, valor: c.nome }))
      : passo === "movel"
        ? [...moveisSalvos.map((m) => ({ rotulo: `${m.nome} (Sob medida)`, valor: `__salvo:${m.id}` })), ...MOVEIS.map((m) => ({ rotulo: m, valor: m }))]
        : passo === "quantidade"
          ? ["1", "2", "3", "4"].map((n) => ({ rotulo: n, valor: n }))
          : passo === "mais"
            ? [
                { rotulo: "Sim, adicionar outro", valor: "sim" },
                { rotulo: "Não, só isso", valor: "não" },
              ]
            : passo === "prazo"
              ? ["15 dias", "20 dias", "30 dias", "45 dias", "60 dias"].map((n) => ({ rotulo: n, valor: n }))
              : passo === "pagamento"
                ? PAGAMENTOS.map((p) => ({ rotulo: p, valor: p }))
                : passo === "adicional" || passo === "desconto"
                  ? [{ rotulo: "Não", valor: "não" }, ...(passo === "desconto" ? ["5%", "10%"].map((n) => ({ rotulo: n, valor: n })) : [])]
                  : [];

  const pulavel = passo === "telefone" || passo === "detalhes";
  const tipoNumero = passo === "valor" || passo === "adicional" || passo === "quantidade";

  const escolher = (valor: string, rotulo: string) => {
    if (valor.startsWith("__salvo:")) {
      const m = moveisSalvos.find((x) => `__salvo:${x.id}` === valor);
      if (m) {
        setItem({ descricao: m.nome, detalhes: m.detalhes, quantidade: 1, valorUnitario: m.valor });
        setHistorico((h) => [...h, { p: PERGUNTA.movel, r: rotulo }]);
        setPasso("quantidade");
      }
      return;
    }
    responder(valor, rotulo);
  };

  if (!aberto)
    return (
      <button type="button" onClick={() => setAberto(true)} className="flex w-full items-center gap-4 rounded-3xl bg-bark-900 p-5 text-left text-wood-50 shadow-[0_18px_40px_-18px_rgba(36,24,15,0.7)] transition-transform active:scale-[0.99]">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-wood-400 text-bark-950">
          <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12z" />
            <path d="M9 10h6M9 14h4" />
          </svg>
        </span>
        <span>
          <span className="block font-display text-lg leading-tight">Montar orçamento respondendo perguntas</span>
          <span className="mt-0.5 block text-sm text-wood-100/75">Responda digitando, tocando nas opções ou falando. Leva 1 minuto.</span>
        </span>
      </button>
    );

  return (
    <section className="rounded-3xl border border-bark-900/10 bg-white p-4 shadow-[0_8px_30px_-12px_rgba(36,24,15,0.18)] sm:p-5">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="font-display text-lg text-bark-900">Assistente de orçamento</h3>
        <div className="flex gap-3 text-xs font-semibold">
          <button type="button" onClick={reiniciar} className="text-bark-500">
            Recomeçar
          </button>
          <button type="button" onClick={() => setAberto(false)} className="text-bark-500">
            Fechar
          </button>
        </div>
      </div>

      <div className="max-h-80 space-y-2 overflow-y-auto pr-1">
        {historico.map((h, i) => (
          <div key={i} className="space-y-1">
            <p className="max-w-[85%] rounded-2xl rounded-tl-sm bg-wood-100 px-3 py-2 text-sm text-bark-800">{h.p}</p>
            <p className="ml-auto max-w-[85%] rounded-2xl rounded-tr-sm bg-bark-900 px-3 py-2 text-right text-sm text-wood-50">{h.r}</p>
          </div>
        ))}
        <AnimatePresence mode="wait">
          {passo !== "fim" ? (
            <motion.p key={passo + resp.itens.length} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="max-w-[85%] rounded-2xl rounded-tl-sm bg-wood-100 px-3 py-2 text-sm font-semibold text-bark-900">
              {passo === "movel" && resp.itens.length ? "Qual o próximo móvel ou serviço?" : PERGUNTA[passo]}
            </motion.p>
          ) : (
            <motion.div key="fim" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl bg-leaf-50 px-4 py-3 text-sm text-leaf-700 ring-1 ring-leaf-500/30">
              <b>Pronto!</b> Orçamento preenchido com {resp.itens.length} item(ns), total de {brl(resp.itens.reduce((s, i) => s + i.quantidade * i.valorUnitario, 0) * (1 - resp.descontoPct / 100) + resp.adicional)}. Confira abaixo e escolha o modelo.
              <button type="button" onClick={reiniciar} className="mt-2 block text-xs font-semibold text-leaf-700 underline">
                Fazer outro pelo assistente
              </button>
            </motion.div>
          )}
        </AnimatePresence>
        <div ref={fimRef} />
      </div>

      {passo !== "fim" && (
        <>
          {opcoes.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {opcoes.map((o) => (
                <button key={o.valor} type="button" onClick={() => escolher(o.valor, o.rotulo)} className="rounded-full border border-bark-900/15 bg-white px-3 py-1.5 text-sm font-semibold text-bark-800 active:bg-wood-100">
                  {o.rotulo}
                </button>
              ))}
            </div>
          )}
          <form
            className="mt-3 flex gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              if (entrada.trim() || pulavel) responder(entrada, entrada.trim() || "Pular");
            }}
          >
            <div className="relative min-w-0 flex-1">
              {passo === "valor" || passo === "adicional" ? <span className="absolute top-1/2 left-3 -translate-y-1/2 text-sm text-bark-500">R$</span> : null}
              <input
                value={entrada}
                onChange={(e) => setEntrada(e.target.value)}
                inputMode={tipoNumero ? "decimal" : passo === "telefone" ? "tel" : "text"}
                placeholder={ouvindo ? "Ouvindo…" : passo === "valor" ? "Ex.: 3800 ou 3 mil e 800" : "Digite ou fale a resposta"}
                aria-label={PERGUNTA[passo]}
                className={`w-full rounded-2xl border border-bark-900/15 bg-white py-3 pr-3 text-[15px] text-bark-900 focus:border-wood-500 focus:ring-2 focus:ring-wood-200 focus:outline-none ${passo === "valor" || passo === "adicional" ? "pl-9" : "pl-3.5"}`}
              />
            </div>
            {temVoz && (
              <button
                type="button"
                onClick={ouvindo ? () => rec.current?.stop() : falar}
                aria-label={ouvindo ? "Parar de ouvir" : "Responder falando"}
                className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${ouvindo ? "bg-red-600 text-white" : "bg-wood-100 text-bark-800"}`}
              >
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
                  <rect x="9" y="3" width="6" height="11" rx="3" fill="currentColor" />
                  <path d="M5.5 11a6.5 6.5 0 0 0 13 0M12 17.5V21" />
                </svg>
              </button>
            )}
            <button type="submit" className="h-12 shrink-0 rounded-2xl bg-bark-900 px-4 text-sm font-semibold text-white">
              {entrada.trim() ? "OK" : pulavel ? "Pular" : "OK"}
            </button>
          </form>
          {ouvindo && <p className="mt-2 text-xs font-semibold text-red-600">Ouvindo… fale a resposta</p>}
        </>
      )}
    </section>
  );
}
