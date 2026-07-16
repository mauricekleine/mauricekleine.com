// webmcp: expose page tools to browser agents.
// yes, this means an ai agent can summon the ufo. you're welcome.
(() => {
  const mc = navigator.modelContext;
  if (!mc || typeof mc.provideContext !== "function") return;

  const readJson = async (path) => {
    const res = await fetch(path);
    return { content: [{ type: "text", text: await res.text() }] };
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
    ],
  });
})();
