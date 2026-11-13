"use client";

// Menu de baixo no celular, no estilo de aplicativo: 4 atalhos + "Mais".
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { withBase } from "@/lib/base";
import { LOJA } from "@/lib/loja";
import { LANCAMENTO, LINK_PLAY } from "@/lib/loja";

const P = { fill: "none", stroke: "currentColor", strokeWidth: 1.9, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
const ICONES: Record<string, React.ReactNode> = {
  projetos: (
    <svg viewBox="0 0 24 24" {...P}>
      <rect x="3.5" y="3.5" width="7" height="7" rx="1.5" />
      <rect x="13.5" y="3.5" width="7" height="7" rx="1.5" />
      <rect x="3.5" y="13.5" width="7" height="7" rx="1.5" />
      <rect x="13.5" y="13.5" width="7" height="7" rx="1.5" />
    </svg>
  ),
  medida: (
    <svg viewBox="0 0 24 24" {...P}>
      <path d="M4 20 20 4M7 17l2 2M10 14l2 2M13 11l2 2M16 8l2 2" />
      <path d="m4 20 3-1 13-13-2-2L5 17z" />
    </svg>
  ),
  aulas: (
    <svg viewBox="0 0 24 24" {...P}>
      <path d="M3 8.5 12 4l9 4.5-9 4.5z" />
      <path d="M7 10.6V15c0 1.4 2.2 3 5 3s5-1.6 5-3v-4.4M21 8.5V14" />
    </svg>
  ),
  videos: (
    <svg viewBox="0 0 24 24" {...P}>
      <rect x="3" y="5" width="18" height="14" rx="3" />
      <path d="m10 9.2 5 2.8-5 2.8z" fill="currentColor" />
    </svg>
  ),
  orcamento: (
    <svg viewBox="0 0 24 24" {...P}>
      <path d="M7 3h7l4 4v14H7z" />
      <path d="M14 3v4h4M10 12h5M10 16h5" />
    </svg>
  ),
  mais: (
    <svg viewBox="0 0 24 24" {...P}>
      <circle cx="5.5" cy="12" r="1.4" fill="currentColor" />
      <circle cx="12" cy="12" r="1.4" fill="currentColor" />
      <circle cx="18.5" cy="12" r="1.4" fill="currentColor" />
    </svg>
  ),
};

const TABS = [
  { href: "/catalogo", label: "Projetos", icone: "projetos" },
  { href: "/configurador", label: "Sob medida", icone: "medida" },
  { href: "/aulas", label: "Aulas", icone: "aulas" },
  { href: "/videos", label: "Vídeos", icone: "videos" },
];
// versão da loja: sem vídeos, com Orçamento no menu de baixo
const TABS_LOJA = [TABS[0], TABS[1], { href: "/orcamento", label: "Orçamento", icone: "orcamento" }, TABS[2]];

const MAIS = [
  { href: "/", label: "Início" },
  ...(LOJA ? [] : [{ href: "/orcamento/", label: "Orçamento" }]),
  { href: "/plano-de-corte/", label: "Plano de corte", plain: true },
  { href: "/membro/", label: "Minha oficina" },
  { href: "/blog/", label: "Dicas e técnicas" },
  { href: "/privacidade/", label: "Privacidade" },
  LANCAMENTO
    ? { href: LINK_PLAY, label: "Avaliar o app na Play Store", destaque: true, plain: true }
    : LOJA
      ? { href: "/membro/", label: "Já tenho acesso", destaque: true }
      : { href: "/oferta/#pix", label: "Desbloquear tudo", destaque: true },
];

export function BottomNav() {
  const pathname = usePathname();
  const [aberto, setAberto] = useState(false);
  useEffect(() => {
    setAberto(false);
  }, [pathname]);
  const ativo = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  return (
    <>
      <AnimatePresence>
        {aberto && (
          <>
            <motion.button
              key="fundo"
              type="button"
              aria-label="Fechar menu"
              className="fixed inset-0 z-40 bg-bark-950/40 lg:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              onClick={() => setAberto(false)}
            />
            <motion.div
              key="folha"
              className="fixed inset-x-3 bottom-[calc(84px+env(safe-area-inset-bottom))] z-50 rounded-2xl border border-bark-900/10 bg-white p-2 shadow-(--shadow-lift) lg:hidden"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 16 }}
              transition={{ duration: 0.18 }}
            >
              {MAIS.map((m) => {
                const cls = `block rounded-xl px-4 py-3.5 text-base font-semibold ${m.destaque ? "mt-1 bg-leaf-600 text-center text-white" : "text-bark-900 active:bg-wood-100"}`;
                return m.plain ? (
                  <a key={m.href} href={withBase(m.href)} className={cls}>
                    {m.label}
                  </a>
                ) : (
                  <Link key={m.href} href={m.href} className={cls}>
                    {m.label}
                  </Link>
                );
              })}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <nav
        aria-label="Menu do app"
        className="fixed inset-x-0 bottom-0 z-50 flex justify-center px-3 pb-[calc(10px+env(safe-area-inset-bottom))] lg:hidden"
      >
        <div className="flex w-full max-w-md items-stretch justify-around rounded-2xl border border-bark-900/10 bg-white/95 px-1 py-1.5 shadow-(--shadow-lift) backdrop-blur">
          {(LOJA ? TABS_LOJA : TABS).map((t) => {
            const on = ativo(t.href);
            return (
              <Link
                key={t.href}
                href={t.href}
                aria-current={on ? "page" : undefined}
                className={`flex min-w-0 flex-1 flex-col items-center gap-0.5 rounded-xl py-1.5 text-[11px] font-semibold transition-colors ${on ? "bg-wood-100 text-wood-600" : "text-bark-500 active:bg-wood-50"}`}
              >
                <span className="h-6 w-6">{ICONES[t.icone]}</span>
                <span className="truncate">{t.label}</span>
              </Link>
            );
          })}
          <button
            type="button"
            onClick={() => setAberto((v) => !v)}
            aria-expanded={aberto}
            className={`flex min-w-0 flex-1 flex-col items-center gap-0.5 rounded-xl py-1.5 text-[11px] font-semibold ${aberto ? "bg-wood-100 text-wood-600" : "text-bark-500"}`}
          >
            <span className="h-6 w-6">{ICONES.mais}</span>
            <span>Mais</span>
          </button>
        </div>
      </nav>
    </>
  );
}
