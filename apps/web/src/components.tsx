import { useEffect, type ComponentProps, type ReactNode } from "react";
import { Badge } from "@/components/superthread/ui/badge";
import { Field, FieldLabel } from "@/components/superthread/ui/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/superthread/ui/input-group";
import { useTheme } from "@/components/superthread/lib/theme";
import type { Essay } from "./essay-content";
import { essays } from "./essay-content";
import { sideQuests } from "./projects";

export function EssayList({ variant }: { variant: "home" | "index" }) {
  const cover = variant === "index";
  return (
    <ol className="essay-list" reversed>
      {essays.map((essay, index) => (
        <EssayListItem key={essay.slug} essay={essay} cover={cover} eager={index === 0} />
      ))}
    </ol>
  );
}

// Corner crop marks: 10 px ticks set 16 px outside a screened field, as a printer marks a plate.
function CropMarks() {
  return (
    <span className="mk-crop" aria-hidden="true">
      <i />
      <i />
      <i />
      <i />
    </span>
  );
}

// Maurice as a two-ink screen: the master ink's own 4 x 4 bayer, one file per mode so the ink always falls on the
// light of the face. Click it: there's a moon.
function Portrait() {
  return (
    <span className="portrait-wrap">
      {(["light", "dark"] as const).map((mode) => (
        <picture key={mode} className={`portrait portrait-${mode}`}>
          <source media="(max-width: 600px)" srcSet={`/portrait/maurice-136-${mode}.png`} />
          <img src={`/portrait/maurice-196-${mode}.png`} alt="Portrait of Maurice Kleine" width="196" height="196" />
        </picture>
      ))}
      <span className="moon" aria-hidden="true"></span>
    </span>
  );
}

// The screened field inside its crop marks: the live sky (sky.js), and a printed plate of it for anyone without
// scripts. `slim` is the inner pages' band.
function Band({ slim = false, children }: { slim?: boolean; children?: ReactNode }) {
  return (
    <div className={slim ? "mk-field mk-field-slim" : "mk-field"}>
      <canvas id="sky" aria-hidden="true" suppressHydrationWarning />
      <CropMarks />
      {children}
    </div>
  );
}

// The opener: the band with the title knocked out of its lower left, then the lede. The page's "top" in the aside.
export function Opener({
  title,
  portrait = false,
  children,
}: {
  title: string;
  portrait?: boolean;
  children?: ReactNode;
}) {
  return (
    <header id="top" className="mk-opener">
      <div className="mk-band">
        <Band>{portrait && <Portrait />}</Band>
        <div className={portrait ? "mk-knock mk-knock-stacked" : "mk-knock"}>
          <h1>{title}</h1>
        </div>
      </div>
      {children}
    </header>
  );
}

// An inner page's head: the slim band, the title under it clear of the marks, then whatever the page says next.
export function PageHead({ children }: { children: ReactNode }) {
  return (
    <header id="top" className="mk-pagehead">
      <Band slim />
      {children}
    </header>
  );
}

// A page section on the 64/44 rhythm: a rule across the whole column, then the heading and the body. Its id is the
// anchor "on this page" links to.
export function Section({
  id,
  title,
  hideTitle = false,
  children,
  ...props
}: Omit<ComponentProps<"section">, "title"> & { id: string; title: string; hideTitle?: boolean }) {
  const heading = `${id}-heading`;
  return (
    <section id={id} aria-labelledby={heading} {...props} className={`mk-section ${props.className ?? ""}`.trim()}>
      <h2 id={heading} className={hideTitle ? "visually-hidden" : "type-section"}>
        {title}
      </h2>
      {children}
    </section>
  );
}

// A side quest's constellation, drawn at 1:1 so its stars stay whole pixels. It takes the house ink when you reach for
// its project.
const constellations = {
  // a slightly wonky chat bubble
  mockly: {
    points: [
      [0, 0],
      [72, 6],
      [66, 46],
      [30, 42],
      [16, 62],
      [4, 40],
    ],
    lines: [
      [0, 1],
      [1, 2],
      [2, 3],
      [3, 4],
      [4, 5],
      [5, 0],
    ],
  },
  // a waveform, obviously
  fluncle: {
    points: [
      [0, 30],
      [22, 8],
      [38, 40],
      [56, 0],
      [72, 34],
      [92, 14],
    ],
    lines: [
      [0, 1],
      [1, 2],
      [2, 3],
      [3, 4],
      [4, 5],
    ],
  },
  // a little clubhouse
  hackadam: {
    points: [
      [0, 52],
      [0, 20],
      [34, 0],
      [68, 20],
      [68, 52],
    ],
    lines: [
      [0, 1],
      [1, 2],
      [2, 3],
      [3, 4],
      [4, 0],
    ],
  },
  // a nonogram grid. llms can't solve this one either
  nonobench: {
    points: [
      [0, 0],
      [30, 0],
      [60, 0],
      [60, 30],
      [60, 60],
      [30, 60],
      [0, 60],
      [0, 30],
    ],
    lines: [
      [0, 2],
      [2, 4],
      [4, 6],
      [6, 0],
      [1, 5],
      [7, 3],
    ],
  },
} satisfies Record<string, { points: number[][]; lines: number[][] }>;

const TILE = { width: 104, height: 72 };

function Constellation({ name }: { name: keyof typeof constellations }) {
  const { points, lines } = constellations[name];
  const dx = Math.round((TILE.width - Math.max(...points.map(([x]) => x))) / 2);
  const dy = Math.round((TILE.height - Math.max(...points.map(([, y]) => y))) / 2);
  return (
    <svg
      className="constellation"
      viewBox={`0 0 ${TILE.width} ${TILE.height}`}
      width={TILE.width}
      height={TILE.height}
      shapeRendering="crispEdges"
      aria-hidden="true"
    >
      {lines.map(([from, to]) => (
        <line
          key={`${from}-${to}`}
          x1={points[from][0] + dx}
          y1={points[from][1] + dy}
          x2={points[to][0] + dx}
          y2={points[to][1] + dy}
        />
      ))}
      {points.map(([x, y]) => (
        <rect key={`${x}-${y}`} x={x + dx - 2} y={y + dy - 2} width="4" height="4" />
      ))}
    </svg>
  );
}

function Waypoint({ name, children }: { name: keyof typeof constellations; children: ReactNode }) {
  return (
    <li className="waypoint">
      <Constellation name={name} />
      <div>
        <a className="waypoint-name" href={sideQuests[name].url}>
          {name}
        </a>
        <p>{children}</p>
      </div>
    </li>
  );
}

export function SideQuests() {
  return (
    <ul className="waypoints">
      <Waypoint name="mockly">
        fake chat screenshots for 17+ platforms. built it in a weekend,{" "}
        <a href="https://techcrunch.com/2025/07/10/mockly-made-a-fake-dm-generator-thats-actually-user-friendly/">
          techcrunch
        </a>{" "}
        wrote about it, 10k people use it. now i run it with <a href="https://x.com/jasperdeboer">jasper</a>. i still
        can't believe this is legal
      </Waypoint>
      <Waypoint name="fluncle">
        drum &amp; bass bangers from another dimension. it has a radio, an api, and an ssh rave terminal
      </Waypoint>
      <Waypoint name="hackadam">
        monthly meetup in amsterdam for indie makers building their own stuff. co-organized with{" "}
        <a href="https://x.com/AbnerHout">abner</a>
      </Waypoint>
      <Waypoint name="nonobench">
        benchmark for how well llms solve nonogram puzzles. the top score went from 63% in february to 93% in september
      </Waypoint>
    </ul>
  );
}

export function GraveyardItem({
  name,
  stamp,
  exit = false,
  years,
  children,
}: {
  name: string;
  stamp: string;
  exit?: boolean;
  years: string;
  children: ReactNode;
}) {
  return (
    <li>
      <span className="glyph" aria-hidden="true">
        ✧
      </span>
      <p className="grave-title">
        <span className="name">{name}</span> <Badge variant={exit ? "done" : "queued"}>{stamp}</Badge>{" "}
        <span className="years">{years}</span>
      </p>
      <p className="grave-note">{children}</p>
    </li>
  );
}

export function Footer({ children, ...props }: ComponentProps<"footer">) {
  return (
    <footer {...props} className="mk-foot">
      {children}
      <p className="mk-foot-status">
        <span className="status-dot" aria-hidden="true"></span> status: operational · sleep: degraded · ideas:
        backlogged
      </p>
      <p className="type-meta">
        <a href="/llms.txt">for agents</a>
      </p>
    </footer>
  );
}

export function EssayListItem({ essay, cover, eager }: { essay: Essay; cover: boolean; eager: boolean }) {
  const url = `/essays/${essay.slug}`;
  return (
    <li>
      {cover && (
        <a className="essay-cover" href={url} tabIndex={-1} aria-hidden="true">
          <img
            src={essay.cover}
            srcSet={essay.coverSrcset}
            sizes={essay.coverSizes}
            alt={essay.coverAlt}
            width={essay.coverWidth}
            height={essay.coverHeight}
            fetchPriority={eager ? "high" : undefined}
            loading={eager ? undefined : "lazy"}
          />
        </a>
      )}
      <a href={url}>{essay.title}</a>
      <p>{essay.summary}</p>
      {cover && (
        <p className="essay-meta">
          <time dateTime={essay.date}>{essay.dateDisplay}</time>
        </p>
      )}
    </li>
  );
}

export function ElsewhereLinks() {
  return (
    <ul className="icons">
      <li>
        <a href="https://github.com/mauricekleine" rel="me" aria-label="GitHub">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" fill="currentColor" aria-hidden="true">
            <path d="M208.31,75.68A59.78,59.78,0,0,0,202.93,28,8,8,0,0,0,196,24a59.75,59.75,0,0,0-48,24H124A59.75,59.75,0,0,0,76,24a8,8,0,0,0-6.93,4,59.78,59.78,0,0,0-5.38,47.68A58.14,58.14,0,0,0,56,104v8a56.06,56.06,0,0,0,48.44,55.47A39.8,39.8,0,0,0,96,192v8H72a24,24,0,0,1-24-24A40,40,0,0,0,8,136a8,8,0,0,0,0,16,24,24,0,0,1,24,24,40,40,0,0,0,40,40H96v16a8,8,0,0,0,16,0V192a24,24,0,0,1,48,0v40a8,8,0,0,0,16,0V192a39.8,39.8,0,0,0-8.44-24.53A56.06,56.06,0,0,0,216,112v-8A58.14,58.14,0,0,0,208.31,75.68ZM200,112a40,40,0,0,1-40,40H112a40,40,0,0,1-40-40v-8a41.74,41.74,0,0,1,6.9-22.48A8,8,0,0,0,80,73.83a43.81,43.81,0,0,1,.79-33.58,43.88,43.88,0,0,1,32.32,20.06A8,8,0,0,0,119.82,64h32.35a8,8,0,0,0,6.74-3.69,43.87,43.87,0,0,1,32.32-20.06A43.81,43.81,0,0,1,192,73.83a8.09,8.09,0,0,0,1,7.65A41.72,41.72,0,0,1,200,104Z"></path>
          </svg>
          <span>github</span>
        </a>
      </li>
      <li>
        <a href="https://www.linkedin.com/in/mauricekleine/" rel="me" aria-label="LinkedIn">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" fill="currentColor" aria-hidden="true">
            <path d="M216,24H40A16,16,0,0,0,24,40V216a16,16,0,0,0,16,16H216a16,16,0,0,0,16-16V40A16,16,0,0,0,216,24Zm0,192H40V40H216V216ZM96,112v64a8,8,0,0,1-16,0V112a8,8,0,0,1,16,0Zm88,28v36a8,8,0,0,1-16,0V140a20,20,0,0,0-40,0v36a8,8,0,0,1-16,0V112a8,8,0,0,1,15.79-1.78A36,36,0,0,1,184,140ZM100,84A12,12,0,1,1,88,72,12,12,0,0,1,100,84Z"></path>
          </svg>
          <span>linkedin</span>
        </a>
      </li>
      <li>
        <a href="https://x.com/mauricekleine" rel="me" aria-label="X, formerly Twitter">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" fill="currentColor" aria-hidden="true">
            <path d="M214.75,211.71l-62.6-98.38,61.77-67.95a8,8,0,0,0-11.84-10.76L143.24,99.34,102.75,35.71A8,8,0,0,0,96,32H48a8,8,0,0,0-6.75,12.3l62.6,98.37-61.77,68a8,8,0,1,0,11.84,10.76l58.84-64.72,40.49,63.63A8,8,0,0,0,160,224h48a8,8,0,0,0,6.75-12.29ZM164.39,208,62.57,48h29L193.43,208Z"></path>
          </svg>
          <span>x</span>
        </a>
      </li>
      <li>
        <a href="https://www.reddit.com/user/mauricekleine/" aria-label="Reddit">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" fill="currentColor" aria-hidden="true">
            <path d="M248,104a32,32,0,0,0-52.94-24.19c-16.75-8.9-36.76-14.28-57.66-15.53l5.19-31.17,17.72,2.72a24,24,0,1,0,2.87-15.74l-26-4a8,8,0,0,0-9.11,6.59L121.2,64.16c-21.84.94-42.82,6.38-60.26,15.65a32,32,0,0,0-42.59,47.74A59,59,0,0,0,16,144c0,21.93,12,42.35,33.91,57.49C70.88,216,98.61,224,128,224s57.12-8,78.09-22.51C228,186.35,240,165.93,240,144a59,59,0,0,0-2.35-16.45A32.16,32.16,0,0,0,248,104ZM184,24a8,8,0,1,1-8,8A8,8,0,0,1,184,24Zm40.13,93.78a8,8,0,0,0-3.29,10A43.58,43.58,0,0,1,224,144c0,16.53-9.59,32.27-27,44.33C178.67,201,154.17,208,128,208s-50.67-7-69-19.67C41.59,176.27,32,160.53,32,144a43.75,43.75,0,0,1,3.14-16.17,8,8,0,0,0-3.27-10A16,16,0,1,1,52.94,94.59a8,8,0,0,0,10.45,2.23l.36-.22C81.45,85.9,104.25,80,128,80h0c23.73,0,46.53,5.9,64.23,16.6l.42.25a8,8,0,0,0,10.39-2.26,16,16,0,1,1,21.07,23.19ZM88,144a16,16,0,1,1,16-16A16,16,0,0,1,88,144Zm96-16a16,16,0,1,1-16-16A16,16,0,0,1,184,128Zm-16.93,44.25a8,8,0,0,1-3.32,10.82,76.18,76.18,0,0,1-71.5,0,8,8,0,1,1,7.5-14.14,60.18,60.18,0,0,0,56.5,0A8,8,0,0,1,167.07,172.25Z"></path>
          </svg>
          <span>reddit</span>
        </a>
      </li>
      <li>
        <a href="mailto:hey@mauricekleine.com" aria-label="Email">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" fill="currentColor" aria-hidden="true">
            <path d="M224,48H32a8,8,0,0,0-8,8V192a16,16,0,0,0,16,16H216a16,16,0,0,0,16-16V56A8,8,0,0,0,224,48ZM203.43,64,128,133.15,52.57,64ZM216,192H40V74.19l82.59,75.71a8,8,0,0,0,10.82,0L216,74.19V192Z"></path>
          </svg>
          <span>email</span>
        </a>
      </li>
    </ul>
  );
}

export function Subscribe() {
  const theme = useTheme();

  useEffect(() => {
    type Turnstile = {
      render: (target: string, options: { sitekey: string; theme: "light" | "dark" | "auto" }) => string;
      remove: (id: string) => void;
    };
    const api = () => (window as Window & { turnstile?: Turnstile }).turnstile;
    const script = document.querySelector<HTMLScriptElement>('script[src*="turnstile/v0/api.js"]');
    let widgetId: string | undefined;
    const render = () => {
      widgetId = api()?.render("#subscribe-turnstile", {
        sitekey: "0x4AAAAAAFvOQQpuZFgGXmUZ",
        theme: theme ?? "auto",
      });
    };
    if (api()) render();
    else script?.addEventListener("load", render);
    return () => {
      script?.removeEventListener("load", render);
      if (widgetId) api()?.remove(widgetId);
    };
  }, [theme]);

  return (
    <Section id="subscribe" title="new essays by email" className="subscribe">
      <p className="section-intro">the next essay, when it lands. nothing else.</p>
      <form className="subscribe-form" method="post" action="/subscribe" data-subscribe="">
        <Field>
          <FieldLabel htmlFor="subscribe-email">email</FieldLabel>
          <InputGroup>
            <InputGroupInput
              id="subscribe-email"
              name="email"
              type="email"
              autoComplete="email"
              required
              placeholder="you@example.com"
            />
            <InputGroupAddon align="inline-end">
              <InputGroupButton type="submit" variant="default" size="sm">
                subscribe
              </InputGroupButton>
            </InputGroupAddon>
          </InputGroup>
        </Field>
        <div id="subscribe-turnstile"></div>
        <p className="subscribe-note">
          new essays only. unsubscribe anytime. your email is stored at resend; cloudflare checks you're human.
        </p>
        <p className="subscribe-status" data-subscribe-status="" role="status" aria-live="polite"></p>
      </form>
    </Section>
  );
}

export function EssayNav({ older, newer }: { older?: Essay; newer?: Essay }) {
  return (
    <>
      {older || newer ? (
        <nav className="essay-nav" aria-label="older and newer essays">
          {older && (
            <a className="older" href={`/essays/${older.slug}`}>
              <span className="label">older</span>← {older.title}
            </a>
          )}{" "}
          {newer && (
            <a className="newer" href={`/essays/${newer.slug}`}>
              <span className="label">newer</span>
              {newer.title} →
            </a>
          )}
        </nav>
      ) : null}
    </>
  );
}
