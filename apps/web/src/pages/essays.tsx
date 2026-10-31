import { EssayList, Footer, PageHead, Section, Subscribe } from "../components";
import { Shell } from "../shell";

const sections = [
  { id: "all-essays", title: "all essays" },
  { id: "subscribe", title: "new essays by email" },
];

export function EssaysPage() {
  return (
    <Shell place="essays" crumb="maurice kleine" title="essays" sections={sections}>
      <PageHead>
        <h1 className="type-hero">essays</h1>
        <p className="mk-lede type-lede">
          longer thoughts, first posted on x and linkedin.
          <br />
          mirrored here so they have a home
        </p>
      </PageHead>

      <Section id="all-essays" title="all essays" hideTitle>
        <EssayList variant="index" />
      </Section>

      <Subscribe />

      <Footer>
        <p className="type-meta">amsterdam</p>
      </Footer>
    </Shell>
  );
}
