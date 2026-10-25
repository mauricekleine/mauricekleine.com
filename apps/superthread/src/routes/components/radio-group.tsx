import { createFileRoute } from "@tanstack/react-router";
import { InstallLine } from "@/site/InstallLine";
import { PageHead } from "@/site/PageHead";

export const Route = createFileRoute("/components/radio-group")({
  staticData: { sections: [] },
  component: Page,
});

function Page() {
  return (
    <PageHead title="radio group" lede="this page is on its way.">
      <InstallLine items={["radio-group"]} />
    </PageHead>
  );
}
