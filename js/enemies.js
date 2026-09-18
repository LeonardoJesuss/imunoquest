/* ============================================================
   enemies.js — tipos de agentes invasores (patógenos).
   As diferenças entre eles servem para ensinar, não são só "HP diferente":
   - bactéria: mais resistente, mais lenta — alvo típico de fagocitose.
   - vírus (partícula livre): rápido e frágil; a barreira o contém bem na
     entrada e a fagocitose é menos eficiente contra ele.
   - bactéria encapsulada (Fase 2): a cápsula dificulta a fagocitose direta
     — o jogador precisa compensar com mais fagócitos ou com o
     reforço da inflamação, não existe uma defesa "impossível de furar".
   - célula própria infectada (Fase 3): só a vigilância NK/linfócito T resolvem.
   - toxina (Fase 6): não é um patógeno vivo. Nenhuma torre a alcança — só
     o Soro (habilidade sistêmica, imunidade passiva artificial imediata)
     a neutraliza. É a única ameaça verdadeiramente "de torre nenhuma",
     de propósito: representa uma emergência onde vacina não serve.
   ============================================================ */

const ENEMY_TYPES = {
  bacteria: {
    id: "bacteria",
    name: "Bactéria",
    maxHp: 30,
    speed: 30,          // px lógicos por segundo
    radius: 12,
    coreDamage: 7,
    resourceReward: 5,
    barrierBlockChance: 0.5,
    phagocytosisDamageMult: 1.0,
    draw(ctx, e) {
      const hurt = e.slowUntil > e._now;
      const t = e._now || 0;
      const bend = Math.sin(t * 3 + e.x * 0.05) * 2.4;   // ondulação leve do bastonete
      ctx.save();
      ctx.translate(e.x, e.y);
      ctx.rotate(e.angle || 0);
      /* bastonete orgânico: contorno curvo, não um retângulo */
      ctx.fillStyle = "#a9ad4c";
      ctx.strokeStyle = "#5c611f";
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(-13, -5.5);
      ctx.quadraticCurveTo(0, -7.5 + bend * 0.3, 13, -5.5);
      ctx.quadraticCurveTo(15.5, 0, 13, 5.5);
      ctx.quadraticCurveTo(0, 7.5 - bend * 0.3, -13, 5.5);
      ctx.quadraticCurveTo(-15.5, 0, -13, -5.5);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      /* organelos internos, para textura biológica */
      ctx.fillStyle = "rgba(92,97,31,.55)";
      [[-5, -1, 2], [1, 1.5, 1.7], [6, -0.5, 1.5]].forEach(([x, y, r]) => {
        ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
      });
      /* flagelo curto */
      ctx.strokeStyle = "#5c611f"; ctx.lineWidth = 1.1;
      ctx.beginPath();
      ctx.moveTo(13.5, 0);
      ctx.quadraticCurveTo(18, bend, 21, -bend * 0.6);
      ctx.stroke();
      if (hurt) {
        ctx.strokeStyle = "rgba(247,233,226,.85)";
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.arc(0, 0, 18, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.restore();
    }
  },

  virus: {
    id: "virus",
    name: "Vírus",
    maxHp: 16,
    speed: 46,
    radius: 10,
    coreDamage: 5,
    resourceReward: 4,
    barrierBlockChance: 0.75,
    phagocytosisDamageMult: 0.6,   // fagocitose menos eficiente vs partícula livre
    draw(ctx, e) {
      const hurt = e.slowUntil > e._now;
      const spin = (e._now || 0) * 1.1;
      ctx.save();
      ctx.translate(e.x, e.y);
      ctx.rotate(spin);
      /* cápside — corpo redondo frio, contrastando com o tecido quente */
      ctx.fillStyle = "#5f6dcf";
      ctx.strokeStyle = "#333d7a";
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.arc(0, 0, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      /* espículas com ponta arredondada — glicoproteínas, não "lasers" */
      for (let i = 0; i < 7; i++) {
        const a = (i / 7) * Math.PI * 2;
        const bx = Math.cos(a) * 8, by = Math.sin(a) * 8;
        const tx = Math.cos(a) * 13.5, ty = Math.sin(a) * 13.5;
        ctx.strokeStyle = "#333d7a"; ctx.lineWidth = 1.6;
        ctx.beginPath(); ctx.moveTo(bx, by); ctx.lineTo(tx, ty); ctx.stroke();
        ctx.fillStyle = "#8892e0";
        ctx.beginPath(); ctx.arc(tx, ty, 1.8, 0, Math.PI * 2); ctx.fill();
      }
      /* material genético estilizado no centro */
      ctx.fillStyle = "#333d7a";
      ctx.beginPath();
      ctx.arc(0, 0, 3, 0, Math.PI * 2);
      ctx.fill();
      if (hurt) {
        ctx.strokeStyle = "rgba(247,233,226,.85)";
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.arc(0, 0, 16, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.restore();
    }
  },

  bacteria_encapsulada: {
    id: "bacteria_encapsulada",
    name: "Bactéria encapsulada",
    maxHp: 46,
    speed: 25,
    radius: 13,
    coreDamage: 10,
    resourceReward: 7,
    barrierBlockChance: 0.28,
    phagocytosisDamageMult: 0.55,   // a cápsula dificulta o englobamento direto
    draw(ctx, e) {
      const hurt = e.slowUntil > e._now;
      const bend = Math.sin((e._now || 0) * 3 + e.x * 0.05) * 2.4;
      ctx.save();
      ctx.translate(e.x, e.y);
      ctx.rotate(e.angle || 0);
      /* halo translúcido da cápsula — sem tracejado, um "envelope" visível ao redor do mesmo bastonete */
      ctx.fillStyle = "rgba(200,217,143,.22)";
      ctx.beginPath(); ctx.ellipse(0, 0, 19, 12.5, 0, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = "rgba(200,217,143,.5)"; ctx.lineWidth = 1.4;
      ctx.beginPath(); ctx.ellipse(0, 0, 19, 12.5, 0, 0, Math.PI * 2); ctx.stroke();
      ctx.fillStyle = "#a9ad4c";
      ctx.strokeStyle = "#5c611f";
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(-13, -5.5);
      ctx.quadraticCurveTo(0, -7.5 + bend * 0.3, 13, -5.5);
      ctx.quadraticCurveTo(15.5, 0, 13, 5.5);
      ctx.quadraticCurveTo(0, 7.5 - bend * 0.3, -13, 5.5);
      ctx.quadraticCurveTo(-15.5, 0, -13, -5.5);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = "rgba(92,97,31,.55)";
      [[-5, -1, 2], [1, 1.5, 1.7], [6, -0.5, 1.5]].forEach(([x, y, r]) => {
        ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
      });
      if (hurt) {
        ctx.strokeStyle = "rgba(247,233,226,.85)";
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.arc(0, 0, 22, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.restore();
    }
  },

  /* Célula própria infectada: não é um agente entrando pelo vaso — é uma célula
     do corpo já alcançada por um vírus. Por isso "nasce" adiantada no caminho
     (spawnProgress) em vez de vir da entrada, não é filtrada por barreira
     (bypassesBarrier) e fagócitos não agem sobre ela (phagocytosisImmune):
     fagocitose combate agentes fora das células, não células já infectadas.
     Só a vigilância NK reconhece e elimina esse tipo de ameaça. */
  celula_infectada: {
    id: "celula_infectada",
    name: "Célula própria infectada",
    maxHp: 60,
    speed: 20,
    radius: 14,
    coreDamage: 14,
    resourceReward: 9,
    barrierBlockChance: 0,
    phagocytosisImmune: true,
    bypassesBarrier: true,
    spawnProgress: 0.35,
    draw(ctx, e) {
      const hurt = e.slowUntil > e._now;
      const pulse = 3 + Math.sin((e._now || 0) * 4) * 1.1;
      ctx.save();
      ctx.translate(e.x, e.y);
      /* tom de tecido comprometido — parecido com a célula do organismo, não com um invasor de fora */
      ctx.fillStyle = "#8a5f6c";
      ctx.strokeStyle = "#42232b";
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      const n = 9;
      for (let i = 0; i <= n; i++) {
        const a = (i / n) * Math.PI * 2;
        const r = 15 + Math.sin(a * 3 + (e._now || 0)) * 2.2;
        const px = Math.cos(a) * r, py = Math.sin(a) * r;
        if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = "#42232b";
      ctx.beginPath();
      ctx.arc(0, 0, pulse, 0, Math.PI * 2);
      ctx.fill();
      if (hurt) {
        ctx.strokeStyle = "rgba(247,233,226,.85)";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(0, 0, 22, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.restore();
    }
  },

  /* Toxina (Fase 6): não é um patógeno vivo — não se reproduz, não é
     "morta" por fagocitose (phagocytosisImmune) nem filtrada por barreira
     (bypassesBarrier). Nenhuma torre a alcança: o único recurso é o Soro,
     que fornece anticorpos prontos com ação imediata. É rápida e perigosa
     se chegar ao núcleo — representando a urgência de uma intoxicação
     aguda, o cenário em que soro (não vacina) é a ferramenta certa. */
  toxina: {
    id: "toxina",
    name: "Toxina",
    maxHp: 40,
    speed: 55,
    radius: 11,
    coreDamage: 20,
    resourceReward: 6,
    barrierBlockChance: 0,
    phagocytosisImmune: true,
    bypassesBarrier: true,
    draw(ctx, e) {
      const t = e._now || 0;
      const wobble = Math.sin(t * 5) * 1.4;
      ctx.save();
      ctx.translate(e.x, e.y);
      ctx.rotate(e.angle || 0);
      /* gotícula/substância nociva — não uma criatura: forma amorfa, sem membros nem olhos */
      ctx.fillStyle = "rgba(201,207,85,.25)";
      ctx.beginPath(); ctx.arc(0, 0, 15 + wobble * 0.4, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "#c7cf55";
      ctx.strokeStyle = "#666b26";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(0, -10 - wobble);
      ctx.bezierCurveTo(7, -4, 9 + wobble, 5, 0, 10);
      ctx.bezierCurveTo(-9 - wobble, 5, -7, -4, 0, -10 - wobble);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = "rgba(102,107,38,.6)";
      ctx.beginPath(); ctx.arc(-2, 1, 2.3, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(3, -3, 1.6, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
    }
  }
};

function roundedRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function makeEnemy(typeId) {
  const t = ENEMY_TYPES[typeId];
  return {
    typeId,
    type: t,
    x: 0, y: 0, angle: 0,
    hp: t.maxHp,
    maxHp: t.maxHp,
    baseSpeed: t.speed,
    radius: t.radius,
    pathDist: 0,
    alive: true,
    reachedCore: false,
    slowUntil: 0,
    _now: 0,
    barrierSeen: {},   // { slotId: true }
    firstHit: false
  };
}

if (typeof window !== "undefined") {
  window.ENEMY_TYPES = ENEMY_TYPES;
  window.makeEnemy = makeEnemy;
  window.roundedRect = roundedRect;
}
