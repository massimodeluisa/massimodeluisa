import { FACTS } from "./facts.mjs";
import { camera, clamp, smooth } from "../../kit/math.mjs";

const COLS = 8;
const ROWS = 5;
const TW = 8;
const TD = 7;
const PROT_R = 3.15;
const HUB = [6, -8];
const NEAR = (-34 * Math.PI) / 180;

export const STAGES = [
  { id: "free", label: "Free", at: 0, key: "1" },
  { id: "bound", label: "Bound", at: 1, key: "2" },
];

function grid() {
  const width = COLS * TW;
  const depth = ROWS * TD;
  const x0 = HUB[0] - width / 2 + 4;
  const y0 = HUB[1] - depth / 2 + 10;
  const tiles = [];
  for (let j = 0; j < ROWS; j++) {
    for (let i = 0; i < COLS; i++) {
      const x = x0 + i * TW;
      const y = y0 + j * TD;
      tiles.push({ i, j, x, y, w: TW, d: TD, cx: x + TW / 2, cy: y + TD / 2, z: 0, h: 3.6 });
    }
  }
  return tiles;
}

const TILES = grid();

function sites() {
  return [0, 1, 2].map((i) => {
    const a = NEAR + (i * 2 * Math.PI) / 3;
    return [HUB[0] + Math.cos(a) * 7.2, HUB[1] + Math.sin(a) * 7.2];
  });
}

const SITES = sites();

export function pose(u, { azimuth = -34, elevation = 22, explode = 0 } = {}) {
  const t = clamp(u, 0, 1);
  const dock = smooth(t, 0, 1) * (1 - explode);
  const centerZ = -18 - explode * 10;
  const membrane = TILES.map((tile) => {
    const rim = tile.i === 0 || tile.j === 0 || tile.i === COLS - 1 || tile.j === ROWS - 1;
    return { ...tile, edge: rim };
  });
  const receptors = SITES.map((xy) => {
    const seat = [xy[0], xy[1], centerZ];
    const crown = [xy[0], xy[1], centerZ + PROT_R];
    const tail = dock > 0.62 ? { from: [xy[0], xy[1], crown[2] + 3.4], to: [xy[0], xy[1], crown[2] + 0.15] } : null;
    const bound = tail !== null && Math.hypot(tail.to[0] - crown[0], tail.to[1] - crown[1], tail.to[2] - crown[2]) < 0.2;
    return {
      base: [xy[0], xy[1], 3.6],
      height: 8,
      seat,
      radius: PROT_R,
      tail,
      bound,
    };
  });
  const bound = receptors.filter((item) => item.bound).length;
  const accent = bound === FACTS.pdb.peptides ? "traf" : "cd30";
  const stage = STAGES.reduce((best, item) => (Math.abs(item.at - t) < Math.abs(best.at - t) ? item : best));
  const readout = [
    `tails ${bound}/${FACTS.pdb.peptides}`,
    `TRAF2 ${receptors.length}`,
    explode > 0.03 ? `apart ${explode.toFixed(2)}` : "",
  ].filter(Boolean).join(" · ");
  return {
    t,
    stage,
    dock,
    explode,
    accent,
    center: [HUB[0], HUB[1], centerZ],
    membrane,
    receptors,
    bound,
    readout,
    azimuth,
    elevation,
    cam: camera({ azimuth, elevation, scale: 2.7 }),
  };
}
