"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";
import { estimateCost } from "@/data/gen/kit";
import { useAcesso } from "@/lib/acesso";
import { CORES, TIPOS, calcular } from "@/lib/configurador";
import { baixar, compartilhar, gerarImagem, gerarPdf } from "@/lib/exportar-orcamento";
import { brl, dataBR, EMPRESA_VAZIA, novoId, orc, PAGAMENTOS, soDigitos, TEMPLATES, totais, useOrcamentos, type Cliente, type Empresa, type Item, type Orcamento, type Status } from "@/lib/orcamentos";
import { useWorkshop } from "@/lib/workshop";
import { UnlockBox } from "../UnlockBox";
import { AssistenteVoz, type ResultadoIA } from "./AssistenteVoz";
import { A4_LARGURA, FolhaOrcamento } from "./Modelos";

type Aba = "orcamentos" | "clientes" | "empresa";

const STATUS: Record<Status, { nome: string; cls: string }> = {
  rascunho: { nome: "Rascunho", cls: "bg-stone-100 text-stone-600" },
  enviado: { nome: "Enviado", cls: "bg-sky-100 text-sky-700" },
  aprovado: { nome: "Aprovado", cls: "bg-emerald-100 text-emerald-700" },
  recusado: { nome: "Recusado", cls: "bg-rose-100 text-rose-700" },
};

const CORES_MARCA = ["#b97f35", "#7c3aed", "#2563eb", "#0f766e", "#16a34a", "#dc2626", "#db2777", "#111827", "#ea580c", "#475569"];

const campo = "w-full rounded-xl border border-bark-900/10 bg-white px-3.5 py-2.5 text-[15px] text-bark-900 placeholder:text-bark-500/70 focus:border-violet-400 focus:ring-2 focus:ring-violet-200 focus:outline-none";
const rotulo = "mb-1 block text-xs font-semibold tracking-wide text-bark-500 uppercase";
const cartao = "rounded-3xl border border-bark-900/[0.07] bg-white/90 p-4 shadow-[0_8px_30px_-12px_rgba(36,24,15,0.18)] backdrop-blur sm:p-5";

function Titulo({ n, t, sub }: { n: number; t: string; sub?: string }) {
  return (
    <div className="mb-3 flex items-center gap-3">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 text-sm font-bold text-white">{n}</span>
      <div>
        <h3 className="font-display text-lg leading-tight text-bark-900">{t}</h3>
        {sub && <p className="text-xs text-bark-500">{sub}</p>}
      </div>
    </div>
  );
}

// ───────────────────────────── Minha marcenaria ─────────────────────────────
function reduzirLogo(arquivo: File): Promise<string> {
  return new Promise((ok, erro) => {
    const leitor = new FileReader();
    leitor.onerror = () => erro(new Error("Não consegui ler a imagem."));
    leitor.onload = () => {
      const img = new Image();
      img.onerror = () => erro(new Error("Formato de imagem não suportado."));
      img.onload = () => {
        const max = 360;
        const k = Math.min(1, max / Math.max(img.width, img.height));
        const c = document.createElement("canvas");
        c.width = Math.round(img.width * k);
        c.height = Math.round(img.height * k);
        c.getContext("2d")!.drawImage(img, 0, 0, c.width, c.height);
        ok(c.toDataURL("image/png"));
      };
      img.src = String(leitor.result);
    };
    leitor.readAsDataURL(arquivo);
  });
}

function EmpresaForm({ empresa, aoSalvar }: { empresa: Empresa; aoSalvar?: () => void }) {
  const [e, setE] = useState<Empresa>(empresa);
  const [salvo, setSalvo] = useState(false);
  const [erroLogo, setErroLogo] = useState("");
  useEffect(() => setE(empresa), [empresa]);
  const set = (k: keyof Empresa, v: string) => {
    setE((x) => ({ ...x, [k]: v }));
    setSalvo(false);
  };
  return (
    <div className={cartao}>
      <div className="flex items-center gap-4">
        <label className="group relative flex h-24 w-24 shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-violet-300 bg-violet-50 text-center text-xs font-semibold text-violet-700">
          {e.logo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={e.logo} alt="Logo da marcenaria" className="h-full w-full object-contain p-1" />
          ) : (
            <span className="px-2">
              + Logo
              <br />
              da marcenaria
            </span>
          )}
          <input
            type="file"
            accept="image/*"
            className="sr-only"
            onChange={async (ev) => {
              const f = ev.target.files?.[0];
              if (!f) return;
              try {
                set("logo", await reduzirLogo(f));
                setErroLogo("");
              } catch (err) {
                setErroLogo(err instanceof Error ? err.message : "Erro na imagem.");
              }
            }}
          />
        </label>
        <div className="min-w-0 flex-1">
          <p className="font-display text-xl text-bark-900">{e.nome || "Sua marcenaria"}</p>
          <p className="text-sm text-bark-500">Esses dados e a logo aparecem em todos os orçamentos.</p>
          {e.logo && (
            <button type="button" onClick={() => set("logo", "")} className="mt-1 text-xs font-semibold text-rose-600">
              Remover logo
            </button>
          )}
          {erroLogo && <p className="text-xs text-rose-600">{erroLogo}</p>}
        </div>
      </div>
      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        {(
          [
            ["nome", "Nome da marcenaria", "Ex.: Marcenaria Silva"],
            ["responsavel", "Responsável", "Ex.: João Silva"],
            ["telefone", "WhatsApp", "(47) 99999-9999"],
            ["email", "E-mail", "contato@..."],
            ["cidade", "Cidade / bairro", "Ex.: Joinville - SC"],
            ["documento", "CNPJ ou CPF (opcional)", ""],
            ["instagram", "Instagram (opcional)", "@suamarcenaria"],
            ["pix", "Sua chave PIX para receber (opcional)", ""],
          ] as const
        ).map(([k, l, ph]) => (
          <div key={k}>
            <label className={rotulo} htmlFor={`emp-${k}`}>
              {l}
            </label>
            <input id={`emp-${k}`} className={campo} value={e[k]} placeholder={ph} onChange={(ev) => set(k, ev.target.value)} />
          </div>
        ))}
      </div>
      <div className="mt-4">
        <span className={rotulo}>Cor da sua marca</span>
        <div className="flex flex-wrap items-center gap-2">
          {CORES_MARCA.map((c) => (
            <button key={c} type="button" aria-label={`Cor ${c}`} onClick={() => set("cor", c)} className={`h-9 w-9 rounded-full ring-offset-2 ${e.cor === c ? "ring-2 ring-violet-500" : ""}`} style={{ background: c }} />
          ))}
          <label className="flex h-9 items-center gap-2 rounded-full border border-bark-900/10 px-3 text-xs font-semibold text-bark-700">
            Outra
            <input type="color" value={e.cor} onChange={(ev) => set("cor", ev.target.value)} className="h-6 w-6 cursor-pointer border-0 bg-transparent p-0" />
          </label>
        </div>
      </div>
      <button
        type="button"
        onClick={() => {
          orc.salvarEmpresa(e);
          setSalvo(true);
          aoSalvar?.();
        }}
        className="mt-5 w-full rounded-2xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-5 py-3.5 font-semibold text-white shadow-lg shadow-violet-500/25 active:scale-[0.99]"
      >
        {salvo ? "✓ Dados salvos" : "Salvar dados da marcenaria"}
      </button>
    </div>
  );
}

// ───────────────────────────── Clientes ─────────────────────────────
function ClienteForm({ inicial, aoSalvar, aoCancelar }: { inicial?: Partial<Cliente>; aoSalvar: (c: Cliente) => void; aoCancelar?: () => void }) {
  const [c, setC] = useState({ nome: inicial?.nome ?? "", telefone: inicial?.telefone ?? "", email: inicial?.email ?? "", endereco: inicial?.endereco ?? "" });
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {(
        [
          ["nome", "Nome do cliente", "Ex.: Maria Souza"],
          ["telefone", "WhatsApp do cliente", "(47) 99999-9999"],
          ["email", "E-mail (opcional)", ""],
          ["endereco", "Endereço / bairro (opcional)", ""],
        ] as const
      ).map(([k, l, ph]) => (
        <div key={k}>
          <label className={rotulo} htmlFor={`cli-${k}`}>
            {l}
          </label>
          <input id={`cli-${k}`} className={campo} value={c[k]} placeholder={ph} inputMode={k === "telefone" ? "tel" : undefined} onChange={(e) => setC({ ...c, [k]: e.target.value })} />
        </div>
      ))}
      <div className="flex gap-2 sm:col-span-2">
        <button
          type="button"
          disabled={!c.nome.trim()}
          onClick={() => aoSalvar(orc.salvarCliente({ ...c, id: inicial?.id }))}
          className="flex-1 rounded-xl bg-bark-900 px-4 py-3 font-semibold text-white disabled:opacity-40"
        >
          Salvar cliente
        </button>
        {aoCancelar && (
          <button type="button" onClick={aoCancelar} className="rounded-xl border border-bark-900/15 px-4 py-3 font-semibold text-bark-700">
            Cancelar
          </button>
        )}
      </div>
    </div>
  );
}

function Clientes({ clientes, orcamentos, aoNovoOrcamento }: { clientes: Cliente[]; orcamentos: Orcamento[]; aoNovoOrcamento: (c: Cliente) => void }) {
  const [editando, setEditando] = useState<Cliente | "novo" | null>(null);
  const [busca, setBusca] = useState("");
  const lista = clientes.filter((c) => `${c.nome} ${c.telefone}`.toLowerCase().includes(busca.toLowerCase()));
  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <input className={campo} placeholder="Buscar cliente" value={busca} onChange={(e) => setBusca(e.target.value)} />
        <button type="button" onClick={() => setEditando("novo")} className="shrink-0 rounded-xl bg-bark-900 px-4 font-semibold text-white">
          + Novo
        </button>
      </div>
      {editando && (
        <div className={cartao}>
          <ClienteForm inicial={editando === "novo" ? undefined : editando} aoSalvar={() => setEditando(null)} aoCancelar={() => setEditando(null)} />
        </div>
      )}
      {lista.length === 0 && !editando && <p className="rounded-2xl bg-white/70 p-6 text-center text-sm text-bark-500">Nenhum cliente ainda. Cadastre o primeiro ou crie um orçamento — o cliente fica salvo aqui.</p>}
      {lista.map((c) => {
        const qtd = orcamentos.filter((o) => o.clienteId === c.id).length;
        return (
          <div key={c.id} className={`${cartao} flex items-center gap-3`}>
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 font-bold text-white">{c.nome.slice(0, 1).toUpperCase()}</span>
            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold text-bark-900">{c.nome}</p>
              <p className="truncate text-xs text-bark-500">
                {c.telefone || "sem telefone"} · {qtd} orçamento{qtd === 1 ? "" : "s"}
              </p>
            </div>
            <button type="button" onClick={() => aoNovoOrcamento(c)} className="rounded-xl bg-violet-100 px-3 py-2 text-xs font-bold text-violet-700">
              Orçar
            </button>
            <button type="button" onClick={() => setEditando(c)} className="rounded-xl px-2 py-2 text-xs font-semibold text-bark-600">
              Editar
            </button>
            <button
              type="button"
              onClick={() => {
                if (confirm(`Excluir o cliente ${c.nome}? Os orçamentos dele continuam salvos.`)) orc.removerCliente(c.id);
              }}
              className="rounded-xl px-2 py-2 text-xs font-semibold text-rose-600"
            >
              Excluir
            </button>
          </div>
        );
      })}
    </div>
  );
}

// ───────────────────────────── Editor ─────────────────────────────
function Editor({ inicial, empresa, clientes, aoFechar }: { inicial: Orcamento; empresa: Empresa; clientes: Cliente[]; aoFechar: () => void }) {
  const [o, setO] = useState<Orcamento>(inicial);
  const [novoCliente, setNovoCliente] = useState(false);
  const [bloqueadoIA, setBloqueadoIA] = useState(false);
  const [gerando, setGerando] = useState<"" | "pdf" | "png" | "share">("");
  const [aviso, setAviso] = useState("");
  const [verSobMedida, setVerSobMedida] = useState(false);
  const folha = useRef<HTMLDivElement>(null);
  const caixaPrevia = useRef<HTMLDivElement>(null);
  const [escala, setEscala] = useState(0.45);
  const [alturaFolha, setAlturaFolha] = useState(1123);
  const { liberado } = useAcesso();
  const { salvos } = useWorkshop();
  const tt = totais(o);

  // salva sozinho a cada mudança
  useEffect(() => {
    const id = setTimeout(() => orc.salvar(o), 400);
    return () => clearTimeout(id);
  }, [o]);

  // prévia ajustada à largura da tela
  useEffect(() => {
    const el = caixaPrevia.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setEscala(el.clientWidth / A4_LARGURA));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  useEffect(() => {
    const el = folha.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setAlturaFolha(el.scrollHeight));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const up = (p: Partial<Orcamento>) => setO((x) => ({ ...x, ...p }));
  const upItem = (id: string, p: Partial<Item>) => setO((x) => ({ ...x, itens: x.itens.map((i) => (i.id === id ? { ...i, ...p } : i)) }));
  const addItem = (p: Partial<Item> = {}) => setO((x) => ({ ...x, itens: [...x.itens, { id: novoId(), descricao: "", detalhes: "", quantidade: 1, unidade: "un", valorUnitario: 0, ...p }] }));

  const escolherCliente = (c: Cliente) => up({ clienteId: c.id, cliente: { nome: c.nome, telefone: c.telefone, endereco: c.endereco, email: c.email } });

  const aplicarIA = (r: ResultadoIA) => {
    setO((x) => {
      const n = { ...x };
      if (r.cliente?.nome) {
        const achado = clientes.find((c) => c.nome.toLowerCase() === r.cliente.nome.toLowerCase());
        const cli = achado ?? orc.salvarCliente({ nome: r.cliente.nome, telefone: soDigitos(r.cliente.telefone ?? ""), email: "", endereco: r.cliente.endereco ?? "" });
        n.clienteId = cli.id;
        n.cliente = { nome: cli.nome, telefone: cli.telefone || soDigitos(r.cliente.telefone ?? ""), endereco: cli.endereco || r.cliente.endereco || "", email: cli.email };
      }
      n.itens = [...x.itens, ...r.itens.map((i) => ({ id: novoId(), descricao: i.descricao, detalhes: i.detalhes ?? "", quantidade: Number(i.quantidade) || 1, unidade: i.unidade || "un", valorUnitario: Number(i.valorUnitario) || 0 }))];
      if (r.desconto?.tipo) n.desconto = { tipo: r.desconto.tipo, valor: Number(r.desconto.valor) || 0 };
      if (r.adicional?.valor) n.adicional = { nome: r.adicional.nome || "Entrega e instalação", valor: Number(r.adicional.valor) || 0 };
      if (r.prazoDias) n.prazoDias = r.prazoDias;
      if (r.pagamento) n.pagamento = r.pagamento;
      if (r.observacoes) n.observacoes = x.observacoes ? `${x.observacoes}\n${r.observacoes}` : r.observacoes;
      if (!n.titulo && r.itens.length) n.titulo = r.itens.length === 1 ? r.itens[0].descricao : `${r.itens[0].descricao} e mais ${r.itens.length - 1}`;
      return n;
    });
  };

  const doSobMedida = (id: string) => {
    const s = salvos.find((x) => x.id === id);
    const tipo = s && TIPOS.find((t) => t.id === s.tipo);
    if (!s || !tipo) return;
    let custo = 0;
    try {
      const r = calcular(tipo, s.valores, s.caixa, s.frente);
      const [, max] = estimateCost(r.materials, r.cut, 0);
      custo = max;
    } catch {
      custo = 0;
    }
    const cor = (k: string) => CORES.find((c) => c.look === k)?.nome ?? k;
    const [h, w, d] = s.dims;
    addItem({
      descricao: s.tipoNome,
      detalhes: `${(w / 10).toLocaleString("pt-BR")} × ${(h / 10).toLocaleString("pt-BR")} × ${(d / 10).toLocaleString("pt-BR")} cm · caixa ${cor(s.caixa)} · frentes ${cor(s.frente)}`,
      valorUnitario: custo ? Math.round((custo * 2.5) / 10) * 10 : 0,
    });
    setVerSobMedida(false);
    setAviso(custo ? `Preço sugerido: ${brl(Math.round((custo * 2.5) / 10) * 10)} (material estimado ${brl(custo)} × 2,5). Ajuste se quiser.` : "");
  };

  const nomeArquivo = (ext: string) => `orcamento-${String(o.numero).padStart(4, "0")}-${(o.cliente.nome || "cliente").toLowerCase().normalize("NFD").replace(/[^a-z0-9]+/g, "-")}.${ext}`;
  const textoZap = () => `Olá${o.cliente.nome ? `, ${o.cliente.nome.split(" ")[0]}` : ""}! Segue o orçamento nº ${String(o.numero).padStart(4, "0")} da ${empresa.nome || "marcenaria"}: total de ${brl(tt.total)}. Qualquer dúvida, estou à disposição.`;

  const exportar = async (tipo: "pdf" | "png" | "share") => {
    if (!folha.current) return;
    setGerando(tipo);
    setAviso("");
    try {
      if (tipo === "share") {
        const blob = await gerarPdf(folha.current);
        const foi = await compartilhar(blob, nomeArquivo("pdf"), textoZap());
        if (!foi) {
          baixar(blob, nomeArquivo("pdf"));
          const tel = soDigitos(o.cliente.telefone);
          window.open(`https://wa.me/${tel ? (tel.length <= 11 ? `55${tel}` : tel) : ""}?text=${encodeURIComponent(textoZap())}`, "_blank", "noopener");
          setAviso("O PDF foi baixado. Anexe ele na conversa do WhatsApp que abriu.");
        }
        if (o.status === "rascunho") up({ status: "enviado" });
      } else {
        const blob = tipo === "pdf" ? await gerarPdf(folha.current) : await gerarImagem(folha.current);
        baixar(blob, nomeArquivo(tipo));
      }
    } catch {
      setAviso("Não consegui gerar o arquivo. Tente de novo.");
    } finally {
      setGerando("");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <button type="button" onClick={aoFechar} className="rounded-xl px-2 py-2 text-sm font-semibold text-bark-600">
          ← Orçamentos
        </button>
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-bark-500">Nº {String(o.numero).padStart(4, "0")}</span>
          <select value={o.status} onChange={(e) => up({ status: e.target.value as Status })} className={`rounded-full px-3 py-1.5 text-xs font-bold ${STATUS[o.status].cls}`}>
            {(Object.keys(STATUS) as Status[]).map((s) => (
              <option key={s} value={s}>
                {STATUS[s].nome}
              </option>
            ))}
          </select>
        </div>
      </div>

      {!empresa.nome && (
        <p className="rounded-2xl bg-amber-50 px-4 py-3 text-sm text-amber-800 ring-1 ring-amber-200">
          Dica: preencha <b>Minha marcenaria</b> (nome, logo e WhatsApp) para eles aparecerem no orçamento.
        </p>
      )}

      {bloqueadoIA && !liberado ? <UnlockBox titulo="Assistente de IA" texto="O assistente que entende áudio faz parte do acesso completo. Digite sua senha de acesso." /> : <AssistenteVoz clientes={clientes.map((c) => c.nome)} aoPreencher={aplicarIA} onBloqueado={() => setBloqueadoIA(true)} />}

      {/* 1. CLIENTE */}
      <div className={cartao}>
        <Titulo n={1} t="Cliente" sub="Escolha um cliente salvo ou cadastre um novo" />
        {o.cliente.nome && !novoCliente ? (
          <div className="flex items-center gap-3 rounded-2xl bg-violet-50 p-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-600 font-bold text-white">{o.cliente.nome.slice(0, 1).toUpperCase()}</span>
            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold text-bark-900">{o.cliente.nome}</p>
              <p className="truncate text-xs text-bark-500">{[o.cliente.telefone, o.cliente.endereco].filter(Boolean).join(" · ") || "sem contato"}</p>
            </div>
            <button type="button" onClick={() => up({ clienteId: "", cliente: { nome: "", telefone: "", endereco: "", email: "" } })} className="text-xs font-semibold text-violet-700">
              Trocar
            </button>
          </div>
        ) : novoCliente ? (
          <ClienteForm
            aoSalvar={(c) => {
              escolherCliente(c);
              setNovoCliente(false);
            }}
            aoCancelar={() => setNovoCliente(false)}
          />
        ) : (
          <div className="space-y-2">
            {clientes.length > 0 && (
              <select className={campo} value="" onChange={(e) => {
                const c = clientes.find((x) => x.id === e.target.value);
                if (c) escolherCliente(c);
              }}>
                <option value="">Escolher cliente salvo…</option>
                {clientes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nome}
                    {c.telefone ? ` · ${c.telefone}` : ""}
                  </option>
                ))}
              </select>
            )}
            <button type="button" onClick={() => setNovoCliente(true)} className="w-full rounded-xl border-2 border-dashed border-violet-300 py-3 text-sm font-semibold text-violet-700">
              + Cadastrar novo cliente
            </button>
          </div>
        )}
      </div>

      {/* 2. ITENS */}
      <div className={cartao}>
        <Titulo n={2} t="Itens do orçamento" sub="Móveis, serviços e materiais" />
        <label className={rotulo} htmlFor="titulo-proj">
          Nome do projeto
        </label>
        <input id="titulo-proj" className={`${campo} mb-4`} placeholder="Ex.: Cozinha planejada" value={o.titulo} onChange={(e) => up({ titulo: e.target.value })} />
        <AnimatePresence initial={false}>
          {o.itens.map((i, k) => (
            <motion.div key={i.id} layout initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, height: 0 }} className="mb-3 rounded-2xl border border-bark-900/10 bg-stone-50/70 p-3">
              <div className="flex items-start gap-2">
                <span className="mt-2.5 text-xs font-bold text-violet-600">{k + 1}</span>
                <div className="min-w-0 flex-1 space-y-2">
                  <input className={campo} placeholder="Descrição (ex.: Guarda-roupa 3 portas)" value={i.descricao} onChange={(e) => upItem(i.id, { descricao: e.target.value })} />
                  <input className={`${campo} text-sm`} placeholder="Detalhes: medidas, material, cor…" value={i.detalhes} onChange={(e) => upItem(i.id, { detalhes: e.target.value })} />
                  <div className="grid grid-cols-[70px_80px_1fr] gap-2">
                    <input className={campo} type="number" min={0} inputMode="decimal" aria-label="Quantidade" value={i.quantidade} onChange={(e) => upItem(i.id, { quantidade: Number(e.target.value) })} />
                    <select className={campo} aria-label="Unidade" value={i.unidade} onChange={(e) => upItem(i.id, { unidade: e.target.value })}>
                      {["un", "m²", "m", "serviço", "jogo"].map((u) => (
                        <option key={u}>{u}</option>
                      ))}
                    </select>
                    <div className="relative">
                      <span className="absolute top-1/2 left-3 -translate-y-1/2 text-sm text-bark-500">R$</span>
                      <input className={`${campo} pl-9`} type="number" min={0} step="0.01" inputMode="decimal" aria-label="Valor unitário" value={i.valorUnitario || ""} placeholder="0,00" onChange={(e) => upItem(i.id, { valorUnitario: Number(e.target.value) })} />
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-bark-900">{brl((Number(i.quantidade) || 0) * (Number(i.valorUnitario) || 0))}</span>
                    <button type="button" onClick={() => setO((x) => ({ ...x, itens: x.itens.filter((y) => y.id !== i.id) }))} className="text-xs font-semibold text-rose-600">
                      Remover
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        <div className="grid gap-2 sm:grid-cols-2">
          <button type="button" onClick={() => addItem()} className="rounded-xl bg-bark-900 py-3 text-sm font-semibold text-white">
            + Adicionar item
          </button>
          <button type="button" onClick={() => setVerSobMedida((v) => !v)} className="rounded-xl border border-violet-300 bg-violet-50 py-3 text-sm font-semibold text-violet-700">
            + Móvel do Sob medida
          </button>
        </div>
        {verSobMedida && (
          <div className="mt-3 rounded-2xl border border-violet-200 bg-white p-3">
            {salvos.length === 0 ? (
              <p className="text-sm text-bark-500">Você ainda não salvou móveis no Sob medida. Monte um lá e toque em “Salvar para o cliente”.</p>
            ) : (
              <ul className="space-y-1">
                {salvos.map((s) => (
                  <li key={s.id}>
                    <button type="button" onClick={() => doSobMedida(s.id)} className="w-full rounded-xl px-3 py-2 text-left text-sm hover:bg-violet-50">
                      <b>{s.tipoNome}</b> · {s.cliente || "sem nome"} · {s.dims.join(" × ")} mm
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
        {aviso && <p className="mt-3 rounded-xl bg-violet-50 px-3 py-2 text-xs text-violet-800">{aviso}</p>}
      </div>

      {/* 3. VALORES E CONDIÇÕES */}
      <div className={cartao}>
        <Titulo n={3} t="Valores e condições" />
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <span className={rotulo}>Desconto</span>
            <div className="flex gap-2">
              <select className={`${campo} w-20`} aria-label="Tipo de desconto" value={o.desconto.tipo} onChange={(e) => up({ desconto: { ...o.desconto, tipo: e.target.value as "%" | "R$" } })}>
                <option>%</option>
                <option>R$</option>
              </select>
              <input className={campo} type="number" min={0} inputMode="decimal" aria-label="Valor do desconto" value={o.desconto.valor || ""} placeholder="0" onChange={(e) => up({ desconto: { ...o.desconto, valor: Number(e.target.value) } })} />
            </div>
          </div>
          <div>
            <span className={rotulo}>Adicional (entrega, instalação…)</span>
            <div className="flex gap-2">
              <input className={campo} aria-label="Nome do adicional" value={o.adicional.nome} onChange={(e) => up({ adicional: { ...o.adicional, nome: e.target.value } })} />
              <input className={`${campo} w-28`} type="number" min={0} inputMode="decimal" aria-label="Valor do adicional" value={o.adicional.valor || ""} placeholder="R$ 0" onChange={(e) => up({ adicional: { ...o.adicional, valor: Number(e.target.value) } })} />
            </div>
          </div>
          <div>
            <label className={rotulo} htmlFor="prazo">
              Prazo de entrega (dias)
            </label>
            <input id="prazo" className={campo} type="number" min={0} value={o.prazoDias || ""} onChange={(e) => up({ prazoDias: Number(e.target.value) })} />
          </div>
          <div>
            <label className={rotulo} htmlFor="validade">
              Validade do orçamento (dias)
            </label>
            <input id="validade" className={campo} type="number" min={1} value={o.validadeDias || ""} onChange={(e) => up({ validadeDias: Number(e.target.value) })} />
          </div>
          <div className="sm:col-span-2">
            <label className={rotulo} htmlFor="pagamento">
              Forma de pagamento
            </label>
            <input id="pagamento" className={campo} list="lista-pagamentos" value={o.pagamento} onChange={(e) => up({ pagamento: e.target.value })} />
            <datalist id="lista-pagamentos">
              {PAGAMENTOS.map((p) => (
                <option key={p} value={p} />
              ))}
            </datalist>
          </div>
          <div className="sm:col-span-2">
            <label className={rotulo} htmlFor="obs">
              Observações
            </label>
            <textarea id="obs" className={campo} rows={3} placeholder="Ex.: Medidas a conferir no local. Garantia de 1 ano." value={o.observacoes} onChange={(e) => up({ observacoes: e.target.value })} />
          </div>
        </div>
        <div className="mt-4 rounded-2xl bg-gradient-to-r from-violet-600 to-fuchsia-600 p-4 text-white">
          <div className="flex justify-between text-sm text-white/80">
            <span>Subtotal {brl(tt.subtotal)}</span>
            {tt.desconto > 0 && <span>− {brl(tt.desconto)}</span>}
            {tt.adicional > 0 && <span>+ {brl(tt.adicional)}</span>}
          </div>
          <div className="mt-1 flex items-baseline justify-between">
            <span className="text-xs font-bold tracking-widest uppercase">Total</span>
            <span className="font-display text-3xl">{brl(tt.total)}</span>
          </div>
        </div>
      </div>

      {/* 4. MODELO */}
      <div className={cartao}>
        <Titulo n={4} t="Modelo do orçamento" sub="Escolha o visual. A cor vem de Minha marcenaria." />
        <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 [scrollbar-width:none] sm:grid sm:grid-cols-3 sm:overflow-visible">
          {TEMPLATES.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => up({ template: t.id })}
              className={`w-40 shrink-0 rounded-2xl border p-3 text-left transition-all sm:w-auto ${o.template === t.id ? "border-violet-500 bg-violet-50 ring-2 ring-violet-300" : "border-bark-900/10 bg-white"}`}
            >
              <span
                className="mb-2 block h-14 rounded-xl"
                style={{
                  background:
                    t.id === "premium"
                      ? "linear-gradient(135deg,#17181d,#0b0b0e)"
                      : t.id === "madeira"
                        ? "linear-gradient(135deg,#6b4528,#3d2616)"
                        : t.id === "minimal"
                          ? "repeating-linear-gradient(0deg,#fff 0 10px,#e6e6e6 10px 11px)"
                          : t.id === "executivo"
                            ? `linear-gradient(90deg, ${empresa.cor} 0 12px, #f6f7f9 12px)`
                            : t.id === "vibrante"
                              ? `radial-gradient(circle at 80% 30%, ${empresa.cor}, #fff 70%)`
                              : `linear-gradient(120deg, #222, ${empresa.cor})`,
                }}
              />
              <span className="block text-sm font-bold text-bark-900">{t.nome}</span>
              <span className="block text-[11px] leading-snug text-bark-500">{t.desc}</span>
            </button>
          ))}
        </div>
      </div>

      {/* PRÉVIA */}
      <div className={cartao}>
        <Titulo n={5} t="Prévia e envio" />
        <div ref={caixaPrevia} className="w-full overflow-hidden rounded-xl border border-bark-900/10 bg-stone-100" style={{ height: alturaFolha * escala }}>
          <div style={{ transform: `scale(${escala})`, transformOrigin: "top left", width: A4_LARGURA }}>
            <FolhaOrcamento ref={folha} o={o} e={empresa} />
          </div>
        </div>
        <div className="mt-4 grid gap-2 sm:grid-cols-3">
          <button type="button" disabled={!!gerando} onClick={() => exportar("share")} className="flex items-center justify-center gap-2 rounded-2xl bg-[#25D366] px-4 py-3.5 font-semibold text-white shadow-lg shadow-emerald-500/25 disabled:opacity-60 sm:col-span-3">
            {gerando === "share" ? "Gerando…" : "Enviar para o cliente (WhatsApp)"}
          </button>
          <button type="button" disabled={!!gerando} onClick={() => exportar("pdf")} className="rounded-2xl bg-bark-900 px-4 py-3 font-semibold text-white disabled:opacity-60">
            {gerando === "pdf" ? "Gerando PDF…" : "Baixar PDF"}
          </button>
          <button type="button" disabled={!!gerando} onClick={() => exportar("png")} className="rounded-2xl border border-bark-900/15 bg-white px-4 py-3 font-semibold text-bark-900 disabled:opacity-60">
            {gerando === "png" ? "Gerando imagem…" : "Baixar imagem"}
          </button>
          <button type="button" onClick={() => { orc.salvar(o); aoFechar(); }} className="rounded-2xl border border-violet-300 bg-violet-50 px-4 py-3 font-semibold text-violet-700">
            Salvar e fechar
          </button>
        </div>
        {aviso && gerando === "" && <p className="mt-3 text-center text-xs text-bark-500">{aviso}</p>}
      </div>
    </div>
  );
}

// ───────────────────────────── Página ─────────────────────────────
export function OrcamentoApp() {
  const { empresa, clientes, orcamentos } = useOrcamentos();
  const [aba, setAba] = useState<Aba>("orcamentos");
  const [aberto, setAberto] = useState<Orcamento | null>(null);
  const [busca, setBusca] = useState("");
  const [filtro, setFiltro] = useState<Status | "todos">("todos");

  const lista = useMemo(
    () => orcamentos.filter((o) => (filtro === "todos" || o.status === filtro) && `${o.cliente.nome} ${o.titulo} ${o.numero}`.toLowerCase().includes(busca.toLowerCase())),
    [orcamentos, busca, filtro],
  );
  const resumo = useMemo(() => {
    const aprovados = orcamentos.filter((o) => o.status === "aprovado");
    return { total: orcamentos.length, aprovados: aprovados.length, valor: aprovados.reduce((s, o) => s + totais(o).total, 0) };
  }, [orcamentos]);

  const novo = (c?: Cliente) => {
    const o = orc.novo();
    if (c) {
      o.clienteId = c.id;
      o.cliente = { nome: c.nome, telefone: c.telefone, endereco: c.endereco, email: c.email };
    }
    setAberto(o);
    setAba("orcamentos");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(90%_60%_at_100%_0%,rgba(167,139,250,0.18),transparent_60%),radial-gradient(80%_50%_at_0%_10%,rgba(251,191,36,0.14),transparent_60%)]">
      <div className="container-page max-w-3xl py-6">
        {aberto ? (
          <Editor key={aberto.id} inicial={aberto} empresa={{ ...EMPRESA_VAZIA, ...empresa }} clientes={clientes} aoFechar={() => setAberto(null)} />
        ) : (
          <>
            <header className="mb-5">
              <p className="text-xs font-bold tracking-[0.2em] text-violet-600 uppercase">Orçamentos com IA</p>
              <h1 className="mt-1 text-3xl text-bark-900 sm:text-4xl">Orçamento profissional em 1 minuto</h1>
              <p className="mt-2 text-bark-600">Fale o pedido, a IA preenche. Escolha um dos 6 modelos e envie em PDF ou imagem para o cliente.</p>
            </header>

            <div className="mb-5 grid grid-cols-3 gap-2">
              {[
                ["Orçamentos", String(resumo.total)],
                ["Aprovados", String(resumo.aprovados)],
                ["Vendido", brl(resumo.valor)],
              ].map(([k, v]) => (
                <div key={k} className="rounded-2xl border border-bark-900/[0.07] bg-white/80 p-3 text-center backdrop-blur">
                  <p className="truncate font-display text-lg text-bark-900 sm:text-2xl">{v}</p>
                  <p className="text-[11px] font-semibold tracking-wide text-bark-500 uppercase">{k}</p>
                </div>
              ))}
            </div>

            <button type="button" onClick={() => novo()} className="mb-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-violet-600 via-fuchsia-600 to-amber-500 px-5 py-4 text-lg font-semibold text-white shadow-xl shadow-fuchsia-500/25 active:scale-[0.99]">
              ✨ Novo orçamento
            </button>

            <div className="mb-4 flex rounded-2xl bg-white/80 p-1 ring-1 ring-bark-900/[0.07] backdrop-blur">
              {(
                [
                  ["orcamentos", "Orçamentos"],
                  ["clientes", "Clientes"],
                  ["empresa", "Minha marcenaria"],
                ] as const
              ).map(([id, nome]) => (
                <button key={id} type="button" onClick={() => setAba(id)} className={`flex-1 rounded-xl py-2.5 text-sm font-semibold transition-colors ${aba === id ? "bg-bark-900 text-white" : "text-bark-600"}`}>
                  {nome}
                </button>
              ))}
            </div>

            {aba === "orcamentos" && (
              <div className="space-y-3">
                <input className={campo} placeholder="Buscar por cliente, projeto ou número" value={busca} onChange={(e) => setBusca(e.target.value)} />
                <div className="-mx-1 flex gap-2 overflow-x-auto px-1 [scrollbar-width:none]">
                  {(["todos", "rascunho", "enviado", "aprovado", "recusado"] as const).map((s) => (
                    <button key={s} type="button" onClick={() => setFiltro(s)} className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-bold ${filtro === s ? "bg-violet-600 text-white" : "bg-white text-bark-600 ring-1 ring-bark-900/10"}`}>
                      {s === "todos" ? "Todos" : STATUS[s].nome}
                    </button>
                  ))}
                </div>
                {lista.length === 0 && (
                  <div className="rounded-3xl border border-dashed border-violet-300 bg-white/70 p-8 text-center">
                    <p className="font-display text-xl text-bark-900">Nenhum orçamento ainda</p>
                    <p className="mt-1 text-sm text-bark-500">Toque em “Novo orçamento” e fale o pedido para a IA montar pra você.</p>
                  </div>
                )}
                {lista.map((o) => (
                  <div key={o.id} className={`${cartao} flex items-center gap-3`}>
                    <button type="button" onClick={() => setAberto(o)} className="flex min-w-0 flex-1 items-center gap-3 text-left">
                      <span className="flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-fuchsia-600 text-white">
                        <span className="text-[9px] font-bold opacity-80">Nº</span>
                        <span className="text-sm leading-none font-bold">{String(o.numero).padStart(4, "0")}</span>
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate font-semibold text-bark-900">{o.cliente.nome || "Sem cliente"}</span>
                        <span className="block truncate text-xs text-bark-500">
                          {o.titulo || `${o.itens.length} item(ns)`} · {dataBR(o.criadoEm)}
                        </span>
                        <span className="mt-1 flex items-center gap-2">
                          <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${STATUS[o.status].cls}`}>{STATUS[o.status].nome}</span>
                          <span className="text-sm font-bold text-bark-900">{brl(totais(o).total)}</span>
                        </span>
                      </span>
                    </button>
                    <div className="flex flex-col gap-1">
                      <button type="button" onClick={() => setAberto(orc.duplicar(o))} className="rounded-lg px-2 py-1 text-xs font-semibold text-violet-700">
                        Duplicar
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (confirm(`Excluir o orçamento nº ${String(o.numero).padStart(4, "0")}? Não dá para desfazer.`)) orc.remover(o.id);
                        }}
                        className="rounded-lg px-2 py-1 text-xs font-semibold text-rose-600"
                      >
                        Excluir
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {aba === "clientes" && <Clientes clientes={clientes} orcamentos={orcamentos} aoNovoOrcamento={novo} />}
            {aba === "empresa" && <EmpresaForm empresa={{ ...EMPRESA_VAZIA, ...empresa }} />}
            <p className="mt-6 text-center text-xs text-bark-500">Seus clientes e orçamentos ficam salvos neste aparelho.</p>
          </>
        )}
      </div>
    </div>
  );
}
