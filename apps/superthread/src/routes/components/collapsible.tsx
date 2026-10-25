import { createFileRoute } from "@tanstack/react-router";
import { InstallLine } from "@/site/InstallLine";
import { PageHead } from "@/site/PageHead";

export const Route = createFileRoute("/components/collapsible")({
  staticData: { sections: [] },
  component: Page,
});

function Page() {
  return (
    <PageHead title="collapsible" lede="this page is on its way.">
      <InstallLine items={["collapsible"]} />
    </PageHead>
  );
}
