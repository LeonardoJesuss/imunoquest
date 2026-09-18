/* ============================================================
   storage.js — progresso e preferências em localStorage.
   Não coleta dados pessoais. Sem login. Sem envio para a internet.
   ============================================================ */

const IMUNOQUEST_STORE = (function () {
  const KEY = "imunoquest.v1";

  const DEFAULTS = {
    unlockedPhase: 1,
    phaseStars: {},            // { "1": {estrategia,compreensao,eficiencia} }
    tutorialDone: false,
    settings: {
      speed: 1,
      timemode: true,          // modo sem pressão de tempo
      fontScale: 1,
      contrast: false,
      reducedMotion: false,
      sound: true
    }
  };

  function load() {
    let data = {};
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) data = JSON.parse(raw) || {};
    } catch (e) {
      data = {};
    }
    return deepMerge(structuredCloneSafe(DEFAULTS), data);
  }

  function save(state) {
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
    } catch (e) {
      /* modo privado ou storage cheio — o jogo continua funcionando sem salvar */
    }
  }

  function reset() {
    try { localStorage.removeItem(KEY); } catch (e) {}
  }

  function deepMerge(base, extra) {
    for (const k in extra) {
      if (extra[k] && typeof extra[k] === "object" && !Array.isArray(extra[k])) {
        base[k] = deepMerge(base[k] || {}, extra[k]);
      } else {
        base[k] = extra[k];
      }
    }
    return base;
  }

  function structuredCloneSafe(obj) {
    return JSON.parse(JSON.stringify(obj));
  }

  return { KEY, DEFAULTS, load, save, reset };
})();

if (typeof window !== "undefined") window.IMUNOQUEST_STORE = IMUNOQUEST_STORE;
