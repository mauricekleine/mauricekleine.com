import { createFileRoute, notFound } from "@tanstack/react-router";
import { essayNeighbors, essaysBySlug } from "../essay-content";
import { EssayArticle, essayHeadings } from "../essay-markdown";
import { EssayNav, Footer, Opener, Subscribe } from "../components";
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
    <Shell
      place="essays"
      crumb="Essays"
      title={essay.title}
      sections={essayHeadings(essay)}
      opener={
        <Opener kicker="Essay">
          <h1 className="essay-title type-page">{essay.title}</h1>
          <p className="essay-meta">
            By <a href="/about">Maurice Kleine</a> · <time dateTime={essay.date}>{essay.dateDisplay}</time> · First
            posted on <a href={essay.x}>X</a>
            {essay.linkedin && (
              <>
                {" "}
                and <a href={essay.linkedin}>LinkedIn</a>
              </>
            )}
          </p>
        </Opener>
      }
    >
      <EssayArticle essay={essay} />
      <Subscribe />
      <Footer>
        <EssayNav older={older} newer={newer} />
        <p className="type-meta">
          <a href="/essays">← All essays</a>
        </p>
      </Footer>
    </Shell>
  );
}
