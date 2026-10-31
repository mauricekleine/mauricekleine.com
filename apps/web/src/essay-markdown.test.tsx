// "on this page" links to the essay's headings, so the list read from the markdown has to name the ids the article prints.
import { expect, mock, test } from "bun:test";
import { renderToString } from "react-dom/server";

const markdown = `A first line.

## Where is the *fucking* ROI?

Some words.

## T3 finally made the server feel good

More words.
`;

// bun has no import.meta.glob, and a module mock outlives this file, so it carries the module's whole surface
mock.module("./essay-content", () => ({
  essays: [],
  essaysBySlug: {},
  essayNeighbors: () => ({}),
  articleMarkdown: () => markdown,
}));
const { EssayArticle, essayHeadings } = await import("./essay-markdown");
const essay = { slug: "test", images: {} } as Parameters<typeof essayHeadings>[0];

test("every listed heading lands on a printed anchor", () => {
  const html = renderToString(<EssayArticle essay={essay} />);
  const headings = essayHeadings(essay);
  expect(headings).toEqual([
    { id: "where-is-the-fucking-roi", title: "Where is the fucking ROI?" },
    { id: "t3-finally-made-the-server-feel-good", title: "T3 finally made the server feel good" },
  ]);
  for (const { id } of headings) expect(html).toContain(`<h2 id="${id}">`);
});
