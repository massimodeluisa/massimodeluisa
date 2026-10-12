import { project } from "../../kit/math.mjs";
import { FACTS } from "./facts.mjs";
import { plateCamera, pose } from "./model.mjs";
import { captionText, sceneSvg } from "./scene.mjs";

function expect(name, ok, detail) {
  if (!ok) throw new Error(`${name}: ${JSON.stringify(detail)}`);
}

function dist(a, b) {
  return Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
}

function screenPoints(state, points) {
  const cam = plateCamera(state.cam);
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

function leaderEnds(svg) {
  const ends = [];
  for (const match of svg.matchAll(/<text class="v-label"[^>]*>([^<]+)<\/text><path class="v-leader" d="([^"]+)"/g)) {
    const pts = [...match[2].matchAll(/[ML]([0-9.]+) ([0-9.]+)/g)];
    const last = pts[pts.length - 1];
    ends.push({ name: match[1], x: Number(last[1]), y: Number(last[2]) });
  }
  return ends;
}

function near(end, points, limit) {
  return points.some((p) => Math.hypot(p[0] - end.x, p[1] - end.y) < limit);
}

const crownNames = ["Spike protein (S)", "Membrane protein (M)", "Envelope"];
const sectionNames = ["Spike protein (S)", "Envelope protein (E)", "Membrane protein (M)", "Nucleocapsid (N)", "Genomic RNA", "Envelope"];
const crownCam = plateCamera(crown.cam);
const sectionCam = plateCamera(section.cam);
const crownLobes = crown.spikes.filter((spike) => spike.draw).flatMap((spike) => spike.lobes.map((p) => project(p, crownCam)));
const crownMarks = crown.marks.filter((mark) => mark.draw).map((mark) => project(mark.at, crownCam));
const sectionLobes = section.rim.filter((spike) => spike.draw).flatMap((spike) => spike.lobes.map((p) => project(p, sectionCam)));
const sectionChannels = section.channels.filter((channel) => channel.draw).map((channel) => project([(channel.from[0] + channel.to[0]) / 2, (channel.from[1] + channel.to[1]) / 2, (channel.from[2] + channel.to[2]) / 2], sectionCam));
const sectionHooks = section.hooks.filter((hook) => hook.draw).map((hook) => project(hook.bend, sectionCam));
const sectionBeads = section.beads.map((at) => project(at, sectionCam));
const sectionStrands = section.strand.map(([from, to]) => project([(from[0] + to[0]) / 2, (from[1] + to[1]) / 2, (from[2] + to[2]) / 2], sectionCam));
const bandR = section.membraneInner + 3;
const sectionBand = Array.from({ length: 96 }, (_, i) => {
  const a = (i / 96) * Math.PI * 2;
  return project([Math.cos(a) * bandR, Math.sin(a) * bandR, 0], sectionCam);
});
const landings = {
  0: {
    "Spike protein (S)": [crownLobes, 2],
    "Membrane protein (M)": [crownMarks, 2],
  },
  1: {
    "Spike protein (S)": [sectionLobes, 2],
    "Envelope protein (E)": [sectionChannels, 2],
    "Membrane protein (M)": [sectionHooks, 2],
    "Nucleocapsid (N)": [sectionBeads, 2],
    "Genomic RNA": [sectionStrands, 2],
    Envelope: [sectionBand, 4],
  },
};
for (const [sample, names] of [[crown, crownNames], [section, sectionNames]]) {
  const svg = sceneSvg(sample);
  if (!svg.includes("<svg") || svg.includes("NaN") || svg.includes("undefined")) throw new Error(`bad svg at t=${sample.t}`);
  const solids = svg.split('class="v-solid"').length - 1;
  if (solids < 40) throw new Error(`only ${solids} solids at t=${sample.t}`);
  const ends = leaderEnds(svg);
  expect("a leader for every name", ends.length === names.length, ends.map((end) => end.name));
  for (const name of names) expect(`plate names ${name}`, ends.some((end) => end.name === name), name);
  for (let i = 0; i < ends.length; i++) {
    for (let j = i + 1; j < ends.length; j++) {
      const gap = Math.hypot(ends[i].x - ends[j].x, ends[i].y - ends[j].y);
      expect("leaders end on different parts", gap > 24, [ends[i].name, ends[j].name, gap]);
    }
  }
  for (const end of ends) {
    const landing = landings[sample.t][end.name];
    if (!landing) continue;
    expect(`${end.name} ends on its part`, near(end, landing[0], landing[1]), end);
  }
}

console.log("sars-cov-2 model ok", { crown: crown.shown, rim: section.shownRim, beads: section.shownN, crownGap: Math.round(crownGap), rimGap: Math.round(rimGap) });
