import { createFileRoute } from "@tanstack/react-router";
import { type FormEvent, useRef, useState } from "react";
import { AppShellPanel } from "@/components/superthread/blocks/app-shell";
import { PageHeader, PageHeaderTitle, PageHeaderMeta } from "@/components/superthread/blocks/page-header";
import { Section, SectionHeader, SectionTitle } from "@/components/superthread/blocks/section-header";
import { DataTable } from "@/components/superthread/blocks/data-table";
import { LoadingState } from "@/components/superthread/blocks/states";
import { Notice, NoticeTitle } from "@/components/superthread/blocks/notice";
import {
  FormSection,
  FormSectionHeader,
  FormSectionTitle,
  FormSectionFields,
  FormSectionFooter,
  FormSectionStatus,
} from "@/components/superthread/blocks/form-section";
import {
  Field,
  FieldLabel,
  FieldDescription,
  FieldError,
  FieldSet,
  FieldLegend,
} from "@/components/superthread/ui/field";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/superthread/ui/select";
import { TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/superthread/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/superthread/ui/tabs";
import { Textarea } from "@/components/superthread/ui/textarea";
import { Toaster, toast } from "@/components/superthread/ui/toast";
import { agentsSummary, earlierRuns, orbitNav, type Run, runs, shipLabel, ships } from "@/mock/data";
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
    <ShipFrame ship="orbit" nav={orbitNav} current="Agents">
      <Toaster>
        <AppShellPanel>
          <Tabs defaultValue="overview" className="gap-0">
            <PageHeader className="mb-7">
              <ShipMark ship="orbit" />
              <PageHeaderTitle>Agents</PageHeaderTitle>
              <PageHeaderMeta>{agentsSummary}</PageHeaderMeta>
            </PageHeader>
            <TabsList className="mb-8" aria-label="Agents">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="runs">Runs</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>
            <TabsContent value="overview" keepMounted>
              <Section className="mock-section" titleId="per-week">
                <SectionHeader>
                  <SectionTitle>Runs per week</SectionTitle>
                </SectionHeader>
                <RunsChart />
              </Section>
              <Section className="mock-section" titleId="recent">
                <SectionHeader>
                  <SectionTitle>Recent runs</SectionTitle>
                </SectionHeader>
                <RunsTable runs={runs} />
              </Section>
              <Section className="mock-section" titleId="schedule">
                <SectionHeader>
                  <SectionTitle>Schedule a run</SectionTitle>
                </SectionHeader>
                <ScheduleForm />
              </Section>
            </TabsContent>
            <TabsContent value="runs" keepMounted>
              <RunLog />
            </TabsContent>
            <TabsContent value="settings" keepMounted>
              <SettingsForm />
            </TabsContent>
          </Tabs>
        </AppShellPanel>
      </Toaster>
    </ShipFrame>
  );
}

// ship, agent and started drop out wherever the section is narrower than the whole table, so run, task, status and
// took fit the sheet, as on the board
function RunsTable({ runs }: { runs: readonly Run[] }) {
  return (
    <DataTable label="Agent runs">
      <TableHeader>
        <TableRow>
          <TableHead kind="id">Run</TableHead>
          <TableHead>Task</TableHead>
          <TableHead className="mock-narrow-off">Ship</TableHead>
          <TableHead className="mock-narrow-off">Agent</TableHead>
          <TableHead>Status</TableHead>
          <TableHead kind="number" className="mock-narrow-off">
            Started
          </TableHead>
          <TableHead kind="number">Took</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {runs.map((run) => (
          <TableRow key={run.id}>
            <TableCell kind="id" className="text-instrument text-muted-foreground">
              {run.id}
            </TableCell>
            <TableCell className="mock-task whitespace-normal">
              <span className="mock-id">{run.task}</span> {run.title}
            </TableCell>
            <TableCell className="mock-narrow-off">
              <span className="mock-ship">
                <ShipMark ship={run.ship} size={16} />
                {shipLabel(run.ship)}
              </span>
            </TableCell>
            <TableCell className="mock-narrow-off text-muted-foreground">{run.agent}</TableCell>
            <TableCell>
              <Badge variant={run.state} />
            </TableCell>
            <TableCell kind="number" className="mock-narrow-off text-instrument text-muted-foreground">
              {run.started}
            </TableCell>
            <TableCell kind="number" className="text-instrument text-muted-foreground">
              {run.took}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </DataTable>
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
    <div className="mock-section" aria-busy={loading}>
      <RunsTable runs={shown} />
      {loading && <LoadingState rows={earlierRuns.length} label="Loading earlier runs" />}
      <div className="mt-5">
        {more ? (
          <Button variant="outline" onClick={load} disabled={loading}>
            {loading ? "Loading earlier runs" : "Show earlier runs"}
          </Button>
        ) : (
          <Notice>
            <NoticeTitle>That is every run from today.</NoticeTitle>
          </Notice>
        )}
      </div>
    </div>
  );
}

const shipItems = ships.map((ship) => ({ value: ship, label: shipLabel(ship) }));
const checkNames = ["Type-check", "Unit tests", "Screenshots"] as const;
const fresh = {
  query: "select listbox",
  ship: "orbit",
  branch: "Fix Select Loop",
  notes: "",
  checks: ["Type-check", "Unit tests"] as readonly string[],
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
      ? "A run needs a branch."
      : branchShape.test(branch)
        ? null
        : "Use lowercase letters, numbers, dashes and slashes, like fix/select-loop.";
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
      description: `${shipLabel(ship ?? "orbit")} runs it on ${branch} when an agent is free.`,
    });
    setNextRun((run) => run + 1);
  };

  const discard = () => {
    setQuery("");
    setShip(fresh.ship);
    setBranch("");
    setNotes("");
    setChecks(fresh.checks);
    toast.add({ title: "Draft discarded", description: "The form is empty again." });
  };

  return (
    <FormSection className="max-w-[640px]" aria-labelledby="schedule" onSubmit={schedule} noValidate>
      <FormSectionFields className="grid grid-cols-2 gap-6 [@media(max-width:600px)]:grid-cols-1">
        <Field className="mock-wide">
          <FieldLabel htmlFor="run-task">Task</FieldLabel>
          <InputGroup>
            <InputGroupAddon>
              <Icon name="search" />
            </InputGroupAddon>
            <InputGroupInput
              ref={queryRef}
              id="run-task"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Find a task by ID or title"
              autoComplete="off"
            />
            {query && (
              <InputGroupAddon align="inline-end">
                <InputGroupButton
                  size="icon-xs"
                  aria-label="Clear the task"
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
        </Field>

        <Field>
          <FieldLabel htmlFor="run-ship">Ship</FieldLabel>
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
        </Field>

        <Field>
          <FieldLabel htmlFor="run-branch">Branch</FieldLabel>
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
          {branchError && <FieldError id="run-branch-error">{branchError}</FieldError>}
        </Field>

        <Field>
          <FieldLabel htmlFor="run-agent">Agent</FieldLabel>
          <Input id="run-agent" defaultValue="Picked by the queue" disabled aria-describedby="run-agent-hint" />
          <FieldDescription id="run-agent-hint">The queue hands the run to the first free agent.</FieldDescription>
        </Field>

        <FieldSet className="gap-3">
          <FieldLegend variant="label">Checks before merge</FieldLegend>
          <FieldLabel>
            <Checkbox checked={all} indeterminate={some} onCheckedChange={(on) => setChecks(on ? checkNames : [])} />
            Every check
          </FieldLabel>
          <div className="flex flex-col gap-3 pl-[26px]">
            {checkNames.map((name) => (
              <FieldLabel key={name}>
                <Checkbox
                  checked={checks.includes(name)}
                  onCheckedChange={(on) =>
                    setChecks((list) => (on ? [...list, name] : list.filter((entry) => entry !== name)))
                  }
                />
                {name}
              </FieldLabel>
            ))}
          </div>
        </FieldSet>

        <Field className="mock-wide">
          <FieldLabel htmlFor="run-notes">Notes for the agent</FieldLabel>
          <Textarea
            id="run-notes"
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            placeholder="What should it know before it starts?"
          />
        </Field>
      </FormSectionFields>
      <FormSectionFooter className="justify-between">
        <Dialog>
          <DialogTrigger render={<Button variant="destructive" />}>Discard draft</DialogTrigger>
          <DialogContent showCloseButton={false}>
            <DialogHeader>
              <DialogTitle>Discard this draft?</DialogTitle>
              <DialogDescription>
                The task, branch and notes you entered are cleared. Runs already scheduled keep going.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <DialogClose render={<Button variant="outline" />}>Keep editing</DialogClose>
              <DialogClose render={<Button variant="destructive" />} onClick={discard}>
                Discard draft
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        <Button type="submit">Schedule run</Button>
      </FormSectionFooter>
    </FormSection>
  );
}

const parallel = ["1", "2", "3", "4"].map((count) => ({ value: count, label: count }));

function SettingsForm() {
  const [saved, setSaved] = useState(false);
  const save = (event: FormEvent) => {
    event.preventDefault();
    setSaved(true);
    toast.add({ type: "success", title: "Settings saved", description: "New runs use them from now on." });
  };

  return (
    <FormSection className="max-w-[640px]" onSubmit={save} onChange={() => setSaved(false)}>
      <FormSectionHeader>
        <FormSectionTitle>Run settings</FormSectionTitle>
      </FormSectionHeader>
      <FormSectionFields className="grid grid-cols-2 gap-6 [@media(max-width:600px)]:grid-cols-1">
        <Field>
          <FieldLabel htmlFor="set-parallel">Runs at once</FieldLabel>
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
        </Field>
        <Field>
          <FieldLabel htmlFor="set-prefix">Branch prefix</FieldLabel>
          <Input id="set-prefix" defaultValue="agent/" autoComplete="off" spellCheck={false} />
        </Field>
        <Field className="mock-wide">
          <FieldLabel>
            <Checkbox defaultChecked />
            Tell me when a run fails
          </FieldLabel>
        </Field>
      </FormSectionFields>
      <FormSectionFooter>
        <FormSectionStatus>{saved ? "Saved for new runs" : "Changes apply to new runs"}</FormSectionStatus>
        <Button type="submit">Save settings</Button>
      </FormSectionFooter>
    </FormSection>
  );
}
