import { createFileRoute } from "@tanstack/react-router";
import { InstallLine } from "@/site/InstallLine";
import { PageHead } from "@/site/PageHead";

export const Route = createFileRoute("/components/input")({
  staticData: { sections: [] },
  component: Page,
});

function Page() {
  return (
    <PageHead title="input">
      <InstallLine items={["input"]} />
    </PageHead>
  );
}
