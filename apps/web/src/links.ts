// mk.wtf, the short links for bios, slides and qr codes.
// top-level names are maurice; a project's names prefix its own links,
// and every project name combines with every link name (f/gh, fluncle/github).
// pages and json-ld keep the real urls; these are only for people typing them.

type Link = { names: string[]; url: string };
type Project = Link & { links: Link[] };

const dnb = "https://open.spotify.com/playlist/1m5LADqpLjiBERdtqrIiL0";

export const personal: Link[] = [
  { names: [""], url: "https://www.mauricekleine.com/" },
  { names: ["about"], url: "https://www.mauricekleine.com/about" },
  { names: ["essays"], url: "https://www.mauricekleine.com/essays" },
  { names: ["x"], url: "https://x.com/mauricekleine" },
  { names: ["gh", "github"], url: "https://github.com/mauricekleine" },
  { names: ["in", "linkedin"], url: "https://www.linkedin.com/in/mauricekleine/" },
  { names: ["reddit"], url: "https://www.reddit.com/user/mauricekleine/" },
  { names: ["ph", "producthunt"], url: "https://www.producthunt.com/@mauricekleine" },
  { names: ["luma"], url: "https://luma.com/user/mauricekleine" },
  { names: ["tinkerers"], url: "https://amsterdam.aitinkerers.org/profile/client_kBU1ebRuvug" },
  { names: ["dnb"], url: dnb },
];

export const projects: Project[] = [
  {
    names: ["f", "fluncle"],
    url: "https://www.fluncle.com",
    links: [
      { names: ["gh", "github"], url: "https://github.com/mauricekleine/fluncle" },
      { names: ["yt", "youtube"], url: "https://www.youtube.com/@fluncle" },
      { names: ["tt", "tiktok"], url: "https://www.tiktok.com/@fluncle" },
      { names: ["dnb"], url: dnb },
    ],
  },
  {
    names: ["n", "nonobench", "bench"],
    url: "https://www.nonobench.com",
    links: [{ names: ["gh", "github"], url: "https://github.com/mauricekleine/nonobench" }],
  },
  { names: ["m", "mockly"], url: "https://www.getmockly.com", links: [] },
  { names: ["h", "hacka", "hackadam"], url: "https://hackadam.nl", links: [] },
];

function buildTable(): Map<string, string> {
  const table = new Map<string, string>();
  const add = (path: string, url: string) => {
    if (table.has(path)) throw new Error(`mk.wtf/${path} is defined twice`);
    table.set(path, url);
  };
  for (const link of personal) for (const name of link.names) add(name, link.url);
  for (const project of projects) {
    for (const name of project.names) {
      add(name, project.url);
      for (const link of project.links) for (const sub of link.names) add(`${name}/${sub}`, link.url);
    }
  }
  return table;
}

export const shortLinks = buildTable();

export function isShortLinkHost(hostname: string): boolean {
  return hostname === "mk.wtf" || hostname === "www.mk.wtf";
}

// case-insensitive, trailing slash optional, query carried over
export function resolveShortLink(url: URL): string | null {
  const path = url.pathname.toLowerCase().replace(/^\/+|\/+$/g, "");
  const target = shortLinks.get(path);
  if (target === undefined) return null;
  const out = new URL(target);
  for (const [key, value] of url.searchParams) out.searchParams.append(key, value);
  return out.toString();
}

function linkIndex(): string {
  const lines = personal.map((link) => `mk.wtf/${link.names[0]}  ${link.url}`);
  for (const project of projects) {
    const name = project.names[0];
    lines.push("", `mk.wtf/${name}  ${project.url}`);
    for (const link of project.links) lines.push(`mk.wtf/${name}/${link.names[0]}  ${link.url}`);
  }
  return lines.join("\n");
}

export function handleShortLink(url: URL): Response {
  const location = resolveShortLink(url);
  if (location) {
    // 302 so a destination can change later; browsers keep a 301 forever
    return new Response(null, {
      status: 302,
      headers: { location, "cache-control": "public, max-age=300" },
    });
  }
  return new Response(`no such link. here's what mk.wtf knows:\n\n${linkIndex()}\n`, {
    status: 404,
    headers: { "content-type": "text/plain; charset=utf-8", "cache-control": "public, max-age=60" },
  });
}
