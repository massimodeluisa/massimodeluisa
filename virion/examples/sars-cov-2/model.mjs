import { FACTS } from "./facts.mjs";
import { add, camera, clamp, cross, depthOf, fitOrigin, mul, norm, project, smooth, viewDir } from "../../kit/math.mjs";

const R = FACTS.ke.diameterNm / 2;
const GOLD = Math.PI * (3 - Math.sqrt(5));

export const STAGES = [
  { id: "crown", label: "Crown", at: 0, key: "1" },
  { id: "hinge", label: "Hinge", at: 1, key: "2" },
];

function sphereDirs(count) {
  return Array.from({ length: count }, (_, i) => {
    const z = count === 1 ? 0 : 1 - (i / (count - 1)) * 2;
    const radius = Math.sqrt(Math.max(0, 1 - z * z));
    const t = GOLD * i;
    return [Math.cos(t) * radius, Math.sin(t) * radius, z];
  });
}

const DIRS = sphereDirs(FACTS.ke.trimers);

export const VIEW = { width: 720, height: 520 };

export const FRAME = [
  [-72, -72, -64],
  [72, 72, -64],
  [-72, -72, 76],
  [72, 72, 76],
];

export function mouthDir(view) {
  const up = Math.abs(view[2]) < 0.9 ? [0, 0, 1] : [1, 0, 0];
  const right = norm(cross(view, up));
  const lift = norm(cross(right, view));
  return norm(add(mul(view, 0.58), mul(lift, 0.62)));
}

function hinge(normal, angle, spin) {
  const up = Math.abs(normal[2]) < 0.85 ? [0, 0, 1] : [1, 0, 0];
  const tangent = norm(cross(normal, up));
  const bitangent = cross(normal, tangent);
  const lean = norm(add(mul(tangent, Math.cos(spin)), mul(bitangent, Math.sin(spin))));
  return norm(add(mul(normal, Math.cos(angle)), mul(lean, Math.sin(angle))));
}

export function pose(u, { azimuth = -32, elevation = 24, explode = 0 } = {}) {
  const t = clamp(u, 0, 1);
  const tiltDeg = smooth(t, 0, 1) * FACTS.ke.tiltCommonBelowDeg * (1 - explode);
  const tilt = (tiltDeg * Math.PI) / 180;
  const center = [0, explode * 4, explode * 8];
  const cam = camera({ azimuth, elevation, scale: 2.7 });
  const view = viewDir(cam);
  const open = explode > 0.2;
  const spikes = DIRS.map((normal, index) => {
    const dir = hinge(normal, tilt, index * 0.7);
    const anchor = add(center, mul(normal, R));
    const head = add(anchor, mul(dir, FACTS.ke.headCenterNm));
    const facing = dir[0] * view[0] + dir[1] * view[1] + dir[2] * view[2];
    return {
      anchor,
      dir,
      head,
      length: FACTS.ke.headCenterNm,
      headR: 5,
      stalk: 1.15,
      lobes: 3,
      spread: 4.4,
      fusion: 0,
      peptide: 0,
      draw: !open && facing > 0.08,
    };
  });
  const fitted = fitOrigin(FRAME, cam, VIEW.width, VIEW.height, 36);
  const ranked = spikes
    .map((spike, index) => ({ index, depth: depthOf(spike.head, fitted), at: project(spike.head, fitted) }))
    .filter((item) => spikes[item.index].draw)
    .sort((a, b) => b.depth - a.depth);
  const kept = [];
  for (const item of ranked) {
    const clear = kept.every((other) => Math.hypot(other.at[0] - item.at[0], other.at[1] - item.at[1]) > 46);
    if (clear) kept.push(item);
    else spikes[item.index].draw = false;
  }
  const mouth = mouthDir(view);
  const right = norm(cross(mouth, Math.abs(mouth[2]) < 0.85 ? [0, 0, 1] : [1, 0, 0]));
  const lift = cross(right, mouth);
  const half = FACTS.turonova.vrnpLengthNm / 2;
  const seats = [[-1, -1], [1, -1], [-1, 1], [1, 1]];
  const rnps = seats.map(([x, y]) => {
    const at = add(center, add(add(mul(right, x * 11), mul(lift, y * 9)), mul(mouth, 16)));
    return {
      from: add(at, [0, 0, -half]),
      to: add(at, [0, 0, half]),
      draw: open,
    };
  });
  const shown = spikes.filter((spike) => spike.draw).length;
  const shownRnp = rnps.filter((rod) => rod.draw).length;
  const stage = STAGES.reduce((best, item) => (Math.abs(item.at - t) < Math.abs(best.at - t) ? item : best));
  const readout = [
    shown ? `S ${shown}` : "",
    open ? "" : `tilt ${Math.round(tiltDeg)}°`,
    open ? `RNP ${shownRnp}` : "",
    explode > 0.03 ? `apart ${explode.toFixed(2)}` : "",
  ].filter(Boolean).join(" · ");
  return {
    t,
    stage,
    tiltDeg,
    explode,
    open,
    center,
    envelopeR: R,
    spikes,
    rnps,
    shown,
    shownRnp,
    placed: spikes.length,
    readout,
    azimuth,
    elevation,
    cam,
    accent: open ? "rnp" : "spike",
  };
}
