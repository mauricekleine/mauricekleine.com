import { createFileRoute } from "@tanstack/react-router";
import { PageHead } from "@/site/PageHead";

export const Route = createFileRoute("/foundations/colour")({
  staticData: { sections: [] },
  component: Page,
});

function Page() {
  return <PageHead title="colour" />;
}
