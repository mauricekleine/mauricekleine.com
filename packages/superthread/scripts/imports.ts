// Derives an item's npm and @mk dependencies from the imports in its files.
// - @/components/superthread/<kind>/<x> becomes @mk/<the item whose target that is>
// - a bare package becomes <pkg>@^<floor>, the floor read from this package's devDependencies
// - react, react-dom and @types/* are skipped: the consuming app owns them
// Anything else (a relative import, another alias, a package with no range) fails the build.
import type { CatalogItem } from "../items/catalog.ts";

const transpiler = new Bun.Transpiler({ loader: "tsx" });

const scanned = /\.(tsx?|jsx?)$/;

// scanImports drops type-only imports, since they are erased at runtime. A consumer's type-check
// still needs the item that exports the type, so static import and export-from statements are
// read from the source as well.
const staticFrom = /^\s*(?:import|export)\b[^;"'`]*?\bfrom\s*["']([^"'\n]+)["']/gm;

export function specifiers(code: string, file = "<code>"): string[] {
  const found = new Set<string>();
  let runtime: ReturnType<typeof transpiler.scanImports>;
  try {
    runtime = transpiler.scanImports(code);
  } catch (error) {
    throw new Error(`${file} does not parse: ${error instanceof Error ? error.message : String(error)}`, {
      cause: error,
    });
  }
  for (const { path } of runtime) found.add(path);
  for (const match of code.matchAll(staticFrom)) found.add(match[1]!);
  return [...found].sort();
}

function packageName(specifier: string): string {
  const parts = specifier.split("/");
  return specifier.startsWith("@") ? parts.slice(0, 2).join("/") : parts[0]!;
}

const skipped = (pkg: string) => pkg === "react" || pkg === "react-dom" || pkg.startsWith("@types/");

// The alias every item imports through, and the target prefix every item installs under.
const alias = "@/components/superthread/";
const targetPrefix = "@components/superthread/";

const withoutExtension = (path: string) => path.replace(/\.(tsx?|jsx?)$/, "");

export function owners(items: CatalogItem[]): Map<string, string> {
  const map = new Map<string, string>();
  for (const item of items)
    for (const file of item.files) {
      if (!file.target.startsWith(targetPrefix))
        throw new Error(`${item.name}: target ${file.target} is outside ${targetPrefix}`);
      const key = withoutExtension(file.target.slice(targetPrefix.length));
      const other = map.get(key);
      if (other) throw new Error(`${item.name} and ${other} both install ${file.target}`);
      map.set(key, item.name);
    }
  return map;
}

export function floors(devDependencies: Record<string, string>): Map<string, string> {
  const map = new Map<string, string>();
  for (const [pkg, range] of Object.entries(devDependencies)) {
    const floor = range.replace(/^[~^]/, "");
    if (/^\d+\.\d+\.\d+$/.test(floor)) map.set(pkg, floor);
  }
  return map;
}

type Derived = { dependencies: string[]; registryDependencies: string[] };

export function derive(
  item: CatalogItem,
  sources: Map<string, string>,
  ownerOf: Map<string, string>,
  floorOf: Map<string, string>,
): Derived {
  const dependencies = new Set<string>();
  const registryDependencies = new Set<string>();
  for (const file of item.files) {
    if (!scanned.test(file.path)) continue;
    const code = sources.get(file.path);
    if (code === undefined) throw new Error(`${item.name}: no source for ${file.path}`);
    for (const specifier of specifiers(code, file.path)) {
      const where = `${item.name}: ${file.path} imports ${specifier}`;
      if (specifier.startsWith(alias)) {
        const owner = ownerOf.get(withoutExtension(specifier.slice(alias.length)));
        if (!owner) throw new Error(`${where}, which no catalog item installs`);
        if (owner !== item.name) registryDependencies.add(`@mk/${owner}`);
        continue;
      }
      if (
        specifier.startsWith(".") ||
        specifier.startsWith("/") ||
        specifier.startsWith("@/") ||
        specifier.includes(":")
      )
        throw new Error(`${where}; items import other items through ${alias} and packages by name`);
      const pkg = packageName(specifier);
      if (skipped(pkg)) continue;
      const floor = floorOf.get(pkg);
      if (!floor) throw new Error(`${where}, and package.json devDependencies has no x.y.z range for ${pkg}`);
      dependencies.add(`${pkg}@^${floor}`);
    }
  }
  return { dependencies: [...dependencies].sort(), registryDependencies: [...registryDependencies].sort() };
}
