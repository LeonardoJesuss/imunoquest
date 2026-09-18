/* ============================================================
   content.js — TODO o texto pedagógico do jogo, num só lugar.
   Nada aqui deve ser alterado no código do jogo sem registrar a mudança.
   ============================================================ */

const IMUNOQUEST_CONTENT = {

  /* ---------------------------------------------------------
     ENCICLOPÉDIA — "Central do Sistema Imunitário"
     phase: em que fase o verbete é desbloqueado (1 = já disponível)
     --------------------------------------------------------- */
  encyclopedia: [
    {
      id: "sistema-imunitario",
      title: "Sistema imunitário",
      phase: 1,
      body: [
        "É o conjunto de células, tecidos e órgãos que trabalham juntos para identificar e neutralizar o que é estranho ao organismo — como vírus, bactérias e fungos.",
        "Ele age em camadas: primeiro barreiras que dificultam a entrada, depois defesas internas rápidas (imunidade inata) e, quando necessário, defesas específicas que 'aprendem' a reconhecer o invasor (imunidade adaptativa)."
      ],
      gameLink: "No jogo, cada mecanismo de defesa que você posiciona representa uma parte desse sistema trabalhando em conjunto para proteger o tecido."
    },
    {
      id: "patogenos",
      title: "Patógenos (agentes invasores)",
      phase: 1,
      body: [
        "São agentes capazes de causar doença, como vírus, bactérias e fungos. Ao entrar no organismo, podem se multiplicar e causar dano aos tecidos.",
        "Tipos diferentes de patógeno têm estruturas diferentes — por isso o organismo usa estratégias de defesa diferentes contra cada um."
      ],
      gameLink: "Na Fase 1 aparecem bactérias (mais resistentes e lentas) e partículas de vírus (mais rápidas e frágeis)."
    },
    {
      id: "antigeno",
      title: "Antígeno",
      phase: 1,
      body: [
        "É uma estrutura molecular reconhecida pelo sistema de defesa. Nos patógenos, são essas estruturas que 'denunciam' o invasor e desencadeiam a resposta imunológica.",
        "Cada patógeno tem seus próprios antígenos — é isso que, mais tarde, permite uma resposta específica contra ele."
      ],
      gameLink: "Na Fase 4, acumular 'amostras de antígeno' (geradas por macrófagos e pela vigilância NK) é o que libera as defesas específicas — linfócitos B e T — contra aquele patógeno em particular."
    },
    {
      id: "imunidade-inata",
      title: "Imunidade inata",
      phase: 1,
      body: [
        "É a defesa com que já nascemos. Responde rápido e da mesma forma contra qualquer invasor — por isso é chamada de inespecífica.",
        "Inclui as barreiras (pele, mucosas, secreções), células que fazem fagocitose (como neutrófilos e macrófagos), a inflamação, as células NK e a febre."
      ],
      gameLink: "Toda a Fase 1 usa apenas imunidade inata: barreira na entrada e neutrófilo no tecido. As defesas específicas só chegam mais adiante."
    },
    {
      id: "barreiras",
      title: "Barreiras físicas e químicas",
      phase: 1,
      body: [
        "São a primeira linha de defesa e atuam na entrada do organismo, dificultando que o invasor chegue aos tecidos.",
        "Barreiras físicas: pele, mucosas, pelos e cílios. Barreiras químicas: lágrima, saliva, suco gástrico e outras secreções, que têm substâncias capazes de danificar muitos micro-organismos."
      ],
      gameLink: "A defesa Barreira só pode ser posicionada nos nichos de superfície. Ela filtra e atrasa parte dos invasores, mas não alcança quem já passou para o tecido."
    },
    {
      id: "fagocitose",
      title: "Fagocitose",
      phase: 1,
      body: [
        "É o processo pelo qual certas células de defesa englobam (envolvem) um agente invasor ou restos celulares e o destroem no seu interior.",
        "É uma das principais formas de defesa da imunidade inata."
      ],
      gameLink: "Quando o neutrófilo age sobre um invasor no jogo, ele está realizando fagocitose."
    },
    {
      id: "neutrofilo",
      title: "Neutrófilo",
      phase: 1,
      body: [
        "É uma célula da imunidade inata e um dos fagócitos mais numerosos do sangue. Costuma ser o primeiro a chegar em grande quantidade ao local de uma infecção.",
        "Age rápido, mas tem vida curta: depois de atuar, é substituído por novas células."
      ],
      gameLink: "No jogo, o neutrófilo tem alcance limitado, elimina um invasor por vez por fagocitose e desaparece depois de algum tempo em campo — representando sua vida curta."
    },

    /* --- verbetes de fases seguintes (bloqueados na Fase 1) --- */
    { id:"inflamacao", title:"Inflamação", phase:2, locked:true,
      body:["Resposta local de defesa que envolve alterações nos vasos sanguíneos e o recrutamento de células. Mastócitos e basófilos liberam histamina, que aumenta a permeabilidade dos vasos, facilitando a chegada de células de defesa."],
      gameLink:"Na Fase 2, a Inflamação não é uma célula: é uma área que acelera os fagócitos próximos por um tempo — e consome vitalidade do tecido enquanto dura, mostrando que recrutamento tem custo." },
    { id:"macrofago", title:"Macrófago", phase:2, locked:true,
      body:["Fagócito de vida mais longa que o neutrófilo. Além de englobar invasores e restos celulares, participa da apresentação de antígeno, que ajuda a acionar a imunidade adaptativa."],
      gameLink:"Na Fase 2, o macrófago ataca mais devagar que o neutrófilo, mas dura muito mais tempo em campo e suporta mais capturas — representando sua vida mais longa." },
    { id:"celulas-nk", title:"Células NK", phase:3, locked:true,
      body:["Células da imunidade inata que reconhecem e eliminam células do próprio corpo que estão infectadas ou alteradas — e não os vírus livres."],
      gameLink:"Na Fase 3, a defesa Vigilância NK só ataca o inimigo 'célula própria infectada' — nunca vírus livre nem bactéria. Essa célula infectada representa uma célula do corpo já alcançada por um vírus: não entra pelo vaso como os outros invasores, e fagócitos não agem sobre ela — só a vigilância NK resolve." },
    { id:"febre", title:"Febre", phase:3, locked:true,
      body:["Elevação da temperatura do corpo como resposta de defesa. Cria um ambiente menos favorável a muitos patógenos e pode acelerar as respostas de defesa — mas em excesso traz custos ao organismo."],
      gameLink:"Na Fase 3, a Febre é uma habilidade ativável (não uma torre): por um tempo, deixa os invasores mais lentos e as células de defesa um pouco mais rápidas. Usada muitas vezes na mesma fase, tira um pouco de vitalidade do tecido — o 'custo ao organismo'." },
    { id:"linfocito-b", title:"Linfócito B", phase:4, locked:true,
      body:["Célula da imunidade adaptativa. Ao ser ativado contra um antígeno específico, produz anticorpos dirigidos a esse antígeno."],
      gameLink:"Na Fase 4, o Linfócito B precisa de amostras de antígeno (geradas por macrófagos) para ficar disponível. Ao posicioná-lo, você escolhe contra qual patógeno ele age — e só age contra esse. Tem dano cheio até contra a bactéria encapsulada, que resiste à fagocitose direta." },
    { id:"linfocito-t", title:"Linfócito T", phase:4, locked:true,
      body:["Célula da imunidade adaptativa. O linfócito T auxiliar coordena e potencializa outras defesas; o linfócito T citotóxico elimina, de forma específica, células infectadas."],
      gameLink:"Nesta versão do jogo, o Linfócito T representa só a função citotóxica: elimina células próprias infectadas, como a vigilância NK, mas pela via adaptativa e específica ao antígeno (amostras geradas por capturas da vigilância NK). A função auxiliar (coordenar outras defesas) ainda não está representada no jogo." },
    { id:"anticorpos", title:"Anticorpos", phase:4, locked:true,
      body:["Proteínas produzidas pelos linfócitos B, específicas para um antígeno. Podem neutralizar o invasor e marcá-lo para ser destruído por fagocitose."],
      gameLink:"No jogo, o ataque do Linfócito B representa o anticorpo neutralizando e marcando o patógeno (opsonização) — por isso tem dano cheio mesmo contra a cápsula que dificulta a fagocitose direta." },
    { id:"memoria-imunologica", title:"Memória imunológica", phase:5, locked:true,
      body:["Depois de uma primeira exposição a um patógeno, permanecem células de memória. Numa exposição posterior ao mesmo agente, a resposta é mais rápida e mais intensa."],
      gameLink:"Na Fase 5, depois de repetidas capturas do mesmo patógeno, forma-se uma Célula de Memória para ele. A partir daí, o linfócito específico contra esse alvo sai mais barato para posicionar e ataca mais rápido e mais forte — inclusive um que já estava em campo, no instante em que a memória se forma." },
    { id:"linfonodos", title:"Linfonodos", phase:4, locked:true,
      body:["Pequenas estruturas presentes em regiões como pescoço, axilas e virilha. Filtram a linfa e são locais onde os linfócitos são ativados. Podem aumentar de tamanho durante uma infecção."],
      gameLink:"Na Fase 4, o linfonodo aparece como um elemento fixo no mapa (não é um nicho de defesa), representando o local onde essa ativação acontece — perto de onde os linfócitos B e T passam a agir." },
    { id:"vacina", title:"Vacina", phase:6, locked:true,
      body:["Forma de imunidade artificial ativa: apresenta ao organismo um antígeno (sem causar a doença) para que ele desenvolva resposta e memória imunológica."],
      gameLink:"Na Fase 6, o caminho 'vacina' já está no jogo desde a Fase 4: acumular amostras de antígeno e configurar um linfócito B/T específico é, na prática, estimular o próprio organismo a responder — o que leva tempo, mas constrói memória. É a ferramenta certa para prevenir, não para uma emergência em curso." },
    { id:"soro", title:"Soro", phase:6, locked:true,
      body:["Forma de imunidade artificial passiva: fornece anticorpos já prontos. A proteção é imediata, porém temporária, e não gera memória imunológica da mesma forma que uma resposta ativa. Pode ser usado em situações como exposição a venenos e toxinas."],
      gameLink:"Na Fase 6, o Soro é uma habilidade ativável: neutraliza instantaneamente as toxinas presentes em campo. Diferente dos linfócitos, não precisa de amostras de antígeno acumuladas — e não gera memória. É a única forma de lidar com a toxina, que nenhuma torre alcança." },
    { id:"imunidade-passiva-natural", title:"Imunidade passiva natural", phase:6, locked:true,
      body:["Ocorre pela transferência de anticorpos da mãe para o bebê, incluindo pela placenta e pela amamentação."],
      gameLink:"Na Fase 6, um dos interlúdios de decisão trata exatamente desse tema, antes da onda final." }
  ],

  /* ---------------------------------------------------------
     FEEDBACK PEDAGÓGICO (education.js consome estas chaves)
     --------------------------------------------------------- */
  feedback: {
    placeBarrierOk: {
      kind: "good", label: "Defesa eficiente",
      text: "A barreira representa a pele e as mucosas: a primeira linha de defesa, que atua na entrada do organismo. Ela filtra e atrasa parte dos invasores antes que eles alcancem o tecido.",
      tag: "imunidade inata · barreiras"
    },
    placeNeutrophilOk: {
      kind: "good", label: "Defesa eficiente",
      text: "O neutrófilo participa da imunidade inata e realiza fagocitose: engloba e destrói o agente invasor que se aproxima do tecido. Ele age rápido, mas dura pouco tempo em campo.",
      tag: "imunidade inata · fagocitose"
    },
    barrierOnTissue: {
      kind: "warn", label: "Atenção",
      text: "A barreira atua na entrada do organismo. Ela não alcança um invasor que já passou para o tecido — aí o organismo depende de mecanismos internos, como os fagócitos.",
      tag: "onde cada defesa age"
    },
    neutrophilOnSurface: {
      kind: "warn", label: "Atenção",
      text: "Essa defesa age dentro do tecido, não na superfície. Na entrada, quem trabalha são as barreiras físicas e químicas.",
      tag: "onde cada defesa age"
    },
    placeMacrofagoOk: {
      kind: "good", label: "Defesa eficiente",
      text: "O macrófago também realiza fagocitose, como o neutrófilo — mas ataca mais devagar e aguenta muito mais tempo em campo. Ele participa da imunidade inata e, além disso, contribui para acionar a resposta adaptativa mais adiante.",
      tag: "imunidade inata · fagocitose"
    },
    placeInflamacaoOk: {
      kind: "good", label: "Recrutamento ativado",
      text: "A inflamação não ataca: ela acelera os fagócitos próximos por um tempo, representando o recrutamento de células de defesa. Só que isso tem custo — repare que a vitalidade do tecido cai um pouco enquanto ela dura.",
      tag: "inflamação · histamina"
    },
    encapsuladaResist: {
      kind: "info", label: "Nem toda defesa rende o mesmo",
      text: "A cápsula dessa bactéria dificulta a fagocitose direta. Mais fagócitos — ou o reforço da inflamação — ajudam a compensar essa resistência.",
      tag: "bactéria encapsulada · resistência"
    },
    noResource: {
      kind: "warn", label: "Recurso insuficiente",
      text: "O organismo mobiliza defesas de forma controlada. Elimine invasores para conseguir mais recurso — cada abate rende.",
      tag: "recurso de defesa (representação de jogo)"
    },
    firstPhagocytosis: {
      kind: "info", label: "Fagocitose",
      text: "Isso é fagocitose: a célula de defesa englobou o invasor e o destruiu no seu interior.",
      tag: "imunidade inata"
    },
    leak: {
      kind: "warn", label: "O tecido foi atingido",
      text: "Um invasor chegou ao núcleo do tecido. Reforce a defesa interna: um neutrófilo em cada trecho de tecido ajuda a conter quem passa da barreira.",
      tag: "posicionamento"
    },
    earlyRelease: {
      kind: "info", label: "Resposta antecipada",
      text: "Você liberou a onda antes do tempo e recuperou recurso. Decidir rápido é melhor do que só esperar.",
      tag: "bônus de recurso"
    },
    virusVsNeutrophil: {
      kind: "info", label: "Nem toda defesa rende o mesmo",
      text: "Contra a partícula de vírus livre, a fagocitose do neutrófilo é menos eficiente. Mais adiante o organismo contará com anticorpos, mais adequados a esse alvo.",
      tag: "vírus · fagocitose"
    },
    placeNkOk: {
      kind: "good", label: "Defesa eficiente",
      text: "A vigilância NK reconhece células do próprio corpo que foram infectadas ou alteradas — e as elimina. Ela não age sobre vírus livres nem sobre bactérias.",
      tag: "imunidade inata · células NK"
    },
    phagocyteBypassed: {
      kind: "warn", label: "Atenção",
      text: "Fagócitos não reconhecem essa ameaça: uma célula própria infectada não é um agente solto para ser englobado. Essa função é da vigilância NK.",
      tag: "onde cada defesa age"
    },
    feverActivate: {
      kind: "info", label: "Resposta febril",
      text: "A febre eleva a temperatura do corpo, criando um ambiente menos favorável a muitos patógenos e acelerando um pouco a atuação das células de defesa.",
      tag: "resposta sistêmica"
    },
    feverOveruse: {
      kind: "warn", label: "Custo ao organismo",
      text: "Usar a febre repetidamente tem um custo: mais febre não é sempre melhor. O tecido perdeu um pouco de vitalidade por causa do uso excessivo.",
      tag: "febre · custo ao organismo"
    },
    antigenUnlocked: {
      kind: "good", label: "Antígeno reconhecido",
      text: "Amostras suficientes de antígeno de {alvo} — a defesa adaptativa específica contra esse alvo já pode ser configurada.",
      tag: "imunidade adaptativa"
    },
    noAntigenYet: {
      kind: "warn", label: "Ainda sem amostras suficientes",
      text: "Essa defesa específica precisa de amostras de antígeno para ficar disponível: macrófagos geram amostras de patógenos, e a vigilância NK gera amostras de células infectadas.",
      tag: "imunidade adaptativa"
    },
    placeLinfocitoBOk: {
      kind: "good", label: "Defesa eficiente",
      text: "O linfócito B produz anticorpos específicos contra o alvo escolhido. Diferente da fagocitose direta, o anticorpo tem dano cheio até contra a cápsula da bactéria encapsulada.",
      tag: "imunidade adaptativa · linfócito B"
    },
    placeLinfocitoTOk: {
      kind: "good", label: "Defesa eficiente",
      text: "O linfócito T citotóxico elimina células próprias infectadas de forma específica ao antígeno — como a vigilância NK, mas pela via adaptativa.",
      tag: "imunidade adaptativa · linfócito T"
    },
    firstAntibodyHit: {
      kind: "info", label: "Anticorpo",
      text: "O anticorpo se liga ao patógeno e o neutraliza — e pode marcá-lo para ser destruído (opsonização). É uma resposta específica: só funciona contra o antígeno que reconhece.",
      tag: "imunidade adaptativa"
    },
    firstTCellHit: {
      kind: "info", label: "Resposta citotóxica",
      text: "O linfócito T citotóxico reconheceu o antígeno específico dessa célula infectada e a eliminou.",
      tag: "imunidade adaptativa"
    },
    memoryFormed: {
      kind: "good", label: "Memória imunológica formada",
      text: "O organismo já enfrentou {alvo} o suficiente para manter uma Célula de Memória. Se {alvo} voltar, a resposta específica sai mais barata, mais rápida e mais forte.",
      tag: "memória imunológica"
    },
    soroActivate: {
      kind: "good", label: "Soro aplicado",
      text: "Anticorpos prontos neutralizaram a(s) toxina(s) em campo imediatamente. É imunidade passiva artificial: rápida, mas temporária — não fica uma defesa permanente nem memória para a próxima vez.",
      tag: "imunidade passiva · soro"
    },
    soroNoTarget: {
      kind: "info", label: "Nenhuma toxina em campo",
      text: "O soro age imediatamente sobre toxinas presentes agora. Sem nenhuma em campo, não há o que neutralizar — espere a próxima aparecer.",
      tag: "imunidade passiva · soro"
    }
  },

  /* ---------------------------------------------------------
     "O QUE VOCÊ APRENDEU" — fim da Fase 1
     --------------------------------------------------------- */
  learned: {
    1: [
      { k: "Sistema imunitário", v: "é a defesa integrada do organismo, que age em camadas." },
      { k: "Patógenos", v: "vírus e bactérias são agentes que causam doença ao invadir o corpo." },
      { k: "Imunidade inata", v: "é rápida, está sempre pronta e responde igual contra qualquer invasor." },
      { k: "Barreiras", v: "pele, mucosas e secreções atuam na entrada — não no interior do tecido." },
      { k: "Fagocitose", v: "é englobar e destruir o invasor; o neutrófilo faz isso e tem vida curta." }
    ],
    2: [
      { k: "Inflamação", v: "é uma resposta local que recruta células de defesa — não é um ataque, e tem custo para o tecido." },
      { k: "Histamina", v: "liberada por mastócitos e basófilos, aumenta a permeabilidade dos vasos e facilita a chegada de defesas." },
      { k: "Macrófago", v: "também faz fagocitose, mais devagar que o neutrófilo, mas dura muito mais tempo em campo." },
      { k: "Neutrófilo × macrófago", v: "a imunidade inata combina uma resposta rápida e numerosa com uma mais lenta e duradoura." },
      { k: "Limite da fagocitose", v: "uma cápsula bacteriana pode dificultar o englobamento direto — por isso mais de uma defesa trabalhando junto ajuda." }
    ],
    3: [
      { k: "Células NK", v: "reconhecem e eliminam células do próprio corpo já infectadas ou alteradas — não vírus livres." },
      { k: "Célula própria infectada", v: "não é um agente entrando de fora; fagócitos não agem sobre ela — só a vigilância NK resolve." },
      { k: "Febre", v: "é uma resposta sistêmica: dificulta o patógeno e acelera um pouco a defesa." },
      { k: "Custo da febre", v: "usá-la repetidamente tem preço para o organismo — mais febre não é sempre melhor." },
      { k: "Camadas da imunidade inata", v: "barreira, fagocitose, inflamação e vigilância NK agem juntas, cada uma no seu papel." }
    ],
    4: [
      { k: "Antígeno", v: "acumular amostras dele é o que libera uma defesa específica contra aquele patógeno em particular." },
      { k: "Especificidade", v: "um linfócito B ou T configurado contra um patógeno quase não age contra outro — essa é a marca da imunidade adaptativa." },
      { k: "Linfócito B", v: "produz anticorpos; resolve a bactéria encapsulada com dano cheio, onde a fagocitose direta era menos eficiente." },
      { k: "Linfócito T citotóxico", v: "elimina células próprias infectadas de forma específica, ao lado da vigilância NK (inata)." },
      { k: "Linfonodo", v: "é onde a ativação dos linfócitos acontece — por isso pode inchar durante uma infecção." }
    ],
    5: [
      { k: "Memória imunológica", v: "depois de enfrentar bastante um patógeno, o organismo mantém uma Célula de Memória dele." },
      { k: "Segunda exposição", v: "com memória, a resposta específica sai mais barata, mais rápida e mais forte que na primeira vez." },
      { k: "Por que isso importa", v: "é a base de por que o corpo reage melhor a uma doença que já teve — e é a lógica por trás da vacinação." },
      { k: "A memória não é uma torre", v: "é um estado do organismo: até uma defesa já posicionada fica mais eficiente assim que a memória se forma." },
      { k: "Ainda especificidade", v: "a memória de um patógeno não ajuda contra outro — cada um precisa da própria história de exposição." }
    ],
    6: [
      { k: "Soro", v: "imunidade artificial passiva: anticorpos prontos, ação imediata, proteção temporária, sem gerar memória." },
      { k: "Vacina", v: "imunidade artificial ativa: estimula o próprio organismo a responder e a formar memória — leva tempo para agir." },
      { k: "Quando usar cada um", v: "soro serve para emergências já em curso; vacina serve para prevenir antes da exposição." },
      { k: "Imunidade passiva natural", v: "anticorpos da mãe passam para o bebê pela placenta e pela amamentação." },
      { k: "Gerações de vacina", v: "agente inteiro atenuado/inativado, subunidades, ou material genético." },
      { k: "Hábitos e imunidade", v: "alimentação equilibrada, sono e atividade física apoiam o sistema imunitário; megadose isolada de vitamina não substitui isso." }
    ]
  },

  /* ---------------------------------------------------------
     FIM DA CAMPANHA — mostrado só ao concluir a Fase 6
     --------------------------------------------------------- */
  campaignComplete: {
    title: "Campanha concluída — Operação Defesa",
    text: "Você conduziu o organismo da primeira barreira até a resposta adaptativa completa: barreiras físicas e químicas, fagocitose, inflamação, vigilância NK, febre, linfócitos B e T, memória imunológica, e a diferença entre soro e vacina. Isso é o Sistema Imunitário funcionando em camadas — exatamente como no seu próprio corpo."
  },

  /* ---------------------------------------------------------
     INTERLÚDIOS DE DECISÃO — momentos entre ondas, fora do TD.
     Não são pontuados e não têm "game over": servem para discussão,
     não para prova. O bloco "bancada de vacinas" (C1–C3) reproduz
     exatamente a classificação e os exemplos do material da equipe.
     --------------------------------------------------------- */
  interludes: {
    fase6: {
      title: "Central de Decisões",
      intro: "Antes da próxima onda, algumas decisões que não se resolvem com torres — são escolhas sobre como o organismo (ou a medicina) responde a uma ameaça.",
      steps: [
        {
          prompt: "Uma pessoa foi mordida por uma cobra peçonhenta e chega ao hospital com sinais de envenenamento. A equipe médica precisa agir imediatamente. O que fazer?",
          choices: [
            { label: "Aplicar soro antiveneno", correct: true,
              feedback: "Soro é imunidade artificial passiva: fornece anticorpos prontos, com ação imediata — exatamente o que uma emergência como essa exige. A proteção é temporária e não gera memória imunológica da mesma forma que uma resposta ativa." },
            { label: "Aplicar uma vacina", correct: false,
              feedback: "A vacina estimula o próprio organismo a produzir sua resposta — isso leva dias ou semanas. É a ferramenta certa para PREVENIR uma doença antes da exposição, não para tratar uma emergência que já está em curso." },
            { label: "Aguardar a resposta natural do organismo", correct: false,
              feedback: "Sem soro, o organismo levaria tempo demais para montar uma resposta específica contra o veneno — tempo que, numa emergência como essa, pode ser crítico." }
          ]
        },
        {
          prompt: "Bebês nos primeiros meses de vida têm proteção contra diversos agentes mesmo sem terem sido expostos a eles antes. Por quê?",
          choices: [
            { label: "Recebem anticorpos da mãe, pela placenta e pela amamentação", correct: true,
              feedback: "Isso é imunidade passiva natural: anticorpos maternos atravessam a placenta durante a gestação e continuam sendo transferidos pelo leite, protegendo o bebê enquanto o sistema imunitário dele ainda está se desenvolvendo." },
            { label: "Já nascem com memória imunológica própria", correct: false,
              feedback: "A memória imunológica própria vem de exposições reais (ou de vacinação) ao longo da vida — um recém-nascido ainda não teve tempo de desenvolvê-la. A proteção inicial vem de fora: da mãe." },
            { label: "Bebês não são alvo de patógenos", correct: false,
              feedback: "Bebês podem sim ser infectados — por isso a proteção inicial via anticorpos maternos é tão importante nesses primeiros meses." }
          ]
        },
        {
          prompt: "Bancada de vacinas — a vacina contra a febre amarela é geralmente citada como exemplo de qual geração?",
          choices: [
            { label: "1ª geração — agente inteiro atenuado ou inativado", correct: true,
              feedback: "Vacinas de 1ª geração usam o agente inteiro, atenuado ou inativado. Febre amarela e sarampo são citadas como exemplos no material da equipe." },
            { label: "2ª geração — subunidades ou fragmentos", correct: false,
              feedback: "Subunidades/fragmentos são a 2ª geração. A febre amarela é citada como exemplo de 1ª geração (agente inteiro atenuado) no material da equipe." },
            { label: "3ª geração — material genético (DNA/RNA)", correct: false,
              feedback: "Material genético é a 3ª geração. A febre amarela é citada como exemplo de 1ª geração (agente inteiro atenuado) no material da equipe." }
          ]
        },
        {
          prompt: "E as vacinas contra HPV e meningite — geralmente citadas como exemplo de qual geração?",
          choices: [
            { label: "2ª geração — subunidades, proteínas ou fragmentos", correct: true,
              feedback: "Vacinas de 2ª geração usam subunidades do agente, não o agente inteiro. HPV e meningite são citadas como exemplos no material da equipe." },
            { label: "1ª geração — agente inteiro atenuado ou inativado", correct: false,
              feedback: "Agente inteiro é a 1ª geração. HPV e meningite são citadas como exemplos de 2ª geração (subunidades) no material da equipe." },
            { label: "3ª geração — material genético (DNA/RNA)", correct: false,
              feedback: "Material genético é a 3ª geração. HPV e meningite são citadas como exemplos de 2ª geração (subunidades) no material da equipe." }
          ]
        },
        {
          prompt: "E a vacina contra a COVID-19 (as de mRNA) — exemplo de qual geração?",
          choices: [
            { label: "3ª geração — utiliza ou manipula material genético (DNA/RNA)", correct: true,
              feedback: "Vacinas de 3ª geração utilizam ou manipulam informação genética. As vacinas de mRNA contra a COVID-19 são o exemplo citado no material da equipe." },
            { label: "1ª geração — agente inteiro atenuado ou inativado", correct: false,
              feedback: "Agente inteiro é a 1ª geração. A vacina de mRNA contra a COVID-19 é citada como exemplo de 3ª geração (material genético) no material da equipe." },
            { label: "2ª geração — subunidades ou fragmentos", correct: false,
              feedback: "Subunidades são a 2ª geração. A vacina de mRNA contra a COVID-19 é citada como exemplo de 3ª geração (material genético) no material da equipe." }
          ]
        },
        {
          prompt: "#FicaADica — um mito comum é que tomar doses extras de vitamina C, isoladamente, \"aumenta a imunidade\". Isso é preciso?",
          choices: [
            { label: "Não — hábitos saudáveis no conjunto é que apoiam o sistema imunitário", correct: true,
              feedback: "O sistema imunitário depende do funcionamento equilibrado do organismo como um todo — alimentação variada, sono adequado e atividade física regular. Excesso de vitaminas (especialmente as lipossolúveis, como A, D, E, K) pode até ser prejudicial. Não existe um único nutriente que, isolado, 'aumenta' a imunidade." },
            { label: "Sim — quanto mais vitamina C, melhor a imunidade", correct: false,
              feedback: "Esse é um mito comum. Consumir mais vitamina C do que o organismo usa não 'turbina' a imunidade — o excesso é eliminado ou, no caso de vitaminas lipossolúveis, pode se acumular de forma prejudicial. O que apoia o sistema imunitário é o equilíbrio: alimentação variada, sono e atividade física." }
          ]
        }
      ]
    }
  }
};

if (typeof window !== "undefined") window.IMUNOQUEST_CONTENT = IMUNOQUEST_CONTENT;
