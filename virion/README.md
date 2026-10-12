# Virion

An agent skill that explains a pathogen, a virus, or a molecular assembly by drawing the object. Influenza A is the enveloped figure. Norwalk virus is the naked capsid. Any other particle starts from the public structure databases, not from the HHMI list.

The working rule is the same one as [Anatomy](https://github.com/wheresryan22/anatomy): the object is the explanation. Spikes, pores, and RNA rods move. The numbers on the card come from the model that moves them. This kit is not a copy of Anatomy's. It is a smaller one for membranes and spikes, held to that standard.

## The figure

Open [`examples/influenza/influenza.html`](examples/influenza/influenza.html). Drag to turn the particle. Keys 1–5 rest on bind, enter, fuse, uncoat, and bud. Space plays the cycle. E takes it apart. `[` and `]` change the pace.

<p>
  <img src="examples/influenza/shots/bind.png" width="640" alt="Isometric influenza A particle docked on a membrane patch. The readout shows pH 7.4 and five bound spikes.">
</p>

<p>
  <img src="examples/influenza/shots/uncoat.png" width="640" alt="The same particle in a membrane pit at pH 5, with eight RNA rods released below the membrane.">
</p>

The influenza cycle follows the [HHMI Virus Explorer influenza page](https://media.hhmi.org/biointeractive/click/virus-explorer/influenza.html). Spike counts and tip lengths are from Harris et al., PNAS 2006. The caption on the figure names every source. What the sources do not measure is marked as schematic in [`references/influenza.md`](references/influenza.md).

## A second architecture

Open [`examples/norovirus/norovirus.html`](examples/norovirus/norovirus.html). Keys 1–4 rest on dock, enter, uncoat, and lyse. This particle is not on the HHMI list. The cycle is the [ViralZone norovirus page](https://viralzone.expasy.org/194). The 38 nm T=3 capsid, 90 dimers, and the shell radii are from Prasad et al. 1994 and [PDB 1IHM](https://www.rcsb.org/structure/1IHM).

<p>
  <img src="examples/norovirus/shots/dock.png" width="640" alt="Isometric Norwalk virus capsid docked on a membrane patch. The readout shows 38 nm, T=3, 180 copies of VP1, and RNA still inside.">
</p>

Where to look up any other pathogen or molecule — PDB, EMDB, VIPERdb, NIH 3D, Viro3D, AlphaFold, PHIL — is [`references/databases.md`](references/databases.md). HHMI covers only the viruses they drew.

## A resting virion

Open [`examples/sars-cov-2/sars-cov-2.html`](examples/sars-cov-2/sars-cov-2.html). Key 1 is the outside of the particle. Key 2 cuts the envelope. The shape follows Figure 1 of [Frontiers in Virology, 12 January 2022](https://doi.org/10.3389/fviro.2021.815388): each spike is three lobes on one stalk, the small marks are the membrane protein, and the cut shows nucleocapsid beads on the genomic RNA. Italic names in the margin lead to those parts. The envelope is 91 ± 11 nm, from Ke et al. The readout counts the trimers and beads in the picture. The closed prefusion fit is [PDB 6VXX](https://www.rcsb.org/structure/6VXX).

<p>
  <img src="examples/sars-cov-2/shots/crown.png" width="640" alt="SARS-CoV-2 particle. Italic names in the margin lead to a spike trimer, a membrane mark, and the envelope.">
</p>

## Install

The skill is the `virion/` folder, with `SKILL.md` at its root.

```sh
git clone https://github.com/massimodeluisa/massimodeluisa.git
```

Copy or symlink `virion` into the skills directory your agent reads, so `SKILL.md` lands at `<skills>/virion/SKILL.md`.

Rebuild the page with Node 20 or later. There is nothing to install.

```sh
node examples/influenza/check.mjs
node examples/influenza/build.mjs
node examples/influenza/build.mjs --dark
node examples/norovirus/check.mjs
node examples/norovirus/build.mjs
node examples/sars-cov-2/check.mjs
node examples/sars-cov-2/build.mjs
```

`examples/influenza/Influenza.jsx` is the same scene as a React client component. It imports the model. It does not carry a second set of numbers.

## Layout

```text
virion/
├── SKILL.md
├── kit/                 camera, solids, biological parts, the card
├── references/          databases, the worked particles, sources, craft, kit API
├── examples/influenza/  enveloped particle
├── examples/norovirus/  naked T=3 capsid from ViralZone and PDB 1IHM
├── examples/sars-cov-2/ resting virion from Ke et al. 2020 and PDB 6VXX
└── evals/evals.json
```

## Boundary

The skill draws the published cycle. It does not produce sequences, reverse genetics, culture, or ways to change a virus. That line is in [`references/sources.md`](references/sources.md) and in `SKILL.md`.
