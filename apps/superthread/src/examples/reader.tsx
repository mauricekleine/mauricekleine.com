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
import { Paper } from "@/components/superthread/ui/paper";
import { SourceLine, SourceLineItem } from "@/components/superthread/ui/source-line";

// A fixed day, clock and zone, so the page prints the same strip whenever it's built and wherever it's read.
const day = "2026-11-03";
const timeZone = "Europe/Amsterdam";
const clock = (time: string) => `${day}T${time}:00+01:00`;

function meeting(id: string, title: string, start: string, end: string, more?: Partial<DayLineEvent>): DayLineEvent {
  return { id, title, start: clock(start), end: clock(end), ...more };
}

const tuesday = [
  meeting("standup", "team standup", "09:30", "10:00", { href: "#example" }),
  meeting("sam", "1:1 with sam", "14:00", "14:30", { href: "#example" }),
  meeting("kickoff", "project kickoff", "16:30", "17:30", { href: "#a-meeting-brief", brief: true }),
];

// A brief every weekday this month so far, and the one before it.
const briefs = ["2026-10-26", "2026-10-27", "2026-10-28", "2026-10-29", "2026-10-30", "2026-11-02", day];

// What the margin holds for a page of briefs: the month, in the rail's 248 px.
function Rail() {
  const [month, setMonth] = useState("2026-11");
  return (
    <ReaderRail>
      <MonthGrid
        aria-label="briefs by month"
        days={briefs.map((date) => ({ date, label: "read the brief", selected: date === day, href: "#example" }))}
        max="2026-11"
        min="2026-10"
        month={month}
        onMonthChange={setMonth}
        today={day}
        weeks={[{ date: "2026-10-26", label: "read the weekly brief", href: "#example" }]}
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
          <ReaderHead written="written 07:00">tue 3 nov</ReaderHead>
          <ReaderLine>reply to sam before standup, then read the outline before the kickoff.</ReaderLine>
          <ReaderNext>
            <ReaderNextText label="do next">reply to sam about chapter 7</ReaderNextText>
            <Button size="lg">read the draft</Button>
          </ReaderNext>
        </ReaderLead>
        <ReaderWide>
          <DayLine>
            <DayLineStrip
              aria-label="the day as written at 07:00"
              asOf="as of 07:00"
              day={day}
              events={tuesday}
              now={clock("07:00")}
              timeZone={timeZone}
            />
          </DayLine>
        </ReaderWide>
        <ReaderBody>
          <ReaderSection>
            <ReaderSectionTitle>what changed</ReaderSectionTitle>
            <ReaderText>
              sam sent the chapter 7 notes last night. they ask for one new figure and a shorter second section.
            </ReaderText>
          </ReaderSection>
          <ReaderSection>
            <ReaderSectionTitle>what&rsquo;s coming</ReaderSectionTitle>
            <ReaderText>
              the kickoff is at 16:30, and <a href="#a-meeting-brief">its brief</a> is ready. the chapter 8 outline
              waits on it.
            </ReaderText>
          </ReaderSection>
          <ReaderEnd>that&rsquo;s all for today.</ReaderEnd>
        </ReaderBody>
        <Rail />
        <ReaderFoot>
          <Onward back href="#example">
            monday
          </Onward>
          <Onward href="#example">wednesday</Onward>
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
    <Paper render={<section aria-labelledby={titleId} />}>
      <p className="type-instrument text-muted-foreground">16:30 to 17:30 · video</p>
      <h2 id={titleId} className="mt-1 type-title text-first">
        project kickoff
      </h2>
      <ReaderRaised label={label}>{line}</ReaderRaised>
      {actions && (
        <div className="mt-4 flex flex-wrap gap-2">
          <Button size="lg" variant="outline">
            join
          </Button>
          <Button size="lg" variant="ghost">
            open in calendar
          </Button>
        </div>
      )}
    </Paper>
  );
}

// What a meeting brief prints before the meeting. tom has no note in the record, and the block with nothing to say
// says so.
export function ReaderMeeting() {
  return (
    <AppShellPanel>
      <MeetingPaper
        actions
        label="one thing to raise"
        line="ask sam who signs off the chapter order now that mina has the outline."
      />
      <ReaderBlocks>
        <ReaderBlock>
          <ReaderBlockTitle>who&rsquo;s in the room</ReaderBlockTitle>
          <ReaderWho>
            <ReaderPerson note="edits the series" seen="mail, mon 2 nov">
              sam
            </ReaderPerson>
            <ReaderPerson note="production" seen="call, 22 sep">
              mina
            </ReaderPerson>
            <ReaderPerson note="not in the record">tom</ReaderPerson>
          </ReaderWho>
        </ReaderBlock>
        <ReaderBlock>
          <ReaderBlockTitle>last time</ReaderBlockTitle>
          <ReaderText>you agreed the outline for chapters 7 and 8, and sam took the figures.</ReaderText>
        </ReaderBlock>
        <ReaderBlock>
          <ReaderBlockTitle>what you owe them</ReaderBlockTitle>
          <ReaderOwed>
            <ReaderOwedRow href="#a-meeting-brief" when="thu 5 nov">
              the chapter 7 notes
            </ReaderOwedRow>
            <ReaderOwedRow when="since friday">a date for the printer</ReaderOwedRow>
          </ReaderOwed>
        </ReaderBlock>
        <ReaderBlock>
          <ReaderBlockTitle>what they owe you</ReaderBlockTitle>
          <ReaderGap>not in the record</ReaderGap>
        </ReaderBlock>
        <SourceLine className="col-span-full" end="written 07:00">
          <SourceLineItem href="#a-meeting-brief">22 sep call recap</SourceLineItem>
          <SourceLineItem href="#a-meeting-brief">sam&rsquo;s mail, mon 2 nov</SourceLineItem>
        </SourceLine>
      </ReaderBlocks>
      <ReaderFoot>
        <Onward back href="#a-meeting-brief">
          today
        </Onward>
        <Onward href="#after-the-meeting">the notes</Onward>
      </ReaderFoot>
    </AppShellPanel>
  );
}

// The same meeting once it's over: what was agreed takes the paper, and what was planned stays in muted ink.
export function ReaderMeetingAfter() {
  return (
    <AppShellPanel>
      <MeetingPaper
        label="what was agreed"
        line="twelve chapters at the current pace. mina signs the order on friday."
      />
      <ReaderBlocks>
        <ReaderBlock>
          <ReaderBlockTitle>your follow-ups</ReaderBlockTitle>
          <ReaderOwed>
            <ReaderOwedRow href="#after-the-meeting" when="fri 6 nov">
              send mina the chapter order
            </ReaderOwedRow>
          </ReaderOwed>
        </ReaderBlock>
        <ReaderBlock>
          <ReaderBlockTitle>their follow-ups</ReaderBlockTitle>
          <ReaderOwed>
            <ReaderOwedRow when="sam, mon 9 nov">the last two figures</ReaderOwedRow>
          </ReaderOwed>
        </ReaderBlock>
        <ReaderBlock>
          <ReaderBlockTitle>who was in the room</ReaderBlockTitle>
          <ReaderWho>
            <ReaderPerson>sam</ReaderPerson>
            <ReaderPerson>mina</ReaderPerson>
          </ReaderWho>
        </ReaderBlock>
        <ReaderBlock asWritten>
          <ReaderBlockTitle>one thing to raise, as written</ReaderBlockTitle>
          <ReaderText>ask sam who signs off the chapter order now that mina has the outline.</ReaderText>
        </ReaderBlock>
      </ReaderBlocks>
      <ReaderFoot>
        <Onward back href="#after-the-meeting">
          today
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
        <ReaderBlockTitle>who&rsquo;s in the room, as written</ReaderBlockTitle>
        <ReaderWho>
          <ReaderPerson note="edits the series" seen="mail, mon 2 nov">
            sam
          </ReaderPerson>
          <ReaderPerson note="production">mina</ReaderPerson>
        </ReaderWho>
      </ReaderBlock>
      <ReaderBlock asWritten>
        <ReaderBlockTitle>last time, as written</ReaderBlockTitle>
        <ReaderText>you agreed the outline for chapters 7 and 8.</ReaderText>
      </ReaderBlock>
    </ReaderBlocks>
  );
}

// A brief that couldn't be read still names who's on the invite.
export function ReaderNamesOnly() {
  return (
    <ReaderBlocks>
      <ReaderBlock>
        <ReaderBlockTitle>on the invite</ReaderBlockTitle>
        <ReaderWho>
          <ReaderPerson>sam okafor</ReaderPerson>
          <ReaderPerson>mina rao</ReaderPerson>
          <ReaderPerson>tom</ReaderPerson>
        </ReaderWho>
      </ReaderBlock>
    </ReaderBlocks>
  );
}

export function ReaderClosingLine() {
  return <ReaderEnd className="mt-0">that&rsquo;s all for today.</ReaderEnd>;
}
