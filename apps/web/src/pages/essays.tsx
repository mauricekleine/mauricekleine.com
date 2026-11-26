import { EssayList, Footer, Opener, Section, Subscribe } from "../components";
import { Shell } from "../shell";

const sections = [
  { id: "all-essays", title: "All essays" },
  { id: "subscribe", title: "New essays by email" },
];

export function EssaysPage() {
  return (
    <Shell
      place="essays"
      crumb="Maurice Kleine"
      title="Essays"
      sections={sections}
      opener={
        <Opener kicker="Writing">
          <h1 className="mk-page-title">Essays</h1>
          <p className="mk-lede type-lede">
            Longer thoughts, first posted on X and LinkedIn. Mirrored here so they have a home.
          </p>
        </Opener>
      }
    >
      <Section id="all-essays" title="All essays" hideTitle>
        <EssayList variant="index" />
      </Section>

      <Subscribe />

      <Footer>
        <p className="type-meta">Amsterdam</p>
      </Footer>
    </Shell>
  );
}
