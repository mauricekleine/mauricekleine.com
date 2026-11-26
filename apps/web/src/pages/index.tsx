import {
  ElsewhereLinks,
  EssayList,
  Footer,
  Graveyard,
  GraveyardItem,
  Opener,
  Section,
  SideQuests,
} from "../components";
import { Shell } from "../shell";

const sections = [
  { id: "currently", title: "Currently" },
  { id: "side-quests", title: "Side quests" },
  { id: "graveyard", title: "The graveyard" },
  { id: "essays", title: "Essays" },
  { id: "elsewhere", title: "Elsewhere" },
];

export function HomePage() {
  return (
    <Shell
      place="home"
      crumb="Maurice Kleine"
      title="Home"
      sections={sections}
      opener={
        <Opener
          home
          kicker="Amsterdam, NL"
          plateSrc="/maurice.png"
          plateLabel="Portrait of Maurice Kleine"
          action={
            <a href="#currently">
              Keep reading <span aria-hidden="true">↓</span>
            </a>
          }
        >
          <h1>Maurice Kleine</h1>
          <p className="mk-lede type-lede">I build small internet things, and sometimes they work.</p>
        </Opener>
      }
    >
      <Section id="currently" title="Currently" className="prose">
        <p>
          AI Engineering Lead at <a href="https://waimakers.com">Waimakers</a>, helping organizations put AI to work.
          Before that: 14+ years of building software as an engineer, product owner, engineering manager, and founder.
        </p>
        <p>
          That's the day job. Everything below happens after dinner, and these days a fleet of coding agents does most
          of the typing. <a href="/essays/my-agents-merged-468-prs">468 PRs in 23 days</a>, and I didn't read a single
          one.
        </p>
      </Section>

      <Section id="side-quests" title="Side quests">
        <SideQuests />
      </Section>

      <Section id="graveyard" title="The graveyard">
        <p className="section-intro">
          Life is a series of experiments. Some of them end, and that's fine, as long as you keep learning.
        </p>
        <Graveyard>
          <GraveyardItem name="Logistics system" stamp="Sold" exit years="2013–2019">
            Built at uni because my part-time job ran on spreadsheets and hope. Sold it six years later. Small exit,
            still proud.
          </GraveyardItem>
          <GraveyardItem name="Subthread" stamp="Dissolved" years="2023–2025">
            Co-founded a studio, shipped dozens of AI products. Chatbots, recruitment pipelines, consumer apps. Learned
            how much AI can do for normal businesses.
          </GraveyardItem>
          <GraveyardItem name="Onesixtyeight" stamp="Discontinued" years="2025–2026">
            Functional mushroom blend for focus. Turns out atoms are harder than bits.
          </GraveyardItem>
          <GraveyardItem name="Spinup" stamp="Spun down" exit years="2025–2026">
            Cloud agent runtime on Firecracker microVMs. Joining Waimakers was part of the deal, so it counts as an
            exit. Probably.
          </GraveyardItem>
        </Graveyard>
      </Section>

      <Section id="essays" title="Essays">
        <EssayList variant="home" />
        <p className="more-link">
          <a href="/essays">All essays →</a>
        </p>
      </Section>

      <Section id="elsewhere" title="Elsewhere">
        <ElsewhereLinks />
        <p className="said-out-loud">
          Said out loud:{" "}
          <a href="https://amsterdam.aitinkerers.org/profile/client_kBU1ebRuvug">AI Tinkerers Amsterdam</a> ·{" "}
          <a href="https://open.spotify.com/show/6qrTPgmddsRwlreYeKu7Ki">AI, je nieuwe collega</a> (Dutch) ·{" "}
          <a href="https://www.youtube.com/watch?v=RDPkCs7foXs">Demystifying AI</a> ·{" "}
          <a href="https://startremote.webflow.io/interviews/maurice-kleine">StartRemote</a> (2020)
        </p>
        <p className="more-link">
          <a href="/about">More about me →</a>
        </p>
      </Section>

      <Footer />
    </Shell>
  );
}
