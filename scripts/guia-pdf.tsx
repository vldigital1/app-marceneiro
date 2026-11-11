// Gera docs/guia-app-do-marceneiro.pdf — guia de uso do app (com a chave PIX na última página).
//   npx tsx scripts/guia-pdf.tsx
import { Document, Image, Page, StyleSheet, Text, View, renderToFile } from "@react-pdf/renderer";
import { Resvg } from "@resvg/resvg-js";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { pix } from "../src/content/oferta";
import { MODULOS } from "../src/content/curso";
import { VIDEOS } from "../src/content/videos";
import { TIPOS } from "../src/lib/configurador";
import { PROJETOS_LIVRES, getProjects } from "../src/data";

const ENDERECO = process.env.APP_URL ?? "app-marceneiro-icsj.vercel.app";
// total de projetos divulgado no guia (quando o catálogo passar desse número, vale o número real)
const PROJETOS_ANUNCIADOS = 435;

const C = { bark: "#24180f", bark7: "#4a3526", bark5: "#8a6a50", wood: "#cd9a54", wood6: "#9a6528", wood1: "#f5ead8", paper: "#faf6ef", leaf: "#2f7d4a", leaf1: "#eef7f0", dark: "#1a120c" };

const s = StyleSheet.create({
  page: { backgroundColor: C.paper, paddingTop: 44, paddingBottom: 56, paddingHorizontal: 44, fontFamily: "Helvetica", fontSize: 10.5, color: C.bark, lineHeight: 1.5 },
  kicker: { fontSize: 8.5, fontFamily: "Helvetica-Bold", color: C.wood6, letterSpacing: 1.5, textTransform: "uppercase" },
  h1: { fontSize: 24, fontFamily: "Helvetica-Bold", marginTop: 6, marginBottom: 10, lineHeight: 1.25 },
  lead: { fontSize: 11.5, color: C.bark7, marginBottom: 16 },
  h2: { fontSize: 13, fontFamily: "Helvetica-Bold", marginTop: 14, marginBottom: 6, lineHeight: 1.3 },
  p: { marginBottom: 6, color: C.bark7 },
  card: { backgroundColor: "#ffffff", borderRadius: 8, borderWidth: 1, borderColor: "#e6dccb", padding: 12, marginBottom: 10 },
  passo: { flexDirection: "row", marginBottom: 7 },
  num: { width: 20, height: 20, borderRadius: 10, backgroundColor: C.wood, color: C.dark, fontFamily: "Helvetica-Bold", fontSize: 10, textAlign: "center", paddingTop: 3.5, marginRight: 9 },
  passoTxt: { flex: 1, color: C.bark7, paddingTop: 1.5 },
  b: { fontFamily: "Helvetica-Bold", color: C.bark },
  dica: { backgroundColor: C.leaf1, borderLeftWidth: 3, borderLeftColor: C.leaf, padding: 10, borderRadius: 4, marginTop: 8, color: C.bark7 },
  rodape: { position: "absolute", bottom: 24, left: 44, right: 44, flexDirection: "row", justifyContent: "space-between", fontSize: 8.5, color: C.bark5 },
  img: { borderRadius: 8, marginVertical: 8 },
});

const png = (svg: string, w: number) => `data:image/png;base64,${Buffer.from(new Resvg(svg, { fitTo: { mode: "width", value: w }, font: { loadSystemFonts: true } }).render().asPng()).toString("base64")}`;
const svgArq = (...p: string[]) => readFileSync(join(process.cwd(), "public", ...p), "utf8");

function Rodape() {
  return (
    <View style={s.rodape} fixed>
      <Text>App do Marceneiro · Guia de uso</Text>
      <Text render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} />
    </View>
  );
}

function Passos({ itens }: { itens: (string | [string, string])[] }) {
  return (
    <View>
      {itens.map((t, i) => (
        <View key={i} style={s.passo} wrap={false}>
          <Text style={s.num}>{i + 1}</Text>
          <Text style={s.passoTxt}>
            {Array.isArray(t) ? (
              <>
                <Text style={s.b}>{t[0]} </Text>
                {t[1]}
              </>
            ) : (
              t
            )}
          </Text>
        </View>
      ))}
    </View>
  );
}

function Secao({ kicker, titulo, lead, children }: { kicker: string; titulo: string; lead: string; children: React.ReactNode }) {
  return (
    <Page size="A4" style={s.page}>
      <Text style={s.kicker}>{kicker}</Text>
      <Text style={s.h1}>{titulo}</Text>
      <Text style={s.lead}>{lead}</Text>
      {children}
      <Rodape />
    </Page>
  );
}

async function main() {
  const projetos = getProjects();
  const totalProjetos = Math.max(PROJETOS_ANUNCIADOS, projetos.length);
  const exclusivos = totalProjetos - PROJETOS_LIVRES;
  const topicos = MODULOS.reduce((n, m) => n + m.topicos.length, 0);
  const perguntas = MODULOS.reduce((n, m) => n + m.topicos.reduce((k, t) => k + (t.perguntas?.length ?? 0), 0), 0);
  const livresMod = MODULOS.filter((m) => m.livre).length;
  const vidLivres = VIDEOS.filter((v) => v.livre).length;
  const tiposLivres = TIPOS.filter((t) => t.livre);

  const img3d = png(svgArq("renders", "guarda-roupa-5-portas-4-gavetas", "3d.svg"), 900);
  const imgCfg = png(svgArq("renders", "configurador", "guarda-roupa.svg"), 900);

  const doc = (
    <Document title="Guia de uso — App do Marceneiro" author="App do Marceneiro" language="pt-BR">
      {/* CAPA */}
      <Page size="A4" style={{ ...s.page, backgroundColor: C.dark, color: "#fbf6ee", justifyContent: "space-between" }}>
        <View>
          <Text style={{ ...s.kicker, color: C.wood }}>Guia de uso</Text>
          <Text style={{ fontSize: 40, fontFamily: "Helvetica-Bold", marginTop: 10, lineHeight: 1.15 }}>App do{"\n"}Marceneiro</Text>
          <Text style={{ fontSize: 13, color: "#e8d9c0", marginTop: 12 }}>Projetos, aulas e plano de corte para marceneiros — tudo no celular.</Text>
        </View>
        <Image src={img3d} style={{ borderRadius: 10 }} />
        <View>
          <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 14 }}>
            {[
              [String(totalProjetos), "projetos"],
              [String(TIPOS.length), "móveis sob medida"],
              [String(topicos), "aulas"],
              [String(VIDEOS.length), "vídeos"],
            ].map(([n, l]) => (
              <View key={l} style={{ width: "23%", backgroundColor: "#2a1d14", borderRadius: 8, padding: 10 }}>
                <Text style={{ fontSize: 20, fontFamily: "Helvetica-Bold", color: C.wood, lineHeight: 1.2, marginBottom: 2 }}>{n}</Text>
                <Text style={{ fontSize: 9, color: "#e8d9c0" }}>{l}</Text>
              </View>
            ))}
          </View>
          <Text style={{ fontSize: 10, color: "#bfae95" }}>Acesse: {ENDERECO}</Text>
        </View>
      </Page>

      {/* PRIMEIROS PASSOS */}
      <Secao kicker="Começando" titulo="Primeiros passos" lead="O App do Marceneiro funciona direto no navegador do celular ou do computador. Não precisa baixar nada da loja.">
        <Text style={s.h2}>Abrir o app</Text>
        <Passos itens={[["Abra o navegador", `(Chrome no Android, Safari no iPhone) e acesse ${ENDERECO}.`], ["Pronto:", "o catálogo, as aulas e os vídeos liberados já podem ser usados sem cadastro."]]} />
        <Text style={s.h2}>Colocar o ícone na tela inicial (fica igual a um aplicativo)</Text>
        <View style={s.card}>
          <Text style={s.b}>Android (Chrome)</Text>
          <Text style={s.p}>Toque nos três pontinhos no canto de cima » "Adicionar à tela inicial" (ou "Instalar app") » Adicionar.</Text>
          <Text style={s.b}>iPhone (Safari)</Text>
          <Text style={s.p}>Toque no botão de compartilhar (quadrado com seta) » "Adicionar à Tela de Início" » Adicionar.</Text>
        </View>
        <Text style={s.h2}>O menu do app</Text>
        <Text style={s.p}>No celular, o menu fica fixo na parte de baixo da tela:</Text>
        <View style={s.card}>
          {[
            ["Projetos", "catálogo com todos os projetos."],
            ["Sob medida", "monte móveis nas medidas do cliente."],
            ["Aulas", "curso com perguntas e pontos."],
            ["Vídeos", "aulas em vídeo por tema."],
            ["Mais", "Início, Plano de corte, Minha oficina, Dicas e técnicas e Desbloquear tudo."],
          ].map(([a, b]) => (
            <Text key={a} style={s.p}>
              <Text style={s.b}>{a}: </Text>
              {b}
            </Text>
          ))}
        </View>
        <Text style={s.dica}>Conteúdo com o selo "Liberado" pode ser usado por todos. O que tem cadeado (Exclusivo) é liberado com a senha de desbloqueio — veja a última parte deste guia.</Text>
      </Secao>

      {/* PROJETOS */}
      <Secao kicker="Projetos" titulo={`${totalProjetos} projetos prontos`} lead={`${PROJETOS_LIVRES} projetos liberados para todos e ${exclusivos} exclusivos, de quarto, sala, cozinha, banheiro, organização, jardim, pallet e muito mais.`}>
        <Text style={s.h2}>Encontrar um projeto</Text>
        <Passos
          itens={[
            ["Toque em Projetos", "no menu de baixo. Os projetos liberados aparecem primeiro."],
            ["Use a busca", '(ex.: "sapateira", "rack", "nicho").'],
            ["Toque em Filtros e ordem", "para escolher categoria, material, nível e ambiente, ou ordenar pelos mais fáceis ou de menor custo."],
          ]}
        />
        <Text style={s.h2}>O que tem em cada projeto</Text>
        <View style={s.card}>
          {[
            "Imagem 3D do móvel com as medidas finais (altura × largura × profundidade).",
            "Lista de material com a quantidade e a perda já calculadas.",
            "Lista de corte: peça por peça, com medidas e quantidade.",
            "Ferragens, acabamento e custo estimado.",
            "Montagem passo a passo, vista explodida e vistas técnicas.",
            "PDF para baixar e levar para a oficina.",
          ].map((t) => (
            <Text key={t} style={s.p}>
              • {t}
            </Text>
          ))}
        </View>
        <Text style={s.h2}>Dicas</Text>
        <Text style={s.p}>Toque no coração para salvar nos favoritos. Use "Estou fazendo" para acompanhar a montagem com checklist em Minha oficina.</Text>
        <Text style={s.dica}>Antes de cortar, confira as medidas do seu espaço. As medidas do projeto são as do móvel pronto.</Text>
      </Secao>

      {/* SOB MEDIDA */}
      <Secao kicker="Sob medida" titulo="Monte o móvel do seu cliente" lead={`${TIPOS.length} móveis que se ajustam às medidas que você digitar. Livres: ${tiposLivres.map((t) => t.nome.toLowerCase()).join(", ")}.`}>
        <Image src={imgCfg} style={s.img} />
        <Passos
          itens={[
            ["Escolha o móvel", "em Sob medida (guarda-roupa, armário, cozinha, estante, nicho, mesa...)."],
            ["Digite as medidas", "de altura, largura e profundidade."],
            ["Ajuste", "colunas, prateleiras, portas e gavetas nos botões de mais (+) e menos (-)."],
            ["Escolha as cores", "da caixa e das portas."],
            ["Gire o 3D", "arrastando com o dedo (toque duas vezes para voltar à posição inicial)."],
            ["Confira", '"Medidas conferidas" (verde) ou os avisos (amarelo) antes de cortar.'],
            ["Veja a lista de corte", 'separada por chapa e cor, as ferragens, e toque em "Abrir no plano de corte".'],
            ["Salve para o cliente", "com o nome dele: fica guardado em Minha oficina."],
          ]}
        />
      </Secao>

      {/* AULAS + VÍDEOS */}
      <Secao kicker="Aprender" titulo="Aulas e vídeos" lead={`${MODULOS.length} módulos com ${topicos} aulas curtas e ${perguntas} perguntas, e ${VIDEOS.length} vídeos separados por tema.`}>
        <Text style={s.h2}>Aulas com pontos</Text>
        <Passos
          itens={[
            ["Abra Aulas", `e toque em "Começar módulo". Os módulos 1 e ${livresMod} são livres.`],
            ["Leia a aula", "e responda a checagem rápida no final."],
            ["Ganhe pontos:", "10 pontos acertando de primeira, 5 na segunda tentativa e 2 depois disso."],
            ["Acompanhe o placar", "do dia, o total, os acertos e o gráfico dos últimos 7 dias."],
          ]}
        />
        <Text style={s.h2}>Vídeos</Text>
        <Passos
          itens={[
            ["Abra Vídeos", "e escolha um tema (Encaixes de canto, Ideias que vendem, Ferramentas e gabaritos, Móveis e projetos, Telhado e estrutura)."],
            ["Toque no vídeo", "da lista: ele sobe para o player."],
            ["Use os botões", "de play/pausa e volume."],
          ]}
        />
        <Text style={s.dica}>{`Os ${vidLivres} vídeos de Encaixes de canto são livres. Os demais são exclusivos.`}</Text>
      </Secao>

      {/* PLANO + OFICINA */}
      <Secao kicker="Ferramentas" titulo="Plano de corte e Minha oficina" lead="Economize chapa e organize seus trabalhos.">
        <Text style={s.h2}>Plano de corte</Text>
        <Passos
          itens={[
            ["Abra Mais » Plano de corte", "(ou o botão dentro de um projeto ou do Sob medida)."],
            ["Digite as peças", "com comprimento, largura e quantidade."],
            ["Veja o desenho da chapa", "de 2750 × 1830 mm com as peças encaixadas, o número de chapas e o aproveitamento."],
          ]}
        />
        <Text style={s.h2}>Minha oficina</Text>
        <View style={s.card}>
          <Text style={s.p}>
            <Text style={s.b}>Projetos salvos: </Text>os móveis sob medida que você salvou para cada cliente.
          </Text>
          <Text style={s.p}>
            <Text style={s.b}>Favoritos: </Text>os projetos que você marcou com o coração.
          </Text>
          <Text style={s.p}>
            <Text style={s.b}>Estou fazendo: </Text>checklist da montagem para marcar cada passo concluído.
          </Text>
        </View>
        <Text style={s.dica}>Seus favoritos, pontos e projetos salvos ficam guardados no aparelho. Use sempre o mesmo celular e o mesmo navegador.</Text>
      </Secao>

      {/* DESBLOQUEIO */}
      <Secao kicker="Acesso completo" titulo="Como liberar tudo" lead={`Com a senha de desbloqueio você libera os ${exclusivos} projetos exclusivos, todas as aulas, todos os vídeos, todos os móveis sob medida e os PDFs.`}>
        <Passos
          itens={[
            ["Faça o pagamento via PIX", "usando a chave da próxima página."],
            ["Envie o comprovante", 'no WhatsApp (botão "Enviar comprovante no WhatsApp" dentro do app).'],
            ["Receba a senha", "de desbloqueio no WhatsApp."],
            ["Digite a senha", 'em qualquer conteúdo com cadeado e toque em "Desbloquear".'],
          ]}
        />
        <View style={s.card}>
          <Text style={s.p}>
            <Text style={s.b}>Vale por 1 ano </Text>no aparelho em que a senha foi digitada.
          </Text>
          <Text style={s.p}>
            <Text style={s.b}>Maiúsculas e minúsculas </Text>não fazem diferença.
          </Text>
          <Text style={s.p}>
            <Text style={s.b}>Trocou de celular? </Text>É só digitar a senha de novo no aparelho novo.
          </Text>
        </View>
        <Text style={s.dica}>Muitas tentativas com senha errada bloqueiam por 15 minutos. Confira a senha que chegou no WhatsApp.</Text>
      </Secao>

      {/* PIX — ÚLTIMA PÁGINA */}
      <Page size="A4" style={{ ...s.page, justifyContent: "center" }}>
        <View style={{ backgroundColor: C.dark, borderRadius: 14, padding: 30, color: "#fbf6ee" }}>
          <Text style={{ ...s.kicker, color: C.wood }}>Pagamento via PIX</Text>
          <Text style={{ fontSize: 22, fontFamily: "Helvetica-Bold", marginTop: 6, lineHeight: 1.25, marginBottom: 4 }}>Desbloqueie o App do Marceneiro</Text>
          <Text style={{ fontSize: 11, color: "#e8d9c0", marginTop: 6 }}>{pix.mensagem}</Text>

          <View style={{ backgroundColor: "#ffffff", borderRadius: 10, padding: 18, marginTop: 20, color: C.bark }}>
            <Text style={{ ...s.kicker }}>Chave PIX · {pix.tipo}</Text>
            <Text style={{ fontSize: 26, fontFamily: "Courier-Bold", marginTop: 6, marginBottom: 6, letterSpacing: 1, lineHeight: 1.25 }}>{pix.chaveFormatada}</Text>
            <Text style={{ fontSize: 10, color: C.bark5, marginTop: 2 }}>Copia e cola (só números): {pix.chave}</Text>
            <View style={{ flexDirection: "row", marginTop: 14 }}>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 8.5, color: C.bark5 }}>Favorecido</Text>
                <Text style={s.b}>{pix.favorecido}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 8.5, color: C.bark5 }}>Instituição</Text>
                <Text style={s.b}>{pix.instituicao}</Text>
              </View>
            </View>
          </View>

          {pix.whatsapp ? (
            <View style={{ backgroundColor: C.leaf, borderRadius: 10, padding: 14, marginTop: 14 }}>
              <Text style={{ fontSize: 9, color: "#d8f0df" }}>Envie o comprovante no WhatsApp</Text>
              <Text style={{ fontSize: 16, fontFamily: "Helvetica-Bold", color: "#ffffff", marginTop: 2, lineHeight: 1.3 }}>+55 (47) 99738-3654</Text>
            </View>
          ) : null}

          <Text style={{ fontSize: 10, color: "#bfae95", marginTop: 16 }}>Depois de pagar, você recebe a senha de desbloqueio no WhatsApp e libera tudo no app: {ENDERECO}</Text>
        </View>
        <Rodape />
      </Page>
    </Document>
  );

  const saida = join(process.cwd(), "docs", "guia-app-do-marceneiro.pdf");
  await renderToFile(doc, saida);
  console.log("PDF:", saida);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
