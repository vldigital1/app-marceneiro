// Foto de perfil do WhatsApp (1024 × 1024, pensada para o recorte redondo).
//   npx tsx scripts/foto-perfil.tsx → docs/perfil-whatsapp.png e docs/perfil-whatsapp-com-nome.png
import { Resvg } from "@resvg/resvg-js";
import { writeFileSync } from "node:fs";
import { join } from "node:path";

const F = "Segoe UI, Arial, Helvetica, sans-serif";
const N = 1024;

function logo(cx: number, cy: number, s: number) {
  // ícone do app: quadrado madeira com veios + lápis de marceneiro
  const h = s / 2;
  return `
  <g transform="translate(${cx - h} ${cy - h}) scale(${s / 64})">
    <rect width="64" height="64" rx="15" fill="url(#madeira)"/>
    <rect x="1" y="1" width="62" height="62" rx="14" fill="none" stroke="#fbe7c4" stroke-opacity="0.35" stroke-width="1.2"/>
    <path d="M12 22c11-4.2 29-4.2 40 0M12 32c11-4.2 29-4.2 40 0M12 42c11-4.2 29-4.2 40 0" stroke="#5a3d26" stroke-width="3.2" fill="none" stroke-linecap="round"/>
    <path d="M19 53 L45 11" stroke="#fbf6ee" stroke-width="5" stroke-linecap="round"/>
    <path d="M45 11 L48.5 5.5" stroke="#2f7d4a" stroke-width="5" stroke-linecap="round"/>
  </g>`;
}

const defs = `<defs>
  <radialGradient id="fundo" cx="50%" cy="42%" r="70%">
    <stop offset="0" stop-color="#3a2616"/><stop offset="0.6" stop-color="#22160d"/><stop offset="1" stop-color="#140d08"/>
  </radialGradient>
  <linearGradient id="madeira" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stop-color="#e2b46e"/><stop offset="0.55" stop-color="#cd9a54"/><stop offset="1" stop-color="#a8742f"/>
  </linearGradient>
  <filter id="sombra" x="-30%" y="-30%" width="160%" height="160%"><feDropShadow dx="0" dy="18" stdDeviation="22" flood-color="#000" flood-opacity="0.55"/></filter>
</defs>`;

const fundo = `<rect width="${N}" height="${N}" fill="url(#fundo)"/>
<circle cx="${N / 2}" cy="${N / 2}" r="${N / 2 - 6}" fill="none" stroke="#cd9a54" stroke-opacity="0.25" stroke-width="4"/>`;

const soIcone = `<svg xmlns="http://www.w3.org/2000/svg" width="${N}" height="${N}" viewBox="0 0 ${N} ${N}">${defs}${fundo}
<g filter="url(#sombra)">${logo(N / 2, N / 2, 520)}</g></svg>`;

const comNome = `<svg xmlns="http://www.w3.org/2000/svg" width="${N}" height="${N}" viewBox="0 0 ${N} ${N}">${defs}${fundo}
<g filter="url(#sombra)">${logo(N / 2, 430, 400)}</g>
<text x="${N / 2}" y="740" text-anchor="middle" font-family="${F}" font-size="66" font-weight="800" fill="#fbf6ee">App do</text>
<text x="${N / 2}" y="818" text-anchor="middle" font-family="${F}" font-size="66" font-weight="800" fill="#cd9a54">Marceneiro</text></svg>`;

for (const [nome, svg] of [["perfil-whatsapp.png", soIcone], ["perfil-whatsapp-com-nome.png", comNome]] as const) {
  const png = new Resvg(svg, { fitTo: { mode: "width", value: N }, font: { loadSystemFonts: true, defaultFontFamily: "Segoe UI" } }).render().asPng();
  writeFileSync(join(process.cwd(), "docs", nome), png);
  console.log(nome, Math.round(png.length / 1024), "KB");
}
