"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import type { ProjectCardData } from "@/data/model";
import { CATEGORIES, MATERIALS, costRange, dims, label } from "@/lib/taxonomy";
import { LevelBadge } from "./Badges";
import { ProjectIllustration } from "./ProjectIllustration";
import { LANCAMENTO } from "@/lib/loja";

export function ProjectCard({ p, index = 0, novo = false }: { p: ProjectCardData; index?: number; novo?: boolean }) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      // stagger curto por posição na linha: nunca passa de ~0,35 s no total
      transition={{ duration: 0.3, delay: (index % 3) * 0.06, ease: "easeOut" }}
      whileHover={{ y: -4, scale: 1.015 }}
      className="group card overflow-hidden transition-shadow hover:shadow-(--shadow-lift)"
    >
      <Link href={`/projetos/${p.slug}`} className="flex h-full flex-col">
        <div className="relative aspect-[4/3] bg-gradient-to-br from-wood-100 to-wood-200/70">
          {p.images[0] ? (
            <Image src={p.images[0]} alt={p.title} fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover" />
          ) : (
            <ProjectIllustration h={p.heightMm} w={p.widthMm} d={p.depthMm} material={p.primaryMaterial} className="absolute inset-0 m-auto h-full w-full p-4" />
          )}
          <span className="chip absolute top-3 left-3 border-transparent bg-bark-900/85 text-wood-100">{label(CATEGORIES, p.category)}</span>
          {novo && <span className="chip absolute bottom-3 left-3 border-transparent bg-wood-400 font-bold text-bark-950">🆕 Novo</span>}
          {p.locked && !LANCAMENTO ? (
            <span className="chip absolute top-3 right-3 border-transparent bg-black/75 text-wood-200">🔒 Exclusivo</span>
          ) : (
            <span className="chip absolute top-3 right-3 border-transparent bg-leaf-600 text-white">✓ Liberado</span>
          )}
        </div>
        <div className="flex flex-1 flex-col gap-3 p-4">
          <h3 className="text-lg text-bark-900 group-hover:text-wood-600">{p.title}</h3>
          <p className="line-clamp-2 text-sm text-bark-700">{p.summary}</p>
          <div className="mt-auto flex flex-wrap items-center gap-2 pt-1">
            <LevelBadge level={p.difficulty} />
            <span className="chip border-bark-900/10 bg-wood-50 text-bark-700">{label(MATERIALS, p.primaryMaterial)}</span>
            <span className="chip border-bark-900/10 bg-wood-50 text-bark-700">⏱ {p.estimatedTime}</span>
          </div>
          <div className="flex items-center justify-between border-t border-bark-900/10 pt-3 text-xs text-bark-600">
            <span className="num">{dims(p.heightMm, p.widthMm, p.depthMm)}</span>
            <span className="num font-semibold text-bark-800">{costRange(p.costMin, p.costMax)}</span>
          </div>
        </div>
      </Link>
    </motion.article>
  );
}
