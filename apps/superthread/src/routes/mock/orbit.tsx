import { createFileRoute } from "@tanstack/react-router";
import { type FormEvent, useRef, useState } from "react";
import { Badge } from "@/components/superthread/ui/badge";
import { Button } from "@/components/superthread/ui/button";
import { Checkbox } from "@/components/superthread/ui/checkbox";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/superthread/ui/dialog";
import { Icon } from "@/components/superthread/ui/glyphs";
import { Input } from "@/components/superthread/ui/input";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/superthread/ui/input-group";
import { Label } from "@/components/superthread/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/superthread/ui/select";
import { Skeleton } from "@/components/superthread/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/superthread/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/superthread/ui/tabs";
import { Textarea } from "@/components/superthread/ui/textarea";
import { Toaster, toast } from "@/components/superthread/ui/toast";
import { agentsSummary, earlierRuns, orbitNav, type Run, runs, ships } from "@/mock/data";
import { ShipMark } from "@/mock/parts";
import { RunsChart } from "@/mock/RunsChart";
import { ShipFrame } from "@/mock/ShipFrame";

export const Route = createFileRoute("/mock/orbit")({
  staticData: { sections: [] },
  component: Page,
});

// the panels stay mounted, so a draft and the loaded runs survive a tab switch
function Page() {
  return (
    <ShipFrame ship="orbit" nav={orbitNav} current="agents">
      <Toaster>
        <Tabs defaultValue="overview" className="mock-panel gap-0 bg-card text-card-foreground shadow-sheet">
          <header className="mock-head">
            <ShipMark ship="orbit" />
            <h1 className="type-section">agents</h1>
            <p className="mock-count">{agentsSummary}</p>
          </header>
          <TabsList className="mock-tabs">
            <TabsTrigger value="overview">overview</TabsTrigger>
            <TabsTrigger value="runs">runs</TabsTrigger>
            <TabsTrigger value="settings">settings</TabsTrigger>
          </TabsList>
          <TabsContent value="overview" keepMounted>
            <section className="mock-section" aria-labelledby="per-week">
              <h2 id="per-week" className="type-subtitle">
                runs per week
              </h2>
              <RunsChart />
            </section>
            <section className="mock-section" aria-labelledby="recent">
              <h2 id="recent" className="type-subtitle">
                recent runs
              </h2>
              <RunsTable runs={runs} />
            </section>
            <section className="mock-section" aria-labelledby="schedule">
              <h2 id="schedule" className="type-subtitle">
                schedule a run
              </h2>
              <ScheduleForm />
            </section>
          </TabsContent>
          <TabsContent value="runs" keepMounted>
            <RunLog />
          </TabsContent>
          <TabsContent value="settings" keepMounted>
            <SettingsForm />
          </TabsContent>
        </Tabs>
      </Toaster>
    </ShipFrame>
  );
}

// ship, agent and started drop out below 600 px, so run, task, status and took fit the sheet, as on the board
function RunsTable({ runs, loading = 0 }: { runs: readonly Run[]; loading?: number }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead kind="id">run</TableHead>
          <TableHead>task</TableHead>
          <TableHead className="mock-phone-off">ship</TableHead>
          <TableHead className="mock-phone-off">agent</TableHead>
          <TableHead>status</TableHead>
          <TableHead kind="number" className="mock-phone-off">
            started
          </TableHead>
          <TableHead kind="number">took</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody aria-busy={loading > 0 || undefined}>
        {runs.map((run) => (
          <TableRow key={run.id}>
            <TableCell kind="id" className="text-instrument text-muted-foreground">
              {run.id}
            </TableCell>
            <TableCell className="mock-task whitespace-normal">
              <span className="mock-id">{run.task}</span> {run.title}
            </TableCell>
            <TableCell className="mock-phone-off">
              <span className="mock-ship">
                <ShipMark ship={run.ship} size={16} />
                {run.ship}
              </span>
            </TableCell>
            <TableCell className="mock-phone-off text-muted-foreground">{run.agent}</TableCell>
            <TableCell>
              <Badge variant={run.state} />
            </TableCell>
            <TableCell kind="number" className="mock-phone-off text-instrument text-muted-foreground">
              {run.started}
            </TableCell>
            <TableCell kind="number" className="text-instrument text-muted-foreground">
              {run.took}
            </TableCell>
          </TableRow>
        ))}
        {Array.from({ length: loading }, (_, row) => (
          <TableRow key={`loading-${row}`}>
            <TableCell>
              <Skeleton className="w-12" />
            </TableCell>
            <TableCell>
              <Skeleton className={row === 1 ? "w-full max-w-40" : "w-full max-w-56"} />
            </TableCell>
            <TableCell className="mock-phone-off">
              <Skeleton className="w-16" />
            </TableCell>
            <TableCell className="mock-phone-off">
              <Skeleton className="w-14" />
            </TableCell>
            <TableCell>
              <Skeleton className="w-18" />
            </TableCell>
            <TableCell className="mock-phone-off">
              <Skeleton className="ml-auto w-10" />
            </TableCell>
            <TableCell>
              <Skeleton className="ml-auto w-8" />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

// the runs tab: the day's log, and the earlier runs on request, with skeleton rows while they load
function RunLog() {
  const [shown, setShown] = useState<readonly Run[]>(runs);
  const [loading, setLoading] = useState(false);
  const more = shown.length < runs.length + earlierRuns.length;

  const load = () => {
    setLoading(true);
    window.setTimeout(() => {
      setShown([...runs, ...earlierRuns]);
      setLoading(false);
    }, 900);
  };

  return (
    <div className="mock-section">
      <RunsTable runs={shown} loading={loading ? earlierRuns.length : 0} />
      <p className="mock-after">
        {more ? (
          <Button variant="outline" onClick={load} disabled={loading}>
            {loading ? "loading earlier runs" : "show earlier runs"}
          </Button>
        ) : (
          <span className="mock-quiet">that is every run from today.</span>
        )}
      </p>
    </div>
  );
}

const shipItems = ships.map((ship) => ({ value: ship, label: ship }));
const checkNames = ["type-check", "unit tests", "screenshots"] as const;
const fresh = {
  query: "select listbox",
  ship: "orbit",
  branch: "Fix Select Loop",
  notes: "",
  checks: ["type-check", "unit tests"] as readonly string[],
};
const branchShape = /^[a-z0-9][a-z0-9/-]*$/;

function ScheduleForm() {
  const [query, setQuery] = useState(fresh.query);
  const [ship, setShip] = useState<string | null>(fresh.ship);
  const [branch, setBranch] = useState(fresh.branch);
  const [notes, setNotes] = useState(fresh.notes);
  const [checks, setChecks] = useState<readonly string[]>(fresh.checks);
  const [nextRun, setNextRun] = useState(2292);
  const queryRef = useRef<HTMLInputElement>(null);
  const branchRef = useRef<HTMLInputElement>(null);

  const branchError =
    branch === ""
      ? "a run needs a branch."
      : branchShape.test(branch)
        ? null
        : "use lowercase letters, numbers, dashes and slashes, like fix/select-loop.";
  const all = checks.length === checkNames.length;
  const some = checks.length > 0 && !all;

  const schedule = (event: FormEvent) => {
    event.preventDefault();
    if (branchError) {
      branchRef.current?.focus();
      return;
    }
    toast.add({
      type: "success",
      title: `r-${nextRun} scheduled`,
      description: `${ship ?? "orbit"} runs it on ${branch} when an agent is free.`,
    });
    setNextRun((run) => run + 1);
  };

  const discard = () => {
    setQuery("");
    setShip(fresh.ship);
    setBranch("");
    setNotes("");
    setChecks(fresh.checks);
    toast.add({ title: "draft discarded", description: "the form is empty again." });
  };

  return (
    <form className="mock-form" onSubmit={schedule} noValidate>
      <div className="mock-control mock-wide">
        <Label htmlFor="run-task">task</Label>
        <InputGroup>
          <InputGroupAddon>
            <Icon name="search" />
          </InputGroupAddon>
          <InputGroupInput
            ref={queryRef}
            id="run-task"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="find a task by id or title"
            autoComplete="off"
          />
          {query && (
            <InputGroupAddon align="inline-end">
              <InputGroupButton
                size="icon-xs"
                aria-label="clear the task"
                onClick={() => {
                  setQuery("");
                  queryRef.current?.focus();
                }}
              >
                <Icon name="close" />
              </InputGroupButton>
            </InputGroupAddon>
          )}
        </InputGroup>
      </div>

      <div className="mock-control">
        <Label htmlFor="run-ship">ship</Label>
        <Select items={shipItems} value={ship} onValueChange={(value) => setShip(value as string | null)}>
          <SelectTrigger id="run-ship" className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {shipItems.map((item) => (
              <SelectItem key={item.value} value={item.value}>
                {item.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="mock-control">
        <Label htmlFor="run-branch">branch</Label>
        <Input
          ref={branchRef}
          id="run-branch"
          value={branch}
          onChange={(event) => setBranch(event.target.value)}
          aria-invalid={branchError ? true : undefined}
          aria-describedby={branchError ? "run-branch-error" : undefined}
          autoComplete="off"
          spellCheck={false}
        />
        {branchError && (
          <p id="run-branch-error" className="mock-hint mock-error">
            {branchError}
          </p>
        )}
      </div>

      <div className="mock-control">
        <Label htmlFor="run-agent">agent</Label>
        <Input id="run-agent" defaultValue="picked by the queue" disabled aria-describedby="run-agent-hint" />
        <p id="run-agent-hint" className="mock-hint">
          the queue hands the run to the first free agent.
        </p>
      </div>

      <fieldset className="mock-control mock-checks">
        <legend>checks before merge</legend>
        <Label>
          <Checkbox checked={all} indeterminate={some} onCheckedChange={(on) => setChecks(on ? checkNames : [])} />
          every check
        </Label>
        <div className="mock-check-list">
          {checkNames.map((name) => (
            <Label key={name}>
              <Checkbox
                checked={checks.includes(name)}
                onCheckedChange={(on) =>
                  setChecks((list) => (on ? [...list, name] : list.filter((entry) => entry !== name)))
                }
              />
              {name}
            </Label>
          ))}
        </div>
      </fieldset>

      <div className="mock-control mock-wide">
        <Label htmlFor="run-notes">notes for the agent</Label>
        <Textarea
          id="run-notes"
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          placeholder="what should it know before it starts?"
        />
      </div>

      <div className="mock-actions">
        <Dialog>
          <DialogTrigger render={<Button variant="destructive" />}>discard draft</DialogTrigger>
          <DialogContent showCloseButton={false}>
            <DialogHeader>
              <DialogTitle>discard this draft?</DialogTitle>
              <DialogDescription>
                the task, branch and notes you entered are cleared. runs already scheduled keep going.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <DialogClose render={<Button variant="outline" />}>keep editing</DialogClose>
              <DialogClose render={<Button variant="destructive" />} onClick={discard}>
                discard draft
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        <Button type="submit">schedule run</Button>
      </div>
    </form>
  );
}

const parallel = ["1", "2", "3", "4"].map((count) => ({ value: count, label: count }));

function SettingsForm() {
  const save = (event: FormEvent) => {
    event.preventDefault();
    toast.add({ type: "success", title: "settings saved", description: "new runs use them from now on." });
  };

  return (
    <form className="mock-form mock-section" onSubmit={save}>
      <div className="mock-control">
        <Label htmlFor="set-parallel">runs at once</Label>
        <Select items={parallel} defaultValue="2">
          <SelectTrigger id="set-parallel" className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {parallel.map((item) => (
              <SelectItem key={item.value} value={item.value}>
                {item.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="mock-control">
        <Label htmlFor="set-prefix">branch prefix</Label>
        <Input id="set-prefix" defaultValue="agent/" autoComplete="off" spellCheck={false} />
      </div>
      <div className="mock-control mock-wide">
        <Label>
          <Checkbox defaultChecked />
          tell me when a run fails
        </Label>
      </div>
      <div className="mock-actions">
        <Button type="submit">save settings</Button>
      </div>
    </form>
  );
}
