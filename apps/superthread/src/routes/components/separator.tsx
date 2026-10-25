import { createFileRoute } from "@tanstack/react-router";
import { InstallLine } from "@/site/InstallLine";
import { PageHead } from "@/site/PageHead";

export const Route = createFileRoute("/components/separator")({
  staticData: { sections: [] },
  component: Page,
});

function Page() {
  return (
    <PageHead title="separator">
      <InstallLine items={["separator"]} />
    </PageHead>
  );
}
