import { createFileRoute } from "@tanstack/react-router";
import { useId, useState } from "react";
import { Badge } from "@/components/superthread/ui/badge";
import { Button } from "@/components/superthread/ui/button";
import { CardContent } from "@/components/superthread/ui/card";
import { AppShellPanel } from "@/components/superthread/blocks/app-shell";
import {
  PageHeader,
  PageHeaderTitle,
  PageHeaderMeta,
  PageHeaderActions,
} from "@/components/superthread/blocks/page-header";
import {
  CollectionToolbar,
  ToolbarGroup,
  ToolbarSpacer,
  FilterChip,
  ViewSwitch,
} from "@/components/superthread/blocks/collection-toolbar";
import { DataTable, SortableHead, type SortDirection } from "@/components/superthread/blocks/data-table";
import {
  ItemCards,
  ItemCard,
  ItemCardId,
  ItemCardTitle,
  ItemCardMeta,
} from "@/components/superthread/blocks/item-cards";
import { ListRows, ListRow, ListRowTitle, ListRowMeta, ListRowAside } from "@/components/superthread/blocks/list-rows";
import { QuickAdd } from "@/components/superthread/blocks/quick-add";
import { Section, SectionHeader, SectionCount, SectionTitle } from "@/components/superthread/blocks/section-header";
import { EmptyState, EmptyStateMedia, EmptyStateText } from "@/components/superthread/blocks/states";
import { Icon, type StatusState } from "@/components/superthread/ui/glyphs";
import { Progress, ProgressLabel, ProgressValue } from "@/components/superthread/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/superthread/ui/select";
import { TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/superthread/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/superthread/ui/tabs";
import { Toaster, toast } from "@/components/superthread/ui/toast";
import {
  anyone,
  type BoardStatus,
  boardAgents,
  boardStatuses,
  columns,
  emptyColumn,
  orbitNav,
  type Task,
  tasks as seed,
} from "@/mock/data";
import { PlateField, ShipMark } from "@/mock/parts";
import { ShipFrame } from "@/mock/ShipFrame";

export const Route = createFileRoute("/mock/board")({
  staticData: { sections: [] },
  component: Page,
});

type View = "list" | "columns";
const views = [
  { value: "list", label: "list" },
  { value: "columns", label: "columns" },
] as const;
const agentItems = boardAgents.map((agent) => ({ value: agent, label: agent }));

// The board opens on its rows. The status tabs and the agent picker filter both views; the columns view sits behind
// the quieter switch beside the picker.
function Page() {
  const [tasks, setTasks] = useState<readonly Task[]>(seed);
  const [status, setStatus] = useState<BoardStatus>("all");
  const [agent, setAgent] = useState<string>(anyone);
  const [view, setView] = useState<View>("list");
  const agentLabel = useId();
  const addId = useId();
  const [adding, setAdding] = useState(false);
  const running = tasks.filter((task) => task.state === "running").length;
  const shown = tasks.filter(
    (task) => (status === "all" || task.state === status) && (agent === anyone || task.agent === agent),
  );

  // a new task lands in queued, unassigned, with the next id
  const add = (title: string) => {
    const id = `or-${Math.max(...tasks.map((task) => Number(task.id.slice(3)))) + 1}`;
    setTasks((list) => [...list, { id, title, state: "queued", agent: "unassigned", age: "now" }]);
    setStatus("all");
    setAgent(anyone);
    toast.add({ title: `${id} queued`, description: "it stays queued until an agent picks it up." });
  };

  return (
    <ShipFrame ship="orbit" nav={orbitNav} current="board">
      <Toaster>
        <AppShellPanel>
          <Tabs value={status} onValueChange={(value) => setStatus(value as BoardStatus)} className="gap-0">
            <PageHeader className="mb-7">
              <ShipMark ship="orbit" />
              <PageHeaderTitle>board</PageHeaderTitle>
              <PageHeaderMeta>
                {tasks.length} tasks, {running} running
              </PageHeaderMeta>
              <PageHeaderActions>
                <TabsList variant="line" aria-label="status">
                  {boardStatuses.map((value) => (
                    <TabsTrigger key={value} value={value} className="pt-3">
                      {value}
                    </TabsTrigger>
                  ))}
                </TabsList>
                <Button
                  aria-expanded={adding}
                  aria-controls={adding ? addId : undefined}
                  onClick={() => setAdding((open) => !open)}
                >
                  <Icon name="plus" />
                  new task
                </Button>
              </PageHeaderActions>
            </PageHeader>
            {adding && (
              <QuickAdd
                id={addId}
                className="mb-6"
                label="task title"
                placeholder="what needs doing?"
                submitLabel="new task"
                inputProps={{ autoFocus: true }}
                onAdd={add}
              />
            )}
            <CollectionToolbar label="board controls">
              <Select
                items={agentItems}
                value={agent}
                onValueChange={(value) => setAgent((value as string | null) ?? anyone)}
              >
                <SelectTrigger aria-labelledby={agentLabel} className="h-9 w-52">
                  <span id={agentLabel} className="type-meta text-muted-foreground">
                    agent
                  </span>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent align="start" alignItemWithTrigger={false} className="w-60">
                  {agentItems.map((item) => (
                    <SelectItem key={item.value} value={item.value}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {agent !== anyone && (
                <FilterChip shown={shown.length} total={tasks.length} onClear={() => setAgent(anyone)}>
                  {agent}
                </FilterChip>
              )}
              <ToolbarSpacer />
              <ToolbarGroup label="view">
                <ViewSwitch views={views} value={view} onValueChange={(next) => setView(next as View)} />
              </ToolbarGroup>
            </CollectionToolbar>
            {boardStatuses.map((value) => (
              <TabsContent key={value} value={value} className={view === "columns" ? "mock-columns-pane" : undefined}>
                {view === "list" ? (
                  <List tasks={shown} status={value} agent={agent} />
                ) : (
                  <div className="mock-columns">
                    {columns
                      .filter((state) => value === "all" || state === value)
                      .map((state) => (
                        <Column
                          key={state}
                          state={state}
                          agent={agent}
                          tasks={shown.filter((task) => task.state === state)}
                        />
                      ))}
                  </div>
                )}
              </TabsContent>
            ))}
          </Tabs>
        </AppShellPanel>
      </Toaster>
    </ShipFrame>
  );
}

// the comp's table: newest first, the agent column dropping out at 900 px and below
function List({ tasks, status, agent }: { tasks: readonly Task[]; status: BoardStatus; agent: string }) {
  const [sort, setSort] = useState<SortDirection>("descending");
  const ordered = [...tasks].sort((a, b) => (sort === "ascending" ? 1 : -1) * a.id.localeCompare(b.id));
  if (tasks.length === 0) {
    return <Empty state={status === "all" ? undefined : status} agent={agent} />;
  }
  return (
    <>
      <div className="mock-board-table">
        <DataTable label="tasks" rows="board">
          <TableHeader>
            <TableRow>
              <SortableHead kind="id" sort={sort} onSort={setSort}>
                id
              </SortableHead>
              <TableHead>title</TableHead>
              <TableHead>status</TableHead>
              <TableHead className="mock-agent">agent</TableHead>
              <TableHead kind="number">age</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {ordered.map((task) => (
              <TableRow key={task.id}>
                <TableCell kind="id" className="text-instrument text-muted-foreground">
                  {task.id}
                </TableCell>
                <TableCell className="w-full whitespace-normal">{task.title}</TableCell>
                <TableCell>
                  <Badge variant={task.state} />
                </TableCell>
                <TableCell className="mock-agent text-muted-foreground">{task.agent}</TableCell>
                <TableCell kind="number" className="text-instrument text-muted-foreground">
                  {task.age}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </DataTable>
      </div>
      <ListRows className="mock-board-rows" aria-label="tasks">
        {ordered.map((task) => (
          <ListRow key={task.id}>
            <ListRowTitle>{task.title}</ListRowTitle>
            <ListRowAside>
              <Badge size="sm" variant={task.state} />
            </ListRowAside>
            <ListRowMeta>
              <span className="font-mono">{task.id}</span>
              <span>{task.agent}</span>
              <span>{task.age}</span>
            </ListRowMeta>
          </ListRow>
        ))}
      </ListRows>
    </>
  );
}

function Column({ state, agent, tasks }: { state: StatusState; agent: string; tasks: readonly Task[] }) {
  const id = `column-${state}`;
  return (
    <Section className="mock-column mt-0" titleId={id}>
      <SectionHeader>
        <SectionTitle className="sr-only">{state} tasks</SectionTitle>
        <Badge variant={state} />
        <SectionCount className="ml-auto">{tasks.length}</SectionCount>
      </SectionHeader>
      {tasks.length > 0 ? (
        <ItemCards>
          {tasks.map((task) => (
            <TaskCard key={task.id} task={task} />
          ))}
        </ItemCards>
      ) : (
        <Empty state={state} agent={agent} column />
      )}
    </Section>
  );
}

// The app supplies its plates; the state block owns the spacing and the recovery words.
function Empty({ state, agent, column = false }: { state?: StatusState; agent: string; column?: boolean }) {
  const words =
    agent === anyone && state
      ? emptyColumn[state]
      : { title: "nothing for this agent", body: `set agent to anyone to see every ${state ? `${state} ` : ""}task.` };
  return (
    <EmptyState className="mock-empty" role="status" aria-live="polite">
      <EmptyStateMedia>
        {column && (
          <div className="mock-plate" data-fit="column">
            <PlateField name="empty-column" width={112} height={120} />
          </div>
        )}
        <div className="mock-plate" data-fit="wide">
          <PlateField name="empty" width={608} height={120} />
        </div>
        <div className="mock-plate" data-fit="phone">
          <PlateField name="empty-phone" width={326} height={120} />
        </div>
      </EmptyStateMedia>
      <EmptyStateText title={words.title}>{words.body}</EmptyStateText>
    </EmptyState>
  );
}

function TaskCard({ task }: { task: Task }) {
  return (
    <ItemCard>
      <ItemCardId className="pr-(--card-spacing)">{task.id}</ItemCardId>
      <ItemCardTitle className="pr-(--card-spacing)">{task.title}</ItemCardTitle>
      {task.progress && (
        <CardContent>
          <Progress value={task.progress.value}>
            <ProgressLabel>{task.progress.step}</ProgressLabel>
            <ProgressValue />
          </Progress>
        </CardContent>
      )}
      <ItemCardMeta>
        <span>{task.agent}</span>
        <span className="font-mono">{task.age}</span>
      </ItemCardMeta>
    </ItemCard>
  );
}
