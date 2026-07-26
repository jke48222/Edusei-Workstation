/**
 * @file sim.ts
 * @description The service simulation (M1 "Service" slice). Three dishes across three
 * station build-machines — pot (chowder: chop → pour → stir), glass (Fogcutter: three
 * ordered layer-pours with settle discipline), pan (Squall Rolls: slap-fold rhythm →
 * shimmer-timed flips) — under a 3.5-minute authored shift with a ferry wave.
 *
 * Stations own their builds; tickets are fulfilled implicitly: serving a finished dish
 * at the pass satisfies the OLDEST open ticket for that dish. Parallel cooking across
 * stations is legal and is the intended skill ceiling. No ticket ever hard-fails —
 * waiting only bleeds score (doc §7.0: chaos taxes, never deletes).
 *
 * The sim owns gameplay state and interprets raw pointer events itself (gesture
 * recognition is station-context-dependent). React hears SimEvents; the renderer reads
 * exposed state directly each frame. Pours are pointer-timestamp based — frame-rate
 * independent by design.
 */

import type { Pt } from './geom';
import { angleDelta, clamp, dist, inflate, rectContains } from './geom';
import type { GalleyLayout } from '../layout';
import type { DishId, GlassSpec, IngredientId, LayerSource, PanSpec, PotSpec } from '../data';
import {
  CHOP_STROKE_PX, DISHES, FLIP_STROKE_PX, FOLD_STROKE_PX, INGREDIENTS, LAYER_LABEL,
  POUR_RATE, SHIFT_SECONDS, SHIFT_WAVES, STIR_TEMPO, TICKET_FLOOR_MULT, TICKET_GRACE_S,
} from '../data';
import type { StagePointerEvent } from './engine';

/* ── Specs (typed accessors) ─────────────────────────────────────────── */

const POT_SPEC = DISHES['ninefathom-chowder'].spec as PotSpec;
const GLASS_SPEC = DISHES.fogcutter.spec as GlassSpec;
const PAN_SPEC = DISHES['squall-rolls'].spec as PanSpec;

/* ── Events the React shell listens for ─────────────────────────────── */

export interface TicketSnapshot {
  id: number;
  dishId: DishId;
  short: string;
  /** 0 fresh → 1 fully stale (score floor). */
  staleness: number;
}

export interface DishResult {
  dishName: string;
  craft: number;
  lateMult: number;
  /** 0–10 after lateness. */
  score: number;
  note: string | null;
}

export interface ShiftReport {
  served: DishResult[];
  missed: number;
  total: number;
  maxTotal: number;
  grade: string;
}

export type SimEvent =
  | { kind: 'toast'; text: string }
  | { kind: 'tickets'; tickets: TicketSnapshot[] }
  | { kind: 'clock'; secondsLeft: number }
  | { kind: 'served'; result: DishResult; open: number }
  | { kind: 'shift-complete'; report: ShiftReport };

/* ── Station state (renderer reads these) ───────────────────────────── */

export interface Carry {
  ing: IngredientId | null;
  dish: DishId | null;
  processed: boolean;
  pos: Pt;
  held: boolean;
}

export interface BoardState {
  ing: IngredientId;
  mode: 'chop' | 'fold';
  strokesNeeded: number;
  strokesDone: number;
  strokes: { dir: 1 | -1; t: number }[];
  done: boolean;
}

export interface PotState {
  contents: { ing: IngredientId; chopQ: number }[];
  fill: number;
  pourCommitted: boolean;
  pourQ: number;
  spilled: boolean;
  stirAngle: number;
  revs: number;
  goodStirMs: number;
  totalStirMs: number;
  ready: boolean;
  /** Butterstone curls shaved onto the finished chowder (0–3, garnish bonus). */
  curls: number;
}

export interface GlassLayer {
  source: LayerSource;
  expected: LayerSource;
  fill: number;
  q: number;
}

export interface GlassState {
  layers: GlassLayer[];
  fill: number;
  settleUntil: number;
  murky: boolean;
  ready: boolean;
}

export interface PanState {
  stage: 'empty' | 'cooking' | 'done';
  foldQ: number;
  flips: { q: number }[];
  cookStartT: number;
}

export interface Fx {
  kind: 'puff' | 'ring' | 'spark' | 'text' | 'flip';
  p: Pt;
  born: number;
  ttl: number;
  text?: string;
}

interface TicketState {
  id: number;
  dishId: DishId;
  bornShiftT: number;
}

type PourSession =
  | { target: 'pot'; startT: number; startFill: number }
  | { target: 'glass'; source: LayerSource; startT: number; startFill: number };

interface StrokeSession {
  kind: 'chop' | 'fold' | 'flip' | 'shave';
  anchor: number;
  armed: boolean;
  disarmAt: number;
  /** Shave only: the anchor point (flicks are direction-agnostic). */
  anchorPt?: Pt;
}

interface StirSession {
  lastAngle: number;
  lastT: number;
}

const TAP_MAX_PX = 22;
const TAP_MAX_MS = 400;

/* ── The sim ─────────────────────────────────────────────────────────── */

export class Sim {
  layout: GalleyLayout;
  carry: Carry | null = null;
  board: BoardState | null = null;
  pot: PotState = freshPot();
  glass: GlassState = freshGlass();
  pan: PanState = freshPan();
  fx: Fx[] = [];
  pouring: PourSession | null = null;
  stirring: StirSession | null = null;
  now = 0;
  shiftT = 0;
  ended = false;

  private stroke: StrokeSession | null = null;
  private downAt: Pt = { x: 0, y: 0 };
  private downT = 0;
  private moved = false;
  private emit: (e: SimEvent) => void;
  private ticketSeq = 0;
  private open: TicketState[] = [];
  private served: DishResult[] = [];
  private waveIdx = 0;
  private lastClockEmit = -1;
  private lastFoldQ = 0.75;
  private lastChopQ = 0.75;

  constructor(layout: GalleyLayout, emit: (e: SimEvent) => void) {
    this.layout = layout;
    this.emit = emit;
  }

  setLayout(layout: GalleyLayout): void {
    this.layout = layout;
  }

  /* ── Clock, waves, tickets ─────────────────────────────────────────── */

  update(dt: number, now: number): void {
    this.now = now;
    if (!this.ended) {
      this.shiftT += dt;

      while (this.waveIdx < SHIFT_WAVES.length && SHIFT_WAVES[this.waveIdx].at <= this.shiftT) {
        const wave = SHIFT_WAVES[this.waveIdx++];
        for (const dishId of wave.tickets) {
          this.open.push({ id: ++this.ticketSeq, dishId, bornShiftT: this.shiftT });
        }
        if (wave.toast) this.toast(wave.toast);
        this.emitTickets();
      }

      const secondsLeft = Math.max(0, Math.ceil(SHIFT_SECONDS - this.shiftT));
      if (secondsLeft !== this.lastClockEmit) {
        this.lastClockEmit = secondsLeft;
        this.emit({ kind: 'clock', secondsLeft });
        this.emitTickets(); // staleness bars tick alongside the clock
      }

      if (this.shiftT >= SHIFT_SECONDS) this.endShift();
    }

    // Pour gauge preview (pointer-time based; auto-overflow settles itself).
    if (this.pouring) {
      if (this.pouring.target === 'pot' && !this.pot.pourCommitted) {
        this.pot.fill = this.liveFill(now);
        if (this.pot.fill >= Math.min(POT_SPEC.pourBand[1] + 0.14, 1)) this.settlePour(now);
      } else if (this.pouring.target === 'glass') {
        this.glass.fill = this.liveFill(now);
        const band = GLASS_SPEC.layers[this.glass.layers.length]?.band;
        if (band && this.glass.fill >= Math.min(band[1] + 0.1, 1)) this.settlePour(now);
      }
    }

    this.fx = this.fx.filter((f) => now - f.born < f.ttl);
  }

  private staleness(tk: TicketState): number {
    const age = this.shiftT - tk.bornShiftT;
    if (age <= TICKET_GRACE_S) return 0;
    return clamp((age - TICKET_GRACE_S) / TICKET_GRACE_S, 0, 1);
  }

  private lateMult(tk: TicketState): number {
    return 1 - this.staleness(tk) * (1 - TICKET_FLOOR_MULT);
  }

  private emitTickets(): void {
    this.emit({
      kind: 'tickets',
      tickets: this.open.map((tk) => ({
        id: tk.id,
        dishId: tk.dishId,
        short: DISHES[tk.dishId].short,
        staleness: this.staleness(tk),
      })),
    });
  }

  private endShift(): void {
    this.ended = true;
    this.pouring = null;
    this.stirring = null;
    this.stroke = null;
    this.carry = null;
    const total = Math.round(this.served.reduce((s, x) => s + x.score, 0) * 10) / 10;
    const maxTotal = (this.served.length + this.open.length) * 10;
    this.emit({
      kind: 'shift-complete',
      report: {
        served: this.served,
        missed: this.open.length,
        total,
        maxTotal,
        grade: forecastGrade(maxTotal > 0 ? total / maxTotal : 0),
      },
    });
  }

  /* ── Pointer handling ──────────────────────────────────────────────── */

  pointer(ev: StagePointerEvent): void {
    if (this.ended) return;
    this.now = ev.t;
    switch (ev.type) {
      case 'down':
        this.downAt = ev.p;
        this.downT = ev.t;
        this.moved = false;
        this.onDown(ev.p, ev.t);
        break;
      case 'move':
        if (dist(ev.p, this.downAt) > TAP_MAX_PX) this.moved = true;
        this.onMove(ev.p, ev.t);
        break;
      case 'up':
        this.onUp(ev.p, ev.t);
        break;
      case 'cancel':
        if (this.pouring) this.settlePour(ev.t);
        this.stirring = null;
        this.stroke = null;
        if (this.carry?.held) this.carry = null;
        break;
    }
  }

  private onDown(p: Pt, t: number): void {
    const L = this.layout;

    if (this.carry) {
      this.carry.held = true;
      this.carry.pos = p;
      return;
    }

    // Finished dishes get picked up first.
    if (this.pot.ready && rectContains(inflate(L.pot, 10), p)) {
      this.carry = { ing: null, dish: 'ninefathom-chowder', processed: false, pos: p, held: true };
      return;
    }
    if (this.glass.ready && rectContains(inflate(L.glass, 14), p)) {
      this.carry = { ing: null, dish: 'fogcutter', processed: false, pos: p, held: true };
      return;
    }
    if (this.pan.stage === 'done' && rectContains(inflate(L.pan, 12), p)) {
      this.carry = { ing: null, dish: 'squall-rolls', processed: false, pos: p, held: true };
      return;
    }

    // Kettle → pot pour.
    if (rectContains(inflate(L.kettle, 12), p)) {
      if (this.pot.contents.length === 0) return this.toast('The chowder wants something to soak first.');
      if (this.pot.pourCommitted) return this.toast('It has all the fog it needs.');
      this.pouring = { target: 'pot', startT: t, startFill: this.pot.fill };
      return;
    }

    // Bottles → glass layer pours (order matters; early pours muddy the drink).
    for (const source of Object.keys(L.bottles) as LayerSource[]) {
      if (!rectContains(inflate(L.bottles[source], 10), p)) continue;
      if (this.glass.ready) return this.toast('The Fogcutter is built — serve it.');
      const idx = this.glass.layers.length;
      if (idx >= GLASS_SPEC.layers.length) return;
      if (this.now < this.glass.settleUntil) {
        this.glass.murky = true;
        this.spawnFx('puff', { x: L.glass.x + L.glass.w / 2, y: L.glass.y + 10 });
        this.toast('Too soon — the layers blur…');
      }
      this.pouring = { target: 'glass', source, startT: t, startFill: this.glass.fill };
      return;
    }

    // Glass hint.
    if (rectContains(inflate(L.glass, 12), p)) {
      const idx = this.glass.layers.length;
      if (idx < GLASS_SPEC.layers.length) {
        this.toast(`Next: ${LAYER_LABEL[GLASS_SPEC.layers[idx].source]}.`);
      }
      return;
    }

    // Pot → stir.
    if (rectContains(inflate(L.pot, 10), p)) {
      if (this.pot.pourCommitted && !this.pot.ready) {
        this.stirring = { lastAngle: this.potAngle(p), lastT: t };
      } else if (this.pot.contents.length === 0) {
        this.toast('The pot is empty — chop something for it.');
      } else {
        this.toast('Pour the sea-smoke before you stir.');
      }
      return;
    }

    // Butterstone → shave curls onto a finished chowder.
    if (rectContains(inflate(L.butterstone, 10), p)) {
      if (!this.pot.ready) {
        this.toast('Butterstone garnishes a finished chowder.');
      } else if (this.pot.curls >= 3) {
        this.toast('Any more butter and the spoon drowns.');
      } else {
        this.stroke = { kind: 'shave', anchor: 0, armed: true, disarmAt: 0, anchorPt: p };
      }
      return;
    }

    // Pan → flip session while cooking.
    if (rectContains(inflate(L.pan, 12), p)) {
      if (this.pan.stage === 'cooking') {
        this.stroke = { kind: 'flip', anchor: p.y, armed: true, disarmAt: p.y };
      } else if (this.pan.stage === 'empty') {
        this.toast('Folded dough goes on the pan.');
      }
      return;
    }

    // Board → chop/fold strokes, or pick the processed item back up.
    if (rectContains(inflate(L.board, 10), p)) {
      if (this.board && !this.board.done) {
        this.stroke =
          this.board.mode === 'chop'
            ? { kind: 'chop', anchor: p.x, armed: true, disarmAt: p.x }
            : { kind: 'fold', anchor: p.y, armed: true, disarmAt: p.y };
      } else if (this.board?.done) {
        this.carry = { ing: this.board.ing, dish: null, processed: true, pos: p, held: true };
        this.board = null;
      }
      return;
    }

    // Bins → fresh ingredient.
    for (const [ing, rect] of Object.entries(L.bins)) {
      if (rectContains(inflate(rect, 8), p)) {
        this.carry = { ing: ing as IngredientId, dish: null, processed: false, pos: p, held: true };
        return;
      }
    }
  }

  private onMove(p: Pt, t: number): void {
    if (this.carry?.held) {
      this.carry.pos = p;
      return;
    }

    const st = this.stroke;
    if (st && this.board && !this.board.done && (st.kind === 'chop' || st.kind === 'fold')) {
      if (st.kind === 'chop') {
        const dx = p.x - st.anchor;
        if (Math.abs(dx) >= CHOP_STROKE_PX && rectContains(inflate(this.layout.board, 30), p)) {
          this.registerBoardStroke(dx > 0 ? 1 : -1, t);
          st.anchor = p.x;
        }
      } else {
        // Slap-folds: downward travel registers; pulling back up re-arms.
        if (st.armed && p.y - st.anchor >= FOLD_STROKE_PX) {
          const side: 1 | -1 = p.x < this.layout.board.x + this.layout.board.w / 2 ? -1 : 1;
          this.registerBoardStroke(side, t);
          st.armed = false;
          st.disarmAt = p.y;
        } else if (!st.armed && p.y <= st.disarmAt - 24) {
          st.armed = true;
          st.anchor = p.y;
        }
      }
      return;
    }

    if (st && st.kind === 'shave' && st.anchorPt) {
      // Direction-agnostic short flicks: each one shaves a curl off the stone.
      if (st.armed && dist(p, st.anchorPt) >= 34) {
        st.armed = false;
        if (this.pot.ready && this.pot.curls < 3) {
          this.pot.curls++;
          this.spawnFx('spark', { ...st.anchorPt });
          if (this.pot.curls >= 3) this.spawnFx('text', st.anchorPt, 'buttered!');
        }
      } else if (!st.armed && dist(p, st.anchorPt) <= 14) {
        st.armed = true;
      }
      return;
    }

    if (st && st.kind === 'flip' && this.pan.stage === 'cooking') {
      if (st.armed && st.anchor - p.y >= FLIP_STROKE_PX) {
        st.armed = false;
        st.disarmAt = p.y;
        this.attemptFlip(t);
      } else if (!st.armed && p.y >= st.disarmAt + 24) {
        st.armed = true;
        st.anchor = p.y;
      }
      return;
    }

    if (this.stirring) {
      const angle = this.potAngle(p);
      const d = angleDelta(this.stirring.lastAngle, angle);
      const dtMs = Math.max(t - this.stirring.lastT, 1);
      if (Math.abs(d) < 1.2) {
        this.pot.stirAngle += d;
        const speed = Math.abs(d) / (dtMs / 1000);
        this.pot.totalStirMs += dtMs;
        if (speed >= STIR_TEMPO[0] && speed <= STIR_TEMPO[1]) this.pot.goodStirMs += dtMs;
        const revs = Math.floor(Math.abs(this.pot.stirAngle) / (Math.PI * 2));
        if (revs > this.pot.revs) {
          this.pot.revs = revs;
          this.spawnFx('ring', potMouthCenter(this.layout));
          if (revs >= POT_SPEC.stirRevs && this.potNeedsMet()) {
            this.pot.ready = true;
            this.stirring = null;
            this.spawnFx('text', potMouthCenter(this.layout), 'body!');
            this.toast('The spoon stands up — serve it!');
          }
        }
      }
      this.stirring = { lastAngle: angle, lastT: t };
    }
  }

  private onUp(p: Pt, t: number): void {
    if (this.pouring) this.settlePour(t);
    this.stroke = null;
    this.stirring = null;

    if (this.carry?.held) {
      const isTap = !this.moved && t - this.downT <= TAP_MAX_MS;
      if (isTap) {
        this.carry.held = false; // sticky carry — tap-tap placement (doc §6)
        return;
      }
      this.tryDrop(p);
    }
  }

  /* ── Drops ─────────────────────────────────────────────────────────── */

  private tryDrop(p: Pt): void {
    const c = this.carry;
    if (!c) return;
    const L = this.layout;

    if (c.dish) {
      if (rectContains(inflate(L.pass, 16), p)) this.serve(c.dish);
      else {
        this.toast('The pass is the warm window.');
        this.returnDish(c.dish);
      }
      this.carry = null;
      return;
    }

    if (!c.ing) {
      this.carry = null;
      return;
    }
    const def = INGREDIENTS[c.ing];

    if (c.processed) {
      // Chopped things go to the pot; folded dough goes to the pan.
      if (def.chopStrokes && rectContains(inflate(L.pot, 10), p)) {
        if (this.pot.contents.some((x) => x.ing === c.ing)) {
          this.toast(`It already has enough ${def.name.toLowerCase()}.`);
        } else {
          this.pot.contents.push({ ing: c.ing, chopQ: this.lastChopQ });
          this.spawnFx('puff', potMouthCenter(L));
        }
        this.carry = null;
        return;
      }
      if (def.foldSlaps && rectContains(inflate(L.pan, 12), p)) {
        if (this.pan.stage !== 'empty') {
          this.toast('The pan is busy.');
        } else {
          this.pan = { stage: 'cooking', foldQ: this.lastFoldQ, flips: [], cookStartT: this.now };
          this.spawnFx('spark', { x: L.pan.x + L.pan.w / 2, y: L.pan.y + 10 });
          this.toast('Flick up on the shimmer to flip.');
        }
        this.carry = null;
        return;
      }
      if (rectContains(inflate(L.board, 10), p) && !this.board) {
        this.board = { ing: c.ing, mode: def.chopStrokes ? 'chop' : 'fold', strokesNeeded: 0, strokesDone: 0, strokes: [], done: true };
        this.carry = null;
        return;
      }
      this.toast(def.chopStrokes ? 'Chopped bits go in the pot.' : 'Folded dough goes on the pan.');
      this.carry = null;
      return;
    }

    // Raw ingredients belong on the board.
    if (rectContains(inflate(L.board, 10), p)) {
      if (this.board) {
        this.toast('The board is busy — finish that first.');
      } else {
        const mode: BoardState['mode'] = def.chopStrokes ? 'chop' : 'fold';
        const needed = def.chopStrokes ?? def.foldSlaps ?? 0;
        this.board = { ing: c.ing, mode, strokesNeeded: needed, strokesDone: 0, strokes: [], done: false };
      }
      this.carry = null;
      return;
    }
    if (rectContains(inflate(L.pot, 10), p)) {
      this.toast('The pot wants it chopped first.');
      this.carry = null;
      return;
    }
    if (rectContains(inflate(L.pan, 12), p)) {
      this.toast('Work the dough on the board first.');
      this.carry = null;
      return;
    }
    this.carry = null; // back to the crate
  }

  /* ── Verb internals ────────────────────────────────────────────────── */

  private registerBoardStroke(dir: 1 | -1, t: number): void {
    const b = this.board;
    if (!b || b.done) return;
    b.strokes.push({ dir, t });
    b.strokesDone = b.strokes.length;
    const L = this.layout;
    this.spawnFx('spark', { x: L.board.x + L.board.w / 2, y: L.board.y + 26 });
    if (b.strokesDone >= b.strokesNeeded) {
      b.done = true;
      const q = strokeQuality(b.strokes);
      if (b.mode === 'chop') this.lastChopQ = q;
      else this.lastFoldQ = q;
      this.stroke = null;
      this.spawnFx('text', { x: L.board.x + L.board.w / 2, y: L.board.y + 20 }, qualityLabel(q, b.mode));
    }
  }

  private attemptFlip(t: number): void {
    const phase = (t - this.pan.cookStartT) % PAN_SPEC.shimmerPeriodMs;
    const L = this.layout;
    const panC = { x: L.pan.x + L.pan.w / 2, y: L.pan.y + 8 };
    if (phase <= PAN_SPEC.shimmerWindowMs) {
      const q = 1 - (phase / PAN_SPEC.shimmerWindowMs) * 0.4;
      this.pan.flips.push({ q });
      this.spawnFx('flip', panC);
      if (this.pan.flips.length >= PAN_SPEC.flips) {
        this.pan.stage = 'done';
        this.spawnFx('text', panC, 'golden!');
        this.toast('Rolls up — serve them warm!');
      }
    } else {
      this.spawnFx('text', panC, 'wait for the shimmer…');
    }
  }

  private potAngle(p: Pt): number {
    const c = potMouthCenter(this.layout);
    return Math.atan2(p.y - c.y, p.x - c.x);
  }

  private potNeedsMet(): boolean {
    return POT_SPEC.needs.every((ing) => this.pot.contents.some((c) => c.ing === ing));
  }

  private liveFill(t: number): number {
    if (!this.pouring) return 0;
    return Math.min(this.pouring.startFill + POUR_RATE * ((t - this.pouring.startT) / 1000), 1);
  }

  private settlePour(t: number): void {
    const pour = this.pouring;
    if (!pour) return;
    const fill = this.liveFill(t);
    this.pouring = null;

    if (pour.target === 'pot') {
      this.pot.fill = fill;
      const [lo, hi] = POT_SPEC.pourBand;
      if (fill >= Math.min(hi + 0.14, 1)) {
        this.pot.spilled = true;
        this.spawnFx('puff', { x: this.layout.pot.x + 16, y: this.layout.pot.y + this.layout.pot.h });
        this.toast('Overboard! The counter drinks the difference.');
      }
      if (fill >= lo) {
        this.pot.pourCommitted = true;
        this.pot.pourQ = bandQuality(fill, POT_SPEC.pourBand);
      }
      return;
    }

    // Glass layer.
    this.glass.fill = fill;
    const idx = this.glass.layers.length;
    const spec = GLASS_SPEC.layers[idx];
    if (!spec) return;
    const [lo] = spec.band;
    if (fill < lo) return; // under-poured: top it up with another press
    let q = bandQuality(fill, spec.band);
    if (pour.source !== spec.source) {
      q *= 0.35;
      this.glass.murky = true;
      this.toast(`That was ${LAYER_LABEL[pour.source]} — it wanted ${LAYER_LABEL[spec.source]}.`);
    }
    if (this.glass.murky) q = Math.min(q, 0.6);
    this.glass.layers.push({ source: pour.source, expected: spec.source, fill, q });
    this.glass.settleUntil = this.now + GLASS_SPEC.settleMs;
    this.spawnFx('ring', { x: this.layout.glass.x + this.layout.glass.w / 2, y: this.layout.glass.y + 8 });
    if (this.glass.layers.length >= GLASS_SPEC.layers.length) {
      this.glass.ready = true;
      this.spawnFx('text', { x: this.layout.glass.x + this.layout.glass.w / 2, y: this.layout.glass.y }, 'layered!');
      this.toast('The Fogcutter stands — serve it.');
    }
  }

  /* ── Serving ───────────────────────────────────────────────────────── */

  private returnDish(dish: DishId): void {
    // Bounced serve: the dish goes back where it was built.
    if (dish === 'ninefathom-chowder') this.pot.ready = true;
    else if (dish === 'fogcutter') this.glass.ready = true;
    else this.pan.stage = 'done';
  }

  private serve(dish: DishId): void {
    const tkIdx = this.open.findIndex((t) => t.dishId === dish);
    if (tkIdx === -1) {
      this.toast(`No ticket wants ${DISHES[dish].short.toLowerCase()} right now.`);
      this.returnDish(dish);
      return;
    }
    const tk = this.open.splice(tkIdx, 1)[0];

    let craft = 0;
    let note: string | null = null;
    if (dish === 'ninefathom-chowder') {
      const chopQ = this.pot.contents.length
        ? this.pot.contents.reduce((s, c) => s + c.chopQ, 0) / this.pot.contents.length
        : 0;
      const stirQ = this.pot.totalStirMs > 0 ? clamp(this.pot.goodStirMs / this.pot.totalStirMs, 0, 1) : 0;
      const base = chopQ * 0.4 + this.pot.pourQ * 0.3 + stirQ * 0.3;
      // Butterstone garnish: the last tenth of a perfect bowl (doc §4).
      craft = base * 0.9 + 0.1 * (this.pot.curls / 3);
      note =
        craft >= 0.8 ? null :
        chopQ <= this.pot.pourQ && chopQ <= stirQ ? 'Steadier knife: even tempo, alternate directions.' :
        this.pot.pourQ <= stirQ ? 'Release the pour inside the band.' :
        'Stir smooth circles at an even pace.';
      this.pot = freshPot();
    } else if (dish === 'fogcutter') {
      craft = this.glass.layers.reduce((s, l) => s + l.q, 0) / GLASS_SPEC.layers.length;
      note = craft >= 0.8 ? null : this.glass.murky ? 'Let each layer settle, in order: brine, tea, cream.' : 'Watch each layer’s band.';
      this.glass = freshGlass();
    } else {
      const flipQ = this.pan.flips.length ? this.pan.flips.reduce((s, f) => s + f.q, 0) / this.pan.flips.length : 0;
      craft = this.pan.foldQ * 0.5 + flipQ * 0.5;
      note = craft >= 0.8 ? null : 'Fold in rhythm, flip on the first breath of shimmer.';
      this.pan = freshPan();
    }

    const lateMult = this.lateMult(tk);
    const score = Math.round(clamp(craft, 0, 1) * lateMult * 100) / 10;
    const result: DishResult = { dishName: DISHES[dish].name, craft, lateMult, score, note };
    this.served.push(result);
    this.spawnFx('text', { x: this.layout.pass.x + this.layout.pass.w / 2, y: this.layout.pass.y + 40 }, '🔔');
    this.emit({ kind: 'served', result, open: this.open.length });
    this.emitTickets();
  }

  /* ── Helpers ───────────────────────────────────────────────────────── */

  private toast(text: string): void {
    this.emit({ kind: 'toast', text });
  }

  private spawnFx(kind: Fx['kind'], p: Pt, text?: string): void {
    this.fx.push({
      kind,
      p: { ...p },
      born: this.now || performance.now(),
      ttl: kind === 'text' ? 1100 : kind === 'flip' ? 700 : 650,
      text,
    });
  }
}

/* ── Pure helpers ────────────────────────────────────────────────────── */

export function potMouthCenter(L: GalleyLayout): Pt {
  return { x: L.pot.x + L.pot.w / 2, y: L.pot.y + L.pot.h * 0.3 };
}

function freshPot(): PotState {
  return {
    contents: [], fill: 0, pourCommitted: false, pourQ: 0, spilled: false,
    stirAngle: 0, revs: 0, goodStirMs: 0, totalStirMs: 0, ready: false, curls: 0,
  };
}

function freshGlass(): GlassState {
  return { layers: [], fill: 0, settleUntil: 0, murky: false, ready: false };
}

function freshPan(): PanState {
  return { stage: 'empty', foldQ: 0, flips: [], cookStartT: 0 };
}

/** Band accuracy: full inside the band (peaking at center), sharp falloff past it. */
export function bandQuality(fill: number, band: [number, number]): number {
  const [lo, hi] = band;
  if (fill <= hi) {
    const mid = (lo + hi) / 2;
    const half = (hi - lo) / 2;
    return clamp(1 - (Math.abs(fill - mid) / Math.max(half, 0.001)) * 0.4, 0, 1);
  }
  return Math.max(0.15, 1 - (fill - hi) * 4);
}

/** Rhythm quality shared by chop and fold: alternation + tempo consistency. */
export function strokeQuality(strokes: { dir: 1 | -1; t: number }[]): number {
  if (strokes.length < 2) return 0.7;
  let alternated = 0;
  const intervals: number[] = [];
  for (let i = 1; i < strokes.length; i++) {
    if (strokes[i].dir !== strokes[i - 1].dir) alternated++;
    intervals.push(strokes[i].t - strokes[i - 1].t);
  }
  const altQ = alternated / (strokes.length - 1);
  const mean = intervals.reduce((s, v) => s + v, 0) / intervals.length;
  const sd = Math.sqrt(intervals.reduce((s, v) => s + (v - mean) ** 2, 0) / intervals.length);
  const cv = mean > 0 ? sd / mean : 1;
  const tempoQ = clamp(1 - (cv - 0.18) * 1.8, 0, 1);
  return clamp(altQ * 0.55 + tempoQ * 0.45, 0, 1);
}

function qualityLabel(q: number, mode: 'chop' | 'fold'): string {
  if (mode === 'chop') return q >= 0.85 ? 'clean cut!' : q >= 0.6 ? 'decent dice' : 'ragged…';
  return q >= 0.85 ? 'supple fold!' : q >= 0.6 ? 'workable' : 'overworked…';
}

/** Shift grade in forecast language (doc §8): the weather you leave behind. */
export function forecastGrade(ratio: number): string {
  if (ratio >= 0.9) return 'Clear Skies';
  if (ratio >= 0.75) return 'Fair';
  if (ratio >= 0.55) return 'Passing Squalls';
  return 'Small Craft Advisory';
}
