import { createFileRoute } from "@tanstack/react-router";
import { PageHead } from "@/site/PageHead";

export const Route = createFileRoute("/foundations/marks")({
  staticData: { sections: [] },
  component: Page,
});

function Page() {
  return <PageHead title="marks" />;
}
