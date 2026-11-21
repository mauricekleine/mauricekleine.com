import { paint, prepare } from "@/components/superthread/lib/field-core";
import { BAYER, GRAIN, readScreenInks, smooth } from "@/components/superthread/lib/screen-core";

// the sky: the night over amsterdam, stars and whatever passes by.
// flat where you read, screened where you look. descended from a 2022 note ("Foals / Sleeping Giants
// star particles"). yes, this is overengineered for a personal site. that's the point.
(() => {
  const canvas = document.getElementById("sky");
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
  const print = window.matchMedia("print");
  const phone = window.matchMedia("(max-width: 600px)");

  const CONSOLE_INK = "font-family:'Fragment Mono',ui-monospace,monospace;font-size:12px;line-height:1.7;";
  const CONSOLE_PLUM = `color:#aa337a;${CONSOLE_INK}`;

  // the page talks back wherever a sky prints. the graveyard and the portrait can live without one
  const graveGlyphs = document.querySelectorAll(".graveyard .glyph");
  if (graveGlyphs.length) {
    // dead stars occasionally go supernova. they earned it
    (function scheduleSupernova() {
      setTimeout(
        () => {
          if (!document.hidden && !reduced.matches && !print.matches) {
            const glyph = graveGlyphs[Math.floor(Math.random() * graveGlyphs.length)];
            glyph.classList.add("supernova");
            setTimeout(() => glyph.classList.remove("supernova"), 1700);
          }
          scheduleSupernova();
        },
        14000 + Math.random() * 18000,
      );
    })();
  }

  // click the portrait -> solar eclipse. why? why not
  const portrait = document.querySelector(".portrait-wrap");
  if (portrait) {
    portrait.addEventListener("click", () => {
      if (reduced.matches || print.matches) return;
      portrait.classList.remove("eclipsing");
      void portrait.offsetWidth; // restart the animation
      portrait.classList.add("eclipsing");
    });
    portrait.addEventListener("animationend", () => portrait.classList.remove("eclipsing"));
  }

  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const screenCanvas = document.createElement("canvas");
  const screenCtx = screenCanvas.getContext("2d");
  const inkProbe = document.createElement("canvas").getContext("2d", { willReadFrequently: true });
  if (!ctx || !screenCtx || !inkProbe) return;

  const desktopSpec =
    "edge=meander+crest base=.815 lift=.16 waves=2 settle=1.34 phase=.65 b.at=.64 b.lift=-.105 b.width=.17 ramp=held reach=.47 thread=1.25 knot=.23 knotr=6 tex=.85 pitch=5.4 spread=.29 seed=57 motion=filaments drift=.27 duration=22";
  const phoneSpec =
    "edge=meander+crest base=.835 lift=.118 waves=1 settle=1.26 phase=.57 b.at=.77 b.lift=-.085 b.width=.25 ramp=held reach=.325 thread=1.15 knot=.25 knotr=5 tex=.64 pitch=6.4 spread=.235 seed=57 motion=filaments drift=.23 duration=22";

  const screen = (x, y) => BAYER[(y & 3) * 4 + (x & 3)];
  const BEAT = 60000 / 174; // fluncle runs at 174bpm
  const PULSE_BEATS = 16;
  const FRAME = 1000 / 24;
  let cell = GRAIN;
  let deviceCell = GRAIN;
  let printing = print.matches;
  let W = 0;
  let H = 0;
  let stars = [];
  let field;
  let fieldLine;
  let cells;
  let image;
  let first;
  let plum;
  let pixels;
  let palette;
  let rafId;
  let lastTick;
  let time = 0;
  let lastFrame = -FRAME;
  let visible = false;
  let meteor = null;
  let nextMeteorAt = 4000 + Math.random() * 8000;
  let pulseStart = -1;
  let flyby = null;
  let nextTrafficAt = 45000 + Math.random() * 45000;
  const pointer = { tx: 0, ty: 0, x: 0, y: 0 };

  function readInks() {
    const style = getComputedStyle(canvas);
    const { screen, thread } = readScreenInks(style, inkProbe);
    plum = thread;
    inkProbe.fillStyle = style.getPropertyValue("--first").trim();
    inkProbe.fillRect(0, 0, 1, 1);
    first = inkProbe.getImageData(0, 0, 1, 1).data;
    // Stock and the solid under the thread both take the island's background.
    palette = new Uint32Array(new Uint8ClampedArray([0, 0, 0, 0, ...screen, 255, ...thread, 255, 0, 0, 0, 0]).buffer);
  }

  function dot(x, y, ink) {
    if (x < 0 || y < 0 || x >= W || y >= H) return;
    const at = ((y | 0) * W + (x | 0)) * 4;
    image.data[at] = ink[0];
    image.data[at + 1] = ink[1];
    image.data[at + 2] = ink[2];
    image.data[at + 3] = 255;
  }

  function makeStars() {
    // Frame zero uses the same star map as the printed plates.
    let seed = 57;
    const random = () => {
      seed = (seed * 16807) % 2147483647;
      return seed / 2147483647;
    };
    const count = Math.min(220, Math.round((W * H * cell * cell) / 900));
    stars = Array.from({ length: count }, () => {
      const depth = 0.3 + random() * 0.7; // far..near
      return {
        x: random() * W,
        y: random() * H,
        size: random() < 0.06 ? 1 : 0,
        depth,
        alpha: 0.35 + random() * 0.65,
        phase: random() * Math.PI * 2,
        speed: 0.4 + random() * 1.1,
        drift: 0.0012 + random() * 0.003,
      };
    });
  }

  function starDistance(x, y) {
    if (x < 0 || y < 0 || x >= W || y >= H) return 0;
    const i = y * W + x;
    // The filaments move across a fixed edge. Stars only print in open sky cells.
    return cells[i] === 0 ? field.staticGeometry.sd[i] : 0;
  }

  function starDot(x, y) {
    if (starDistance(x, y) > 0) dot(x, y, first);
  }

  function drawStar(x, y, size) {
    dot(x, y, first);
    if (size < 1) return;
    starDot(x - 1, y);
    starDot(x + 1, y);
    starDot(x, y - 1);
    starDot(x, y + 1);
    if (size < 2) return;
    starDot(x - 2, y);
    starDot(x + 2, y);
    starDot(x, y - 2);
    starDot(x, y + 2);
  }

  // --- meteors ---------------------------------------------------------------
  function spawnMeteor(t) {
    const angle = Math.PI * (0.65 + Math.random() * 0.2); // down-left
    meteor = {
      fromX: W * (0.15 + Math.random() * 0.7),
      fromY: H * (0.05 + Math.random() * 0.3),
      angle,
      start: t,
      duration: 750,
    };
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
    const x = meteor.fromX + (Math.cos(meteor.angle) * dist * p) / cell;
    const y = meteor.fromY - (Math.sin(meteor.angle) * dist * p) / cell;
    const tail = (70 / cell) * (1 - p * 0.4);
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
      flyby = {
        type,
        start: t,
        duration: 26000,
        dir,
        y0,
        slope,
        count: 24 + Math.floor(Math.random() * 10),
        spacing: 11,
      };
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
  function drawFrame(t, animate) {
    if (!field) return;
    paint(field, "dark", t / 1000, cells);
    for (let i = 0; i < cells.length; i++) pixels[i] = palette[cells[i]];

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

    for (const s of stars) {
      const twinkle = animate ? 0.72 + 0.28 * Math.sin(s.phase + (t / 1000) * s.speed) : 0.85;
      const driftY = animate ? ((t * s.drift * s.depth) / cell) % (H + 4) : 0;
      const x = Math.round(s.x + (animate ? (pointer.x * 10 * s.depth) / cell : 0));
      let y = s.y - driftY;
      if (y < -2) y += H + 4;
      y = Math.round(y + (animate ? (pointer.y * 6 * s.depth) / cell : 0));
      const distance = starDistance(x, y);
      // Far stars are the last to fall away as the ramp approaches the edge.
      if (distance <= 0 || s.depth > 0.3 + 0.7 * smooth(0, field.spec.reach, distance)) continue;
      if (s.size === 0 && Math.min(1, s.alpha * twinkle) < screen(x, y)) continue;
      drawStar(x, y, s.size + (boost > 0.35 ? 1 : 0));
    }

    if (animate) {
      if (!meteor && t > nextMeteorAt) spawnMeteor(t);
      if (meteor) drawMeteor(t);
      if (!flyby && t > nextTrafficAt) spawnTraffic(t);
      if (flyby) drawTraffic(t);
    }
    screenCtx.putImageData(image, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(screenCanvas, 0, 0, W * deviceCell, H * deviceCell);
  }

  function loop(now) {
    rafId = requestAnimationFrame(loop);
    if (lastTick !== undefined) time += now - lastTick;
    lastTick = now;
    const elapsed = time - lastFrame;
    if (elapsed < FRAME) return;
    lastFrame = time - (elapsed % FRAME);
    drawFrame(lastFrame, true);
  }

  function update() {
    if (field && visible && !document.hidden && !reduced.matches && !printing) {
      rafId ??= requestAnimationFrame(loop);
    } else {
      if (rafId !== undefined) cancelAnimationFrame(rafId);
      rafId = lastTick = undefined;
    }
  }

  function resize() {
    const { width, height } = canvas.getBoundingClientRect();
    if (!width || !height) return;
    const dpr = window.devicePixelRatio;
    const nextDeviceCell = Math.max(1, Math.round(GRAIN * dpr));
    const deviceWidth = Math.round(width * dpr);
    const deviceHeight = Math.round(height * dpr);
    const w = Math.ceil(deviceWidth / nextDeviceCell);
    const h = Math.ceil(deviceHeight / nextDeviceCell);
    const spec = phone.matches ? phoneSpec : desktopSpec;
    if (
      field &&
      deviceWidth === canvas.width &&
      deviceHeight === canvas.height &&
      nextDeviceCell === deviceCell &&
      cell === nextDeviceCell / dpr &&
      fieldLine === spec
    )
      return;

    deviceCell = nextDeviceCell;
    cell = deviceCell / dpr;
    if (!field || W !== w || H !== h || fieldLine !== spec) {
      field = prepare(spec, w * GRAIN, h * GRAIN);
      fieldLine = spec;
      W = screenCanvas.width = w;
      H = screenCanvas.height = h;
      cells = new Uint8Array(W * H);
      image = screenCtx.createImageData(W, H);
      pixels = new Uint32Array(image.data.buffer);
    }
    canvas.width = deviceWidth;
    canvas.height = deviceHeight;
    ctx.imageSmoothingEnabled = false;
    makeStars();
    const still = reduced.matches || printing || lastFrame < 0;
    drawFrame(still ? 0 : time, !still);
    canvas.dataset.live = "";
    update();
  }

  readInks();
  new ResizeObserver(resize).observe(canvas);
  window.addEventListener("resize", resize);
  function setPrinting(active) {
    printing = active;
    if (printing) drawFrame(0, false);
    else if (!reduced.matches) lastFrame = time - FRAME;
    update();
  }
  window.addEventListener("beforeprint", () => setPrinting(true));
  window.addEventListener("afterprint", () => setPrinting(print.matches));
  print.addEventListener("change", () => setPrinting(print.matches));
  canvas.addEventListener("pointermove", (e) => {
    const box = canvas.getBoundingClientRect();
    pointer.tx = (e.clientX - box.left) / box.width - 0.5;
    pointer.ty = (e.clientY - box.top) / box.height - 0.5;
  });
  document.addEventListener("visibilitychange", update);
  reduced.addEventListener("change", () => {
    if (reduced.matches) drawFrame(0, false);
    else lastFrame = time - FRAME;
    update();
  });
  new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    update();
  }).observe(canvas);

  // click the sky, make a wish
  let wished = false;
  canvas.addEventListener("click", (e) => {
    if (reduced.matches || printing) return;
    const box = canvas.getBoundingClientRect();
    spawnMeteorAt((e.clientX - box.left) / cell, (e.clientY - box.top) / cell, time);
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
      if (reduced.matches || printing) return;
      pulseStart = time;
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
      if (printing) return "the sky stays still in print.";
      if (!["starlink", "iss", "ufo"].includes(type)) return "options: 'starlink', 'iss', 'ufo'";
      spawnTraffic(time, type);
      return "look up.";
    },
  };

  resize();
})();
