import { createLazyFileRoute } from "@tanstack/react-router";
import { docSectionGroups } from "@/components/superthread/catalog";
import modeUrl from "@/components/superthread/doc/mode.js?url&no-inline";
import weaveUrl from "@/components/superthread/doc/weave.js?url&no-inline";
import docCss from "@/components/superthread/styles/doc.css?url";
import tokensCss from "@/components/superthread/styles/superthread-plain.css?url";
import { InstallLine } from "@/site/InstallLine";
import { PageHead } from "@/site/PageHead";
import { Section } from "@/site/Section";
import "@/styles/doc.css";

const partials = import.meta.glob("@/components/superthread/doc/sections/*.html", {
  query: "?raw",
  import: "default",
  eager: true,
}) as Record<string, string>;

const groups = Object.entries(docSectionGroups).map(([id, sections]) => ({
  id,
  title: id === "endings" ? "endings and controls" : id,
  sections,
}));

export const Route = createLazyFileRoute("/compositions/doc")({ component: Documents });

function Documents() {
  return (
    <>
      <PageHead
        title="documents"
        lede="plain html sections for reports, briefs and other documents. copy a section and change its words."
      >
        <InstallLine items={["doc"]} />
      </PageHead>
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

function Specimen({ name }: { name: string }) {
  const title = name.replaceAll("-", " ");
  const html = Object.entries(partials).find(([path]) => path.endsWith(`/${name}.html`))?.[1];
  if (html === undefined) throw new Error(`missing doc partial: ${name}`);
  const bleed = ["hero", "slim-head", "band", "footer", "draft-strip"].includes(name);
  return (
    <div className="st-doc-specimen">
      <h3 className="type-subtitle">{title}</h3>
      <div className="st-doc-panes">
        <iframe className="st-doc-preview" title={`${title} preview`} loading="lazy" srcDoc={preview(html, bleed)} />
        <pre className="st-doc-html" tabIndex={0} aria-label={`${title} html`}>
          <code>{html}</code>
        </pre>
      </div>
    </div>
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
  new ResizeObserver(() => {
    frameElement.style.height = Math.ceil(document.body.getBoundingClientRect().height) + "px";
  }).observe(document.body);
  document.addEventListener("click", (event) => {
    if (event.target.closest('a[href^="#"]')) event.preventDefault();
  });
</script>
</body>
</html>`;
}
