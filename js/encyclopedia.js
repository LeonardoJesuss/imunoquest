/* ============================================================
   encyclopedia.js — "Central do Sistema Imunitário".
   Mostra os verbetes de content.js. Verbetes de fases ainda não
   alcançadas aparecem como bloqueados (sem spoiler do conteúdo).
   ============================================================ */

const Encyclopedia = (function () {
  let currentId = null;

  function entries() { return window.IMUNOQUEST_CONTENT.encyclopedia; }

  function render(unlockedPhase, focusId) {
    const index = document.getElementById("enc-index");
    const body = document.getElementById("enc-body");
    const list = entries();

    index.innerHTML = "";
    list.forEach(e => {
      const unlocked = e.phase <= unlockedPhase;
      const b = document.createElement("button");
      b.type = "button";
      b.textContent = unlocked ? e.title : e.title + " (Fase " + e.phase + ")";
      b.className = unlocked ? "" : "is-locked";
      if (unlocked) b.addEventListener("click", () => show(e.id, unlockedPhase));
      else b.addEventListener("click", () => show(e.id, unlockedPhase));
      b.dataset.id = e.id;
      index.appendChild(b);
    });

    const start = focusId && list.some(e => e.id === focusId)
      ? focusId
      : list.find(e => e.phase <= unlockedPhase).id;
    show(start, unlockedPhase);
  }

  function show(id, unlockedPhase) {
    currentId = id;
    const e = entries().find(x => x.id === id);
    const body = document.getElementById("enc-body");
    document.querySelectorAll("#enc-index button").forEach(b =>
      b.classList.toggle("is-current", b.dataset.id === id));

    const unlocked = e.phase <= unlockedPhase;
    if (!unlocked) {
      body.innerHTML =
        '<div class="enc-entry"><h3>' + esc(e.title) + '</h3>' +
        '<p class="enc-meta">Desbloqueia na Fase ' + e.phase + '</p>' +
        '<p class="enc-locked">Este conceito é trabalhado a partir da Fase ' + e.phase +
        '. Jogue até lá para liberar o verbete completo.</p></div>';
      return;
    }

    body.innerHTML =
      '<div class="enc-entry">' +
        '<h3>' + esc(e.title) + '</h3>' +
        '<p class="enc-meta">Disponível desde a Fase ' + e.phase + '</p>' +
        e.body.map(p => '<p>' + esc(p) + '</p>').join("") +
        '<h4>No jogo</h4><p>' + esc(e.gameLink) + '</p>' +
      '</div>';
  }

  function esc(s) {
    return String(s).replace(/[&<>"']/g, c =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  }

  return { render };
})();

if (typeof window !== "undefined") window.Encyclopedia = Encyclopedia;
