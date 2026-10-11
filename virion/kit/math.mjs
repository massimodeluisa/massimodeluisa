const RAD = Math.PI / 180;

export function add(a, b) {
  return [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
}

export function sub(a, b) {
  return [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
}

export function mul(a, s) {
  return [a[0] * s, a[1] * s, a[2] * s];
}

export function dot(a, b) {
  return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
}

export function cross(a, b) {
  return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
}

export function len(a) {
  return Math.hypot(a[0], a[1], a[2]);
}

export function norm(a) {
  const l = len(a) || 1;
  return [a[0] / l, a[1] / l, a[2] / l];
}

export function lerp(a, b, t) {
  return a + (b - a) * t;
}

export function clamp(v, lo, hi) {
  return Math.max(lo, Math.min(hi, v));
}

export function smooth(u, a, b) {
  if (u <= a) return 0;
  if (u >= b) return 1;
  const t = (u - a) / (b - a);
  return t * t * (3 - 2 * t);
}

export function camera({ azimuth = 40, elevation = 28, scale = 2.55, origin = [360, 400] } = {}) {
  const a = azimuth * RAD;
  const e = elevation * RAD;
  return {
    azimuth,
    elevation,
    scale,
    origin,
    sinA: Math.sin(a),
    cosA: Math.cos(a),
    sinE: Math.sin(e),
    cosE: Math.cos(e),
  };
}

export function project([x, y, z], cam) {
  const { sinA, cosA, sinE, cosE, scale, origin } = cam;
  return [
    origin[0] + (x * sinA - y * cosA) * scale,
    origin[1] + ((x * cosA + y * sinA) * sinE - z * cosE) * scale,
  ];
}

export function depthOf([x, y, z], cam) {
  return (x * cam.cosA + y * cam.sinA) * cam.cosE + z * cam.sinE;
}

export function viewDir(cam) {
  return [cam.cosA * cam.cosE, cam.sinA * cam.cosE, cam.sinE];
}

const LIGHT = norm([-0.42, -0.38, 0.82]);

export function shadeOf(normal) {
  const t = (dot(norm(normal), LIGHT) + 1) / 2;
  return Math.max(0, Math.min(3, Math.floor(t * 3.999)));
}

export function tenth(value) {
  const text = (Math.round(value * 10) / 10).toFixed(1).replace(/\.0$/, "");
  return text === "-0" ? "0" : text;
}

export function pathOf(points, closed = false) {
  if (!points.length) return "";
  const d = points.map(([x, y], i) => `${i ? "L" : "M"}${tenth(x)} ${tenth(y)}`).join("");
  return closed ? `${d}Z` : d;
}

export function convexHull(points) {
  const sorted = [...points].sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  if (sorted.length < 3) return sorted;
  const cross2 = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
  const lower = [];
  for (const p of sorted) {
    while (lower.length >= 2 && cross2(lower[lower.length - 2], lower[lower.length - 1], p) <= 0) lower.pop();
    lower.push(p);
  }
  const upper = [];
  for (let i = sorted.length - 1; i >= 0; i--) {
    const p = sorted[i];
    while (upper.length >= 2 && cross2(upper[upper.length - 2], upper[upper.length - 1], p) <= 0) upper.pop();
    upper.push(p);
  }
  return [...lower.slice(0, -1), ...upper.slice(0, -1)];
}

export function fitOrigin(points, cam, width, height, pad = 28) {
  const bare = { ...cam, origin: [0, 0] };
  const projected = points.map((p) => project(p, bare));
  const xs = projected.map((p) => p[0]);
  const ys = projected.map((p) => p[1]);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  const spanX = maxX - minX || 1;
  const spanY = maxY - minY || 1;
  const scale = Math.min((width - pad * 2) / (spanX / cam.scale), (height - pad * 2) / (spanY / cam.scale));
  const fitted = camera({ azimuth: cam.azimuth, elevation: cam.elevation, scale, origin: [0, 0] });
  const again = points.map((p) => project(p, fitted));
  const xs2 = again.map((p) => p[0]);
  const ys2 = again.map((p) => p[1]);
  const cx = (Math.min(...xs2) + Math.max(...xs2)) / 2;
  const cy = (Math.min(...ys2) + Math.max(...ys2)) / 2;
  fitted.origin = [width / 2 - cx, height / 2 - cy];
  return fitted;
}
