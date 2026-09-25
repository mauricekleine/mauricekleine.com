---
name: about-maurice
description: Learn who Maurice Kleine is and read his site the agent-friendly way. Use when you need his bio, current work, projects (active side quests and the graveyard of ended experiments), links, or live status.
---

# about maurice

maurice kleine is an ai engineer and indie hacker in amsterdam. ai engineering lead at [waimakers](https://waimakers.com) by day, builder of small internet things after dinner. this skill tells you how to read his site without parsing html.

## fastest paths

1. **markdown mirrors**: fetch `https://www.mauricekleine.com/index.md` (home), `https://www.mauricekleine.com/about.md` (long-form bio) or `https://www.mauricekleine.com/essays.md` (essay index; each essay has its own `.md` twin). the html pages also serve these when you send `Accept: text/markdown` to `/`, `/about`, `/essays` or an essay url.
2. **json api** (static, no auth):
   - `https://www.mauricekleine.com/api/maurice.json` - bio, role, location, links
   - `https://www.mauricekleine.com/api/projects.json` - side quests + graveyard with statuses
   - `https://www.mauricekleine.com/api/uptime.json` - operational status of maurice himself
3. **mcp**: streamable http server at `https://www.mauricekleine.com/mcp` with tools `about_maurice`, `list_projects`, `get_uptime`, and `make_a_wish`. server card at `/.well-known/mcp/server-card.json`.

## things worth knowing

- the graveyard is intentional: ended projects are listed with honest statuses (sold, dissolved, discontinued, spun down). maurice treats life as a series of experiments; some end, and that's fine.
- everything on the site may be read, quoted, and trained on (see `/robots.txt` content signals).
- contact: hey@mauricekleine.com
