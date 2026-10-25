// The compositions: the patterns the fleet's apps repeat, built from the @mk items. Every block names the apps it
// serves, carries data-mk on each root it renders, composes items through the alias consumers install them to, and
// keeps the items' rules: no detail of its own, no forbidden class, lowercase words (items-scan holds those).
import { beforeAll, describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  PageHeader,
  PageHeaderActions,
  PageHeaderBack,
  PageHeaderDescription,
  PageHeaderMeta,
  PageHeaderTitle,
} from "@/components/superthread/blocks/page-header";
import {
  EmptyState,
  EmptyStateActions,
  EmptyStateMedia,
  EmptyStateText,
  FailedState,
  LoadingState,
} from "@/components/superthread/blocks/states";
import { Button } from "@/components/superthread/ui/button";
import { type App, catalog } from "../items/catalog.ts";
import { detailsUsed, elements, forbidden, one, server } from "./rendered.tsx";

const root = join(import.meta.dir, "..");
const APPS: readonly App[] = ["constellation", "quanta", "trisys", "orbit", "artifacts", "www"];
const blocks = catalog.filter((item) => item.tier === "block");
const blockSource = (name: string) => readFileSync(join(root, `items/blocks/${name}.tsx`), "utf8");

describe("every block", () => {
  test("there are blocks, each a registry:block with one component file under blocks/", () => {
    expect(blocks.length).toBeGreaterThan(1);
    for (const item of blocks) {
      expect(item.type, item.name).toBe("registry:block");
      expect(item.upstream, item.name).toBeNull();
      expect(item.texture, item.name).toBeUndefined();
      expect(item.files, item.name).toEqual([
        {
          path: `items/blocks/${item.name}.tsx`,
          type: "registry:component",
          target: `@components/superthread/blocks/${item.name}.tsx`,
        },
      ]);
    }
  });

  test("names two or more fleet apps it serves, each once, in the fleet's order", () => {
    for (const item of blocks) {
      const serves = item.serves ?? [];
      expect(serves.length, item.name).toBeGreaterThanOrEqual(2);
      expect(serves, item.name).toEqual(APPS.filter((app) => serves.includes(app)));
    }
    for (const item of catalog.filter((entry) => entry.tier !== "block"))
      expect(item.serves, item.name).toBeUndefined();
  });

  test("marks its roots with its own data-mk and no other", () => {
    for (const item of blocks) {
      const marks = [...blockSource(item.name).matchAll(/data-mk="([^"]+)"/g)].map((m) => m[1]);
      expect(marks.length, item.name).toBeGreaterThan(0);
      expect(new Set(marks), item.name).toEqual(new Set([item.name]));
    }
  });

  test("composes items through the install alias, never a relative path", () => {
    for (const item of blocks) {
      const code = blockSource(item.name);
      expect(code, item.name).not.toMatch(/from\s+["']\.\.?\//);
      expect(code, item.name).toContain('from "@/components/superthread/lib/utils"');
    }
  });
});

describe("page header", () => {
  let panel: HTMLElement;
  let page: HTMLElement;
  beforeAll(() => {
    panel = server(
      <PageHeader>
        <PageHeaderTitle>board</PageHeaderTitle>
        <PageHeaderMeta>12 tasks, 2 running</PageHeaderMeta>
        <PageHeaderActions>
          <Button>new task</Button>
        </PageHeaderActions>
      </PageHeader>,
    );
    page = server(
      <PageHeader size="page">
        <PageHeaderBack href="/essays">essays</PageHeaderBack>
        <PageHeaderTitle>the long way round</PageHeaderTitle>
        <PageHeaderDescription>a lede that sits on its own line.</PageHeaderDescription>
      </PageHeader>,
    );
  });

  test("a header with data-mk, its size and one h1", () => {
    const head = one(panel, "header");
    expect(head.el.getAttribute("data-mk")).toBe("page-header");
    expect(head.el.getAttribute("data-size")).toBe("panel");
    expect(one(page, "header").el.getAttribute("data-size")).toBe("page");
    expect(panel.querySelectorAll("h1")).toHaveLength(1);
  });

  test("a panel sets the section head, a page the hero title and the lede", () => {
    const title = one(panel, "h1").classes;
    expect(title).toEqual(expect.arrayContaining(["type-section", "group-data-[size=page]/page-header:type-hero"]));
    expect(one(page, '[data-slot="page-header-description"]').classes).toEqual(
      expect.arrayContaining(["basis-full", "group-data-[size=page]/page-header:type-lede"]),
    );
  });

  test("the meta line is read out when it changes and pushes the actions to the end", () => {
    const meta = one(panel, '[data-slot="page-header-meta"]');
    expect(meta.el.getAttribute("aria-live")).toBe("polite");
    expect(meta.classes).toContain("mr-auto");
  });

  test("the way back is a link with the left glyph and its words", () => {
    const back = one(page, "a");
    expect(back.el.getAttribute("href")).toBe("/essays");
    expect(back.el.textContent).toBe("essays");
    expect(back.el.querySelector("svg")).not.toBeNull();
  });

  test("names no detail and no forbidden class", () => {
    const rendered = [panel, page].flatMap(elements);
    expect(detailsUsed(rendered, "page-header")).toEqual([]);
    expect(forbidden(rendered)).toEqual([]);
  });
});

describe("states", () => {
  let loading: HTMLElement;
  let failed: HTMLElement;
  let empty: HTMLElement;
  beforeAll(() => {
    loading = server(<LoadingState rows={5} label="loading runs" />);
    failed = server(
      <FailedState title="the runs did not load" onRetry={() => {}}>
        the server took too long.
      </FailedState>,
    );
    empty = server(
      <EmptyState>
        <EmptyStateMedia>
          <div />
        </EmptyStateMedia>
        <EmptyStateText title="nothing queued">a new task lands here.</EmptyStateText>
        <EmptyStateActions>
          <Button>new task</Button>
        </EmptyStateActions>
      </EmptyState>,
    );
  });

  test("loading is one status, named, with a still bar per row at the table's height", () => {
    const status = one(loading, '[role="status"]');
    expect(status.el.getAttribute("aria-label")).toBe("loading runs");
    expect(status.el.getAttribute("data-mk")).toBe("states");
    expect(loading.querySelectorAll('[data-slot="skeleton"]')).toHaveLength(5);
    expect(one(loading, '[data-slot="skeleton"]').el.parentElement!.className).toContain("h-(--spacing-row-table)");
  });

  test("failed is an alert with the failed glyph, what failed, why, and a way to try again", () => {
    const alert = one(failed, '[role="alert"]');
    expect(alert.el.getAttribute("data-mk")).toBe("states");
    expect(alert.el.querySelector("svg")).not.toBeNull();
    expect(alert.el.textContent).toContain("the runs did not load");
    expect(alert.el.textContent).toContain("the server took too long.");
    expect(one(failed, "button").el.textContent).toBe("try again");
    expect(server(<FailedState />).querySelector("button")).toBeNull();
  });

  test("empty holds its figure away from the reader, then the words and the action", () => {
    expect(one(empty, '[data-slot="empty-state"]').el.getAttribute("data-mk")).toBe("states");
    expect(one(empty, '[data-slot="empty-state-media"]').el.getAttribute("aria-hidden")).toBe("true");
    expect(one(empty, "b").el.textContent).toBe("nothing queued");
  });

  test("names no detail of its own and no forbidden class", () => {
    const rendered = [loading, failed, empty].flatMap(elements);
    expect(detailsUsed(rendered, "states")).toEqual([]);
    expect(forbidden(rendered)).toEqual([]);
  });
});
