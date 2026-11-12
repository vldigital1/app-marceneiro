// Roda antes do `next build`: para cada projeto gera os renders 3D em SVG
// (public/renders/<slug>/3d|explodida|vistas.svg) e o PDF com essas ilustrações (public/pdf/<slug>.pdf).
import { copyFileSync, existsSync, mkdirSync, readdirSync, rmSync, statSync, unlinkSync, rmdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { Document, Image, Page, StyleSheet, Text, View, renderToFile } from "@react-pdf/renderer";
import { Resvg } from "@resvg/resvg-js";
import { getProjects, lookResolverFor, projectDefs, projetoParaServidor } from "../src/data";
import { MODULOS } from "../src/content/curso";
import { VIDEOS } from "../src/content/videos";
import { TIPOS, calcular, valoresPadrao } from "../src/lib/configurador";
import { LOOKS } from "../src/lib/render3d";
import { configPhp, lerConfig } from "./config-servidor";
import { renderAssembled, renderExploded, renderViews } from "../src/lib/render3d";
import type { Project } from "../src/data/model";
import { site } from "../src/lib/site";
import { CATEGORIES, DIFFICULTIES, GRAIN_LABEL, costRange, label } from "../src/lib/taxonomy";

// Helvetica padrão do PDF usa WinAnsi: troca símbolos que ela não tem.
const t = (s: string) =>
  s
    .replace(/≈\s?/g, "aprox. ")
    .replace(/→/g, "->")
    .replace(/↻/g, "(girada)")
    .replace(/[⚠️✓]/gu, "")
    .replace(/ | /g, " ");

const C = { bark: "#24180f", bark7: "#4a3526", wood: "#cd9a54", wood1: "#f5ead8", line: "#e3d6c2" };

const s = StyleSheet.create({
  page: { paddingTop: 36, paddingBottom: 48, paddingHorizontal: 36, fontFamily: "Helvetica", fontSize: 9.5, color: C.bark, lineHeight: 1.4 },
  band: { backgroundColor: C.bark, padding: 14, marginBottom: 14, borderRadius: 4 },
  brand: { color: C.wood, fontSize: 8, letterSpacing: 1.5, marginBottom: 4 },
  title: { color: "#fbf6ee", fontSize: 20, fontFamily: "Helvetica-Bold" },
  meta: { color: "#ead5b3", fontSize: 8.5, marginTop: 4 },
  h2: { fontSize: 12, fontFamily: "Helvetica-Bold", marginTop: 14, marginBottom: 6, color: C.bark, borderBottomWidth: 2, borderBottomColor: C.wood, paddingBottom: 3 },
  grid: { flexDirection: "row", gap: 6, marginTop: 4 },
  box: { flex: 1, borderWidth: 1, borderColor: C.line, borderRadius: 3, padding: 6 },
  boxK: { fontSize: 7.5, color: C.bark7 },
  boxV: { fontSize: 10.5, fontFamily: "Helvetica-Bold" },
  tr: { flexDirection: "row", borderBottomWidth: 0.6, borderBottomColor: C.line, paddingVertical: 3 },
  th: { flexDirection: "row", backgroundColor: C.wood1, paddingVertical: 4, fontFamily: "Helvetica-Bold", fontSize: 8 },
  cell: { paddingHorizontal: 3 },
  step: { flexDirection: "row", marginBottom: 4 },
  stepN: { width: 18, fontFamily: "Helvetica-Bold", color: C.wood },
  warn: { backgroundColor: C.wood1, borderLeftWidth: 3, borderLeftColor: C.wood, padding: 5, marginBottom: 4 },
  footer: { position: "absolute", bottom: 20, left: 36, right: 36, flexDirection: "row", justifyContent: "space-between", fontSize: 7.5, color: C.bark7 },
});

function Table({ cols, rows }: { cols: { h: string; w: number; right?: boolean }[]; rows: (string | number)[][] }) {
  return (
    <View>
      <View style={s.th} fixed>
        {cols.map((c) => (
          <Text key={c.h} style={[s.cell, { width: `${c.w}%`, textAlign: c.right ? "right" : "left" }]}>
            {c.h}
          </Text>
        ))}
      </View>
      {rows.map((r, i) => (
        <View key={i} style={s.tr} wrap={false}>
          {r.map((v, j) => (
            <Text key={j} style={[s.cell, { width: `${cols[j].w}%`, textAlign: cols[j].right ? "right" : "left" }]}>
              {t(String(v))}
            </Text>
          ))}
        </View>
      ))}
    </View>
  );
}

type Pics = { d3: Buffer; exp: Buffer; views: Buffer } | null;

function ProjectPdf({ p, pics }: { p: Project; pics: Pics }) {
  return (
    <Document title={p.title} author={site.name} subject="Projeto de marcenaria" language="pt-BR">
      <Page size="A4" style={s.page}>
        <View style={s.band}>
          <Text style={s.brand}>{site.name.toUpperCase()} · PROJETO DE MARCENARIA</Text>
          <Text style={s.title}>{t(p.title)}</Text>
          <Text style={s.meta}>
            {label(CATEGORIES, p.category)} · Nível {label(DIFFICULTIES, p.difficulty).toLowerCase()} · {t(p.estimatedTime)} · Custo estimado {costRange(p.costMin, p.costMax)}
          </Text>
        </View>
        {pics && <Image src={{ data: pics.d3, format: "png" }} style={{ width: "100%", borderRadius: 4, marginBottom: 8 }} />}
        <Text>{t(p.summary)}</Text>

        <View style={s.grid}>
          {[
            ["Altura", `${p.heightMm} mm`],
            ["Largura", `${p.widthMm} mm`],
            ["Profundidade", `${p.depthMm} mm`],
            ["Peças", String(p.cutList.reduce((a, c) => a + c.quantity, 0))],
          ].map(([k, v]) => (
            <View key={k} style={s.box}>
              <Text style={s.boxK}>{k}</Text>
              <Text style={s.boxV}>{v}</Text>
            </View>
          ))}
        </View>

        {pics && (
          <View break>
            <Text style={s.h2}>Vista explodida</Text>
            <Image src={{ data: pics.exp, format: "png" }} style={{ width: "100%" }} />
            <Text style={s.h2}>Vistas técnicas</Text>
            <Image src={{ data: pics.views, format: "png" }} style={{ width: "100%" }} />
          </View>
        )}

        <Text style={s.h2}>Ferramentas</Text>
        <Text>{t(p.toolsRequired.join(" · "))}</Text>

        <Text style={s.h2}>Lista de materiais</Text>
        <Table
          cols={[
            { h: "Item", w: 28 },
            { h: "Material", w: 27 },
            { h: "Esp.", w: 8, right: true },
            { h: "Quantidade", w: 29 },
            { h: "Perda", w: 8, right: true },
          ]}
          rows={p.materialsList.map((m) => [m.item, m.material, m.thickness ? `${m.thickness}` : "-", m.quantity, `${Math.round(m.wasteFactor * 100)}%`])}
        />

        <Text style={s.h2}>Lista de corte (mm)</Text>
        <Table
          cols={[
            { h: "Peça", w: 34 },
            { h: "Qtd", w: 7, right: true },
            { h: "Compr.", w: 10, right: true },
            { h: "Larg.", w: 9, right: true },
            { h: "Esp.", w: 7, right: true },
            { h: "Veio", w: 13 },
            { h: "Material", w: 20 },
          ]}
          rows={p.cutList.map((c) => [c.pieceName, c.quantity, c.length, c.width, c.thickness, GRAIN_LABEL[c.grainDirection], c.material])}
        />

        <Text style={s.h2}>Junção</Text>
        <Text style={{ fontFamily: "Helvetica-Bold" }}>{t(p.joineryType)}</Text>
        <Text>{t(p.joineryJustification)}</Text>

        <Text style={s.h2}>Ferragens e consumíveis</Text>
        <Table
          cols={[
            { h: "Item", w: 75 },
            { h: "Quantidade", w: 25, right: true },
          ]}
          rows={p.hardware.map((h) => [h.item, h.quantity])}
        />

        <Text style={s.h2}>Acabamento</Text>
        <Text>{t(p.finish)}</Text>

        <Text style={s.h2}>Montagem passo a passo</Text>
        {p.assemblySteps.map((st, i) => (
          <View key={i} style={s.step} wrap={false}>
            <Text style={s.stepN}>{i + 1}.</Text>
            <Text style={{ flex: 1 }}>{t(st)}</Text>
          </View>
        ))}

        <Text style={s.h2}>Pontos de atenção</Text>
        {p.warnings.map((w, i) => (
          <Text key={i} style={s.warn} wrap={false}>
            {t(w)}
          </Text>
        ))}

        <View style={s.footer} fixed>
          <Text>
            {site.name} · {t(p.title)} · Confira as medidas no local antes de cortar.
          </Text>
          <Text render={({ pageNumber, totalPages }) => `${pageNumber}/${totalPages}`} />
        </View>
      </Page>
    </Document>
  );
}

const png = (svg: string, width: number) => Buffer.from(new Resvg(svg, { fitTo: { mode: "width", value: width }, font: { loadSystemFonts: true, defaultFontFamily: "Arial" } }).render().asPng());

/** apaga pasta gerada (na pasta do OneDrive o rmSync às vezes "finge" que apagou) */
function limpar(dir: string) {
  rmSync(dir, { recursive: true, force: true, maxRetries: 3 });
  if (!existsSync(dir)) return;
  const apagar = (d: string) => {
    for (const f of readdirSync(d)) {
      const p = join(d, f);
      if (statSync(p).isDirectory()) apagar(p);
      else unlinkSync(p);
    }
    rmdirSync(d);
  };
  apagar(dir);
  if (existsSync(dir)) throw new Error(`Não consegui apagar ${dir}. Feche programas usando essa pasta e rode de novo.`);
}

async function main() {
  const root = process.cwd();
  const pub = (...p: string[]) => join(root, "public", ...p);
  const base = (process.env.BASE_PATH ?? "").replace(/\/$/, "");
  const escrever = (arq: string, conteudo: string | Buffer) => {
    mkdirSync(join(arq, ".."), { recursive: true });
    writeFileSync(arq, conteudo);
  };

  // limpa tudo que é gerado: evita sobrar arquivo de projeto que passou a ser exclusivo
  for (const d of ["pdf", "renders", "api", "plano-de-corte"]) limpar(pub(d));

  // plano de corte: página independente copiada para dentro do site
  mkdirSync(pub("plano-de-corte"), { recursive: true });
  copyFileSync(join(root, "standalone", "plano-de-corte", "index.html"), pub("plano-de-corte", "index.html"));

  // ── app instalável (PWA): manifesto + ícones
  const logo = (px: number) =>
    png(
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="${px}" height="${px}"><rect width="32" height="32" fill="#1a120c"/><rect x="3" y="3" width="26" height="26" rx="6" fill="#cd9a54"/><path d="M8 11.5c4.5-1.8 11.5-1.8 16 0M8 16c4.5-1.8 11.5-1.8 16 0M8 20.5c4.5-1.8 11.5-1.8 16 0" stroke="#33241a" stroke-width="1.5" fill="none" stroke-linecap="round"/><path d="M10 25 L22 7" stroke="#fbf6ee" stroke-width="2" stroke-linecap="round"/></svg>`,
      px,
    );
  writeFileSync(pub("icone-192.png"), logo(192));
  writeFileSync(pub("icone-512.png"), logo(512));
  writeFileSync(
    pub("manifest.webmanifest"),
    JSON.stringify({ id: `${base}/`, name: site.name, short_name: "Marceneiro", categories: ["education", "productivity", "lifestyle"], orientation: "portrait", description: site.description, lang: "pt-BR", start_url: `${base}/`, scope: `${base}/`, display: "standalone", background_color: "#1a120c", theme_color: "#1a120c", icons: [192, 512].map((n) => ({ src: `${base}/icone-${n}.png`, sizes: `${n}x${n}`, type: "image/png", purpose: "any maskable" })) }, null, 2),
  );

  // ── Google Play (TWA): prova que o app da loja é dono deste domínio.
  // Na Vercel: TWA_PACOTE (ex.: online.appmarceneiro.app) e TWA_SHA256 (impressão digital SHA-256 da chave de assinatura do Play Console).
  limpar(pub(".well-known"));
  if (process.env.TWA_PACOTE && process.env.TWA_SHA256) {
    escrever(
      pub(".well-known", "assetlinks.json"),
      JSON.stringify(
        [
          {
            relation: ["delegate_permission/common.handle_all_urls"],
            target: { namespace: "android_app", package_name: process.env.TWA_PACOTE, sha256_cert_fingerprints: process.env.TWA_SHA256.split(",").map((x) => x.trim().toUpperCase()) },
          },
        ],
        null,
        2,
      ),
    );
    console.log("assetlinks.json gerado para", process.env.TWA_PACOTE);
  }

  // ── API + conteúdo protegido
  // Hostinger: API em PHP dentro de public/api e dados em public/api/_dados (negado pelo .htaccess).
  // Vercel: a API é a rota src/app/api/[nome]; os dados ficam FORA de public/ (dados-protegidos/).
  const vercel = Boolean(process.env.VERCEL);
  limpar(join(root, "dados-protegidos"));
  if (!vercel) {
    const cfg = lerConfig();
    mkdirSync(pub("api", "_dados"), { recursive: true });
    for (const f of readdirSync(join(root, "server", "api"))) {
      if (f === "_dados.htaccess") copyFileSync(join(root, "server", "api", f), pub("api", "_dados", ".htaccess"));
      else copyFileSync(join(root, "server", "api", f), pub("api", f));
    }
    writeFileSync(pub("api", "_config.php"), configPhp(cfg, base), "utf8");
  }
  const protegido = (...p: string[]) => (vercel ? join(root, "dados-protegidos", ...p) : pub("api", "_dados", ...p));

  // aulas e vídeos exclusivos: só no servidor
  let aulas = 0;
  for (const m of MODULOS) if (!m.livre) for (const t of m.topicos) (escrever(protegido("aula", `${t.id}.json`), JSON.stringify(t)), aulas++);
  for (const v of VIDEOS) if (!v.livre) escrever(protegido("video", `${v.id}.json`), JSON.stringify({ youtubeId: v.youtubeId }));

  // miniaturas do configurador
  for (const tipo of TIPOS) {
    const r = calcular(tipo, valoresPadrao(tipo), tipo.coresPadrao[0], tipo.coresPadrao[1]);
    const map = new Map(r.materials.map((m) => [m.key, m.look]));
    escrever(pub("renders", "configurador", `${tipo.id}.svg`), renderAssembled(r.parts, (k) => LOOKS[map.get(k) ?? k] ?? LOOKS.pinus, 800, 600, { claro: true }));
  }

  // ── projetos: renders + PDF (exclusivos vão para a pasta protegida)
  const projects = getProjects();
  const defs = new Map(projectDefs.map((d) => [d.slug, d]));
  let i = 0,
    exclusivos = 0;
  for (const p of projects) {
    const def = defs.get(p.slug)!;
    let pics: Pics = null;
    if (def.parts?.length) {
      const look = lookResolverFor(def);
      const svgs = { "3d": renderAssembled(def.parts, look), explodida: renderExploded(def.parts, look), vistas: renderViews(def.parts, look) };
      escrever(pub("renders", p.slug, "3d.svg"), svgs["3d"]);
      for (const v of ["explodida", "vistas"] as const) escrever(p.locked ? protegido("render", p.slug, `${v}.svg`) : pub("renders", p.slug, `${v}.svg`), svgs[v]);
      pics = { d3: png(svgs["3d"], 900), exp: png(svgs.explodida, 1000), views: png(svgs.vistas, 1000) };
    }
    const pdf = p.locked ? protegido("pdf", `${p.slug}.pdf`) : pub("pdf", `${p.slug}.pdf`);
    mkdirSync(join(pdf, ".."), { recursive: true });
    await renderToFile(<ProjectPdf p={p} pics={pics} />, pdf);
    if (p.locked) {
      escrever(protegido("projeto", `${p.slug}.json`), JSON.stringify(projetoParaServidor(p)));
      exclusivos++;
    }
    if (++i % 50 === 0) console.log(`  ${i}/${projects.length}`);
  }
  console.log(`Renders 3D + PDFs: ${projects.length} projetos (${exclusivos} exclusivos protegidos), ${aulas} aulas exclusivas protegidas.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
