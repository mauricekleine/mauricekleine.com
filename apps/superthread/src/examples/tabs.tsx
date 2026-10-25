import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/superthread/ui/tabs";

export function TabsExample() {
  return (
    <Tabs defaultValue="overview">
      <TabsList>
        <TabsTrigger value="overview">overview</TabsTrigger>
        <TabsTrigger value="runs">runs</TabsTrigger>
        <TabsTrigger value="settings">settings</TabsTrigger>
      </TabsList>
      <TabsContent value="overview" className="st-b-panel">
        129 runs this week across four ships.
      </TabsContent>
      <TabsContent value="runs" className="st-b-panel">
        the last run finished 4 minutes ago, on orbit.
      </TabsContent>
      <TabsContent value="settings" className="st-b-panel">
        runs keep their logs for 30 days.
      </TabsContent>
    </Tabs>
  );
}

// Printed states on one list: runs printed under the pointer, settings printed with keyboard focus, and a disabled
// tab. The printed tabs stay out of the tab order.
export function TabsStates() {
  return (
    <Tabs defaultValue="overview">
      <TabsList aria-label="tab states">
        <TabsTrigger value="overview">overview</TabsTrigger>
        <TabsTrigger value="runs" data-demo="hover" tabIndex={-1}>
          runs
        </TabsTrigger>
        <TabsTrigger value="settings" data-demo="focus-visible" tabIndex={-1}>
          settings
        </TabsTrigger>
        <TabsTrigger value="archive" disabled>
          archive
        </TabsTrigger>
      </TabsList>
      <p className="st-b-note st-b-legend">
        <span>overview: current</span>
        <span>runs: hover</span>
        <span>settings: focus</span>
        <span>archive: disabled</span>
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
          <TabsTrigger value="board">board</TabsTrigger>
          <TabsTrigger value="list">list</TabsTrigger>
          <TabsTrigger value="chart">chart</TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  );
}
