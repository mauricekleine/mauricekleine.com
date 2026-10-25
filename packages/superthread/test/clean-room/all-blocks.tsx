// The compositions' sink: every block, once in .light and once in .dark. Clean-room step 8 copies this file to the
// fixture's src/routes/blocks.tsx beside /all, and the fixture's build is its only type-check. It uses only each
// block's own API, with synthetic words.
import { type ReactNode } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  AppShell,
  AppShellGround,
  AppShellNav,
  AppShellNavItem,
  AppShellPanel,
} from "@/components/superthread/blocks/app-shell";
import {
  Section,
  SectionAction,
  SectionCount,
  SectionHeader,
  SectionTitle,
} from "@/components/superthread/blocks/section-header";
import {
  SearchPalette,
  SearchPaletteContent,
  SearchPaletteTrigger,
} from "@/components/superthread/blocks/search-palette";
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
  EmptyStateText,
  FailedState,
  LoadingState,
} from "@/components/superthread/blocks/states";
import {
  FormSection,
  FormSectionHeader,
  FormSectionTitle,
  FormSectionDescription,
  FormSectionFields,
  FormSectionFooter,
  FormSectionStatus,
} from "@/components/superthread/blocks/form-section";
import { QuickAdd } from "@/components/superthread/blocks/quick-add";
import { Facts, Fact, FactLabel, FactValue } from "@/components/superthread/blocks/facts";
import { Notice, NoticeTitle, NoticeDescription, NoticeActions } from "@/components/superthread/blocks/notice";
import { Field, FieldLabel } from "@/components/superthread/ui/field";
import { Input } from "@/components/superthread/ui/input";
import { cn } from "@/components/superthread/lib/utils";
import { Button } from "@/components/superthread/ui/button";
import {
  CollectionToolbar,
  ToolbarGroup,
  ToolbarSpacer,
  FilterChip,
  ToolbarCount,
  ViewSwitch,
} from "@/components/superthread/blocks/collection-toolbar";
import {
  ListRows,
  ListRow,
  ListRowLead,
  ListRowTitle,
  ListRowAside,
  ListRowMeta,
  ListRowActions,
} from "@/components/superthread/blocks/list-rows";
import {
  ItemCards,
  ItemCard,
  ItemCardMedia,
  ItemCardId,
  ItemCardTitle,
  ItemCardMeta,
  ItemCardActions,
} from "@/components/superthread/blocks/item-cards";
import { DataTable, SortableHead, TableEmpty } from "@/components/superthread/blocks/data-table";
import { Checkbox } from "@/components/superthread/ui/checkbox";
import { Icon } from "@/components/superthread/ui/glyphs";
import { Badge } from "@/components/superthread/ui/badge";
import { TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/superthread/ui/table";
import { CommandGroup, CommandItem, CommandShortcut } from "@/components/superthread/ui/command";

export const Route = createFileRoute("/blocks")({ component: AllBlocks });

type Mode = "light" | "dark";

function AllBlocks() {
  return (
    <main>
      <Sink mode="light" />
      <Sink mode="dark" />
    </main>
  );
}

function Sink({ mode }: { mode: Mode }) {
  return (
    <section data-sink={mode} className={cn(mode, "flex flex-col gap-10 bg-background p-10 text-foreground")}>
      <h1 className="text-2xl">{mode}</h1>

      <Part name="page-header">
        <PageHeader>
          <PageHeaderTitle>board</PageHeaderTitle>
          <PageHeaderMeta>12 tasks, 2 running</PageHeaderMeta>
          <PageHeaderActions>
            <Button>new task</Button>
          </PageHeaderActions>
        </PageHeader>
        <PageHeader size="page">
          <PageHeaderBack href="#essays">essays</PageHeaderBack>
          <PageHeaderTitle>the long way round</PageHeaderTitle>
          <PageHeaderDescription>a lede on its own line, held to a reading measure.</PageHeaderDescription>
        </PageHeader>
      </Part>

      <Part name="states">
        <LoadingState rows={3} label="loading runs" />
        <FailedState title="the runs did not load" onRetry={() => {}}>
          the server took too long.
        </FailedState>
        <EmptyState>
          <EmptyStateText title="nothing queued">a new task lands here.</EmptyStateText>
          <EmptyStateActions>
            <Button variant="outline">new task</Button>
          </EmptyStateActions>
        </EmptyState>
      </Part>

      {/* blocks: shell */}
      <Part name="app-shell">
        <AppShell
          current="orbit"
          markBase="/marks"
          hrefs={{ home: "#home", orbit: "#orbit" }}
          sidebar={
            <AppShellNav ship="orbit">
              <AppShellNavItem isActive number="01" count={12} render={<a href="#board" />}>
                board
              </AppShellNavItem>
              <AppShellNavItem number="02" render={<a href="#runs" />}>
                runs
              </AppShellNavItem>
            </AppShellNav>
          }
        >
          <AppShellGround>
            <AppShellPanel>the working panel</AppShellPanel>
          </AppShellGround>
        </AppShell>
      </Part>
      <Part name="section-header">
        <Section>
          <SectionHeader>
            <SectionTitle>recent runs</SectionTitle>
            <SectionCount>12</SectionCount>
            <SectionAction href="#runs" />
          </SectionHeader>
          <p>runs appear here.</p>
        </Section>
      </Part>
      <Part name="search-palette">
        <SearchPalette>
          <SearchPaletteTrigger />
          <SearchPaletteContent onSelect={() => {}}>
            {(select) => (
              <CommandGroup heading="pages">
                <CommandItem value="board" onSelect={select}>
                  board<CommandShortcut>b</CommandShortcut>
                </CommandItem>
              </CommandGroup>
            )}
          </SearchPaletteContent>
        </SearchPalette>
      </Part>
      {/* blocks: collections */}
      <Part name="collection-toolbar">
        <CollectionToolbar label="task controls">
          <ToolbarGroup label="status">
            <Button variant="outline" size="sm">
              queued
            </Button>
          </ToolbarGroup>
          <FilterChip shown={2} total={12} onClear={() => {}}>
            agent: sol
          </FilterChip>
          <ToolbarSpacer />
          <ToolbarCount shown={2} total={12} />
          <ViewSwitch
            views={[
              { value: "rows", label: "rows" },
              { value: "cards", label: "cards" },
            ]}
          />
        </CollectionToolbar>
      </Part>
      <Part name="list-rows">
        <ListRows aria-label="tasks">
          <ListRow>
            <ListRowLead>
              <Checkbox aria-label="complete task" />
            </ListRowLead>
            <ListRowTitle render={<a href="#task" />}>check the registry</ListRowTitle>
            <ListRowAside>
              <time dateTime="2026-10-25">2h ago</time>
            </ListRowAside>
            <ListRowMeta>
              <Badge variant="queued" />
              <span>orbit</span>
            </ListRowMeta>
            <ListRowActions>
              <Button variant="outline" size="sm">
                accept
              </Button>
            </ListRowActions>
          </ListRow>
          <ListRow>
            <ListRowTitle>plain task</ListRowTitle>
          </ListRow>
        </ListRows>
      </Part>
      <Part name="item-cards">
        <ItemCards aria-label="drafts">
          <ItemCard>
            <ItemCardMedia>
              <div className="h-full bg-muted" />
            </ItemCardMedia>
            <ItemCardId>or-12</ItemCardId>
            <ItemCardTitle render={<a href="#draft" />}>a draft to review</ItemCardTitle>
            <ItemCardMeta>
              <Badge variant="queued" />
              <time dateTime="2026-10-25">2h ago</time>
            </ItemCardMeta>
            <ItemCardActions>
              <Button variant="ghost" size="icon-sm" aria-label="draft actions">
                <Icon name="more" />
              </Button>
            </ItemCardActions>
          </ItemCard>
          <ItemCard>
            <ItemCardTitle>plain draft</ItemCardTitle>
          </ItemCard>
        </ItemCards>
      </Part>
      <Part name="data-table">
        <DataTable label="runs" rows="board">
          <TableHeader>
            <TableRow>
              <TableHead kind="id">id</TableHead>
              <SortableHead sort="ascending" onSort={() => {}}>
                title
              </SortableHead>
              <SortableHead kind="number" onSort={() => {}}>
                age
              </SortableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow aria-selected="true">
              <TableCell kind="id">or-12</TableCell>
              <TableCell>check the registry</TableCell>
              <TableCell kind="number">2h</TableCell>
            </TableRow>
            <TableEmpty columns={3} title="no other runs">
              a new run lands here.
            </TableEmpty>
          </TableBody>
        </DataTable>
      </Part>
      {/* blocks: forms */}
      <Part name="form-section">
        <FormSection onSubmit={(event) => event.preventDefault()}>
          <FormSectionHeader>
            <FormSectionTitle>settings</FormSectionTitle>
            <FormSectionDescription>new runs use these settings.</FormSectionDescription>
          </FormSectionHeader>
          <FormSectionFields>
            <Field>
              <FieldLabel htmlFor={`${mode}-prefix`}>branch prefix</FieldLabel>
              <Input id={`${mode}-prefix`} defaultValue="agent/" />
            </Field>
          </FormSectionFields>
          <FormSectionFooter>
            <FormSectionStatus>unsaved changes</FormSectionStatus>
            <Button type="reset" variant="outline">
              discard
            </Button>
            <Button type="submit">save</Button>
          </FormSectionFooter>
        </FormSection>
      </Part>
      <Part name="quick-add">
        <QuickAdd label="new task" placeholder="what needs doing?" onAdd={async () => {}} />
        <QuickAdd
          label="email"
          hideLabel
          submitLabel="subscribe"
          inputProps={{ type: "email", autoComplete: "email", required: true }}
          onAdd={() => {}}
        />
      </Part>
      <Part name="facts">
        <Facts>
          <Fact>
            <FactLabel>run</FactLabel>
            <FactValue kind="id">r-12</FactValue>
          </Fact>
          <Fact>
            <FactLabel>attempts</FactLabel>
            <FactValue kind="number">2</FactValue>
          </Fact>
        </Facts>
        <Facts layout="grid" columns={4}>
          <Fact>
            <FactLabel>ship</FactLabel>
            <FactValue>orbit</FactValue>
          </Fact>
          <Fact>
            <FactLabel>run</FactLabel>
            <FactValue kind="id">r-12</FactValue>
          </Fact>
          <Fact>
            <FactLabel>attempts</FactLabel>
            <FactValue kind="number">2</FactValue>
          </Fact>
          <Fact>
            <FactLabel>started</FactLabel>
            <FactValue kind="number">12:04</FactValue>
          </Fact>
        </Facts>
      </Part>
      <Part name="notice">
        <Notice>
          <NoticeTitle>draft kept here</NoticeTitle>
          <NoticeDescription>choose when to save it.</NoticeDescription>
        </Notice>
        <Notice state="failed">
          <NoticeTitle>sync stopped</NoticeTitle>
          <NoticeDescription>your draft is kept locally.</NoticeDescription>
          <NoticeActions>
            <Button variant="outline">try again</Button>
            <Button variant="destructive">discard</Button>
          </NoticeActions>
        </Notice>
      </Part>
    </section>
  );
}

function Part({ name, children }: { name: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-sm text-muted-foreground">{name}</h2>
      {children}
    </div>
  );
}
