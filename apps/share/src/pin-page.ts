import tokens from "../../../packages/superthread/dist/v2/superthread-plain.css";

// The faces load from this Worker: see fonts.ts.
const theme = tokens.replaceAll("https://superthread.mauricekleine.com/fonts/", "/_fonts/");

// No script runs under this page's CSP, so the worker prints the fleet's stored mode as a class, and with no choice
// stored the dark block answers to the system instead.
const dark = theme.slice(theme.indexOf(".dark {"), theme.indexOf("}", theme.indexOf(".dark {")) + 1);
const systemDark = `@media (prefers-color-scheme: dark) { ${dark.replace(".dark", "html:not(.light)")} }`;

// Off paper a plum fill prints pale pink, so in a dark scope the button prints as the outline.
const outline = (scope: string) =>
  `${scope} button { border-color: currentColor; background: transparent; color: var(--foreground); } ${scope} button:hover { background: var(--control-hover); }`;

export type PinMode = "light" | "dark" | null;

export function pinPage(id: string, challenge: string, mode: PinMode = null) {
  return `<!doctype html><html lang="en"${mode ? ` class="${mode}"` : ""}><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>shared artifact</title><style>${theme}
${systemDark}
* { box-sizing: border-box; }
body { margin: 0; background: var(--background); color: var(--foreground); font: 400 14px/21px var(--font-sans); -webkit-font-smoothing: antialiased; }
main { width: min(100% - 48px, 360px); margin: 18vh auto 48px; }
h1 { margin: 0 0 16px; color: var(--first); font: 300 30px/34px var(--font-display); }
p { margin: 0 0 32px; color: var(--muted-foreground); font-size: 15px; line-height: 24px; }
label { display: block; margin-bottom: 8px; font-weight: 500; }
input, button { width: 100%; height: 40px; border-radius: 0; font: inherit; }
input { padding: 0 12px; border: 1px solid var(--input); background: var(--background); color: var(--foreground); caret-color: var(--ring); font-family: var(--font-mono); }
button { margin-top: 16px; border: 1px solid transparent; padding: 0 16px; background: var(--primary); color: var(--primary-foreground); font-weight: 500; cursor: pointer; }
button:hover { background: var(--primary-hover); }
@media (max-width: 600px) { input, button { height: 44px; } }
${outline(".dark")}
@media (prefers-color-scheme: dark) { ${outline("html:not(.light)")} }
:focus-visible { outline: 2px solid var(--ring); outline-offset: 2px; }
input:focus-visible { outline-offset: -2px; }
::selection { background: var(--selection); color: var(--foreground); }
small { display: block; margin-top: 24px; color: var(--muted-foreground); font-size: 13px; line-height: 20px; }

</style></head><body><main><h1>shared with you</h1><p>enter the six-digit PIN from the person who sent you this link.</p><form action="/${id}/_unlock" method="post"><input type="hidden" name="challenge" value="${challenge}"><label for="pin">PIN</label><input id="pin" name="pin" type="text" inputmode="numeric" pattern="[0-9]{6}" minlength="6" maxlength="6" autocomplete="off" required autofocus aria-describedby="attempts"><button type="submit">open artifact</button><small id="attempts">five wrong tries lock this link for an hour.</small></form></main></body></html>`;
}
