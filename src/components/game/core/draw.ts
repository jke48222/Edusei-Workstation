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
  assets: GameAssets | null;
}

const WEATHER_ANGLE: Record<WeatherState, number> = {
  fair: -1.1,
  fresh: -0.5,
  squall: 0.1,
  gale: 0.65,
  century: 1.15,
};

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
  drawBarometer(ctx, L, sim, t, reducedMotion);
  drawShutterAndGust(ctx, L, sim, t, reducedMotion);

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
  drawDumbwaiter(ctx, L, sim, t, reducedMotion, assets);
  drawToastSpot(ctx, L, sim, t, reducedMotion, assets);
  drawPass(ctx, L, sim, t, reducedMotion, !bg);

  // The puddle lies on the open floor IN FRONT of the stations — it must read.
  drawLeak(ctx, sim, t, reducedMotion);

  drawGulls(ctx, L, sim, t, reducedMotion, assets);

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

  /* ── Flying tickets (catch them!) ── */
  for (const f of sim.flying) {
    const age = (sim.now - f.born) / 1000;
    ctx.save();
    ctx.translate(f.p.x, f.p.y);
    ctx.rotate(reducedMotion ? 0.1 : Math.sin(sim.now / 130 + f.ticketId) * 0.4);
    ctx.fillStyle = P.cream;
    ctx.fillRect(-26, -18, 52, 36);
    ctx.fillStyle = rgba(P.charcoal, 0.5);
    ctx.fillRect(-18, -8, 36, 3);
    ctx.fillRect(-18, 0, 28, 3);
    ctx.restore();
    // Catch countdown ring.
    ctx.strokeStyle = rgba(P.alert, 0.85);
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(f.p.x, f.p.y, 34, -Math.PI / 2, -Math.PI / 2 + (1 - age / 2.2) * Math.PI * 2);
    ctx.stroke();
  }

  /* ── Dropped food on the floor ── */
  for (const item of sim.floorItems) {
    const left = (item.despawnAt - sim.now) / 1000;
    ctx.fillStyle = rgba(P.charcoal, 0.4);
    ellipse(ctx, item.p.x, item.p.y + 22, 30, 8);
    if (item.dish) drawDish(ctx, item.dish, item.p.x, item.p.y, 0.8, assets);
    else if (item.ing) drawIngredient(ctx, item.ing, item.processed, item.p.x, item.p.y, 0.8, assets);
    if (left < 2.5) {
      ctx.font = '800 13px ui-rounded, system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillStyle = rgba(P.alert, 0.9);
      ctx.fillText(`${Math.ceil(left)}`, item.p.x, item.p.y - 34);
    }
  }

  /* ── Blackout beat: the room drops to lantern light (doc §7.2) ── */
  if (sim.now < sim.blackoutUntil) {
    ctx.fillStyle = rgba('#06090F', reducedMotion ? 0.55 : 0.82);
    ctx.fillRect(0, 0, vw, vh);
    // The warm things survive: lantern, flame, the pass.
    const { x, y } = L.lantern;
    ctx.fillStyle = rgba(P.amber, 0.16);
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x - 320, y + 580);
    ctx.lineTo(x + 280, y + 580);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = P.amber;
    circle(ctx, x, y + 8, 10);
    ctx.fillStyle = rgba(P.ember, 0.9);
    ctx.fillRect(L.pot.x + L.pot.w * 0.2, L.pot.y + L.pot.h - 12, L.pot.w * 0.6, 7);
    ctx.fillStyle = rgba(P.amber, 0.2);
    ctx.fillRect(L.pass.x, L.pass.y, L.pass.w, L.pass.h);
    // The carried thing stays visible — losing your hands in the dark is unfair.
    if (sim.carry) {
      if (sim.carry.dish) drawDish(ctx, sim.carry.dish, sim.carry.pos.x, sim.carry.pos.y, 1, assets);
      else if (sim.carry.ing) drawIngredient(ctx, sim.carry.ing, sim.carry.processed, sim.carry.pos.x, sim.carry.pos.y, 1, assets);
    }
  }

  /* ── Lightning flash ── */
  if (sim.now < sim.flashUntil && !reducedMotion) {
    ctx.fillStyle = rgba(P.lightning, 0.16);
    ctx.fillRect(0, 0, vw, vh);
    ctx.strokeStyle = rgba(P.lightning, 0.9);
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(L.porthole.x - 20, L.porthole.y - L.porthole.r);
    ctx.lineTo(L.porthole.x + 8, L.porthole.y - 10);
    ctx.lineTo(L.porthole.x - 12, L.porthole.y + 4);
    ctx.lineTo(L.porthole.x + 18, L.porthole.y + L.porthole.r * 0.8);
    ctx.stroke();
  } else if (sim.now < sim.flashUntil && reducedMotion) {
    // Non-motion equivalent: a brief cool dim instead of a hard flash.
    ctx.fillStyle = rgba(P.lightning, 0.08);
    ctx.fillRect(0, 0, vw, vh);
  }

  /* ── Weather tint: one composite pass, driven by the sim's live state ── */
  const tint = WEATHER_TINT[sim.weather];
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

/* ── Weather instruments & events ───────────────────────────────────── */

function drawBarometer(ctx: CanvasRenderingContext2D, L: GalleyLayout, sim: Sim, t: number, rm: boolean): void {
  const bx = L.porthole.x - L.porthole.r - 58;
  const by = L.porthole.y - 26;
  ctx.fillStyle = P.charcoal;
  circle(ctx, bx, by, 26);
  ctx.fillStyle = P.slate;
  circle(ctx, bx, by, 22);
  // Dial arc: calm → storm.
  ctx.strokeStyle = rgba(P.lightning, 0.6);
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(bx, by, 16, Math.PI * 0.75, Math.PI * 2.25);
  ctx.stroke();
  // The needle points at what's COMING (the forecast is the contract, §7.1).
  const target = WEATHER_ANGLE[sim.barometer];
  const wobble = rm ? 0 : Math.sin(t * 3.1) * 0.05;
  const a = -Math.PI / 2 + target + wobble;
  ctx.strokeStyle = sim.barometer === 'fair' || sim.barometer === 'fresh' ? P.cream : P.alert;
  ctx.lineWidth = 3.5;
  ctx.beginPath();
  ctx.moveTo(bx, by);
  ctx.lineTo(bx + Math.cos(a) * 17, by + Math.sin(a) * 17);
  ctx.stroke();
  ctx.fillStyle = P.butter;
  circle(ctx, bx, by, 3);
  label(ctx, 'BAROMETER', bx, by + 44);
}

function drawShutterAndGust(ctx: CanvasRenderingContext2D, L: GalleyLayout, sim: Sim, t: number, rm: boolean): void {
  const { x, y, r } = L.porthole;
  const closed = sim.shiftT < sim.shutterClosedUntilShiftT;
  if (closed) {
    // Storm shutter: three battened planks over the glass.
    ctx.save();
    ctx.beginPath();
    ctx.arc(x, y, r + 4, 0, Math.PI * 2);
    ctx.clip();
    for (let i = 0; i < 3; i++) {
      ctx.fillStyle = i % 2 ? P.kelp : P.tide;
      ctx.fillRect(x - r - 6, y - r + (i * 2 * r) / 3, r * 2 + 12, (2 * r) / 3 - 4);
    }
    ctx.restore();
    ctx.fillStyle = P.charcoal;
    ctx.fillRect(x - 14, y + r - 2, 28, 12); // latch
    return;
  }
  // Gust telegraph: whistle streaks + a pull-down hint on the porthole.
  if (sim.now < sim.gustTelegraphUntil) {
    const pulse = rm ? 0.7 : 0.4 + 0.4 * Math.sin(t * 10);
    ctx.strokeStyle = rgba(P.alert, pulse);
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(x, y, r + 10, 0, Math.PI * 2);
    ctx.stroke();
    ctx.strokeStyle = rgba(P.lightning, 0.7);
    ctx.lineWidth = 3;
    for (let i = 0; i < 3; i++) {
      const wy = 40 + i * 16;
      const drift = rm ? 0 : (t * 320) % 200;
      ctx.beginPath();
      ctx.moveTo(-40 + drift + i * 90, wy);
      ctx.lineTo(20 + drift + i * 90, wy);
      ctx.stroke();
    }
    // Pull-down arrow.
    ctx.fillStyle = rgba(P.cream, 0.9);
    ctx.beginPath();
    ctx.moveTo(x - 9, y - 14);
    ctx.lineTo(x + 9, y - 14);
    ctx.lineTo(x, y + 6);
    ctx.closePath();
    ctx.fill();
    label(ctx, 'PULL DOWN!', x, y + r + 24);
  }
}

function drawLeak(ctx: CanvasRenderingContext2D, sim: Sim, t: number, rm: boolean): void {
  const leak = sim.leak;
  if (!leak) return;
  const R = 36 + leak.puddle * 74;
  // Puddle: must READ on the dark floor — bright fog pool, hard sheen, ripple ring.
  ctx.fillStyle = rgba(P.fog, 0.6);
  ellipse(ctx, leak.p.x, leak.p.y, R, R * 0.34);
  ctx.fillStyle = rgba(P.lightning, 0.5);
  ellipse(ctx, leak.p.x - R * 0.22, leak.p.y - 4, R * 0.44, R * 0.11);
  const ripple = rm ? 0.5 : (t * 0.7) % 1;
  ctx.strokeStyle = rgba(P.lightning, 0.5 * (1 - ripple));
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.ellipse(leak.p.x, leak.p.y, R * (0.4 + ripple * 0.6), R * 0.34 * (0.4 + ripple * 0.6), 0, 0, Math.PI * 2);
  ctx.stroke();
  if (leak.active) {
    // The drip line from the beams.
    const phase = rm ? 0.5 : (t * 1.6) % 1;
    ctx.fillStyle = rgba(P.lightning, 0.85);
    ctx.fillRect(leak.p.x - 2, phase * (leak.p.y - 40), 4, 14);
    ctx.fillStyle = rgba(P.fog, 0.7);
    circle(ctx, leak.p.x, 8, 5);
  }
  if (leak.mopStrokes > 0) {
    for (let i = 0; i < 3; i++) {
      ctx.fillStyle = i < leak.mopStrokes ? P.lightning : rgba(P.charcoal, 0.55);
      circle(ctx, leak.p.x - 16 + i * 16, leak.p.y - R * 0.34 - 12, 4);
    }
  }
  label(ctx, 'MOP IT', leak.p.x, leak.p.y + R * 0.34 + 16);
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
    // Storm-charged brine hums (perfect pours while it glows — §7.2).
    if (source === 'brine' && sim.now < sim.chargedUntil) {
      const hum = rm ? 0.6 : 0.4 + 0.35 * Math.sin(t * 9);
      ctx.fillStyle = rgba(P.lightning, hum * 0.35);
      ellipse(ctx, br.x + br.w / 2, br.y + br.h / 2, br.w * 0.8, br.h * 0.7);
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

function drawDumbwaiter(
  ctx: CanvasRenderingContext2D,
  L: GalleyLayout,
  sim: Sim,
  t: number,
  rm: boolean,
  assets: GameAssets | null,
): void {
  const r = L.dumbwaiter;
  const sprite = assets?.sprites['prop-dumbwaiter'];
  if (sprite) blitContain(ctx, sprite, r.x, r.y, r.w, r.h);
  else {
    ctx.fillStyle = P.kelp;
    ctx.fillRect(r.x, r.y, r.w, r.h);
    ctx.fillStyle = P.charcoal;
    ctx.fillRect(r.x + 6, r.y + 8, r.w - 12, r.h - 26);
  }
  const toast = sim.toast_;
  if (toast.stage === 'docked') {
    drawDish(ctx, 'black-toast', r.x + r.w / 2, r.y + r.h * 0.4, 0.55, assets);
    // Crank progress ring.
    const frac = Math.min(toast.crankAngle / (Math.PI * 2 * 1.5), 1);
    ctx.strokeStyle = rgba(P.lightning, 0.85);
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(r.x + r.w / 2, r.y + r.h + 16, 13, -Math.PI / 2, -Math.PI / 2 + frac * Math.PI * 2);
    ctx.stroke();
    const pulse = rm ? 0.5 : 0.35 + 0.3 * Math.sin(t * 5);
    ctx.strokeStyle = rgba(P.butter, pulse);
    ctx.lineWidth = 3;
    ctx.strokeRect(r.x - 3, r.y - 3, r.w + 6, r.h + 6);
    label(ctx, 'CRANK!', r.x + r.w / 2, r.y - 8);
  } else {
    label(ctx, 'DUMBWAITER', r.x + r.w / 2, r.y + r.h + 14);
  }
}

function drawToastSpot(
  ctx: CanvasRenderingContext2D,
  L: GalleyLayout,
  sim: Sim,
  t: number,
  rm: boolean,
  assets: GameAssets | null,
): void {
  const toast = sim.toast_;
  if (toast.stage === 'idle' || toast.stage === 'docked') return;
  const r = L.toastSpot;
  const cx = r.x + r.w / 2;
  if (toast.stage === 'resting') {
    const img = assets?.sprites['ing-loaf'];
    if (img) blitContain(ctx, img, r.x, r.y, r.w, r.h);
    else {
      ctx.fillStyle = P.cream;
      ellipse(ctx, cx, r.y + r.h / 2, r.w * 0.4, r.h * 0.32);
    }
    // Char shows on the loaf itself.
    if (toast.char > 0) {
      ctx.fillStyle = rgba('#1A1410', Math.min(toast.char, 0.92));
      ellipse(ctx, cx, r.y + r.h / 2, r.w * 0.38 * (0.4 + toast.char * 0.6), r.h * 0.3 * (0.4 + toast.char * 0.6));
    }
    // Char meter: the panic cue lies early; the true band sits deeper (§4's joke).
    const gw = r.w + 20;
    const gx = r.x - 10;
    const gy = r.y - 16;
    ctx.fillStyle = rgba(P.charcoal, 0.85);
    ctx.fillRect(gx - 3, gy - 3, gw + 6, 14);
    ctx.fillStyle = rgba(P.slate, 0.95);
    ctx.fillRect(gx, gy, gw, 8);
    // Panic zone (looks like the end of the world, is not).
    ctx.fillStyle = rgba(P.alert, 0.55);
    ctx.fillRect(gx + gw * 0.62, gy, gw * 0.16, 8);
    // The true band, quiet and pale.
    ctx.fillStyle = rgba(P.lightning, 0.9);
    ctx.fillRect(gx + gw * 0.78, gy, gw * 0.14, 8);
    ctx.fillStyle = P.cream;
    ctx.fillRect(gx + gw * Math.min(toast.char, 1) - 2, gy - 2, 4, 12);
    if (toast.char > 0.6 && toast.char < 0.78) {
      const shake = rm ? 0 : Math.sin(t * 30) * 2;
      label(ctx, 'NOW?! (no.)', cx + shake, gy - 8);
    }
    label(ctx, 'HOLD TO CHAR', cx, r.y + r.h + 14);
  } else if (toast.stage === 'charred') {
    drawDish(ctx, 'black-toast', cx, r.y + r.h / 2, 0.8, assets);
    const pulse = rm ? 0.5 : 0.35 + 0.25 * Math.sin(t * 4);
    ctx.strokeStyle = rgba(P.amber, pulse);
    ctx.lineWidth = 4;
    ctx.strokeRect(r.x - 3, r.y - 3, r.w + 6, r.h + 6);
    label(ctx, '→ DUMBWAITER', cx, r.y - 8);
  }
}

function drawGulls(
  ctx: CanvasRenderingContext2D,
  L: GalleyLayout,
  sim: Sim,
  t: number,
  rm: boolean,
  assets: GameAssets | null,
): void {
  // Telegraph: a shadow sweeps the floor before the raid (the tell, §7.3).
  if (sim.now < sim.gullShadowUntil) {
    const frac = rm ? 0.5 : 1 - (sim.gullShadowUntil - sim.now) / 1400;
    const sx = L.size.w * (0.15 + frac * 0.7);
    ctx.fillStyle = rgba(P.charcoal, 0.4);
    ellipse(ctx, sx, L.size.h * 0.75, 60, 14);
    ellipse(ctx, sx + 40, L.size.h * 0.75 + 6, 34, 9);
  }

  for (const g of sim.gulls) {
    const img =
      g.state === 'pecking' ? assets?.sprites['gull-standing'] : assets?.sprites['gull-flying'];
    const flap = rm || g.state === 'pecking' ? 0 : Math.sin(t * 14 + g.id) * 5;
    if (img) {
      const box = g.state === 'pecking' ? 62 : 74;
      ctx.save();
      if (g.p.x > L.size.w / 2 && g.state !== 'pecking') {
        ctx.translate(g.p.x, g.p.y + flap);
        ctx.scale(-1, 1);
        blitContain(ctx, img, -box / 2, -box / 2, box, box, false);
      } else {
        blitContain(ctx, img, g.p.x - box / 2, g.p.y - box / 2 + flap, box, box, false);
      }
      ctx.restore();
    } else {
      ctx.fillStyle = P.cream;
      ellipse(ctx, g.p.x, g.p.y + flap, 24, 14);
      ctx.fillStyle = P.butter;
      ctx.beginPath();
      ctx.moveTo(g.p.x + 20, g.p.y + flap);
      ctx.lineTo(g.p.x + 32, g.p.y + flap + 4);
      ctx.lineTo(g.p.x + 20, g.p.y + flap + 7);
      ctx.closePath();
      ctx.fill();
    }
    if (g.state === 'pecking') {
      // Shoo countdown + tap pips.
      ctx.strokeStyle = rgba(P.alert, 0.85);
      ctx.lineWidth = 3;
      const left = 1 - (sim.now - g.peckStart) / 1800;
      ctx.beginPath();
      ctx.arc(g.p.x, g.p.y, 40, -Math.PI / 2, -Math.PI / 2 + Math.max(left, 0) * Math.PI * 2);
      ctx.stroke();
      label(ctx, 'SHOO! (tap tap)', g.p.x, g.p.y - 48);
    }
  }

  // Bosun blocks the pass like a small feathered harbor master.
  if (sim.bosunHere) {
    const r = L.pass;
    const img = assets?.sprites['bosun-gull'];
    const bx = r.x + r.w / 2;
    const by = r.y + r.h - 40;
    if (img) blitContain(ctx, img, bx - 55, by - 80, 110, 110);
    else {
      ctx.fillStyle = P.fog;
      ellipse(ctx, bx, by, 44, 30);
    }
    const left = Math.max(0, (sim.bosunUntil - sim.now) / 1000);
    label(ctx, `BOSUN — rolls or ${Math.ceil(left)}s`, bx, r.y - 10);
  }

  // Grudge ledger: chalk tallies by the pass. The gulls keep count. So should you.
  if (sim.grudge > 0) {
    const gx = L.pass.x + L.pass.w - 8;
    const gy = L.pass.y + L.pass.h + 28;
    const marks = Math.round(sim.grudge / GRUDGE_TALLY);
    ctx.strokeStyle = rgba(P.cream, 0.75);
    ctx.lineWidth = 2;
    for (let i = 0; i < marks; i++) {
      const mx = gx - i * 7 - (i % 5 === 4 ? 2 : 0);
      ctx.beginPath();
      if (i % 5 === 4) {
        ctx.moveTo(mx - 6, gy - 12);
        ctx.lineTo(mx + 8, gy);
      } else {
        ctx.moveTo(mx, gy - 12);
        ctx.lineTo(mx, gy);
      }
      ctx.stroke();
    }
  }
}

const GRUDGE_TALLY = 18;

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
    dish === 'ninefathom-chowder' ? 'dish-chowder'
    : dish === 'fogcutter' ? 'dish-fogcutter'
    : dish === 'black-toast' ? 'dish-black-toast'
    : 'dish-rolls';
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
  } else if (dish === 'black-toast') {
    ctx.fillStyle = '#1A1410';
    ctx.fillRect(x - 16 * s, y - 14 * s, 32 * s, 28 * s);
    ctx.fillStyle = P.butter;
    ellipse(ctx, x - 4 * s, y - 4 * s, 5 * s, 3 * s);
    ellipse(ctx, x + 6 * s, y + 4 * s, 4 * s, 2.6 * s);
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
