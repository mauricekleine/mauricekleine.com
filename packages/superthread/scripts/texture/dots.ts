// The master plates and live canvases read the same device-pixel thresholds.
import { DOT_ANGLES, dotThresholds } from "../../items/lib/dot-screen";

const [width, height, dpr] = Bun.argv.slice(2).map(Number);
for (const angle of [DOT_ANGLES.key, DOT_ANGLES.plum]) {
  await Bun.write(Bun.stdout, dotThresholds(width, height, dpr, angle));
}
