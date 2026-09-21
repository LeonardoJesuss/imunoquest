/* ============================================================
   ui.js — ligação entre o jogo e o DOM da tela de jogo:
   HUD, painel de defesas, nichos, toasts de feedback, overlays.
   ============================================================ */

const UI = (function () {
  let el = {};
  let toastTimers = [];
  let onSlotClick = null, onDefSelect = null, onTargetPick = null;
  let defTipWired = false;
  let chooserPending = false;
  let interludeState = null;

  function init() {
    el = {
      resource: byId("hud-resource"),
      tissue: byId("hud-tissue"),
      tissueBar: byId("hud-tissue-bar"),
      wave: byId("hud-wave"),
      slotLayer: byId("slot-layer"),
      defList: byId("def-list"),
      defTip: byId("def-tip"),
      abilityBox: byId("ability-febre"),
      febreCost: byId("febre-cost"),
      febreBtn: byId("btn-febre"),
      febreStatus: byId("febre-status"),
      abilitySoroBox: byId("ability-soro"),
      soroCost: byId("soro-cost"),
      soroBtn: byId("btn-soro"),
      soroStatus: byId("soro-status"),
      toastStack: byId("toast-stack"),
      briefing: byId("briefing"),
      briefingText: byId("briefing-text"),
      briefingGo: byId("briefing-go"),
      pauseVeil: byId("pause-veil"),
      canvasHolder: document.querySelector(".canvas-holder"),
      ovDebrief: byId("overlay-debrief"),
      ovFail: byId("overlay-fail"),
      ovLearned: byId("overlay-learned"),
      ovInterlude: byId("overlay-interlude"),
      ovConfirmRestart: byId("overlay-confirm-restart"),
      ovHelp: byId("overlay-help"),
      helpTitle: byId("help-title"),
      helpList: byId("help-list"),
      interludeTitle: byId("interlude-title"),
      interludeBody: byId("interlude-body")
    };
    if (!defTipWired) {
      el.defTip.addEventListener("click", (ev) => {
        const b = ev.target.closest(".target-opt");
        if (!b || b.disabled) return;
        if (onTargetPick) onTargetPick(b.dataset.target);
      });
      /* no toque, um dedo não acerta um nicho pequeno: um toque perto de um
         nicho (mas não em cima) escolhe o nicho mais próximo */
      el.slotLayer.addEventListener("click", (ev) => {
        if (ev.target.closest(".slot")) return;
        if (!window.matchMedia("(pointer: coarse)").matches) return;
        let best = null, bestD = Infinity;
        slotButtons().forEach(b => {
          const r = b.getBoundingClientRect();
          const d = Math.hypot(ev.clientX - (r.left + r.width / 2), ev.clientY - (r.top + r.height / 2));
          if (d < bestD) { bestD = d; best = b; }
        });
        if (best && bestD <= 34) best.click();
      });
      defTipWired = true;
    }
  }

  function byId(id) { return document.getElementById(id); }

  /* ---------- HUD ---------- */
  function hud(s) {
    el.resource.textContent = Math.round(s.resource);
    const pct = Math.max(0, Math.round(s.tissue));
    el.tissue.textContent = pct + "%";
    el.tissueBar.style.width = pct + "%";
    el.wave.textContent = s.wave + " / " + s.totalWaves;
  }

  /* ---------- nichos ---------- */
  function buildSlots(level, handler) {
    onSlotClick = handler;
    el.slotLayer.innerHTML = "";
    level.slots.forEach(slot => {
      const li = document.createElement("li");
      const b = document.createElement("button");
      b.className = "slot slot--" + slot.type;
      b.dataset.slot = slot.id;
      b.dataset.type = slot.type;
      b.style.left = (slot.x / 960 * 100) + "%";
      b.style.top = (slot.y / 600 * 100) + "%";
      b.setAttribute("aria-label", "Nicho de " + slot.label + " (" + slot.id + "). Vazio.");
      const lbl = document.createElement("span");
      lbl.className = "slot-label";
      lbl.textContent = slot.label;
      b.appendChild(lbl);
      b.addEventListener("click", () => onSlotClick && onSlotClick(slot.id));
      li.appendChild(b);
      el.slotLayer.appendChild(li);
    });
  }

  function slotButtons() { return el.slotLayer.querySelectorAll(".slot"); }

  function setSlotStates(selectedTowerType) {
    slotButtons().forEach(b => {
      b.classList.remove("is-compatible", "is-incompatible");
      if (!selectedTowerType || b.classList.contains("is-filled")) return;
      if (b.dataset.type === selectedTowerType.slot) b.classList.add("is-compatible");
      else b.classList.add("is-incompatible");
    });
  }

  function markSlotFilled(slotId, label) {
    const b = el.slotLayer.querySelector('[data-slot="' + slotId + '"]');
    if (!b) return;
    b.classList.add("is-filled");
    b.classList.remove("is-compatible", "is-incompatible");
    b.setAttribute("aria-label", "Nicho " + slotId + ": " + label + " posicionado.");
  }

  function clearSlot(slotId) {
    const b = el.slotLayer.querySelector('[data-slot="' + slotId + '"]');
    if (!b) return;
    b.classList.remove("is-filled");
  }

  function resetSlots() {
    slotButtons().forEach(b => b.classList.remove("is-filled", "is-compatible", "is-incompatible"));
  }

  /* ---------- painel de defesas ---------- */
  function buildDefPanel(level, phase, handler) {
    onDefSelect = handler;
    el.defList.innerHTML = "";
    level.towers.forEach((id, i) => {
      const t = TOWER_TYPES[id];
      const locked = isTowerLocked(id, phase);
      const b = document.createElement("button");
      b.className = "def-card";
      b.dataset.tower = id;
      b.type = "button";
      b.innerHTML =
        defGlyph(id) +
        '<span class="def-name">' + t.name + '</span>' +
        '<span class="def-cost' + (locked ? " is-locked" : "") + '">' +
          (locked ? "Fase " + t.unlockPhase : t.cost + " ⚡") + '</span>' +
        '<span class="def-rep">' + t.rep + '</span>';
      if (locked) b.disabled = true;
      b.addEventListener("click", () => onDefSelect && onDefSelect(id));
      /* enquanto o seletor de alvo (Linfócito B/T) está aberto esperando uma
         escolha, hover em qualquer card não deve substituí-lo silenciosamente */
      b.addEventListener("mouseenter", () => { if (!chooserPending) showDefTip(t); });
      b.addEventListener("focus", () => { if (!chooserPending) showDefTip(t); });
      el.defList.appendChild(b);
      b.dataset.key = i + 1;
    });
  }

  function defGlyph(id) {
    if (id === "barreira")
      return '<svg class="def-glyph" viewBox="0 0 30 30" aria-hidden="true"><path d="M4 9c7 3.2 15 3.2 22 0v3.4c-7 3.2-15 3.2-22 0z" fill="#e7c988"/><path d="M6 9.8v2 M11 10.6v2 M16 10.6v2 M21 9.8v2" stroke="#8a6a2e" stroke-width="1" opacity=".7"/><path d="M4 15c7 3.2 15 3.2 22 0v3.2c-7 3.2-15 3.2-22 0z" fill="#e7c988" opacity=".62"/><path d="M4 20.6c7 3.2 15 3.2 22 0v2.8c-7 3.2-15 3.2-22 0z" fill="#e7c988" opacity=".34"/></svg>';
    if (id === "neutrofilo")
      return '<svg class="def-glyph" viewBox="0 0 30 30" aria-hidden="true"><circle cx="15" cy="15" r="10.5" fill="#f3ead9" opacity=".9"/><circle cx="15" cy="15" r="10.5" fill="none" stroke="#c7a8b8" stroke-width="1.4"/><circle cx="11.5" cy="13" r="3.4" fill="#9a6fc2"/><circle cx="18" cy="12.5" r="3" fill="#9a6fc2"/><circle cx="15" cy="18.5" r="3.2" fill="#9a6fc2"/></svg>';
    if (id === "macrofago")
      return '<svg class="def-glyph" viewBox="0 0 30 30" aria-hidden="true"><path d="M23 15c1 5-3 9-8 9s-10-4-9-9 5-10 10-9c3 .6 6 4 7 9z" fill="#dd8a4c" opacity=".85"/><path d="M23 15c1 5-3 9-8 9s-10-4-9-9 5-10 10-9c3 .6 6 4 7 9z" fill="none" stroke="#864c1f" stroke-width="1.4"/><ellipse cx="14" cy="15" rx="4.2" ry="3.3" fill="#864c1f"/></svg>';
    if (id === "inflamacao")
      return '<svg class="def-glyph" viewBox="0 0 30 30" aria-hidden="true"><circle cx="15" cy="15" r="11" fill="none" stroke="#c94f3f" stroke-width="1.4" opacity=".55"/><circle cx="15" cy="15" r="6" fill="#c94f3f" opacity=".35"/><circle cx="15" cy="15" r="6" fill="none" stroke="#c94f3f" stroke-width="1.8"/></svg>';
    if (id === "vigilancia_nk")
      return '<svg class="def-glyph" viewBox="0 0 30 30" aria-hidden="true"><path d="M15 4 L25 9.5 V20.5 L15 26 L5 20.5 V9.5 Z" fill="#8b5fb0" opacity=".25" stroke="#8b5fb0" stroke-width="1.6"/><path d="M15 15 L22 12" stroke="#8b5fb0" stroke-width="1.6"/></svg>';
    if (id === "linfocito_b")
      return '<svg class="def-glyph" viewBox="0 0 30 30" aria-hidden="true"><circle cx="15" cy="15" r="9" fill="#4fae8f" opacity=".3"/><circle cx="15" cy="15" r="9" fill="none" stroke="#4fae8f" stroke-width="1.6"/><path d="M15 3 L15 8 M17 5 L20 3 M13 5 L10 3" stroke="#4fae8f" stroke-width="1.5"/><path d="M27 15 L22 15 M24.5 12.5 L27 10 M24.5 17.5 L27 20" stroke="#4fae8f" stroke-width="1.5"/></svg>';
    if (id === "linfocito_t")
      return '<svg class="def-glyph" viewBox="0 0 30 30" aria-hidden="true"><circle cx="15" cy="15" r="9" fill="#5f8fc4" opacity=".3"/><circle cx="15" cy="15" r="9" fill="none" stroke="#5f8fc4" stroke-width="1.6"/><path d="M15 3v3M15 27v-3M3 15h3M27 15h-3M6.5 6.5l2 2M23.5 6.5l-2 2M6.5 23.5l2-2M23.5 23.5l-2-2" stroke="#5f8fc4" stroke-width="1.5"/></svg>';
    return '<svg class="def-glyph" viewBox="0 0 30 30" aria-hidden="true"><circle cx="15" cy="15" r="11" fill="none" stroke="#5c7183" stroke-width="1.6"/><path d="M15 9v12M9 15h12" stroke="#5c7183" stroke-width="1.6"/></svg>';
  }

  function updateDefPanel(resource, selectedId, phase) {
    el.defList.querySelectorAll(".def-card").forEach(b => {
      const id = b.dataset.tower;
      const t = TOWER_TYPES[id];
      const locked = isTowerLocked(id, phase);
      /* linfócitos B/T têm custo dependente do alvo (memória = mais barato),
         só definido ao escolher o alvo no seletor — não travar o card aqui */
      const targetDependent = id === "linfocito_b" || id === "linfocito_t";
      b.classList.toggle("is-selected", id === selectedId);
      b.disabled = locked || (!targetDependent && resource < t.cost && id !== selectedId);
      b.setAttribute("aria-pressed", id === selectedId ? "true" : "false");
    });
  }

  function showDefTip(t, target, memory) {
    if (!t) return;
    chooserPending = false;
    el.defTip.innerHTML =
      '<span class="tip-name">' + escapeHtml(t.name) + '</span>' +
      '<p class="tip-game">' + escapeHtml(t.tipGame || "") + '</p>' +
      '<p class="tip-bio">' + escapeHtml(t.tipBio || "") + '</p>' +
      (target
        ? '<p class="tip-target">Alvo escolhido: <b>' + escapeHtml(ENEMY_TYPES[target].name) + '</b>' +
            (memory ? ' <span class="tip-memory">— memória ativa: mais barato, mais rápido, mais forte</span>' : "") +
          '</p>'
        : "");
  }
  /* ---------- venda de uma defesa já posicionada ---------- */
  function showSellPanel(t, refund, onSell) {
    if (!t) return;
    chooserPending = false;
    el.defTip.innerHTML =
      '<span class="tip-name">' + escapeHtml(t.name) + '</span>' +
      '<p class="tip-game">Já posicionada neste nicho.</p>' +
      '<p class="tip-bio">' + escapeHtml(t.tipBio || "") + '</p>' +
      '<button type="button" class="sell-btn">Vender por ' + refund + ' ⚡</button>';
    const b = el.defTip.querySelector(".sell-btn");
    if (b) b.addEventListener("click", onSell, { once: true });
  }

  function resetDefTip() {
    chooserPending = false;
    el.defTip.innerHTML = '<p class="def-tip-hint">Selecione uma defesa e clique num nicho compatível.</p>';
  }

  /* ---------- escolha de alvo específico (linfócitos B/T, Fase 4) ---------- */
  function showTargetChooser(t, options, onPick) {
    onTargetPick = onPick || null;
    chooserPending = true;
    const anyUnlocked = options.some(o => o.unlocked);
    const source = t.id === "linfocito_t"
      ? "a Vigilância NK eliminar células próprias infectadas"
      : "o Macrófago eliminar esse tipo de invasor";
    el.defTip.innerHTML =
      '<span class="tip-name">' + escapeHtml(t.name) + '</span>' +
      '<p class="tip-game">Escolha o alvo específico — cada linfócito age só contra um tipo de patógeno.</p>' +
      '<div class="target-list">' +
        options.map(o =>
          '<button type="button" class="target-opt' + (o.unlocked ? " is-ready" : " is-locked") + '" data-target="' + o.id + '"' +
            (o.unlocked ? "" : " disabled") + '>' +
            '<span class="to-name">' + escapeHtml(o.label) + '</span>' +
            '<span class="to-count">' + (o.unlocked ? "Pronto" : o.count + "/" + o.threshold) + (o.memory ? " · memória" : "") + '</span>' +
          '</button>'
        ).join("") +
      '</div>' +
      (anyUnlocked ? "" :
        '<p class="tip-target-hint">Ainda sem amostras suficientes: faça ' + escapeHtml(source) + ' até completar 3/3 — daí o alvo fica clicável aqui.</p>') +
      '<p class="tip-bio">' + escapeHtml(t.tipBio || "") + '</p>';
    flashDefTip();
  }

  function flashDefTip() {
    if (!el.defTip) return;
    el.defTip.classList.remove("def-tip--flash");
    void el.defTip.offsetWidth; /* força reflow para a animação poder repetir */
    el.defTip.classList.add("def-tip--flash");
    /* o painel pode rolar (celular): garante que o seletor de alvo fique à vista */
    if (el.defTip.scrollIntoView) el.defTip.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }

  /* ---------- resposta febril (habilidade sistêmica, não é torre de nicho) ---------- */
  function updateFever(state) {
    if (!el.abilityBox) return;
    if (!state) { el.abilityBox.hidden = true; return; }
    el.abilityBox.hidden = false;
    el.febreCost.textContent = state.cost + " ⚡";
    if (state.active) {
      el.febreBtn.disabled = true;
      el.febreBtn.textContent = "Febre ativa";
      el.febreStatus.textContent = "Em ação — " + Math.ceil(state.remaining) + " s restantes.";
    } else if (state.cooldownRemaining > 0) {
      el.febreBtn.disabled = true;
      el.febreBtn.textContent = "Recarregando";
      el.febreStatus.textContent = "Disponível em " + Math.ceil(state.cooldownRemaining) + " s.";
    } else {
      el.febreBtn.disabled = state.resource < state.cost;
      el.febreBtn.textContent = "Ativar febre";
      el.febreStatus.textContent = state.uses > 0 ? "Usada " + state.uses + "× nesta fase." : "";
    }
  }

  /* ---------- soro (habilidade sistêmica, Fase 6+) ---------- */
  function updateSoro(state) {
    if (!el.abilitySoroBox) return;
    if (!state) { el.abilitySoroBox.hidden = true; return; }
    el.abilitySoroBox.hidden = false;
    el.soroCost.textContent = state.cost + " ⚡";
    if (state.cooldownRemaining > 0) {
      el.soroBtn.disabled = true;
      el.soroBtn.textContent = "Recarregando";
      el.soroStatus.textContent = "Disponível em " + Math.ceil(state.cooldownRemaining) + " s.";
    } else {
      el.soroBtn.disabled = state.resource < state.cost;
      el.soroBtn.textContent = "Aplicar soro";
      el.soroStatus.textContent = state.hasTarget
        ? "Há toxina em campo agora."
        : (state.uses > 0 ? "Usado " + state.uses + "× nesta fase. Sem toxina em campo agora." : "Sem toxina em campo agora.");
    }
  }

  /* ---------- toasts ---------- */
  function toast(fb) {
    if (!fb) return;
    const d = document.createElement("div");
    d.className = "toast toast--" + (fb.kind || "info");
    d.innerHTML =
      '<p class="toast-label">' + escapeHtml(fb.label) + '</p>' +
      '<p class="toast-text">' + escapeHtml(fb.text) + '</p>' +
      (fb.tag ? '<span class="toast-tag">' + escapeHtml(fb.tag) + '</span>' : "");
    d.addEventListener("click", () => d.remove());
    el.toastStack.appendChild(d);
    while (el.toastStack.children.length > 3) el.toastStack.removeChild(el.toastStack.firstChild);
    const timer = setTimeout(() => { d.remove(); }, 9000);
    toastTimers.push(timer);
    if (window.IMUNOQUEST_AUDIO) {
      if (fb.kind === "warn") IMUNOQUEST_AUDIO.alert();
    }
  }
  function clearToasts() {
    toastTimers.forEach(clearTimeout); toastTimers = [];
    el.toastStack.innerHTML = "";
  }

  /* ---------- briefing / pause ---------- */
  function briefing(text, onGo) {
    el.briefingText.textContent = text;
    el.briefing.hidden = false;
    el.briefingGo.onclick = () => { el.briefing.hidden = true; onGo && onGo(); };
    el.briefingGo.focus();
  }
  function hideBriefing() { el.briefing.hidden = true; }
  function pause(show) { el.pauseVeil.hidden = !show; }

  /* ---------- overlays ---------- */
  function hideOverlays() {
    el.ovDebrief.hidden = true;
    el.ovFail.hidden = true;
    el.ovLearned.hidden = true;
    if (el.ovInterlude) el.ovInterlude.hidden = true;
    if (el.ovConfirmRestart) el.ovConfirmRestart.hidden = true;
    if (el.ovHelp) el.ovHelp.hidden = true;
    interludeState = null;
  }

  /* ---------- ajuda rápida ("?"): reaproveita a mesma lista de
     "O que você aprendeu", só que consultável a qualquer momento
     durante a fase, sem esperar até o fim ---------- */
  function showHelp(list, phase) {
    if (!el.ovHelp) return;
    el.helpTitle.textContent = "O que a Fase " + phase + " ensina";
    el.helpList.innerHTML = list.map(x =>
      '<li><b>' + escapeHtml(x.k) + ':</b> ' + escapeHtml(x.v) + '</li>').join("");
    el.ovHelp.hidden = false;
    const closeBtn = document.getElementById("help-close");
    if (closeBtn) closeBtn.focus({ preventScroll: true });
  }
  function hideHelp() { if (el.ovHelp) el.ovHelp.hidden = true; }
  function isHelpOpen() { return !!(el.ovHelp && !el.ovHelp.hidden); }

  function debrief(ratings, unlockHtml, handlers) {
    const g = byId("debrief-ratings");
    g.innerHTML = ratings.map(r =>
      '<div class="rating-row">' +
        '<div class="rating-top"><span class="rating-k">' + r.k + '</span>' +
        '<span class="rating-stars" aria-label="' + r.n + ' de 5">' + r.stars + '</span></div>' +
        '<p class="rating-c">' + r.c + '</p></div>').join("");
    byId("debrief-unlock").innerHTML = unlockHtml;
    byId("debrief-continue").onclick = handlers.onContinue;
    byId("debrief-replay").onclick = handlers.onReplay;
    el.ovDebrief.hidden = false;
    byId("debrief-continue").focus({ preventScroll: true });
  }

  function fail(data, handlers) {
    byId("fail-timeline").innerHTML = data.timeline.map(t =>
      '<li class="' + (t.hot ? "is-hot" : "") + '">' + boldMd(escapeHtml(t.text)) + '</li>').join("");
    byId("fail-hint").textContent = data.hint;
    byId("fail-retry").onclick = handlers.onRetry;
    byId("fail-concept").onclick = handlers.onConcept;
    el.ovFail.hidden = false;
    byId("fail-retry").focus({ preventScroll: true });
  }

  function learned(list, handlers, phase, campaignNote) {
    const title = byId("learned-title");
    if (title) title.textContent = "O que você aprendeu — Fase " + phase;
    byId("learned-list").innerHTML = list.map(x =>
      '<li><b>' + escapeHtml(x.k) + ':</b> ' + escapeHtml(x.v) + '</li>').join("");
    byId("learned-encyclopedia").onclick = handlers.onEncyclopedia;
    const banner = byId("learned-campaign");
    if (banner) {
      banner.hidden = !campaignNote;
      if (campaignNote) {
        banner.innerHTML = '<p class="cc-title">' + escapeHtml(campaignNote.title) + '</p>' +
          '<p class="cc-text">' + escapeHtml(campaignNote.text) + '</p>';
      }
    }
    el.ovLearned.hidden = false;
    document.querySelector("#overlay-learned .release-btn").focus({ preventScroll: true });
  }

  /* ---------- interlúdios de decisão (Fase 6+) — não pontuados, sem game over ---------- */
  function showInterlude(data, onComplete) {
    interludeState = { steps: data.steps, index: 0, onComplete: onComplete || null };
    el.interludeTitle.textContent = data.title;
    renderInterludeStep();
    el.ovInterlude.hidden = false;
  }

  function renderInterludeStep() {
    const s = interludeState;
    if (!s) return;
    const step = s.steps[s.index];
    el.interludeBody.innerHTML =
      '<p class="interlude-progress">Passo ' + (s.index + 1) + ' de ' + s.steps.length + '</p>' +
      '<p class="interlude-prompt">' + escapeHtml(step.prompt) + '</p>' +
      '<div class="interlude-choices">' +
        step.choices.map((c, i) => '<button type="button" class="interlude-choice" data-i="' + i + '">' + escapeHtml(c.label) + '</button>').join("") +
      '</div>' +
      '<div class="interlude-feedback" hidden></div>';
    el.interludeBody.querySelectorAll(".interlude-choice").forEach(b => {
      b.addEventListener("click", () => onInterludeChoice(Number(b.dataset.i)));
    });
    const first = el.interludeBody.querySelector(".interlude-choice");
    if (first) first.focus({ preventScroll: true });
  }

  function onInterludeChoice(i) {
    const s = interludeState;
    if (!s) return;
    const step = s.steps[s.index];
    const choice = step.choices[i];
    el.interludeBody.querySelectorAll(".interlude-choice").forEach((b, idx) => {
      b.disabled = true;
      b.classList.toggle("is-chosen", idx === i);
      b.classList.toggle("is-correct", !!step.choices[idx].correct);
    });
    const fb = el.interludeBody.querySelector(".interlude-feedback");
    const isLast = s.index >= s.steps.length - 1;
    fb.hidden = false;
    fb.className = "interlude-feedback " + (choice.correct ? "is-good" : "is-info");
    fb.innerHTML = '<p>' + escapeHtml(choice.feedback) + '</p>' +
      '<button type="button" class="release-btn interlude-next">' + (isLast ? "Concluir" : "Continuar") + '</button>';
    const nextBtn = fb.querySelector(".interlude-next");
    nextBtn.addEventListener("click", () => {
      s.index++;
      if (s.index >= s.steps.length) {
        const cb = s.onComplete;
        el.ovInterlude.hidden = true;
        interludeState = null;
        if (cb) cb();
      } else {
        renderInterludeStep();
      }
    });
    nextBtn.focus({ preventScroll: true });
  }

  /* ---------- tutorial banner ---------- */
  function tutorialBanner(step, handlers) {
    let bar = byId("tutorial-bar");
    if (!bar) {
      bar = document.createElement("div");
      bar.id = "tutorial-bar";
      bar.className = "tutorial-bar";
    }
    /* celular em pé: o campo é pequeno demais para ter o texto por cima —
       o tutorial entra no fluxo da página, logo acima do campo */
    const inFlow = window.matchMedia("(max-width: 600px)").matches;
    const stage = el.canvasHolder.closest(".game-stage");
    bar.classList.toggle("tutorial-bar--flow", inFlow);
    if (inFlow) { if (bar.nextElementSibling !== stage) stage.before(bar); }
    else if (bar.parentNode !== el.canvasHolder) el.canvasHolder.appendChild(bar);
    bar.hidden = false;
    bar.innerHTML =
      '<span class="tut-tag">Tutorial</span>' +
      '<p class="tut-text">' + escapeHtml(step.text) + '</p>' +
      '<div class="tut-actions">' +
        (step.showNext ? '<button class="release-btn" id="tut-next">' + (step.nextLabel || "Próximo") + '</button>' : "") +
        '<button class="ghost-btn" id="tut-skip">Pular tutorial</button>' +
      '</div>';
    if (step.showNext) byId("tut-next").onclick = handlers.onNext;
    byId("tut-skip").onclick = handlers.onSkip;
  }
  function hideTutorial() {
    const bar = byId("tutorial-bar");
    if (bar) bar.hidden = true;
  }

  /* ---------- utils ---------- */
  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, c =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  }
  function boldMd(s) { return s.replace(/\*\*(.+?)\*\*/g, "<b>$1</b>"); }

  return {
    init, hud, buildSlots, setSlotStates, markSlotFilled, clearSlot, resetSlots,
    buildDefPanel, updateDefPanel, showDefTip, resetDefTip, updateFever, updateSoro, showTargetChooser, showSellPanel,
    toast, clearToasts, briefing, hideBriefing, pause,
    hideOverlays, debrief, fail, learned, showInterlude,
    showHelp, hideHelp, isHelpOpen,
    tutorialBanner, hideTutorial
  };
})();

if (typeof window !== "undefined") window.UI = UI;
