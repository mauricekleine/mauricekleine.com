import { createFileRoute, notFound } from "@tanstack/react-router";
import { essayNeighbors, essaysBySlug } from "../essay-content";
import { EssayArticle, essayHeadings } from "../essay-markdown";
import { EssayNav, Footer, PageHead, Subscribe } from "../components";
import { essayHead } from "../seo";
import { Shell } from "../shell";

export const Route = createFileRoute("/essays_/$slug")({
  loader: ({ params }) => {
    const essay = essaysBySlug[params.slug];
    if (!essay) throw notFound();
    return essay;
  },
  head: ({ loaderData }) => essayHead(loaderData!),
  component: EssayPage,
});

function EssayPage() {
  const essay = Route.useLoaderData();
  const { older, newer } = essayNeighbors(essay);
  return (
    <Shell place="essays" crumb="essays" title={essay.title} sections={essayHeadings(essay)}>
      <PageHead>
        <h1 className="essay-title type-page">{essay.title}</h1>
        <p className="essay-meta">
          by <a href="/about">maurice kleine</a> · <time dateTime={essay.date}>{essay.dateDisplay}</time> · first posted
          on <a href={essay.x}>x</a>
          {essay.linkedin && (
            <>
              {" "}
              and <a href={essay.linkedin}>linkedin</a>
            </>
          )}
        </p>
      </PageHead>
      <EssayArticle essay={essay} />
      <Subscribe />
      <Footer>
        <EssayNav older={older} newer={newer} />
        <p className="type-meta">
          <a href="/essays">← all essays</a>
        </p>
      </Footer>
    </Shell>
  );
}
