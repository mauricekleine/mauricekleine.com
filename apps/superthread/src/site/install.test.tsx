import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { createMemoryHistory, createRootRoute, createRouter, Outlet, RouterProvider } from "@tanstack/react-router";
import { renderToString } from "react-dom/server";
import { catalog } from "@/components/superthread/catalog";
import { fleet } from "@/components/superthread/lib/fleet";
import { commandFor, InitLine, Route as InstallRoute } from "../routes/install";
import { spotNames } from "./FleetRow";

const pkg = join(import.meta.dir, "../../../../packages/superthread");
const readJson = (path: string): unknown => JSON.parse(readFileSync(join(pkg, path), "utf8"));

// the line the page has to print, built here from the recorded form and the production host, not from the page's code
function expectedInitLine(): string {
  const form = readJson("upstream/cli/init-form.json") as { args: string[] };
  const args = form.args.map((arg) => arg.replaceAll("<base>", "https://superthread.mauricekleine.com"));
  return ["bunx --bun shadcn@latest", ...args].join(" ");
}

const decode = (text: string) =>
  text
    .replaceAll("&quot;", '"')
    .replaceAll("&#x27;", "'")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
    .replaceAll("&amp;", "&");

// the text of every <code> in server-rendered markup
function codeTexts(html: string): string[] {
  return [...html.matchAll(/<code[^>]*>([\s\S]*?)<\/code>/g)].map((match) =>
    decode((match[1] ?? "").replaceAll("<!-- -->", "").replace(/<[^>]+>/g, "")),
  );
}

// /install on its own under a bare root, rendered the way the prerender renders it
async function renderInstall(): Promise<string> {
  const version = (readJson("package.json") as { version: string }).version;
  Object.assign(globalThis, { __SUPERTHREAD_VERSION__: version });
  const root = createRootRoute({ component: Outlet });
  const install = InstallRoute.update({ id: "/install", path: "/install", getParentRoute: () => root } as never);
  const router = createRouter({
    routeTree: root.addChildren([install]),
    history: createMemoryHistory({ initialEntries: ["/install"] }),
  });
  await router.load();
  return renderToString(<RouterProvider router={router} />);
}

describe("/install", () => {
  test("the init line is the recorded form with the base filled in", () => {
    expect(codeTexts(renderToString(<InitLine />))).toEqual([expectedInitLine()]);
  });

  test("the page prints the init line and one install line for every catalog item", async () => {
    const html = await renderInstall();
    const lines = codeTexts(html);
    expect(lines).toContain(expectedInitLine());
    // the items without a page of their own are the ones most easily left out
    const names = catalog.map((item) => item.name);
    expect(names).toEqual(expect.arrayContaining(["init", "tokens", "tokens-plain", "utils", "fleet"]));
    for (const name of names) {
      expect(html.split(`id="item-${name}"`)).toHaveLength(2);
      expect(lines).toContain(commandFor(name));
    }
  });

  test("each composition names every app it serves, in the catalog's order", async () => {
    const html = await renderInstall();
    const blocks = catalog.filter((item) => item.tier === "block");
    expect(blocks.length).toBeGreaterThan(0);
    for (const block of blocks) {
      const row = html.split(`id="item-${block.name}"`)[1]?.split("</li>")[0] ?? "";
      const apps = block.serves ?? [];
      const said = `serves ${apps.slice(0, -1).join(", ")} and ${apps.at(-1)}`;
      expect(row).toContain(said);
    }
  });
});

describe("the fleet row", () => {
  test("each ship's spot ink has the master's name", () => {
    const master = readJson("tokens/master.json") as { ships: Record<string, { "spot name": string }> };
    for (const ship of fleet) {
      if (master.ships[ship.id]) expect(spotNames[ship.id]).toBe(master.ships[ship.id]!["spot name"]);
      else expect(spotNames[ship.id]).toBe("new star");
    }
  });
});
