import { Hero, Section } from '../components'
export function LostPage() {
  return (
    <>
      <Hero className="hero">
        <p className="err-code">err_404: trajectory unknown</p>
        <h1>lost in space</h1>
        <p className="tagline">
          this page drifted out of orbit.<br />or it never existed. hard to
          tell from up here.
        </p>
      </Hero>

      <Section aria-label="where to go instead">
        <p>
          it's not in <a href="/#graveyard">the graveyard</a> either, i
          checked. the stars are nice though. you could stay a minute.
        </p>
        <p className="more-link"><a href="/">← back to earth</a></p>
      </Section>
    </>
  )
}
