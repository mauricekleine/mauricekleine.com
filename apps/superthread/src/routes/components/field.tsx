import { createFileRoute } from "@tanstack/react-router";
import { InstallLine } from "@/site/InstallLine";
import { PageHead } from "@/site/PageHead";

export const Route = createFileRoute("/components/field")({
  staticData: { sections: [] },
  component: Page,
});

function Page() {
  return (
    <PageHead title="field" lede="this page is on its way.">
      <InstallLine items={["field"]} />
    </PageHead>
  );
}
