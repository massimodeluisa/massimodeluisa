import { fitOrigin, project } from "../../kit/math.mjs";
import { FACTS } from "./facts.mjs";
import { pose } from "./model.mjs";
import { FRAME, VIEW, captionText, sceneSvg } from "./scene.mjs";

function expect(name, ok, detail) {
  if (!ok) throw new Error(`${name}: ${JSON.stringify(detail)}`);
}

function dist(a, b) {
  return Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
}

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

expect("ke mean stays on record", FACTS.ke.trimers === 24, FACTS.ke.trimers);
expect("schematic length is inside the review", FACTS.frontiers.spikeDrawnNm >= FACTS.frontiers.spikeLengthNm[0] && FACTS.frontiers.spikeDrawnNm <= FACTS.frontiers.spikeLengthNm[1], FACTS.frontiers.spikeDrawnNm);
expect("no sequence", !JSON.stringify(FACTS).match(/[ACGT]{12}/), "facts");

const crown = pose(0, {});
const section = pose(1, {});

expect("crown is the outside", !crown.section && crown.readout === `S ${crown.shown}`, crown.readout);
expect("crown shows a facing handful of trimers", crown.shown >= 10 && crown.shown < crown.placed, crown.shown);
expect("each drawn trimer is three lobes on one head", crown.spikes.filter((spike) => spike.draw).every((spike) => spike.lobes.length === 3), crown.shown);
for (const spike of crown.spikes) {
  expect("stalk length", Math.abs(dist(spike.anchor, spike.head) - FACTS.frontiers.spikeDrawnNm) < 0.05, dist(spike.anchor, spike.head));
  const span = dist(spike.lobes[0], spike.lobes[1]);
  expect("lobes are a triangle", spike.lobes.every((lobe, index) => Math.abs(dist(lobe, spike.lobes[(index + 1) % 3]) - span) < 0.05), span);
}
const crownGap = minGap(screenPoints(crown, crown.spikes.filter((spike) => spike.draw).map((spike) => spike.head)));
expect("crown trefoils sit apart", crownGap > 28, crownGap);

expect("section opens the envelope", section.section && section.shown === 0, section.readout);
expect("section readout matches the rim and the beads", section.readout === `S ${section.shownRim} · N ${section.shownN}` && section.shownRim === section.rim.length && section.shownN === section.beads.length, section.readout);
expect("section has membrane hooks and channels", section.hooks.length >= 8 && section.channels.length >= 3, [section.hooks.length, section.channels.length]);
const rimGap = minGap(screenPoints(section, section.rim.map((spike) => spike.head)));
const beadGap = minGap(screenPoints(section, section.beads));
expect("rim trefoils sit apart", rimGap > 24, rimGap);
expect("nucleocapsid beads sit apart", beadGap > 6, beadGap);

const caption = captionText();
expect("caption names the schematic and the counted mean", caption.includes(String(FACTS.frontiers.spikeDrawnNm)) && caption.includes(String(FACTS.ke.trimers)) && caption.includes("three lobes"), caption.slice(0, 80));

for (const sample of [crown, section]) {
  const svg = sceneSvg(sample);
  if (!svg.includes("<svg") || svg.includes("NaN") || svg.includes("undefined")) throw new Error(`bad svg at t=${sample.t}`);
  const solids = svg.split('class="v-solid"').length - 1;
  if (solids < 40) throw new Error(`only ${solids} solids at t=${sample.t}`);
}

console.log("sars-cov-2 model ok", { crown: crown.shown, rim: section.shownRim, beads: section.shownN, crownGap: Math.round(crownGap), rimGap: Math.round(rimGap) });
