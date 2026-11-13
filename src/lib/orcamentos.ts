"use client";

// Orçamentos: dados da marcenaria, clientes e orçamentos — tudo salvo no próprio aparelho (localStorage).
import { useSyncExternalStore } from "react";

export type Empresa = {
  nome: string;
  responsavel: string;
  telefone: string;
  email: string;
  cidade: string;
  documento: string;
  instagram: string;
  pix: string;
  logo: string; // data URL (PNG) já reduzida
  cor: string; // cor da marca
};

export type Cliente = { id: string; nome: string; telefone: string; email: string; endereco: string; criadoEm: string };

export type Item = { id: string; descricao: string; detalhes: string; quantidade: number; unidade: string; valorUnitario: number };

export type Status = "rascunho" | "enviado" | "aprovado" | "recusado";

export type Orcamento = {
  id: string;
  numero: number;
  criadoEm: string;
  atualizadoEm: string;
  clienteId: string;
  cliente: { nome: string; telefone: string; endereco: string; email: string };
  titulo: string;
  itens: Item[];
  desconto: { tipo: "%" | "R$"; valor: number };
  adicional: { nome: string; valor: number }; // frete, instalação…
  prazoDias: number;
  validadeDias: number;
  pagamento: string;
  observacoes: string;
  template: TemplateId;
  status: Status;
};

export const TEMPLATES = [
  { id: "moderno", nome: "Moderno", desc: "Cabeçalho em degradê com a cor da sua marca" },
  { id: "premium", nome: "Premium escuro", desc: "Fundo escuro, detalhes dourados" },
  { id: "executivo", nome: "Executivo", desc: "Faixa lateral e tabela organizada" },
  { id: "minimal", nome: "Minimalista", desc: "Branco, limpo e direto" },
  { id: "madeira", nome: "Madeira", desc: "Tons de madeira, cara de marcenaria" },
  { id: "vibrante", nome: "Vibrante", desc: "Cartões coloridos e números grandes" },
] as const;
export type TemplateId = (typeof TEMPLATES)[number]["id"];

export const PAGAMENTOS = ["50% de entrada e 50% na entrega", "À vista no PIX", "Cartão de crédito em até 10x", "30% de entrada e o restante na entrega", "Entrada + 3 parcelas"];

type Estado = { empresa: Empresa; clientes: Cliente[]; orcamentos: Orcamento[]; proximo: number };

const KEY = "amc-orcamentos-v1";
export const EMPRESA_VAZIA: Empresa = { nome: "", responsavel: "", telefone: "", email: "", cidade: "", documento: "", instagram: "", pix: "", logo: "", cor: "#475569" };
const VAZIO: Estado = { empresa: EMPRESA_VAZIA, clientes: [], orcamentos: [], proximo: 1 };

let snap: Estado = VAZIO;
let carregado = false;
const ouvintes = new Set<() => void>();

function carregar() {
  if (carregado || typeof window === "undefined") return;
  carregado = true;
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const p = JSON.parse(raw) as Partial<Estado>;
      snap = { empresa: { ...EMPRESA_VAZIA, ...p.empresa }, clientes: p.clientes ?? [], orcamentos: p.orcamentos ?? [], proximo: p.proximo ?? 1 };
    }
  } catch {
    /* sem armazenamento: usa o estado em memória */
  }
}

function gravar(next: Estado) {
  snap = next;
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    /* cheio ou bloqueado: continua em memória */
  }
  ouvintes.forEach((l) => l());
}

export const novoId = () => `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;

export function useOrcamentos() {
  return useSyncExternalStore(
    (cb) => {
      carregar();
      ouvintes.add(cb);
      return () => ouvintes.delete(cb);
    },
    () => {
      carregar();
      return snap;
    },
    () => VAZIO,
  );
}

export const orc = {
  salvarEmpresa(e: Empresa) {
    gravar({ ...snap, empresa: e });
  },
  salvarCliente(c: Omit<Cliente, "id" | "criadoEm"> & { id?: string }): Cliente {
    const existente = c.id ? snap.clientes.find((x) => x.id === c.id) : undefined;
    const cli: Cliente = { id: existente?.id ?? novoId(), criadoEm: existente?.criadoEm ?? new Date().toISOString(), nome: c.nome.trim(), telefone: c.telefone.trim(), email: c.email.trim(), endereco: c.endereco.trim() };
    gravar({ ...snap, clientes: existente ? snap.clientes.map((x) => (x.id === cli.id ? cli : x)) : [cli, ...snap.clientes] });
    return cli;
  },
  removerCliente(id: string) {
    gravar({ ...snap, clientes: snap.clientes.filter((x) => x.id !== id) });
  },
  novo(): Orcamento {
    const agora = new Date().toISOString();
    return {
      id: novoId(),
      numero: snap.proximo,
      criadoEm: agora,
      atualizadoEm: agora,
      clienteId: "",
      cliente: { nome: "", telefone: "", endereco: "", email: "" },
      titulo: "",
      itens: [],
      desconto: { tipo: "%", valor: 0 },
      adicional: { nome: "Entrega e instalação", valor: 0 },
      prazoDias: 20,
      validadeDias: 15,
      pagamento: PAGAMENTOS[0],
      observacoes: "",
      template: "moderno",
      status: "rascunho",
    };
  },
  salvar(o: Orcamento) {
    const existe = snap.orcamentos.some((x) => x.id === o.id);
    const item = { ...o, atualizadoEm: new Date().toISOString() };
    gravar({
      ...snap,
      orcamentos: existe ? snap.orcamentos.map((x) => (x.id === o.id ? item : x)) : [item, ...snap.orcamentos],
      proximo: existe ? snap.proximo : Math.max(snap.proximo, o.numero + 1),
    });
  },
  remover(id: string) {
    gravar({ ...snap, orcamentos: snap.orcamentos.filter((x) => x.id !== id) });
  },
  duplicar(o: Orcamento): Orcamento {
    const agora = new Date().toISOString();
    return { ...o, id: novoId(), numero: snap.proximo, criadoEm: agora, atualizadoEm: agora, status: "rascunho", itens: o.itens.map((i) => ({ ...i, id: novoId() })) };
  },
};

export function totais(o: Orcamento) {
  const subtotal = o.itens.reduce((s, i) => s + (Number(i.quantidade) || 0) * (Number(i.valorUnitario) || 0), 0);
  const desconto = o.desconto.tipo === "%" ? (subtotal * (Number(o.desconto.valor) || 0)) / 100 : Number(o.desconto.valor) || 0;
  const adicional = Number(o.adicional.valor) || 0;
  return { subtotal, desconto: Math.min(desconto, subtotal), adicional, total: Math.max(0, subtotal - Math.min(desconto, subtotal) + adicional) };
}

export const brl = (n: number) => n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
export const dataBR = (iso: string) => new Date(iso).toLocaleDateString("pt-BR");
export const somaDias = (iso: string, dias: number) => {
  const d = new Date(iso);
  d.setDate(d.getDate() + dias);
  return d.toISOString();
};
export const soDigitos = (s: string) => s.replace(/\D/g, "");
