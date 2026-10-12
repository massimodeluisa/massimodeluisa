import { fitOrigin } from "../../kit/math.mjs";
import { ball, haloSvg, paintItem, rod, sortItems } from "../../kit/iso.mjs";
import { glycoprotein, membraneTile } from "../../kit/bio.mjs";
import { FACTS } from "./facts.mjs";

export const VIEW = { width: 720, height: 520 };

export const FRAME = [
  [-24, -28, -28],
  [40, 18, -28],
  [-24, -28, 22],
  [40, 18, 22],
];

export function sceneSvg(state) {
  const cam = fitOrigin(FRAME, state.cam, VIEW.width, VIEW.height, 36);
  const items = [haloSvg([state.center[0], state.center[1], 0], 36, 22, cam)].map((svg) => ({ depth: -1e6, svg }));
  for (const tile of state.membrane) items.push(...membraneTile(tile, cam, { tone: "mid", edge: tile.edge }));
  const trafLit = state.accent === "traf";
  for (const receptor of state.receptors) {
    items.push(...glycoprotein(receptor.base, receptor.height, 1.7, cam, { tone: "mid", lit: state.accent === "cd30" }));
    if (receptor.tail) items.push(paintItem(rod(receptor.tail.from, receptor.tail.to, 0.42, cam, 6), { tone: "hi", lit: trafLit }));
    items.push(paintItem(ball(receptor.seat, receptor.radius, cam), { tone: "lo", lit: trafLit }));
  }
  const body = sortItems(items.filter(Boolean)).map((item) => item.svg).join("");
  const label = "Three schematic CD30 receptors on a membrane patch. A short peptide on each docks onto one chain of a TRAF2 trimer, PDB 1D01. The Hodgkin cell is not drawn.";
  return `<svg class="v-svg" viewBox="0 0 ${VIEW.width} ${VIEW.height}" role="img" aria-label="${label}">${body}</svg>`;
}

export function captionText() {
  const domain = FACTS.uniprot;
  const pdb = FACTS.pdb;
  return `Classical Hodgkin lymphoma is not a virus and not a molecule you can draw as a particle. The Journal of Clinical Pathology review of the WHO fifth edition lists the minimal criteria as ${FACTS.disease.criteria}. This figure does not draw the Reed-Sternberg cell, the node, or the inflammatory cells around it. UniProt ${domain.id} places CD30 in the cell membrane: extracellular residues ${domain.extracellular[0]}–${domain.extracellular[1]}, a transmembrane span ${domain.transmembrane[0]}–${domain.transmembrane[1]}, and a cytoplasmic region ${domain.cytoplasmic[0]}–${domain.cytoplasmic[1]}. The only experimental CD30 atoms in the PDB are entry ${pdb.id}: ${pdb.peptideResidues} deposited residues in each of chains G, H, and I, on a TRAF domain of ${pdb.traf2Residues} residues. UniProt maps those chains to residues ${domain.peptideMap[0]}–${domain.peptideMap[1]}. The entry is a C3 trimer, biological assembly ${pdb.assembly}, ${pdb.resolutionA.toFixed(2)} Å (Ye et al., Mol Cell 1999). The drawing shows that stoichiometry: three TRAF2 chains, and three short peptides when they are docked. The peptides are not drawn to the length of a ${pdb.peptideResidues}-residue chain, and the cytoplasmic stretch from the membrane to residue ${domain.peptideMap[0]} is not in the crystal, so it is left as a gap. The stalks above the membrane stand in for the extracellular region, which that crystal does not contain. AlphaFold has a model of the rest of ${domain.id}; it is not drawn here. UniProt names NF-κB downstream of CD30. That step is not in this figure.`;
}
