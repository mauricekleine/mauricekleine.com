import { Hero, Section, Footer, EssayList, Subscribe } from '../components'
export function EssaysPage() {
  return (
    <>
      <Hero className="hero page-hero">
        <p className="hero-meta"><a href="/">← back to home</a></p>
        <h1>essays</h1>
        <p className="tagline">
          longer thoughts, first posted on x and linkedin.<br />mirrored here so they have a home
        </p>
      </Hero>

      <Section aria-labelledby="essays-heading">
        <h2 id="essays-heading" className="visually-hidden">all essays</h2>
        <EssayList variant="index" />
      </Section>

      <Subscribe />

      <Footer>
        <p>amsterdam</p>
      </Footer>
    </>
  )
}
