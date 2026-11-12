import Link from "next/link";
import { CATEGORIES } from "@/lib/taxonomy";
import { withBase } from "@/lib/base";
import { site } from "@/lib/site";
import { Logo } from "./Logo";
import { LOJA } from "@/lib/loja";

export function SiteFooter() {
  const cats = Object.entries(CATEGORIES).slice(0, 8);
  return (
    <footer className="wood-grain mt-20 text-wood-100/80">
      <div className="container-page grid gap-10 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div className="lg:col-span-2">
          <Logo className="text-wood-50" />
          <p className="mt-3 max-w-sm text-sm leading-6">{site.description}</p>
        </div>
        <div>
          <h3 className="mb-3 text-sm font-semibold tracking-wide text-wood-300 uppercase">Categorias</h3>
          <ul className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-sm lg:grid-cols-1">
            {cats.map(([k, v]) => (
              <li key={k}>
                <Link href={`/catalogo?categoria=${k}`} className="hover:text-wood-50">
                  {v}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="mb-3 text-sm font-semibold tracking-wide text-wood-300 uppercase">Ferramentas</h3>
          <ul className="space-y-1.5 text-sm">
            <li>
              <a href={withBase("/plano-de-corte/")} className="hover:text-wood-50">Plano de corte (otimizador de chapa)</a>
            </li>
            <li>
              <Link href="/blog" className="hover:text-wood-50">Blog de técnicas</Link>
            </li>
            <li>
              <Link href="/membro" className="hover:text-wood-50">Minha oficina</Link>
            </li>
            {!LOJA && (
              <li>
                <Link href="/oferta" className="hover:text-wood-50">Planos e acesso</Link>
              </li>
            )}
            <li>
              <Link href="/privacidade/" className="hover:text-wood-50">Política de privacidade</Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10">
        <p className="container-page py-5 text-xs text-wood-100/60">
          © {new Date().getFullYear()} {site.name}. Projetos, textos e ilustrações originais. Confira medidas no local antes de cortar.
        </p>
      </div>
    </footer>
  );
}
