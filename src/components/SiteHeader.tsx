"use client";

import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { withBase } from "@/lib/base";
import { Logo } from "./Logo";

// "Plano de corte" é uma página independente (standalone/plano-de-corte/index.html), por isso <a> comum
const NAV = [
  { href: "/catalogo", label: "Projetos" },
  { href: "/configurador", label: "Sob medida" },
  { href: "/aulas", label: "Aulas" },
  { href: "/videos", label: "Vídeos" },
  { href: "/plano-de-corte/", label: "Plano de corte", plain: true },
  { href: "/oferta", label: "Desbloquear" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => setOpen(false), [pathname]);

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  return (
    <header className="wood-grain sticky top-0 z-40 border-b border-black/30 text-wood-50">
      <div className="container-page flex h-16 items-center justify-between gap-4">
        <Link href="/" className="text-wood-50" aria-label="Página inicial">
          <Logo />
        </Link>

        <nav className="hidden items-center gap-0.5 lg:flex" aria-label="Principal">
          {NAV.map((n) => {
            const cls = `rounded-md px-3 py-2 text-sm font-medium transition-colors ${
              isActive(n.href) ? "bg-white/10 text-wood-300" : "text-wood-100/85 hover:bg-white/5 hover:text-wood-50"
            }`;
            return n.plain ? (
              <a key={n.href} href={withBase(n.href)} className={cls}>
                {n.label}
              </a>
            ) : (
              <Link key={n.href} href={n.href} className={cls}>
                {n.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <Link href="/membro/" className="btn-wood py-2">
            Minha oficina
          </Link>
        </div>

        <button
          className="rounded-md p-2 text-wood-50 lg:hidden"
          aria-label={open ? "Fechar menu" : "Abrir menu"}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            {open ? <path d="M6 6l12 12M18 6 6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
          </svg>
        </button>
      </div>

      <AnimatePresence initial={false}>
        {open && (
          <motion.nav
            key="mobile"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden border-t border-white/10 lg:hidden"
            aria-label="Menu móvel"
          >
            <div className="container-page flex flex-col gap-1 py-3">
              {NAV.map((n) =>
                n.plain ? (
                  <a key={n.href} href={withBase(n.href)} className="rounded-md px-3 py-2.5 text-wood-100 hover:bg-white/5">
                    {n.label}
                  </a>
                ) : (
                  <Link key={n.href} href={n.href} className="rounded-md px-3 py-2.5 text-wood-100 hover:bg-white/5">
                    {n.label}
                  </Link>
                ),
              )}
              <Link href="/membro/" className="btn-wood mt-2">
                Minha oficina
              </Link>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
