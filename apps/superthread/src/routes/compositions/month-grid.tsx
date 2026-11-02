import { createFileRoute } from "@tanstack/react-router";
import { AppShellPanel } from "@/components/superthread/blocks/app-shell";
import { GroundFrame, Serves } from "@/examples/compositions-a";
import {
  MonthGridBounded,
  MonthGridExample,
  MonthGridLoading,
  MonthGridMarks,
  MonthGridPhone,
  MonthGridReadOnly,
} from "@/examples/month-grid";
import { InstallLine } from "@/site/InstallLine";
import { ModePair } from "@/site/ModePair";
import { PageHead } from "@/site/PageHead";
import { Section } from "@/site/Section";

export const Route = createFileRoute("/compositions/month-grid")({
  staticData: {
    sections: [
      { id: "example", title: "example" },
      { id: "marks", title: "the marks" },
      { id: "weeks", title: "the week column" },
      { id: "keys", title: "steps and keys" },
      { id: "unread", title: "while the days are unread" },
      { id: "phone", title: "on a phone" },
      { id: "parts", title: "parts" },
    ],
  },
  component: Page,
});

function Page() {
  return (
    <>
      <PageHead
        title="month grid"
        lede="a month at a glance: a dot on the days that hold something, today's edge and the open day's bar. it sits in a reader's rail or beside any list of days."
      >
        <InstallLine items={["month-grid"]} />
      </PageHead>
      <Serves name="month-grid" />
      <Section id="example" title="example">
        <p className="st-cb-copy">
          the grid always prints six weeks from a monday, so a step never moves what sits under it. figures print in
          mono, so the columns hold. pick a day and its bar moves: nothing else does.
        </p>
        <ModePair>
          <MonthGridExample />
        </ModePair>
      </Section>
      <Section id="marks" title="the marks">
        <p className="st-cb-copy">
          a dot says a day holds something, and ink says where it falls: foreground in the month, muted in the month
          beside it, faint with nothing on it. today prints a 1 px edge and the open day a 2 px bar along its foot.
          they&rsquo;re separate marks, so a day that is both prints both, and its aria label says <code>selected</code>{" "}
          because aria-current is already saying the date.
        </p>
        <ModePair>
          <MonthGridMarks />
        </ModePair>
      </Section>
      <Section id="weeks" title="the week column">
        <p className="st-cb-copy">
          <code>weeks</code>, even an empty list, prints each week&rsquo;s number under <code>wk</code>, in the same
          calendar weeks the year uses. a week in the list takes a dot and a link like a day does. without{" "}
          <code>weeks</code> there&rsquo;s no column. a day with no link still prints its dot and says its label, and a
          month with no links reads as a table.
        </p>
        <ModePair>
          <MonthGridReadOnly />
        </ModePair>
      </Section>
      <Section id="keys" title="steps and keys">
        <p className="st-cb-copy">
          <code>onMonthChange</code> prints the two steps, and <code>min</code> and <code>max</code> bound them. at a
          bound a step keeps its place and its focus, and prints a faint arrow. the links are one tab stop: the open
          day, else today, else the first link, and it follows the keys. left and right walk the links in reading order,
          and past either end they turn the month and carry on from that date. up and down keep the column.
        </p>
        <ModePair>
          <MonthGridBounded />
        </ModePair>
      </Section>
      <Section id="unread" title="while the days are unread">
        <p className="st-cb-copy">
          an empty month and an unread month aren&rsquo;t the same thing. <code>loading</code> holds the grid&rsquo;s
          shape, marks where a dot could land and tells a screen reader the table is busy.
        </p>
        <ModePair>
          <MonthGridLoading />
        </ModePair>
      </Section>
      <Section id="phone" title="on a phone">
        <p className="st-cb-copy">
          every cell and step reaches 44 px on its own box, so no two reaches overlap. a panel&rsquo;s margin holds
          eight columns at that size, so with the week column the grid hangs 9 px into each side.
        </p>
        <ModePair
          light={
            <GroundFrame mode="light" title="a month on a phone, light" height={428}>
              <AppShellPanel>
                <MonthGridPhone />
              </AppShellPanel>
            </GroundFrame>
          }
          dark={
            <GroundFrame mode="dark" title="a month on a phone, dark" height={428}>
              <AppShellPanel>
                <MonthGridPhone />
              </AppShellPanel>
            </GroundFrame>
          }
        />
      </Section>
      <Section id="parts" title="parts">
        <dl className="st-ca-parts">
          <dt>
            <code>MonthGrid</code>
          </dt>
          <dd>
            the head and six weeks, from <code>month</code>, <code>today</code>, <code>days</code>, <code>weeks</code>,{" "}
            <code>loading</code>, <code>min</code>, <code>max</code> and <code>onMonthChange</code>. months and dates
            are plain, like <code>2026-11</code> and <code>2026-11-03</code>, and <code>useMinute</code>&rsquo;s{" "}
            <code>day</code> is today. give it an <code>aria-label</code> that says what the month holds.
          </dd>
          <dt>
            <code>MonthGridEntry</code>
          </dt>
          <dd>
            a day or a week with something in it: its <code>date</code>, the <code>label</code> said before that date,
            and <code>selected</code>. <code>href</code> or a router link through <code>render</code> makes it a link.
          </dd>
        </dl>
      </Section>
    </>
  );
}
