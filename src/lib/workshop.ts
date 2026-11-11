"use client";

// "Minha oficina": favoritos e progresso salvos no navegador (localStorage).
// Versão estática do site — não há login nem servidor. Os dados ficam no aparelho de quem usa.
import { useSyncExternalStore } from "react";

export type ProgressEntry = { status: "em_progresso" | "concluido"; steps: number[]; startedAt: string };
/** Projeto do configurador salvo para um cliente/obra */
export type SavedConfig = { id: string; tipo: string; tipoNome: string; cliente: string; valores: Record<string, number | string | boolean>; caixa: string; frente: string; dims: [number, number, number]; data: string };
export type WorkshopState = { favorites: string[]; progress: Record<string, ProgressEntry>; salvos: SavedConfig[] };

const KEY = "veio-plano:oficina:v1";
const EMPTY: WorkshopState = { favorites: [], progress: {}, salvos: [] };
const listeners = new Set<() => void>();
let snapshot: WorkshopState | null = null;

function read(): WorkshopState {
  if (snapshot) return snapshot;
  try {
    const raw = window.localStorage.getItem(KEY);
    const parsed = raw ? (JSON.parse(raw) as Partial<WorkshopState>) : {};
    snapshot = { favorites: parsed.favorites ?? [], progress: parsed.progress ?? {}, salvos: parsed.salvos ?? [] };
  } catch {
    snapshot = EMPTY;
  }
  return snapshot;
}

function write(next: WorkshopState) {
  snapshot = next;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    /* modo privado ou armazenamento cheio: mantém só na memória */
  }
  listeners.forEach((l) => l());
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  const onStorage = (e: StorageEvent) => {
    if (e.key === KEY) {
      snapshot = null;
      cb();
    }
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(cb);
    window.removeEventListener("storage", onStorage);
  };
}

export function useWorkshop() {
  return useSyncExternalStore(subscribe, read, () => EMPTY);
}

export const workshop = {
  salvar(c: Omit<SavedConfig, "id" | "data">) {
    const s = read();
    const item: SavedConfig = { ...c, id: `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`, data: new Date().toISOString() };
    write({ ...s, salvos: [item, ...s.salvos] });
    return item;
  },
  removerSalvo(id: string) {
    const s = read();
    write({ ...s, salvos: s.salvos.filter((x) => x.id !== id) });
  },
  toggleFavorite(slug: string) {
    const s = read();
    const favorites = s.favorites.includes(slug) ? s.favorites.filter((f) => f !== slug) : [slug, ...s.favorites];
    write({ ...s, favorites });
  },
  start(slug: string) {
    const s = read();
    if (s.progress[slug]) return;
    write({ ...s, progress: { ...s.progress, [slug]: { status: "em_progresso", steps: [], startedAt: new Date().toISOString() } } });
  },
  toggleStep(slug: string, step: number, totalSteps: number) {
    const s = read();
    const cur = s.progress[slug] ?? { status: "em_progresso" as const, steps: [], startedAt: new Date().toISOString() };
    const steps = cur.steps.includes(step) ? cur.steps.filter((x) => x !== step) : [...cur.steps, step].sort((a, b) => a - b);
    const status = steps.length >= totalSteps ? "concluido" : "em_progresso";
    write({ ...s, progress: { ...s.progress, [slug]: { ...cur, steps, status } } });
  },
  setStatus(slug: string, status: ProgressEntry["status"], totalSteps: number) {
    const s = read();
    const cur = s.progress[slug];
    if (!cur) return;
    const steps = status === "concluido" ? Array.from({ length: totalSteps }, (_, i) => i + 1) : cur.steps;
    write({ ...s, progress: { ...s.progress, [slug]: { ...cur, status, steps } } });
  },
  remove(slug: string) {
    const s = read();
    const progress = { ...s.progress };
    delete progress[slug];
    write({ ...s, progress });
  },
};
