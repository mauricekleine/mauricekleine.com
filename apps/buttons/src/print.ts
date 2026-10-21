// Prints a plate onto paper with WebGL2: a CMYK halftone screen, depth
// parallax from the plate's depth map, a lenticular lens that interleaves the
// analog and button plates, and the button's own light on top of the print.

export type Rect = { x: number; y: number; w: number; h: number };

/** 0 prints the analog plate, 1 the button plate, 2 both through the lens */
export type View = Rect & { mode: 0 | 1 | 2 };

export type Look = {
  /** lens position, 0 shows the analog plate and 1 the button plate */
  mix: number;
  /** where the viewer's eye is, -1 to 1 on each axis */
  tilt: [number, number];
  /** parallax strength, in plate widths */
  depth: number;
  /** lens sheen position, -1 to 1 */
  sheen: number;
  /** the button's breathing light, 0 to 1 */
  pulse: number;
  /** how much the dots show against the continuous tone, 0 to 1 */
  strength: number;
  /** halftone cell and lens pitch, in device pixels */
  cell: number;
  lens: number;
  /** device pixels per CSS pixel */
  dpr: number;
};

/** glows are [cx, cy, rx, ry] and box is [x0, y0, x1, y1], in plate pixels */
export type Button = { glows: number[][]; box: number[] };

export type Sources = { a: string; aDepth: string; b: string; bDepth: string; bMask: string };

const VERTEX = `#version 300 es
out vec2 vUv;
void main() {
  vec2 p = vec2(float((gl_VertexID << 1) & 2), float(gl_VertexID & 2));
  vUv = vec2(p.x, 1.0 - p.y);
  gl_Position = vec4(p * 2.0 - 1.0, 0.0, 1.0);
}`;

const FRAGMENT = `#version 300 es
precision highp float;

in vec2 vUv;
out vec4 outColor;

uniform sampler2D uA;
uniform sampler2D uADepth;
uniform sampler2D uB;
uniform sampler2D uBDepth;
uniform sampler2D uBMask;

uniform int uMode;
uniform vec2 uOrigin;
uniform float uCell;
uniform float uLens;
uniform vec2 uRegister;
uniform float uMix;
uniform vec2 uTilt;
uniform float uDepth;
uniform float uSheen;
uniform float uPulse;
uniform int uGlowCount;
uniform vec4 uGlows[4];
uniform vec4 uPlate;
uniform vec3 uPaper;
uniform float uStrength;

const vec2 SOURCE = vec2(1200.0, 1500.0);
const float ZOOM = 0.965;
const float FOCUS = 0.6;
const vec3 GLOW = vec3(1.0, 0.36, 0.18);
const vec3 BLACK = vec3(0.0112, 0.0086, 0.0063);
// the illustrations' own lightest cream, #fdf4d6 in linear light: it prints as bare paper
const vec3 WHITE = vec3(0.9825, 0.9078, 0.6797);

vec3 toLinear(vec3 c) { return pow(c, vec3(2.2)); }
vec3 encode(vec3 c) { return pow(max(c, 0.0), vec3(1.0 / 2.2)); }

float hash(vec2 p) {
  vec3 q = fract(vec3(p.xyx) * 0.1031);
  q += dot(q, q.yzx + 33.33);
  return fract((q.x + q.y) * q.z);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x), f.y);
}

// near things slide against far things as the eye moves
vec2 lift(sampler2D depth, vec2 uv) {
  vec2 base = (uv - 0.5) * ZOOM + 0.5;
  vec2 dir = uTilt * uDepth;
  vec2 p = base + dir * (texture(depth, base).r - FOCUS);
  return base + dir * (texture(depth, p).r - FOCUS);
}

// a round dot's radius, in cells, that covers v of its cell
float radius(float v) {
  if (v < 0.785) return sqrt(v / 3.14159);
  if (v < 0.834) return mix(0.50, 0.52, (v - 0.785) / 0.049);
  if (v < 0.889) return mix(0.52, 0.55, (v - 0.834) / 0.055);
  if (v < 0.951) return mix(0.55, 0.60, (v - 0.889) / 0.062);
  if (v < 0.987) return mix(0.60, 0.65, (v - 0.951) / 0.036);
  return mix(0.65, 0.75, (v - 0.987) / 0.013);
}

// one ink's screen at its angle: how much of this pixel the ink covers
float screen(vec2 fp, float angle, float v) {
  float s = sin(angle);
  float c = cos(angle);
  vec2 q = mat2(c, s, -s, c) * fp / uCell;
  float d = length(fract(q) - 0.5);
  return clamp((radius(v) - d) * uCell + 0.5, 0.0, 1.0) * clamp(v * 40.0, 0.0, 1.0);
}

// colour to process inks, against the paper it is printed on
vec4 separate(vec3 srgb) {
  vec3 c = clamp(toLinear(srgb) / WHITE, 0.0, 1.0);
  float k = smoothstep(0.15, 1.0, 1.0 - max(max(c.r, c.g), c.b));
  vec3 cmy = clamp((1.0 - c - k) / max(1.0 - k, 0.0001), 0.0, 1.0);
  return vec4(cmy, k);
}

void main() {
  vec2 fp = gl_FragCoord.xy - uOrigin;
  vec2 uvA = vUv;
  vec2 uvB = vUv;
  float sel = uMode == 1 ? 1.0 : 0.0;
  if (uMode != 1) uvA = lift(uADepth, vUv);
  if (uMode != 0) uvB = lift(uBDepth, vUv);
  if (uMode == 2) {
    float strip = floor(fp.x / uLens);
    float t = 0.5 + (vUv.x - 0.5) * 0.4 + (hash(vec2(strip, 7.0)) - 0.5) * 0.18;
    sel = smoothstep(t - 0.025, t + 0.025, uMix);
  }

  // each plate of the press lands a little off the others
  vec2 rc = vec2(0.6, -0.35) * uRegister;
  vec2 rm = vec2(-0.45, 0.5) * uRegister;
  vec2 ry = vec2(0.3, 0.6) * uRegister;
  vec3 k0;
  vec3 c0;
  vec3 m0;
  vec3 y0;
  if (uMode == 0) {
    k0 = texture(uA, uvA).rgb;
    c0 = texture(uA, uvA + rc).rgb;
    m0 = texture(uA, uvA + rm).rgb;
    y0 = texture(uA, uvA + ry).rgb;
  } else if (uMode == 1) {
    k0 = texture(uB, uvB).rgb;
    c0 = texture(uB, uvB + rc).rgb;
    m0 = texture(uB, uvB + rm).rgb;
    y0 = texture(uB, uvB + ry).rgb;
  } else {
    k0 = mix(texture(uA, uvA).rgb, texture(uB, uvB).rgb, sel);
    c0 = mix(texture(uA, uvA + rc).rgb, texture(uB, uvB + rc).rgb, sel);
    m0 = mix(texture(uA, uvA + rm).rgb, texture(uB, uvB + rm).rgb, sel);
    y0 = mix(texture(uA, uvA + ry).rgb, texture(uB, uvB + ry).rgb, sel);
  }

  float grain = 0.9 + 0.1 * noise(fp / (uCell * 0.7));
  float c = screen(fp, 0.2618, separate(c0).x) * grain;
  float m = screen(fp, 1.309, separate(m0).y) * grain;
  float y = screen(fp, 0.0, separate(y0).z) * grain;
  float k = screen(fp, 0.7854, separate(k0).w) * grain;
  vec3 paper = uPaper * (1.0 + (noise(fp / 90.0) - 0.5) * 0.05 + (hash(fp) - 0.5) * 0.03);
  vec3 ink = paper;
  ink *= mix(vec3(1.0), vec3(0.0, 1.0, 1.0), c);
  ink *= mix(vec3(1.0), vec3(1.0, 0.0, 1.0), m);
  ink *= mix(vec3(1.0), vec3(1.0, 1.0, 0.0), y);
  ink *= mix(vec3(1.0), BLACK, k);
  // the dots stay a texture: blend them toward the tone they add up to
  vec3 tone = paper * clamp(toLinear(k0) / WHITE, 0.0, 1.0);
  vec3 col = encode(mix(tone, ink, uStrength));

  if (uMode != 0) {
    // the button is not printed: it shows through as a photograph
    vec2 px = uvB * SOURCE;
    float mask = texture(uBMask, uvB).r * sel;
    col = mix(col, k0, mask);

    // light slides across the steel as the eye moves
    float hi = max(max(k0.r, k0.g), k0.b);
    float lo = min(min(k0.r, k0.g), k0.b);
    float metal = smoothstep(0.3, 0.1, (hi - lo) / max(hi, 0.001)) * smoothstep(0.25, 0.6, hi);
    vec2 q = (px - uPlate.xy) / uPlate.zw;
    float band = dot(q, vec2(0.8, 0.6)) - (uTilt.x * 1.2 + uTilt.y * 0.7);
    col += exp(-band * band * 6.0) * 0.4 * metal * mask;

    // and its glow is light, not ink, so it spills over the print
    float ring = 0.0;
    float halo = 0.0;
    for (int i = 0; i < 4; i++) {
      if (i >= uGlowCount) break;
      float d = length((px - uGlows[i].xy) / uGlows[i].zw);
      ring += exp(-pow((d - 0.82) * 8.0, 2.0));
      halo += exp(-pow(max(d - 0.75, 0.0) * 1.3, 2.0)) * smoothstep(0.45, 0.85, d);
    }
    vec3 light = clamp(GLOW * (ring * 0.5 + halo * 0.3) * uPulse * sel, 0.0, 1.0);
    col = 1.0 - (1.0 - col) * (1.0 - light);
  }

  if (uMode == 2) {
    // ridges of the lens, and a sheen that follows the tilt
    float w = fract(fp.x / uLens);
    col *= 1.0 - 0.03 * (1.0 - cos(6.2832 * w));
    float s = vUv.x * 0.9 + vUv.y * 0.3 - (0.6 + uSheen * 0.7);
    col += exp(-s * s * 90.0) * 0.07 * (0.6 + 0.4 * cos(6.2832 * w));
  }

  outColor = vec4(col, 1.0);
}`;

const UNIFORMS = [
  "uA",
  "uADepth",
  "uB",
  "uBDepth",
  "uBMask",
  "uMode",
  "uOrigin",
  "uCell",
  "uLens",
  "uRegister",
  "uMix",
  "uTilt",
  "uDepth",
  "uSheen",
  "uPulse",
  "uGlowCount",
  "uGlows",
  "uPlate",
  "uPaper",
  "uStrength",
] as const;

type Uniform = (typeof UNIFORMS)[number];

/** the panel's paper, --paper-light, in linear light */
const PAPER = [0xf6, 0xef, 0xdf].map((v) => (v / 255) ** 2.2);

export class Printer {
  private readonly gl: WebGL2RenderingContext;
  private readonly at = {} as Record<Uniform, WebGLUniformLocation | null>;

  static create(canvas: HTMLCanvasElement) {
    const gl = canvas.getContext("webgl2", {
      alpha: true,
      antialias: false,
      depth: false,
      stencil: false,
      powerPreference: "low-power",
    });
    if (!gl) return null;
    try {
      return new Printer(gl);
    } catch (error) {
      console.warn(error);
      return null;
    }
  }

  private constructor(gl: WebGL2RenderingContext) {
    this.gl = gl;
    const program = link(gl);
    gl.useProgram(program);
    gl.bindVertexArray(gl.createVertexArray());
    for (const name of UNIFORMS) this.at[name] = gl.getUniformLocation(program, name);
    (["uA", "uADepth", "uB", "uBDepth", "uBMask"] as const).forEach((name, unit) => gl.uniform1i(this.at[name], unit));
    gl.uniform3fv(this.at.uPaper, PAPER);
  }

  async load(sources: Sources, button: Button) {
    const [a, aDepth, b, bDepth, bMask] = await Promise.all([
      decode(sources.a),
      decode(sources.aDepth, true),
      decode(sources.b),
      decode(sources.bDepth, true),
      decode(sources.bMask, true),
    ]);
    this.upload(0, a, false);
    this.upload(1, aDepth, true);
    this.upload(2, b, false);
    this.upload(3, bDepth, true);
    this.upload(4, bMask, true);

    const gl = this.gl;
    const glows = new Float32Array(16);
    button.glows.slice(0, 4).forEach(([cx, cy, rx, ry = rx], i) => glows.set([cx, cy, rx, ry], i * 4));
    gl.uniform4fv(this.at.uGlows, glows);
    gl.uniform1i(this.at.uGlowCount, Math.min(button.glows.length, 4));
    const [x0, y0, x1, y1] = button.box;
    gl.uniform4f(this.at.uPlate, (x0 + x1) / 2, (y0 + y1) / 2, (x1 - x0) / 2, (y1 - y0) / 2);
  }

  draw(width: number, height: number, views: View[], look: Look) {
    const gl = this.gl;
    gl.viewport(0, 0, width, height);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.uniform1f(this.at.uCell, look.cell);
    gl.uniform1f(this.at.uLens, look.lens);
    gl.uniform1f(this.at.uMix, look.mix);
    gl.uniform2f(this.at.uTilt, look.tilt[0], look.tilt[1]);
    gl.uniform1f(this.at.uDepth, look.depth);
    gl.uniform1f(this.at.uSheen, look.sheen);
    gl.uniform1f(this.at.uPulse, look.pulse);
    gl.uniform1f(this.at.uStrength, look.strength);
    for (const view of views) {
      gl.viewport(view.x, view.y, view.w, view.h);
      gl.uniform1i(this.at.uMode, view.mode);
      gl.uniform2f(this.at.uOrigin, view.x, view.y);
      gl.uniform2f(this.at.uRegister, look.dpr / view.w, look.dpr / view.h);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    }
  }

  get lost() {
    return this.gl.isContextLost();
  }

  private upload(unit: number, image: ImageBitmap, single: boolean) {
    const gl = this.gl;
    gl.activeTexture(gl.TEXTURE0 + unit);
    gl.bindTexture(gl.TEXTURE_2D, gl.createTexture());
    gl.texImage2D(gl.TEXTURE_2D, 0, single ? gl.R8 : gl.RGBA8, single ? gl.RED : gl.RGBA, gl.UNSIGNED_BYTE, image);
    // colour plates shrink a lot on phones; depth and masks only ever grow
    if (!single) gl.generateMipmap(gl.TEXTURE_2D);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, single ? gl.LINEAR : gl.LINEAR_MIPMAP_LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    image.close();
  }
}

async function decode(url: string, data = false) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`${url}: ${response.status}`);
  const blob = await response.blob();
  // depth and masks are data: keep their values exactly as stored
  return createImageBitmap(blob, data ? { colorSpaceConversion: "none" } : {});
}

function link(gl: WebGL2RenderingContext) {
  const program = gl.createProgram();
  for (const [type, source] of [
    [gl.VERTEX_SHADER, VERTEX],
    [gl.FRAGMENT_SHADER, FRAGMENT],
  ] as const) {
    const shader = gl.createShader(type);
    if (!shader) throw new Error("no shader");
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(shader) ?? "shader");
    gl.attachShader(program, shader);
  }
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(program) ?? "program");
  return program;
}
