# Public structure sources

HHMI Virus Explorer is one plain-language cycle for a short list of viruses. It is not the catalog. A figure of any pathogen, virus, or molecular assembly starts from the public databases below. Fetch the entry. Keep the claims you can point at. Write them into a facts module before any geometry.

Do not download genome dumps, FASTA, GenBank records, or multiple-sequence alignments. A published length is enough. An accession is a citation, not a sequence to copy into the figure.

## What to open, in order

1. **Name the object.** A virus particle, a bacterial or parasite surface, or one molecular assembly (a spike, a capsid, a toxin, a ribosome). If the name is ambiguous, settle the taxon on ViralZone or ICTV before searching structures.
2. **Architecture.** Enveloped or naked, icosahedral or helical or pleomorphic, and the genome type if a source states it. This chooses the parts. It is not a license to invent the entry steps.
3. **An experimental structure** of the particle or its subunits, when one exists. PDB and EMDB come before any predicted model.
4. **A prediction** only when no experimental structure covers that protein. The caption says "predicted."
5. **Images** as evidence of shape. The figure is still drawn with this kit. Do not paste a rendered still in place of the object.

## Databases

| Source | Use it for | Start |
|---|---|---|
| [ViralZone](https://viralzone.expasy.org/) | Virion paragraph: envelope, diameter, symmetry, protein names, genome type, entry and exit in prose. Family pages link UniProt and PDB ids. Cite Hulo et al. / the ViralZone paper named on the page. | Search the virus name. Example: [norovirus](https://viralzone.expasy.org/194). |
| [ICTV](https://ictv.global/) | Current taxon, realm through species. Not a structure. | Taxonomy browser. |
| [RCSB PDB](https://www.rcsb.org/) | Experimental coordinates, oligomer, citation, resolution, organism. The 3D view is the public construction. | `https://www.rcsb.org/structure/1IHM` |
| [PDBe](https://www.ebi.ac.uk/pdbe/) | The same wwPDB entry, with the European assembly and validation views. | `https://www.ebi.ac.uk/pdbe/entry/pdb/1ihm` |
| [EMDB](https://www.ebi.ac.uk/emdb/) | Cryo-EM and cryo-ET maps of whole particles and subunits. Published diameter and symmetry. EMDB accessions are growing from four digits to five and six. | `https://www.ebi.ac.uk/emdb/EMD-xxxx` |
| [EMPIAR](https://www.ebi.ac.uk/empiar/) | The raw micrographs behind a map. Cite them for a shape you can see. Do not trace a raw frame into the SVG. | Entry page. |
| [VIPERdb](https://viperdb.org/) | Icosahedral capsids in one convention: T-number, family, X-ray or cryo-EM, links back to the PDB id. | Find a virus, or search the PDB id. |
| [PDB-101](https://pdb101.rcsb.org/) | Molecule of the Month and other plain-language structure essays. Good for a single assembly. | Browse, then open the PDB id it cites. |
| [NIH 3D](https://3d.nih.gov/) | Printable and viewable reconstructions (GLB, STL, and related) built from PDB, EMDB, AlphaFold, or imaging. Cite the NIH 3D entry and the source accession. | [Discover](https://3d.nih.gov/discover). |
| [AlphaFold DB](https://alphafold.ebi.ac.uk/) | Predicted monomer for a protein with no experimental fold. Caption marks it predicted. | UniProt accession. |
| [ModelArchive](https://www.modelarchive.org/) | Deposited predicted models, including viral sets linked from ViralZone. | The model id on the ViralZone row. |
| [Viro3D](https://viro3d.cvr.gla.ac.uk/) | Predicted structures for human and animal viruses (Litvin et al., Mol Syst Biol 2025). Use the entry page for a fold and a confidence score. | Search the site. Do not pull the Zenodo sequence dumps. |
| [BFVD](https://bfvd.steineggerlab.workers.dev/) | Large predicted viral-protein set, searched through [Foldseek](https://search.foldseek.com/). Same rule: a fold and a confidence, not a genome. | Foldseek, BFVD database. |
| [UniProt](https://www.uniprot.org/) | Protein name, gene name, and which PDB or AlphaFold models exist. | Accession from ViralZone or RCSB. Do not copy the sequence. |
| [NCBI Virus](https://www.ncbi.nlm.nih.gov/labs/virus/vssi/) | Isolate and taxonomy context. | Search the virus name. Do not export genomes into the skill. |
| [BV-BRC](https://www.bv-brc.org/) | Bacterial and viral resource for names and curated pages when ViralZone has no page. | Organism search. |
| [PubChem](https://pubchem.ncbi.nlm.nih.gov/) | A ligand's published name and that a structure shows it bound. | Compound name. No synthesis. |
| [CDC PHIL](https://phil.cdc.gov/) | Public-health images of particles and infected cells. Shape evidence, with the PHIL id in the caption. | Search the pathogen. |
| [Wikimedia Commons](https://commons.wikimedia.org/) | Micrographs and diagrams whose license you can name. | Category for the organism. |

wwPDB partners are RCSB, PDBe, and PDBj. An entry is one structure. Link the site you actually opened.

## What each record is allowed to contribute

- **Measured.** The page states a diameter, a T-number, a copy count, a resolution, an oligomeric state, or a genome length. The readout may show it, via the facts module.
- **Inside a range.** ViralZone often prints a range ("38–40 nm", "7.3 to 8.3 kb"). The drawing picks one stated value, usually the experimental one, and the caption keeps the range.
- **Schematic.** How many arches fit on the facing side, stalk thickness, tile size, which way a single RNA rod leans. It may shape the picture. It must not appear as a measurement.

A PDB or EMDB entry proves a fold and a published architecture. It does not describe the cell-biology steps around that fold. Those steps come from ViralZone, PDB-101, or a named review. If you cannot find the step, leave it out.

A predicted model (Viro3D, BFVD, AlphaFold, ModelArchive) is not an experimental map. Say so in the caption. Prefer an experimental PDB or EMDB id when both exist.

## Images and 3D files

Public images and reconstructions are sources, not the figure.

- RCSB and PDBe 3D views, EMDB volume renderings, and NIH 3D models show the experimental shape. Read off symmetry, which domains protrude, and whether the particle is round, filamentous, or tailed.
- ViralZone virion drawings and PHIL micrographs are the same kind of evidence. Credit them.
- Do not download a map, STL, or coordinate file into this skill to render it directly. Rebuild the architecture with the kit: a shaded ball or capsid, spikes or arches, a membrane, a genome rod. The caption points at the entry a reader can open.

NIH 3D is the place for a printable construction. Mol* on RCSB and PDBe is the place for an interactive atomic view. This skill does not replace either one. It builds the mechanical explanation those files do not animate.

## Architectures the kit already draws

| Class | Parts | Worked figure |
|---|---|---|
| Enveloped, pleomorphic, several surface proteins | Membrane, receptors, envelope ball, spikes (`lobes` 3, 4, or 1), inner shell, genome rods | `examples/influenza/` |
| Naked icosahedral, protruding dimers | Membrane, short receptor sugars, shell ball, dimer arches (`lobes` 2), one genome strand | `examples/norovirus/` |
| One molecular assembly, no cell | The oligomer alone, on an empty ground. No invented membrane cycle. | Start a new example. PDB-101 plus one PDB or EMDB id. |
| Helical capsid, tailed phage, bacterial surface | Rods, a shell, fibers. Add `references/<name>.md` and a facts module from the tables above before drawing. | Not drawn yet. Do not reuse influenza spike counts or the norovirus T-number. |

`spike(..., { lobes })` is the surface protein. Two lobes read as a dimer arch, three as a trimer, four as a tetramer. The count of lobes is the published oligomer. The number of copies drawn on the facing side is a sample, and the caption says so.

## A new figure

1. Search the tables. Save the URLs in `references/<name>.md`.
2. Write `examples/<name>/facts.mjs` with only those claims.
3. One sentence for the motion. If the sources do not give a cycle, draw the resting particle and say the cycle was not in the sources.
4. `pose(u)` places the parts. The scene only paints that pose.
5. `node examples/<name>/check.mjs`, then build the page and look at it.
