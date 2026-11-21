// Scene masks. Coordinates are fractions of the frame, measured from the top left.
const mix = (a: number, b: number, t: number) => a + (b - a) * t;

function union(a: number, b: number, amount: number) {
  const overlap = Math.max(amount - Math.abs(a - b), 0) / amount;
  return Math.min(a, b) - (overlap * overlap * amount) / 4;
}

function plate(w: number, h: number, distance: (u: number, v: number) => number) {
  return Uint8Array.from({ length: w * h }, (_, i) =>
    Number(distance(((i % w) + 0.5) / w, (Math.floor(i / w) + 0.5) / h) <= 0),
  );
}

function ellipse(u: number, v: number, [x, y, rx, ry]: number[], aspect: number) {
  return (Math.hypot((u - x) / rx, (v - y) / ry) - 1) * Math.min(rx * aspect, ry);
}

function link(u: number, v: number, a: number[], b: number[], radius: number, aspect: number) {
  const dx = (b[0] - a[0]) * aspect;
  const dy = b[1] - a[1];
  const px = (u - a[0]) * aspect;
  const py = v - a[1];
  const t = Math.max(0, Math.min(1, (px * dx + py * dy) / (dx * dx + dy * dy)));
  return Math.hypot(px - t * dx, py - t * dy) - radius;
}

function constellation(w: number, h: number) {
  const aspect = w / h;
  const centres = [
    [-0.035, 0.67, 0.062, 0.053],
    [0.14, 0.51, 0.066, 0.106],
    [0.36, 0.62, 0.045, 0.078],
    [0.573, 0.39, 0.093, 0.157],
    [0.862, 0.47, 0.056, 0.079],
  ];
  return plate(w, h, (u, v) => {
    let shape = ellipse(u, v, centres[0], aspect);
    for (let i = 1; i < centres.length; i++) {
      shape = union(shape, link(u, v, centres[i - 1], centres[i], 0.017, aspect), 0.033);
      shape = union(shape, ellipse(u, v, centres[i], aspect), 0.045);
    }
    return shape;
  });
}

function roi(w: number, h: number) {
  const aspect = w / h;
  const scatter = [
    [0.108, 0.306, 0.024, 0.039],
    [0.102, 0.721, 0.043, 0.06],
    [0.231, 0.472, 0.049, 0.073],
    [0.299, 0.775, 0.026, 0.046],
    [0.369, 0.339, 0.029, 0.036],
    [0.41, 0.597, 0.039, 0.07],
  ];
  return plate(w, h, (u, v) => {
    // One bent mass. The approach sits lower than the held shoulder on the right.
    const bend = Math.max(0, Math.min(1, (u - 0.53) / 0.34));
    const body = ellipse(u, v, [0.86, mix(0.69, 0.51, bend * bend * (3 - 2 * bend)), 0.321, 0.244], aspect);
    const shoulder = ellipse(u, v, [1.05, 0.55, 0.285, 0.267], aspect);
    const mass = union(body, shoulder, 0.06);
    return Math.min(mass, ...scatter.map((island) => ellipse(u, v, island, aspect)));
  });
}

export { constellation, roi };
