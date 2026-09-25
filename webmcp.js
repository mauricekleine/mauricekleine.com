// webmcp: expose page tools to browser agents.
// yes, this means an ai agent can summon the ufo. you're welcome.
(() => {
  const mc = navigator.modelContext;
  if (!mc || typeof mc.provideContext !== "function") return;

  const readJson = async (path) => {
    const res = await fetch(path);
    return { content: [{ type: "text", text: await res.text() }] };
  };

  // essays.md lines look like:
  // - [title](https://www.mauricekleine.com/essays/slug.md) (2026-09-13) - summary
  const parseEssayIndex = (markdown) => {
    const re = /^- \[(.+?)\]\((.+?)\.md\) \((\d{4}-\d{2}-\d{2})\) - (.+)$/gm;
    const essays = [];
    let m;
    while ((m = re.exec(markdown))) {
      const [, title, mdUrl, date, summary] = m;
      const slugMatch = /\/essays\/([a-z0-9-]+)$/.exec(mdUrl);
      if (!slugMatch) continue;
      const slug = slugMatch[1];
      essays.push({
        slug,
        title,
        summary,
        date,
        url: `${location.origin}/essays/${slug}`,
        markdown_url: `${location.origin}/essays/${slug}.md`,
        cover: `${location.origin}/essays/${slug}/01.jpg`,
      });
    }
    return essays;
  };

  // the first real paragraph of an essay's .md twin: skip the h1, the date/
  // source line, the cover image and any divider, then take the next block.
  const essayOpening = (markdown) => {
    const blocks = markdown.split(/\n\s*\n/).map((b) => b.trim()).filter(Boolean);
    for (const block of blocks) {
      if (/^#{1,6}\s/.test(block)) continue;
      if (/^!\[/.test(block)) continue;
      if (/^-{3,}$/.test(block)) continue;
      if (/^\d{4}-\d{2}-\d{2}\s·/.test(block)) continue;
      return block.replace(/\s+/g, " ").trim();
    }
    return "";
  };

  const listEssays = async () => {
    const res = await fetch("/essays.md");
    return parseEssayIndex(await res.text());
  };

  mc.provideContext({
    tools: [
      {
        name: "summon_sky_traffic",
        description:
          "make something fly across the night sky on this page: a starlink train, the iss, or a ufo",
        inputSchema: {
          type: "object",
          properties: {
            type: { type: "string", enum: ["starlink", "iss", "ufo"] },
          },
          required: ["type"],
        },
        async execute({ type }) {
          const text = window.sky
            ? window.sky.traffic(type)
            : "the sky isn't awake yet";
          return { content: [{ type: "text", text }] };
        },
      },
      {
        name: "about_maurice",
        description: "who maurice kleine is: bio, role, location, links",
        inputSchema: { type: "object", properties: {} },
        execute: () => readJson("/api/maurice.json"),
      },
      {
        name: "list_projects",
        description:
          "maurice's side quests and the graveyard of ended experiments",
        inputSchema: { type: "object", properties: {} },
        execute: () => readJson("/api/projects.json"),
      },
      {
        name: "list_essays",
        description:
          "maurice's essays, newest first: slug, title, summary, date, links and cover image for each",
        inputSchema: { type: "object", properties: {} },
        async execute() {
          const essays = await listEssays();
          return { content: [{ type: "text", text: JSON.stringify(essays) }] };
        },
      },
      {
        name: "get_essay",
        description:
          "read one essay by slug. by default returns a teaser (title, summary, opening paragraph, links); pass full: true for the whole markdown",
        inputSchema: {
          type: "object",
          properties: {
            slug: { type: "string", description: "essay slug, e.g. ride-the-floor-up" },
            full: { type: "boolean", description: "return the full essay markdown instead of a teaser" },
          },
          required: ["slug"],
        },
        async execute({ slug, full }) {
          const essays = await listEssays();
          const entry = essays.find((e) => e.slug === slug);
          if (!entry) {
            return { content: [{ type: "text", text: `unknown essay: ${slug}` }], isError: true };
          }
          const res = await fetch(entry.markdown_url.replace(location.origin, ""));
          const body = await res.text();
          const teaser = { ...entry, opening: essayOpening(body) };
          const result = full ? { ...teaser, markdown: body } : teaser;
          return { content: [{ type: "text", text: JSON.stringify(result) }] };
        },
      },
    ],
  });
})();
