// VÍDEOS — youtubeId é o código depois de "youtu.be/" (ex.: https://youtu.be/AbC123xyz → "AbC123xyz").
// Vídeos dos canais do dono do app. canal: só para organização interna (não aparece no app).
// livre: false → o código do vídeo só é entregue pelo servidor depois da senha de desbloqueio.
export type Video = { id: string; youtubeId: string; titulo: string; descricao?: string; livre: boolean; canal: string; tema: Tema };

export const TEMAS = ["Encaixes de canto", "Ideias que vendem", "Ferramentas e gabaritos", "Móveis e projetos", "Telhado e estrutura"] as const;
export type Tema = (typeof TEMAS)[number];

const v = (youtubeId: string, tema: Tema, canal: string, titulo: string): Video => ({
  id: youtubeId.toLowerCase().replace(/[^a-z0-9]/g, "") || "v",
  youtubeId,
  tema,
  canal,
  titulo,
  // vitrine: "Encaixes de canto" fica aberto; os outros temas só com a senha de desbloqueio
  livre: tema === "Encaixes de canto",
});

const WP = "Woodworker Plus";
const WC = "Wood Creation";
const TW = "Top Wood Tips";

export const VIDEOS: Video[] = [
  // Encaixes de canto
  v("8Qbi5xswHiI", "Encaixes de canto", WC, "5 encaixes de canto — parte 1"),
  v("in2vgS3gRCk", "Encaixes de canto", WC, "5 encaixes de canto — parte 2"),
  v("Rshrzm3kqO4", "Encaixes de canto", WC, "5 encaixes de canto — parte 3"),
  v("cOK2fcvCvUc", "Encaixes de canto", WC, "5 encaixes de canto — parte 4"),
  v("U2C1gFc40Io", "Encaixes de canto", WC, "5 encaixes de canto — parte 5"),
  v("p_R6SgZm028", "Encaixes de canto", WC, "5 encaixes de canto — parte 6"),
  v("8_KYqc06hGY", "Encaixes de canto", WC, "Dicas de encaixe de canto"),
  v("WVFuyOIGeq8", "Encaixes de canto", WC, "Encaixe de canto bem resolvido"),
  v("sEFgT76jpRA", "Encaixes de canto", WC, "5 técnicas de encaixe de canto"),
  v("OIgnDZWQFY8", "Encaixes de canto", WC, "Encaixe de canto sem folga"),
  v("xmnDy8esZIM", "Encaixes de canto", WC, "5 técnicas de encaixe — mestre marceneiro"),
  v("P3f3u6Y0-Bo", "Encaixes de canto", WC, "5 ideias de encaixe de canto"),
  v("uIcdN5ceMpw", "Encaixes de canto", WC, "5 encaixes de canto criativos"),
  v("xKRPHYhH57s", "Encaixes de canto", WC, "5 técnicas de encaixe pouco vistas"),
  v("DIMjSiJPUVM", "Encaixes de canto", WC, "Encaixe de canto pouco conhecido"),
  v("u2WB7fzELrc", "Encaixes de canto", WC, "Técnica de encaixe de canto diferente"),
  v("xUCDg8-R1a8", "Encaixes de canto", WC, "Encaixe de canto engenhoso"),
  v("LkKdnFTNSaU", "Encaixes de canto", TW, "Encaixe de canto perfeito"),
  v("4LvueT54InM", "Encaixes de canto", TW, "Encaixes de canto de mestre marceneiro"),

  // Ideias que vendem
  v("pm_6VxX_jkU", "Ideias que vendem", WP, "Mesa tensegrity: a peça que parece flutuar"),
  v("o_DA7AWW3IU", "Ideias que vendem", WP, "Mesa tensegrity sextavada"),
  v("MiybtYwj2YA", "Ideias que vendem", WP, "Projeto caseiro que vende rápido"),
  v("7z8R_sTwQvg", "Ideias que vendem", WP, "Invenção simples em madeira com boa saída"),
  v("SuYNdOH_Iz0", "Ideias que vendem", WP, "Uma peça simples que pode virar renda"),
  v("oRpaMVsBiyo", "Ideias que vendem", WP, "Criação simples de madeira que dá lucro"),
  v("RF62OrdDIy4", "Ideias que vendem", WP, "Invenção de marceneiro experiente para vender"),
  v("vRS-r0ZpWkA", "Ideias que vendem", WP, "Ideia simples que rende bem na feira"),
  v("GrTEngavZAU", "Ideias que vendem", WP, "Peças de madeira com surpresa ao abrir"),
  v("aKRzXem3UAo", "Ideias que vendem", "DIY Workshop Pro", "Caixa organizadora caseira"),

  // Móveis e projetos
  v("Y52IxsFPVMs", "Móveis e projetos", WP, "Cadeira dobrável de madeira"),
  v("7YL2Hxc6hMY", "Móveis e projetos", WP, "Banquinho dobrável"),
  v("tJAaIjOv5ow", "Móveis e projetos", WP, "Prensa de madeira para pão sírio e tortilha"),
  v("Jd_cDSYdpSA", "Móveis e projetos", "Grant", "Base de armário em compensado (sem narração)"),
  v("jUgUK3HA6HE", "Móveis e projetos", "Grant", "Banco simples de madeira"),

  // Ferramentas e gabaritos
  v("xG_LOOvGmu0", "Ferramentas e gabaritos", WP, "Ferramenta caseira de marceneiro"),
  v("EuAAkfqB-Pc", "Ferramentas e gabaritos", WP, "Ferramentas de marcenaria para fazer em casa"),
  v("OnVPoL_YCZg", "Ferramentas e gabaritos", "Grant", "Gabarito de tupia para aplainar tampos"),
  v("hINZ9uIvfJU", "Ferramentas e gabaritos", TW, "Técnica esperta de marcenaria para testar"),
  v("UYTeXrURYNg", "Ferramentas e gabaritos", TW, "Ideias de projeto de um mestre marceneiro"),

  // Telhado e estrutura
  v("0crKwLLDOv8", "Telhado e estrutura", TW, "Tesoura de telhado com esquadro"),
  v("bhFdhSb1tVA", "Telhado e estrutura", TW, "Ideia de estrutura de telhado"),
];
