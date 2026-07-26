/**
 * @file sim.ts
 * @description The service simulation for the Dry Dock build (M0): one ticket at a time,
 * Ninefathom Chowder only, full verb set for it — grab/carry (drag or tap-tap), rhythm
 * chop, hold-to-pour into a band, tempo-matched stir — then serve at the pass. Scoring
 * follows doc §5/§8: craft quality per verb, forecast-language grades per shift.
 *
 * The sim owns all gameplay state and interprets raw pointer events itself (gesture
 * context is station-dependent, so recognition lives next to the state it mutates).
 * React only hears about it through SimEvent callbacks; the renderer reads the exposed
 * state directly each frame.
 */

import type { Pt } from './geom';
import { angleDelta, clamp, dist, inflate, rectCenter, rectContains } from './geom';
import type { GalleyLayout } from '../layout';
import type { DishId, IngredientId } from '../data';
import { CHOP_STROKE_PX, DISHES, INGREDIENTS, M0_TICKETS, POUR_RATE, STIR_TEMPO } from '../data';
import type { StagePointerEvent } from './engine';

/* ── Events the React shell listens for ─────────────────────────────── */

export interface TicketStep {
  label: string;
  done: boolean;
}

export interface TicketSnapshot {
  id: number;
  dishId: DishId;
  dishName: string;
  steps: TicketStep[];
}

export interface DishResult {
  dishName: string;
  chopQ: number;
  pourQ: number;
  stirQ: number;
  /** 0–10. */
  score: number;
  tip: string | null;
}

export interface ShiftReport {
  served: DishResult[];
  total: number;
  maxTotal: number;
  /** Forecast-language grade (doc §8). */
  grade: string;
}

export type SimEvent =
  | { kind: 'toast'; text: string }
  | { kind: 'tickets'; tickets: TicketSnapshot[] }
  | { kind: 'served'; result: DishResult; remaining: number }
  | { kind: 'shift-complete'; report: ShiftReport };

/* ── Internal state shapes (renderer reads these) ───────────────────── */

export interface Carry {
  ing: IngredientId | null;
  /** Carrying the finished dish instead of an ingredient. */
  dish: boolean;
  chopped: boolean;
  pos: Pt;
  /** True while the item rides the pointer (drag); sticky carries survive pointer-up. */
  held: boolean;
}

export interface BoardState {
  ing: IngredientId;
  strokesNeeded: number;
  strokesDone: number;
  /** Timestamps + directions of registered strokes, for tempo/alternation quality. */
  strokes: { dir: 1 | -1; t: number }[];
  chopped: boolean;
}

export interface PotContent {
  ing: IngredientId;
  chopQ: number;
}

export interface PotState {
  contents: PotContent[];
  fill: number;
  pourCommitted: boolean;
  pourQ: number;
  spilled: boolean;
  stirAngle: number;
  revs: number;
  goodStirMs: number;
  totalStirMs: number;
  ready: boolean;
}

export interface Fx {
  kind: 'puff' | 'ring' | 'spark' | 'text';
  p: Pt;
  born: number;
  ttl: number;
  text?: string;
}

interface ChopSession {
  anchorX: number;
  lastDir: 1 | -1 | 0;
}

interface StirSession {
  lastAngle: number;
  lastT: number;
}

/* ── The sim ─────────────────────────────────────────────────────────── */

const TAP_MAX_PX = 22;
const TAP_MAX_MS = 400;

export class Sim {
  layout: GalleyLayout;
  carry: Carry | null = null;
  board: BoardState | null = null;
  pot: PotState = freshPot();
  fx: Fx[] = [];
  /** Live pour session — fill is computed from pointer timestamps (frame-rate independent). */
  pouring: { startT: number; startFill: number } | null = null;
  stirring: StirSession | null = null;
  now = 0;

  private chop: ChopSession | null = null;
  private downAt: Pt = { x: 0, y: 0 };
  private downT = 0;
  private moved = false;
  private emit: (e: SimEvent) => void;
  private ticketSeq = 0;
  private ticket: TicketSnapshot | null = null;
  private served: DishResult[] = [];
  private complete = false;

  constructor(layout: GalleyLayout, emit: (e: SimEvent) => void) {
    this.layout = layout;
    this.emit = emit;
    this.nextTicket();
  }

  setLayout(layout: GalleyLayout): void {
    this.layout = layout;
  }

  /** The dish on the current ticket (M0: always chowder). */
  get dish() {
    return DISHES[this.ticket?.dishId ?? 'ninefathom-chowder'];
  }

  /* ── Ticket lifecycle ──────────────────────────────────────────────── */

  private nextTicket(): void {
    const id = ++this.ticketSeq;
    this.ticket = { id, dishId: 'ninefathom-chowder', dishName: DISHES['ninefathom-chowder'].name, steps: [] };
    this.refreshTicket();
  }

  private refreshTicket(): void {
    if (!this.ticket) return;
    const d = this.dish;
    const steps: TicketStep[] = d.needs.map((ing) => ({
      label: `Chop ${INGREDIENTS[ing].name.toLowerCase()}`,
      done: this.pot.contents.some((c) => c.ing === ing),
    }));
    steps.push({ label: 'Pour the sea-smoke', done: this.pot.pourCommitted });
    steps.push({ label: 'Stir until it has body', done: this.pot.ready });
    steps.push({ label: 'Serve at the pass', done: false });
    this.ticket.steps = steps;
    this.emit({ kind: 'tickets', tickets: [this.ticket] });
  }

  /* ── Pointer handling ──────────────────────────────────────────────── */

  pointer(ev: StagePointerEvent): void {
    if (this.complete) return;
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
        this.chop = null;
        if (this.carry?.held) this.carry = null;
        break;
    }
  }

  private onDown(p: Pt, t: number): void {
    const L = this.layout;

    // A carried item in hand: this press is a drop attempt (tap-tap placement) —
    // unless it targets nothing useful, in which case the carry just follows.
    if (this.carry) {
      this.carry.held = true;
      this.carry.pos = p;
      return;
    }

    // Ready pot → pick up the finished bowl.
    if (this.pot.ready && rectContains(inflate(L.pot, 10), p)) {
      this.carry = { ing: null, dish: true, chopped: false, pos: p, held: true };
      return;
    }

    // Kettle → pour session.
    if (rectContains(inflate(L.kettle, 12), p)) {
      if (this.pot.contents.length === 0) {
        this.toast('The chowder wants something to soak first.');
        return;
      }
      if (this.pot.pourCommitted) {
        this.toast('It has all the fog it needs.');
        return;
      }
      this.pouring = { startT: t, startFill: this.pot.fill };
      return;
    }

    // Pot → stir (needs a committed pour), or hints.
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

    // Board → chop strokes on a raw item, or pick a chopped one back up.
    if (rectContains(inflate(L.board, 10), p)) {
      if (this.board && !this.board.chopped) {
        this.chop = { anchorX: p.x, lastDir: 0 };
      } else if (this.board?.chopped) {
        this.carry = { ing: this.board.ing, dish: false, chopped: true, pos: p, held: true };
        this.board = null;
      }
      return;
    }

    // Bins → pick up a fresh ingredient.
    for (const [ing, rect] of Object.entries(L.bins)) {
      if (rectContains(inflate(rect, 8), p)) {
        this.carry = { ing: ing as IngredientId, dish: false, chopped: false, pos: p, held: true };
        return;
      }
    }
  }

  private onMove(p: Pt, t: number): void {
    if (this.carry?.held) {
      this.carry.pos = p;
      return;
    }

    if (this.chop && this.board && !this.board.chopped) {
      // Strokes register each time the pointer travels CHOP_STROKE_PX across the board.
      const dx = p.x - this.chop.anchorX;
      if (Math.abs(dx) >= CHOP_STROKE_PX && rectContains(inflate(this.layout.board, 30), p)) {
        const dir: 1 | -1 = dx > 0 ? 1 : -1;
        this.registerStroke(dir, t);
        this.chop.anchorX = p.x;
        this.chop.lastDir = dir;
      }
      return;
    }

    if (this.stirring) {
      const angle = this.potAngle(p);
      const d = angleDelta(this.stirring.lastAngle, angle);
      const dtMs = Math.max(t - this.stirring.lastT, 1);
      // Ignore teleports (pointer left the pot and came back the far side).
      if (Math.abs(d) < 1.2) {
        this.pot.stirAngle += d;
        const speed = Math.abs(d) / (dtMs / 1000);
        this.pot.totalStirMs += dtMs;
        if (speed >= STIR_TEMPO[0] && speed <= STIR_TEMPO[1]) this.pot.goodStirMs += dtMs;
        const revs = Math.floor(Math.abs(this.pot.stirAngle) / (Math.PI * 2));
        if (revs > this.pot.revs) {
          this.pot.revs = revs;
          this.spawnFx('ring', rectCenter(this.layout.pot));
          if (revs >= this.dish.stirRevs && this.needsMet()) {
            this.pot.ready = true;
            this.stirring = null;
            this.spawnFx('text', rectCenter(this.layout.pot), '● body!');
            this.toast('The spoon stands up — serve it!');
            this.refreshTicket();
          }
        }
      }
      this.stirring = { lastAngle: angle, lastT: t };
    }
  }

  private onUp(p: Pt, t: number): void {
    if (this.pouring) this.settlePour(t);
    this.chop = null;
    this.stirring = null;

    if (this.carry?.held) {
      const isTap = !this.moved && t - this.downT <= TAP_MAX_MS;
      if (isTap) {
        // Sticky carry: tap picked it up, next tap places it (doc §6 fallback).
        this.carry.held = false;
        return;
      }
      this.tryDrop(p);
    }
  }

  /** Drop the carried thing at p — called for drag-release and for tap-tap placement. */
  private tryDrop(p: Pt): void {
    const c = this.carry;
    if (!c) return;
    const L = this.layout;

    if (c.dish) {
      if (rectContains(inflate(L.pass, 16), p)) {
        this.serve();
      } else {
        this.toast('The pass is the window on the right.');
        this.carry = null;
      }
      return;
    }

    if (!c.ing) {
      this.carry = null;
      return;
    }

    // Chopped ingredients belong in the pot.
    if (c.chopped) {
      if (rectContains(inflate(L.pot, 10), p)) {
        if (this.pot.contents.some((x) => x.ing === c.ing)) {
          this.toast(`It already has enough ${INGREDIENTS[c.ing].name.toLowerCase()}.`);
        } else {
          this.pot.contents.push({ ing: c.ing, chopQ: this.lastChopQ });
          this.spawnFx('puff', rectCenter(L.pot));
          this.refreshTicket();
        }
        this.carry = null;
      } else if (rectContains(inflate(L.board, 10), p) && !this.board) {
        // Putting it back down is always allowed.
        this.board = { ing: c.ing, strokesNeeded: 0, strokesDone: 0, strokes: [], chopped: true };
        this.carry = null;
      } else {
        this.toast('Chopped bits go in the pot.');
        this.carry = null;
      }
      return;
    }

    // Raw ingredients belong on the board.
    if (rectContains(inflate(L.board, 10), p)) {
      if (this.board) {
        this.toast('The board is busy — finish that first.');
        this.carry = null;
        return;
      }
      const def = INGREDIENTS[c.ing];
      if (!def.chopStrokes) {
        this.toast(`${def.name} doesn’t need the knife.`);
        this.carry = null;
        return;
      }
      this.board = { ing: c.ing, strokesNeeded: def.chopStrokes, strokesDone: 0, strokes: [], chopped: false };
      this.carry = null;
      return;
    }
    if (rectContains(inflate(L.pot, 10), p)) {
      this.toast('The pot wants it chopped first.');
      this.carry = null;
      return;
    }
    // Anywhere else: the ingredient goes back to its crate.
    this.carry = null;
  }

  /* ── Verb internals ────────────────────────────────────────────────── */

  private lastChopQ = 0.75;

  private registerStroke(dir: 1 | -1, t: number): void {
    const b = this.board;
    if (!b) return;
    b.strokes.push({ dir, t });
    b.strokesDone = b.strokes.length;
    this.spawnFx('spark', { x: rectCenter(this.layout.board).x, y: this.layout.board.y + 30 });
    if (b.strokesDone >= b.strokesNeeded) {
      b.chopped = true;
      this.lastChopQ = chopQuality(b.strokes);
      this.chop = null;
      this.spawnFx('text', rectCenter(this.layout.board), chopLabel(this.lastChopQ));
    }
  }

  private potAngle(p: Pt): number {
    const c = rectCenter(this.layout.pot);
    return Math.atan2(p.y - c.y, p.x - c.x);
  }

  private needsMet(): boolean {
    return this.dish.needs.every((ing) => this.pot.contents.some((c) => c.ing === ing));
  }

  /** Fill for the live gauge — pour progress is pointer-time-based, not frame-based. */
  private liveFill(t: number): number {
    if (!this.pouring) return this.pot.fill;
    return Math.min(this.pouring.startFill + POUR_RATE * ((t - this.pouring.startT) / 1000), 1);
  }

  /** End a pour session at time t: bank the held duration into the pot, maybe commit. */
  private settlePour(t: number): void {
    if (!this.pouring) return;
    this.pot.fill = this.liveFill(t);
    this.pouring = null;
    const [lo, hi] = this.dish.pourBand;
    if (this.pot.fill >= Math.min(hi + 0.14, 1)) {
      this.pot.spilled = true;
      this.spawnFx('puff', { x: this.layout.pot.x + 20, y: this.layout.pot.y + this.layout.pot.h });
      this.toast('Overboard! The counter drinks the difference.');
    }
    if (this.pot.fill >= lo) this.commitPour();
  }

  update(dt: number, now: number): void {
    this.now = now;
    void dt;
    if (this.pouring && !this.pot.pourCommitted) {
      // Animate the gauge from real held time; auto-overflow ends the pour by itself.
      this.pot.fill = this.liveFill(now);
      const [, hi] = this.dish.pourBand;
      if (this.pot.fill >= Math.min(hi + 0.14, 1)) this.settlePour(now);
    }
    this.fx = this.fx.filter((f) => now - f.born < f.ttl);
  }

  private commitPour(): void {
    const [lo, hi] = this.dish.pourBand;
    const f = this.pot.fill;
    let q: number;
    if (f <= hi) {
      const mid = (lo + hi) / 2;
      const half = (hi - lo) / 2;
      q = 1 - (Math.abs(f - mid) / half) * 0.4;
    } else {
      q = Math.max(0.15, 1 - (f - hi) * 4);
    }
    this.pot.pourCommitted = true;
    this.pot.pourQ = clamp(q, 0, 1);
    this.refreshTicket();
  }

  private serve(): void {
    const d = this.dish;
    const chopQ = this.pot.contents.length
      ? this.pot.contents.reduce((s, c) => s + c.chopQ, 0) / this.pot.contents.length
      : 0;
    const stirQ = this.pot.totalStirMs > 0 ? clamp(this.pot.goodStirMs / this.pot.totalStirMs, 0, 1) : 0;
    const pourQ = this.pot.pourQ;
    const score = Math.round((chopQ * 0.4 + pourQ * 0.3 + stirQ * 0.3) * 100) / 10;

    const weakest = Math.min(chopQ, pourQ, stirQ);
    const tip =
      weakest >= 0.8 ? null :
      weakest === chopQ ? 'Steadier knife: even tempo, alternate directions.' :
      weakest === pourQ ? 'Watch the band on the pour — release inside it.' :
      'Stir smooth circles at an even pace.';

    const result: DishResult = { dishName: d.name, chopQ, pourQ, stirQ, score, tip };
    this.served.push(result);
    this.carry = null;
    this.pot = freshPot();
    this.board = null;
    this.spawnFx('text', rectCenter(this.layout.pass), '🔔');

    const remaining = M0_TICKETS - this.served.length;
    this.emit({ kind: 'served', result, remaining });

    if (remaining <= 0) {
      this.complete = true;
      const total = Math.round(this.served.reduce((s, r) => s + r.score, 0) * 10) / 10;
      const maxTotal = M0_TICKETS * 10;
      this.emit({
        kind: 'shift-complete',
        report: { served: this.served, total, maxTotal, grade: forecastGrade(total / maxTotal) },
      });
    } else {
      this.nextTicket();
    }
  }

  /* ── Small helpers ─────────────────────────────────────────────────── */

  private toast(text: string): void {
    this.emit({ kind: 'toast', text });
  }

  private spawnFx(kind: Fx['kind'], p: Pt, text?: string): void {
    this.fx.push({ kind, p: { ...p }, born: this.now || performance.now(), ttl: kind === 'text' ? 1100 : 650, text });
  }
}

/* ── Pure scoring helpers ────────────────────────────────────────────── */

function freshPot(): PotState {
  return {
    contents: [],
    fill: 0,
    pourCommitted: false,
    pourQ: 0,
    spilled: false,
    stirAngle: 0,
    revs: 0,
    goodStirMs: 0,
    totalStirMs: 0,
    ready: false,
  };
}

/** Quality of a chop: half alternation discipline, half tempo consistency. */
export function chopQuality(strokes: { dir: 1 | -1; t: number }[]): number {
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

function chopLabel(q: number): string {
  return q >= 0.85 ? 'clean cut!' : q >= 0.6 ? 'decent dice' : 'ragged…';
}

/** Shift grade in forecast language (doc §8): the weather you leave behind. */
export function forecastGrade(ratio: number): string {
  if (ratio >= 0.9) return 'Clear Skies';
  if (ratio >= 0.75) return 'Fair';
  if (ratio >= 0.55) return 'Passing Squalls';
  return 'Small Craft Advisory';
}
