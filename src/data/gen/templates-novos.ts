// Projetos que faltavam no catálogo (pesquisa de móveis mais procurados):
// mesa dobrável de parede, camas, beliche, painel de TV com nichos, ilha gourmet,
// armário de lavanderia, penteadeira, cristaleira, cômoda com trocador, arara,
// nichos hexagonais e armário de canto em L.
import { bx, carcass, mover, rotY, tiltZ, type Part } from "../../lib/model3d";
import type { ProjectDef } from "../types";
import { FIN, MAT, TOOLS, WARN, cm, gen } from "./kit";

const MDF_T = [...TOOLS.base, ...TOOLS.mdf];
const PORTA_T = [...MDF_T, ...TOOLS.portas, ...TOOLS.nivel];
const MAD_T = [...TOOLS.base, ...TOOLS.madeira];
const JOIN = {
  joinery: "Parafuso 4,0 × 40 mm com pré-furo + cavilha 8 mm",
  joineryWhy: "Parafuso de rosca total com pré-furo segura bem no MDF e a cavilha alinha e absorve o esforço lateral. Permite desmontar sem estragar a chapa.",
};
const comFundo = (parts: Part[], key: string) => parts.map((p) => (p.mat === "hdf3" ? { ...p, mat: key } : p));

function mesaDobravel(W: number, madeira: boolean): ProjectDef {
  const m = madeira ? MAT.pinus(20, 300) : MAT.bp18("carvalho", "carvalho");
  const t = 20;
  const parts: Part[] = [
    bx("Painel de parede", m.key, 0, 300, 0, W, 450, t),
    bx("Tampo", m.key, 0, 750, t, W, t, 500),
    bx("Perna de apoio (dobra junto)", m.key, W / 2 - 40, 0, 480, 80, 750, t),
    bx("Travessa da perna", m.key, W / 2 - 150, 600, 480 - t, 300, 60, t),
    bx("Sarrafo de fixação", m.key, 40, 690, t, W - 80, 60, t),
  ];
  return gen({
    title: `Mesa dobrável de parede ${cm(W)} cm — ${madeira ? "pinus" : "MDF carvalho"}`,
    category: "sala",
    environment: "cozinha",
    primaryMaterial: madeira ? "macica" : "mdf",
    difficulty: "intermediario",
    estimatedTime: "1 dia",
    tools: [...MAD_T, ...TOOLS.nivel],
    summary: `Mesa de ${cm(W)} × 50 cm presa na parede que abaixa e fica com só 4 cm de profundidade quando fechada. A perna central dobra junto com o tampo. Ideal para cozinha e apartamento pequeno.`,
    materials: [m],
    parts,
    joinery: "Dobradiças de piano + perna articulada",
    joineryWhy: "A dobradiça de piano distribui o peso em todo o comprimento do tampo; a perna central leva a carga ao chão, então a parede só segura o tampo fechado.",
    hardware: [
      ["Dobradiça de piano (tampo)", `${cm(W)} cm`],
      ["Dobradiça comum (perna)", "2 un"],
      ["Trinco ou fecho magnético", "1 un"],
      ["Bucha 8 + parafuso 5,0 × 60 mm", "4 un"],
    ],
    hwCost: 90,
    finish: madeira ? FIN.verniz : FIN.bp,
    steps: [
      "Parafuse o sarrafo de fixação no painel de parede, na altura do tampo (75 cm do chão).",
      "Prenda o tampo no sarrafo com a dobradiça de piano.",
      "Monte a perna com a travessa e prenda-a sob o tampo com duas dobradiças, centralizada.",
      "Teste: com o tampo aberto a perna fica a prumo; fechado, a perna dobra rente ao tampo.",
      "Fixe o painel na parede com bucha 8 e instale o trinco que segura o tampo fechado.",
    ],
    warnings: [WARN.parede, "Carga máxima com a perna aberta: 30 kg. Nunca use sem a perna."],
    visual: `mesa dobrável de parede ${madeira ? "em pinus" : "em MDF carvalho"} aberta, com perna central de apoio`,
    scene: "cozinha pequena de apartamento com duas banquetas e xícaras de café",
  });
}

function cama(W: number, L: number, nome: string): ProjectDef {
  const m = MAT.bp18("carvalho", "carvalho");
  const r = MAT.pinus(20, 100);
  const t = 18,
    H = 350;
  const parts: Part[] = [
    bx("Lateral da cama", m.key, 0, 0, 0, t, H, L),
    bx("Lateral da cama", m.key, W + t, 0, 0, t, H, L),
    bx("Cabeceira", m.key, 0, 0, -t, W + 2 * t, 1000, t),
    bx("Peseira", m.key, t, 0, L - t, W, H, t),
    bx("Travessa central", m.key, t + W / 2 - 9, 60, 0, t, H - 120, L - t),
    bx("Sarrafo de apoio", r.key, t, H - 120, 0, 20, 40, L - t),
    bx("Sarrafo de apoio", r.key, W + t - 20, H - 120, 0, 20, 40, L - t),
  ];
  const n = Math.round(L / 110);
  for (let i = 0; i < n; i++) parts.push(bx("Ripa do estrado", r.key, t, H - 80, 30 + i * ((L - 60) / n), W, 20, 70));
  parts.push(bx("Colchão", "tecido", t, H - 60, 0, W, 220, L - t, { cut: false }));
  return gen({
    title: `Cama ${nome} em MDF com cabeceira (colchão ${cm(W)} × ${cm(L)})`,
    category: "quarto",
    environment: "quarto",
    primaryMaterial: "mdf",
    difficulty: "intermediario",
    estimatedTime: "2 dias",
    tools: MDF_T,
    summary: `Cama ${nome} com laterais e cabeceira em MDF BP carvalho 18 mm e estrado de ripas de pinus, para colchão ${cm(W)} × ${cm(L)} cm. Cabeceira inteiriça de 1 m de altura e travessa central contra o embarrigamento.`,
    materials: [m, r],
    parts,
    joinery: "Minifix + cantoneiras metálicas nos cantos",
    joineryWhy: "A cama precisa desmontar para passar em porta e escada: Minifix nos encontros e cantoneira reforçam sem aparecer.",
    hardware: [
      ["Minifix 15 mm", "12 un"],
      ["Cantoneira metálica 50 mm", "8 un"],
      ["Parafuso 4,0 × 40 mm", "60 un"],
      ["Feltro para os pés", "6 un"],
    ],
    hwCost: 110,
    finish: FIN.bp,
    steps: [
      "Parafuse os sarrafos de apoio nas laterais, 12 cm abaixo do topo.",
      "Una laterais, cabeceira e peseira com Minifix e cantoneiras.",
      "Instale a travessa central entre cabeceira e peseira.",
      "Distribua as ripas do estrado e parafuse nas pontas (deixe espaço para ventilar o colchão).",
      "Confira o esquadro pelas diagonais antes de apertar tudo.",
    ],
    warnings: ["Meça o colchão real: alguns modelos têm 1 a 2 cm a mais que a medida nominal.", "Ripas a cada 10 cm no máximo, senão o colchão afunda."],
    visual: `cama ${nome} com cabeceira alta de MDF amadeirado e colchão branco`,
    scene: "quarto aconchegante com roupa de cama de linho e abajur",
  });
}

function beliche(): ProjectDef {
  const r = MAT.pinus(45, 90);
  const t = MAT.pinus(20, 100);
  const W = 880,
    L = 1880,
    H = 1600;
  const parts: Part[] = [];
  for (const [x, z] of [
    [0, 0],
    [W + 45, 0],
    [0, L + 45],
    [W + 45, L + 45],
  ])
    parts.push(bx("Montante", r.key, x, 0, z, 45, H, 90));
  for (const y of [250, 1150]) {
    parts.push(bx("Longarina", r.key, 0, y, 90, 45, 140, L - 45), bx("Longarina", r.key, W + 45, y, 90, 45, 140, L - 45));
    parts.push(bx("Cabeceira (travessa)", t.key, 45, y + 40, 0, W, 100, 20), bx("Cabeceira (travessa)", t.key, 45, y + 40, L + 70, W, 100, 20));
    for (let i = 0; i < 16; i++) parts.push(bx("Ripa do estrado", t.key, 45, y + 120, 100 + i * 115, W, 20, 80));
  }
  parts.push(bx("Grade de proteção", t.key, -20, 1400, 300, 20, 120, L - 400));
  for (let i = 0; i < 4; i++) parts.push(bx("Degrau da escada", t.key, W + 90, 300 + i * 260, L - 300, 20, 60, 380));
  return gen({
    title: "Beliche de pinus para colchão de solteiro",
    category: "quarto",
    environment: "quarto",
    primaryMaterial: "macica",
    difficulty: "avancado",
    estimatedTime: "3 dias",
    tools: [...MAD_T, ...TOOLS.kreg, ...TOOLS.nivel],
    summary: "Beliche de duas camas para colchão 88 × 188 cm, estrutura de caibro 45 × 90 mm, longarinas parafusadas, estrados de ripas, grade de proteção na cama de cima e escada lateral.",
    materials: [r, t],
    parts,
    joinery: "Parafuso estrutural 5,0 × 100 mm + cola PU",
    joineryWhy: "Cama de cima recebe impacto: parafuso estrutural atravessando montante e longarina, com cola, é o que não afrouxa com o uso diário.",
    hardware: [
      ["Parafuso estrutural 5,0 × 100 mm", "48 un"],
      ["Parafuso 4,0 × 40 mm", "140 un"],
      ["Cola PU", "2 tubos"],
      ["Cantoneira de fixação na parede", "2 un"],
    ],
    hwCost: 160,
    finish: FIN.verniz,
    steps: [
      "Monte as duas cabeceiras: 2 montantes + travessas nas duas alturas.",
      "Una as cabeceiras com as longarinas usando parafuso estrutural e cola.",
      "Distribua e parafuse as ripas dos dois estrados.",
      "Instale a grade de proteção em cima (no mínimo 20 cm acima do colchão).",
      "Parafuse os degraus da escada e prenda o beliche na parede.",
    ],
    warnings: ["A grade de proteção é obrigatória e deve ficar pelo menos 20 cm acima do colchão.", "Cama de cima: não recomendada para crianças com menos de 6 anos.", WARN.tombamento],
    visual: "beliche de pinus claro com escada lateral e grade de proteção",
    scene: "quarto infantil com roupa de cama colorida e brinquedos",
  });
}

function painelTV(W: number): ProjectDef {
  const m = MAT.bp18("carvalho", "carvalho");
  const g = MAT.bp15("grafite", "grafite");
  const parts: Part[] = [bx("Painel", m.key, 0, 400, 0, W, 1400, 18)];
  const box = carcass({ W: W * 0.7, H: 350, D: 380, t: 15, mat: g.key, dividers: [Math.round(W * 0.35) - 8], openBack: true, frontDoors: { count: 2 }, handles: "none" });
  parts.push(...mover(box, W * 0.15, 0, 18));
  parts.push(...mover(carcass({ W: 300, H: 300, D: 250, t: 15, mat: g.key, topOver: false, openBack: true }), W - 360, 1200, 18));
  parts.push(bx("TV", "preto", W / 2 - 600, 800, 30, 1200, 700, 40, { cut: false }));
  return gen({
    title: `Painel de TV ${cm(W)} cm com rack suspenso e nicho`,
    category: "sala",
    environment: "sala",
    primaryMaterial: "mdf",
    difficulty: "intermediario",
    estimatedTime: "2 dias",
    tools: [...PORTA_T, "Serra copo 60 mm (passa-fio)"],
    summary: `Painel de ${cm(W)} × 140 cm em MDF carvalho 18 mm com rack suspenso grafite de duas portas e nicho decorativo. Passa-fios escondem os cabos atrás do painel.`,
    materials: [m, g],
    parts,
    ...JOIN,
    hardware: [
      ["Suporte de TV articulado (compre conforme a TV)", "1 un"],
      ["Dobradiça de caneco 35 mm reta", "4 un"],
      ["Fecho toque", "2 un"],
      ["Passa-fio 60 mm", "2 un"],
      ["Cantoneira oculta para rack suspenso", "3 un"],
      ["Bucha 8 + parafuso 5,0 × 60 mm", "10 un"],
    ],
    hwCost: 140,
    finish: FIN.bp,
    steps: [
      "Marque na parede a altura do centro da TV (≈ 1,10 m do chão para quem senta no sofá).",
      "Abra os passa-fios no painel antes de fixá-lo.",
      "Fixe o painel na parede com bucha 8 nos montantes/alvenaria.",
      "Monte o rack e o nicho e prenda-os no painel com cantoneiras ocultas.",
      "Instale o suporte da TV atravessando o painel até a parede.",
    ],
    warnings: ["O suporte da TV deve ser parafusado na parede, nunca só no MDF.", WARN.parede],
    visual: "painel de TV em MDF carvalho com rack suspenso grafite e nicho",
    scene: "sala de estar moderna com sofá cinza e tapete",
  });
}

function ilha(W: number): ProjectDef {
  const b = MAT.bp15("branco", "branco");
  const f = MAT.bp18("verde oliva", "oliva");
  const tp = MAT.mdf18("carvalho");
  const H = 900,
    D = 600;
  const parts = comFundo(carcass({ W, H: H - 30, D, t: 15, mat: b.key, frontMat: f.key, plinth: 80, dividers: [Math.round((W - 45) / 2)], shelves: [{ bay: "all", ys: [300] }], frontDoors: { count: W >= 1400 ? 4 : 2 } }), "hdf3");
  parts.push(bx("Tampo com balanço (2 camadas)", tp.key, -30, H - 30, -350, W + 60, 30, D + 380));
  return gen({
    title: `Ilha gourmet ${cm(W)} cm com balcão de refeições`,
    category: "cozinha",
    environment: "cozinha",
    primaryMaterial: "mdf",
    difficulty: "avancado",
    estimatedTime: "2 a 3 dias",
    tools: PORTA_T,
    summary: `Ilha de ${cm(W)} × 60 cm com portas verde-oliva, prateleiras internas e tampo de 98 cm de profundidade com balanço de 35 cm do lado de trás — vira balcão de refeições para banquetas.`,
    materials: [b, f, tp, MAT.hdf3()],
    parts,
    ...JOIN,
    hardware: [
      ["Dobradiça de caneco 35 mm reta", `${W >= 1400 ? 8 : 4} un`],
      ["Puxador", `${W >= 1400 ? 4 : 2} un`],
      ["Mão-francesa oculta para o balanço do tampo", "3 un"],
      ["Pé regulável", "6 un"],
    ],
    hwCost: 260,
    finish: `${FIN.bp} Tampo: 3 demãos de verniz PU marítimo ou troque por pedra.`,
    steps: [
      "Monte a caixa da ilha com divisória central e prateleiras.",
      "Nivele os pés e fixe o rodapé.",
      "Cole as duas camadas do tampo e fixe as mãos-francesas ocultas sob o balanço.",
      "Fixe o tampo por baixo e instale portas e puxadores.",
    ],
    warnings: ["Balanço acima de 30 cm precisa de mão-francesa oculta para não envergar.", "Deixe 90 cm de passagem em volta da ilha."],
    visual: "ilha de cozinha com portas verde oliva e tampo de madeira com balanço para banquetas",
    scene: "cozinha aberta com banquetas altas e pendentes",
  });
}

function lavanderia(): ProjectDef {
  const b = MAT.bp15("branco", "branco");
  const col = comFundo(carcass({ W: 600, H: 2100, D: 600, t: 15, mat: b.key, plinth: 60, shelves: [{ bay: 0, ys: [500, 1000, 1500] }], frontDoors: { count: 1 } }), "hdf3");
  const aereo = comFundo(carcass({ W: 900, H: 600, D: 350, t: 15, mat: b.key, shelves: [{ bay: 0, ys: [280] }], frontDoors: { count: 2 } }), "hdf3");
  const parts = [...col, ...mover(aereo, 600, 1500, 0), bx("Máquina de lavar", "branco", 640, 0, 20, 600, 850, 580, { cut: false })];
  return gen({
    title: "Armário de lavanderia: coluna vassoureiro + aéreo sobre a máquina",
    category: "cozinha",
    environment: "qualquer",
    primaryMaterial: "mdf",
    difficulty: "intermediario",
    estimatedTime: "2 dias",
    tools: PORTA_T,
    summary: "Coluna de 60 cm até o teto para vassoura, rodo e produtos, mais um aéreo de 90 cm sobre a máquina de lavar. Tudo em MDF branco — combine com MDF RU se a lavanderia pegar umidade.",
    materials: [b, MAT.hdf3()],
    parts,
    ...JOIN,
    hardware: [
      ["Dobradiça de caneco 35 mm reta", "8 un"],
      ["Puxador", "3 un"],
      ["Suporte para armário aéreo", "1 par"],
      ["Gancho para vassoura/rodo", "4 un"],
    ],
    hwCost: 150,
    finish: FIN.bp,
    steps: ["Monte a coluna e fixe na parede.", "Monte o aéreo e pendure 65 cm acima da tampa da máquina.", "Instale portas, ganchos e prateleiras."],
    warnings: ["Deixe 10 cm acima da máquina de lavar com tampa superior para ela abrir.", WARN.tombamento],
    visual: "lavanderia com coluna branca alta e armário aéreo sobre a máquina de lavar",
    scene: "área de serviço clara com cesto de roupas",
  });
}

function penteadeira(W: number): ProjectDef {
  const m = MAT.bp15("branco", "branco");
  const parts: Part[] = [
    bx("Tampo", m.key, 0, 735, 0, W, 15, 450),
    bx("Lateral", m.key, 0, 0, 0, 15, 735, 450),
    bx("Lateral", m.key, W - 15, 0, 0, 15, 735, 450),
    bx("Painel traseiro", m.key, 15, 535, 0, W - 30, 200, 15),
    ...mover(carcass({ W: W - 30, H: 140, D: 420, t: 15, mat: m.key, drawers: [{ bay: 0, fronts: [140] }], openBack: true, topOver: false }).filter((p) => p.name !== "Lateral" && p.name !== "Tampo"), 15, 580, 15),
    bx("Moldura do espelho", m.key, W / 2 - 300, 750, 10, 600, 800, 18),
    bx("Espelho", "espelho", W / 2 - 280, 770, 28, 560, 760, 4, { cut: false }),
  ];
  return gen({
    title: `Penteadeira ${cm(W)} cm com gaveta e espelho`,
    category: "quarto",
    environment: "quarto",
    primaryMaterial: "mdf",
    difficulty: "intermediario",
    estimatedTime: "1 a 2 dias",
    tools: PORTA_T,
    summary: `Penteadeira/escrivaninha de ${cm(W)} cm em MDF branco com gaveta larga sob o tampo e espelho de 56 × 76 cm em moldura. Altura de 75 cm, usa banqueta ou cadeira comum.`,
    materials: [m, MAT.hdf3(), MAT.outro("espelho", "Espelho 4 mm lapidado", "Vidro", "560 × 760 mm", "espelho", 90, 4)],
    parts,
    ...JOIN,
    hardware: [
      ["Corrediça telescópica 400 mm", "1 par"],
      ["Puxador", "1 un"],
      ["Silicone neutro para espelho", "1 tubo"],
      ["Cantoneira de fixação na parede", "2 un"],
    ],
    hwCost: 110,
    finish: FIN.bp,
    steps: ["Monte tampo, laterais e painel traseiro.", "Instale o módulo da gaveta sob o tampo.", "Fixe a moldura do espelho e cole o espelho com silicone neutro.", "Prenda na parede pelas cantoneiras."],
    warnings: ["Use silicone neutro: o acético mancha o espelho.", WARN.parede],
    visual: "penteadeira branca com gaveta e espelho retangular em moldura",
    scene: "quarto feminino com banqueta estofada e iluminação suave",
  });
}

function cristaleira(): ProjectDef {
  const m = MAT.bp18("freijó", "freijo");
  const W = 900,
    H = 1800;
  const parts = comFundo(carcass({ W, H, D: 400, t: 18, mat: m.key, plinth: 80, shelves: [{ bay: 0, ys: [350, 650, 950, 1250] }], frontDoors: { count: 2, y0: 400 }, drawers: [{ bay: 0, fronts: [200, 200] }] }), "hdf3").map((p) => (p.name === "Porta" ? { ...p, name: "Porta de vidro (comprada pronta)", mat: "vidro", cut: false } : p));
  return gen({
    title: "Cristaleira 90 cm com portas de vidro e gavetas",
    category: "sala",
    environment: "sala",
    primaryMaterial: "mdf",
    difficulty: "avancado",
    estimatedTime: "2 a 3 dias",
    tools: PORTA_T,
    summary: "Cristaleira de 90 × 180 cm em MDF freijó: parte de cima com 4 prateleiras e portas de vidro temperado (compradas sob medida na vidraçaria) e duas gavetas na base para toalhas e talheres.",
    materials: [m, MAT.hdf3(), MAT.outro("vidro", "Porta de vidro temperado 4 mm com dobradiça para vidro", "Vidro temperado", "2 portas sob medida", "vidro", 420, 4)],
    parts,
    ...JOIN,
    hardware: [
      ["Dobradiça para porta de vidro", "6 un"],
      ["Puxador para vidro", "2 un"],
      ["Corrediça telescópica 350 mm", "2 pares"],
      ["Fita de LED 3000 K (opcional)", "2 m"],
    ],
    hwCost: 260,
    finish: FIN.bp,
    steps: ["Monte a caixa com rodapé e prateleiras fixas.", "Instale as gavetas da base.", "Meça o vão das portas pronto e encomende o vidro temperado com os furos das dobradiças.", "Instale as portas de vidro e regule.", "Prenda a cristaleira na parede."],
    warnings: ["Vidro temperado não pode ser cortado nem furado depois: encomende com a medida do vão já montado.", WARN.tombamento],
    visual: "cristaleira de madeira freijó com portas de vidro, louças à mostra e duas gavetas embaixo",
    scene: "sala de jantar com mesa posta e luz quente",
  });
}

function comodaTrocador(): ProjectDef {
  const m = MAT.bp15("branco", "branco");
  const W = 1000,
    H = 900;
  const parts = comFundo(carcass({ W, H, D: 500, t: 15, mat: m.key, plinth: 60, drawers: [{ bay: 0, fronts: [280, 280, 280] }] }), "hdf3");
  parts.push(bx("Grade do trocador (frente)", m.key, 0, H, 485, 750, 100, 15), bx("Grade do trocador (fundo)", m.key, 0, H, 0, 750, 100, 15), bx("Grade do trocador (lateral)", m.key, 0, H, 15, 15, 100, 470), bx("Grade do trocador (lateral)", m.key, 735, H, 15, 15, 100, 470));
  parts.push(bx("Colchonete do trocador", "tecido", 20, H, 25, 710, 60, 450, { cut: false }));
  return gen({
    title: "Cômoda com trocador para quarto de bebê",
    category: "infantil",
    environment: "quarto",
    primaryMaterial: "mdf",
    difficulty: "avancado",
    estimatedTime: "2 dias",
    tools: PORTA_T,
    summary: "Cômoda de 3 gavetões em MDF branco com grade de trocador removível no tampo. Quando o bebê cresce, tire a grade e fica uma cômoda comum.",
    materials: [m, MAT.hdf3()],
    parts,
    ...JOIN,
    hardware: [
      ["Corrediça telescópica 450 mm com amortecedor", "3 pares"],
      ["Puxador sem quinas", "3 un"],
      ["Suporte antitombamento", "2 un"],
      ["Parafuso para fixar a grade", "8 un"],
    ],
    hwCost: 230,
    finish: FIN.bp + " Arredonde todas as quinas com lixa.",
    steps: ["Monte a caixa da cômoda e as três gavetas.", "Monte a grade do trocador e parafuse no tampo por baixo.", "Instale puxadores sem quinas vivas.", "Prenda a cômoda na parede com suporte antitombamento."],
    warnings: ["Prender na parede é obrigatório: criança pequena escala gaveta aberta.", "Nunca deixe o bebê sozinho no trocador."],
    visual: "cômoda branca de três gavetas com grade de trocador e colchonete no tampo",
    scene: "quarto de bebê em tons claros com berço e bichos de pelúcia",
  });
}

function arara(W: number): ProjectDef {
  const m = MAT.pinus(30, 60);
  const t = MAT.pinus(20, 300);
  const H = 1600;
  const parts: Part[] = [
    bx("Montante", m.key, 0, 0, 160, 30, H, 60),
    bx("Montante", m.key, W - 30, 0, 160, 30, H, 60),
    bx("Base (pé)", m.key, 0, 0, 0, 30, 60, 380),
    bx("Base (pé)", m.key, W - 30, 0, 0, 30, 60, 380),
    bx("Prateleira de sapatos", t.key, 30, 120, 40, W - 60, 20, 300),
    bx("Barra do cabide", "inox", 30, H - 60, 175, W - 60, 30, 30, { cut: false }),
  ];
  return gen({
    title: `Arara de roupas ${cm(W)} cm com sapateira`,
    category: "quarto",
    environment: "quarto",
    primaryMaterial: "macica",
    difficulty: "iniciante",
    estimatedTime: "Meio dia",
    tools: MAD_T,
    summary: `Arara aberta de ${cm(W)} cm para closet ou loja: dois montantes de pinus, pés estáveis, barra metálica de cabide e prateleira para sapatos na base.`,
    materials: [m, t, MAT.outro("tubo", "Tubo de aço/cabideiro Ø 25 mm", "Aço cromado", `${cm(W)} cm + 2 flanges`, "inox", 60)],
    parts,
    joinery: "Meia-madeira na base + parafuso e cola",
    joineryWhy: "O encaixe meia-madeira entre montante e pé deixa a base firme e no mesmo plano; a prateleira travada embaixo impede o balanço lateral.",
    hardware: [["Flange para tubo", "2 un"], ["Parafuso 4,0 × 50 mm", "16 un"], ["Cola PVA", "100 g"]],
    hwCost: 40,
    finish: FIN.verniz,
    steps: ["Faça o encaixe meia-madeira entre montantes e pés.", "Cole e parafuse.", "Fixe a prateleira de sapatos ligando as duas bases.", "Instale a barra com as flanges no alto dos montantes."],
    warnings: ["Carga: até 25 kg de roupas. Para mais, use tubo de 32 mm."],
    visual: "arara de roupas de pinus com barra metálica, cabides e sapatos na prateleira de baixo",
    scene: "closet aberto minimalista com tapete",
  });
}

function nichosHex(): ProjectDef {
  const m = MAT.pinus(15, 150);
  const parts: Part[] = [];
  const hex = (a: number, cx: number, cy: number) => {
    const ap = (a * Math.sqrt(3)) / 2;
    for (let k = 0; k < 6; k++) {
      const b = bx("Lado do hexágono (pontas a 30°)", m.key, cx - a / 2, cy - ap, 0, a, 15, 150);
      parts.push(tiltZ(b, k * 60, [cx, cy, 0]));
    }
  };
  hex(300, 0, 300);
  hex(250, 470, 420);
  hex(200, 300, 0 + 120);
  return gen({
    title: "Kit 3 nichos hexagonais de parede",
    category: "prateleiras",
    environment: "qualquer",
    primaryMaterial: "macica",
    difficulty: "intermediario",
    estimatedTime: "1 dia",
    tools: [...MAD_T, "Serra de esquadria com ângulo de 30°"],
    summary: "Três nichos em forma de colmeia (lados de 30, 25 e 20 cm) em pinus 15 mm, com pontas cortadas a 30° para fechar o hexágono perfeito. Montagem em grupo na parede.",
    materials: [m],
    parts,
    joinery: "Cola PU + pinos/pregos sem cabeça nos cantos a 30°",
    joineryWhy: "Os seis lados com pontas a 30° fecham o hexágono; cola PU e pregos seguram enquanto o grampo de cinta aperta tudo de uma vez.",
    hardware: [["Prego sem cabeça 1 × 25", "60 un"], ["Cola PU", "1 tubo"], ["Suporte serrilhado", "6 un"], ["Grampo de cinta", "1 un"]],
    hwCost: 70,
    finish: FIN.oleo,
    steps: ["Corte 6 lados para cada tamanho, com as duas pontas a 30°.", "Cole os seis lados e aperte com grampo de cinta; confira se fecham sem fresta.", "Pregue os cantos depois de 1 hora.", "Lixe, aplique óleo e pendure em grupo, encostando os lados."],
    warnings: ["Um erro de 1° no ângulo vira fresta de vários milímetros no último canto: teste com sobras primeiro.", WARN.parede],
    visual: "três nichos hexagonais de madeira clara em composição de colmeia na parede, com plantas",
    scene: "parede de sala branca com plantas pendentes",
  });
}

function armarioCanto(): ProjectDef {
  const b = MAT.bp15("branco", "branco");
  const f = MAT.bp18("azul petróleo", "petroleo");
  const a = comFundo(carcass({ W: 900, H: 820, D: 580, t: 15, mat: b.key, frontMat: f.key, legs: { h: 100, mat: "metal", size: 35 }, shelves: [{ bay: 0, ys: [280] }], frontDoors: { count: 2 } }), "hdf3");
  const c = comFundo(carcass({ W: 800, H: 820, D: 580, t: 15, mat: b.key, frontMat: f.key, legs: { h: 100, mat: "metal", size: 35 }, shelves: [{ bay: 0, ys: [280] }], frontDoors: { count: 2 } }), "hdf3");
  // segundo módulo contra a parede da esquerda, de frente para +x, começando onde o primeiro termina em profundidade
  const parts = [...a, ...mover(c.map((p) => rotY(p, 90, [0, 0, 0])), 0, 0, 580 + 800)];
  return gen({
    title: "Armário de canto em L (módulos de cozinha 90 + 80 cm)",
    category: "cozinha",
    environment: "cozinha",
    primaryMaterial: "mdf",
    difficulty: "avancado",
    estimatedTime: "2 dias",
    tools: PORTA_T,
    summary: "Dois módulos inferiores que fecham um canto em L (90 + 80 cm), caixa branca e portas azul-petróleo, sobre pés reguláveis. O canto morto fica acessível pelo módulo de 90.",
    materials: [b, f, MAT.hdf3()],
    parts,
    ...JOIN,
    hardware: [["Dobradiça de caneco 35 mm reta", "8 un"], ["Puxador", "4 un"], ["Pé regulável 100 mm", "8 un"], ["Parafuso de união de módulos", "4 un"]],
    hwCost: 220,
    finish: FIN.bp,
    steps: ["Monte os dois módulos.", "Posicione em L, nivele pelos pés e una com parafusos de união.", "Instale portas e regule a folga no encontro do canto.", "Assente o tampo único em L por cima."],
    warnings: ["No encontro do canto, deixe uma régua de 5 cm entre as portas para elas não baterem nos puxadores.", "Tampo de pedra em L: encomende com o desenho do canto."],
    visual: "conjunto de armários de cozinha em L com portas azul petróleo e tampo claro",
    scene: "canto de cozinha com azulejo branco e plantas",
  });
}

export function novosProjetos(): ProjectDef[] {
  return [
    mesaDobravel(800, false),
    mesaDobravel(1000, true),
    mesaDobravel(1200, false),
    cama(880, 1880, "de solteiro"),
    cama(1380, 1880, "de casal"),
    cama(1580, 1980, "queen"),
    beliche(),
    painelTV(1800),
    painelTV(2200),
    ilha(1200),
    ilha(1600),
    lavanderia(),
    penteadeira(900),
    penteadeira(1200),
    cristaleira(),
    comodaTrocador(),
    arara(1000),
    arara(1500),
    nichosHex(),
    armarioCanto(),
  ];
}
