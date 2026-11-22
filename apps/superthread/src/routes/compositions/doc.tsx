import { createFileRoute } from "@tanstack/react-router";
import { docSectionGroups } from "@/components/superthread/catalog";

export const Route = createFileRoute("/compositions/doc")({
  staticData: {
    sections: [
      { id: "example", title: "one brief, two ways" },
      ...Object.keys(docSectionGroups).map((id) => ({
        id,
        title: id === "endings" ? "endings and controls" : id,
      })),
    ],
  },
});
