import { createFileRoute } from "@tanstack/react-router";
import { InstallLine } from "@/site/InstallLine";
import { PageHead } from "@/site/PageHead";

export const Route = createFileRoute("/components/skeleton")({
  staticData: { sections: [] },
  component: Page,
});

function Page() {
  return (
    <PageHead title="skeleton">
      <InstallLine items={["skeleton"]} />
    </PageHead>
  );
}
