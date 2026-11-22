import { createFileRoute } from "@tanstack/react-router";
import docCss from "@/components/superthread/styles/doc.css?url";
import tokensCss from "@/components/superthread/styles/superthread-plain.css?url";
import { docExamples } from "../doc-examples";

export const Route = createFileRoute("/documents")({
  head: () => ({
    links: [
      { rel: "stylesheet", href: tokensCss },
      { rel: "stylesheet", href: docCss },
    ],
  }),
  component: Documents,
});

function Documents() {
  const { hero, footer, ...sections } = docExamples;
  return (
    <>
      {hero}
      <main className="frame">
        {Object.entries(sections).map(([name, section]) => (
          <section key={name} data-section={name}>
            {section}
          </section>
        ))}
      </main>
      {footer}
    </>
  );
}
