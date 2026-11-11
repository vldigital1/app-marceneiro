import { topico, type Bloco, type Modulo } from "./tipos";

const L = (titulo: string, itens: [string, string][]): Bloco => ({ t: "lista", titulo, itens: itens.map(([icone, texto]) => ({ icone, texto })) });
const D = (texto: string, titulo = "Na oficina"): Bloco => ({ t: "dica", titulo, texto });
const O = "O que importa";

export const modulo3: Modulo = {
  id: "m3",
  numero: 3,
  titulo: "Chapas e materiais",
  descricao: "Tipos de MDF, espessuras, a chapa 2750 × 1830, veio, fita de borda e como comprar.",
  livre: false,
  topicos: [
    topico("m3-t1", {
      titulo: "Tipos de MDF",
      icone: "chapa",
      intro: "MDF não é tudo igual. Escolher o tipo certo define se o móvel dura 2 ou 20 anos.",
      blocos: [
        L(O, [
          ["chapa", "MDF cru: superfície crua, para pintar. Mais barato, pede fundo preparador."],
          ["camadas", "MDF BP (baixa pressão): já vem revestido em cor ou padrão amadeirado. Não precisa pintar."],
          ["alerta", "MDF RU (núcleo verde): resiste melhor à umidade. Use em banheiro, pia e lavanderia."],
        ]),
        D("Peça para a loja mostrar a amostra da cor BP na luz do dia: na loja, a lâmpada muda o tom."),
      ],
      perguntas: [
        { enunciado: "Para o gabinete embaixo da pia do banheiro, o MDF indicado é…", opcoes: ["MDF cru", "MDF BP comum", "MDF RU"], correta: 2, explicacao: "O RU tem resina que resiste melhor à umidade do banheiro." },
        { enunciado: "Qual MDF já vem pronto, sem precisar pintar?", opcoes: ["BP", "Cru", "HDF"], correta: 0, explicacao: "O BP vem com revestimento melamínico na cor escolhida." },
      ],
    }),
    topico("m3-t2", {
      titulo: "Espessuras e onde usar",
      icone: "camadas",
      intro: "Cada espessura tem uma função. Chapa grossa demais pesa e encarece; fina demais embarriga.",
      blocos: [
        L(O, [
          ["chapa", "15 mm: caixas de armário, gavetas, nichos e móveis leves."],
          ["porta", "18 mm: portas, tampos, prateleiras longas e móveis que recebem peso."],
          ["camadas", "3 a 6 mm (HDF/MDF fino): fundos de móveis e fundos de gaveta."],
          ["bancada", "25 mm ou duas de 18 coladas: tampos de bancada e mesas."],
        ]),
        D("Padronize: caixa toda em 15 e frentes em 18. Fica mais barato e a montagem é mais simples."),
      ],
      perguntas: [
        { enunciado: "Fundo de armário normalmente é feito com…", opcoes: ["MDF 18 mm", "HDF ou MDF de 3 a 6 mm", "MDF 25 mm"], correta: 1, explicacao: "O fundo só trava o esquadro e fecha; chapa fina basta." },
      ],
    }),
    topico("m3-t3", {
      titulo: "A chapa 2750 × 1830",
      icone: "regua",
      intro: "Quase todo MDF no Brasil vem nessa medida. Projetar pensando nela é economizar chapa.",
      blocos: [
        L(O, [
          ["chapa", "Área de 5,03 m² por chapa. A peça mais longa possível tem 2750 mm."],
          ["calculo", "Some a área das peças e acrescente 10 a 15 % de perda para estimar quantas chapas comprar."],
          ["lupa", "Peças de 1830 mm de largura não sobram nada: projete com folga para o refilo."],
        ]),
        D("Abra o Plano de corte do app com a lista do projeto: ele mostra o arranjo e o aproveitamento real."),
      ],
      perguntas: [
        { enunciado: "Qual a medida padrão da chapa de MDF no Brasil?", opcoes: ["2440 × 1220 mm", "2750 × 1830 mm", "2200 × 1600 mm"], correta: 1, explicacao: "2440 × 1220 e 2200 × 1600 são medidas comuns de compensado." },
      ],
    }),
    topico("m3-t4", {
      titulo: "Kerf e refilo",
      icone: "serra",
      intro: "A serra 'come' madeira em cada corte. Quem esquece disso termina com peça 4 mm menor.",
      blocos: [
        L(O, [
          ["serra", "Kerf é a espessura do corte da lâmina: em geral 3 a 4 mm."],
          ["regua", "Refilo é o acerto das bordas da chapa, que vêm lascadas: cerca de 10 mm por lado."],
          ["check", "Marque a medida e corte com a lâmina do lado de FORA da peça (no lado da sobra)."],
        ]),
        D("Dez cortes numa chapa consomem cerca de 40 mm só de serra. O plano de corte do app já desconta isso."),
      ],
      perguntas: [
        { enunciado: "Ao cortar, a lâmina deve passar…", opcoes: ["Em cima da linha, dividindo ao meio", "Do lado da sobra, fora da peça", "Do lado de dentro da peça"], correta: 1, explicacao: "Assim o kerf sai da sobra e a peça fica com a medida certa." },
      ],
    }),
    topico("m3-t5", {
      titulo: "O veio do padrão amadeirado",
      icone: "veio",
      intro: "MDF amadeirado tem desenho de veio. Peça girada no plano de corte fica com o veio 'deitado'.",
      blocos: [
        L(O, [
          ["veio", "Em portas e laterais amadeiradas, o veio acompanha o comprimento da peça."],
          ["chapa", "No plano de corte, essas peças não podem ser giradas — o aproveitamento cai um pouco."],
          ["check", "Cores lisas (branco, cinza, preto) podem girar à vontade."],
        ]),
        D("Na lista de corte do app, a coluna 'Veio' diz 'no compr.' para as peças que não podem girar."),
      ],
      perguntas: [
        { enunciado: "Uma porta em MDF carvalho deve ter o veio…", opcoes: ["Na largura da porta", "No comprimento (vertical)", "Tanto faz"], correta: 1, explicacao: "Veio vertical é o padrão em portas; girado parece erro de fábrica." },
      ],
    }),
    topico("m3-t6", {
      titulo: "Fita de borda",
      icone: "fita",
      intro: "A borda crua do MDF absorve umidade e lasca. A fita fecha e dá acabamento de loja.",
      blocos: [
        L(O, [
          ["fita", "Largura da fita = espessura da chapa + sobra (22 mm para chapas de 15 e 18)."],
          ["pincel", "Fita pré-colada aplica com ferro de passar (sem vapor) e um taco para pressionar."],
          ["regua", "Refile o excesso com estilete deitado ou refilador, sempre a favor da fita."],
          ["alerta", "Em cozinha e banheiro, fite todas as bordas — inclusive as de trás."],
        ]),
        D("Calcule a fita somando as bordas visíveis e acrescente 10 %. O configurador do app já faz essa conta."),
      ],
      perguntas: [
        { enunciado: "Para chapa de 18 mm, a fita de borda mais usada tem…", opcoes: ["18 mm", "22 mm", "35 mm"], correta: 1, explicacao: "A sobra de 2 mm por lado garante que a borda fique toda coberta e depois é refilada." },
      ],
    }),
    topico("m3-t7", {
      titulo: "Comprando na loja de chapas",
      icone: "caminhao",
      intro: "A loja corta e fita com precisão de máquina. Bem feito, sai mais barato que errar em casa.",
      blocos: [
        L(O, [
          ["livro", "Leve a lista de corte: peça, quantidade, comprimento × largura, espessura e cor."],
          ["veio", "Indique quais peças têm veio e quais bordas levam fita."],
          ["lupa", "Confira as peças na retirada, com trena, antes de sair da loja."],
        ]),
        { t: "passos", titulo: "Pedido sem erro", itens: ["Projete no app", "Exporte a lista de corte", "Marque bordas com fita", "Peça orçamento de corte + fita", "Confira tudo na retirada"] },
      ],
      perguntas: [
        { enunciado: "O que é essencial levar para a loja de chapas?", opcoes: ["Só a medida do móvel pronto", "A lista de corte com peças, medidas, espessura, cor e veio", "Uma foto do móvel"], correta: 1, explicacao: "A loja corta peça por peça; o móvel pronto não diz quais peças cortar." },
      ],
    }),
  ],
};

export const modulo4: Modulo = {
  id: "m4",
  numero: 4,
  titulo: "Junções e fixação",
  descricao: "Parafuso, cavilha, Minifix, furo oblíquo, meia-madeira e espiga: quando usar cada um.",
  livre: false,
  topicos: [
    topico("m4-t1", {
      titulo: "Pré-furo e parafuso certo",
      icone: "parafuso",
      intro: "O parafuso é a junção mais usada em MDF — e a mais mal feita.",
      blocos: [
        L(O, [
          ["parafuso", "Parafuso de rosca total 4,0 × 40 mm para chapas de 15 a 18 mm."],
          ["furadeira", "Pré-furo de 3 mm em toda a profundidade, a pelo menos 20 mm da ponta da peça."],
          ["check", "Escareie para a cabeça ficar rente e cubra com tapa-furo."],
        ]),
        D("Parafuso no topo do MDF segura bem uma vez. Se espanar, mude o furo de lugar — não force."),
      ],
      perguntas: [
        { enunciado: "Para unir duas chapas de 15 mm, o parafuso mais comum é…", opcoes: ["3,0 × 16 mm", "4,0 × 40 mm", "6,0 × 100 mm"], correta: 1, explicacao: "Atravessa os 15 mm e entra ~25 mm no topo da outra peça." },
      ],
    }),
    topico("m4-t2", {
      titulo: "Cavilha",
      icone: "cavilha",
      intro: "Pino de madeira que alinha as peças e resiste ao esforço lateral.",
      blocos: [
        L(O, [
          ["cavilha", "Cavilha 8 × 30 mm em furo de 8 mm, metade em cada peça."],
          ["regua", "Gabarito de cavilha garante que os furos das duas peças batam."],
          ["cola", "Com cola, a cavilha fica mais forte que parafuso em madeira maciça."],
        ]),
        D("Em MDF, use cavilha + parafuso: a cavilha alinha e o parafuso aperta."),
      ],
      perguntas: [
        { enunciado: "Qual a principal função da cavilha em móveis de MDF?", opcoes: ["Decorar", "Alinhar as peças e resistir ao esforço lateral", "Substituir a dobradiça"], correta: 1, explicacao: "Ela impede que as peças escorreguem e travem fora de posição." },
      ],
    }),
    topico("m4-t3", {
      titulo: "Minifix",
      icone: "chapa",
      intro: "A ferragem dos móveis desmontáveis: some do lado de dentro e permite montar várias vezes.",
      blocos: [
        L(O, [
          ["furadeira", "Caixa de 15 mm na face da peça e pino rosqueado no topo da outra."],
          ["check", "Aperte meia volta por vez, alternando os cantos."],
          ["caminhao", "Ideal para móvel que vai ser transportado ou mudado de casa."],
        ]),
        D("Faça um gabarito de MDF com os furos marcados: todas as peças saem iguais."),
      ],
      perguntas: [
        { enunciado: "Quando o Minifix é a melhor escolha?", opcoes: ["Em móvel que precisa desmontar e montar de novo", "Em tábua de corte", "Em moldura de quadro"], correta: 0, explicacao: "Ele não espana com montagens repetidas." },
      ],
    }),
    topico("m4-t4", {
      titulo: "Furo oblíquo (pocket hole)",
      icone: "furadeira",
      intro: "Parafuso inclinado escondido por dentro: rápido e forte em estruturas de madeira.",
      blocos: [
        L(O, [
          ["furadeira", "Gabarito próprio guia a broca escalonada em ângulo de ~15°."],
          ["bancada", "Perfeito para saias de mesa, banco e quadros de frente."],
          ["parafuso", "Use o parafuso próprio para pocket hole (cabeça chata e ponta autoperfurante)."],
        ]),
        D("Os furos ficam do lado de dentro ou de baixo: escolha sempre a face que não aparece."),
      ],
      perguntas: [
        { enunciado: "Onde o furo oblíquo é mais usado?", opcoes: ["Saias de mesa e bancos", "Portas de vidro", "Fundos de gaveta"], correta: 0, explicacao: "Ele prende a saia no pé por dentro, sem aparecer." },
      ],
    }),
    topico("m4-t5", {
      titulo: "Meia-madeira",
      icone: "tabua",
      intro: "Duas peças se cruzam no mesmo plano, cada uma rebaixada na metade da espessura.",
      blocos: [
        L(O, [
          ["serra", "Vários cortes paralelos na profundidade certa e limpeza com formão."],
          ["regua", "A largura do rebaixo é a largura da outra peça — marque encostando uma na outra."],
          ["check", "Usada em bases em cruz, quadros e grades."],
        ]),
        D("Faça o encaixe justo: deve entrar com pressão de mão, sem martelo."),
      ],
      perguntas: [
        { enunciado: "Em um encaixe meia-madeira, cada peça é rebaixada em…", opcoes: ["Um quarto da espessura", "Metade da espessura", "Toda a espessura"], correta: 1, explicacao: "Assim as duas ficam no mesmo plano depois de encaixadas." },
      ],
    }),
    topico("m4-t6", {
      titulo: "Espiga e mortise",
      icone: "martelo",
      intro: "A junção clássica de cadeiras e mesas maciças: fortíssima contra esforço de alavanca.",
      blocos: [
        L(O, [
          ["cavilha", "Espiga é a ponta reduzida de uma peça; mortise é o furo retangular que a recebe."],
          ["regua", "Espiga com cerca de 1/3 da espessura da peça."],
          ["cola", "Colada, resiste ao balanço de uma cadeira por décadas."],
        ]),
        D("Faça a mortise primeiro e ajuste a espiga a ela — é mais fácil desbastar a espiga."),
      ],
      perguntas: [
        { enunciado: "Qual peça se faz primeiro numa junção espiga e mortise?", opcoes: ["A espiga", "A mortise", "Tanto faz"], correta: 1, explicacao: "Ajustar a espiga ao furo pronto é muito mais fácil." },
      ],
    }),
    topico("m4-t7", {
      titulo: "Qual junção usar?",
      icone: "lupa",
      intro: "Resumo prático para decidir na hora de projetar.",
      blocos: [
        L(O, [
          ["chapa", "Caixa de MDF fixa: parafuso + cavilha."],
          ["caminhao", "Móvel desmontável: Minifix + cavilha."],
          ["bancada", "Estrutura de mesa ou banco em madeira: furo oblíquo + cola."],
          ["martelo", "Peça maciça que recebe esforço (cadeira): espiga e mortise."],
        ]),
      ],
      perguntas: [
        { enunciado: "Para um guarda-roupa que o cliente vai levar na mudança, a melhor junção é…", opcoes: ["Cola e prego", "Minifix + cavilha", "Meia-madeira"], correta: 1, explicacao: "Permite desmontar e montar de novo sem perder firmeza." },
      ],
    }),
  ],
};

export const modulo5: Modulo = {
  id: "m5",
  numero: 5,
  titulo: "Ferragens",
  descricao: "Dobradiças, corrediças, puxadores, suportes de prateleira, pés e fixação na parede.",
  livre: false,
  topicos: [
    topico("m5-t1", {
      titulo: "Dobradiça de caneco",
      icone: "dobradica",
      intro: "A dobradiça dos móveis planejados: escondida, regulável em três direções.",
      blocos: [
        L(O, [
          ["dobradica", "Reta: porta cobre toda a lateral. Curva: porta cobre metade (lateral compartilhada). Supercurva: porta embutida."],
          ["furadeira", "Caneco de 35 mm a cerca de 3 a 5 mm da borda da porta."],
          ["check", "Os parafusos de regulagem acertam altura, profundidade e folga lateral."],
        ]),
        D("Monte a porta antes da prateleira: com o vão livre, regular a dobradiça é bem mais fácil."),
      ],
      perguntas: [
        { enunciado: "Duas portas que dividem a mesma lateral do meio usam dobradiça…", opcoes: ["Reta", "Curva", "Supercurva"], correta: 1, explicacao: "A curva faz cada porta cobrir só metade da lateral compartilhada." },
      ],
    }),
    topico("m5-t2", {
      titulo: "Quantas dobradiças por porta?",
      icone: "porta",
      intro: "Porta pesada com pouca dobradiça cai e desregula em semanas.",
      blocos: [
        L(O, [
          ["porta", "Até 90 cm de altura: 2 dobradiças."],
          ["porta", "De 90 a 160 cm: 3 dobradiças."],
          ["porta", "De 160 a 240 cm: 4 dobradiças. Acima disso, 5."],
          ["alerta", "Porta com mais de 60 cm de largura tende a empenar: divida em duas."],
        ]),
        D("Coloque as dobradiças a 100 mm do topo e da base e distribua as outras no meio."),
      ],
      perguntas: [
        { enunciado: "Uma porta de guarda-roupa de 2,20 m de altura precisa de…", opcoes: ["2 dobradiças", "3 dobradiças", "4 dobradiças"], correta: 2, explicacao: "Entre 1,60 e 2,40 m o padrão é 4." },
      ],
    }),
    topico("m5-t3", {
      titulo: "Corrediças de gaveta",
      icone: "gaveta",
      intro: "A corrediça define a folga da gaveta. Errar 2 mm trava tudo.",
      blocos: [
        L(O, [
          ["gaveta", "Telescópica comum: 12,5 mm de cada lado. A caixa da gaveta é 25 mm mais estreita que o vão."],
          ["regua", "Comprimento da corrediça = profundidade útil (300, 350, 400, 450, 500 mm)."],
          ["check", "Instale primeiro no móvel, depois na gaveta, usando calços na mesma altura."],
        ]),
        D("Meça o vão do móvel já montado e só então corte as peças da gaveta."),
      ],
      perguntas: [
        { enunciado: "Com corrediça telescópica de 12,5 mm, num vão de 600 mm a caixa da gaveta deve ter…", opcoes: ["600 mm", "587,5 mm", "575 mm"], correta: 2, explicacao: "600 − 12,5 − 12,5 = 575 mm de largura externa." },
      ],
    }),
    topico("m5-t4", {
      titulo: "Puxadores",
      icone: "puxador",
      intro: "O puxador muda a cara do móvel e precisa de furação certa.",
      blocos: [
        L(O, [
          ["regua", "Puxador de barra é medido de centro a centro dos furos (ex.: 128, 160, 192 mm)."],
          ["check", "Faça um gabarito com os dois furos para todas as portas ficarem iguais."],
          ["porta", "Sem puxador: cava fresada na borda ou fecho toque (push)."],
        ]),
        D("Fure de fora para dentro com um taco atrás da porta: o furo não lasca do outro lado."),
      ],
      perguntas: [
        { enunciado: "A medida de um puxador de barra é…", opcoes: ["O comprimento total", "A distância de centro a centro dos furos", "A altura"], correta: 1, explicacao: "É a medida que importa para furar a porta." },
      ],
    }),
    topico("m5-t5", {
      titulo: "Prateleiras e sistema 32",
      icone: "prateleira",
      intro: "Furos a cada 32 mm deixam a prateleira regulável em qualquer altura.",
      blocos: [
        L(O, [
          ["furadeira", "Furos de 5 mm a 37 mm da borda, de 32 em 32 mm."],
          ["prateleira", "Prateleira 1 a 2 mm mais estreita que o vão para entrar sem raspar."],
          ["alerta", "Vão máximo: ~80 cm em MDF 15 e ~90 cm em MDF 18."],
        ]),
        D("Use um gabarito de furação: as quatro colunas de furos ficam alinhadas e a prateleira não balança."),
      ],
      perguntas: [
        { enunciado: "No sistema 32, os furos ficam a cada…", opcoes: ["25 mm", "32 mm", "50 mm"], correta: 1, explicacao: "É o padrão europeu da indústria de móveis." },
      ],
    }),
    topico("m5-t6", {
      titulo: "Pés, rodapé e nivelamento",
      icone: "pes",
      intro: "Piso de casa nunca é reto. A base do móvel resolve isso.",
      blocos: [
        L(O, [
          ["pes", "Pé regulável plástico (cozinha): nivela cada módulo e fica escondido atrás do rodapé."],
          ["chapa", "Rodapé recuado 3 cm da frente dá espaço para o pé de quem usa."],
          ["nivel", "Nivele antes de instalar portas: móvel torto desregula as dobradiças."],
        ]),
        D("Em pés palito, use chapa de fixação com parafuso curto (16 mm) para não atravessar a base."),
      ],
      perguntas: [
        { enunciado: "Por que o rodapé fica recuado?", opcoes: ["Para economizar chapa", "Para dar espaço para os pés de quem usa o móvel", "Por estética apenas"], correta: 1, explicacao: "Sem o recuo, o pé bate na base ao chegar perto da bancada." },
      ],
    }),
    topico("m5-t7", {
      titulo: "Fixação na parede",
      icone: "parede",
      intro: "Móvel alto sem fixação tomba. Aéreo mal fixado cai.",
      blocos: [
        L(O, [
          ["parede", "Alvenaria: bucha 8 e parafuso 5 × 60 mm."],
          ["alerta", "Drywall: bucha basculante ou fixar no montante metálico."],
          ["check", "Guarda-roupas, estantes e cômodas: sempre suporte antitombamento."],
          ["prateleira", "Aéreo: suporte regulável preso nas laterais, nunca só no fundo fino."],
        ]),
        D("Antes de furar, passe um detector ou confira o projeto elétrico: cano e fio passam na vertical das tomadas."),
      ],
      perguntas: [
        { enunciado: "Um armário aéreo deve ser pendurado…", opcoes: ["Pelo fundo de 3 mm", "Por suportes presos nas laterais", "Com cola"], correta: 1, explicacao: "As laterais é que aguentam carga; o fundo fino rasga." },
      ],
    }),
  ],
};

export const modulo6: Modulo = {
  id: "m6",
  numero: 6,
  titulo: "Projetando sob medida",
  descricao: "Medidas de conforto, profundidades padrão, folgas e como chegar na lista de corte.",
  livre: false,
  topicos: [
    topico("m6-t1", {
      titulo: "Medidas de conforto",
      icone: "ergonomia",
      intro: "Móvel bonito com medida errada vira problema todo dia.",
      blocos: [
        L(O, [
          ["bancada", "Bancada de cozinha: 85 a 90 cm com o tampo."],
          ["regua", "Mesa de jantar e escrivaninha: 75 cm. Assento de cadeira: 45 cm."],
          ["ergonomia", "Balcão alto: 105 cm, com banqueta de 75 cm."],
          ["porta", "Cabideiro de guarda-roupa: ~1,70 m do piso para roupa longa."],
        ]),
      ],
      perguntas: [
        { enunciado: "A altura padrão de uma escrivaninha é…", opcoes: ["65 cm", "75 cm", "90 cm"], correta: 1, explicacao: "75 cm combina com cadeira de assento a 45 cm." },
      ],
    }),
    topico("m6-t2", {
      titulo: "Profundidades padrão",
      icone: "regua",
      intro: "Profundidade errada é o erro mais comum de quem começa a projetar.",
      blocos: [
        L(O, [
          ["porta", "Guarda-roupa: 55 a 60 cm (o cabide precisa de ~52 cm livres)."],
          ["gaveta", "Módulo de cozinha: 58 cm de caixa, com tampo de 60 cm."],
          ["prateleira", "Aéreo: 30 a 35 cm. Estante de livros: 25 a 30 cm."],
          ["chapa", "Rack: 35 a 45 cm. Sapateira: 30 a 38 cm."],
        ]),
      ],
      perguntas: [
        { enunciado: "Profundidade mínima de um guarda-roupa com cabideiro?", opcoes: ["40 cm", "55 cm", "80 cm"], correta: 1, explicacao: "Abaixo disso o cabide raspa na porta." },
      ],
    }),
    topico("m6-t3", {
      titulo: "Vão máximo de prateleira",
      icone: "prateleira",
      intro: "A prateleira não quebra: ela vai cedendo aos poucos até embarrigar.",
      blocos: [
        L(O, [
          ["chapa", "MDF 15: até ~80 cm. MDF 18: até ~90 cm (livros: 80 cm)."],
          ["bancada", "Para vão maior: divisória no meio, testeira colada na frente ou chapa mais grossa."],
          ["check", "O configurador do app avisa quando o vão passa do limite."],
        ]),
        D("Testeira de 4 a 5 cm colada em pé sob a borda funciona como uma viga e dobra a rigidez."),
      ],
      perguntas: [
        { enunciado: "Uma prateleira de MDF 15 mm com 1,10 m de vão vai…", opcoes: ["Ficar perfeita", "Embarrigar com o tempo", "Quebrar na hora"], correta: 1, explicacao: "Passa do limite de ~80 cm e cede com o peso ao longo dos meses." },
      ],
    }),
    topico("m6-t4", {
      titulo: "Folgas de portas e gavetas",
      icone: "porta",
      intro: "Sem folga nada abre; folga demais fica feio. O padrão é 3 mm.",
      blocos: [
        L(O, [
          ["porta", "3 mm entre portas e entre porta e gaveta."],
          ["regua", "Porta sobreposta: largura do vão + espessuras cobertas − folgas."],
          ["calculo", "Duas portas num vão: (largura total − 3 mm) ÷ 2 para cada."],
        ]),
        D("Calços de 3 mm (cartão ou palito) entre as portas na hora de regular deixam tudo alinhado."),
      ],
      perguntas: [
        { enunciado: "Qual a folga padrão entre duas portas?", opcoes: ["1 mm", "3 mm", "10 mm"], correta: 1, explicacao: "3 mm abre sem raspar e mantém a frente alinhada." },
      ],
    }),
    topico("m6-t5", {
      titulo: "Calculando uma gaveta",
      icone: "gaveta",
      intro: "Gaveta é a peça que mais dá errado. Com a fórmula, sai certa de primeira.",
      blocos: [
        L(O, [
          ["regua", "Largura externa da caixa = vão − 25 mm (corrediças de 12,5)."],
          ["chapa", "Frente e traseira internas = largura da caixa − 2 × espessura."],
          ["gaveta", "Altura da caixa ≈ altura da frente − 60 mm."],
          ["camadas", "Fundo de 3 a 6 mm, encaixado em canal ou pregado por baixo."],
        ]),
      ],
      perguntas: [
        { enunciado: "Vão de 500 mm, chapa de 15 mm e corrediça de 12,5: quanto mede a contrafrente interna?", opcoes: ["475 mm", "445 mm", "500 mm"], correta: 1, explicacao: "Caixa = 500 − 25 = 475; contrafrente = 475 − 2 × 15 = 445 mm." },
      ],
    }),
    topico("m6-t6", {
      titulo: "Montando a lista de corte",
      icone: "livro",
      intro: "Do desenho à lista: peça por peça, sem esquecer nada.",
      blocos: [
        { t: "passos", titulo: "Passo a passo", itens: ["Desenhe a caixa (laterais, tampo, base)", "Desconte as espessuras nas peças internas", "Some divisórias e prateleiras", "Calcule portas e gavetas pelas folgas", "Agrupe por espessura e cor", "Confira o total de peças com o desenho"] },
        D("O configurador do app faz exatamente essa sequência — use-o para conferir suas contas."),
      ],
      perguntas: [
        { enunciado: "Num armário de 800 mm com laterais de 15 mm, o tampo entre as laterais mede…", opcoes: ["800 mm", "785 mm", "770 mm"], correta: 2, explicacao: "800 − 15 − 15 = 770 mm." },
      ],
    }),
    topico("m6-t7", {
      titulo: "Do cliente ao projeto",
      icone: "lupa",
      intro: "Medir o ambiente do cliente direito evita refazer o móvel inteiro.",
      blocos: [
        L(O, [
          ["trena", "Meça largura em três alturas e altura em três pontos: parede nunca é reta."],
          ["alerta", "Anote tomadas, interruptores, rodapé, janela e abertura de porta."],
          ["regua", "Use a menor medida e deixe 1 a 2 cm de folga para entrar o móvel."],
          ["caminhao", "Confira se o móvel passa pela porta, escada e elevador."],
        ]),
      ],
      perguntas: [
        { enunciado: "A parede tem 2,41 m embaixo e 2,39 m em cima. O móvel deve ter no máximo…", opcoes: ["2,41 m", "2,40 m", "Cerca de 2,37 a 2,38 m"], correta: 2, explicacao: "Use a menor medida e deixe folga para entrar e ajustar." },
      ],
    }),
  ],
};

export const modulo7: Modulo = {
  id: "m7",
  numero: 7,
  titulo: "Acabamento, preço e venda",
  descricao: "Lixa, verniz, pintura, óleo, quanto cobrar, como fotografar e entregar.",
  livre: false,
  topicos: [
    topico("m7-t1", {
      titulo: "Seladora e verniz",
      icone: "pincel",
      intro: "Verniz bonito começa na seladora e na lixa entre as demãos.",
      blocos: [
        L(O, [
          ["pincel", "Seladora fecha os poros; depois de seca, lixa 320."],
          ["camadas", "Duas demãos de verniz PU base água, com lixa 400 entre elas."],
          ["alerta", "Área externa: stain impregnante em vez de verniz (verniz descasca no sol)."],
        ]),
      ],
      perguntas: [
        { enunciado: "Para um banco de jardim, o acabamento mais indicado é…", opcoes: ["Verniz brilhante", "Stain impregnante com filtro UV", "Cera de abelha"], correta: 1, explicacao: "O stain penetra na madeira e não descasca com sol e chuva." },
      ],
    }),
    topico("m7-t2", {
      titulo: "Pintura de MDF cru",
      icone: "pincel",
      intro: "MDF cru pintado pode ficar com cara de laca — ou de serviço amador.",
      blocos: [
        L(O, [
          ["lixa", "Lixa 150 e fundo preparador para MDF."],
          ["alerta", "Bordas chupam tinta: duas demãos de fundo nelas, com lixa entre elas."],
          ["pincel", "Esmalte acrílico ou PU base água com rolo de espuma, 2 demãos."],
        ]),
      ],
      perguntas: [
        { enunciado: "Por que as bordas do MDF cru pedem mais fundo?", opcoes: ["Porque são mais lisas", "Porque absorvem muito mais tinta", "Não pedem"], correta: 1, explicacao: "A borda é porosa e fica áspera se não for selada bem." },
      ],
    }),
    topico("m7-t3", {
      titulo: "Óleo e peças de cozinha",
      icone: "tabua",
      intro: "O que encosta em comida não leva verniz.",
      blocos: [
        L(O, [
          ["tabua", "Tábuas e colheres: óleo mineral de grau alimentício."],
          ["cola", "Mistura de óleo mineral com cera de abelha (4:1) dá proteção extra."],
          ["alerta", "Nunca use óleo de linhaça comum ou verniz em superfície de corte."],
        ]),
      ],
      perguntas: [
        { enunciado: "Acabamento correto para tábua de corte:", opcoes: ["Verniz PU", "Óleo mineral grau alimentício", "Tinta acrílica"], correta: 1, explicacao: "É atóxico e renovável a qualquer momento." },
      ],
    }),
    topico("m7-t4", {
      titulo: "Quanto cobrar",
      icone: "dinheiro",
      intro: "Cobrar só o material é trabalhar de graça.",
      blocos: [
        L(O, [
          ["calculo", "Preço = (material + horas × valor da hora + custos fixos) × (1 + margem)."],
          ["dinheiro", "Custos fixos: energia, lâmina, lixa, transporte — cerca de 10 %."],
          ["estrela", "Margem de 20 a 40 % paga ferramenta nova e imprevisto."],
        ]),
        D("Material R$ 300 + 10 h × R$ 30 + 10 % = R$ 660. Com 30 % de margem: R$ 858.", "Exemplo"),
      ],
      perguntas: [
        { enunciado: "Material R$ 200, 5 h de trabalho a R$ 30/h, sem custos fixos e margem de 20 %. O preço é…", opcoes: ["R$ 350", "R$ 420", "R$ 240"], correta: 1, explicacao: "(200 + 150) × 1,2 = R$ 420." },
      ],
    }),
    topico("m7-t5", {
      titulo: "Fotografar para vender",
      icone: "camera",
      intro: "Na internet, quem compra só vê a foto. Foto boa vende o mesmo móvel por mais.",
      blocos: [
        L(O, [
          ["camera", "Luz natural lateral, perto de janela, sem flash."],
          ["lupa", "Fundo limpo e uma foto de detalhe (encaixe, acabamento, ferragem)."],
          ["estrela", "Uma foto do móvel em uso, num ambiente montado."],
        ]),
      ],
      perguntas: [
        { enunciado: "A melhor luz para fotografar uma peça de madeira é…", opcoes: ["Flash do celular", "Luz natural lateral de janela", "Lâmpada amarela de teto"], correta: 1, explicacao: "Ela mostra o veio e a textura sem reflexo estourado." },
      ],
    }),
    topico("m7-t6", {
      titulo: "Entrega e instalação",
      icone: "caminhao",
      intro: "A entrega é a última impressão — e a que o cliente conta para os amigos.",
      blocos: [
        L(O, [
          ["caminhao", "Proteja quinas com papelão e transporte portas deitadas e separadas."],
          ["nivel", "Leve nível, buchas, parafusos extras e calços."],
          ["check", "Regule todas as portas e gavetas na frente do cliente."],
          ["livro", "Deixe por escrito os cuidados de limpeza e a garantia."],
        ]),
      ],
      perguntas: [
        { enunciado: "O que nunca pode faltar no kit de instalação?", opcoes: ["Lixadeira", "Nível, buchas e parafusos extras", "Serra circular"], correta: 1, explicacao: "Sem nível e fixação, você volta para casa sem terminar." },
      ],
    }),
    topico("m7-t7", {
      titulo: "Desafio final",
      icone: "estrela",
      intro: "Junte tudo: projete um móvel completo no configurador e confira se as medidas fecham.",
      blocos: [
        { t: "passos", titulo: "Seu desafio", itens: ["Escolha um móvel em Projetos dinâmicos", "Use as medidas de um cliente real (ou da sua casa)", "Deixe a conferência verde (medidas conferidas)", "Abra o plano de corte e anote quantas chapas", "Calcule o preço com a fórmula do tópico 4", "Salve o projeto para o cliente"] },
      ],
      perguntas: [
        { enunciado: "Antes de levar a lista para a loja, você deve…", opcoes: ["Conferir que todas as peças cabem e as medidas foram conferidas", "Pedir para a loja inventar as medidas", "Cortar primeiro e ver depois"], correta: 0, explicacao: "Conferir antes de cortar é o que separa lucro de prejuízo." },
      ],
    }),
  ],
};
