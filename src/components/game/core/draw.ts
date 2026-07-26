/**
 * @file draw.ts
 * @description Canvas renderer for the galley. Generated art does the heavy lifting —
 * background plates per orientation plus keyed prop/ingredient sprites (assets.ts) —
 * while code keeps everything that must move or answer input: rain, lantern flicker,
 * stove flame, pour streams, fill gauges and bands, the Fogcutter's layers, the pan
 * shimmer, stir ring, progress pips, carry ghosts, fx, weather tint, paper grain. Every
 * sprite call falls back to a flat-vector shape so a missing image degrades to
 * placeholder art, never a hole.
 *
 * Pure read-only over the Sim. Reduced motion freezes phase args and drops shakes.
 */

import { P, rgba, WEATHER_TINT, type WeatherState } from '../palette';
import type { GalleyLayout } from '../layout';
import type { Rect } from './geom';
import type { Sim } from './sim';
import type { StageView } from './engine';
import {
  DISHES, INGREDIENTS, STIR_TEMPO,
  type DishId, type GlassSpec, type IngredientId, type LayerSource, type PanSpec, type PotSpec,
} from '../data';
import { blitContain, type GameAssets } from './assets';

const POT_SPEC = DISHES['ninefathom-chowder'].spec as PotSpec;
const GLASS_SPEC = DISHES.fogcutter.spec as GlassSpec;
const PAN_SPEC = DISHES['squall-rolls'].spec as PanSpec;

const LAYER_COLOR: Record<LayerSource, string> = {
  brine: P.lightning,
  tea: P.tide,
  cream: P.cream,
};

export interface DrawOpts {
  /** Seconds since mount (frozen to 0 when reduced motion is on). */
  t: number;
  reducedMotion: boolean;
  weather: WeatherState;
  assets: GameAssets | null;
}

export function drawGalley(ctx: CanvasRenderingContext2D, view: StageView, sim: Sim, opts: DrawOpts): void {
  const L = sim.layout;
  const { vw, vh } = view;
  const { t, reducedMotion, assets } = opts;
  const bg = view.aspect >= 1 ? assets?.bgLandscape : assets?.bgPortrait;

  if (bg) {
    ctx.drawImage(bg, 0, 0, vw, vh);
  } else {
    drawVectorRoom(ctx, vw, vh);
  }

  drawPortholeRain(ctx, L, t, reducedMotion, !bg);
  drawLanternLight(ctx, L, t, reducedMotion, !bg);

  if (!bg) {
    const sway = reducedMotion ? 0 : Math.sin(t * 1.1) * 6;
    ctx.strokeStyle = rgba(P.fog, 0.45);
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, 26);
    ctx.quadraticCurveTo(vw / 2, 44 + sway, vw, 24);
    ctx.stroke();
  }

  /* ── Stations ── */
  for (const [ing, rect] of Object.entries(L.bins)) {
    drawBin(ctx, rect, ing as IngredientId, assets);
  }
  drawBoard(ctx, L, sim, t, reducedMotion, assets);
  drawButterstone(ctx, L, sim, t, reducedMotion);
  drawStovePot(ctx, L, sim, t, reducedMotion, assets);
  drawKettle(ctx, L, sim, assets);
  drawPan(ctx, L, sim, t, reducedMotion, assets);
  drawDrinks(ctx, L, sim, t, reducedMotion, assets);
  drawPass(ctx, L, sim, t, reducedMotion, !bg);

  drawFx(ctx, sim, assets);

  /* ── Carried item ghost + valid-target glow ── */
  if (sim.carry) {
    const c = sim.carry;
    let target: Rect | null = null;
    if (c.dish) target = L.pass;
    else if (c.ing && c.processed) target = INGREDIENTS[c.ing].foldSlaps ? L.pan : L.pot;
    else if (c.ing) target = L.board;
    if (target) {
      const pulse = reducedMotion ? 0.55 : 0.4 + 0.25 * Math.sin(t * 6);
      ctx.strokeStyle = rgba(P.lightning, pulse);
      ctx.lineWidth = 4;
      ctx.strokeRect(target.x - 6, target.y - 6, target.w + 12, target.h + 12);
    }
    ctx.fillStyle = rgba(P.charcoal, 0.35);
    ellipse(ctx, c.pos.x, c.pos.y + 30, 30, 9);
    if (c.dish) drawDish(ctx, c.dish, c.pos.x, c.pos.y, 1, assets);
    else if (c.ing) drawIngredient(ctx, c.ing, c.processed, c.pos.x, c.pos.y, 1, assets);
    if (!c.held) {
      ctx.strokeStyle = rgba(P.cream, 0.8);
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(c.pos.x, c.pos.y, 40, 0, Math.PI * 2);
      ctx.stroke();
    }
  }

  /* ── Weather tint: one composite pass ── */
  const tint = WEATHER_TINT[opts.weather];
  if (tint.alpha > 0) {
    ctx.fillStyle = rgba(tint.color, tint.alpha);
    ctx.fillRect(0, 0, vw, vh);
  }

  /* ── Paper grain ── */
  const grain = getGrainPattern(ctx);
  if (grain) {
    ctx.save();
    ctx.globalAlpha = 0.045;
    ctx.fillStyle = grain;
    ctx.fillRect(0, 0, vw, vh);
    ctx.restore();
  }
}

/* ── Room pieces ────────────────────────────────────────────────────── */

function drawVectorRoom(ctx: CanvasRenderingContext2D, vw: number, vh: number): void {
  ctx.fillStyle = P.slate;
  ctx.fillRect(0, 0, vw, vh);
  ctx.fillStyle = rgba(P.charcoal, 0.22);
  const courseH = 46;
  for (let row = 0; row * courseH < vh * 0.62; row++) {
    const y = row * courseH;
    for (let i = 0; i < 6; i++) {
      const w = 90 + ((i * 37 + row * 53) % 70);
      const x = ((i * 229 + row * 131) % (vw + 200)) - 100;
      ctx.fillRect(x, y, w, courseH - 6);
    }
  }
  const floorY = vh * 0.62;
  ctx.fillStyle = P.charcoal;
  ctx.fillRect(0, floorY, vw, vh - floorY);
  ctx.fillStyle = rgba(P.slate, 0.5);
  for (let i = 0; i < 7; i++) ctx.fillRect(0, floorY + 26 + i * 44, vw, 3);
}

function drawPortholeRain(ctx: CanvasRenderingContext2D, L: GalleyLayout, t: number, rm: boolean, vector: boolean): void {
  const { x, y, r } = L.porthole;
  if (vector) {
    ctx.fillStyle = P.harbor;
    circle(ctx, x, y, r + 14);
    ctx.fillStyle = P.charcoal;
    circle(ctx, x, y, r);
    ctx.save();
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.clip();
    ctx.fillStyle = P.kelp;
    const swell = rm ? 0 : Math.sin(t * 0.9) * 6;
    ctx.fillRect(x - r, y + r * 0.25 + swell, r * 2, r);
    ctx.restore();
    ctx.fillStyle = P.slate;
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      circle(ctx, x + Math.cos(a) * (r + 7), y + Math.sin(a) * (r + 7), 4);
    }
  }
  ctx.save();
  ctx.beginPath();
  ctx.arc(x, y, r * 0.94, 0, Math.PI * 2);
  ctx.clip();
  ctx.strokeStyle = rgba(P.lightning, 0.35);
  ctx.lineWidth = 2;
  const drift = rm ? 0 : (t * 160) % 48;
  for (let i = -3; i < 6; i++) {
    const rx = x - r + i * 42 + drift;
    ctx.beginPath();
    ctx.moveTo(rx, y - r);
    ctx.lineTo(rx - 26, y + r);
    ctx.stroke();
  }
  ctx.restore();
}

function drawLanternLight(ctx: CanvasRenderingContext2D, L: GalleyLayout, t: number, rm: boolean, vector: boolean): void {
  const { x, y } = L.lantern;
  const flicker = rm ? 1 : 0.92 + 0.08 * Math.sin(t * 7.3);
  ctx.fillStyle = rgba(P.amber, (vector ? 0.07 : 0.05) * flicker);
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x - 300, y + 560);
  ctx.lineTo(x + 260, y + 560);
  ctx.closePath();
  ctx.fill();
  if (vector) {
    ctx.fillStyle = P.charcoal;
    ctx.fillRect(x - 4, y - 46, 8, 30);
    ctx.fillRect(x - 22, y - 18, 44, 54);
    ctx.fillStyle = rgba(P.amber, flicker);
    ctx.fillRect(x - 14, y - 10, 28, 38);
    ctx.fillStyle = P.butter;
    circle(ctx, x, y + 9, 8);
  }
}

/* ── Stations ───────────────────────────────────────────────────────── */

function drawBin(ctx: CanvasRenderingContext2D, r: Rect, ing: IngredientId, assets: GameAssets | null): void {
  const crate = assets?.sprites['prop-crate'];
  if (crate) {
    blitContain(ctx, crate, r.x, r.y, r.w, r.h);
  } else {
    ctx.fillStyle = P.kelp;
    ctx.fillRect(r.x, r.y, r.w, r.h);
    ctx.fillStyle = P.tide;
    ctx.fillRect(r.x, r.y, r.w, 12);
  }
  drawIngredient(ctx, ing, false, r.x + r.w / 2, r.y + r.h / 2 - 2, 0.8, assets);
  label(ctx, INGREDIENTS[ing].name.split(' ')[1] ?? INGREDIENTS[ing].name, r.x + r.w / 2, r.y + r.h + 18);
}

function drawBoard(
  ctx: CanvasRenderingContext2D,
  L: GalleyLayout,
  sim: Sim,
  t: number,
  rm: boolean,
  assets: GameAssets | null,
): void {
  const r = L.board;
  const sprite = assets?.sprites['prop-board'];
  if (sprite) {
    blitContain(ctx, sprite, r.x, r.y, r.w, r.h);
  } else {
    ctx.fillStyle = P.harbor;
    ctx.fillRect(r.x, r.y, r.w, r.h - 18);
    ctx.fillStyle = P.slate;
    ctx.fillRect(r.x, r.y + r.h - 18, r.w, 18);
  }
  label(ctx, 'BOARD', r.x + r.w / 2, r.y + r.h + 16);

  const b = sim.board;
  if (!b) return;
  const c = { x: r.x + r.w / 2, y: r.y + r.h * 0.42 };
  drawIngredient(ctx, b.ing, b.done, c.x, c.y, 1.02, assets);
  if (!b.done) {
    for (let i = 0; i < b.strokesNeeded; i++) {
      ctx.fillStyle = i < b.strokesDone ? P.lightning : rgba(P.charcoal, 0.55);
      circle(ctx, r.x + 16 + i * 16, r.y - 10, 5);
    }
    if (b.mode === 'chop') {
      const wig = rm ? 0 : Math.sin(t * 5) * 8;
      ctx.strokeStyle = rgba(P.lightning, 0.5);
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(c.x - 40 + wig, c.y + 26);
      ctx.lineTo(c.x + 40 + wig, c.y + 20);
      ctx.stroke();
    } else {
      // Fold hint: two little down-arrows, alternating sides.
      const bob = rm ? 0 : Math.sin(t * 4) * 5;
      ctx.fillStyle = rgba(P.lightning, 0.7);
      for (const side of [-1, 1]) {
        const ax = c.x + side * 34;
        const ay = c.y - 34 + (side === -1 ? bob : -bob);
        ctx.beginPath();
        ctx.moveTo(ax - 7, ay);
        ctx.lineTo(ax + 7, ay);
        ctx.lineTo(ax, ay + 12);
        ctx.closePath();
        ctx.fill();
      }
    }
  } else {
    ctx.font = '700 12px ui-rounded, system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = rgba(P.cream, 0.9);
    ctx.fillText(INGREDIENTS[b.ing].foldSlaps ? '→ pan' : '→ pot', c.x, r.y - 8);
  }
}

function drawButterstone(ctx: CanvasRenderingContext2D, L: GalleyLayout, sim: Sim, t: number, rm: boolean): void {
  const r = L.butterstone;
  // Butter hard as flint: a butter-colored block with a shaved fog facet.
  ctx.fillStyle = P.butter;
  ctx.fillRect(r.x, r.y + r.h * 0.3, r.w, r.h * 0.7);
  ctx.fillStyle = rgba(P.cream, 0.9);
  ctx.beginPath();
  ctx.moveTo(r.x, r.y + r.h * 0.3);
  ctx.lineTo(r.x + r.w * 0.72, r.y);
  ctx.lineTo(r.x + r.w, r.y + r.h * 0.3);
  ctx.closePath();
  ctx.fill();
  // Curl pips + a come-hither pulse when a finished chowder wants garnish.
  for (let i = 0; i < 3; i++) {
    ctx.fillStyle = i < sim.pot.curls ? P.butter : rgba(P.charcoal, 0.55);
    circle(ctx, r.x + 10 + i * 14, r.y - 10, 4);
  }
  if (sim.pot.ready && sim.pot.curls < 3) {
    const pulse = rm ? 0.5 : 0.3 + 0.3 * Math.sin(t * 5);
    ctx.strokeStyle = rgba(P.butter, pulse);
    ctx.lineWidth = 3;
    ctx.strokeRect(r.x - 3, r.y - 3, r.w + 6, r.h + 6);
  }
  label(ctx, 'BUTTERSTONE', r.x + r.w / 2, r.y + r.h + 16);
}

function drawStovePot(
  ctx: CanvasRenderingContext2D,
  L: GalleyLayout,
  sim: Sim,
  t: number,
  rm: boolean,
  assets: GameAssets | null,
): void {
  const r = L.pot;
  const cx = r.x + r.w / 2;
  const pot = sim.pot;
  const sprite = assets?.sprites['prop-pot'];

  const flame = rm ? 0.8 : 0.65 + 0.35 * Math.abs(Math.sin(t * 5.1));
  ctx.fillStyle = rgba(P.ember, flame * 0.9);
  ctx.fillRect(r.x + r.w * 0.2, r.y + r.h - 12, r.w * 0.6, 7);

  let mouth: { cx: number; cy: number; rx: number; ry: number };
  if (sprite) {
    const bx = r.x + 6, by = r.y + 10, bw = r.w - 12, bh = r.h - 22;
    const s = Math.min(bw / sprite.width, bh / sprite.height);
    const dw = sprite.width * s, dh = sprite.height * s;
    const dx = bx + (bw - dw) / 2, dy = by + bh - dh;
    blitContain(ctx, sprite, bx, by, bw, bh);
    mouth = { cx: dx + dw * 0.5, cy: dy + dh * 0.2, rx: dw * 0.32, ry: dh * 0.1 };
  } else {
    const potTop = r.y + 46;
    ctx.fillStyle = P.charcoal;
    ctx.fillRect(r.x + 10, r.y + r.h - 44, r.w - 20, 44);
    ctx.fillStyle = P.ember;
    ctx.fillRect(r.x + 22, potTop, r.w - 44, r.h - 96);
    ctx.fillStyle = P.amber;
    ctx.fillRect(r.x + 14, potTop - 12, r.w - 28, 16);
    mouth = { cx, cy: potTop + 10, rx: (r.w - 60) / 2, ry: 14 };
  }

  if (pot.fill > 0 || pot.contents.length > 0) {
    ctx.save();
    ctx.beginPath();
    ctx.ellipse(mouth.cx, mouth.cy, mouth.rx, mouth.ry, 0, 0, Math.PI * 2);
    ctx.clip();
    if (pot.fill > 0) {
      ctx.fillStyle = P.cream;
      const grow = 0.45 + 0.55 * pot.fill;
      ctx.beginPath();
      ctx.ellipse(mouth.cx, mouth.cy + mouth.ry * (1 - pot.fill) * 0.5, mouth.rx * grow, mouth.ry * grow, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    pot.contents.forEach((c, i) => {
      const bob = rm ? 0 : Math.sin(t * 2 + i * 2.4) * 2;
      drawIngredient(ctx, c.ing, true, mouth.cx + (i - (pot.contents.length - 1) / 2) * mouth.rx * 0.75, mouth.cy + bob, 0.32, assets);
    });
    ctx.restore();
  }

  drawGauge(ctx, r.x - 24, r.y + 14, r.h * 0.62, pot.fill, POT_SPEC.pourBand);

  if (pot.pourCommitted && !pot.ready) {
    const ghostA = rm ? 0 : t * ((STIR_TEMPO[0] + STIR_TEMPO[1]) / 2);
    ctx.strokeStyle = rgba(P.lightning, 0.55);
    ctx.lineWidth = 3;
    ctx.setLineDash([10, 12]);
    ctx.beginPath();
    ctx.ellipse(mouth.cx, mouth.cy, mouth.rx * 0.8, mouth.ry * 1.6, 0, ghostA, ghostA + Math.PI * 1.5);
    ctx.stroke();
    ctx.setLineDash([]);
    const sa = pot.stirAngle;
    ctx.strokeStyle = P.butter;
    ctx.lineWidth = 7;
    ctx.beginPath();
    ctx.moveTo(mouth.cx, mouth.cy - 26);
    ctx.lineTo(mouth.cx + Math.cos(sa) * mouth.rx * 0.7, mouth.cy + Math.sin(sa) * mouth.ry * 1.4);
    ctx.stroke();
  }
  if (pot.pourCommitted) {
    for (let i = 0; i < POT_SPEC.stirRevs; i++) {
      ctx.fillStyle = i < pot.revs ? P.butter : rgba(P.charcoal, 0.6);
      circle(ctx, r.x + 8 + i * 18, r.y + r.h + 8, 5);
    }
  }
  if (pot.ready) {
    readyPulse(ctx, r, t, rm);
    drawDish(ctx, 'ninefathom-chowder', cx, r.y - 26, 1, assets);
  }
  label(ctx, 'POT', cx, r.y + r.h + 24);
}

function drawKettle(ctx: CanvasRenderingContext2D, L: GalleyLayout, sim: Sim, assets: GameAssets | null): void {
  const r = L.kettle;
  const sprite = assets?.sprites['prop-kettle'];
  if (sprite) blitContain(ctx, sprite, r.x, r.y, r.w, r.h);
  else {
    ctx.fillStyle = P.harbor;
    ctx.fillRect(r.x + 14, r.y + 34, r.w - 28, r.h - 52);
    ctx.fillStyle = P.fog;
    ctx.fillRect(r.x + 22, r.y + 22, r.w - 44, 16);
  }
  if (sim.pouring?.target === 'pot') {
    ctx.fillStyle = rgba(P.fog, 0.9);
    const potRim = L.pot.y + L.pot.h * 0.32;
    ctx.fillRect(r.x - 10, r.y + r.h * 0.42, 7, Math.max(potRim - (r.y + r.h * 0.42), 10));
  }
  label(ctx, 'HOLD TO POUR', r.x + r.w / 2, r.y + r.h + 16);
}

function drawPan(
  ctx: CanvasRenderingContext2D,
  L: GalleyLayout,
  sim: Sim,
  t: number,
  rm: boolean,
  assets: GameAssets | null,
): void {
  const r = L.pan;
  const cx = r.x + r.w / 2;
  const pan = sim.pan;
  const sprite = assets?.sprites['prop-pan'];

  if (sprite) blitContain(ctx, sprite, r.x, r.y, r.w, r.h);
  else {
    ctx.fillStyle = P.charcoal;
    ellipse(ctx, cx, r.y + r.h * 0.55, r.w * 0.42, r.h * 0.3);
    ctx.fillRect(r.x + r.w - 14, r.y + r.h * 0.45, 26, 10);
  }

  if (pan.stage === 'cooking') {
    // The shimmer: a breath of light that IS the flip timing window.
    const period = PAN_SPEC.shimmerPeriodMs / 1000;
    const phase = rm ? 0 : (t % period) / period;
    const inWindow = phase < PAN_SPEC.shimmerWindowMs / PAN_SPEC.shimmerPeriodMs;
    drawIngredient(ctx, PAN_SPEC.dough, true, cx, r.y + r.h * 0.42, 0.62, assets);
    if (inWindow || rm) {
      ctx.strokeStyle = rgba(P.butter, rm ? 0.6 : 0.85);
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.ellipse(cx, r.y + r.h * 0.5, r.w * 0.44, r.h * 0.34, 0, 0, Math.PI * 2);
      ctx.stroke();
    }
    for (let i = 0; i < PAN_SPEC.flips; i++) {
      ctx.fillStyle = i < pan.flips.length ? P.butter : rgba(P.charcoal, 0.6);
      circle(ctx, r.x + 10 + i * 16, r.y - 8, 5);
    }
    // Up-flick hint.
    const bob = rm ? 0 : Math.sin(t * 4) * 4;
    ctx.fillStyle = rgba(P.lightning, 0.7);
    ctx.beginPath();
    ctx.moveTo(cx + r.w * 0.36 - 6, r.y - 12 - bob);
    ctx.lineTo(cx + r.w * 0.36 + 6, r.y - 12 - bob);
    ctx.lineTo(cx + r.w * 0.36, r.y - 24 - bob);
    ctx.closePath();
    ctx.fill();
  } else if (pan.stage === 'done') {
    readyPulse(ctx, r, t, rm);
    drawDish(ctx, 'squall-rolls', cx, r.y - 20, 0.9, assets);
  }
  label(ctx, 'PAN', cx, r.y + r.h + 16);
}

function drawDrinks(
  ctx: CanvasRenderingContext2D,
  L: GalleyLayout,
  sim: Sim,
  t: number,
  rm: boolean,
  assets: GameAssets | null,
): void {
  const g = L.glass;
  const glassSprite = assets?.sprites['prop-glass'];

  // Bottles.
  const bottleSprite: Record<LayerSource, keyof GameAssets['sprites']> = {
    brine: 'bottle-brine',
    tea: 'bottle-tea',
    cream: 'bottle-cream',
  };
  for (const source of Object.keys(L.bottles) as LayerSource[]) {
    const br = L.bottles[source];
    const sp = assets?.sprites[bottleSprite[source]];
    if (sp) blitContain(ctx, sp, br.x, br.y, br.w, br.h);
    else {
      ctx.fillStyle = LAYER_COLOR[source];
      ctx.fillRect(br.x + 10, br.y + 18, br.w - 20, br.h - 24);
    }
    // Next-layer cue: the bottle the drink wants glows.
    const idx = sim.glass.layers.length;
    const expected = GLASS_SPEC.layers[idx]?.source;
    if (!sim.glass.ready && expected === source) {
      const pulse = rm ? 0.5 : 0.35 + 0.3 * Math.sin(t * 5);
      ctx.strokeStyle = rgba(P.lightning, pulse);
      ctx.lineWidth = 3;
      ctx.strokeRect(br.x - 3, br.y - 3, br.w + 6, br.h + 6);
    }
  }

  // Pour stream bottle → glass.
  if (sim.pouring?.target === 'glass') {
    const src = L.bottles[sim.pouring.source];
    ctx.fillStyle = rgba(LAYER_COLOR[sim.pouring.source], 0.9);
    const x0 = src.x + src.w * 0.2;
    ctx.fillRect(x0, src.y + src.h * 0.5, 6, Math.max(g.y - (src.y + src.h * 0.5) + 14, 10));
  }

  // The glass itself: sprite for the vessel, procedural layers inside.
  const inner: Rect = { x: g.x + g.w * 0.16, y: g.y + g.h * 0.08, w: g.w * 0.68, h: g.h * 0.84 };
  if (glassSprite) blitContain(ctx, glassSprite, g.x, g.y, g.w, g.h);
  else {
    ctx.strokeStyle = rgba(P.fog, 0.8);
    ctx.lineWidth = 3;
    ctx.strokeRect(g.x + 4, g.y, g.w - 8, g.h);
  }
  let prevTop = inner.y + inner.h;
  sim.glass.layers.forEach((layer) => {
    const topY = inner.y + inner.h * (1 - layer.fill);
    ctx.fillStyle = rgba(LAYER_COLOR[layer.source], layer.source === 'cream' ? 0.95 : 0.8);
    ctx.fillRect(inner.x, topY, inner.w, prevTop - topY);
    prevTop = topY;
  });
  // Live pour preview above the committed layers.
  if (sim.pouring?.target === 'glass' && sim.glass.fill > 0) {
    const topY = inner.y + inner.h * (1 - sim.glass.fill);
    ctx.fillStyle = rgba(LAYER_COLOR[sim.pouring.source], 0.55);
    ctx.fillRect(inner.x, topY, inner.w, Math.max(prevTop - topY, 0));
  }
  if (sim.glass.murky) {
    ctx.fillStyle = rgba(P.harbor, 0.35);
    ctx.fillRect(inner.x, inner.y, inner.w, inner.h);
  }
  // Settle shimmer: a thin bright line on the newest layer while it rests.
  if (!rm && sim.glass.layers.length > 0 && sim.now < sim.glass.settleUntil) {
    ctx.fillStyle = rgba(P.lightning, 0.7);
    ctx.fillRect(inner.x, prevTop, inner.w, 2);
  }
  // Band guide for the current pour.
  const idx = sim.glass.layers.length;
  const spec = GLASS_SPEC.layers[idx];
  if (spec && !sim.glass.ready) {
    const settledFill = sim.glass.layers.length ? sim.glass.layers[sim.glass.layers.length - 1].fill : 0;
    drawGauge(ctx, g.x - 18, g.y + 4, g.h - 8, sim.pouring?.target === 'glass' ? sim.glass.fill : settledFill, spec.band);
  }
  if (sim.glass.ready) readyPulse(ctx, g, t, rm);
  label(ctx, 'FOGCUTTER', g.x + g.w / 2, g.y + g.h + 16);
}

function drawPass(ctx: CanvasRenderingContext2D, L: GalleyLayout, sim: Sim, t: number, rm: boolean, vector: boolean): void {
  const r = L.pass;
  if (vector) {
    ctx.fillStyle = P.charcoal;
    ctx.fillRect(r.x - 10, r.y - 10, r.w + 20, r.h + 20);
    ctx.fillStyle = rgba(P.amber, 0.28);
    ctx.fillRect(r.x, r.y, r.w, r.h);
  }
  ctx.fillStyle = P.butter;
  ctx.beginPath();
  ctx.arc(r.x + r.w / 2, r.y + r.h - 30, 12, Math.PI, 0);
  ctx.fill();
  ctx.fillRect(r.x + r.w / 2 - 14, r.y + r.h - 30, 28, 4);

  if (sim.carry?.dish) {
    const pulse = rm ? 0.6 : 0.4 + 0.3 * Math.sin(t * 5);
    ctx.strokeStyle = rgba(P.butter, pulse);
    ctx.lineWidth = 5;
    ctx.strokeRect(r.x - 4, r.y - 4, r.w + 8, r.h + 8);
  }
  label(ctx, 'THE PASS', r.x + r.w / 2, r.y + r.h + 18);
}

function drawFx(ctx: CanvasRenderingContext2D, sim: Sim, assets: GameAssets | null): void {
  for (const f of sim.fx) {
    const age = (sim.now - f.born) / f.ttl;
    if (age < 0 || age > 1) continue;
    if (f.kind === 'puff') {
      ctx.fillStyle = rgba(P.fog, 0.5 * (1 - age));
      circle(ctx, f.p.x, f.p.y - age * 18, 10 + age * 26);
    } else if (f.kind === 'ring') {
      ctx.strokeStyle = rgba(P.lightning, 0.7 * (1 - age));
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(f.p.x, f.p.y, 20 + age * 46, 0, Math.PI * 2);
      ctx.stroke();
    } else if (f.kind === 'spark') {
      ctx.strokeStyle = rgba(P.lightning, 0.9 * (1 - age));
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(f.p.x - 18 + age * 8, f.p.y + 6);
      ctx.lineTo(f.p.x + 18 - age * 8, f.p.y - 6);
      ctx.stroke();
    } else if (f.kind === 'flip') {
      // The rolls hop: a little arc above the pan.
      const arcY = f.p.y - Math.sin(age * Math.PI) * 34;
      drawIngredient(ctx, 'stormflour-dough', true, f.p.x, arcY, 0.5, assets);
    } else if (f.kind === 'text' && f.text) {
      ctx.font = '800 20px ui-rounded, system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillStyle = rgba(P.cream, 1 - age);
      ctx.fillText(f.text, f.p.x, f.p.y - 24 - age * 26);
    }
  }
}

/* ── Food ───────────────────────────────────────────────────────────── */

const ING_SPRITE: Record<IngredientId, { raw: keyof GameAssets['sprites']; done: keyof GameAssets['sprites'] }> = {
  'grumbling-potato': { raw: 'ing-potato-raw', done: 'ing-potato-chopped' },
  wrackfish: { raw: 'ing-fish-raw', done: 'ing-fish-chopped' },
  'stormflour-dough': { raw: 'ing-dough-ball', done: 'ing-dough-folded' },
};

export function drawIngredient(
  ctx: CanvasRenderingContext2D,
  ing: IngredientId,
  processed: boolean,
  x: number,
  y: number,
  s: number,
  assets: GameAssets | null = null,
): void {
  const img = assets?.sprites[processed ? ING_SPRITE[ing].done : ING_SPRITE[ing].raw];
  if (img) {
    const box = 76 * s;
    blitContain(ctx, img, x - box / 2, y - box / 2, box, box, false);
    return;
  }
  // Vector fallbacks.
  if (ing === 'grumbling-potato') {
    ctx.fillStyle = P.butter;
    if (!processed) ellipse(ctx, x, y, 30 * s, 22 * s);
    else for (let i = 0; i < 4; i++) {
      const a = (i / 4) * Math.PI * 2 + 0.5;
      ellipse(ctx, x + Math.cos(a) * 16 * s, y + Math.sin(a) * 10 * s, 11 * s, 8 * s);
    }
    return;
  }
  if (ing === 'wrackfish') {
    ctx.fillStyle = processed ? P.cream : P.fog;
    if (!processed) ellipse(ctx, x, y, 34 * s, 14 * s);
    else for (let i = 0; i < 3; i++) ctx.fillRect(x - 24 * s + i * 18 * s, y - 8 * s, 13 * s, 16 * s);
    return;
  }
  // Dough.
  ctx.fillStyle = P.cream;
  if (!processed) ellipse(ctx, x, y, 24 * s, 20 * s);
  else {
    ctx.fillRect(x - 22 * s, y - 6 * s, 44 * s, 14 * s);
    ctx.fillRect(x - 16 * s, y - 14 * s, 32 * s, 10 * s);
  }
}

export function drawDish(
  ctx: CanvasRenderingContext2D,
  dish: DishId,
  x: number,
  y: number,
  s: number,
  assets: GameAssets | null = null,
): void {
  const spriteId: keyof GameAssets['sprites'] =
    dish === 'ninefathom-chowder' ? 'dish-chowder' : dish === 'fogcutter' ? 'dish-fogcutter' : 'dish-rolls';
  const img = assets?.sprites[spriteId];
  if (img) {
    const box = 84 * s;
    blitContain(ctx, img, x - box / 2, y - box / 2, box, box, false);
    return;
  }
  if (dish === 'ninefathom-chowder') {
    ctx.fillStyle = P.harbor;
    ctx.beginPath();
    ctx.arc(x, y, 26 * s, 0, Math.PI);
    ctx.fill();
    ctx.fillStyle = P.cream;
    ellipse(ctx, x, y, 26 * s, 8 * s);
  } else if (dish === 'fogcutter') {
    ctx.fillStyle = LAYER_COLOR.brine;
    ctx.fillRect(x - 12 * s, y + 6 * s, 24 * s, 12 * s);
    ctx.fillStyle = LAYER_COLOR.tea;
    ctx.fillRect(x - 12 * s, y - 6 * s, 24 * s, 12 * s);
    ctx.fillStyle = LAYER_COLOR.cream;
    ctx.fillRect(x - 12 * s, y - 18 * s, 24 * s, 12 * s);
  } else {
    ctx.fillStyle = P.butter;
    for (let i = 0; i < 3; i++) circle(ctx, x - 16 * s + i * 16 * s, y, 10 * s);
  }
}

/* ── Shared bits ────────────────────────────────────────────────────── */

function drawGauge(ctx: CanvasRenderingContext2D, x: number, y: number, h: number, fill: number, band: [number, number]): void {
  ctx.fillStyle = rgba(P.charcoal, 0.85);
  ctx.fillRect(x - 4, y - 4, 22, h + 8);
  ctx.fillStyle = rgba(P.slate, 0.9);
  ctx.fillRect(x, y, 14, h);
  ctx.fillStyle = rgba(P.lightning, 0.9);
  ctx.fillRect(x, y + h * (1 - band[1]), 14, h * (band[1] - band[0]));
  ctx.fillStyle = P.cream;
  ctx.fillRect(x - 3, y + h * (1 - fill) - 2, 20, 4);
}

function readyPulse(ctx: CanvasRenderingContext2D, r: Rect, t: number, rm: boolean): void {
  const pulse = rm ? 0.5 : 0.35 + 0.25 * Math.sin(t * 4);
  ctx.strokeStyle = rgba(P.amber, pulse);
  ctx.lineWidth = 6;
  ctx.strokeRect(r.x - 2, r.y - 2, r.w + 4, r.h + 4);
}

function label(ctx: CanvasRenderingContext2D, text: string, x: number, y: number): void {
  ctx.font = '700 13px ui-rounded, system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillStyle = rgba(P.fog, 0.8);
  ctx.strokeStyle = rgba(P.charcoal, 0.7);
  ctx.lineWidth = 3;
  ctx.strokeText(text, x, y);
  ctx.fillText(text, x, y);
}

let grainPattern: CanvasPattern | null | undefined;

/** Deterministic little noise tile (LCG) — the §1.2 paper grain, no asset needed. */
function getGrainPattern(ctx: CanvasRenderingContext2D): CanvasPattern | null {
  if (grainPattern !== undefined) return grainPattern;
  const size = 96;
  const off = document.createElement('canvas');
  off.width = size;
  off.height = size;
  const octx = off.getContext('2d');
  if (!octx) {
    grainPattern = null;
    return null;
  }
  const img = octx.createImageData(size, size);
  let seed = 0x9e3779b9;
  for (let i = 0; i < img.data.length; i += 4) {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    const v = seed & 255;
    img.data[i] = img.data[i + 1] = img.data[i + 2] = v;
    img.data[i + 3] = 255;
  }
  octx.putImageData(img, 0, 0);
  grainPattern = ctx.createPattern(off, 'repeat');
  return grainPattern;
}

function circle(ctx: CanvasRenderingContext2D, x: number, y: number, r: number): void {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
}

function ellipse(ctx: CanvasRenderingContext2D, x: number, y: number, rx: number, ry: number): void {
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
  ctx.fill();
}
