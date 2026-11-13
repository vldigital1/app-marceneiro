// Faixa do lançamento na loja: tudo liberado por tempo limitado + convite para avaliar.
// Sem prometer nada em troca da avaliação (regra da Google Play).
import { LANCAMENTO, LINK_PLAY } from "@/lib/loja";

export function LancamentoBanner({ className = "" }: { className?: string }) {
  if (!LANCAMENTO) return null;
  return (
    <div className={`flex flex-col gap-3 rounded-2xl bg-bark-900 p-4 text-wood-50 sm:flex-row sm:items-center ${className}`}>
      <div className="min-w-0 flex-1">
        <p className="font-display text-lg leading-tight">Lançamento: tudo liberado grátis</p>
        <p className="mt-0.5 text-sm text-wood-100/80">Todos os projetos, aulas, móveis sob medida e orçamentos estão abertos por tempo limitado. Aproveite!</p>
      </div>
      <a href={LINK_PLAY} target="_blank" rel="noopener noreferrer" className="shrink-0 rounded-full bg-wood-400 px-5 py-2.5 text-center text-sm font-semibold text-bark-950">
        Avaliar o app na Play Store
      </a>
    </div>
  );
}
