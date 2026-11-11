// ─────────────────────────────────────────────────────────────
// CONTEÚDO DA PÁGINA DE VENDAS — edite aqui antes de publicar.
// ─────────────────────────────────────────────────────────────

/**
 * PAGAMENTO VIA PIX — quem paga recebe a senha de desbloqueio pela automação do WhatsApp.
 * Para mudar a chave ou os dados, edite só aqui e rode o build de novo.
 */
export const pix = {
  chave: "59225158000102", // chave PIX (CNPJ, só números — é o que vai para a área de transferência)
  chaveFormatada: "59.225.158/0001-02",
  tipo: "CNPJ",
  favorecido: "App do Marceneiro", // ← troque pela razão social do CNPJ, se quiser que apareça igual ao banco
  instituicao: "DOCK IP S.A.",
  valor: "", // ex.: "R$ 97,00" — vazio = não mostra valor
  mensagem: "Efetue o pagamento PIX para receber a senha de desbloqueio.",
  /** WhatsApp para enviar o comprovante (só números com DDI, ex.: 5511999999999). Vazio = não mostra o botão. */
  whatsapp: "5547997383654",
};

/**
 * Depoimentos REAIS de clientes (com autorização). Deixe vazio até ter os primeiros:
 * a seção de depoimentos só aparece quando houver pelo menos um.
 * Exemplo: { name: "Nome S.", city: "Cidade/UF", text: "…", project: "Sapateira-banco de entrada" }
 */
export const testimonials: { name: string; city: string; text: string; project?: string }[] = [];

export const guaranteeDays = 7;

export const benefits = [
  { icon: "📐", title: "Medidas que fecham", text: "Cada lista de corte é calculada para as dimensões finais — sem peça sobrando nem faltando na montagem." },
  { icon: "🪚", title: "Plano de corte otimizado", text: "Arranjo das peças na chapa 2750 × 1830 mm com desconto da serra. Menos sobra, menos chapa comprada." },
  { icon: "🧾", title: "Lista de compra pronta", text: "Material com fator de perda, ferragens e consumíveis. Leve a lista para a loja e compre de uma vez." },
  { icon: "🔩", title: "Junção explicada", text: "Cada projeto diz qual junção usar e por quê — você aprende o método, não só a receita." },
  { icon: "⚠️", title: "Pontos de atenção", text: "Vãos máximos, fixação na parede, peso com carga: os erros que custam caro vêm avisados." },
  { icon: "🖨️", title: "PDF para a oficina", text: "Baixe e imprima a ficha. Na bancada, papel com serragem funciona melhor que celular." },
];

export const faq = [
  { q: "Preciso ter oficina completa?", a: "Não. Os projetos para iniciantes usam furadeira, serra (serrote ou circular), lixadeira e grampos. Cada ficha lista exatamente as ferramentas necessárias." },
  { q: "Os projetos servem para vender?", a: "Sim. Você pode fabricar e vender os móveis que fizer a partir dos projetos. O que não é permitido é revender ou redistribuir os PDFs." },
  { q: "Posso pedir o corte na loja de chapas?", a: "Pode, e é o que recomendamos para MDF. A lista de corte está no formato que as lojas pedem: peça, quantidade, comprimento, largura e espessura." },
  { q: "Como recebo o acesso?", a: "Faça o PIX para a chave CNPJ informada. Assim que o pagamento é confirmado, a automação do WhatsApp envia a sua senha de desbloqueio. Digite a senha em qualquer conteúdo bloqueado e tudo é liberado neste aparelho." },
  { q: "A senha vale em mais de um aparelho?", a: "Sim. Digite a mesma senha no celular e no computador. Não compartilhe: a senha pode ser trocada a qualquer momento e as liberações antigas deixam de funcionar." },
  { q: `E se eu não gostar?`, a: `Você tem ${guaranteeDays} dias de garantia. Se não fizer sentido para você, devolvemos 100% do valor, sem perguntas.` },
  { q: "As medidas estão em quê?", a: "Todas as medidas de corte estão em milímetros, que é o padrão das lojas de chapas e evita erro de arredondamento. As medidas gerais também aparecem em centímetros." },
];
