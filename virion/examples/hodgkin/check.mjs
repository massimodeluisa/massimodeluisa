import { FACTS } from "./facts.mjs";
import { pose } from "./model.mjs";
import { sceneSvg } from "./scene.mjs";

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
expect("readout", bound.readout.includes(`tails ${bound.bound}/${FACTS.pdb.peptides}`) && bound.readout.includes(`peptide ${FACTS.pdb.peptideResidues}`), bound.readout);
expect("free readout", free.readout.includes("tails 0/"), free.readout);

for (const sample of [free, bound, apart]) {
  const svg = sceneSvg(sample);
  if (!svg.includes("<svg") || svg.includes("NaN") || svg.includes("undefined")) throw new Error(`bad svg at t=${sample.t}`);
  const solids = svg.split('class="v-solid"').length - 1;
  if (solids < 30) throw new Error(`only ${solids} solids at t=${sample.t}`);
}

console.log("hodgkin model ok", { free: free.bound, bound: bound.bound, solids: sceneSvg(bound).split('class="v-solid"').length - 1 });
