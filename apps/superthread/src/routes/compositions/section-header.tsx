import { createFileRoute } from "@tanstack/react-router";
import { InstallLine } from "@/site/InstallLine";
import { PageHead } from "@/site/PageHead";

export const Route = createFileRoute("/compositions/section-header")({
  staticData: { sections: [] },
  component: Page,
});

function Page() {
  return (
    <PageHead title="section header" lede="this page is on its way.">
      <InstallLine items={["section-header"]} />
    </PageHead>
  );
}
