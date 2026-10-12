import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { bundle } from "../../scripts/bundle.mjs";
import { pageHtml, plateHtml } from "../../kit/page.mjs";
import { pose, STAGES } from "./model.mjs";
import { captionText, sceneSvg } from "./scene.mjs";
import { FACTS } from "./facts.mjs";

const here = dirname(fileURLToPath(import.meta.url));
const theme = process.argv.includes("--dark") ? "dark" : "light";
const opening = pose(0, {});
const sources = [
  { label: "Frontiers in Virology 2022, Figure 1", url: FACTS.frontiers.figure },
  { label: "Ke et al. 2020", url: FACTS.ke.url },
  { label: "PDB 6VXX", url: FACTS.pdb.url },
  { label: "Yao et al. 2020", url: FACTS.yao.url },
];
const body = plateHtml({
  fig: "Fig 3",
  title: "SARS-CoV-2",
  hint: "Drag to turn · 1 crown · 2 section",
  readout: opening.readout,
  keys: [
    { mark: "lit", label: "Spike trimers. Three lobes on one stalk." },
    { mark: "mid", label: "Lipid envelope, 91 nm across" },
    { mark: "lo", label: "Membrane protein, the small marks. Envelope protein, the short channels in the cut." },
  ],
  caption: captionText(),
  sources,
  stages: STAGES,
  label: "SARS-CoV-2 particle. Drag to turn. Key 1 shows the outside. Key 2 cuts the envelope. E opens the same cut.",
  body: `<div data-scene>${sceneSvg(opening)}</div>`,
});

const lib = bundle([
  join(here, "../../kit/math.mjs"),
  join(here, "../../kit/iso.mjs"),
  join(here, "../../kit/bio.mjs"),
  join(here, "facts.mjs"),
  join(here, "model.mjs"),
  join(here, "scene.mjs"),
]);

const live = `
const stageEl = document.querySelector("[data-stagebox]");
const sceneHost = document.querySelector("[data-scene]");
const readout = document.querySelector("[data-readout]");
const buttons = [...document.querySelectorAll("[data-stage]")];
const still = matchMedia("(prefers-reduced-motion: reduce)");
let azimuth = ${opening.azimuth};
let elevation = ${opening.elevation};
let u = 0;
let target = u;
let explode = 0;
let explodeTarget = 0;
let speed = 1;
let playing = !still.matches;
let last = 0;
let frame = 0;
let idle = 0;
let drag = null;
function follow(current, next, dt, seconds) {
  if (still.matches || seconds <= 0) return next;
  const step = 1 - Math.exp(-dt / seconds);
  return current + (next - current) * step;
}
function nearest(value) {
  return STAGES.reduce((best, stage) => Math.abs(stage.at - value) < Math.abs(best.at - value) ? stage : best);
}
function render() {
  const state = pose(u, { azimuth, elevation, explode });
  sceneHost.innerHTML = sceneSvg(state);
  if (readout.textContent !== state.readout) readout.textContent = state.readout;
  const here = nearest(state.t);
  for (const button of buttons) button.setAttribute("aria-pressed", String(button.dataset.stage === String(here.at) && !playing));
  stageEl.setAttribute("aria-valuetext", state.readout);
}
function tick(now) {
  const dt = Math.min(0.05, last ? (now - last) / 1000 : 0.016);
  last = now;
  if (playing) target += dt * 0.18 * speed;
  if (target > 1.02) target = 0;
  u = follow(u, target, dt, playing ? 0.08 : 0.45);
  explode = follow(explode, explodeTarget, dt, 0.4);
  render();
  const settled = !playing && Math.abs(u - target) < 0.004 && Math.abs(explode - explodeTarget) < 0.004;
  frame = settled ? 0 : requestAnimationFrame(tick);
}
function wake() {
  if (!frame) { last = 0; frame = requestAnimationFrame(tick); }
}
function hold(next, play) {
  playing = Boolean(play) && !still.matches;
  target = next;
  clearTimeout(idle);
  idle = setTimeout(() => { if (!still.matches) { playing = true; wake(); } }, 8000);
  wake();
}
stageEl.addEventListener("pointerdown", (event) => {
  drag = { x: event.clientX, y: event.clientY, azimuth, elevation, moved: false };
  stageEl.setPointerCapture(event.pointerId);
  hold(target, false);
});
stageEl.addEventListener("pointermove", (event) => {
  if (!drag) return;
  const dx = event.clientX - drag.x;
  const dy = event.clientY - drag.y;
  if (Math.hypot(dx, dy) > 3) drag.moved = true;
  azimuth = drag.azimuth + dx * 0.35;
  elevation = Math.max(18, Math.min(62, drag.elevation - dy * 0.12));
  wake();
});
function endDrag() { drag = null; }
stageEl.addEventListener("pointerup", endDrag);
stageEl.addEventListener("pointercancel", endDrag);
stageEl.addEventListener("keydown", (event) => {
  const order = STAGES.map((stage) => stage.at);
  const here = nearest(target).at;
  const index = Math.max(0, order.indexOf(here));
  const lastKey = String(order.length);
  if (event.key >= "1" && event.key <= lastKey) hold(order[Number(event.key) - 1], false);
  else if (event.key === "ArrowRight") hold(order[Math.min(order.length - 1, index + 1)], false);
  else if (event.key === "ArrowLeft") hold(order[Math.max(0, index - 1)], false);
  else if (event.key === " ") { event.preventDefault(); hold(target, !playing); }
  else if (event.key === "e" || event.key === "E") { explodeTarget = explodeTarget > 0.5 ? 0 : 1; wake(); }
  else if (event.key === "[") speed = Math.max(0.25, speed / 1.6);
  else if (event.key === "]") speed = Math.min(3, speed * 1.6);
  else return;
  event.preventDefault();
});
for (const button of buttons) {
  button.addEventListener("click", () => hold(Number(button.dataset.stage), false));
}
render();
if (playing) wake();
`;

const script = `${lib}\n${live}`;
const file = theme === "dark" ? "sars-cov-2-dark.html" : "sars-cov-2.html";
writeFileSync(join(here, file), pageHtml({ title: "SARS-CoV-2 virion", theme, body, script }));
console.log("wrote", file);
