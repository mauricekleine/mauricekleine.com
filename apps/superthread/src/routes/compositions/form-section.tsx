import { createFileRoute } from "@tanstack/react-router";
import { InstallLine } from "@/site/InstallLine";
import { PageHead } from "@/site/PageHead";

export const Route = createFileRoute("/compositions/form-section")({
  staticData: { sections: [] },
  component: Page,
});

function Page() {
  return (
    <PageHead title="form section" lede="this page is on its way.">
      <InstallLine items={["form-section"]} />
    </PageHead>
  );
}
