import { expect, test } from "bun:test";
import { readFileSync, readdirSync } from "node:fs";
import { runInNewContext } from "node:vm";
import { Window } from "happy-dom";

const read = (path: string) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
const css = read("items/styles/doc.css");
const tokens = read("dist/v2/superthread-plain.css");
const partials = readdirSync(new URL("../items/doc/sections/", import.meta.url));
const partial = (name: string) => read(`items/doc/sections/${name}`);

test("document CSS uses plain token or local variables, with square corners", () => {
  const definitions = new Set(Array.from((tokens + css).matchAll(/(--[\w-]+)\s*:/g), ([, name]) => name));
  const references = Array.from(css.matchAll(/var\((--[\w-]+)/g), ([, name]) => name);
  expect([...new Set(references.filter((name) => !definitions.has(name)))]).toEqual([]);
  expect(css).not.toMatch(/#[\da-f]{3,8}\b|border-[-\w]*radius\s*:/i);
});

test("every class in a document partial has a document CSS selector", () => {
  const selectors = new Set(Array.from(css.matchAll(/\.([a-z][\w-]*)/g), ([, name]) => name));
  expect(partials.length).toBeGreaterThan(0);
  const missing = partials.flatMap((name) =>
    Array.from(partial(name).matchAll(/class="([^"]+)"/g), ([, classes]) => classes!.split(/\s+/))
      .flat()
      .filter((className) => !selectors.has(className))
      .map((className) => `${name}: ${className}`),
  );
  expect(missing).toEqual([]);
});

test.each([
  { pageMode: "light", solid: 25 },
  { pageMode: "dark", solid: 45 },
])("a hero beside a dark island prints the $pageMode page's solid ink", async ({ pageMode, solid }) => {
  const window = new Window({ width: 1440, height: 900 });
  try {
    const { document } = window;
    document.documentElement.className = pageMode;
    document.body.innerHTML = partial("hero.html");
    const host = document.querySelector("[data-weave]")!;
    host.getBoundingClientRect = () => new window.DOMRect(0, 0, 320, 160);

    const pixel: number[] = [];
    const inks: Record<string, string> = { "--key": "25", "--ground": "45", "--foreground": "245", "--primary": "120" };
    // Happy DOM has no layout, canvas pixels or inherited color-scheme. Resolve the nearest mode scope and give
    // each role a distinct channel so the bundled script's rendered solid can identify the ink it actually used.
    window.getComputedStyle = (element) =>
      ({
        colorScheme: element.closest(".light, .dark")?.classList.contains("dark") ? "dark" : "light",
        getPropertyValue: (role: string) => inks[role],
      }) as ReturnType<typeof window.getComputedStyle>;
    Object.defineProperty(window.HTMLCanvasElement.prototype, "getContext", {
      value() {
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
          putImageData(image: ImageData) {
            pixel.push(...image.data.slice(0, 4));
          },
        };
      },
    });

    runInNewContext(read("items/doc/weave.js"), {
      document,
      ResizeObserver: window.ResizeObserver,
      MutationObserver: window.MutationObserver,
      IntersectionObserver: window.IntersectionObserver,
    });

    expect(host.querySelectorAll("canvas")).toHaveLength(1);
    expect(pixel.slice(0, 4)).toEqual([solid, 0, 0, 255]);
  } finally {
    await window.happyDOM.close();
  }
});
