import { createFileRoute } from "@tanstack/react-router";
import { InstallLine } from "@/site/InstallLine";
import { PageHead } from "@/site/PageHead";

export const Route = createFileRoute("/components/use-mobile")({
  staticData: { sections: [] },
  component: Page,
});

function Page() {
  return (
    <PageHead title="use-mobile">
      <InstallLine items={["use-mobile"]} />
    </PageHead>
  );
}
