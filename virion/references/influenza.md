# Influenza A, the reference particle

The figure explains one spherical influenza A particle on a patch of membrane. HHMI's Virus Explorer is the cycle. The counts and lengths come from the papers below. Nothing in the readout is a round number invented to look precise.

## From HHMI

Source: [Virus Explorer, Influenza A](https://media.hhmi.org/biointeractive/click/virus-explorer/influenza.html).

- Orthomyxoviridae.
- Enveloped particles, about 100 nm, spherical or oblong.
- Segmented negative-sense RNA, eight segments, about 13,500 bp.
- The cycle they draw: glycoproteins bind a receptor, endocytosis brings the particle into an endosome, acidification fuses the envelope with the endosome membrane, and the genome segments and polymerase are released into the cytosol.
- Later steps on that page (nucleus, transcription, new proteins, assembly) are real. This figure stops at release into the cytosol, then shows budding and NA release as the exit of the same particle. It does not draw the nucleus.

## Counts and lengths

Harris et al., PNAS 2006 ([doi:10.1073/pnas.0607614103](https://doi.org/10.1073/pnas.0607614103)), cryo-ET of X-31 (H3N2):

- Two fully counted virions: 301 HA trimers + 50 NA tetramers, and 290 HA + 38 NA.
- Spherical outer diameters 84–170 nm, mean 120 nm. The figure uses HHMI's 100 nm as the drawn diameter, which sits in that range. It is not the Harris mean.
- HA tips about 14 nm from the membrane. NA tips about 16 nm.
- RNP contours they could trace ran about 24–110 nm. A straight 110 nm rod does not fit inside a 100 nm particle. The drawn rods are shortened to the interior and scaled to segment length. The caption says so.

Zebedee and Lamb, Journal of Virology 1988 ([doi:10.1128/jvi.62.8.2762-2772.1988](https://doi.org/10.1128/jvi.62.8.2762-2772.1988)): 14–68 M2 molecules per virion, which is 4–17 tetramers. The figure draws 5 pores, inside that range. Cryo-ET does not place M2. They sit on the cap with the NA cluster because budding descriptions put both at the pinching end (Calder et al.; Noda, Frontiers in Microbiology 2011). That placement is marked schematic in the caption.

## Genome

Winter and Fields, Nucleic Acids Research: segment 2 of A/PR/8/34 is 2,341 nt and completes the strain at 13,588 nt. The eight lengths in the model are the expected PR8 lengths that add up to that total (NS 890, M 1,027, NA 1,413, NP 1,565, HA 1,778, PA 2,233, PB1 2,341, PB2 2,341), as listed for rA/Puerto Rico/8/1934 by Keller et al. in their direct-RNA read-length figure. HHMI's "about 13,500 bp" is the round number. The readout uses 8 segments. The caption may show 13,588 when it is citing PR8, and must not attribute 13,588 to HHMI.

Packing is one rod inside seven (Noda et al., Nature 2006). Which segment sits in the centre is not claimed. The longest rod is drawn in the middle and the caption says the choice is schematic. Carter and Iqbal, Viruses 2024, describe release of the eight RNPs as one bundle. The figure moves them together.

## pH

Carter and Iqbal, Viruses 2024 ([doi:10.3390/v16020316](https://doi.org/10.3390/v16020316)): early endosomes are mildly acidic, near pH 6; late endosomes span about pH 6.0–4.8. Extracellular pH in the model is 7.4.

The fusion setpoint is pH 5.0, chosen because it sits inside that late-endosome window. It is not a measured pKa for every HA. M2 opens as the pH falls through the early-endosome value. Both thresholds live in `facts.mjs`. The spring and the open pore are functions of pH, not a separate animation flag.

## What the stages are

| Rest | What is true in the model |
|---|---|
| Bind | pH 7.4, HA at the 14 nm length, several heads within reach of sialic acid |
| Enter | The membrane under the particle drops into a pit and the particle drops with the receptors it is holding, pH toward 6.2 |
| Fuse | pH 5.0, HA lengthens, the contact spikes reach into the membrane |
| Uncoat | The eight rods leave downward as one bundle and clear the membrane |
| Bud | pH back to 7.4, HA short again, the particle lifts, sialic-acid heads go to zero |

`bound`, `inserted`, and `segmentsOut` are distances and positions, not scripted integers. If a change to the layout makes `bound` zero at the bind rest pose, the layout is wrong.

## Schematic, on purpose

- Spike thickness and the three-lobed head are drawing weights. The length is the Harris tip distance.
- The membrane patch is not a measured receptor density. Its only counted sugars are the ones the model places, and the readout counts those.
- The pit is the shape of endocytosis, not a claim about clathrin. HHMI says endocytosis and does not name the coat. No coat is drawn.
- A bilayer thickness is not taken from HHMI. Tiles are thick enough to read as a membrane. Do not put a nanometre thickness for the airway membrane in the readout.

## Parts

Membrane tiles, five sialic-acid glycoproteins on the contact ring, envelope, M1 shell (visible when the particle is open), HA trimers, a cluster of NA tetramers, a few M2 pores, eight RNP rods. The lit part changes with the stage: HA, then the rods, then NA.
