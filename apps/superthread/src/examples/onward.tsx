import { Door, Onward } from "@/components/superthread/ui/onward";

// The two ways off a day: back to today, and on to the week.
export function OnwardExample() {
  return (
    <div className="st-onward">
      <Onward back href="#onward">
        Today
      </Onward>
      <Onward href="#onward">The week</Onward>
    </div>
  );
}

// A short door, and a long one that truncates before it wraps.
export function DoorExample() {
  return (
    <div className="st-doors">
      <Door href="#door">See what you finished</Door>
      <Door href="#door">The whole week, with everything that was planned and everything that moved to the next</Door>
    </div>
  );
}
