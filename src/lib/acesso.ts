"use client";

// Acesso ao conteúdo bloqueado. Quem decide é o servidor (api/*.php na Hostinger):
// a senha é conferida lá e o navegador só recebe um cookie assinado, que o JavaScript não lê.
import { useCallback, useSyncExternalStore } from "react";
import { withBase } from "./base";

type Estado = { carregando: boolean; liberado: boolean; offline: boolean };

let estado: Estado = { carregando: true, liberado: false, offline: false };
const ouvintes = new Set<() => void>();
let iniciado = false;

function set(next: Partial<Estado>) {
  estado = { ...estado, ...next };
  ouvintes.forEach((l) => l());
}

export const api = (arquivo: string) => withBase(`/api/${arquivo}`);

async function consultar() {
  try {
    const r = await fetch(api("status.php"), { credentials: "same-origin", cache: "no-store" });
    const j = (await r.json()) as { liberado?: boolean };
    set({ carregando: false, liberado: Boolean(j.liberado), offline: false });
  } catch {
    // sem backend (ex.: aberto direto do disco): tudo bloqueado continua bloqueado
    set({ carregando: false, liberado: false, offline: true });
  }
}

function subscribe(cb: () => void) {
  ouvintes.add(cb);
  if (!iniciado && typeof window !== "undefined") {
    iniciado = true;
    void consultar();
  }
  return () => ouvintes.delete(cb);
}

const SERVER: Estado = { carregando: true, liberado: false, offline: false };

export function useAcesso() {
  const s = useSyncExternalStore(
    subscribe,
    () => estado,
    () => SERVER,
  );

  const desbloquear = useCallback(async (senha: string): Promise<string | null> => {
    try {
      const r = await fetch(api("desbloquear.php"), {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ senha: senha.trim() }),
      });
      const j = (await r.json()) as { ok?: boolean; erro?: string };
      if (j.ok) {
        set({ liberado: true });
        return null;
      }
      return j.erro ?? "Senha incorreta.";
    } catch {
      return "Não foi possível falar com o servidor. Verifique sua internet.";
    }
  }, []);

  const sair = useCallback(async () => {
    try {
      await fetch(api("sair.php"), { method: "POST", credentials: "same-origin" });
    } finally {
      set({ liberado: false });
    }
  }, []);

  return { ...s, desbloquear, sair };
}

/** Busca um conteúdo bloqueado (projeto, aula ou vídeo). Só responde com cookie válido. */
export async function buscarBloqueado<T>(tipo: "projeto" | "aula" | "video", id: string): Promise<T | null> {
  try {
    const r = await fetch(`${api("conteudo.php")}?tipo=${tipo}&id=${encodeURIComponent(id)}`, { credentials: "same-origin", cache: "no-store" });
    if (!r.ok) return null;
    return (await r.json()) as T;
  } catch {
    return null;
  }
}
