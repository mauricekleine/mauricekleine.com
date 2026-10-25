import { createFileRoute } from "@tanstack/react-router";
import { InstallLine } from "@/site/InstallLine";
import { PageHead } from "@/site/PageHead";

export const Route = createFileRoute("/components/resizable")({
  staticData: { sections: [] },
  component: Page,
});

function Page() {
  return (
    <PageHead title="resizable" lede="this page is on its way.">
      <InstallLine items={["resizable"]} />
    </PageHead>
  );
}
