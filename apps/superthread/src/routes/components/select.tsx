import { createFileRoute } from "@tanstack/react-router";
import { InstallLine } from "@/site/InstallLine";
import { PageHead } from "@/site/PageHead";

export const Route = createFileRoute("/components/select")({
  staticData: { sections: [] },
  component: Page,
});

function Page() {
  return (
    <PageHead title="select">
      <InstallLine items={["select"]} />
    </PageHead>
  );
}
