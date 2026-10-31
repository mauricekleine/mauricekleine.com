import { expect, test } from "bun:test";
import { createMemoryHistory, createRootRoute, createRouter, Outlet, RouterProvider } from "@tanstack/react-router";
import { renderToString } from "react-dom/server";
import manifest from "../../../../packages/superthread/marks/fleet.json";
import { Route as IconsRoute } from "../routes/icons";
import { nav, prerenderPaths } from "./nav";

test("/icons is a docs page in the nav and serves every current mark's downloads without client JavaScript", async () => {
  expect(nav.find((entry) => entry.path === "/icons")?.layout).toBe("docs");
  expect(prerenderPaths).toContain("/icons");
  const root = createRootRoute({ component: Outlet });
  const icons = IconsRoute.update({ id: "/icons", path: "/icons", getParentRoute: () => root } as never);
  const router = createRouter({
    routeTree: root.addChildren([icons]),
    history: createMemoryHistory({ initialEntries: ["/icons"] }),
  });
  await router.load();
  const html = renderToString(<RouterProvider router={router} />);
  const downloads = [...html.matchAll(/<a\b[^>]*href="([^"]+)"[^>]*download=""/g)].map((match) => match[1]);
  // These two ships guard the easy omissions: a ship with no rail cell and a ship outside the original master.
  expect(html).toContain('id="soliton"');
  expect(html).toContain('id="telemetry"');
  expect(html).not.toContain("pilot");
  expect(downloads).toContain("/marks/superthread-icons.zip");
  for (const ship of manifest.fleet) {
    expect(downloads).toContain(`/marks/${ship.id}/${ship.id}.zip`);
    for (const mode of ["light", "dark"] as const) {
      expect(html).toContain(`alt="${ship.name} for ${mode} chrome"`);
      expect(downloads).toContain(`/marks/${ship.id}/${ship.mark[mode]}`);
      for (const size of [16, 32, 48, 64, 128, 256, 512, 1024])
        expect(downloads).toContain(`/marks/${ship.id}/png/${ship.id}-${mode}-${size}.png`);
    }
  }
  expect(downloads).toHaveLength(manifest.fleet.length * 19 + 1);
});
