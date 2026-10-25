// The Worker serves the prerendered /404 at every path the site does not have, so that document must not hydrate:
// at such a path the client router would match something other than /404 and render the whole page again.
import { expect, mock, test } from "bun:test";
import { createMemoryHistory, createRouter, RouterProvider } from "@tanstack/react-router";
import { renderToString } from "react-dom/server";

// bun has no import.meta.glob; neither page reads an essay
mock.module("./essay-content", () => ({
  essays: [],
  essaysBySlug: {},
  essayNeighbors: () => ({}),
  articleMarkdown: () => "",
}));
const { routeTree } = await import("./routeTree.gen");

const entry = "/assets/entry.js";

// the document the prerender writes for a path, with the build's manifest handing the root its client entry
async function render(path: string): Promise<string> {
  const router = createRouter({ routeTree, history: createMemoryHistory({ initialEntries: [path] }) });
  router.ssr = { manifest: { routes: { __root__: { scripts: [{ attrs: { type: "module", src: entry } }] } } } };
  await router.load();
  return renderToString(<RouterProvider router={router} />);
}

test("a page carries the client entry", async () => {
  expect(await render("/")).toContain(`src="${entry}"`);
});

test("the lost page carries none", async () => {
  expect(await render("/404")).not.toContain(`src="${entry}"`);
});
