/* ============================================================
   game.js — orquestra uma partida (Fase 1 nesta versão).
   Junta motor + fase + defesas + inimigos + camada pedagógica + interface.
   ============================================================ */

const Game = (function () {
  let G = null;
  let store = null;
  let started = false;
  let keyHandler = null;
  let tut = null;

  const CORE_R = 34;

  /* imunidade adaptativa (Fase 4+): amostras de antígeno geradas por
     capturas de macrófago (patógenos extracelulares) e de vigilância NK
     (células infectadas). Ao atingir o limiar, o linfócito específico
     daquele alvo fica disponível para ser configurado. */
  const ANTIGEN_THRESHOLD = 3;
  const B_TARGETS = ["bacteria", "virus", "bacteria_encapsulada"];
  const T_TARGETS = ["celula_infectada"];

  /* memória imunológica (Fase 5+): ao dobrar o limiar de antígeno de um
     alvo, forma-se uma Célula de Memória para ele. Não é uma torre — é
     um estado (G.memory) consultado ao vivo por lymphocyteTick (torres já
     em campo ficam mais rápidas/fortes na hora em que a memória se forma)
     e por effectiveCost (novos linfócitos daquele alvo saem mais baratos). */
  const MEMORY_THRESHOLD = 6;

  function boot(sharedStore) {
    store = sharedStore;
    const canvas = document.getElementById("game-canvas");
    Engine.init(canvas);
  }

  /* ---------------- iniciar fase ---------------- */
  function start(phase, opts) {
    opts = opts || {};
    const level = LEVELS[phase];
    if (!level) { alert("Fase ainda não disponível nesta versão."); return; }

    const pathObj = buildPath(level.path);
    G = {
      phase, level, path: pathObj,
      time: 0,
      resource: level.startResource,
      tissue: level.tissue,
      tissueMax: level.tissue,
      towers: [], enemies: [], fx: [],
      selectedTower: null,
      selectedTargetType: null,
      wavesStarted: 0,
      waveIndex: 0,
      waveActive: false,
      waveArmedAt: 0,
      earlyBonusGiven: false,
      spawnQueue: [],
      totalWaves: level.waves.length,
      finished: false,
      fever: level.fever ? { until: 0, cooldownUntil: 0, uses: 0, cfg: level.fever } : null,
      soro: level.soro ? { cooldownUntil: 0, uses: 0, cfg: level.soro } : null,
      antigen: { bacteria: 0, virus: 0, bacteria_encapsulada: 0, celula_infectada: 0 },
      memory: { bacteria: false, virus: false, bacteria_encapsulada: false, celula_infectada: false },
      helpAutoPaused: false,
      reducedMotion: document.documentElement.classList.contains("reduced-motion")
        || window.matchMedia("(prefers-reduced-motion: reduce)").matches,
      emit
    };

    Education.reset();
    UI.init();
    UI.clearToasts();
    UI.hideOverlays();
    UI.resetDefTip();
    UI.buildSlots(level, onSlotClick);
    UI.buildDefPanel(level, phase, onSelectTower);
    UI.setSlotStates(null);
    UI.updateFever(null);
    UI.updateSoro(null);
    refreshHud();

    Engine.setSpeed(Number(store.settings.speed) || 1);
    Engine.setPaused(false);
    updateSpeedButton();

    document.getElementById("game-phase-name").textContent = level.name;

    if (!started) {
      Engine.start({ update, render });
      started = true;
    }

    bindKeys();
    armWave(0);

    const doTutorial = opts.tutorial || !store.tutorialDone;
    if (doTutorial) startTutorial();
    else showBriefing(0);
  }

  function stop() {
    unbindKeys();
    if (tut) { UI.hideTutorial(); tut = null; }
    UI.pause(false);
    UI.hideBriefing();
  }

  /* ---------------- ondas ---------------- */
  function armWave(i) {
    G.waveIndex = i;
    G.waveActive = false;
    G.waveArmedAt = G.time;
    G.earlyBonusGiven = false;
    G.spawnQueue = [];
    const wave = G.level.waves[i];
    wave.spawns.forEach(s => {
      for (let n = 0; n < s.count; n++) {
        G.spawnQueue.push({ type: s.type, at: (s.delay || 0) + n * s.gap });
      }
    });
    G.spawnQueue.sort((a, b) => a.at - b.at);
    document.getElementById("btn-release").disabled = false;
    refreshHud();
  }

  function showBriefing(i) {
    const text = G.level.briefings[i + 1];
    if (text) UI.briefing(text, () => releaseWave());
    else document.getElementById("btn-release").disabled = false;
  }

  function releaseWave() {
    if (G.finished || G.waveActive) return;
    G.waveActive = true;
    G.wavesStarted = Math.max(G.wavesStarted, G.waveIndex + 1);
    G.waveStartTime = G.time;
    document.getElementById("btn-release").disabled = true;
    UI.hideBriefing();

    const quick = (G.time - G.waveArmedAt) <= 7;
    if (quick && G.towers.length >= 1 && !G.earlyBonusGiven) {
      G.earlyBonusGiven = true;
      G.resource += 5;
      Education.event("earlyRelease", {});
    }
    if (window.IMUNOQUEST_AUDIO) IMUNOQUEST_AUDIO.waveStart();
    notifyTutorial("release");
    refreshHud();
  }

  /* ---------------- laço ---------------- */
  function update(dt) {
    if (!G || G.finished) return;
    G.time += dt;

    if (G.waveActive) {
      const tw = G.time - G.waveStartTime;
      while (G.spawnQueue.length && G.spawnQueue[0].at <= tw) {
        spawnEnemy(G.spawnQueue.shift().type);
      }
    }

    for (const e of G.enemies) updateEnemy(e, dt);
    for (const tw of G.towers) tw.type.update(tw, G, dt);

    Education.event("tissue", { value: G.tissue });
    if (G.tissue <= 0 && !G.finished) { refreshHud(); lose(); return; }

    G.towers = G.towers.filter(tw => {
      if (tw.spent) { UI.clearSlot(tw.slotId); return false; }
      return true;
    });

    cleanupEnemies();
    updateFx(dt);

    if (G.waveActive && G.spawnQueue.length === 0 &&
        !G.enemies.some(e => e.alive && !e.reachedCore)) {
      G.waveActive = false;
      Education.event("waveCleared", {});
      if (G.waveIndex + 1 < G.totalWaves) {
        const justCleared = G.waveIndex + 1;   // nº da onda que acabou (1-based)
        armWave(G.waveIndex + 1);
        const interKey = G.level.interludeAfterWave === justCleared ? G.level.interlude : null;
        setTimeout(() => {
          if (G.finished) return;
          const data = interKey && window.IMUNOQUEST_CONTENT.interludes[interKey];
          if (data) UI.showInterlude(data, () => { if (!G.finished) showBriefing(G.waveIndex); });
          else showBriefing(G.waveIndex);
        }, 400);
      } else {
        win();
      }
    }

    refreshHud();
    updateCanvasAria();
  }

  function spawnEnemy(typeId) {
    const e = makeEnemy(typeId);
    e.pathDist = G.path.total * (ENEMY_TYPES[typeId].spawnProgress || 0);
    const p = pointAtDistance(G.path, e.pathDist);
    e.x = p.x; e.y = p.y; e.angle = p.angle;
    G.enemies.push(e);
  }

  function updateEnemy(e, dt) {
    if (!e.alive) return;
    e._now = G.time;
    let sp = e.baseSpeed;
    if (e.slowUntil > G.time) sp *= (e.slowFactor || 0.6);
    if (G.fever && G.fever.until > G.time) sp *= G.fever.cfg.speedMult;
    e.pathDist += sp * dt;
    const p = pointAtDistance(G.path, e.pathDist);
    e.x = p.x; e.y = p.y; e.angle = p.angle;
    if (e.pathDist >= G.path.total) {
      e.reachedCore = true;
      e.alive = false;
      G.tissue = Math.max(0, G.tissue - e.type.coreDamage);
      Education.event("leak", { enemyType: e.typeId });
      Education.event("tissue", { value: G.tissue });
      G.fx.push(makeFx("leak", G.path.segs[G.path.segs.length - 1].b.x, G.path.segs[G.path.segs.length - 1].b.y));
      if (window.IMUNOQUEST_AUDIO) IMUNOQUEST_AUDIO.leak();
      if (G.tissue <= 0) lose();
    }
  }

  function cleanupEnemies() {
    const keep = [];
    for (const e of G.enemies) {
      if (e.reachedCore) continue;                 // dano já aplicado em updateEnemy
      if (e.alive) { keep.push(e); continue; }
      // inimigo neutralizado — recompensa
      if (e.blockedByBarrier) {
        G.resource += Math.ceil(e.type.resourceReward / 2);
        if (window.IMUNOQUEST_AUDIO) IMUNOQUEST_AUDIO.blocked();
      } else {
        G.resource += e.type.resourceReward;
        G.fx.push(makeFxText("+" + e.type.resourceReward, e.x, e.y));
        if (window.IMUNOQUEST_AUDIO) IMUNOQUEST_AUDIO.phago();
      }
    }
    G.enemies = keep;
  }

  function updateFx(dt) {
    for (const f of G.fx) f.t += dt;
    G.fx = G.fx.filter(f => f.t < f.life);
  }

  /* ---------------- eventos internos ---------------- */
  function emit(type, data) {
    Education.event(type, data);
    if (type === "phagocytosis") notifyTutorial("phago");
    if (type === "phagoKill" && data.tower.typeId === "macrofago") bumpAntigen(data.enemy.typeId);
    else if (type === "nkKill") bumpAntigen("celula_infectada");
  }

  function bumpAntigen(typeId) {
    if (!(typeId in G.antigen)) return;
    const before = G.antigen[typeId];
    G.antigen[typeId] = before + 1;
    if (before < ANTIGEN_THRESHOLD && G.antigen[typeId] >= ANTIGEN_THRESHOLD) {
      Education.event("antigenUnlocked", { typeId });
    }
    if (before < MEMORY_THRESHOLD && G.antigen[typeId] >= MEMORY_THRESHOLD && !G.memory[typeId]) {
      G.memory[typeId] = true;
      Education.event("memoryFormed", { typeId });
    }
  }

  function antigenOption(typeId) {
    const count = G.antigen[typeId] || 0;
    return {
      id: typeId, label: ENEMY_TYPES[typeId].name, count, threshold: ANTIGEN_THRESHOLD,
      unlocked: count >= ANTIGEN_THRESHOLD, memory: !!G.memory[typeId]
    };
  }

  /* linfócitos contra um alvo com memória saem mais baratos — a resposta
     já está pronta para ser mobilizada de novo, não precisa ser montada do zero */
  function effectiveCost(t, target) {
    if ((t.id === "linfocito_b" || t.id === "linfocito_t") && target && G.memory[target]) {
      return Math.round(t.cost * 0.5);
    }
    return t.cost;
  }

  /* ---------------- input ---------------- */
  function onSelectTower(id) {
    const t = TOWER_TYPES[id];
    if (isTowerLocked(id, G.phase)) { UI.showDefTip(t); return; }

    if (G.selectedTower && G.selectedTower.id === id) { deselectTower(); return; }

    if (id === "linfocito_b") {
      const opts = B_TARGETS.map(antigenOption);
      if (!opts.some(o => o.unlocked)) Education.event("noAntigenYet", {});
      UI.showTargetChooser(t, opts, (target) => pickLymphocyte(id, target));
      G.selectedTower = null;
      G.selectedTargetType = null;
      UI.updateDefPanel(G.resource, null, G.phase);
      UI.setSlotStates(null);
      return;
    }
    if (id === "linfocito_t") {
      const opt = antigenOption(T_TARGETS[0]);
      if (!opt.unlocked) {
        Education.event("noAntigenYet", {});
        UI.showTargetChooser(t, [opt], (target) => pickLymphocyte(id, target));
        return;
      }
      pickLymphocyte(id, opt.id);
      return;
    }

    G.selectedTower = t;
    G.selectedTargetType = null;
    UI.updateDefPanel(G.resource, id, G.phase);
    UI.setSlotStates(t);
    UI.showDefTip(t);
    if (window.IMUNOQUEST_AUDIO) IMUNOQUEST_AUDIO.click();
    notifyTutorial(id === "barreira" ? "selBarreira" : id === "neutrofilo" ? "selNeutrofilo" : null);
  }

  function pickLymphocyte(id, target) {
    const t = TOWER_TYPES[id];
    G.selectedTower = t;
    G.selectedTargetType = target;
    UI.updateDefPanel(G.resource, id, G.phase);
    UI.setSlotStates(t);
    UI.showDefTip(t, target, G.memory[target]);
    if (window.IMUNOQUEST_AUDIO) IMUNOQUEST_AUDIO.click();
  }

  function deselectTower() {
    G.selectedTower = null;
    G.selectedTargetType = null;
    UI.updateDefPanel(G.resource, null, G.phase);
    UI.setSlotStates(null);
    UI.resetDefTip();
  }

  /* ---------------- vender uma defesa já posicionada ---------------- */
  function selectPlacedTower(tw) {
    G.selectedTower = null;
    G.selectedTargetType = null;
    UI.updateDefPanel(G.resource, null, G.phase);
    UI.setSlotStates(null);
    const t = TOWER_TYPES[tw.typeId];
    const refund = Math.round(tw.paidCost * 0.5);
    UI.showSellPanel(t, refund, () => sellTower(tw));
  }

  function sellTower(tw) {
    const idx = G.towers.indexOf(tw);
    if (idx === -1) return;   // já foi vendida/removida — protege contra clique duplo
    const refund = Math.round(tw.paidCost * 0.5);
    G.resource += refund;
    G.towers.splice(idx, 1);
    UI.clearSlot(tw.slotId);
    UI.resetDefTip();
    if (window.IMUNOQUEST_AUDIO) IMUNOQUEST_AUDIO.click();
    refreshHud();
  }

  function onSlotClick(slotId) {
    const existing = G.towers.find(t => t.slotId === slotId);
    if (existing) { selectPlacedTower(existing); return; }

    if (!G.selectedTower) {
      UI.toast({ kind: "info", label: "Selecione uma defesa",
        text: "Escolha uma defesa no painel e depois clique num nicho compatível.", tag: "" });
      return;
    }
    const slot = G.level.slots.find(s => s.id === slotId);
    const t = G.selectedTower;

    if (slot.type !== t.slot) {
      Education.event("placeWrongNiche", { towerId: t.id });
      return;
    }
    const cost = effectiveCost(t, G.selectedTargetType);
    if (G.resource < cost) {
      Education.event("noResource", {});
      return;
    }
    G.resource -= cost;
    const tw = makeTower(t.id, slot, G.selectedTargetType, cost);
    G.towers.push(tw);
    UI.markSlotFilled(slotId, t.name);
    Education.event("placeOk", { towerId: t.id, slotId });
    if (window.IMUNOQUEST_AUDIO) IMUNOQUEST_AUDIO.place();
    notifyTutorial(t.id === "barreira" ? "placeBarreira" : t.id === "neutrofilo" ? "placeNeutrofilo" : null);

    UI.updateDefPanel(G.resource, t.id, G.phase);
    UI.setSlotStates(t);
    refreshHud();
  }

  function bindKeys() {
    keyHandler = (ev) => {
      if (document.getElementById("screen-game").hidden) return;
      if (ev.target.tagName === "INPUT" || ev.target.tagName === "TEXTAREA") return;
      if (UI.isHelpOpen && UI.isHelpOpen()) {
        if (ev.key === "Escape") closeHelp();
        return;
      }
      if (ev.key === " " || ev.key === "Spacebar") { ev.preventDefault(); togglePause(); }
      else if (ev.key === "Escape") { UI.hideBriefing(); }
      else if (ev.key.toLowerCase() === "l") { if (!G.waveActive) releaseWave(); }
      else if (ev.key === "?" || ev.key === "/") { openHelp(); }
      else if (/^[1-9]$/.test(ev.key)) {
        const card = document.querySelector('.def-card[data-key="' + ev.key + '"]');
        if (card && !card.disabled) onSelectTower(card.dataset.tower);
      }
    };
    document.addEventListener("keydown", keyHandler);
  }
  function unbindKeys() {
    if (keyHandler) document.removeEventListener("keydown", keyHandler);
    keyHandler = null;
  }

  function togglePause() {
    if (G.finished) return;
    const p = !Engine.isPaused();
    Engine.setPaused(p);
    UI.pause(p);
    const btn = document.getElementById("btn-pause");
    btn.textContent = p ? "▶ Continuar" : "⏸ Pausar";
    btn.setAttribute("aria-label", p ? "Continuar" : "Pausar");
  }

  /* ---------------- ajuda ("?"): consulta rápida, sem perder o que a fase
     ensina em meio aos toasts que desaparecem rápido durante o jogo.
     Pausa o motor enquanto está aberta, mas não interfere no botão de
     pausa manual: se o jogador já tinha pausado antes, continua pausado
     ao fechar; se não, retoma sozinho. ---------------- */
  function openHelp() {
    if (!G || G.finished) return;
    G.helpAutoPaused = !Engine.isPaused();
    if (G.helpAutoPaused) Engine.setPaused(true);
    UI.showHelp(Education.learnedList(G.phase), G.phase);
  }

  function closeHelp() {
    if (!G) return;
    UI.hideHelp();
    if (G.helpAutoPaused) {
      Engine.setPaused(false);
      G.helpAutoPaused = false;
    }
  }

  function cycleSpeed() {
    const opts = [1, 1.5, 0.75];
    const cur = Number(store.settings.speed) || 1;
    const next = opts[(opts.indexOf(cur) + 1) % opts.length];
    store.settings.speed = next;
    IMUNOQUEST_STORE.save(store);
    Engine.setSpeed(next);
    updateSpeedButton();
  }
  function updateSpeedButton() {
    const s = Number(store.settings.speed) || 1;
    document.getElementById("btn-speed").textContent =
      (s === 1 ? "1×" : s === 1.5 ? "1,5×" : "0,75×");
  }

  /* ---------------- febre (habilidade sistêmica, Fase 3+) ---------------- */
  function activateFever() {
    if (!G || !G.fever || G.finished) return;
    const cfg = G.fever.cfg;
    if (G.time < G.fever.until) return;           // já ativa
    if (G.time < G.fever.cooldownUntil) return;    // em recarga
    if (G.resource < cfg.cost) { Education.event("noResource", {}); return; }
    G.resource -= cfg.cost;
    G.fever.until = G.time + cfg.duration;
    G.fever.cooldownUntil = G.time + cfg.duration + cfg.cooldown;
    G.fever.uses++;
    Education.event("feverActivate", {});
    if (G.fever.uses > cfg.strainThreshold) {
      G.tissue = Math.max(0, G.tissue - cfg.strainCost);
      Education.event("feverOveruse", { uses: G.fever.uses });
    }
    if (window.IMUNOQUEST_AUDIO) IMUNOQUEST_AUDIO.place();
    refreshHud();
  }

  /* ---------------- soro (habilidade sistêmica, Fase 6+) ----------------
     Imunidade passiva artificial: anticorpos prontos, ação imediata,
     sem construir memória. Diferente da febre, não é "mantida" por um
     tempo — é um efeito instantâneo sobre as toxinas presentes no campo
     agora, e só agora. Não gera amostra de antígeno nem célula de
     memória: por isso não substitui a resposta adaptativa a longo prazo. */
  function activateSoro() {
    if (!G || !G.soro || G.finished) return;
    const cfg = G.soro.cfg;
    if (G.time < G.soro.cooldownUntil) return;
    const targets = G.enemies.filter(e => e.alive && !e.reachedCore && e.typeId === "toxina");
    if (!targets.length) { Education.event("soroNoTarget", {}); return; }
    if (G.resource < cfg.cost) { Education.event("noResource", {}); return; }
    G.resource -= cfg.cost;
    G.soro.cooldownUntil = G.time + cfg.cooldown;
    G.soro.uses++;
    targets.forEach(e => {
      e.hp = 0;
      e.alive = false;             // cleanupEnemies() dá a recompensa normal na próxima atualização
      G.fx.push(makeFx("block", e.x, e.y));
    });
    Education.event("soroActivate", { count: targets.length });
    if (window.IMUNOQUEST_AUDIO) IMUNOQUEST_AUDIO.waveStart();
    refreshHud();
  }

  /* ---------------- fim de fase ---------------- */
  function win() {
    if (G.finished) return;
    G.finished = true;
    Engine.setPaused(true);
    UI.clearToasts();
    if (window.IMUNOQUEST_AUDIO) IMUNOQUEST_AUDIO.win();

    const ratings = Education.computeRatings();
    store.phaseStars = store.phaseStars || {};
    store.phaseStars[G.phase] = {
      estrategia: ratings[0].n, compreensao: ratings[1].n, eficiencia: ratings[2].n
    };
    store.unlockedPhase = Math.max(store.unlockedPhase, G.phase + 1);
    if (tut) { store.tutorialDone = true; }
    IMUNOQUEST_STORE.save(store);

    const concept = window.IMUNOQUEST_CONTENT.encyclopedia.find(e => e.id === G.level.concept);
    const blurb = concept ? (concept.body[0].split(". ")[0].trim().replace(/\.?$/, ".")) : "";
    const unlockHtml = "Conceito desbloqueado na Central do Sistema Imunitário: <b>" +
      (concept ? concept.title : "Imunidade inata") + "</b>" + (blurb ? " — " + blurb : "");

    UI.debrief(ratings, unlockHtml, {
      onContinue: () => {
        UI.hideOverlays();
        UI.learned(Education.learnedList(G.phase), {
          onEncyclopedia: () => Router.go("encyclopedia", { focus: G.level.concept })
        }, G.phase, G.phase === 6 ? window.IMUNOQUEST_CONTENT.campaignComplete : null);
      },
      onReplay: () => { UI.hideOverlays(); start(G.phase, {}); }
    });
  }

  function lose() {
    if (G.finished) return;
    G.finished = true;
    Engine.setPaused(true);
    UI.clearToasts();
    if (window.IMUNOQUEST_AUDIO) IMUNOQUEST_AUDIO.fail();
    const data = Education.failTimeline(G);
    UI.fail(data, {
      onRetry: () => { UI.hideOverlays(); retry(); },
      onConcept: () => Router.go("encyclopedia", { focus: G.level.concept })
    });
  }

  /* recomeça a fase preservando as defesas ainda em campo */
  function retry() {
    const kept = G.towers
      .filter(t => !t.spent)
      .map(t => ({ typeId: t.typeId, slotId: t.slotId, target: t.target, paidCost: t.paidCost }));
    start(G.phase, { skipBriefing: false });
    kept.forEach(k => {
      const slot = G.level.slots.find(s => s.id === k.slotId);
      if (!slot) return;
      const tw = makeTower(k.typeId, slot, k.target, k.paidCost);
      G.towers.push(tw);
      UI.markSlotFilled(slot.id, TOWER_TYPES[k.typeId].name);
    });
    refreshHud();
  }

  /* ---------------- reiniciar fase (a pedido do jogador, a qualquer momento) ----------------
     Diferente de retry(): aqui NADA é mantido — remove todas as defesas, restaura o
     recurso inicial e as ondas, exatamente como entrar na fase pela primeira vez.
     A progressão permanente (fases desbloqueadas, estrelas) não é tocada porque vive em
     `store`, não em G — start() nunca escreve nela, exceto em win(). */
  function restartPhase() {
    if (!G) return;
    const phase = G.phase;
    UI.pause(false);
    const pauseBtn = document.getElementById("btn-pause");
    if (pauseBtn) { pauseBtn.textContent = "⏸ Pausar"; pauseBtn.setAttribute("aria-label", "Pausar"); }
    start(phase, {});
  }

  /* ---------------- tutorial ---------------- */
  const TUT_STEPS = [
    { text: "Os invasores entram pelo vaso, à esquerda, e seguem até o núcleo do tecido, no canto inferior direito. Seu objetivo é impedir que cheguem lá.", showNext: true },
    { text: "No painel de Defesas, selecione a Barreira.", advance: "selBarreira" },
    { text: "Agora clique num nicho de superfície (contorno tracejado) para posicionar a barreira.", advance: "placeBarreira" },
    { text: "A barreira filtra e atrasa invasores na entrada. Agora selecione o Neutrófilo.", advance: "selNeutrofilo" },
    { text: "Posicione o neutrófilo num nicho de tecido (contorno sólido). Ele age no interior do tecido.", advance: "placeNeutrofilo" },
    { text: "Quando estiver pronto, clique em ‘Liberar onda’. No modo sem pressão de tempo, a onda só começa quando você mandar.", advance: "release" },
    { text: "É isso. Contenha as 5 ondas. Se o tecido cair, você verá o que pesou e poderá tentar de novo. Boa defesa!", showNext: true, nextLabel: "Jogar" }
  ];

  function startTutorial() {
    tut = { i: 0 };
    renderTut();
  }
  function renderTut() {
    if (!tut) return;
    const step = TUT_STEPS[tut.i];
    UI.tutorialBanner(step, {
      onNext: () => advanceTut(),
      onSkip: () => endTutorial(false)
    });
  }
  function advanceTut() {
    if (!tut) return;
    tut.i++;
    if (tut.i >= TUT_STEPS.length) endTutorial(true);
    else renderTut();
  }
  function notifyTutorial(evt) {
    if (!tut) return;
    const step = TUT_STEPS[tut.i];
    if (step && step.advance === evt) advanceTut();
  }
  function endTutorial(completed) {
    tut = null;
    UI.hideTutorial();
    store.tutorialDone = true;
    IMUNOQUEST_STORE.save(store);
    if (!G.waveActive && !G.finished && G.wavesStarted === 0) showBriefing(G.waveIndex);
  }

  /* ---------------- HUD / aria ---------------- */
  function refreshHud() {
    UI.hud({
      resource: G.resource,
      tissue: G.tissue / G.tissueMax * 100,
      wave: G.wavesStarted,
      totalWaves: G.totalWaves
    });
    UI.updateDefPanel(G.resource, G.selectedTower ? G.selectedTower.id : null, G.phase);
    if (G.fever) {
      const active = G.fever.until > G.time;
      UI.updateFever({
        active,
        remaining: G.fever.until - G.time,
        cooldownRemaining: active ? 0 : Math.max(0, G.fever.cooldownUntil - G.time),
        cost: G.fever.cfg.cost,
        uses: G.fever.uses,
        resource: G.resource
      });
    } else {
      UI.updateFever(null);
    }
    if (G.soro) {
      const targetsNow = G.enemies.some(e => e.alive && !e.reachedCore && e.typeId === "toxina");
      UI.updateSoro({
        cooldownRemaining: Math.max(0, G.soro.cooldownUntil - G.time),
        cost: G.soro.cfg.cost,
        uses: G.soro.uses,
        resource: G.resource,
        hasTarget: targetsNow
      });
    } else {
      UI.updateSoro(null);
    }
  }

  function updateCanvasAria() {
    const alive = G.enemies.filter(e => e.alive && !e.reachedCore).length;
    document.getElementById("game-canvas").setAttribute("aria-label",
      "Campo de jogo. Onda " + G.wavesStarted + " de " + G.totalWaves +
      ". " + alive + " invasores no campo. Tecido em " + Math.round(G.tissue / G.tissueMax * 100) +
      " por cento. Recurso " + Math.round(G.resource) + ".");
  }

  /* ---------------- render ---------------- */
  function render(ctx) {
    if (!G) return;
    drawField(ctx);
    drawPath(ctx);
    drawCore(ctx);
    drawLandmark(ctx);
    for (const tw of G.towers) tw.type.draw(ctx, tw, G);
    for (const e of G.enemies) drawEnemy(ctx, e);
    drawFx(ctx);
    drawFeverOverlay(ctx);
  }

  /* tinta quente e sutil na tela inteira enquanto a febre está ativa —
     sinaliza uma resposta do organismo como um todo, não local */
  function drawFeverOverlay(ctx) {
    if (!G.fever || G.fever.until <= G.time) return;
    ctx.save();
    ctx.fillStyle = "rgba(221,154,68,.05)";
    ctx.fillRect(0, 0, Engine.W, Engine.H);
    ctx.strokeStyle = "rgba(221,154,68,.35)";
    ctx.lineWidth = 6;
    ctx.strokeRect(3, 3, Engine.W - 6, Engine.H - 6);
    ctx.restore();
  }

  /* fundo: tecido vivo — células preenchidas e sobrepostas, não vazias */
  function drawField(ctx) {
    ctx.fillStyle = "#2a1015";
    ctx.fillRect(0, 0, Engine.W, Engine.H);
    const cells = [[150,470,46],[270,540,58],[470,120,52],[640,470,68],[770,150,42],[900,320,56],[60,250,40],[520,520,44],[350,80,38],[830,500,50]];
    for (let i = 0; i < cells.length; i++) {
      const [x, y, r] = cells[i];
      const drift = G.reducedMotion ? 0 : Math.sin(G.time * 0.12 + i) * 2.2;
      ctx.fillStyle = "rgba(90,40,54,.32)";
      ctx.beginPath(); ctx.arc(x + drift, y, r, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = "rgba(140,74,92,.22)"; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.arc(x + drift, y, r, 0, Math.PI * 2); ctx.stroke();
      ctx.beginPath(); ctx.arc(x + drift, y, r * 0.6, 0, Math.PI * 2); ctx.stroke();
    }
    if (!G.reducedMotion) {
      /* pequenas vesículas flutuando devagar — vida de fundo, sem competir com o caminho */
      ctx.fillStyle = "rgba(201,123,140,.28)";
      for (let i = 0; i < 14; i++) {
        const seed = i * 71.3;
        const x = (seed * 13.1 + G.time * 6) % Engine.W;
        const y = (seed * 7.7) % Engine.H;
        ctx.beginPath(); ctx.arc(x, y, 1.6, 0, Math.PI * 2); ctx.fill();
      }
    }
  }

  /* caminho: canal/vaso orgânico, sem tracejado de "esteira" */
  function drawPath(ctx) {
    const pts = G.level.path;
    ctx.lineJoin = "round"; ctx.lineCap = "round";
    ctx.strokeStyle = "#3a1620"; ctx.lineWidth = 48;
    tracePath(ctx, pts); ctx.stroke();
    ctx.strokeStyle = "rgba(201,123,140,.16)"; ctx.lineWidth = 40;
    tracePath(ctx, pts); ctx.stroke();
    ctx.strokeStyle = "rgba(201,123,140,.34)"; ctx.lineWidth = 3;
    tracePath(ctx, pts); ctx.stroke();
    if (!G.reducedMotion) {
      /* gotículas de fluxo, devagar, no lugar da linha tracejada animada */
      ctx.fillStyle = "rgba(247,233,226,.55)";
      const total = G.path.total;
      for (let i = 0; i < 8; i++) {
        const d = (total * (i / 8) + G.time * 34) % total;
        const p = pointAtDistance(G.path, d);
        ctx.beginPath(); ctx.arc(p.x, p.y, 2, 0, Math.PI * 2); ctx.fill();
      }
    }
    ctx.fillStyle = "#3a1620";
    ctx.strokeStyle = "rgba(201,123,140,.5)"; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.ellipse(24, 210, 20, 52, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.fillStyle = "rgba(211,163,171,.9)";
    ctx.font = "600 12px 'Segoe UI', system-ui, sans-serif";
    ctx.fillText("VASO — ENTRADA", 46, 120);
  }
  function tracePath(ctx, pts) {
    ctx.beginPath();
    ctx.moveTo(pts[0].x, pts[0].y);
    for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y);
  }

  /* núcleo do tecido: estrutura celular, não um medidor de bateria */
  function drawCore(ctx) {
    const c = G.level.path[G.level.path.length - 1];
    const hpF = G.tissue / G.tissueMax;
    const pulse = G.reducedMotion ? 0 : Math.sin(G.time * 1.4) * 1.2;
    /* interpola de rosa vivo (saudável) para cinza-rosado (danificado) */
    const healthy = [201, 123, 140], hurt = [122, 92, 98];
    const mix = healthy.map((v, i) => Math.round(v + (hurt[i] - v) * (1 - hpF)));
    const bodyColor = `rgb(${mix[0]},${mix[1]},${mix[2]})`;
    ctx.save();
    ctx.translate(c.x, c.y);
    ctx.fillStyle = `rgba(${mix[0]},${mix[1]},${mix[2]},.16)`;
    ctx.beginPath(); ctx.arc(0, 0, CORE_R + 10 + pulse, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = bodyColor;
    ctx.beginPath();
    const n = 12;
    for (let i = 0; i <= n; i++) {
      const a = (i / n) * Math.PI * 2;
      const r = CORE_R - 6 + Math.sin(a * 5 + G.time * 0.8) * 1.6;
      const px = Math.cos(a) * r, py = Math.sin(a) * r;
      if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    }
    ctx.closePath(); ctx.fill();
    ctx.strokeStyle = "rgba(247,233,226,.5)"; ctx.lineWidth = 1.4; ctx.stroke();
    ctx.fillStyle = "rgba(58,22,32,.6)";
    ctx.beginPath(); ctx.ellipse(-2, 2, 9, 7, 0.3, 0, Math.PI * 2); ctx.fill();
    /* anel fino de leitura precisa — discreto, não é o protagonista visual */
    ctx.strokeStyle = hpF > 0.4 ? "rgba(247,233,226,.7)" : "rgba(209,72,60,.85)";
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(0, 0, CORE_R + 6, -Math.PI/2, -Math.PI/2 + hpF * Math.PI * 2); ctx.stroke();
    ctx.fillStyle = "rgba(211,163,171,.9)";
    ctx.font = "600 12px 'Segoe UI', system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("NÚCLEO DO TECIDO", 0, CORE_R + 24);
    ctx.textAlign = "left";
    ctx.restore();
  }

  /* linfonodo (Fase 4+): elemento do mapa, não interativo — só reforça
     visualmente onde a resposta adaptativa é organizada (OE4). */
  function drawLandmark(ctx) {
    const lm = G.level.landmark;
    if (!lm) return;
    ctx.save();
    ctx.translate(lm.x, lm.y);
    ctx.fillStyle = "rgba(224,143,174,.12)";
    ctx.beginPath(); ctx.ellipse(0, 0, 34, 22, 0, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = "rgba(224,143,174,.5)";
    ctx.lineWidth = 1.5;
    ctx.setLineDash([3, 5]);
    ctx.beginPath(); ctx.ellipse(0, 0, 34, 22, 0, 0, Math.PI * 2); ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = "rgba(224,143,174,.35)";
    [[-10, -4, 5], [8, -6, 4], [2, 7, 4.5], [-6, 6, 3.5]].forEach(([x, y, r]) => {
      ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
    });
    ctx.fillStyle = "rgba(92,113,131,.9)";
    ctx.font = "12px Consolas, monospace";
    ctx.textAlign = "center";
    ctx.fillText("LINFONODO", 0, 38);
    ctx.textAlign = "left";
    ctx.restore();
  }

  function drawEnemy(ctx, e) {
    if (!e.alive && !e.reachedCore) return;
    e._now = G.time;
    e.type.draw(ctx, e);
    if (e.hp < e.maxHp && e.hp > 0) {
      const w = 22, f = Math.max(0, e.hp / e.maxHp);
      ctx.fillStyle = "rgba(0,0,0,.5)";
      ctx.fillRect(e.x - w/2, e.y - e.radius - 9, w, 4);
      ctx.fillStyle = "#f0b13c";
      ctx.fillRect(e.x - w/2, e.y - e.radius - 9, w * f, 4);
    }
  }

  function drawFx(ctx) {
    for (const f of G.fx) {
      const k = f.t / f.life;
      if (f.kind === "phago") {
        /* membrana "abraçando" o alvo — fagocitose, não uma explosão */
        ctx.strokeStyle = "rgba(154,111,194," + (1 - k) + ")";
        ctx.lineWidth = 3;
        ctx.beginPath(); ctx.arc(f.x, f.y, 6 + k * 16, 0, Math.PI * 1.6 + k * 2); ctx.stroke();
        if (f.ref) {
          ctx.strokeStyle = "rgba(154,111,194," + (0.7 - k) + ")";
          ctx.lineWidth = 2;
          ctx.beginPath(); ctx.moveTo(f.ref.x, f.ref.y); ctx.lineTo(f.x, f.y); ctx.stroke();
        }
      } else if (f.kind === "block") {
        ctx.strokeStyle = "rgba(231,201,136," + (1 - k) + ")";
        ctx.lineWidth = 3;
        ctx.beginPath(); ctx.arc(f.x, f.y, 8 + k * 20, 0, Math.PI * 2); ctx.stroke();
      } else if (f.kind === "leak") {
        ctx.fillStyle = "rgba(209,72,60," + (0.5 - k * 0.5) + ")";
        ctx.beginPath(); ctx.arc(f.x, f.y, 20 + k * 30, 0, Math.PI * 2); ctx.fill();
      } else if (f.kind === "fade") {
        ctx.strokeStyle = "rgba(154,111,194," + (0.6 - k * 0.6) + ")";
        ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(f.x, f.y, 15 + k * 10, 0, Math.PI * 2); ctx.stroke();
      } else if (f.kind === "text") {
        ctx.fillStyle = "rgba(79,174,143," + (1 - k) + ")";
        ctx.font = "600 13px 'Segoe UI', system-ui, sans-serif";
        ctx.fillText(f.label, f.x - 8, f.y - 14 - k * 14);
      } else if (f.kind === "antibody") {
        /* anticorpo se ligando ao alvo — linfócito B */
        if (f.ref) {
          ctx.strokeStyle = "rgba(79,174,143," + (0.8 - k * 0.8) + ")";
          ctx.lineWidth = 1.6;
          ctx.beginPath(); ctx.moveTo(f.ref.x, f.ref.y); ctx.lineTo(f.x, f.y); ctx.stroke();
        }
        ctx.strokeStyle = "rgba(79,174,143," + (1 - k) + ")";
        ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(f.x, f.y, 5 + k * 12, 0, Math.PI * 2); ctx.stroke();
      } else if (f.kind === "nk") {
        /* reconhecimento e ataque direto da NK — um flash curto, não um "abraço" de membrana */
        ctx.strokeStyle = "rgba(139,95,176," + (1 - k) + ")";
        ctx.lineWidth = 2.2;
        for (let i = 0; i < 5; i++) {
          const a = (i / 5) * Math.PI * 2;
          ctx.beginPath();
          ctx.moveTo(f.x + Math.cos(a) * 4, f.y + Math.sin(a) * 4);
          ctx.lineTo(f.x + Math.cos(a) * (7 + k * 10), f.y + Math.sin(a) * (7 + k * 10));
          ctx.stroke();
        }
      } else if (f.kind === "tcell") {
        /* linfócito T citotóxico — pulso azul focado, distinto da NK e do B */
        ctx.strokeStyle = "rgba(95,143,196," + (1 - k) + ")";
        ctx.lineWidth = 2.4;
        ctx.beginPath(); ctx.arc(f.x, f.y, 4 + k * 13, 0, Math.PI * 2); ctx.stroke();
        if (f.ref) {
          ctx.strokeStyle = "rgba(95,143,196," + (0.6 - k * 0.6) + ")";
          ctx.lineWidth = 1.4;
          ctx.beginPath(); ctx.moveTo(f.ref.x, f.ref.y); ctx.lineTo(f.x, f.y); ctx.stroke();
        }
      }
    }
  }

  return { boot, start, stop, togglePause, cycleSpeed, releaseWave, activateFever, activateSoro, restartPhase,
           openHelp, closeHelp,
           get state() { return G; } };
})();

function makeFxText(label, x, y) {
  const f = makeFx("text", x, y);
  f.label = label;
  return f;
}

if (typeof window !== "undefined") {
  window.Game = Game;
  window.makeFxText = makeFxText;
}
