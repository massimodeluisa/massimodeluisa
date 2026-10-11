import { fitOrigin } from "../../kit/math.mjs";
import { haloSvg, sortItems } from "../../kit/iso.mjs";
import { envelope, glycoprotein, membraneTile, rnpRod, spike } from "../../kit/bio.mjs";
import { FACTS } from "./facts.mjs";

export const VIEW = { width: 720, height: 520 };

const FRAME = [
  [-40, -28, -46],
  [40, 28, -46],
  [-40, -28, 58],
  [40, 28, 58],
];

export function sceneSvg(state) {
  const cam = fitOrigin(FRAME, state.cam, VIEW.width, VIEW.height, 36);
  const items = [haloSvg([0, 0, 0], 46, 28, cam)].map((svg) => ({ depth: -1e6, svg }));
  for (const tile of state.membrane) {
    if (tile.gone) continue;
    items.push(...membraneTile(tile, cam, { tone: tile.z < -6 ? "lo" : "mid", edge: tile.edge }));
  }
  for (const sugar of state.sugars) {
    if (sugar.gone) continue;
    items.push(...glycoprotein(sugar.base, 3.2, sugar.headR, cam, { tone: "mid", lit: false, lobes: 1 }));
  }
  if (state.rna.visible) items.push(...rnpRod(state.rna.from, state.rna.to, cam, { lit: state.accent === "rna" }));
  items.push(...envelope(state.center, state.shellR, cam, {
    spread: state.spread,
    cutaway: state.cutaway,
    tone: state.accent === "shell" ? "hi" : "mid",
    lit: state.accent === "shell",
    bands: state.open > 0.2 ? 6 : 12,
  }));
  for (const arch of state.arches) {
    if (!arch.draw) continue;
    items.push(...spike(arch.anchor, arch.dir, arch, cam, { tone: "hi", lit: state.accent === "arch" }));
  }
  const body = sortItems(items).map((item) => item.svg).join("");
  const label = `A Norwalk virus capsid, ${FACTS.prasad1994.diameterNm} nanometres across, on a patch of membrane. The same model moves it through docking, entry, uncoating, and release of a new particle by lysis.`;
  return `<svg class="v-svg" viewBox="0 0 ${VIEW.width} ${VIEW.height}" role="img" aria-label="${label}">${body}</svg>`;
}

export function captionText() {
  const vz = FACTS.viralzone;
  const cap = FACTS.prasad1994;
  return `One Norwalk virus capsid on a membrane patch. ViralZone: non-enveloped, about ${vz.diameterNm[0]}–${vz.diameterNm[1]} nm, T=${vz.tNumber}, ${vz.vp1} copies of VP1, ${vz.genome} of ${vz.genomeKb[0]}–${vz.genomeKb[1]} kb, receptors are ${vz.receptor}. Entry on that page is attachment, endocytosis that does not use clathrin or caveolin, then uncoating into the cytoplasm. Exit is cell lysis. Prasad et al. 1994 measured an empty capsid ${cap.diameterNm} nm across, ${cap.dimers} dimers, shell density between ${cap.shellInnerNm} and ${cap.shellOuterNm} nm radius, with arch-like protrusions. PDB ${FACTS.pdb.id} is the 1999 crystal structure of that capsid. This drawing uses the ${cap.diameterNm} nm capsid and shows a facing handful of the ${cap.dimers} dimers, not every copy. The rod is one genome, not a measured contour length. The particle that leaves is a new capsid. Replication factories are not in this figure. A smaller empty T=1 shell (${vz.emptySmallNm} nm, ${vz.emptySmallVp1} copies) is real and is not drawn.`;
}
