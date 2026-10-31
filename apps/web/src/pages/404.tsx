import { Opener, Section } from "../components";
import { Shell } from "../shell";

export function LostPage() {
  return (
    <Shell crumb="maurice kleine" title="lost" interactive={false}>
      <Opener title="lost in space">
        <p className="err-code type-meta">err_404: trajectory unknown</p>
        <p className="mk-lede type-lede">
          this page drifted out of orbit.
          <br />
          or it never existed. hard to tell from up here.
        </p>
      </Opener>

      <Section id="elsewhere" title="where to go instead" hideTitle className="prose">
        <p>
          it's not in <a href="/#graveyard">the graveyard</a> either, i checked. the stars are nice though. you could
          stay a minute.
        </p>
        <p className="more-link">
          <a href="/">← back to earth</a>
        </p>
      </Section>
    </Shell>
  );
}
