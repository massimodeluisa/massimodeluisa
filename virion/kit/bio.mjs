import { add, mul, norm, sub } from "./math.mjs";
import { ball, box, dotSvg, paintItem, rod, sphere } from "./iso.mjs";

function triad(axis) {
  const up = Math.abs(axis[2]) < 0.85 ? [0, 0, 1] : [1, 0, 0];
  const u = norm([axis[1] * up[2] - axis[2] * up[1], axis[2] * up[0] - axis[0] * up[2], axis[0] * up[1] - axis[1] * up[0]]);
  const v = [
    axis[1] * u[2] - axis[2] * u[1],
    axis[2] * u[0] - axis[0] * u[2],
    axis[0] * u[1] - axis[1] * u[0],
  ];
  return { u, v };
}

function feet(count, radius, axis) {
  const { u, v } = triad(axis);
  return Array.from({ length: count }, (_, i) => {
    const a = (i / count) * Math.PI * 2 + 0.4;
    return add(mul(u, Math.cos(a) * radius), mul(v, Math.sin(a) * radius));
  });
}

export function membraneTile(tile, cam, { tone = "mid", edge = false } = {}) {
  const mesh = box(tile.x, tile.y, tile.w, tile.d, tile.z, tile.h, cam);
  const mark = dotSvg([tile.cx, tile.cy, tile.z + tile.h], cam, 0.9, "lo");
  const painted = paintItem(mesh, { tone, edge });
  if (!painted) return [];
  return [painted, { depth: mesh.depth + 0.02, svg: mark }];
}

export function glycoprotein(base, height, headR, cam, { tone = "hi", lit = false, lobes = 1 } = {}) {
  const top = [base[0], base[1], base[2] + height];
  const items = [paintItem(rod(base, top, 1.15, cam, 8), { tone, lit })];
  if (headR > 0.25) {
    const head = add(top, [0, 0, headR * 0.65]);
    for (const mesh of sphere(head, headR, cam, { bands: 5 })) items.push(paintItem(mesh, { tone, lit }));
    if (lobes > 1) {
      for (const offset of feet(lobes, headR * 0.85, [0, 0, 1])) {
        const at = add(head, offset);
        for (const mesh of sphere(at, headR * 0.55, cam, { bands: 3 })) items.push(paintItem(mesh, { tone: "hi", lit }));
      }
    }
  }
  return items;
}

export function spike(anchor, dir, { length, head, stalk, lobes, fusion = 0, peptide = 0, spread = 2.2 }, cam, { tone = "hi", lit = false } = {}) {
  const axis = norm(dir);
  const neck = add(anchor, mul(axis, Math.max(0.8, length - head * 0.8)));
  const tip = add(anchor, mul(axis, length));
  const items = [];
  for (const offset of feet(lobes, spread, axis)) {
    const from = add(anchor, offset);
    const to = add(neck, mul(offset, 0.25));
    items.push(paintItem(rod(from, to, stalk, cam, 7), { tone, lit }));
  }
  for (const mesh of sphere(tip, head * (1 - fusion * 0.18), cam, { bands: 5 })) {
    items.push(paintItem(mesh, { tone, lit }));
  }
  if (peptide > 0.4) {
    const end = add(tip, mul(axis, peptide));
    items.push(paintItem(rod(tip, end, Math.max(0.45, stalk * 0.55), cam, 6), { tone, lit }));
  }
  return items;
}

export function envelope(center, radius, cam, { skipBottom = 0, spread = 0, cutaway = false, tone = "mid" } = {}) {
  if (spread < 0.8 && !cutaway) return [paintItem(ball(center, radius, cam), { tone })];
  const painted = sphere(center, radius, cam, { bands: 12, skipBottom, spread }).map((mesh) => paintItem(mesh, { tone })).filter(Boolean);
  if (!cutaway) return painted;
  const ordered = [...painted].sort((a, b) => a.depth - b.depth);
  return ordered.slice(0, Math.max(3, Math.ceil(ordered.length * 0.68)));
}

export function rnpRod(from, to, cam, { lit = false } = {}) {
  const axis = norm(sub(to, from));
  const length = Math.hypot(to[0] - from[0], to[1] - from[1], to[2] - from[2]);
  const items = [paintItem(rod(from, to, 2.1, cam, 8), { tone: "hi", lit })];
  const turns = Math.max(2, Math.round(length / 7));
  for (let i = 1; i < turns; i++) {
    const at = add(from, mul(axis, (length * i) / turns));
    items.push(paintItem(rod(add(at, mul(axis, -0.35)), add(at, mul(axis, 0.35)), 2.55, cam, 8), { tone: "mid", lit }));
  }
  items.push(paintItem(rod(from, add(from, mul(axis, 1.2)), 2.8, cam, 8), { tone: "hi", lit }));
  return items;
}
