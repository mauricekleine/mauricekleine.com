import { Badge } from "@/components/superthread/ui/badge";
import { Button } from "@/components/superthread/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/superthread/ui/card";

// One chapter as a card: its title and ship in the header with its state as the header's action, the summary, and
// a footer with its size and the one thing to do next.
export function CardExample() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>One photon at a time</CardTitle>
        <CardDescription>Quanta, chapter 7</CardDescription>
        <CardAction>
          <Badge variant="done">Published</Badge>
        </CardAction>
      </CardHeader>
      <CardContent>Why a single photon still draws the bands, and what that says about light.</CardContent>
      <CardFooter className="justify-between gap-4">
        <span className="st-pass-note">14 pages, built in 38 s</span>
        <Button variant="outline" size="sm">
          Open chapter
        </Button>
      </CardFooter>
    </Card>
  );
}
