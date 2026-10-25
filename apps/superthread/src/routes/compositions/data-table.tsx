import { createFileRoute } from "@tanstack/react-router";
import { InstallLine } from "@/site/InstallLine";
import { PageHead } from "@/site/PageHead";

export const Route = createFileRoute("/compositions/data-table")({
  staticData: { sections: [] },
  component: Page,
});

function Page() {
  return (
    <PageHead title="data table" lede="this page is on its way.">
      <InstallLine items={["data-table"]} />
    </PageHead>
  );
}
