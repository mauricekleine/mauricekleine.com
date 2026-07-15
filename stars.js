// night garden: star particles behind the page.
// descended from a 2022 note ("Foals / Sleeping Giants star particles").
// yes, this is overengineered for a personal site. that's the point.
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

  const EMBER = "242, 178, 118";
  const EMBER_BRIGHT = "247, 205, 160";
  const BEAT = 60000 / 174; // fluncle runs at 174bpm
  const PULSE_BEATS = 16;

  let W = 0;
  let H = 0;
  let stars = [];
  let rafId = null;
  let meteor = null;
  let nextMeteorAt = 0;
  let pulseStart = -1;

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

  // --- constellations: every side quest has a spot in the sky ---------------
  // hover a project on the page and its constellation lights up out here.
  const SHAPES = {
    mockly: {
      // a slightly wonky chat bubble
      side: -1,
      y: 0.3,
      points: [
        [0, 0],
        [72, 6],
        [66, 46],
        [30, 42],
        [16, 62],
        [4, 40],
      ],
      lines: [
        [0, 1],
        [1, 2],
        [2, 3],
        [3, 4],
        [4, 5],
        [5, 0],
      ],
    },
    fluncle: {
      // a waveform, obviously
      side: 1,
      y: 0.24,
      points: [
        [0, 30],
        [22, 8],
        [38, 40],
        [56, 0],
        [72, 34],
        [92, 14],
      ],
      lines: [
        [0, 1],
        [1, 2],
        [2, 3],
        [3, 4],
        [4, 5],
      ],
    },
    hackadam: {
      // a little clubhouse
      side: -1,
      y: 0.62,
      points: [
        [0, 52],
        [0, 20],
        [34, 0],
        [68, 20],
        [68, 52],
      ],
      lines: [
        [0, 1],
        [1, 2],
        [2, 3],
        [3, 4],
        [4, 0],
      ],
    },
    nonobench: {
      // a nonogram grid. llms can't solve this one either
      side: 1,
      y: 0.58,
      points: [
        [0, 0],
        [30, 0],
        [60, 0],
        [60, 30],
        [60, 60],
        [30, 60],
        [0, 60],
        [0, 30],
      ],
      lines: [
        [0, 2],
        [2, 4],
        [4, 6],
        [6, 0],
        [1, 5],
        [7, 3],
      ],
    },
  };

  const constellations = [];
  const constState = {}; // name -> { target, cur }; survives resize

  function makeConstellations() {
    constellations.length = 0;
    const margin = (W - Math.min(W, 688)) / 2;
    if (margin < 150) return; // no side sky on small screens
    for (const [name, shape] of Object.entries(SHAPES)) {
      const st = (constState[name] ||= { target: 0, cur: 0 });
      let maxX = 0;
      let maxY = 0;
      for (const [px, py] of shape.points) {
        maxX = Math.max(maxX, px);
        maxY = Math.max(maxY, py);
      }
      const cx = shape.side < 0 ? margin * 0.5 : W - margin * 0.5;
      const cy = H * shape.y;
      const pts = shape.points.map(([px, py]) => ({
        x: cx - maxX / 2 + px + (Math.random() * 6 - 3),
        y: cy - maxY / 2 + py + (Math.random() * 6 - 3),
        phase: Math.random() * Math.PI * 2,
      }));
      constellations.push({
        name,
        st,
        pts,
        lines: shape.lines,
        labelX: cx,
        labelY: cy + maxY / 2 + 24,
      });
    }
  }

  function setConstellation(name, target) {
    const st = constState[name];
    if (!st) return;
    st.target = target;
    if (reduced.matches) {
      st.cur = target;
      drawFrame(0);
    }
  }

  function drawConstellations(t, animate) {
    for (const c of constellations) {
      const st = c.st;
      if (animate) {
        st.cur += (st.target - st.cur) * 0.075;
        if (st.cur < 0.003 && st.target === 0) st.cur = 0;
      }
      const cur = st.cur;
      const px = pointer.x * 7;
      const py = pointer.y * 5;
      const reveal = cur * c.lines.length;
      for (let i = 0; i < c.lines.length; i++) {
        const la = Math.min(1, Math.max(0, reveal - i)) * 0.45;
        if (la < 0.02) continue;
        const a = c.pts[c.lines[i][0]];
        const b = c.pts[c.lines[i][1]];
        ctx.strokeStyle = `rgba(${EMBER}, ${la})`;
        ctx.lineWidth = 0.8;
        ctx.beginPath();
        ctx.moveTo(a.x + px, a.y + py);
        ctx.lineTo(b.x + px, b.y + py);
        ctx.stroke();
      }
      for (const p of c.pts) {
        const tw = animate ? 0.75 + 0.25 * Math.sin(p.phase + t / 640) : 0.85;
        const a = (0.14 + 0.8 * cur) * tw;
        ctx.beginPath();
        ctx.arc(p.x + px, p.y + py, 1.1 + cur * 0.6, 0, Math.PI * 2);
        ctx.fillStyle =
          cur > 0.05
            ? `rgba(${EMBER_BRIGHT}, ${a})`
            : `rgba(236, 236, 246, ${a})`;
        ctx.fill();
      }
      if (cur > 0.35) {
        ctx.font = '11px "Fragment Mono", monospace';
        ctx.textAlign = "center";
        ctx.fillStyle = `rgba(${EMBER_BRIGHT}, ${((cur - 0.35) / 0.65) * 0.9})`;
        ctx.fillText(c.name, c.labelX + px, c.labelY + py);
      }
    }
  }

  // --- meteors ---------------------------------------------------------------
  function spawnMeteor(t) {
    const fromX = W * (0.15 + Math.random() * 0.7);
    const fromY = H * (0.05 + Math.random() * 0.3);
    const angle = Math.PI * (0.65 + Math.random() * 0.2); // down-left
    meteor = { fromX, fromY, angle, start: t, duration: 750 };
    nextMeteorAt = t + 9000 + Math.random() * 16000;
  }

  function spawnMeteorAt(x, y, t) {
    const angle = Math.PI * (0.6 + Math.random() * 0.3);
    meteor = { fromX: x, fromY: y, angle, start: t, duration: 700 };
    nextMeteorAt = Math.max(nextMeteorAt, t + 5000);
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

  // --- frame -------------------------------------------------------------------
  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = window.innerWidth;
    H = window.innerHeight;
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    makeStars();
    makeConstellations();
    if (reduced.matches) drawFrame(0);
  }

  function drawFrame(t) {
    ctx.clearRect(0, 0, W, H);
    const animate = !reduced.matches;

    if (animate) {
      pointer.x += (pointer.tx - pointer.x) * 0.035;
      pointer.y += (pointer.ty - pointer.y) * 0.035;
    }

    // the "dnb" pulse: one hit per beat, decaying, 16 beats total
    let boost = 1;
    if (animate && pulseStart >= 0) {
      const pt = t - pulseStart;
      const total = BEAT * PULSE_BEATS;
      if (pt >= total) {
        pulseStart = -1;
      } else {
        const ph = (pt % BEAT) / BEAT;
        const fadeOut = Math.min(1, (total - pt) / (BEAT * 2));
        boost = 1 + 0.55 * Math.pow(1 - ph, 3) * fadeOut;
      }
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
      const a = Math.min(1, s.alpha * twinkle * boost);

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

    drawConstellations(t, animate);

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

  // --- the page talks back ---------------------------------------------------
  const CONSOLE_EMBER =
    "color:#f2b276;font-family:'Fragment Mono',ui-monospace,monospace;font-size:12px;line-height:1.7;";
  const CONSOLE_DIM =
    "color:#a9adc4;font-family:'Fragment Mono',ui-monospace,monospace;font-size:12px;line-height:1.7;";

  // hover (or focus) a side quest -> its constellation lights up
  for (const li of document.querySelectorAll("[data-constellation]")) {
    const name = li.dataset.constellation;
    li.addEventListener("pointerenter", () => setConstellation(name, 1));
    li.addEventListener("pointerleave", () => setConstellation(name, 0));
    li.addEventListener("focusin", () => setConstellation(name, 1));
    li.addEventListener("focusout", () => setConstellation(name, 0));
  }

  // click the empty sky, make a wish
  let wished = false;
  document.addEventListener("click", (e) => {
    if (!(e.target instanceof Element)) return;
    if (e.target.closest("a, button, input, textarea, select, .portrait-wrap"))
      return;
    if (reduced.matches) return;
    spawnMeteorAt(e.clientX, e.clientY, performance.now());
    if (!wished) {
      wished = true;
      console.log("%cwish logged. results not guaranteed.", CONSOLE_EMBER);
    }
  });

  // click the portrait -> solar eclipse. why? why not
  const portraitWrap = document.querySelector(".portrait-wrap");
  if (portraitWrap) {
    portraitWrap.addEventListener("click", () => {
      if (reduced.matches) return;
      portraitWrap.classList.remove("eclipsing");
      void portraitWrap.offsetWidth; // restart the animation
      portraitWrap.classList.add("eclipsing");
    });
    portraitWrap.addEventListener("animationend", () => {
      portraitWrap.classList.remove("eclipsing");
    });
  }

  // dead stars occasionally go supernova. they earned it
  const graveGlyphs = document.querySelectorAll(".graveyard .glyph");
  if (graveGlyphs.length) {
    (function scheduleSupernova() {
      setTimeout(() => {
        if (!document.hidden && !reduced.matches) {
          const g = graveGlyphs[Math.floor(Math.random() * graveGlyphs.length)];
          g.classList.add("supernova");
          setTimeout(() => g.classList.remove("supernova"), 1700);
        }
        scheduleSupernova();
      }, 14000 + Math.random() * 18000);
    })();
  }

  // type "dnb" -> the sky pulses at 174bpm for 16 beats
  let typed = "";
  window.addEventListener("keydown", (e) => {
    if (e.metaKey || e.ctrlKey || e.altKey || e.key.length !== 1) return;
    typed = (typed + e.key.toLowerCase()).slice(-3);
    if (typed === "dnb") {
      typed = "";
      if (reduced.matches) return;
      pulseStart = performance.now();
      console.log("%c174bpm. fluncle would approve.", CONSOLE_EMBER);
    }
  });

  // for the nerds who open the console. hi
  console.log(
    "%c" +
      "\n     ✦ mockly              fluncle ✦" +
      "\n         ·      .     ✧     ." +
      "\n      .      the night garden      ·" +
      "\n         ✧      ·     .      ." +
      "\n     ✦ hackadam         nonobench ✦\n" +
      "%c\n" +
      "hand-written html, css, and one canvas. no build step, no framework.\n" +
      'secrets: type "dnb" · click the sky · click the portrait · hover a side quest\n' +
      "source: https://github.com/mauricekleine/mauricekleine.com\n" +
      "for robots: https://mauricekleine.com/llms.txt\n",
    CONSOLE_EMBER,
    CONSOLE_DIM
  );

  resize();
  start();
})();
