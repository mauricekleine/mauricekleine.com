// From the repo root: bun apps/superthread/tools/render-span.ts
import { mkdir } from "node:fs/promises";
import { join } from "node:path";
import { fieldScreen, paint, prepare } from "../../../skills/superthread-visuals/scripts/field.js";
import { packedInks } from "../../../packages/superthread/items/lib/dot-screen";
import { tokens } from "../../../packages/superthread/items/lib/tokens";
import { span, spanPlate } from "../src/site/span";

function rgb(hex: string) {
  return hex
    .slice(1)
    .match(/../g)!
    .map((channel) => parseInt(channel, 16));
}

const publicDir = join(import.meta.dir, "../public");
await mkdir(join(publicDir, "opener"), { recursive: true });

for (const kind of ["home", "slim"] as const) {
  for (const crop of ["desktop", "phone"] as const) {
    const { width, line, mask, [kind]: height } = span[crop];
    const field = prepare(line, width, height, { mask });
    for (const dpr of [1, 2] as const) {
      const screen = fieldScreen(field, dpr);
      const pixels = new Uint32Array(screen.width * screen.height);
      for (const mode of ["light", "dark"] as const) {
        const inks = packedInks([
          undefined,
          rgb(tokens.dark.foreground.hex),
          rgb(tokens.dark.primary.hex),
          rgb(tokens[mode].background.hex),
        ]);
        paint(field, "dark", 0, pixels, screen, inks);
        const file = join(publicDir, spanPlate(kind, crop, mode, dpr));
        const result = Bun.spawnSync(
          [
            "magick",
            "-size",
            `${screen.width}x${screen.height}`,
            "-depth",
            "8",
            "rgba:-",
            "-define",
            "png:exclude-chunks=date,time",
            "-set",
            "Source",
            `apps/superthread/src/site/span.ts, ${kind} ${crop} ${mode} ${dpr}x, frame zero`,
            `PNG8:${file}`,
          ],
          { stdin: new Uint8Array(pixels.buffer), stderr: "inherit", stdout: "inherit" },
        );
        if (!result.success) throw new Error(`could not write ${file}`);
      }
    }
  }
}
