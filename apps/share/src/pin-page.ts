import theme from "../../../packages/superthread/dist/superthread.css";

export function pinPage(id: string, challenge: string) {
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>shared artifact</title><style>${theme.replace("@theme inline", ":root")}
* { box-sizing: border-box; }
body { margin: 0; background: var(--background); color: var(--foreground); font: 16px/1.5 var(--font-sans); }
main { width: min(100% - 48px, 360px); margin: 18vh auto 48px; }
h1 { margin: 0 0 16px; font: 600 24px/1.15 var(--font-display); }
p { margin: 0 0 32px; color: var(--muted-foreground); }
label { display: block; margin-bottom: 8px; font-size: 14px; }
input, button { width: 100%; min-height: 48px; border-radius: 6px; font: inherit; }
input { padding: 12px 16px; border: 1px solid var(--input); background: var(--card); color: var(--foreground); font-family: var(--font-mono); font-size: 24px; letter-spacing: .2em; caret-color: var(--primary); }
button { margin-top: 16px; border: 0; padding: 12px 16px; background: var(--primary); color: var(--primary-foreground); cursor: pointer; }
button:hover { filter: brightness(.95); }
:focus-visible { outline: 2px solid var(--ring); outline-offset: 2px; }
::selection { background: var(--primary); color: var(--primary-foreground); }
small { display: block; margin-top: 24px; color: var(--muted-foreground); font-size: 14px; }

</style></head><body><main><h1>shared with you</h1><p>enter the six-digit PIN from the person who sent you this link.</p><form action="/${id}/_unlock" method="post"><input type="hidden" name="challenge" value="${challenge}"><label for="pin">PIN</label><input id="pin" name="pin" type="text" inputmode="numeric" pattern="[0-9]{6}" minlength="6" maxlength="6" autocomplete="off" required autofocus aria-describedby="attempts"><button type="submit">open artifact</button><small id="attempts">five wrong tries lock this link for an hour.</small></form></main></body></html>`;
}
