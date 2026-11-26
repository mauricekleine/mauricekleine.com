import { expect, test } from "bun:test";
import { buildPlateGrid, drawPlateGeometry, paintProofPlate, parsePlate } from "../items/lib/plate-core.ts";
import { mountDocNotes } from "../items/lib/doc-notes.ts";
import { Window } from "happy-dom";

test("parsePlate parses planes, grid, cutout, and positive specs cleanly", () => {
  expect(parsePlate("planes ratios=42,24,18,16 seed=7 flip")).toEqual({
    kind: "planes",
    ratios: [42, 24, 18, 16],
    cols: 6,
    rows: 4,
    seed: 7,
    flip: true,
    shelf: 0.56,
    cutout: true,
    breath: "vivid",
    pitch: 3.5,
  });
  expect(parsePlate("grid cols=8 rows=5 seed=19 breath=balanced")).toEqual({
    kind: "grid",
    ratios: [42, 24, 18, 16],
    cols: 8,
    rows: 5,
    seed: 19,
    flip: false,
    shelf: 0.56,
    cutout: true,
    breath: "balanced",
    pitch: 3.5,
  });
  expect(parsePlate("planes still")).toMatchObject({ breath: "off", cutout: true });
  expect(parsePlate("planes cutout=0")).toMatchObject({ cutout: false });
  expect(parsePlate("planes cutout=false")).toMatchObject({ cutout: false });
  expect(parsePlate("planes positive=1")).toMatchObject({ positive: true });
  expect(parsePlate("planes positive=0")).toMatchObject({ positive: false });
});

test("drawPlateGeometry skips the negative-space cutout rectangle when cutout=0", () => {
  const calls = (specLine: string) => {
    const rects: Array<{ fillStyle: unknown; x: number; y: number; w: number; h: number }> = [];
    const mock = {
      fillStyle: "" as unknown,
      createLinearGradient() {
        return { addColorStop() {} };
      },
      fillRect(x: number, y: number, w: number, h: number) {
        rects.push({ fillStyle: mock.fillStyle, x, y, w, h });
      },
    };
    drawPlateGeometry(mock as unknown as CanvasRenderingContext2D, parsePlate(specLine), 320, 132);
    return rects;
  };

  const withCutout = calls("planes ratios=42,24,18,16 seed=7");
  const withoutCutout = calls("planes ratios=42,24,18,16 seed=7 cutout=0");
  expect(withCutout.some((r) => r.fillStyle === "#ffffff")).toBe(true);
  expect(withoutCutout.some((r) => r.fillStyle === "#ffffff")).toBe(false);
  expect(withoutCutout.length).toBe(withCutout.length - 1);
});

test("paintProofPlate brightens dark mode with light breath, opens light mode, and renders positive photos in dark mode", () => {
  const w = 24;
  const h = 24;
  const gridK = buildPlateGrid(w, h, 1, 45, 3.5);
  const gridP = buildPlateGrid(w, h, 1, 15, 3.5);
  const darkLum = new Float32Array(w * h).fill(0.15);
  const brightLum = new Float32Array(w * h).fill(0.85);
  const sat = new Float32Array(w * h).fill(0.1);

  const darkInks = {
    dark: true,
    stock: [22, 24, 29] as const,
    ink: [231, 231, 231] as const,
    plum: [192, 116, 161] as const,
  };
  const restDark = new Uint8ClampedArray(w * h * 4);
  const litDark = new Uint8ClampedArray(w * h * 4);
  paintProofPlate(darkLum, sat, gridK, gridP, w, h, darkInks, restDark, { breath: "off" });
  paintProofPlate(darkLum, sat, gridK, gridP, w, h, darkInks, litDark, { breath: "vivid", seconds: 0 });

  const avg = (buf: Uint8ClampedArray) => {
    let sum = 0;
    for (let i = 0; i < buf.length; i += 4) sum += (buf[i]! + buf[i + 1]! + buf[i + 2]!) / 3;
    return sum / (buf.length / 4);
  };
  expect(avg(litDark)).toBeGreaterThan(avg(restDark));

  // Positive dark-mode screenprint (real photos): bright tones print brighter than shadows and lift under light breath.
  const posShadow = new Uint8ClampedArray(w * h * 4);
  const posHighlight = new Uint8ClampedArray(w * h * 4);
  const posHighlightLit = new Uint8ClampedArray(w * h * 4);
  paintProofPlate(darkLum, sat, gridK, gridP, w, h, darkInks, posShadow, { breath: "off", positive: true });
  paintProofPlate(brightLum, sat, gridK, gridP, w, h, darkInks, posHighlight, { breath: "off", positive: true });
  paintProofPlate(brightLum, sat, gridK, gridP, w, h, darkInks, posHighlightLit, {
    breath: "vivid",
    seconds: 0,
    positive: true,
  });
  expect(avg(posHighlight)).toBeGreaterThan(avg(posShadow));
  expect(avg(posHighlightLit)).toBeGreaterThan(avg(posHighlight));

  const lightInks = {
    dark: false,
    stock: [255, 255, 255] as const,
    ink: [22, 24, 29] as const,
    plum: [170, 51, 122] as const,
  };
  const restLight = new Uint8ClampedArray(w * h * 4);
  const litLight = new Uint8ClampedArray(w * h * 4);
  paintProofPlate(darkLum, sat, gridK, gridP, w, h, lightInks, restLight, { breath: "off" });
  paintProofPlate(darkLum, sat, gridK, gridP, w, h, lightInks, litLight, { breath: "vivid", seconds: 0 });
  expect(avg(litLight)).toBeGreaterThan(avg(restLight));
});

test("mountDocNotes adds a tagged note, shows launcher and toast, exports markdown, and clears", async () => {
  const window = new Window({ width: 1200, height: 800 });
  try {
    const { document } = window;
    document.title = "Direction draft";
    document.body.innerHTML =
      '<header><button data-doc-notes="">Notes <span data-doc-notes-count="">0</span></button></header>' +
      '<main><section id="findings"><h2 class="chapter-word">Findings</h2><p>First choice holds.</p></section></main>';
    const ctrl = mountDocNotes(document as unknown as Document)!;
    expect(ctrl).toBeDefined();
    expect(document.querySelector(".doc-note-fab")).not.toBeNull();

    ctrl.open("list");
    (document.querySelector('[data-role="general-tags"] [data-tag="Change"]') as unknown as HTMLButtonElement).click();
    const input = document.querySelector('[data-role="general-input"]') as unknown as HTMLTextAreaElement;
    input.value = "Keep the 3.5 px proof halftone";
    (document.querySelector('[data-role="general-add"]') as unknown as HTMLButtonElement).click();

    const counts = [...document.querySelectorAll("[data-doc-notes-count]")].map((el) => el.textContent);
    expect(counts).toEqual(["1", "1"]);
    expect(document.querySelector(".doc-note-toast")?.textContent).toBe("Note saved");
    const md = ctrl.exportMarkdown();
    expect(md).toContain("## Notes: Direction draft");
    expect(md).toContain("[Change]");
    expect(md).toContain("Keep the 3.5 px proof halftone");

    const clearBtn = document.querySelector('[data-role="clear-all"]') as unknown as HTMLButtonElement;
    clearBtn.click();
    expect(clearBtn.textContent).toBe("Confirm clear?");
    clearBtn.click();
    expect(document.querySelector("[data-doc-notes-count]")?.textContent).toBe("0");
    expect(document.querySelector(".doc-note-toast")?.textContent).toBe("Cleared all notes");

    ctrl.destroy();
    expect(document.querySelectorAll("[data-doc-notes-ui]")).toHaveLength(0);
  } finally {
    await window.happyDOM.close();
  }
});

test("mountDocNotes toggles FAB visibility for scrolling headers, decks, and headerless docs", async () => {
  // 1. Scrolling document with top-bar button: FAB starts hidden and reveals once header scrolls out of view.
  {
    const window = new Window({ width: 1200, height: 800 });
    let notify: ((entries: Array<{ isIntersecting: boolean }>) => void) | undefined;
    let observedTarget: Element | undefined;
    let disconnected = false;
    (window as unknown as Record<string, unknown>).IntersectionObserver = class {
      constructor(cb: (entries: Array<{ isIntersecting: boolean }>) => void) {
        notify = cb;
      }
      observe(el: Element) {
        observedTarget = el;
      }
      disconnect() {
        disconnected = true;
      }
    };
    try {
      const { document } = window;
      document.body.innerHTML =
        '<header class="opener"><button id="top-notes" data-doc-notes="">Notes</button></header>' +
        "<main><p>Body</p></main>";
      const ctrl = mountDocNotes(document as unknown as Document)!;
      const fab = document.querySelector(".doc-note-fab")!;
      expect(fab).not.toBeNull();
      expect(observedTarget?.id).toBe("top-notes");
      expect(fab.classList.contains("is-hidden")).toBe(true);

      notify?.([{ isIntersecting: false }]);
      expect(fab.classList.contains("is-hidden")).toBe(false);

      notify?.([{ isIntersecting: true }]);
      expect(fab.classList.contains("is-hidden")).toBe(true);

      ctrl.destroy();
      expect(disconnected).toBe(true);
    } finally {
      await window.happyDOM.close();
    }
  }

  // 2. 100svh deck with top-bar button: FAB stays hidden so it never overlaps slide controls.
  {
    const window = new Window({ width: 1200, height: 800 });
    let observerCreated = false;
    (window as unknown as Record<string, unknown>).IntersectionObserver = class {
      constructor() {
        observerCreated = true;
      }
      observe() {}
      disconnect() {}
    };
    try {
      const { document } = window;
      document.body.innerHTML =
        '<div class="deck"><header class="top"><button data-doc-notes="">Notes</button></header></div>';
      const ctrl = mountDocNotes(document as unknown as Document)!;
      const fab = document.querySelector(".doc-note-fab")!;
      expect(fab).not.toBeNull();
      expect(fab.classList.contains("is-hidden")).toBe(true);
      expect(observerCreated).toBe(false);
      ctrl.destroy();
    } finally {
      await window.happyDOM.close();
    }
  }

  // 3. Document with no top-bar trigger: FAB is shown immediately.
  {
    const window = new Window({ width: 1200, height: 800 });
    try {
      const { document } = window;
      document.documentElement.setAttribute("data-doc-notes", "");
      document.body.innerHTML = "<main><p>Standalone sheet</p></main>";
      const ctrl = mountDocNotes(document as unknown as Document)!;
      const fab = document.querySelector(".doc-note-fab")!;
      expect(fab).not.toBeNull();
      expect(fab.classList.contains("is-hidden")).toBe(false);
      ctrl.destroy();
    } finally {
      await window.happyDOM.close();
    }
  }
});
