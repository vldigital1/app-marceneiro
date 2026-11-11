"use client";

import { useAcesso } from "@/lib/acesso";
import { UnlockBox } from "./UnlockBox";

/** Mostra se este aparelho já está desbloqueado (e permite sair). */
export function AcessoStatus() {
  const { carregando, liberado, sair, offline } = useAcesso();
  if (carregando) return <div className="h-20 animate-pulse rounded-xl bg-wood-100" />;
  if (liberado)
    return (
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-leaf-600/30 bg-leaf-50 p-4">
        <p className="font-semibold text-leaf-700">✓ App desbloqueado neste aparelho: todas as aulas e projetos liberados.</p>
        <button onClick={() => confirm("Sair do acesso neste aparelho? Você vai precisar da senha de novo.") && sair()} className="btn-ghost py-2 text-sm">
          Sair deste aparelho
        </button>
      </div>
    );
  return (
    <div className="space-y-2">
      {offline && <p className="text-sm text-bark-600">Servidor de desbloqueio indisponível neste endereço.</p>}
      <UnlockBox titulo="Desbloquear o app" />
    </div>
  );
}
