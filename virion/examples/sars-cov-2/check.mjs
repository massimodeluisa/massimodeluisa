import { fitOrigin, project } from "../../kit/math.mjs";
import { FACTS } from "./facts.mjs";
import { pose } from "./model.mjs";
import { FRAME, VIEW, sceneSvg } from "./scene.mjs";

function expect(name, ok, detail) {
  if (!ok) throw new Error(`${name}: ${JSON.stringify(detail)}`);
}

expect("mean is inside Ke's range", Math.abs(FACTS.ke.trimers - 24) === 0, FACTS.ke.trimers);
expect("no sequence", !JSON.stringify(FACTS).match(/[ACGT]{12}/), "facts");

const crown = pose(0, {});
const hinge = pose(1, {});
const apart = pose(0, { explode: 1 });

function dist(a, b) {
  return Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
}

expect("placed mean", crown.placed === FACTS.ke.trimers, crown.placed);
expect("upright", crown.tiltDeg === 0, crown.tiltDeg);
expect("hinge in the common range", hinge.tiltDeg === FACTS.ke.tiltCommonBelowDeg, hinge.tiltDeg);
expect("hinge stays under the rare maximum", hinge.tiltDeg < FACTS.ke.tiltMaxDeg, hinge.tiltDeg);
expect("shown is a facing subset", crown.shown >= 6 && crown.shown < crown.placed, crown.shown);
expect("readout matches the facing spikes", crown.readout.includes(`S ${crown.shown}`) && crown.readout.includes("tilt 0°"), crown.readout);
expect("hinge readout", hinge.readout.includes(`S ${hinge.shown}`) && hinge.readout.includes(`tilt ${FACTS.ke.tiltCommonBelowDeg}°`), hinge.readout);
expect("closed hides rnps", crown.shownRnp === 0 && !crown.readout.includes("RNP"), crown.readout);
expect("apart counts only the drawn rnps", apart.shown === 0 && apart.shownRnp > 0 && apart.shownRnp < FACTS.yao.rnps && apart.readout.includes(`RNP ${apart.shownRnp}`) && !apart.readout.includes("S "), apart);

function screenPoints(state, points) {
  const cam = fitOrigin(FRAME, state.cam, VIEW.width, VIEW.height, 36);
  return points.map((p) => project(p, cam));
}

function minGap(points) {
  let gap = Infinity;
  for (let i = 0; i < points.length; i++) {
    for (let j = i + 1; j < points.length; j++) {
      gap = Math.min(gap, Math.hypot(points[i][0] - points[j][0], points[i][1] - points[j][1]));
    }
  }
  return gap;
}

const crownGap = minGap(screenPoints(crown, crown.spikes.filter((spike) => spike.draw).map((spike) => spike.head)));
const hingeGap = minGap(screenPoints(hinge, hinge.spikes.filter((spike) => spike.draw).map((spike) => spike.head)));
const rnpGap = minGap(screenPoints(apart, apart.rnps.map((rod) => [
  (rod.from[0] + rod.to[0]) / 2,
  (rod.from[1] + rod.to[1]) / 2,
  (rod.from[2] + rod.to[2]) / 2,
])));
expect("crown heads sit apart", crownGap > 36, crownGap);
expect("hinge heads sit apart", hingeGap > 36, hingeGap);
expect("opened rnps sit apart", rnpGap > 36, rnpGap);

for (const spike of crown.spikes) {
  const reach = dist(spike.anchor, spike.head);
  expect("upright head center", Math.abs(reach - FACTS.ke.headCenterNm) < 0.2, reach);
}
for (const spike of hinge.spikes) {
  const reach = dist(spike.anchor, spike.head);
  expect("hinged stalk keeps its length", Math.abs(reach - FACTS.ke.headCenterNm) < 0.2, reach);
}

for (const sample of [crown, hinge, apart]) {
  const svg = sceneSvg(sample);
  if (!svg.includes("<svg") || svg.includes("NaN") || svg.includes("undefined")) throw new Error(`bad svg at t=${sample.t}`);
  const solids = svg.split('class="v-solid"').length - 1;
  if (solids < 40) throw new Error(`only ${solids} solids at t=${sample.t}`);
}

console.log("sars-cov-2 model ok", { shown: crown.shown, hinge: hinge.shown, rnps: apart.shownRnp });
