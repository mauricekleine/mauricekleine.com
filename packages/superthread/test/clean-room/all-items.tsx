// The kitchen sink: every brand item, once in .light and once in .dark. Clean-room step 8 copies
// this file to the fixture's src/routes/all.tsx, and the fixture's build is its only type-check.
// It uses only shadcn's own API for each item, which the skins keep.
// Layers (the dialog, the select popup, toasts) open from in-flow triggers. Their portals render
// only on the client, outside the section, so they take the mode of the document they portal into,
// as in any shadcn app with the mode class on <html>: add .dark to <body> to see them dark.
import { type ReactNode, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { fleet } from "@/components/superthread/lib/fleet";
import { cn } from "@/components/superthread/lib/utils";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/superthread/ui/accordion";
import {
  Breadcrumb,
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/superthread/ui/breadcrumb";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSeparator,
  FieldSet,
  FieldTitle,
} from "@/components/superthread/ui/field";
import { NativeSelect, NativeSelectOptGroup, NativeSelectOption } from "@/components/superthread/ui/native-select";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/superthread/ui/resizable";
import { Badge } from "@/components/superthread/ui/badge";
import { Button } from "@/components/superthread/ui/button";
import { ButtonGroup, ButtonGroupSeparator, ButtonGroupText } from "@/components/superthread/ui/button-group";
import { Kbd, KbdGroup } from "@/components/superthread/ui/kbd";
import { RadioGroup, RadioGroupItem } from "@/components/superthread/ui/radio-group";
import { Slider } from "@/components/superthread/ui/slider";
import { Toggle } from "@/components/superthread/ui/toggle";
import { ToggleGroup, ToggleGroupItem } from "@/components/superthread/ui/toggle-group";
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
import { FleetRail } from "@/components/superthread/ui/fleet-rail";
import { Icon, type IconName, StatusGlyph, type StatusState } from "@/components/superthread/ui/glyphs";
import { Input } from "@/components/superthread/ui/input";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
  InputGroupText,
  InputGroupTextarea,
} from "@/components/superthread/ui/input-group";
import { Label } from "@/components/superthread/ui/label";
import { Progress, ProgressLabel, ProgressValue } from "@/components/superthread/ui/progress";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/superthread/ui/select";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
} from "@/components/superthread/ui/sidebar";
import { Skeleton } from "@/components/superthread/ui/skeleton";
import { Switch } from "@/components/superthread/ui/switch";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/superthread/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/superthread/ui/tabs";
import { createToastManager, Toaster } from "@/components/superthread/ui/toast";
import { Textarea } from "@/components/superthread/ui/textarea";

export const Route = createFileRoute("/all")({ component: AllItems });

type Mode = "light" | "dark";

const ICONS: IconName[] = [
  "arrow",
  "left",
  "copy",
  "check",
  "chevron",
  "search",
  "close",
  "trash",
  "plus",
  "tick",
  "i",
  "pause",
  "cross",
  "dash",
  "bang",
];
const STATES: StatusState[] = ["done", "running", "waiting", "failed", "queued"];
const VARIANTS = ["default", "outline", "secondary", "ghost", "destructive", "link"] as const;
const BADGES = ["default", "secondary", "destructive", "outline", "ghost", "link"] as const;
const SIZES = ["xs", "sm", "default", "lg"] as const;

// Synthetic rows for the table.
const RUNS = [
  { id: "run-0412", ship: "orbit", state: "done", took: "41 s" },
  { id: "run-0413", ship: "quanta", state: "running", took: "12 s" },
  { id: "run-0414", ship: "trisys", state: "waiting", took: "-" },
  { id: "run-0415", ship: "constellation", state: "failed", took: "3 s" },
] as const;

function AllItems() {
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

      <Part name="glyphs">
        <div className="flex flex-wrap items-center gap-4">
          {ICONS.map((name) => (
            <Icon key={name} name={name} aria-label={name} />
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-4">
          {STATES.map((state) => (
            <StatusGlyph key={state} state={state} aria-label={state} />
          ))}
        </div>
      </Part>

      <Part name="button">
        <div className="flex flex-wrap items-center gap-3">
          {VARIANTS.map((variant) => (
            <Button key={variant} variant={variant}>
              {variant}
            </Button>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {SIZES.map((size) => (
            <Button key={size} size={size}>
              size {size}
            </Button>
          ))}
          <Button size="icon" aria-label="add">
            <Icon name="plus" />
          </Button>
          <Button variant="outline">
            <Icon name="copy" data-icon="inline-start" />
            copy
          </Button>
          <Button disabled>disabled</Button>
        </div>
      </Part>

      <Part name="badge">
        <div className="flex flex-wrap items-center gap-3">
          {BADGES.map((variant) => (
            <Badge key={variant} variant={variant}>
              {variant}
            </Badge>
          ))}
        </div>
      </Part>

      <Part name="input">
        <div className="grid max-w-md gap-3">
          <Input placeholder="a ship name" />
          <Input defaultValue="orbit" />
          <Input defaultValue="no such ship" aria-invalid />
          <Input placeholder="disabled" disabled />
        </div>
      </Part>

      <Part name="input-group">
        <div className="grid max-w-md gap-3">
          <InputGroup>
            <InputGroupAddon>
              <Icon name="search" />
            </InputGroupAddon>
            <InputGroupInput placeholder="search the fleet" />
            <InputGroupAddon align="inline-end">
              <InputGroupButton>go</InputGroupButton>
            </InputGroupAddon>
          </InputGroup>
          <InputGroup>
            <InputGroupAddon>
              <InputGroupText>run-</InputGroupText>
            </InputGroupAddon>
            <InputGroupInput defaultValue="0000" aria-invalid />
          </InputGroup>
          <InputGroup>
            <InputGroupTextarea placeholder="a note for the run" />
            <InputGroupAddon align="block-end">
              <InputGroupText>0 / 280</InputGroupText>
            </InputGroupAddon>
          </InputGroup>
        </div>
      </Part>

      <Part name="textarea">
        <div className="grid max-w-md gap-3">
          <Textarea placeholder="what changed" />
          <Textarea defaultValue="too short" aria-invalid />
        </div>
      </Part>

      <Part name="select">
        <Select defaultValue="orbit">
          <SelectTrigger className="w-56" aria-label="ship">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>ships</SelectLabel>
              {fleet.map((ship) => (
                <SelectItem key={ship.id} value={ship.id}>
                  {ship.name}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </Part>

      <Part name="checkbox">
        <div className="flex flex-wrap items-center gap-6">
          <div className="flex items-center gap-2">
            <Checkbox id={`${mode}-ship-a`} />
            <Label htmlFor={`${mode}-ship-a`}>unchecked</Label>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox id={`${mode}-ship-b`} defaultChecked />
            <Label htmlFor={`${mode}-ship-b`}>checked</Label>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox id={`${mode}-ship-c`} disabled />
            <Label htmlFor={`${mode}-ship-c`}>disabled</Label>
          </div>
        </div>
      </Part>

      <Part name="tabs">
        <Tabs defaultValue="runs">
          <TabsList>
            <TabsTrigger value="runs">runs</TabsTrigger>
            <TabsTrigger value="logs">logs</TabsTrigger>
            <TabsTrigger value="settings">settings</TabsTrigger>
          </TabsList>
          <TabsContent value="runs">four runs this hour</TabsContent>
          <TabsContent value="logs">no new lines</TabsContent>
          <TabsContent value="settings">nothing to set</TabsContent>
        </Tabs>
        <Tabs defaultValue="day">
          <TabsList variant="line">
            <TabsTrigger value="day">day</TabsTrigger>
            <TabsTrigger value="week">week</TabsTrigger>
          </TabsList>
        </Tabs>
      </Part>

      <Part name="table">
        <Table>
          <TableCaption>the last four runs</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>run</TableHead>
              <TableHead>ship</TableHead>
              <TableHead>state</TableHead>
              <TableHead className="text-right">took</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {RUNS.map((run) => (
              <TableRow key={run.id}>
                <TableCell>{run.id}</TableCell>
                <TableCell>{run.ship}</TableCell>
                <TableCell>
                  <span className="inline-flex items-center gap-2">
                    <StatusGlyph state={run.state} />
                    {run.state}
                  </span>
                </TableCell>
                <TableCell className="text-right">{run.took}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Part>

      <Part name="progress">
        <div className="grid max-w-md gap-6">
          <Progress value={62}>
            <ProgressLabel>upload</ProgressLabel>
            <ProgressValue />
          </Progress>
          <Progress value={null}>
            <ProgressLabel>waiting for a slot</ProgressLabel>
          </Progress>
        </div>
      </Part>

      <Part name="skeleton">
        <div className="flex items-center gap-4">
          <Skeleton className="size-10" />
          <div className="grid gap-2">
            <Skeleton className="h-4 w-56" />
            <Skeleton className="h-4 w-40" />
          </div>
        </div>
      </Part>

      <Part name="dialog">
        <div>
          <Dialog>
            <DialogTrigger render={<Button variant="outline" />}>rename the ship</DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>rename the ship</DialogTitle>
                <DialogDescription>the new name shows in the rail and in every run.</DialogDescription>
              </DialogHeader>
              <Input defaultValue="orbit" aria-label="name" />
              <DialogFooter>
                <DialogClose render={<Button variant="outline" />}>cancel</DialogClose>
                <DialogClose render={<Button />}>save</DialogClose>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </Part>

      <Part name="toast">
        <ToastSink mode={mode} />
      </Part>

      <Part name="sidebar">
        <Contained>
          <SidebarProvider className="h-full min-h-0">
            <Sidebar collapsible="none">
              <SidebarHeader>orbit</SidebarHeader>
              <SidebarContent>
                <SidebarGroup>
                  <SidebarGroupLabel>runs</SidebarGroupLabel>
                  <SidebarMenu>
                    {RUNS.map((run, index) => (
                      <SidebarMenuItem key={run.id}>
                        <SidebarMenuButton isActive={index === 0}>
                          <StatusGlyph state={run.state} />
                          <span>{run.id}</span>
                        </SidebarMenuButton>
                        <SidebarMenuBadge>{run.took}</SidebarMenuBadge>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroup>
              </SidebarContent>
            </Sidebar>
            <SidebarInset className="p-6">the run's page</SidebarInset>
          </SidebarProvider>
        </Contained>
      </Part>

      <Part name="fleet-rail">
        <Contained>
          <FleetRail current="orbit">
            <div className="p-6">orbit, the current ship</div>
          </FleetRail>
        </Contained>
        <Contained>
          <FleetRail
            current="quanta"
            sidebar={
              <SidebarContent>
                <SidebarGroup>
                  <SidebarGroupLabel>quanta</SidebarGroupLabel>
                  <SidebarMenu>
                    <SidebarMenuItem>
                      <SidebarMenuButton isActive>overview</SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton>runs</SidebarMenuButton>
                    </SidebarMenuItem>
                  </SidebarMenu>
                </SidebarGroup>
              </SidebarContent>
            }
          >
            <div className="p-6">quanta, with its own sidebar</div>
          </FleetRail>
        </Contained>
      </Part>

      {/* 2.0: controls */}
      <Part name="switch">
        <div className="flex flex-wrap items-center gap-6">
          <Switch aria-label="off" />
          <Switch aria-label="on" defaultChecked />
          <Switch aria-label="small" size="sm" defaultChecked />
          <Switch aria-label="disabled" disabled defaultChecked />
          <Switch aria-label="invalid" aria-invalid />
        </div>
      </Part>

      <Part name="radio-group">
        <RadioGroup defaultValue="orbit" aria-label="ship">
          <label className="flex items-center gap-3">
            <RadioGroupItem value="orbit" />
            orbit
          </label>
          <label className="flex items-center gap-3">
            <RadioGroupItem value="quanta" />
            quanta
          </label>
          <label className="flex items-center gap-3">
            <RadioGroupItem value="locked" disabled />
            unavailable
          </label>
        </RadioGroup>
        <RadioGroup defaultValue="locked" disabled aria-label="locked ship">
          <RadioGroupItem value="locked" aria-label="locked" />
        </RadioGroup>
      </Part>

      <Part name="slider">
        <div className="grid max-w-md gap-6">
          <Slider defaultValue={[40]} aria-label="volume" />
          <Slider defaultValue={[20, 80]} aria-label="range" />
          <Slider defaultValue={[40]} disabled aria-label="locked volume" />
          <Slider defaultValue={[40]} orientation="vertical" className="h-40" aria-label="vertical volume" />
        </div>
      </Part>

      <Part name="toggle">
        <div className="flex flex-wrap items-center gap-3">
          <Toggle>off</Toggle>
          <Toggle defaultPressed>on</Toggle>
          <Toggle variant="outline" size="sm">
            small
          </Toggle>
          <Toggle variant="outline" size="lg" defaultPressed>
            large
          </Toggle>
          <Toggle variant="outline" disabled>
            disabled
          </Toggle>
        </div>
      </Part>

      <Part name="toggle-group">
        <ToggleGroup variant="outline" defaultValue={["day"]} aria-label="period">
          <ToggleGroupItem value="day">day</ToggleGroupItem>
          <ToggleGroupItem value="week">week</ToggleGroupItem>
        </ToggleGroup>
        <ToggleGroup variant="outline" spacing={3} size="sm" aria-label="view">
          <ToggleGroupItem value="list">list</ToggleGroupItem>
          <ToggleGroupItem value="grid">grid</ToggleGroupItem>
        </ToggleGroup>
        <ToggleGroup variant="outline" orientation="vertical" defaultValue={["runs"]} aria-label="section">
          <ToggleGroupItem value="runs">runs</ToggleGroupItem>
          <ToggleGroupItem value="logs">logs</ToggleGroupItem>
        </ToggleGroup>
      </Part>

      <Part name="button-group">
        <ButtonGroup aria-label="run actions">
          <ButtonGroupText>run</ButtonGroupText>
          <Button variant="outline">start</Button>
          <ButtonGroupSeparator />
          <Button variant="outline">stop</Button>
        </ButtonGroup>
        <ButtonGroup orientation="vertical" aria-label="log actions">
          <Button variant="outline">copy</Button>
          <Button variant="outline">download</Button>
        </ButtonGroup>
      </Part>

      <Part name="kbd">
        <KbdGroup>
          <Kbd>ctrl</Kbd>
          <Kbd>k</Kbd>
        </KbdGroup>
      </Part>

      {/* 2.0: layers */}

      {/* 2.0: forms */}
      <Part name="field">
        <FieldSet className="max-w-md">
          <FieldLegend>notifications</FieldLegend>
          <FieldGroup>
            <Field data-invalid="true">
              <FieldLabel htmlFor={`field-email-${mode}`}>email</FieldLabel>
              <Input
                id={`field-email-${mode}`}
                defaultValue="maurice"
                aria-invalid
                aria-describedby={`field-error-${mode}`}
              />
              <FieldDescription>
                read the <a href="#preferences">preferences</a> before saving.
              </FieldDescription>
              <FieldError
                id={`field-error-${mode}`}
                errors={[{ message: "enter a complete email address" }, { message: "use your work address" }]}
              />
            </Field>
            <FieldSeparator>or</FieldSeparator>
            <FieldLabel>
              <Field orientation="horizontal">
                <Checkbox defaultChecked />
                <FieldContent>
                  <FieldTitle>send updates</FieldTitle>
                  <FieldDescription>a weekly digest of completed runs.</FieldDescription>
                </FieldContent>
              </Field>
            </FieldLabel>
          </FieldGroup>
        </FieldSet>
      </Part>
      <Part name="native-select">
        <div className="flex flex-wrap gap-4">
          <NativeSelect aria-label="ship" defaultValue="orbit">
            <NativeSelectOptGroup label="ships">
              <NativeSelectOption value="orbit">orbit</NativeSelectOption>
              <NativeSelectOption value="quanta">quanta</NativeSelectOption>
            </NativeSelectOptGroup>
          </NativeSelect>
          <NativeSelect aria-label="small ship" size="sm">
            <NativeSelectOption>orbit</NativeSelectOption>
          </NativeSelect>
          <NativeSelect aria-label="invalid ship" aria-invalid>
            <NativeSelectOption>choose a ship</NativeSelectOption>
          </NativeSelect>
          <NativeSelect aria-label="locked ship" disabled>
            <NativeSelectOption>orbit</NativeSelectOption>
          </NativeSelect>
        </div>
      </Part>
      <Part name="accordion">
        <Accordion defaultValue={["details"]} className="max-w-md">
          <AccordionItem value="details">
            <AccordionTrigger>run details</AccordionTrigger>
            <AccordionContent>
              read the <a href="#run">run log</a> for the full output.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="history">
            <AccordionTrigger>history</AccordionTrigger>
            <AccordionContent>no earlier runs.</AccordionContent>
          </AccordionItem>
          <AccordionItem value="locked" disabled>
            <AccordionTrigger>locked run</AccordionTrigger>
            <AccordionContent>unavailable.</AccordionContent>
          </AccordionItem>
        </Accordion>
      </Part>
      <Part name="breadcrumb">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="#home">home</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbEllipsis />
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>runs</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </Part>
      <Part name="resizable">
        <div className="h-48 max-w-lg border border-border">
          <ResizablePanelGroup>
            <ResizablePanel defaultSize="40%">
              <div className="p-4">runs</div>
            </ResizablePanel>
            <ResizableHandle withHandle />
            <ResizablePanel defaultSize="60%">
              <ResizablePanelGroup orientation="vertical">
                <ResizablePanel defaultSize="50%">
                  <div className="p-4">output</div>
                </ResizablePanel>
                <ResizableHandle />
                <ResizablePanel defaultSize="50%">
                  <div className="p-4">details</div>
                </ResizablePanel>
              </ResizablePanelGroup>
            </ResizablePanel>
          </ResizablePanelGroup>
        </div>
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

// A box that holds a sidebar's fixed parts: the transform makes it their containing block.
function Contained({ children }: { children: ReactNode }) {
  return <div className="relative h-96 transform-gpu overflow-hidden border border-border">{children}</div>;
}

// Each section has its own manager, so a toast opens only in the viewport its button belongs to.
function ToastSink({ mode }: { mode: Mode }) {
  const [manager] = useState(() => createToastManager());
  return (
    <Toaster toastManager={manager}>
      <div className="flex flex-wrap gap-3">
        <Button
          variant="outline"
          onClick={() => manager.add({ title: "deployed", description: `orbit is live (${mode})`, type: "success" })}
        >
          a success toast
        </Button>
        <Button
          variant="outline"
          onClick={() => manager.add({ title: "the run failed", description: "run-0415 exited 1", type: "error" })}
        >
          an error toast
        </Button>
        <Button variant="outline" onClick={() => manager.add({ title: "queued", description: "two runs ahead" })}>
          a plain toast
        </Button>
      </div>
    </Toaster>
  );
}
