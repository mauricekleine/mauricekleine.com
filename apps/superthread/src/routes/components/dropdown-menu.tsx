import { createFileRoute } from "@tanstack/react-router";
import { InstallLine } from "@/site/InstallLine";
import { PageHead } from "@/site/PageHead";

export const Route = createFileRoute("/components/dropdown-menu")({
  staticData: { sections: [] },
  component: Page,
});

function Page() {
  return (
    <PageHead title="dropdown menu" lede="this page is on its way.">
      <InstallLine items={["dropdown-menu"]} />
    </PageHead>
  );
}
