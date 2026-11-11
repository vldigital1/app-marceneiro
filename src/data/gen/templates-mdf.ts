import { bx, carcass, openBox, type Part } from "../../lib/model3d";
import type { MaterialDef, ProjectDef } from "../types";
import { FIN, MAT, TOOLS, WARN, cm, gen } from "./kit";

type Cor = { cor: string; look: string };
export const C = {
  branco: { cor: "branco", look: "branco" },
  preto: { cor: "preto", look: "preto" },
  carvalho: { cor: "carvalho", look: "carvalho" },
  freijo: { cor: "freijó", look: "freijo" },
  cinza: { cor: "cinza", look: "cinza" },
  grafite: { cor: "grafite", look: "grafite" },
} satisfies Record<string, Cor>;

const MDF_TOOLS = [...TOOLS.base, ...TOOLS.mdf];
const DOOR_TOOLS = [...MDF_TOOLS, ...TOOLS.portas, ...TOOLS.nivel];

/** alturas de prateleiras distribuídas igualmente num vão interno */
const even = (n: number, inner: number, t: number) => Array.from({ length: n }, (_, i) => Math.round(((i + 1) * inner) / (n + 1) - t / 2));
/** divisórias para manter vão ≤ max */
const splitBays = (innerW: number, t: number, max = 780) => {
  const n = Math.ceil(innerW / max);
  const bay = (innerW - (n - 1) * t) / n;
  return Array.from({ length: n - 1 }, (_, i) => Math.round((i + 1) * bay + i * t));
};
const count = (parts: Part[], name: string) => parts.filter((p) => p.name === name).length;

const JOIN_MDF = {
  joinery: "Parafuso 4,0 × 40 mm com pré-furo + cavilha 8 mm",
  joineryWhy:
    "No MDF o parafuso de rosca total segura bem no topo da chapa quando há pré-furo; a cavilha alinha as peças e absorve o esforço lateral. É o método mais simples que dá rigidez e ainda permite desmontar.",
};
const JOIN_MINIFIX = {
  joinery: "Minifix 15 mm + cavilha 8 mm",
  joineryWhy: "O Minifix fica escondido do lado de dentro e permite montar e desmontar várias vezes sem espanar a chapa. A cavilha faz o alinhamento.",
};

function stepsCarcass(o: { doors?: number; drawers?: number; shelves?: number; wall?: boolean; legs?: boolean; plinth?: boolean }) {
  const s = [
    "Confira todas as peças com a lista de corte e identifique cada uma com fita crepe. Aplique a fita de borda nas bordas visíveis antes de montar.",
  ];
  if (o.shelves) s.push("Marque e fure os pinos das prateleiras nas faces internas das laterais (e divisórias), usando o gabarito para ficarem na mesma altura.");
  if (o.doors) s.push("Fure as sapatas das dobradiças nas laterais e os canecos de 35 mm nas portas, a 100 mm do topo e da base de cada porta.");
  s.push(
    o.plinth ? "Fixe o rodapé sob a base e parafuse a base entre as laterais." : o.legs ? "Parafuse a base entre as laterais." : "Parafuse base e tampo entre as laterais (ou o tampo por cima, conforme o desenho).",
    "Instale divisórias e prateleiras fixas, conferindo as medidas internas dos vãos com a trena.",
    "Com o móvel deitado, meça as duas diagonais; quando estiverem iguais, fixe o fundo com pregos ou parafusos a cada 15 cm.",
  );
  if (o.drawers) s.push("Monte as caixas das gavetas, instale as corrediças e alinhe as frentes com calços de 3 mm.");
  if (o.doors) s.push("Pendure as portas, regule as dobradiças até a folga ficar uniforme (3 mm) e instale os puxadores.");
  if (o.legs) s.push("Vire o móvel e parafuse os pés a 40 mm das bordas.");
  if (o.wall) s.push("Marque a altura na parede com nível, fixe os suportes com bucha adequada e pendure o móvel.");
  else s.push("Coloque o móvel no lugar, nivele e, se for alto, prenda na parede.");
  return s;
}

const baseMats = (bp: MaterialDef, ...extra: MaterialDef[]) => [bp, MAT.hdf3(), ...extra];

// ───────────────────────────── NICHOS ─────────────────────────────
export function nicho(W: number, H: number, D: number, divs: number, c: Cor, open: boolean): ProjectDef {
  const t = 15;
  const m = MAT.bp15(c.cor, c.look);
  const innerW = W - 2 * t;
  const dividers = divs ? Array.from({ length: divs }, (_, i) => Math.round(((i + 1) * (innerW - divs * t)) / (divs + 1) + i * t)) : [];
  const parts = carcass({ W, H, D, t, mat: m.key, topOver: false, dividers, openBack: open });
  const kind = W === H ? "quadrado" : W > H ? "horizontal" : "vertical";
  return gen({
    title: `Nicho ${kind} ${cm(W)} × ${cm(H)} cm${divs ? ` com ${divs} divisória${divs > 1 ? "s" : ""}` : ""} — MDF ${c.cor}${open ? " vazado" : ""}`,
    category: "prateleiras",
    environment: "qualquer",
    primaryMaterial: "mdf",
    difficulty: "iniciante",
    estimatedTime: "2 a 3 horas",
    tools: MDF_TOOLS,
    summary: `Nicho de parede ${kind} em MDF BP ${c.cor} 15 mm, com ${cm(D)} cm de profundidade${divs ? ` e ${divs + 1} compartimentos` : ""}${open ? ", sem fundo para a cor da parede aparecer" : ", com fundo em HDF"}. Fixação por suporte invisível — parece flutuar na parede.`,
    materials: baseMats(m),
    parts,
    ...JOIN_MDF,
    hardware: [
      ["Suporte invisível para nicho", W > 600 ? "3 un" : "2 un"],
      ["Parafuso 4,0 × 40 mm", `${8 + divs * 4} un`],
      ["Tapa-furo adesivo", "1 cartela"],
      ["Bucha 6 + parafuso", W > 600 ? "3 un" : "2 un"],
    ],
    hwCost: 35 + divs * 5,
    finish: FIN.bp,
    steps: [
      "Aplique fita de borda nas bordas frontais e traseiras de todas as peças.",
      "Faça pré-furo e parafuse topo e base entre as laterais.",
      ...(divs ? ["Marque as divisórias com espaçamento igual e fixe com parafuso por cima e por baixo."] : []),
      ...(open ? [] : ["Confira as diagonais e pregue o fundo de HDF."]),
      "Cubra as cabeças dos parafusos com tapa-furo.",
      "Fixe os suportes invisíveis nivelados na parede e encaixe o nicho.",
    ],
    warnings: [`Carga sugerida: até ${W > 600 ? 12 : 8} kg distribuídos.`, WARN.parede, WARN.prefuro],
    visual: `nicho de parede ${kind} em MDF ${c.cor}${divs ? ` com ${divs} divisórias` : ""}, linhas retas e bordas limpas`,
    scene: "parede de sala clara com livros, vela e planta pequena dentro do nicho",
  });
}

// ───────────────────────────── ESTANTES ─────────────────────────────
export function estante(W: number, H: number, D: number, mat: MaterialDef, desc: string, back: boolean): ProjectDef {
  const t = mat.thickness;
  const plinth = 60;
  const innerW = W - 2 * t;
  const dividers = splitBays(innerW, t, t <= 15 ? 760 : 850);
  const inner = H - plinth - 3 * t;
  const n = Math.max(1, Math.round(inner / 360) - 1);
  const parts = carcass({ W, H, D, t, mat: mat.key, plinth, dividers, shelves: [{ bay: "all", ys: even(n, inner, t) }], openBack: !back });
  const wood = mat.kind === "tabua";
  return gen({
    title: `Estante ${cm(W)} × ${cm(H)} cm — ${desc}`,
    category: "sala",
    environment: "qualquer",
    primaryMaterial: wood ? "macica" : "mdf",
    difficulty: W > 1000 || H > 1600 ? "intermediario" : "iniciante",
    estimatedTime: H > 1500 ? "1 dia" : "Meio dia",
    tools: wood ? [...TOOLS.base, ...TOOLS.madeira] : MDF_TOOLS,
    summary: `Estante aberta de ${cm(W)} cm de largura e ${cm(H)} cm de altura em ${desc}, com ${n} prateleira${n > 1 ? "s" : ""} por vão${dividers.length ? ` e ${dividers.length} divisória${dividers.length > 1 ? "s" : ""} para nenhum vão passar do limite` : ""}. ${back ? "Fundo fechado em HDF trava o esquadro." : "Costas abertas: fica bonita também como divisória de ambiente."}`,
    materials: back ? baseMats(mat) : [mat],
    parts,
    ...JOIN_MDF,
    hardware: [
      ["Parafuso 4,0 × 40 mm", `${16 + (dividers.length + count(parts, "Prateleira")) * 4} un`],
      ["Cavilha 8 × 30 mm", `${8 + count(parts, "Prateleira") * 2} un`],
      ...(back ? ([["Prego 12 × 12 para o fundo", "60 un"]] as [string, string][]) : []),
      ["Suporte antitombamento", H > 1200 ? "2 un" : "1 un"],
    ],
    hwCost: 40 + count(parts, "Prateleira") * 3,
    finish: wood ? FIN.verniz : FIN.bp,
    steps: stepsCarcass({ shelves: n, plinth: true }),
    warnings: [
      ...(back ? [] : ["Sem fundo, a estante depende das prateleiras fixas para não balançar: parafuse todas e prenda na parede."]),
      WARN.prefuro,
    ],
    visual: `estante aberta em ${desc} com ${n + 1} níveis${dividers.length ? " e divisórias verticais" : ""}, livros e objetos decorativos`,
    scene: "sala de estar com poltrona, luminária de piso e planta grande ao lado da estante",
  });
}

// ───────────────────────────── ARMÁRIOS COM PORTAS ─────────────────────────────
export function armario(W: number, H: number, D: number, leaves: number, c: Cor, uso: string, opts: { rod?: boolean; legs?: boolean; shelves?: number } = {}): ProjectDef {
  const m = MAT.bp15(c.cor, c.look);
  const t = 15;
  const plinth = opts.legs ? 0 : 60;
  const innerW = W - 2 * t;
  const dividers = leaves >= 3 ? splitBays(innerW, t, innerW / 2 + 10) : innerW > 800 ? splitBays(innerW, t) : [];
  const inner = H - plinth - (opts.legs ? 150 : 0) - 3 * t;
  const n = opts.shelves ?? Math.max(1, Math.round(inner / 400) - 1);
  const shelves = opts.rod ? [{ bay: 0 as const, ys: [inner - 300] }] : [{ bay: "all" as const, ys: even(n, inner, t) }];
  const bays = dividers.length + 1;
  const doors = bays === 1 ? [{ bay: 0, leaves }] : Array.from({ length: bays }, (_, i) => ({ bay: i, leaves: Math.max(1, Math.round(leaves / bays)) }));
  const parts = carcass({ W, H, D, t, mat: m.key, plinth, legs: opts.legs ? { h: 150, mat: "metal", size: 30 } : undefined, dividers, shelves, doors, rods: opts.rod ? [{ bay: 0, y: inner - 380 }] : undefined });
  const nDoors = count(parts, "Porta");
  const hinges = nDoors * (H > 1500 ? 3 : 2);
  return gen({
    title: `Armário ${nDoors} porta${nDoors > 1 ? "s" : ""} ${cm(W)} × ${cm(H)} cm — ${uso}`,
    category: uso.includes("roupa") ? "quarto" : uso.includes("buffet") ? "sala" : "cozinha",
    environment: uso.includes("roupa") ? "quarto" : uso.includes("buffet") ? "sala" : "qualquer",
    primaryMaterial: "mdf",
    difficulty: "intermediario",
    estimatedTime: H > 1500 ? "2 dias" : "1 dia",
    tools: DOOR_TOOLS,
    summary: `Armário de ${uso} em MDF BP ${c.cor}, com ${nDoors} porta${nDoors > 1 ? "s" : ""}${opts.rod ? ", tubo cabideiro e prateleira de maleiro" : `, ${n} prateleira${n > 1 ? "s" : ""} reguláveis por vão`}${opts.legs ? " e pés metálicos de 15 cm" : " e rodapé recuado"}. Medidas pensadas para aproveitar bem a chapa.`,
    materials: baseMats(m),
    parts,
    ...JOIN_MDF,
    hardware: [
      ["Dobradiça de caneco 35 mm reta", `${hinges} un`],
      ["Puxador", `${nDoors} un`],
      ["Pino suporte de prateleira 5 mm", `${count(parts, "Prateleira") * 4} un`],
      ["Parafuso 4,0 × 40 mm", `${30 + dividers.length * 8} un`],
      ["Cavilha 8 × 30 mm", "24 un"],
      ...(opts.rod ? ([["Tubo cabideiro oblongo com flanges", "1 un"]] as [string, string][]) : []),
      ...(opts.legs ? ([["Pé metálico 15 cm com chapa", "4 un"]] as [string, string][]) : []),
      ["Suporte antitombamento", H > 1200 ? "2 un" : "—"],
    ],
    hwCost: hinges * 9 + nDoors * 15 + 40 + (opts.legs ? 80 : 0),
    finish: FIN.bp,
    steps: stepsCarcass({ doors: nDoors, shelves: n, plinth: !opts.legs, legs: opts.legs }),
    warnings: [WARN.esquadro, ...(H > 1500 ? ["Portas acima de 1,5 m pedem 3 dobradiças cada."] : []), WARN.corteLoja],
    visual: `armário de ${uso} em MDF ${c.cor} com ${nDoors} portas lisas e puxadores pretos${opts.legs ? ", sobre pés metálicos finos" : ""}`,
    scene: uso.includes("roupa") ? "quarto claro com cama de linho e tapete" : uso.includes("buffet") ? "sala de jantar com mesa de madeira e pendente" : "lavanderia ou despensa organizada com cestos e potes",
  });
}

// ───────────────────────────── AÉREOS ─────────────────────────────
export function aereo(W: number, H: number, c: Cor): ProjectDef {
  const m = MAT.bp15(c.cor, c.look);
  const t = 15,
    D = 320;
  const innerW = W - 2 * t;
  const dividers = innerW > 800 ? splitBays(innerW, t) : [];
  const inner = H - 2 * t;
  const n = H >= 600 ? 1 : 0;
  const bays = dividers.length + 1;
  const leavesPerBay = W / bays > 500 ? 2 : 1;
  const parts = carcass({ W, H, D, t, mat: m.key, dividers, shelves: n ? [{ bay: "all", ys: even(1, inner, t) }] : [], doors: Array.from({ length: bays }, (_, i) => ({ bay: i, leaves: leavesPerBay })) });
  const nDoors = count(parts, "Porta");
  return gen({
    title: `Armário aéreo ${cm(W)} × ${cm(H)} cm — MDF ${c.cor}`,
    category: "cozinha",
    environment: "cozinha",
    primaryMaterial: "mdf",
    difficulty: "intermediario",
    estimatedTime: "1 dia",
    tools: DOOR_TOOLS,
    summary: `Armário suspenso de ${cm(W)} cm para cozinha ou lavanderia, ${cm(D)} cm de profundidade, ${nDoors} porta${nDoors > 1 ? "s" : ""}${n ? " e prateleira regulável" : ""}. Pendurado em suporte regulável, que facilita nivelar mesmo em parede torta.`,
    materials: baseMats(m),
    parts,
    ...JOIN_MDF,
    hardware: [
      ["Suporte regulável para armário aéreo", "1 par"],
      ["Dobradiça de caneco 35 mm reta", `${nDoors * 2} un`],
      ["Puxador", `${nDoors} un`],
      ["Pino suporte de prateleira", `${count(parts, "Prateleira") * 4} un`],
      ["Parafuso 4,0 × 40 mm", `${16 + dividers.length * 6} un`],
      ["Bucha 8 + parafuso 5,0 × 50 mm", "4 un"],
    ],
    hwCost: 60 + nDoors * 25,
    finish: FIN.bp,
    steps: stepsCarcass({ doors: nDoors, shelves: n, wall: true }),
    warnings: [WARN.parede, `Instale a 55–60 cm acima da bancada. Carga recomendada: ${Math.round(W / 40)} kg.`],
    visual: `armário aéreo de cozinha em MDF ${c.cor} com ${nDoors} portas lisas e puxadores discretos`,
    scene: "cozinha com azulejo branco, bancada de madeira e utensílios pendurados",
  });
}

// ───────────────────────────── COZINHA BASE ─────────────────────────────
export function baseCozinha(W: number, cfg: "porta-gaveta" | "2portas" | "pia" | "gaveteiro3" | "gaveteiro4" | "2portas-2gavetas", c: Cor): ProjectDef {
  const body = MAT.bp15("branco", "branco");
  const front = MAT.bp18(c.cor, c.look);
  const t = 15,
    H = 820,
    D = 580;
  const legs = { h: 100, mat: "metal", size: 35 };
  const box = H - 100;
  const drawers: { bay: number; fronts: number[]; y0?: number }[] = [];
  const doors: { bay: number; leaves: number; y0?: number; y1?: number }[] = [];
  const leaves = W > 450 ? 2 : 1;
  if (cfg === "porta-gaveta") {
    drawers.push({ bay: 0, fronts: [180], y0: box - 180 });
    doors.push({ bay: 0, leaves: 1, y1: H - 180 });
  } else if (cfg === "2portas" || cfg === "pia") doors.push({ bay: 0, leaves });
  else if (cfg === "gaveteiro3") drawers.push({ bay: 0, fronts: [260, 260, 200] });
  else if (cfg === "gaveteiro4") drawers.push({ bay: 0, fronts: [200, 180, 170, 170] });
  else {
    drawers.push({ bay: 0, fronts: [170], y0: box - 170 }, { bay: 1, fronts: [170], y0: box - 170 });
    doors.push({ bay: 0, leaves: 1, y1: H - 170 }, { bay: 1, leaves: 1, y1: H - 170 });
  }
  const dividers = cfg === "2portas-2gavetas" ? [Math.round((W - 3 * t) / 2)] : [];
  const parts = carcass({
    W,
    H,
    D,
    t,
    mat: body.key,
    frontMat: front.key,
    legs,
    dividers,
    shelves: cfg === "pia" || cfg.startsWith("gaveteiro") ? [] : [{ bay: "all", ys: [280] }],
    doors,
    drawers,
  });
  const nD = count(parts, "Frente de gaveta"),
    nP = count(parts, "Porta");
  const nome = { "porta-gaveta": "porta + gaveta", "2portas": "2 portas", pia: "gabinete de pia", gaveteiro3: "gaveteiro 3 gavetas", gaveteiro4: "gaveteiro 4 gavetas", "2portas-2gavetas": "2 portas + 2 gavetas" }[cfg];
  return gen({
    title: `Módulo de cozinha ${cm(W)} cm — ${nome} (${c.cor})`,
    category: "cozinha",
    environment: "cozinha",
    primaryMaterial: "mdf",
    difficulty: "avancado",
    estimatedTime: nD > 1 ? "2 dias" : "1 a 2 dias",
    tools: DOOR_TOOLS,
    summary: `Módulo inferior de ${cm(W)} cm no padrão das cozinhas planejadas: caixa em MDF BP branco 15 mm, frentes em BP ${c.cor} 18 mm, ${nome}, sobre pés reguláveis de 10 cm. ${cfg === "pia" ? "Sem prateleira e sem travessa traseira alta, para passar sifão e registros." : "Vários módulos lado a lado formam a bancada."}`,
    materials: [body, front, MAT.hdf3()],
    parts,
    joinery: "Cavilha 8 mm + parafuso 4,0 × 40 mm; módulos unidos por parafuso de união",
    joineryWhy: "É o padrão industrial de cozinha: a cavilha alinha e o parafuso trava. Unir os módulos entre si faz a bancada inteira trabalhar como uma peça só.",
    hardware: [
      ["Pé regulável plástico 100 mm", "4 un"],
      ...(nP ? ([["Dobradiça de caneco 35 mm reta", `${nP * 2} un`]] as [string, string][]) : []),
      ...(nD ? ([["Corrediça telescópica 500 mm", `${nD} par(es)`]] as [string, string][]) : []),
      ["Puxador perfil", `${nP + nD} un`],
      ["Parafuso 4,0 × 40 mm", "30 un"],
      ["Parafuso de união de módulos", "4 un"],
      ["Tampo de pedra ou MDF 30 mm", `Comprar à parte, ${cm(W)} × 60 cm`],
    ],
    hwCost: 30 + nP * 20 + nD * 45 + (nP + nD) * 18,
    finish: FIN.bp + " Em cozinha, fite também as bordas de trás.",
    steps: stepsCarcass({ doors: nP, drawers: nD, shelves: 0, legs: true }),
    warnings: ["Nivele todos os módulos pelos pés antes de assentar o tampo de pedra — pedra apoiada em três pontos racha.", "Altura final padrão: 85 a 90 cm com o tampo.", WARN.corteLoja],
    visual: `módulo de cozinha com ${nome}, frentes ${c.cor} fosco e puxador perfil, tampo de pedra clara`,
    scene: "cozinha moderna com revestimento metrô, torneira preta e tábua de madeira sobre o tampo",
  });
}

// ───────────────────────────── CÔMODAS / GAVETEIROS ─────────────────────────────
export function comoda(W: number, H: number, D: number, rows: number, cols: number, c: Cor, legs: boolean): ProjectDef {
  const m = MAT.bp15(c.cor, c.look);
  const t = 15;
  const base = legs ? 150 : 0;
  const plinth = legs ? 0 : 60;
  const innerW = W - 2 * t;
  const dividers = cols > 1 ? Array.from({ length: cols - 1 }, (_, i) => Math.round(((i + 1) * (innerW - (cols - 1) * t)) / cols + i * t)) : [];
  const frontH = H - base - plinth;
  const fh = Math.floor(frontH / rows);
  const fronts = Array.from({ length: rows }, (_, i) => (i === rows - 1 ? frontH - fh * (rows - 1) : fh));
  const parts = carcass({ W, H, D, t, mat: m.key, plinth, legs: legs ? { h: base, mat: "metal", size: 30 } : undefined, dividers, drawers: [{ bay: "all", fronts }] });
  const nD = count(parts, "Frente de gaveta");
  const nome = cols > 1 ? `Cômoda ${nD} gavetas em ${cols} colunas` : H < 700 ? `Gaveteiro ${nD} gavetas` : `Cômoda ${nD} gavetas`;
  return gen({
    title: `${nome} ${cm(W)} cm — MDF ${c.cor}${legs ? " com pés" : ""}`,
    category: "quarto",
    environment: "quarto",
    primaryMaterial: "mdf",
    difficulty: "avancado",
    estimatedTime: nD > 5 ? "2 a 3 dias" : "2 dias",
    tools: DOOR_TOOLS,
    summary: `${nome} em MDF BP ${c.cor}, ${cm(W)} × ${cm(H)} × ${cm(D)} cm, gavetas com corrediça telescópica e caixa em MDF 15 mm com fundo de HDF${legs ? ", sobre pés metálicos" : ", com rodapé recuado"}. O tampo livre serve de apoio para espelho, abajur ou trocador.`,
    materials: baseMats(m),
    parts,
    ...JOIN_MINIFIX,
    hardware: [
      ["Corrediça telescópica 400/450 mm", `${nD} pares`],
      ["Puxador", `${nD} un`],
      ["Minifix 15 mm", `${12 + dividers.length * 4} un`],
      ["Parafuso 3,5 × 14 mm (corrediças)", `${nD * 12} un`],
      ["Parafuso 4,0 × 40 mm (gavetas)", `${nD * 8} un`],
      ...(legs ? ([["Pé metálico 15 cm", "4 un"]] as [string, string][]) : []),
      ["Suporte antitombamento", "1 un"],
    ],
    hwCost: nD * 55 + 40 + (legs ? 80 : 0),
    finish: FIN.bp,
    steps: stepsCarcass({ drawers: nD, plinth: !legs, legs }),
    warnings: [
      WARN.tombamento.replace("Móvel alto", "Cômoda com gavetas abertas"),
      "Monte as gavetas pelo vão real do móvel pronto: a caixa precisa ter 25 mm a menos que o vão (12,5 mm por corrediça).",
    ],
    visual: `${nome.toLowerCase()} em MDF ${c.cor} com frentes lisas e puxadores metálicos${legs ? ", pés finos" : ""}`,
    scene: "quarto com parede em tom neutro, espelho redondo acima da cômoda e vaso com flores secas",
  });
}

// ───────────────────────────── CRIADOS-MUDOS ─────────────────────────────
export function criado(cfg: "gaveta-nicho" | "2gavetas" | "suspenso" | "palito", c: Cor, W = 450): ProjectDef {
  const m = MAT.bp15(c.cor, c.look);
  const t = 15,
    D = 350;
  let parts: Part[];
  const H = cfg === "suspenso" ? 220 : cfg === "palito" ? 550 : 550;
  if (cfg === "suspenso") parts = carcass({ W, H, D, t, mat: m.key, drawers: [{ bay: 0, fronts: [H] }], handles: "none" });
  else if (cfg === "palito") parts = carcass({ W, H, D, t, mat: m.key, legs: { h: 250, mat: "madeira", size: 30 }, drawers: [{ bay: 0, fronts: [150], y0: H - 250 - 150 }] });
  else if (cfg === "2gavetas") parts = carcass({ W, H, D, t, mat: m.key, plinth: 50, drawers: [{ bay: 0, fronts: [250, 250] }] });
  else parts = carcass({ W, H, D, t, mat: m.key, plinth: 50, shelves: [{ bay: 0, ys: [200] }], drawers: [{ bay: 0, fronts: [150], y0: H - 50 - 150 }] });
  const nD = count(parts, "Frente de gaveta");
  const nome = { "gaveta-nicho": "com gaveta e nicho", "2gavetas": "com 2 gavetas", suspenso: "suspenso com gaveta", palito: "retrô com pés palito" }[cfg];
  return gen({
    title: `Criado-mudo ${nome} — MDF ${c.cor}${W !== 450 ? ` (${cm(W)} cm)` : ""}`,
    category: "quarto",
    environment: "quarto",
    primaryMaterial: "mdf",
    difficulty: "intermediario",
    estimatedTime: "1 dia",
    tools: [...MDF_TOOLS, ...(cfg === "suspenso" ? TOOLS.nivel : [])],
    summary: `Mesa de cabeceira ${nome}, em MDF BP ${c.cor} 15 mm, ${cm(W)} cm de largura. ${cfg === "suspenso" ? "Fica presa na parede, deixando o chão livre para limpar e para caixas embaixo; a gaveta abre com cava, sem puxador." : cfg === "palito" ? "Pés palito de madeira dão o ar anos 60 e deixam a peça leve." : "Altura de 55 cm, que acompanha a maioria das camas box."}`,
    materials: baseMats(m),
    parts,
    ...JOIN_MDF,
    hardware: [
      ["Corrediça telescópica 300 mm", `${nD} par(es)`],
      ...(cfg === "suspenso" ? ([["Suporte invisível / cantoneira oculta", "2 un"], ["Bucha 8 + parafuso", "4 un"]] as [string, string][]) : [["Puxador", `${nD} un`]] as [string, string][]),
      ...(cfg === "palito" ? ([["Pé palito de madeira 25 cm com chapa", "4 un"]] as [string, string][]) : []),
      ["Parafuso 4,0 × 40 mm", "20 un"],
    ],
    hwCost: nD * 45 + (cfg === "palito" ? 70 : 20),
    finish: FIN.bp,
    steps: stepsCarcass({ drawers: nD, plinth: cfg !== "palito" && cfg !== "suspenso", legs: cfg === "palito", wall: cfg === "suspenso" }),
    warnings: cfg === "suspenso" ? [WARN.parede, "Não apoie peso acima de 10 kg nem sente em cima."] : ["Ajuste a altura para ficar de 0 a 5 cm acima do colchão."],
    visual: `criado-mudo ${nome} em MDF ${c.cor}, minimalista`,
    scene: "ao lado de cama com roupa de cama branca, abajur de cerâmica e livro",
  });
}

// ───────────────────────────── RACKS / APARADORES ─────────────────────────────
export function rack(W: number, cfg: "2portas-nicho" | "gavetas" | "suspenso" | "aberto", c: Cor, legs = true): ProjectDef {
  const m = MAT.bp18(c.cor, c.look);
  const t = 18,
    D = 400;
  const H = cfg === "suspenso" ? 350 : 500;
  const base = cfg === "suspenso" ? 0 : legs ? 120 : 0;
  const innerW = W - 2 * t;
  const bay = Math.round((innerW - 2 * t) / 3);
  const dividers = [bay, 2 * bay + t];
  const doors = cfg === "2portas-nicho" || cfg === "suspenso" ? [{ bay: 0, leaves: 1 }, { bay: 2, leaves: 1 }] : [];
  const drawers = cfg === "gavetas" ? [{ bay: "all" as const, fronts: [H - base] }] : [];
  const parts = carcass({ W, H, D, t, mat: m.key, legs: base ? { h: base, mat: "metal", size: 30 } : undefined, dividers, doors, drawers, shelves: cfg === "aberto" ? [{ bay: "all", ys: [Math.round((H - base - 3 * t) / 2)] }] : [], handles: "none", openBack: cfg === "aberto" });
  const nome = { "2portas-nicho": "2 portas e nicho central", gavetas: "3 gavetões", suspenso: "suspenso com 2 portas", aberto: "aberto com prateleiras" }[cfg];
  return gen({
    title: `Rack ${cm(W)} cm ${nome} — ${c.cor}`,
    category: "sala",
    environment: "sala",
    primaryMaterial: "mdf",
    difficulty: cfg === "gavetas" ? "avancado" : "intermediario",
    estimatedTime: cfg === "gavetas" ? "2 dias" : "1 dia",
    tools: DOOR_TOOLS,
    summary: `Rack de TV de ${cm(W)} cm em MDF BP ${c.cor} 18 mm, ${nome}${base ? ", sobre pés metálicos de 12 cm" : ""}. Frentes com abertura por cava ou fecho toque — sem puxador aparente. Passa-fios nas divisórias.`,
    materials: cfg === "aberto" ? [m] : [m, MAT.hdf3()],
    parts,
    ...JOIN_MINIFIX,
    hardware: [
      ...(doors.length ? ([["Dobradiça de caneco 35 mm reta", `${doors.length * 2} un`], ["Fecho toque (push)", `${doors.length} un`]] as [string, string][]) : []),
      ...(drawers.length ? ([["Corrediça telescópica 350 mm com amortecedor", "3 pares"]] as [string, string][]) : []),
      ["Minifix 15 mm", "16 un"],
      ["Passa-fio 35 mm", "2 un"],
      ...(base ? ([["Pé metálico 12 cm", "4 un"]] as [string, string][]) : []),
      ...(cfg === "suspenso" ? ([["Suporte oculto para móvel suspenso", "3 un"], ["Bucha 8 + parafuso", "6 un"]] as [string, string][]) : []),
    ],
    hwCost: 50 + doors.length * 40 + drawers.length * 180 + (base ? 70 : 0),
    finish: FIN.bp,
    steps: stepsCarcass({ doors: doors.length, drawers: drawers.length ? 3 : 0, legs: !!base, wall: cfg === "suspenso" }),
    warnings: [
      "TV acima de 50 polegadas deve ir no suporte de parede, não sobre o rack.",
      "Deixe 5 cm atrás do rack para ventilação dos aparelhos.",
      ...(cfg === "suspenso" ? [WARN.parede] : []),
    ],
    visual: `rack de TV ${nome} em MDF ${c.cor}, linhas retas${base ? ", pés metálicos pretos" : ""}`,
    scene: "sala de estar com TV na parede, vinis e plantas, tapete de lã",
  });
}

export function aparador(W: number, c: Cor): ProjectDef {
  const m = MAT.bp18(c.cor, c.look);
  const t = 18,
    D = 400,
    H = 800;
  const innerW = W - 2 * t;
  const bays = W >= 1400 ? 4 : 3;
  const bw = (innerW - (bays - 1) * t) / bays;
  const dividers = Array.from({ length: bays - 1 }, (_, i) => Math.round((i + 1) * bw + i * t));
  const parts = carcass({ W, H, D, t, mat: m.key, legs: { h: 250, mat: "madeira", size: 35 }, dividers, doors: Array.from({ length: bays }, (_, i) => ({ bay: i, leaves: 1 })), shelves: [{ bay: "all", ys: [Math.round((H - 250 - 3 * t) / 2)] }] });
  return gen({
    title: `Buffet aparador ${cm(W)} cm com ${bays} portas — ${c.cor}`,
    category: "sala",
    environment: "sala",
    primaryMaterial: "mdf",
    difficulty: "intermediario",
    estimatedTime: "2 dias",
    tools: DOOR_TOOLS,
    summary: `Buffet para sala de jantar ou hall em MDF BP ${c.cor} 18 mm: ${bays} portas com prateleira interna, pés de madeira de 25 cm e tampo livre de ${cm(W)} × ${cm(D)} cm para servir.`,
    materials: baseMats(m),
    parts,
    ...JOIN_MINIFIX,
    hardware: [
      ["Dobradiça de caneco 35 mm reta", `${bays * 2} un`],
      ["Puxador", `${bays} un`],
      ["Pé de madeira 25 cm com chapa", "4 un"],
      ["Minifix 15 mm", `${12 + dividers.length * 4} un`],
      ["Pino suporte de prateleira", `${bays * 4} un`],
    ],
    hwCost: bays * 35 + 110,
    finish: FIN.bp,
    steps: stepsCarcass({ doors: bays, shelves: 1, legs: true }),
    warnings: ["Pés de 25 cm deixam o móvel leve visualmente: evite carga acima de 40 kg no tampo.", WARN.esquadro],
    visual: `buffet aparador ${c.cor} com ${bays} portas e pés de madeira, estilo escandinavo`,
    scene: "sala de jantar com quadro grande na parede, luminária de mesa e louças sobre o tampo",
  });
}

// ───────────────────────────── SAPATEIRAS ─────────────────────────────
export function sapateira(W: number, H: number, cfg: "portas" | "aberta", c: Cor): ProjectDef {
  const m = MAT.bp15(c.cor, c.look);
  const t = 15,
    D = cfg === "portas" ? 380 : 320;
  const inner = H - 50 - 3 * t;
  const n = Math.max(2, Math.round(inner / 190) - 1);
  const innerW = W - 2 * t;
  const dividers = innerW > 800 ? splitBays(innerW, t) : [];
  const bays = dividers.length + 1;
  const parts = carcass({ W, H, D, t, mat: m.key, plinth: 50, dividers, shelves: [{ bay: "all", ys: even(n, inner, t) }], doors: cfg === "portas" ? Array.from({ length: bays }, (_, i) => ({ bay: i, leaves: W / bays > 500 ? 2 : 1 })) : [] });
  const pares = Math.round(((n + 1) * innerW) / 170);
  const nP = count(parts, "Porta");
  return gen({
    title: `Sapateira ${cfg === "portas" ? `${nP} porta${nP > 1 ? "s" : ""}` : "aberta"} ${cm(W)} × ${cm(H)} cm — ${c.cor}`,
    category: "entrada",
    environment: "entrada",
    primaryMaterial: "mdf",
    difficulty: cfg === "portas" ? "intermediario" : "iniciante",
    estimatedTime: cfg === "portas" ? "1 dia" : "Meio dia",
    tools: cfg === "portas" ? DOOR_TOOLS : MDF_TOOLS,
    summary: `Sapateira ${cfg === "portas" ? "fechada" : "aberta"} em MDF BP ${c.cor}, ${n + 1} níveis de ~19 cm (altura de tênis) — cabem cerca de ${pares} pares. ${cfg === "portas" ? "Portas escondem a bagunça e o tampo recebe chaves e bolsa." : "Níveis abertos deixam o calçado ventilar."}`,
    materials: baseMats(m),
    parts,
    ...JOIN_MDF,
    hardware: [
      ...(nP ? ([["Dobradiça de caneco 35 mm reta", `${nP * 2} un`], ["Puxador", `${nP} un`]] as [string, string][]) : []),
      ["Parafuso 4,0 × 40 mm", `${20 + count(parts, "Prateleira") * 4} un`],
      ["Furos de ventilação (broca 25 mm) no fundo", "opcional"],
      ...(H > 1000 ? ([["Suporte antitombamento", "1 un"]] as [string, string][]) : []),
    ],
    hwCost: nP * 30 + 30,
    finish: FIN.bp,
    steps: stepsCarcass({ doors: nP, shelves: n, plinth: true }),
    warnings: ["Bota de cano alto não cabe em vão de 19 cm: se precisar, retire uma prateleira de um dos vãos.", "Faça furos de ventilação no fundo para o calçado não criar cheiro."],
    visual: `sapateira ${cfg === "portas" ? "com portas lisas" : "aberta com tênis organizados"} em MDF ${c.cor}`,
    scene: "hall de entrada com espelho, cabideiro de parede e tapete capacho",
  });
}

// ───────────────────────────── ESCRIVANINHAS ─────────────────────────────
export function escrivaninha(W: number, drawers: boolean, c: Cor): ProjectDef {
  const m = MAT.bp18(c.cor, c.look);
  const t = 18,
    D = 550,
    H = 750;
  const parts: Part[] = [
    bx("Tampo", m.key, 0, H - t, 0, W, t, D),
    bx("Lateral (painel)", m.key, 0, 0, 0, t, H - t, D),
    bx("Lateral (painel)", m.key, W - t, 0, 0, t, H - t, D),
    bx("Painel de modéstia", m.key, t, H - t - 300, 20, W - 2 * t, 300, t),
  ];
  if (drawers) {
    const Wm = 400 + 2 * t;
    const mod = carcass({ W: Wm, H: 450, D: D - 40, t, mat: m.key, drawers: [{ bay: 0, fronts: [150, 150, 150] }], openBack: true, topOver: false });
    // a lateral direita e o tampo do módulo são a própria lateral e o tampo da mesa
    for (const p of mod) {
      if ((p.name === "Lateral" && p.o[0] > 1) || p.name === "Tampo") continue;
      parts.push({ ...p, o: [p.o[0] + W - Wm, p.o[1] + (H - t - 450), p.o[2] + 40] });
    }
  }
  const nD = parts.filter((p) => p.name === "Frente de gaveta").length;
  return gen({
    title: `Escrivaninha ${cm(W)} cm${drawers ? " com gaveteiro suspenso" : ""} — ${c.cor}`,
    category: "sala",
    environment: "escritorio",
    primaryMaterial: "mdf",
    difficulty: drawers ? "avancado" : "iniciante",
    estimatedTime: drawers ? "2 dias" : "Meio dia",
    tools: drawers ? DOOR_TOOLS : MDF_TOOLS,
    summary: `Mesa de trabalho de ${cm(W)} × ${cm(D)} cm em MDF BP ${c.cor} 18 mm, laterais em painel e painel de modéstia que trava o balanço ao digitar${drawers ? `. Gaveteiro suspenso com ${nD} gavetas preso sob o tampo, sem tirar espaço das pernas` : ""}.`,
    materials: [m, MAT.hdf3()],
    parts,
    ...JOIN_MINIFIX,
    hardware: [
      ["Minifix 15 mm", "10 un"],
      ["Sapata niveladora", "4 un"],
      ...(drawers ? ([["Corrediça telescópica 450 mm", `${nD} pares`], ["Puxador", `${nD} un`]] as [string, string][]) : []),
      ["Passa-fio 60 mm", "1 un"],
    ],
    hwCost: 40 + nD * 50,
    finish: FIN.bp,
    steps: [
      "Fite as bordas visíveis de todas as peças.",
      "Fure as caixas de Minifix no tampo e no painel de modéstia; pinos nos topos das laterais.",
      "Com o tampo de cabeça para baixo, una laterais e painel de modéstia.",
      ...(drawers ? ["Monte o módulo do gaveteiro, instale corrediças e gavetas e parafuse o módulo sob o tampo, encostado na lateral direita."] : []),
      "Abra o passa-fio no fundo do tampo, vire a mesa e instale as sapatas niveladoras.",
    ],
    warnings: ["Altura de trabalho padrão: 75 cm. Com cadeira sem regulagem, teste antes de cortar as laterais.", "Deixe no mínimo 60 cm livres para as pernas."],
    visual: `escrivaninha em MDF ${c.cor} com laterais em painel${drawers ? " e gaveteiro suspenso" : ""}, minimalista`,
    scene: "home office iluminado com notebook, luminária articulada e planta na parede",
  });
}

// ───────────────────────────── GUARDA-ROUPAS ─────────────────────────────
export function guardaRoupa(W: number, doorsN: number, drawersRow: boolean, c: Cor): ProjectDef {
  const m = MAT.bp15(c.cor, c.look);
  const t = 15,
    H = 2100,
    D = 550,
    plinth = 70;
  const innerW = W - 2 * t;
  const modules = Math.ceil(doorsN / 2);
  const mw = (innerW - (modules - 1) * t) / modules;
  const dividers = Array.from({ length: modules - 1 }, (_, i) => Math.round((i + 1) * mw + i * t));
  const inner = H - plinth - 3 * t;
  const drawerH = drawersRow ? 400 : 0;
  const doors = Array.from({ length: modules }, (_, i) => ({ bay: i, leaves: i === modules - 1 && doorsN % 2 ? 1 : 2, y0: drawerH }));
  const drawers = drawersRow ? [{ bay: "all" as const, fronts: [200, 200] }] : [];
  const shelves = Array.from({ length: modules }, (_, i) => ({ bay: i, ys: i % 2 === 0 ? [inner - 350] : [inner - 350, ...even(3, inner - 400 - drawerH, t).map((y) => y + drawerH)] }));
  const rods = Array.from({ length: modules }, (_, i) => i).filter((i) => i % 2 === 0).map((bay) => ({ bay, y: inner - 430 }));
  const parts = carcass({ W, H, D, t, mat: m.key, plinth, dividers, doors, drawers, shelves: drawersRow ? [...shelves, { bay: "all", ys: [drawerH - t] }] : shelves, rods });
  const nP = count(parts, "Porta"),
    nD = count(parts, "Frente de gaveta");
  return gen({
    title: `Guarda-roupa ${nP} portas${nD ? ` e ${nD} gavetas` : ""} ${cm(W)} cm — ${c.cor}`,
    category: "quarto",
    environment: "quarto",
    primaryMaterial: "mdf",
    difficulty: "avancado",
    estimatedTime: nP > 4 ? "4 a 5 dias" : "3 a 4 dias",
    tools: DOOR_TOOLS,
    summary: `Guarda-roupa de ${cm(W)} cm em MDF BP ${c.cor} 15 mm dividido em ${modules} módulo${modules > 1 ? "s" : ""}: cabideiro com maleiro e módulo de prateleiras alternados${nD ? `, com ${nD} gavetas na base` : ""}. ${nP} portas de abrir, rodapé recuado e fundo em HDF.`,
    materials: baseMats(m),
    parts,
    ...JOIN_MDF,
    hardware: [
      ["Dobradiça de caneco 35 mm reta", `${nP * 3} un`],
      ...(nD ? ([["Corrediça telescópica 450 mm", `${nD} pares`]] as [string, string][]) : []),
      ["Puxador", `${nP + nD} un`],
      ["Tubo cabideiro com flanges", `${rods.length} un`],
      ["Pino suporte de prateleira", `${count(parts, "Prateleira") * 4} un`],
      ["Parafuso 4,0 × 40 mm", `${60 + modules * 20} un`],
      ["Cavilha 8 × 30 mm", `${30 + modules * 8} un`],
      ["Suporte antitombamento", "2 un"],
    ],
    hwCost: nP * 45 + nD * 50 + rods.length * 45 + 90,
    finish: FIN.bp,
    steps: stepsCarcass({ doors: nP, drawers: nD, shelves: 3, plinth: true }),
    warnings: [
      WARN.tombamento,
      "Portas de 1,5 m ou mais pedem 3 dobradiças cada.",
      "Para levantar um móvel de 2,10 m você precisa de ~2,17 m de pé-direito (é a diagonal com 55 cm de profundidade). Monte deitado e levante com ajuda.",
      WARN.corteLoja,
    ],
    visual: `guarda-roupa ${c.cor} com ${nP} portas altas${nD ? ` e ${nD} gavetas na base` : ""}, puxadores longos pretos`,
    scene: "quarto de casal claro com piso de madeira e luz natural",
  });
}

// ───────────────────────────── BANHEIRO ─────────────────────────────
export function gabineteBanheiro(W: number, cfg: "portas" | "gavetao", c: Cor): ProjectDef {
  const m = MAT.ru18(c.cor, c.look);
  const t = 18,
    H = 500,
    D = 450;
  const parts = carcass({
    W,
    H,
    D,
    t,
    mat: m.key,
    openBack: true,
    doors: cfg === "portas" ? [{ bay: 0, leaves: W > 450 ? 2 : 1 }] : [],
    drawers: cfg === "gavetao" ? [{ bay: 0, fronts: [H] }] : [],
    handles: "none",
  });
  parts.push(bx("Travessa traseira de fixação", m.key, t, H - t - 100, 0, W - 2 * t, 100, t));
  parts.push(bx("Cuba de apoio", "branco", W / 2 - 180, H, D / 2 - 170, 360, 130, 340, { cut: false }));
  const nP = count(parts, "Porta");
  return gen({
    title: `Gabinete suspenso de banheiro ${cm(W)} cm — ${cfg === "portas" ? `${nP} porta${nP > 1 ? "s" : ""}` : "gavetão"} (${c.cor})`,
    category: "banheiro",
    environment: "banheiro",
    primaryMaterial: "mdf",
    difficulty: "intermediario",
    estimatedTime: "1 a 2 dias",
    tools: [...DOOR_TOOLS, ...TOOLS.tico],
    summary: `Gabinete de pia suspenso de ${cm(W)} cm em MDF RU (resistente à umidade) ${c.cor}, para cuba de apoio. ${cfg === "gavetao" ? "Um gavetão com recorte em U para o sifão guarda tudo à vista de cima." : "Portas com fecho toque e costas abertas para sifão e registros."} Fixado na parede pela travessa traseira.`,
    materials: [m, MAT.hdf3()],
    parts,
    joinery: "Cavilha + parafuso inox; fixação na parede pela travessa traseira",
    joineryWhy: "Móvel suspenso trabalha pendurado: a travessa alta recebe os parafusos da parede e transfere o peso para as laterais. Parafuso inox não enferruja nem mancha.",
    hardware: [
      ...(nP ? ([["Dobradiça de caneco 35 mm reta", `${nP * 2} un`], ["Fecho toque", `${nP} un`]] as [string, string][]) : [["Corrediça telescópica 400 mm pesada", "1 par"]] as [string, string][]),
      ["Cantoneira reforçada 50 mm", "4 un"],
      ["Bucha 8 + parafuso 5,5 × 60 mm", "4 un"],
      ["Silicone neutro", "1 tubo"],
      ["Cuba de apoio e válvula", "Comprar à parte"],
    ],
    hwCost: 70 + nP * 30 + (nP ? 0 : 90),
    finish: `${FIN.bp} Fite TODAS as bordas, inclusive as de trás, e vede o furo da válvula com verniz PU ou silicone.`,
    steps: [
      "Fite todas as bordas.",
      "Abra o furo da válvula no tampo com serra copo, conforme a cuba escolhida.",
      "Monte base, laterais, tampo e travessa traseira com cavilha e parafuso inox.",
      cfg === "gavetao" ? "Monte o gavetão com recorte em U na traseira para o sifão e instale a corrediça." : "Fure e instale as portas com fecho toque.",
      "Marque a altura na parede (tampo a ~85 cm do chão) e fixe pela travessa com bucha 8.",
      "Assente a cuba, instale a válvula e vede com silicone neutro.",
    ],
    warnings: ["MDF comum não serve para banheiro: use MDF RU (núcleo verde).", "Confira a posição do esgoto e da água antes de definir a altura.", WARN.parede],
    visual: `gabinete de banheiro suspenso ${c.cor} com ${cfg === "gavetao" ? "gavetão" : "portas"} sem puxador e cuba de apoio branca`,
    scene: "banheiro com revestimento de cimento queimado, torneira preta de parede e toalhas enroladas",
  });
}

export function armarioEspelho(W: number, c: Cor): ProjectDef {
  const m = MAT.ru18(c.cor, c.look);
  const t = 18,
    H = 600,
    D = 150;
  const parts = carcass({ W, H, D, t, mat: m.key, topOver: false, shelves: [{ bay: 0, ys: [180, 360] }], doors: [{ bay: 0, leaves: W > 500 ? 2 : 1 }], handles: "none" });
  for (const d of parts.filter((p) => p.name === "Porta")) parts.push(bx("Espelho 4 mm", "espelho", d.o[0] + 8, d.o[1] + 8, d.o[2] + t, d.u[0] - 16, d.v[1] - 16, 4, { cut: false }));
  const nP = count(parts, "Porta");
  return gen({
    title: `Armário de banheiro com espelho ${cm(W)} cm — ${c.cor}`,
    category: "banheiro",
    environment: "banheiro",
    primaryMaterial: "mdf",
    difficulty: "intermediario",
    estimatedTime: "1 dia",
    tools: DOOR_TOOLS,
    summary: `Armário raso de ${cm(W)} × ${cm(H)} cm em MDF RU ${c.cor}, com ${nP} porta${nP > 1 ? "s" : ""} revestida${nP > 1 ? "s" : ""} de espelho e duas prateleiras para cosméticos. Abre com fecho toque, sem puxador.`,
    materials: [m, MAT.hdf3(), MAT.outro("espelho", "Espelho 4 mm lapidado", "Vidro", `${nP} × ${cm(W / nP - 22)} × ${cm(H - 22)} cm`, "espelho", nP * 70, 4)],
    parts,
    joinery: "Parafuso 4,0 × 40 mm + cavilha; espelho colado com silicone neutro",
    joineryWhy: "Caixa rasa e leve: parafuso com cavilha basta. O espelho é colado com silicone neutro próprio, que não ataca a prata.",
    hardware: [
      ["Dobradiça de caneco 35 mm reta", `${nP * 2} un`],
      ["Fecho toque", `${nP} un`],
      ["Pino suporte de prateleira", "8 un"],
      ["Suporte para armário aéreo", "1 par"],
      ["Silicone neutro para espelho", "1 tubo"],
    ],
    hwCost: 60 + nP * 35,
    finish: FIN.bp + " No banheiro, fite todas as bordas.",
    steps: [...stepsCarcass({ doors: nP, shelves: 2, wall: true }), "Tire as portas, deite-as e cole o espelho com cordões verticais de silicone neutro. Deixe 24 h deitado antes de recolocar."],
    warnings: ["Use silicone neutro: o acético (cheiro de vinagre) mancha o espelho.", "Não instale dentro da área do box.", WARN.parede],
    visual: `armário de banheiro com porta de espelho sem moldura, caixa em MDF ${c.cor}`,
    scene: "banheiro claro com pia de apoio, torneira dourada e plantas",
  });
}

// ───────────────────────────── CABECEIRAS / PAINÉIS ─────────────────────────────
export function cabeceira(W: number, nome: string): ProjectDef {
  const base = MAT.mdf15("preto");
  const ripa = MAT.pinus(15, 40, "freijo");
  const H = 1200;
  const parts: Part[] = [bx("Painel de fundo", base.key, 0, 0, 0, W, H, 15)];
  const n = Math.floor((W + 20) / 60);
  const start = (W - (n * 40 + (n - 1) * 20)) / 2;
  for (let i = 0; i < n; i++) parts.push(bx("Ripa", ripa.key, start + i * 60, 0, 15, 40, H, 15));
  return gen({
    title: `Cabeceira ripada ${nome} (${cm(W)} cm)`,
    category: "quarto",
    environment: "quarto",
    primaryMaterial: "mdf",
    difficulty: "iniciante",
    estimatedTime: "1 dia",
    tools: [...TOOLS.base, ...TOOLS.madeira, ...TOOLS.nivel],
    summary: `Cabeceira de ${cm(W)} × ${cm(H)} cm para cama ${nome}: painel de MDF pintado de preto com ${n} ripas de madeira espaçadas de 2 cm. Presa na parede, vai do chão até 1,20 m e dá textura sem obra.`,
    materials: [base, ripa, MAT.outro("tinta", "Tinta preta fosca", "Esmalte acrílico", "900 ml", "preto", 60)],
    parts,
    joinery: "Ripas coladas (cola PU) e pinadas no painel; painel parafusado na parede",
    joineryWhy: "As ripas só precisam ficar presas ao painel; a cola PU segura para sempre e os pinos seguram enquanto ela cura. O painel inteiro vai parafusado na parede, então nada fica pendurado nas ripas.",
    hardware: [
      ["Cola PU", "2 tubos"],
      ["Pino/prego sem cabeça 1 × 25", `${n * 4} un`],
      ["Bucha 8 + parafuso 5,0 × 60 mm", "6 un"],
    ],
    hwCost: 90,
    finish: `Painel: 2 demãos de preto fosco. Ripas: ${FIN.oleo}`,
    steps: [
      "Pinte o painel e deixe secar.",
      "Lixe e passe óleo nas ripas antes de colar.",
      "Corte dois espaçadores de 20 mm e cole as ripas da esquerda para a direita, conferindo o prumo a cada 5 ripas.",
      "Pine cada ripa no topo e na base enquanto a cola cura.",
      "Com a cama afastada, fure o painel entre as ripas, marque na parede e fixe com bucha 8.",
    ],
    warnings: [W > 1830 ? "O painel passa de 1,83 m: peça o corte do MDF no sentido do comprimento da chapa (2,75 m)." : "Confira o prumo da primeira ripa: se ela sair torta, todas saem.", WARN.parede],
    visual: `cabeceira de cama ${nome} com ripas verticais de madeira sobre fundo preto`,
    scene: "quarto aconchegante com cama arrumada, mesas de cabeceira e arandelas",
  });
}

export function painelRipado(W: number, H: number, uso: string, lookRipa: "freijo" | "pinus" | "carvalho" = "freijo"): ProjectDef {
  const base = MAT.mdf15("preto");
  const ripa = MAT.pinus(15, 30, lookRipa);
  const parts: Part[] = [bx("Painel de fundo", base.key, 0, 0, 0, W, H, 15)];
  const n = Math.floor((W + 25) / 55);
  const start = (W - (n * 30 + (n - 1) * 25)) / 2;
  for (let i = 0; i < n; i++) parts.push(bx("Ripa", ripa.key, start + i * 55, 0, 15, 30, H, 15));
  return gen({
    title: `Painel ripado ${cm(W)} × ${cm(H)} cm — ${uso}`,
    category: "decoracao",
    environment: uso.includes("TV") ? "sala" : "qualquer",
    primaryMaterial: "mdf",
    difficulty: "iniciante",
    estimatedTime: W * H > 2e6 ? "1 dia" : "Meio dia",
    tools: [...TOOLS.base, ...TOOLS.madeira, ...TOOLS.nivel],
    summary: `Painel de ${cm(W)} × ${cm(H)} cm com ${n} ripas de 3 cm espaçadas de 2,5 cm sobre MDF preto, para ${uso}. Textura e profundidade na parede sem quebrar nada.`,
    materials: [base, ripa, MAT.outro("tinta", "Tinta preta fosca", "Esmalte acrílico", W * H > 1.5e6 ? "900 ml" : "225 ml", "preto", W * H > 1.5e6 ? 60 : 25)],
    parts,
    joinery: "Ripas coladas com cola PU e pinadas no painel",
    joineryWhy: "Sem esforço estrutural: a cola PU prende as ripas definitivamente e os pinos seguram enquanto cura.",
    hardware: [
      ["Cola PU", W * H > 1.5e6 ? "3 tubos" : "1 tubo"],
      ["Pino sem cabeça 1 × 25", `${n * 3} un`],
      [W * H > 1.5e6 ? "Bucha 8 + parafuso" : "Suporte serrilhado", W * H > 1.5e6 ? "6 un" : "2 un"],
    ],
    hwCost: 40 + n * 2,
    finish: `Fundo: 2 demãos de preto fosco. Ripas: ${FIN.oleo}`,
    steps: ["Pinte o fundo e deixe secar.", "Lixe e passe óleo nas ripas.", "Cole as ripas usando dois espaçadores de 25 mm, conferindo o prumo.", "Pine as pontas de cada ripa.", "Fixe o painel na parede nivelado."],
    warnings: ["Escolha ripas retas: ripa empenada aparece muito no painel.", ...(W * H > 1.5e6 ? [WARN.parede] : [])],
    visual: `painel ripado de madeira ${lookRipa === "pinus" ? "clara" : "tom mel"} sobre fundo preto, ripas verticais`,
    scene: uso.includes("TV") ? "sala com TV fixada no painel e rack baixo embaixo" : "parede de sala com aparador e luminária",
  });
}

// ───────────────────────────── ESTANTE DE CUBOS / CAIXAS / BAÚS ─────────────────────────────
export function cubos(cols: number, rows: number, c: Cor): ProjectDef {
  const m = MAT.bp15(c.cor, c.look);
  const t = 15,
    cube = 330,
    D = 330;
  const W = cols * cube + (cols + 1) * t;
  const H = rows * cube + (rows + 1) * t;
  const dividers = Array.from({ length: cols - 1 }, (_, i) => (i + 1) * cube + i * t);
  const parts = carcass({ W, H, D, t, mat: m.key, topOver: false, dividers, shelves: [{ bay: "all", ys: Array.from({ length: rows - 1 }, (_, i) => (i + 1) * cube + i * t) }] });
  return gen({
    title: `Estante de cubos ${cols} × ${rows} (${cols * rows} nichos) — ${c.cor}`,
    category: "organizacao",
    environment: "qualquer",
    primaryMaterial: "mdf",
    difficulty: "iniciante",
    estimatedTime: cols * rows > 6 ? "1 dia" : "Meio dia",
    tools: MDF_TOOLS,
    summary: `Estante modular com ${cols * rows} nichos de 33 × 33 cm, na medida das caixas organizadoras de tecido do mercado. Em MDF BP ${c.cor} 15 mm, funciona em pé${rows === 1 ? " ou deitada como banco" : ""} e como divisória.`,
    materials: baseMats(m),
    parts,
    ...JOIN_MDF,
    hardware: [
      ["Parafuso 4,0 × 40 mm", `${(cols + rows) * 8} un`],
      ["Cavilha 8 × 30 mm", `${(cols + 1) * (rows + 1) * 2} un`],
      ["Prego 12 × 12 (fundo)", "60 un"],
      ["Suporte antitombamento", H > 900 ? "1 un" : "—"],
    ],
    hwCost: 30 + cols * rows * 3,
    finish: FIN.bp,
    steps: [
      "Fite as bordas frontais.",
      "Monte primeiro as divisórias verticais entre base e topo, com cavilha.",
      "Encaixe as prateleiras curtas de cada coluna, conferindo o vão de 33 cm com um taco espaçador.",
      "Feche com as laterais, confira as diagonais e pregue o fundo.",
      "Se ficar em pé, prenda na parede.",
    ],
    warnings: ["Use um taco de 330 mm como espaçador: é o que garante que as caixas de tecido entrem em todos os nichos.", WARN.prefuro],
    visual: `estante de cubos ${c.cor} com ${cols * rows} nichos, alguns com caixas de tecido e livros`,
    scene: "quarto infantil ou sala com tapete e brinquedos organizados",
  });
}

export function caixaTampa(W: number, H: number, D: number, uso: string): ProjectDef {
  const m = MAT.mdf15("salvia");
  const f = MAT.mdf6();
  const parts = openBox({ W, H: H - 15, D, t: 15, mat: m.key, bottomT: 6, bottomMat: f.key });
  parts.push(bx("Tampa", m.key, 0, H - 15, 0, W, 15, D));
  return gen({
    title: `Caixa com tampa ${cm(W)} × ${cm(D)} cm — ${uso}`,
    category: "organizacao",
    environment: "qualquer",
    primaryMaterial: "mdf",
    difficulty: "iniciante",
    estimatedTime: "3 horas",
    tools: [...TOOLS.base, ...TOOLS.madeira],
    summary: `Caixa organizadora de MDF para ${uso}, ${cm(W)} × ${cm(H)} × ${cm(D)} cm, com tampa solta e fundo de 6 mm. Pintada em verde-sálvia (ou na cor que quiser).`,
    materials: [m, f, MAT.outro("tinta", "Tinta acrílica + fundo para MDF", "Tinta", "225 ml de cada", "salvia", 45)],
    parts,
    joinery: "Cola + prego sem cabeça nos cantos",
    joineryWhy: "Caixa leve: cola PVA com pregos finos dá cantos firmes e rápidos.",
    hardware: [
      ["Prego sem cabeça 1 × 25", "30 un"],
      ["Cola PVA", "50 g"],
      ["Puxador ou alça de couro", "1 un"],
    ],
    hwCost: 25,
    finish: FIN.pintura,
    steps: ["Cole e pregue as cabeceiras entre as laterais longas.", "Cole e pregue o fundo por baixo.", "Cole dois taquinhos sob a tampa para ela encaixar sem escorregar.", "Lixe, pinte e instale o puxador."],
    warnings: ["Tinta em MDF: dê duas demãos de fundo nas bordas para ficarem lisas."],
    visual: `caixa de MDF pintada de verde-sálvia com tampa e puxador de couro`,
    scene: "prateleira de estante com livros e plantas",
  });
}

export function bau(W: number, H: number, D: number, uso: string, look: "pinus" | "branco"): ProjectDef {
  const m = look === "pinus" ? MAT.pinus(20, 300) : MAT.bp15("branco", "branco");
  const t = m.thickness;
  const parts = openBox({ W, H: H - t - (uso.includes("banco") ? 60 : 0), D, t, mat: m.key });
  const topY = H - t - (uso.includes("banco") ? 60 : 0);
  parts.push(bx("Tampa", m.key, 0, topY, 0, W, t, D));
  if (uso.includes("banco")) parts.push(bx("Almofada", "tecido", 10, topY + t, 10, W - 20, 60, D - 20, { cut: false }));
  return gen({
    title: `Baú ${uso} ${cm(W)} cm — ${look === "pinus" ? "pinus" : "MDF branco"}`,
    category: uso.includes("brinquedo") ? "infantil" : "quarto",
    environment: "quarto",
    primaryMaterial: look === "pinus" ? "macica" : "mdf",
    difficulty: "iniciante",
    estimatedTime: "1 dia",
    tools: [...TOOLS.base, ...TOOLS.madeira],
    summary: `Baú ${uso} de ${cm(W)} × ${cm(H)} × ${cm(D)} cm em ${look === "pinus" ? "pinus maciço" : "MDF BP branco"}, com tampa sustentada por pistão a gás — ela não despenca nos dedos.${uso.includes("banco") ? " Almofada de espuma sobre a tampa vira assento." : ""}`,
    materials: [m],
    parts,
    joinery: "Parafuso 4,0 × 40 mm + cola nos cantos",
    joineryWhy: "A caixa do baú é um retângulo fechado: cola e parafuso nos cantos já dão rigidez total.",
    hardware: [
      ["Dobradiça piano ou 2 dobradiças de baú", "1 jogo"],
      ["Pistão a gás / articulador de tampa com amortecedor", "2 un"],
      ["Parafuso 4,0 × 40 mm", "24 un"],
      ["Pé de feltro ou rodízio", "4 un"],
      ...(uso.includes("banco") ? ([["Espuma D33 60 mm + tecido", `${cm(W)} × ${cm(D)} cm`]] as [string, string][]) : []),
    ],
    hwCost: 90 + (uso.includes("banco") ? 80 : 0),
    finish: look === "pinus" ? FIN.verniz : FIN.bp,
    steps: ["Monte o fundo e as quatro laterais com cola e parafuso.", "Faça furos de ventilação de 10 mm no fundo.", "Instale a tampa com a dobradiça.", "Instale os pistões/articuladores seguindo a medida do fabricante.", "Lixe as quinas e aplique o acabamento."],
    warnings: uso.includes("brinquedo") ? ["Use sempre articulador com trava ou amortecedor: tampa solta pode prender a mão da criança.", "Faça furos de ventilação."] : ["Não coloque peso acima de 100 kg sobre a tampa."],
    visual: `baú ${uso} em ${look === "pinus" ? "pinus claro" : "MDF branco"} com tampa${uso.includes("banco") ? " e almofada" : ""}`,
    scene: uso.includes("brinquedo") ? "quarto infantil com brinquedos de madeira" : "pé da cama em quarto claro",
  });
}

// ───────────────────────────── VARIAÇÕES ─────────────────────────────
export function mdfProjects(): ProjectDef[] {
  const out: ProjectDef[] = [];
  const P = (p: ProjectDef) => out.push(p);

  // nichos (12)
  (
    [
      [300, 300, 150, 0, C.branco, false],
      [400, 400, 200, 0, C.preto, false],
      [600, 300, 200, 0, C.carvalho, false],
      [600, 300, 200, 1, C.branco, false],
      [900, 300, 250, 2, C.freijo, false],
      [300, 600, 200, 0, C.grafite, false],
      [450, 450, 250, 0, C.carvalho, true],
      [800, 250, 200, 1, C.preto, true],
      [1200, 300, 250, 3, C.branco, false],
      [350, 350, 250, 0, C.freijo, true],
      [400, 800, 200, 0, C.branco, false],
      [700, 350, 300, 1, C.cinza, false],
    ] as const
  ).forEach(([w, h, d, n, c, o]) => P(nicho(w, h, d, n, c, o)));

  // estantes (10)
  P(estante(600, 1200, 300, MAT.bp15("branco", "branco"), "MDF BP branco", true));
  P(estante(800, 1800, 300, MAT.bp18("carvalho", "carvalho"), "MDF BP carvalho", true));
  P(estante(1000, 1800, 350, MAT.bp18("branco", "branco"), "MDF BP branco", true));
  P(estante(600, 1800, 300, MAT.bp15("preto", "preto"), "MDF BP preto", true));
  P(estante(1200, 900, 350, MAT.bp18("freijó", "freijo"), "MDF BP freijó", false));
  P(estante(800, 1000, 300, MAT.bp15("cinza", "cinza"), "MDF BP cinza", true));
  P(estante(450, 1600, 300, MAT.bp15("branco", "branco"), "MDF BP branco (torre estreita)", true));
  P(estante(1600, 1800, 350, MAT.bp18("carvalho", "carvalho"), "MDF BP carvalho (divisória de ambiente)", false));
  P(estante(800, 1600, 300, MAT.pinus(20, 300), "pinus maciço", false));
  P(estante(600, 1000, 300, MAT.pinus(20, 300), "pinus maciço (baixa)", false));

  // armários com portas (8)
  P(armario(600, 1800, 450, 2, C.branco, "despensa"));
  P(armario(800, 1800, 450, 2, C.cinza, "lavanderia"));
  P(armario(900, 2000, 550, 2, C.carvalho, "roupas (solteiro)", { rod: true }));
  P(armario(600, 900, 400, 2, C.branco, "apoio baixo"));
  P(armario(1000, 900, 450, 2, C.freijo, "buffet de sala", { legs: true, shelves: 1 }));
  P(armario(400, 1800, 400, 1, C.branco, "vassoureiro e limpeza", { shelves: 1 }));
  P(armario(1200, 1800, 450, 3, C.grafite, "despensa grande"));
  P(armario(700, 1200, 400, 2, C.preto, "livros e documentos", { legs: true }));

  // aéreos (8)
  for (const [w, h, c] of [
    [600, 700, C.branco],
    [800, 700, C.cinza],
    [1000, 700, C.carvalho],
    [1200, 700, C.branco],
    [600, 350, C.grafite],
    [800, 350, C.freijo],
    [1000, 350, C.branco],
    [400, 700, C.preto],
  ] as const)
    P(aereo(w, h, c));

  // cozinha base (8)
  P(baseCozinha(400, "gaveteiro3", C.cinza));
  P(baseCozinha(600, "porta-gaveta", C.branco));
  P(baseCozinha(800, "2portas", C.grafite));
  P(baseCozinha(800, "pia", C.branco));
  P(baseCozinha(1000, "2portas-2gavetas", C.carvalho));
  P(baseCozinha(600, "gaveteiro4", C.freijo));
  P(baseCozinha(1200, "pia", C.cinza));
  P(baseCozinha(450, "2portas", C.preto));

  // cômodas e gaveteiros (9)
  P(comoda(800, 850, 450, 4, 1, C.branco, false));
  P(comoda(800, 1000, 450, 5, 1, C.carvalho, false));
  P(comoda(1200, 850, 450, 3, 2, C.freijo, true));
  P(comoda(1200, 1000, 450, 4, 2, C.branco, false));
  P(comoda(600, 700, 400, 3, 1, C.grafite, true));
  P(comoda(400, 650, 450, 3, 1, C.branco, false));
  P(comoda(1000, 800, 450, 3, 1, C.preto, true));
  P(comoda(1500, 800, 480, 3, 3, C.carvalho, true));
  P(comoda(500, 1200, 450, 6, 1, C.cinza, false));

  // criados-mudos (8)
  P(criado("gaveta-nicho", C.branco));
  P(criado("gaveta-nicho", C.carvalho));
  P(criado("2gavetas", C.freijo));
  P(criado("2gavetas", C.grafite, 400));
  P(criado("suspenso", C.branco, 500));
  P(criado("suspenso", C.freijo, 450));
  P(criado("palito", C.branco));
  P(criado("palito", C.cinza, 400));

  // racks (8) e aparadores (5)
  P(rack(1200, "2portas-nicho", C.carvalho));
  P(rack(1400, "2portas-nicho", C.branco));
  P(rack(1600, "gavetas", C.freijo));
  P(rack(1800, "suspenso", C.grafite));
  P(rack(1400, "suspenso", C.carvalho));
  P(rack(1200, "aberto", C.preto));
  P(rack(1600, "aberto", C.branco, false));
  P(rack(2000, "2portas-nicho", C.cinza));
  P(aparador(900, C.carvalho));
  P(aparador(1200, C.branco));
  P(aparador(1500, C.freijo));
  P(aparador(1200, C.grafite));
  P(aparador(1800, C.carvalho));

  // sapateiras (8)
  P(sapateira(600, 1000, "portas", C.branco));
  P(sapateira(800, 1000, "portas", C.carvalho));
  P(sapateira(1000, 1100, "portas", C.cinza));
  P(sapateira(600, 1600, "portas", C.branco));
  P(sapateira(800, 800, "aberta", C.preto));
  P(sapateira(1200, 600, "aberta", C.freijo));
  P(sapateira(500, 1200, "aberta", C.branco));
  P(sapateira(900, 450, "aberta", C.carvalho));

  // escrivaninhas (6)
  P(escrivaninha(900, false, C.branco));
  P(escrivaninha(1000, true, C.carvalho));
  P(escrivaninha(1200, false, C.preto));
  P(escrivaninha(1200, true, C.branco));
  P(escrivaninha(1400, true, C.freijo));
  P(escrivaninha(1600, false, C.grafite));

  // guarda-roupas (6)
  P(guardaRoupa(900, 2, false, C.branco));
  P(guardaRoupa(1200, 3, false, C.carvalho));
  P(guardaRoupa(1600, 4, true, C.branco));
  P(guardaRoupa(1800, 4, false, C.freijo));
  P(guardaRoupa(2400, 6, true, C.branco));
  P(guardaRoupa(1400, 3, true, C.grafite));

  // banheiro (8)
  P(gabineteBanheiro(400, "portas", C.branco));
  P(gabineteBanheiro(500, "gavetao", C.freijo));
  P(gabineteBanheiro(600, "portas", C.cinza));
  P(gabineteBanheiro(800, "gavetao", C.carvalho));
  P(gabineteBanheiro(800, "portas", C.branco));
  P(armarioEspelho(400, C.branco));
  P(armarioEspelho(600, C.carvalho));
  P(armarioEspelho(800, C.branco));

  // cabeceiras (4) e painéis (5)
  P(cabeceira(900, "de solteiro"));
  P(cabeceira(1400, "de casal"));
  P(cabeceira(1600, "queen"));
  P(cabeceira(1930, "king"));
  P(painelRipado(600, 600, "quadro decorativo"));
  P(painelRipado(1200, 600, "parede de hall", "pinus"));
  P(painelRipado(900, 1800, "painel de TV"));
  P(painelRipado(1800, 2400, "painel de TV grande", "carvalho"));
  P(painelRipado(400, 1200, "painel vertical de corredor", "pinus"));

  // cubos (6), caixas (5), baús (5)
  P(cubos(2, 2, C.branco));
  P(cubos(3, 2, C.carvalho));
  P(cubos(3, 3, C.branco));
  P(cubos(4, 2, C.freijo));
  P(cubos(4, 4, C.branco));
  P(cubos(4, 1, C.carvalho));
  P(caixaTampa(300, 150, 200, "documentos"));
  P(caixaTampa(400, 250, 300, "brinquedos pequenos"));
  P(caixaTampa(250, 120, 250, "cabos e carregadores"));
  P(caixaTampa(500, 300, 350, "roupa de cama"));
  P(caixaTampa(200, 100, 200, "chá e cápsulas"));
  P(bau(800, 450, 400, "de brinquedos", "branco"));
  P(bau(1000, 450, 400, "banco com almofada", "pinus"));
  P(bau(1200, 500, 450, "pé de cama", "pinus"));
  P(bau(600, 400, 350, "de brinquedos", "pinus"));
  P(bau(1400, 480, 450, "banco com almofada", "branco"));
  return out;
}
