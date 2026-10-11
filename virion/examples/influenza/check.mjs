import { FACTS } from "./facts.mjs";
import { pose } from "./model.mjs";
import { sceneSvg } from "./scene.mjs";

const sum = FACTS.pr8.segments.reduce((total, segment) => total + segment.nt, 0);
if (sum !== FACTS.pr8.totalNt) throw new Error(`segment sum ${sum} !== ${FACTS.pr8.totalNt}`);
if (Math.abs(sum - FACTS.hhmi.genomeBp) > 200) throw new Error("PR8 total drifted from the HHMI round number");
if (FACTS.pr8.segments.length !== 8) throw new Error("eight segments");

const far = pose(0, {});
const dock = pose(1, {});
const pit = pose(2, {});
const fused = pose(3, {});
const open = pose(4, {});
const bud = pose(5, {});

function expect(name, ok, detail) {
  if (!ok) throw new Error(`${name}: ${detail}`);
}

expect("far pH", far.pH === 7.4, far.pH);
expect("far unbound", far.bound === 0, far.bound);
expect("far spring", far.spring === 0, far.spring);
expect("dock pH", dock.pH === 7.4, dock.pH);
expect("dock bound", dock.bound >= 1, dock.bound);
expect("dock not fused", dock.inserted === 0 && dock.spring === 0, dock);
expect("pit lower", pit.center[2] < dock.center[2], `${pit.center[2]} vs ${dock.center[2]}`);
expect("pit still bound", pit.bound >= 1, pit.bound);
expect("pit cup", pit.cup > 0.9, pit.cup);
expect("fuse pH", fused.pH === 5, fused.pH);
expect("fuse spring", fused.spring === 1, fused.spring);
expect("fuse inserted", fused.inserted >= 1, fused.inserted);
expect("fuse genome in", fused.segmentsOut === 0, fused.segmentsOut);
expect("uncoat genome", open.segmentsOut === 8, open.segmentsOut);
expect("uncoat still acid", open.pH === 5, open.pH);
expect("bud neutral", bud.pH === 7.4, bud.pH);
expect("bud cleaved", bud.sialicLeft === 0, bud.sialicLeft);
expect("bud genome packed", bud.segmentsOut === 0, bud.segmentsOut);
expect("bud spring reset", bud.spring === 0, bud.spring);
expect("m2 in range", FACTS.zebedee.tetramers[0] <= dock.m2.length && dock.m2.length <= FACTS.zebedee.tetramers[1], dock.m2.length);
expect("readout from state", dock.readout.includes(`bound ${dock.bound}`) && dock.readout.includes("pH 7.4"), dock.readout);

for (const sample of [far, dock, pit, fused, open, bud]) {
  const svg = sceneSvg(sample);
  if (!svg.includes("<svg") || svg.includes("NaN") || svg.includes("undefined")) throw new Error(`bad svg at t=${sample.t}`);
  const solids = svg.split('class="v-solid"').length - 1;
  if (solids < 80) throw new Error(`only ${solids} solids at t=${sample.t}`);
}

const apart = pose(1, { explode: 1 });
expect("explode lifts", apart.center[2] > dock.center[2], apart.center[2]);
expect("apart readout", apart.readout.includes("apart"), apart.readout);

console.log("influenza model ok", {
  bound: dock.bound,
  inserted: fused.inserted,
  shownHa: dock.shownHa,
  shownNa: dock.shownNa,
  solids: sceneSvg(dock).split('class="v-solid"').length - 1,
});
