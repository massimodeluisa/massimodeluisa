import { add, depthOf, fitOrigin, mul, pathOf, project } from "../../kit/math.mjs";
import { ball, dotSvg, haloSvg, paintItem, rod, sortItems } from "../../kit/iso.mjs";
import { envelope } from "../../kit/bio.mjs";
import { FACTS } from "./facts.mjs";
import { FRAME, VIEW } from "./model.mjs";

export { FRAME, VIEW };

function quadMesh(face, cam) {
  const path = pathOf(face.map((p) => project(p, cam)), true);
  const mid = mul(face.reduce((sum, p) => add(sum, p), [0, 0, 0]), 0.25);
  return { fill: path, shades: ["", path, "", ""], outline: path, depth: depthOf(mid, cam) };
}

function club(spec, cam, { lit }) {
  const items = [paintItem(rod(spec.anchor, spec.neck, spec.stalkR, cam, 8), { tone: "hi", lit })];
  for (const at of spec.lobes) {
    items.push(paintItem(ball(at, spec.lobeR, cam, { bands: 10, steps: 14 }), { tone: "hi", lit }));
  }
  return items.filter(Boolean);
}

function annulus(center, outer, inner, cam) {
  const steps = 40;
  const items = [];
  for (let i = 0; i < steps; i++) {
    const a0 = (i / steps) * Math.PI * 2;
    const a1 = ((i + 1) / steps) * Math.PI * 2;
    const ring = (radius, a) => [center[0] + Math.cos(a) * radius, center[1] + Math.sin(a) * radius, center[2]];
    const face = [ring(inner, a0), ring(inner, a1), ring(outer, a1), ring(outer, a0)];
    const painted = paintItem(quadMesh(face, cam), { tone: "mid", edge: false });
    if (painted) items.push(painted);
  }
  return items;
}

function disk(center, radius, cam) {
  const steps = 28;
  const items = [];
  for (let i = 0; i < steps; i++) {
    const a0 = (i / steps) * Math.PI * 2;
    const a1 = ((i + 1) / steps) * Math.PI * 2;
    const face = [
      center,
      [center[0] + Math.cos(a0) * radius, center[1] + Math.sin(a0) * radius, center[2]],
      [center[0] + Math.cos(a1) * radius, center[1] + Math.sin(a1) * radius, center[2]],
      [center[0] + Math.cos(a1) * radius, center[1] + Math.sin(a1) * radius, center[2]],
    ];
    const painted = paintItem(quadMesh(face, cam), { tone: "lo", edge: false });
    if (painted) items.push(painted);
  }
  return items;
}

export function sceneSvg(state) {
  const cam = fitOrigin(FRAME, state.cam, VIEW.width, VIEW.height, 36);
  const items = [haloSvg([0, 0, 0], 58, 30, cam)].map((svg) => ({ depth: -1e6, svg }));
  if (state.section) {
    items.push(...disk(state.center, state.membraneInner - 0.4, cam));
    items.push(...annulus(state.center, state.envelopeR, state.membraneInner, cam));
    for (const hook of state.hooks) {
      if (!hook.draw) continue;
      items.push(paintItem(rod(hook.from, hook.bend, 1.55, cam, 7), { tone: "hi" }));
      items.push(paintItem(rod(hook.bend, hook.to, 1.55, cam, 7), { tone: "hi" }));
    }
    for (const channel of state.channels) {
      if (channel.draw) items.push(paintItem(rod(channel.from, channel.to, 1.7, cam, 8), { tone: "mid" }));
    }
    for (const [from, to] of state.strand) {
      items.push(paintItem(rod(from, to, 1.35, cam, 7), { tone: "hi", lit: state.accent === "n" }));
    }
    for (const at of state.beads) {
      items.push(paintItem(ball(at, 3.05, cam, { bands: 8, steps: 12 }), { tone: "hi", lit: state.accent === "n" }));
    }
    for (const spec of state.rim) {
      if (spec.draw) items.push(...club(spec, cam, { lit: false }));
    }
  } else {
    items.push(...envelope(state.center, state.envelopeR, cam, { tone: "mid" }));
    for (const mark of state.marks) {
      if (!mark.draw) continue;
      items.push({ depth: depthOf(mark.at, cam) + 0.2, svg: dotSvg(mark.at, cam, 4.1, "lo") });
    }
    for (const spec of state.spikes) {
      if (spec.draw) items.push(...club(spec, cam, { lit: true }));
    }
  }
  const body = sortItems(items).map((item) => item.svg).join("");
  const label = `A SARS-CoV-2 particle. The outside is a crown of three-lobed spike trimers with membrane marks between them. Key 2 cuts the envelope and shows the nucleocapsid beads on the genomic RNA.`;
  return `<svg class="v-svg" viewBox="0 0 ${VIEW.width} ${VIEW.height}" role="img" aria-label="${label}">${body}</svg>`;
}

export function captionText() {
  const ke = FACTS.ke;
  const frontiers = FACTS.frontiers;
  const yao = FACTS.yao;
  return `One SARS-CoV-2 particle, in the form of Figure 1 in ${frontiers.journal}. The envelope is ${ke.diameterNm} ± ${ke.diameterSdNm} nm across, the mean Ke et al. measured, inside the review's ${frontiers.diameterNm[0]}–${frontiers.diameterNm[1]} nm range. Each spike is a trimer: one stalk and three lobes. The review gives that length as ${frontiers.spikeLengthNm[0]}–${frontiers.spikeLengthNm[1]} nm, and this drawing uses ${frontiers.spikeDrawnNm} nm. Ke et al. counted ${ke.trimers} ± ${ke.trimersSd} prefusion trimers on a virion. This crown is the schematic, and the readout S counts only the trimers in the picture. The small marks are the membrane protein. The short channels in the cut envelope are the envelope protein. Key 2 opens that cut: the beads are the nucleocapsid on the genomic RNA, and the readout N counts the beads drawn there. Yao et al. counted ${yao.rnps} ± ${yao.rnpsSd} ribonucleoproteins by cryo-electron tomography. The genome is about ${yao.genomeKb} kb. The closed prefusion trimer fitted to intact virions is PDB ${FACTS.pdb.id}.`;
}
