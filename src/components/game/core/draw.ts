/**
 * @file draw.ts
 * @description Canvas renderer for the galley. Generated art does the heavy lifting —
 * a full background plate per orientation plus keyed prop/ingredient sprites (loaded in
 * assets.ts) — while code keeps everything that must move or answer input: rain in the
 * porthole, lantern flicker, stove flame, pour stream, fill gauge, stir ring, progress
 * pips, carry ghosts, fx, weather tint, paper grain. Every sprite call falls back to a
 * flat-vector shape so a missing image degrades to placeholder art, never a hole.
 *
 * Pure read-only over the Sim. Reduced motion freezes phase args and drops shakes.
 */

import { P, rgba, WEATHER_TINT, type WeatherState } from '../palette';
import type { GalleyLayout } from '../layout';
import type { Rect } from './geom';
import type { Sim } from './sim';
import type { StageView } from './engine';
import { INGREDIENTS, STIR_TEMPO, type IngredientId } from '../data';
import { blitContain, type GameAssets } from './assets';

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

  /* ── Background plate (generated) or vector room (fallback) ── */
  if (bg) {
    ctx.drawImage(bg, 0, 0, vw, vh);
  } else {
    drawVectorRoom(ctx, vw, vh);
  }

  /* ── Porthole storm: animated rain over the plate ── */
  drawPortholeRain(ctx, L, t, reducedMotion, !bg);

  /* ── Lantern flicker + hard-edged light cone ── */
  drawLanternLight(ctx, L, t, reducedMotion, !bg);

  /* ── Order rope sway (vector-only; the plate has its own painted rope) ── */
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
  drawStovePot(ctx, L, sim, t, reducedMotion, assets);
  drawKettle(ctx, L, sim, assets);
  drawPass(ctx, L, sim, t, reducedMotion, !bg);

  /* ── FX ── */
  drawFx(ctx, sim);

  /* ── Carried item ghost + valid-target glow ── */
  if (sim.carry) {
    const c = sim.carry;
    const target: Rect | null = c.dish ? L.pass : c.chopped ? L.pot : L.board;
    if (target) {
      const pulse = reducedMotion ? 0.55 : 0.4 + 0.25 * Math.sin(t * 6);
      ctx.strokeStyle = rgba(P.lightning, pulse);
      ctx.lineWidth = 4;
      ctx.strokeRect(target.x - 6, target.y - 6, target.w + 12, target.h + 12);
    }
    ctx.fillStyle = rgba(P.charcoal, 0.35);
    ellipse(ctx, c.pos.x, c.pos.y + 30, 30, 9);
    if (c.dish) drawChowderBowl(ctx, c.pos.x, c.pos.y, 1, assets);
    else if (c.ing) drawIngredient(ctx, c.ing, c.chopped, c.pos.x, c.pos.y, 1, assets);
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

  /* ── Paper grain (deterministic, ~4%) ── */
  const grain = getGrainPattern(ctx);
  if (grain) {
    ctx.save();
    ctx.globalAlpha = 0.045;
    ctx.fillStyle = grain;
    ctx.fillRect(0, 0, vw, vh);
    ctx.restore();
  }
}

/* ── Vector room fallback (pre-asset placeholder look) ─────────────── */

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
  // Rain streaks (drawn over plate or vector storm alike; static dashes when rm).
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
    ctx.fillStyle = rgba(P.charcoal, 0.3);
    ctx.fillRect(r.x + 8, r.y + r.h - 14, r.w - 16, 8);
  }
  drawIngredient(ctx, ing, false, r.x + r.w / 2, r.y + r.h / 2 - 2, 0.85, assets);
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
    drawKnife(ctx, r.x + r.w - 40, r.y + 30);
  }
  label(ctx, 'BOARD', r.x + r.w / 2, r.y + r.h + 16);

  const b = sim.board;
  if (!b) return;
  const c = { x: r.x + r.w / 2, y: r.y + r.h * 0.42 };
  drawIngredient(ctx, b.ing, b.chopped, c.x, c.y, 1.05, assets);
  if (!b.chopped) {
    for (let i = 0; i < b.strokesNeeded; i++) {
      ctx.fillStyle = i < b.strokesDone ? P.lightning : rgba(P.charcoal, 0.55);
      circle(ctx, r.x + 16 + i * 16, r.y - 10, 5);
    }
    const wig = rm ? 0 : Math.sin(t * 5) * 8;
    ctx.strokeStyle = rgba(P.lightning, 0.5);
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(c.x - 40 + wig, c.y + 26);
    ctx.lineTo(c.x + 40 + wig, c.y + 20);
    ctx.stroke();
  } else {
    ctx.font = '700 12px ui-rounded, system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = rgba(P.cream, 0.9);
    ctx.fillText('→ pot', c.x, r.y - 8);
  }
}

function drawKnife(ctx: CanvasRenderingContext2D, x: number, y: number): void {
  ctx.fillStyle = P.fog;
  ctx.beginPath();
  ctx.moveTo(x - 26, y + 4);
  ctx.lineTo(x + 2, y - 4);
  ctx.lineTo(x + 2, y + 10);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = P.charcoal;
  ctx.fillRect(x + 2, y - 2, 18, 10);
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

  // Stove flame — always procedural (it must flicker with the sim, not the plate).
  const flame = rm ? 0.8 : 0.65 + 0.35 * Math.abs(Math.sin(t * 5.1));
  ctx.fillStyle = rgba(P.ember, flame * 0.9);
  ctx.fillRect(r.x + r.w * 0.2, r.y + r.h - 12, r.w * 0.6, 7);

  // The pot's mouth: derived from the sprite's actual blit box so liquid, contents and
  // stir feedback sit INSIDE the copper rim instead of floating over it.
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
    ctx.fillStyle = P.charcoal;
    ctx.fillRect(r.x + 2, potTop + 8, 14, 10);
    ctx.fillRect(r.x + r.w - 16, potTop + 8, 14, 10);
    mouth = { cx, cy: potTop + 10, rx: (r.w - 60) / 2, ry: 14 };
  }

  // Chowder surface + contents, clipped to the mouth.
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

  // Fill gauge + target band — left of the pot, backed for contrast.
  const gx = r.x - 24;
  const gy = r.y + 14;
  const gh = r.h * 0.62;
  ctx.fillStyle = rgba(P.charcoal, 0.85);
  ctx.fillRect(gx - 4, gy - 4, 22, gh + 8);
  ctx.fillStyle = rgba(P.slate, 0.9);
  ctx.fillRect(gx, gy, 14, gh);
  const band = sim.dish.pourBand;
  ctx.fillStyle = rgba(P.lightning, 0.9);
  ctx.fillRect(gx, gy + gh * (1 - band[1]), 14, gh * (band[1] - band[0]));
  ctx.fillStyle = P.cream;
  ctx.fillRect(gx - 3, gy + gh * (1 - pot.fill) - 2, 20, 4);

  // Stir feedback, centered on the mouth.
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
    for (let i = 0; i < sim.dish.stirRevs; i++) {
      ctx.fillStyle = i < pot.revs ? P.butter : rgba(P.charcoal, 0.6);
      circle(ctx, r.x + 8 + i * 18, r.y + r.h + 8, 5);
    }
  }

  if (pot.ready) {
    const pulse = rm ? 0.5 : 0.35 + 0.25 * Math.sin(t * 4);
    ctx.strokeStyle = rgba(P.amber, pulse);
    ctx.lineWidth = 6;
    ctx.strokeRect(r.x + 2, r.y + 6, r.w - 4, r.h - 8);
    drawChowderBowl(ctx, cx, r.y - 26, 1, assets);
    ctx.font = '800 14px ui-rounded, system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = P.cream;
    ctx.fillText('serve →', cx, r.y - 58);
  }

  label(ctx, 'POT', cx, r.y + r.h + 24);
}

function drawKettle(ctx: CanvasRenderingContext2D, L: GalleyLayout, sim: Sim, assets: GameAssets | null): void {
  const r = L.kettle;
  const sprite = assets?.sprites['prop-kettle'];
  if (sprite) {
    blitContain(ctx, sprite, r.x, r.y, r.w, r.h);
  } else {
    ctx.fillStyle = P.harbor;
    ctx.fillRect(r.x + 14, r.y + 34, r.w - 28, r.h - 52);
    ctx.fillStyle = P.fog;
    ctx.fillRect(r.x + 22, r.y + 22, r.w - 44, 16);
    ctx.fillStyle = P.harbor;
    ctx.beginPath();
    ctx.moveTo(r.x + 14, r.y + 48);
    ctx.lineTo(r.x - 12, r.y + 62);
    ctx.lineTo(r.x + 14, r.y + 74);
    ctx.closePath();
    ctx.fill();
  }
  if (sim.pouring) {
    ctx.fillStyle = rgba(P.fog, 0.9);
    const potRim = L.pot.y + L.pot.h * 0.32;
    const sx = r.x - 10;
    ctx.fillRect(sx, r.y + r.h * 0.42, 7, Math.max(potRim - (r.y + r.h * 0.42), 10));
  }
  label(ctx, 'HOLD TO POUR', r.x + r.w / 2, r.y + r.h + 16);
}

function drawPass(ctx: CanvasRenderingContext2D, L: GalleyLayout, sim: Sim, t: number, rm: boolean, vector: boolean): void {
  const r = L.pass;
  if (vector) {
    ctx.fillStyle = P.charcoal;
    ctx.fillRect(r.x - 10, r.y - 10, r.w + 20, r.h + 20);
    ctx.fillStyle = rgba(P.amber, 0.28);
    ctx.fillRect(r.x, r.y, r.w, r.h);
    ctx.fillStyle = P.slate;
    ctx.fillRect(r.x - 16, r.y + r.h - 24, r.w + 32, 24);
  }
  // Bell — procedural so it can ding/flash later.
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

function drawFx(ctx: CanvasRenderingContext2D, sim: Sim): void {
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
    } else if (f.kind === 'text' && f.text) {
      ctx.font = '800 20px ui-rounded, system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillStyle = rgba(P.cream, 1 - age);
      ctx.fillText(f.text, f.p.x, f.p.y - 24 - age * 26);
    }
  }
}

/* ── Food ───────────────────────────────────────────────────────────── */

const ING_SPRITE: Record<IngredientId, { raw: string; chopped: string } | null> = {
  'grumbling-potato': { raw: 'ing-potato-raw', chopped: 'ing-potato-chopped' },
  wrackfish: { raw: 'ing-fish-raw', chopped: 'ing-fish-chopped' },
  'sea-smoke-stock': null,
};

export function drawIngredient(
  ctx: CanvasRenderingContext2D,
  ing: IngredientId,
  chopped: boolean,
  x: number,
  y: number,
  s: number,
  assets: GameAssets | null = null,
): void {
  const entry = ING_SPRITE[ing];
  const spriteId = entry ? (chopped ? entry.chopped : entry.raw) : null;
  const img = spriteId ? assets?.sprites[spriteId as keyof GameAssets['sprites']] : undefined;
  if (img) {
    const box = 76 * s;
    blitContain(ctx, img, x - box / 2, y - box / 2, box, box, false);
    return;
  }
  // Vector fallbacks.
  if (ing === 'grumbling-potato') {
    if (!chopped) {
      ctx.fillStyle = P.butter;
      ellipse(ctx, x, y, 30 * s, 22 * s);
      ctx.fillStyle = rgba(P.ember, 0.35);
      circle(ctx, x - 8 * s, y - 4 * s, 3.4 * s);
      circle(ctx, x + 9 * s, y + 5 * s, 2.8 * s);
      ctx.fillStyle = rgba(P.charcoal, 0.7);
      ctx.fillRect(x - 6 * s, y + 1 * s, 12 * s, 2.4 * s);
    } else {
      ctx.fillStyle = P.butter;
      for (let i = 0; i < 4; i++) {
        const a = (i / 4) * Math.PI * 2 + 0.5;
        ellipse(ctx, x + Math.cos(a) * 16 * s, y + Math.sin(a) * 10 * s, 11 * s, 8 * s);
      }
    }
    return;
  }
  if (ing === 'wrackfish') {
    if (!chopped) {
      ctx.fillStyle = P.fog;
      ellipse(ctx, x, y, 34 * s, 14 * s);
      ctx.beginPath();
      ctx.moveTo(x + 30 * s, y);
      ctx.lineTo(x + 46 * s, y - 10 * s);
      ctx.lineTo(x + 46 * s, y + 10 * s);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = rgba(P.harbor, 0.9);
      ctx.lineWidth = 1.6 * s;
      ctx.beginPath();
      ctx.moveTo(x - 20 * s, y - 3 * s);
      ctx.quadraticCurveTo(x, y - 10 * s, x + 16 * s, y - 2 * s);
      ctx.moveTo(x - 16 * s, y + 4 * s);
      ctx.quadraticCurveTo(x + 2 * s, y + 9 * s, x + 18 * s, y + 3 * s);
      ctx.stroke();
      ctx.fillStyle = P.charcoal;
      circle(ctx, x - 22 * s, y - 2 * s, 2 * s);
    } else {
      ctx.fillStyle = P.cream;
      for (let i = 0; i < 3; i++) ctx.fillRect(x - 24 * s + i * 18 * s, y - 8 * s, 13 * s, 16 * s);
    }
    return;
  }
  ctx.fillStyle = P.fog;
  ellipse(ctx, x, y, 18 * s, 22 * s);
}

export function drawChowderBowl(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  s: number,
  assets: GameAssets | null = null,
): void {
  const img = assets?.sprites['dish-chowder'];
  if (img) {
    const box = 84 * s;
    blitContain(ctx, img, x - box / 2, y - box / 2, box, box, false);
    return;
  }
  ctx.fillStyle = P.harbor;
  ctx.beginPath();
  ctx.arc(x, y, 26 * s, 0, Math.PI);
  ctx.fill();
  ctx.fillStyle = P.cream;
  ellipse(ctx, x, y, 26 * s, 8 * s);
  ctx.fillStyle = rgba(P.butter, 0.9);
  circle(ctx, x - 8 * s, y - 2 * s, 4 * s);
  circle(ctx, x + 7 * s, y - 1 * s, 3.4 * s);
  ctx.fillStyle = rgba(P.fog, 0.6);
  ellipse(ctx, x + 2 * s, y - 18 * s, 5 * s, 9 * s);
}

/* ── Shared bits ────────────────────────────────────────────────────── */

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
