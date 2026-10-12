import { add, cross, depthOf, mul, norm, pathOf, project, viewDir } from "../../kit/math.mjs";
import { ball, dotSvg, haloSvg, leadersSvg, paintItem, rod, sortItems } from "../../kit/iso.mjs";
import { envelope } from "../../kit/bio.mjs";
import { FACTS } from "./facts.mjs";
import { FRAME, GUTTER, VIEW, plateCamera } from "./model.mjs";

export { FRAME, VIEW };

function quadMesh(face, cam) {
  const path = pathOf(face.map((p) => project(p, cam)), true);
  const mid = mul(face.reduce((sum, p) => add(sum, p), [0, 0, 0]), 0.25);
  return { fill: path, shades: ["", path, "", ""], outline: path, depth: depthOf(mid, cam) };
}

function club(spec, cam, { lit }) {
  const items = [paintItem(rod(spec.anchor, spec.neck, spec.stalkR, cam, 8), { tone: "hi", lit })];
  for (const at of spec.lobes) {
    items.push(paintItem(ball(at, spec.lobeR, cam, { bands: 10, steps: 14 }), { tone: "hi", lit }));
  }
  return items.filter(Boolean);
}

function annulus(center, outer, inner, cam) {
  const steps = 40;
  const items = [];
  for (let i = 0; i < steps; i++) {
    const a0 = (i / steps) * Math.PI * 2;
    const a1 = ((i + 1) / steps) * Math.PI * 2;
    const ring = (radius, a) => [center[0] + Math.cos(a) * radius, center[1] + Math.sin(a) * radius, center[2]];
    const face = [ring(inner, a0), ring(inner, a1), ring(outer, a1), ring(outer, a0)];
    const painted = paintItem(quadMesh(face, cam), { tone: "mid", edge: false });
    if (painted) items.push(painted);
  }
  return items;
}

function disk(center, radius, cam) {
  const steps = 28;
  const items = [];
  for (let i = 0; i < steps; i++) {
    const a0 = (i / steps) * Math.PI * 2;
    const a1 = ((i + 1) / steps) * Math.PI * 2;
    const face = [
      center,
      [center[0] + Math.cos(a0) * radius, center[1] + Math.sin(a0) * radius, center[2]],
      [center[0] + Math.cos(a1) * radius, center[1] + Math.sin(a1) * radius, center[2]],
      [center[0] + Math.cos(a1) * radius, center[1] + Math.sin(a1) * radius, center[2]],
    ];
    const painted = paintItem(quadMesh(face, cam), { tone: "lo", edge: false });
    if (painted) items.push(painted);
  }
  return items;
}

function screenOf(point, cam) {
  const [x, y] = project(point, cam);
  return { x, y };
}

function apart(point, others) {
  let best = Infinity;
  for (const other of others) best = Math.min(best, Math.hypot(point.x - other.x, point.y - other.y));
  return best;
}

function spanOf(points) {
  let span = Infinity;
  for (let i = 0; i < points.length; i++) {
    for (let j = i + 1; j < points.length; j++) span = Math.min(span, Math.hypot(points[i].x - points[j].x, points[i].y - points[j].y));
  }
  return span;
}

function outerPoint(points) {
  const mid = VIEW.width / 2;
  return points.slice().sort((a, b) => Math.abs(b.x - mid) - Math.abs(a.x - mid))[0];
}

function rayClear(point, obstacles) {
  const side = point.x < VIEW.width / 2 ? "left" : "right";
  const margin = side === "left" ? 140 : VIEW.width - 140;
  let clear = 80;
  for (const other of obstacles) {
    if (Math.hypot(other.x - point.x, other.y - point.y) < 3) continue;
    const between = side === "left" ? other.x > margin && other.x < point.x - 7 : other.x < margin && other.x > point.x + 7;
    if (!between) continue;
    clear = Math.min(clear, Math.abs(other.y - point.y));
  }
  return clear;
}

function takeNames(picks) {
  const taken = [];
  const width = VIEW.width;
  for (const pick of picks) {
    const ranked = pick.candidates.slice().sort((a, b) => pick.score(b) - pick.score(a));
    const fits = (cand) => taken.every((other) => {
      const sameSide = (cand.x < width / 2) === (other.x < width / 2);
      if (sameSide && Math.abs(cand.y - other.y) < 38) return false;
      return Math.hypot(cand.x - other.x, cand.y - other.y) >= 26;
    });
    const separated = (cand) => Math.min(...taken.map((other) => Math.hypot(other.x - cand.x, other.y - cand.y)), Infinity);
    const cand = ranked.find(fits) || ranked.slice().sort((a, b) => separated(b) - separated(a))[0];
    if (cand) taken.push({ name: pick.name, x: cand.x, y: cand.y });
  }
  return taken;
}

function plateNames(state, cam) {
  if (state.section) {
    const lobes = state.rim.filter((spike) => spike.draw).map((spike) => {
      const pts = spike.lobes.map((p) => screenOf(p, cam));
      return { ...outerPoint(pts), span: spanOf(pts) };
    });
    const channels = state.channels.filter((channel) => channel.draw).map((channel) => screenOf(mul(add(channel.from, channel.to), 0.5), cam));
    const hooks = state.hooks.filter((hook) => hook.draw).map((hook) => screenOf(hook.bend, cam));
    const beads = state.beads.map((at) => screenOf(at, cam));
    const strands = state.strand.map(([from, to]) => screenOf(mul(add(from, to), 0.5), cam));
    const wall = state.membraneInner + 3;
    const band = Array.from({ length: 96 }, (_, i) => {
      const a = (i / 96) * Math.PI * 2;
      return screenOf([Math.cos(a) * wall, Math.sin(a) * wall, 0], cam);
    });
    return takeNames([
      { name: "Spike protein (S)", candidates: lobes, score: (p) => p.span * 2 + rayClear(p, lobes) },
      { name: "Envelope protein (E)", candidates: channels, score: (p) => apart(p, [...hooks, ...lobes]) * 4 + rayClear(p, [...hooks, ...lobes]) },
      { name: "Membrane protein (M)", candidates: hooks, score: (p) => apart(p, [...lobes, ...channels]) * 4 + rayClear(p, [...lobes, ...channels]) },
      { name: "Envelope", candidates: band, score: (p) => apart(p, [...lobes, ...hooks, ...channels, ...beads]) * 4 },
      { name: "Nucleocapsid (N)", candidates: beads, score: (p) => apart(p, lobes) },
      { name: "Genomic RNA", candidates: strands, score: (p) => apart(p, beads) },
    ]);
  }
  const view = viewDir(state.cam);
  const right = norm(cross(view, Math.abs(view[2]) < 0.9 ? [0, 0, 1] : [1, 0, 0]));
  const lift = norm(cross(right, view));
  const lobes = [];
  const allLobes = [];
  for (const spike of state.spikes) {
    if (!spike.draw) continue;
    const pts = spike.lobes.map((p) => screenOf(p, cam));
    allLobes.push(...pts);
    const facing = spike.dir[0] * view[0] + spike.dir[1] * view[1] + spike.dir[2] * view[2];
    if (facing < 0.4) continue;
    const span = spanOf(pts);
    if (span < 14) continue;
    lobes.push({ ...outerPoint(pts), span });
  }
  const marks = state.marks.filter((mark) => mark.draw).map((mark) => screenOf(mark.at, cam));
  const origin = screenOf(state.center, cam);
  const limb = Array.from({ length: 96 }, (_, i) => {
    const a = (i / 96) * Math.PI * 2;
    const dir = norm(add(mul(right, Math.cos(a)), mul(lift, Math.sin(a))));
    const edge = screenOf(add(state.center, mul(dir, state.envelopeR * 0.98)), cam);
    return { x: edge.x * 0.82 + origin.x * 0.18, y: edge.y * 0.82 + origin.y * 0.18 };
  });
  return takeNames([
    { name: "Spike protein (S)", candidates: lobes, score: (p) => rayClear(p, [...allLobes, ...marks]) + p.span },
    { name: "Envelope", candidates: limb, score: (p) => apart(p, [...allLobes, ...marks]) },
    { name: "Membrane protein (M)", candidates: marks, score: (p) => apart(p, allLobes) },
  ]);
}

export function sceneSvg(state) {
  const cam = plateCamera(state.cam);
  const items = [haloSvg([0, 0, 0], 58, 30, cam)].map((svg) => ({ depth: -1e6, svg }));
  if (state.section) {
    items.push(...disk(state.center, state.membraneInner - 0.4, cam));
    items.push(...annulus(state.center, state.envelopeR, state.membraneInner, cam));
    for (const hook of state.hooks) {
      if (!hook.draw) continue;
      items.push(paintItem(rod(hook.from, hook.bend, 1.55, cam, 7), { tone: "hi" }));
      items.push(paintItem(rod(hook.bend, hook.to, 1.55, cam, 7), { tone: "hi" }));
    }
    for (const channel of state.channels) {
      if (channel.draw) items.push(paintItem(rod(channel.from, channel.to, 1.7, cam, 8), { tone: "mid" }));
    }
    for (const [from, to] of state.strand) {
      items.push(paintItem(rod(from, to, 1.35, cam, 7), { tone: "hi", lit: state.accent === "n" }));
    }
    for (const at of state.beads) {
      items.push(paintItem(ball(at, 3.05, cam, { bands: 8, steps: 12 }), { tone: "hi", lit: state.accent === "n" }));
    }
    for (const spec of state.rim) {
      if (spec.draw) items.push(...club(spec, cam, { lit: false }));
    }
  } else {
    items.push(...envelope(state.center, state.envelopeR, cam, { tone: "mid" }));
    for (const mark of state.marks) {
      if (!mark.draw) continue;
      items.push({ depth: depthOf(mark.at, cam) + 0.2, svg: dotSvg(mark.at, cam, 4.1, "lo") });
    }
    for (const spec of state.spikes) {
      if (spec.draw) items.push(...club(spec, cam, { lit: true }));
    }
  }
  const body = sortItems(items).map((item) => item.svg).join("");
  const names = leadersSvg(plateNames(state, cam), { width: VIEW.width, height: VIEW.height, gutter: GUTTER });
  const label = `A SARS-CoV-2 particle. Italic names in the margin lead to the spike, the membrane protein, the envelope, and, in the cut, the envelope protein, the nucleocapsid, and the genomic RNA.`;
  return `<svg class="v-svg" viewBox="0 0 ${VIEW.width} ${VIEW.height}" role="img" aria-label="${label}">${body}${names}</svg>`;
}

export function captionText() {
  const ke = FACTS.ke;
  const frontiers = FACTS.frontiers;
  const yao = FACTS.yao;
  return `One SARS-CoV-2 particle, in the form of Figure 1 in ${frontiers.journal}. The envelope is ${ke.diameterNm} ± ${ke.diameterSdNm} nm across, the mean Ke et al. measured, inside the review's ${frontiers.diameterNm[0]}–${frontiers.diameterNm[1]} nm range. Each spike is a trimer: one stalk and three lobes. The review gives that length as ${frontiers.spikeLengthNm[0]}–${frontiers.spikeLengthNm[1]} nm, and this drawing uses ${frontiers.spikeDrawnNm} nm. Ke et al. counted ${ke.trimers} ± ${ke.trimersSd} prefusion trimers on a virion. This crown is the schematic, and the readout S counts only the trimers in the picture. The small marks are the membrane protein. The short channels in the cut envelope are the envelope protein. Key 2 opens that cut: the beads are the nucleocapsid on the genomic RNA, and the readout N counts the beads drawn there. Yao et al. counted ${yao.rnps} ± ${yao.rnpsSd} ribonucleoproteins by cryo-electron tomography. The genome is about ${yao.genomeKb} kb. The closed prefusion trimer fitted to intact virions is PDB ${FACTS.pdb.id}.`;
}
