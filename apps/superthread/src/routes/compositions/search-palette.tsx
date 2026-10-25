import { createFileRoute } from "@tanstack/react-router";
import { InstallLine } from "@/site/InstallLine";
import { PageHead } from "@/site/PageHead";

export const Route = createFileRoute("/compositions/search-palette")({
  staticData: { sections: [] },
  component: Page,
});

function Page() {
  return (
    <PageHead title="search palette" lede="this page is on its way.">
      <InstallLine items={["search-palette"]} />
    </PageHead>
  );
}
