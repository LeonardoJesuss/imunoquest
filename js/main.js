/* ============================================================
   main.js — inicialização, navegação entre telas, configurações.
   ============================================================ */

const Router = (function () {
  let current = "menu";
  let store = null;

  function init(sharedStore) { store = sharedStore; }

  function go(name, opts) {
    opts = opts || {};
    if (current === "game" && name !== "game") {
      Game.stop();
      if (UI.hideOverlays) UI.hideOverlays();
    }

    document.querySelectorAll(".screen").forEach(s => {
      s.classList.remove("is-active");
      s.hidden = true;
    });
    const target = document.getElementById("screen-" + name);
    if (!target) return;
    target.hidden = false;
    target.classList.add("is-active");
    window.scrollTo(0, 0);
    current = name;

    if (name === "game") {
      const phase = Number(opts.phase || 1);
      Game.start(phase, { tutorial: !!opts.tutorial });
      focusFirst("#screen-game .ghost-btn");
    } else if (name === "encyclopedia") {
      Encyclopedia.render(store.unlockedPhase, opts.focus);
      focusFirst("#screen-encyclopedia h2");
    } else if (name === "menu") {
      UI.hideOverlays && UI.hideOverlays();
      refreshMenuBadges();
      focusFirst("#menu-title");
    } else if (name === "settings") {
      focusFirst("#set-title");
    }
  }

  function focusFirst(sel) {
    const elx = document.querySelector(sel);
    if (elx) { elx.setAttribute("tabindex", "-1"); elx.focus({ preventScroll: true }); }
  }

  function refreshMenuBadges() {
    document.querySelectorAll('.menu-btn[data-phase]').forEach(b => {
      const p = Number(b.dataset.phase);
      if (store.phaseStars && store.phaseStars[p]) b.dataset.done = "1";
      if (b.dataset.tutorial) return;   // o botão de tutorial nunca fica bloqueado
      const sub = b.querySelector(".menu-btn-sub");
      const locked = p > 1 && store.unlockedPhase < p;
      b.disabled = locked;
      if (sub) {
        if (locked) {
          if (!sub.dataset.orig) sub.dataset.orig = sub.textContent;
          sub.textContent = "Bloqueada — conclua a Fase " + (p - 1);
        } else if (sub.dataset.orig) {
          sub.textContent = sub.dataset.orig;
        }
      }
    });
  }

  return { init, go, get current() { return current; } };
})();

/* ---------------- configurações ---------------- */
function applySettings(store) {
  const s = store.settings;
  const root = document.documentElement;
  root.style.setProperty("--font-scale", s.fontScale || 1);
  root.classList.toggle("contrast", !!s.contrast);
  root.classList.toggle("reduced-motion", !!s.reducedMotion);
  if (window.IMUNOQUEST_AUDIO) IMUNOQUEST_AUDIO.setEnabled(!!s.sound);
}

function wireSettingsForm(store) {
  const form = document.getElementById("settings-form");
  const s = store.settings;
  form.speed.value = String(s.speed);
  form.timemode.checked = !!s.timemode;
  form.fontScale.value = String(s.fontScale);
  form.contrast.checked = !!s.contrast;
  form.reducedMotion.checked = !!s.reducedMotion;
  form.sound.checked = !!s.sound;

  form.addEventListener("change", () => {
    s.speed = Number(form.speed.value);
    s.timemode = form.timemode.checked;
    s.fontScale = Number(form.fontScale.value);
    s.contrast = form.contrast.checked;
    s.reducedMotion = form.reducedMotion.checked;
    s.sound = form.sound.checked;
    IMUNOQUEST_STORE.save(store);
    applySettings(store);
    const tm = document.getElementById("btn-timemode");
    if (tm) {
      tm.classList.toggle("is-on", s.timemode);
      tm.setAttribute("aria-pressed", String(s.timemode));
    }
  });

  document.getElementById("settings-reset").addEventListener("click", () => {
    if (confirm("Isto apaga o progresso e as configurações salvos neste aparelho. Continuar?")) {
      IMUNOQUEST_STORE.reset();
      location.reload();
    }
  });
}

/* ---------------- boot ---------------- */
document.addEventListener("DOMContentLoaded", function () {
  const store = IMUNOQUEST_STORE.load();

  applySettings(store);
  Router.init(store);
  Game.boot(store);
  UI.init();
  wireSettingsForm(store);

  document.addEventListener("click", function (ev) {
    const btn = ev.target.closest("[data-goto]");
    if (!btn) return;
    Router.go(btn.dataset.goto, {
      phase: btn.dataset.phase,
      tutorial: btn.dataset.tutorial
    });
  });

  document.getElementById("btn-release").addEventListener("click", () => Game.releaseWave());
  document.getElementById("btn-febre").addEventListener("click", () => Game.activateFever());
  document.getElementById("btn-soro").addEventListener("click", () => Game.activateSoro());
  document.getElementById("btn-pause").addEventListener("click", () => Game.togglePause());
  document.getElementById("btn-speed").addEventListener("click", () => Game.cycleSpeed());
  document.getElementById("pause-resume").addEventListener("click", () => Game.togglePause());
  document.getElementById("btn-restart-phase").addEventListener("click", () => {
    document.getElementById("overlay-confirm-restart").hidden = false;
    document.getElementById("confirm-restart-go").focus({ preventScroll: true });
  });
  document.getElementById("confirm-restart-cancel").addEventListener("click", () => {
    document.getElementById("overlay-confirm-restart").hidden = true;
  });
  document.getElementById("confirm-restart-go").addEventListener("click", () => {
    document.getElementById("overlay-confirm-restart").hidden = true;
    Game.restartPhase();
  });
  document.getElementById("rotate-hint-close").addEventListener("click", () => {
    document.getElementById("rotate-hint").hidden = true;
  });
  document.getElementById("btn-help").addEventListener("click", () => Game.openHelp());
  document.getElementById("help-close").addEventListener("click", () => Game.closeHelp());
  document.getElementById("btn-timemode").addEventListener("click", (e) => {
    store.settings.timemode = !store.settings.timemode;
    IMUNOQUEST_STORE.save(store);
    e.currentTarget.classList.toggle("is-on", store.settings.timemode);
    e.currentTarget.setAttribute("aria-pressed", String(store.settings.timemode));
  });

  Router.init(store);
  Router.go("menu");
});

if (typeof window !== "undefined") window.Router = Router;
