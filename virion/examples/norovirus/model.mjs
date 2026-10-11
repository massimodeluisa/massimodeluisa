import { FACTS } from "./facts.mjs";
import { add, camera, clamp, dot, mul, norm, smooth, viewDir } from "../../kit/math.mjs";

const SHELL_R = FACTS.prasad1994.shellOuterNm;
const OUTER_R = FACTS.prasad1994.diameterNm / 2;
const ARCH = OUTER_R - SHELL_R;
const COLS = 9;
const ROWS = 6;
const TW = 8;
const TD = 7;
const DOCK_Z = 24;
const PIT = 28;
const PIT_SIGMA = 18;

export const STAGES = [
  { id: "dock", label: "Dock", at: 1, key: "1" },
  { id: "enter", label: "Enter", at: 2, key: "2" },
  { id: "uncoat", label: "Uncoat", at: 3, key: "3" },
  { id: "lyse", label: "Lyse", at: 4, key: "4" },
];

const GOLD = Math.PI * (3 - Math.sqrt(5));

function facingArches() {
  const dirs = [];
  const n = 48;
  for (let i = 0; i < n; i++) {
    const z = 1 - (i / (n - 1)) * 2;
    const r = Math.sqrt(Math.max(0, 1 - z * z));
    const t = GOLD * i;
    const d = [Math.cos(t) * r, Math.sin(t) * r, z];
    if (d[2] < -0.15) continue;
    dirs.push(d);
  }
  return dirs.slice(0, 14);
}

function contactDirs() {
  return [0, 1, 2].map((i) => {
    const a = -0.95 + i * 0.95;
    const tilt = 0.86;
    return norm([Math.cos(a) * tilt, Math.sin(a) * tilt, -Math.sqrt(1 - tilt * tilt)]);
  });
}

const ARCH_DIRS = facingArches();
const CONTACT = contactDirs();

function grid() {
  const width = COLS * TW;
  const depth = ROWS * TD;
  const x0 = -width / 2;
  const y0 = -depth / 2;
  const tiles = [];
  for (let j = 0; j < ROWS; j++) {
    for (let i = 0; i < COLS; i++) {
      const x = x0 + i * TW;
      const y = y0 + j * TD;
      tiles.push({ i, j, x, y, w: TW, d: TD, cx: x + TW / 2, cy: y + TD / 2 });
    }
  }
  return tiles;
}

const TILES = grid();

function pitOf(x, y) {
  const dist = Math.hypot(x, y);
  return Math.exp(-(dist * dist) / (2 * PIT_SIGMA * PIT_SIGMA));
}

function nearestTile(x, y) {
  return TILES.reduce((best, tile) => (Math.hypot(tile.cx - x, tile.cy - y) < Math.hypot(best.cx - x, best.cy - y) ? tile : best));
}

const SUGAR_TILES = (() => {
  const used = new Set();
  const picked = [];
  for (const dir of CONTACT) {
    const tile = nearestTile(dir[0] * OUTER_R, dir[1] * OUTER_R);
    const id = `${tile.i}:${tile.j}`;
    if (used.has(id)) continue;
    used.add(id);
    picked.push(tile);
  }
  return picked;
})();

export function pose(u, { azimuth = -28, elevation = 26, explode = 0 } = {}) {
  const t = clamp(u, 0, 4);
  const approach = smooth(t, 0, 1);
  const enter = smooth(t, 1, 2);
  const uncoat = smooth(t, 2, 3);
  const lyse = smooth(t, 3, 4);
  const cup = enter * (1 - lyse);
  const open = uncoat * (1 - lyse);
  const release = uncoat * (1 - smooth(t, 3.15, 3.7));
  const hold = enter * (1 - smooth(t, 3.05, 3.85));
  const ringPit = SUGAR_TILES.reduce((sum, tile) => sum + pitOf(tile.cx, tile.cy), 0) / SUGAR_TILES.length;
  const centerZ = DOCK_Z + (1 - approach) * 28 - hold * PIT * ringPit + lyse * 18 + explode * 10;
  const center = [0, explode * 4, centerZ];
  const cam = camera({ azimuth, elevation, scale: 2.7 });
  const view = viewDir(cam);
  const membrane = TILES.map((tile) => {
    const drop = cup * PIT * pitOf(tile.cx, tile.cy);
    const hole = lyse * (Math.hypot(tile.cx, tile.cy) < 13 ? 1 : 0);
    const rim = tile.i === 0 || tile.j === 0 || tile.i === COLS - 1 || tile.j === ROWS - 1;
    return { ...tile, z: -drop, h: 4.2, edge: rim || drop > 3 || hole > 0.4, gone: hole > 0.8 };
  });
  const tileAt = (x, y) => membrane.reduce((best, tile) => (Math.hypot(tile.cx - x, tile.cy - y) < Math.hypot(best.cx - x, best.cy - y) ? tile : best));
  const sugars = SUGAR_TILES.map((tile) => {
    const live = tileAt(tile.cx, tile.cy);
    const base = [live.cx, live.cy, live.z + live.h];
    return { base, head: [base[0], base[1], base[2] + 3.2], headR: 1.15, gone: live.gone };
  });
  const arches = [...CONTACT, ...ARCH_DIRS].map((dir, index) => {
    const anchor = add(center, mul(dir, SHELL_R + explode * (index < CONTACT.length ? 6 : 8)));
    const tip = add(anchor, mul(dir, ARCH));
    const floor = tileAt(tip[0], tip[1]);
    const buried = tip[2] < floor.z + floor.h - 0.4;
    let bound = false;
    if (index < CONTACT.length) {
      for (const sugar of sugars) {
        if (sugar.gone) continue;
        const dx = tip[0] - sugar.head[0];
        const dy = tip[1] - sugar.head[1];
        const dz = tip[2] - sugar.head[2];
        if (Math.hypot(dx, dy, dz) < 8) bound = true;
      }
    }
    return {
      anchor,
      dir,
      length: ARCH,
      head: 1.9,
      stalk: 0.38,
      lobes: 2,
      spread: 1.7,
      fusion: 0,
      peptide: 0,
      bound,
      draw: dot(dir, view) > -0.02 && !buried,
    };
  });
  const lean = release * 7;
  const rnaTo = [center[0] + lean * 0.35, center[1] - lean * 0.2, center[2] - 1];
  const rnaFrom = [center[0] + lean, center[1] - lean, rnaTo[2] - 16 - release * 30];
  const rnaOut = release > 0.55 && rnaFrom[2] < -10;
  const bound = arches.filter((arch) => arch.bound).length;
  const shown = arches.filter((arch) => arch.draw).length;
  const accent = t >= 3.2 ? "shell" : t >= 2.15 && t < 3.2 ? "rna" : "arch";
  const stage = STAGES.reduce((best, item) => (Math.abs(item.at - t) < Math.abs(best.at - t) ? item : best));
  const readout = [
    `${FACTS.prasad1994.diameterNm} nm`,
    `T=${FACTS.viralzone.tNumber}`,
    `VP1 ${FACTS.viralzone.vp1}`,
    `bound ${bound}`,
    `open ${open.toFixed(2)}`,
    `RNA ${rnaOut ? "out" : "in"}`,
    explode > 0.03 ? `apart ${explode.toFixed(2)}` : "",
  ].filter(Boolean).join(" · ");
  return {
    t,
    stage,
    cup,
    open,
    release,
    explode,
    accent,
    center,
    shellR: SHELL_R,
    outerR: OUTER_R,
    spread: open * 7 + explode * 5,
    cutaway: open > 0.2 || explode > 0.18,
    membrane,
    sugars,
    arches,
    rna: { from: rnaFrom, to: rnaTo, out: rnaOut, visible: open > 0.15 || explode > 0.18 },
    bound,
    shown,
    rnaOut,
    dimers: FACTS.prasad1994.dimers,
    readout,
    azimuth,
    elevation,
    cam,
  };
}
