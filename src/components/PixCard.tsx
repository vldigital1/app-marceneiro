"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { pix } from "@/content/oferta";

/** Card de pagamento PIX: copia a chave e explica como chega a senha de desbloqueio. */
export function PixCard({ compact = false }: { compact?: boolean }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(pix.chave);
    } catch {
      // navegadores antigos / sem HTTPS: seleção manual
      const t = document.createElement("textarea");
      t.value = pix.chave;
      document.body.appendChild(t);
      t.select();
      document.execCommand("copy");
      t.remove();
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };

  return (
    <div className={`overflow-hidden rounded-2xl border border-bark-900/10 bg-white text-bark-900 shadow-(--shadow-lift) ${compact ? "" : "grid gap-6 p-6 md:grid-cols-[1fr_1.05fr] md:p-8"}`}>
      {!compact && (
        <div className="flex flex-col justify-center">
          <h3 className="flex items-center gap-2 font-display text-2xl text-bark-900">
            <svg viewBox="0 0 24 24" className="h-6 w-6 text-leaf-700" aria-hidden>
              <path fill="currentColor" d="M12 2 3 7v6c0 5 3.8 8.7 9 9.9 5.2-1.2 9-4.9 9-9.9V7l-9-5Zm-1.2 14.2-3.5-3.5 1.4-1.4 2.1 2.1 4.9-4.9 1.4 1.4-6.3 6.3Z" />
            </svg>
            Desbloqueie o App do Marceneiro
          </h3>
          <p className="mt-3 text-sm leading-6 text-bark-700">{pix.mensagem}</p>
          <ol className="mt-4 space-y-2 text-sm text-bark-700">
            {["Copie a chave PIX e pague pelo app do seu banco.", "A automação do WhatsApp envia a sua senha de desbloqueio.", "Digite a senha em qualquer conteúdo com cadeado: todas as aulas e projetos são liberados."].map((t, i) => (
              <li key={i} className="flex gap-3">
                <span className="num flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-wood-400 text-xs font-bold text-bark-950">{i + 1}</span>
                {t}
              </li>
            ))}
          </ol>
        </div>
      )}

      <div className={`rounded-xl border border-bark-900/10 bg-wood-50 ${compact ? "p-5" : "p-5 md:p-6"}`}>
        <p className="text-xs font-bold tracking-[0.18em] text-wood-600 uppercase">PIX copia e cola · {pix.tipo}</p>
        <p className="num mt-2 font-mono text-2xl font-bold tracking-wide break-all text-bark-900">{pix.chaveFormatada}</p>
        {pix.valor && <p className="mt-1 text-sm text-bark-700">Valor: <strong className="text-bark-900">{pix.valor}</strong></p>}
        <div className="mt-4 grid grid-cols-2 gap-4 border-t border-bark-900/10 pt-4 text-sm">
          <div>
            <p className="text-xs text-bark-500">Favorecido</p>
            <p className="font-semibold">{pix.favorecido}</p>
          </div>
          <div>
            <p className="text-xs text-bark-500">Instituição</p>
            <p className="font-semibold">{pix.instituicao}</p>
          </div>
        </div>
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={copy}
          className="mt-5 flex w-full items-center justify-center gap-2 rounded-full bg-leaf-600 px-5 py-3.5 font-semibold text-white transition-colors hover:bg-leaf-700"
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
            <rect x="9" y="9" width="12" height="12" rx="2" />
            <path d="M5 15V5a2 2 0 0 1 2-2h10" />
          </svg>
          <AnimatePresence mode="wait" initial={false}>
            <motion.span key={String(copied)} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.15 }}>
              {copied ? "Chave copiada ✓" : "Copiar chave PIX"}
            </motion.span>
          </AnimatePresence>
        </motion.button>
        {pix.whatsapp && (
          <a
            href={`https://wa.me/${pix.whatsapp}?text=${encodeURIComponent("Olá! Fiz o PIX do App do Marceneiro e quero receber minha senha de desbloqueio.")}`}
            target="_blank"
            rel="noreferrer"
            className="mt-3 flex w-full items-center justify-center rounded-full border border-bark-900/10 px-5 py-3 text-sm font-semibold text-bark-900 hover:bg-wood-100"
          >
            Enviar comprovante no WhatsApp
          </a>
        )}
        <p className="mt-3 text-center text-xs text-bark-500">{pix.mensagem}</p>
      </div>
    </div>
  );
}
