import { createFileRoute } from "@tanstack/react-router";
import { InstallLine } from "@/site/InstallLine";
import { PageHead } from "@/site/PageHead";

export const Route = createFileRoute("/compositions/collection-toolbar")({
  staticData: { sections: [] },
  component: Page,
});

function Page() {
  return (
    <PageHead title="collection toolbar" lede="this page is on its way.">
      <InstallLine items={["collection-toolbar"]} />
    </PageHead>
  );
}
