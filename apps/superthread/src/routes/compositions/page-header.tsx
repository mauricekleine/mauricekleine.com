import { createFileRoute } from "@tanstack/react-router";
import { InstallLine } from "@/site/InstallLine";
import { PageHead } from "@/site/PageHead";

export const Route = createFileRoute("/compositions/page-header")({
  staticData: { sections: [] },
  component: Page,
});

function Page() {
  return (
    <PageHead title="page header" lede="this page is on its way.">
      <InstallLine items={["page-header"]} />
    </PageHead>
  );
}
