import { createFileRoute } from "@tanstack/react-router";
import { InstallLine } from "@/site/InstallLine";
import { PageHead } from "@/site/PageHead";

export const Route = createFileRoute("/components/slider")({
  staticData: { sections: [] },
  component: Page,
});

function Page() {
  return (
    <PageHead title="slider" lede="this page is on its way.">
      <InstallLine items={["slider"]} />
    </PageHead>
  );
}
