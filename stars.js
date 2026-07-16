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

  // --- sky traffic: starlink trains, the iss, unidentified visitors --------
  function makeSprite(rows, palette, scale) {
    const h = rows.length;
    const w = rows[0].length;
    const c = document.createElement("canvas");
    c.width = w * scale;
    c.height = h * scale;
    const g = c.getContext("2d");
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const col = palette[rows[y][x]];
        if (!col) continue;
        g.fillStyle = col;
        g.fillRect(x * scale, y * scale, scale, scale);
      }
    }
    return c;
  }

  const UFO_PALETTE = {
    c: "#cfd9f2",
    d: "#8d96b8",
    s: "#5b6280",
    e: "#f2b276",
  };
  const UFO_ROWS_ON = [
    "......ccc......",
    ".....cdddc.....",
    "..ddddddddddd..",
    ".ddddddddddddd.",
    "sssssssssssssss",
    "..e...e...e....",
  ];
  const UFO_ROWS_OFF = [
    "......ccc......",
    ".....cdddc.....",
    "..ddddddddddd..",
    ".ddddddddddddd.",
    "sssssssssssssss",
    "....e...e...e..",
  ];
  const UFO_ON = makeSprite(UFO_ROWS_ON, UFO_PALETTE, 2);
  const UFO_OFF = makeSprite(UFO_ROWS_OFF, UFO_PALETTE, 2);

  const ISS_SPRITE = makeSprite(
    [
      "gg.gg.........gg.gg",
      "gg.gg.........gg.gg",
      "gg.gg....w....gg.gg",
      "gg.ggtttwwwtttgg.gg",
      "gg.gg....w....gg.gg",
      "gg.gg.........gg.gg",
      "gg.gg.........gg.gg",
    ],
    { g: "#d9a05a", t: "#9aa0b8", w: "#ece9e0" },
    2
  );

  // nano-banana renders (gemini image gen, fluncle-style workflow).
  // the hand-drawn pixels above stay as the fallback while these load.
  const UFO_IMG = new Image();
  UFO_IMG.src = "/sprites/ufo.png";
  const ISS_IMG = new Image();
  ISS_IMG.src = "/sprites/iss.png";
  const spriteReady = (img) => img.complete && img.naturalWidth > 0;

  let flyby = null;
  let nextTrafficAt = 0;
  const trafficSeen = { starlink: false, iss: false, ufo: false };
  const TRAFFIC_LOGS = {
    starlink: "starlink train overhead. one wish per satellite.",
    iss: "the iss just passed by. it comes around every 92 minutes.",
    ufo: "you saw nothing.",
  };

  function pickTrafficType() {
    const r = Math.random();
    if (r < 0.45) return "iss";
    if (r < 0.8) return "starlink";
    return "ufo";
  }

  function spawnTraffic(t, forceType) {
    const type =
      forceType || (!trafficSeen.starlink ? "starlink" : pickTrafficType());
    const dir = Math.random() < 0.5 ? 1 : -1;
    if (type === "starlink") {
      flyby = {
        type,
        start: t,
        duration: 34000,
        dir,
        y0: H * (0.1 + Math.random() * 0.25),
        slope: (Math.random() - 0.5) * 0.16,
        count: 24 + Math.floor(Math.random() * 10),
        spacing: 15,
      };
    } else if (type === "iss") {
      flyby = {
        type,
        start: t,
        duration: 19000,
        dir,
        y0: H * (0.12 + Math.random() * 0.3),
        slope: (Math.random() - 0.5) * 0.2,
      };
    } else {
      flyby = {
        type,
        start: t,
        duration: 13000,
        yBase: H * (0.16 + Math.random() * 0.28),
        xHover: W * (0.4 + Math.random() * 0.3),
      };
    }
    if (!trafficSeen[type]) {
      trafficSeen[type] = true;
      console.log("%c" + TRAFFIC_LOGS[type], CONSOLE_EMBER);
    }
  }

  function drawTraffic(t) {
    const f = flyby;
    const p = (t - f.start) / f.duration;
    if (p >= 1) {
      flyby = null;
      nextTrafficAt = t + 150000 + Math.random() * 210000;
      return;
    }

    if (f.type === "starlink") {
      const span = W + 240 + f.count * f.spacing;
      const headX = f.dir > 0 ? -120 + span * p : W + 120 - span * p;
      for (let i = 0; i < f.count; i++) {
        const x = headX - f.dir * i * (f.spacing + (i % 3));
        const q = x / W;
        if (q < -0.02 || q > 1.02) continue;
        const qc = Math.min(Math.max(q, 0), 1);
        const y =
          f.y0 + f.slope * (x - W / 2) - Math.sin(Math.PI * qc) * 22;
        const a =
          0.85 * Math.min(Math.max(Math.min(q, 1 - q) / 0.12, 0), 1);
        if (a <= 0) continue;
        ctx.beginPath();
        ctx.arc(x, y, i === 0 ? 1.3 : 1, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(240, 243, 252, ${a})`;
        ctx.fill();
      }
    } else if (f.type === "iss") {
      const x = f.dir > 0 ? -30 + (W + 60) * p : W + 30 - (W + 60) * p;
      const y = f.y0 + f.slope * (x - W / 2);
      const glint = Math.exp(-Math.pow((p - 0.5) / 0.07, 2));
      const a = Math.min(p / 0.06, (1 - p) / 0.06, 1);
      ctx.globalAlpha = a * 0.95;
      if (glint > 0.05) {
        ctx.beginPath();
        ctx.arc(x, y, 10 + glint * 14, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(242, 200, 150, ${glint * 0.12})`;
        ctx.fill();
      }
      const spr = spriteReady(ISS_IMG) ? ISS_IMG : ISS_SPRITE;
      ctx.drawImage(
        spr,
        Math.round(x - spr.width / 2),
        Math.round(y - spr.height / 2)
      );
      ctx.globalAlpha = 1;
    } else {
      // ufo: drifts in, hovers, thinks about it, leaves very fast
      const bob = Math.sin(t / 260) * 5;
      let x;
      let y;
      if (p < 0.35) {
        const q = p / 0.35;
        const e = 1 - Math.pow(1 - q, 3);
        x = -40 + (f.xHover + 40) * e;
        y = f.yBase + bob;
      } else if (p < 0.68) {
        x = f.xHover + Math.sin(t / 500) * 6;
        y = f.yBase + bob;
      } else {
        const q = (p - 0.68) / 0.32;
        const e = q * q * q;
        x = f.xHover + (W * 0.6 + 80) * e;
        y = f.yBase + bob - (H * 0.5 + 80) * e;
      }
      const png = spriteReady(UFO_IMG);
      const blink = Math.floor(t / 280) % 2;
      const spr = png ? UFO_IMG : blink ? UFO_ON : UFO_OFF;
      ctx.globalAlpha = Math.min(p / 0.05, 1);
      ctx.drawImage(
        spr,
        Math.round(x - spr.width / 2),
        Math.round(y - spr.height / 2)
      );
      if (png) {
        // blinking rim lights over the render
        ctx.fillStyle = "rgba(242, 178, 118, 0.9)";
        for (let i = -2; i <= 2; i++) {
          if ((i + 2) % 2 !== blink) continue;
          ctx.fillRect(Math.round(x + i * 9 - 1), Math.round(y + 2), 2, 2);
        }
      }
      ctx.globalAlpha = 1;
    }
  }

  // --- frame -------------------------------------------------------------------
  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = window.innerWidth;
    H = window.innerHeight;
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.imageSmoothingEnabled = false; // sprites stay chunky
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
      if (!flyby && nextTrafficAt > 0 && t > nextTrafficAt) spawnTraffic(t);
      if (flyby) drawTraffic(t);
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
    if (nextTrafficAt === 0) {
      // first pass is always a starlink train, fairly soon. worth the wait
      nextTrafficAt = performance.now() + 45000 + Math.random() * 45000;
    }
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
      "impatient? window.sky.traffic('starlink' | 'iss' | 'ufo')\n" +
      "source: https://github.com/mauricekleine/mauricekleine.com\n" +
      "for robots: https://www.mauricekleine.com/llms.txt\n",
    CONSOLE_EMBER,
    CONSOLE_DIM
  );

  // for the impatient (and for testing): summon sky traffic yourself
  window.sky = {
    traffic(type) {
      if (reduced.matches) return "reduced motion is on. the sky stays still.";
      if (!["starlink", "iss", "ufo"].includes(type)) {
        return "options: 'starlink', 'iss', 'ufo'";
      }
      spawnTraffic(performance.now(), type);
      return "look up.";
    },
  };

  resize();
  start();
})();
