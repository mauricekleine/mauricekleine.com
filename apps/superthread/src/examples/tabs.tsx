import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/superthread/ui/tabs";

export function TabsExample() {
  return (
    <Tabs defaultValue="overview">
      <TabsList>
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="runs">Runs</TabsTrigger>
        <TabsTrigger value="settings">Settings</TabsTrigger>
      </TabsList>
      <TabsContent value="overview" className="st-b-panel">
        129 runs this week across four ships.
      </TabsContent>
      <TabsContent value="runs" className="st-b-panel">
        The last run finished 4 minutes ago, on Orbit.
      </TabsContent>
      <TabsContent value="settings" className="st-b-panel">
        Runs keep their logs for 30 days.
      </TabsContent>
    </Tabs>
  );
}

// Printed states on one list: runs printed under the pointer, settings printed with keyboard focus, and a disabled
// tab. The printed tabs stay out of the tab order.
export function TabsStates() {
  return (
    <Tabs defaultValue="overview">
      <TabsList aria-label="Tab states">
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="runs" data-demo="hover" tabIndex={-1}>
          Runs
        </TabsTrigger>
        <TabsTrigger value="settings" data-demo="focus-visible" tabIndex={-1}>
          Settings
        </TabsTrigger>
        <TabsTrigger value="archive" disabled>
          Archive
        </TabsTrigger>
      </TabsList>
      <p className="st-b-note st-b-legend">
        <span>Overview: current</span>
        <span>Runs: hover</span>
        <span>Settings: focus</span>
        <span>Archive: disabled</span>
      </p>
    </Tabs>
  );
}

// The line list draws no rule of its own: the bar lands on the rule the page already draws under it.
export function TabsLine() {
  return (
    <div className="st-b-onrule">
      <Tabs defaultValue="board">
        <TabsList variant="line">
          <TabsTrigger value="board">Board</TabsTrigger>
          <TabsTrigger value="list">List</TabsTrigger>
          <TabsTrigger value="chart">Chart</TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  );
}
