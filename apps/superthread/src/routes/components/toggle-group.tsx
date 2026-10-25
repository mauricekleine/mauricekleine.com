import { createFileRoute } from "@tanstack/react-router";
import { InstallLine } from "@/site/InstallLine";
import { PageHead } from "@/site/PageHead";

export const Route = createFileRoute("/components/toggle-group")({
  staticData: { sections: [] },
  component: Page,
});

function Page() {
  return (
    <PageHead title="toggle group" lede="this page is on its way.">
      <InstallLine items={["toggle-group"]} />
    </PageHead>
  );
}
