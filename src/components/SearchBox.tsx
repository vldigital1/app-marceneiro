"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function SearchBox({ initial = "", size = "lg" }: { initial?: string; size?: "lg" | "md" }) {
  const router = useRouter();
  const [q, setQ] = useState(initial);
  return (
    <form
      role="search"
      className={`flex w-full gap-2 rounded-xl bg-white p-1.5 shadow-(--shadow-lift) ${size === "lg" ? "max-w-xl" : ""}`}
      onSubmit={(e) => {
        e.preventDefault();
        router.push(q.trim() ? `/catalogo/?q=${encodeURIComponent(q.trim())}` : "/catalogo/");
      }}
    >
      <label htmlFor="busca" className="sr-only">
        Buscar projeto
      </label>
      <input
        id="busca"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Buscar: sapateira, rack, horta, pallet…"
        className="min-w-0 flex-1 rounded-lg px-3 text-base text-bark-900 placeholder:text-bark-500 focus:outline-none"
      />
      <button type="submit" className="btn-cta">
        Buscar
      </button>
    </form>
  );
}
