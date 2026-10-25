import { createFileRoute } from "@tanstack/react-router";
import { InstallLine } from "@/site/InstallLine";
import { PageHead } from "@/site/PageHead";

export const Route = createFileRoute("/compositions/app-shell")({
  staticData: { sections: [] },
  component: Page,
});

function Page() {
  return (
    <PageHead title="app shell" lede="this page is on its way.">
      <InstallLine items={["app-shell"]} />
    </PageHead>
  );
}
