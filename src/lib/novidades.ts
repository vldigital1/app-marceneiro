"use client";

// "Projetos novos todo sábado": o app lembra quais projetos a pessoa já conhecia.
// O que entrou depois da última visita ganha o selo "Novo". Com o sininho ligado,
// o app também mostra um aviso do celular (notificação) ao abrir quando houver lançamento.
import { useEffect, useState } from "react";

const K_VISTOS = "amc-projetos-conhecidos";
const K_SINO = "amc-sininho";
const K_NOVOS = "amc-projetos-novos";

const ler = <T,>(k: string, padrao: T): T => {
  try {
    const v = localStorage.getItem(k);
    return v ? (JSON.parse(v) as T) : padrao;
  } catch {
    return padrao;
  }
};
const gravar = (k: string, v: unknown) => {
  try {
    localStorage.setItem(k, JSON.stringify(v));
  } catch {}
};

/** Compara a lista atual com a da última visita e devolve os slugs novos. */
export function useProjetosNovos(slugs: string[]) {
  const [novos, setNovos] = useState<Set<string>>(new Set());
  useEffect(() => {
    const conhecidos = ler<string[] | null>(K_VISTOS, null);
    const anteriores = new Set(ler<string[]>(K_NOVOS, []));
    if (!conhecidos) {
      // primeira visita: nada é "novo"
      gravar(K_VISTOS, slugs);
      return;
    }
    const base = new Set(conhecidos);
    const agora = slugs.filter((s) => !base.has(s) || anteriores.has(s));
    // os novos continuam marcados até a próxima leva (próximo lançamento)
    if (agora.some((s) => !base.has(s))) gravar(K_NOVOS, agora);
    gravar(K_VISTOS, slugs);
    setNovos(new Set(agora));
    if (agora.length && typeof Notification !== "undefined" && Notification.permission === "granted" && ler(K_SINO, false) && !sessionStorage.getItem("amc-avisou")) {
      try {
        new Notification("App do Marceneiro", { body: `${agora.length} projeto${agora.length > 1 ? "s novos" : " novo"} no catálogo!`, icon: `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/icone-192.png` });
        sessionStorage.setItem("amc-avisou", "1");
      } catch {}
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slugs.length]);
  return novos;
}

export function useSininho() {
  const [ligado, setLigado] = useState(false);
  useEffect(() => setLigado(ler(K_SINO, false)), []);
  const alternar = async () => {
    if (ligado) {
      gravar(K_SINO, false);
      return setLigado(false);
    }
    try {
      if (typeof Notification !== "undefined" && Notification.permission === "default") await Notification.requestPermission();
    } catch {}
    gravar(K_SINO, true);
    setLigado(true);
  };
  return { ligado, alternar };
}
