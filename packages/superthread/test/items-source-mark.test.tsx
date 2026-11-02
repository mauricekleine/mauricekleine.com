// The frame a third-party mark prints in. happy-dom paints nothing, so these rasterise the path by the even-odd rule the
// browser uses, and read the classes a browser keys on for the frames.
import { describe, expect, test } from "bun:test";
import { SourceMark } from "@/components/superthread/ui/source-mark";
import { elements, forbidden, one, server } from "./rendered.tsx";

const PHONE = "[@media(max-width:600px)]:";
const DRAWING = "M5 5h6v6h-6z";
const SECOND = "M6 6h4v4h-4z";

const mark = (node: React.ReactNode) => one(server(node), '[data-slot="source-mark"]');

// Each subpath as its corners, from the M, h and v commands a mark's paths are made of.
function polygons(d: string) {
  return [...d.matchAll(/M(\d+) (\d+)([^M]*)/g)].map(([, x, y, moves]) => {
    const corners = [{ x: +x!, y: +y! }];
    for (const [, axis, step] of moves!.matchAll(/([hv])(-?\d+)/g)) {
      const { x: px, y: py } = corners.at(-1)!;
      corners.push(axis === "h" ? { x: px + +step!, y: py } : { x: px, y: py + +step! });
    }
    return corners;
  });
}

// A cell is inked when a ray from its centre crosses an odd number of edges across every subpath: the even-odd rule.
function inked(d: string, cellX: number, cellY: number) {
  const [px, py] = [cellX + 0.5, cellY + 0.5];
  let crossings = 0;
  for (const corners of polygons(d)) {
    corners.forEach((a, i) => {
      const b = corners[(i + 1) % corners.length]!;
      if (a.y > py !== b.y > py && px < a.x + ((py - a.y) / (b.y - a.y)) * (b.x - a.x)) crossings++;
    });
  }
  return crossings % 2 === 1;
}

const pathsOf = (el: Element) => [...el.querySelectorAll("path")];

describe("source mark", () => {
  test("knocks its drawing out of a notched tile, so the surface shows through one ink", () => {
    const { el } = mark(<SourceMark d={DRAWING} />);
    expect(el.getAttribute("viewBox")).toBe("0 0 16 16");
    expect(el.getAttribute("fill")).toBe("currentColor");
    expect(el.getAttribute("fill-rule")).toBe("evenodd");
    const [path] = pathsOf(el);
    const d = path!.getAttribute("d")!;
    for (const [x, y] of [
      [0, 0],
      [15, 0],
      [0, 15],
      [15, 15],
    ])
      expect({ x, y, inked: inked(d, x!, y!) }).toEqual({ x, y, inked: false });
    expect(inked(d, 1, 0)).toBe(true);
    expect(inked(d, 0, 1)).toBe(true);
    expect(inked(d, 4, 5)).toBe(true);
    expect(inked(d, 5, 5)).toBe(false);
    expect(inked(d, 10, 10)).toBe(false);
    expect(inked(d, 11, 10)).toBe(true);
  });

  test("prints in the first ink at 96 px, and 80 px on a phone, on whole-pixel cells", () => {
    const { classes } = mark(<SourceMark d={DRAWING} />);
    expect(classes).toEqual(expect.arrayContaining(["text-first", "size-24", `${PHONE}size-20`]));
  });

  test("the second frame cuts in for the pointer and the visible focus, with no transition", () => {
    const { el, classes } = mark(<SourceMark d={DRAWING} hover={SECOND} />);
    const [rest, second] = pathsOf(el);
    expect(rest!.getAttribute("class")!.split(" ")).toEqual(
      expect.arrayContaining(["group-hover/source-mark:hidden", "group-has-[:focus-visible]/source-mark:hidden"]),
    );
    expect(second!.getAttribute("class")!.split(" ")).toEqual(
      expect.arrayContaining([
        "hidden",
        "group-hover/source-mark:inline",
        "group-has-[:focus-visible]/source-mark:inline",
      ]),
    );
    expect(inked(second!.getAttribute("d")!, 5, 5)).toBe(true);
    expect(inked(second!.getAttribute("d")!, 6, 6)).toBe(false);
    expect(classes).toContain("group/source-mark");
    expect([...el.outerHTML.matchAll(/\btransition/g)]).toEqual([]);
  });

  test("held keeps the second frame up", () => {
    const [rest, second] = pathsOf(mark(<SourceMark d={DRAWING} hover={SECOND} held />).el);
    expect(rest!.getAttribute("class")).toBe("hidden");
    expect(second!.getAttribute("class")).toBeNull();
  });

  test("a mark with one frame prints it through every state", () => {
    const paths = pathsOf(mark(<SourceMark d={DRAWING} />).el);
    expect(paths).toHaveLength(1);
    expect(paths[0]!.getAttribute("class")).toBeNull();
  });

  test("stays hidden from readers until it's labelled", () => {
    const quiet = mark(<SourceMark d={DRAWING} />).el;
    expect(quiet.getAttribute("aria-hidden")).toBe("true");
    expect(quiet.hasAttribute("role")).toBe(false);
    const named = mark(<SourceMark d={DRAWING} aria-label="mail" />).el;
    expect(named.getAttribute("role")).toBe("img");
    expect(named.getAttribute("aria-label")).toBe("mail");
    expect(named.hasAttribute("aria-hidden")).toBe(false);
  });

  test("holds the rules every skin keeps", () => {
    expect(forbidden(elements(server(<SourceMark d={DRAWING} hover={SECOND} />)))).toEqual([]);
  });
});
