// PDF "2.000 Projetos de Marcenaria" — projetos completos (3D, medidas, materiais, corte, montagem)
// com chamada de PIX no meio e na última página.
//   npx tsx scripts/pdf-2mil.tsx            → gera as partes em docs/_partes e junta (python scripts/juntar-pdf.py)
//   APP_URL=seudominio.com.br npx tsx scripts/pdf-2mil.tsx
import { Document, Image, Page, StyleSheet, Text, View, renderToFile } from "@react-pdf/renderer";
import { Resvg } from "@resvg/resvg-js";
import { mkdirSync, rmSync } from "node:fs";
import { join } from "node:path";
import { pix } from "../src/content/oferta";
import { lookResolverFor, montarProjeto } from "../src/data";
import type { Project } from "../src/data/model";
import type { ProjectDef } from "../src/data/types";
import { renderAssembled } from "../src/lib/render3d";
import { CATEGORIES, DIFFICULTIES, GRAIN_LABEL, costRange, label } from "../src/lib/taxonomy";
import { variacoes } from "./variacoes";

const TOTAL = Number(process.env.TOTAL ?? 2000);
const ENDERECO = process.env.APP_URL ?? "app-marceneiro-icsj.vercel.app";
const POR_PARTE = 200;
const PASTA = join(process.cwd(), "docs", "_partes");

const C = { bark: "#24180f", bark7: "#4a3526", bark5: "#8a6a50", wood: "#cd9a54", wood6: "#9a6528", wood1: "#f5ead8", line: "#e3d6c2", paper: "#faf6ef", dark: "#1a120c", leaf: "#2f7d4a" };

// Helvetica (WinAnsi): troca/remove o que a fonte padrão do PDF não tem
const PERMITIDOS = new Set("–—‘’“”•…€™ŠšŽžŒœŸ");
const t = (s: string) =>
  [...s.replace(/≈\s?/g, "aprox. ").replace(/→/g, "->").replace(/[≥]/g, ">=").replace(/[≤]/g, "<=").replace(/ | /g, " ")]
    .filter((ch) => ch.charCodeAt(0) <= 0xff || PERMITIDOS.has(ch))
    .join("");

const s = StyleSheet.create({
  page: { paddingTop: 30, paddingBottom: 42, paddingHorizontal: 32, fontFamily: "Helvetica", fontSize: 8.5, color: C.bark, lineHeight: 1.35, backgroundColor: "#ffffff" },
  band: { backgroundColor: C.dark, paddingVertical: 10, paddingHorizontal: 12, borderRadius: 4, marginBottom: 8 },
  num: { color: C.wood, fontSize: 7.5, letterSpacing: 1.2, fontFamily: "Helvetica-Bold" },
  title: { color: "#fbf6ee", fontSize: 15, fontFamily: "Helvetica-Bold", marginTop: 2, lineHeight: 1.2 },
  meta: { color: "#e8d9c0", fontSize: 8, marginTop: 3 },
  h2: { fontSize: 10, fontFamily: "Helvetica-Bold", marginTop: 9, marginBottom: 4, paddingBottom: 2, borderBottomWidth: 1.5, borderBottomColor: C.wood, lineHeight: 1.2 },
  box: { borderWidth: 1, borderColor: C.line, borderRadius: 3, padding: 5, marginBottom: 4 },
  boxK: { fontSize: 6.5, color: C.bark5 },
  boxV: { fontSize: 10, fontFamily: "Helvetica-Bold" },
  tr: { flexDirection: "row", borderBottomWidth: 0.5, borderBottomColor: C.line, paddingVertical: 2 },
  th: { flexDirection: "row", backgroundColor: C.wood1, paddingVertical: 3, fontFamily: "Helvetica-Bold", fontSize: 7.5 },
  cell: { paddingHorizontal: 2.5 },
  step: { flexDirection: "row", marginBottom: 2.5 },
  stepN: { width: 14, fontFamily: "Helvetica-Bold", color: C.wood6 },
  rodape: { position: "absolute", bottom: 18, left: 32, right: 32, flexDirection: "row", justifyContent: "space-between", fontSize: 7, color: C.bark5 },
});

function Rodape({ texto }: { texto: string }) {
  return (
    <View style={s.rodape} fixed>
      <Text>2.000 Projetos de Marcenaria · App do Marceneiro</Text>
      <Text>{texto}</Text>
    </View>
  );
}

function Tabela({ cols, rows }: { cols: { h: string; w: number; right?: boolean }[]; rows: (string | number)[][] }) {
  return (
    <View>
      <View style={s.th}>
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

// fundo branco e sem a grade do chão: imagem ~4x mais leve no PDF
const png = (svg: string) =>
  Buffer.from(
    new Resvg(svg.replace(/fill="url\(#bg[^"]*\)"/, 'fill="#ffffff"').replace(/<g stroke="#9a6528"[^>]*>.*?<\/g>/s, ""), { fitTo: { mode: "width", value: 480 } })
      .render()
      .asPng(),
  );

function PaginaProjeto({ n, p, img }: { n: number; p: Project; img: Buffer | null }) {
  const pecas = p.cutList.reduce((a, c) => a + c.quantity, 0);
  return (
    <Page size="A4" style={s.page}>
      <View style={s.band}>
        <Text style={s.num}>PROJETO {String(n).padStart(4, "0")} DE {TOTAL.toLocaleString("pt-BR")}</Text>
        <Text style={s.title}>{t(p.title)}</Text>
        <Text style={s.meta}>
          {label(CATEGORIES, p.category)} · Nível {label(DIFFICULTIES, p.difficulty).toLowerCase()} · {t(p.estimatedTime)} · Custo estimado {costRange(p.costMin, p.costMax)}
        </Text>
      </View>

      <View style={{ flexDirection: "row", gap: 8, alignItems: "flex-start" }}>
        {img && <Image src={{ data: img, format: "png" }} style={{ width: "54%", borderRadius: 4, borderWidth: 1, borderColor: C.line }} />}
        <View style={{ flex: 1 }}>
          {[
            ["Altura × Largura × Profundidade", `${p.heightMm} × ${p.widthMm} × ${p.depthMm} mm`],
            ["Peças para cortar", String(pecas)],
            ["Junção", t(p.joineryType)],
          ].map(([k, v]) => (
            <View key={k} style={s.box}>
              <Text style={s.boxK}>{k}</Text>
              <Text style={[s.boxV, k === "Junção" ? { fontSize: 8 } : {}]}>{v}</Text>
            </View>
          ))}
          <Text style={{ color: C.bark7, fontSize: 8 }}>{t(p.summary)}</Text>
        </View>
      </View>

      <Text style={s.h2}>Lista de materiais</Text>
      <Tabela
        cols={[
          { h: "Item", w: 34 },
          { h: "Material", w: 30 },
          { h: "Esp.", w: 7, right: true },
          { h: "Quantidade", w: 29 },
        ]}
        rows={p.materialsList.map((m) => [m.item, m.material, m.thickness ? `${m.thickness}` : "-", m.quantity])}
      />

      <Text style={s.h2}>Lista de corte (mm)</Text>
      <Tabela
        cols={[
          { h: "Peça", w: 30 },
          { h: "Qtd", w: 6, right: true },
          { h: "Compr.", w: 10, right: true },
          { h: "Larg.", w: 9, right: true },
          { h: "Esp.", w: 7, right: true },
          { h: "Veio", w: 14 },
          { h: "Material", w: 24 },
        ]}
        rows={p.cutList.map((c) => [c.pieceName, c.quantity, c.length, c.width, c.thickness, GRAIN_LABEL[c.grainDirection], c.material])}
      />

      {p.hardware.length > 0 && (
        <>
          <Text style={s.h2}>Ferragens e acessórios</Text>
          <Text>{t(p.hardware.map((h) => `${h.item} (${h.quantity})`).join(" · "))}</Text>
        </>
      )}

      <Text style={s.h2}>Montagem passo a passo</Text>
      {p.assemblySteps.map((st, i) => (
        <View key={i} style={s.step} wrap={false}>
          <Text style={s.stepN}>{i + 1}.</Text>
          <Text style={{ flex: 1 }}>{t(st)}</Text>
        </View>
      ))}

      <Text style={s.h2}>Acabamento</Text>
      <Text>{t(p.finish)}</Text>

      {p.warnings.length > 0 && (
        <View style={{ backgroundColor: C.wood1, borderLeftWidth: 3, borderLeftColor: C.wood, padding: 5, marginTop: 8 }} wrap={false}>
          <Text style={{ fontFamily: "Helvetica-Bold", marginBottom: 2 }}>Atenção</Text>
          {p.warnings.slice(0, 3).map((w, i) => (
            <Text key={i}>• {t(w)}</Text>
          ))}
        </View>
      )}
      <Rodape texto={`Projeto ${String(n).padStart(4, "0")}`} />
    </Page>
  );
}

function PaginaPix({ titulo, subtitulo }: { titulo: string; subtitulo: string }) {
  return (
    <Page size="A4" style={{ ...s.page, backgroundColor: C.paper, justifyContent: "center", fontSize: 10.5, lineHeight: 1.45 }}>
      <View style={{ backgroundColor: C.dark, borderRadius: 14, padding: 28, color: "#fbf6ee" }}>
        <Text style={{ ...s.num, fontSize: 9 }}>APP DO MARCENEIRO · ACESSO COMPLETO</Text>
        <Text style={{ fontSize: 24, fontFamily: "Helvetica-Bold", marginTop: 8, marginBottom: 6, lineHeight: 1.2 }}>{titulo}</Text>
        <Text style={{ color: "#e8d9c0", marginBottom: 14 }}>{subtitulo}</Text>

        {[
          "Sob medida: monte guarda-roupa, armário, cozinha e mais nas medidas do cliente, com 3D e lista de corte na hora",
          "Plano de corte automático na chapa de 2750 × 1830 mm",
          "Aulas com perguntas e pontos, e vídeos exclusivos",
          "Projetos novos todo sábado",
        ].map((x) => (
          <Text key={x} style={{ color: "#fbf6ee", marginBottom: 3 }}>
            •  {t(x)}
          </Text>
        ))}

        <View style={{ backgroundColor: "#ffffff", borderRadius: 10, padding: 16, marginTop: 16, color: C.bark }}>
          <Text style={{ ...s.num, color: C.wood6 }}>CHAVE PIX · {pix.tipo}</Text>
          <Text style={{ fontSize: 24, fontFamily: "Courier-Bold", marginTop: 6, marginBottom: 4, lineHeight: 1.25 }}>{pix.chaveFormatada}</Text>
          <Text style={{ fontSize: 9, color: C.bark5 }}>Copia e cola (só números): {pix.chave}</Text>
          <View style={{ flexDirection: "row", marginTop: 10 }}>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 8, color: C.bark5 }}>Favorecido</Text>
              <Text style={{ fontFamily: "Helvetica-Bold" }}>{pix.favorecido}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 8, color: C.bark5 }}>Instituição</Text>
              <Text style={{ fontFamily: "Helvetica-Bold" }}>{pix.instituicao}</Text>
            </View>
          </View>
        </View>

        <View style={{ backgroundColor: C.leaf, borderRadius: 10, padding: 12, marginTop: 12 }}>
          <Text style={{ fontSize: 9, color: "#d8f0df" }}>Pagou? Envie o comprovante no WhatsApp e receba a senha de desbloqueio</Text>
          <Text style={{ fontSize: 16, fontFamily: "Helvetica-Bold", color: "#ffffff", marginTop: 2, lineHeight: 1.3 }}>+55 (47) 99738-3654</Text>
        </View>
        <Text style={{ fontSize: 9.5, color: "#bfae95", marginTop: 12 }}>{t(`${pix.mensagem} Acesse o app: ${ENDERECO}`)}</Text>
      </View>
    </Page>
  );
}

function Capa({ cats }: { cats: [string, number][] }) {
  return (
    <Page size="A4" style={{ ...s.page, backgroundColor: C.dark, color: "#fbf6ee", justifyContent: "space-between", padding: 44 }}>
      <View>
        <Text style={{ ...s.num, fontSize: 9 }}>APP DO MARCENEIRO</Text>
        <Text style={{ fontSize: 46, fontFamily: "Helvetica-Bold", marginTop: 14, lineHeight: 1.1 }}>{TOTAL.toLocaleString("pt-BR")}</Text>
        <Text style={{ fontSize: 30, fontFamily: "Helvetica-Bold", lineHeight: 1.15 }}>Projetos de Marcenaria Prontos</Text>
        <Text style={{ fontSize: 12, color: "#e8d9c0", marginTop: 12 }}>Cada projeto com imagem 3D, medidas, lista de materiais, lista de corte, ferragens e montagem passo a passo.</Text>
      </View>
      <View>
        {cats.map(([c, n]) => (
          <View key={c} style={{ flexDirection: "row", justifyContent: "space-between", borderBottomWidth: 0.5, borderBottomColor: "#4a3526", paddingVertical: 3 }}>
            <Text style={{ fontSize: 10, color: "#e8d9c0" }}>{c}</Text>
            <Text style={{ fontSize: 10, fontFamily: "Helvetica-Bold", color: C.wood }}>{n}</Text>
          </View>
        ))}
      </View>
      <Text style={{ fontSize: 9.5, color: "#bfae95" }}>{t(`Libere também o App do Marceneiro (sob medida, plano de corte, aulas e vídeos): ${ENDERECO}`)}</Text>
    </Page>
  );
}

function Indice({ itens, de, ate }: { itens: { n: number; titulo: string; cat: string }[]; de: number; ate: number }) {
  return (
    <Page size="A4" style={{ ...s.page, fontSize: 6.6, lineHeight: 1.25 }}>
      <Text style={{ fontSize: 14, fontFamily: "Helvetica-Bold", marginBottom: 6, lineHeight: 1.2 }}>
        Índice dos projetos ({de}–{ate})
      </Text>
      <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
        {itens.map((i) => (
          <Text key={i.n} style={{ width: "50%", paddingRight: 6 }}>
            <Text style={{ fontFamily: "Helvetica-Bold", color: C.wood6 }}>{String(i.n).padStart(4, "0")} </Text>
            {t(i.titulo)}
          </Text>
        ))}
      </View>
      <Rodape texto="Índice" />
    </Page>
  );
}

async function main() {
  const defs: ProjectDef[] = variacoes(TOTAL);
  if (defs.length < TOTAL) throw new Error(`Só ${defs.length} projetos disponíveis`);
  const projetos = defs.map((d, i) => ({ def: d, p: montarProjeto(d, 0), n: i + 1 }));
  console.log("projetos:", projetos.length);

  rmSync(PASTA, { recursive: true, force: true });
  mkdirSync(PASTA, { recursive: true });

  // capa + índice
  const contagem = new Map<string, number>();
  for (const { p } of projetos) contagem.set(label(CATEGORIES, p.category), (contagem.get(label(CATEGORIES, p.category)) ?? 0) + 1);
  const cats = [...contagem.entries()].sort((a, b) => b[1] - a[1]);
  const idx = projetos.map(({ n, p }) => ({ n, titulo: p.title, cat: p.category }));
  const POR_IDX = 150;
  await renderToFile(
    <Document title="2.000 Projetos de Marcenaria — App do Marceneiro" author="App do Marceneiro" language="pt-BR">
      <Capa cats={cats} />
      {Array.from({ length: Math.ceil(idx.length / POR_IDX) }, (_, k) => (
        <Indice key={k} itens={idx.slice(k * POR_IDX, (k + 1) * POR_IDX)} de={k * POR_IDX + 1} ate={Math.min(idx.length, (k + 1) * POR_IDX)} />
      ))}
    </Document>,
    join(PASTA, "000-capa.pdf"),
  );
  console.log("capa e índice ok");

  const meio = Math.floor(TOTAL / 2);
  for (let a = 0; a < projetos.length; a += POR_PARTE) {
    const lote = projetos.slice(a, a + POR_PARTE);
    const paginas = lote.map(({ def, p, n }) => {
      let img: Buffer | null = null;
      if (def.parts?.length) {
        try {
          img = png(renderAssembled(def.parts, lookResolverFor(def), 800, 600, { claro: true, dims: true, frame: false }));
        } catch {
          img = null;
        }
      }
      return (
        <>
          <PaginaProjeto key={n} n={n} p={p} img={img} />
          {n === meio && <PaginaPix key="meio" titulo="Gostando? Libere o app completo" subtitulo="Faça o PIX e receba a senha de desbloqueio no WhatsApp para usar todos os recursos do App do Marceneiro no celular." />}
        </>
      );
    });
    const ultima = a + POR_PARTE >= projetos.length;
    await renderToFile(
      <Document title="2.000 Projetos de Marcenaria" author="App do Marceneiro" language="pt-BR">
        {paginas}
        {ultima && <PaginaPix titulo="Libere o acesso ao App do Marceneiro" subtitulo="Pague via PIX, envie o comprovante no WhatsApp e receba a senha de desbloqueio para liberar tudo no app." />}
      </Document>,
      join(PASTA, `${String(a / POR_PARTE + 1).padStart(3, "0")}-projetos.pdf`),
    );
    console.log(`  projetos ${a + 1}–${a + lote.length} ok`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
