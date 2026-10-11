import { add, cross, depthOf, dot, mul, norm, pathOf, convexHull, project, shadeOf, sub, viewDir } from "./math.mjs";

function ringPoints(origin, axis, radius, steps) {
  const up = Math.abs(axis[2]) < 0.85 ? [0, 0, 1] : [1, 0, 0];
  const u = norm(cross(axis, up));
  const v = cross(axis, u);
  return Array.from({ length: steps }, (_, i) => {
    const a = (i / steps) * Math.PI * 2;
    return add(origin, add(mul(u, Math.cos(a) * radius), mul(v, Math.sin(a) * radius)));
  });
}

export function prism(bottom, top, cam) {
  const count = bottom.length;
  const view = viewDir(cam);
  const shades = [[], [], [], []];
  const projected = [];
  for (let i = 0; i < count; i++) {
    const j = (i + 1) % count;
    const n = norm(cross(sub(bottom[j], bottom[i]), sub(top[i], bottom[i])));
    const face = [bottom[i], bottom[j], top[j], top[i]];
    if (dot(n, view) > 0.02) {
      shades[shadeOf(n)].push(pathOf(face.map((p) => project(p, cam)), true));
    }
    projected.push(project(bottom[i], cam), project(top[i], cam));
  }
  const topN = norm(cross(sub(top[1], top[0]), sub(top[2] || top[0], top[0])));
  if (dot(topN, view) > 0.02) shades[shadeOf(topN)].push(pathOf(top.map((p) => project(p, cam)), true));
  const botN = norm(cross(sub(bottom[1], bottom[0]), sub(bottom[0], bottom[2] || bottom[0])));
  if (dot(botN, view) > 0.02) shades[shadeOf(botN)].push(pathOf(bottom.map((p) => project(p, cam)), true));
  const hull = convexHull(projected);
  const mid = mul(add(bottom[0], top[0]), 0.5);
  return {
    fill: pathOf(hull, true),
    shades: shades.map((parts) => parts.join("")),
    outline: pathOf(hull, true),
    depth: depthOf(mid, cam),
  };
}

export function rod(from, to, radius, cam, steps = 12) {
  const axis = norm(sub(to, from));
  if (!Number.isFinite(axis[0]) || lenOrZero(sub(to, from)) < 0.15 || radius < 0.05) return null;
  const bottom = ringPoints(from, axis, radius, steps);
  const top = ringPoints(to, axis, radius, steps);
  const mesh = prism(bottom, top, cam);
  mesh.depth = depthOf(mul(add(from, to), 0.5), cam);
  return mesh;
}

function lenOrZero(a) {
  return Math.hypot(a[0], a[1], a[2]);
}

export function box(x, y, w, d, z, h, cam) {
  const bottom = [
    [x, y, z],
    [x + w, y, z],
    [x + w, y + d, z],
    [x, y + d, z],
  ];
  const top = bottom.map((p) => [p[0], p[1], z + h]);
  const mesh = prism(bottom, top, cam);
  mesh.depth = depthOf([x + w / 2, y + d / 2, z + h / 2], cam);
  return mesh;
}

export function sphere(center, radius, cam, { bands = 11, skipBottom = 0, spread = 0 } = {}) {
  const meshes = [];
  for (let i = 0; i < bands; i++) {
    const t0 = i / bands;
    const t1 = (i + 1) / bands;
    if (t1 <= skipBottom) continue;
    const lat0 = -Math.PI / 2 + Math.PI * Math.max(t0, skipBottom);
    const lat1 = -Math.PI / 2 + Math.PI * t1;
    const mid = (lat0 + lat1) / 2;
    const r = Math.max(0.4, Math.cos(mid) * radius);
    const z0 = center[2] + Math.sin(lat0) * radius + Math.sin(lat0) * spread;
    const z1 = center[2] + Math.sin(lat1) * radius + Math.sin(lat1) * spread;
    const mesh = rod([center[0], center[1], Math.min(z0, z1)], [center[0], center[1], Math.max(z0, z1)], r, cam, 18);
    if (mesh) meshes.push(mesh);
  }
  return meshes;
}

export function solidSvg(mesh, { tone = "mid", lit = false, edge = true } = {}) {
  if (!mesh?.fill) return "";
  const shades = mesh.shades.map((d, i) => (d ? `<path class="v-shade" data-shade="${i}" d="${d}"/>` : "")).join("");
  const stroke = edge ? `<path class="v-edge" data-tone="${tone}" d="${mesh.outline}"/>` : "";
  return `<g class="v-solid"${lit ? ' data-lit=""' : ""}><path class="v-fill" d="${mesh.fill}"/>${shades}${stroke}</g>`;
}

export function ball(center, radius, cam, { bands = 18, steps = 22 } = {}) {
  const shades = [[], [], [], []];
  const view = viewDir(cam);
  const samples = [];
  const ringAt = (lat) => Array.from({ length: steps }, (_, i) => {
    const a = (i / steps) * Math.PI * 2;
    const r = Math.cos(lat) * radius;
    return [center[0] + Math.cos(a) * r, center[1] + Math.sin(a) * r, center[2] + Math.sin(lat) * radius];
  });
  for (let band = 0; band < bands; band++) {
    const lat0 = -Math.PI / 2 + (Math.PI * band) / bands;
    const lat1 = -Math.PI / 2 + (Math.PI * (band + 1)) / bands;
    const bottom = ringAt(lat0);
    const top = ringAt(lat1);
    for (let i = 0; i < steps; i++) {
      const j = (i + 1) % steps;
      const n = norm(cross(sub(bottom[j], bottom[i]), sub(top[i], bottom[i])));
      if (dot(n, view) <= 0.04) continue;
      shades[shadeOf(n)].push(pathOf([bottom[i], bottom[j], top[j], top[i]].map((p) => project(p, cam)), true));
    }
    if (band % 2 === 0) samples.push(...bottom);
  }
  samples.push([center[0], center[1], center[2] + radius], [center[0], center[1], center[2] - radius]);
  const hull = convexHull(samples.map((p) => project(p, cam)));
  return {
    fill: pathOf(hull, true),
    shades: shades.map((parts) => parts.join("")),
    outline: pathOf(hull, true),
    depth: depthOf(center, cam),
  };
}

export function dotSvg(point, cam, size, tone = "lo") {
  const [x, y] = project(point, cam);
  return `<circle class="v-dot" data-tone="${tone}" cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${size}"/>`;
}

export function haloSvg(center, rx, ry, cam) {
  const [cx, cy] = project(center, cam);
  const [ex] = project([center[0] + rx, center[1], center[2]], cam);
  const [, ey] = project([center[0], center[1] + ry, center[2]], cam);
  const sx = Math.max(8, Math.hypot(ex - cx, 0));
  const sy = Math.max(6, Math.abs(ey - cy));
  return `<ellipse class="v-halo" cx="${cx.toFixed(1)}" cy="${(cy + 8).toFixed(1)}" rx="${sx.toFixed(1)}" ry="${sy.toFixed(1)}"/>`;
}

export function sortItems(items) {
  return items.filter(Boolean).sort((a, b) => a.depth - b.depth);
}

export function paintItem(mesh, style) {
  if (!mesh) return null;
  return { depth: mesh.depth, svg: solidSvg(mesh, style) };
}
