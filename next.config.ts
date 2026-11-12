import { existsSync, readFileSync } from "node:fs";
import type { NextConfig } from "next";

// Dois jeitos de publicar:
// • Hostinger (padrão): exportação estática → pasta out/ + API em PHP (server/api).
//   Numa subpasta (ex.: seudominio.com/projeto), rode com BASE_PATH=/projeto.
// • Vercel (VERCEL=1, definido pela própria Vercel): app Next normal + API em src/app/api/[nome]/route.vercel.ts.
const vercel = Boolean(process.env.VERCEL);
const basePath = vercel ? "" : (process.env.BASE_PATH ?? "").replace(/\/$/, "");

// domínios autorizados (proteção contra cópia)
const OFICIAIS = ["appmarceneiro.online", "www.appmarceneiro.online", "loja.appmarceneiro.online"];
const dominiosArquivo = existsSync("config-servidor.json") ? (JSON.parse(readFileSync("config-servidor.json", "utf8")).dominios as string[]) : [];
const dominiosVercel = [OFICIAIS.join(","), process.env.VERCEL_ENV ? "" : "localhost,127.0.0.1", process.env.DOMINIOS ?? "", process.env.VERCEL_PROJECT_PRODUCTION_URL ?? "", process.env.VERCEL_URL ?? "", process.env.VERCEL_BRANCH_URL ?? ""]
  .flatMap((d) => d.split(","))
  .map((d) => d.trim().toLowerCase().replace(/^https?:\/\//, "").replace(/\/.*$/, ""))
  .filter(Boolean);
const dominios = [...new Set(vercel ? dominiosVercel : [...OFICIAIS, ...dominiosArquivo])].join(",");

const seguranca = [
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Content-Security-Policy", value: "frame-ancestors 'self'" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "same-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
];

const nextConfig: NextConfig = {
  ...(vercel
    ? {
        pageExtensions: ["tsx", "ts", "vercel.ts"],
        outputFileTracingIncludes: { "/api/[nome]": ["./dados-protegidos/**/*"] },
        headers: async () => [{ source: "/:path*", headers: seguranca }],
      }
    : { output: "export" as const }),
  trailingSlash: true,
  images: { unoptimized: true },
  basePath: basePath || undefined,
  productionBrowserSourceMaps: false,
  poweredByHeader: false,
  env: { NEXT_PUBLIC_BASE_PATH: basePath, NEXT_PUBLIC_DOMINIOS: dominios },
};

export default nextConfig;
