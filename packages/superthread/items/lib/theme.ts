import { useSyncExternalStore } from "react";

// One mode across the fleet. The choice lives in a cookie on mauricekleine.com, so every ship reads the same one, with
// a localStorage copy in case the browser expires the cookie early. themeScript runs in <head>, before the first paint,
// and writes the mode onto <html>: the `dark` or `light` class, data-theme, data-theme-choice and color-scheme. It also
// sets a <meta name="theme-color"> placed ahead of it from that tag's data-light and data-dark. React renders no mode
// class on <html>, so it never fights the script; the store below keeps the page in step after that.

export const themeKey = "mk-theme";

export type ThemeChoice = "light" | "dark" | "auto";
export type Theme = "light" | "dark";

export const themeScript = `(function(){var d=document.documentElement,c="auto",r,s;try{s=(document.cookie.match(/(?:^|; )${themeKey}=(light|dark|auto)(?:;|$)/)||[])[1]||localStorage.getItem("${themeKey}");if(s==="light"||s==="dark"||s==="auto")c=s}catch(e){}try{r=c==="auto"?(matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light"):c}catch(e){r="light"}d.classList.toggle("dark",r==="dark");d.classList.toggle("light",r==="light");d.setAttribute("data-theme",r);d.setAttribute("data-theme-choice",c);d.style.colorScheme=r;var m=document.querySelector('meta[name="theme-color"]');if(m)m.content=m.getAttribute("data-"+r)||m.content})()`;

const isChoice = (value: string | null | undefined): value is ThemeChoice =>
  value === "light" || value === "dark" || value === "auto";

function stored(): ThemeChoice | null {
  try {
    const cookie = new RegExp(`(?:^|; )${themeKey}=([^;]*)`).exec(document.cookie)?.[1];
    if (isChoice(cookie)) return cookie;
    const saved = localStorage.getItem(themeKey);
    return isChoice(saved) ? saved : null;
  } catch {
    // storage is blocked
    return null;
  }
}

function store(choice: ThemeChoice) {
  try {
    const { hostname, protocol } = location;
    const fleet = hostname === "mauricekleine.com" || hostname.endsWith(".mauricekleine.com");
    const scope = `${fleet ? "; domain=mauricekleine.com" : ""}${protocol === "https:" ? "; secure" : ""}`;
    document.cookie = `${themeKey}=${choice}; path=/; max-age=34560000; samesite=lax${scope}`;
    localStorage.setItem(themeKey, choice);
  } catch {
    // storage is blocked: the mode holds for this page only
  }
}

export const readChoice = (): ThemeChoice => stored() ?? "auto";

export function resolveTheme(choice: ThemeChoice): Theme {
  if (choice !== "auto") return choice;
  try {
    return matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  } catch {
    return "light";
  }
}

export function applyTheme(choice: ThemeChoice): Theme {
  const theme = resolveTheme(choice);
  const root = document.documentElement;
  root.classList.toggle("dark", theme === "dark");
  root.classList.toggle("light", theme === "light");
  root.setAttribute("data-theme", theme);
  root.setAttribute("data-theme-choice", choice);
  root.style.colorScheme = theme;
  const meta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
  if (meta) meta.content = meta.getAttribute(`data-${theme}`) ?? meta.content;
  return theme;
}

// One store for every mode control on the page. The choice in force lives on <html> as data-theme-choice: the script
// set it before React ran, and every choice made here sets it again, whether or not storage takes the write.
const listeners = new Set<() => void>();
const notify = () => listeners.forEach((listener) => listener());

const getChoice = () => (document.documentElement.getAttribute("data-theme-choice") as ThemeChoice | null) ?? "auto";
const getTheme = () => (document.documentElement.getAttribute("data-theme") as Theme | null) ?? "light";

function attach() {
  const system = matchMedia("(prefers-color-scheme: dark)");
  // the choice in force, never storage: with storage blocked, a choice made on this page lives only on <html>
  const onSystem = () => {
    if (getChoice() === "auto") applyTheme("auto");
    notify();
  };
  // Another tab or ship may have chosen: cookies raise no event, so the page reads them again when it comes back.
  const onReturn = (event: Event) => {
    if (event instanceof StorageEvent && event.key !== null && event.key !== themeKey) return;
    if (document.visibilityState === "hidden") return;
    const choice = stored();
    if (choice === null || choice === getChoice()) return;
    applyTheme(choice);
    notify();
  };
  const saved = stored();
  if (saved) store(saved); // a page visit renews the cookie's lifetime
  system.addEventListener("change", onSystem);
  window.addEventListener("storage", onReturn);
  window.addEventListener("focus", onReturn);
  document.addEventListener("visibilitychange", onReturn);
  return () => {
    system.removeEventListener("change", onSystem);
    window.removeEventListener("storage", onReturn);
    window.removeEventListener("focus", onReturn);
    document.removeEventListener("visibilitychange", onReturn);
  };
}

let detach: (() => void) | null = null;

function subscribe(listener: () => void) {
  listeners.add(listener);
  detach ??= attach();
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) {
      detach?.();
      detach = null;
    }
  };
}

// null until hydration: prerendered markup cannot know the mode
export const useThemeChoice = (): ThemeChoice | null => useSyncExternalStore(subscribe, getChoice, () => null);
export const useTheme = (): Theme | null => useSyncExternalStore(subscribe, getTheme, () => null);

export function setThemeChoice(choice: ThemeChoice) {
  store(choice);
  applyTheme(choice);
  notify();
}

export const toggleTheme = () => setThemeChoice(getTheme() === "dark" ? "light" : "dark");
