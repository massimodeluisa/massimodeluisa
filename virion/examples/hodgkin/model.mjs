import { FACTS } from "./facts.mjs";
import { camera, clamp, smooth } from "../../kit/math.mjs";

const COLS = 9;
const ROWS = 6;
const TW = 8;
const TD = 7;

export const STAGES = [
  { id: "free", label: "Free", at: 0, key: "1" },
  { id: "bound", label: "Bound", at: 1, key: "2" },
];

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
      tiles.push({ i, j, x, y, w: TW, d: TD, cx: x + TW / 2, cy: y + TD / 2, z: 0, h: 4.2 });
    }
  }
  return tiles;
}

const TILES = grid();

function sites() {
  return [0, 1, 2].map((i) => {
    const a = -Math.PI / 2 + (i * 2 * Math.PI) / 3;
    return {
      i,
      receptor: [Math.cos(a) * 14, Math.sin(a) * 14],
      core: [Math.cos(a) * 5.2, Math.sin(a) * 5.2],
    };
  });
}

const SITES = sites();

export function pose(u, { azimuth = -32, elevation = 24, explode = 0 } = {}) {
  const t = clamp(u, 0, 1);
  const dock = smooth(t, 0, 1) * (1 - explode);
  const center = [0, 0, -30 - explode * 12];
  const membrane = TILES.map((tile) => {
    const rim = tile.i === 0 || tile.j === 0 || tile.i === COLS - 1 || tile.j === ROWS - 1;
    return { ...tile, edge: rim };
  });
  const receptors = SITES.map((site) => {
    const base = [site.receptor[0], site.receptor[1], 4.2];
    const under = [site.receptor[0], site.receptor[1], -0.8];
    const seat = [site.core[0], site.core[1], center[2]];
    const tip = [
      under[0] + (seat[0] - under[0]) * dock,
      under[1] + (seat[1] - under[1]) * dock,
      under[2] + (seat[2] - under[2]) * dock,
    ];
    const bound = Math.hypot(tip[0] - seat[0], tip[1] - seat[1], tip[2] - seat[2]) < 4.5;
    return { base, under, tip, seat, bound, height: 12 };
  });
  const bound = receptors.filter((item) => item.bound).length;
  const accent = bound === FACTS.pdb.peptides ? "traf" : "cd30";
  const stage = STAGES.reduce((best, item) => (Math.abs(item.at - t) < Math.abs(best.at - t) ? item : best));
  const readout = [
    `tails ${bound}/${FACTS.pdb.peptides}`,
    `TRAF2 ${FACTS.pdb.traf2}`,
    `peptide ${FACTS.pdb.peptideResidues}`,
    explode > 0.03 ? `apart ${explode.toFixed(2)}` : "",
  ].filter(Boolean).join(" · ");
  return {
    t,
    stage,
    dock,
    explode,
    accent,
    center,
    membrane,
    receptors,
    bound,
    readout,
    azimuth,
    elevation,
    cam: camera({ azimuth, elevation, scale: 2.7 }),
  };
}
