# Kit

Plain ESM. No dependencies. World axes are x and y on the membrane, z up, in nanometres. The camera fit converts that into the card.

## math.mjs

`add`, `sub`, `mul`, `dot`, `cross`, `norm`, `lerp`, `clamp`, `smooth`.

`camera({ azimuth, elevation, scale, origin })` and `project`, `depthOf`, `viewDir`. Larger depth is nearer. `fitOrigin(points, cam, width, height, pad)` returns a camera whose scale and origin fit those points. Pass a fixed box, not the pose you happen to be drawing.

## iso.mjs

`rod(from, to, radius, cam)` and `box(x, y, w, d, z, h, cam)` return a mesh: fill, four shade paths, outline, depth.

`ball(center, radius, cam)` is one mesh. The outline is the hull of the sphere. The shades are the facing quads. Use this for a closed envelope.

`solidSvg(mesh, { tone, lit, edge })` paints it. `edge: false` is for tiles that should merge into one sheet. `paintItem` wraps that with the mesh depth. `sortItems` paints far to near. `haloSvg` and `dotSvg` are the soft ground and the small marks on a tile.

## bio.mjs

`membraneTile(tile, cam, { tone, edge })`. A tile is `{ x, y, w, d, z, h, cx, cy }`.

`glycoprotein(base, height, headR, cam)`. `headR` of 0 leaves the stalk.

`spike(anchor, dir, spec, cam, { tone, lit })`. `spec` is `{ length, head, stalk, lobes, spread, fusion, peptide }`. `lobes` is the published oligomer. Two lobes read as a dimer arch (norovirus P domains). Three lobes and a modest head read as a trimer such as influenza HA. Four lobes, a wider head and a thinner stalk read as a tetramer such as influenza NA.

`envelope(center, radius, cam, { spread, cutaway, tone, lit, bands })`. No spread and no cutaway uses `ball`. Otherwise it draws bands and, if `cutaway`, drops the nearest bands so the inside shows. `lit` marks the shell as the part this stage is about.

`rnpRod(from, to, cam, { lit })` is a rod with a few rings. The rings are the helical nucleoprotein, drawn as a weight, not a measured pitch.

## page.mjs

`plateHtml` takes fig, title, hint, readout, keys, caption, sources, stages, and the svg. `pageHtml` wraps it. Themes are `light` and `dark`. Light is the one to look at first.

## A standalone page

`scripts/bundle.mjs` concatenates the modules in dependency order and strips `import` and `export`. The live script follows that bundle and may call `pose` and `sceneSvg`. Build scripts follow `examples/influenza/build.mjs`.

## React

`examples/influenza/Influenza.jsx` is a client component. It imports the same `pose` and `sceneSvg`. Copy `kit/` and the example folder into the app. The component does not fetch data and does not contain a second model.
