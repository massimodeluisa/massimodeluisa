import { FACTS } from "./facts.mjs";
import { add, camera, clamp, cross, depthOf, fitOrigin, mul, norm, project, viewDir } from "../../kit/math.mjs";

const R = FACTS.ke.diameterNm / 2;
const LENGTH = FACTS.frontiers.spikeDrawnNm;
const LOBE_R = 3.7;
const SPREAD = 5.1;
const GOLD = Math.PI * (3 - Math.sqrt(5));

export const STAGES = [
  { id: "crown", label: "Crown", at: 0, key: "1" },
  { id: "section", label: "Section", at: 1, key: "2" },
];

export const VIEW = { width: 720, height: 560 };
export const GUTTER = 150;

export function plateCamera(cam) {
  const fitted = fitOrigin(FRAME, cam, VIEW.width - GUTTER * 2, VIEW.height, 16);
  fitted.origin = [fitted.origin[0] + GUTTER, fitted.origin[1]];
  return fitted;
}

export const FRAME = [
  [-70, -70, -62],
  [70, 70, -62],
  [-70, -70, 74],
  [70, 70, 74],
];

function sphereDirs(count) {
  return Array.from({ length: count }, (_, i) => {
    const z = count === 1 ? 0 : 1 - (i / (count - 1)) * 2;
    const radius = Math.sqrt(Math.max(0, 1 - z * z));
    const t = GOLD * i;
    return [Math.cos(t) * radius, Math.sin(t) * radius, z];
  });
}

function triad(axis) {
  const up = Math.abs(axis[2]) < 0.85 ? [0, 0, 1] : [1, 0, 0];
  const u = norm(cross(axis, up));
  const v = cross(axis, u);
  return { u, v };
}

function club(anchor, dir, spin) {
  const axis = norm(dir);
  const head = add(anchor, mul(axis, LENGTH));
  const neck = add(anchor, mul(axis, Math.max(1.4, LENGTH - LOBE_R)));
  const { u, v } = triad(axis);
  const lobes = [0, 1, 2].map((i) => {
    const a = spin + (i / 3) * Math.PI * 2;
    return add(head, add(mul(u, Math.cos(a) * SPREAD), mul(v, Math.sin(a) * SPREAD)));
  });
  return { anchor, dir: axis, neck, head, lobes, length: LENGTH, lobeR: LOBE_R, stalkR: 1.05, spread: SPREAD };
}

const DIRS = sphereDirs(52);

function facingOf(dir, view) {
  return dir[0] * view[0] + dir[1] * view[1] + dir[2] * view[2];
}

export function pose(u, { azimuth = -18, elevation = 50, explode = 0 } = {}) {
  const t = clamp(u, 0, 1);
  const section = t > 0.5 || explode > 0.5;
  const center = [0, 0, 0];
  const cam = camera({ azimuth, elevation, scale: 2.7 });
  const view = viewDir(cam);
  const spikes = DIRS.map((normal, index) => {
    const spec = club(add(center, mul(normal, R)), normal, index * 0.85);
    return { ...spec, draw: !section && facingOf(normal, view) > -0.08 };
  });
  const fitted = plateCamera(cam);
  const ranked = spikes
    .map((spike, index) => ({ index, depth: depthOf(spike.head, fitted), at: project(spike.head, fitted) }))
    .filter((item) => spikes[item.index].draw)
    .sort((a, b) => b.depth - a.depth);
  const kept = [];
  for (const item of ranked) {
    const clear = kept.every((other) => Math.hypot(other.at[0] - item.at[0], other.at[1] - item.at[1]) > 38);
    if (clear) kept.push(item);
    else spikes[item.index].draw = false;
  }
  const drawnHeads = spikes.filter((spike) => spike.draw).map((spike) => spike.anchor);
  const marks = sphereDirs(72).map((normal) => {
    const at = add(center, mul(normal, R * 0.98));
    const nearSpike = drawnHeads.some((anchor) => Math.hypot(anchor[0] - at[0], anchor[1] - at[1], anchor[2] - at[2]) < 9);
    return { at, draw: !section && !nearSpike && facingOf(normal, view) > 0.22 };
  });
  const rimCount = 14;
  const rim = Array.from({ length: rimCount }, (_, i) => {
    const a = (i / rimCount) * Math.PI * 2 + 0.2;
    const normal = [Math.cos(a), Math.sin(a), 0];
    return { ...club(add(center, mul(normal, R)), normal, a), draw: section };
  });
  const membraneInner = R - 11;
  const hooks = Array.from({ length: 18 }, (_, i) => {
    const a = ((i + 0.5) / 18) * Math.PI * 2;
    const mid = membraneInner + 5.4;
    const radial = [Math.cos(a), Math.sin(a), 0];
    const tangent = [-Math.sin(a), Math.cos(a), 0];
    const at = mul(radial, mid);
    return {
      from: add(at, mul(radial, -3.4)),
      bend: add(at, mul(radial, 1.6)),
      to: add(add(at, mul(radial, 1.6)), mul(tangent, 3.8)),
      draw: section,
    };
  });
  const channels = [0.4, 1.5, 2.7, 3.8, 5.1].map((a) => {
    const radial = [Math.cos(a), Math.sin(a), 0];
    return {
      from: mul(radial, membraneInner - 0.4),
      to: mul(radial, R + 1.2),
      draw: section,
    };
  });
  const beads = [];
  const strand = [];
  const loops = [
    { x: -16, y: 12, r: 9.2, n: 6 },
    { x: 16, y: 12, r: 9.2, n: 6 },
    { x: 0, y: -14, r: 9.2, n: 6 },
  ];
  const starts = [];
  for (const loop of loops) {
    const start = beads.length;
    starts.push(start);
    for (let i = 0; i < loop.n; i++) {
      const a = (i / loop.n) * Math.PI * 2 - 0.5;
      beads.push([loop.x + Math.cos(a) * loop.r, loop.y + Math.sin(a) * loop.r, 1.6]);
      if (i > 0) strand.push([beads[beads.length - 2], beads[beads.length - 1]]);
    }
    strand.push([beads[beads.length - 1], beads[start]]);
  }
  const link = (a0, a1, b0, b1) => {
    let best = null;
    for (let i = a0; i < a1; i++) {
      for (let j = b0; j < b1; j++) {
        const d = Math.hypot(beads[i][0] - beads[j][0], beads[i][1] - beads[j][1]);
        if (!best || d < best.d) best = { i, j, d };
      }
    }
    strand.push([beads[best.i], beads[best.j]]);
  };
  link(starts[0], starts[1], starts[1], starts[2]);
  link(starts[1], starts[2], starts[2], beads.length);
  const shown = spikes.filter((spike) => spike.draw).length;
  const shownRim = rim.filter((spike) => spike.draw).length;
  const shownN = section ? beads.length : 0;
  const stage = STAGES.reduce((best, item) => (Math.abs(item.at - t) < Math.abs(best.at - t) ? item : best));
  const readout = section ? `S ${shownRim} · N ${shownN}` : `S ${shown}`;
  return {
    t,
    stage,
    section,
    center,
    envelopeR: R,
    membraneInner,
    spikes,
    marks,
    rim,
    hooks,
    channels,
    beads,
    strand,
    shown,
    shownRim,
    shownN,
    placed: spikes.length,
    readout,
    azimuth,
    elevation,
    cam,
    accent: section ? "n" : "spike",
  };
}
