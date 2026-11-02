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
import { ClearState, ClearStateDoor, ClearStateReason, ClearStateTitle } from "@/components/superthread/blocks/states";
import { Button } from "@/components/superthread/ui/button";
import { DayLineExample } from "@/examples/day-line";
import { LONG_TITLE, MEDIAN_TITLE, SHORT_TITLE } from "@/examples/fit-title";
import { WrongLine } from "@/examples/inline-answers";

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
export function JobSheetJob({ title = SHORT_TITLE, open, asked }: { title?: string; open?: boolean; asked?: boolean }) {
  const id = useId();
  return (
    <JobSheet aria-labelledby={id}>
      <JobSheetCue>48 min until standup</JobSheetCue>
      <JobSheetTitle id={id} render={<h2 />} href="#example">
        {title}
      </JobSheetTitle>
      <JobSheetWhy>
        <WrongLine key={title} open={open} asked={asked} />
      </JobSheetWhy>
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

// Near a meeting the job is getting ready, and the quiet line says what moved since the sheet was picked.
export function JobSheetMeeting() {
  const id = useId();
  return (
    <JobSheet aria-labelledby={id}>
      <JobSheetCue>20 min until the renewal call</JobSheetCue>
      <JobSheetTitle id={id} render={<h2 />}>
        read the brief for the renewal call
      </JobSheetTitle>
      <JobSheetWhy>the brief is ready, and sam leads.</JobSheetWhy>
      <JobSheetChanged>sam sent the new numbers an hour ago</JobSheetChanged>
      <JobSheetActions>
        <JobSheetPrimary render={<a href="#states" />} nativeButton={false}>
          read the brief
        </JobSheetPrimary>
        <Button size="lg" variant="ghost">
          not now
        </Button>
      </JobSheetActions>
    </JobSheet>
  );
}

// In the meeting the cue is a fact and the sheet presses nothing, so its primary prints as an outline, and every slot
// stays where it was with the why gone.
export function JobSheetInMeeting() {
  const id = useId();
  return (
    <JobSheet aria-labelledby={id}>
      <JobSheetCue>
        <time>11:00</time> to <time>11:45</time> · teams
      </JobSheetCue>
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

// The answers open in the why's slot, and the question after them, with the job's other slots where they were.
export function JobSheetAnswers() {
  return (
    <div className="st-job-sheet-stack">
      <OnPanel>
        <JobSheetJob open />
      </OnPanel>
      <OnPanel>
        <JobSheetJob open asked />
      </OnPanel>
    </div>
  );
}

// Nothing is left, so the sheet goes. The sentence takes its box, and the reason and the door land on the why and the
// primary.
export function ClearStateExample() {
  const id = useId();
  return (
    <OnPanel>
      <ClearState aria-labelledby={id}>
        <ClearStateTitle id={id} render={<h2 />}>
          nothing needs you until 16:30.
        </ClearStateTitle>
        <ClearStateReason>the draft, the deck check and the renewal brief are done.</ClearStateReason>
        <ClearStateDoor href="#clear">the rest is in open</ClearStateDoor>
      </ClearState>
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
