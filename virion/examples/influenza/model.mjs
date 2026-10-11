import { FACTS } from "./facts.mjs";
import { add, camera, clamp, dot, mul, norm, smooth, viewDir } from "../../kit/math.mjs";

const ENVELOPE_R = FACTS.hhmi.diameterNm / 2;
const HA_LEN = FACTS.harris.haTipNm;
const NA_LEN = FACTS.harris.naTipNm;
const M1_R = ENVELOPE_R - FACTS.harris.envelopeMatrixSpacingNm;
const COLS = 13;
const ROWS = 8;
const TW = 12;
const TD = 10;
const DOCK_Z = 63;
const PIT = 46;
const PIT_SIGMA = 40;

export const STAGES = [
  { id: "bind", label: "Bind", at: 1, key: "1" },
  { id: "enter", label: "Enter", at: 2, key: "2" },
  { id: "fuse", label: "Fuse", at: 3, key: "3" },
  { id: "uncoat", label: "Uncoat", at: 4, key: "4" },
  { id: "bud", label: "Bud", at: 5, key: "5" },
];

const GOLD = Math.PI * (3 - Math.sqrt(5));

function haDirections() {
  const dirs = [];
  const n = 64;
  for (let i = 0; i < n; i++) {
    const z = 1 - (i / (n - 1)) * 2;
    const r = Math.sqrt(Math.max(0, 1 - z * z));
    const t = GOLD * i;
    const d = [Math.cos(t) * r, Math.sin(t) * r, z];
    if (d[2] > 0.78) continue;
    dirs.push(d);
  }
  return dirs.slice(0, 26);
}

function cluster(count, polar, spin) {
  return Array.from({ length: count }, (_, i) => {
    const a = spin + (i / count) * Math.PI * 2;
    return norm([Math.cos(a) * polar, Math.sin(a) * polar, Math.sqrt(Math.max(0.05, 1 - polar * polar))]);
  });
}

const HA_DIRS = haDirections();
const NA_DIRS = cluster(6, 0.42, 0.3);
const M2_DIRS = cluster(FACTS.zebedee.tetramers[0] + 1, 0.62, 0.9);

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

const CONTACT = [0, 1, 2, 3, 4].map((i) => {
  const a = (-0.55 + i * 0.28);
  const tilt = 0.68;
  return norm([Math.cos(a) * tilt, Math.sin(a) * tilt, -Math.sqrt(1 - tilt * tilt)]);
});

function receptorTiles() {
  const used = new Set();
  const picked = [];
  for (const dir of CONTACT) {
    const xy = [dir[0] * (ENVELOPE_R + HA_LEN), dir[1] * (ENVELOPE_R + HA_LEN)];
    const tile = nearestTile(xy[0], xy[1]);
    const id = `${tile.i}:${tile.j}`;
    if (used.has(id)) continue;
    used.add(id);
    picked.push(tile);
  }
  return picked;
}

const RECEPTOR_TILES = receptorTiles();

function bundle(release, center) {
  const longest = FACTS.pr8.segments[0].nt;
  const order = [...FACTS.pr8.segments].sort((a, b) => b.nt - a.nt);
  const shift = release * 86;
  return order.map((segment, index) => {
    const span = 16 + 30 * (segment.nt / longest);
    const fan = 8 + release * 14;
    const around = index === 0 ? [0, 0] : [Math.cos(((index - 1) / 7) * Math.PI * 2) * fan, Math.sin(((index - 1) / 7) * Math.PI * 2) * fan];
    const z0 = center[2] - span * 0.42 - shift;
    const from = [center[0] + around[0], center[1] + around[1], z0];
    const to = [from[0], from[1], z0 + span];
    const out = to[2] < 6;
    return { ...segment, from, to, out, span };
  });
}

export function pose(u, { azimuth = -32, elevation = 24, explode = 0 } = {}) {
  const t = clamp(u, 0, 5);
  const approach = smooth(t, 0, 1);
  const enter = smooth(t, 1, 2);
  const fuse = smooth(t, 2, 3);
  const uncoat = smooth(t, 3, 4);
  const bud = smooth(t, 4, 5);
  const cup = enter * (1 - bud);
  const pH =
    t < 1 ? FACTS.endosome.extracellularPh :
    t < 2 ? FACTS.endosome.extracellularPh + (FACTS.endosome.earlyPh - FACTS.endosome.extracellularPh) * enter :
    t < 3 ? FACTS.endosome.earlyPh + (FACTS.endosome.fusionSetpoint - FACTS.endosome.earlyPh) * fuse :
    t < 4 ? FACTS.endosome.fusionSetpoint :
    FACTS.endosome.fusionSetpoint + (FACTS.endosome.extracellularPh - FACTS.endosome.fusionSetpoint) * bud;
  const spring = clamp((FACTS.endosome.m2OpenBelow + 0.4 - pH) / (FACTS.endosome.m2OpenBelow + 0.4 - FACTS.endosome.fusionSetpoint), 0, 1);
  const m2Open = clamp((FACTS.endosome.m2OpenBelow + 0.15 - pH) / 0.35, 0, 1);
  const release = t < 3 ? 0 : t < 4 ? uncoat : 1 - smooth(t, 4, 4.55);
  const cleaved = bud;
  const hold = enter * (1 - smooth(t, 4, 4.7));
  const ringPit = RECEPTOR_TILES.reduce((sum, tile) => sum + pitOf(tile.cx, tile.cy), 0) / RECEPTOR_TILES.length;
  const virionZ = DOCK_Z + (1 - approach) * 46 - hold * PIT * ringPit + bud * 22 + explode * 12;
  const center = [0, explode * 6, virionZ];
  const cam = camera({ azimuth, elevation, scale: 2.7 });
  const view = viewDir(cam);
  const membrane = TILES.map((tile) => {
const drop = cup * PIT * pitOf(tile.cx, tile.cy);
      const rim = tile.i === 0 || tile.j === 0 || tile.i === COLS - 1 || tile.j === ROWS - 1;
      return { ...tile, z: -drop, h: 7.2, edge: rim || drop > 6 };
  });
  const tileAt = (x, y) => membrane.reduce((best, tile) => (Math.hypot(tile.cx - x, tile.cy - y) < Math.hypot(best.cx - x, best.cy - y) ? tile : best));
  const receptors = RECEPTOR_TILES.map((tile) => {
    const live = tileAt(tile.cx, tile.cy);
    const base = [live.cx, live.cy, live.z + live.h];
    const headR = 2.35 * (1 - cleaved);
    return { base, head: [base[0], base[1], base[2] + 9 + headR], headR, alive: headR > 0.4 };
  });
  const ha = [...CONTACT, ...HA_DIRS].map((dir, index) => {
    const normal = dir;
    const length = HA_LEN + spring * 7;
    const anchor = add(center, mul(normal, ENVELOPE_R + explode * 16));
    const tip = add(anchor, mul(normal, length + (index < CONTACT.length ? spring * 8 : 0)));
    const peptide = index < CONTACT.length ? spring * 9 : 0;
    let bound = false;
    let inserted = false;
    for (const receptor of receptors) {
      if (!receptor.alive) continue;
      const dx = tip[0] - receptor.head[0];
      const dy = tip[1] - receptor.head[1];
      const dz = tip[2] - receptor.head[2];
      if (Math.hypot(dx, dy, dz) < 11) bound = true;
      if (spring > 0.55 && tip[2] < receptor.base[2] + 3 && Math.hypot(tip[0] - receptor.base[0], tip[1] - receptor.base[1]) < 16) inserted = true;
    }
    return {
      kind: "ha",
      anchor,
      dir: normal,
      length,
      head: 3.6,
      stalk: 0.72,
      lobes: 3,
      spread: 2.8,
      fusion: spring,
      peptide,
      bound,
      inserted,
      draw: dot(normal, view) > -0.05,
    };
  });
  const na = NA_DIRS.map((dir) => {
    const anchor = add(center, mul(dir, ENVELOPE_R + explode * 18));
    return { kind: "na", anchor, dir, length: NA_LEN, head: 5.4, stalk: 0.55, lobes: 4, spread: 1.5, fusion: 0, peptide: 0, draw: dot(dir, view) > 0.02 };
  });
  const m2 = M2_DIRS.map((dir) => {
    const anchor = add(center, mul(dir, ENVELOPE_R - 1 + explode * 20));
    return { kind: "m2", anchor, dir, length: 4.5 + m2Open * 1.5, head: 1.5, stalk: 0.7, lobes: 4, fusion: 0, peptide: 0, draw: dot(dir, view) > 0.08 };
  });
  const rnps = bundle(release, center).map((rod) => ({
    ...rod,
    from: add(rod.from, [0, 0, explode * 4]),
    to: add(rod.to, [0, 0, explode * 4]),
  }));
  const bound = ha.filter((spike) => spike.bound).length;
  const inserted = ha.filter((spike) => spike.inserted).length;
  const segmentsOut = rnps.filter((rod) => rod.out).length;
  const sialicLeft = receptors.filter((receptor) => receptor.alive).length;
  const shownHa = ha.filter((spike) => spike.draw).length;
  const shownNa = na.filter((spike) => spike.draw).length;
  const shownM2 = m2.filter((spike) => spike.draw).length;
  const accent = t >= 4.15 ? "na" : t >= 3 && t < 4.15 ? "rnp" : "ha";
  const stage = STAGES.reduce((best, item) => (Math.abs(item.at - t) < Math.abs(best.at - t) ? item : best));
  const readout = [
    `pH ${pH.toFixed(1)}`,
    `spring ${spring.toFixed(2)}`,
    `bound ${bound}`,
    `inserted ${inserted}`,
    `RNA ${segmentsOut}/${FACTS.hhmi.segments}`,
    `sialic ${sialicLeft}`,
    explode > 0.03 ? `apart ${explode.toFixed(2)}` : "",
  ].filter(Boolean).join(" · ");
  return {
    t,
    stage,
    pH,
    spring,
    m2Open,
    cup,
    release,
    cleaved,
    explode,
    accent,
    center,
    envelopeR: ENVELOPE_R,
    m1R: M1_R,
    pore: spring * 0.22,
    spread: explode * 7,
    membrane,
    receptors,
    ha,
    na,
    m2,
    rnps,
    bound,
    inserted,
    segmentsOut,
    sialicLeft,
    shownHa,
    shownNa,
    shownM2,
    countedHa: FACTS.harris.counted[0].ha,
    countedNa: FACTS.harris.counted[0].na,
    readout,
    azimuth,
    elevation,
    cam,
  };
}

export function extremesOf(state) {
  const points = [[-90, -50, 8], [90, 50, 8], [90, -50, -40], [-90, 50, 80]];
  const top = state.center[2] + state.envelopeR + HA_LEN + 16 + state.explode * 20;
  points.push([state.center[0], state.center[1], top]);
  points.push([state.center[0], state.center[1], state.center[2] - state.envelopeR - 10]);
  for (const rod of state.rnps) points.push(rod.from, rod.to);
  for (const tile of state.membrane) points.push([tile.cx, tile.cy, tile.z]);
  return points;
}
