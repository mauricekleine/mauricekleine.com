import { Hero, Section, Footer, Waypoint, ElsewhereLinks, GraveyardItem, EssayList } from '../components'
export function HomePage() {
  return (
    <>
      <Hero className="hero">
        <span className="portrait-wrap">
          <img className="portrait" src="maurice-192.webp" srcSet="maurice-96.webp 1x, maurice-192.webp 2x, maurice-288.webp 3x" alt="Portrait of Maurice Kleine" width="96" height="96" />
          <span className="moon" aria-hidden="true"></span>
        </span>
        <h1>maurice kleine</h1>
        <p className="tagline">
          i build small internet things<br />and sometimes they work
        </p>
        <p className="hero-meta">amsterdam, nl</p>
      </Hero>

      <Section aria-labelledby="currently-heading">
        <h2 id="currently-heading">currently</h2>
        <p>
          ai engineering lead at{' '}
          {' '}<a href="https://waimakers.com">waimakers</a>, helping organizations
          put ai to work. before that: 14+ years of building software as an
          engineer, product owner, engineering manager, and founder.
        </p>
        <p>
          that's the day job. everything below happens after dinner, and these
          days a fleet of coding agents does most of the typing.
          {' '}<a href="/essays/my-agents-merged-468-prs">468 prs in 23 days</a>,
          and i didn't read a single one.
        </p>
      </Section>

      <Section aria-labelledby="side-quests-heading">
        <h2 id="side-quests-heading">side quests</h2>
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

      <Section id="graveyard" aria-labelledby="graveyard-heading">
        <h2 id="graveyard-heading">the graveyard</h2>
        <p className="section-intro">
          life is a series of experiments. some of them end, and that's fine,
          as long as you keep learning.
        </p>
        <ul className="waypoints graveyard">
          <GraveyardItem>
            <span className="glyph" aria-hidden="true">✧</span>
            <div>
              <p className="grave-title">
                <span className="name">logistics system</span>{' '}
                <span className="stamp stamp-exit">sold</span>{' '}
                <span className="years">2013–2019</span>
              </p>
              <p>
                built at uni because my part-time job ran on spreadsheets and
                hope. sold it six years later. small exit, still proud
              </p>
            </div>
          </GraveyardItem>
          <GraveyardItem>
            <span className="glyph" aria-hidden="true">✧</span>
            <div>
              <p className="grave-title">
                <span className="name">subthread</span>{' '}
                <span className="stamp">dissolved</span>{' '}
                <span className="years">2023–2025</span>
              </p>
              <p>
                co-founded a studio, shipped dozens of ai products. chatbots,
                recruitment pipelines, consumer apps. learned how much ai can
                do for normal businesses
              </p>
            </div>
          </GraveyardItem>
          <GraveyardItem>
            <span className="glyph" aria-hidden="true">✧</span>
            <div>
              <p className="grave-title">
                <span className="name">onesixtyeight</span>{' '}
                <span className="stamp">discontinued</span>{' '}
                <span className="years">2025–2026</span>
              </p>
              <p>
                functional mushroom blend for focus. turns out atoms are harder
                than bits
              </p>
            </div>
          </GraveyardItem>
          <GraveyardItem>
            <span className="glyph" aria-hidden="true">✧</span>
            <div>
              <p className="grave-title">
                <span className="name">spinup</span>{' '}
                <span className="stamp stamp-exit">spun down</span>{' '}
                <span className="years">2025–2026</span>
              </p>
              <p>
                cloud agent runtime on firecracker microvms. joining waimakers
                was part of the deal, so it counts as an exit. probably
              </p>
            </div>
          </GraveyardItem>
        </ul>
      </Section>

      <Section aria-labelledby="essays-heading">
        <h2 id="essays-heading">essays</h2>
        <EssayList variant="home" />
        <p className="more-link"><a href="/essays">all essays →</a></p>
      </Section>

      <Section aria-labelledby="elsewhere-heading">
        <h2 id="elsewhere-heading">elsewhere</h2>
        <ElsewhereLinks />
        <p className="said-out-loud">
          said out loud:
          {' '}<a href="https://amsterdam.aitinkerers.org/profile/client_kBU1ebRuvug">ai tinkerers amsterdam</a>{' '}
          ·
          {' '}<a href="https://open.spotify.com/show/6qrTPgmddsRwlreYeKu7Ki">ai, je nieuwe collega</a>{' '}
          (dutch) ·
          {' '}<a href="https://www.youtube.com/watch?v=RDPkCs7foXs">demystifying ai</a>{' '}
          ·
          {' '}<a href="https://startremote.webflow.io/interviews/maurice-kleine">startremote</a>{' '}
          (2020)
        </p>
        <p className="more-link"><a href="/about">more about me →</a></p>
      </Section>

      <Footer>
        <p>
          <span className="status-dot" aria-hidden="true"></span>{' '}status:
          operational · sleep: degraded · ideas: backlogged
        </p>
      </Footer>
    </>
  )
}
