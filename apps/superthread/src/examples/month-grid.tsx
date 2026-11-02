import { useState } from "react";
import { MonthGrid, type MonthGridEntry } from "@/components/superthread/blocks/month-grid";

// A fixed today, so the page prints the same marks whenever it's built and wherever it's read.
const today = "2026-11-03";

// A brief every weekday, from the monday they begin up to today.
const briefs = Array.from({ length: 37 }, (_, day) => new Date(Date.UTC(2026, 8, 28 + day)))
  .filter((date) => date.getUTCDay() % 6 !== 0)
  .map((date) => date.toISOString().slice(0, 10));

const week = (date: string): MonthGridEntry => ({ date, label: "read the weekly brief", href: "#weeks" });
const weeklies = [week("2026-09-28"), week("2026-10-05"), week("2026-10-12"), week("2026-10-19"), week("2026-10-26")];

function links(open?: string, href = "#example") {
  return briefs.map((date) => ({ date, label: "read the brief", selected: date === open, href }));
}

// The way the grid usually works: an app holds the month, and a day opens in place, so its bar moves with the click.
export function MonthGridExample() {
  const [month, setMonth] = useState("2026-11");
  const [open, setOpen] = useState("2026-11-02");
  const days = briefs.map((date) => ({
    date,
    label: "read the brief",
    selected: date === open,
    render: <button type="button" onClick={() => setOpen(date)} />,
  }));
  return (
    <div className="st-month-grid">
      <MonthGrid
        aria-label="briefs by month"
        days={days}
        max="2026-11"
        min="2026-09"
        month={month}
        onMonthChange={setMonth}
        today={today}
        weeks={weeklies}
      />
    </div>
  );
}

// Each mark on its own: a day with content, one from the month beside it, and today with its brief open.
export function MonthGridMarks() {
  return (
    <div className="st-month-grid">
      <MonthGrid
        aria-label="briefs by month"
        days={[
          { date: "2026-10-30", label: "read the brief", href: "#marks" },
          { date: "2026-11-02", label: "read the brief", href: "#marks" },
          { date: "2026-11-03", label: "read the brief", selected: true, href: "#marks" },
        ]}
        month="2026-11"
        today={today}
      />
    </div>
  );
}

// No week column, and dots with nowhere to go, so the month reads as a table.
export function MonthGridReadOnly() {
  return (
    <div className="st-month-grid">
      <MonthGrid aria-label="runs by month" days={briefs.map((date) => ({ date, label: "a run" }))} month="2026-10" />
    </div>
  );
}

export function MonthGridBounded() {
  const [month, setMonth] = useState("2026-11");
  return (
    <div className="st-month-grid">
      <MonthGrid
        aria-label="briefs by month"
        days={links("2026-10-30", "#keys")}
        max="2026-11"
        min="2026-10"
        month={month}
        onMonthChange={setMonth}
        today={today}
      />
    </div>
  );
}

export function MonthGridLoading() {
  return (
    <div className="st-month-grid">
      <MonthGrid aria-label="briefs by month" loading month="2026-11" today={today} weeks={[]} />
    </div>
  );
}

// A whole panel's width on a phone, where every cell reaches 44 px.
export function MonthGridPhone() {
  return (
    <MonthGrid
      aria-label="briefs by month"
      days={links("2026-11-02", "#phone")}
      max="2026-11"
      min="2026-09"
      month="2026-11"
      onMonthChange={() => {}}
      today={today}
      weeks={weeklies}
    />
  );
}
