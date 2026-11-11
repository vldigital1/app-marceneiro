import { board, bx, carcass, frame, openBox, pallet, table, tiltX, tiltZ, type Part } from "../../lib/model3d";
import type { MaterialDef, ProjectDef } from "../types";
import { FIN, MAT, TOOLS, WARN, cm, gen } from "./kit";

const WOOD_TOOLS = [...TOOLS.base, ...TOOLS.madeira];
const count = (parts: Part[], name: string) => parts.filter((p) => p.name === name).length;
type Esp = { nome: string; m: (t: number, bw: number) => MaterialDef; ext: boolean };
export const PINUS: Esp = { nome: "pinus", m: (t, bw) => MAT.pinus(t, bw), ext: false };
export const TAUARI: Esp = { nome: "tauari", m: (t, bw) => MAT.tauari(t, bw), ext: false };
export const CAMBARA: Esp = { nome: "cambará", m: (t, bw) => MAT.cambara(t, bw), ext: true };
export const EUCA: Esp = { nome: "eucalipto tratado", m: (t, bw) => MAT.eucalipto(t, bw), ext: true };

const JOIN_POCKET = {
  joinery: "Furo oblíquo (pocket hole) com cola nas saias + fixadores de tampo em Z",
  joineryWhy:
    "O furo oblíquo prende saias e travessas nos pés por dentro, sem parafuso aparente e sem precisar de espiga. Os fixadores em Z seguram o tampo e deixam a madeira maciça dilatar sem rachar.",
};

// ───────────────────────────── MESAS / BANCOS ─────────────────────────────
export function mesa(kind: "centro" | "lateral" | "jantar" | "infantil", W: number, D: number, H: number, esp: Esp, shelf: boolean): ProjectDef {
  const topT = kind === "jantar" ? 30 : 20;
  const leg = kind === "jantar" ? 70 : kind === "lateral" || kind === "infantil" ? 40 : 45;
  const bw = kind === "jantar" ? 150 : 170;
  const boards = Math.max(1, Math.round(D / bw));
  const top = esp.m(topT, bw);
  const legM = esp.m(leg, leg);
  const rail = esp.m(20, 100);
  const parts = table({ W, H, D, topT, leg, apronH: kind === "jantar" ? 90 : 70, mat: rail.key, topMat: top.key, legMat: legM.key, topBoards: boards, inset: kind === "jantar" ? 60 : 25, shelf: shelf ? { y: kind === "lateral" ? 120 : 100, slats: Math.max(2, Math.round((D - 100) / 90)) } : undefined });
  const lugares = kind === "jantar" ? Math.max(4, Math.floor(W / 600) * 2 + (D >= 900 ? 2 : 0)) : 0;
  const nome = { centro: "Mesa de centro", lateral: "Mesa lateral", jantar: `Mesa de jantar ${lugares} lugares`, infantil: "Mesa infantil de atividades" }[kind];
  return gen({
    title: `${nome} ${cm(W)} × ${cm(D)} cm em ${esp.nome}${shelf ? " com prateleira" : ""}`,
    category: kind === "infantil" ? "infantil" : "sala",
    environment: kind === "infantil" ? "quarto" : "sala",
    primaryMaterial: "macica",
    difficulty: kind === "jantar" ? "intermediario" : "iniciante",
    estimatedTime: kind === "jantar" ? "2 a 3 dias" : "1 a 2 dias",
    tools: [...WOOD_TOOLS, ...TOOLS.kreg, ...(kind === "jantar" ? TOOLS.plaina : [])],
    summary: `${nome} de ${cm(W)} × ${cm(D)} cm e ${cm(H)} cm de altura, em ${esp.nome} maciço: tampo de ${boards} tábua${boards > 1 ? "s" : ""} colada${boards > 1 ? "s" : ""} de ${topT} mm, pés quadrados de ${cm(leg)} cm e saias com furo oblíquo${shelf ? ", mais uma prateleira de ripas embaixo" : ""}.`,
    materials: [top, legM, rail],
    parts,
    ...JOIN_POCKET,
    hardware: [
      ["Parafuso para pocket hole 32 mm", `${16 + (shelf ? 8 : 0)} un`],
      ["Fixador de tampo em Z", `${kind === "jantar" ? 10 : 6} un`],
      ["Cola PVA D3", "250 g"],
      ["Feltro ou sapata", "4 un"],
    ],
    hwCost: kind === "jantar" ? 70 : 45,
    finish: esp.ext ? FIN.externo : FIN.verniz,
    steps: [
      ...(boards > 1 ? [`Cole as ${boards} tábuas do tampo lado a lado alternando a curvatura dos anéis. Aperte com grampos alternados e deixe 12 h.`] : []),
      "Faça dois furos oblíquos em cada ponta das saias" + (shelf ? " e dos apoios da prateleira." : "."),
      "Monte as duas cabeceiras (2 pés + saia curta) e confira o esquadro de cada uma.",
      "Una as cabeceiras com as saias longas.",
      ...(shelf ? ["Parafuse os apoios da prateleira por dentro dos pés e distribua as ripas com 10 mm de folga."] : []),
      `Esquadreje o tampo em ${cm(W)} × ${cm(D)} cm, arredonde as quinas e fixe por baixo com os fixadores em Z.`,
      "Lixe tudo e aplique o acabamento.",
    ],
    warnings: [WARN.tampoMacico, WARN.umidade, ...(kind === "jantar" ? ["Tampo de 30 mm com 2 m ou mais: acrescente uma travessa central sob o tampo para não embarrigar."] : [])],
    visual: `${nome.toLowerCase()} de madeira ${esp.nome} com tampo de tábuas e pés quadrados${shelf ? ", prateleira de ripas embaixo" : ""}`,
    scene: kind === "jantar" ? "sala de jantar com pendente, cadeiras de palha e louça sobre a mesa" : kind === "infantil" ? "quarto infantil com papéis, lápis de cor e banquinhos" : "sala aconchegante com sofá de linho, tapete e plantas",
  });
}

export function banco(L: number, H: number, esp: Esp, tipo: "banco" | "banqueta"): ProjectDef {
  const alto = H > 550;
  const D = tipo === "banqueta" ? (alto ? 340 : 300) : 350;
  const seatT = L > 1000 ? 30 : 25;
  const seat = esp.m(seatT, 120);
  const legM = esp.m(45, 45);
  const rail = esp.m(20, 100);
  const parts = table({ W: L, H, D, topT: seatT, leg: 45, apronH: 70, mat: rail.key, topMat: seat.key, legMat: legM.key, topBoards: tipo === "banqueta" ? 1 : Math.round(D / 115), inset: 25, stretchers: alto ? Math.round(H * 0.35) : 90 });
  const nome = tipo === "banqueta" ? (alto ? `Banqueta alta ${cm(H)} cm` : "Banquinho") : `Banco ${cm(L)} cm`;
  return gen({
    title: `${nome} em ${esp.nome}${tipo === "banqueta" ? ` (assento ${cm(L)} × ${cm(D)})` : ""}`,
    category: esp.ext ? "jardim" : tipo === "banqueta" && alto ? "cozinha" : "sala",
    environment: esp.ext ? "externa" : alto ? "cozinha" : "qualquer",
    primaryMaterial: "macica",
    difficulty: alto ? "intermediario" : "iniciante",
    estimatedTime: L > 1000 ? "1 dia" : "Meio dia",
    tools: [...WOOD_TOOLS, ...TOOLS.kreg],
    summary: `${nome} de ${esp.nome} maciço com assento de ${seatT} mm${alto ? `, para balcão de ${Math.round((H + 300) / 10)} cm` : ""}, pés de 4,5 cm, saias e travessas baixas que travam o balanço. ${esp.ext ? "Madeira resistente para varanda e jardim." : "Resistente para uso diário."}`,
    materials: [seat, legM, rail],
    parts,
    ...JOIN_POCKET,
    hardware: [
      ["Parafuso para pocket hole 32 mm", "20 un"],
      ["Parafuso 4,0 × 50 mm (assento)", `${count(parts, "Tábua do tampo") * 4 || 6} un`],
      ["Cola PVA D3", "150 g"],
      ["Sapata/feltro", "4 un"],
    ],
    hwCost: 40,
    finish: esp.ext ? FIN.externo : FIN.verniz,
    steps: [
      "Faça os furos oblíquos nas saias e travessas.",
      "Monte as cabeceiras (2 pés + saia curta + travessa baixa), conferindo o esquadro.",
      "Una com as saias longas.",
      "Fixe o assento por baixo, deixando 25 mm de sobra em volta.",
      "Arredonde bem as quinas do assento e aplique o acabamento.",
    ],
    warnings: [
      alto ? "Banqueta alta: confira a altura do balcão — o assento fica ~30 cm abaixo do tampo." : `Carga: ${L > 1000 ? "2 a 3 adultos" : "1 adulto"} sentado${L > 1000 ? "s" : ""}. Não use como degrau.`,
      ...(esp.ext ? [WARN.cambara] : [WARN.umidade]),
    ],
    visual: `${nome.toLowerCase()} de madeira ${esp.nome} com assento maciço e pés quadrados com travessas`,
    scene: esp.ext ? "varanda com plantas e piso de madeira" : alto ? "cozinha com balcão de madeira e pendentes" : "hall de entrada com cestos",
  });
}

export function bancada(W: number, D: number, shelf: boolean): ProjectDef {
  const top = MAT.mdf18();
  const cai = MAT.pinus(45, 90);
  const parts = table({ W, H: 900, D, topT: 36, leg: 90, apronH: 90, apronT: 45, mat: cai.key, legMat: cai.key, topMat: top.key, inset: 30, stretchers: 150 });
  const topParts = parts.filter((p) => p.name === "Tampo");
  for (const tp of topParts) {
    const i = parts.indexOf(tp);
    parts.splice(i, 1, { ...tp, name: "Tampo (camada)", v: [0, 18, 0] }, { ...tp, name: "Tampo (camada)", o: [tp.o[0], tp.o[1] + 18, tp.o[2]], v: [0, 18, 0] });
  }
  if (shelf) parts.push(bx("Prateleira inferior", top.key, 120, 210, 30, W - 240, 18, D - 60));
  return gen({
    title: `Bancada de marcenaria ${cm(W)} × ${cm(D)} cm${shelf ? " com prateleira" : ""}`,
    category: "oficina",
    environment: "oficina",
    primaryMaterial: "macica",
    difficulty: "intermediario",
    estimatedTime: "1 a 2 dias",
    tools: [...WOOD_TOOLS, ...TOOLS.nivel],
    summary: `Bancada robusta de ${cm(W)} × ${cm(D)} cm e 90 cm de altura: pés e quadros em caibro 45 × 90, tampo de duas camadas de MDF 18 mm coladas (36 mm, pesado e plano)${shelf ? " e prateleira inferior para máquinas" : ""}.`,
    materials: [cai, top],
    parts,
    joinery: "Parafuso estrutural 5,0 × 80 mm + cola",
    joineryWhy: "Bancada não pode balançar ao serrar ou martelar: quadros em duas alturas travam os pés em todas as direções e o tampo duplo dá massa.",
    hardware: [
      ["Parafuso estrutural 5,0 × 80 mm", "32 un"],
      ["Parafuso 4,0 × 30 mm (camadas do tampo)", "40 un"],
      ["Cola PVA", "500 g"],
      ["Morsa de bancada (opcional)", "1 un"],
    ],
    hwCost: 90,
    finish: "Madeira: seladora. Tampo: óleo de linhaça ou cera — facilita tirar cola seca. Não envernize o tampo.",
    steps: [
      "Monte os dois quadros laterais: 2 pés + travessa no alto + travessa a 15 cm do chão.",
      "Una os quadros com as travessas longas nas mesmas alturas.",
      ...(shelf ? ["Apoie a prateleira sobre as travessas de baixo, recortando os cantos nos pés."] : []),
      "Cole as duas chapas do tampo (cola em toda a face e parafusos a cada 20 cm por baixo).",
      "Parafuse o tampo na estrutura por baixo, nivele e aplique o acabamento.",
    ],
    warnings: ["Altura ideal = altura do seu pulso com o braço esticado ao lado do corpo (85–95 cm). Ajuste antes de cortar os pés.", "Deixe 3 cm de sobra do tampo nas bordas para prender grampos."],
    visual: "bancada de marcenaria robusta com pés de caibro, tampo grosso de MDF e ferramentas em cima",
    scene: "oficina organizada com painel de ferramentas e serragem no chão",
  });
}

// ───────────────────────────── CAIXAS / JARDIM ─────────────────────────────
export function caixa(kind: "caixote" | "jardineira" | "cachepo" | "floreira" | "canteiro" | "bandeja" | "organizador", W: number, H: number, D: number, esp: Esp, extra: { dividers?: number; legs?: number } = {}): ProjectDef {
  const slatted = kind === "caixote" || kind === "cachepo" || kind === "canteiro" || kind === "floreira";
  const t = kind === "bandeja" || kind === "organizador" ? 12 : slatted ? 15 : 20;
  const sm = esp.m(t, slatted ? 80 : 150);
  const nSl = slatted ? Math.max(2, Math.round(H / 90)) : 0;
  const divX = extra.dividers ? Array.from({ length: extra.dividers }, (_, i) => Math.round(((i + 1) * W) / (extra.dividers! + 1) - t / 2)) : [];
  const cornerM = esp.m(20, 20);
  let parts = openBox({ W, H, D, t, mat: sm.key, slats: nSl, dividersX: divX, handleEnds: kind === "bandeja" || kind === "caixote", corners: 20, cornerMat: cornerM.key });
  if (extra.legs) {
    const legM = esp.m(45, 45);
    parts = parts.map((p) => ({ ...p, o: [p.o[0], p.o[1] + extra.legs!, p.o[2]] }));
    for (const [x, z] of [
      [0, 0],
      [W - 45, 0],
      [0, D - 45],
      [W - 45, D - 45],
    ])
      parts.push(bx("Pé", legM.key, x, 0, z, 45, extra.legs, 45));
  }
  const nome = {
    caixote: "Caixote de ripas",
    jardineira: "Jardineira",
    cachepo: "Cachepô ripado",
    floreira: "Floreira alta com pés",
    canteiro: "Canteiro elevado",
    bandeja: "Bandeja com alças",
    organizador: extra.dividers ? `Organizador com ${extra.dividers + 1} divisões` : "Organizador",
  }[kind];
  const garden = ["jardineira", "cachepo", "floreira", "canteiro"].includes(kind);
  return gen({
    title: `${nome} ${cm(W)} × ${cm(D)} cm — ${esp.nome}`,
    category: garden ? "jardim" : kind === "bandeja" ? "cozinha" : "organizacao",
    environment: garden ? (kind === "cachepo" ? "qualquer" : "externa") : kind === "bandeja" ? "cozinha" : "qualquer",
    primaryMaterial: t <= 15 && !garden ? "sobras" : "macica",
    difficulty: extra.legs || kind === "canteiro" ? "intermediario" : "iniciante",
    estimatedTime: extra.legs || kind === "canteiro" ? "1 dia" : "2 a 4 horas",
    tools: [...WOOD_TOOLS, ...(kind === "bandeja" || kind === "caixote" ? TOOLS.tico : [])],
    summary: `${nome} de ${cm(W)} × ${cm(H)} × ${cm(D)} cm em ${esp.nome}${slatted ? `, laterais com ${nSl} ripas espaçadas presas em sarrafos de canto` : ", laterais inteiras"}${extra.legs ? ` sobre pés de ${cm(extra.legs)} cm` : ""}${divX.length ? ` e ${divX.length} divisória${divX.length > 1 ? "s" : ""}` : ""}. ${garden ? "Fundo com vãos para drenar — forre com manta antes do substrato." : kind === "bandeja" ? "Cabeceiras mais altas com alças vazadas." : "Rápido de fazer e ótimo para vender em série."}`,
    materials: [sm, cornerM, ...(extra.legs ? [esp.m(45, 45)] : []), ...(garden ? [MAT.outro("manta", "Manta geotêxtil (bidim)", "Poliéster", `${Math.max(0.5, Math.round(((2 * (W + D) * H + W * D) / 1e6) * 10) / 10)} m²`, "tecido", 20)] : [])],
    parts,
    joinery: slatted ? "Prego galvanizado ou parafuso inox nos sarrafos de canto" : "Cola + prego sem cabeça ou parafuso 3,5 × 30 mm",
    joineryWhy: slatted
      ? "Os sarrafos internos dão onde pregar sem rachar a ponta das ripas; metal galvanizado ou inox não enferruja com a rega."
      : "Peça pequena sem esforço estrutural: cola PVA com pregos finos dá cantos firmes e rápidos.",
    hardware: [
      [slatted ? "Prego galvanizado 12 × 18 ou parafuso inox 3,0 × 20" : "Prego sem cabeça 1 × 25", `${slatted ? nSl * 8 + 16 : 24} un`],
      ["Cola PVA D3", "100 g"],
      ...(extra.legs ? ([["Parafuso inox 4,0 × 45 mm", "16 un"]] as [string, string][]) : []),
      ...(garden ? ([["Grampo para a manta", "30 un"]] as [string, string][]) : [["Pé de feltro", "4 un"]] as [string, string][]),
    ],
    hwCost: 20 + (extra.legs ? 20 : 0),
    finish: garden || esp.ext ? FIN.externo : kind === "bandeja" ? FIN.verniz : FIN.oleo,
    steps: [
      ...(kind === "bandeja" || kind === "caixote" ? ["Nas cabeceiras, marque a alça (100 × 25 mm) a 15 mm do topo; faça dois furos de 25 mm e ligue com tico-tico."] : []),
      slatted ? "Pregue as ripas nos sarrafos de canto formando os quatro lados, com 8 mm de vão entre elas." : "Cole e pregue as cabeceiras entre as laterais longas.",
      "Fixe o fundo por baixo" + (garden ? ", deixando vãos de 5 a 8 mm para drenar." : "."),
      ...(divX.length ? ["Cole as divisórias com espaçamento igual."] : []),
      ...(extra.legs ? ["Parafuse a caixa nos quatro pés por dentro, conferindo o nível."] : []),
      "Lixe as quinas e aplique o acabamento" + (garden ? "; depois grampeie a manta nas paredes internas." : "."),
    ],
    warnings: [
      ...(garden ? ["Não plante direto na madeira: forre com manta ou use vaso plástico dentro.", "Madeira autoclavada com CCA não deve ter contato com hortaliças comestíveis."] : []),
      ...(kind === "canteiro" ? [`Cheio de terra molhada pesa ~${Math.round((W * D * H) / 1e9 * 1400)} kg: monte no lugar definitivo.`] : []),
      "Faça pré-furo nas ripas perto da ponta: ripa fina racha fácil.",
    ],
    visual: `${nome.toLowerCase()} de madeira ${esp.nome}${slatted ? " com ripas horizontais" : ""}${extra.legs ? " sobre pés altos" : ""}`,
    scene: garden ? "varanda ensolarada com ervas, flores e regador de metal" : kind === "bandeja" ? "cama com café da manhã servido na bandeja" : "estante organizada com objetos do dia a dia",
  });
}

export function hortaVertical(boxes: number, W: number, esp: Esp): ProjectDef {
  const side = esp.m(20, 150);
  const small = esp.m(20, 100);
  const H = boxes * 330 + 60;
  const parts: Part[] = [bx("Lateral alta", side.key, 0, 0, 0, 20, H, 150), bx("Lateral alta", side.key, W - 20, 0, 0, 20, H, 150)];
  for (let i = 0; i < boxes; i++) {
    const y = 50 + i * 330;
    parts.push(bx("Fundo da caixa", side.key, 20, y, 10, W - 40, 20, 130));
    parts.push(bx("Frente da caixa", small.key, 20, y, 140, W - 40, 100, 20));
    parts.push(bx("Traseira da caixa", small.key, 20, y, 0, W - 40, 60, 20));
  }
  parts.push(bx("Travessa de fixação", small.key, 0, H - 90, -20, W, 70, 20), bx("Travessa de fixação", small.key, 0, 20, -20, W, 70, 20));
  return gen({
    title: `Horta vertical ${boxes} caixas ${cm(W)} cm — ${esp.nome}`,
    category: "jardim",
    environment: "externa",
    primaryMaterial: "macica",
    difficulty: "intermediario",
    estimatedTime: "Meio dia",
    tools: [...WOOD_TOOLS, ...TOOLS.nivel],
    summary: `${boxes} caixas de plantio entre duas laterais de ${cm(H)} cm, em ${esp.nome}, presas na parede por travessas traseiras. Rende temperos o ano todo ocupando só ${cm(W)} cm de parede.`,
    materials: [side, small, MAT.outro("manta", "Manta geotêxtil", "Poliéster", `${Math.round(boxes * 0.3 * 10) / 10} m²`, "tecido", 15)],
    parts,
    joinery: "Parafuso inox pelas laterais + travessas de fixação traseiras",
    joineryWhy: "Cada caixa fica presa pelas duas pontas nas laterais altas, que descarregam o peso nas travessas parafusadas na parede.",
    hardware: [
      ["Parafuso inox 4,0 × 45 mm", `${boxes * 12 + 8} un`],
      ["Bucha 8 + parafuso 5,0 × 60 mm", "4 un"],
    ],
    hwCost: 30 + boxes * 8,
    finish: FIN.externo,
    steps: [
      "Marque nas laterais a posição das caixas a cada 33 cm.",
      "Monte cada caixa (fundo + frente + traseira) e faça 3 furos de 8 mm no fundo para drenar.",
      "Parafuse as caixas entre as laterais, 2 parafusos por peça de cada lado.",
      "Parafuse as travessas de fixação por trás e aplique stain.",
      "Fixe na parede nivelada, forre as caixas com manta e plante.",
    ],
    warnings: [`Peso com terra molhada: ~${boxes * 10} kg. Só em parede de alvenaria.`, WARN.parede],
    visual: `horta vertical de madeira com ${boxes} caixas cheias de ervas`,
    scene: "parede de tijolo de varanda pequena com regador ao lado",
  });
}

// ───────────────────────────── TÁBUAS / PRATELEIRAS / MOLDURAS ─────────────────────────────
export function tabua(kind: "corte" | "frios" | "churrasco" | "servir", W: number, D: number, T: number, strips: number): ProjectDef {
  const clara = MAT.dura(T + 5, 60, "clara");
  const escura = MAT.dura(T + 5, 60, "escura");
  const media = MAT.dura(T + 5, 90, "madeira");
  const mats = kind === "frios" ? [clara.key, escura.key] : kind === "servir" ? [media.key, clara.key] : [media.key];
  const parts = board({ W, D, T, strips, mats, name: "Régua do blank" });
  const nome = { corte: "Tábua de corte", frios: "Tábua de frios bicolor", churrasco: "Tábua de churrasco com canaleta", servir: "Tábua de servir comprida" }[kind];
  const used = kind === "frios" ? [clara, escura] : kind === "servir" ? [media, clara] : [media];
  return gen({
    title: `${nome} ${cm(W)} × ${cm(D)} cm`,
    category: "cozinha",
    environment: "cozinha",
    primaryMaterial: "macica",
    difficulty: kind === "frios" || kind === "churrasco" ? "intermediario" : "iniciante",
    estimatedTime: "Meio dia + secagem",
    tools: [T >= 30 ? "Serra circular com guia" : "Serra circular com guia", ...TOOLS.plaina, ...TOOLS.tupia, "Grampos sargento (mín. 4)", "Lixadeira orbital (lixas 80, 120 e 220)"],
    summary: `${nome} de ${cm(W)} × ${cm(D)} cm e ${T} mm de espessura, feita com ${strips} réguas de madeira dura coladas${kind === "frios" ? " alternando tons claro e escuro" : ""}${kind === "churrasco" ? " e canaleta de 12 mm na borda para o caldo" : ""}. Acabamento só com óleo mineral.`,
    materials: [...used, MAT.outro("cola", "Cola PVA D3 (resistente à água)", "PVA D3", "100 g", "branco", 15)],
    parts,
    joinery: "Colagem lateral das réguas com cola D3 e grampos",
    joineryWhy: "Réguas estreitas coladas com os anéis alternados empenam muito menos que uma tábua inteira. A cola D3, curada, é resistente à água.",
    hardware: [["Óleo mineral grau alimentício", "100 ml"], ["Pé de silicone (opcional)", "4 un"]],
    hwCost: 20,
    finish: FIN.alimento,
    steps: [
      "Aplaine as bordas das réguas até encostarem sem luz entre elas.",
      "Cole alternando a curvatura dos anéis" + (kind === "frios" ? " e as cores" : "") + ". Aperte com grampos alternados por cima e por baixo; deixe 24 h.",
      `Aplaine ou lixe as faces até ${T} mm e esquadreje em ${cm(W)} × ${cm(D)} cm.`,
      ...(kind === "churrasco" ? ["Com tupia e fresa meia-cana de 12 mm, faça a canaleta a 20 mm da borda, em duas passadas."] : []),
      "Arredonde as quinas, lixe até 220, molhe para levantar a fibra, deixe secar e lixe de novo.",
      "Aplique o óleo mineral em todas as faces.",
    ],
    warnings: ["Não use pinus, MDF ou madeira tratada quimicamente.", "Não lave em máquina e não deixe de molho.", "Pó de madeira dura é irritante: use máscara PFF2."],
    visual: `${nome.toLowerCase()} de madeira dura${kind === "frios" ? " com faixas claras e escuras" : ""}, bordas arredondadas e acabamento oleado`,
    scene: kind === "churrasco" ? "mesa de churrasco com picanha fatiada e faca" : "bancada de cozinha com queijos, pães e ervas",
  });
}

export function prateleira(kind: "flutuante" | "mao-francesa" | "porta-chaves", W: number, esp: Esp): ProjectDef {
  const parts: Part[] = [];
  let mats: MaterialDef[];
  if (kind === "flutuante") {
    const m = esp.m(20, 220);
    parts.push(bx("Lâmina da prateleira", m.key, 0, 0, 0, W, 20, 200), bx("Lâmina da prateleira", m.key, 0, 20, 0, W, 20, 200));
    mats = [m];
  } else if (kind === "mao-francesa") {
    const m = esp.m(20, 200);
    const s = esp.m(20, 100);
    parts.push(bx("Prateleira", m.key, 0, 200, 0, W, 20, 200));
    for (const x of [W * 0.12, W * 0.88 - 20]) {
      parts.push(bx("Montante do suporte", s.key, x, 0, 0, 20, 200, 40));
      parts.push(bx("Braço do suporte", s.key, x, 160, 0, 20, 40, 190));
      parts.push(tiltX(bx("Mão-francesa", s.key, x, 30, 30, 20, 35, 200), 45, [x, 30, 30]));
    }
    mats = [m, s];
  } else {
    const m = esp.m(20, 180);
    parts.push(bx("Painel traseiro", m.key, 0, 0, 0, W, 180, 20), bx("Prateleira", m.key, 0, 180, 0, W, 20, 90));
    for (let i = 0; i < Math.floor(W / 70); i++) parts.push(bx("Gancho", "metal", 35 + i * 70, 50, 20, 8, 30, 25, { cut: false }));
    mats = [m];
  }
  const nome = { flutuante: "Prateleira flutuante", "mao-francesa": "Prateleira com mão-francesa", "porta-chaves": "Porta-chaves com prateleira" }[kind];
  return gen({
    title: `${nome} ${cm(W)} cm — ${esp.nome}`,
    category: kind === "porta-chaves" ? "entrada" : "prateleiras",
    environment: kind === "porta-chaves" ? "entrada" : "qualquer",
    primaryMaterial: "macica",
    difficulty: kind === "mao-francesa" ? "intermediario" : "iniciante",
    estimatedTime: kind === "mao-francesa" ? "Meio dia" : "3 horas",
    tools: [...WOOD_TOOLS, ...TOOLS.nivel, ...(kind === "flutuante" ? ["Broca 12 mm longa (160 mm)"] : [])],
    summary:
      kind === "flutuante"
        ? `Prateleira de ${cm(W)} cm e 4 cm de espessura (duas tábuas coladas face a face) presa em suporte invisível de pinos de aço — sem nenhum suporte aparente.`
        : kind === "mao-francesa"
          ? `Prateleira de ${cm(W)} × 20 cm com dois suportes de madeira em L com mão-francesa a 45°, que transformam o peso em compressão. Aguenta livros.`
          : `Painel de parede de ${cm(W)} cm com ${Math.floor(W / 70)} ganchos para chaves e uma prateleirinha para cartas e óculos.`,
    materials: mats,
    parts,
    joinery: kind === "flutuante" ? "Laminação face a face + suporte invisível de pinos" : "Cola + parafuso 4,0 × 40 mm por trás",
    joineryWhy:
      kind === "flutuante"
        ? "Com 40 mm de espessura dá para furar os pinos de 12 mm sem estourar a face; o suporte metálico leva a carga direto para a parede."
        : "Os parafusos entram por trás, escondidos contra a parede; a mão-francesa impede que a prateleira gire para frente.",
    hardware:
      kind === "flutuante"
        ? [["Suporte invisível para prateleira (barra + pinos Ø 12)", "1 un"], ["Bucha 8 + parafuso", `${W > 800 ? 4 : 3} un`]]
        : kind === "mao-francesa"
          ? [["Parafuso 4,0 × 40 mm", "16 un"], ["Bucha 8 + parafuso 5,0 × 60 mm", "4 un"]]
          : [["Gancho metálico", `${Math.floor(W / 70)} un`], ["Suporte serrilhado", "2 un"], ["Bucha 6 + parafuso", "2 un"]],
    hwCost: kind === "flutuante" ? 45 + W / 20 : 25,
    finish: FIN.verniz,
    steps:
      kind === "flutuante"
        ? ["Cole as duas tábuas face a face e deixe 12 h.", `Esquadreje em ${cm(W)} × 20 × 4 cm.`, "Fure os pinos no centro da espessura da borda traseira (broca 12 mm, 155 mm de profundidade, bem perpendicular).", "Lixe e aplique o acabamento.", "Fixe o suporte nivelado e encaixe a prateleira."]
        : kind === "mao-francesa"
          ? ["Corte montantes, braços e mãos-francesas (pontas a 45°).", "Monte cada suporte em L com cola e parafuso e encaixe a mão-francesa.", "Fixe os suportes na prateleira por cima.", "Lixe, aplique o acabamento e fixe na parede com bucha 8."]
          : ["Cole e parafuse a prateleira no topo do painel, por trás.", "Marque e parafuse os ganchos com espaçamento igual.", "Aplique o acabamento e instale os suportes serrilhados."],
    warnings: [WARN.parede, kind === "flutuante" ? `Carga: até ${W > 800 ? 15 : 10} kg em alvenaria.` : kind === "mao-francesa" ? "Carga: até 20 kg distribuídos." : "A prateleirinha aguenta até 2 kg."],
    visual: `${nome.toLowerCase()} de madeira ${esp.nome}${kind === "porta-chaves" ? " com ganchos pretos" : ""}`,
    scene: kind === "porta-chaves" ? "parede ao lado da porta de entrada com chaves penduradas" : "parede branca de sala com livros e vaso de planta",
  });
}

export function moldura(W: number, H: number, uso: "espelho" | "quadro", esp: Esp): ProjectDef {
  const m = esp.m(20, 60);
  const parts = frame({ W, H, bw: 60, t: 20, mat: m.key, fill: uso === "espelho" ? "espelho" : "branco", fillName: uso === "espelho" ? "Espelho" : "Gravura" });
  return gen({
    title: `Moldura de ${uso} ${cm(W)} × ${cm(H)} cm — ${esp.nome}`,
    category: "decoracao",
    environment: "qualquer",
    primaryMaterial: "macica",
    difficulty: "iniciante",
    estimatedTime: "Meio dia",
    tools: [...WOOD_TOOLS, ...TOOLS.tupia, "Grampo de cinta para molduras"],
    summary: `Moldura de ${esp.nome} com 6 cm de largura, cantos em meia-esquadria e rebaixo para ${uso === "espelho" ? "espelho de 4 mm" : "vidro, gravura e fundo"}. Medida externa de ${cm(W)} × ${cm(H)} cm${uso === "espelho" && H >= 1200 ? " — espelho de corpo inteiro" : ""}.`,
    materials: [m, MAT.outro("vidro", uso === "espelho" ? "Espelho 4 mm" : "Vidro 2 mm + fundo HDF", "Vidro", `${cm(W - 100)} × ${cm(H - 100)} cm`, uso === "espelho" ? "espelho" : "vidro", Math.round(((W - 100) * (H - 100)) / 1e6 * 180))],
    parts,
    joinery: "Meia-esquadria colada e reforçada com grampo V",
    joineryWhy: "A meia-esquadria esconde o topo da madeira; como cola em 45° é fraca, os grampos V por trás garantem que o canto não abra.",
    hardware: [["Grampo V", "8 un"], ["Presilha giratória", "8 un"], ["Gancho com arame / suporte", "2 un"]],
    hwCost: 30,
    finish: FIN.verniz,
    steps: [
      "Com a tupia, faça o rebaixo de 10 × 8 mm na borda interna das réguas.",
      `Corte as pontas a 45° medindo por fora (${cm(W)} e ${cm(H)} cm).`,
      "Cole os quatro cantos, aperte com o grampo de cinta e confira as diagonais.",
      "Crave dois grampos V por canto, lixe e aplique o acabamento.",
      "Coloque o vidro/espelho e o fundo, travando com as presilhas.",
    ],
    warnings: [uso === "espelho" && H >= 1200 ? "Espelho de corpo inteiro pesa ~10 kg: fixe na parede com dois suportes e bucha 8." : "Meça o vão pronto antes de pedir o vidro (2 mm de folga total).", WARN.parede],
    visual: `moldura de madeira ${esp.nome} com cantos em meia-esquadria ${uso === "espelho" ? "emoldurando um espelho" : "com gravura botânica"}`,
    scene: "hall de entrada com aparador e vaso com galhos secos",
  });
}

export function portaVinhos(cols: number, rows: number, esp: Esp): ProjectDef {
  const m = esp.m(20, 250);
  const b = esp.m(20, 80);
  const W = cols * 100 + 40,
    H = rows * 110 + 60,
    D = 250;
  const parts: Part[] = [bx("Lateral", m.key, 0, 0, 0, 20, H, D), bx("Lateral", m.key, W - 20, 0, 0, 20, H, D), bx("Tampo", m.key, 0, H, 0, W, 20, D)];
  for (let r = 0; r < rows; r++) {
    const y = 30 + r * 110;
    parts.push(bx("Berço frontal (meias-luas Ø 80)", b.key, 20, y, 30, W - 40, 60, 20), bx("Berço traseiro (meias-luas Ø 80)", b.key, 20, y, 180, W - 40, 60, 20));
  }
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) parts.push(bx("Garrafa", "escura", 20 + c * 100 + 15, 60 + r * 110, -60, 70, 70, 300, { cut: false }));
  return gen({
    title: `Porta-vinhos para ${cols * rows} garrafas — ${esp.nome}`,
    category: "adega",
    environment: "sala",
    primaryMaterial: "macica",
    difficulty: rows * cols > 12 ? "intermediario" : "iniciante",
    estimatedTime: rows * cols > 12 ? "1 dia" : "Meio dia",
    tools: [...WOOD_TOOLS, ...TOOLS.tico, "Serra copo 80 mm"],
    summary: `Adega de ${cols * rows} garrafas deitadas (${rows} fileira${rows > 1 ? "s" : ""} de ${cols}) em ${esp.nome}: berços com recortes em meia-lua seguram o gargalo e o corpo da garrafa, levemente inclinada para a rolha ficar úmida. Tampo livre para taças e decoração.`,
    materials: [m, b],
    parts,
    joinery: "Cavilha 8 mm + cola nas laterais",
    joineryWhy: "Os berços encaixam entre as laterais e ficam presos por cavilha colada: firme e sem parafuso aparente.",
    hardware: [["Cavilha 8 × 30 mm", `${rows * 8 + 8} un`], ["Pé de feltro", "4 un"], ...(H > 700 ? ([["Cantoneira de fixação na parede", "2 un"]] as [string, string][]) : [])],
    hwCost: 25,
    finish: FIN.oleo,
    steps: [
      `Nos berços, marque ${cols} círculos de 80 mm a cada 100 mm e recorte as meias-luas com serra copo e tico-tico.`,
      "Marque nas laterais as fileiras a cada 11 cm; o berço traseiro fica 5 mm mais baixo para inclinar a garrafa.",
      "Fure as cavilhas, cole os berços entre as laterais e aperte com grampos.",
      "Cole o tampo, lixe e aplique o óleo.",
    ],
    warnings: [`Cheio, pesa cerca de ${Math.round(cols * rows * 1.5 + 5)} kg.`, "Longe do sol e do fogão: calor estraga o vinho."],
    visual: `porta-vinhos de madeira ${esp.nome} com garrafas deitadas em berços de meia-lua`,
    scene: "sala de jantar com luz amarela e taças sobre o tampo",
  });
}

// ───────────────────────────── PALLET ─────────────────────────────
export function palletProj(kind: "sofa2" | "sofa3" | "mesa" | "cama-casal" | "cama-solteiro" | "cabeceira" | "floreira-vertical" | "chaise"): ProjectDef {
  let parts: Part[] = [];
  let n = 2;
  let nome = "";
  const cushion = (x: number, y: number, z: number, w: number, h: number, d: number, name = "Colchonete/almofada") => bx(name, "tecido", x, y, z, w, h, d, { cut: false });
  const ph = 142;
  switch (kind) {
    case "sofa2":
      parts = [
        ...pallet(0, 0, 0, 1200, 800),
        ...pallet(0, ph, 0, 1200, 800),
        ...pallet(0, 0, 0, 1200, 450, "pallet", "Encosto").map((p) => tiltX(p, -90, [0, 0, 0])).map((p) => ({ ...p, o: [p.o[0], p.o[1] + 2 * ph, p.o[2] + ph] as [number, number, number] })),
      ];
      parts.push(cushion(0, 2 * ph, ph + 20, 1200, 100, 800 - ph - 20));
      n = 3;
      nome = "Sofá de pallet 2 lugares";
      break;
    case "sofa3":
      parts = [...pallet(0, 0, 0, 1200, 800), ...pallet(1200, 0, 0, 1200, 800), ...pallet(0, ph, 0, 1200, 800), ...pallet(1200, ph, 0, 1200, 800)];
      parts.push(bx("Encosto (tábuas de pallet)", "pallet", 0, 2 * ph, 0, 1200, 450, 20), bx("Encosto (tábuas de pallet)", "pallet", 1200, 2 * ph, 0, 1200, 450, 20));
      parts.push(cushion(0, 2 * ph, 40, 2400, 100, 760));
      n = 5;
      nome = "Sofá de pallet 3 lugares";
      break;
    case "mesa":
      parts = [...pallet(0, 0, 0, 1000, 700), ...pallet(0, ph, 0, 1000, 700)];
      parts.push(bx("Tampo de vidro 6 mm (opcional)", "vidro", 0, 2 * ph, 0, 1000, 6, 700, { cut: false }));
      n = 2;
      nome = "Mesa de centro de pallet com vidro";
      break;
    case "cama-casal":
      parts = [...pallet(0, 0, 0, 1200, 800), ...pallet(1200, 0, 0, 1200, 800), ...pallet(0, 0, 800, 1200, 800), ...pallet(1200, 0, 800, 1200, 800)];
      parts.push(cushion(300, ph, 100, 1880, 250, 1380, "Colchão de casal"));
      n = 4;
      nome = "Cama de casal de pallet";
      break;
    case "cama-solteiro":
      parts = [...pallet(0, 0, 0, 1200, 1000), ...pallet(1200, 0, 0, 1200, 1000)];
      parts.push(cushion(250, ph, 100, 1880, 200, 880, "Colchão de solteiro"));
      n = 2;
      nome = "Cama de solteiro de pallet";
      break;
    case "cabeceira":
      for (let i = 0; i < 16; i++) parts.push(bx("Tábua vertical", "pallet", i * 100, 0, 20, 95, 1100, 20));
      parts.push(bx("Travessa traseira", "pallet", 0, 150, 0, 1600, 95, 20), bx("Travessa traseira", "pallet", 0, 850, 0, 1600, 95, 20));
      n = 3;
      nome = "Cabeceira de pallet para cama de casal";
      break;
    case "floreira-vertical":
      parts = pallet(0, 0, 0, 1200, 800).map((p) => tiltX(p, -90, [0, 0, 0])).map((p) => ({ ...p, o: [p.o[0], p.o[1], p.o[2] + 140] }));
      for (let i = 0; i < 3; i++) parts.push(bx("Fundo de bolsão", "pallet", 30, 120 + i * 260, 20, 1140, 20, 110));
      n = 1;
      nome = "Floreira vertical de pallet";
      break;
    case "chaise":
      parts = [...pallet(0, 0, 0, 1200, 800), ...pallet(1200, 0, 0, 1200, 800)];
      parts.push(tiltZ(bx("Encosto reclinado (tábuas)", "pallet", 0, ph, 0, 700, 20, 800), -35, [700, ph, 0]));
      parts.push(cushion(700, ph, 40, 1650, 80, 720));
      n = 3;
      nome = "Espreguiçadeira de pallet";
      break;
  }
  const ext = kind === "floreira-vertical" || kind === "chaise" || kind.startsWith("sofa");
  return gen({
    title: nome,
    category: "pallet",
    environment: kind.startsWith("cama") || kind === "cabeceira" ? "quarto" : ext ? "externa" : "sala",
    primaryMaterial: "pallet",
    difficulty: kind === "sofa3" || kind === "chaise" ? "intermediario" : "iniciante",
    estimatedTime: n > 3 ? "1 a 2 dias" : "1 dia",
    tools: [...TOOLS.base, ...TOOLS.pallet, "Serra circular com guia"],
    summary: `${nome} com ${n} pallet${n > 1 ? "s" : ""} — o trabalho está em escolher bons pallets, lixar e fazer o acabamento. ${kind.startsWith("cama") ? "A base elevada ventila o colchão." : kind === "mesa" ? "O vão entre os pallets vira porta-revistas." : kind === "floreira-vertical" ? "Os vãos entre as tábuas viram bolsões para vasos." : "Com almofadas certas, fica tão confortável quanto um móvel de loja."}`,
    materials: [MAT.pallet(n), ...(parts.some((p) => p.mat === "tecido") ? [MAT.outro("estofado", "Espuma D28 com capa", "Espuma + tecido", "sob medida", "tecido", 280)] : [])],
    parts,
    extraCut: [
      ["sofa2", "sofa3", "mesa", "cama-casal", "cama-solteiro", "chaise"].includes(kind)
        ? ["Pallet inteiro (lixado)", ({ sofa2: 2, sofa3: 4, mesa: 2, "cama-casal": 4, "cama-solteiro": 2, chaise: 2 } as Record<string, number>)[kind], kind === "mesa" ? 1000 : 1200, kind === "mesa" ? 700 : kind === "cama-solteiro" ? 1000 : 800, 142, "livre", "pallet"]
        : null,
      kind === "sofa2" ? (["Pallet cortado (encosto)", 1, 1200, 450, 142, "livre", "pallet"] as const) : null,
    ].filter(Boolean) as never,
    joinery: "Parafuso estrutural pelos blocos + reforços em L",
    joineryWhy: "Os blocos são a parte mais forte do pallet: é neles que os parafusos entram. A tábua fina de 20 mm não seguraria.",
    hardware: [
      ["Parafuso estrutural 5,0 × 100 mm", `${n * 6} un`],
      ["Parafuso 4,5 × 50 mm", "24 un"],
      ...(kind === "mesa" || kind.startsWith("sofa") ? ([["Rodízio com trava", "4 un"]] as [string, string][]) : []),
    ],
    hwCost: 40 + n * 10,
    finish: FIN.pallet,
    steps: [
      "Escolha pallets inteiros, sem tábuas quebradas, e confira o carimbo HT.",
      "Lave com escova e água sanitária diluída, deixe secar ao sol por 2 dias.",
      "Lixe com 60 e 120 todas as faces que ficam à mostra (180 nas áreas de contato).",
      "Posicione os pallets e una pelos blocos com parafusos estruturais.",
      ...(kind === "cabeceira" ? ["Desmonte um pallet para tirar as tábuas e parafuse-as nas travessas traseiras; fixe o conjunto na parede."] : []),
      "Aplique o acabamento e, depois de seco, coloque almofadas ou colchão.",
    ],
    warnings: [WARN.pallet, WARN.pregos, WARN.epi],
    visual: `${nome.toLowerCase()} rústico${parts.some((p) => p.mat === "tecido") ? " com almofadas claras" : ""}`,
    scene: ext ? "terraço com varal de luzes e plantas" : "quarto rústico com luz quente",
  });
}

// ───────────────────────────── PET ─────────────────────────────
export function comedouro(H: number, bowls: 1 | 2, esp: Esp): ProjectDef {
  const m = esp.m(20, 250);
  const W = bowls === 2 ? 450 : 250;
  const parts: Part[] = [bx("Tampo com furos", m.key, 0, H - 20, 0, W, 20, 250), bx("Lateral", m.key, 0, 0, 0, 20, H - 20, 250), bx("Lateral", m.key, W - 20, 0, 0, 20, H - 20, 250), bx("Travessa traseira", m.key, 20, H - 80, 0, W - 40, 60, 20)];
  for (let i = 0; i < bowls; i++) parts.push(bx("Tigela inox", "inox", (i + 0.5) * (W / bowls) - 90, H, 35, 180, 45, 180, { cut: false }));
  const porte = H <= 120 ? "pequeno" : H <= 200 ? "médio" : H <= 300 ? "grande" : "gigante";
  return gen({
    title: `Comedouro elevado ${bowls === 2 ? "duplo" : "simples"} ${cm(H)} cm — porte ${porte}`,
    category: "pet",
    environment: "qualquer",
    primaryMaterial: "macica",
    difficulty: "iniciante",
    estimatedTime: "2 horas",
    tools: [...WOOD_TOOLS, ...TOOLS.tico],
    summary: `Suporte de ${esp.nome} para ${bowls === 2 ? "duas tigelas" : "uma tigela"} inox de 18 cm, com ${cm(H)} cm de altura — a medida para cão de porte ${porte} comer sem forçar o pescoço.`,
    materials: [m],
    parts,
    joinery: "Cola + parafuso 3,5 × 40 mm pelo tampo, tampado",
    joineryWhy: "O tampo sobre as laterais trabalha em compressão; a travessa traseira impede o balanço quando o cão empurra a tigela.",
    hardware: [["Tigela inox Ø 18 cm com aba", `${bowls} un`], ["Parafuso 3,5 × 40 mm", "8 un"], ["Pé antiderrapante", "4 un"]],
    hwCost: 20 + bowls * 25,
    finish: "Verniz PU base água atóxico em 3 demãos (resiste à água derramada) ou óleo mineral renovado a cada 2 meses.",
    steps: ["Meça a tigela logo abaixo da aba e marque os furos no tampo.", "Faça um furo inicial e recorte com tico-tico; teste o encaixe.", "Cole a travessa entre as laterais e parafuse o tampo por cima.", "Tampe os furos, lixe, aplique o acabamento e cole os pés antiderrapantes."],
    warnings: ["Altura ideal: tigela logo abaixo do ombro do cão.", "Arredonde bem as quinas — o pet vai esbarrar."],
    visual: `comedouro elevado de madeira ${esp.nome} com ${bowls === 2 ? "duas tigelas" : "uma tigela"} de inox`,
    scene: "cozinha com piso de cerâmica e um cachorro comendo",
  });
}

export function caminhaPet(W: number, D: number, esp: Esp): ProjectDef {
  const t = esp.m(20, 100);
  const pe = esp.m(45, 45);
  const parts = table({ W, H: 200, D, topT: 20, leg: 45, apronH: 90, mat: t.key, legMat: pe.key, topMat: t.key, topBoards: Math.round(D / 75), inset: 0 });
  parts.push(bx("Colchonete", "tecido-escuro", 30, 200, 30, W - 60, 80, D - 60, { cut: false }));
  const porte = W <= 600 ? "P" : W <= 800 ? "M" : "G";
  return gen({
    title: `Caminha elevada para pet — tamanho ${porte} (${cm(W)} × ${cm(D)} cm)`,
    category: "pet",
    environment: "qualquer",
    primaryMaterial: "macica",
    difficulty: "iniciante",
    estimatedTime: "Meio dia",
    tools: [...WOOD_TOOLS, ...TOOLS.kreg],
    summary: `Cama de estrado ${cm(W)} × ${cm(D)} cm a 20 cm do chão, em ${esp.nome}: mais fresca no verão e longe da umidade do piso no inverno. Aceita colchonete padrão tamanho ${porte}.`,
    materials: [t, pe],
    parts,
    ...JOIN_POCKET,
    hardware: [["Parafuso pocket hole 32 mm", "16 un"], ["Parafuso 3,5 × 30 mm", `${Math.round(D / 75) * 4} un`], ["Pé de borracha", "4 un"]],
    hwCost: 30,
    finish: "Verniz PU base água atóxico, 3 demãos.",
    steps: ["Monte o quadro com pés e saias usando furo oblíquo.", "Parafuse as ripas do estrado por cima com espaçamento igual.", "Arredonde todas as quinas — o pet vai morder e esfregar.", "Aplique o acabamento e coloque o colchonete."],
    warnings: [`Medida: comprimento do pet deitado + 15 cm. Carga até ${porte === "G" ? 45 : 30} kg.`],
    visual: `caminha elevada de madeira para cachorro com colchonete cinza`,
    scene: "varanda com um cachorro deitado na caminha",
  });
}

export function casinhaPet(W: number, D: number, H: number, porte: string): ProjectDef {
  const m = MAT.naval15();
  const sar = MAT.pinus(45, 45);
  const wall = H - 200;
  const roofRise = 200;
  const half = W / 2 + 60;
  const roofLen = Math.hypot(half, roofRise);
  const ang = (Math.atan2(roofRise, half) * 180) / Math.PI;
  const parts: Part[] = [
    bx("Piso", m.key, 0, 45, 0, W, 15, D),
    bx("Parede lateral", m.key, 0, 60, 0, 15, wall, D),
    bx("Parede lateral", m.key, W - 15, 60, 0, 15, wall, D),
    bx("Fundo (com oitão)", m.key, 15, 60, 0, W - 30, wall, 15),
    bx("Frente (com porta)", m.key, 15, 60, D - 15, W - 30, wall, 15),
    tiltZ(bx("Água do telhado", m.key, -60, 60 + wall, -60, roofLen, 15, D + 120), ang, [-60, 60 + wall, -60]),
    tiltZ(bx("Água do telhado", m.key, W / 2, 60 + wall + roofRise, -60, roofLen, 15, D + 120), -ang, [W / 2, 60 + wall + roofRise, -60]),
    bx("Sarrafo do piso", sar.key, 20, 0, 0, 45, 45, D),
    bx("Sarrafo do piso", sar.key, W - 65, 0, 0, 45, 45, D),
    bx("Porta (vão)", "preto", W / 2 - W * 0.22, 70, D, W * 0.44, wall * 0.7, 2, { cut: false }),
  ];
  return gen({
    title: `Casinha para pet porte ${porte} (${cm(W)} × ${cm(D)} cm)`,
    category: "pet",
    environment: "externa",
    primaryMaterial: "macica",
    difficulty: "intermediario",
    estimatedTime: "1 a 2 dias",
    tools: [...WOOD_TOOLS, ...TOOLS.tico],
    summary: `Casinha de telhado em duas águas para cão de porte ${porte}, em compensado naval 15 mm, piso elevado sobre sarrafos e beiral de 6 cm protegendo a entrada da chuva.`,
    materials: [m, sar],
    parts,
    joinery: "Parafuso inox + cola PU",
    joineryWhy: "Compensado naval tem cola à prova d'água entre lâminas e aceita parafuso perto da borda; a cola PU veda as juntas.",
    hardware: [["Parafuso inox 4,0 × 40 mm", "70 un"], ["Cola PU", "2 tubos"], ["Manta asfáltica ou telha shingle (opcional)", `${Math.round(((2 * roofLen * (D + 120)) / 1e6) * 10) / 10} m²`]],
    hwCost: 90,
    finish: FIN.externo,
    steps: [
      "Recorte frente e fundo com o oitão (triângulo do telhado) e abra a porta na frente, com cantos arredondados.",
      "Parafuse os sarrafos sob o piso.",
      "Monte paredes, frente e fundo em volta do piso com cola PU e parafusos.",
      "Instale as duas águas do telhado com beiral e vede a cumeeira.",
      "Lixe a porta e aplique stain por fora.",
    ],
    warnings: ["Porta: altura do ombro do cão + 5 cm. Interior: 25 % maior que o cão deitado.", "Não use madeira autoclavada por dentro: o pet morde e lambe.", "Posicione a porta contra o vento predominante."],
    visual: `casinha de cachorro de madeira com telhado em duas águas e porta arredondada`,
    scene: "quintal gramado com um cachorro sentado na porta",
  });
}

// ───────────────────────────── OFICINA / INFANTIL / SUPORTES ─────────────────────────────
export function cavalete(): ProjectDef {
  const m = MAT.pinus(45, 90);
  const L = 900,
    H = 750;
  const legL = H / Math.cos((15 * Math.PI) / 180);
  const parts: Part[] = [bx("Viga superior", m.key, 0, H - 90, 200, L, 90, 45)];
  for (const x of [80, L - 125])
    for (const s of [-1, 1]) parts.push(tiltX(bx("Perna (pontas a 15°)", m.key, x, 0, 222 - 22, 45, legL, 45), s * 15, [x, H - 90, 222]));
  parts.push(bx("Travessa", m.key, 60, 250, 90, L - 120, 90, 20), bx("Travessa", m.key, 60, 250, 330, L - 120, 90, 20));
  return gen({
    title: "Par de cavaletes de corte para oficina",
    category: "oficina",
    environment: "oficina",
    primaryMaterial: "macica",
    difficulty: "intermediario",
    estimatedTime: "Meio dia",
    tools: [...WOOD_TOOLS],
    summary: "Cavalete de 90 cm com pernas abertas a 15°, viga superior de sacrifício (pode serrar em cima) e travessas que travam o conjunto. As medidas são de um cavalete; faça dois.",
    materials: [m],
    parts,
    joinery: "Parafuso estrutural 5,0 × 80 mm + cola",
    joineryWhy: "As pernas abertas formam triângulos: o cavalete fica estável mesmo com tábua pesada em cima.",
    hardware: [["Parafuso estrutural 5,0 × 80 mm", "16 un por cavalete"], ["Cola PVA", "100 g"]],
    hwCost: 30,
    finish: "Sem acabamento ou só seladora — é ferramenta de trabalho.",
    steps: ["Corte as pontas das pernas a 15° (topo e pé).", "Parafuse as pernas na viga, duas de cada lado.", "Fixe as travessas a 25 cm do chão, uma de cada lado.", "Confira se as quatro pernas apoiam no chão; lixe a que sobrar."],
    warnings: ["Carga: até 150 kg por par.", "A viga superior é de sacrifício: troque quando estiver muito serrada."],
    visual: "cavalete de marcenaria de pinus com pernas abertas e viga superior",
    scene: "oficina com uma tábua apoiada sobre dois cavaletes",
  });
}

export function frenchCleat(W: number, H: number): ProjectDef {
  const comp = MAT.comp15();
  const r = MAT.pinus(18, 70);
  const parts: Part[] = [bx("Painel de fundo", comp.key, 0, 0, 0, W, H, 15)];
  const rows = Math.max(2, Math.floor(H / 250));
  for (let i = 0; i < rows; i++) parts.push(bx("Régua de parede (45°)", r.key, 0, H - 150 - i * 250, 15, W, 70, 18));
  parts.push(bx("Módulo prateleira", r.key, 80, H - 360, 33, 300, 18, 120), bx("Módulo prateleira", r.key, 80, H - 360, 33, 300, 150, 18));
  parts.push(bx("Módulo chaves de fenda", r.key, W - 400, H - 620, 33, 300, 18, 70));
  return gen({
    title: `Painel de ferramentas french cleat ${cm(W)} × ${cm(H)} cm`,
    category: "oficina",
    environment: "oficina",
    primaryMaterial: "macica",
    difficulty: "iniciante",
    estimatedTime: "Meio dia",
    tools: [...WOOD_TOOLS, ...TOOLS.nivel],
    summary: `Parede de ferramentas modular de ${cm(W)} × ${cm(H)} cm: ${rows} réguas com corte a 45° e módulos que se penduram em qualquer posição. Reorganiza a oficina sem furar a parede de novo.`,
    materials: [comp, r],
    parts,
    joinery: "Encaixe por gravidade em cunha de 45°",
    joineryWhy: "O peso empurra o chanfro do módulo contra o chanfro da régua e ele trava sozinho, sem parafuso.",
    hardware: [["Parafuso 4,0 × 40 mm", "40 un"], ["Bucha 8 + parafuso 5,0 × 60 mm", `${Math.ceil(W / 400) * 2} un`], ["Cola PVA", "100 g"]],
    hwCost: 40,
    finish: "Seladora ou nenhuma. Pinte o fundo de cor clara para achar as ferramentas mais rápido.",
    steps: ["Serre as réguas ao meio no comprimento com a lâmina a 45°.", "Parafuse as réguas no painel com o chanfro para cima e para dentro.", "Fixe o painel na parede com bucha 8.", "Monte os módulos com a régua espelhada no alto das costas e pendure."],
    warnings: ["Serrar peça estreita a 45° é perigoso: use empurrador e guia paralela.", "Carga por módulo: até 10 kg."],
    visual: "painel de parede com réguas chanfradas e módulos de madeira segurando alicates e chaves",
    scene: "oficina com bancada embaixo e luz de LED",
  });
}

export function suporteVaso(H: number, niveis: 1 | 2 | 3, esp: Esp): ProjectDef {
  const t = esp.m(20, 125);
  const pe = esp.m(40, 40);
  let parts: Part[];
  if (niveis === 1) parts = table({ W: 280, H, D: 280, topT: 20, leg: 40, apronH: 60, mat: t.key, legMat: pe.key, topMat: t.key, topBoards: 2, inset: 10 });
  else {
    parts = [];
    const W = 700,
      step = 220;
    for (let i = 0; i < niveis; i++) {
      const top = Math.round(((i + 1) * H) / niveis);
      const z = (niveis - 1 - i) * step; // degrau de baixo mais à frente
      parts.push(bx("Degrau", t.key, 0, top - 20, z, W, 20, step));
      // montantes laterais sob a frente de cada degrau (fora da largura do degrau)
      for (const x of [-40, W]) parts.push(bx("Montante", pe.key, x, 0, z + step - 40, 40, top, 40));
    }
    for (const x of [-40, W]) parts.push(bx("Travessa lateral", t.key, x, 120, 0, 40, 60, niveis * step - 40));
  }
  return gen({
    title: niveis === 1 ? `Suporte de vaso ${cm(H)} cm — ${esp.nome}` : `Estante escada para plantas ${niveis} níveis — ${esp.nome}`,
    category: "jardim",
    environment: "qualquer",
    primaryMaterial: "macica",
    difficulty: niveis === 1 ? "iniciante" : "intermediario",
    estimatedTime: niveis === 1 ? "2 horas" : "Meio dia",
    tools: [...WOOD_TOOLS, ...TOOLS.kreg],
    summary: niveis === 1 ? `Banquinho de ${cm(H)} cm para elevar vasos de até 30 cm de diâmetro, em ${esp.nome}. Protege o piso e dá destaque à planta.` : `Estante em escada com ${niveis} degraus recuados, cada planta recebe luz sem fazer sombra na de baixo. Em ${esp.nome}.`,
    materials: [t, pe],
    parts,
    joinery: niveis === 1 ? "Furo oblíquo + tampo parafusado por baixo" : "Parafuso inox pelas pernas + travessa traseira",
    joineryWhy: niveis === 1 ? "Quatro saias formam um quadro rígido que leva o peso do vaso para os pés." : "Os degraus amarram as pernas inclinadas e a travessa traseira trava o balanço.",
    hardware: [["Parafuso 4,0 × 40 mm", "16 un"], ["Pé de borracha", "4 un"]],
    hwCost: 20,
    finish: esp.ext ? FIN.externo : FIN.verniz,
    steps: niveis === 1 ? ["Faça os furos oblíquos nas saias.", "Monte o quadro com os pés.", "Parafuse o tampo por baixo com 5 mm de vão entre as tábuas.", "Lixe e aplique o acabamento."] : ["Corte as pernas com as pontas no ângulo do desenho.", "Marque a altura dos degraus nas pernas.", "Parafuse os degraus de baixo para cima.", "Fixe a travessa traseira, lixe e aplique o acabamento."],
    warnings: ["Use prato sob cada vaso: água parada estraga a madeira.", "Carga: vaso de até 30 kg por nível."],
    visual: niveis === 1 ? "banquinho de madeira sustentando vaso de cerâmica com samambaia" : `estante em escada de madeira com ${niveis} níveis de vasos`,
    scene: "canto de sala iluminado com cortina de linho e piso de taco",
  });
}

export function blocosInfantil(): ProjectDef {
  const m = MAT.pinus(40, 40, "clara");
  const parts: Part[] = [];
  const shapes: [number, number, number][] = [
    [40, 40, 40],
    [80, 40, 40],
    [120, 40, 40],
    [80, 40, 80],
    [40, 80, 40],
  ];
  let i = 0;
  for (let r = 0; r < 6; r++)
    for (let c = 0; c < 5; c++) {
      const [w, h, d] = shapes[(r + c) % shapes.length];
      parts.push(bx(`Bloco ${w / 10}×${h / 10}×${d / 10}`, m.key, c * 140, 0, r * 100, w, h, d));
      i++;
    }
  return gen({
    title: "Kit de 30 blocos de montar em madeira",
    category: "infantil",
    environment: "quarto",
    primaryMaterial: "sobras",
    difficulty: "iniciante",
    estimatedTime: "Meio dia",
    tools: ["Serra de esquadria (ou caixa de meia-esquadria)", "Lixadeira orbital (lixas 80, 120 e 220)", "Plaina elétrica ou desengrossadeira"],
    summary: `${i} blocos em 5 formatos múltiplos de 4 cm (cubo, régua curta, régua longa, placa e coluna), que empilham certinho. Feitos de sarrafo 40 × 40 de madeira clara, sem nenhuma peça pequena.`,
    materials: [m],
    parts,
    joinery: "Sem junção — peças soltas",
    joineryWhy: "Os blocos são múltiplos de 4 cm: qualquer combinação encaixa na mesma grade e as torres ficam alinhadas.",
    hardware: [["Saco de algodão ou caixa", "1 un"]],
    hwCost: 15,
    finish: FIN.atoxico,
    steps: ["Aplaine o sarrafo até 40 × 40 mm exatos.", "Com batente fixo na serra, corte os blocos de cada tamanho.", "Quebre todas as arestas com lixa 120 e finalize com 220.", "Aplique óleo mineral ou cera de abelha."],
    warnings: [WARN.brinquedo, "Nunca segure peça pequena perto da lâmina: use batente e empurrador."],
    visual: "conjunto de blocos de madeira clara em formatos variados empilhados",
    scene: "tapete de quarto infantil com uma torre de blocos",
  });
}

// ───────────────────────────── VARIAÇÕES ─────────────────────────────
export function woodProjects(): ProjectDef[] {
  const out: ProjectDef[] = [];
  const P = (p: ProjectDef) => out.push(p);

  // mesas de centro (8), laterais (6), jantar (5), infantil (2)
  P(mesa("centro", 900, 500, 400, PINUS, true));
  P(mesa("centro", 1000, 600, 420, TAUARI, true));
  P(mesa("centro", 800, 800, 380, PINUS, false));
  P(mesa("centro", 1200, 600, 400, TAUARI, true));
  P(mesa("centro", 700, 450, 400, PINUS, false));
  P(mesa("centro", 1100, 550, 350, CAMBARA, true));
  P(mesa("centro", 600, 600, 350, TAUARI, true));
  P(mesa("centro", 1300, 700, 400, PINUS, true));
  P(mesa("lateral", 400, 400, 550, PINUS, true));
  P(mesa("lateral", 450, 350, 600, TAUARI, true));
  P(mesa("lateral", 350, 350, 500, PINUS, false));
  P(mesa("lateral", 500, 400, 650, TAUARI, false));
  P(mesa("lateral", 400, 300, 700, PINUS, true));
  P(mesa("lateral", 450, 450, 450, CAMBARA, false));
  P(mesa("jantar", 1200, 800, 760, PINUS, false));
  P(mesa("jantar", 1600, 900, 760, TAUARI, false));
  P(mesa("jantar", 2000, 900, 760, TAUARI, false));
  P(mesa("jantar", 900, 900, 760, PINUS, false));
  P(mesa("jantar", 1800, 850, 760, CAMBARA, false));
  P(mesa("infantil", 600, 600, 500, PINUS, false));
  P(mesa("infantil", 900, 600, 520, PINUS, true));

  // bancos e banquetas (10)
  P(banco(800, 450, PINUS, "banco"));
  P(banco(1200, 450, PINUS, "banco"));
  P(banco(1600, 450, TAUARI, "banco"));
  P(banco(1200, 450, CAMBARA, "banco"));
  P(banco(1000, 450, EUCA, "banco"));
  P(banco(350, 450, PINUS, "banqueta"));
  P(banco(350, 650, PINUS, "banqueta"));
  P(banco(380, 750, TAUARI, "banqueta"));
  P(banco(300, 250, PINUS, "banqueta"));
  P(banco(400, 600, CAMBARA, "banqueta"));

  // bancadas (5)
  P(bancada(1200, 600, false));
  P(bancada(1500, 600, true));
  P(bancada(1800, 700, true));
  P(bancada(2000, 800, true));
  P(bancada(1000, 500, false));

  // caixas, jardim, bandejas, organizadores (30)
  P(caixa("caixote", 300, 150, 200, PINUS));
  P(caixa("caixote", 400, 250, 300, PINUS));
  P(caixa("caixote", 500, 300, 350, PINUS));
  P(caixa("caixote", 600, 300, 400, CAMBARA));
  P(caixa("caixote", 350, 200, 250, TAUARI));
  P(caixa("caixote", 450, 280, 300, PINUS));
  P(caixa("caixote", 250, 120, 180, TAUARI));
  P(caixa("caixote", 700, 350, 400, PINUS));
  P(caixa("cachepo", 200, 200, 200, CAMBARA));
  P(caixa("cachepo", 300, 300, 300, CAMBARA));
  P(caixa("cachepo", 400, 450, 400, EUCA));
  P(caixa("jardineira", 600, 200, 200, CAMBARA));
  P(caixa("jardineira", 800, 220, 250, CAMBARA));
  P(caixa("jardineira", 1000, 250, 300, EUCA));
  P(caixa("floreira", 600, 250, 300, CAMBARA, { legs: 500 }));
  P(caixa("floreira", 900, 250, 350, EUCA, { legs: 550 }));
  P(caixa("floreira", 400, 300, 400, CAMBARA, { legs: 400 }));
  P(caixa("canteiro", 1200, 250, 600, CAMBARA, { legs: 500 }));
  P(caixa("canteiro", 1800, 300, 800, EUCA));
  P(caixa("bandeja", 400, 60, 280, PINUS));
  P(caixa("bandeja", 500, 70, 350, TAUARI));
  P(caixa("bandeja", 300, 50, 300, TAUARI));
  P(caixa("bandeja", 600, 70, 400, PINUS));
  P(caixa("bandeja", 350, 50, 200, CAMBARA));
  P(caixa("organizador", 250, 100, 150, PINUS, { dividers: 2 }));
  P(caixa("organizador", 300, 80, 200, TAUARI, { dividers: 3 }));
  P(caixa("organizador", 200, 120, 100, PINUS, { dividers: 1 }));
  P(caixa("organizador", 400, 60, 300, PINUS, { dividers: 3 }));
  P(caixa("organizador", 350, 150, 120, TAUARI, { dividers: 2 }));
  P(caixa("organizador", 180, 180, 180, PINUS, { dividers: 1 }));

  // hortas verticais (4)
  P(hortaVertical(3, 400, CAMBARA));
  P(hortaVertical(4, 500, CAMBARA));
  P(hortaVertical(5, 600, EUCA));
  P(hortaVertical(3, 800, CAMBARA));

  // tábuas (8)
  P(tabua("corte", 300, 200, 20, 3));
  P(tabua("corte", 400, 250, 25, 3));
  P(tabua("corte", 450, 300, 30, 4));
  P(tabua("frios", 450, 250, 20, 7));
  P(tabua("frios", 350, 200, 20, 5));
  P(tabua("churrasco", 500, 350, 35, 4));
  P(tabua("churrasco", 600, 400, 40, 5));
  P(tabua("servir", 700, 180, 20, 3));

  // prateleiras (10)
  P(prateleira("flutuante", 400, PINUS));
  P(prateleira("flutuante", 600, TAUARI));
  P(prateleira("flutuante", 800, PINUS));
  P(prateleira("flutuante", 1000, TAUARI));
  P(prateleira("flutuante", 1200, PINUS));
  P(prateleira("mao-francesa", 600, PINUS));
  P(prateleira("mao-francesa", 900, TAUARI));
  P(prateleira("porta-chaves", 300, PINUS));
  P(prateleira("porta-chaves", 450, TAUARI));
  P(prateleira("porta-chaves", 600, CAMBARA));

  // molduras (7)
  P(moldura(400, 600, "espelho", PINUS));
  P(moldura(600, 900, "espelho", TAUARI));
  P(moldura(500, 1500, "espelho", PINUS));
  P(moldura(700, 1700, "espelho", TAUARI));
  P(moldura(300, 400, "quadro", PINUS));
  P(moldura(500, 700, "quadro", TAUARI));
  P(moldura(800, 600, "quadro", CAMBARA));

  // porta-vinhos (6)
  P(portaVinhos(3, 2, TAUARI));
  P(portaVinhos(3, 3, PINUS));
  P(portaVinhos(4, 3, TAUARI));
  P(portaVinhos(4, 4, PINUS));
  P(portaVinhos(6, 4, CAMBARA));
  P(portaVinhos(2, 6, CAMBARA));

  // pallet (8)
  for (const k of ["sofa2", "sofa3", "mesa", "cama-casal", "cama-solteiro", "cabeceira", "floreira-vertical", "chaise"] as const) P(palletProj(k));

  // pet (11)
  P(comedouro(100, 2, PINUS));
  P(comedouro(150, 2, TAUARI));
  P(comedouro(250, 2, PINUS));
  P(comedouro(350, 2, TAUARI));
  P(comedouro(150, 1, PINUS));
  P(caminhaPet(600, 450, PINUS));
  P(caminhaPet(800, 600, PINUS));
  P(caminhaPet(1000, 700, TAUARI));
  P(casinhaPet(600, 700, 650, "pequeno"));
  P(casinhaPet(800, 900, 800, "médio"));
  P(casinhaPet(1000, 1100, 950, "grande"));

  // suportes de vaso (6)
  P(suporteVaso(200, 1, PINUS));
  P(suporteVaso(300, 1, TAUARI));
  P(suporteVaso(450, 1, PINUS));
  P(suporteVaso(600, 1, CAMBARA));
  P(suporteVaso(900, 3, PINUS));
  P(suporteVaso(700, 2, CAMBARA));

  // oficina e infantil (5)
  P(cavalete());
  P(frenchCleat(1200, 800));
  P(frenchCleat(1800, 1000));
  P(blocosInfantil());
  // gaveteiro de parafusos (usa a caixa de MDF)
  const m = MAT.mdf15();
  P(
    gen({
      title: "Gaveteiro de parafusos com 12 gavetinhas",
      category: "oficina",
      environment: "oficina",
      primaryMaterial: "mdf",
      difficulty: "avancado",
      estimatedTime: "2 dias",
      tools: [...TOOLS.base, ...TOOLS.mdf],
      summary: "Organizador de bancada com 12 gavetinhas de 12 cm em 3 colunas, para parafusos, buchas, pregos e brocas. Em MDF 15 mm cru, gavetas com etiqueta na frente.",
      materials: [m, MAT.hdf3()],
      parts: carcass({ W: 450, H: 420, D: 250, t: 15, mat: m.key, dividers: [130, 275], drawers: [{ bay: "all", fronts: [100, 100, 100, 105] }], handles: "knob" }),
      joinery: "Cola + prego sem cabeça; gavetas deslizando direto nas prateleiras",
      joineryWhy: "Gavetinhas leves não precisam de corrediça metálica: correm direto na madeira com um pouco de cera.",
      hardware: [["Puxador botão", "12 un"], ["Porta-etiqueta de metal", "12 un"], ["Prego sem cabeça", "200 un"], ["Cera de abelha", "1 pote"]],
      hwCost: 110,
      finish: FIN.pintura,
      steps: ["Monte a caixa com as divisórias.", "Monte as 12 gavetinhas iguais usando um gabarito.", "Passe cera nas bases e ajuste cada gaveta.", "Pinte, instale puxadores e porta-etiquetas."],
      warnings: ["Faça todas as gavetinhas pelo mesmo gabarito: assim qualquer uma entra em qualquer vão."],
      visual: "gaveteiro de oficina com 12 gavetinhas e puxadores de botão",
      scene: "bancada de oficina com ferramentas manuais",
    }),
  );
  return out;
}
