import { createFileRoute } from "@tanstack/react-router";
import { InstallLine } from "@/site/InstallLine";
import { PageHead } from "@/site/PageHead";

export const Route = createFileRoute("/compositions/quick-add")({
  staticData: { sections: [] },
  component: Page,
});

function Page() {
  return (
    <PageHead title="quick add" lede="this page is on its way.">
      <InstallLine items={["quick-add"]} />
    </PageHead>
  );
}
