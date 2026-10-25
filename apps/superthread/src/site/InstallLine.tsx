import { CodePatch } from "./CodePatch";

// The install line for registry items, as the sketch prints it: the shadcn CLI at @latest, the @mk namespace.
export function installCommand(...items: string[]): string {
  return `bunx --bun shadcn@latest add ${items.map((item) => `@mk/${item}`).join(" ")}`;
}

export function InstallLine({ items, className }: { items: string[]; className?: string }) {
  return <CodePatch command={installCommand(...items)} className={className} />;
}
