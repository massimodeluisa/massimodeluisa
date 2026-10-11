# Sources

Take a one-line prompt or a URL. Write a facts module before drawing. The figure may only state what that module states.

The catalog of public databases, image collections, and 3D reconstructions is `references/databases.md`. HHMI is one optional page on that list, and only for the viruses they illustrate.

## Taking a URL or a name

1. Fetch the page. For a name with no URL, search in the order in `references/databases.md`: ViralZone or ICTV, then RCSB PDB and EMDB, VIPERdb for an icosahedral capsid, NIH 3D and PDB-101, then a predicted model only if no experimental structure exists.
2. Copy the claims you will use: sizes, counts, symmetry, names, and the order of steps. Keep the URL next to each claim.
3. If the page does not say it, do not draw it. A second source is allowed when the caption names both. "Standard knowledge" without a citation is not a source.
4. Separate three kinds of number:
   - **Measured.** A paper, a database entry, or a cited page states it. The readout may show it.
   - **Inside a measured range.** Say the range and that the drawn value is inside it.
   - **Schematic.** A drawing choice (stalk thickness, how many copies face the camera, a membrane tile size). It may shape the picture. It must not appear as a measurement.

A PDB or EMDB entry is evidence that a fold exists. It is not a license to invent the cell-biology steps around that fold. A predicted model is labeled predicted in the caption.

Public images (RCSB 3D view, EMDB rendering, NIH 3D, ViralZone drawings, CDC PHIL, Wikimedia) tell you the shape. The figure is still drawn with the kit. Do not paste the image in as the figure, and do not copy coordinate or map files into the skill.

Add a new `references/<name>.md` before drawing any object that is not already a worked example. Do not reuse another particle's counts.

## What this skill will not produce

Refuse, and do not add a "high level" version of the method either:

- Genome or protein sequences, beyond a length a source already printed. No FASTA, GenBank, or alignment downloads.
- Reverse genetics, rescue, plasmids, transfection, reassortment, or genome editing as a procedure.
- Growth, eggs, culture, fermentation, purification, titres, or formulation.
- How to change receptor binding, fusion pH, stability, drug sensitivity, or host range.
- Anything aimed at making a particle more infectious, harder to detect, or easier to produce.

A figure of the published structure and, when a source describes it, the published entry cycle is in scope. A protocol is not. If a prompt mixes the two, build the figure from the public record and refuse the protocol.
