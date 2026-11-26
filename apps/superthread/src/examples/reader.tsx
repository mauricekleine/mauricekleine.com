import { useId, useState } from "react";
import { AppShellPanel } from "@/components/superthread/blocks/app-shell";
import { DayLine, type DayLineEvent, DayLineStrip } from "@/components/superthread/blocks/day-line";
import { MonthGrid } from "@/components/superthread/blocks/month-grid";
import {
  Reader,
  ReaderBlock,
  ReaderBlocks,
  ReaderBlockTitle,
  ReaderBody,
  ReaderEnd,
  ReaderFoot,
  ReaderGap,
  ReaderHead,
  ReaderLead,
  ReaderLine,
  ReaderNext,
  ReaderNextText,
  ReaderOwed,
  ReaderOwedRow,
  ReaderPaper,
  ReaderPerson,
  ReaderRail,
  ReaderRaised,
  ReaderSection,
  ReaderSectionTitle,
  ReaderText,
  ReaderWho,
  ReaderWide,
} from "@/components/superthread/blocks/reader";
import { Button } from "@/components/superthread/ui/button";
import { Onward } from "@/components/superthread/ui/onward";
import { SourceLine, SourceLineItem } from "@/components/superthread/ui/source-line";

// A fixed day, clock and zone, so the page prints the same strip whenever it's built and wherever it's read.
const day = "2026-11-03";
const timeZone = "Europe/Amsterdam";
const clock = (time: string) => `${day}T${time}:00+01:00`;

function meeting(id: string, title: string, start: string, end: string, more?: Partial<DayLineEvent>): DayLineEvent {
  return { id, title, start: clock(start), end: clock(end), ...more };
}

const tuesday = [
  meeting("standup", "Team standup", "09:30", "10:00", { href: "#example" }),
  meeting("sam", "1:1 with Sam", "14:00", "14:30", { href: "#example" }),
  meeting("kickoff", "Project kickoff", "16:30", "17:30", { href: "#a-meeting-brief", brief: true }),
];

// A brief every weekday this month so far, and the one before it.
const briefs = ["2026-10-26", "2026-10-27", "2026-10-28", "2026-10-29", "2026-10-30", "2026-11-02", day];

// What the margin holds for a page of briefs: the month, in the rail's 248 px.
function Rail() {
  const [month, setMonth] = useState("2026-11");
  return (
    <ReaderRail>
      <MonthGrid
        aria-label="Briefs by month"
        days={briefs.map((date) => ({ date, label: "Read the brief", selected: date === day, href: "#example" }))}
        max="2026-11"
        min="2026-10"
        month={month}
        onMonthChange={setMonth}
        today={day}
        weeks={[{ date: "2026-10-26", label: "Read the weekly brief", href: "#example" }]}
      />
    </ReaderRail>
  );
}

// One day's brief, from its date to its way on.
export function ReaderBrief() {
  return (
    <AppShellPanel>
      <Reader>
        <ReaderLead>
          <ReaderHead written="Written 07:00">Tue 3 Nov</ReaderHead>
          <ReaderLine>Reply to Sam before standup, then read the outline before the kickoff.</ReaderLine>
          <ReaderNext>
            <ReaderNextText label="Do next">Reply to Sam about chapter 7</ReaderNextText>
            <Button size="lg">Read the draft</Button>
          </ReaderNext>
        </ReaderLead>
        <ReaderWide>
          <DayLine>
            <DayLineStrip aria-label="The day as written at 07:00" day={day} events={tuesday} timeZone={timeZone} />
          </DayLine>
        </ReaderWide>
        <ReaderBody>
          <ReaderSection>
            <ReaderSectionTitle>What changed</ReaderSectionTitle>
            <ReaderText>
              Sam sent the chapter 7 notes last night. They ask for one new figure and a shorter second section.
            </ReaderText>
          </ReaderSection>
          <ReaderSection>
            <ReaderSectionTitle>What&rsquo;s coming</ReaderSectionTitle>
            <ReaderText>
              The kickoff is at 16:30, and <a href="#a-meeting-brief">its brief</a> is ready. The chapter 8 outline
              waits on it.
            </ReaderText>
          </ReaderSection>
          <ReaderEnd>That&rsquo;s all for today.</ReaderEnd>
        </ReaderBody>
        <Rail />
        <ReaderFoot>
          <Onward back href="#example">
            Monday
          </Onward>
          <Onward href="#example">Wednesday</Onward>
        </ReaderFoot>
      </Reader>
    </AppShellPanel>
  );
}

// The meeting's paper: when it is, its name, and the one line for the room. A page can print this as its head, because
// it holds the one paper.
function MeetingPaper({ label, line, actions = false }: { label: string; line: string; actions?: boolean }) {
  const titleId = useId();
  return (
    <ReaderPaper render={<section aria-labelledby={titleId} />}>
      <p className="type-instrument text-muted-foreground">16:30 to 17:30 · Video</p>
      <h2 id={titleId} className="mt-1 type-title text-first">
        Project kickoff
      </h2>
      <ReaderRaised label={label}>{line}</ReaderRaised>
      {actions && (
        <div className="mt-4 flex flex-wrap gap-2">
          <Button size="lg" variant="outline">
            Join
          </Button>
          <Button size="lg" variant="ghost">
            Open in calendar
          </Button>
        </div>
      )}
    </ReaderPaper>
  );
}

// What a meeting brief prints before the meeting. Tom has no note in the record, and the block with nothing to say
// says so.
export function ReaderMeeting() {
  return (
    <AppShellPanel>
      <MeetingPaper
        actions
        label="One thing to raise"
        line="Ask Sam who signs off the chapter order now that Mina has the outline."
      />
      <ReaderBlocks>
        <ReaderBlock>
          <ReaderBlockTitle>Who&rsquo;s in the room</ReaderBlockTitle>
          <ReaderWho>
            <ReaderPerson note="Edits the series" seen="Mail, Mon 2 Nov">
              Sam
            </ReaderPerson>
            <ReaderPerson note="Production" seen="Call, 22 Sep">
              Mina
            </ReaderPerson>
            <ReaderPerson note="Not in the record">Tom</ReaderPerson>
          </ReaderWho>
        </ReaderBlock>
        <ReaderBlock>
          <ReaderBlockTitle>Last time</ReaderBlockTitle>
          <ReaderText>You agreed the outline for chapters 7 and 8, and Sam took the figures.</ReaderText>
        </ReaderBlock>
        <ReaderBlock>
          <ReaderBlockTitle>What you owe them</ReaderBlockTitle>
          <ReaderOwed>
            <ReaderOwedRow href="#a-meeting-brief" when="Thu 5 Nov">
              The chapter 7 notes
            </ReaderOwedRow>
            <ReaderOwedRow when="Promised for Thu">A date for the printer</ReaderOwedRow>
          </ReaderOwed>
        </ReaderBlock>
        <ReaderBlock>
          <ReaderBlockTitle>What they owe you</ReaderBlockTitle>
          <ReaderGap>Not in the record</ReaderGap>
        </ReaderBlock>
        <SourceLine className="col-span-full" end="Written 07:00">
          <SourceLineItem href="#a-meeting-brief">22 Sep call recap</SourceLineItem>
          <SourceLineItem href="#a-meeting-brief">Sam&rsquo;s mail, Mon 2 Nov</SourceLineItem>
        </SourceLine>
      </ReaderBlocks>
      <ReaderFoot>
        <Onward back href="#a-meeting-brief">
          Today
        </Onward>
        <Onward href="#after-the-meeting">The notes</Onward>
      </ReaderFoot>
    </AppShellPanel>
  );
}

// The same meeting once it's over: what was agreed takes the paper, and what was planned stays in muted ink.
export function ReaderMeetingAfter() {
  return (
    <AppShellPanel>
      <MeetingPaper
        label="What was agreed"
        line="Twelve chapters at the current pace. Mina signs the order on Friday."
      />
      <ReaderBlocks>
        <ReaderBlock>
          <ReaderBlockTitle>Your follow-ups</ReaderBlockTitle>
          <ReaderOwed>
            <ReaderOwedRow href="#after-the-meeting" when="Fri 6 Nov">
              Send Mina the chapter order
            </ReaderOwedRow>
          </ReaderOwed>
        </ReaderBlock>
        <ReaderBlock>
          <ReaderBlockTitle>Their follow-ups</ReaderBlockTitle>
          <ReaderOwed>
            <ReaderOwedRow when="Sam, Mon 9 Nov">The last two figures</ReaderOwedRow>
          </ReaderOwed>
        </ReaderBlock>
        <ReaderBlock>
          <ReaderBlockTitle>Who was in the room</ReaderBlockTitle>
          <ReaderWho>
            <ReaderPerson>Sam</ReaderPerson>
            <ReaderPerson>Mina</ReaderPerson>
          </ReaderWho>
        </ReaderBlock>
        <ReaderBlock asWritten>
          <ReaderBlockTitle>One thing to raise, as written</ReaderBlockTitle>
          <ReaderText>Ask Sam who signs off the chapter order now that Mina has the outline.</ReaderText>
        </ReaderBlock>
      </ReaderBlocks>
      <ReaderFoot>
        <Onward back href="#after-the-meeting">
          Today
        </Onward>
      </ReaderFoot>
    </AppShellPanel>
  );
}

// A brief whose meeting moved on keeps what it said in muted ink: names, rows and words all take the block's.
export function ReaderAsWritten() {
  return (
    <ReaderBlocks>
      <ReaderBlock asWritten>
        <ReaderBlockTitle>Who&rsquo;s in the room, as written</ReaderBlockTitle>
        <ReaderWho>
          <ReaderPerson note="Edits the series" seen="Mail, Mon 2 Nov">
            Sam
          </ReaderPerson>
          <ReaderPerson note="Production">Mina</ReaderPerson>
        </ReaderWho>
      </ReaderBlock>
      <ReaderBlock asWritten>
        <ReaderBlockTitle>Last time, as written</ReaderBlockTitle>
        <ReaderText>You agreed the outline for chapters 7 and 8.</ReaderText>
      </ReaderBlock>
    </ReaderBlocks>
  );
}

// A brief that couldn't be read still names who's on the invite.
export function ReaderNamesOnly() {
  return (
    <ReaderBlocks>
      <ReaderBlock>
        <ReaderBlockTitle>On the invite</ReaderBlockTitle>
        <ReaderWho>
          <ReaderPerson>Sam Okafor</ReaderPerson>
          <ReaderPerson>Mina Rao</ReaderPerson>
          <ReaderPerson>Tom</ReaderPerson>
        </ReaderWho>
      </ReaderBlock>
    </ReaderBlocks>
  );
}

export function ReaderClosingLine() {
  return <ReaderEnd className="mt-0">That&rsquo;s all for today.</ReaderEnd>;
}
