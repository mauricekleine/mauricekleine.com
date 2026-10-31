import { ElsewhereLinks, EssayList, Footer, GraveyardItem, Opener, Section, SideQuests } from "../components";
import { Shell } from "../shell";

const sections = [
  { id: "currently", title: "currently" },
  { id: "side-quests", title: "side quests" },
  { id: "graveyard", title: "the graveyard" },
  { id: "essays", title: "essays" },
  { id: "elsewhere", title: "elsewhere" },
];

export function HomePage() {
  return (
    <Shell place="home" crumb="maurice kleine" title="home" sections={sections}>
      <Opener title="maurice kleine" portrait>
        <p className="mk-lede type-lede">
          i build small internet things
          <br />
          and sometimes they work
        </p>
        <p className="mk-where type-meta">amsterdam, nl</p>
      </Opener>

      <Section id="currently" title="currently" className="prose">
        <p>
          ai engineering lead at <a href="https://waimakers.com">waimakers</a>, helping organizations put ai to work.
          before that: 14+ years of building software as an engineer, product owner, engineering manager, and founder.
        </p>
        <p>
          that's the day job. everything below happens after dinner, and these days a fleet of coding agents does most
          of the typing. <a href="/essays/my-agents-merged-468-prs">468 prs in 23 days</a>, and i didn't read a single
          one.
        </p>
      </Section>

      <Section id="side-quests" title="side quests">
        <SideQuests />
      </Section>

      <Section id="graveyard" title="the graveyard">
        <p className="section-intro">
          life is a series of experiments. some of them end, and that's fine, as long as you keep learning.
        </p>
        <ul className="graveyard">
          <GraveyardItem name="logistics system" stamp="sold" exit years="2013–2019">
            built at uni because my part-time job ran on spreadsheets and hope. sold it six years later. small exit,
            still proud
          </GraveyardItem>
          <GraveyardItem name="subthread" stamp="dissolved" years="2023–2025">
            co-founded a studio, shipped dozens of ai products. chatbots, recruitment pipelines, consumer apps. learned
            how much ai can do for normal businesses
          </GraveyardItem>
          <GraveyardItem name="onesixtyeight" stamp="discontinued" years="2025–2026">
            functional mushroom blend for focus. turns out atoms are harder than bits
          </GraveyardItem>
          <GraveyardItem name="spinup" stamp="spun down" exit years="2025–2026">
            cloud agent runtime on firecracker microvms. joining waimakers was part of the deal, so it counts as an
            exit. probably
          </GraveyardItem>
        </ul>
      </Section>

      <Section id="essays" title="essays">
        <EssayList variant="home" />
        <p className="more-link">
          <a href="/essays">all essays →</a>
        </p>
      </Section>

      <Section id="elsewhere" title="elsewhere">
        <ElsewhereLinks />
        <p className="said-out-loud">
          said out loud:{" "}
          <a href="https://amsterdam.aitinkerers.org/profile/client_kBU1ebRuvug">ai tinkerers amsterdam</a> ·{" "}
          <a href="https://open.spotify.com/show/6qrTPgmddsRwlreYeKu7Ki">ai, je nieuwe collega</a> (dutch) ·{" "}
          <a href="https://www.youtube.com/watch?v=RDPkCs7foXs">demystifying ai</a> ·{" "}
          <a href="https://startremote.webflow.io/interviews/maurice-kleine">startremote</a> (2020)
        </p>
        <p className="more-link">
          <a href="/about">more about me →</a>
        </p>
      </Section>

      <Footer />
    </Shell>
  );
}
