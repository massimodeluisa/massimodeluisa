import { add, cross, depthOf, mul, norm, pathOf, project, viewDir } from "../../kit/math.mjs";
import { ball, leadersSvg, paintItem, rod, solidSvg, sortItems } from "../../kit/iso.mjs";
import { envelope } from "../../kit/bio.mjs";
import { FACTS } from "./facts.mjs";
import { GUTTER, VIEW, plateCamera } from "./model.mjs";

function quadMesh(face, cam) {
  const path = pathOf(face.map((p) => project(p, cam)), true);
  const mid = mul(face.reduce((sum, p) => add(sum, p), [0, 0, 0]), 0.25);
  return { fill: path, shades: ["", path, "", ""], outline: path, depth: depthOf(mid, cam) };
}

function disk(center, radius, cam, shade = 1) {
  const steps = 40;
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
    const mesh = quadMesh(face, cam);
    const shades = ["", "", "", ""];
    shades[shade] = mesh.fill;
    mesh.shades = shades;
    const painted = paintItem(mesh, { tone: shade < 2 ? "mid" : "lo", edge: false });
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
      if (sameSide && Math.abs(cand.y - other.y) < 36) return false;
      return Math.hypot(cand.x - other.x, cand.y - other.y) >= 24;
    });
    const separated = (cand) => Math.min(...taken.map((other) => Math.hypot(other.x - cand.x, other.y - cand.y)), Infinity);
    const cand = ranked.find(fits) || ranked.slice().sort((a, b) => separated(b) - separated(a))[0];
    if (cand) taken.push({ name: pick.name, x: cand.x, y: cand.y });
  }
  return taken;
}

function plateNames(state, cam) {
  if (state.section) {
    const wall = Array.from({ length: 72 }, (_, i) => {
      const a = (i / 72) * Math.PI * 2;
      return screenOf([Math.cos(a) * state.radius * 0.99, Math.sin(a) * state.radius * 0.99, 0.02], cam);
    });
    const rim = [];
    for (let i = 0; i < 24; i++) {
      const a = (i / 24) * Math.PI * 2;
      const dir = [Math.cos(a), Math.sin(a), 0];
      const b = -2 * (dir[0] * state.nucleusAt[0] + dir[1] * state.nucleusAt[1]);
      const c = state.nucleusAt[0] ** 2 + state.nucleusAt[1] ** 2 - state.nucleusR ** 2;
      const outer = (-b + Math.sqrt(Math.max(0, b * b - 4 * c))) / 2;
      const mid = (outer + state.radius) / 2;
      if (mid > outer + 0.12) rim.push(screenOf([dir[0] * mid, dir[1] * mid, 0.08], cam));
    }
    const blocks = state.blocks.map((block) => screenOf(block.at, cam));
    const mitos = state.mitos.map((mito) => screenOf(mito.at, cam));
    const nucleolus = screenOf(state.nucleolus.at, cam);
    const nucleus = [];
    for (const scale of [0.34, 0.5]) {
      for (let i = 0; i < 12; i++) {
        const a = (i / 12) * Math.PI * 2 + 0.4;
        const at = add(state.nucleusAt, [Math.cos(a) * state.nucleusR * scale, Math.sin(a) * state.nucleusR * scale, 0.16]);
        nucleus.push(screenOf(at, cam));
      }
    }
    return takeNames([
      { name: "Heterochromatin", candidates: blocks, score: (p) => apart(p, [nucleolus, ...mitos]) },
      { name: "Nucleolus", candidates: [nucleolus], score: () => 1 },
      { name: "Mitochondrion", candidates: mitos, score: (p) => apart(p, blocks) },
      { name: "Nucleus", candidates: nucleus, score: (p) => apart(p, [nucleolus, ...blocks]) },
      { name: "Cytoplasm", candidates: rim, score: (p) => apart(p, [...blocks, ...mitos, nucleolus]) },
      { name: "Plasma membrane", candidates: wall, score: (p) => apart(p, [...blocks, ...mitos, ...rim]) + rayClear(p, [...blocks, ...mitos]) },
    ]);
  }
  const view = viewDir(state.cam);
  const right = norm(cross(view, Math.abs(view[2]) < 0.9 ? [0, 0, 1] : [1, 0, 0]));
  const lift = norm(cross(right, view));
  const tips = state.villi.filter((villus) => villus.draw).map((villus) => screenOf(villus.tip, cam));
  const origin = screenOf(state.center, cam);
  const limb = Array.from({ length: 72 }, (_, i) => {
    const a = (i / 72) * Math.PI * 2;
    const dir = norm(add(mul(right, Math.cos(a)), mul(lift, Math.sin(a))));
    const edge = screenOf(add(state.center, mul(dir, state.radius * 0.98)), cam);
    return { x: edge.x * 0.86 + origin.x * 0.14, y: edge.y * 0.86 + origin.y * 0.14 };
  });
  return takeNames([
    { name: "Microvillus", candidates: tips, score: (p) => rayClear(p, tips) + apart(p, limb) },
    { name: "Plasma membrane", candidates: limb, score: (p) => apart(p, tips) },
  ]);
}

export function sceneSvg(state) {
  const cam = plateCamera(state.cam);
  const items = [];
  if (state.section) {
    items.push(...disk([state.center[0], state.center[1], 0], state.radius, cam, 1).map((item) => ({ ...item, depth: item.depth - 4 })));
    const nucleus = [state.nucleusAt[0], state.nucleusAt[1], 0.02];
    items.push(...disk(nucleus, state.nucleusR, cam, 3).map((item) => ({ ...item, depth: item.depth - 2 })));
    for (const mito of state.mitos) {
      const item = paintItem(rod(mito.from, mito.to, mito.r, cam, 8), { tone: "hi" });
      if (item) items.push({ ...item, depth: item.depth + 1 });
    }
    for (const block of state.blocks) {
      const item = paintItem(ball(block.at, block.r, cam, { bands: 8, steps: 12 }), { tone: "hi", lit: true });
      if (item) items.push({ ...item, depth: item.depth + 3 });
    }
    const nucleolusMesh = ball(state.nucleolus.at, state.nucleolus.r, cam, { bands: 10, steps: 14 });
    const nucleolusSvg = solidSvg(nucleolusMesh, { tone: "mid" })
      .replace('class="v-fill"', 'class="v-shade" data-shade="0"')
      .replaceAll('data-shade="3"', 'data-shade="1"')
      .replaceAll('data-shade="2"', 'data-shade="0"');
    if (nucleolusSvg) items.push({ depth: nucleolusMesh.depth + 3, svg: nucleolusSvg });
  } else {
    items.push(...envelope(state.center, state.radius, cam, { tone: "mid" }));
    for (const villus of state.villi) {
      if (!villus.draw) continue;
      items.push(paintItem(rod(villus.anchor, villus.tip, 0.15, cam, 7), { tone: "hi", lit: true }));
    }
  }
  const body = sortItems(items.filter(Boolean)).map((item) => item.svg).join("");
  const names = leadersSvg(plateNames(state, cam), { width: VIEW.width, height: VIEW.height, gutter: GUTTER });
  const label = "A resting small lymphocyte. Italic names in the margin lead to the plasma membrane, and in the cut to the cytoplasm, the nucleus, the heterochromatin, the nucleolus, and a mitochondrion.";
  return `<svg class="v-svg" viewBox="0 0 ${VIEW.width} ${VIEW.height}" role="img" aria-label="${label}">${body}${names}</svg>`;
}

export function captionText() {
  const s = FACTS.schmid;
  const film = FACTS.film;
  return `One resting small lymphocyte from human blood. Schmid-Schönbein, Shih, and Chien measured the undeformed cell at ${s.temDiameterUm} μm by transmission electron microscopy, and ${s.lightDiameterUm} μm by light microscopy. The isotonic volume on their figure is ${s.volumeUm3} ± ${s.volumeSdUm3} μm³. Downey et al. measured an optical diameter of ${FACTS.downey.opticalDiameterUm} μm. On a blood film the small lymphocyte is ${film.smearDiameterUm[0]}–${film.smearDiameterUm[1]} μm, because the cell is flattened. The nucleus is ${Math.round(s.nucleusFraction * 1000) / 10}% of the cell volume, the cytoplasm ${Math.round(s.cytoplasmFraction * 1000) / 10}%, and the mitochondria ${Math.round(s.mitochondriaFraction * 1000) / 10}%. The readout N is that nuclear share, computed from the two radii drawn here. A film can make the nucleus look like ${Math.round(FACTS.section.filmNucleusArea * 100)}% of the area; that is the film, not this sphere. The plasma membrane has about ${Math.round(s.excessMembrane * 100)}% more area than the smooth sphere. Janeway's resting cell has condensed chromatin, a thin rim of cytoplasm, and no rough endoplasmic reticulum. The nucleolus is drawn at ${FACTS.nucleolusDrawnUm} μm, inside the ${FACTS.section.nucleolusUm[0]}–${FACTS.section.nucleolusUm[1]} μm range of those sections. T cells and B cells are not separate shapes under the microscope. Key 2 cuts the cell.`;
}
