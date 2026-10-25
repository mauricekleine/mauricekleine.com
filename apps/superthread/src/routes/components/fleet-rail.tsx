import { createFileRoute } from "@tanstack/react-router";
import { InstallLine } from "@/site/InstallLine";
import { PageHead } from "@/site/PageHead";

export const Route = createFileRoute("/components/fleet-rail")({
  staticData: { sections: [] },
  component: Page,
});

function Page() {
  return (
    <PageHead title="fleet rail">
      <InstallLine items={["fleet-rail"]} />
    </PageHead>
  );
}
