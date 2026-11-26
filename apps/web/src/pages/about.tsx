import { ElsewhereLinks, Footer, Opener, Section, SideQuests } from "../components";
import { sideQuests } from "../projects";
import { Shell } from "../shell";

const sections = [
  { id: "about", title: "About" },
  { id: "build", title: "What I build" },
  { id: "community", title: "Community" },
  { id: "philosophy", title: "Philosophy" },
  { id: "connect", title: "Connect" },
];

export function AboutPage() {
  return (
    <Shell
      place="about"
      crumb="Maurice Kleine"
      title="About"
      sections={sections}
      opener={
        <Opener kicker="Amsterdam, NL">
          <h1 className="mk-page-title">Maurice Kleine</h1>
          <p className="mk-lede type-lede">Build it till you make it.</p>
        </Opener>
      }
    >
      <Section id="about" title="About" className="prose">
        <p>
          I'm based in Amsterdam. Started studying psychology, switched to tech when I wanted something more concrete.
          What began as a late start in coding turned into 14+ years of building software.
        </p>
        <p>
          While at uni, I built a logistics system out of frustration with how data was handled at my part-time job. Six
          years later, I sold it. Small exit, but I'm proud of it. From there I did frontend, backend, product, and
          eventually managed teams of devs.
        </p>
        <p>
          In 2023 I co-founded Subthread, where we built dozens of AI products: chatbots, recruitment pipelines,
          consumer apps. That opened my eyes to how powerful AI can be for businesses of all sizes. These days I'm AI
          Engineering Lead at <a href="https://waimakers.com">Waimakers</a>, helping organizations put AI to work.
        </p>
        <p>
          I'd freelanced for Waimakers for years, and somewhere along the way I started sitting in on scoping calls and
          checking proposals from the engineering side. Nobody asked me to. In August 2026 they turned that habit into a
          job: I now own engineering there, the pod, the people, and the line from one-off builds to our own products.
        </p>
      </Section>

      <Section id="build" title="What I build" className="prose">
        <p>
          I treat life as a series of experiments. Same goes for products: ship small things, learn from them, keep
          iterating. Even the failed experiments are worth it as long as you keep learning.
        </p>
        <p>Current side quests:</p>
        <SideQuests />
      </Section>

      <Section id="community" title="Community" className="prose">
        <p>
          I co-organize <a href={sideQuests.hackadam.url}>Hackadam</a> with <a href="https://x.com/AbnerHout">Abner</a>,
          a monthly meetup in Amsterdam for indie makers building their own stuff. We meet, share what we're working on,
          have lunch, do demos, hang out. Part of the HACKA* network.
        </p>
        <p>
          Building alone can be isolating. Having people who get the journey, wins and failures, makes it more
          sustainable.
        </p>
      </Section>

      <Section id="philosophy" title="Philosophy" className="prose">
        <p>
          Most of what I do comes down to a few principles: progress is the goal, life is absurdly valuable and needs
          protecting, and the two shouldn't destroy each other. Not progress at all cost, but most things should help us
          move forward.
        </p>
        <p>
          The strategy is to tinker as much as possible. Less top-down planning, more trial and error. Ship things, see
          what happens, collect as many black swan opportunities as you can. Any experiment is worth it as long as you
          keep learning.
        </p>
        <p>
          I want the biggest comfort zone possible. Growth comes from stepping outside it, but you need a safe base to
          return to. Travel, building, community: they all expand that zone.
        </p>
        <p>
          It's incredibly coincidental that we're here. We need to leverage that. Propel things forward lest we fade
          into obscurity. That's what keeps me building.
        </p>
      </Section>

      <Section id="connect" title="Connect">
        <ElsewhereLinks />
      </Section>

      <Footer>
        <p className="type-meta">Amsterdam</p>
      </Footer>
    </Shell>
  );
}
