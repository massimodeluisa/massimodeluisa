# Craft

A finished figure looks like a small object on a card, the way Anatomy's instruments do. The object here is a particle and a membrane, not a gauge on a bench. Do not put the virion on a lab stand. The membrane is the stage.

## Parts

Group them before writing paths.

- **Membrane.** A patch of tiles, thick enough to show an edge. A pit is those tiles moving down, not a new shape pasted on. Receptors ride the tiles they stand on, so endocytosis carries them.
- **Sugars.** A short stalk and a head. The head radius is the cleavage. At zero the stalk remains, which is the glycoprotein after NA has cut the sialic acid.
- **Envelope.** One shaded ball while the particle is closed, so the outline is a single curve. Bands are for the apart view, where the shell has to open.
- **Spikes.** HA is three stalks and a club, 14 nm to the tip. NA is a thinner stalk and a wider head, 16 nm to the tip. M2 is a short pore with no club. Feet meet the surface. A fusion peptide is a thinner rod that grows past the head, and only on spikes that face the membrane.
- **Inside.** The M1 shell is a smaller ball, drawn when the envelope is open. Eight rods, one inside seven, lengths in proportion to the published segment lengths and short enough to sit in the particle.

## Tones

Paper fill, four shades, one outline. The membrane is mid, the envelope mid, the inner shell lo, the spikes hi. Exactly one lit accent:

- HA from approach through fusion
- the RNA rods while they are leaving
- NA from the start of budding

Do not light two of those at once.

## Order and the camera

Sort by depth. A closed ball has one depth at its centre, so spikes on the near side paint after it and spikes on the far side paint before it. Fit the camera to a fixed box that contains every stage, including the rods at full exit and the spikes at full explode. Fitting to the current pose makes the particle change size as it moves.

Default view is a three-quarter look, low enough that the contact spikes between particle and membrane face the reader. A top-down camera hides the binding.

## Motion

`u` runs from 0 to 5. The rests are the integers 1 through 5. The model maps `u` through pH to the spring and the pore. Positions follow those values. The page eases `u`. It does not ease a second, private copy of pH.

Drag changes azimuth and elevation and rebuilds the picture, because a turn is a new projection, not a screen translate. Stage changes ease. Reduced motion snaps.

## Readout

One line, from the model: pH, spring, how many HA are within reach, how many have reached the membrane, how many rods have cleared it, how many sialic-acid heads remain. The apart amount joins the line only while the particle is apart. Literature totals stay in the caption, filled from the facts module at build time.

## Failures

- A stack of discs with a hard seam on every band, while the particle is meant to be closed.
- A membrane that is only a grid of boxes, with no thickness and no pit when the stage is entry.
- Spikes that float off the surface, or a fusion needle that does not meet the membrane while `inserted` is greater than zero.
- A readout that still says `bound 5` after the geometry has moved the heads away.
- An arrowhead, a boxed caption, or a name written across the part. A Gray's leader is a plain line from an italic name in the margin to the part.
- A nucleus, a second cell, or a coat protein the source did not name.
