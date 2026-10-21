// Builds the Buttons page into the web app's public folder: buttons.html with
// its style and script inline, and every plate and font under buttons/a/ with
// a content hash in its name, so the Worker can cache them for good.
import { build, transform } from "esbuild";
import { createHash } from "node:crypto";
import { mkdir, readdir, readFile, rm, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const app = new URL("../", import.meta.url);
const pub = new URL("../../web/public/", import.meta.url);
const assets = new URL("buttons/a/", pub);
const target = ["es2020", "safari15", "chrome100", "firefox100"];

export async function buildPage({ minify = true } = {}) {
  await rm(assets, { recursive: true, force: true });
  await mkdir(assets, { recursive: true });

  const urls = new Map();
  const publish = async (kind, dir, pattern) => {
    for (const name of await readdir(new URL(dir, app))) {
      if (!pattern.test(name)) continue;
      const body = await readFile(new URL(`${dir}${name}`, app));
      const hash = createHash("sha256").update(body).digest("hex").slice(0, 10);
      const dot = name.lastIndexOf(".");
      const file = `${name.slice(0, dot)}.${hash}${name.slice(dot)}`;
      await writeFile(new URL(file, assets), body);
      urls.set(`${kind}:${name}`, `/buttons/a/${file}`);
    }
  };
  await publish("art", "art/", /\.(webp|png|jpg)$/);
  await publish("font", "fonts/", /\.woff2$/);

  const plates = JSON.parse(await readFile(new URL("art/plates.json", app), "utf8")).plates;
  const fill = (text) =>
    text.replace(/\{\{(art|font|glows|plate):([\w.-]+)\}\}/g, (_, kind, name) => {
      if (kind === "glows" || kind === "plate") {
        const plate = plates[name];
        if (!plate?.mask || !plate?.glows) throw new Error(`plates.json has no mask or glows for ${name}`);
        if (kind === "glows") return plate.glows.map(([cx, cy, rx, ry = rx]) => [cx, cy, rx, ry].join(",")).join(";");
        const points = plate.mask.flat();
        const xs = points.map(([x]) => x);
        const ys = points.map(([, y]) => y);
        return [Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys)].join(",");
      }
      const url = urls.get(`${kind}:${name}`);
      if (!url) throw new Error(`missing ${kind} ${name}`);
      return url;
    });

  const css = (
    await transform(fill(await readFile(new URL("src/style.css", app), "utf8")), { loader: "css", minify, target })
  ).code;
  const js = (
    await build({
      entryPoints: [fileURLToPath(new URL("src/main.ts", app))],
      bundle: true,
      minify,
      format: "esm",
      target,
      write: false,
      logLevel: "silent",
    })
  ).outputFiles[0].text;
  if (/<\/style/i.test(css) || /<\/script/i.test(js)) throw new Error("inline code would close its own tag");

  const page = fill(await readFile(new URL("src/page.html", app), "utf8"));
  const unfilled = page.match(/\{\{[^}]*\}\}/);
  if (unfilled) throw new Error(`unfilled placeholder: ${unfilled[0]}`);
  // the template links its real style and script; the built page carries both inline
  const inline = (text, tag, code) => {
    if (!tag.test(text)) throw new Error(`src/page.html has no tag matching ${tag}`);
    return text.replace(tag, () => code);
  };
  const html = inline(
    inline(page, /<link rel="stylesheet" href="\.\/style\.css"\s*\/?>/, `<style>${css.trim()}</style>`),
    /<script type="module" src="\.\/main\.ts"><\/script>/,
    `<script type="module">${js.trim()}</script>`,
  );
  await writeFile(new URL("buttons.html", pub), html);
  return { html, files: urls.size };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const { html, files } = await buildPage();
  console.log(`buttons: ${(html.length / 1024).toFixed(1)} KB page, ${files} files in public/buttons/a`);
}
