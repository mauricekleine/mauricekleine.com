import { createFileRoute } from "@tanstack/react-router";
import { docSectionGroups } from "@/components/superthread/catalog";

export const Route = createFileRoute("/compositions/doc")({
  staticData: {
    sections: [
      { id: "example", title: "One brief, two ways" },
      ...Object.keys(docSectionGroups).map((id) => ({
        id,
        title: id === "endings" ? "Endings and controls" : id[0]!.toUpperCase() + id.slice(1),
      })),
    ],
  },
});
