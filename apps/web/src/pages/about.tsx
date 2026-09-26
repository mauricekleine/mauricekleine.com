import { Hero, Section, Footer, Waypoint, ElsewhereLinks } from '../components'
export function AboutPage() {
  return (
    <>
      <Hero className="hero">
        <span className="portrait-wrap">
          <img className="portrait" src="maurice-192.webp" srcSet="maurice-96.webp 1x, maurice-192.webp 2x, maurice-288.webp 3x" alt="Portrait of Maurice Kleine" width="96" height="96" />
          <span className="moon" aria-hidden="true"></span>
        </span>
        <h1>maurice kleine</h1>
        <p className="tagline">build it till you make it</p>
        <p className="hero-meta"><a href="/">← back to home</a> · <a href="/essays">essays</a></p>
      </Hero>

      <Section aria-labelledby="about-heading">
        <h2 id="about-heading">about</h2>
        <p>
          i'm based in amsterdam. started studying psychology, switched to tech
          when i wanted something more concrete. what began as a late start in
          coding turned into 14+ years of building software.
        </p>
        <p>
          while at uni, i built a logistics system out of frustration with how
          data was handled at my part-time job. six years later, i sold it.
          small exit but i'm proud of it. from there i did frontend, backend,
          product, and eventually managed teams of devs.
        </p>
        <p>
          in 2023 i co-founded subthread, where we built dozens of ai products:
          chatbots, recruitment pipelines, consumer apps. that opened my eyes
          to how powerful ai can be for businesses of all sizes. these days
          i'm ai engineering lead at{' '}
          {' '}<a href="https://waimakers.com">waimakers</a>, helping organizations
          put ai to work.
        </p>
        <p>
          i'd freelanced for waimakers for years, and somewhere along the way
          i started sitting in on scoping calls and checking proposals from
          the engineering side. nobody asked me to. in august 2026 they turned
          that habit into a job: i now own engineering there, the pod, the
          people, and the line from one-off builds to our own products.
        </p>
      </Section>

      <Section aria-labelledby="build-heading">
        <h2 id="build-heading">what i build</h2>
        <p>
          i treat life as a series of experiments. same goes for products:
          ship small things, learn from them, keep iterating. even the failed
          experiments are worth it as long as you keep learning.
        </p>
        <p>current side quests:</p>
        <ul className="waypoints">
          <Waypoint constellation="mockly">
            <span className="glyph" aria-hidden="true">✦</span>
            <div>
              {' '}<a href="https://getmockly.com">mockly</a>{' '}
              <p>
                fake chat screenshots for 17+ platforms. built it in a weekend,
                {' '}<a href="https://techcrunch.com/2025/07/10/mockly-made-a-fake-dm-generator-thats-actually-user-friendly/">techcrunch</a> wrote about it, 10k people use it.
                now i run it with <a href="https://x.com/jasperdeboer">jasper</a>.
                i still can't believe this is legal
              </p>
            </div>
          </Waypoint>
          <Waypoint constellation="fluncle">
            <span className="glyph" aria-hidden="true">✦</span>
            <div>
              {' '}<a href="https://www.fluncle.com">fluncle</a>{' '}
              <p>
                drum &amp; bass bangers from another dimension. it has a radio,
                an api, and an ssh rave terminal
              </p>
            </div>
          </Waypoint>
          <Waypoint constellation="hackadam">
            <span className="glyph" aria-hidden="true">✦</span>
            <div>
              {' '}<a href="https://hackadam.nl">hackadam</a>{' '}
              <p>
                monthly meetup in amsterdam for indie makers building their own
                stuff. co-organized with
                {' '}<a href="https://x.com/AbnerHout">abner</a>{' '}
              </p>
            </div>
          </Waypoint>
          <Waypoint constellation="nonobench">
            <span className="glyph" aria-hidden="true">✦</span>
            <div>
              {' '}<a href="https://nonobench.com">nonobench</a>{' '}
              <p>
                benchmark for how well llms solve nonogram puzzles. the top
                score went from 63% in february to 93% in september
              </p>
            </div>
          </Waypoint>
        </ul>
      </Section>

      <Section aria-labelledby="community-heading">
        <h2 id="community-heading">community</h2>
        <p>
          i co-organize <a href="https://hackadam.nl">hackadam</a> with
          {' '}<a href="https://x.com/AbnerHout">abner</a>, a monthly meetup in
          amsterdam for indie makers building their own stuff. we meet, share
          what we're working on, have lunch, do demos, hang out. part of the
          HACKA* network.
        </p>
        <p>
          building alone can be isolating. having people who get the journey,
          wins and failures, makes it more sustainable.
        </p>
      </Section>

      <Section aria-labelledby="philosophy-heading">
        <h2 id="philosophy-heading">philosophy</h2>
        <p>
          most of what i do comes down to a few principles: progress is the
          goal, life is absurdly valuable and needs protecting, and the two
          shouldn't destroy each other. not progress at all cost, but most
          things should help us move forward.
        </p>
        <p>
          the strategy is to tinker as much as possible. less top-down
          planning, more trial and error. ship things, see what happens,
          collect as many black swan opportunities as you can. any experiment
          is worth it as long as you keep learning.
        </p>
        <p>
          i want the biggest comfort zone possible. growth comes from stepping
          outside it, but you need a safe base to return to. travel, building,
          community: they all expand that zone.
        </p>
        <p>
          it's incredibly coincidental that we're here. we need to leverage
          that. propel things forward lest we fade into obscurity. that's what
          keeps me building.
        </p>
      </Section>

      <Section aria-labelledby="connect-heading">
        <h2 id="connect-heading">connect</h2>
        <ElsewhereLinks />
      </Section>

      <Footer>
        <p>amsterdam</p>
      </Footer>
    </>
  )
}
