import { add, cross, depthOf, fitOrigin, mul, norm, pathOf, project, viewDir } from "../../kit/math.mjs";
import { haloSvg, paintItem, rod, sortItems } from "../../kit/iso.mjs";
import { envelope, rnpRod, spike } from "../../kit/bio.mjs";
import { FACTS } from "./facts.mjs";
import { FRAME, VIEW, mouthDir } from "./model.mjs";

export { FRAME, VIEW };

function quadMesh(face, cam) {
  const path = pathOf(face.map((p) => project(p, cam)), true);
  const mid = mul(face.reduce((sum, p) => add(sum, p), [0, 0, 0]), 0.25);
  return { fill: path, shades: ["", "", path, ""], outline: path, depth: depthOf(mid, cam) };
}

function bowl(center, radius, cam, view) {
  const right = norm(cross(view, Math.abs(view[2]) < 0.9 ? [0, 0, 1] : [1, 0, 0]));
  const lift = norm(cross(right, view));
  const lats = 8;
  const steps = 18;
  const point = (i, s) => {
    const lat = -1.15 + (i / lats) * 2.3;
    const a = 0.42 + (s / steps) * (Math.PI - 0.84);
    const dir = norm(add(add(
      mul(right, Math.cos(a) * Math.cos(lat)),
      mul(lift, Math.sin(lat)),
    ), mul(view, -Math.sin(a) * Math.cos(lat))));
    return add(center, mul(dir, radius));
  };
  const items = [];
  for (let i = 0; i < lats; i++) {
    for (let s = 0; s < steps; s++) {
      const face = [point(i, s), point(i, s + 1), point(i + 1, s + 1), point(i + 1, s)];
      const painted = paintItem(quadMesh(face, cam), { tone: "mid", edge: false });
      if (painted) items.push(painted);
    }
  }
  const lip = 64;
  for (let s = 0; s < lip; s++) {
    const a0 = (s / lip) * Math.PI * 2;
    const a1 = ((s + 1) / lip) * Math.PI * 2;
    const ring = (a) => add(center, mul(norm(add(mul(right, Math.cos(a)), mul(lift, Math.sin(a)))), radius));
    const painted = paintItem(rod(ring(a0), ring(a1), 2.6, cam, 5), { tone: "mid" });
    if (painted) items.push(painted);
  }
  return items;
}

export function sceneSvg(state) {
  const cam = fitOrigin(FRAME, state.cam, VIEW.width, VIEW.height, 36);
  const items = [haloSvg([0, 0, 0], 54, 28, cam)].map((svg) => ({ depth: -1e6, svg }));
  const cutaway = state.explode > 0.18;
  if (cutaway) {
    items.push(...bowl(state.center, state.envelopeR, cam, mouthDir(viewDir(state.cam))));
    for (const piece of state.rnps) {
      if (piece.draw) items.push(...rnpRod(piece.from, piece.to, cam, { lit: state.accent === "rnp" }));
    }
  } else {
    items.push(...envelope(state.center, state.envelopeR, cam, { tone: "mid" }));
  }
  for (const spec of state.spikes) {
    if (!spec.draw) continue;
    items.push(...spike(spec.anchor, spec.dir, {
      length: spec.length,
      head: spec.headR,
      stalk: spec.stalk,
      lobes: spec.lobes,
      spread: spec.spread,
      fusion: spec.fusion,
      peptide: spec.peptide,
    }, cam, { tone: "hi", lit: state.accent === "spike" }));
  }
  const body = sortItems(items).map((item) => item.svg).join("");
  const label = `A SARS-CoV-2 particle, ${FACTS.ke.diameterNm} nanometres across the lipid envelope, with prefusion spike trimers. Drag to turn. Key 2 leans the spikes on their stalks.`;
  return `<svg class="v-svg" viewBox="0 0 ${VIEW.width} ${VIEW.height}" role="img" aria-label="${label}">${body}</svg>`;
}

export function captionText() {
  const ke = FACTS.ke;
  const yao = FACTS.yao;
  return `One SARS-CoV-2 particle. Ke et al. measured 179 intact virions: diameter ${ke.diameterNm} ± ${ke.diameterSdNm} nm to the outside of the lipid bilayer, ${ke.trimers} ± ${ke.trimersSd} spike trimers, about ${Math.round(ke.prefusion * 100)}% of them prefusion. The trimers hinge in the stalk and tilt by up to ${ke.tiltMaxDeg}°, less often past ${ke.tiltCommonBelowDeg}°. This model places ${ke.trimers} prefusion trimers, the counted mean, and the readout S is only the ones facing the camera. Their heads sit ${ke.headCenterNm} nm out from the envelope when they stand upright, which is where Ke centered the spike picks. Yao et al. counted ${yao.prefusionTrimers} ± ${yao.prefusionSd} prefusion spikes on a separate set of virions. The closed prefusion trimer fitted to these maps is PDB ${FACTS.pdb.id}. M and E are in the envelope and are not drawn as separate parts. E opens the envelope: Yao counted ${yao.rnps} ± ${yao.rnpsSd} ribonucleoproteins inside, and Turoňová et al. measured each at about ${FACTS.turonova.vrnpLengthNm} nm long. The opening shows a few of those bodies, and the readout counts only those. The genome is about ${yao.genomeKb} kb. Postfusion spikes, ACE2 binding, and fusion are real and are not this figure.`;
}
