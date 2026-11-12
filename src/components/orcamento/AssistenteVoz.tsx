"use client";

// Assistente de IA do orçamento: grava a fala (reconhecimento de voz do próprio celular) e a IA preenche o orçamento.
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { withBase } from "@/lib/base";

export type ResultadoIA = {
  resumo: string;
  cliente: { nome: string; telefone: string; endereco: string };
  itens: { descricao: string; detalhes: string; quantidade: number; unidade: string; valorUnitario: number }[];
  desconto: { tipo: "%" | "R$" | ""; valor: number };
  adicional: { nome: string; valor: number };
  prazoDias: number;
  pagamento: string;
  observacoes: string;
};

type Reconhecedor = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start(): void;
  stop(): void;
  onresult: ((ev: { resultIndex: number; results: ArrayLike<{ isFinal: boolean; 0: { transcript: string } }> }) => void) | null;
  onerror: ((ev: { error: string }) => void) | null;
  onend: (() => void) | null;
};

function criarReconhecedor(): Reconhecedor | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as { SpeechRecognition?: new () => Reconhecedor; webkitSpeechRecognition?: new () => Reconhecedor };
  const C = w.SpeechRecognition ?? w.webkitSpeechRecognition;
  return C ? new C() : null;
}

// ───────── leitura simples sem IA (quando o servidor de IA não está disponível) ─────────
const NUMS: Record<string, number> = { um: 1, uma: 1, dois: 2, duas: 2, "três": 3, tres: 3, quatro: 4, cinco: 5, seis: 6, sete: 7, oito: 8, nove: 9, dez: 10 };
function valorEm(txt: string): number {
  // só conta como preço o número junto de "R$", "por", "reais" ou "mil" (evita pegar "3 portas", "2,10 m")
  const N = String.raw`(\d{1,3}(?:[.\s]\d{3})+|\d+)(?:,(\d{1,2}))?`;
  const padroes = [new RegExp(String.raw`r\$\s*${N}\s*(mil)?`, "gi"), new RegExp(String.raw`${N}\s*(mil)?\s*reais`, "gi"), new RegExp(String.raw`(?:por|custa|custando|valor de|sai a|fica)\s+${N}\s*(mil)?`, "gi"), new RegExp(String.raw`${N}\s*mil\b`, "gi")];
  for (const re of padroes) {
    const ms = [...txt.matchAll(re)];
    const m = ms[ms.length - 1];
    if (!m) continue;
    let v = Number(m[1].replace(/[.\s]/g, "")) + (m[2] ? Number(`0.${m[2]}`) : 0);
    if (m[3] || /mil/i.test(m[0])) v *= 1000;
    if (v > 0) return v;
  }
  return 0;
}
export function lerSemIA(texto: string): ResultadoIA {
  const partes = texto
    .split(/[;\n:]|\.\s|,\s|(?<=reais|mil|\d)\s+e\s+|\s+e\s+(?=(?:um|uma|dois|duas|tr[eê]s|quatro|cinco|\d+)\s)/i)
    .map((p) => p.trim())
    .filter((p) => p.length > 3);
  const PRECO = /(?:\s+(?:por|custando|custa|a|de|valor de))?\s+(?:r\$\s*)?\d[\d.,]*\s*(?:mil)?\s*(?:reais)?\s*(?:cada)?\s*$/i;
  const itens = partes
    .filter((p) => !/prazo|pagamento|cliente|desconto|entrega em|dias|semanas?|\bm[eê]s(es)?\b|vista|entrada|^para\s/i.test(p))
    .map((p) => {
      const q = p.match(/^(\d+|um|uma|dois|duas|tr[eê]s|quatro|cinco|seis|sete|oito|nove|dez)\s+/i);
      const quantidade = q ? Number(q[1]) || NUMS[q[1].toLowerCase()] || 1 : 1;
      const semQtd = (q ? p.slice(q[0].length) : p).replace(PRECO, "").trim();
      const [desc, ...resto] = semQtd.split(/\s(?:de|com|em)\s(?=\d)|\s(?=\d)/);
      const valor = valorEm(p);
      const unitario = /\bcada\b/i.test(p) ? valor : valor / quantidade;
      return {
        descricao: desc.trim().replace(/^\w/, (c) => c.toUpperCase()),
        detalhes: resto.join(" ").trim(),
        quantidade,
        unidade: "un",
        valorUnitario: valor ? Math.round(unitario * 100) / 100 : 0,
      };
    })
    .filter((i) => i.descricao.length > 1);
  const prazo = texto.match(/(\d+)\s*(dias|semanas?|m[eê]s|meses)/i);
  const prazoDias = prazo ? Number(prazo[1]) * (/semana/i.test(prazo[2]) ? 7 : /m[eê]s/i.test(prazo[2]) ? 30 : 1) : /\bum m[eê]s\b/i.test(texto) ? 30 : /\b(uma|duas|tr[eê]s) semanas?\b/i.test(texto) ? 7 * (NUMS[(texto.match(/\b(uma|duas|tr[eê]s) semanas?/i)?.[1] ?? "uma").toLowerCase()] ?? 1) : 0;
  const cli = texto.match(/(?:cliente[:\s]+|para (?:a |o )?(?:senhora |senhor |dona |seu )?)([A-ZÁÉÍÓÚÂÊÔÃÕ][\wÀ-ú]+(?:\s[A-ZÁÉÍÓÚÂÊÔÃÕ][\wÀ-ú]+)?)/i);
  return {
    resumo: itens.length ? `Li ${itens.length} item(ns) do que você falou. Confira os valores antes de enviar.` : "Não consegui separar os itens. Tente falar um item por vez, com o valor.",
    cliente: { nome: cli?.[1] ?? "", telefone: (texto.match(/\(?\d{2}\)?\s?9?\d{4}[-\s]?\d{4}/)?.[0] ?? "").replace(/\D/g, ""), endereco: "" },
    itens,
    desconto: { tipo: "", valor: 0 },
    adicional: { nome: "", valor: 0 },
    prazoDias,
    pagamento: /vista/i.test(texto) ? "À vista" : /entrada/i.test(texto) ? "Entrada + restante na entrega" : "",
    observacoes: "",
  };
}

export function AssistenteVoz({ clientes, aoPreencher, onBloqueado }: { clientes: string[]; aoPreencher: (r: ResultadoIA) => void; onBloqueado: () => void }) {
  const [suporte, setSuporte] = useState(true);
  const [gravando, setGravando] = useState(false);
  const [texto, setTexto] = useState("");
  const [parcial, setParcial] = useState("");
  const [status, setStatus] = useState<"livre" | "pensando">("livre");
  const [msg, setMsg] = useState<{ tipo: "ok" | "erro" | "info"; texto: string } | null>(null);
  const rec = useRef<Reconhecedor | null>(null);
  const base = useRef("");

  useEffect(() => {
    setSuporte(Boolean(criarReconhecedor()));
    return () => rec.current?.stop();
  }, []);

  const iniciar = () => {
    const r = criarReconhecedor();
    if (!r) return setSuporte(false);
    r.lang = "pt-BR";
    r.continuous = true;
    r.interimResults = true;
    base.current = texto ? `${texto.trim()} ` : "";
    r.onresult = (ev) => {
      let fim = "";
      let meio = "";
      for (let i = 0; i < ev.results.length; i++) {
        const res = ev.results[i];
        if (res.isFinal) fim += res[0].transcript;
        else meio += res[0].transcript;
      }
      setTexto((base.current + fim).replace(/\s+/g, " "));
      setParcial(meio);
    };
    r.onerror = (ev) => {
      if (ev.error === "not-allowed" || ev.error === "service-not-allowed") setMsg({ tipo: "erro", texto: "Permita o uso do microfone para gravar. Ou digite o pedido abaixo." });
      else if (ev.error !== "no-speech" && ev.error !== "aborted") setMsg({ tipo: "erro", texto: "Não consegui ouvir. Tente de novo num lugar mais silencioso." });
    };
    r.onend = () => {
      setGravando(false);
      setParcial("");
    };
    rec.current = r;
    setMsg(null);
    try {
      r.start();
      setGravando(true);
    } catch {
      setGravando(false);
    }
  };
  const parar = () => rec.current?.stop();

  const enviar = async () => {
    const pedido = `${texto} ${parcial}`.trim();
    if (pedido.length < 3) return setMsg({ tipo: "erro", texto: "Fale ou digite o que vai no orçamento." });
    rec.current?.stop();
    setStatus("pensando");
    setMsg(null);
    try {
      const r = await fetch(withBase("/api/assistente"), {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ texto: pedido, clientes }),
      });
      const j = (await r.json().catch(() => ({}))) as Partial<ResultadoIA> & { erro?: string; bloqueado?: boolean; semIA?: boolean };
      if (r.status === 401 && j.bloqueado) {
        onBloqueado();
        setMsg({ tipo: "info", texto: j.erro ?? "O assistente de IA faz parte do acesso completo." });
      } else if (r.ok && Array.isArray(j.itens)) {
        aoPreencher(j as ResultadoIA);
        setMsg({ tipo: "ok", texto: j.resumo || "Pronto! Confira o orçamento abaixo." });
        setTexto("");
      } else if (r.status === 503 || r.status === 404) {
        const local = lerSemIA(pedido);
        aoPreencher(local);
        setMsg({ tipo: "info", texto: local.resumo });
      } else {
        setMsg({ tipo: "erro", texto: j.erro ?? "Não deu certo agora. Tente de novo." });
      }
    } catch {
      const local = lerSemIA(pedido);
      aoPreencher(local);
      setMsg({ tipo: "info", texto: `Sem conexão com a IA. ${local.resumo}` });
    } finally {
      setStatus("livre");
    }
  };

  return (
    <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-[radial-gradient(120%_120%_at_0%_0%,#3b2a63_0%,#1a1430_45%,#0e0b19_100%)] p-5 text-white shadow-[0_20px_60px_-20px_rgba(76,47,163,0.55)] sm:p-6">
      <div className="pointer-events-none absolute -top-24 -right-16 h-64 w-64 rounded-full bg-fuchsia-500/25 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -left-10 h-56 w-56 rounded-full bg-amber-400/20 blur-3xl" />
      <div className="relative flex items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/20">
          <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M12 3l1.8 4.6L18.5 9l-4.7 1.6L12 15l-1.8-4.4L5.5 9l4.7-1.4z" fill="currentColor" stroke="none" />
            <path d="M19 15l.8 2 2.2.8-2.2.8L19 21l-.8-2.4L16 17.8l2.2-.8z" fill="currentColor" stroke="none" opacity=".7" />
          </svg>
        </span>
        <div>
          <p className="text-[11px] font-bold tracking-[0.2em] text-fuchsia-200/90 uppercase">Assistente de IA</p>
          <h2 className="font-display text-xl leading-tight text-white">Fale o orçamento, a IA preenche</h2>
        </div>
      </div>
      <p className="relative mt-3 text-sm text-white/75">
        Ex.: <em>“Orçamento para a Maria, guarda-roupa de 3 portas em MDF branco, 2,10 por 1,80, por 3.800 reais, e uma cômoda de 4 gavetas por 1.200. Entrega em 25 dias,
        metade de entrada.”</em>
      </p>

      <div className="relative mt-5 flex flex-col items-center gap-3">
        {suporte ? (
          <button
            type="button"
            onClick={gravando ? parar : iniciar}
            disabled={status === "pensando"}
            aria-pressed={gravando}
            aria-label={gravando ? "Parar gravação" : "Gravar áudio"}
            className="relative flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-fuchsia-500 via-violet-500 to-amber-400 shadow-[0_10px_40px_-5px_rgba(217,70,239,0.7)] transition-transform active:scale-95 disabled:opacity-50"
          >
            {gravando && <span className="absolute inset-0 animate-ping rounded-full bg-fuchsia-400/40" />}
            <span className="relative flex h-[84px] w-[84px] items-center justify-center rounded-full bg-[#15102a]">
              {gravando ? (
                <span className="flex h-8 items-end gap-1">
                  {[0, 1, 2, 3, 4].map((i) => (
                    <motion.span key={i} className="w-1.5 rounded-full bg-gradient-to-t from-fuchsia-400 to-amber-300" animate={{ height: [8, 30, 12, 26, 8] }} transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.12 }} />
                  ))}
                </span>
              ) : (
                <svg viewBox="0 0 24 24" className="h-9 w-9 text-white" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden>
                  <rect x="9" y="3" width="6" height="11" rx="3" fill="currentColor" />
                  <path d="M5.5 11a6.5 6.5 0 0 0 13 0M12 17.5V21" />
                </svg>
              )}
            </span>
          </button>
        ) : (
          <p className="rounded-xl bg-white/10 px-3 py-2 text-center text-xs text-white/80">Seu navegador não grava voz. Digite o pedido abaixo — a IA entende do mesmo jeito.</p>
        )}
        <p className="text-xs font-semibold text-white/70">{gravando ? "Ouvindo… toque para parar" : suporte ? "Toque no microfone e fale" : ""}</p>
      </div>

      <label htmlFor="pedido-ia" className="sr-only">
        Pedido do orçamento
      </label>
      <textarea
        id="pedido-ia"
        value={texto + (parcial ? ` ${parcial}` : "")}
        onChange={(e) => {
          setTexto(e.target.value);
          setParcial("");
        }}
        rows={3}
        placeholder="…ou digite aqui o que vai no orçamento"
        className="relative mt-4 w-full rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/40 focus:border-fuchsia-300 focus:outline-none"
      />

      <button
        type="button"
        onClick={enviar}
        disabled={status === "pensando"}
        className="relative mt-3 flex w-full items-center justify-center gap-2 rounded-2xl bg-white px-5 py-3.5 font-semibold text-[#1a1430] transition-transform active:scale-[0.98] disabled:opacity-70"
      >
        {status === "pensando" ? (
          <>
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#1a1430]/30 border-t-[#1a1430]" />
            A IA está montando o orçamento…
          </>
        ) : (
          <>✨ Preencher orçamento com IA</>
        )}
      </button>

      <AnimatePresence>
        {msg && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className={`relative mt-3 rounded-xl px-3 py-2 text-sm ${msg.tipo === "ok" ? "bg-emerald-400/15 text-emerald-100" : msg.tipo === "erro" ? "bg-red-400/15 text-red-100" : "bg-white/10 text-white/85"}`}
            role="status"
          >
            {msg.texto}
          </motion.p>
        )}
      </AnimatePresence>
    </section>
  );
}
