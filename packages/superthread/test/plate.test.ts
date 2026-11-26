import { expect, test } from "bun:test";
import { buildPlateGrid, paintProofPlate, parsePlate } from "../items/lib/plate-core.ts";
import { mountDocNotes } from "../items/lib/doc-notes.ts";
import { Window } from "happy-dom";

test("parsePlate parses planes and grid specs cleanly", () => {
  expect(parsePlate("planes ratios=42,24,18,16 seed=7 flip")).toEqual({
    kind: "planes",
    ratios: [42, 24, 18, 16],
    cols: 6,
    rows: 4,
    seed: 7,
    flip: true,
    shelf: 0.56,
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
    breath: "balanced",
    pitch: 3.5,
  });
  expect(parsePlate("planes still")).toMatchObject({ breath: "off" });
});

test("paintProofPlate brightens dark mode with light breath and opens light mode", () => {
  const w = 24;
  const h = 24;
  const gridK = buildPlateGrid(w, h, 1, 45, 3.5);
  const gridP = buildPlateGrid(w, h, 1, 15, 3.5);
  const lum = new Float32Array(w * h).fill(0.15);
  const sat = new Float32Array(w * h).fill(0.1);

  const darkInks = {
    dark: true,
    stock: [22, 24, 29] as const,
    ink: [231, 231, 231] as const,
    plum: [192, 116, 161] as const,
  };
  const restDark = new Uint8ClampedArray(w * h * 4);
  const litDark = new Uint8ClampedArray(w * h * 4);
  paintProofPlate(lum, sat, gridK, gridP, w, h, darkInks, restDark, { breath: "off" });
  paintProofPlate(lum, sat, gridK, gridP, w, h, darkInks, litDark, { breath: "vivid", seconds: 0 });

  const avg = (buf: Uint8ClampedArray) => {
    let sum = 0;
    for (let i = 0; i < buf.length; i += 4) sum += (buf[i]! + buf[i + 1]! + buf[i + 2]!) / 3;
    return sum / (buf.length / 4);
  };
  expect(avg(litDark)).toBeGreaterThan(avg(restDark));

  const lightInks = {
    dark: false,
    stock: [255, 255, 255] as const,
    ink: [22, 24, 29] as const,
    plum: [170, 51, 122] as const,
  };
  const restLight = new Uint8ClampedArray(w * h * 4);
  const litLight = new Uint8ClampedArray(w * h * 4);
  paintProofPlate(lum, sat, gridK, gridP, w, h, lightInks, restLight, { breath: "off" });
  paintProofPlate(lum, sat, gridK, gridP, w, h, lightInks, litLight, { breath: "vivid", seconds: 0 });
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
