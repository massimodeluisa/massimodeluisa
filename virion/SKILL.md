---
name: virion
description: Build a crafted interactive isometric figure that explains a pathogen, a virus particle, or a molecular assembly. Use when someone wants any virus, virion, bacterium, parasite surface, capsid, spike, entry, fusion, uncoating, budding, or a PDB, EMDB, ViralZone, or NIH 3D structure explained as a physical object. The moving parts are the mechanism. Every number on the figure comes from the same small model that moves those parts.
---

# Virion

This skill explains a pathogen or a molecule by building the object. A reader should be able to point at a spike, an arch, a pore, or a strand and say what it just did. Influenza A is the enveloped example. Norwalk virus is the naked icosahedral example. The same workflow covers any other virus, a bacterial or parasite surface, or a single molecular assembly.

The drawing school is the one in Ryan's Anatomy skill (https://github.com/wheresryan22/anatomy): many small solid parts, a real camera, painter's order, a framed card, and numbers that come from the mechanism. The kit here is a smaller one, written for membranes, capsids, and spikes. Do not paste Anatomy's kit in. Use this one, and keep Anatomy's rules where they still fit.

HHMI Virus Explorer is a plain-language cycle for a short list of viruses. It is one optional source when the virus is on that list. It is not the boundary of the skill. Structures, images, and 3D reconstructions come from the public databases in `references/databases.md`.

## The rule

**The object is the explanation.** The spike that lengthens is the fusion spring. The arches that touch the sugars are the capsid dimers. The strand that leaves through the shell is the genome. If a step cannot be shown by a part moving, it does not belong in the figure yet.

Name a part the way a Gray's Anatomy plate does. The name sits in the margin, in italic, and a plain line runs from that name to the part. No arrowhead, no box, and no word written on the part itself. The line is recomputed from the same projection as the solids, so a turn keeps the name attached.

Every number in the readout is computed by the model that places the parts. A count you type into the caption and a different count you type into the drawing is a bug. Literature numbers live in a facts module. The model imports them. The caption is filled from that same module.

## What not to do

This skill draws public mechanism. It does not help make, grow, rescue, passage, deliver, or alter a pathogen.

- No genome or protein sequences, only a published length when a source states it.
- No reverse genetics, plasmids, expression, purification, culture, or fermentation steps.
- No instructions for changing host range, fusion pH, drug resistance, or yield.
- Do not download FASTA, GenBank, or alignment dumps from Viro3D, BFVD, NCBI, or UniProt. An accession is a citation.
- If a request asks for any of that, refuse that part and stay with the figure. `references/sources.md` has the boundary.

If a structure or step is not in the source, omit it or mark it in the caption as schematic. Do not invent a mechanism to fill a gap. Do not reuse influenza spike counts, or the norovirus T-number, on another particle.

## Workflow

1. **Name the object.** One particle, one surface, or one assembly. A nucleus, a tissue, or a second cell is a later figure.
2. **Search the public record.** Follow `references/databases.md`. ViralZone or ICTV for the taxon, then PDB and EMDB for an experimental structure, VIPERdb for an icosahedral capsid, NIH 3D for a reconstruction, PDB-101 for a plain-language essay. Predicted models (Viro3D, BFVD, AlphaFold, ModelArchive) only when no experimental structure exists, and the caption says predicted. HHMI only if that virus is one of theirs, and never as the only source of a size.
3. **Truth first.** Write `references/<name>.md` and `examples/<name>/facts.mjs` before any geometry. Keep the URL next to each claim.
4. **Name the motion.** One sentence: what moves, and what that motion means. If the sources do not give a cycle, draw the resting object and say so.
5. **Parts, then code.** List the parts. Each part sits on another part. `lobes` on a spike is the published oligomer: 2 dimer, 3 trimer, 4 tetramer.
6. **One model.** `pose(u)` returns positions and the readout. The scene only draws that object.
7. **Draw with the kit.** Solids, depth sorted. Camera fit is stable across the whole cycle so the object does not zoom as it moves. `references/kit.md`.
8. **Frame it.** Fig number, title, hint, live readout, legend and caption under the card. In the drawing, a Gray's leader: italic name in the margin, plain line ending on the part.
9. **Make it live.** Drag turns the object. Number keys rest on the stages. Space plays the cycle. E eases it apart. `[` and `]` change the pace. Motion eases. Reduced motion jumps and does not play.
10. **Check it.** `node examples/<name>/check.mjs` must pass. Then open the page and look.

## Worked figures

`examples/influenza/` is the enveloped particle. HHMI's Virus Explorer supplies the cycle. Harris et al. 2006 supply the spike counts. The drawing shows a facing handful of spikes.

`examples/norovirus/` is the naked T=3 capsid. ViralZone supplies the cycle. Prasad et al. 1994 and PDB 1IHM supply the diameter, the 90 dimers, and the shell radii. HHMI is not a source for it.

`examples/sars-cov-2/` is the resting SARS-CoV-2 particle. Figure 1 of Frontiers in Virology, 12 January 2022, supplies the shape: three-lobed spike trimers, membrane marks, and nucleocapsid beads on the genomic RNA. Ke et al. 2020 supply the 91 nm envelope. The readout counts the trimers and beads the picture actually draws.

Nuclear import, transcription, and replication factories are real and are not in these figures. Do not add a fake compartment to suggest them.

## Craft, short form

`references/craft.md` is the long version.

- Solids, not wireframes. One outline around a smooth body. Shade inside it.
- Membrane, shell, and spikes are separate tones. One accent is lit: the part the stage is about.
- A line ends on a part. A stalk starts on the shell or on a membrane tile and ends in a head. A name in the margin ends on a part the same way: a plain leader, no arrowhead.
- Thickness of a stalk is a drawing weight so the part reads at card size. Lengths are the measured ones. The readout never presents a drawing weight as a measurement.
- Colour is not the explanation. The monochrome card is the figure.
- The closed particle is one shaded ball. The apart view may open that ball into bands so the inside is visible.

## Kit

| File | Use |
|---|---|
| `kit/math.mjs` | Vectors, the camera, fit, depth. |
| `kit/iso.mjs` | Prisms, rods, a shaded ball, SVG paint. |
| `kit/bio.mjs` | Membrane tiles, a glycoprotein, oligomer spikes, envelope, genome rods. |
| `kit/page.mjs` | The card, both themes, the page wrapper. |
| `scripts/bundle.mjs` | Inlines those modules into one standalone page. |

## References

- `references/databases.md`: where to search for any pathogen or molecule, and what each record may contribute.
- `references/influenza.md`, `references/norovirus.md`, `references/sars-cov-2.md`: the numbers for the worked figures.
- `references/sources.md`: how to take a URL, and what this skill will not produce.
- `references/craft.md`: parts, tones, order, motion, the failure modes.
- `references/kit.md`: the functions the figure actually calls.
