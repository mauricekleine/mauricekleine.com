import { createFileRoute } from "@tanstack/react-router";
import { Card, CardHeader, CardTitle } from "@/components/superthread/ui/card";

// a mock page imports only the registry's components, src/mock and the app shell
export const Route = createFileRoute("/mock/reading")({
  staticData: { sections: [] },
  component: Page,
});

function Page() {
  return (
    <div className="mx-auto max-w-[880px] px-6 py-10">
      <Card>
        <CardHeader>
          <CardTitle>reading</CardTitle>
        </CardHeader>
      </Card>
    </div>
  );
}
