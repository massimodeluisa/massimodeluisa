import { fitOrigin } from "../../kit/math.mjs";
import { ball, haloSvg, paintItem, rod, sortItems } from "../../kit/iso.mjs";
import { glycoprotein, membraneTile } from "../../kit/bio.mjs";
import { FACTS } from "./facts.mjs";

export const VIEW = { width: 720, height: 520 };

const FRAME = [
  [-40, -28, -52],
  [40, 28, -52],
  [-40, -28, 28],
  [40, 28, 28],
];

export function sceneSvg(state) {
  const cam = fitOrigin(FRAME, state.cam, VIEW.width, VIEW.height, 36);
  const items = [haloSvg([0, 0, 0], 42, 26, cam)].map((svg) => ({ depth: -1e6, svg }));
  for (const tile of state.membrane) items.push(...membraneTile(tile, cam, { tone: "mid", edge: tile.edge }));
  const trafLit = state.accent === "traf";
  for (const receptor of state.receptors) {
    items.push(...glycoprotein(receptor.base, receptor.height, 2.1, cam, { tone: "hi", lit: state.accent === "cd30" }));
    items.push(paintItem(rod(receptor.under, receptor.tip, 0.7, cam, 7), { tone: "hi", lit: trafLit }));
    items.push(paintItem(ball(receptor.seat, 4.6, cam), { tone: "lo", lit: trafLit }));
    items.push(paintItem(rod(receptor.seat, state.center, 0.8, cam, 7), { tone: "lo", lit: trafLit }));
  }
  items.push(paintItem(ball(state.center, 3.1, cam), { tone: "lo", lit: trafLit }));
  const body = sortItems(items.filter(Boolean)).map((item) => item.svg).join("");
  const label = "Three schematic CD30 receptors on a membrane patch. Their cytoplasmic tails dock into a TRAF2 trimer, the complex in PDB 1D01. The Hodgkin cell is not drawn.";
  return `<svg class="v-svg" viewBox="0 0 ${VIEW.width} ${VIEW.height}" role="img" aria-label="${label}">${body}</svg>`;
}

export function captionText() {
  const domain = FACTS.uniprot;
  const pdb = FACTS.pdb;
  return `Classical Hodgkin lymphoma is not a virus and not a molecule you can draw as a particle. The Journal of Clinical Pathology review of the WHO fifth edition lists the minimal criteria as ${FACTS.disease.criteria}. This figure does not draw the Reed-Sternberg cell, the node, or the inflammatory cells around it. UniProt ${domain.id} places CD30 in the cell membrane: extracellular residues ${domain.extracellular[0]}–${domain.extracellular[1]}, a transmembrane span ${domain.transmembrane[0]}–${domain.transmembrane[1]}, and a cytoplasmic region ${domain.cytoplasmic[0]}–${domain.cytoplasmic[1]}. The only experimental CD30 atoms in the PDB are entry ${pdb.id}: ${pdb.peptideResidues} deposited residues in each of chains G, H, and I, which UniProt maps to residues ${domain.peptideMap[0]}–${domain.peptideMap[1]}. Those peptides sit on the TRAF domain of TRAF2, a C3 trimer, biological assembly ${pdb.assembly}, ${pdb.resolutionA.toFixed(2)} Å (Ye et al., Mol Cell 1999). The three stalks above the membrane stand in for the extracellular region, which that crystal does not contain. AlphaFold has a model of the rest of ${domain.id}; it is not drawn here. UniProt names NF-κB downstream of CD30. That step is not in this figure.`;
}
