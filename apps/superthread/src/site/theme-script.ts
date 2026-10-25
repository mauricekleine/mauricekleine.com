// The mode, set before the first paint. `themeScript` is the first child of <head> (server.ts puts it there), ahead
// of every stylesheet and script, so the page never shows the wrong mode. It reads the stored choice (light, dark or
// auto; anything else, or storage that throws, is auto), resolves auto against the system, and writes the result
// onto <html>: the `dark` class, data-theme (light or dark), data-theme-choice (the choice) and color-scheme.
// React renders no class on <html>, so it never fights the script. `applyTheme` does the same at runtime for the
// mode control; theme-script.test.ts runs both against the same fakes.

export const themeKey = "superthread-theme";

export type ThemeChoice = "light" | "dark" | "auto";
export type Theme = "light" | "dark";

export const themeScript = `(function(){var d=document.documentElement,c="auto",r;try{var s=localStorage.getItem("${themeKey}");if(s==="light"||s==="dark"||s==="auto")c=s}catch(e){}try{r=c==="auto"?(matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light"):c}catch(e){r="light"}d.classList.toggle("dark",r==="dark");d.setAttribute("data-theme",r);d.setAttribute("data-theme-choice",c);d.style.colorScheme=r})()`;

export function readChoice(): ThemeChoice {
  try {
    const stored = localStorage.getItem(themeKey);
    if (stored === "light" || stored === "dark" || stored === "auto") return stored;
  } catch {
    // storage is blocked: the choice is auto
  }
  return "auto";
}

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
  root.setAttribute("data-theme", theme);
  root.setAttribute("data-theme-choice", choice);
  root.style.colorScheme = theme;
  return theme;
}

// stores the choice (when storage allows) and applies it
export function chooseTheme(choice: ThemeChoice): Theme {
  try {
    localStorage.setItem(themeKey, choice);
  } catch {
    // storage is blocked: the mode holds for this page only
  }
  return applyTheme(choice);
}
