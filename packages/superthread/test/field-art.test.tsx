import { expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { runInNewContext } from "node:vm";
import { Window } from "happy-dom";
import { act } from "react";
import { createRoot } from "react-dom/client";
import { Field } from "../items/ui/field-art";

const spec = "edge=crest at=.45 motion=wave travel=.25";

function browser() {
  const window = new Window({ width: 600, height: 320 });
  const { document } = window;
  Object.defineProperty(window, "devicePixelRatio", { value: 1.3 });
  const reduced = new window.EventTarget();
  const matchMedia = window.matchMedia.bind(window);
  const motion = Object.assign(reduced, { matches: false, media: "(prefers-reduced-motion: reduce)" });
  Object.defineProperty(window, "matchMedia", {
    value: (query: string) => (query === motion.media ? motion : matchMedia(query)),
  });
  const pixels = new Map<HTMLCanvasElement, Uint8ClampedArray>();
  const frames = new Map<number, FrameRequestCallback>();
  let callback: IntersectionObserverCallback;
  let sequence = 0;
  window.HTMLElement.prototype.getBoundingClientRect = () => new window.DOMRect(0, 0, 320, 160);
  Object.defineProperty(window, "IntersectionObserver", {
    value: class {
      constructor(observer: IntersectionObserverCallback) {
        callback = observer;
      }
      observe() {}
      disconnect() {}
    },
  });
  Object.defineProperty(window, "requestAnimationFrame", {
    value: (frame: FrameRequestCallback) => {
      frames.set(++sequence, frame);
      return sequence;
    },
  });
  Object.defineProperty(window, "cancelAnimationFrame", {
    value: (id: number) => frames.delete(id),
  });
  const inks: Record<string, string> = { "--key": "25", "--ground": "45", "--foreground": "245", "--primary": "120" };
  window.getComputedStyle = (element) =>
    ({
      colorScheme: element.closest(".dark") ? "dark" : "light",
      getPropertyValue: (role: string) => inks[role],
    }) as ReturnType<typeof window.getComputedStyle>;
  Object.defineProperty(window.HTMLCanvasElement.prototype, "getContext", {
    configurable: true,
    value(this: HTMLCanvasElement) {
      return {
        fillStyle: "",
        clearRect() {},
        fillRect() {},
        getImageData() {
          return { data: [Number(this.fillStyle), 0, 0, 255] };
        },
        createImageData(width: number, height: number) {
          return { data: new Uint8ClampedArray(width * height * 4) };
        },
        putImageData: (image: ImageData) => pixels.set(this, image.data.slice()),
      };
    },
  });
  return {
    document,
    window,
    frames,
    pixels,
    intersect(visible: boolean) {
      callback([{ isIntersecting: visible } as IntersectionObserverEntry], {} as IntersectionObserver);
    },
    reduce(matches: boolean) {
      motion.matches = matches;
      motion.dispatchEvent(Object.assign(new window.Event("change"), { matches }));
    },
    tick(now: number) {
      const pending = [...frames.values()];
      frames.clear();
      pending.forEach((frame) => frame(now));
    },
  };
}

test("Field renders through its host, pauses offscreen or hidden and prints frame zero", async () => {
  const { document, window, frames, pixels, intersect, reduce, tick } = browser();
  const root = createRoot(document.body as unknown as HTMLElement);
  try {
    await act(async () => root.render(<Field spec={spec} playing />));
    const canvas = document.querySelector("canvas") as unknown as HTMLCanvasElement;
    const current = () => pixels.get(canvas)!;
    const still = current();
    expect(canvas.getAttribute("aria-hidden")).toBe("true");
    expect(canvas.width).toBe(139);
    expect(Math.abs((parseFloat(canvas.style.width) * 1.3) / canvas.width - 3)).toBeLessThan(0.0001);
    expect(still[3]).toBe(0);
    expect(still.at(-1)).toBe(255);
    expect(frames.size).toBe(0);

    intersect(true);
    tick(0);
    tick(17);
    expect(current()).toBe(still);
    tick(450);
    expect(current()).not.toEqual(still);

    reduce(true);
    expect(current()).toEqual(still);
    expect(frames.size).toBe(0);
    reduce(false);
    expect(current()).not.toEqual(still);

    intersect(false);
    expect(frames.size).toBe(0);
    intersect(true);
    Object.defineProperty(document, "hidden", { configurable: true, value: true });
    document.dispatchEvent(new window.Event("visibilitychange"));
    expect(frames.size).toBe(0);

    window.dispatchEvent(new window.Event("beforeprint"));
    expect(current()).toEqual(still);
    window.dispatchEvent(new window.Event("afterprint"));
    expect(current()).not.toEqual(still);
  } finally {
    await act(async () => root.unmount());
    expect(document.querySelector("canvas") === null).toBe(true);
    await window.happyDOM.close();
  }
});

test("the plain script mounts every host and resolves stock and solid in the host's mode", async () => {
  const { document, window, pixels } = browser();
  try {
    document.body.innerHTML = `<div data-field="${spec}"></div><div class="dark" data-field="${spec}"></div>`;
    const script = readFileSync(new URL("../items/doc/field.js", import.meta.url), "utf8");
    runInNewContext(script, { document });
    const canvases = [...document.querySelectorAll("canvas")];
    expect(canvases.length).toBe(2);
    const [paper, dark] = canvases.map((canvas) => pixels.get(canvas as unknown as HTMLCanvasElement)!);
    expect(paper[3]).toBe(0);
    expect(dark[3]).toBe(0);
    expect([...paper.slice(-4)]).toEqual([25, 0, 0, 255]);
    expect([...dark.slice(-4)]).toEqual([45, 0, 0, 255]);
  } finally {
    await window.happyDOM.close();
  }
});
