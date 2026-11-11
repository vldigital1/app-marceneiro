import { topico, type Bloco, type Modulo } from "./tipos";

const L = (titulo: string, itens: [string, string][]): Bloco => ({ t: "lista", titulo, itens: itens.map(([icone, texto]) => ({ icone, texto })) });
const D = (texto: string, titulo = "Na oficina"): Bloco => ({ t: "dica", titulo, texto });

export const modulo1: Modulo = {
  id: "m1",
  numero: 1,
  titulo: "Primeiros passos",
  descricao: "Segurança, medida, esquadro e como ler uma ficha de projeto.",
  livre: true,
  topicos: [
    topico("m1-t1", {
      titulo: "Segurança em primeiro lugar",
      icone: "oculos",
      intro: "Marceneiro bom é marceneiro com os dez dedos. O equipamento de proteção vem antes de qualquer máquina.",
      blocos: [
        L("O que importa", [
          ["oculos", "Óculos de proteção sempre que a lâmina ou a broca estiver girando: lasca e serragem voam na altura do rosto."],
          ["ouvido", "Protetor auricular com serra circular, tupia e lixadeira. A perda de audição não volta."],
          ["mascara", "Máscara PFF2 para lixar e cortar MDF: o pó é fino e fica no ar por muito tempo."],
          ["alerta", "Nada de luva, pulseira ou manga solta perto de peça girando: o que enrosca puxa a mão junto."],
        ]),
        D("Desligue a máquina da tomada antes de trocar disco, broca ou lixa. A maioria dos acidentes acontece na troca, não no corte."),
      ],
      perguntas: [
        { enunciado: "Qual equipamento NÃO deve ser usado perto de uma serra girando?", opcoes: ["Óculos de proteção", "Luva de tecido", "Protetor auricular"], correta: 1, explicacao: "A luva pode enroscar na lâmina e puxar a mão. Óculos e protetor são obrigatórios." },
        { enunciado: "Para lixar MDF, a máscara indicada é…", opcoes: ["Máscara de pano", "PFF2", "Nenhuma, o pó é grosso"], correta: 1, explicacao: "O pó de MDF é muito fino; a PFF2 filtra essas partículas." },
      ],
    }),
    topico("m1-t2", {
      titulo: "Medir certo: meça duas vezes",
      icone: "trena",
      intro: "Erro de medida custa chapa. A trena é a ferramenta mais barata e a que mais economiza dinheiro.",
      blocos: [
        L("O que importa", [
          ["trena", "Trabalhe sempre em milímetros: é a unidade da loja de chapas e evita erro de vírgula."],
          ["regua", "A ponta da trena tem folga de propósito: ela compensa a espessura do gancho para medir por dentro e por fora."],
          ["lupa", "Marque com lápis de ponta fina e um 'V' apontando o ponto exato, não um risco grosso."],
          ["check", "Meça duas vezes, corte uma. Confira a medida de novo antes de ligar a serra."],
        ]),
        D("Use sempre a mesma trena do começo ao fim do projeto. Trenas diferentes podem ter 1 a 2 mm de diferença entre si."),
      ],
      perguntas: [
        { enunciado: "Por que é melhor trabalhar em milímetros?", opcoes: ["Porque é mais bonito", "Porque é o padrão da loja de chapas e evita erro de vírgula", "Porque a trena não tem centímetros"], correta: 1, explicacao: "Lista de corte e loja trabalham em mm. Converter no meio do caminho é onde o erro aparece." },
      ],
    }),
    topico("m1-t3", {
      titulo: "Esquadro e diagonais",
      icone: "esquadro",
      intro: "Móvel fora de esquadro não fecha porta, emperra gaveta e balança. Dá para conferir com uma trena só.",
      blocos: [
        L("O que importa", [
          ["esquadro", "Esquadro de carpinteiro para marcar cortes a 90° e conferir encontros de peças."],
          ["trena", "Na caixa montada, meça as duas diagonais: quando forem iguais, a caixa está no esquadro."],
          ["martelo", "Se uma diagonal estiver maior, empurre pelo canto dela até as duas igualarem."],
          ["check", "Só pregue o fundo depois das diagonais iguais: o fundo é o que trava o esquadro."],
        ]),
        D("Tolerância prática: até 2 mm de diferença entre as diagonais em móvel grande ainda fecha bem."),
      ],
      perguntas: [
        { enunciado: "Como saber se uma caixa está no esquadro usando só a trena?", opcoes: ["Medindo a altura duas vezes", "Medindo as duas diagonais: elas devem ser iguais", "Medindo a largura da frente e de trás"], correta: 1, explicacao: "Diagonais iguais = ângulos retos. É o teste mais rápido e preciso." },
      ],
    }),
    topico("m1-t4", {
      titulo: "MDF ou madeira maciça?",
      icone: "camadas",
      intro: "Cada material tem seu lugar. Saber escolher evita móvel empenado ou inchado.",
      blocos: [
        L("O que importa", [
          ["chapa", "MDF é estável (não empena), liso e vem em chapas grandes: ideal para armários, portas e gavetas."],
          ["tabua", "Madeira maciça é forte, aceita entalhe e envelhece bonita: ideal para mesas, bancos e peças rústicas."],
          ["alerta", "MDF comum incha com água; madeira maciça dilata e contrai com a umidade do ar."],
          ["veio", "Madeira tem veio: a resistência é muito maior no sentido do comprimento das fibras."],
        ]),
        D("Para banheiro e pia de cozinha, use MDF RU (resistente à umidade, núcleo verde) ou madeira tratada."),
      ],
      perguntas: [
        { enunciado: "Para fazer as portas de um guarda-roupa, o material mais indicado é…", opcoes: ["MDF", "Tábua de pinus", "Madeira de pallet"], correta: 0, explicacao: "Portas grandes precisam ser estáveis e planas: o MDF não empena como a madeira maciça." },
      ],
    }),
    topico("m1-t5", {
      titulo: "Lendo uma ficha de projeto",
      icone: "livro",
      intro: "Toda ficha do app segue a mesma ordem. Entender a ordem é metade do trabalho.",
      blocos: [
        L("O que importa", [
          ["regua", "Medidas finais vêm como Altura × Largura × Profundidade (A × L × P)."],
          ["chapa", "A lista de corte traz peça, quantidade, comprimento, largura, espessura e veio."],
          ["parafuso", "Ferragens e consumíveis já vêm somados: leve a lista inteira para a loja."],
          ["alerta", "Pontos de atenção são os erros que mais custam caro: leia antes de cortar."],
        ]),
        { t: "passos", titulo: "Ordem certa de usar a ficha", itens: ["Leia a ficha inteira", "Compre material e ferragens", "Corte e identifique as peças", "Monte seguindo os passos", "Faça o acabamento"] },
      ],
      perguntas: [
        { enunciado: "Na ficha, 2100 × 1900 × 520 significa…", opcoes: ["Largura × Altura × Profundidade", "Altura × Largura × Profundidade", "Profundidade × Altura × Largura"], correta: 1, explicacao: "O padrão do app é A × L × P, em milímetros." },
      ],
    }),
    topico("m1-t6", {
      titulo: "Organizando a oficina pequena",
      icone: "oficina",
      intro: "Não precisa de galpão. Precisa de ordem: achar a ferramenta rápido é ganhar tempo.",
      blocos: [
        L("O que importa", [
          ["parede", "Parede com painel de ferramentas: tudo à vista e no mesmo lugar."],
          ["bancada", "Uma bancada firme é o centro da oficina; o resto gira em volta dela."],
          ["prateleira", "Sobras separadas por tamanho (grandes, médias, pequenas) viram projeto, não lixo."],
          ["alerta", "Extensão elétrica com fio grosso e uma tomada por máquina: nada de benjamim."],
        ]),
        D("Desenhe o contorno de cada ferramenta no painel. Na hora de guardar, você vê na hora o que está faltando."),
      ],
      perguntas: [
        { enunciado: "Qual é o centro de uma oficina organizada?", opcoes: ["A serra de bancada", "A bancada de trabalho firme", "O armário de ferragens"], correta: 1, explicacao: "Tudo passa pela bancada: marcar, montar, colar, lixar." },
      ],
    }),
    topico("m1-t7", {
      titulo: "Seu primeiro projeto",
      icone: "estrela",
      intro: "Comece por algo pequeno e completo: um nicho de parede ensina corte, montagem, esquadro e acabamento.",
      blocos: [
        L("O que importa", [
          ["chapa", "Poucas peças retas: 2 laterais, topo e base."],
          ["parafuso", "Montagem só com parafuso e pré-furo, sem ferragem difícil."],
          ["esquadro", "Treina o esquadro e a fixação na parede."],
          ["estrela", "Fica pronto em uma tarde e já serve como peça de venda."],
        ]),
        D("Abra 'Projetos dinâmicos › Nicho de parede', ajuste as medidas e use a lista de corte que o app gera.", "Para praticar"),
      ],
      perguntas: [
        { enunciado: "Por que o nicho é um bom primeiro projeto?", opcoes: ["Porque usa máquinas caras", "Porque tem poucas peças retas e ensina o básico completo", "Porque não precisa de medida"], correta: 1, explicacao: "Ele passa por todas as etapas sem complicação de ferragem." },
      ],
    }),
  ],
};

export const modulo2: Modulo = {
  id: "m2",
  numero: 2,
  titulo: "Ferramentas",
  descricao: "O kit que resolve a maioria dos projetos e como usar cada ferramenta com segurança.",
  livre: true,
  topicos: [
    topico("m2-t1", {
      titulo: "Furadeira e parafusadeira",
      icone: "furadeira",
      intro: "Se for comprar uma única máquina, é esta: fura, parafusa e escareia.",
      blocos: [
        L("O que importa", [
          ["furadeira", "Parafusadeira a bateria com embreagem regulável: evita espanar o parafuso no MDF."],
          ["parafuso", "Use a embreagem baixa para parafusar e a posição de furar (broca) para furos."],
          ["alerta", "No MDF, sempre pré-furo de 3 mm antes de parafusar em topo — senão a chapa abre."],
        ]),
        D("Marque a profundidade na broca com um pedaço de fita crepe: o furo sai sempre igual."),
      ],
      perguntas: [
        { enunciado: "Antes de parafusar no topo de uma chapa de MDF, você deve…", opcoes: ["Molhar a ponta do parafuso", "Fazer um pré-furo de cerca de 3 mm", "Usar parafuso de prego"], correta: 1, explicacao: "Sem pré-furo, o parafuso funciona como cunha e racha o MDF." },
      ],
    }),
    topico("m2-t2", {
      titulo: "Brocas e escareador",
      icone: "parafuso",
      intro: "Broca certa faz furo limpo; escareador deixa a cabeça do parafuso no nível da peça.",
      blocos: [
        L("O que importa", [
          ["parafuso", "Broca para madeira tem ponta de centralização: não escorrega na marcação."],
          ["cavilha", "Broca de 8 mm para cavilha e de 3 mm para pré-furo cobrem quase tudo."],
          ["dobradica", "Broca Forstner de 35 mm faz o caneco da dobradiça na porta."],
          ["check", "O escareador abre o cone para a cabeça do parafuso ficar rente."],
        ]),
        D("Broca cega queima a madeira (fica preto no furo). Troque ou afie antes de estragar a peça."),
      ],
      perguntas: [
        { enunciado: "Qual broca faz o furo da dobradiça de caneco?", opcoes: ["Broca de 8 mm", "Forstner de 35 mm", "Broca de concreto"], correta: 1, explicacao: "O caneco tem 35 mm de diâmetro: a Forstner faz o furo plano e limpo." },
      ],
    }),
    topico("m2-t3", {
      titulo: "Serra circular com guia",
      icone: "serra",
      intro: "Com uma guia reta, a serra circular corta chapa grande com precisão de serra de bancada.",
      blocos: [
        L("O que importa", [
          ["regua", "Guia: uma régua de alumínio ou sarrafo reto preso com grampos ao lado da linha de corte."],
          ["serra", "Lâmina só 5 mm abaixo da chapa: menos lasca e menos perigo."],
          ["chapa", "Apoie a chapa dos dois lados do corte para a peça não cair e travar a lâmina."],
          ["alerta", "Espere a lâmina parar totalmente antes de levantar a serra."],
        ]),
        D("Cole fita crepe sobre a linha de corte no MDF BP: o revestimento lasca muito menos."),
      ],
      perguntas: [
        { enunciado: "Quanto a lâmina deve passar abaixo da chapa?", opcoes: ["O máximo possível", "Cerca de 5 mm", "Não deve atravessar"], correta: 1, explicacao: "Lâmina pouco exposta corta mais limpo e reduz o risco de rebote." },
      ],
    }),
    topico("m2-t4", {
      titulo: "Serra tico-tico",
      icone: "serra",
      intro: "A serra das curvas: alças, meias-luas, recortes de porta e acabamentos arredondados.",
      blocos: [
        L("O que importa", [
          ["serra", "Lâmina de dente fino para MDF e acabamento; dente grosso para corte rápido em madeira."],
          ["furadeira", "Para recorte interno, faça um furo de 10 mm e comece a serra por ele."],
          ["alerta", "Deixe a máquina cortar: forçar entorta a lâmina e o corte sai inclinado."],
        ]),
        D("Corte 1 mm por fora da linha e acerte com lixa. A tico-tico raramente deixa o corte perfeito."),
      ],
      perguntas: [
        { enunciado: "Como começar um recorte no meio da peça (ex.: alça de bandeja)?", opcoes: ["Batendo a serra na peça", "Fazendo um furo e iniciando o corte por ele", "Não é possível com tico-tico"], correta: 1, explicacao: "O furo inicial dá passagem para a lâmina entrar." },
      ],
    }),
    topico("m2-t5", {
      titulo: "Serra de esquadria",
      icone: "esquadro",
      intro: "Cortes de topo perfeitos e repetidos: ripas, sarrafos e molduras em 45°.",
      blocos: [
        L("O que importa", [
          ["esquadro", "Corta em 90° e em ângulo (meia-esquadria de molduras)."],
          ["regua", "Um batente preso na mesa garante várias peças exatamente do mesmo tamanho."],
          ["alerta", "Mão a pelo menos 15 cm da lâmina. Peça pequena se segura com grampo, não com o dedo."],
        ]),
        D("Para moldura, meça pelo lado de fora da peça e corte as quatro com o mesmo batente."),
      ],
      perguntas: [
        { enunciado: "Para cortar 20 ripas iguais, o mais seguro e preciso é…", opcoes: ["Medir e marcar uma por uma", "Usar um batente fixo na serra", "Cortar a olho"], correta: 1, explicacao: "Com batente, todas saem com a mesma medida e você não precisa marcar." },
      ],
    }),
    topico("m2-t6", {
      titulo: "Lixadeira e grãos de lixa",
      icone: "lixa",
      intro: "Acabamento bom começa na lixa. Pular grão deixa risco que aparece no verniz.",
      blocos: [
        L("O que importa", [
          ["lixa", "Sequência básica: 80 (desbaste) → 120 → 220 (acabamento)."],
          ["veio", "Na madeira maciça, termine sempre no sentido do veio."],
          ["mascara", "Lixadeira com coletor de pó e máscara PFF2."],
          ["check", "Passe a mão de olhos fechados: você sente defeito que o olho não vê."],
        ]),
        D("Entre demãos de verniz, use lixa 320 a 400 bem de leve, só para tirar o 'pelo' levantado."),
      ],
      perguntas: [
        { enunciado: "Qual a sequência de lixa mais usada?", opcoes: ["220 → 120 → 80", "80 → 120 → 220", "Só 80"], correta: 1, explicacao: "Do grão grosso ao fino: cada grão apaga o risco do anterior." },
      ],
    }),
    topico("m2-t7", {
      titulo: "Grampos e cola",
      icone: "grampo",
      intro: "O grampo é a terceira mão do marceneiro. Sem pressão, a cola não segura.",
      blocos: [
        L("O que importa", [
          ["grampo", "Comece com dois grampos sargento; depois amplie conforme os projetos."],
          ["cola", "Cola PVA para interno; PVA D3 para áreas úmidas e tábuas de cozinha."],
          ["check", "Cola em excesso escorre: limpe com pano úmido antes de secar."],
          ["alerta", "Aperto demais expulsa a cola da junta. Basta a cola começar a 'suar' nas bordas."],
        ]),
        D("Proteja a peça com um taquinho entre o grampo e a madeira: evita marca no acabamento."),
      ],
      perguntas: [
        { enunciado: "Para uma tábua de corte que vai ser lavada, a cola indicada é…", opcoes: ["PVA comum", "PVA D3", "Cola quente"], correta: 1, explicacao: "A D3 é resistente à água depois de curada." },
      ],
    }),
    topico("m2-t8", {
      titulo: "Evolução 1: a bancada de trabalho",
      icone: "bancada",
      intro: "Tudo passa pela bancada. Ela é a primeira grande evolução da oficina.",
      blocos: [
        L("O que importa", [
          ["ergonomia", "Altura certa: na linha do punho com o braço solto ao lado do corpo — nem curvado, nem com o ombro erguido."],
          ["bancada", "Tampo plano e firme. Bancada que balança estraga medida e é perigosa."],
          ["camadas", "Duas chapas de MDF 18 mm coladas formam um tampo pesado e plano."],
          ["pes", "Pés de caibro duplo e travessas em duas alturas: nada de balanço lateral."],
        ]),
        D("Se as costas doem depois de uma tarde de trabalho, a altura da bancada é a primeira suspeita."),
      ],
      perguntas: [
        { enunciado: "A altura da bancada deve ficar perto…", opcoes: ["Do ombro", "Da linha do punho, com o braço solto", "Do joelho"], correta: 1, explicacao: "Nessa altura você tem força e controle sem curvar as costas." },
        { enunciado: "O que mais ajuda a bancada a não balançar?", opcoes: ["Tampo fino e leve", "Travessas em duas alturas ligando os pés", "Rodízios sem trava"], correta: 1, explicacao: "Os quadros de travessas formam triângulos rígidos com os pés." },
      ],
    }),
  ],
};
