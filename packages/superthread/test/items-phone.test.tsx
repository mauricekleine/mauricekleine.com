// Every target on a phone reaches 44 px, and a box only grows where the box is the target. What sets a phone's size is a
// media variant and happy-dom measures nothing, so each row reads the variant the rendered element carries.
import { describe, expect, test } from "bun:test";
import type { ReactNode } from "react";
import { AppShellNav, AppShellNavItem } from "@/components/superthread/blocks/app-shell";
import { FilterChip } from "@/components/superthread/blocks/collection-toolbar";
import { SortableHead } from "@/components/superthread/blocks/data-table";
import { ListRow, ListRows, ListRowTitle } from "@/components/superthread/blocks/list-rows";
import { PageHeaderBack } from "@/components/superthread/blocks/page-header";
import { SearchPalette, SearchPaletteTrigger } from "@/components/superthread/blocks/search-palette";
import { SectionAction } from "@/components/superthread/blocks/section-header";
import { BreadcrumbLink } from "@/components/superthread/ui/breadcrumb";
import { Button } from "@/components/superthread/ui/button";
import { ButtonGroup } from "@/components/superthread/ui/button-group";
import { Checkbox } from "@/components/superthread/ui/checkbox";
import { FleetRail } from "@/components/superthread/ui/fleet-rail";
import { Input } from "@/components/superthread/ui/input";
import { InputGroup } from "@/components/superthread/ui/input-group";
import { NativeSelect } from "@/components/superthread/ui/native-select";
import { RadioGroup, RadioGroupItem } from "@/components/superthread/ui/radio-group";
import { Select, SelectTrigger, SelectValue } from "@/components/superthread/ui/select";
import { SidebarInput, SidebarProvider } from "@/components/superthread/ui/sidebar";
import { Slider } from "@/components/superthread/ui/slider";
import { Switch } from "@/components/superthread/ui/switch";
import { Table, TableHeader, TableRow } from "@/components/superthread/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/superthread/ui/tabs";
import { Toggle } from "@/components/superthread/ui/toggle";
import { ToggleGroup, ToggleGroupItem } from "@/components/superthread/ui/toggle-group";
import { one, server } from "./rendered.tsx";

const PHONE = "[@media(max-width:600px)]:";
const BAR = "[@media(max-width:900px)]:";
const NARROW = "[@media(max-width:420px)]:";

const reaches = (node: ReactNode, selector: string, ...classes: string[]) =>
  expect(one(server(node), selector).classes).toEqual(expect.arrayContaining(classes));

describe("buttons and toggles take a hit area and keep their box", () => {
  test.each(["default", "xs", "sm", "lg", "icon", "icon-xs", "icon-sm", "icon-lg"] as const)("button %s", (size) => {
    reaches(<Button size={size}>save</Button>, "button", `${PHONE}hit-area`, "relative");
  });

  test("toggle and toggle group item", () => {
    reaches(<Toggle>pin</Toggle>, "button", `${PHONE}hit-area`, "relative");
    reaches(
      <ToggleGroup>
        <ToggleGroupItem value="a">a</ToggleGroupItem>
      </ToggleGroup>,
      "button",
      `${PHONE}hit-area`,
      "relative",
    );
  });
});

describe("a field's box is 44 px", () => {
  test.each<[string, ReactNode, string, string]>([
    ["input", <Input aria-label="name" />, "input", `${PHONE}h-11`],
    ["input group", <InputGroup />, '[data-slot="input-group"]', `${PHONE}h-11`],
    ["sidebar input", <SidebarInput aria-label="find" />, "input", `${PHONE}h-11`],
    ["native select", <NativeSelect aria-label="ship" />, "select", `${PHONE}h-11`],
    ["small native select", <NativeSelect size="sm" aria-label="ship" />, "select", `${PHONE}data-[size=sm]:h-11`],
    [
      "select",
      <Select>
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
      </Select>,
      '[data-slot="select-trigger"]',
      `${PHONE}data-[size=default]:h-11`,
    ],
    [
      "small select",
      <Select>
        <SelectTrigger size="sm">
          <SelectValue />
        </SelectTrigger>
      </Select>,
      '[data-slot="select-trigger"]',
      `${PHONE}data-[size=sm]:h-11`,
    ],
    [
      "search trigger",
      <SearchPalette>
        <SearchPaletteTrigger />
      </SearchPalette>,
      '[data-slot="search-palette-trigger"]',
      `${PHONE}h-11`,
    ],
  ])("%s", (_, node, selector, phone) => reaches(node, selector, phone));

  test("a filter chip and its clear control hold at least 44 px", () => {
    reaches(<FilterChip onClear={() => {}}>running</FilterChip>, '[data-slot="filter-chip"]', `${PHONE}min-h-11`);
    reaches(<FilterChip onClear={() => {}}>running</FilterChip>, '[data-slot="filter-chip-clear"]', `${PHONE}w-11`);
  });

  test("a joined group holding a field takes its height across every child", () => {
    reaches(
      <ButtonGroup>
        <Input aria-label="name" />
        <Button>save</Button>
      </ButtonGroup>,
      '[data-slot="button-group"]',
      `${PHONE}has-[>input,>[data-slot=input-group],>[data-slot=select-trigger]]:*:h-11`,
    );
  });
});

test("a tab is 44 px tall with no padding left to throw its word off centre, and takes the pointer 44 px wide", () => {
  reaches(
    <Tabs defaultValue="a">
      <TabsList>
        <TabsTrigger value="a">a</TabsTrigger>
      </TabsList>
    </Tabs>,
    '[role="tab"]',
    `${PHONE}h-11`,
    `${PHONE}pb-0`,
    `${PHONE}before:absolute`,
    `${PHONE}before:w-[max(100%,44px)]`,
  );
});

describe("a tick reaches 44 px at any width", () => {
  test.each<[string, ReactNode, string]>([
    ["checkbox", <Checkbox aria-label="done" />, '[role="checkbox"]'],
    ["switch", <Switch aria-label="on" />, '[role="switch"]'],
    [
      "radio",
      <RadioGroup aria-label="plan">
        <RadioGroupItem value="a" aria-label="a" />
      </RadioGroup>,
      '[role="radio"]',
    ],
    ["slider thumb", <Slider aria-label="level" defaultValue={[1]} />, '[data-slot="slider-thumb"]'],
  ])("%s", (_, node, selector) => reaches(node, selector, "hit-area", "relative"));
});

describe("a link part takes the hit area", () => {
  test.each<[string, ReactNode]>([
    ["the way onward", <SectionAction href="/more">more</SectionAction>],
    ["the way back", <PageHeaderBack href="/">back</PageHeaderBack>],
    ["a breadcrumb", <BreadcrumbLink href="/">home</BreadcrumbLink>],
  ])("%s prints through link-quiet", (_, node) => reaches(node, "a", "link-quiet"));

  test("a linked row title", () => {
    reaches(
      <ListRows>
        <ListRow>
          <ListRowTitle href="/run">a run</ListRowTitle>
        </ListRow>
      </ListRows>,
      "a",
      `${PHONE}[&:is(a)]:relative`,
      `${PHONE}[&:is(a)]:hit-area`,
    );
  });
});

test("a sortable head takes the hit area", () => {
  reaches(
    <Table>
      <TableHeader>
        <TableRow>
          <SortableHead onSort={() => {}}>age</SortableHead>
        </TableRow>
      </TableHeader>
    </Table>,
    '[data-slot="sortable-head-button"]',
    "relative",
    `${PHONE}hit-area`,
  );
});

describe("the frame keeps a 44 px pitch", () => {
  test("a nav item reaches 44 px at 900 px and under, with its wrapped rows on the same pitch", () => {
    const host = server(
      <SidebarProvider>
        <AppShellNav ship="orbit">
          <AppShellNavItem render={<a href="/board" />}>board</AppShellNavItem>
        </AppShellNav>
      </SidebarProvider>,
    );
    expect(one(host, "a").classes).toEqual(expect.arrayContaining([`${BAR}h-8`, `${BAR}hit-area`]));
    expect(one(host, "ul").classes).toContain(`${BAR}gap-y-3`);
  });

  test("the rail spans a phone and each 36 px cell takes the pointer past 44 px", () => {
    const host = server(<FleetRail current="orbit" markBase="/marks" />);
    expect(one(host, '[data-slot="fleet-rail"]').classes).toContain(`${NARROW}w-full!`);
    expect(one(host, '[data-slot="fleet-rail-home"]').classes).toContain(`${NARROW}w-11!`);
    for (const cell of host.querySelectorAll('[data-slot="fleet-rail-cell"], [data-slot="fleet-rail-mode"]')) {
      const classes = cell.getAttribute("class")!.split(/\s+/);
      expect(classes).toEqual(
        expect.arrayContaining([
          `${NARROW}size-9!`,
          `${NARROW}before:absolute`,
          `${NARROW}before:-inset-x-[5px]`,
          `${NARROW}before:-inset-y-1.5`,
        ]),
      );
    }
  });
});
