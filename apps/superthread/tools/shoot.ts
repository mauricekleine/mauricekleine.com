// Shoots the site with agent-browser: every nav page at 1440 x 900 and 390 x 844, light and dark, each after the
// mode is stored and the page reloaded and its fonts have loaded, as a full-page shot.
//
//   bun apps/superthread/tools/shoot.ts [--base <url>] [--tag <name>] [--only <path>]... [--focus]
//
// --base is the running site (default http://127.0.0.1:3001, the shared dev server). Shots go to
// .shots/superthread/<tag>/ at the repo root (gitignored). --only limits the run to the given paths.
//
// --focus runs the field focus check instead (a port of the master's src/shoot_focus.sh): on the field pages and
// the overview's masthead search, in both modes at device scale 2, each field is shot at rest (or as printed, for a
// demo), after Tab from the control before it, after a click (a select: a click, then Escape), after typing, and,
// for a field with a button inside, after Tab onto that button. A disabled field gets rest, a Tab attempt and a
// click. Each 2x crop and what the browser reports go to .shots/superthread/<tag>/focus/, and
// tools/focus_frames.py counts the frames and gives the verdict; the run exits 1 when any field fails.
//
// The browser session is AGENT_BROWSER_SESSION when set (left open), else a session of this run's own (closed).
import { spawnSync } from "bun";
import { mkdirSync, rmSync, writeFileSync, appendFileSync, readdirSync } from "node:fs";
import { join, resolve } from "node:path";
import { parseArgs } from "node:util";
import { prerenderPaths } from "../src/site/nav.ts";
import { themeKey } from "../src/site/theme-script.ts";

const { values } = parseArgs({
  args: Bun.argv.slice(2),
  options: {
    base: { type: "string", default: "http://127.0.0.1:3001" },
    tag: { type: "string", default: "local" },
    only: { type: "string", multiple: true },
    focus: { type: "boolean", default: false },
  },
  strict: true,
});

const app = resolve(import.meta.dir, "..");
const root = resolve(app, "../..");
const base = values.base!.replace(/\/+$/, "");
const dir = join(root, ".shots/superthread", values.tag!);
const ownSession = !process.env.AGENT_BROWSER_SESSION;
const session = process.env.AGENT_BROWSER_SESSION || `superthread-shoot-${process.pid}`;
const modes = ["light", "dark"] as const;
type Mode = (typeof modes)[number];

function ab(...args: string[]): string {
  const run = spawnSync(["agent-browser", "--session", session, ...args], { stdout: "pipe", stderr: "pipe" });
  if (run.exitCode !== 0)
    throw new Error(`agent-browser ${args.join(" ")} exited ${run.exitCode}: ${run.stderr.toString().trim()}`);
  return run.stdout.toString().trim();
}

// eval prints its result as JSON
function js<T = unknown>(code: string): T {
  return JSON.parse(ab("eval", code)) as T;
}

// stores the mode for the site's origin, so every page after it opens in that mode
function store(mode: Mode) {
  ab("open", `${base}/`);
  js(`localStorage.setItem(${JSON.stringify(themeKey)}, ${JSON.stringify(mode)})`);
}

// opens a page and waits for its fonts and for the theme script's mode, then lets it settle: on the dev server the
// router resets the scroll position after hydration, which lands after the fonts and would undo a field's
// scrollIntoView before its first shot
function visit(path: string, mode: Mode) {
  ab("open", base + path);
  ab("wait", "--fn", `document.fonts.status === "loaded" && document.documentElement.dataset.theme === "${mode}"`);
  ab("wait", "500");
}

const slug = (path: string) => (path === "/" ? "index" : path.slice(1).replaceAll("/", "-"));

function pages(): string[] {
  if (!values.only?.length) return [...prerenderPaths];
  const unknown = values.only.filter((path) => !prerenderPaths.includes(path));
  if (unknown.length > 0) throw new Error(`not a site page: ${unknown.join(", ")}`);
  return values.only;
}

function shootPages() {
  mkdirSync(dir, { recursive: true });
  const list = pages();
  let count = 0;
  for (const [width, height] of [
    [1440, 900],
    [390, 844],
  ]) {
    ab("set", "viewport", String(width), String(height), "1");
    for (const mode of modes) {
      ab("set", "media", mode);
      store(mode);
      for (const path of list) {
        visit(path, mode);
        const file = join(dir, `${slug(path)}-${width}-${mode}.png`);
        ab("screenshot", "--full", file);
        count++;
      }
    }
  }
  console.log(`shoot: ${count} shots of ${list.length} pages in ${dir}`);
}

// --- the focus check -------------------------------------------------------------------------------------------

// The field pages, and the overview for the masthead's search; elsewhere the masthead's copy is skipped.
const focusPages = [
  "/",
  "/components/input",
  "/components/input-group",
  "/components/textarea",
  "/components/select",
  "/mock/orbit",
];

type Field = {
  id: string;
  cid: string;
  tid: string;
  mode: Mode;
  name: string;
  demo: boolean;
  disabled: boolean;
  tab: number;
  button: string | null;
  select: boolean;
};

// Tags every field box, its control (the box itself for a select trigger or a bare input) and any button inside
// it with data-focus-id, and lists them.
const TAG = `(() => {
  const out = [];
  const onOverview = location.pathname === "/";
  const boxes = document.querySelectorAll('[data-slot="input-group"], [data-slot="input"], [data-slot="textarea"], [data-slot="select-trigger"]');
  boxes.forEach((b, i) => {
    if (!onOverview && b.closest(".st-mast")) return;
    if (b.getClientRects().length === 0) return;
    const c = b.matches("button, input, textarea") ? b : b.querySelector("input, textarea, select");
    if (!c) return;
    const id = "f" + i;
    b.dataset.focusId = id;
    if (c !== b) c.dataset.focusId = id + "c";
    const inner = b.matches("button") ? null : b.querySelector("button");
    if (inner) inner.dataset.focusId = id + "b";
    const scope = b.closest(".dark, .light");
    const mode = scope ? (scope.classList.contains("dark") ? "dark" : "light") : "light";
    const labelled = c.getAttribute("aria-labelledby");
    const label = c.getAttribute("aria-label") || (c.labels && c.labels[0] && c.labels[0].textContent) ||
      (labelled && labelled.split(" ").map((x) => document.getElementById(x)?.textContent || "").join(" ")) ||
      c.getAttribute("placeholder") || "field";
    const invalid = c.getAttribute("aria-invalid") === "true" || b.getAttribute("aria-invalid") === "true";
    const disabled = c.disabled === true || b.hasAttribute("data-disabled");
    const select = b.matches('[data-slot="select-trigger"]');
    let name = label.trim().toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "") || "field";
    if (select) name += "_select";
    if (invalid && !name.includes("invalid")) name += "_invalid";
    out.push({ id, cid: c === b ? id : id + "c", tid: c === b ? id : id + "c", mode, name,
      demo: b.matches('[data-demo~="focus"]'), disabled, tab: c.tabIndex, button: inner ? id + "b" : null, select });
  });
  return out;
})()`;

// What the browser draws: whether the control holds focus, its own outline, the box's outline and edge, the house
// and error inks at the box, any ancestor hugging the box (within 8 px) that draws an outline or a shadow, and where
// the text sits inside the box.
const PROBE = (id: string, cid: string, tid: string) => `((id, cid, tid) => {
  const q = (x) => document.querySelector('[data-focus-id="' + x + '"]');
  const b = q(id), c = q(cid), t = q(tid), s = getComputedStyle(b), u = getComputedStyle(c);
  const rgb = (value) => {
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = 1;
    const x = canvas.getContext("2d");
    x.fillStyle = "#000";
    x.fillStyle = value;
    x.fillRect(0, 0, 1, 1);
    const d = x.getImageData(0, 0, 1, 1).data;
    return "#" + [d[0], d[1], d[2]].map((v) => v.toString(16).padStart(2, "0")).join("");
  };
  const box = b.getBoundingClientRect();
  let ancestor = null;
  for (let a = b.parentElement; a && a !== document.body; a = a.parentElement) {
    const r = a.getBoundingClientRect();
    const reach = Math.max(Math.abs(r.left - box.left), Math.abs(r.top - box.top), Math.abs(r.right - box.right), Math.abs(r.bottom - box.bottom));
    if (reach > 8) break;
    const v = getComputedStyle(a);
    if ((v.outlineStyle !== "none" && parseFloat(v.outlineWidth) > 0) || v.boxShadow !== "none") {
      ancestor = a.tagName.toLowerCase() + (typeof a.className === "string" && a.className.trim() ? "." + a.className.trim().split(/\\s+/)[0] : "");
      break;
    }
  }
  let text;
  if (t.matches("input, textarea")) {
    const r = t.getBoundingClientRect(), v = getComputedStyle(t);
    text = [r.left + parseFloat(v.borderLeftWidth) + parseFloat(v.paddingLeft), r.top + parseFloat(v.borderTopWidth) + parseFloat(v.paddingTop)];
  } else {
    const r = (t.querySelector('[data-slot="select-value"]') || t).getBoundingClientRect();
    text = [r.left, r.top];
  }
  return {
    active: document.activeElement === c,
    fv: c.matches(":focus-visible"),
    ctl_outline: b === c ? "self" : u.outlineStyle === "none" || parseFloat(u.outlineWidth) === 0 ? "none" : u.outlineWidth + " " + u.outlineStyle,
    box_outline: s.outlineStyle === "none" ? "none" : s.outlineWidth + " " + s.outlineOffset,
    box_edge: rgb(s.borderTopColor),
    box_ring: rgb(s.outlineColor),
    primary: rgb(s.getPropertyValue("--primary").trim()),
    error: rgb(s.getPropertyValue("--error").trim()),
    ancestor,
    text: [Math.round((text[0] - box.left) * 100) / 100, Math.round((text[1] - box.top) * 100) / 100],
  };
})(${JSON.stringify(id)}, ${JSON.stringify(cid)}, ${JSON.stringify(tid)})`;

// Focuses the control before the target in tab order, without scrolling, so Tab is a real keypress onto the field.
const PREV = (cid: string) => `((cid) => {
  const c = document.querySelector('[data-focus-id="' + cid + '"]');
  const all = [...document.querySelectorAll("a[href], button, input, textarea, select, [tabindex]")].filter((e) =>
    e.tabIndex >= 0 && !e.disabled && e.getClientRects().length && getComputedStyle(e).visibility !== "hidden");
  const i = all.indexOf(c);
  (i > 0 ? all[i - 1] : document.body).focus({ preventScroll: true });
  return i;
})(${JSON.stringify(cid)})`;

const RESET = `(() => {
  document.activeElement && document.activeElement.blur && document.activeElement.blur();
  document.querySelectorAll("input:not([type=radio]):not([type=checkbox]), textarea").forEach((e) => {
    const set = Object.getOwnPropertyDescriptor(Object.getPrototypeOf(e), "value").set;
    set.call(e, e.defaultValue);
    e.dispatchEvent(new Event("input", { bubbles: true }));
  });
  return true;
})()`;

const sel = (focusId: string) => `[data-focus-id="${focusId}"]`;
const python = (...args: string[]) =>
  spawnSync(["python3", "-I", join(app, "tools/focus_frames.py"), ...args], { stdout: "inherit", stderr: "inherit" });

function shootFocus() {
  const out = join(dir, "focus");
  rmSync(out, { recursive: true, force: true });
  mkdirSync(out, { recursive: true });
  const manifest = join(out, "manifest.jsonl");
  writeFileSync(manifest, "");
  const viewport = join(out, "viewport.png");
  const list = values.only?.length ? focusPages.filter((path) => values.only!.includes(path)) : focusPages;
  ab("set", "viewport", "1440", "900", "2");
  // blurs the focused control, puts every field back to its default value and parks the pointer in a corner
  const reset = () => {
    js(RESET);
    ab("mouse", "move", "2", "2");
  };
  const centre = (focusId: string) =>
    js<number[]>(
      `(() => { const r = document.querySelector('${sel(focusId)}').getBoundingClientRect(); return [Math.round(r.x + r.width / 2), Math.round(r.y + r.height / 2)]; })()`,
    );

  for (const pageMode of modes) {
    ab("set", "media", pageMode);
    store(pageMode);
    for (const path of list) {
      visit(path, pageMode);
      const fields = js<Field[]>(TAG);
      const page = slug(path);
      if (fields.length === 0) {
        appendFileSync(manifest, `${JSON.stringify({ page, pageMode, count: false, note: "no fields yet" })}\n`);
        console.log(`focus: ${path} (${pageMode}): no fields yet`);
        continue;
      }
      for (const field of fields) {
        const shot = (how: string, focused: boolean, cid = field.cid) => {
          const rect = js<number[]>(
            `(() => { const r = document.querySelector('${sel(field.id)}').getBoundingClientRect(); return [r.x - 8, r.y - 8, r.width + 16, r.height + 16]; })()`,
          );
          ab("wait", "120");
          ab("screenshot", viewport);
          const file = `${page}-${pageMode}-${field.id}-${how}.png`;
          const crop = python("crop", viewport, join(out, file), ...rect.map(String), "2");
          if (crop.exitCode !== 0) throw new Error(`crop failed for ${file}`);
          const probe = js<Record<string, unknown>>(PROBE(field.id, cid, field.tid));
          const record = {
            page,
            pageMode,
            mode: field.mode,
            field: field.name,
            key: `${page}-${pageMode}-${field.id}`,
            how,
            file,
            focused,
            disabled: field.disabled,
            invalid: field.name.endsWith("_invalid"),
            active: probe.active,
            probe,
          };
          appendFileSync(manifest, `${JSON.stringify(record)}\n`);
        };
        reset();
        js(`document.querySelector('${sel(field.id)}').scrollIntoView({ block: "center" })`);
        if (field.disabled) {
          shot("rest", false);
          js(PREV(field.cid));
          ab("press", "Tab");
          shot("tab", false);
          reset();
          const [x, y] = centre(field.cid);
          ab("mouse", "move", String(x), String(y));
          ab("mouse", "down");
          ab("mouse", "up");
          shot("click", false);
          continue;
        }
        shot(field.demo ? "demo" : "rest", field.demo);
        if (field.tab >= 0) {
          js(PREV(field.cid));
          ab("press", "Tab");
          shot("tab", true);
        }
        reset();
        ab("click", sel(field.cid));
        if (field.select) {
          // the click opens the list; Escape closes it and hands focus back to the trigger. Base UI keeps a closed
          // list mounted inside a [hidden] positioner once its trigger has had focus, so wait until no list is left
          // outside one.
          ab("press", "Escape");
          ab(
            "wait",
            "--fn",
            `![...document.querySelectorAll('[data-slot="select-content"]')].some((e) => !e.closest("[hidden]"))`,
          );
          shot("click", true);
        } else {
          shot("click", true);
          ab("keyboard", "type", "abc");
          shot("type", true);
        }
        if (field.button) {
          ab("press", "Tab");
          shot("inner", false, field.button);
        }
      }
      reset();
    }
  }

  const verdict = python(out, "--html", "focus.html");
  // the contact sheet, shot at 1x
  ab("set", "viewport", "1440", "900", "1");
  ab("open", `file://${join(out, "focus.html")}`);
  ab("wait", "400");
  ab("screenshot", "--full", join(out, "focus.png"));
  rmSync(viewport, { force: true });
  const crops = readdirSync(out).filter((name) => name.endsWith(".png") && name !== "focus.png").length;
  console.log(`focus: ${crops} crops and the contact sheet in ${out}`);
  return verdict.exitCode ?? 1;
}

let code = 0;
try {
  if (values.focus) code = shootFocus();
  else shootPages();
} catch (error) {
  console.error(`shoot: ${error instanceof Error ? error.message : String(error)}`);
  code = 1;
} finally {
  if (ownSession) spawnSync(["agent-browser", "--session", session, "close"], { stdout: "ignore", stderr: "ignore" });
}
process.exit(code);
