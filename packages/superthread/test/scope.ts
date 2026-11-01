// The dark scope's selector, matched by hand: happy-dom treats a descendant chain inside :is() or :not() as matching
// nothing, so `element.matches(DARK)` is false everywhere.

/** An element as its chain of class lists, the root first and the element last. */
export type Chain = string[][];

/** A rendered element's chain, up through every ancestor it has. */
export function chainOf(el: Element): Chain {
  const chain: Chain = [];
  for (let node: Element | null = el; node; node = node.parentElement) chain.unshift([...node.classList]);
  return chain;
}

// A descendant chain of `.class` and `*` compounds, matched as css does: the last compound on the element, each
// earlier one on a further ancestor (the nearest that matches, which is enough for descendant combinators alone).
function chainMatches(complex: string, chain: Chain): boolean {
  const compounds = complex.trim().split(/\s+/);
  const fits = (compound: string, classes: string[]) => {
    if (compound === "*") return true;
    if (!/^(\.[a-z-]+)+$/.test(compound)) throw new Error(`no matcher for ${compound}`);
    return compound
      .split(".")
      .slice(1)
      .every((name) => classes.includes(name));
  };
  let at = chain.length - 1;
  if (!fits(compounds.at(-1)!, chain[at]!)) return false;
  for (const compound of compounds.slice(0, -1).reverse()) {
    at--;
    while (at >= 0 && !fits(compound, chain[at]!)) at--;
    if (at < 0) return false;
  }
  return true;
}

/** `&` followed by :is() and :not() over lists of descendant chains: DARK's grammar. */
export function inScope(selector: string, chain: Chain): boolean {
  const body = selector.replace(/^&/, "");
  const parts = [...body.matchAll(/:(is|not)\(([^()]*)\)/g)];
  if (parts.map((m) => m[0]).join("") !== body) throw new Error(`no matcher for ${selector}`);
  return parts.every(([, fn, list]) => list!.split(",").some((c) => chainMatches(c, chain)) === (fn === "is"));
}
