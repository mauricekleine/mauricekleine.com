import { createFileRoute } from "@tanstack/react-router";
import { NotFoundPage } from "./__root";

export const Route = createFileRoute("/404")({
  staticData: { sections: [] },
  component: NotFoundPage,
});
