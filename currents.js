// deep currents: the texture-era shader stack, tuned ember.
// three paper-shaders layers under the night garden (bottom -> top):
//   warp (deep water, night colors with a dark ember undertone)
//   neuro-noise (dark energy, masked to the bottom-left corner)
//   grain-gradient (the ember aurora, a slow wave)
// everything the site already had (stars, constellations, sky traffic,
// film grain) keeps living on top. recipe ratified in the superthread
// texture lab at dial 11; violet swapped for ember, this sky is ours.
// vendored: Paper Shaders (Apache-2.0), see vendor/paper-shaders/NOTICE.
import { getShaderColorFromString } from "./vendor/paper-shaders/get-shader-color-from-string.js";
import { ShaderMount } from "./vendor/paper-shaders/shader-mount.js";
import {
  GrainGradientShapes,
  grainGradientFragmentShader,
} from "./vendor/paper-shaders/shaders/grain-gradient.js";
import { neuroNoiseFragmentShader } from "./vendor/paper-shaders/shaders/neuro-noise.js";
import { WarpPatterns, warpFragmentShader } from "./vendor/paper-shaders/shaders/warp.js";

// the old dithered nebula (texture.js) painted the same job in violet.
// the currents replace it; set to false to run both skies at once.
const RETIRE_LEGACY_NEBULA = true;

// weak devices keep the pre-currents site: gradients, dither, stars.
// this page is public and phones deserve their battery.
function shouldBail() {
  if ((navigator.hardwareConcurrency || 0) <= 4) {
    return true;
  }
  try {
    const probe = document.createElement("canvas").getContext("webgl2");
    if (!probe) {
      return true;
    }
  } catch {
    return true;
  }
  return false;
}

if (!shouldBail()) {
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const c = (s) => getShaderColorFromString(s);

  const SIZING = {
    u_fit: 2, // cover
    u_offsetX: 0,
    u_offsetY: 0,
    u_originX: 0.5,
    u_originY: 0.5,
    u_rotation: 0,
    u_scale: 1,
    u_worldHeight: 0,
    u_worldWidth: 0,
  };

  // stardate time: frames anchor to the fleet epoch (2026-07-29T00:00:00Z)
  // so a refresh resumes mid-wave. modded to keep glsl floats sane.
  const FLEET_EPOCH = 1785283200000;
  const frameFor = (speed) => (reduced ? 7777 : ((Date.now() - FLEET_EPOCH) * speed) % 1e6);
  const speedFor = (base) => (reduced ? 0 : base * 1.6);

  function layerDiv(opacity) {
    const el = document.createElement("div");
    el.style.cssText = `position:fixed;inset:0;z-index:0;pointer-events:none;opacity:${opacity};`;
    el.setAttribute("aria-hidden", "true");
    return el;
  }

  const nebula = document.getElementById("nebula");
  const anchor = nebula || document.getElementById("stars");
  const warpEl = layerDiv(1);
  const neuroEl = layerDiv(0.55);
  const grainEl = layerDiv(0.85);
  // dark energy pools in the bottom-left corner: the constellations own the
  // side sky and the traffic (starlink, iss, ufo) enters from the top.
  const neuroMask = "radial-gradient(120% 110% at 12% 92%, black 0%, black 30%, transparent 68%)";
  neuroEl.style.webkitMaskImage = neuroMask;
  neuroEl.style.maskImage = neuroMask;
  // the aurora keeps full punch at the edges but dims behind the reading
  // column, same discipline the old nebula practiced. words beat weather.
  const grainMask =
    "linear-gradient(90deg, black 0%, black 16%, rgb(0 0 0 / 0.4) 36%, rgb(0 0 0 / 0.4) 64%, black 84%, black 100%)";
  grainEl.style.webkitMaskImage = grainMask;
  grainEl.style.maskImage = grainMask;
  document.body.insertBefore(warpEl, anchor);
  document.body.insertBefore(neuroEl, anchor);
  document.body.insertBefore(grainEl, anchor);

  const GL = { alpha: true, premultipliedAlpha: false };

  try {
    // deep water: the lab's warp recipe with the violet floor swapped for
    // a dark ember undertone. barely-there until you look for it.
    new ShaderMount(
      warpEl,
      warpFragmentShader,
      {
        ...SIZING,
        u_colors: [c("#11131f"), c("#191c2c"), c("#4a2f1d")],
        u_colorsCount: 3,
        u_distortion: 0.42,
        u_proportion: 0.38,
        u_shape: WarpPatterns.edge,
        u_shapeScale: 0.9,
        u_softness: 1,
        u_swirl: 0.95,
        u_swirlIterations: 10,
      },
      GL,
      speedFor(0.12),
      frameFor(speedFor(0.12)),
      1,
      2.5e6,
    );

    // dark energy: dim ember veins instead of the bridge's violet.
    new ShaderMount(
      neuroEl,
      neuroNoiseFragmentShader,
      {
        ...SIZING,
        u_brightness: 0.42,
        u_colorBack: [0, 0, 0, 0],
        u_colorFront: c("#b06a3a"),
        u_colorMid: c("#2e2118"),
        u_contrast: 0.62,
      },
      GL,
      speedFor(0.22),
      frameFor(speedFor(0.22)),
      1,
      2e6,
    );

    // the aurora: ember wave cresting over the night, grain baked in.
    new ShaderMount(
      grainEl,
      grainGradientFragmentShader,
      {
        ...SIZING,
        u_colorBack: [0, 0, 0, 0],
        u_colors: [c("#f2b276"), c("#ffba73"), c("#2b2233")],
        u_colorsCount: 3,
        u_intensity: 0.6,
        u_noise: 0.75,
        u_shape: GrainGradientShapes.wave,
        u_softness: 0.82,
      },
      GL,
      speedFor(0.3),
      frameFor(speedFor(0.3)),
      1,
      2.5e6,
    );

    if (RETIRE_LEGACY_NEBULA && nebula) {
      window.nightNebula?.stop?.();
      nebula.style.display = "none";
    }
  } catch {
    // a shader refused to mount: remove the empty layers, the old sky stands.
    warpEl.remove();
    neuroEl.remove();
    grainEl.remove();
  }
}
