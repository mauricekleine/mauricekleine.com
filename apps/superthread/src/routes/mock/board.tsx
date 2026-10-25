import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Badge } from "@/components/superthread/ui/badge";
import { Button } from "@/components/superthread/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/superthread/ui/card";
import { Icon, type StatusState } from "@/components/superthread/ui/glyphs";
import { Progress, ProgressLabel, ProgressValue } from "@/components/superthread/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/superthread/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/superthread/ui/tabs";
import { columns, emptyColumn, orbitNav, type Task, tasks as seed } from "@/mock/data";
import { PlateField, ShipMark } from "@/mock/parts";
import { ShipFrame } from "@/mock/ShipFrame";

export const Route = createFileRoute("/mock/board")({
  staticData: { sections: [] },
  component: Page,
});

function Page() {
  const [tasks, setTasks] = useState<readonly Task[]>(seed);
  const running = tasks.filter((task) => task.state === "running").length;

  // a new task lands in queued, unassigned, with the next id
  const add = () =>
    setTasks((list) => {
      const next = Math.max(...list.map((task) => Number(task.id.slice(3)))) + 1;
      return [...list, { id: `or-${next}`, title: "untitled task", state: "queued", agent: "unassigned", age: "now" }];
    });

  return (
    <ShipFrame ship="orbit" nav={orbitNav} current="board">
      <Tabs defaultValue="columns" className="mock-panel gap-0 bg-card text-card-foreground shadow-sheet">
        <header className="mock-head">
          <ShipMark ship="orbit" />
          <h1 className="type-section">board</h1>
          <p className="mock-count" aria-live="polite">
            {tasks.length} tasks, {running} running
          </p>
          <TabsList variant="line" aria-label="view">
            <TabsTrigger value="columns">columns</TabsTrigger>
            <TabsTrigger value="list">list</TabsTrigger>
          </TabsList>
          <Button onClick={add}>
            <Icon name="plus" />
            new task
          </Button>
        </header>
        <TabsContent value="columns" className="mock-columns-pane">
          <div className="mock-columns">
            {columns.map((state) => (
              <Column key={state} state={state} tasks={tasks.filter((task) => task.state === state)} />
            ))}
          </div>
        </TabsContent>
        <TabsContent value="list">
          <Table rows="board">
            <TableHeader>
              <TableRow>
                <TableHead kind="id">id</TableHead>
                <TableHead>title</TableHead>
                <TableHead>status</TableHead>
                <TableHead>agent</TableHead>
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
                    <TableCell className="w-full min-w-48 whitespace-normal">{task.title}</TableCell>
                    <TableCell>
                      <Badge variant={task.state} />
                    </TableCell>
                    <TableCell className="text-muted-foreground">{task.agent}</TableCell>
                    <TableCell kind="number" className="text-instrument text-muted-foreground">
                      {task.age}
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </TabsContent>
      </Tabs>
    </ShipFrame>
  );
}

function Column({ state, tasks }: { state: StatusState; tasks: readonly Task[] }) {
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
        <div className="mock-empty">
          <PlateField name="empty" phone="empty-phone" width={608} phoneWidth={326} height={120} />
          <p>
            <b>{emptyColumn[state].title}</b>
            {emptyColumn[state].body}
          </p>
        </div>
      )}
    </section>
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
