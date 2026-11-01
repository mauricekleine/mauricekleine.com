// Collections keep their semantics and interactions while the app owns the data and the router.
import { describe, expect, test } from "bun:test";
import { act, useState } from "react";
import {
  CollectionToolbar,
  FilterChip,
  ToolbarCount,
  ToolbarGroup,
  ToolbarSpacer,
  ViewSwitch,
} from "@/components/superthread/blocks/collection-toolbar";
import { DataTable, SortableHead, TableEmpty, type SortDirection } from "@/components/superthread/blocks/data-table";
import {
  ItemCard,
  ItemCardActions,
  ItemCardId,
  ItemCardMedia,
  ItemCardMeta,
  ItemCards,
  ItemCardTitle,
} from "@/components/superthread/blocks/item-cards";
import {
  ListRow,
  ListRowActions,
  ListRowAside,
  ListRowLead,
  ListRowMeta,
  ListRows,
  ListRowTitle,
} from "@/components/superthread/blocks/list-rows";
import { Button } from "@/components/superthread/ui/button";
import { Checkbox } from "@/components/superthread/ui/checkbox";
import { StatusGlyph } from "@/components/superthread/ui/glyphs";
import { TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/superthread/ui/table";
import { client, CONTROL_RING, detailsUsed, elements, forbidden, one, server } from "./rendered.tsx";

const views = [
  { value: "rows", label: "rows" },
  { value: "cards", label: "cards" },
] as const;
const insideRing = ["focus-visible:outline-2", "focus-visible:-outline-offset-2", "focus-visible:outline-(--ring)"];
const button = (scope: ParentNode, label: string) =>
  [...scope.querySelectorAll<HTMLButtonElement>("button")].find((el) => el.textContent === label)!;

describe("collection toolbar", () => {
  const toolbar = () =>
    server(
      <CollectionToolbar label="task controls">
        <ToolbarGroup label="status">
          <Button variant="outline">queued</Button>
        </ToolbarGroup>
        <FilterChip shown={0} total={40} onClear={() => {}}>
          agent: sol
        </FilterChip>
        <ToolbarSpacer />
        <ToolbarCount shown={12} total={40} />
        <ViewSwitch views={views} />
      </CollectionToolbar>,
    );

  test("names the toolbar and its group, and announces zero and changing result counts", () => {
    const host = toolbar();
    const root = one(host, '[data-slot="collection-toolbar"]');
    expect(root.el.getAttribute("data-mk")).toBe("collection-toolbar");
    expect(root.el.getAttribute("role")).toBe("group");
    expect(root.el.getAttribute("aria-label")).toBe("task controls");
    const group = one(host, '[data-slot="toolbar-group"]').el;
    const label = one(host, `[id="${group.getAttribute("aria-labelledby")}"]`);
    expect(label.el.textContent).toBe("status");
    expect(label.classes).toContain("type-instrument");
    expect([...host.querySelectorAll('[aria-live="polite"]')].map((el) => el.textContent)).toEqual([
      "0 of 40",
      "12 of 40",
    ]);
    expect(one(host, '[data-slot="view-switch"] [role="group"]').el.getAttribute("aria-label")).toBe("view");
  });

  test("the chip edges the filter in foreground with no fill, and the clear button has an inside ring and a name", () => {
    const host = toolbar();
    const chip = one(host, '[data-slot="filter-chip"]').classes;
    expect(chip).toEqual(expect.arrayContaining(["border-foreground", "min-h-10"]));
    expect(chip.filter((c) => c.startsWith("bg-"))).toEqual([]);
    const clear = one(host, '[aria-label="clear filter"]');
    expect(clear.el.getAttribute("type")).toBe("button");
    expect(clear.classes).toEqual(expect.arrayContaining(insideRing));
    expect(clear.el.querySelector("svg")?.getAttribute("aria-hidden")).toBe("true");
    expect(one(host, '[data-slot="collection-toolbar"]').classes).toContain("flex-wrap");
  });

  test("clearing a filter updates the app's results without submitting an enclosing form", async () => {
    let submits = 0;
    function Example() {
      const [filtered, setFiltered] = useState(true);
      return (
        <form
          onSubmit={(event) => {
            event.preventDefault();
            submits++;
          }}
        >
          <CollectionToolbar>
            {filtered && <FilterChip onClear={() => setFiltered(false)}>queued</FilterChip>}
            <ToolbarCount shown={filtered ? 2 : 12} total={12} />
          </CollectionToolbar>
        </form>
      );
    }
    const { body, done } = await client(<Example />);
    try {
      await act(async () => (one(body, '[aria-label="clear filter"]').el as HTMLButtonElement).click());
      expect(body.querySelector('[data-slot="filter-chip"]')).toBeNull();
      expect(one(body, '[aria-live="polite"]').el.textContent).toBe("12 of 12");
      expect(submits).toBe(0);
    } finally {
      await done();
    }
  });

  test("one view stays pressed, repeat clicks cannot clear it, and the next view is reported", async () => {
    const changes: string[] = [];
    const { body, done } = await client(<ViewSwitch views={views} onValueChange={(value) => changes.push(value)} />);
    try {
      expect(button(body, "rows").getAttribute("aria-pressed")).toBe("true");
      await act(async () => button(body, "rows").click());
      expect(changes).toEqual([]);
      await act(async () => button(body, "cards").click());
      expect(changes).toEqual(["cards"]);
      expect(button(body, "cards").getAttribute("aria-pressed")).toBe("true");
      expect(body.querySelectorAll('[aria-pressed="true"]')).toHaveLength(1);
      await act(async () => button(body, "cards").click());
      expect(button(body, "cards").getAttribute("aria-pressed")).toBe("true");
    } finally {
      await done();
    }
  });

  test("controlled views stay with the app until it accepts a change; invalid values fall back to a real view", async () => {
    const changes: string[] = [];
    const { body, done } = await client(
      <ViewSwitch views={views} value="cards" onValueChange={(value) => changes.push(value)} />,
    );
    try {
      await act(async () => button(body, "rows").click());
      expect(changes).toEqual(["rows"]);
      expect(button(body, "cards").getAttribute("aria-pressed")).toBe("true");
    } finally {
      await done();
    }
    expect(button(server(<ViewSwitch views={views} value="missing" />), "rows").getAttribute("aria-pressed")).toBe(
      "true",
    );
    expect(button(server(<ViewSwitch views={views} defaultValue="cards" disabled />), "cards").disabled).toBe(true);
  });

  test("the block claims no detail or forbidden class of its own", () => {
    const rendered = elements(toolbar());
    expect(detailsUsed(rendered, "collection-toolbar")).toEqual([]);
    // The toggle seeds are being skinned separately; inspect this block's parts, without restyling those items.
    expect(
      forbidden(
        rendered.filter(({ el }) =>
          /^(collection-toolbar|toolbar-|filter-chip|view-switch)/.test(el.getAttribute("data-slot") ?? ""),
        ),
      ),
    ).toEqual([]);
  });
});

describe("list rows", () => {
  const list = () =>
    server(
      <ListRows aria-label="recent tasks">
        <ListRow>
          <ListRowLead>
            <StatusGlyph state="queued" aria-label="queued" />
          </ListRowLead>
          <ListRowTitle href="/tasks/12">a title that can wrap onto another line</ListRowTitle>
          <ListRowAside>
            <time dateTime="2026-10-25">2h ago</time>
          </ListRowAside>
          <ListRowMeta>
            <span>orbit</span>
            <span>queued</span>
          </ListRowMeta>
          <ListRowActions>
            <Button size="sm">accept</Button>
          </ListRowActions>
        </ListRow>
        <ListRow>
          <ListRowTitle>plain title</ListRowTitle>
        </ListRow>
      </ListRows>,
    );

  test("uses a real named list, real rows and optional lead content; a plain title is not a link", () => {
    const host = list();
    expect(one(host, "ul").el.getAttribute("aria-label")).toBe("recent tasks");
    expect(host.querySelectorAll("ul > li")).toHaveLength(2);
    expect(one(host, "li").el.getAttribute("data-mk")).toBe("list-rows");
    expect(host.querySelectorAll("a")).toHaveLength(1);
    expect(one(host, "a").el.getAttribute("href")).toBe("/tasks/12");
    expect(one(host, '[data-slot="list-row-lead"] [aria-label="queued"]').el).toBeDefined();
  });

  test("keeps the row measure, rules, wrapping metadata and mono time", () => {
    const host = list();
    expect(one(host, "ul").classes).toContain("border-t");
    expect(one(host, "li").classes).toEqual(
      expect.arrayContaining(["min-h-(--spacing-row-board)", "border-b", "py-3", "px-4"]),
    );
    expect(one(host, '[data-slot="list-row-meta"]').classes).toEqual(
      expect.arrayContaining(["flex-wrap", "[&>*:not(:last-child)]:after:content-['·'/'']"]),
    );
    expect(one(host, '[data-slot="list-row-aside"]').classes).toEqual(
      expect.arrayContaining(["font-mono", "tabular-nums", "text-right"]),
    );
    expect(one(host, "a").classes).toEqual(expect.arrayContaining(CONTROL_RING));
  });

  test("a title prints in foreground, linked or plain, and a linked one underlines on hover", () => {
    const host = list();
    const linked = one(host, "a").classes;
    expect(linked).toEqual(expect.arrayContaining(["text-foreground", "[&:is(a)]:hover:underline"]));
    expect(linked.filter((c) => c.includes("primary"))).toEqual([]);
    expect(one(host, "li:last-child span").classes).toContain("text-foreground");
  });

  test("a closed row stays in the list with its title muted and struck through, under the pointer too", () => {
    const host = server(
      <ListRows>
        <ListRow closed>
          <ListRowTitle href="/tasks/12">written up</ListRowTitle>
        </ListRow>
        <ListRow>
          <ListRowTitle href="/tasks/13">open</ListRowTitle>
        </ListRow>
      </ListRows>,
    );
    const [closed, open] = [...host.querySelectorAll("li")];
    expect(closed!.hasAttribute("data-closed")).toBe(true);
    expect(open!.hasAttribute("data-closed")).toBe(false);
    expect(one(closed!, "a").classes).toEqual(
      expect.arrayContaining([
        "group-data-[closed]/list-row:text-muted-foreground",
        "group-data-[closed]/list-row:line-through",
        "group-data-[closed]/list-row:hover:line-through",
      ]),
    );
  });

  test("a router link keeps its href, ref and event, and actions stay independent", async () => {
    let opens = 0;
    let accepts = 0;
    let link: HTMLAnchorElement | null = null;
    const { body, done } = await client(
      <ListRows>
        <ListRow>
          <ListRowLead>
            <Checkbox aria-label="complete task" />
          </ListRowLead>
          <ListRowTitle
            render={
              <a
                href="/tasks/12"
                onClick={(event) => {
                  event.preventDefault();
                  opens++;
                }}
              />
            }
            ref={(node) => {
              link = node;
            }}
          >
            review task
          </ListRowTitle>
          <ListRowActions>
            <Button onClick={() => accepts++}>accept</Button>
          </ListRowActions>
        </ListRow>
      </ListRows>,
    );
    try {
      expect(link).not.toBeNull();
      expect(one(body, "a").el.getAttribute("href")).toBe("/tasks/12");
      await act(async () => button(body, "accept").click());
      expect(accepts).toBe(1);
      expect(opens).toBe(0);
      await act(async () => (one(body, "a").el as HTMLAnchorElement).click());
      expect(opens).toBe(1);
    } finally {
      await done();
    }
  });

  test("claims no detail or forbidden class", () => {
    const rendered = elements(list());
    expect(detailsUsed(rendered, "list-rows")).toEqual([]);
    expect(forbidden(rendered)).toEqual([]);
  });
});

describe("item cards", () => {
  const cards = () =>
    server(
      <ItemCards aria-label="drafts">
        <ItemCard>
          <ItemCardMedia>
            <img src="/synthetic.png" alt="a synthetic thumbnail" />
          </ItemCardMedia>
          <ItemCardId>or-12</ItemCardId>
          <ItemCardTitle href="/drafts/12">a draft</ItemCardTitle>
          <ItemCardMeta>
            <span>orbit</span>
            <time dateTime="2026-10-25">2h ago</time>
          </ItemCardMeta>
          <ItemCardActions>
            <Button size="sm" aria-label="draft actions">
              more
            </Button>
          </ItemCardActions>
        </ItemCard>
        <ItemCard>
          <ItemCardTitle>plain card</ItemCardTitle>
        </ItemCard>
      </ItemCards>,
    );

  test("renders a named list, small cards, media above the title and a mono id", () => {
    const host = cards();
    expect(one(host, "ul").el.getAttribute("aria-label")).toBe("drafts");
    expect(host.querySelectorAll("ul > li")).toHaveLength(2);
    expect(one(host, '[data-slot="card"]').el.getAttribute("data-size")).toBe("sm");
    expect(one(host, '[data-slot="item-card-media"]').classes).toEqual(
      expect.arrayContaining(["aspect-[16/10]", "border-b"]),
    );
    expect(one(host, '[data-slot="item-card-id"]').classes).toEqual(
      expect.arrayContaining(["font-mono", "tabular-nums"]),
    );
    expect(host.querySelectorAll("a")).toHaveLength(1);
    expect(one(host, '[data-slot="item-card-meta"]').classes).toEqual(
      expect.arrayContaining(["justify-between", "[&_time]:font-mono"]),
    );
  });

  test("the link covers the card and draws its ring inside it; the corner control sits above it", () => {
    const host = cards();
    const link = one(host, "a");
    expect(link.classes).toEqual(expect.arrayContaining(["absolute", "inset-0", ...insideRing]));
    expect(link.el.textContent).toBe("a draft");
    expect(one(host, '[data-slot="item-card-title"] > [aria-hidden="true"]').el.textContent).toBe("a draft");
    expect(one(host, '[data-slot="item-card-actions"]').classes).toContain("z-10");
    expect(link.el.querySelector("button")).toBeNull();
  });

  test("a router link receives the title and click while the menu is independent", async () => {
    let opens = 0;
    let menus = 0;
    const { body, done } = await client(
      <ItemCards>
        <ItemCard>
          <ItemCardTitle
            render={
              <a
                href="/drafts/12"
                onClick={(event) => {
                  event.preventDefault();
                  opens++;
                }}
              />
            }
          >
            a draft
          </ItemCardTitle>
          <ItemCardActions>
            <Button onClick={() => menus++}>more</Button>
          </ItemCardActions>
        </ItemCard>
      </ItemCards>,
    );
    try {
      await act(async () => button(body, "more").click());
      expect(menus).toBe(1);
      expect(opens).toBe(0);
      await act(async () => (one(body, "a").el as HTMLAnchorElement).click());
      expect(opens).toBe(1);
      expect(one(body, "a").el.getAttribute("href")).toBe("/drafts/12");
    } finally {
      await done();
    }
  });

  test("the block claims no detail or forbidden class of its own", () => {
    const rendered = elements(cards());
    expect(detailsUsed(rendered, "item-cards")).toEqual([]);
    // Card is a pass item: its upstream classes belong to that item's tests, rather than this composition.
    expect(forbidden(rendered.filter(({ el }) => el.getAttribute("data-slot")?.startsWith("item-card")))).toEqual([]);
  });
});

describe("data table", () => {
  test("names the region and table, passing row measures, number cells and selected rows to the item", () => {
    const host = server(
      <DataTable label="runs" rows="board">
        <TableHeader>
          <TableRow>
            <TableHead kind="id">id</TableHead>
            <SortableHead kind="number" sort="descending" onSort={() => {}}>
              age
            </SortableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow aria-selected="true">
            <TableCell kind="id">or-12</TableCell>
            <TableCell kind="number">12</TableCell>
          </TableRow>
        </TableBody>
      </DataTable>,
    );
    expect(one(host, '[role="region"]').el.getAttribute("aria-label")).toBe("runs");
    expect(one(host, "table").el.getAttribute("aria-label")).toBe("runs");
    expect(one(host, "table").el.getAttribute("data-rows")).toBe("board");
    expect(one(host, '[data-slot="table-container"]').classes).toContain("overflow-x-auto");
    expect(one(host, "table").classes).toContain("texture-rowedge");
    expect(one(host, "td[data-kind=number]").classes).toEqual(expect.arrayContaining(["font-mono", "text-right"]));
    expect(one(host, '[aria-selected="true"]').classes).toContain("aria-selected:bg-control-hover");
    expect(one(host, '[aria-sort="descending"]').el.getAttribute("scope")).toBe("col");
    expect(one(host, '[data-slot="sortable-head-button"]').classes).toContain("type-instrument");
  });

  test("sorting cycles ascending and descending, and the app's rows follow the accepted direction", async () => {
    function Example() {
      const [sort, setSort] = useState<SortDirection | null>(null);
      const values = sort === "descending" ? [3, 1] : [1, 3];
      return (
        <DataTable label="counts">
          <TableHeader>
            <TableRow>
              <SortableHead sort={sort} onSort={setSort}>
                count
              </SortableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {values.map((value) => (
              <TableRow key={value}>
                <TableCell kind="number">{value}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </DataTable>
      );
    }
    const { body, done } = await client(<Example />);
    try {
      expect(one(body, "th").el.getAttribute("aria-sort")).toBe("none");
      expect(one(body, "th svg").classes).toContain("invisible");
      await act(async () => button(body, "count").click());
      expect(one(body, "th").el.getAttribute("aria-sort")).toBe("ascending");
      expect(one(body, "th svg").classes).toContain("rotate-180");
      expect([...body.querySelectorAll("td")].map((el) => el.textContent)).toEqual(["1", "3"]);
      await act(async () => button(body, "count").click());
      expect(one(body, "th").el.getAttribute("aria-sort")).toBe("descending");
      expect(one(body, "th svg").classes).not.toContain("rotate-180");
      expect([...body.querySelectorAll("td")].map((el) => el.textContent)).toEqual(["3", "1"]);
      await act(async () => button(body, "count").click());
      expect(one(body, "th").el.getAttribute("aria-sort")).toBe("ascending");
    } finally {
      await done();
    }
  });

  test("an empty row spans the columns and announces the app's empty-state words", () => {
    const host = server(
      <DataTable label="runs">
        <TableBody>
          <TableEmpty columns={4} title="no runs">
            change the filter to see more.
          </TableEmpty>
        </TableBody>
      </DataTable>,
    );
    expect(host.querySelectorAll("tbody > tr")).toHaveLength(1);
    expect(one(host, "td").el.getAttribute("colspan")).toBe("4");
    expect(one(host, '[role="status"]').el.getAttribute("aria-live")).toBe("polite");
    expect(one(host, '[data-slot="empty-state-text"]').el.textContent).toBe("no runschange the filter to see more.");
    expect(one(host, '[data-slot="empty-state"]').el.getAttribute("data-mk")).toBe("states");
  });

  test("sort controls have an inside ring and the block claims no detail or forbidden class", () => {
    const host = server(
      <DataTable label="runs">
        <TableHeader>
          <TableRow>
            <SortableHead onSort={() => {}}>title</SortableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableEmpty columns={1} />
        </TableBody>
      </DataTable>,
    );
    expect(one(host, "button").classes).toEqual(expect.arrayContaining(insideRing));
    const rendered = elements(host);
    expect(detailsUsed(rendered, "data-table")).toEqual([]);
    expect(forbidden(rendered)).toEqual([]);
  });
});
