// Imagens de remarketing: certificado do curso + mensagem de honestidade.
//   npx tsx scripts/rmkt.tsx                       → modelos (nome "Seu Nome Aqui")
//   NOME="João da Silva" npx tsx scripts/rmkt.tsx  → certificado personalizado
import { Resvg } from "@resvg/resvg-js";
import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { MODULOS } from "../src/content/curso";
import { lookResolverFor, projectDefs } from "../src/data";
import { renderAssembled } from "../src/lib/render3d";

const SANS = "Segoe UI, Arial, sans-serif";
const SERIF = "Georgia, Times New Roman, serif";
const SCRIPT = "Segoe Script, Gabriola, cursive";
const NOME = process.env.NOME ?? "Seu Nome Aqui";
const DATA = process.env.DATA ?? new Date().toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" });
const CARGA = process.env.CARGA ?? "6";
const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;");

function render3d(slug: string, px: number) {
  const d = projectDefs.find((p) => p.slug === slug);
  if (!d?.parts) throw new Error(`sem modelo: ${slug}`);
  const svg = renderAssembled(d.parts, lookResolverFor(d), 800, 600, { claro: true, frame: false })
    .replace(/<rect width="800" height="600" fill="url\(#bg[^"]*\)"\/>/, "")
    .replace(/<g stroke="#9a6528"[^>]*>.*?<\/g>/s, "")
    .replace(/<polygon [^>]*filter="url\(#blur2?\)"\/>/g, "");
  return `data:image/png;base64,${Buffer.from(new Resvg(svg, { fitTo: { mode: "width", value: px }, background: "rgba(0,0,0,0)" }).render().asPng()).toString("base64")}`;
}

const logo = (x: number, y: number, s: number) => `
<g transform="translate(${x} ${y}) scale(${s / 64})">
  <rect width="64" height="64" rx="15" fill="#cd9a54"/>
  <path d="M12 22c11-4.2 29-4.2 40 0M12 32c11-4.2 29-4.2 40 0M12 42c11-4.2 29-4.2 40 0" stroke="#5a3d26" stroke-width="3.2" fill="none" stroke-linecap="round"/>
  <path d="M19 53 L45 11" stroke="#fbf6ee" stroke-width="5" stroke-linecap="round"/>
  <path d="M45 11 L48.5 5.5" stroke="#2f7d4a" stroke-width="5" stroke-linecap="round"/>
</g>`;

const salvar = (nome: string, svg: string, w: number) => {
  const png = new Resvg(svg, { fitTo: { mode: "width", value: w }, font: { loadSystemFonts: true, defaultFontFamily: "Georgia" } }).render().asPng();
  writeFileSync(join(process.cwd(), "docs", nome), png);
  console.log(nome, Math.round(png.length / 1024), "KB");
};

// ───────────────────────── CERTIFICADO (1600 × 1131, paisagem A4) ─────────────────────────
{
  const W = 1600;
  const H = 1131;
  const gr = render3d("guarda-roupa-5-portas-4-gavetas", 420);
  const ap = render3d("aparador-retro-pes-palito", 420);
  const aulas = MODULOS.reduce((n, m) => n + m.topicos.length, 0);
  const mods = MODULOS.map((m) => m.titulo);
  const col = (i: number) => (i < 4 ? 0 : 1);
  const nomeSize = NOME.length > 26 ? 60 : 76;

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
<defs>
  <linearGradient id="papel" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fffdf8"/><stop offset="1" stop-color="#f6ecdc"/></linearGradient>
  <linearGradient id="madeira" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#6b4528"/><stop offset="0.5" stop-color="#8a5a33"/><stop offset="1" stop-color="#5a3a22"/></linearGradient>
  <linearGradient id="ouro" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f0cf8a"/><stop offset="0.5" stop-color="#cd9a54"/><stop offset="1" stop-color="#9a6528"/></linearGradient>
  <pattern id="veio" width="1600" height="22" patternUnits="userSpaceOnUse"><path d="M0 11 C 400 4, 800 18, 1600 9" stroke="#000" stroke-opacity="0.12" stroke-width="2" fill="none"/></pattern>
</defs>
<!-- moldura de madeira -->
<rect width="${W}" height="${H}" fill="url(#madeira)"/>
<rect width="${W}" height="${H}" fill="url(#veio)"/>
<rect x="34" y="34" width="${W - 68}" height="${H - 68}" rx="6" fill="url(#papel)"/>
<rect x="56" y="56" width="${W - 112}" height="${H - 112}" fill="none" stroke="#cd9a54" stroke-width="3"/>
<rect x="66" y="66" width="${W - 132}" height="${H - 132}" fill="none" stroke="#cd9a54" stroke-width="1" stroke-opacity="0.6"/>
${[[66, 66], [W - 66, 66], [66, H - 66], [W - 66, H - 66]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="9" fill="url(#ouro)"/>`).join("")}

<!-- móveis -->
<image x="64" y="${H - 410}" width="310" height="232" xlink:href="${ap}" opacity="0.9"/>
<image x="${W - 400}" y="${H - 440}" width="330" height="248" xlink:href="${gr}" opacity="0.9"/>

<!-- topo -->
${logo(W / 2 - 34, 96, 68)}
<text x="${W / 2}" y="200" text-anchor="middle" font-family="${SANS}" font-size="22" font-weight="700" fill="#9a6528" letter-spacing="6">APP DO MARCENEIRO</text>
<text x="${W / 2}" y="292" text-anchor="middle" font-family="${SERIF}" font-size="92" font-weight="700" fill="#24180f" letter-spacing="4">CERTIFICADO</text>
<text x="${W / 2}" y="340" text-anchor="middle" font-family="${SERIF}" font-size="30" font-style="italic" fill="#9a6528">de Conclusão · Curso de Marcenaria</text>

<!-- selo -->
<g transform="translate(${W - 250} 120)">
  <circle cx="80" cy="80" r="78" fill="url(#ouro)"/>
  <circle cx="80" cy="80" r="64" fill="none" stroke="#fffdf8" stroke-width="2" stroke-dasharray="4 5"/>
  <text x="80" y="66" text-anchor="middle" font-family="${SANS}" font-size="15" font-weight="800" fill="#3a2616">CURSO</text>
  <text x="80" y="94" text-anchor="middle" font-family="${SANS}" font-size="30" font-weight="900" fill="#24180f">100%</text>
  <text x="80" y="116" text-anchor="middle" font-family="${SANS}" font-size="15" font-weight="800" fill="#3a2616">ONLINE</text>
</g>

<!-- texto -->
<text x="${W / 2}" y="412" text-anchor="middle" font-family="${SERIF}" font-size="28" fill="#4a3526">Certificamos que</text>
<text x="${W / 2}" y="${508}" text-anchor="middle" font-family="${SCRIPT}" font-size="${nomeSize}" fill="#24180f">${esc(NOME)}</text>
<line x1="${W / 2 - 420}" y1="534" x2="${W / 2 + 420}" y2="534" stroke="#cd9a54" stroke-width="2"/>
<text x="${W / 2}" y="588" text-anchor="middle" font-family="${SERIF}" font-size="26" fill="#4a3526">concluiu com dedicação o Curso de Marcenaria do App do Marceneiro,</text>
<text x="${W / 2}" y="626" text-anchor="middle" font-family="${SERIF}" font-size="26" fill="#4a3526">com ${MODULOS.length} módulos, ${aulas} aulas práticas e carga horária de ${CARGA} horas.</text>
<g transform="translate(${W / 2 - 110} ${H - 262})">
  <rect width="220" height="120" rx="14" fill="#f5ead8" stroke="#cd9a54"/>
  <text x="110" y="40" text-anchor="middle" font-family="${SANS}" font-size="16" font-weight="700" fill="#9a6528" letter-spacing="2">CARGA HORÁRIA</text>
  <text x="110" y="96" text-anchor="middle" font-family="${SERIF}" font-size="54" font-weight="700" fill="#24180f">${CARGA}h</text>
</g>

<!-- módulos -->
<g font-family="${SANS}" font-size="19" fill="#4a3526">
${mods
  .map((m, i) => {
    const x = col(i) === 0 ? W / 2 - 380 : W / 2 + 20;
    const y = 690 + (col(i) === 0 ? i : i - 4) * 34;
    return `<circle cx="${x}" cy="${y - 6}" r="6" fill="#2f7d4a"/><text x="${x + 18}" y="${y}">Módulo ${i + 1} · ${esc(m)}</text>`;
  })
  .join("\n")}
</g>

<!-- rodapé -->
<g font-family="${SANS}">
  <line x1="${W / 2 - 520}" y1="${H - 168}" x2="${W / 2 - 160}" y2="${H - 168}" stroke="#4a3526" stroke-width="1.5"/>
  <text x="${W / 2 - 340}" y="${H - 180}" text-anchor="middle" font-family="${SERIF}" font-size="28" font-style="italic" fill="#24180f">${esc(DATA)}</text>
  <text x="${W / 2 - 340}" y="${H - 140}" text-anchor="middle" font-size="17" font-weight="700" fill="#9a6528" letter-spacing="2">DATA DE CONCLUSÃO</text>

  <line x1="${W / 2 + 160}" y1="${H - 168}" x2="${W / 2 + 520}" y2="${H - 168}" stroke="#4a3526" stroke-width="1.5"/>
  <text x="${W / 2 + 340}" y="${H - 180}" text-anchor="middle" font-family="${SCRIPT}" font-size="34" fill="#24180f">App do Marceneiro</text>
  <text x="${W / 2 + 340}" y="${H - 140}" text-anchor="middle" font-size="17" font-weight="700" fill="#9a6528" letter-spacing="2">COORDENAÇÃO DO CURSO</text>
</g>
<text x="${W / 2}" y="${H - 86}" text-anchor="middle" font-family="${SERIF}" font-size="19" font-style="italic" fill="#8a6a50">"Medir duas vezes, cortar uma." · appmarceneiro.online</text>
</svg>`;
  const arq = process.env.NOME ? `certificado-${NOME.toLowerCase().normalize("NFD").replace(/[^a-z0-9]+/g, "-")}.png` : "certificado-modelo.png";
  salvar(arq, svg, W);
}

// ───────────────────────── HONESTIDADE (1080 × 1350, retrato) ─────────────────────────
if (!process.env.NOME) {
  const W = 1080;
  const H = 1350;
  const bancada = render3d("bancada-de-marcenaria-120-x-60-cm", 560);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
<defs>
  <linearGradient id="ceu" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#fff6e6"/><stop offset="0.45" stop-color="#f9dfb4"/><stop offset="0.75" stop-color="#eab27a"/><stop offset="1" stop-color="#7a4a26"/>
  </linearGradient>
  <radialGradient id="sol" cx="50%" cy="66%" r="38%"><stop offset="0" stop-color="#fff2c9" stop-opacity="0.95"/><stop offset="1" stop-color="#fff2c9" stop-opacity="0"/></radialGradient>
  <linearGradient id="chao" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#6b4528"/><stop offset="1" stop-color="#2e1c10"/></linearGradient>
</defs>
<rect width="${W}" height="${H}" fill="url(#ceu)"/>
<rect width="${W}" height="${H}" fill="url(#sol)"/>
<!-- raios -->
<g opacity="0.18" stroke="#fffaf0" stroke-width="3">
${Array.from({ length: 18 }, (_, i) => {
  const a = Math.PI + (i * Math.PI) / 17;
  return `<line x1="540" y1="900" x2="${540 + Math.cos(a) * 900}" y2="${900 + Math.sin(a) * 900}"/>`;
}).join("")}
</g>
<!-- colinas -->
<path d="M0 960 C 200 900, 380 930, 540 905 C 720 880, 880 920, 1080 890 L1080 ${H} L0 ${H} Z" fill="#a8743f" opacity="0.55"/>
<path d="M0 1010 C 240 970, 420 1000, 600 975 C 800 950, 940 990, 1080 965 L1080 ${H} L0 ${H} Z" fill="url(#chao)"/>
<!-- bancada -->
<image x="${W / 2 - 230}" y="900" width="460" height="345" xlink:href="${bancada}"/>

<!-- texto -->
<text x="${W / 2}" y="150" text-anchor="middle" font-family="${SERIF}" font-size="64" font-style="italic" fill="#5a3a22">Deus honra a</text>
<text x="${W / 2}" y="262" text-anchor="middle" font-family="${SERIF}" font-size="118" font-weight="700" fill="#3a2414" letter-spacing="1">Honestidade</text>
<path d="M${W / 2 - 160} 300 Q ${W / 2} 322 ${W / 2 + 160} 300" stroke="#9a6528" stroke-width="3" fill="none"/>
<text x="${W / 2}" y="368" text-anchor="middle" font-family="${SERIF}" font-size="38" fill="#4a2e1a">e recompensa cada esforço</text>
<text x="${W / 2}" y="418" text-anchor="middle" font-family="${SERIF}" font-size="38" fill="#4a2e1a">feito com <tspan fill="#9a5a1e" font-weight="700">fé</tspan> e <tspan fill="#9a5a1e" font-weight="700">integridade</tspan>.</text>

<!-- versículo -->
<rect x="150" y="470" width="${W - 300}" height="250" rx="22" fill="#fffaf2" fill-opacity="0.78" stroke="#cd9a54" stroke-opacity="0.6"/>
<text x="200" y="545" font-family="${SERIF}" font-size="80" fill="#cd9a54">“</text>
<text x="${W / 2}" y="560" text-anchor="middle" font-family="${SERIF}" font-size="33" font-style="italic" fill="#3a2414">E não nos cansemos de fazer o bem,</text>
<text x="${W / 2}" y="604" text-anchor="middle" font-family="${SERIF}" font-size="33" font-style="italic" fill="#3a2414">porque a seu tempo <tspan font-weight="700" fill="#9a5a1e">ceifaremos</tspan>,</text>
<text x="${W / 2}" y="648" text-anchor="middle" font-family="${SERIF}" font-size="33" font-style="italic" fill="#3a2414">se não houvermos desfalecido.</text>
<text x="${W / 2}" y="696" text-anchor="middle" font-family="${SANS}" font-size="24" font-weight="700" fill="#9a6528" letter-spacing="3">GÁLATAS 6:9</text>

<!-- rodapé -->
<rect x="0" y="${H - 110}" width="${W}" height="110" fill="#24180f" fill-opacity="0.92"/>
<text x="${W / 2}" y="${H - 62}" text-anchor="middle" font-family="${SERIF}" font-size="30" font-style="italic" fill="#fbf6ee">Quem trabalha com honestidade colhe com</text>
<text x="${W / 2}" y="${H - 24}" text-anchor="middle" font-family="${SERIF}" font-size="30" font-style="italic" fill="#cd9a54">abundância e propósito.</text>
</svg>`;
  salvar("honestidade.png", svg, W);
}
