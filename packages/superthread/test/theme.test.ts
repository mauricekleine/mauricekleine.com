import { afterEach, describe, expect, test } from "bun:test";
import { applyTheme, readChoice, setThemeChoice, themeKey, themeScript, type ThemeChoice } from "../items/lib/theme";

type Fakes = { root: FakeRoot; storage: FakeStorage; page: FakePage };

class FakeRoot {
  classes = new Set<string>();
  attributes = new Map<string, string>();
  style = { colorScheme: "" };
  classList = {
    toggle: (name: string, on: boolean) => {
      if (on) this.classes.add(name);
      else this.classes.delete(name);
      return on;
    },
  };
  setAttribute(name: string, value: string) {
    this.attributes.set(name, value);
  }
}

class FakeStorage {
  constructor(
    private values: Record<string, string>,
    private broken = false,
  ) {}
  getItem(key: string) {
    if (this.broken) throw new Error("storage is off");
    return this.values[key] ?? null;
  }
  setItem(key: string, value: string) {
    if (this.broken) throw new Error("storage is off");
    this.values[key] = value;
  }
}

// document.cookie and the theme-color tag, as a page holds them
class FakePage {
  written = "";
  meta: FakeMeta | null = null;
  constructor(public documentElement: FakeRoot) {}
  get cookie() {
    return this.written.split("; ")[0] ?? "";
  }
  set cookie(value: string) {
    this.written = value;
  }
  querySelector() {
    return this.meta;
  }
}

class FakeMeta {
  content = "#000000";
  getAttribute(name: string) {
    return { "data-light": "#ffffff", "data-dark": "#16181d" }[name] ?? null;
  }
}

const names = ["document", "localStorage", "matchMedia", "location"] as const;
const saved = names.map((name) => [name, Object.getOwnPropertyDescriptor(globalThis, name)] as const);
const define = (name: (typeof names)[number], value: unknown) =>
  Object.defineProperty(globalThis, name, { configurable: true, writable: true, value });

// installs the fakes as the globals the script and applyTheme read
function install(stored: string | null, systemDark: boolean | "throws", broken = false): Fakes {
  const root = new FakeRoot();
  const storage = new FakeStorage(stored === null ? {} : { [themeKey]: stored }, broken);
  const page = new FakePage(root);
  define("document", page);
  define("localStorage", storage);
  define("location", { hostname: "orbit.mauricekleine.com", protocol: "https:" });
  define("matchMedia", (query: string) => {
    if (systemDark === "throws") throw new Error("no matchMedia");
    expect(query).toBe("(prefers-color-scheme: dark)");
    return { matches: systemDark };
  });
  return { root, storage, page };
}

afterEach(() => {
  for (const [name, descriptor] of saved) {
    if (descriptor) Object.defineProperty(globalThis, name, descriptor);
    else delete (globalThis as Record<string, unknown>)[name];
  }
});

const runScript = () => new Function(themeScript)();

const state = ({ root }: Fakes) => ({
  classes: [...root.classes],
  theme: root.attributes.get("data-theme"),
  choice: root.attributes.get("data-theme-choice"),
  colorScheme: root.style.colorScheme,
});

const cases: [stored: string | null, systemDark: boolean | "throws", broken: boolean, theme: string, choice: string][] =
  [
    ["light", true, false, "light", "light"],
    ["dark", false, false, "dark", "dark"],
    ["auto", true, false, "dark", "auto"],
    ["auto", false, false, "light", "auto"],
    [null, true, false, "dark", "auto"],
    [null, false, false, "light", "auto"],
    ["sepia", true, false, "dark", "auto"],
    ["", false, false, "light", "auto"],
    ["dark", true, true, "dark", "auto"],
    ["light", false, true, "light", "auto"],
    ["auto", "throws", false, "light", "auto"],
    ["dark", "throws", false, "dark", "dark"],
  ];

describe("the inline theme script", () => {
  test.each(cases)("stored %p, system dark %p, storage broken %p", (stored, systemDark, broken, theme, choice) => {
    const fakes = install(stored, systemDark, broken);
    runScript();
    expect(state(fakes)).toEqual({
      classes: [theme],
      theme,
      choice,
      colorScheme: theme,
    });
  });

  test("reads the key the runtime writes", () => {
    expect(themeScript).toContain(`localStorage.getItem("${themeKey}")`);
    expect(themeKey).toBe("mk-theme");
  });

  test("the cookie wins over this ship's own copy", () => {
    const fakes = install("light", false);
    fakes.page.cookie = `${themeKey}=dark`;
    runScript();
    expect(state(fakes).choice).toBe("dark");
    expect(readChoice()).toBe("dark");
  });

  test("sets a theme-color tag ahead of it", () => {
    const fakes = install("dark", false);
    fakes.page.meta = new FakeMeta();
    runScript();
    expect(fakes.page.meta.content).toBe("#16181d");
  });

  test("is one self-contained statement with no em dash", () => {
    expect(themeScript.startsWith("(function(){")).toBe(true);
    expect(themeScript.endsWith("})()")).toBe(true);
    expect(themeScript).not.toContain("\u2014");
    expect(themeScript).not.toContain("</script");
  });
});

describe("applyTheme matches the script", () => {
  test.each(cases)("stored %p, system dark %p, storage broken %p", (stored, systemDark, broken) => {
    const viaScript = install(stored, systemDark, broken);
    runScript();
    const expected = state(viaScript);

    const viaRuntime = install(stored, systemDark, broken);
    applyTheme(readChoice());
    expect(state(viaRuntime)).toEqual(expected);
  });

  test("switching from dark to light swaps the class and the theme-color", () => {
    const fakes = install("dark", false);
    fakes.page.meta = new FakeMeta();
    runScript();
    expect(fakes.root.classes.has("dark")).toBe(true);
    setThemeChoice("light");
    expect(state(fakes)).toEqual({ classes: ["light"], theme: "light", choice: "light", colorScheme: "light" });
    expect(fakes.page.meta.content).toBe("#ffffff");
  });

  test("a choice is stored for the whole fleet, and the script reads it back", () => {
    for (const choice of ["light", "dark", "auto"] satisfies ThemeChoice[]) {
      const fakes = install(null, true);
      setThemeChoice(choice);
      expect(fakes.page.written).toBe(
        `${themeKey}=${choice}; path=/; max-age=34560000; samesite=lax; domain=mauricekleine.com; secure`,
      );
      expect(fakes.storage.getItem(themeKey)).toBe(choice);
      runScript();
      expect(state(fakes).choice).toBe(choice);
    }
  });

  test("away from the fleet's domain the cookie stays on its host", () => {
    const fakes = install(null, true);
    define("location", { hostname: "localhost", protocol: "http:" });
    setThemeChoice("dark");
    expect(fakes.page.written).toBe(`${themeKey}=dark; path=/; max-age=34560000; samesite=lax`);
  });

  test("a choice still applies when storage is off", () => {
    const fakes = install(null, false, true);
    setThemeChoice("dark");
    expect(state(fakes).theme).toBe("dark");
  });
});
