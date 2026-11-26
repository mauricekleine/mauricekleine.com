import { createFileRoute } from "@tanstack/react-router";
import { fleet, home } from "@/components/superthread/lib/fleet";
import { allMarksZipUrl, markPngUrl, markZipUrl, pngSizes } from "@/foundations/mark-downloads";
import { markUrl, tabColor } from "@/foundations/marks";
import { modes } from "@/foundations/master";
import { PageHead } from "@/site/PageHead";

const marks = [home, ...fleet];

export const Route = createFileRoute("/icons")({
  staticData: { sections: marks.map((mark) => ({ id: mark.id, title: mark.name })) },
  component: Page,
});

function Page() {
  return (
    <>
      <PageHead
        title="Icons"
        lede="Every mark, in both chromes. Pick an SVG or a PNG size in pixels. Every PNG keeps the hard edges and transparent corner notches of the 16 px drawing."
      >
        <a className="st-icons-all" href={allMarksZipUrl} download>
          Download all marks · zip
        </a>
      </PageHead>
      <div className="st-icons">
        {marks.map((mark) => (
          <section key={mark.id} id={mark.id} aria-labelledby={`${mark.id}-title`} className="st-icon">
            <header className="st-icon-head">
              <h2 id={`${mark.id}-title`} className="type-subtitle">
                {mark.name}
              </h2>
              <a
                href={markZipUrl(mark.id)}
                download
                aria-label={`Download ${mark.name}, both chromes and all sizes, zip`}
              >
                Download zip
              </a>
            </header>
            <div className="st-icon-themes">
              {modes.map((mode) => (
                <div className="st-icon-theme" key={mode}>
                  <div className="st-icon-preview" style={{ background: tabColor(mode) }}>
                    <img src={markUrl(mark.id, mode)} alt={`${mark.name} for ${mode} chrome`} width={48} height={48} />
                  </div>
                  <div className="st-icon-files">
                    <h3 className="type-meta">{mode === "light" ? "Light" : "Dark"} chrome</h3>
                    <a href={markUrl(mark.id, mode)} download aria-label={`Download ${mark.name}, ${mode} chrome, SVG`}>
                      SVG
                    </a>
                    <ul aria-label={`${mark.name}, ${mode} chrome, PNG sizes in pixels`}>
                      {pngSizes.map((size) => (
                        <li key={size}>
                          <a
                            href={markPngUrl(mark.id, mode, size)}
                            download
                            aria-label={`Download ${mark.name}, ${mode} chrome, ${size} px PNG`}
                          >
                            {size}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </>
  );
}
