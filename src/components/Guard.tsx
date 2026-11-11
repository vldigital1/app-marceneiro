"use client";

// Proteção contra cópia (camada do navegador):
// - o app só funciona nos domínios autorizados (config-servidor.json → "dominios");
// - não abre dentro de iframe de outro site;
// - bloqueia botão direito, arrastar imagens e atalhos de "ver código / salvar página".
// O conteúdo exclusivo de verdade fica no servidor (api/), atrás da senha.
import { useEffect, useState } from "react";

const LISTA = (process.env.NEXT_PUBLIC_DOMINIOS ?? "")
  .split(",")
  .map((d) => d.trim().toLowerCase())
  .filter(Boolean);

export function Guard({ children }: { children: React.ReactNode }) {
  const [copia, setCopia] = useState(false);

  useEffect(() => {
    const host = location.hostname.toLowerCase();
    if (LISTA.length && !LISTA.includes(host)) setCopia(true);
    try {
      if (window.top && window.top !== window.self) window.top.location.href = window.self.location.href;
    } catch {
      setCopia(true);
    }

    const editavel = (t: EventTarget | null) => t instanceof HTMLElement && (t.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(t.tagName));
    const menu = (e: MouseEvent) => {
      if (!editavel(e.target)) e.preventDefault();
    };
    const arrastar = (e: DragEvent) => {
      if (e.target instanceof HTMLImageElement || e.target instanceof SVGElement) e.preventDefault();
    };
    const teclas = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      const ctrl = e.ctrlKey || e.metaKey;
      if (k === "f12" || (ctrl && e.shiftKey && ["i", "j", "c"].includes(k)) || (ctrl && ["u", "s"].includes(k))) {
        e.preventDefault();
        e.stopPropagation();
      }
    };
    document.addEventListener("contextmenu", menu);
    document.addEventListener("dragstart", arrastar);
    document.addEventListener("keydown", teclas, true);
    return () => {
      document.removeEventListener("contextmenu", menu);
      document.removeEventListener("dragstart", arrastar);
      document.removeEventListener("keydown", teclas, true);
    };
  }, []);

  if (copia)
    return (
      <div className="fixed inset-0 z-[999] flex items-center justify-center bg-[#1a120c] p-6 text-center text-wood-50">
        <div className="max-w-md">
          <p className="font-display text-3xl font-bold">Cópia não autorizada</p>
          <p className="mt-3 text-wood-100/80">Este endereço não é o App do Marceneiro oficial. Acesse pelo site original para ver os projetos e as aulas.</p>
          {LISTA[0] && (
            <a href={`https://${LISTA[0]}`} className="btn-cta mt-6">
              Ir para o app oficial
            </a>
          )}
        </div>
      </div>
    );
  return <>{children}</>;
}
