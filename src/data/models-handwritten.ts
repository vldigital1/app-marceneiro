// Modelos 3D (só para ilustração) dos projetos escritos à mão.
// Quando existe um modelo paramétrico equivalente, reaproveita as peças dele.
import { board, bx, carcass, frame, openBox, pallet, table, tiltX, type Part } from "../lib/model3d";
import { C, aereo, armarioEspelho, baseCozinha, gabineteBanheiro, nicho } from "./gen/templates-mdf";
import { CAMBARA, PINUS, TAUARI, bancada, caminhaPet, casinhaPet, comedouro, frenchCleat, hortaVertical, portaVinhos, suporteVaso } from "./gen/templates-madeira";
import type { MaterialDef, ProjectDef } from "./types";

type Model = { parts: Part[]; lookMaterials?: MaterialDef[] };
const from = (p: ProjectDef): Model => ({ parts: p.parts ?? [], lookMaterials: p.materials });

function chair(x: number, z: number, mat: string, flip = false): Part[] {
  const s = 420,
    seatY = 430;
  const parts: Part[] = [];
  const back = flip ? 0 : s - 40;
  for (const [px, pz] of [
    [0, 0],
    [s - 40, 0],
    [0, s - 40],
    [s - 40, s - 40],
  ]) {
    const isBack = pz === back;
    parts.push(bx(isBack ? "Pé traseiro" : "Pé dianteiro", mat, x + px, 0, z + pz, 40, isBack ? 850 : seatY, 40));
  }
  for (let i = 0; i < 5; i++) parts.push(bx("Ripa do assento", mat, x, seatY, z + i * 84, s, 20, 78));
  for (let i = 0; i < 3; i++) parts.push(bx("Ripa do encosto", mat, x + 40, 560 + i * 90, z + (flip ? 40 : back - 20), s - 80, 70, 20));
  return parts;
}

export const handModels: Record<string, () => Model> = {
  "guarda-roupa-5-portas-4-gavetas": () => ({
    parts: carcass({ W: 1900, H: 2100, D: 520, t: 15, mat: "branco", backMat: "hdf", plinth: 80, dividers: [730, 1125], shelves: [{ bay: 1, ys: [400, 800, 1200, 1600] }, { bay: 0, ys: [1650] }, { bay: 2, ys: [1650] }], rods: [{ bay: 0, y: 1550 }, { bay: 2, y: 1550 }], doors: [{ bay: 0, leaves: 2, y0: 400 }, { bay: 1, leaves: 1 }, { bay: 2, leaves: 2, y0: 400 }], drawers: [{ bay: 0, fronts: [200, 200] }, { bay: 2, fronts: [200, 200] }] }),
  }),
  "armario-multiuso-3-portas": () => ({
    parts: carcass({ W: 1200, H: 1800, D: 450, t: 18, mat: "salvia", backMat: "mdf-cru", plinth: 60, dividers: [764], shelves: [{ bay: 0, ys: [400, 800, 1200] }, { bay: 1, ys: [330, 660, 990, 1320] }], doors: [{ bay: 0, leaves: 2 }, { bay: 1, leaves: 1 }], handleMat: "latao" }),
  }),
  "criado-mudo-dois-nichos": () => ({ parts: carcass({ W: 400, H: 500, D: 300, t: 20, mat: "pinus", plinth: 50, shelves: [{ bay: 0, ys: [190] }], openBack: true }) }),
  "mancebo-valete": () => ({
    parts: [
      bx("Pé da base em cruz", "clara", 0, 0, 155, 350, 40, 60),
      bx("Pé da base em cruz", "clara", 145, 0, 0, 60, 40, 350),
      bx("Montante vertical", "clara", 155, 40, 155, 40, 1050, 40),
      bx("Ombreira", "clara", -65, 1090, 155, 480, 70, 20),
      bx("Barra para calça", "clara", -15, 700, 162, 380, 25, 25),
      bx("Fundo da bandeja", "clara", 95, 850, 195, 180, 20, 140),
      bx("Borda da bandeja", "clara", 95, 870, 195, 180, 30, 15),
      bx("Borda da bandeja", "clara", 95, 870, 320, 180, 30, 15),
    ],
  }),
  "rack-baixo-tres-nichos": () => ({ parts: carcass({ W: 1200, H: 500, D: 350, t: 18, mat: "carvalho", legs: { h: 100, mat: "metal", size: 25 }, dividers: [376, 770], openBack: true }) }),
  "aparador-retro-pes-palito": () => ({ parts: carcass({ W: 1200, H: 750, D: 400, t: 18, mat: "freijo", backMat: "mdf-cru", legs: { h: 250, mat: "madeira", size: 30 }, dividers: [376, 770], shelves: [{ bay: 0, ys: [200] }, { bay: 2, ys: [200] }], doors: [{ bay: 0, leaves: 1 }, { bay: 2, leaves: 1 }], handles: "knob", handleMat: "latao" }) }),
  "mesa-de-centro-simples": () => ({ parts: table({ W: 900, H: 400, D: 500, topT: 20, leg: 45, apronH: 70, mat: "pinus", topBoards: 3, inset: 30, shelf: { y: 100, slats: 4 } }) }),
  "mesa-lateral-com-prateleira": () => ({ parts: table({ W: 400, H: 550, D: 400, topT: 20, leg: 40, apronH: 60, mat: "pinus", topBoards: 2, inset: 30, shelf: { y: 120, slats: 4 } }) }),
  "estante-baixa-tres-nichos": () => ({ parts: carcass({ W: 500, H: 1000, D: 300, t: 15, mat: "branco", plinth: 50, shelves: [{ bay: 0, ys: [290, 590] }] }) }),
  "estante-industrial-madeira-metalon": () => {
    const p: Part[] = [];
    for (const [x, z] of [
      [0, 0],
      [770, 0],
      [0, 270],
      [770, 270],
    ])
      p.push(bx("Montante", "metal", x, 0, z, 30, 1500, 30));
    for (const y of [30, 480, 930, 1470]) {
      p.push(bx("Travessa", "metal", 30, y - 30, 0, 740, 30, 30), bx("Travessa", "metal", 30, y - 30, 270, 740, 30, 30));
      p.push(bx("Prateleira", "pinus", 0, y, 0, 800, 30, 150), bx("Prateleira", "pinus", 0, y, 150, 800, 30, 150));
    }
    return { parts: p };
  },
  "escrivaninha-compacta-com-gaveta": () => ({
    parts: [
      bx("Tampo", "branco", 0, 732, 0, 1200, 18, 550),
      bx("Lateral", "branco", 0, 0, 0, 18, 732, 550),
      bx("Lateral", "branco", 1182, 0, 0, 18, 732, 550),
      bx("Painel de modéstia", "branco", 18, 432, 20, 1164, 300, 18),
      bx("Divisória", "branco", 764, 582, 20, 18, 150, 530),
      bx("Frente de gaveta", "branco", 785, 585, 532, 394, 144, 18),
      bx("Puxador", "metal", 930, 650, 550, 100, 12, 14),
    ],
  }),
  "sapateira-banco-entrada": () => {
    const p: Part[] = [bx("Tampo", "pinus", 0, 430, 0, 800, 20, 300), bx("Lateral", "pinus", 0, 0, 0, 20, 430, 300), bx("Lateral", "pinus", 780, 0, 0, 20, 430, 300), bx("Travessa traseira", "pinus", 20, 360, 0, 760, 60, 20)];
    for (const y of [80, 250]) for (let i = 0; i < 4; i++) p.push(bx("Ripa", "pinus", 20, y, 20 + i * 73, 760, 20, 60));
    for (let i = 0; i < 3; i++) p.push(bx("Tênis", "tecido-escuro", 60 + i * 240, 270, 60, 110, 90, 260, { cut: false }));
    return { parts: p };
  },
  "sapateira-compacta-tres-niveis": () => ({ parts: carcass({ W: 600, H: 700, D: 300, t: 15, mat: "branco", plinth: 40, shelves: [{ bay: 0, ys: [190, 395] }] }) }),
  "banco-organizador-entrada": () => {
    const p = table({ W: 900, H: 450, D: 350, topT: 20, leg: 45, apronH: 70, mat: "pinus", topBoards: 2, inset: 0, shelf: { y: 120, slats: 3 } });
    p.push(bx("Almofada", "tecido", 20, 450, 20, 860, 40, 310, { cut: false }), bx("Cesto", "tecido", 80, 140, 60, 330, 200, 240, { cut: false }), bx("Cesto", "tecido", 490, 140, 60, 330, 200, 240, { cut: false }));
    return { parts: p };
  },
  "porta-chaves-com-prateleira": () => {
    const p: Part[] = [bx("Painel traseiro", "madeira", 0, 0, 0, 300, 180, 20), bx("Prateleira", "madeira", 0, 180, 0, 300, 20, 80)];
    for (let i = 0; i < 4; i++) p.push(bx("Gancho", "metal", 45 + i * 65, 40, 20, 8, 30, 25));
    return { parts: p };
  },
  "armario-base-cozinha-porta-gaveta": () => from(baseCozinha(600, "porta-gaveta", C.grafite)),
  "armario-aereo-2-portas": () => from(aereo(800, 600, C.branco)),
  "porta-temperos-de-parede": () => {
    const p: Part[] = [bx("Lateral", "clara", 0, 0, 0, 20, 400, 100), bx("Lateral", "clara", 380, 0, 0, 20, 400, 100)];
    for (const y of [0, 135, 270]) {
      p.push(bx("Prateleira", "clara", 20, y, 0, 360, 20, 90), bx("Ripa frontal", "clara", 20, y + 40, 80, 360, 20, 10));
      for (let i = 0; i < 6; i++) p.push(bx("Pote", "vidro", 30 + i * 58, y + 20, 20, 45, 100, 45, { cut: false }));
    }
    return { parts: p };
  },
  "tabua-de-corte-com-alca": () => ({ parts: board({ W: 450, D: 250, T: 25, strips: 3, mats: ["madeira", "clara", "madeira"] }) }),
  "tabua-de-frios-faixas": () => ({ parts: board({ W: 450, D: 250, T: 20, strips: 7, mats: ["clara", "escura"] }) }),
  "bandeja-com-alcas": () => ({ parts: openBox({ W: 400, H: 80, D: 310, t: 15, mat: "clara", bottomT: 6, handleEnds: true }) }),
  "armario-banheiro-porta-espelho": () => from(armarioEspelho(500, C.branco)),
  "gabinete-suspenso-banheiro": () => from(gabineteBanheiro(600, "portas", C.cinza)),
  "caixa-organizadora-caixote": () => ({ parts: openBox({ W: 300, H: 150, D: 200, t: 10, mat: "pinus", slats: 2, corners: 15 }) }),
  "organizador-de-mesa-tres-compartimentos": () => ({ parts: openBox({ W: 250, H: 122, D: 150, t: 12, mat: "madeira", dividersX: [80, 160] }) }),
  "suporte-elevado-notebook": () => ({
    parts: [bx("Tampo", "clara", 0, 80, 0, 350, 20, 250), bx("Lateral", "clara", 20, 0, 0, 20, 80, 250), bx("Lateral", "clara", 310, 0, 0, 20, 80, 250), bx("Travessa traseira", "clara", 40, 20, 0, 270, 60, 20), bx("Notebook", "cinza", 25, 100, 20, 300, 12, 210, { cut: false })],
  }),
  "prateleira-flutuante-macica": () => ({ parts: [bx("Lâmina", "freijo", 0, 0, 0, 600, 20, 200), bx("Lâmina", "freijo", 0, 20, 0, 600, 20, 200), bx("Vaso", "planta", 420, 40, 60, 90, 140, 90, { cut: false })] }),
  "nicho-quadrado-mdf": () => from(nicho(300, 300, 150, 0, C.branco, false)),
  "painel-ripado-decorativo": () => {
    const p: Part[] = [bx("Fundo", "preto", 0, 0, 0, 600, 600, 6)];
    for (let i = 0; i < 11; i++) p.push(bx("Ripa", "freijo", i * 57, 0, 6, 30, 600, 15));
    return { parts: p };
  },
  "painel-mosaico-retalhos": () => {
    const p: Part[] = [bx("Base", "mdf-cru", 15, 15, 0, 400, 400, 6)];
    const looks = ["clara", "madeira", "escura", "cambara", "pinus"];
    let k = 0;
    for (let r = 0; r < 8; r++) for (let c = 0; c < 8; c++) p.push(bx("Taco", looks[(r * 3 + c * 7 + k++) % 5], 15 + c * 50, 15 + r * 50, 6, 49, 49, 15 + ((r * 5 + c * 3) % 3) * 5));
    p.push(...frame({ W: 430, H: 430, bw: 15, t: 40, mat: "escura" }));
    return { parts: p };
  },
  "moldura-de-espelho": () => ({ parts: frame({ W: 400, H: 600, bw: 50, t: 20, mat: "madeira", fill: "espelho" }) }),
  "luminaria-ripada-de-mesa": () => {
    const p: Part[] = [bx("Base", "madeira", 0, 0, 0, 140, 20, 140), bx("Topo", "madeira", 0, 260, 0, 140, 20, 140), bx("Lâmpada", "latao", 45, 60, 45, 50, 120, 50, { cut: false })];
    for (let i = 0; i < 3; i++) {
      const o = 12 + i * 45;
      p.push(bx("Ripa", "madeira", o, 20, 125, 15, 240, 10), bx("Ripa", "madeira", o, 20, 5, 15, 240, 10), bx("Ripa", "madeira", 5, 20, o, 10, 240, 15), bx("Ripa", "madeira", 125, 20, o, 10, 240, 15));
    }
    return { parts: p };
  },
  "cachepo-ripado": () => ({ parts: [...openBox({ W: 220, H: 220, D: 220, t: 12, mat: "cambara", slats: 4 }), bx("Planta", "planta", 40, 200, 40, 140, 200, 140, { cut: false })] }),
  "suporte-de-vaso-banquinho": () => from(suporteVaso(300, 1, PINUS)),
  "jardineira-retangular": () => ({ parts: [...openBox({ W: 600, H: 200, D: 200, t: 20, mat: "cambara" }), bx("Ervas", "planta", 30, 190, 30, 540, 120, 140, { cut: false })] }),
  "horta-vertical-de-parede": () => from(hortaVertical(3, 400, CAMBARA)),
  "canteiro-elevado-com-pes": () => {
    const p = openBox({ W: 1000, H: 200, D: 450, t: 20, mat: "cambara" }).map((x) => ({ ...x, o: [x.o[0], x.o[1] + 550, x.o[2]] as [number, number, number] }));
    for (const [x, z] of [
      [0, 0],
      [930, 0],
      [0, 380],
      [930, 380],
    ])
      p.push(bx("Pé", "cambara", x, 0, z, 70, 550, 70));
    p.push(bx("Hortaliças", "planta", 40, 740, 40, 920, 100, 370, { cut: false }));
    return { parts: p };
  },
  "banco-de-jardim": () => ({ parts: table({ W: 1200, H: 450, D: 350, topT: 30, leg: 70, apronH: 90, apronT: 30, mat: "cambara", topBoards: 3, inset: 50, stretchers: 100 }) }),
  "conjunto-mesa-4-cadeiras-pallet": () => ({
    parts: [
      ...table({ W: 1200, H: 750, D: 800, topT: 20, leg: 90, apronH: 90, mat: "pallet", topBoards: 8, inset: 40 }),
      ...chair(150, -480, "pallet", true),
      ...chair(630, -480, "pallet", true),
      ...chair(150, 860, "pallet"),
      ...chair(630, 860, "pallet"),
    ],
  }),
  "poltrona-rustica-pallet": () => {
    const p = chair(0, 0, "pallet").map((x) => ({ ...x, u: [x.u[0] * 1.5, 0, 0] as [number, number, number], o: [x.o[0] * 1.5, x.o[1], x.o[2]] as [number, number, number] }));
    p.push(bx("Braço", "pallet", -20, 600, -60, 60, 20, 520), bx("Braço", "pallet", 590, 600, -60, 60, 20, 520));
    p.push(bx("Almofada", "tecido", 20, 450, 10, 590, 80, 390, { cut: false }));
    return { parts: p };
  },
  "sofa-de-pallet": () => ({
    parts: [...pallet(0, 0, 0, 1200, 800), ...pallet(0, 142, 0, 1200, 800), ...pallet(0, 0, 0, 1200, 400, "pallet", "Encosto").map((x) => tiltX(x, -90, [0, 0, 0])).map((x) => ({ ...x, o: [x.o[0], x.o[1] + 284, x.o[2] + 142] as [number, number, number] })), bx("Colchão", "tecido", 0, 284, 160, 1200, 100, 640, { cut: false })],
  }),
  "mesa-de-centro-pallet-rodizios": () => ({ parts: [...pallet(0, 40, 0, 800, 600), ...pallet(0, 182, 0, 800, 600), ...[0, 740].flatMap((x) => [0, 540].map((z) => bx("Rodízio", "metal", x + 10, 0, z + 10, 40, 40, 40, { cut: false })))] }),
  "floreira-de-pallet": () => ({ parts: [...openBox({ W: 1200, H: 500, D: 400, t: 20, mat: "pallet", slats: 5, corners: 45 }), bx("Plantas", "planta", 40, 480, 40, 1120, 180, 320, { cut: false })] }),
  "bar-balcao-pallet-area-gourmet": () => {
    const p: Part[] = [];
    for (let i = 0; i < 18; i++) p.push(bx("Tábua frontal", "pallet", i * 100, 0, 580, 95, 1000, 20));
    for (let i = 0; i < 6; i++) p.push(bx("Tábua lateral", "pallet", 0, 0, i * 97, 20, 1000, 95), bx("Tábua lateral", "pallet", 1780, 0, i * 97, 20, 1000, 95));
    p.push(bx("Tampo", "madeira", -50, 1000, -20, 1900, 30, 700), bx("Prateleira interna", "pinus", 20, 400, 0, 1760, 20, 300));
    return { parts: p };
  },
  "mini-adega-de-parede": () => from(portaVinhos(3, 2, TAUARI)),
  "porta-vinhos-de-bancada": () => from(portaVinhos(3, 2, CAMBARA)),
  "bancada-de-trabalho": () => from(bancada(1500, 600, true)),
  "painel-ferramentas-french-cleat": () => from(frenchCleat(900, 600)),
  "caixa-de-ferramentas-com-gavetas": () => ({ parts: [...carcass({ W: 550, H: 285, D: 300, t: 15, mat: "pinus", backMat: "clara", drawers: [{ bay: 0, fronts: [55, 55, 55] }], handles: "knob" }), bx("Tampa", "pinus", 0, 285, 0, 550, 15, 300)] }),
  "comedouro-elevado-duplo": () => from(comedouro(150, 2, PINUS)),
  "caminha-elevada-pet": () => from(caminhaPet(700, 500, PINUS)),
  "casinha-para-pet": () => from(casinhaPet(600, 500, 700, "médio")),
  "banquinho-infantil": () => ({ parts: [bx("Assento", "clara", 0, 220, 0, 300, 20, 200), bx("Lateral", "clara", 20, 0, 10, 20, 220, 180), bx("Lateral", "clara", 260, 0, 10, 20, 220, 180), bx("Travessa", "clara", 40, 120, 20, 220, 60, 20)] }),
  "carrinho-de-madeira": () => ({
    parts: [bx("Corpo", "madeira", 0, 20, 10, 150, 45, 60), bx("Cabine", "madeira", 45, 65, 15, 60, 30, 50), ...[20, 100].flatMap((x) => [bx("Roda", "escura", x, 0, 0, 45, 45, 12), bx("Roda", "escura", x, 0, 68, 45, 45, 12)])],
  }),
  "torre-de-equilibrio-blocos": () => {
    const p: Part[] = [];
    for (let l = 0; l < 18; l++)
      for (let i = 0; i < 3; i++) p.push(l % 2 === 0 ? bx("Bloco", i % 2 ? "clara" : "pinus", 0, l * 15, i * 25, 75, 15, 25) : bx("Bloco", i % 2 ? "pinus" : "clara", i * 25, l * 15, 0, 25, 15, 75));
    return { parts: p };
  },
};
