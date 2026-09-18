/* ============================================================
   towers.js — mecanismos de defesa.
   Cada defesa representa uma função biológica real (não uma "arma"):
   - Barreira   : pele e mucosas. Age só na ENTRADA (nicho de superfície).
   - Neutrófilo : fagócito da imunidade inata. Age no TECIDO, tem vida curta.
   - Macrófago  : fagócito de vida mais longa (Fase 2). Mais lento, mais caro,
                  aguenta muito mais tempo e mais capturas em campo.
   - Inflamação : não é uma célula — é uma resposta de apoio (Fase 2). Acelera
                  os fagócitos próximos por um tempo, mas custa vitalidade ao
                  tecido enquanto dura: recrutamento tem preço.
   - Vigilância NK (Fase 3): não expira. Só age sobre "células próprias
                  infectadas" — nunca sobre vírus livre ou bactérias.
   - Linfócito B (Fase 4): imunidade ADAPTATIVA. Configurado, ao ser
                  posicionado, contra UM patógeno específico (bactéria,
                  vírus ou bactéria encapsulada) — só age contra esse alvo.
                  Precisa de "amostras de antígeno" (geradas por macrófagos)
                  para ficar disponível. Dano cheio mesmo contra a cápsula:
                  representa a opsonização resolvendo o que a fagocitose
                  direta não resolvia sozinha.
   - Linfócito T (Fase 4): imunidade adaptativa citotóxica. Só age sobre
                  "células próprias infectadas" (como a NK, mas de forma
                  específica ao antígeno). Precisa de amostras geradas por
                  kills da vigilância NK.
   Febre (Fase 3+) não é uma defesa de nicho: é uma resposta sistêmica
   ativada pelo jogador, controlada em game.js (G.fever) e consultada aqui
   como ctxGame.fever para o pequeno bônus de velocidade dos fagócitos/NK
   /linfócitos.
   Memória imunológica (Fase 5+) também não é uma defesa de nicho: é um
   estado por patógeno (G.memory, controlado em game.js) consultado ao
   vivo por lymphocyteTick — um linfócito B/T contra um alvo com memória
   fica mais barato de posicionar, mais rápido e mais forte em combate.
   O comportamento de cada uma é definido em update(); o desenho em draw().
   ============================================================ */

/* comportamento comum aos fagócitos (neutrófilo e macrófago):
   perseguem o invasor mais adiantado no alcance, atacam por fagocitose,
   e se esgotam depois de um tempo/número de capturas — representando a
   vida limitada dessas células em campo. spec = o próprio TOWER_TYPES.x */
function phagocyteTick(spec, tw, ctxGame, dt) {
  tw.age += dt;
  tw.cooldown -= dt;
  if (tw.age >= spec.lifespan || tw.captures >= spec.maxCaptures) {
    tw.spent = true;
    ctxGame.fx.push(makeFx("fade", tw.x, tw.y));
    return;
  }
  if (tw.cooldown > 0) return;

  let target = null, best = -Infinity, sawImmune = false;
  for (const e of ctxGame.enemies) {
    if (!e.alive || e.reachedCore) continue;
    if (dist(e.x, e.y, tw.x, tw.y) > spec.range) continue;
    if (e.type.phagocytosisImmune) { sawImmune = true; continue; }
    if (e.pathDist > best) { best = e.pathDist; target = e; }
  }
  if (!target) { if (sawImmune) ctxGame.emit("phagocyteBypassed", {}); return; }

  const buffed = tw.buffedUntil && tw.buffedUntil > ctxGame.time;
  const feverOn = ctxGame.fever && ctxGame.fever.until > ctxGame.time;
  const mult = Math.min(buffed ? 0.5 : 1, feverOn ? ctxGame.fever.cfg.buffMult : 1);
  tw.cooldown = spec.attackInterval * mult;

  const dmg = spec.damage * target.type.phagocytosisDamageMult;
  target.hp -= dmg;
  target.firstHit = true;
  ctxGame.fx.push(makeFx("phago", target.x, target.y, tw));
  ctxGame.emit("phagocytosis", { enemy: target, tower: tw });

  if (target.hp <= 0) {
    target.alive = false;
    tw.captures++;
    ctxGame.emit("phagoKill", { enemy: target, tower: tw });
  } else if (target.typeId === "virus") {
    ctxGame.emit("virusResist", { enemy: target });
  } else if (target.typeId === "bacteria_encapsulada") {
    ctxGame.emit("encapsuladaResist", { enemy: target });
  }
}

/* comportamento comum aos linfócitos (B e T, Fase 4): resposta ADAPTATIVA.
   Não se esgotam como os fagócitos — permanecem ativos o resto da fase,
   representando uma resposta específica já estabelecida. Só atacam o
   ÚNICO tipo de invasor escolhido pelo jogador (tw.target) ao posicionar:
   essa é a especificidade da imunidade adaptativa. spec = TOWER_TYPES.x.
   Se já existe Célula de Memória para esse alvo (Fase 5+, ctxGame.memory),
   o ataque fica mais rápido e mais forte — checado ao vivo a cada disparo,
   então uma torre já em campo "acelera" no instante em que a memória se
   forma, sem precisar ser reconstruída. */
function lymphocyteTick(spec, tw, ctxGame, dt) {
  tw.cooldown -= dt;
  if (tw.cooldown > 0) return;

  let target = null, best = -Infinity;
  for (const e of ctxGame.enemies) {
    if (!e.alive || e.reachedCore) continue;
    if (e.typeId !== tw.target) continue;
    if (dist(e.x, e.y, tw.x, tw.y) > spec.range) continue;
    if (e.pathDist > best) { best = e.pathDist; target = e; }
  }
  if (!target) return;

  const feverOn = ctxGame.fever && ctxGame.fever.until > ctxGame.time;
  const memoryOn = ctxGame.memory && ctxGame.memory[tw.target];
  let mult = feverOn ? ctxGame.fever.cfg.buffMult : 1;
  if (memoryOn) mult *= 0.6;
  tw.cooldown = spec.attackInterval * mult;

  const dmg = spec.damage * (memoryOn ? 1.25 : 1);   // dano cheio — e mais forte ainda com memória
  target.hp -= dmg;
  target.firstHit = true;
  ctxGame.fx.push(makeFx(spec.fxKind, target.x, target.y, tw));
  ctxGame.emit(spec.hitEvent, { enemy: target, tower: tw });

  if (target.hp <= 0) {
    target.alive = false;
    tw.captures = (tw.captures || 0) + 1;
    ctxGame.emit(spec.killEvent, { enemy: target, tower: tw });
  }
}

/* anel fino que indica quando um fagócito está sob efeito da inflamação */
function drawBuffRing(ctx, tw, game) {
  if (!(tw.buffedUntil && tw.buffedUntil > game.time)) return;
  ctx.strokeStyle = "rgba(201,79,63,.75)";
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.arc(0, 0, 24, 0, Math.PI * 2);
  ctx.stroke();
}

/* duplo anel dourado — indica um linfócito com memória imunológica ativa (Fase 5+) */
function drawMemoryGlow(ctx, tw, game) {
  if (!(tw.target && game.memory && game.memory[tw.target])) return;
  const pulse = game.reducedMotion ? 0.6 : 0.5 + 0.25 * Math.sin(game.time * 3);
  ctx.strokeStyle = `rgba(221,154,68,${pulse})`;
  ctx.lineWidth = 1.4;
  ctx.beginPath(); ctx.arc(0, 0, 27, 0, Math.PI * 2); ctx.stroke();
  ctx.beginPath(); ctx.arc(0, 0, 30, 0, Math.PI * 2); ctx.stroke();
}

const TOWER_TYPES = {
  barreira: {
    id: "barreira",
    name: "Barreira",
    cost: 8,
    slot: "surface",
    rep: "Pele e mucosa. Só em nicho de superfície. Filtra e atrasa — não destrói.",
    tipGame: "Cada invasor que passa pela sua área tem uma chance de ser barrado na entrada; os demais seguem mais devagar por alguns segundos.",
    tipBio: "Representa as barreiras físicas e químicas: a primeira linha de defesa, que atua impedindo ou dificultando a entrada de agentes no organismo.",
    range: 92,
    slowFactor: 0.55,
    slowDuration: 2.6,

    update(tw, ctxGame, dt) {
      for (const e of ctxGame.enemies) {
        if (!e.alive || e.reachedCore) continue;
        if (e.type.bypassesBarrier) continue;
        if (dist(e.x, e.y, tw.x, tw.y) > this.range) continue;
        if (e.barrierSeen[tw.slotId]) continue;
        e.barrierSeen[tw.slotId] = true;
        if (Math.random() < e.type.barrierBlockChance) {
          e.hp = 0;
          e.alive = false;
          e.blockedByBarrier = true;
          ctxGame.fx.push(makeFx("block", tw.x, tw.y));
          ctxGame.emit("barrierBlock", { enemy: e });
        } else {
          e.slowUntil = ctxGame.time + this.slowDuration;
          e.slowFactor = this.slowFactor;
        }
      }
    },

    draw(ctx, tw, game) {
      const pulse = game.reducedMotion ? 0.5 : 0.4 + 0.18 * Math.sin(game.time * 1.6 + tw.x);
      ctx.save();
      ctx.translate(tw.x, tw.y);
      /* dobra de mucosa: camadas curvas sobrepostas, como epitélio compactado */
      ctx.strokeStyle = `rgba(231,201,136,${pulse})`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, 0, 23, Math.PI * 0.55, Math.PI * 1.45);
      ctx.stroke();
      ctx.strokeStyle = "#e7c988";
      ctx.lineWidth = 7;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.arc(0, 0, 15, Math.PI * 0.5, Math.PI * 1.5);
      ctx.stroke();
      /* pequenas junções entre "células" da barreira */
      ctx.strokeStyle = "rgba(138,106,46,.7)";
      ctx.lineWidth = 1.2;
      for (let a = 0.55; a <= 1.45; a += 0.18) {
        const x1 = Math.cos(a * Math.PI) * 11.5, y1 = Math.sin(a * Math.PI) * 11.5;
        const x2 = Math.cos(a * Math.PI) * 18.5, y2 = Math.sin(a * Math.PI) * 18.5;
        ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
      }
      ctx.lineWidth = 2.5;
      ctx.strokeStyle = "rgba(231,201,136,.55)";
      ctx.beginPath();
      ctx.arc(0, 0, 9, Math.PI * 0.5, Math.PI * 1.5);
      ctx.stroke();
      ctx.restore();
    }
  },

  neutrofilo: {
    id: "neutrofilo",
    name: "Neutrófilo",
    cost: 10,
    slot: "tissue",
    rep: "Fagócito da imunidade inata. Rápido e numeroso, dura pouco tempo em campo.",
    tipGame: "Ataca por fagocitose um invasor por vez dentro do alcance. Some depois de um tempo ou após conter vários invasores — reponha os que desaparecem.",
    tipBio: "Representa o neutrófilo: célula da imunidade inata que engloba e destrói o agente invasor. Chega primeiro e em grande número ao foco de infecção, mas tem vida curta.",
    range: 108,
    lifespan: 44,
    maxCaptures: 6,
    attackInterval: 1.0,
    damage: 22,

    update(tw, ctxGame, dt) { phagocyteTick(this, tw, ctxGame, dt); },

    draw(ctx, tw, game) {
      const lifeLeft = 1 - tw.age / this.lifespan;
      const wob = game.reducedMotion ? 0 : Math.sin(game.time * 2.4 + tw.x) * 0.6;
      ctx.save();
      ctx.translate(tw.x, tw.y);
      /* zona de alcance: lavado suave, sem tracejado — não é um radar */
      ctx.fillStyle = "rgba(154,111,194,.07)";
      ctx.beginPath(); ctx.arc(0, 0, this.range, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = "rgba(154,111,194,.22)"; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.arc(0, 0, this.range, 0, Math.PI * 2); ctx.stroke();
      /* corpo — membrana levemente irregular, creme, com lóbulos lilás do núcleo */
      ctx.fillStyle = "#f3ead9";
      ctx.beginPath();
      const n = 10;
      for (let i = 0; i <= n; i++) {
        const a = (i / n) * Math.PI * 2;
        const r = 14.5 + Math.sin(a * 4 + game.time * 1.5) * 0.9;
        const px = Math.cos(a) * r, py = Math.sin(a) * r;
        if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
      }
      ctx.closePath(); ctx.fill();
      ctx.strokeStyle = "#c7a8b8"; ctx.lineWidth = 1.6; ctx.stroke();
      ctx.fillStyle = "#9a6fc2";
      [[-4 + wob, -3, 4.3], [4, -4 + wob, 3.8], [2 - wob, 5, 4]].forEach(([x, y, r]) => {
        ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
      });
      ctx.strokeStyle = "rgba(154,111,194,.85)"; ctx.lineWidth = 1.8;
      ctx.beginPath(); ctx.arc(0, 0, 18, -Math.PI / 2, -Math.PI / 2 + lifeLeft * Math.PI * 2); ctx.stroke();
      drawBuffRing(ctx, tw, game);
      ctx.restore();
    }
  },

  macrofago: {
    id: "macrofago",
    name: "Macrófago",
    cost: 20,
    slot: "tissue",
    unlockPhase: 2,
    rep: "Fagócito de vida mais longa. Mais caro e mais lento que o neutrófilo, mas aguenta muito mais tempo em campo.",
    tipGame: "Ataca por fagocitose como o neutrófilo, porém mais devagar. Em compensação, dura muito mais tempo e suporta muito mais capturas antes de se esgotar.",
    tipBio: "Representa o macrófago: fagócito da imunidade inata com vida mais longa que o neutrófilo. Também participa da apresentação de antígeno — uma ponte com a resposta adaptativa, que aparece em fases mais adiante.",
    range: 100,
    lifespan: 95,
    maxCaptures: 14,
    attackInterval: 1.6,
    damage: 26,

    update(tw, ctxGame, dt) { phagocyteTick(this, tw, ctxGame, dt); },

    draw(ctx, tw, game) {
      const lifeLeft = 1 - tw.age / this.lifespan;
      ctx.save();
      ctx.translate(tw.x, tw.y);
      ctx.fillStyle = "rgba(221,138,76,.08)";
      ctx.beginPath(); ctx.arc(0, 0, this.range, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = "rgba(221,138,76,.22)"; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.arc(0, 0, this.range, 0, Math.PI * 2); ctx.stroke();
      /* corpo irregular com pseudópodes — maior e menos "redondo" que o neutrófilo */
      ctx.fillStyle = "rgba(221,138,76,.5)";
      ctx.beginPath();
      ctx.moveTo(18, 0);
      for (let i = 1; i <= 10; i++) {
        const a = (i / 10) * Math.PI * 2;
        const r = 17 + Math.sin(a * 3 + tw.age) * 3.5;
        ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r);
      }
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = "#dd8a4c"; ctx.lineWidth = 2;
      ctx.stroke();
      ctx.fillStyle = "#864c1f";
      ctx.beginPath(); ctx.ellipse(-1, 0, 8, 6, 0.4, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = "rgba(221,138,76,.85)"; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(0, 0, 24, -Math.PI / 2, -Math.PI / 2 + lifeLeft * Math.PI * 2); ctx.stroke();
      drawBuffRing(ctx, tw, game);
      ctx.restore();
    }
  },

  inflamacao: {
    id: "inflamacao",
    name: "Inflamação",
    cost: 18,
    slot: "tissue",
    unlockPhase: 2,
    rep: "Não é uma célula: acelera os fagócitos próximos por um tempo, mas custa vitalidade ao tecido enquanto dura.",
    tipGame: "Por cerca de 18 s, fagócitos num raio ficam bem mais rápidos. Enquanto isso, o tecido perde um pouco de vitalidade — a inflamação tem custo.",
    tipBio: "Representa a inflamação: mastócitos e basófilos liberam histamina, os vasos ficam mais permeáveis e mais células de defesa chegam mais rápido à região — com efeito colateral local.",
    range: 130,
    duration: 18,
    tissueDrainPerSecond: 0.55,

    update(tw, ctxGame, dt) {
      tw.age += dt;
      if (tw.age >= this.duration) {
        tw.spent = true;
        ctxGame.fx.push(makeFx("fade", tw.x, tw.y));
        return;
      }
      ctxGame.tissue = Math.max(0, ctxGame.tissue - this.tissueDrainPerSecond * dt);
      for (const other of ctxGame.towers) {
        if (other === tw) continue;
        if ((other.typeId === "neutrofilo" || other.typeId === "macrofago") &&
            dist(other.x, other.y, tw.x, tw.y) <= this.range) {
          other.buffedUntil = ctxGame.time + 0.4;
        }
      }
    },

    draw(ctx, tw, game) {
      const life = 1 - tw.age / this.duration;
      const pulse = game.reducedMotion ? 0.5 : 0.5 + 0.2 * Math.sin(game.time * 2.2);
      ctx.save();
      ctx.translate(tw.x, tw.y);
      /* zona de calor — lavado quente pulsante, sem tracejado de radar */
      ctx.fillStyle = `rgba(201,79,63,${0.1 * pulse})`;
      ctx.beginPath(); ctx.arc(0, 0, this.range, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = "rgba(201,79,63,.25)"; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.arc(0, 0, this.range, 0, Math.PI * 2); ctx.stroke();
      /* núcleo irregular, como um pequeno foco inflamado */
      ctx.fillStyle = "rgba(201,79,63,.4)";
      ctx.beginPath();
      for (let i = 0; i <= 10; i++) {
        const a = (i / 10) * Math.PI * 2;
        const r = 15 + Math.sin(a * 3 + game.time * 2) * 2.4;
        const px = Math.cos(a) * r, py = Math.sin(a) * r;
        if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
      }
      ctx.closePath(); ctx.fill();
      ctx.strokeStyle = "#c94f3f"; ctx.lineWidth = 2; ctx.stroke();
      ctx.strokeStyle = "rgba(201,79,63,.9)"; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(0, 0, 21, -Math.PI / 2, -Math.PI / 2 + life * Math.PI * 2); ctx.stroke();
      ctx.restore();
    }
  },

  vigilancia_nk: {
    id: "vigilancia_nk",
    name: "Vigilância NK",
    cost: 22,
    slot: "tissue",
    unlockPhase: 3,
    rep: "Vigilância constante da imunidade inata. Só reconhece células do próprio corpo já infectadas — não age em vírus livre nem em bactérias.",
    tipGame: "Ataca apenas 'células próprias infectadas'. Não tem vida útil como os fagócitos: permanece de vigília o tempo todo, ocupando o nicho.",
    tipBio: "Representa a célula NK: reconhece e elimina células alteradas ou infectadas do próprio corpo. Não age sobre patógenos fora das células — essa é a função dos fagócitos e, mais adiante, dos anticorpos.",
    range: 105,
    attackInterval: 1.3,
    damage: 22,

    update(tw, ctxGame, dt) {
      tw.cooldown -= dt;
      if (tw.cooldown > 0) return;
      let target = null, best = -Infinity;
      for (const e of ctxGame.enemies) {
        if (!e.alive || e.reachedCore) continue;
        if (e.typeId !== "celula_infectada") continue;
        if (dist(e.x, e.y, tw.x, tw.y) > this.range) continue;
        if (e.pathDist > best) { best = e.pathDist; target = e; }
      }
      if (!target) return;
      const feverOn = ctxGame.fever && ctxGame.fever.until > ctxGame.time;
      tw.cooldown = this.attackInterval * (feverOn ? ctxGame.fever.cfg.buffMult : 1);
      target.hp -= this.damage;
      target.firstHit = true;
      ctxGame.fx.push(makeFx("nk", target.x, target.y, tw));
      ctxGame.emit("nkStrike", { enemy: target, tower: tw });
      if (target.hp <= 0) {
        target.alive = false;
        tw.captures = (tw.captures || 0) + 1;
        ctxGame.emit("nkKill", { enemy: target, tower: tw });
      }
    },

    draw(ctx, tw, game) {
      const sweep = game.reducedMotion ? 0 : game.time * 1.4;
      ctx.save();
      ctx.translate(tw.x, tw.y);
      ctx.fillStyle = "rgba(139,95,176,.09)";
      ctx.beginPath(); ctx.arc(0, 0, this.range, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = "rgba(139,95,176,.28)"; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.arc(0, 0, this.range, 0, Math.PI * 2); ctx.stroke();
      /* corpo hexagonal — leitura de "sentinela", distinto dos fagócitos redondos/irregulares */
      ctx.fillStyle = "rgba(139,95,176,.3)";
      ctx.strokeStyle = "#8b5fb0";
      ctx.lineWidth = 2;
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const a = (i / 6) * Math.PI * 2 - Math.PI / 2;
        const px = Math.cos(a) * 15, py = Math.sin(a) * 15;
        if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      /* linha de varredura, girando lentamente — vigilância ativa */
      ctx.strokeStyle = "rgba(139,95,176,.9)";
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(Math.cos(sweep) * 14, Math.sin(sweep) * 14);
      ctx.stroke();
      ctx.restore();
    }
  },

  linfocito_b: {
    id: "linfocito_b",
    name: "Linfócito B",
    cost: 26,
    slot: "tissue",
    unlockPhase: 4,
    attackInterval: 1.3,
    damage: 24,
    range: 130,
    fxKind: "antibody",
    hitEvent: "antibodyHit",
    killEvent: "antibodyKill",
    rep: "Produz anticorpos contra UM patógeno específico, escolhido ao posicionar. Precisa de amostras de antígeno (geradas por macrófagos) para ficar disponível.",
    tipGame: "Ao selecionar, escolha o alvo. Ataca à distância só esse tipo — inclusive bactérias encapsuladas, com dano cheio: o anticorpo resolve o que a fagocitose direta não resolvia.",
    tipBio: "Representa o linfócito B: produz anticorpos específicos a um antígeno, que neutralizam o patógeno e o marcam para destruição (opsonização). Não expira como os fagócitos — a resposta específica permanece.",

    update(tw, ctxGame, dt) { lymphocyteTick(this, tw, ctxGame, dt); },

    draw(ctx, tw, game) {
      ctx.save();
      ctx.translate(tw.x, tw.y);
      ctx.fillStyle = "rgba(79,174,143,.08)";
      ctx.beginPath(); ctx.arc(0, 0, this.range, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = "rgba(79,174,143,.26)"; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.arc(0, 0, this.range, 0, Math.PI * 2); ctx.stroke();
      ctx.fillStyle = "rgba(79,174,143,.3)";
      ctx.beginPath(); ctx.arc(0, 0, 14, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = "#4fae8f"; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(0, 0, 14, 0, Math.PI * 2); ctx.stroke();
      /* pequenos "Y" de anticorpo radiando — leitura distinta dos fagócitos */
      ctx.strokeStyle = "#4fae8f"; ctx.lineWidth = 1.6;
      for (let i = 0; i < 4; i++) {
        const a = (i / 4) * Math.PI * 2 + 0.3;
        const bx = Math.cos(a) * 20, by = Math.sin(a) * 20;
        ctx.beginPath();
        ctx.moveTo(Math.cos(a) * 15, Math.sin(a) * 15);
        ctx.lineTo(bx, by);
        ctx.moveTo(bx, by); ctx.lineTo(bx + Math.cos(a + 0.5) * 4, by + Math.sin(a + 0.5) * 4);
        ctx.moveTo(bx, by); ctx.lineTo(bx + Math.cos(a - 0.5) * 4, by + Math.sin(a - 0.5) * 4);
        ctx.stroke();
      }
      /* selo com a inicial do alvo escolhido */
      if (tw.target) {
        ctx.fillStyle = "#2c6a53";
        ctx.beginPath(); ctx.arc(11, -11, 7, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = "#e7f5ef";
        ctx.font = "bold 9px 'Segoe UI', system-ui, sans-serif";
        ctx.textAlign = "center"; ctx.textBaseline = "middle";
        ctx.fillText(TARGET_BADGE[tw.target] || "?", 11, -10.5);
        ctx.textAlign = "left"; ctx.textBaseline = "alphabetic";
      }
      drawBuffRing(ctx, tw, game);
      drawMemoryGlow(ctx, tw, game);
      ctx.restore();
    }
  },

  linfocito_t: {
    id: "linfocito_t",
    name: "Linfócito T",
    cost: 28,
    slot: "tissue",
    unlockPhase: 4,
    attackInterval: 1.1,
    damage: 26,
    range: 112,
    fxKind: "tcell",
    hitEvent: "tCellHit",
    killEvent: "tCellKill",
    rep: "Elimina, de forma específica, células do próprio corpo já infectadas — como a vigilância NK, mas dirigido a um antígeno reconhecido de forma específica.",
    tipGame: "Ataca apenas 'células próprias infectadas', como a vigilância NK. Precisa de amostras de antígeno geradas por capturas da vigilância NK para ficar disponível.",
    tipBio: "Representa o linfócito T citotóxico: reconhece, de forma específica ao antígeno, células infectadas e as elimina. É adaptativo — diferente da NK, que é inata.",

    update(tw, ctxGame, dt) { lymphocyteTick(this, tw, ctxGame, dt); },

    draw(ctx, tw, game) {
      ctx.save();
      ctx.translate(tw.x, tw.y);
      ctx.fillStyle = "rgba(95,143,196,.09)";
      ctx.beginPath(); ctx.arc(0, 0, this.range, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = "rgba(95,143,196,.28)"; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.arc(0, 0, this.range, 0, Math.PI * 2); ctx.stroke();
      ctx.fillStyle = "rgba(95,143,196,.28)";
      ctx.beginPath(); ctx.arc(0, 0, 14, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = "#5f8fc4"; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(0, 0, 14, 0, Math.PI * 2); ctx.stroke();
      /* espículas curtas — leitura de célula citotóxica */
      ctx.strokeStyle = "#5f8fc4"; ctx.lineWidth = 1.8;
      for (let i = 0; i < 7; i++) {
        const a = (i / 7) * Math.PI * 2;
        ctx.beginPath();
        ctx.moveTo(Math.cos(a) * 14, Math.sin(a) * 14);
        ctx.lineTo(Math.cos(a) * 19, Math.sin(a) * 19);
        ctx.stroke();
      }
      if (tw.target) {
        ctx.fillStyle = "#33506e";
        ctx.beginPath(); ctx.arc(11, -11, 7, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = "#e6eef7";
        ctx.font = "bold 9px 'Segoe UI', system-ui, sans-serif";
        ctx.textAlign = "center"; ctx.textBaseline = "middle";
        ctx.fillText(TARGET_BADGE[tw.target] || "?", 11, -10.5);
        ctx.textAlign = "left"; ctx.textBaseline = "alphabetic";
      }
      drawBuffRing(ctx, tw, game);
      drawMemoryGlow(ctx, tw, game);
      ctx.restore();
    }
  }
};

const TARGET_BADGE = { bacteria: "B", virus: "V", bacteria_encapsulada: "E", celula_infectada: "I" };

function makeTower(typeId, slot, target, paidCost) {
  return {
    typeId, type: TOWER_TYPES[typeId],
    slotId: slot.id, x: slot.x, y: slot.y,
    age: 0, cooldown: 0, captures: 0, spent: false, buffedUntil: 0,
    target: target || null,   // patógeno específico (só linfócitos B/T usam isto)
    paidCost: paidCost != null ? paidCost : TOWER_TYPES[typeId].cost   // para o valor de venda (50% disto)
  };
}

function makeFx(kind, x, y, ref) {
  const lives = { phago: 0.35, text: 1.1, nk: 0.3, tcell: 0.32 };
  return { kind, x, y, ref: ref || null, t: 0, life: lives[kind] != null ? lives[kind] : 0.5 };
}

function dist(ax, ay, bx, by) {
  return Math.hypot(ax - bx, ay - by);
}

function isTowerLocked(typeId, phase) {
  const t = TOWER_TYPES[typeId];
  return !!(t.unlockPhase && phase < t.unlockPhase);
}

if (typeof window !== "undefined") {
  window.TOWER_TYPES = TOWER_TYPES;
  window.makeTower = makeTower;
  window.makeFx = makeFx;
  window.dist = dist;
  window.isTowerLocked = isTowerLocked;
}
