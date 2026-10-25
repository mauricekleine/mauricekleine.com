import { createFileRoute } from "@tanstack/react-router";
import { InstallLine } from "@/site/InstallLine";
import { PageHead } from "@/site/PageHead";

export const Route = createFileRoute("/components/progress")({
  staticData: { sections: [] },
  component: Page,
});

function Page() {
  return (
    <PageHead title="progress">
      <InstallLine items={["progress"]} />
    </PageHead>
  );
}
