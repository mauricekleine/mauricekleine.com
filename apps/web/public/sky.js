// the sky: stars, a nebula and whatever passes by, printed as a 1-bit screen in the opener's band.
// flat where you read, screened where you look. descended from a 2022 note ("Foals / Sleeping Giants
// star particles"). yes, this is overengineered for a personal site. that's the point.
(() => {
  const canvas = document.getElementById("sky");
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");

  const CONSOLE_INK = "font-family:'Fragment Mono',ui-monospace,monospace;font-size:12px;line-height:1.7;";
  const CONSOLE_PLUM = `color:#aa337a;${CONSOLE_INK}`;

  // the page talks back wherever a sky prints. the graveyard and the portrait can live without one
  const graveGlyphs = document.querySelectorAll(".graveyard .glyph");
  if (graveGlyphs.length) {
    // dead stars occasionally go supernova. they earned it
    (function scheduleSupernova() {
      setTimeout(() => {
        if (!document.hidden && !reduced.matches) {
          const glyph = graveGlyphs[Math.floor(Math.random() * graveGlyphs.length)];
          glyph.classList.add("supernova");
          setTimeout(() => glyph.classList.remove("supernova"), 1700);
        }
        scheduleSupernova();
      }, 14000 + Math.random() * 18000);
    })();
  }

  // click the portrait -> solar eclipse. why? why not
  const portrait = document.querySelector(".portrait-wrap");
  if (portrait) {
    portrait.addEventListener("click", () => {
      if (reduced.matches) return;
      portrait.classList.remove("eclipsing");
      void portrait.offsetWidth; // restart the animation
      portrait.classList.add("eclipsing");
    });
    portrait.addEventListener("animationend", () => portrait.classList.remove("eclipsing"));
  }

  if (!canvas) return;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  canvas.dataset.live = ""; // the live sky takes over from the printed plate

  // the master's 4 x 4 bayer matrix: every tint here is a screen of one ink
  const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5].map((v) => (v + 0.5) / 16);
  const screen = (x, y) => BAYER[(((y & 3) << 2) | (x & 3)) >>> 0];

  const BEAT = 60000 / 174; // fluncle runs at 174bpm
  const PULSE_BEATS = 16;
  const FRAME = 1000 / 24;
  const TILE = 512; // the nebula's noise tiles at this size, so it can drift forever

  let W = 0;
  let H = 0;
  let stars = [];
  let field = new Float32Array(TILE * TILE);
  let image = null;
  let first = [22, 24, 29];
  let plum = [170, 51, 122];
  let rafId = null;
  let lastFrame = -FRAME;
  let visible = true;
  let meteor = null;
  let nextMeteorAt = 0;
  let pulseStart = -1;
  let flyby = null;
  let nextTrafficAt = 0;
  const pointer = { tx: 0, ty: 0, x: 0, y: 0 };

  // --- the inks follow the mode ----------------------------------------------
  function resolveInk(name) {
    const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
    ctx.clearRect(0, 0, 1, 1);
    ctx.fillStyle = value;
    ctx.fillRect(0, 0, 1, 1);
    const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data;
    ctx.clearRect(0, 0, 1, 1);
    return [r, g, b];
  }

  function readInks() {
    first = resolveInk("--first");
    plum = resolveInk("--primary");
  }

  function dot(x, y, ink) {
    if (x < 0 || y < 0 || x >= W || y >= H) return;
    const at = ((y | 0) * W + (x | 0)) * 4;
    image.data[at] = ink[0];
    image.data[at + 1] = ink[1];
    image.data[at + 2] = ink[2];
    image.data[at + 3] = 255;
  }

  // --- the nebula: tiling value noise, folded into ridges ---------------------
  function makeField() {
    const size = 32;
    const lattice = Float32Array.from({ length: size * size }, () => Math.random());
    const noise = (x, y, cells) => {
      const u = (x / TILE) * cells;
      const v = (y / TILE) * cells;
      const x0 = Math.floor(u);
      const y0 = Math.floor(v);
      const fx = u - x0;
      const fy = v - y0;
      const sx = fx * fx * (3 - 2 * fx);
      const sy = fy * fy * (3 - 2 * fy);
      const at = (i, j) => lattice[(((j % cells) + cells) % cells) * size + ((i % cells) + cells) % cells];
      const top = at(x0, y0) + (at(x0 + 1, y0) - at(x0, y0)) * sx;
      const bottom = at(x0, y0 + 1) + (at(x0 + 1, y0 + 1) - at(x0, y0 + 1)) * sx;
      return top + (bottom - top) * sy;
    };
    for (let y = 0; y < TILE; y++) {
      for (let x = 0; x < TILE; x++) {
        const warp = noise(x, y, 4) * 90;
        const bend = noise(y, x, 4) * 90;
        const fbm =
          noise(x + warp, y + bend, 6) * 0.55 + noise(x + bend, y - warp, 12) * 0.3 + noise(x, y, 24) * 0.15;
        const ridge = 1 - Math.abs(fbm * 2 - 1);
        field[y * TILE + x] = Math.pow(ridge, 7) * 0.72;
      }
    }
  }

  function makeStars() {
    const count = Math.min(220, Math.round((W * H) / 900));
    stars = Array.from({ length: count }, () => {
      const depth = 0.3 + Math.random() * 0.7; // far..near
      return {
        x: Math.random() * W,
        y: Math.random() * H,
        size: Math.random() < 0.06 ? 2 : Math.random() < 0.22 ? 1 : 0,
        depth,
        alpha: 0.35 + Math.random() * 0.65,
        phase: Math.random() * Math.PI * 2,
        speed: 0.4 + Math.random() * 1.1,
        drift: 0.0012 + Math.random() * 0.003,
      };
    });
  }

  function drawStar(x, y, size, ink) {
    dot(x, y, ink);
    if (size < 1) return;
    dot(x - 1, y, ink);
    dot(x + 1, y, ink);
    dot(x, y - 1, ink);
    dot(x, y + 1, ink);
    if (size < 2) return;
    dot(x - 2, y, ink);
    dot(x + 2, y, ink);
    dot(x, y - 2, ink);
    dot(x, y + 2, ink);
  }

  // --- meteors ---------------------------------------------------------------
  function spawnMeteor(t) {
    const angle = Math.PI * (0.65 + Math.random() * 0.2); // down-left
    meteor = { fromX: W * (0.15 + Math.random() * 0.7), fromY: H * (0.05 + Math.random() * 0.3), angle, start: t, duration: 750 };
    nextMeteorAt = t + 9000 + Math.random() * 16000;
  }

  function spawnMeteorAt(x, y, t) {
    meteor = { fromX: x, fromY: y, angle: Math.PI * (0.6 + Math.random() * 0.3), start: t, duration: 700 };
    nextMeteorAt = Math.max(nextMeteorAt, t + 5000);
  }

  function drawMeteor(t) {
    const p = (t - meteor.start) / meteor.duration;
    if (p >= 1) {
      meteor = null;
      return;
    }
    const dist = 130 + 90 * p;
    const x = meteor.fromX + Math.cos(meteor.angle) * dist * p;
    const y = meteor.fromY - Math.sin(meteor.angle) * dist * p;
    const tail = 70 * (1 - p * 0.4);
    for (let i = 0; i < tail; i++) {
      const tx = Math.round(x - Math.cos(meteor.angle) * i);
      const ty = Math.round(y + Math.sin(meteor.angle) * i);
      if (1 - i / tail > screen(tx, ty)) dot(tx, ty, i < 8 ? plum : first);
    }
  }

  // --- sky traffic: starlink trains, the iss, unidentified visitors --------
  const UFO_ON = [
    "......ccc......",
    ".....c...c.....",
    "..ccccccccccc..",
    ".c.c.c.c.c.c.c.",
    "ccccccccccccccc",
    "..e...e...e....",
  ];
  const UFO_OFF = UFO_ON.slice(0, 5).concat("....e...e...e..");
  const ISS = [
    "cc.cc.........cc.cc",
    "cc.cc.........cc.cc",
    "cc.cc....c....cc.cc",
    "cc.ccc.ccccc.ccc.cc",
    "cc.cc....c....cc.cc",
    "cc.cc.........cc.cc",
    "cc.cc.........cc.cc",
  ];
  const trafficSeen = { starlink: false, iss: false, ufo: false };
  const TRAFFIC_LOGS = {
    starlink: "starlink train overhead. one wish per satellite.",
    iss: "the iss just passed by. it comes around every 92 minutes.",
    ufo: "you saw nothing.",
  };

  function drawSprite(rows, x, y) {
    const left = Math.round(x - rows[0].length / 2);
    const top = Math.round(y - rows.length / 2);
    rows.forEach((row, j) => {
      for (let i = 0; i < row.length; i++) {
        if (row[i] === "c") dot(left + i, top + j, first);
        if (row[i] === "e") dot(left + i, top + j, plum);
      }
    });
  }

  function pickTrafficType() {
    const r = Math.random();
    if (r < 0.45) return "iss";
    if (r < 0.8) return "starlink";
    return "ufo";
  }

  function spawnTraffic(t, forceType) {
    const type = forceType || (!trafficSeen.starlink ? "starlink" : pickTrafficType());
    const dir = Math.random() < 0.5 ? 1 : -1;
    const y0 = H * (0.15 + Math.random() * 0.4);
    const slope = (Math.random() - 0.5) * 0.16;
    if (type === "starlink") {
      flyby = { type, start: t, duration: 26000, dir, y0, slope, count: 24 + Math.floor(Math.random() * 10), spacing: 11 };
    } else if (type === "iss") {
      flyby = { type, start: t, duration: 14000, dir, y0, slope };
    } else {
      flyby = { type, start: t, duration: 11000, yBase: y0, xHover: W * (0.3 + Math.random() * 0.3) };
    }
    if (!trafficSeen[type]) {
      trafficSeen[type] = true;
      console.log(`%c${TRAFFIC_LOGS[type]}`, CONSOLE_PLUM);
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
      const head = f.dir > 0 ? -120 + span * p : W + 120 - span * p;
      for (let i = 0; i < f.count; i++) {
        const x = Math.round(head - f.dir * i * (f.spacing + (i % 3)));
        const arc = Math.sin(Math.PI * Math.min(Math.max(x / W, 0), 1)) * 12;
        dot(x, Math.round(f.y0 + f.slope * (x - W / 2) - arc), first);
      }
    } else if (f.type === "iss") {
      const x = f.dir > 0 ? -30 + (W + 60) * p : W + 30 - (W + 60) * p;
      drawSprite(ISS, x, f.y0 + f.slope * (x - W / 2));
    } else {
      // ufo: drifts in, hovers, thinks about it, leaves very fast
      const bob = Math.sin(t / 260) * 3;
      let x = f.xHover + Math.sin(t / 500) * 4;
      let y = f.yBase + bob;
      if (p < 0.35) {
        x = -40 + (f.xHover + 40) * (1 - Math.pow(1 - p / 0.35, 3));
      } else if (p >= 0.68) {
        const e = Math.pow((p - 0.68) / 0.32, 3);
        x = f.xHover + (W * 0.6 + 80) * e;
        y = f.yBase + bob - (H + 80) * e;
      }
      drawSprite(Math.floor(t / 280) % 2 ? UFO_ON : UFO_OFF, x, y);
    }
  }

  // --- frame -----------------------------------------------------------------
  function drawFrame(t) {
    const animate = !reduced.matches;
    image.data.fill(0);

    if (animate) {
      pointer.x += (pointer.tx - pointer.x) * 0.08;
      pointer.y += (pointer.ty - pointer.y) * 0.08;
    }

    // the "dnb" pulse: one hit per beat, decaying, 16 beats total
    let boost = 0;
    if (animate && pulseStart >= 0) {
      const pt = t - pulseStart;
      const total = BEAT * PULSE_BEATS;
      if (pt >= total) pulseStart = -1;
      else boost = Math.pow(1 - (pt % BEAT) / BEAT, 3) * Math.min(1, (total - pt) / (BEAT * 2));
    }

    const shift = animate ? Math.floor(t * 0.0022) : 0;
    const lift = 1 + boost * 0.9;
    for (let y = 0; y < H; y++) {
      for (let x = 0; x < W; x++) {
        const value = field[((y & (TILE - 1)) * TILE + ((x + shift) & (TILE - 1))) | 0] * lift;
        if (value > screen(x, y)) dot(x, y, plum);
      }
    }

    for (const s of stars) {
      const twinkle = animate ? 0.72 + 0.28 * Math.sin(s.phase + (t / 1000) * s.speed) : 0.85;
      const driftY = animate ? (t * s.drift * s.depth) % (H + 4) : 0;
      const x = Math.round(s.x + pointer.x * 10 * s.depth);
      let y = s.y - driftY;
      if (y < -2) y += H + 4;
      y = Math.round(y + pointer.y * 6 * s.depth);
      if (s.size === 0 && Math.min(1, s.alpha * twinkle) < screen(x, y)) continue;
      drawStar(x, y, s.size + (boost > 0.35 ? 1 : 0), first);
    }

    if (animate) {
      if (!meteor && t > nextMeteorAt) spawnMeteor(t);
      if (meteor) drawMeteor(t);
      if (!flyby && nextTrafficAt > 0 && t > nextTrafficAt) spawnTraffic(t);
      if (flyby) drawTraffic(t);
    }
    ctx.putImageData(image, 0, 0);
  }

  function loop(t) {
    rafId = requestAnimationFrame(loop);
    if (t - lastFrame < FRAME) return;
    lastFrame = t;
    drawFrame(t);
  }

  function start() {
    if (rafId !== null) return;
    if (reduced.matches) {
      drawFrame(0);
      return;
    }
    if (!visible || document.hidden) return;
    const now = performance.now();
    if (nextMeteorAt === 0) nextMeteorAt = now + 4000 + Math.random() * 8000;
    // first pass is always a starlink train, fairly soon. worth the wait
    if (nextTrafficAt === 0) nextTrafficAt = now + 45000 + Math.random() * 45000;
    rafId = requestAnimationFrame(loop);
  }

  function stop() {
    if (rafId === null) return;
    cancelAnimationFrame(rafId);
    rafId = null;
  }

  // the band crops the sky to whole pixels, so a screen never lands on a fraction
  function resize() {
    W = Math.max(1, Math.round(canvas.clientWidth));
    H = Math.max(1, Math.round(canvas.clientHeight));
    canvas.width = W;
    canvas.height = H;
    image = ctx.createImageData(W, H);
    readInks();
    makeStars();
    drawFrame(reduced.matches ? 0 : performance.now());
  }

  window.addEventListener("resize", resize);
  canvas.addEventListener("pointermove", (e) => {
    const box = canvas.getBoundingClientRect();
    pointer.tx = (e.clientX - box.left) / box.width - 0.5;
    pointer.ty = (e.clientY - box.top) / box.height - 0.5;
  });
  document.addEventListener("visibilitychange", () => (document.hidden ? stop() : start()));
  reduced.addEventListener("change", () => {
    stop();
    start();
  });
  // nothing to print while the band is off the page
  new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    if (visible) start();
    else stop();
  }).observe(canvas);
  // the mode flips the inks, and a still sky has no next frame to pick them up
  new MutationObserver(() => {
    readInks();
    drawFrame(reduced.matches ? 0 : performance.now());
  }).observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });

  // click the sky, make a wish
  let wished = false;
  canvas.addEventListener("click", (e) => {
    if (reduced.matches) return;
    const box = canvas.getBoundingClientRect();
    spawnMeteorAt(e.clientX - box.left, e.clientY - box.top, performance.now());
    if (!wished) {
      wished = true;
      console.log("%cwish logged. results not guaranteed.", CONSOLE_PLUM);
    }
  });

  // type "dnb" -> the sky pulses at 174bpm for 16 beats
  let typed = "";
  window.addEventListener("keydown", (e) => {
    if (e.metaKey || e.ctrlKey || e.altKey || e.key.length !== 1) return;
    if (e.target instanceof Element && e.target.closest("input, textarea")) return;
    typed = (typed + e.key.toLowerCase()).slice(-3);
    if (typed === "dnb") {
      typed = "";
      if (reduced.matches) return;
      pulseStart = performance.now();
      console.log("%c174bpm. fluncle would approve.", CONSOLE_PLUM);
    }
  });

  // for the nerds who open the console. hi
  console.log(
    "%c" +
      "\n     ✦ mockly              fluncle ✦" +
      "\n         ·      .     ✧     ." +
      "\n      .        the night sky       ·" +
      "\n         ✧      ·     .      ." +
      "\n     ✦ hackadam         nonobench ✦\n" +
      "%c\n" +
      "prerendered html, css, and one canvas of 1-bit stars.\n" +
      'secrets: type "dnb" · click the sky · click the portrait\n' +
      "impatient? window.sky.traffic('starlink' | 'iss' | 'ufo')\n" +
      "source: https://github.com/mauricekleine/mauricekleine.com\n" +
      "for robots: https://www.mauricekleine.com/llms.txt\n",
    CONSOLE_PLUM,
    CONSOLE_INK,
  );

  // for the impatient (and for testing): summon sky traffic yourself
  window.sky = {
    traffic(type) {
      if (reduced.matches) return "reduced motion is on. the sky stays still.";
      if (!["starlink", "iss", "ufo"].includes(type)) return "options: 'starlink', 'iss', 'ufo'";
      spawnTraffic(performance.now(), type);
      return "look up.";
    },
  };

  makeField();
  resize();
  start();
})();
