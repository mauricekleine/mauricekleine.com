// Serves the Buttons page at http://localhost:3001/buttons, rebuilt on every page load.
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { extname } from "node:path";
import { buildPage } from "./build.mjs";

const assets = new URL("../../web/public/buttons/a/", import.meta.url);
const types = {
  ".webp": "image/webp",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".woff2": "font/woff2",
};
const port = Number(process.env.PORT || 3001);

createServer(async (request, response) => {
  const path = new URL(request.url ?? "/", "http://localhost").pathname;
  try {
    if (path === "/" || path === "/buttons") {
      const { html } = await buildPage({ minify: false });
      response.writeHead(200, { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" });
      return response.end(html);
    }
    const name = path.startsWith("/buttons/a/") ? path.slice("/buttons/a/".length) : "";
    if (name && !name.includes("/") && types[extname(name)]) {
      const body = await readFile(new URL(name, assets));
      response.writeHead(200, { "content-type": types[extname(name)], "cache-control": "no-store" });
      return response.end(body);
    }
    response.writeHead(404, { "content-type": "text/plain" });
    response.end("not found");
  } catch (error) {
    console.error(error);
    response.writeHead(500, { "content-type": "text/plain" });
    response.end(String(error));
  }
}).listen(port, () => console.log(`buttons: http://localhost:${port}/buttons`));
