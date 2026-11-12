"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { useAcesso } from "@/lib/acesso";
import { PixCard } from "./PixCard";
import { LOJA } from "@/lib/loja";

/** Cadeado + campo de senha + PIX. Some sozinho quando o acesso é liberado. */
export function UnlockBox({ titulo = "Conteúdo exclusivo", texto, dark = false }: { titulo?: string; texto?: string; dark?: boolean }) {
  const { desbloquear, carregando } = useAcesso();
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [ok, setOk] = useState(false);

  const enviar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!senha.trim()) return;
    setEnviando(true);
    setErro(null);
    const r = await desbloquear(senha);
    setEnviando(false);
    if (r) setErro(r);
    else setOk(true);
  };

  return (
    <div className={`rounded-2xl border p-5 sm:p-6 ${dark ? "border-bark-900/10 bg-white text-bark-900" : "border-wood-400/40 bg-wood-50"}`}>
      <div className="flex items-start gap-4">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-bark-900 text-wood-600" aria-hidden>
          <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="4" y="10" width="16" height="11" rx="2" />
            <path d="M8 10V7a4 4 0 0 1 8 0v3" />
          </svg>
        </span>
        <div>
          <h3 className={`font-display text-xl ${dark ? "text-bark-900" : "text-bark-900"}`}>{titulo}</h3>
          <p className={`mt-1 text-sm ${dark ? "text-bark-700" : "text-bark-700"}`}>{LOJA ? "Conteúdo exclusivo para quem tem acesso ao App do Marceneiro. Já tem acesso? Digite sua senha." : (texto ?? "Digite a senha de desbloqueio que você recebeu no WhatsApp para liberar todas as aulas e todos os projetos.")}</p>
        </div>
      </div>

      <form onSubmit={enviar} className="mt-5 flex flex-col gap-2 sm:flex-row">
        <label htmlFor="senha-desbloqueio" className="sr-only">
          Senha de desbloqueio
        </label>
        <input
          id="senha-desbloqueio"
          type="password"
          autoComplete="off"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          placeholder="Senha de desbloqueio"
          className={`min-w-0 flex-1 rounded-xl border px-4 py-3 text-base focus:outline-none ${dark ? "border-bark-900/10 bg-white text-bark-900 placeholder:text-bark-500 focus:border-wood-400" : "border-bark-900/20 bg-white focus:border-wood-500"}`}
        />
        <button disabled={enviando || carregando} className="btn-cta rounded-xl px-6 py-3 text-base">
          {enviando ? "Conferindo…" : "Desbloquear"}
        </button>
      </form>
      <AnimatePresence>
        {erro && (
          <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mt-2 text-sm font-semibold text-red-400" role="alert">
            {erro}
          </motion.p>
        )}
        {ok && (
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-2 text-sm font-semibold text-leaf-700" role="status">
            App desbloqueado! Carregando o conteúdo…
          </motion.p>
        )}
      </AnimatePresence>

      {!LOJA && (
        <>
          <p className={`mt-5 mb-3 text-center text-sm font-semibold ${dark ? "text-wood-600" : "text-bark-800"}`}>Ainda não tem a senha? Efetue o pagamento PIX para receber a senha de desbloqueio.</p>
          <PixCard compact />
        </>
      )}
    </div>
  );
}
