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

const outside = pose(0, {});
const section = pose(1, {});
const diameter = FACTS.schmid.temDiameterUm;
const sphereVolume = (4 / 3) * Math.PI * (diameter / 2) ** 3;

expect("drawn diameter matches the TEM sphere", Math.abs(outside.radius * 2 - diameter) < 0.001, outside.radius);
expect("volume is that sphere", Math.abs(sphereVolume - FACTS.schmid.volumeUm3) < 2, sphereVolume);
expect("nucleus is the measured share", Math.abs(outside.fraction - FACTS.schmid.nucleusFraction) < 0.002, outside.fraction);
expect("nucleus stays inside the cell", dist(section.nucleusAt, section.center) + section.nucleusR < section.radius - 0.4, dist(section.nucleusAt, section.center));
expect("nucleolus stays inside the nucleus", dist(section.nucleolus.at, section.nucleusAt) + section.nucleolus.r < section.nucleusR - 0.3, dist(section.nucleolus.at, section.nucleusAt));
expect("nucleolus is inside the reported range", section.nucleolus.r * 2 >= FACTS.section.nucleolusUm[0] && section.nucleolus.r * 2 <= FACTS.section.nucleolusUm[1], section.nucleolus.r);
for (const block of section.blocks) {
  expect("chromatin stays inside the nucleus", dist(block.at, section.nucleusAt) + block.r < section.nucleusR - 0.08, dist(block.at, section.nucleusAt) + block.r);
}
for (const mito of section.mitos) {
  expect("mitochondrion is outside the nucleus", dist(mito.at, section.nucleusAt) > section.nucleusR + 0.05, dist(mito.at, section.nucleusAt));
  expect("mitochondrion is inside the cell", dist(mito.at, section.center) < section.radius - 0.08, dist(mito.at, section.center));
}
expect("outside is the whole cell", !outside.section && outside.readout === `${diameter} μm`, outside.readout);
expect("section readout is the nuclear share", section.section && section.readout === `N ${Math.round(section.fraction * 100)}%`, section.readout);
expect("a few microvilli are drawn", outside.shownV >= 4 && outside.shownV <= 16, outside.shownV);
expect("no sequence", !JSON.stringify(FACTS).match(/[ACGT]{12}/), "facts");

const outsideNames = ["Plasma membrane", "Microvillus"];
const sectionNames = ["Plasma membrane", "Cytoplasm", "Nucleus", "Heterochromatin", "Nucleolus", "Mitochondrion"];
const outsideCam = plateCamera(outside.cam);
const sectionCam = plateCamera(section.cam);
const tips = outside.villi.filter((villus) => villus.draw).map((villus) => project(villus.tip, outsideCam));
const blocks = section.blocks.map((block) => project(block.at, sectionCam));
const mitos = section.mitos.map((mito) => project(mito.at, sectionCam));
const nucleolus = [project(section.nucleolus.at, sectionCam)];
const landings = {
  0: { Microvillus: [tips, 2] },
  1: {
    Heterochromatin: [blocks, 2],
    Nucleolus: [nucleolus, 2],
    Mitochondrion: [mitos, 2],
  },
};

for (const [sample, names] of [[outside, outsideNames], [section, sectionNames]]) {
  const svg = sceneSvg(sample);
  if (!svg.includes("<svg") || svg.includes("NaN") || svg.includes("undefined")) throw new Error(`bad svg at t=${sample.t}`);
  const ends = leaderEnds(svg);
  expect("a leader for every name", ends.length === names.length, ends.map((end) => end.name));
  for (const name of names) expect(`plate names ${name}`, ends.some((end) => end.name === name), name);
  for (let i = 0; i < ends.length; i++) {
    for (let j = i + 1; j < ends.length; j++) {
      const gap = Math.hypot(ends[i].x - ends[j].x, ends[i].y - ends[j].y);
      expect("leaders end on different parts", gap > 20, [ends[i].name, ends[j].name, gap]);
    }
  }
  for (const end of ends) {
    const landing = landings[sample.t][end.name];
    if (!landing) continue;
    expect(`${end.name} ends on its part`, near(end, landing[0], landing[1]), end);
  }
}

const caption = captionText();
expect("caption names the diameter and the nuclear share", caption.includes(String(diameter)) && caption.includes("44.4") && caption.includes("0.9"), caption.slice(0, 80));

console.log("lymphocyte model ok", { villi: outside.shownV, nucleus: section.readout, mitos: section.mitos.length, chromatin: section.blocks.length });
