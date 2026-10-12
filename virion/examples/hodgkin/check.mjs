import { FACTS } from "./facts.mjs";
import { pose } from "./model.mjs";
import { FRAME, sceneSvg, VIEW } from "./scene.mjs";
import { fitOrigin, project } from "../../kit/math.mjs";

function expect(name, ok, detail) {
  if (!ok) throw new Error(`${name}: ${JSON.stringify(detail)}`);
}

const map = FACTS.uniprot.peptideMap;
const cyto = FACTS.uniprot.cytoplasmic;
expect("peptide inside tail", map[0] >= cyto[0] && map[1] <= cyto[1], map);
expect("assembly", FACTS.pdb.traf2 === 3 && FACTS.pdb.peptides === 3, FACTS.pdb);
expect("no sequence", !JSON.stringify(FACTS).match(/[ACDEFGHIKLMNPQRSTVWY]{8}/), "facts");

const free = pose(0, {});
const bound = pose(1, {});
const apart = pose(1, { explode: 1 });

expect("free tails", free.bound === 0, free.bound);
expect("bound tails", bound.bound === FACTS.pdb.peptides, bound.bound);
expect("apart releases", apart.bound === 0, apart.bound);
expect("traf drops", apart.center[2] < bound.center[2], [apart.center[2], bound.center[2]]);
expect("readout", bound.readout.includes(`tails ${bound.bound}/${FACTS.pdb.peptides}`) && bound.readout.includes(`TRAF2 ${FACTS.pdb.traf2}`), bound.readout);
expect("free readout", free.readout.includes("tails 0/"), free.readout);
expect("peptide stays in the caption", !bound.readout.includes("peptide"), bound.readout);

function apartFrom(a, b) {
  return Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
}
for (let i = 0; i < bound.receptors.length; i++) {
  for (let j = i + 1; j < bound.receptors.length; j++) {
    const gap = apartFrom(bound.receptors[i].seat, bound.receptors[j].seat);
    expect("protomers separable", gap > bound.receptors[i].radius * 2 * 0.85, gap);
  }
  const tail = bound.receptors[i].tail;
  const span = apartFrom(tail.from, tail.to);
  expect("peptide is a short stub", span > 2 && span < 4.2, span);
  expect("free has no stub", free.receptors[i].tail === null, free.receptors[i].tail);
}

function screenGap(state) {
  const cam = fitOrigin(FRAME, state.cam, VIEW.width, VIEW.height, 36);
  const pts = state.receptors.map((item) => project(item.seat, cam));
  let least = Infinity;
  for (let i = 0; i < pts.length; i++) {
    for (let j = i + 1; j < pts.length; j++) least = Math.min(least, Math.hypot(pts[i][0] - pts[j][0], pts[i][1] - pts[j][1]));
  }
  return least;
}
expect("three chains can be counted when free", screenGap(free) > 36, screenGap(free));
expect("three chains can be counted when bound", screenGap(bound) > 36, screenGap(bound));

for (const sample of [free, bound, apart]) {
  const svg = sceneSvg(sample);
  if (!svg.includes("<svg") || svg.includes("NaN") || svg.includes("undefined")) throw new Error(`bad svg at t=${sample.t}`);
  const solids = svg.split('class="v-solid"').length - 1;
  if (solids < 30) throw new Error(`only ${solids} solids at t=${sample.t}`);
}

console.log("hodgkin model ok", { free: free.bound, bound: bound.bound, solids: sceneSvg(bound).split('class="v-solid"').length - 1 });
