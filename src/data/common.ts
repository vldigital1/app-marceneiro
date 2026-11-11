import type { MaterialDef } from "./types";

export const T = {
  trena: "Trena",
  esquadro: "Esquadro de carpinteiro",
  lapis: "Lápis de marceneiro",
  circular: "Serra circular com guia",
  tico: "Serra tico-tico",
  esquadria: "Serra de esquadria (ou caixa de meia-esquadria)",
  furadeira: "Furadeira/parafusadeira",
  brocas: "Brocas para madeira 3, 5 e 8 mm",
  escareador: "Broca escareadora",
  lixadeira: "Lixadeira orbital (lixas 80, 120 e 220)",
  grampos: "Grampos sargento (mín. 2)",
  caneco: "Broca de caneco 35 mm (Forstner)",
  gabarito32: "Gabarito de furação sistema 32 mm",
  borda: "Ferro de passar ou coladeira de borda + refilador",
  kreg: "Gabarito de furo oblíquo (pocket hole)",
  tupia: "Tupia manual",
  plaina: "Plaina elétrica ou desengrossadeira",
  nivel: "Nível de bolha",
  martelo: "Martelo",
  pincel: "Pincel ou rolo de espuma",
  serraCopo: "Serra copo",
  pedecabra: "Pé de cabra e marreta de borracha",
  formao: "Formões 10 e 20 mm",
  serrote: "Serrote de costas",
  cavilhador: "Gabarito para cavilha 8 mm",
  grampeador: "Grampeador pneumático ou manual",
};

/** kit que aparece em quase todo projeto */
export const BASE_TOOLS = [T.trena, T.esquadro, T.lapis, T.furadeira, T.brocas, T.lixadeira, T.grampos];

export const bp = (t: number, cor = "branco", key = `bp${t}`, grain = false): MaterialDef => ({
  key,
  item: `Chapa de MDF BP ${t} mm`,
  material: `MDF BP ${cor}${grain ? " (padrão amadeirado)" : ""}`,
  thickness: t,
  waste: 0.12,
  kind: "chapa",
});

export const mdf = (t: number, key = `mdf${t}`, extra = ""): MaterialDef => ({
  key,
  item: `Chapa de MDF cru ${t} mm${extra}`,
  material: "MDF cru",
  thickness: t,
  waste: 0.12,
  kind: "chapa",
});

export const mdfRU = (t: number, key = `ru${t}`): MaterialDef => ({
  key,
  item: `Chapa de MDF RU ${t} mm`,
  material: "MDF resistente à umidade (RU), revestido BP",
  thickness: t,
  waste: 0.12,
  kind: "chapa",
});

export const hdf3: MaterialDef = {
  key: "hdf3",
  item: "Chapa de fundo 3 mm",
  material: "HDF (chapa de fibra) 3 mm",
  thickness: 3,
  waste: 0.1,
  kind: "chapa",
};

export const tabua = (key: string, especie: string, t: number, bw: number, waste = 0.15): MaterialDef => ({
  key,
  item: `Tábua aparelhada ${t} × ${bw} mm`,
  material: especie,
  thickness: t,
  waste,
  kind: "tabua",
  boardWidth: bw,
});

export const sarrafo = (key: string, especie: string, t: number, w: number, waste = 0.1): MaterialDef => ({
  key,
  item: `Sarrafo/caibro ${t} × ${w} mm`,
  material: especie,
  thickness: t,
  waste,
  kind: "tabua",
  boardWidth: w,
});

export const outro = (key: string, item: string, material: string, thickness: number, quantity: string, waste = 0.1): MaterialDef => ({
  key,
  item,
  material,
  thickness,
  waste,
  kind: "outro",
  quantity,
});

export const FINISH = {
  bp: "Chapa BP já vem revestida: não precisa pintar. Aplique fita de borda PVC na cor da chapa em todas as bordas visíveis (coladeira ou fita pré-colada com ferro), refile o excesso e passe lixa 320 na quina com leveza.",
  verniz:
    "Lixe em sequência 80 → 120 → 220 no sentido do veio, remova o pó com pano levemente úmido e aplique seladora nitro ou à base d'água. Após secar, lixa 320 e 2 demãos de verniz PU base água acetinado, com lixa 400 entre demãos.",
  oleo:
    "Lixe até 220, aplique óleo (linhaça purificada, tungue ou óleo para madeira) com pano, deixe penetrar 15 minutos, retire todo o excesso e repita após 24 h. Renove o óleo uma vez por ano.",
  alimento:
    "Somente óleo mineral de grau alimentício (vendido em farmácia) ou mistura de óleo mineral com cera de abelha (4:1). Aplique generosamente, deixe agir 6 h e retire o excesso. Nunca use verniz, seladora ou óleo de linhaça comum em superfície que toca alimento.",
  externo:
    "Stain impregnante com filtro UV (2 a 3 demãos) ou óleo para deck. Evite verniz em área externa: ele descasca com sol e chuva. Refaça a manutenção a cada 12 meses.",
  pintura:
    "Lixe com 150, aplique fundo preparador para MDF (duas demãos nas bordas, que absorvem mais), lixe com 320 e aplique 2 demãos de esmalte acrílico ou PU base água com rolo de espuma. Lixa 400 entre demãos.",
  pallet:
    "Lixe tudo com 60 e depois 120 para tirar farpas (o assento e os braços até 180). Escove para tirar o pó, aplique stain impregnante e, em área interna, finalize com verniz PU base água fosco.",
};

export const W = {
  parede:
    "Móvel fixado em parede: use bucha e parafuso compatíveis com o tipo de parede. Em drywall use bucha basculante ou fixe no montante metálico.",
  tombamento: "Móvel alto: prenda na parede com suporte antitombamento. Sem isso ele pode tombar ao abrir portas e gavetas carregadas.",
  vao15: "Vão livre máximo de prateleira em MDF 15 mm: cerca de 80 cm. Acima disso ela embarriga com o tempo — acrescente apoio central.",
  vao18: "Vão livre máximo de prateleira em MDF 18 mm: cerca de 90 cm com carga leve e 80 cm com livros.",
  esquadro: "Confira o esquadro medindo as duas diagonais antes de fixar o fundo: elas devem ser iguais (tolerância de 2 mm).",
  corteLoja: "Se não tiver serra de bancada, leve a lista de corte à loja de chapas: o corte e a fita de borda saem mais precisos e baratos que refazer peça.",
  prefuro: "Sempre faça pré-furo de 3 mm no MDF antes de parafusar em topo, a pelo menos 20 mm da ponta, senão a chapa abre.",
  pallet:
    "Use apenas pallets com carimbo HT (tratamento térmico). Descarte pallets com carimbo MB (brometo de metila), manchados de óleo ou químicos, e sem carimbo nenhum.",
  pregos: "Retire todos os pregos e grampos antes de passar a madeira em qualquer serra ou plaina: prego escondido quebra dente de serra e pode ser arremessado.",
  epi: "Use óculos de proteção, protetor auricular e máscara PFF2 ao cortar e lixar — pó de MDF e de madeira tratada é irritante.",
};
