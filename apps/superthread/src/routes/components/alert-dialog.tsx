import { createFileRoute } from "@tanstack/react-router";
import { InstallLine } from "@/site/InstallLine";
import { PageHead } from "@/site/PageHead";

export const Route = createFileRoute("/components/alert-dialog")({
  staticData: { sections: [] },
  component: Page,
});

function Page() {
  return (
    <PageHead title="alert dialog" lede="this page is on its way.">
      <InstallLine items={["alert-dialog"]} />
    </PageHead>
  );
}
