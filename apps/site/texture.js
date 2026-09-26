// night garden texture: dithered neuro-noise nebula, hand-written webgl.
// a nod to fluncle's video pipeline. no library, one shader, chunky pixels.
(() => {
  const canvas = document.getElementById("nebula");
  if (!canvas) return;
  const gl =
    canvas.getContext("webgl", { alpha: true, antialias: false }) ||
    canvas.getContext("experimental-webgl", { alpha: true, antialias: false });
  if (!gl) return; // no webgl, no nebula. the gradients carry on alone.

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");

  const VERT = `
    attribute vec2 a;
    void main() { gl_Position = vec4(a, 0.0, 1.0); }
  `;

  // domain-warped fbm ridges, quantized through a bayer matrix.
  // the dither is the point: smooth gradients are for other websites.
  const FRAG = `
    precision mediump float;
    uniform vec2 u_res;
    uniform float u_t;

    float hash(vec2 p) {
      return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
    }
    float noise(vec2 p) {
      vec2 i = floor(p);
      vec2 f = fract(p);
      f = f * f * (3.0 - 2.0 * f);
      return mix(
        mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x),
        mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x),
        f.y
      );
    }
    float fbm(vec2 p) {
      float v = 0.0;
      float a = 0.5;
      for (int i = 0; i < 4; i++) {
        v += a * noise(p);
        p *= 2.03;
        a *= 0.5;
      }
      return v;
    }

    float bayer2(vec2 a) {
      a = floor(a);
      return fract(a.x / 2.0 + a.y * a.y * 0.75);
    }
    float bayer4(vec2 a) {
      return bayer2(0.5 * a) * 0.25 + bayer2(a);
    }

    void main() {
      vec2 uv = gl_FragCoord.xy / u_res.y;
      float t = u_t * 0.015;

      vec2 q = vec2(fbm(uv * 1.3 + t), fbm(uv * 1.3 - t * 0.6));
      float f = fbm(uv * 1.9 + q * 1.7 + vec2(t * 0.4, -t * 0.25));
      float ridge = pow(1.0 - abs(f * 2.0 - 1.0), 5.0);

      // keep the reading column calmer than the edges
      vec2 c = gl_FragCoord.xy / u_res;
      float edge = smoothstep(0.12, 0.55, abs(c.x - 0.5));
      float strength = ridge * mix(0.35, 1.0, edge);

      // ordered dither: quantize to a few levels, bayer decides the tiebreak
      float d = bayer4(gl_FragCoord.xy) - 0.5;
      float q4 = floor(strength * 5.0 + d + 0.5) / 5.0;
      q4 = clamp(q4, 0.0, 1.0);

      // nebula violet drifting into ember
      float warm = noise(uv * 0.9 + vec2(t * 0.3, t * 0.2));
      vec3 violet = vec3(0.36, 0.30, 0.58);
      vec3 ember = vec3(0.78, 0.50, 0.28);
      vec3 col = mix(violet, ember, smoothstep(0.35, 0.75, warm));

      gl_FragColor = vec4(col * q4, q4 * 0.11);
    }
  `;

  function compile(type, src) {
    const s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) return null;
    return s;
  }

  const vs = compile(gl.VERTEX_SHADER, VERT);
  const fs = compile(gl.FRAGMENT_SHADER, FRAG);
  if (!vs || !fs) return;
  const prog = gl.createProgram();
  gl.attachShader(prog, vs);
  gl.attachShader(prog, fs);
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return;
  gl.useProgram(prog);

  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([-1, -1, 3, -1, -1, 3]),
    gl.STATIC_DRAW
  );
  const loc = gl.getAttribLocation(prog, "a");
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

  const uRes = gl.getUniformLocation(prog, "u_res");
  const uT = gl.getUniformLocation(prog, "u_t");

  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE);

  let rafId = null;
  let last = 0;

  function resize() {
    // quarter-ish res, capped: the upscale is pixelated on purpose
    const scale = Math.min(0.25, 480 / window.innerWidth);
    canvas.width = Math.max(160, Math.round(window.innerWidth * scale));
    canvas.height = Math.max(120, Math.round(window.innerHeight * scale));
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.uniform2f(uRes, canvas.width, canvas.height);
    if (reduced.matches) draw(40000);
  }

  function draw(t) {
    gl.uniform1f(uT, t / 1000);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }

  function loop(t) {
    rafId = requestAnimationFrame(loop);
    if (t - last < 33) return; // ~30fps is plenty for a nebula
    last = t;
    draw(t);
  }

  function start() {
    if (rafId !== null) return;
    if (reduced.matches) {
      draw(40000);
      return;
    }
    rafId = requestAnimationFrame(loop);
  }

  function stop() {
    if (rafId !== null) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
  }

  window.addEventListener("resize", resize);
  document.addEventListener("visibilitychange", () => {
    document.hidden ? stop() : start();
  });
  reduced.addEventListener("change", () => {
    stop();
    start();
  });

  resize();
  start();
})();
