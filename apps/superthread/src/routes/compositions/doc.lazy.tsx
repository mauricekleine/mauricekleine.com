import { createLazyFileRoute } from "@tanstack/react-router";
import { Fragment, useEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { docSectionGroups } from "@/components/superthread/catalog";
import modeUrl from "@/components/superthread/doc/mode.js?url&no-inline";
import weaveUrl from "@/components/superthread/doc/weave.js?url&no-inline";
import docCss from "@/components/superthread/styles/doc.css?url";
import tokensCss from "@/components/superthread/styles/superthread-plain.css?url";
import { InstallLine } from "@/site/InstallLine";
import { PageHead } from "@/site/PageHead";
import { Section } from "@/site/Section";
import { docExamples } from "../../../../../packages/superthread/test/fixtures/doc-examples";
import exampleSource from "../../../../../packages/superthread/test/fixtures/doc-examples.tsx?raw";
import "@/styles/doc.css";

const partials = import.meta.glob("@/components/superthread/doc/sections/*.html", {
  query: "?raw",
  import: "default",
  eager: true,
}) as Record<string, string>;

type DocSection = (typeof docSectionGroups)[keyof typeof docSectionGroups][number];

const reactSnippets = new Map(
  Array.from(
    exampleSource.matchAll(/ {2}\/\/ #region ([-\w]+)\n([\s\S]+?)\n {2}\/\/ #endregion/g),
    ([, name, source]) => [
      name,
      source!
        .slice(source!.indexOf("<"))
        .replace(/(?:\n {2}\))?,$/, "")
        .replace(/^ {4}/gm, ""),
    ],
  ),
);

function partial(name: DocSection) {
  const html = Object.entries(partials).find(([path]) => path.endsWith(`/${name}.html`))?.[1];
  if (html === undefined) throw new Error(`missing doc partial: ${name}`);
  return html;
}

const groups = Object.entries(docSectionGroups).map(([id, sections]) => ({
  id,
  title: id === "endings" ? "endings and controls" : id,
  sections,
}));

export const Route = createLazyFileRoute("/compositions/doc")({ component: Documents });

function Documents() {
  return (
    <>
      <PageHead title="documents" lede="compose reports and briefs from the same sections in plain html or react.">
        <div className="st-doc-installs">
          <InstallLine items={["doc"]} />
          <InstallLine items={["doc-react"]} />
        </div>
      </PageHead>
      <Section id="example" title="one brief, two ways">
        <DocumentComparison />
        <p className="st-doc-setup">
          for react, link <code>styles/superthread-plain.css</code> then <code>styles/doc.css</code> in the document
          route's head. run <code>themeScript</code> from <code>lib/theme</code> before first paint and import the
          sections from <code>ui/doc-react</code>.
        </p>
      </Section>
      {groups.map(({ id, title, sections }) => (
        <Section key={id} id={id} title={title}>
          {sections.map((name) => (
            <Specimen key={name} name={name} />
          ))}
        </Section>
      ))}
    </>
  );
}

function Specimen({ name }: { name: DocSection }) {
  const title = name.replaceAll("-", " ");
  const html = partial(name);
  const jsx = reactSnippets.get(name);
  if (jsx === undefined) throw new Error(`missing doc react example: ${name}`);
  const bleed = ["hero", "slim-head", "band", "footer", "draft-strip"].includes(name);
  return (
    <div className="st-doc-specimen">
      <h3 className="type-subtitle">{title}</h3>
      <DocPreview title={`${title} preview`} html={html} bleed={bleed} lazy />
      <div className="st-doc-panes">
        <div>
          <h4 className="type-meta">html</h4>
          <pre className="st-doc-html" tabIndex={0} aria-label={`${title} html`}>
            <code>{html}</code>
          </pre>
        </div>
        <div>
          <h4 className="type-meta">react</h4>
          <pre className="st-doc-html" tabIndex={0} aria-label={`${title} react`}>
            <code>{jsx}</code>
          </pre>
        </div>
      </div>
    </div>
  );
}

const briefBody = ["lede", "stat-row", "closing-line"] as const;

function DocumentComparison() {
  const html = `${partial("slim-head")}<main class="frame">${briefBody.map(partial).join("")}</main>${partial("footer")}`;
  return (
    <div className="st-doc-panes">
      <div>
        <h3 className="type-meta">plain html</h3>
        <DocPreview title="brief in plain html" html={html} bleed />
      </div>
      <div>
        <h3 className="type-meta">react</h3>
        <DocPreview title="brief in react" bleed>
          {docExamples["slim-head"]}
          <main className="frame">
            {briefBody.map((name) => (
              <Fragment key={name}>{docExamples[name]}</Fragment>
            ))}
          </main>
          {docExamples.footer}
        </DocPreview>
      </div>
    </div>
  );
}

function DocPreview({
  title,
  html = "",
  bleed,
  lazy,
  children,
}: {
  title: string;
  html?: string;
  bleed: boolean;
  lazy?: boolean;
  children?: ReactNode;
}) {
  const ref = useRef<HTMLIFrameElement>(null);
  const [body, setBody] = useState<HTMLElement | null>(null);
  const [height, setHeight] = useState<number>();
  useEffect(() => {
    const frame = ref.current!;
    const mount = () => {
      const doc = frame.contentDocument;
      if (doc?.URL === "about:srcdoc") setBody(doc.body);
    };
    frame.addEventListener("load", mount);
    mount();
    return () => frame.removeEventListener("load", mount);
  }, []);
  useEffect(() => {
    if (!body) return;
    const size = () => setHeight(Math.ceil(body.getBoundingClientRect().height));
    const observer = new ResizeObserver(size);
    observer.observe(body);
    size();
    return () => observer.disconnect();
  }, [body]);

  return (
    <iframe
      ref={ref}
      className="st-doc-preview"
      title={title}
      loading={lazy ? "lazy" : undefined}
      srcDoc={preview(html, bleed)}
      style={{ height }}
    >
      {body && children && createPortal(children, body)}
    </iframe>
  );
}

// Each frame runs the plain item on its own stock. The embedded color scheme follows the site's mode control.
function preview(html: string, bleed: boolean) {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<script src="${modeUrl}"></script>
<link rel="stylesheet" href="${tokensCss}">
<link rel="stylesheet" href="${docCss}">
<style>
  html { overflow: hidden; }
  body { display: flow-root; }
  .frame { padding-block: 24px; }
  .frame > :first-child { margin-top: 0; }
  .frame > :last-child { margin-bottom: 0; }
  .hero { min-height: 0; }
  .hero-weave { height: clamp(160px, 24vw, 260px); }
  .frame > .mode { margin-left: 0; }
</style>
<base target="_blank">
</head>
<body>
${bleed ? html : `<div class="frame">${html}</div>`}
${html.includes("data-weave=") ? `<script src="${weaveUrl}"></script>` : ""}
<script>
  document.addEventListener("click", (event) => {
    if (event.target.closest('a[href^="#"]')) event.preventDefault();
  });
</script>
</body>
</html>`;
}
