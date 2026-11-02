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
import {
  DataTable,
  SortableHead,
  TableEmpty,
  TableTitle,
  type SortDirection,
} from "@/components/superthread/blocks/data-table";
import {
  ItemCard,
  ItemCardActions,
  ItemCardId,
  ItemCardLede,
  ItemCardMedia,
  ItemCardMeta,
  ItemCards,
  ItemCardTitle,
  ItemCardWhen,
} from "@/components/superthread/blocks/item-cards";
import {
  ListRow,
  ListRowActions,
  ListRowAside,
  ListRowKind,
  ListRowLead,
  ListRowMeta,
  ListRows,
  ListRowTime,
  ListRowTitle,
  ListRowWhen,
} from "@/components/superthread/blocks/list-rows";
import { Button } from "@/components/superthread/ui/button";
import { Checkbox } from "@/components/superthread/ui/checkbox";
import { StatusGlyph } from "@/components/superthread/ui/glyphs";
import { TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/superthread/ui/table";
import { client, CONTROL_RING, detailsUsed, elements, forbidden, one, parts, server } from "./rendered.tsx";

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
    expect(one(host, '[data-slot="list-row-meta"]').classes).toContain("flex-wrap");
    expect(one(host, '[data-slot="list-row-aside"]').classes).toEqual(
      expect.arrayContaining(["font-mono", "tabular-nums", "text-right"]),
    );
    expect(one(host, "a").classes).toEqual(expect.arrayContaining(CONTROL_RING));
  });

  test("hangs from a section header's rule, so the two rules never print 16 px apart", () => {
    const { classes } = one(list(), "ul");
    expect(classes).toEqual(
      expect.arrayContaining(["[[data-slot=section-header]+&]:border-t-0", "[[data-slot=section-header]+&]:-mt-4"]),
    );
  });

  test("a receding row prints muted and takes no strike, and a closed one keeps its strike", () => {
    const row = (props: { receding?: boolean; closed?: boolean }) =>
      server(
        <ListRow {...props}>
          <ListRowTitle>a task</ListRowTitle>
        </ListRow>,
      );
    expect(one(row({ receding: true }), "li").el.hasAttribute("data-receding")).toBe(true);
    expect(one(row({}), "li").el.hasAttribute("data-receding")).toBe(false);
    expect(one(row({ receding: true }), "li").el.hasAttribute("data-closed")).toBe(false);
    expect(one(row({}), '[data-slot="list-row-title"]').classes).toContain(
      "group-data-[receding]/list-row:text-muted-foreground",
    );
  });

  test('kind="id" sets a title in mono at the regular weight, a link or not', () => {
    for (const props of [{}, { href: "/runs/or-12" }]) {
      const title = one(
        server(
          <ListRowTitle kind="id" {...props}>
            or-12
          </ListRowTitle>,
        ),
        '[data-slot="list-row-title"]',
      );
      expect(title.classes).toEqual(expect.arrayContaining(["font-mono", "font-normal"]));
      expect(title.classes).not.toContain("font-medium");
      expect(title.el.getAttribute("data-kind")).toBe("id");
    }
    expect(one(server(<ListRowTitle>a title</ListRowTitle>), '[data-slot="list-row-title"]').classes).toContain(
      "font-medium",
    );
  });

  test("a line of actions with nothing in it takes no room, and markers read from the row's start", () => {
    const actions = (variant?: "markers") =>
      one(server(<ListRowActions variant={variant} />), '[data-slot="list-row-actions"]').classes;
    expect(actions()).toEqual(expect.arrayContaining(["empty:hidden", "justify-end"]));
    expect(actions("markers")).toEqual(
      expect.arrayContaining(["empty:hidden", "justify-start", "type-instrument", "text-muted-foreground"]),
    );
    expect(actions("markers")).not.toContain("justify-end");
  });

  describe("the meta line's dots", () => {
    const meta = (children: React.ReactNode) =>
      one(server(<ListRowMeta>{children}</ListRowMeta>), '[data-slot="list-row-meta"]').el;
    const dots = (line: Element) => [...line.querySelectorAll('[data-slot="list-row-meta-dot"]')];

    // What a component renders is only on the page, so the line leaves the piece in place and hides it there.
    test("a component that renders nothing leaves an empty piece the line can see past", () => {
      const Nothing = () => null;
      const line = meta(
        <>
          <span>orbit</span>
          <Nothing />
        </>,
      );
      const texts = [...line.querySelectorAll('[data-slot="list-row-meta-text"]')];
      expect(texts.map((text) => text.textContent)).toEqual(["orbit", ""]);
      expect(texts[1]!.childNodes).toHaveLength(0);
      expect(line.getAttribute("class")).toContain(
        "[&>[data-slot=list-row-meta-piece]:has(>[data-slot=list-row-meta-text]:empty)]:hidden",
      );
      expect(line.getAttribute("class")).toContain(
        "[&>[data-slot=list-row-meta-piece]:not(:has(~[data-slot=list-row-meta-piece]>[data-slot=list-row-meta-text]:not(:empty)))>[data-slot=list-row-meta-dot]]:hidden",
      );
      expect(line.getAttribute("class")).toContain("[&:not(:has([data-slot=list-row-meta-text]:not(:empty)))]:hidden");
    });

    test("sit between the pieces, one fewer than the pieces, and a screen reader skips them", () => {
      const line = meta(
        <>
          <span>orbit</span>
          <span>queued</span>
          <span>2 files</span>
        </>,
      );
      expect(line.textContent).toBe("orbit·queued·2 files");
      expect(dots(line)).toHaveLength(2);
      for (const dot of dots(line)) expect(dot.getAttribute("aria-hidden")).toBe("true");
    });

    test("leave a single piece alone", () => {
      expect(dots(meta(<span>orbit</span>))).toEqual([]);
    });

    test("read through fragments and skip an empty piece, so a row can map its pieces", () => {
      const line = meta(
        <>
          {null}
          <>
            <span>orbit</span>
            {["a", "b"].map((name) => (
              <span key={name}>{name}</span>
            ))}
          </>
          {false}
        </>,
      );
      expect(line.textContent).toBe("orbit·a·b");
    });

    test("stay outside a link, so its underline and hit area are the link's own", () => {
      const line = meta(
        <>
          <a className="link-quiet" href="/runs">
            runs
          </a>
          <span>queued</span>
        </>,
      );
      expect(line.querySelector("a")!.textContent).toBe("runs");
      expect(dots(line)[0]!.closest("a")).toBeNull();
    });
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

describe("a day's rows", () => {
  const PHONE = "[@media(max-width:600px)]:";
  const day = () =>
    server(
      <ListRows aria-label="today">
        <ListRow variant="day">
          <ListRowTime dateTime="2026-11-03T11:00:00+01:00">11:00</ListRowTime>
          <ListRowTitle>renewal call</ListRowTitle>
          <ListRowKind href="/briefs/12" aria-label="brief for renewal call">
            brief
          </ListRowKind>
          <ListRowWhen>
            <Button size="sm" variant="outline">
              join
            </Button>
          </ListRowWhen>
        </ListRow>
        <ListRow variant="day">
          <ListRowTime dateTime="2026-11-03T14:00:00+01:00">14:00</ListRowTime>
          <ListRowTitle href="/events/14">1:1 with sam</ListRowTitle>
          <ListRowKind>tentative</ListRowKind>
          <ListRowWhen>
            <time dateTime="PT30M">30 min</time>
          </ListRowWhen>
        </ListRow>
      </ListRows>,
    );
  const row = (host: ParentNode) => one(host, '[data-slot="list-row"]');

  test("each row is one 44 px line with no rule of its own, and the list drops its first rule", () => {
    const host = day();
    expect(one(host, "ul").classes).toContain("has-[>[data-variant=day]]:border-t-0");
    expect(row(host).el.getAttribute("data-variant")).toBe("day");
    expect(row(host).classes).toEqual(expect.arrayContaining(["h-11", "items-center"]));
    for (const cls of ["border-b", "px-4", "py-3", "min-h-(--spacing-row-board)"])
      expect(row(host).classes).not.toContain(cls);
  });

  test("holds its columns across rows: the mock's widths on a wide screen and on a phone", () => {
    const { classes } = row(day());
    expect(classes).toEqual(
      expect.arrayContaining([
        "grid-cols-[48px_minmax(0,1fr)_80px_128px]",
        "gap-x-4",
        `${PHONE}grid-cols-[44px_minmax(0,1fr)_auto_48px]`,
        `${PHONE}gap-x-2`,
      ]),
    );
  });

  test("a row that isn't a day row keeps its rule, its padding and no variant", () => {
    const host = server(
      <ListRows>
        <ListRow>
          <ListRowTitle>plain</ListRowTitle>
        </ListRow>
      </ListRows>,
    );
    expect(row(host).el.hasAttribute("data-variant")).toBe(false);
    expect(row(host).classes).toEqual(expect.arrayContaining(["border-b", "px-4", "py-3"]));
  });

  test("the time is a real time in the mono face, set past the base layer's inherit", () => {
    const time = one(day(), 'time[data-slot="list-row-time"]');
    expect(time.el.getAttribute("datetime")).toBe("2026-11-03T11:00:00+01:00");
    expect(time.classes).toEqual(expect.arrayContaining(["font-mono", "type-instrument", "text-muted-foreground"]));
  });

  test("the title holds one line in the regular weight, and a linked one fills the row on a phone", () => {
    const host = day();
    const title = one(host, '[data-slot="list-row-title"]');
    expect(title.classes).toEqual(
      expect.arrayContaining([
        "group-data-[variant=day]/list-row:truncate",
        "group-data-[variant=day]/list-row:font-normal",
      ]),
    );
    expect(one(host, 'a[data-slot="list-row-title"]').classes).toContain(
      `${PHONE}group-data-[variant=day]/list-row:[&:is(a)]:leading-11`,
    );
  });

  test("a kind is a muted word, or a foreground link with a phone hit area once it leads somewhere", () => {
    const host = day();
    const word = one(host, 'span[data-slot="list-row-kind"]');
    expect(word.el.textContent).toBe("tentative");
    expect(word.classes).toContain("text-muted-foreground");
    const link = one(host, 'a[data-slot="list-row-kind"]');
    expect(link.el.getAttribute("href")).toBe("/briefs/12");
    expect(link.el.getAttribute("aria-label")).toBe("brief for renewal call");
    expect(link.classes).toEqual(
      expect.arrayContaining(["[&:is(a)]:text-foreground", "[&:is(a)]:hover:underline", `${PHONE}[&:is(a)]:hit-area`]),
    );
    expect(link.classes).toEqual(expect.arrayContaining(CONTROL_RING));
    expect(link.classes).not.toContain("underline");
  });

  test("the row ends in a time or one small control, at the column's right edge", () => {
    const host = day();
    const [control, time] = host.querySelectorAll('[data-slot="list-row-when"]');
    expect(control?.querySelector("button")?.textContent).toBe("join");
    expect(time?.querySelector("time")?.textContent).toBe("30 min");
    expect(one(host, '[data-slot="list-row-when"]').classes).toEqual(
      expect.arrayContaining(["justify-self-end", "[&>time]:font-mono", `${PHONE}[&>[data-slot=button]]:w-12`]),
    );
  });

  test("holds the rules every skin keeps", () => {
    expect(forbidden(elements(day()))).toEqual([]);
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

  describe("a full card", () => {
    const full = (reject = true) =>
      server(
        <ItemCards aria-label="drafts">
          <ItemCard variant="full">
            <ItemCardTitle href="/drafts/12">reply to sam</ItemCardTitle>
            <ItemCardWhen clock>before 11:00</ItemCardWhen>
            <ItemCardLede>first in today&rsquo;s brief.</ItemCardLede>
            <ItemCardMeta>
              <span>to sam okafor</span>
              <span>re: notes</span>
              <span>notes.pdf</span>
            </ItemCardMeta>
            {reject && (
              <ItemCardActions>
                <Button variant="outline" size="sm">
                  reject
                </Button>
              </ItemCardActions>
            )}
          </ItemCard>
          <ItemCard variant="full">
            <ItemCardTitle>a plain card</ItemCardTitle>
            <ItemCardWhen>since monday</ItemCardWhen>
          </ItemCard>
        </ItemCards>,
      );

    test("takes the whole measure: the list drops to one column and the card prints no small card", () => {
      const host = full();
      expect(one(host, "ul").classes).toContain("has-[>[data-variant]]:grid-cols-1");
      expect(host.querySelector('[data-slot="card"]')).toBeNull();
      expect(one(host, "li").el.getAttribute("data-variant")).toBe("full");
      expect(one(host, "li").classes).toEqual(expect.arrayContaining(["relative", "border", "border-border"]));
    });

    test("its link covers the card's edge and rings outside it, so focus outlines the whole card", () => {
      const link = one(full(), "a");
      expect(link.classes).toEqual(
        expect.arrayContaining([
          "absolute",
          "-inset-px",
          "focus-visible:outline-2",
          "focus-visible:outline-offset-2",
          "focus-visible:outline-(--ring)",
        ]),
      );
      expect(link.el.textContent).toBe("reply to sam");
      expect(link.classes).not.toContain("focus-visible:-outline-offset-2");
    });

    test("reaching a phone's edges inside the panel, its ring comes back in", () => {
      const prefix = "[@media(max-width:600px)]:in-data-[slot=app-shell-panel]:";
      expect(one(full(), "a").classes).toEqual(
        expect.arrayContaining([`${prefix}inset-0`, `${prefix}focus-visible:-outline-offset-2`]),
      );
    });

    test("its title is a heading, level 2 unless it says otherwise", () => {
      const host = full();
      const title = one(host, '[data-slot="item-card-title"]').el;
      expect(title.getAttribute("role")).toBe("heading");
      expect(title.getAttribute("aria-level")).toBe("2");
      const nested = server(
        <ItemCards>
          <ItemCard variant="full">
            <ItemCardTitle level={3}>a draft</ItemCardTitle>
          </ItemCard>
        </ItemCards>,
      );
      expect(one(nested, '[data-slot="item-card-title"]').el.getAttribute("aria-level")).toBe("3");
    });

    test("an arrow ends a linked card's foot, and an unlinked card prints none", () => {
      const host = full();
      expect(host.querySelectorAll('[data-slot="item-card-arrow"]')).toHaveLength(1);
      expect(one(host, "li").el.querySelector('[data-slot="item-card-arrow"] svg')).not.toBeNull();
    });

    test("an action sits above the link, outside it, and leaves the arrow its room", () => {
      const host = full();
      const actions = one(host, '[data-slot="item-card-actions"]');
      expect(actions.classes).toEqual(expect.arrayContaining(["relative", "z-10"]));
      expect(one(host, "a").el.contains(actions.el)).toBe(false);
      expect(actions.classes).toContain("group-has-[[data-slot=item-card-link]]/item-card:mr-7");
    });

    test("an unlinked title claims no link, so its card neither lifts nor saves the arrow's room", () => {
      const host = server(
        <ItemCards>
          <ItemCard variant="full">
            <ItemCardTitle>a plain card</ItemCardTitle>
            <ItemCardActions>
              <Button variant="outline" size="sm">
                reject
              </Button>
            </ItemCardActions>
          </ItemCard>
        </ItemCards>,
      );
      expect(host.querySelector('[data-slot="item-card-link"]')).toBeNull();
      expect(host.querySelector('[data-slot="item-card-arrow"]')).toBeNull();
    });

    test("a clock prints in foreground and an age stays muted", () => {
      const [clock, age] = [...full().querySelectorAll('[data-slot="item-card-when"]')];
      expect(clock!.classList.contains("text-foreground")).toBe(true);
      expect(age!.classList.contains("text-muted-foreground")).toBe(true);
    });

    test("its meta prints a dot a screen reader skips between pieces, with the first in foreground", () => {
      const meta = one(full(), '[data-slot="item-card-meta"]').el;
      const dots = [...meta.querySelectorAll('[aria-hidden="true"]')];
      expect(dots.map((dot) => dot.textContent!.trim())).toEqual(["·", "·"]);
      const pieces = [...meta.firstElementChild!.children];
      expect(pieces).toHaveLength(3);
      expect(pieces[0]!.classList.contains("first:text-foreground")).toBe(true);
      expect(pieces[2]!.querySelector('[aria-hidden="true"]')).toBeNull();
    });

    test("text that runs together in its meta is one piece, however JSX split it", () => {
      const name = "dana";
      const pieces = (meta: React.ReactNode) => {
        const host = server(
          <ItemCards>
            <ItemCard variant="full">
              <ItemCardMeta>{meta}</ItemCardMeta>
            </ItemCard>
          </ItemCards>,
        );
        const list = one(host, '[data-slot="item-card-meta"]').el.firstElementChild!;
        return [...list.children].map((piece) => piece.childNodes[0]!.textContent);
      };
      expect(pieces(["to ", name])).toEqual(["to dana"]);
      expect(
        pieces([
          "to ",
          name,
          ", ",
          2,
          " more ",
          <span key="re">re: notes</span>,
          " ",
          <span key="pdf">notes.pdf</span>,
        ]),
      ).toEqual(["to dana, 2 more", "re: notes", "notes.pdf"]);
    });

    test("keeps its lede in reading type, whole", () => {
      const lede = one(full(), '[data-slot="item-card-lede"]');
      expect(lede.classes).toContain("type-read");
      expect(lede.classes.filter((cls) => /^(line-clamp-|truncate$)/.test(parts(cls).utility))).toEqual([]);
    });

    test("claims no detail or forbidden class", () => {
      const rendered = elements(full());
      expect(detailsUsed(rendered, "item-cards")).toEqual([]);
      expect(forbidden(rendered.filter(({ el }) => el.getAttribute("data-slot")?.startsWith("item-card")))).toEqual([]);
    });
  });

  describe("a decided card", () => {
    const decided = () =>
      server(
        <ItemCards aria-label="decided drafts">
          <ItemCard variant="decided">
            <ItemCardTitle href="/drafts/12">reply to sam</ItemCardTitle>
            <ItemCardLede>first in today&rsquo;s brief.</ItemCardLede>
            <ItemCardMeta>sent</ItemCardMeta>
            <ItemCardWhen>mon 2 nov</ItemCardWhen>
            <ItemCardActions>
              <Button variant="outline" size="sm">
                reject
              </Button>
            </ItemCardActions>
          </ItemCard>
        </ItemCards>,
      );

    test("collapses the same parts to one line: its title, its word and its date", () => {
      const host = decided();
      expect(one(host, "li").classes).toEqual(expect.arrayContaining(["h-12", "border-b"]));
      expect(host.querySelector('[data-slot="item-card-lede"]')).toBeNull();
      expect(host.querySelector('[data-slot="item-card-actions"]')).toBeNull();
      expect(host.querySelector("button")).toBeNull();
      expect(host.querySelector('[data-slot="item-card-arrow"]')).toBeNull();
      expect(one(host, '[data-slot="item-card-meta"]').el.childNodes[0]!.textContent).toBe("sent");
      expect(one(host, '[data-slot="item-card-when"]').el.textContent).toBe("mon 2 nov");
    });

    test("a long title stays on its line and the row is no heading", () => {
      const title = one(decided(), '[data-slot="item-card-title"]');
      expect(title.classes).toContain("truncate");
      expect(title.el.hasAttribute("role")).toBe(false);
    });

    test("a phone folds the line into a 56 px row: the title, then the word and the date", () => {
      expect(one(decided(), "li").classes).toEqual(
        expect.arrayContaining([
          "[@media(max-width:600px)]:h-14",
          "[@media(max-width:600px)]:[grid-template-areas:'title_title'_'meta_when']",
        ]),
      );
    });

    test("the row itself is the link's box, and its padding keeps the ring off its words", () => {
      const host = decided();
      const row = one(host, "li");
      expect(one(host, "a").classes).toEqual(expect.arrayContaining(["absolute", "inset-0", ...insideRing]));
      expect(row.classes).toEqual(expect.arrayContaining(["relative", "px-3"]));
      expect(host.querySelector('[data-slot="card"]')).toBeNull();
    });

    test("a phone's dot prints only on a row with a date to join", () => {
      const dot = one(decided(), '[data-slot="item-card-meta"] [aria-hidden="true"]');
      expect(dot.classes).toEqual([
        "hidden",
        "[@media(max-width:600px)]:group-has-[[data-slot=item-card-when]]/item-card:inline",
      ]);
    });

    test("a list of decided rows reaches the panel's edges, so its rules do", () => {
      const host = decided();
      expect(one(host, "ul").classes).toContain(
        "[@media(min-width:601px)]:in-data-[slot=app-shell-panel]:not-has-[>[data-variant=full]]:has-[>[data-variant=decided]]:-mx-(--spacing-panel-inset)",
      );
      expect(one(host, "li").classes).toContain(
        "in-[[data-slot=app-shell-panel]_[data-slot=item-cards]:not(:has(>[data-variant=full]))]:px-(--spacing-panel-inset)",
      );
    });

    test("nothing in a list reaches the panel's foot until the page says nothing follows it", () => {
      const foot = (classes: string[]) =>
        classes.filter((cls) => parts(cls).utility === "mb-4" || cls.includes("border-b-0"));
      for (const variant of ["full", "decided"] as const) {
        const list = (last?: boolean) =>
          server(
            <ItemCards last={last}>
              <ItemCard variant={variant}>
                <ItemCardTitle>a draft</ItemCardTitle>
              </ItemCard>
            </ItemCards>,
          );
        expect(foot(elements(list()).flatMap(({ classes }) => classes))).toEqual([]);
        expect(foot(one(list(true), "ul").classes)).toEqual([
          "[@media(max-width:600px)]:in-data-[slot=app-shell-panel]:has-[>[data-variant]]:-mb-4",
          "[@media(max-width:600px)]:in-data-[slot=app-shell-panel]:[&>[data-variant]:last-child]:border-b-0",
        ]);
      }
    });

    test("claims no detail or forbidden class", () => {
      const rendered = elements(decided());
      expect(detailsUsed(rendered, "item-cards")).toEqual([]);
      expect(forbidden(rendered.filter(({ el }) => el.getAttribute("data-slot")?.startsWith("item-card")))).toEqual([]);
    });
  });

  test("a plain card takes no variant and keeps its surface", () => {
    const host = cards();
    expect(one(host, "li").el.hasAttribute("data-variant")).toBe(false);
    expect(one(host, "li").classes).toEqual(["min-w-0"]);
  });
});

describe("data table", () => {
  describe("a table title", () => {
    const title = (props: Parameters<typeof TableTitle>[0]) =>
      one(server(<TableTitle {...props}>a row</TableTitle>), '[data-slot="table-title"]');

    test("is plain text until it gets an href or the app's router link", () => {
      expect(title({}).el.tagName).toBe("SPAN");
      expect(title({ href: "/runs/12" }).el.getAttribute("href")).toBe("/runs/12");
      expect(title({ render: <a href="/runs/13" /> }).el.getAttribute("href")).toBe("/runs/13");
    });

    test("a link underlines on hover and reaches 44 px on a phone in a box the table's scroller can contain", () => {
      expect(title({ href: "/runs/12" }).classes).toEqual(
        expect.arrayContaining([
          "[&:is(a)]:hover:underline",
          "[@media(max-width:600px)]:[&:is(a)]:relative",
          "[@media(max-width:600px)]:[&:is(a)]:inline-block",
          "[@media(max-width:600px)]:[&:is(a)]:hit-area",
          ...CONTROL_RING,
        ]),
      );
    });

    test("prints in foreground, and muted on a receding row, which takes no strike", () => {
      expect(title({}).classes).toEqual(
        expect.arrayContaining(["text-foreground", "in-data-[receding]:text-muted-foreground"]),
      );
      const row = one(
        server(
          <table>
            <tbody>
              <TableRow receding>
                <TableCell>
                  <TableTitle>a row</TableTitle>
                </TableCell>
              </TableRow>
            </tbody>
          </table>,
        ),
        '[data-slot="table-row"]',
      );
      expect(row.el.hasAttribute("data-receding")).toBe(true);
      expect(row.classes).toContain("data-[receding]:text-muted-foreground");
      expect(row.classes.filter((cls) => cls.includes("line-through"))).toEqual([]);
    });
  });

  test("the table's scroller contains its hit areas, so a row's target adds no scrollbar", () => {
    const host = server(<DataTable label="runs" />);
    expect(one(host, '[data-slot="table-container"]').classes).toEqual(
      expect.arrayContaining(["overflow-x-auto", "hit-area-scroller"]),
    );
  });

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
