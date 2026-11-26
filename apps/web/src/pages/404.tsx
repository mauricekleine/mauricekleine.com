import { Opener, Section } from "../components";
import { Shell } from "../shell";

export function LostPage() {
  return (
    <Shell
      crumb="Maurice Kleine"
      title="Lost"
      interactive={false}
      opener={
        <Opener kicker="ERR_404 · Trajectory unknown">
          <h1 className="mk-page-title">Lost in space</h1>
          <p className="mk-lede type-lede">
            This page drifted out of orbit. Or it never existed. Hard to tell from up here.
          </p>
        </Opener>
      }
    >
      <Section id="elsewhere" title="Where to go instead" hideTitle className="prose">
        <p>
          It's not in <a href="/#graveyard">the graveyard</a> either, I checked. No map out here, so home is probably
          your best bet.
        </p>
        <p className="more-link">
          <a href="/">← Back to Earth</a>
        </p>
      </Section>
    </Shell>
  );
}
