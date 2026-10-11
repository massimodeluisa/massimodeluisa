export const PAGE_CSS = `
:root, .virion[data-theme="dark"]{
  --v-page:#10110f; --v-card:#171815; --v-ink:#b7b6ae; --v-strong:#f3f1e8; --v-muted:#7d7c74;
  --v-paper:#171815; --v-top:#22231f; --v-s0:#0e0f0c; --v-s1:#141511; --v-s2:#1b1c17; --v-s3:#23241f;
  --v-line:#8d8c84; --v-line-dim:#3c3d37; --v-lit:#f7f4ea; --v-halo:#050504; --v-dot:#dddacd;
  color-scheme:dark;
}
.virion[data-theme="light"]{
  --v-page:#efeee8; --v-card:#fbfbf8; --v-ink:#5c5b56; --v-strong:#1c1c18; --v-muted:#8a8982;
  --v-paper:#fbfbf8; --v-top:#ffffff; --v-s0:#d9d8d1; --v-s1:#e4e3dc; --v-s2:#eeeee8; --v-s3:#f6f6f2;
  --v-line:#2a2a26; --v-line-dim:#b9b8b0; --v-lit:#161614; --v-halo:#9a988c; --v-dot:#3a3a34;
  color-scheme:light;
}
*{box-sizing:border-box}
body{margin:0;background:var(--v-page);color:var(--v-ink);font:15px/1.55 ui-sans-serif,system-ui,-apple-system,"Segoe UI",sans-serif}
.virion-page{width:min(760px,calc(100% - 28px));margin:48px auto 72px}
.virion-figure{margin:0}
.virion-plate{position:relative;padding:58px 18px 78px;background:var(--v-card);box-shadow:0 0 0 1px color-mix(in srgb,var(--v-muted) 70%, transparent)}
.virion-corners{position:absolute;inset:16px 18px;pointer-events:none}
.virion-corner{position:absolute;font:11px/1.2 ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;letter-spacing:.04em;color:var(--v-muted);white-space:nowrap}
.virion-corner[data-corner="fig"]{top:0;left:0;color:var(--v-ink)}
.virion-corner[data-corner="title"]{top:0;right:0;letter-spacing:.12em;text-transform:uppercase}
.virion-corner[data-corner="hint"]{left:0;bottom:0;letter-spacing:.08em;text-transform:uppercase;max-width:42%}
.virion-corner[data-corner="readout"]{right:0;bottom:0;color:var(--v-ink);font-size:10.5px;font-variant-numeric:tabular-nums;text-align:right;max-width:68%;white-space:nowrap}
.v-svg{display:block;width:100%;height:auto;overflow:visible}
.v-svg path,.v-svg circle,.v-svg ellipse{vector-effect:non-scaling-stroke}
.v-fill{fill:var(--v-paper);stroke:none}
.v-shade{stroke:none}
.v-shade[data-shade="0"]{fill:var(--v-s0)}
.v-shade[data-shade="1"]{fill:var(--v-s1)}
.v-shade[data-shade="2"]{fill:var(--v-s2)}
.v-shade[data-shade="3"]{fill:var(--v-s3)}
.v-solid[data-lit] .v-shade{fill:color-mix(in srgb,var(--v-lit) 34%, var(--v-paper))}
.v-solid[data-lit] .v-edge{stroke:var(--v-lit);stroke-width:1.15px}
.v-edge{fill:none;stroke:var(--v-line);stroke-width:.7px;stroke-linejoin:round;stroke-linecap:round}
.v-edge[data-tone="lo"]{stroke:var(--v-line-dim)}
.v-edge[data-tone="mid"]{stroke:color-mix(in srgb,var(--v-line) 55%, var(--v-line-dim))}
.v-dot{fill:var(--v-dot);stroke:none;opacity:.45}
.v-halo{fill:var(--v-halo);opacity:.28;filter:blur(10px)}
.virion-legend{display:grid;gap:10px;margin-top:14px;color:var(--v-muted);font-size:13.5px}
.virion-keys{display:flex;flex-wrap:wrap;gap:8px 16px}
.virion-key{display:inline-flex;align-items:center;gap:7px}
.virion-swatch{width:14px;height:10px;border:1px solid var(--v-line);background:linear-gradient(#fff0,var(--v-s0));display:inline-block}
.virion-swatch[data-mark="lit"]{background:var(--v-lit);border-color:var(--v-lit)}
.virion-swatch[data-mark="lo"]{background:var(--v-s1)}
.virion-caption{max-width:68ch}
.virion-stages{display:flex;flex-wrap:wrap;gap:6px;margin-top:4px}
.virion-stages button{font:12px/1 ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;letter-spacing:.08em;text-transform:uppercase;color:var(--v-ink);background:transparent;border:0;border-bottom:1px solid transparent;padding:6px 2px;cursor:pointer}
.virion-stages button[aria-pressed="true"]{color:var(--v-strong);border-bottom-color:var(--v-strong)}
.virion-sources{font-size:12px}
.virion-sources a{color:inherit}
.virion-stage{touch-action:none}
@media (max-width:640px){
  .virion-plate{padding:72px 10px 86px}
  .virion-corner[data-corner="readout"]{left:0;right:auto;bottom:22px;text-align:left;white-space:normal;max-width:100%}
  .virion-corner[data-corner="hint"]{bottom:0}
}
@media (prefers-reduced-motion:reduce){.v-halo{filter:none}}
`;

function escape(text) {
  return String(text).replace(/[&<>"]/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[ch]);
}

export function plateHtml({ fig, title, hint, readout, keys, caption, sources, body, stages }) {
  const keyHtml = keys.map((key) => `<span class="virion-key"><i class="virion-swatch" data-mark="${key.mark}"></i>${escape(key.label)}</span>`).join("");
  const stageHtml = stages.map((stage) => `<button type="button" data-stage="${stage.at}" aria-pressed="false">${escape(stage.key)} ${escape(stage.label)}</button>`).join("");
  const sourceHtml = sources.map((source) => `<a href="${escape(source.url)}">${escape(source.label)}</a>`).join(" · ");
  return `<figure class="virion-figure"><div class="virion-plate"><div class="virion-corners" aria-hidden="true"><span class="virion-corner" data-corner="fig">${escape(fig)}</span><span class="virion-corner" data-corner="title">${escape(title)}</span><span class="virion-corner" data-corner="hint">${escape(hint)}</span><span class="virion-corner" data-corner="readout" data-readout>${escape(readout)}</span></div><div class="virion-stage" tabindex="0" data-stagebox role="application" aria-label="Influenza particle. Drag to turn. Keys 1 to 5 choose a stage.">${body}</div></div><figcaption class="virion-legend"><span class="virion-keys">${keyHtml}</span><span class="virion-caption">${escape(caption)}</span><span class="virion-stages" data-stages>${stageHtml}</span><span class="virion-sources">${sourceHtml}</span></figcaption></figure>`;
}

export function pageHtml({ title, theme, body, script }) {
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${escape(title)}</title><style>${PAGE_CSS}</style></head><body class="virion" data-theme="${theme}"><main class="virion-page">${body}</main><script type="module">${script.replace(/<\/(script)/gi, "<\\/$1")}</script></body></html>`;
}
