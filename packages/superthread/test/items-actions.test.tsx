// S1.4b's items, actions and data: button, badge, tabs, progress, table and skeleton, rendered to static markup.
// Reads only these six items, the committed lib/utils.ts, ui/glyphs.tsx, catalog.ts and tokens/details.json.
import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { renderToString } from "react-dom/server";
import { catalog } from "@/components/superthread/catalog";
import { Badge } from "@/components/superthread/ui/badge";
import { Button } from "@/components/superthread/ui/button";
import { Icon, StatusGlyph, type StatusState } from "@/components/superthread/ui/glyphs";
import { Progress, ProgressLabel, ProgressValue } from "@/components/superthread/ui/progress";
import { Skeleton } from "@/components/superthread/ui/skeleton";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/superthread/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/superthread/ui/tabs";

const root = join(import.meta.dir, "..");
const details: { key: string }[] = JSON.parse(readFileSync(join(root, "tokens/details.json"), "utf8")).DETAILS;
const detailKeys = details.map((d) => d.key);

const STATES: StatusState[] = ["done", "running", "waiting", "failed", "queued"];

const ROLE: Record<StatusState, string> = {
  done: "success",
  running: "info",
  waiting: "warning",
  failed: "error",
  queued: "neutral",
};

const decode = (s: string) =>
  s
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
    .replaceAll("&quot;", '"')
    .replaceAll("&#x27;", "'")
    .replaceAll("&amp;", "&");

/** Every class token on every element of the markup, entities decoded. */
const classes = (html: string) =>
  [...html.matchAll(/\bclass="([^"]*)"/g)].flatMap((m) =>
    decode(m[1] ?? "")
      .split(/\s+/)
      .filter(Boolean),
  );

/** A token's utility, without its variants (`hover:bg-x` reads `bg-x`). */
const utility = (token: string) => token.split(/:(?![^[]*\])/).pop() ?? token;

/** The first element's opening tag. */
const rootTag = (html: string) => html.slice(0, html.indexOf(">") + 1);

/** The d of the one path a glyph draws. */
const pathOf = (html: string) => html.match(/<path d="([^"]+)"/)?.[1] ?? "";

const trashPath = pathOf(renderToString(<Icon name="trash" />));

// One kitchen-sink rendering per item, with every part it exports.
const items: Record<string, { html: string; slots: string[] }> = {
  button: {
    html: [
      ...(["default", "secondary", "outline", "ghost", "link", "destructive"] as const).map((variant) =>
        renderToString(<Button variant={variant}>save</Button>),
      ),
      ...(["xs", "sm", "lg", "icon"] as const).map((size) =>
        renderToString(
          <Button size={size} aria-label="copy">
            <Icon name="copy" data-icon="inline-start" />
          </Button>,
        ),
      ),
      renderToString(<Button disabled>save</Button>),
    ].join("\n"),
    slots: ["button"],
  },
  badge: {
    html: [
      ...(["default", "secondary", "destructive", "outline", "ghost", "link"] as const).map((variant) =>
        renderToString(<Badge variant={variant}>beta</Badge>),
      ),
      ...STATES.map((state) => renderToString(<Badge variant={state} />)),
    ].join("\n"),
    slots: ["badge"],
  },
  tabs: {
    html: renderToString(
      <Tabs defaultValue="runs">
        <TabsList>
          <TabsTrigger value="runs">runs</TabsTrigger>
          <TabsTrigger value="logs">logs</TabsTrigger>
          <TabsTrigger value="old" disabled>
            old
          </TabsTrigger>
        </TabsList>
        <TabsContent value="runs">three runs today</TabsContent>
      </Tabs>,
    ),
    slots: ["tabs", "tabs-list", "tabs-trigger", "tabs-content"],
  },
  progress: {
    html: renderToString(
      <Progress value={62}>
        <ProgressLabel>sync</ProgressLabel>
        <ProgressValue />
      </Progress>,
    ),
    slots: ["progress", "progress-track", "progress-indicator", "progress-label", "progress-value"],
  },
  table: {
    html: renderToString(
      <Table>
        <TableCaption>runs this week</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead kind="id">id</TableHead>
            <TableHead>run</TableHead>
            <TableHead kind="number">minutes</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell kind="id">r-0412</TableCell>
            <TableCell>nightly sync</TableCell>
            <TableCell kind="number">14</TableCell>
          </TableRow>
          <TableRow data-state="selected">
            <TableCell kind="id">r-0413</TableCell>
            <TableCell>weekly digest</TableCell>
            <TableCell kind="number">3</TableCell>
          </TableRow>
        </TableBody>
        <TableFooter>
          <TableRow>
            <TableCell colSpan={2}>total</TableCell>
            <TableCell kind="number">17</TableCell>
          </TableRow>
        </TableFooter>
      </Table>,
    ),
    slots: [
      "table-container",
      "table",
      "table-caption",
      "table-header",
      "table-body",
      "table-footer",
      "table-row",
      "table-head",
      "table-cell",
    ],
  },
  skeleton: {
    html: [renderToString(<Skeleton />), renderToString(<Skeleton className="h-4 w-56" />)].join("\n"),
    slots: ["skeleton"],
  },
};

const claimed = (name: string) => catalog.find((item) => item.name === name)?.texture;

describe.each(Object.keys(items))("%s", (name) => {
  const { html, slots } = items[name]!;
  const tokens = classes(html);

  test("every rendering's root carries data-mk and a data-slot", () => {
    for (const part of html.split("\n")) {
      expect(rootTag(part)).toContain(`data-mk="${name}"`);
      expect(rootTag(part)).toMatch(/\bdata-slot="[a-z-]+"/);
    }
    expect(html.match(new RegExp(`data-mk="${name}"`, "g"))?.length).toBe(html.split("\n").length);
    for (const slot of slots) expect(html).toContain(`data-slot="${slot}"`);
  });

  // the clean room's source scan and a consumer's grep look for the attribute as written
  test("the source declares its data-mk", () => {
    expect(readFileSync(join(root, "items/ui", `${name}.tsx`), "utf8")).toContain(`data-mk="${name}"`);
  });

  test("nothing silences focus, and there is no ring, no dark: and no rounding", () => {
    for (const token of tokens) {
      expect(utility(token)).not.toMatch(/^outline-(none|hidden)$/);
      expect(utility(token)).not.toMatch(/^ring(-|$)/);
      expect(utility(token)).not.toMatch(/^rounded/);
      expect(token).not.toContain("dark:");
    }
  });

  // transition-colors and transition-all also carry outline-color, which would fade the base ring in from the label ink
  test("motion uses the brand durations and ease, and never fades the ring", () => {
    for (const token of tokens.map(utility)) {
      if (token.startsWith("duration-")) expect(token).toMatch(/^duration-\(--duration-(instant|quick|travel)\)$/);
      if (token.startsWith("ease-")) expect(token).toBe("ease-(--ease-brand)");
      expect(token).not.toMatch(/^transition-(all|colors)$/);
    }
  });

  test("carries the component detail it claims and no other", () => {
    const carried = detailKeys.filter((key) => tokens.some((token) => utility(token) === `texture-${key}`));
    const claim = claimed(name);
    expect(carried).toEqual(claim ? [claim] : []);
  });
});

// the items that take focus move their colours and leave outline-color out
test.each(["button", "badge", "tabs"])("%s: the focus ring snaps on", (name) => {
  const transitions = classes(items[name]!.html).filter((token) => utility(token).startsWith("transition"));
  expect(transitions.length).toBeGreaterThan(0);
  for (const token of transitions) expect(utility(token)).toBe("transition-[color,background-color,border-color]");
});

test("the catalog's claims match the key-to-item table", () => {
  expect(Object.fromEntries(Object.keys(items).map((name) => [name, claimed(name) ?? null]))).toEqual({
    button: "disabled",
    badge: null,
    tabs: "tabhover",
    progress: null,
    table: "rowedge",
    skeleton: "skeleton",
  });
});

describe("button", () => {
  test("destructive prints the trash glyph before its word", () => {
    const html = renderToString(<Button variant="destructive">delete run</Button>);
    expect(pathOf(html)).toBe(trashPath);
    expect(html.indexOf("<svg")).toBeLessThan(html.indexOf("delete run"));
    expect(html).toContain('data-icon="inline-start"');
  });

  test("a destructive icon button shows the trash alone, or its own glyph", () => {
    const bare = renderToString(<Button variant="destructive" size="icon" aria-label="delete run" />);
    expect(bare.match(/<svg/g)?.length).toBe(1);
    expect(pathOf(bare)).toBe(trashPath);
    const own = renderToString(
      <Button variant="destructive" size="icon" aria-label="close">
        <Icon name="close" />
      </Button>,
    );
    expect(own.match(/<svg/g)?.length).toBe(1);
    expect(pathOf(own)).not.toBe(trashPath);
  });

  test("other variants print only their children", () => {
    expect(renderToString(<Button>save</Button>)).not.toContain("<svg");
  });

  test("disabled is the faint fill with the disabled label, screened", () => {
    const tokens = classes(renderToString(<Button disabled>save</Button>));
    expect(tokens).toEqual(expect.arrayContaining(["disabled:bg-faint", "disabled:text-disabled", "texture-disabled"]));
    expect(tokens).toContain("relative");
  });

  test("hover and press come from the hover and press roles", () => {
    const roles = {
      default: "primary",
      secondary: "secondary",
      outline: "control",
      ghost: "control",
      destructive: "destructive",
    };
    for (const [variant, role] of Object.entries(roles)) {
      const tokens = classes(renderToString(<Button variant={variant as keyof typeof roles}>save</Button>));
      expect(tokens).toEqual(expect.arrayContaining([`hover:bg-${role}-hover`, `active:bg-${role}-press`]));
    }
  });
});

describe("badge", () => {
  test.each(STATES)("%s renders its glyph square and its word", (state) => {
    const glyph = pathOf(renderToString(<StatusGlyph state={state} />));
    const named = renderToString(<Badge variant={state}>{`${state} 3`}</Badge>);
    expect(pathOf(named)).toBe(glyph);
    expect(named).toContain(`${state} 3</span>`);
    expect(named.indexOf("<svg")).toBeLessThan(named.indexOf(`${state} 3`));
    const bare = renderToString(<Badge variant={state} />);
    expect(pathOf(bare)).toBe(glyph);
    expect(bare).toContain(`${state}</span>`);
    expect(bare).toContain(`data-variant="${state}"`);
  });

  test.each(STATES.filter((state) => state !== "failed"))("%s is a wash with an edge", (state) => {
    const tokens = classes(renderToString(<Badge variant={state} />));
    const role = ROLE[state];
    expect(tokens).toEqual(
      expect.arrayContaining([
        `bg-${role}-wash`,
        `border-${role}-edge`,
        `text-${role}-foreground`,
        `text-${role}-glyph`,
      ]),
    );
  });

  test("failed is the one solid badge, its glyph in the label ink", () => {
    const tokens = classes(renderToString(<Badge variant="failed" />));
    expect(tokens).toEqual(
      expect.arrayContaining(["bg-error-solid", "border-error-solid", "text-error-solid-foreground"]),
    );
    expect(tokens).not.toContain("text-error-glyph");
    for (const state of STATES.filter((s) => s !== "failed")) {
      expect(classes(renderToString(<Badge variant={state} />)).some((t) => t.endsWith("-solid"))).toBe(false);
    }
  });

  test("shadcn's variants print no glyph", () => {
    expect(renderToString(<Badge variant="secondary">beta</Badge>)).not.toContain("<svg");
  });

  test("the root is a span, and an element the caller renders keeps the mark", () => {
    expect(rootTag(renderToString(<Badge>beta</Badge>))).toStartWith("<span ");
    const link = rootTag(renderToString(<Badge variant="running" render={<a href="/runs" />} />));
    expect(link).toStartWith("<a ");
    expect(link).toContain('href="/runs"');
    expect(link).toContain('data-mk="badge"');
    expect(link).toContain('data-slot="badge"');
  });
});

describe("tabs", () => {
  test("the current tab is solid; the others take the hover bar", () => {
    const html = items.tabs!.html;
    const triggers = [...html.matchAll(/<button[^>]*>/g)].map((m) => m[0]);
    expect(triggers.length).toBe(3);
    const current = triggers.filter((t) => t.includes('aria-selected="true"'));
    expect(current.length).toBe(1);
    for (const trigger of triggers) {
      const tokens = classes(trigger);
      expect(tokens).toEqual(
        expect.arrayContaining([
          "texture-tabhover",
          "relative",
          "data-active:text-foreground",
          "data-active:after:bg-primary",
        ]),
      );
    }
  });

  test("vertical tabs forward their orientation", () => {
    const html = renderToString(
      <Tabs defaultValue="a" orientation="vertical">
        <TabsList>
          <TabsTrigger value="a">a</TabsTrigger>
        </TabsList>
      </Tabs>,
    );
    // the list reads its orientation from the root's context, so this shows the root got it
    expect(html.match(/<div[^>]*role="tablist"[^>]*>/)?.[0]).toContain('data-orientation="vertical"');
  });
});

describe("progress", () => {
  test("a flat house-ink fill with the ramp at its leading edge", () => {
    const indicator = items.progress!.html.match(/<div[^>]*data-slot="progress-indicator"[^>]*>/)?.[0] ?? "";
    expect(classes(indicator)).toEqual(expect.arrayContaining(["texture-ramp", "duration-(--duration-travel)"]));
    expect(indicator).toContain("width:62%");
  });

  test("the meter reads its value in mono", () => {
    const value = items.progress!.html.match(/<span[^>]*data-slot="progress-value"[^>]*>[^<]*/)?.[0] ?? "";
    expect(classes(value)).toEqual(expect.arrayContaining(["font-mono", "tabular-nums"]));
    expect(value).toEndWith("62%");
  });

  test("a finished bar drops the ramp", () => {
    const html = renderToString(<Progress value={100} />);
    const indicator = html.match(/<div[^>]*data-slot="progress-indicator"[^>]*>/)?.[0] ?? "";
    expect(indicator).toContain('data-complete=""');
    expect(classes(indicator)).toContain("data-complete:[mask:none]");
  });
});

describe("table", () => {
  test("rows come from the row spacing", () => {
    const table = (html: string) => html.match(/<table[^>]*>/)?.[0] ?? "";
    expect(classes(table(items.table!.html))).toContain("[--row:var(--spacing-row-table)]");
    const board = renderToString(<Table rows="board" />);
    expect(table(board)).toContain('data-rows="board"');
    expect(classes(table(board))).toContain("[--row:var(--spacing-row-board)]");
    const cell = items.table!.html.match(/<td[^>]*>/)?.[0] ?? "";
    expect(classes(cell)).toContain("h-[calc(var(--row)+1px)]");
  });

  test("ids and numbers set in mono, every figure tabular", () => {
    const html = items.table!.html;
    expect(classes(html.match(/<table[^>]*>/)?.[0] ?? "")).toEqual(
      expect.arrayContaining(["tabular-nums", "texture-rowedge"]),
    );
    for (const cell of html.match(/<t[dh][^>]*data-kind="id"[^>]*>/g) ?? [])
      expect(classes(cell)).toContain("font-mono");
    const numbers = html.match(/<t[dh][^>]*data-kind="number"[^>]*>/g) ?? [];
    expect(numbers.length).toBe(4);
    for (const cell of numbers) expect(classes(cell)).toEqual(expect.arrayContaining(["font-mono", "text-right"]));
    const plain = html.match(/<td(?![^>]*data-kind)[^>]*>/)?.[0] ?? "";
    expect(classes(plain)).not.toContain("font-mono");
  });

  test("hover fills no row; a selected row takes the accent", () => {
    const rows = items.table!.html.match(/<tr[^>]*>/g) ?? [];
    for (const row of rows) {
      expect(classes(row).some((t) => t.startsWith("hover:bg-"))).toBe(false);
      expect(classes(row)).toContain("data-[state=selected]:bg-accent");
    }
  });
});

describe("skeleton", () => {
  test("whole-pixel bars, still", () => {
    const tokens = classes(renderToString(<Skeleton />));
    expect(tokens).toEqual(["h-3", "texture-skeleton"]);
    const sized = classes(renderToString(<Skeleton className="size-10" />));
    expect(sized).toEqual(["texture-skeleton", "size-10"]);
  });
});
