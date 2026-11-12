"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { withBase } from "@/lib/base";
import { Logo } from "./Logo";
import { LOJA } from "@/lib/loja";

// "Plano de corte" é uma página independente (standalone/plano-de-corte/index.html), por isso <a> comum
const NAV = [
  { href: "/catalogo", label: "Projetos" },
  { href: "/configurador", label: "Sob medida" },
  { href: "/aulas", label: "Aulas" },
  { href: "/videos", label: "Vídeos" },
  { href: "/plano-de-corte/", label: "Plano de corte", plain: true },
  { href: "/oferta", label: "Desbloquear" },
].filter((n) => !LOJA || n.href !== "/oferta");

export function SiteHeader() {
  const pathname = usePathname();
  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  return (
    <header className="wood-grain sticky top-0 z-40 border-b border-black/30 text-wood-50">
      <div className="container-page flex h-14 items-center lg:h-16 justify-between gap-4">
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

        <Link href={LOJA ? "/membro/" : "/oferta/#pix"} className="rounded-full bg-wood-400 px-4 py-2 text-sm font-semibold text-bark-950 md:hidden">
          {LOJA ? "Entrar" : "Desbloquear"}
        </Link>
      </div>
    </header>
  );
}
