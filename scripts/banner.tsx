// Banner para a primeira mensagem do funil do WhatsApp (1080 × 1080 px), com celular mostrando o app.
//   npx tsx scripts/banner.tsx   → docs/banner-whatsapp.png
import { Resvg } from "@resvg/resvg-js";
import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { lookResolverFor, projectDefs } from "../src/data";
import { renderAssembled } from "../src/lib/render3d";

const W = 1080;
const H = 1080;
const F = "Segoe UI, Arial, Helvetica, sans-serif";

/** 3D do projeto em PNG. transparente: sem fundo/grade; senão, fundo claro do app com medidas. */
function render3d(slug: string, px: number, transparente = true) {
  const d = projectDefs.find((p) => p.slug === slug);
  if (!d?.parts) throw new Error(`sem modelo: ${slug}`);
  let svg = renderAssembled(d.parts, lookResolverFor(d), 800, 600, { claro: true, frame: false, dims: !transparente });
  if (transparente) svg = svg.replace(/<rect width="800" height="600" fill="url\(#bg[^"]*\)"\/>/, "").replace(/<g stroke="#9a6528"[^>]*>.*?<\/g>/s, "");
  const png = new Resvg(svg, { fitTo: { mode: "width", value: px }, background: "rgba(0,0,0,0)" }).render().asPng();
  return `data:image/png;base64,${Buffer.from(png).toString("base64")}`;
}

const guardaTela = render3d("guarda-roupa-5-portas-4-gavetas", 700, false);
const aparador = render3d("aparador-retro-pes-palito", 600);
const mesa = render3d("mesa-de-centro-simples", 520);

const chip = (x: number, y: number, txt: string, w: number) => `
  <g transform="translate(${x} ${y})">
    <rect width="${w}" height="56" rx="28" fill="#2a1d14" stroke="#cd9a54" stroke-opacity="0.55"/>
    <circle cx="29" cy="28" r="11" fill="#2f7d4a"/>
    <path d="M23.5 28.5l4 4 7.5-8" stroke="#fff" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
    <text x="50" y="37" font-family="${F}" font-size="24" font-weight="600" fill="#fbf6ee">${txt}</text>
  </g>`;

// ── celular com a tela do app (Sob medida) ──
const PX = 0; // coordenadas internas do celular
const PW = 372;
const PH = 760;
const S = { x: 16, y: 16, w: PW - 32, h: PH - 32 }; // tela
const linha = (y: number, peca: string, med: string) => `
  <text x="${S.x + 18}" y="${y}" font-family="${F}" font-size="13.5" fill="#4a3526">${peca}</text>
  <text x="${S.x + S.w - 18}" y="${y}" text-anchor="end" font-family="Consolas, monospace" font-size="13" font-weight="700" fill="#24180f">${med}</text>
  <line x1="${S.x + 18}" y1="${y + 8}" x2="${S.x + S.w - 18}" y2="${y + 8}" stroke="#e3d6c2"/>`;
const icone = (cx: number, rot: string, ativo = false) => `
  <g transform="translate(${cx} ${S.y + S.h - 38})">
    ${ativo ? `<rect x="-30" y="-20" width="60" height="44" rx="12" fill="#f5ead8"/>` : ""}
    <rect x="-9" y="-12" width="18" height="18" rx="4" fill="none" stroke="${ativo ? "#9a6528" : "#8a6a50"}" stroke-width="2.2"/>
    <text x="0" y="20" text-anchor="middle" font-family="${F}" font-size="9.5" font-weight="700" fill="${ativo ? "#9a6528" : "#8a6a50"}">${rot}</text>
  </g>`;

const celular = `
<g id="celular">
  <!-- corpo -->
  <rect x="${PX}" y="0" width="${PW}" height="${PH}" rx="54" fill="#0d0d0f"/>
  <rect x="${PX + 3}" y="3" width="${PW - 6}" height="${PH - 6}" rx="51" fill="none" stroke="#3a3a40" stroke-width="2"/>
  <!-- tela -->
  <clipPath id="tela"><rect x="${S.x}" y="${S.y}" width="${S.w}" height="${S.h}" rx="40"/></clipPath>
  <g clip-path="url(#tela)">
    <rect x="${S.x}" y="${S.y}" width="${S.w}" height="${S.h}" fill="#faf6ef"/>
    <!-- cabeçalho do app -->
    <rect x="${S.x}" y="${S.y}" width="${S.w}" height="104" fill="#24180f"/>
    <text x="${S.x + 30}" y="${S.y + 34}" font-family="${F}" font-size="13" font-weight="700" fill="#fbf6ee">9:41</text>
    <rect x="${S.x + S.w / 2 - 50}" y="${S.y + 12}" width="100" height="28" rx="14" fill="#0d0d0f"/>
    <rect x="${S.x + 20}" y="${S.y + 56}" width="34" height="34" rx="9" fill="#cd9a54"/>
    <path d="M${S.x + 30} ${S.y + 82} L${S.x + 44} ${S.y + 62}" stroke="#fbf6ee" stroke-width="2.6" stroke-linecap="round"/>
    <text x="${S.x + 64}" y="${S.y + 80}" font-family="${F}" font-size="17" font-weight="700" fill="#fbf6ee">App do Marceneiro</text>
    <!-- título -->
    <text x="${S.x + 18}" y="${S.y + 136}" font-family="${F}" font-size="11" font-weight="700" fill="#9a6528" letter-spacing="1.5">SOB MEDIDA</text>
    <text x="${S.x + 18}" y="${S.y + 164}" font-family="${F}" font-size="24" font-weight="800" fill="#24180f">Guarda-roupa</text>
    <!-- 3D -->
    <rect x="${S.x + 14}" y="${S.y + 178}" width="${S.w - 28}" height="${(S.w - 28) * 0.75}" rx="14" fill="#ffffff" stroke="#e3d6c2"/>
    <image x="${S.x + 14}" y="${S.y + 178}" width="${S.w - 28}" height="${(S.w - 28) * 0.75}" xlink:href="${guardaTela}"/>
    <rect x="${S.x + 24}" y="${S.y + 188}" width="118" height="22" rx="6" fill="#ffffff" stroke="#e3d6c2"/>
    <text x="${S.x + 34}" y="${S.y + 203}" font-family="${F}" font-size="10" font-weight="700" fill="#4a3526">3D · ARRASTE PARA GIRAR</text>
    <!-- status -->
    <rect x="${S.x + 14}" y="${S.y + 418}" width="${S.w - 28}" height="40" rx="10" fill="#eef7f0" stroke="#3f9a5c" stroke-opacity="0.5"/>
    <circle cx="${S.x + 36}" cy="${S.y + 438}" r="9" fill="#2f7d4a"/>
    <path d="M${S.x + 31.5} ${S.y + 438.5}l3 3 6-6.5" stroke="#fff" stroke-width="2.4" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
    <text x="${S.x + 54}" y="${S.y + 443}" font-family="${F}" font-size="14" font-weight="700" fill="#25663c">Medidas conferidas</text>
    <!-- lista de corte -->
    <text x="${S.x + 18}" y="${S.y + 488}" font-family="${F}" font-size="15" font-weight="800" fill="#24180f">Lista de corte</text>
    ${linha(S.y + 514, "Lateral externa · 2", "2100 × 520")}
    ${linha(S.y + 540, "Porta lateral · 4", "1610 × 374")}
    ${linha(S.y + 566, "Frente de gaveta · 4", "747 × 200")}
    ${linha(S.y + 592, "Prateleira · 4", "730 × 500")}
    <rect x="${S.x + 14}" y="${S.y + 614}" width="${S.w - 28}" height="38" rx="19" fill="#2f7d4a"/>
    <text x="${S.x + S.w / 2}" y="${S.y + 638}" text-anchor="middle" font-family="${F}" font-size="14" font-weight="700" fill="#ffffff">Abrir no plano de corte</text>
    <!-- menu de baixo -->
    <rect x="${S.x}" y="${S.y + S.h - 66}" width="${S.w}" height="66" fill="#ffffff"/>
    <line x1="${S.x}" y1="${S.y + S.h - 66}" x2="${S.x + S.w}" y2="${S.y + S.h - 66}" stroke="#e3d6c2"/>
    ${icone(S.x + 36, "Projetos")}
    ${icone(S.x + 102, "Sob medida", true)}
    ${icone(S.x + 170, "Aulas")}
    ${icone(S.x + 236, "Vídeos")}
    ${icone(S.x + 302, "Mais")}
  </g>
  <!-- reflexo -->
  <path d="M${S.x + 10} ${S.y + 40} L${S.x + 150} ${S.y} L${S.x + 230} ${S.y} L${S.x + 10} ${S.y + 260} Z" fill="#ffffff" opacity="0.05"/>
</g>`;

const svg = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
<defs>
  <linearGradient id="fundo" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#24180f"/><stop offset="0.55" stop-color="#1a120c"/><stop offset="1" stop-color="#120c08"/>
  </linearGradient>
  <radialGradient id="luz" cx="78%" cy="52%" r="42%">
    <stop offset="0" stop-color="#cd9a54" stop-opacity="0.42"/><stop offset="1" stop-color="#cd9a54" stop-opacity="0"/>
  </radialGradient>
  <filter id="sombra" x="-30%" y="-20%" width="160%" height="150%"><feDropShadow dx="0" dy="24" stdDeviation="26" flood-color="#000" flood-opacity="0.6"/></filter>
  <pattern id="veio" width="1080" height="18" patternUnits="userSpaceOnUse">
    <path d="M0 9 C 270 3, 540 15, 1080 8" stroke="#ffffff" stroke-opacity="0.025" stroke-width="2" fill="none"/>
  </pattern>
</defs>
<rect width="${W}" height="${H}" fill="url(#fundo)"/>
<rect width="${W}" height="${H}" fill="url(#veio)"/>
<rect width="${W}" height="${H}" fill="url(#luz)"/>

<!-- logo -->
<g transform="translate(60 58)">
  <rect width="60" height="60" rx="14" fill="#cd9a54"/>
  <path d="M13 22c9-3.4 22-3.4 34 0M13 30c9-3.4 22-3.4 34 0M13 38c9-3.4 22-3.4 34 0" stroke="#33241a" stroke-width="3" fill="none" stroke-linecap="round"/>
  <path d="M19 49 L41 11" stroke="#fbf6ee" stroke-width="4" stroke-linecap="round"/>
  <text x="78" y="41" font-family="${F}" font-size="32" font-weight="700" fill="#fbf6ee">App do Marceneiro</text>
</g>

<!-- título -->
<text x="56" y="262" font-family="${F}" font-size="136" font-weight="800" fill="#cd9a54" letter-spacing="-4">+2.000</text>
<text x="60" y="330" font-family="${F}" font-size="50" font-weight="800" fill="#fbf6ee">projetos de</text>
<text x="60" y="388" font-family="${F}" font-size="50" font-weight="800" fill="#fbf6ee">marcenaria prontos</text>
<text x="60" y="436" font-family="${F}" font-size="25" fill="#e8d9c0">+ app no celular para montar</text>
<text x="60" y="468" font-family="${F}" font-size="25" fill="#e8d9c0">móveis sob medida</text>

<!-- benefícios -->
${chip(60, 500, "Lista de corte e medidas", 352)}
${chip(60, 568, "Imagem 3D de cada móvel", 362)}
${chip(60, 636, "Plano de corte na chapa", 342)}

<!-- móveis 3D -->
<image x="20" y="712" width="360" height="270" xlink:href="${mesa}"/>
<image x="250" y="680" width="420" height="315" xlink:href="${aparador}"/>

<!-- celular -->
<g transform="translate(650 120) rotate(4 186 380)" filter="url(#sombra)">${celular}</g>

<!-- selo sábado -->
<g transform="translate(560 84) rotate(-6)">
  <rect width="200" height="74" rx="16" fill="#2f7d4a"/>
  <text x="100" y="31" text-anchor="middle" font-family="${F}" font-size="17" font-weight="700" fill="#d8f0df">NOVOS PROJETOS</text>
  <text x="100" y="57" text-anchor="middle" font-family="${F}" font-size="20" font-weight="800" fill="#ffffff">TODO SÁBADO</text>
</g>

<!-- rodapé -->
<rect x="0" y="972" width="${W}" height="108" fill="#cd9a54"/>
<text x="60" y="1036" font-family="${F}" font-size="34" font-weight="800" fill="#1a120c">Libere o app completo</text>
<text x="${W - 60}" y="1036" text-anchor="end" font-family="${F}" font-size="32" font-weight="700" fill="#1a120c">appmarceneiro.online</text>
</svg>`;

const png = new Resvg(svg, { fitTo: { mode: "width", value: W }, font: { loadSystemFonts: true, defaultFontFamily: "Segoe UI" } }).render().asPng();
const saida = join(process.cwd(), "docs", "banner-whatsapp.png");
writeFileSync(saida, png);
console.log(saida, Math.round(png.length / 1024), "KB");
