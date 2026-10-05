// html parsing for drift-check.mjs, kept apart so tools/test-projects.mjs can test it.
// regex-level on purpose: the checker reads a few tags, not the whole document.

// every tag's attributes, whatever order they come in
export function tags(html, name) {
  return [...html.matchAll(new RegExp(`<${name}\\b([^>]*)>`, "gi"))].map(([, raw]) => {
    const attrs = {};
    for (const [, key, , dq, sq, bare] of raw.matchAll(/([^\s=/]+)\s*=\s*("([^"]*)"|'([^']*)'|([^\s>]+))/g)) {
      attrs[key.toLowerCase()] = dq ?? sq ?? bare;
    }
    return attrs;
  });
}

export function canonicalHref(html) {
  return tags(html, "link").find((attrs) => attrs.rel?.toLowerCase().split(/\s+/).includes("canonical"))?.href;
}

export function anchorHrefs(html) {
  return tags(html, "a").map((attrs) => attrs.href).filter(Boolean);
}

// every "@id" in every json-ld block, however it's formatted or nested
export function jsonLdIds(html) {
  const ids = new Set();
  const walk = (node) => {
    if (Array.isArray(node)) node.forEach(walk);
    else if (node && typeof node === "object") {
      if (typeof node["@id"] === "string") ids.add(node["@id"]);
      Object.values(node).forEach(walk);
    }
  };
  const blocks = html.matchAll(/<script\b[^>]*type\s*=\s*["']?application\/ld\+json["']?[^>]*>([\s\S]*?)<\/script>/gi);
  for (const [, json] of blocks) {
    try {
      walk(JSON.parse(json));
    } catch {
      // a broken block is the site's problem; the missing @id gets reported instead
    }
  }
  return ids;
}
