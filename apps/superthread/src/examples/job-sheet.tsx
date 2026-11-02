import { useId, useState } from "react";
import { AppShellPanel } from "@/components/superthread/blocks/app-shell";
import {
  JobSheet,
  JobSheetActions,
  JobSheetChanged,
  JobSheetCue,
  JobSheetPrimary,
  JobSheetTitle,
  JobSheetToggle,
  JobSheetWhy,
} from "@/components/superthread/blocks/job-sheet";
import { Button } from "@/components/superthread/ui/button";
import { DayLineExample } from "@/examples/day-line";
import { LONG_TITLE, MEDIAN_TITLE, SHORT_TITLE } from "@/examples/fit-title";

// The panel a ship prints it on, under the day line, so the sheet's y shows.
function OnPanel({ children }: { children: React.ReactNode }) {
  return (
    <AppShellPanel>
      <DayLineExample />
      {children}
    </AppShellPanel>
  );
}

function SlipToggle() {
  const [pressed, setPressed] = useState(false);
  return (
    <JobSheetToggle pressed={pressed} onPressedChange={setPressed}>
      only what can&rsquo;t slip
    </JobSheetToggle>
  );
}

// The job: the gap before the next fixed point, what to do, why, and the step that starts it.
export function JobSheetJob({ title = SHORT_TITLE }: { title?: string }) {
  const id = useId();
  return (
    <JobSheet aria-labelledby={id}>
      <JobSheetCue>48 min until standup</JobSheetCue>
      <JobSheetTitle id={id} render={<h2 />} href="#example">
        {title}
      </JobSheetTitle>
      <JobSheetWhy>sam&rsquo;s notes came in this morning, and the next draft waits on your answer.</JobSheetWhy>
      <JobSheetChanged />
      <JobSheetActions>
        <JobSheetPrimary reserve="open the draft" render={<a href="#example" />} nativeButton={false}>
          read the draft
        </JobSheetPrimary>
        <Button size="lg" variant="ghost">
          not now
        </Button>
        <SlipToggle />
      </JobSheetActions>
    </JobSheet>
  );
}

// Twenty minutes before a meeting: the cue is a fact, and the quiet line says what moved since the sheet was picked.
export function JobSheetMeeting() {
  const id = useId();
  return (
    <JobSheet aria-labelledby={id}>
      <JobSheetCue>11:00 to 11:45 · teams</JobSheetCue>
      <JobSheetTitle id={id} render={<h2 />}>
        renewal call
      </JobSheetTitle>
      <JobSheetWhy>the brief is ready, and sam leads.</JobSheetWhy>
      <JobSheetChanged>sam sent the new numbers an hour ago</JobSheetChanged>
      <JobSheetActions>
        <JobSheetPrimary render={<a href="#states" />} nativeButton={false}>
          read the brief
        </JobSheetPrimary>
        <Button size="lg" variant="ghost">
          join
        </Button>
      </JobSheetActions>
    </JobSheet>
  );
}

// In the meeting the sheet presses nothing, so its primary prints as an outline, and every slot stays where it was.
export function JobSheetInMeeting() {
  const id = useId();
  return (
    <JobSheet aria-labelledby={id}>
      <JobSheetCue>until 11:45</JobSheetCue>
      <JobSheetTitle id={id} render={<h2 />}>
        renewal call
      </JobSheetTitle>
      <JobSheetChanged />
      <JobSheetActions>
        <JobSheetPrimary variant="outline">read the brief</JobSheetPrimary>
      </JobSheetActions>
    </JobSheet>
  );
}

export function JobSheetExample() {
  return (
    <OnPanel>
      <JobSheetJob />
    </OnPanel>
  );
}

export function JobSheetStates() {
  return (
    <div className="st-job-sheet-stack">
      <OnPanel>
        <JobSheetMeeting />
      </OnPanel>
      <OnPanel>
        <JobSheetInMeeting />
      </OnPanel>
    </div>
  );
}

export function JobSheetTitles() {
  return (
    <div className="st-job-sheet-stack">
      <OnPanel>
        <JobSheetJob title={MEDIAN_TITLE} />
      </OnPanel>
      <OnPanel>
        <JobSheetJob title={LONG_TITLE} />
      </OnPanel>
    </div>
  );
}
