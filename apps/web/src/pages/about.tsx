import { ElsewhereLinks, Footer, Opener, Section, SideQuests } from "../components";
import { sideQuests } from "../projects";
import { Shell } from "../shell";

const sections = [
  { id: "about", title: "about" },
  { id: "build", title: "what i build" },
  { id: "community", title: "community" },
  { id: "philosophy", title: "philosophy" },
  { id: "connect", title: "connect" },
];

export function AboutPage() {
  return (
    <Shell place="about" crumb="maurice kleine" title="about" sections={sections}>
      <Opener title="maurice kleine" portrait>
        <p className="mk-lede type-lede">build it till you make it</p>
      </Opener>

      <Section id="about" title="about" className="prose">
        <p>
          i'm based in amsterdam. started studying psychology, switched to tech when i wanted something more concrete.
          what began as a late start in coding turned into 14+ years of building software.
        </p>
        <p>
          while at uni, i built a logistics system out of frustration with how data was handled at my part-time job. six
          years later, i sold it. small exit but i'm proud of it. from there i did frontend, backend, product, and
          eventually managed teams of devs.
        </p>
        <p>
          in 2023 i co-founded subthread, where we built dozens of ai products: chatbots, recruitment pipelines,
          consumer apps. that opened my eyes to how powerful ai can be for businesses of all sizes. these days i'm ai
          engineering lead at <a href="https://waimakers.com">waimakers</a>, helping organizations put ai to work.
        </p>
        <p>
          i'd freelanced for waimakers for years, and somewhere along the way i started sitting in on scoping calls and
          checking proposals from the engineering side. nobody asked me to. in august 2026 they turned that habit into a
          job: i now own engineering there, the pod, the people, and the line from one-off builds to our own products.
        </p>
      </Section>

      <Section id="build" title="what i build" className="prose">
        <p>
          i treat life as a series of experiments. same goes for products: ship small things, learn from them, keep
          iterating. even the failed experiments are worth it as long as you keep learning.
        </p>
        <p>current side quests:</p>
        <SideQuests />
      </Section>

      <Section id="community" title="community" className="prose">
        <p>
          i co-organize <a href={sideQuests.hackadam.url}>hackadam</a> with <a href="https://x.com/AbnerHout">abner</a>,
          a monthly meetup in amsterdam for indie makers building their own stuff. we meet, share what we're working on,
          have lunch, do demos, hang out. part of the HACKA* network.
        </p>
        <p>
          building alone can be isolating. having people who get the journey, wins and failures, makes it more
          sustainable.
        </p>
      </Section>

      <Section id="philosophy" title="philosophy" className="prose">
        <p>
          most of what i do comes down to a few principles: progress is the goal, life is absurdly valuable and needs
          protecting, and the two shouldn't destroy each other. not progress at all cost, but most things should help us
          move forward.
        </p>
        <p>
          the strategy is to tinker as much as possible. less top-down planning, more trial and error. ship things, see
          what happens, collect as many black swan opportunities as you can. any experiment is worth it as long as you
          keep learning.
        </p>
        <p>
          i want the biggest comfort zone possible. growth comes from stepping outside it, but you need a safe base to
          return to. travel, building, community: they all expand that zone.
        </p>
        <p>
          it's incredibly coincidental that we're here. we need to leverage that. propel things forward lest we fade
          into obscurity. that's what keeps me building.
        </p>
      </Section>

      <Section id="connect" title="connect">
        <ElsewhereLinks />
      </Section>

      <Footer>
        <p className="type-meta">amsterdam</p>
      </Footer>
    </Shell>
  );
}
