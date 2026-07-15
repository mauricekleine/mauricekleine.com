// night garden: star particles behind the page.
// descended from a 2022 note ("Foals / Sleeping Giants star particles").
(() => {
  const canvas = document.getElementById("stars");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");

  const COLORS = [
    { rgb: "236, 236, 246", weight: 0.82 }, // starlight
    { rgb: "242, 178, 118", weight: 0.12 }, // ember
    { rgb: "170, 190, 255", weight: 0.06 }, // faint blue
  ];

  let W = 0;
  let H = 0;
  let stars = [];
  let rafId = null;
  let meteor = null;
  let nextMeteorAt = 0;

  const pointer = { tx: 0, ty: 0, x: 0, y: 0 };

  function pickColor() {
    let r = Math.random();
    for (const c of COLORS) {
      if (r < c.weight) return c.rgb;
      r -= c.weight;
    }
    return COLORS[0].rgb;
  }

  function makeStars() {
    const count = Math.min(220, Math.round((W * H) / 8500));
    stars = Array.from({ length: count }, () => {
      const depth = 0.3 + Math.random() * 0.7; // far..near
      return {
        x: Math.random() * W,
        y: Math.random() * H,
        r: (0.4 + Math.pow(Math.random(), 2.2) * 1.15) * (0.6 + depth * 0.6),
        depth,
        alpha: 0.25 + Math.random() * 0.65,
        phase: Math.random() * Math.PI * 2,
        speed: 0.4 + Math.random() * 1.1,
        drift: 0.004 + Math.random() * 0.01,
        color: pickColor(),
      };
    });
  }

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = window.innerWidth;
    H = window.innerHeight;
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    makeStars();
    if (reduced.matches) drawFrame(0);
  }

  function spawnMeteor(t) {
    const fromX = W * (0.15 + Math.random() * 0.7);
    const fromY = H * (0.05 + Math.random() * 0.3);
    const angle = Math.PI * (0.65 + Math.random() * 0.2); // down-left
    meteor = { fromX, fromY, angle, start: t, duration: 750 };
    nextMeteorAt = t + 9000 + Math.random() * 16000;
  }

  function drawMeteor(t) {
    if (!meteor) return;
    const p = (t - meteor.start) / meteor.duration;
    if (p >= 1) {
      meteor = null;
      return;
    }
    const dist = 130 + 90 * p;
    const x = meteor.fromX + Math.cos(meteor.angle) * dist * p;
    const y = meteor.fromY - Math.sin(meteor.angle) * dist * p;
    const tail = 70 * (1 - p * 0.4);
    const tx = x - Math.cos(meteor.angle) * tail;
    const ty = y + Math.sin(meteor.angle) * tail;
    const fade = Math.sin(Math.PI * p); // in and out
    const grad = ctx.createLinearGradient(tx, ty, x, y);
    grad.addColorStop(0, "rgba(242, 178, 118, 0)");
    grad.addColorStop(1, `rgba(242, 200, 150, ${0.55 * fade})`);
    ctx.strokeStyle = grad;
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(tx, ty);
    ctx.lineTo(x, y);
    ctx.stroke();
  }

  function drawFrame(t) {
    ctx.clearRect(0, 0, W, H);
    const animate = !reduced.matches;

    if (animate) {
      pointer.x += (pointer.tx - pointer.x) * 0.035;
      pointer.y += (pointer.ty - pointer.y) * 0.035;
    }

    for (const s of stars) {
      const twinkle = animate
        ? 0.72 + 0.28 * Math.sin(s.phase + (t / 1000) * s.speed)
        : 0.85;
      const driftY = animate ? (t * s.drift * s.depth) % (H + 4) : 0;
      const x = s.x + pointer.x * 14 * s.depth;
      let y = s.y - driftY;
      if (y < -2) y += H + 4;
      const py = y + pointer.y * 9 * s.depth;
      const a = s.alpha * twinkle;

      ctx.beginPath();
      ctx.arc(x, py, s.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${s.color}, ${a})`;
      ctx.fill();

      if (s.r > 1.15) {
        ctx.beginPath();
        ctx.arc(x, py, s.r * 3, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${s.color}, ${a * 0.08})`;
        ctx.fill();
      }
    }

    if (animate) {
      if (!meteor && t > nextMeteorAt) spawnMeteor(t);
      drawMeteor(t);
    }
  }

  function loop(t) {
    drawFrame(t);
    rafId = requestAnimationFrame(loop);
  }

  function start() {
    if (rafId !== null) return;
    if (reduced.matches) {
      drawFrame(0);
      return;
    }
    nextMeteorAt = performance.now() + 4000 + Math.random() * 8000;
    rafId = requestAnimationFrame(loop);
  }

  function stop() {
    if (rafId !== null) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
  }

  window.addEventListener("resize", resize);
  window.addEventListener("pointermove", (e) => {
    pointer.tx = e.clientX / W - 0.5;
    pointer.ty = e.clientY / H - 0.5;
  });
  document.addEventListener("visibilitychange", () => {
    document.hidden ? stop() : start();
  });
  reduced.addEventListener("change", () => {
    stop();
    start();
  });

  resize();
  start();
})();
