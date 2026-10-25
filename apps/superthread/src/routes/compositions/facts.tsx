import { createFileRoute } from "@tanstack/react-router";
import { InstallLine } from "@/site/InstallLine";
import { PageHead } from "@/site/PageHead";

export const Route = createFileRoute("/compositions/facts")({
  staticData: { sections: [] },
  component: Page,
});

function Page() {
  return (
    <PageHead title="facts" lede="this page is on its way.">
      <InstallLine items={["facts"]} />
    </PageHead>
  );
}
