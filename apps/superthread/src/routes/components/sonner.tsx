import { createFileRoute } from "@tanstack/react-router";
import { InstallLine } from "@/site/InstallLine";
import { PageHead } from "@/site/PageHead";

export const Route = createFileRoute("/components/sonner")({
  staticData: { sections: [] },
  component: Page,
});

function Page() {
  return (
    <PageHead title="sonner" lede="this page is on its way.">
      <InstallLine items={["sonner"]} />
    </PageHead>
  );
}
