import { FACTS } from "./facts.mjs";
import { add, camera, fitOrigin, mul, project, viewDir } from "../../kit/math.mjs";

const R = FACTS.schmid.temDiameterUm / 2;
const NUCLEUS_R = R * Math.cbrt(FACTS.schmid.nucleusFraction);
const NUCLEUS_AT = [-0.22, 0.04, 0];
const VILLUS = 0.38;
const GOLD = Math.PI * (3 - Math.sqrt(5));

export const STAGES = [
  { id: "outside", label: "Outside", at: 0, key: "1" },
  { id: "section", label: "Section", at: 1, key: "2" },
];

export const VIEW = { width: 720, height: 560 };
export const GUTTER = 150;

export const FRAME = [
  [-3.7, -3.7, -3.7],
  [3.7, 3.7, -3.7],
  [-3.7, -3.7, 3.7],
  [3.7, 3.7, 3.7],
];

export function plateCamera(cam) {
  const fitted = fitOrigin(FRAME, cam, VIEW.width - GUTTER * 2, VIEW.height, 16);
  fitted.origin = [fitted.origin[0] + GUTTER, fitted.origin[1]];
  return fitted;
}

function sphereDirs(count) {
  return Array.from({ length: count }, (_, i) => {
    const z = count === 1 ? 0 : 1 - (i / (count - 1)) * 2;
    const radius = Math.sqrt(Math.max(0, 1 - z * z));
    const t = GOLD * i;
    return [Math.cos(t) * radius, Math.sin(t) * radius, z];
  });
}

function chromatin(nucleusAt, nucleusR) {
  const count = 8;
  return Array.from({ length: count }, (_, i) => {
    const a = (i / count) * Math.PI * 2 + 0.63;
    const at = add(nucleusAt, [Math.cos(a) * nucleusR * 0.76, Math.sin(a) * nucleusR * 0.76, 0.22]);
    return { at, r: 0.34 };
  });
}

function mitochondria(cellR, nucleusAt, nucleusR) {
  const angles = [-0.55, 0.2, 0.85];
  return angles.map((angle) => {
    const dir = [Math.cos(angle), Math.sin(angle), 0];
    const b = -2 * (dir[0] * nucleusAt[0] + dir[1] * nucleusAt[1]);
    const c = nucleusAt[0] ** 2 + nucleusAt[1] ** 2 - nucleusR ** 2;
    const outer = (-b + Math.sqrt(b * b - 4 * c)) / 2;
    const mid = (outer + cellR) / 2;
    const at = [dir[0] * mid, dir[1] * mid, 0.1];
    const tangent = [-dir[1], dir[0], 0];
    const half = 0.36;
    return {
      at,
      from: [at[0] - tangent[0] * half, at[1] - tangent[1] * half, at[2]],
      to: [at[0] + tangent[0] * half, at[1] + tangent[1] * half, at[2]],
      r: 0.24,
    };
  });
}

export function pose(u, { azimuth = -18, elevation = 58, explode = 0 } = {}) {
  const t = Math.max(0, Math.min(1, u));
  const cam = camera({ azimuth, elevation, scale: 2.7 });
  const fitted = plateCamera(cam);
  const view = viewDir(cam);
  const section = t > 0.5 || explode > 0.5;
  const center = [0, 0, 0];
  const nucleusAt = NUCLEUS_AT;
  const nucleusR = NUCLEUS_R;
  const blocks = chromatin(nucleusAt, nucleusR);
  const mitos = mitochondria(R, nucleusAt, nucleusR);
  const nucleolus = {
    at: add(nucleusAt, [0.5, 0.28, 0.14]),
    r: FACTS.nucleolusDrawnUm / 2,
  };
  const villi = sphereDirs(28).map((dir) => ({
    dir,
    anchor: mul(dir, R * 0.98),
    tip: mul(dir, R + VILLUS),
    draw: false,
  }));
  if (!section) {
    const kept = [];
    for (const villus of villi) {
      const facing = villus.dir[0] * view[0] + villus.dir[1] * view[1] + villus.dir[2] * view[2];
      if (facing < 0.18) continue;
      const [x, y] = project(villus.tip, fitted);
      const clear = kept.every((other) => Math.hypot(other.x - x, other.y - y) > 26);
      if (!clear) continue;
      villus.draw = true;
      kept.push({ x, y });
    }
  }
  const fraction = (nucleusR / R) ** 3;
  const shownV = villi.filter((villus) => villus.draw).length;
  const readout = section ? `N ${Math.round(fraction * 100)}%` : `${FACTS.schmid.temDiameterUm} μm`;
  return {
    t,
    section,
    center,
    radius: R,
    nucleusAt,
    nucleusR,
    blocks,
    mitos,
    nucleolus,
    villi,
    shownV,
    fraction,
    readout,
    cam,
    azimuth,
    elevation,
  };
}
