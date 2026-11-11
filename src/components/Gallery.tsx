"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { ProjectIllustration } from "./ProjectIllustration";

type Props = { title: string; images: string[]; h: number; w: number; d: number; material: string };

const caption = (src: string) =>
  src.endsWith("/3d.svg") ? "Render 3D" : src.endsWith("/explodida.svg") ? "Vista explodida" : src.endsWith("/vistas.svg") ? "Vistas técnicas" : "Foto";

export function Gallery({ title, images, h, w, d, material }: Props) {
  const [i, setI] = useState(0);
  if (!images.length)
    return (
      <div className="aspect-[4/3] rounded-xl border border-bark-900/10 bg-gradient-to-br from-wood-100 to-wood-200/70">
        <ProjectIllustration h={h} w={w} d={d} material={material} className="h-full w-full p-8" />
      </div>
    );
  const cur = images[i];
  const tech = caption(cur) === "Vista explodida" || caption(cur) === "Vistas técnicas";
  return (
    <div>
      <div className={`relative aspect-[4/3] overflow-hidden rounded-xl border border-bark-900/10 ${tech ? "bg-[#fbf8f2]" : "bg-[#0e1117]"}`}>
        <AnimatePresence mode="wait" initial={false}>
          <motion.img
            key={cur}
            src={cur}
            alt={`${title} — ${caption(cur).toLowerCase()}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className={`absolute inset-0 h-full w-full ${tech ? "object-contain" : "object-cover"}`}
          />
        </AnimatePresence>
        <a href={cur} target="_blank" rel="noreferrer" className="chip absolute right-3 bottom-3 border-transparent bg-black/55 text-white backdrop-blur hover:bg-black/70">
          {caption(cur)} · ampliar ↗
        </a>
      </div>
      <div className="mt-3 flex gap-2 overflow-x-auto pb-1" role="tablist" aria-label="Imagens do projeto">
        {images.map((src, idx) => (
          <button
            key={src}
            role="tab"
            onClick={() => setI(idx)}
            aria-selected={idx === i}
            aria-label={caption(src)}
            className={`relative h-16 w-24 shrink-0 overflow-hidden rounded-lg border-2 ${idx === i ? "border-wood-500" : "border-transparent opacity-70 hover:opacity-100"}`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={src} alt="" className="h-full w-full object-cover" />
          </button>
        ))}
      </div>
    </div>
  );
}
