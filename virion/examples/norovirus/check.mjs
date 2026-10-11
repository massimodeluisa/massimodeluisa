import { FACTS } from "./facts.mjs";
import { pose } from "./model.mjs";
import { sceneSvg } from "./scene.mjs";

function expect(name, ok, detail) {
  if (!ok) throw new Error(`${name}: ${JSON.stringify(detail)}`);
}

expect("diameter", FACTS.prasad1994.diameterNm >= FACTS.viralzone.diameterNm[0] && FACTS.prasad1994.diameterNm <= FACTS.viralzone.diameterNm[1], FACTS.prasad1994.diameterNm);
expect("copies", FACTS.prasad1994.dimers * 2 === FACTS.viralzone.vp1, FACTS.prasad1994.dimers);
expect("arch reach", FACTS.prasad1994.diameterNm / 2 > FACTS.prasad1994.shellOuterNm, FACTS.prasad1994);

const far = pose(0, {});
const dock = pose(1, {});
const pit = pose(2, {});
const open = pose(3, {});
const lyse = pose(4, {});

expect("far unbound", far.bound === 0, far.bound);
expect("far closed", far.open === 0 && !far.rnaOut, far);
expect("dock bound", dock.bound >= 1, dock.bound);
expect("dock closed", dock.open === 0 && !dock.rnaOut, dock);
expect("pit lower", pit.center[2] < dock.center[2], [pit.center[2], dock.center[2]]);
expect("pit cupped", pit.cup > 0.9, pit.cup);
expect("pit still closed", pit.open < 0.05 && !pit.rnaOut, pit);
expect("uncoat open", open.open > 0.9, open.open);
expect("uncoat rna", open.rnaOut, open.rna);
expect("lyse closed", lyse.open < 0.05 && !lyse.rnaOut, lyse);
expect("lyse risen", lyse.center[2] > pit.center[2], [lyse.center[2], pit.center[2]]);
expect("lyse hole", lyse.membrane.some((tile) => tile.gone), lyse.membrane.filter((tile) => tile.gone).length);
expect("readout from state", dock.readout.includes(`bound ${dock.bound}`) && dock.readout.includes(`VP1 ${FACTS.viralzone.vp1}`) && dock.readout.includes("RNA in"), dock.readout);
expect("uncoat readout", open.readout.includes("RNA out"), open.readout);

for (const sample of [far, dock, pit, open, lyse]) {
  const svg = sceneSvg(sample);
  if (!svg.includes("<svg") || svg.includes("NaN") || svg.includes("undefined")) throw new Error(`bad svg at t=${sample.t}`);
  const solids = svg.split('class="v-solid"').length - 1;
  if (solids < 40) throw new Error(`only ${solids} solids at t=${sample.t}`);
}

const apart = pose(1, { explode: 1 });
expect("explode lifts", apart.center[2] > dock.center[2], apart.center[2]);
expect("apart readout", apart.readout.includes("apart"), apart.readout);
expect("no sequence dump", !JSON.stringify(FACTS).includes("MKT") && !JSON.stringify(FACTS).match(/[ACGT]{12}/), "facts");

console.log("norovirus model ok", {
  bound: dock.bound,
  shown: dock.shown,
  open: open.open,
  hole: lyse.membrane.filter((tile) => tile.gone).length,
  solids: sceneSvg(dock).split('class="v-solid"').length - 1,
});
