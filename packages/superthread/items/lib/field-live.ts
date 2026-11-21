import { fieldScreen, paint, prepare, type FieldArt, type FieldMask } from "@/components/superthread/lib/field-core";
import { canvasRaster, packedInks, type DotScreen } from "@/components/superthread/lib/dot-screen";
import { readScreenInks } from "@/components/superthread/lib/screen-core";

const FPS = 24;

export function mountField(host: HTMLElement, mask?: FieldMask) {
  const doc = host.ownerDocument;
  const view = doc.defaultView;
  if (!view) return;
  const win = view;
  const canvas = doc.createElement("canvas");
  const ctx = canvas.getContext("2d");
  const probe = doc.createElement("canvas").getContext("2d", { willReadFrequently: true });
  if (!ctx || !probe) return;
  const context = ctx;
  const inkProbe = probe;
  canvas.setAttribute("aria-hidden", "true");
  Object.assign(canvas.style, { position: "absolute", imageRendering: "pixelated", pointerEvents: "none" });
  host.append(canvas);

  const motion = win.matchMedia("(prefers-reduced-motion: reduce)");
  const print = win.matchMedia("print");
  let reduced = motion.matches;
  let printing = print.matches;
  let visible = false;
  let animation: number | undefined;
  let last: number | undefined;
  let elapsed = 0;
  let frame = 0;
  let destroy = false;
  let art: FieldArt | undefined;
  let image: ImageData;
  let pixels: Uint32Array;
  let screen: DotScreen;
  let palette: Uint32Array;
  let ratio: number;
  let inks: ReturnType<typeof readScreenInks>;
  let line: string;
  let resolution: MediaQueryList;

  function draw(index: number) {
    if (!art) return;
    paint(art, inks.dark ? "dark" : "light", (index % (FPS * art.spec.duration)) / FPS, pixels, screen, palette);
    context.putImageData(image, 0, 0);
  }

  function canAnimate() {
    return (
      !destroy &&
      art &&
      art.spec.motion !== "still" &&
      host.hasAttribute("data-field-art-play") &&
      visible &&
      !doc.hidden &&
      !reduced &&
      !printing
    );
  }

  function tick(now: number) {
    animation = undefined;
    if (!canAnimate()) {
      last = undefined;
      return;
    }
    if (last !== undefined) elapsed += now - last;
    last = now;
    const next = Math.floor((elapsed * FPS) / 1000);
    if (next !== frame) {
      frame = next;
      draw(frame);
    }
    update();
  }

  function update() {
    if (canAnimate()) {
      animation ??= win.requestAnimationFrame(tick);
    } else {
      if (animation !== undefined) win.cancelAnimationFrame(animation);
      animation = last = undefined;
    }
  }

  function repaint() {
    if (destroy) return;
    const box = host.getBoundingClientRect();
    if (!box.width || !box.height) {
      art = undefined;
      update();
      return;
    }
    const dpr = win.devicePixelRatio;
    const { left, top, width, height, cssWidth, cssHeight } = canvasRaster(box, dpr);
    const spec = host.dataset.fieldArt ?? "";
    inks = readScreenInks(win.getComputedStyle(host), inkProbe);
    palette = packedInks([undefined, inks.screen, inks.thread, inks.solid]);

    const w = Math.max(2, Math.round(cssWidth));
    const h = Math.max(2, Math.round(cssHeight));
    if (
      !art ||
      art.width !== w ||
      art.height !== h ||
      line !== spec ||
      ratio !== dpr ||
      screen.width !== width ||
      screen.height !== height
    ) {
      if (!art || art.width !== w || art.height !== h || line !== spec) {
        art = prepare(spec, w, h, { mask });
      }
      if (line !== spec) elapsed = frame = 0;
      line = spec;
      ratio = dpr;
      screen = fieldScreen(art, dpr, width, height);
      canvas.width = width;
      canvas.height = height;
      image = context.createImageData(width, height);
      pixels = new Uint32Array(image.data.buffer);
    }
    Object.assign(canvas.style, {
      left: `${left}px`,
      top: `${top}px`,
      width: `${cssWidth}px`,
      height: `${cssHeight}px`,
    });
    draw(reduced || printing ? 0 : frame);
    update();
  }

  function watchResolution() {
    resolution?.removeEventListener("change", watchResolution);
    resolution = win.matchMedia(`(resolution: ${win.devicePixelRatio}dppx)`);
    resolution.addEventListener("change", watchResolution);
    repaint();
  }
  const motionChanged = (event: MediaQueryListEvent) => {
    reduced = event.matches;
    draw(reduced || printing ? 0 : frame);
    update();
  };
  const beforePrint = () => {
    printing = true;
    repaint();
  };
  const afterPrint = () => {
    printing = false;
    repaint();
  };
  const printChanged = () => (print.matches ? beforePrint() : afterPrint());

  // Prepare before subscribing so a malformed spec leaves no observer or canvas behind.
  try {
    watchResolution();
  } catch (error) {
    resolution!.removeEventListener("change", watchResolution);
    canvas.remove();
    throw error;
  }

  const resize = new win.ResizeObserver(repaint);
  resize.observe(host);
  const scope = new win.MutationObserver((changes) => {
    if (changes.some(({ attributeName }) => attributeName !== "data-field-art-play")) repaint();
    else update();
  });
  for (let element: HTMLElement | null = host; element; element = element.parentElement) {
    scope.observe(element, {
      attributes: true,
      attributeFilter: ["class", "style", "data-theme", "data-field-art", "data-field-art-play"],
    });
  }
  const intersection = new win.IntersectionObserver(([entry]) => {
    visible = entry!.isIntersecting;
    update();
  });
  intersection.observe(host);
  doc.addEventListener("visibilitychange", update);
  motion.addEventListener("change", motionChanged);
  print.addEventListener("change", printChanged);
  win.addEventListener("beforeprint", beforePrint);
  win.addEventListener("afterprint", afterPrint);

  return () => {
    destroy = true;
    update();
    resize.disconnect();
    scope.disconnect();
    intersection.disconnect();
    resolution.removeEventListener("change", watchResolution);
    doc.removeEventListener("visibilitychange", update);
    motion.removeEventListener("change", motionChanged);
    print.removeEventListener("change", printChanged);
    win.removeEventListener("beforeprint", beforePrint);
    win.removeEventListener("afterprint", afterPrint);
    canvas.remove();
  };
}
