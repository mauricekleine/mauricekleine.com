import { createFileRoute } from "@tanstack/react-router";
import { InstallLine } from "@/site/InstallLine";
import { PageHead } from "@/site/PageHead";

export const Route = createFileRoute("/components/kbd")({
  staticData: { sections: [] },
  component: Page,
});

function Page() {
  return (
    <PageHead title="kbd" lede="this page is on its way.">
      <InstallLine items={["kbd"]} />
    </PageHead>
  );
}
