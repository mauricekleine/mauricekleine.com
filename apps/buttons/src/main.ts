// Buttons: each scene prints its two plates onto one canvas. Wide screens show
// the pair side by side; phones see one lenticular card that turns from the
// analog plate to the button plate as it tilts.

import { Printer, type Button, type Rect, type View } from "./print.ts";
import { Tilt } from "./tilt.ts";

type Side = "analog" | "button";

const narrow = matchMedia("(max-width: 759px)");
const still = matchMedia("(prefers-reduced-motion: reduce)");
const tilt = new Tilt(still);

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
const smoothstep = (lo: number, hi: number, v: number) => {
  const t = clamp((v - lo) / (hi - lo), 0, 1);
  return t * t * (3 - 2 * t);
};

/** the button breathes on one clock, everywhere on the page */
const breathe = (now: number) => {
  const p = 0.5 - 0.5 * Math.cos((now / 3600) * Math.PI * 2);
  return 0.25 + 0.75 * p * p;
};

const numbers = (text = "") =>
  text
    .split(";")
    .filter(Boolean)
    .map((part) => part.split(",").map(Number));

class Scene {
  readonly canvas = document.createElement("canvas");
  visible = false;
  private printer: Printer | null = null;
  private status: "idle" | "loading" | "ready" | "failed" = "idle";
  private readonly arts: HTMLElement[];
  private readonly images: HTMLImageElement[];
  private readonly label: HTMLElement | null;
  private readonly button: Button;
  private side: Side = "analog";
  private mix = 0;
  private manual: number | null = null;
  private manualRoll = 0;
  private views: View[] = [];
  private dpr = 1;
  private dirty = true;
  private drawn = { at: -Infinity, x: 0, y: 0, mix: 0 };

  constructor(readonly stage: HTMLElement) {
    this.arts = [...stage.querySelectorAll<HTMLElement>(".art")];
    this.images = this.arts.map((art) => art.querySelector("img") as HTMLImageElement);
    this.label = stage.querySelector(".flip-label");
    const b = this.images[1];
    this.button = { glows: numbers(b.dataset.glows), box: numbers(b.dataset.plate)[0] ?? [0, 0, 1200, 1500] };
    this.canvas.className = "print";
    this.canvas.setAttribute("aria-hidden", "true");
    stage.prepend(this.canvas);
    this.canvas.addEventListener("webglcontextlost", (event) => {
      event.preventDefault();
      this.printer = null;
      this.status = "idle";
      this.stage.classList.remove("printed");
    });
    this.canvas.addEventListener("webglcontextrestored", () => this.init());
    stage.querySelector(".flip")?.addEventListener("click", () => this.toggle());
    for (const art of this.arts) art.addEventListener("click", () => narrow.matches && this.toggle());
    this.relabel();
  }

  async init() {
    if (this.status !== "idle") return;
    this.status = "loading";
    const printer = Printer.create(this.canvas);
    if (!printer) {
      this.status = "failed";
      return;
    }
    const [a, b] = this.images;
    try {
      await printer.load(
        {
          a: a.currentSrc || a.src,
          aDepth: a.dataset.depth ?? "",
          b: b.currentSrc || b.src,
          bDepth: b.dataset.depth ?? "",
          bMask: b.dataset.mask ?? "",
        },
        this.button,
      );
    } catch (error) {
      console.warn(error);
      this.status = "failed";
      return;
    }
    this.printer = printer;
    this.status = "ready";
    this.dirty = true;
  }

  /** place the canvas over the plates it prints, in whole device pixels */
  layout() {
    const lens = narrow.matches;
    const arts = lens ? this.arts.slice(0, 1) : this.arts;
    const stage = this.stage.getBoundingClientRect();
    const boxes = arts.map((art) => art.getBoundingClientRect());
    const left = Math.min(...boxes.map((b) => b.left));
    const top = Math.min(...boxes.map((b) => b.top));
    const width = Math.max(...boxes.map((b) => b.right)) - left;
    const height = Math.max(...boxes.map((b) => b.bottom)) - top;
    if (width < 1 || height < 1) return;
    // three device pixels per CSS pixel keeps dots round on phones; big canvases stop at two
    this.dpr = Math.min(devicePixelRatio || 1, width * height > 600_000 ? 2 : 3);
    const w = Math.round(width * this.dpr);
    const h = Math.round(height * this.dpr);
    Object.assign(this.canvas.style, {
      left: `${left - stage.left}px`,
      top: `${top - stage.top}px`,
      width: `${width}px`,
      height: `${height}px`,
    });
    if (this.canvas.width !== w) this.canvas.width = w;
    if (this.canvas.height !== h) this.canvas.height = h;
    this.views = boxes.map((box, i): View => {
      const rect = this.device(box, left, top, h);
      return { ...rect, mode: lens ? 2 : i === 0 ? 0 : 1 };
    });
    this.dirty = true;
  }

  tick(now: number, dt: number, pulse: number) {
    if (narrow.matches) this.steer(dt);
    if (!this.visible || this.status !== "ready" || !this.printer || !this.views.length) return;
    const moved =
      Math.abs(tilt.x - this.drawn.x) + Math.abs(tilt.y - this.drawn.y) > 0.0005 || this.mix !== this.drawn.mix;
    // when nothing moves, only the glow changes, and 30 frames a second is plenty
    if (!this.dirty && !moved && (still.matches || now - this.drawn.at < 33)) return;
    const length = Math.hypot(tilt.x, tilt.y);
    const scale = length > 1 ? 1 / length : 1;
    this.printer.draw(this.canvas.width, this.canvas.height, this.views, {
      mix: this.mix,
      tilt: [tilt.x * scale, tilt.y * scale],
      depth: narrow.matches ? 0.02 : 0.024,
      sheen: clamp(tilt.roll / 30, -1, 1),
      pulse,
      strength: 0.55,
      cell: Math.max(2.4 * this.dpr, 4),
      lens: 4 * this.dpr,
      dpr: this.dpr,
    });
    this.drawn = { at: now, x: tilt.x, y: tilt.y, mix: this.mix };
    this.dirty = false;
    if (!this.printer.lost) this.stage.classList.add("printed");
  }

  /** a tap turns the card; tilting more than a few degrees hands it back to the tilt */
  private toggle() {
    tilt.request();
    this.manual = this.side === "button" ? 0 : 1;
    this.manualRoll = tilt.roll;
  }

  private steer(dt: number) {
    if (this.manual !== null && tilt.live && Math.abs(tilt.roll - this.manualRoll) > 8) this.manual = null;
    const target = this.manual ?? (tilt.live ? smoothstep(7, 17, tilt.roll) : 0);
    const step = still.matches ? 1 : dt * 2.6;
    this.mix += clamp(target - this.mix, -step, step);
    const side = this.mix > 0.55 ? "button" : this.mix < 0.45 ? "analog" : this.side;
    if (side === this.side) return;
    this.side = side;
    this.stage.dataset.side = side;
    this.relabel();
  }

  relabel() {
    if (!this.label) return;
    const next = this.side === "button" ? "old" : "new";
    const how = tilt.live ? `Tilt ${this.side === "button" ? "left" : "right"} for` : "Tap to see";
    this.label.textContent = `${how} the ${next} model`;
  }

  private device(box: DOMRect, left: number, top: number, height: number): Rect {
    const x0 = Math.round((box.left - left) * this.dpr);
    const x1 = Math.round((box.right - left) * this.dpr);
    const y0 = Math.round((box.top - top) * this.dpr);
    const y1 = Math.round((box.bottom - top) * this.dpr);
    return { x: x0, y: height - y1, w: x1 - x0, h: y1 - y0 };
  }
}

const scenes = [...document.querySelectorAll<HTMLElement>(".stage")].map((stage) => new Scene(stage));
const byElement = new Map<Element, Scene>();
for (const scene of scenes) {
  byElement.set(scene.stage, scene);
  for (const art of scene.stage.querySelectorAll(".art")) byElement.set(art, scene);
}
tilt.onLive = () => scenes.forEach((scene) => scene.relabel());

const sizes = new ResizeObserver((entries) => {
  for (const scene of new Set(entries.map((entry) => byElement.get(entry.target)))) scene?.layout();
});
for (const element of byElement.keys()) sizes.observe(element);

// load a scene's plates a screen ahead; print only what is on screen
const near = new IntersectionObserver(
  (entries) => entries.forEach((entry) => entry.isIntersecting && byElement.get(entry.target)?.init()),
  { rootMargin: "100% 0px" },
);
const seen = new IntersectionObserver((entries) => {
  for (const entry of entries) {
    const scene = byElement.get(entry.target);
    if (scene) scene.visible = entry.isIntersecting;
  }
});
for (const scene of scenes) {
  near.observe(scene.stage);
  seen.observe(scene.stage);
}

const press = document.querySelector<HTMLButtonElement>(".press");
let pressSeen = false;
if (press) {
  new IntersectionObserver(([entry]) => (pressSeen = entry.isIntersecting)).observe(press);
  press.addEventListener("click", () => {
    tilt.request();
    press.classList.remove("pressed");
    void press.offsetWidth;
    press.classList.add("pressed");
    const first = document.querySelector(".scene");
    setTimeout(() => first?.scrollIntoView({ behavior: still.matches ? "auto" : "smooth" }), still.matches ? 0 : 320);
  });
}

let last = performance.now();
function frame(now: number) {
  const dt = Math.min(0.1, Math.max(0, now - last) / 1000);
  last = now;
  tilt.update(dt);
  const pulse = still.matches ? 0.6 : breathe(now);
  for (const scene of scenes) scene.tick(now, dt, pulse);
  if (press && pressSeen) {
    press.style.setProperty("--pulse", pulse.toFixed(3));
    press.style.setProperty("--tx", tilt.x.toFixed(3));
    press.style.setProperty("--ty", tilt.y.toFixed(3));
  }
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
