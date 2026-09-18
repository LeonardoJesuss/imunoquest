/* ============================================================
   education.js — a camada pedagógica.
   Liga eventos do jogo a feedback que EXPLICA o conceito, e reúne
   evidências de aprendizagem para a avaliação do fim da fase
   (que reflete as decisões do jogador, não uma prova).
   ============================================================ */

const Education = (function () {
  const F = () => window.IMUNOQUEST_CONTENT.feedback;
  let m, once;

  function reset() {
    m = {
      wrongNiche: 0,
      correctPlacements: 0,
      totalPlacements: 0,
      barrierPlaced: 0,
      neutrophilPlaced: 0,
      macrofagoPlaced: 0,
      inflamacaoPlaced: 0,
      nkPlaced: 0,
      linfocitoBPlaced: 0,
      linfocitoTPlaced: 0,
      memoryFormedCount: 0,
      tissueSlotsUsed: new Set(),
      leaks: 0,
      infectedLeaks: 0,
      kills: 0,
      earlyReleases: 0,
      feverUses: 0,
      tissueStart: 100,
      tissueEnd: 100,
      wavesCleared: 0
    };
    once = {};
  }

  /* dispara um toast uma única vez por partida */
  function toastOnce(key, feedback) {
    if (once[key]) return;
    once[key] = true;
    UI.toast(feedback);
  }

  /* evento vindo do game — pode gerar feedback e atualizar métricas */
  function event(type, data) {
    const fb = F();
    switch (type) {

      case "placeOk": {
        m.totalPlacements++;
        m.correctPlacements++;
        if (data.towerId === "barreira") {
          m.barrierPlaced++;
          toastOnce("placeBarrier", fb.placeBarrierOk);
        } else if (data.towerId === "neutrofilo") {
          m.neutrophilPlaced++;
          m.tissueSlotsUsed.add(data.slotId);
          toastOnce("placeNeutro", fb.placeNeutrophilOk);
        } else if (data.towerId === "macrofago") {
          m.macrofagoPlaced++;
          m.tissueSlotsUsed.add(data.slotId);
          toastOnce("placeMacrofago", fb.placeMacrofagoOk);
        } else if (data.towerId === "inflamacao") {
          m.inflamacaoPlaced++;
          toastOnce("placeInflamacao", fb.placeInflamacaoOk);
        } else if (data.towerId === "vigilancia_nk") {
          m.nkPlaced++;
          m.tissueSlotsUsed.add(data.slotId);
          toastOnce("placeNk", fb.placeNkOk);
        } else if (data.towerId === "linfocito_b") {
          m.linfocitoBPlaced++;
          m.tissueSlotsUsed.add(data.slotId);
          toastOnce("placeLinfocitoB", fb.placeLinfocitoBOk);
        } else if (data.towerId === "linfocito_t") {
          m.linfocitoTPlaced++;
          m.tissueSlotsUsed.add(data.slotId);
          toastOnce("placeLinfocitoT", fb.placeLinfocitoTOk);
        }
        break;
      }

      case "placeWrongNiche": {
        m.wrongNiche++;
        UI.toast(data.towerId === "barreira" ? fb.barrierOnTissue : fb.neutrophilOnSurface);
        break;
      }

      case "noResource":
        toastOnce("noResource", fb.noResource);
        break;

      case "phagocytosis":
        toastOnce("firstPhago", fb.firstPhagocytosis);
        break;

      case "encapsuladaResist":
        toastOnce("encapsuladaResist", fb.encapsuladaResist);
        break;

      case "phagoKill":
        m.kills++;
        break;

      case "barrierBlock":
        m.kills++;
        break;

      case "virusResist":
        toastOnce("virusResist", fb.virusVsNeutrophil);
        break;

      case "phagocyteBypassed":
        toastOnce("phagoBypassed", fb.phagocyteBypassed);
        break;

      case "nkKill":
        m.kills++;
        break;

      case "antibodyHit":
        toastOnce("firstAntibody", fb.firstAntibodyHit);
        break;

      case "antibodyKill":
        m.kills++;
        break;

      case "tCellHit":
        toastOnce("firstTCell", fb.firstTCellHit);
        break;

      case "tCellKill":
        m.kills++;
        break;

      case "noAntigenYet":
        toastOnce("noAntigen", fb.noAntigenYet);
        break;

      case "antigenUnlocked": {
        const name = window.ENEMY_TYPES[data.typeId].name.toLowerCase();
        UI.toast(Object.assign({}, fb.antigenUnlocked, { text: fb.antigenUnlocked.text.replace("{alvo}", name) }));
        break;
      }

      case "memoryFormed": {
        m.memoryFormedCount++;
        const name = window.ENEMY_TYPES[data.typeId].name.toLowerCase();
        UI.toast(Object.assign({}, fb.memoryFormed, { text: fb.memoryFormed.text.replace("{alvo}", name) }));
        break;
      }

      case "feverActivate":
        m.feverUses++;
        toastOnce("feverActivate", fb.feverActivate);
        break;

      case "feverOveruse":
        UI.toast(fb.feverOveruse);
        break;

      case "leak":
        m.leaks++;
        if (data.enemyType === "celula_infectada") m.infectedLeaks++;
        toastOnce("leak", fb.leak);
        break;

      case "earlyRelease":
        m.earlyReleases++;
        toastOnce("early", fb.earlyRelease);
        break;

      case "waveCleared":
        m.wavesCleared++;
        break;

      case "tissue":
        m.tissueEnd = data.value;
        break;
    }
  }

  function clamp(n) { return Math.max(1, Math.min(5, Math.round(n))); }
  function stars(n) { return "★★★★★☆☆☆☆☆".slice(5 - n, 10 - n); }

  function computeRatings() {
    /* Compreensão — acertou o nicho de cada defesa? */
    let comp = 5 - m.wrongNiche;
    if (m.totalPlacements === 0) comp = 2;
    else if (m.barrierPlaced === 0) comp -= 1;
    comp = clamp(comp);
    const compC = m.totalPlacements === 0
      ? "Você não posicionou nenhuma defesa — experimente combinar barreira na entrada e fagócitos no tecido."
      : m.wrongNiche === 0 && m.barrierPlaced > 0
        ? "Acertou o nicho de cada defesa: barreira na superfície, fagócitos no tecido."
        : m.barrierPlaced === 0
          ? "Faltou usar a barreira na entrada. Cada defesa tem seu lugar: superfície ou tecido."
          : `Posicionou uma defesa no nicho errado ${m.wrongNiche} vez(es). Barreira na superfície, células no tecido.`;

    /* Estratégia — usou as duas camadas e cobriu o caminho? */
    let strat = 3;
    if (m.barrierPlaced >= 1) strat += 1;
    if (m.tissueSlotsUsed.size >= 3) strat += 1;
    else if (m.tissueSlotsUsed.size <= 1) strat -= 1;
    if (m.wrongNiche >= 3) strat -= 1;
    strat = clamp(strat);
    const stratC = strat >= 4
      ? "Combinou defesa na entrada (barreira) com fagócitos distribuídos pelo tecido."
      : "Dá para cobrir melhor o caminho: uma barreira na entrada e um neutrófilo por trecho de tecido.";

    /* Eficiência — quantos invasores chegaram ao tecido? */
    let eff;
    if (m.leaks === 0) eff = 5;
    else if (m.leaks <= 2) eff = 4;
    else if (m.leaks <= 4) eff = 3;
    else if (m.leaks <= 7) eff = 2;
    else eff = 1;
    if (m.tissueEnd >= 80) eff = Math.min(5, eff + 0);
    if (m.tissueEnd <= 25) eff = Math.max(1, eff - 1);
    eff = clamp(eff);
    const effC = m.leaks === 0
      ? "Nenhum invasor alcançou o núcleo do tecido."
      : `${m.leaks} invasor(es) chegaram ao tecido. Reforçar a defesa interna reduz esse número.`;

    return [
      { k: "Estratégia", n: strat, stars: stars(strat), c: stratC },
      { k: "Compreensão", n: comp, stars: stars(comp), c: compC },
      { k: "Eficiência", n: eff, stars: stars(eff), c: effC }
    ];
  }

  function failTimeline(game) {
    const t = [];
    t.push({ text: `Onda ${game.waveIndex + 1} de ${game.totalWaves} em andamento quando o tecido caiu.`, hot: false });
    if (m.barrierPlaced === 0)
      t.push({ text: "Nenhuma **barreira** foi posicionada na entrada — muitos invasores passaram sem filtro.", hot: true });
    if (m.tissueSlotsUsed.size <= 1)
      t.push({ text: "Poucos **fagócitos no tecido** — os invasores que passaram da entrada não encontraram defesa interna.", hot: true });
    if (m.infectedLeaks > 0 && m.nkPlaced === 0)
      t.push({ text: `${m.infectedLeaks} **célula(s) própria(s) infectada(s)** chegaram ao tecido sem nenhuma vigilância NK em campo — fagócitos não agem sobre elas.`, hot: true });
    if (m.wrongNiche >= 2)
      t.push({ text: `Defesa posicionada no nicho errado ${m.wrongNiche} vezes — recurso e tempo perdidos.`, hot: true });
    if (m.leaks >= 3)
      t.push({ text: `${m.leaks} invasores alcançaram o núcleo do tecido ao longo da fase.`, hot: true });
    t.push({ text: "Vitalidade do tecido chegou a zero.", hot: false });

    let hint;
    if (m.infectedLeaks > 0 && m.nkPlaced === 0)
      hint = "Dica: células próprias infectadas não são afetadas por barreira nem por fagocitose. Só a Vigilância NK resolve essa ameaça.";
    else if (m.barrierPlaced === 0)
      hint = "Dica: comece toda fase com uma barreira num nicho de superfície. Ela filtra parte dos invasores logo na entrada.";
    else if (m.tissueSlotsUsed.size <= 1)
      hint = "Dica: a barreira não alcança quem já está no tecido. Reserve recurso para pelo menos um fagócito por trecho de tecido.";
    else
      hint = "Dica: o neutrófilo tem vida curta — reponha os que desaparecem e priorize os trechos onde os invasores mais passam.";

    return { timeline: t, hint };
  }

  function learnedList(phase) {
    return (window.IMUNOQUEST_CONTENT.learned[phase] || []);
  }

  return { reset, event, computeRatings, failTimeline, learnedList, get metrics() { return m; } };
})();

if (typeof window !== "undefined") window.Education = Education;
