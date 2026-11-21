import { spawn } from "node:child_process";
import { once } from "node:events";
import { Readable } from "node:stream";
import { pipeline } from "node:stream/promises";
import { prepare } from "./field.js";
import { loadMask, rgbFrame } from "./render.ts";

const [line, mode, width, height, output, maskModule, maskExport] = process.argv.slice(2);
if (!line || (mode !== "light" && mode !== "dark") || !output) {
  throw new Error("usage: bun scripts/loop.ts '<spec>' <light|dark> <width> <height> <output.mp4> [mask-module [export-name]]");
}
const imageMode = mode;
const art = prepare(line, Number(width), Number(height), { mask: await loadMask(maskModule, maskExport) });
if (art.spec.motion === "still") throw new Error("set a motion in the spec");

const fps = 24;
// Keep one chroma sample per pixel and signal a matrix browsers display consistently.
const encoder = spawn("ffmpeg", [
  "-hide_banner", "-loglevel", "error", "-y", "-f", "rawvideo", "-pix_fmt", "rgb24",
  "-s", width + "x" + height, "-framerate", String(fps), "-i", "-",
  "-an", "-vf", "scale=out_color_matrix=bt709:out_range=limited,format=yuv444p",
  "-c:v", "libx264", "-crf", "0", "-preset", "veryfast", "-threads", "2",
  "-color_range", "tv", "-colorspace", "bt709", "-color_primaries", "bt709", "-color_trc", "bt709",
  "-x264-params", "colorprim=bt709:transfer=bt709:colormatrix=bt709",
  "-movflags", "+faststart+write_colr", output,
], { stdio: ["pipe", "ignore", "inherit"] });
function* frames() {
  const cells = new Uint8Array(art.w * art.h);
  for (let n = 0; n < fps * art.spec.duration; n++) {
    yield rgbFrame(art, imageMode, n / fps, cells);
  }
}

try {
  const [, [code]] = await Promise.all([pipeline(Readable.from(frames()), encoder.stdin!), once(encoder, "exit")]);
  if (code !== 0) throw new Error("ffmpeg exit " + code);
} finally {
  if (encoder.exitCode === null && encoder.signalCode === null) encoder.kill();
}
