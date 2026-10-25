import { afterEach, describe, expect, test } from "bun:test";
import { applyTheme, chooseTheme, readChoice, themeKey, themeScript, type ThemeChoice } from "./theme-script";

type Fakes = { root: FakeRoot; storage: FakeStorage };

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

const globals = globalThis as Record<string, unknown>;
const saved = { document: globals.document, localStorage: globals.localStorage, matchMedia: globals.matchMedia };

// installs the fakes as the globals the script and applyTheme read
function install(stored: string | null, systemDark: boolean | "throws", broken = false): Fakes {
  const root = new FakeRoot();
  const storage = new FakeStorage(stored === null ? {} : { [themeKey]: stored }, broken);
  globals.document = { documentElement: root };
  globals.localStorage = storage;
  globals.matchMedia = (query: string) => {
    if (systemDark === "throws") throw new Error("no matchMedia");
    expect(query).toBe("(prefers-color-scheme: dark)");
    return { matches: systemDark };
  };
  return { root, storage };
}

afterEach(() => Object.assign(globals, saved));

const runScript = () => new Function(themeScript)();

const state = ({ root }: Fakes) => ({
  dark: root.classes.has("dark"),
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
      dark: theme === "dark",
      classes: theme === "dark" ? ["dark"] : [],
      theme,
      choice,
      colorScheme: theme,
    });
  });

  test("reads the key the runtime writes", () => {
    expect(themeScript).toContain(`localStorage.getItem("${themeKey}")`);
    expect(themeKey).toBe("superthread-theme");
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

  test("switching from dark to light drops the class", () => {
    const fakes = install("dark", false);
    runScript();
    expect(fakes.root.classes.has("dark")).toBe(true);
    chooseTheme("light");
    expect(state(fakes)).toEqual({ dark: false, classes: [], theme: "light", choice: "light", colorScheme: "light" });
  });

  test("chooseTheme stores the choice, and the script reads it back", () => {
    for (const choice of ["light", "dark", "auto"] satisfies ThemeChoice[]) {
      const fakes = install(null, true);
      chooseTheme(choice);
      expect(fakes.storage.getItem(themeKey)).toBe(choice);
      runScript();
      expect(state(fakes).choice).toBe(choice);
    }
  });

  test("chooseTheme still applies when storage is off", () => {
    const fakes = install(null, false, true);
    expect(chooseTheme("dark")).toBe("dark");
    expect(state(fakes).dark).toBe(true);
  });
});
