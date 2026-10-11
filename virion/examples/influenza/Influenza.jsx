"use client";

import { useEffect, useRef, useState } from "react";
import { PAGE_CSS } from "../../kit/page.mjs";
import { pose, STAGES } from "./model.mjs";
import { captionText, sceneSvg } from "./scene.mjs";
import { FACTS } from "./facts.mjs";

const START = pose(1, {});

export function Influenza({ theme = "light" }) {
  const box = useRef(null);
  const [view, setView] = useState({
    u: START.t,
    azimuth: START.azimuth,
    elevation: START.elevation,
    explode: 0,
    playing: false,
  });
  const viewRef = useRef(view);
  viewRef.current = view;

  useEffect(() => {
    const node = box.current;
    if (!node) return undefined;
    const still = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;
    let last = 0;
    const drag = { on: false, x: 0, y: 0, azimuth: 0, elevation: 0 };

    const step = (now) => {
      const dt = Math.min(0.05, last ? (now - last) / 1000 : 0.016);
      last = now;
      const current = viewRef.current;
      let { u, playing } = current;
      if (playing) u += dt * 0.28;
      if (u > 5.02) u = 0;
      const follow = (from, to, seconds) => (still.matches ? to : from + (to - from) * (1 - Math.exp(-dt / seconds)));
      const next = follow(current.u, u, playing ? 0.08 : 0.45);
      if (next !== current.u) setView((prev) => ({ ...prev, u: next }));
      if (playing || Math.abs(next - u) > 0.004) frame = requestAnimationFrame(step);
      else frame = 0;
    };
    const wake = () => {
      if (!frame) {
        last = 0;
        frame = requestAnimationFrame(step);
      }
    };

    const down = (event) => {
      drag.on = true;
      drag.x = event.clientX;
      drag.y = event.clientY;
      drag.azimuth = viewRef.current.azimuth;
      drag.elevation = viewRef.current.elevation;
      setView((prev) => ({ ...prev, playing: false }));
    };
    const move = (event) => {
      if (!drag.on) return;
      setView((prev) => ({
        ...prev,
        azimuth: drag.azimuth + (event.clientX - drag.x) * 0.35,
        elevation: Math.max(12, Math.min(42, drag.elevation - (event.clientY - drag.y) * 0.12)),
      }));
    };
    const up = () => {
      drag.on = false;
    };
    const key = (event) => {
      const order = STAGES.map((stage) => stage.at);
      if (event.key >= "1" && event.key <= "5") setView((prev) => ({ ...prev, u: order[Number(event.key) - 1], playing: false }));
      else if (event.key === " ") setView((prev) => ({ ...prev, playing: !prev.playing }));
      else if (event.key === "e" || event.key === "E") setView((prev) => ({ ...prev, explode: prev.explode > 0.5 ? 0 : 1 }));
      else return;
      event.preventDefault();
      wake();
    };
    node.addEventListener("pointerdown", down);
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    node.addEventListener("keydown", key);
    return () => {
      cancelAnimationFrame(frame);
      node.removeEventListener("pointerdown", down);
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      node.removeEventListener("keydown", key);
    };
  }, []);

  const state = pose(view.u, view);
  const nearest = STAGES.reduce((best, stage) => (Math.abs(stage.at - state.t) < Math.abs(best.at - state.t) ? stage : best));

  return (
    <div className="virion" data-theme={theme}>
      <style>{PAGE_CSS}</style>
      <figure className="virion-figure">
        <div className="virion-plate">
          <div className="virion-corners" aria-hidden="true">
            <span className="virion-corner" data-corner="fig">Fig 1</span>
            <span className="virion-corner" data-corner="title">Influenza A</span>
            <span className="virion-corner" data-corner="hint">Drag to turn · 1–5 stage</span>
            <span className="virion-corner" data-corner="readout">{state.readout}</span>
          </div>
          <div
            className="virion-stage"
            ref={box}
            tabIndex={0}
            role="application"
            aria-label="Influenza particle"
            dangerouslySetInnerHTML={{ __html: sceneSvg(state) }}
          />
        </div>
        <figcaption className="virion-legend">
          <span className="virion-caption">{captionText()}</span>
          <span className="virion-stages">
            {STAGES.map((stage) => (
              <button
                key={stage.id}
                type="button"
                aria-pressed={stage.id === nearest.id && !view.playing}
                onClick={() => setView((prev) => ({ ...prev, u: stage.at, playing: false }))}
              >
                {stage.key} {stage.label}
              </button>
            ))}
          </span>
          <span className="virion-sources">
            <a href={FACTS.hhmi.url}>HHMI Virus Explorer</a>
          </span>
        </figcaption>
      </figure>
    </div>
  );
}
