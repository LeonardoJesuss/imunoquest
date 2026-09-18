/* ============================================================
   audio.js — efeitos sonoros gerados por código (Web Audio API).
   Nenhum arquivo de áudio: zero dependência externa, funciona offline.
   Todo som respeita a preferência "sound" das Configurações.
   ============================================================ */

const IMUNOQUEST_AUDIO = (function () {
  let ctx = null;
  let enabled = true;

  function ensure() {
    if (!ctx) {
      try {
        ctx = new (window.AudioContext || window.webkitAudioContext)();
      } catch (e) {
        ctx = null;
      }
    }
    if (ctx && ctx.state === "suspended") ctx.resume();
    return ctx;
  }

  function setEnabled(v) { enabled = !!v; }

  function blip(freq, dur, type, gain) {
    if (!enabled) return;
    const ac = ensure();
    if (!ac) return;
    const osc = ac.createOscillator();
    const g = ac.createGain();
    osc.type = type || "sine";
    osc.frequency.value = freq;
    g.gain.value = 0.0001;
    osc.connect(g).connect(ac.destination);
    const t = ac.currentTime;
    const peak = gain == null ? 0.14 : gain;
    g.gain.exponentialRampToValueAtTime(peak, t + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    osc.start(t);
    osc.stop(t + dur + 0.02);
  }

  function chord(freqs, dur, type) {
    freqs.forEach((f, i) => setTimeout(() => blip(f, dur, type, 0.1), i * 60));
  }

  const api = {
    setEnabled,
    click:   () => blip(320, 0.06, "square", 0.06),
    place:   () => blip(520, 0.12, "triangle", 0.12),
    phago:   () => blip(180, 0.14, "sine", 0.12),
    blocked: () => blip(240, 0.10, "sine", 0.10),
    alert:   () => blip(160, 0.22, "sawtooth", 0.10),
    leak:    () => { blip(120, 0.18, "sawtooth", 0.12); },
    waveStart: () => chord([300, 380], 0.14, "triangle"),
    win:     () => chord([392, 523, 659, 784], 0.30, "triangle"),
    fail:    () => chord([300, 240, 180], 0.34, "sine")
  };

  return api;
})();

if (typeof window !== "undefined") window.IMUNOQUEST_AUDIO = IMUNOQUEST_AUDIO;
