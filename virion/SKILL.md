---
name: virion
description: Build a crafted interactive isometric figure that explains how a virus particle works on a host membrane. Use when someone wants a virion, pathogen, influenza, entry, fusion, uncoating, or budding explained as a physical object, or an interactive figure from an HHMI, PDB, or review-page description. The moving parts are the mechanism. Every number on the figure comes from the same small model that moves those parts.
---

# Virion

This skill explains a virus by building the particle. A reader should be able to point at a spike, a pore, or a rod and say what it just did. The first finished figure is influenza A on one patch of membrane: bind, enter, fuse, uncoat, bud.

The drawing school is the one in Ryan's Anatomy skill (https://github.com/wheresryan22/anatomy): many small solid parts, a real camera, painter's order, a framed card, and numbers that come from the mechanism. The kit here is a smaller one, written for membranes and spikes. Do not paste Anatomy's kit in. Use this one, and keep Anatomy's rules where they still fit.

## The rule

**The object is the explanation.** Do not draw boxes, arrows, or floating labels. The spike that lengthens is the fusion spring. The rods that leave through the membrane are the genome. The heads that shrink are sialic acid being cut. If a step cannot be shown by a part moving, it does not belong in the figure yet.

Every number in the readout is computed by the model that places the parts. A count you type into the caption and a different count you type into the drawing is a bug. Literature numbers live in a facts module. The model imports them. The caption is filled from that same module.

## What not to do

This skill draws public mechanism. It does not help make, grow, rescue, passage, deliver, or alter a virus.

- No genome sequences, only published lengths when a source states them.
- No reverse genetics, plasmids, expression, purification, or culture steps.
- No instructions for changing host range, fusion pH, or drug resistance.
- If a request asks for any of that, refuse that part and stay with the figure. `references/sources.md` has the boundary.

If a structure or step is not in the source, omit it or mark it in the caption as schematic. Do not invent a mechanism to fill a gap.

## Workflow

1. **Keep the first figure small.** One particle and one membrane patch is the whole job. Nucleus, a second cell, blood, or a tissue is a later figure. Say that, and build the particle.
2. **Truth first.** Read `references/influenza.md` for influenza. For any other virus, or when the user pastes a URL, follow `references/sources.md`: fetch the page, keep only claims you can point at, and write them into a facts module before any geometry.
3. **Name the motion.** One sentence: what moves, and what that motion means. For influenza: the particle docks on sialic acid, the membrane cups around it, low pH lengthens HA into the membrane, the eight rods leave, and on the way out NA clears the sugars.
4. **Parts, then code.** List the parts in groups: membrane, receptors, envelope, the three surface proteins, the inner shell, the genome rods. Each part sits on another part.
5. **One model.** `pose(u)` returns positions, pH, and the readout. The scene only draws that object. Do not keep a second copy of the numbers in the page script.
6. **Draw with the kit.** Solids, depth sorted. Camera fit is stable across the whole cycle so the particle does not zoom as it moves. `references/kit.md`.
7. **Frame it.** Fig number, title, hint, live readout, legend and caption under the card. Words stay out of the drawing.
8. **Make it live.** Drag turns the particle. Keys 1–5 rest on the five stages. Space plays the cycle. E eases the particle apart. `[` and `]` change the pace. Motion eases. Reduced motion jumps and does not play.
9. **Check it.** `node examples/influenza/check.mjs` must pass. Then open the page and look: bind shows contact, the pit keeps that contact, fusion lengthens the spikes, eight rods leave, budding lifts a neutral-pH particle and the sugars are gone.

## The influenza figure

`examples/influenza/` is the reference build.

- `facts.mjs` holds the cited numbers.
- `model.mjs` is the only place those numbers become a pose.
- `scene.mjs` paints the pose.
- `node examples/influenza/build.mjs` writes `influenza.html`. `--dark` writes the dark page.
- `Influenza.jsx` is the same scene for a React page.

HHMI's Virus Explorer is the cycle (bind, endocytosis, low pH, fusion, release of the eight segments). Harris et al. 2006 supply the spike counts and the tip lengths. The drawing shows a facing handful of spikes, and the caption says so. It does not pretend to be a tomogram.

Nuclear import, transcription, and cap-snatching are real and are not in this figure. Do not add a fake nucleus to suggest them.

## Craft, short form

`references/craft.md` is the long version.

- Solids, not wireframes. One outline around a smooth body. Shade inside it.
- Membrane, shell, and spikes are separate tones. One accent is lit: HA while it binds and springs, the RNA rods while they leave, NA while it clears the surface.
- A line ends on a part. A stalk starts on the envelope or on a membrane tile and ends in a head.
- Thickness of a stalk is a drawing weight so the part reads at card size. Lengths are the measured ones. The readout never presents a drawing weight as a measurement.
- Colour is not the explanation. The monochrome card is the figure. Do not paint HA red and NA blue to make a diagram.
- The closed particle is one shaded ball. The apart view may open that ball into bands so the inside is visible.

## Kit

| File | Use |
|---|---|
| `kit/math.mjs` | Vectors, the camera, fit, depth. |
| `kit/iso.mjs` | Prisms, rods, a shaded ball, SVG paint. |
| `kit/bio.mjs` | Membrane tiles, a glycoprotein, HA/NA/M2 spikes, envelope, RNP rods. |
| `kit/page.mjs` | The card, both themes, the page wrapper. |
| `scripts/bundle.mjs` | Inlines those modules into one standalone page. |

## References

- `references/influenza.md`: the numbers, what is measured, what is schematic.
- `references/sources.md`: how to take a URL, and what this skill will not produce.
- `references/craft.md`: parts, tones, order, motion, the failure modes.
- `references/kit.md`: the functions the figure actually calls.
