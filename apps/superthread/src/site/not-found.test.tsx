// The Worker answers every path the site does not have with the prerendered /404 (notFoundHandling "404-page"), and
// the client hydrates that document at the path the browser asked for. There the router renders the root's not-found
// component, not the /404 route, so the two must print the same document node for node: on any difference React
// renders the whole document again, and that strips the mode the theme script set on <html>.
import { describe, expect, mock, test } from "bun:test";
import { readFileSync } from "node:fs";
import { createMemoryHistory, createRouter, RouterProvider } from "@tanstack/react-router";
import { renderToString } from "react-dom/server";

// bun has no ?url loader; the root links the stylesheet by the URL vite would hand it
mock.module("../styles/app.css?url", () => ({ default: "/assets/app.css" }));
const { routeTree } = await import("../routeTree.gen");

const pkg = JSON.parse(readFileSync(new URL("../../../../packages/superthread/package.json", import.meta.url), "utf8"));
Object.assign(globalThis, { __BUILD_DATE__: "01.01.26", __SUPERTHREAD_VERSION__: pkg.version });

// the document the router renders at a path, the way the prerender renders /404
async function render(path: string): Promise<string> {
  const router = createRouter({ routeTree, history: createMemoryHistory({ initialEntries: [path] }) });
  await router.load();
  return renderToString(<RouterProvider router={router} />);
}

describe("a path the router does not know", () => {
  test.each(["/nope", "/components/nope", "/mock/nope"])(
    "%s prints the document the prerendered /404 holds",
    async (path) => {
      expect(await render(path)).toBe(await render("/404"));
    },
  );
});
