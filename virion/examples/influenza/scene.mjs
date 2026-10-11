import { fitOrigin } from "../../kit/math.mjs";
import { haloSvg, sortItems } from "../../kit/iso.mjs";
import { envelope, glycoprotein, membraneTile, rnpRod, spike } from "../../kit/bio.mjs";
import { FACTS } from "./facts.mjs";

export const VIEW = { width: 720, height: 520 };

const FRAME = [
  [-100, -70, -96],
  [110, 70, -96],
  [-100, -70, 150],
  [110, 70, 150],
];

export function sceneSvg(state) {
  const cam = fitOrigin(FRAME, state.cam, VIEW.width, VIEW.height, 34);
  const items = [haloSvg([0, 0, 0], 78, 46, cam)].map((svg) => ({ depth: -1e6, svg }));
  for (const tile of state.membrane) items.push(...membraneTile(tile, cam, { tone: tile.z < -10 ? "lo" : "mid", edge: tile.edge }));
  for (const receptor of state.receptors) {
    items.push(...glycoprotein(receptor.base, 9, receptor.headR, cam, { tone: "hi", lit: false, lobes: 1 }));
  }
  const cutaway = state.explode > 0.18;
  if (cutaway || state.release > 0.08) {
    items.push(...envelope(state.center, state.m1R, cam, { spread: state.spread * 0.45, cutaway, tone: "lo" }));
    for (const rod of state.rnps) items.push(...rnpRod(rod.from, rod.to, cam, { lit: state.accent === "rnp" }));
  }
  items.push(...envelope(state.center, state.envelopeR, cam, { spread: state.spread, cutaway, tone: "mid" }));
  const drawSpike = (spec, lit) => {
    if (!spec.draw) return;
    items.push(...spike(spec.anchor, spec.dir, spec, cam, { tone: lit ? "hi" : "mid", lit }));
  };
  for (const spec of state.ha) drawSpike(spec, state.accent === "ha");
  for (const spec of state.na) drawSpike(spec, state.accent === "na");
  for (const spec of state.m2) drawSpike(spec, false);
  const body = sortItems(items).map((item) => item.svg).join("");
  const label = `An influenza A particle, about ${FACTS.hhmi.diameterNm} nanometres across, on a patch of cell membrane. The same model moves the particle through binding, entry, low-pH fusion, uncoating and budding.`;
  return `<svg class="v-svg" viewBox="0 0 ${VIEW.width} ${VIEW.height}" role="img" aria-label="${label}">${body}</svg>`;
}

export function captionText() {
  const a = FACTS.harris.counted[0];
  const b = FACTS.harris.counted[1];
  return `One influenza A particle on a membrane patch. HHMI Virus Explorer: about ${FACTS.hhmi.diameterNm} nm, eight RNA segments, about ${FACTS.hhmi.genomeBp.toLocaleString("en-US")} bp, entry by binding, endocytosis, low pH and fusion. Harris et al. counted ${a.ha} HA and ${a.na} NA on one X-31 virion and ${b.ha} HA and ${b.na} NA on another; tips at ${FACTS.harris.haTipNm} nm (HA) and ${FACTS.harris.naTipNm} nm (NA). This drawing shows a facing handful of those spikes, not every copy. PR8 segment lengths sum to ${FACTS.pr8.totalNt.toLocaleString("en-US")} nt (Winter and Fields). M2 is drawn as ${FACTS.zebedee.tetramers[0] + 1} pores inside the published ${FACTS.zebedee.tetramers[0]}–${FACTS.zebedee.tetramers[1]} tetramer range; cryo-ET does not place them. Nuclear steps are left out of this figure.`;
}
