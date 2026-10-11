# Sources

Take a one-line prompt or a URL. Write a facts module before drawing. The figure may only state what that module states.

## Taking a URL

1. Fetch the page. Prefer HHMI BioInteractive, a PDB/RCSB entry page, Viro3D, NIH 3D, CDC pathogen pages, and a primary paper or a review that cites one.
2. Copy the claims you will use: sizes, counts, names, and the order of steps. Keep the URL next to each claim.
3. If the page does not say it, do not draw it. A second source is allowed when the caption names both. "Standard knowledge" without a citation is not a source.
4. Separate three kinds of number:
   - **Measured.** A paper or the HHMI page states it. The readout may show it.
   - **Inside a measured range.** Say the range and that the drawn count is inside it.
   - **Schematic.** A drawing choice (stalk thickness, which rod is in the centre, a membrane tile size). It may shape the picture. It must not appear as a measurement.

PDB is evidence that a fold exists. It is not a license to invent the cell-biology steps around that fold.

## Trusted starting points

- HHMI Virus Explorer for the cycle in plain language.
- Harris et al. 2006 for influenza surface counts.
- A review that points at the endosome pH and at entry order, named in the facts file.

Add a new `references/<virus>.md` before drawing any particle that is not influenza. Do not reuse influenza spike counts on another virus.

## What this skill will not produce

Refuse, and do not add a "high level" version of the method either:

- Genome or protein sequences, beyond a length a source already printed.
- Reverse genetics, rescue, plasmids, transfection, or reassortment as a procedure.
- Growth, eggs, culture, purification, titres, or formulation.
- How to change receptor binding, fusion pH, stability, or drug sensitivity.
- Anything aimed at making a particle more infectious, harder to detect, or easier to produce.

A figure of the published entry cycle is in scope. A protocol is not. If a prompt mixes the two, build the figure from the public cycle and refuse the protocol.
