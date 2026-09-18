/* ============================================================
   engine.js — laço de jogo e canvas. Genérico: não conhece regras.
   Trabalha num espaço lógico fixo de 960 x 600; o CSS escala o canvas.
   ============================================================ */

const LOGICAL_W = 960;
const LOGICAL_H = 600;

const Engine = (function () {
  let canvas, ctx, dpr = 1;
  let running = false, paused = false;
  let speed = 1;
  let last = 0;
  let cbUpdate = null, cbRender = null;
  let rafId = 0;

  function init(cv) {
    canvas = cv;
    ctx = canvas.getContext("2d");
    resize();
    window.addEventListener("resize", resize);
  }

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = LOGICAL_W * dpr;
    canvas.height = LOGICAL_H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function start(cbs) {
    cbUpdate = cbs.update;
    cbRender = cbs.render;
    running = true;
    paused = false;
    last = performance.now();
    cancelAnimationFrame(rafId);
    rafId = requestAnimationFrame(frame);
  }

  function stop() {
    running = false;
    cancelAnimationFrame(rafId);
  }

  function frame(now) {
    if (!running) return;
    rafId = requestAnimationFrame(frame);
    let dt = (now - last) / 1000;
    last = now;
    if (dt > 0.05) dt = 0.05;            // evita saltos após aba em segundo plano
    if (!paused) {
      cbUpdate(dt * speed);
    }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, LOGICAL_W, LOGICAL_H);
    cbRender(ctx);
  }

  /* passo manual — usado por testes/depuração (não é chamado no jogo normal) */
  function tick(dt) {
    if (cbUpdate) cbUpdate(dt);
    if (cbRender) {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, LOGICAL_W, LOGICAL_H);
      cbRender(ctx);
    }
  }

  function setPaused(v) { paused = !!v; }
  function isPaused() { return paused; }
  function setSpeed(mult) { speed = mult; }

  function toLogical(clientX, clientY) {
    const r = canvas.getBoundingClientRect();
    return {
      x: ((clientX - r.left) / r.width) * LOGICAL_W,
      y: ((clientY - r.top) / r.height) * LOGICAL_H
    };
  }

  return { init, start, stop, tick, setPaused, isPaused, setSpeed, toLogical,
           get ctx() { return ctx; }, W: LOGICAL_W, H: LOGICAL_H };
})();

if (typeof window !== "undefined") {
  window.Engine = Engine;
  window.LOGICAL_W = LOGICAL_W;
  window.LOGICAL_H = LOGICAL_H;
}
