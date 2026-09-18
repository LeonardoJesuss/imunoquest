/* ============================================================
   levels.js — definição das fases (dados, não lógica).
   Coordenadas no espaço lógico do campo: 960 x 600.
   A Fase 1 é a única implementada nesta versão (vertical slice).
   As demais fases estão descritas para orientar a continuação.
   ============================================================ */

const LEVELS = {
  1: {
    id: 1,
    name: "Fase 1 — A Primeira Barreira",
    concept: "imunidade-inata",
    startResource: 90,   // sem regeneração passiva — só abates rendem recurso (ver towers/enemies resourceReward)
    tissue: 100,
    towers: ["barreira", "neutrofilo", "macrofago"],

    path: [
      { x: -30, y: 210 },
      { x: 150, y: 210 },
      { x: 300, y: 300 },
      { x: 470, y: 375 },
      { x: 640, y: 405 },
      { x: 800, y: 455 },
      { x: 872, y: 505 }
    ],

    slots: [
      { id: "s1", x: 150, y: 150, type: "surface", label: "superfície" },
      { id: "s2", x: 150, y: 272, type: "surface", label: "superfície" },
      { id: "t1", x: 322, y: 250, type: "tissue", label: "tecido" },
      { id: "t2", x: 470, y: 445, type: "tissue", label: "tecido" },
      { id: "t3", x: 648, y: 336, type: "tissue", label: "tecido" },
      { id: "t4", x: 770, y: 512, type: "tissue", label: "tecido" }
    ],

    briefings: {
      1: "Bactérias estão entrando pelo vaso. O tecido só conta com a imunidade inata. Comece protegendo a entrada.",
      2: "Mais bactérias — e as primeiras partículas de vírus, mais rápidas. A barreira ajuda na entrada; e no tecido?",
      3: "Muitos vírus nesta onda. Eles passam rápido pela barreira: você vai precisar de defesa interna para contê-los.",
      4: "Onda mista e mais numerosa. Distribua as defesas ao longo do caminho — não deixe nenhum trecho sem cobertura.",
      5: "Última onda: bactérias e vírus juntos, em grande número. Use tudo o que aprendeu sobre onde cada defesa age."
    },

    waves: [
      { spawns: [{ type: "bacteria", count: 3, gap: 1.8, delay: 0 }] },
      { spawns: [{ type: "bacteria", count: 4, gap: 1.6, delay: 0 },
                 { type: "virus", count: 2, gap: 1.8, delay: 4.0 }] },
      { spawns: [{ type: "bacteria", count: 3, gap: 1.8, delay: 0 },
                 { type: "virus", count: 4, gap: 1.4, delay: 3.0 }] },
      { spawns: [{ type: "bacteria", count: 5, gap: 1.4, delay: 0 },
                 { type: "virus", count: 3, gap: 1.5, delay: 4.5 }] },
      { spawns: [{ type: "bacteria", count: 6, gap: 1.2, delay: 0 },
                 { type: "virus", count: 4, gap: 1.3, delay: 3.0 }] }
    ]
  },

  2: {
    id: 2,
    name: "Fase 2 — Alarme e Fagocitose",
    concept: "inflamacao",
    startResource: 105,
    tissue: 100,
    towers: ["barreira", "neutrofilo", "macrofago", "inflamacao"],

    path: [
      { x: -30, y: 130 },
      { x: 180, y: 130 },
      { x: 260, y: 280 },
      { x: 460, y: 320 },
      { x: 540, y: 160 },
      { x: 740, y: 140 },
      { x: 820, y: 340 },
      { x: 872, y: 505 }
    ],

    slots: [
      { id: "s1", x: 180, y: 68, type: "surface", label: "superfície" },
      { id: "s2", x: 180, y: 192, type: "surface", label: "superfície" },
      { id: "t1", x: 330, y: 300, type: "tissue", label: "tecido" },
      { id: "t2", x: 500, y: 232, type: "tissue", label: "tecido" },
      { id: "t3", x: 655, y: 116, type: "tissue", label: "tecido" },
      { id: "t4", x: 792, y: 258, type: "tissue", label: "tecido" },
      { id: "t5", x: 838, y: 440, type: "tissue", label: "tecido" }
    ],

    briefings: {
      1: "O tecido agora conta com o macrófago e com a inflamação, além do que você já conhece. Comece como antes: barreira na entrada, fagócitos no tecido.",
      2: "Chegou a primeira bactéria encapsulada: a cápsula dificulta a fagocitose direta. Mais de um fagócito no mesmo trecho ajuda a compensar.",
      3: "Onda pesada, com vírus e bactérias encapsuladas juntos. Considere ativar a inflamação num trecho crítico — ela acelera os fagócitos, mas custa vitalidade ao tecido.",
      4: "Onda longa e mista. Distribua barreira, neutrófilos e macrófagos — o macrófago demora mais para atacar, mas aguenta muito mais tempo em campo.",
      5: "Onda final da fase: todos os tipos de invasor juntos, em grande número. Use a inflamação com critério — o benefício tem preço."
    },

    waves: [
      { spawns: [{ type: "bacteria", count: 4, gap: 1.6, delay: 0 },
                 { type: "virus", count: 2, gap: 1.8, delay: 4.0 }] },
      { spawns: [{ type: "bacteria", count: 3, gap: 1.7, delay: 0 },
                 { type: "bacteria_encapsulada", count: 2, gap: 2.2, delay: 3.0 },
                 { type: "virus", count: 2, gap: 1.6, delay: 6.0 }] },
      { spawns: [{ type: "bacteria_encapsulada", count: 3, gap: 2.0, delay: 0 },
                 { type: "virus", count: 4, gap: 1.3, delay: 2.5 },
                 { type: "bacteria", count: 3, gap: 1.5, delay: 5.0 }] },
      { spawns: [{ type: "bacteria", count: 5, gap: 1.3, delay: 0 },
                 { type: "bacteria_encapsulada", count: 3, gap: 1.9, delay: 3.0 },
                 { type: "virus", count: 4, gap: 1.3, delay: 6.0 }] },
      { spawns: [{ type: "bacteria", count: 6, gap: 1.2, delay: 0 },
                 { type: "bacteria_encapsulada", count: 4, gap: 1.8, delay: 3.0 },
                 { type: "virus", count: 5, gap: 1.1, delay: 5.5 }] }
    ]
  },

  3: {
    id: 3,
    name: "Fase 3 — Vigilância e Febre",
    concept: "celulas-nk",
    startResource: 115,
    tissue: 100,
    towers: ["barreira", "neutrofilo", "macrofago", "inflamacao", "vigilancia_nk"],

    /* febre: habilidade sistêmica ativável, não ocupa nicho.
       speedMult/buffMult < 1 = mais rápido; strainThreshold = usos "de graça"
       antes de a febre repetida custar vitalidade ao tecido. */
    fever: { cost: 25, duration: 12, cooldown: 30, speedMult: 0.8, buffMult: 0.85, strainThreshold: 2, strainCost: 6 },

    path: [
      { x: -30, y: 260 },
      { x: 170, y: 260 },
      { x: 260, y: 120 },
      { x: 470, y: 100 },
      { x: 560, y: 300 },
      { x: 760, y: 360 },
      { x: 872, y: 505 }
    ],

    slots: [
      { id: "s1", x: 170, y: 198, type: "surface", label: "superfície" },
      { id: "s2", x: 170, y: 322, type: "surface", label: "superfície" },
      { id: "t1", x: 330, y: 150, type: "tissue", label: "tecido" },
      { id: "t2", x: 470, y: 190, type: "tissue", label: "tecido" },
      { id: "t3", x: 600, y: 250, type: "tissue", label: "tecido" },
      { id: "t4", x: 700, y: 400, type: "tissue", label: "tecido" },
      { id: "t5", x: 820, y: 460, type: "tissue", label: "tecido" }
    ],

    briefings: {
      1: "Agora o tecido conta com a Vigilância NK e com a Febre, além de tudo que você já conhece. Comece como sempre — mas fique atento: nem todo invasor vem pelo vaso.",
      2: "Uma célula do próprio corpo foi infectada. Ela não passa pela barreira e fagócitos não a reconhecem — só a Vigilância NK resolve essa ameaça.",
      3: "Mais células infectadas nesta onda, junto de vírus e bactérias. Considere ativar a febre num momento difícil: ela é sistêmica, afeta o campo inteiro.",
      4: "Onda longa e pesada. Distribua Vigilância NK perto de onde as células infectadas tendem a passar — elas não vêm da entrada.",
      5: "Onda final: todos os tipos de ameaça juntos. Use a febre com critério — usá-la muitas vezes nesta fase tem custo para o tecido."
    },

    waves: [
      { spawns: [{ type: "virus", count: 3, gap: 1.6, delay: 0 },
                 { type: "bacteria_encapsulada", count: 2, gap: 2.0, delay: 4.0 },
                 { type: "celula_infectada", count: 1, gap: 1, delay: 9.0 }] },
      { spawns: [{ type: "celula_infectada", count: 2, gap: 3.0, delay: 0 },
                 { type: "virus", count: 3, gap: 1.4, delay: 3.0 },
                 { type: "bacteria_encapsulada", count: 2, gap: 1.8, delay: 7.0 }] },
      { spawns: [{ type: "celula_infectada", count: 3, gap: 2.6, delay: 0 },
                 { type: "virus", count: 4, gap: 1.3, delay: 2.5 },
                 { type: "bacteria_encapsulada", count: 2, gap: 1.7, delay: 8.0 }] },
      { spawns: [{ type: "celula_infectada", count: 3, gap: 2.4, delay: 0 },
                 { type: "bacteria_encapsulada", count: 3, gap: 1.7, delay: 3.0 },
                 { type: "virus", count: 5, gap: 1.2, delay: 6.0 }] },
      { spawns: [{ type: "celula_infectada", count: 4, gap: 2.2, delay: 0 },
                 { type: "virus", count: 6, gap: 1.1, delay: 3.0 },
                 { type: "bacteria_encapsulada", count: 4, gap: 1.6, delay: 6.0 }] }
    ]
  },

  4: {
    id: 4,
    name: "Fase 4 — Defesa Especializada",
    concept: "linfocito-b",
    startResource: 130,
    tissue: 100,
    towers: ["barreira", "neutrofilo", "macrofago", "inflamacao", "vigilancia_nk", "linfocito_b", "linfocito_t"],

    fever: { cost: 25, duration: 12, cooldown: 30, speedMult: 0.8, buffMult: 0.85, strainThreshold: 2, strainCost: 6 },

    /* elemento fixo do mapa (não interativo) — reforça o OE4 (linfonodo) */
    landmark: { x: 130, y: 470, label: "Linfonodo" },

    path: [
      { x: -30, y: 200 },
      { x: 200, y: 200 },
      { x: 280, y: 400 },
      { x: 480, y: 440 },
      { x: 560, y: 220 },
      { x: 760, y: 180 },
      { x: 872, y: 505 }
    ],

    slots: [
      { id: "s1", x: 200, y: 138, type: "surface", label: "superfície" },
      { id: "s2", x: 200, y: 262, type: "surface", label: "superfície" },
      { id: "t1", x: 340, y: 370, type: "tissue", label: "tecido" },
      { id: "t2", x: 460, y: 340, type: "tissue", label: "tecido" },
      { id: "t3", x: 540, y: 280, type: "tissue", label: "tecido" },
      { id: "t4", x: 660, y: 180, type: "tissue", label: "tecido" },
      { id: "t5", x: 770, y: 300, type: "tissue", label: "tecido" },
      { id: "t6", x: 840, y: 460, type: "tissue", label: "tecido" }
    ],

    briefings: {
      1: "O tecido agora reconhece antígenos: cada vez que um macrófago ou a vigilância NK vencem um invasor, o organismo acumula amostras. Comece com o que já conhece — os linfócitos B e T vêm em seguida.",
      2: "Amostras suficientes já podem liberar uma defesa específica. Ao selecionar o Linfócito B, escolha contra qual patógeno ele age — cada um é específico a um único alvo.",
      3: "Uma bactéria encapsulada, que resiste à fagocitose direta, pode ser derrotada com dano cheio por um Linfócito B configurado contra ela — a especificidade adaptativa em ação.",
      4: "O Linfócito T citotóxico é outra opção contra células próprias infectadas, ao lado da vigilância NK. Onda longa e pesada: combine imunidade inata e adaptativa.",
      5: "Onda final: todos os tipos de ameaça juntos, em grande número. Use tudo o que o organismo aprendeu a reconhecer até aqui."
    },

    waves: [
      { spawns: [{ type: "bacteria", count: 3, gap: 1.7, delay: 0 },
                 { type: "virus", count: 2, gap: 1.8, delay: 4.0 }] },
      { spawns: [{ type: "bacteria_encapsulada", count: 2, gap: 2.2, delay: 0 },
                 { type: "celula_infectada", count: 1, gap: 1, delay: 5.0 },
                 { type: "virus", count: 2, gap: 1.6, delay: 7.0 }] },
      { spawns: [{ type: "bacteria_encapsulada", count: 3, gap: 2.0, delay: 0 },
                 { type: "celula_infectada", count: 2, gap: 2.6, delay: 3.0 },
                 { type: "bacteria", count: 2, gap: 1.6, delay: 8.0 },
                 { type: "virus", count: 3, gap: 1.4, delay: 9.5 }] },
      { spawns: [{ type: "bacteria_encapsulada", count: 3, gap: 1.8, delay: 0 },
                 { type: "celula_infectada", count: 3, gap: 2.4, delay: 3.0 },
                 { type: "virus", count: 4, gap: 1.3, delay: 8.0 },
                 { type: "bacteria", count: 3, gap: 1.4, delay: 11.0 }] },
      { spawns: [{ type: "bacteria", count: 5, gap: 1.2, delay: 0 },
                 { type: "bacteria_encapsulada", count: 4, gap: 1.6, delay: 3.0 },
                 { type: "celula_infectada", count: 4, gap: 2.2, delay: 6.0 },
                 { type: "virus", count: 5, gap: 1.1, delay: 9.0 }] }
    ]
  },

  5: {
    id: 5,
    name: "Fase 5 — O Inimigo Retorna",
    concept: "memoria-imunologica",
    startResource: 140,
    tissue: 100,
    towers: ["barreira", "neutrofilo", "macrofago", "inflamacao", "vigilancia_nk", "linfocito_b", "linfocito_t"],

    fever: { cost: 25, duration: 12, cooldown: 30, speedMult: 0.8, buffMult: 0.85, strainThreshold: 2, strainCost: 6 },
    landmark: { x: 150, y: 480, label: "Linfonodo" },

    path: [
      { x: -30, y: 160 },
      { x: 190, y: 160 },
      { x: 250, y: 340 },
      { x: 420, y: 380 },
      { x: 500, y: 180 },
      { x: 640, y: 140 },
      { x: 740, y: 340 },
      { x: 872, y: 505 }
    ],

    slots: [
      { id: "s1", x: 190, y: 98, type: "surface", label: "superfície" },
      { id: "s2", x: 190, y: 222, type: "surface", label: "superfície" },
      { id: "t1", x: 320, y: 370, type: "tissue", label: "tecido" },
      { id: "t2", x: 460, y: 300, type: "tissue", label: "tecido" },
      { id: "t3", x: 560, y: 150, type: "tissue", label: "tecido" },
      { id: "t4", x: 690, y: 200, type: "tissue", label: "tecido" },
      { id: "t5", x: 790, y: 400, type: "tissue", label: "tecido" },
      { id: "t6", x: 840, y: 460, type: "tissue", label: "tecido" }
    ],

    /* narrativa das ondas: a bactéria encapsulada e a célula infectada
       aparecem cedo ("primeira exposição") e voltam com força nas ondas
       finais ("o inimigo retorna") — se o jogador gerou amostras
       suficientes nas primeiras ondas, a memória já estará pronta. */
    briefings: {
      1: "Primeira exposição da fase: bactérias, vírus, uma bactéria encapsulada e uma célula infectada. Combata como já sabe — cada captura conta para o organismo lembrar do agente.",
      2: "Mais bactérias encapsuladas e células infectadas. Quanto mais o macrófago e a vigilância NK capturarem, mais perto o organismo fica de formar memória contra cada uma.",
      3: "Onda pesada, com os dois tipos que já apareceram nesta fase. Se a memória já se formou para algum deles, um linfócito específico contra esse alvo sai mais barato e ataca mais rápido.",
      4: "A bactéria encapsulada está de volta — em maior número que na primeira vez. Observe a diferença se você já tem memória formada contra ela.",
      5: "Onda final: a célula infectada também retorna, junto de tudo o mais. Use o que o organismo já aprendeu a reconhecer nesta fase."
    },

    waves: [
      { spawns: [{ type: "bacteria", count: 3, gap: 1.7, delay: 0 },
                 { type: "virus", count: 2, gap: 1.8, delay: 4.0 },
                 { type: "bacteria_encapsulada", count: 2, gap: 2.0, delay: 7.0 },
                 { type: "celula_infectada", count: 1, gap: 1, delay: 11.0 }] },
      { spawns: [{ type: "bacteria_encapsulada", count: 3, gap: 1.9, delay: 0 },
                 { type: "celula_infectada", count: 2, gap: 2.6, delay: 3.0 },
                 { type: "virus", count: 2, gap: 1.6, delay: 8.0 }] },
      { spawns: [{ type: "bacteria_encapsulada", count: 3, gap: 1.8, delay: 0 },
                 { type: "celula_infectada", count: 3, gap: 2.4, delay: 3.0 },
                 { type: "bacteria", count: 2, gap: 1.6, delay: 9.0 },
                 { type: "virus", count: 3, gap: 1.4, delay: 10.5 }] },
      { spawns: [{ type: "bacteria_encapsulada", count: 6, gap: 1.4, delay: 0 },
                 { type: "virus", count: 3, gap: 1.4, delay: 8.0 },
                 { type: "bacteria", count: 2, gap: 1.5, delay: 11.0 }] },
      { spawns: [{ type: "celula_infectada", count: 5, gap: 1.8, delay: 0 },
                 { type: "bacteria_encapsulada", count: 3, gap: 1.6, delay: 4.0 },
                 { type: "virus", count: 5, gap: 1.1, delay: 8.0 },
                 { type: "bacteria", count: 4, gap: 1.2, delay: 11.5 }] }
    ]
  },

  6: {
    id: 6,
    name: "Fase 6 — Operação Defesa",
    concept: "soro",
    startResource: 150,
    tissue: 100,
    towers: ["barreira", "neutrofilo", "macrofago", "inflamacao", "vigilancia_nk", "linfocito_b", "linfocito_t"],

    fever: { cost: 25, duration: 12, cooldown: 30, speedMult: 0.8, buffMult: 0.85, strainThreshold: 2, strainCost: 6 },
    soro: { cost: 30, cooldown: 25 },
    landmark: { x: 130, y: 470, label: "Linfonodo" },

    /* depois da onda 3, um interlúdio de decisão (soro × vacina, imunidade
       passiva natural, bancada de vacinas, #FicaADica) — não é TD, não é
       pontuado, não tem "errar e perder". Ver IMUNOQUEST_CONTENT.interludes.fase6 */
    interludeAfterWave: 3,
    interlude: "fase6",

    path: [
      { x: -30, y: 220 },
      { x: 180, y: 220 },
      { x: 260, y: 380 },
      { x: 460, y: 420 },
      { x: 560, y: 200 },
      { x: 700, y: 160 },
      { x: 780, y: 380 },
      { x: 872, y: 505 }
    ],

    slots: [
      { id: "s1", x: 180, y: 158, type: "surface", label: "superfície" },
      { id: "s2", x: 180, y: 282, type: "surface", label: "superfície" },
      { id: "t1", x: 340, y: 400, type: "tissue", label: "tecido" },
      { id: "t2", x: 470, y: 330, type: "tissue", label: "tecido" },
      { id: "t3", x: 580, y: 150, type: "tissue", label: "tecido" },
      { id: "t4", x: 700, y: 220, type: "tissue", label: "tecido" },
      { id: "t5", x: 800, y: 340, type: "tissue", label: "tecido" },
      { id: "t6", x: 840, y: 460, type: "tissue", label: "tecido" }
    ],

    briefings: {
      1: "Operação Defesa: todos os tipos de invasor que você já enfrentou podem aparecer. Comece como sempre — barreira na entrada, fagócitos e vigilância no tecido.",
      2: "Uma toxina apareceu — nenhuma torre a alcança. Ative o Soro (painel de defesas) para neutralizá-la imediatamente. Ele não constrói memória: é preciso reaplicar a cada vez.",
      3: "Onda mista pesada, com mais uma toxina. Depois desta onda, uma pausa para decisões que não se resolvem com torres.",
      4: "De volta à ação: use o que foi discutido. Onda longa com toxinas, células infectadas e bactérias encapsuladas juntas.",
      5: "Onda final da campanha: todos os tipos de ameaça, em grande número, incluindo toxinas. Combine tudo o que o organismo aprendeu até aqui."
    },

    waves: [
      { spawns: [{ type: "bacteria", count: 3, gap: 1.7, delay: 0 },
                 { type: "virus", count: 2, gap: 1.8, delay: 4.0 },
                 { type: "bacteria_encapsulada", count: 2, gap: 2.0, delay: 7.0 },
                 { type: "celula_infectada", count: 1, gap: 1, delay: 11.0 }] },
      { spawns: [{ type: "bacteria_encapsulada", count: 2, gap: 2.0, delay: 0 },
                 { type: "celula_infectada", count: 2, gap: 2.6, delay: 3.0 },
                 { type: "virus", count: 2, gap: 1.6, delay: 8.0 },
                 { type: "toxina", count: 1, gap: 1, delay: 11.5 }] },
      { spawns: [{ type: "bacteria", count: 3, gap: 1.7, delay: 0 },
                 { type: "bacteria_encapsulada", count: 2, gap: 1.9, delay: 3.0 },
                 { type: "celula_infectada", count: 2, gap: 2.4, delay: 6.0 },
                 { type: "toxina", count: 1, gap: 1, delay: 9.5 },
                 { type: "virus", count: 3, gap: 1.4, delay: 11.0 }] },
      { spawns: [{ type: "bacteria_encapsulada", count: 3, gap: 1.7, delay: 0 },
                 { type: "celula_infectada", count: 3, gap: 2.2, delay: 3.0 },
                 { type: "toxina", count: 2, gap: 6, delay: 6.0 },
                 { type: "virus", count: 4, gap: 1.3, delay: 14.0 }] },
      { spawns: [{ type: "bacteria", count: 4, gap: 1.3, delay: 0 },
                 { type: "bacteria_encapsulada", count: 3, gap: 1.6, delay: 3.0 },
                 { type: "celula_infectada", count: 3, gap: 2.0, delay: 6.0 },
                 { type: "toxina", count: 2, gap: 6, delay: 9.0 },
                 { type: "virus", count: 4, gap: 1.1, delay: 12.0 }] }
    ]
  }
};

/* pré-cálculo dos segmentos do caminho (comprimento acumulado) */
function buildPath(points) {
  const segs = [];
  let total = 0;
  for (let i = 0; i < points.length - 1; i++) {
    const a = points[i], b = points[i + 1];
    const len = Math.hypot(b.x - a.x, b.y - a.y);
    segs.push({ a, b, len, start: total });
    total += len;
  }
  return { segs, total };
}

/* posição (x,y) e ângulo a uma distância d do início do caminho */
function pointAtDistance(path, d) {
  d = Math.max(0, Math.min(d, path.total));
  for (const s of path.segs) {
    if (d <= s.start + s.len) {
      const f = (d - s.start) / s.len;
      return {
        x: s.a.x + (s.b.x - s.a.x) * f,
        y: s.a.y + (s.b.y - s.a.y) * f,
        angle: Math.atan2(s.b.y - s.a.y, s.b.x - s.a.x)
      };
    }
  }
  const last = path.segs[path.segs.length - 1];
  return { x: last.b.x, y: last.b.y, angle: 0 };
}

if (typeof window !== "undefined") {
  window.LEVELS = LEVELS;
  window.buildPath = buildPath;
  window.pointAtDistance = pointAtDistance;
}
