import { createFileRoute } from "@tanstack/react-router";
import { useId, useState } from "react";
import { Badge } from "@/components/superthread/ui/badge";
import { Button } from "@/components/superthread/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/superthread/ui/card";
import { Icon, type StatusState } from "@/components/superthread/ui/glyphs";
import { Progress, ProgressLabel, ProgressValue } from "@/components/superthread/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/superthread/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/superthread/ui/table";
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
const views: readonly View[] = ["list", "columns"];
const agentItems = boardAgents.map((agent) => ({ value: agent, label: agent }));

// The board opens on its rows. The status tabs and the agent picker filter both views; the columns view sits behind
// the quieter switch beside the picker.
function Page() {
  const [tasks, setTasks] = useState<readonly Task[]>(seed);
  const [status, setStatus] = useState<BoardStatus>("all");
  const [agent, setAgent] = useState<string>(anyone);
  const [view, setView] = useState<View>("list");
  const agentLabel = useId();
  const viewLabel = useId();
  const running = tasks.filter((task) => task.state === "running").length;
  const shown = tasks.filter(
    (task) => (status === "all" || task.state === status) && (agent === anyone || task.agent === agent),
  );

  // a new task lands in queued, unassigned, with the next id
  const add = () => {
    const id = `or-${Math.max(...tasks.map((task) => Number(task.id.slice(3)))) + 1}`;
    setTasks((list) => [...list, { id, title: "untitled task", state: "queued", agent: "unassigned", age: "now" }]);
    toast.add({ title: `${id} queued`, description: "it waits in queued until an agent picks it up." });
  };

  return (
    <ShipFrame ship="orbit" nav={orbitNav} current="board">
      <Toaster>
        <Tabs
          value={status}
          onValueChange={(value) => setStatus(value as BoardStatus)}
          className="mock-panel gap-0 bg-card text-card-foreground shadow-sheet"
        >
          <header className="mock-head">
            <ShipMark ship="orbit" />
            <h1 className="type-section">board</h1>
            <p className="mock-count" aria-live="polite">
              {tasks.length} tasks, {running} running
            </p>
            <TabsList variant="line" aria-label="status">
              {boardStatuses.map((value) => (
                <TabsTrigger key={value} value={value} className="pt-3">
                  {value}
                </TabsTrigger>
              ))}
            </TabsList>
            <Button onClick={add}>
              <Icon name="plus" />
              new task
            </Button>
          </header>
          <div className="mock-tools">
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
            <div role="group" aria-labelledby={viewLabel} className="mock-view">
              <span id={viewLabel} className="type-meta text-muted-foreground">
                view
              </span>
              {views.map((value) => (
                <Button
                  key={value}
                  variant="ghost"
                  size="sm"
                  aria-pressed={view === value}
                  onClick={() => setView(value)}
                  className="text-muted-foreground aria-pressed:border-border aria-pressed:text-foreground"
                >
                  {value}
                </Button>
              ))}
            </div>
          </div>
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
      </Toaster>
    </ShipFrame>
  );
}

// the comp's table: newest first, the agent column dropping out at 900 px and below
function List({ tasks, status, agent }: { tasks: readonly Task[]; status: BoardStatus; agent: string }) {
  if (tasks.length === 0) {
    return <Empty state={status === "all" ? undefined : status} agent={agent} />;
  }
  return (
    <Table rows="board">
      <TableHeader>
        <TableRow>
          <TableHead kind="id">id</TableHead>
          <TableHead>title</TableHead>
          <TableHead>status</TableHead>
          <TableHead className="mock-agent">agent</TableHead>
          <TableHead kind="number">age</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {[...tasks]
          .sort((a, b) => b.id.localeCompare(a.id))
          .map((task) => (
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
    </Table>
  );
}

function Column({ state, agent, tasks }: { state: StatusState; agent: string; tasks: readonly Task[] }) {
  const id = `column-${state}`;
  return (
    <section className="mock-column" aria-labelledby={id}>
      <h2 id={id} className="mock-column-head">
        <Badge variant={state} />
        <span className="mock-quiet">{tasks.length}</span>
      </h2>
      {tasks.length > 0 ? (
        <ul className="mock-cards">
          {tasks.map((task) => (
            <li key={task.id}>
              <TaskCard task={task} />
            </li>
          ))}
        </ul>
      ) : (
        <Empty state={state} agent={agent} />
      )}
    </section>
  );
}

// The empty wedge in its crop marks, and what the empty place holds. Narrowed to one agent, it says how to see the
// rest instead.
function Empty({ state, agent }: { state?: StatusState; agent: string }) {
  const words =
    agent === anyone && state
      ? emptyColumn[state]
      : { title: "nothing for this agent", body: `set agent to anyone to see every ${state ? `${state} ` : ""}task.` };
  return (
    <div className="mock-empty">
      <PlateField name="empty" phone="empty-phone" width={608} phoneWidth={326} height={120} />
      <p>
        <b>{words.title}</b>
        {words.body}
      </p>
    </div>
  );
}

function TaskCard({ task }: { task: Task }) {
  return (
    <Card size="sm">
      <CardHeader>
        <span className="mock-id">{task.id}</span>
        <CardTitle>{task.title}</CardTitle>
      </CardHeader>
      {task.progress && (
        <CardContent>
          <Progress value={task.progress.value}>
            <ProgressLabel>{task.progress.step}</ProgressLabel>
            <ProgressValue />
          </Progress>
        </CardContent>
      )}
      <CardContent className="mock-meta">
        <span>{task.agent}</span>
        <span className="font-mono">{task.age}</span>
      </CardContent>
    </Card>
  );
}
