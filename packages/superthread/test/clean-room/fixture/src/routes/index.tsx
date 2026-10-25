// The page clean-room steps 4 and 10 prerender. Its button comes from `shadcn add @mk/button`
// (or from init), so the fixture builds only after one of those has run.
import { createFileRoute } from "@tanstack/react-router";
import { Button } from "@/components/superthread/ui/button";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  return (
    <main className="p-6">
      <Button>a button from @mk</Button>
    </main>
  );
}
