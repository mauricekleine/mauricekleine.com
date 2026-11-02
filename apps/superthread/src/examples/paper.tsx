import { AppShellPanel } from "@/components/superthread/blocks/app-shell";
import { PageHeader, PageHeaderTitle } from "@/components/superthread/blocks/page-header";
import { Button } from "@/components/superthread/ui/button";
import { Paper } from "@/components/superthread/ui/paper";

// One job on one white block: the gap before the next fixed point, what to do and the step that starts it.
export function PaperExample() {
  return (
    <Paper render={<section aria-label="the next job" />} className="st-paper">
      <p className="type-instrument text-muted-foreground">48 min until standup</p>
      <h2 className="type-title text-first">reply to sam about chapter 7</h2>
      <p>the notes came in this morning, and the next draft waits on your answer.</p>
      <div className="st-paper-actions">
        <Button>read the draft</Button>
        <Button variant="ghost">not now</Button>
      </div>
    </Paper>
  );
}

// The same block where a ship prints it: on the working panel, under the page's own words.
export function PaperInPanel() {
  return (
    <AppShellPanel className="st-paper-panel">
      <PageHeader>
        <PageHeaderTitle>now</PageHeaderTitle>
      </PageHeader>
      <PaperExample />
    </AppShellPanel>
  );
}
