// Where the viewer is looking from: the phone's tilt when it shares its
// orientation, the mouse on a desktop, and a slow drift when neither is there.

type Gated = { requestPermission(): Promise<"granted" | "denied"> };

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

export class Tilt {
  /** the eye's position for parallax, -1 to 1 on each axis */
  x = 0;
  y = 0;
  /** left to right tilt in degrees, positive when the right edge dips away */
  roll = 0;
  /** true once the phone shares its orientation */
  live = false;
  onLive: (() => void) | null = null;

  private targetX = 0;
  private targetY = 0;
  private rawRoll = 0;
  private rawPitch = 0;
  private restingPitch = 0;
  private listening = false;
  private mouse = false;
  private clock = 0;

  constructor(private readonly still: MediaQueryList) {
    addEventListener(
      "pointermove",
      (event) => {
        if (event.pointerType !== "mouse") return;
        this.mouse = true;
        this.targetX = (event.clientX / innerWidth) * 2 - 1;
        this.targetY = (event.clientY / innerHeight) * 2 - 1;
      },
      { passive: true },
    );
    if (!gate()) this.listen();
  }

  /** iOS shares orientation only after a tap, so call this from a click handler */
  request() {
    const gated = gate();
    if (this.listening || !gated) return;
    gated.requestPermission().then(
      (answer) => answer === "granted" && this.listen(),
      () => {},
    );
  }

  update(dt: number) {
    if (this.live) {
      // follow the hand's resting angle slowly, so the picture settles back to centre
      this.restingPitch += (this.rawPitch - this.restingPitch) * (1 - Math.exp(-dt / 2.5));
      this.targetX = clamp(this.rawRoll / 18, -1, 1);
      this.targetY = clamp((this.rawPitch - this.restingPitch) / 12, -1, 1);
    } else if (!this.mouse) {
      this.clock += dt;
      this.targetX = Math.sin(this.clock * 0.55) * 0.35;
      this.targetY = Math.sin(this.clock * 0.37 + 1) * 0.2;
    }
    const still = this.still.matches;
    const k = 1 - Math.exp(-dt / 0.1);
    this.x += ((still ? 0 : this.targetX) - this.x) * k;
    this.y += ((still ? 0 : this.targetY) - this.y) * k;
    this.roll += (this.rawRoll - this.roll) * (1 - Math.exp(-dt / 0.06));
  }

  private listen() {
    if (this.listening || typeof DeviceOrientationEvent === "undefined") return;
    this.listening = true;
    addEventListener("deviceorientation", ({ beta, gamma }) => {
      if (beta === null || gamma === null) return;
      const legacy = (window as { orientation?: number }).orientation ?? 0;
      const angle = ((screen.orientation?.angle ?? legacy) + 360) % 360;
      // turn the device's axes into the viewer's left-right and up-down
      const [roll, pitch] =
        angle === 90
          ? [beta, -gamma]
          : angle === 270
            ? [-beta, gamma]
            : angle === 180
              ? [-gamma, -beta]
              : [gamma, beta];
      this.rawRoll = roll;
      this.rawPitch = pitch;
      if (this.live) return;
      this.live = true;
      this.restingPitch = pitch;
      this.onLive?.();
    });
  }
}

function gate() {
  if (typeof DeviceOrientationEvent === "undefined") return null;
  const event = DeviceOrientationEvent as unknown as Partial<Gated>;
  return typeof event.requestPermission === "function" ? (event as Gated) : null;
}
