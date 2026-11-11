// Gera variações dos modelos paramétricos (medidas, materiais, cores e configurações).
// Cada variação é um projeto completo: medidas próprias, lista de corte, materiais e 3D.
import { projectDefs } from "../src/data";
import { MAT } from "../src/data/gen/kit";
import { CAMBARA, EUCA, PINUS, TAUARI, banco, bancada, caixa, caminhaPet, casinhaPet, comedouro, frenchCleat, hortaVertical, mesa, moldura, portaVinhos, prateleira, suporteVaso, tabua } from "../src/data/gen/templates-madeira";
import { C, aereo, aparador, armario, armarioEspelho, bau, baseCozinha, cabeceira, caixaTampa, comoda, criado, cubos, escrivaninha, estante, gabineteBanheiro, guardaRoupa, nicho, painelRipado, rack, sapateira } from "../src/data/gen/templates-mdf";
import type { ProjectDef } from "../src/data/types";

const CORES = [C.branco, C.preto, C.carvalho, C.freijo, C.cinza, C.grafite];
const ESPS = [PINUS, TAUARI, CAMBARA, EUCA];

export function variacoes(alvo = 2000): ProjectDef[] {
  const out: ProjectDef[] = [];
  const titulos = new Set<string>();
  const add = (f: () => ProjectDef) => {
    let p: ProjectDef;
    try {
      p = f();
    } catch {
      return;
    }
    if (!p.cut?.length || titulos.has(p.title)) return;
    titulos.add(p.title);
    out.push(p);
  };

  // 1) os projetos do app primeiro
  for (const p of projectDefs) add(() => p);

  // 2) variações (rodadas intercaladas para misturar os tipos no PDF)
  const geradores: (() => void)[] = [];
  const G = (fn: () => void) => geradores.push(fn);

  G(() => { for (const w of [300, 400, 500, 600, 700, 800, 900, 1000, 1200]) for (const h of [250, 300, 400, 600]) for (const c of CORES) for (const d of [0, 1, 2]) add(() => nicho(w, h, 200 + (w > 700 ? 50 : 0), d, c, d === 0 && w <= 500)); });
  G(() => { for (const w of [450, 600, 800, 1000, 1200]) for (const h of [900, 1200, 1500, 1800, 2000]) for (const [m, desc] of [[MAT.bp15("branco", "branco"), "MDF BP branco"], [MAT.bp18("carvalho", "carvalho"), "MDF BP carvalho"], [MAT.bp15("preto", "preto"), "MDF BP preto"], [MAT.pinus(20, 300), "pinus maciço"]] as const) add(() => estante(w, h, w >= 1000 ? 350 : 300, m, desc, true)); });
  G(() => { for (const w of [400, 600, 800, 900, 1000, 1200]) for (const h of [900, 1200, 1800, 2000]) for (const c of CORES) for (const uso of ["despensa", "lavanderia", "multiuso"]) add(() => armario(w, h, 450, w <= 400 ? 1 : w >= 1200 ? 3 : 2, c, uso, { legs: h <= 1200 })); });
  G(() => { for (const w of [400, 500, 600, 700, 800, 900, 1000, 1200]) for (const h of [350, 500, 700]) for (const c of CORES) add(() => aereo(w, h, c)); });
  G(() => { for (const w of [400, 450, 500, 600, 700, 800, 900, 1000, 1200]) for (const cfg of ["porta-gaveta", "2portas", "pia", "gaveteiro3", "gaveteiro4", "2portas-2gavetas"] as const) for (const c of CORES) add(() => baseCozinha(w, cfg, c)); });
  G(() => { for (const w of [400, 600, 800, 1000, 1200, 1500]) for (const rows of [3, 4, 5]) for (const c of CORES) for (const legs of [false, true]) add(() => comoda(w, 650 + rows * 70, 450, rows, w >= 1200 ? 2 : 1, c, legs)); });
  G(() => { for (const cfg of ["gaveta-nicho", "2gavetas", "suspenso", "palito"] as const) for (const c of CORES) for (const w of [400, 450, 500, 600]) add(() => criado(cfg, c, w)); });
  G(() => { for (const w of [1200, 1400, 1600, 1800, 2000, 2200]) for (const cfg of ["2portas-nicho", "gavetas", "suspenso", "aberto"] as const) for (const c of CORES) add(() => rack(w, cfg, c, cfg !== "suspenso")); });
  G(() => { for (const w of [800, 1000, 1200, 1400, 1600]) for (const c of CORES) add(() => aparador(w, c)); });
  G(() => { for (const w of [600, 800, 1000, 1200]) for (const h of [600, 900, 1200]) for (const cfg of ["portas", "aberta"] as const) for (const c of CORES) add(() => sapateira(w, h, cfg, c)); });
  G(() => { for (const w of [900, 1000, 1200, 1400, 1600]) for (const dr of [false, true]) for (const c of CORES) add(() => escrivaninha(w, dr, c)); });
  G(() => { for (const w of [1200, 1500, 1800, 2000, 2400, 2700]) for (const n of [2, 3, 4, 5, 6]) for (const dr of [false, true]) for (const c of CORES) add(() => guardaRoupa(w, n, dr, c)); });
  G(() => { for (const w of [400, 500, 600, 800, 1000, 1200]) for (const cfg of ["portas", "gavetao"] as const) for (const c of CORES) add(() => gabineteBanheiro(w, cfg, c)); });
  G(() => { for (const w of [400, 500, 600, 800]) for (const c of CORES) add(() => armarioEspelho(w, c)); });
  G(() => { for (const [w, nome] of [[900, "solteiro"], [1400, "casal"], [1600, "queen"], [1900, "king"]] as const) add(() => cabeceira(w, nome)); });
  G(() => { for (const w of [600, 900, 1200, 1500, 1800]) for (const h of [900, 1200, 1800, 2400]) for (const look of ["freijo", "pinus", "carvalho"] as const) add(() => painelRipado(w, h, "sala", look)); });
  G(() => { for (const cols of [1, 2, 3, 4, 5]) for (const rows of [1, 2, 3, 4, 5]) for (const c of CORES) add(() => cubos(cols, rows, c)); });
  G(() => { for (const [w, h, d] of [[300, 150, 200], [400, 200, 300], [500, 250, 350], [600, 300, 400], [350, 120, 250]] as const) for (const uso of ["organizadora", "de presente", "de ferramentas"]) add(() => caixaTampa(w, h, d, uso)); });
  G(() => { for (const [w, h, d] of [[600, 400, 400], [800, 450, 400], [1000, 450, 450], [1200, 450, 450], [1400, 450, 500]] as const) for (const look of ["pinus", "branco"] as const) for (const uso of ["brinquedos", "banco de entrada", "cobertores"]) add(() => bau(w, h, d, uso, look)); });
  G(() => { for (const kind of ["centro", "lateral", "jantar", "infantil"] as const) for (const esp of ESPS) for (const sh of [true, false]) { const ws = kind === "jantar" ? [900, 1200, 1400, 1600, 1800, 2000] : kind === "lateral" ? [350, 400, 450, 500] : kind === "infantil" ? [600, 800, 900] : [700, 800, 900, 1000, 1200]; for (const w of ws) add(() => mesa(kind, w, kind === "jantar" ? (w <= 900 ? w : 900) : Math.round(w * 0.55), kind === "jantar" ? 760 : kind === "lateral" ? 550 : kind === "infantil" ? 500 : 400, esp, sh)); } });
  G(() => { for (const l of [400, 600, 800, 1000, 1200, 1500, 1800]) for (const h of [450, 650, 750]) for (const esp of ESPS) for (const tipo of ["banco", "banqueta"] as const) add(() => banco(l, h, esp, tipo)); });
  G(() => { for (const w of [1000, 1200, 1500, 1800, 2000]) for (const d of [500, 600, 700]) for (const sh of [true, false]) add(() => bancada(w, d, sh)); });
  G(() => { for (const kind of ["caixote", "jardineira", "cachepo", "floreira", "canteiro", "bandeja", "organizador"] as const) for (const esp of ESPS) for (const [w, h, d] of [[300, 200, 250], [400, 250, 300], [500, 300, 300], [600, 300, 350], [800, 350, 400], [1000, 400, 450]] as const) add(() => caixa(kind, w, h, d, esp, kind === "organizador" ? { dividers: 2 } : kind === "canteiro" ? { legs: 4 } : {})); });
  G(() => { for (const n of [2, 3, 4, 5, 6]) for (const w of [500, 700, 900, 1200]) for (const esp of ESPS) add(() => hortaVertical(n, w, esp)); });
  G(() => { for (const kind of ["corte", "frios", "churrasco", "servir"] as const) for (const [w, d] of [[300, 200], [400, 250], [450, 300], [500, 300], [600, 350], [700, 300]] as const) for (const strips of [0, 3, 5, 7]) add(() => tabua(kind, w, d, 25, strips)); });
  G(() => { for (const kind of ["flutuante", "mao-francesa", "porta-chaves"] as const) for (const w of [300, 400, 500, 600, 800, 1000, 1200]) for (const esp of ESPS) add(() => prateleira(kind, w, esp)); });
  G(() => { for (const [w, h] of [[300, 400], [400, 600], [500, 700], [600, 900], [600, 1200], [800, 1000], [500, 1600]] as const) for (const uso of ["espelho", "quadro"] as const) for (const esp of ESPS) add(() => moldura(w, h, uso, esp)); });
  G(() => { for (const cols of [2, 3, 4, 5, 6]) for (const rows of [2, 3, 4, 5, 6]) for (const esp of [PINUS, TAUARI]) add(() => portaVinhos(cols, rows, esp)); });
  G(() => { for (const h of [100, 150, 200, 300, 400]) for (const b of [1, 2] as const) for (const esp of ESPS) add(() => comedouro(h, b, esp)); });
  G(() => { for (const [w, d] of [[500, 400], [600, 450], [700, 500], [800, 600], [1000, 700]] as const) for (const esp of ESPS) add(() => caminhaPet(w, d, esp)); });
  G(() => { for (const [w, d, h, porte] of [[500, 600, 500, "pequeno"], [600, 700, 600, "pequeno"], [700, 900, 700, "médio"], [800, 1000, 800, "médio"], [900, 1200, 900, "grande"], [1000, 1300, 1000, "grande"]] as const) add(() => casinhaPet(w, d, h, porte)); });
  G(() => { for (const h of [400, 600, 800, 1000, 1200]) for (const n of [1, 2, 3] as const) for (const esp of ESPS) add(() => suporteVaso(h, n, esp)); });
  G(() => { for (const w of [600, 800, 1000, 1200, 1500, 2000]) for (const h of [600, 900, 1200]) add(() => frenchCleat(w, h)); });

  // rodadas: cada gerador contribui aos poucos até completar o alvo
  const filas = geradores.map((g) => {
    const antes = out.length;
    g();
    return out.splice(antes);
  });
  let i = 0;
  while (out.length < alvo && filas.some((f) => f.length)) {
    const f = filas[i++ % filas.length];
    const p = f.shift();
    if (p) out.push(p);
  }
  return out.slice(0, alvo);
}

if (process.argv[1]?.endsWith("variacoes.ts")) {
  const v = variacoes(5000);
  console.log("total possível:", v.length);
}
