import { expect } from "bun:test";

export type Rule = { sel: string; decls: [string, string][]; rules: Rule[] };

/** A block tree of the file: every rule or at-rule with its own declarations and nested rules, whitespace normalised. */
export function parse(css: string): Rule {
  const norm = (s: string) => s.replace(/\s+/g, " ").replace(/\(\s/g, "(").replace(/\s\)/g, ")").trim();
  const top: Rule = { sel: "", decls: [], rules: [] };
  const stack = [top];
  let buf = "";
  let parens = 0;
  const decl = () => {
    const s = norm(buf);
    buf = "";
    if (!s) return;
    const i = s.indexOf(":");
    stack.at(-1)!.decls.push([s.slice(0, i).trim(), s.slice(i + 1).trim()]);
  };
  for (const ch of css.replace(/\/\*[\s\S]*?\*\//g, "")) {
    if (ch === "(") parens++;
    if (ch === ")") parens--;
    if (parens === 0 && ch === "{") {
      const rule: Rule = { sel: norm(buf), decls: [], rules: [] };
      buf = "";
      stack.at(-1)!.rules.push(rule);
      stack.push(rule);
    } else if (parens === 0 && ch === "}") {
      decl();
      stack.pop();
    } else if (parens === 0 && ch === ";") decl();
    else buf += ch;
  }
  expect(stack).toHaveLength(1);
  return top;
}

export const child = (rule: Rule, sel: string) => {
  const found = rule.rules.filter((r) => r.sel === sel);
  expect({ in: rule.sel, sel, count: found.length }).toEqual({ in: rule.sel, sel, count: 1 });
  return found[0]!;
};

export const value = (rule: Rule, prop: string) => Object.fromEntries(rule.decls)[prop];
