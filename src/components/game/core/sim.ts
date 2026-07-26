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
  ALBA_BONUS, ALBA_WRONG_MULT, BAROMETER_LEAD_S, BOSUN_BLOCK_S, BOSUN_GRUDGE,
  CHARGED_BRINE_S, CHOP_STROKE_PX, CRANK_REVS, DISHES, FLIP_STROKE_PX, FOLD_STROKE_PX,
  GRUDGE_PER_SHOO, GULL_EXPOSURE_S, GULL_PECK_S, GULL_SHOO_TAPS, GULL_TELEGRAPH_S,
  GUST_TELEGRAPH_S, INGREDIENTS, LAYER_LABEL, MOP_STROKES, POUR_RATE,
  PUDDLE_GROWTH, SHIFT_SECONDS, SHUTTER_CLOSED_S, STIR_TEMPO, TICKET_CATCH_S,
  TICKET_FLOOR_MULT, TICKET_GRACE_S, type FilletSpec, type JarSpec, type ShiftConfig,
  type ToastSpec,
} from '../data';
import type { WeatherState } from '../palette';
import type { StagePointerEvent } from './engine';

/* ── Specs (typed accessors) ─────────────────────────────────────────── */

const POT_SPEC = DISHES['ninefathom-chowder'].spec as PotSpec;
const GLASS_SPEC = DISHES.fogcutter.spec as GlassSpec;
const PAN_SPEC = DISHES['squall-rolls'].spec as PanSpec;
const TOAST_SPEC = DISHES['black-toast'].spec as ToastSpec;
const JAR_SPEC = DISHES['lightning-pickles'].spec as JarSpec;
const FILLET_SPEC = DISHES['wreck-platter'].spec as FilletSpec;

const ALBA_USUAL_KEY = 'kc2:albaUsual';

export type FavorId = 'alba' | 'moss' | 'keeper' | null;

/* ── Events the React shell listens for ─────────────────────────────── */

export interface TicketSnapshot {
  id: number;
  dishId: DishId;
  short: string;
  /** 0 fresh → 1 fully stale (score floor). */
  staleness: number;
  /** Smudged slip — the strip shows ??? instead of the dish. */
  mystery: boolean;
  /** Currently airborne (hidden from the strip, catchable on canvas). */
  flying: boolean;
  kind: 'normal' | 'keeper' | 'alba';
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
  | { kind: 'sfx'; name: import('./audio').SfxName }
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
  mode: 'chop' | 'fold' | 'fillet';
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
  /** Smudged by a gust: the strip hides the dish; the player serves from memory. */
  mystery: boolean;
  /** Who it belongs to — keeper slips ride the dumbwaiter, Alba's says "the usual". */
  kind: 'normal' | 'keeper' | 'alba';
}

/** One raiding gull. Bosun is a separate, worse problem. */
export interface Gull {
  id: number;
  p: Pt;
  state: 'incoming' | 'pecking' | 'fleeing';
  target: { kind: 'pot' | 'glass' | 'pan' | 'floor'; p: Pt; floorIdx?: number };
  taps: number;
  peckStart: number;
  /** Fleeing with something in the beak makes it funnier. */
  prize: boolean;
}

export interface ToastState {
  /** idle → resting (loaf waiting by the flame) → charred (sendable) → docked (in hatch). */
  stage: 'idle' | 'resting' | 'charred' | 'docked';
  char: number;
  q: number;
  crankAngle: number;
}

/** A ticket torn off the line by a gust, mid-air and catchable. */
export interface FlyingTicket {
  ticketId: number;
  p: Pt;
  v: Pt;
  born: number;
}

export interface Leak {
  /** Drip target point (over the floor between stations). */
  p: Pt;
  /** Still dripping (grows the puddle) — stops when its cell passes. */
  active: boolean;
  /** 0..1 → puddle radius. */
  puddle: number;
  mopStrokes: number;
}

export interface FloorItem {
  ing: IngredientId | null;
  dish: DishId | null;
  processed: boolean;
  p: Pt;
  despawnAt: number;
}

type PourSession =
  | { target: 'pot'; startT: number; startFill: number }
  | { target: 'glass'; source: LayerSource; startT: number; startFill: number };

interface StrokeSession {
  kind: 'chop' | 'fold' | 'flip' | 'shave' | 'shutter' | 'mop' | 'fillet';
  anchor: number;
  armed: boolean;
  disarmAt: number;
  /** Shave/mop only: the anchor point (flicks are direction-agnostic). */
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
  private lastMove: { p: Pt; t: number } | null = null;
  private emit: (e: SimEvent) => void;
  private ticketSeq = 0;
  private open: TicketState[] = [];
  private served: DishResult[] = [];
  private waveIdx = 0;
  private lastClockEmit = -1;
  private lastFoldQ = 0.75;
  private lastChopQ = 0.75;
  private lastPlatterQ = 0.75;

  /* ── The regulars (doc §3) ── */
  toast_: ToastState = { stage: 'idle', char: 0, q: 0, crankAngle: 0 };
  gulls: Gull[] = [];
  gullShadowUntil = 0;
  grudge = 0;
  bosunHere = false;
  bosunUntil = 0;
  private bosunDone = false;
  private gullSeq = 0;
  private exposureS = 0;
  private toastHold: { startT: number; startChar: number } | null = null;
  private cranking: { lastAngle: number } | null = null;
  private keeperFired = new Set<number>();
  private albaFired = false;

  /* ── Weather state (doc §7) ── */
  weather: WeatherState = 'fair';
  /** What the barometer needle points at — it forecasts, the room follows. */
  barometer: WeatherState = 'fair';
  gustTelegraphUntil = 0;
  shutterClosedUntilShiftT = 0;
  flying: FlyingTicket[] = [];
  leak: Leak | null = null;
  floorItems: FloorItem[] = [];
  chargedUntil = 0;
  flashUntil = 0;
  blackoutUntil = 0;
  private firedGusts = new Set<string>();
  private firedStrikes = new Set<string>();
  private firedLeaks = new Set<number>();

  constructor(layout: GalleyLayout, config: ShiftConfig, favor: FavorId, emit: (e: SimEvent) => void) {
    this.layout = layout;
    this.config = config;
    this.favor = favor;
    this.emit = emit;
  }

  readonly config: ShiftConfig;
  readonly favor: FavorId;
  /** Lightning Pickles jar (menu-gated). */
  jarReady = false;
  jarQ = 0;
  /** Wreck Platter waiting on the board after a fillet cut. */
  boardDish: { q: number } | null = null;
  /** Century Gale only: the room tilts. */
  tiltUntil = 0;
  tiltDir: 1 | -1 = 1;
  private filletSamples: number[] = [];
  private firedTilts = new Set<number>();

  setLayout(layout: GalleyLayout): void {
    this.layout = layout;
  }

  /* ── Clock, waves, tickets ─────────────────────────────────────────── */

  update(dt: number, now: number): void {
    this.now = now;
    if (!this.ended) {
      this.shiftT += dt;

      while (this.waveIdx < this.config.waves.length && this.config.waves[this.waveIdx].at <= this.shiftT) {
        const wave = this.config.waves[this.waveIdx++];
        for (const dishId of wave.tickets) {
          this.open.push({ id: ++this.ticketSeq, dishId, bornShiftT: this.shiftT, mystery: false, kind: 'normal' });
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

      // The Keeper's orders arrive by dumbwaiter; a loaf takes its place by the flame.
      for (const order of this.config.keeperOrders) {
        if (this.shiftT >= order.at && !this.keeperFired.has(order.at)) {
          this.keeperFired.add(order.at);
          this.open.push({ id: ++this.ticketSeq, dishId: 'black-toast', bornShiftT: this.shiftT, mystery: false, kind: 'keeper' });
          if (this.toast_.stage === 'idle') this.toast_ = { stage: 'resting', char: 0, q: 0, crankAngle: 0 };
          this.toast(`The dumbwaiter rattles down a note: “${order.note}”`);
          this.emit({ kind: 'sfx', name: 'flutter' });
          this.emitTickets();
        }
      }
      // Alba is chronically ten minutes early and orders from memory — yours.
      if (!this.albaFired && this.config.albaAt !== null && this.shiftT >= this.config.albaAt) {
        this.albaFired = true;
        const usual = readAlbaUsual();
        this.open.push({ id: ++this.ticketSeq, dishId: usual, bornShiftT: this.shiftT, mystery: false, kind: 'alba' });
        this.toast('Captain Alba, ten minutes early: “The usual.” She trusts you know.');
        this.emitTickets();
      }

      this.updateWeather(dt, now);
      this.updateGulls(dt, now);

      if (this.shiftT >= SHIFT_SECONDS) this.endShift();
    }

    // Toast char climbs while the loaf is held to the flame (pointer-time based).
    if (this.toastHold) {
      this.toast_.char = Math.min(
        this.toastHold.startChar + TOAST_SPEC.charRate * ((now - this.toastHold.startT) / 1000),
        1,
      );
      if (this.toast_.char >= 1) {
        this.toastHold = null;
        this.toast_.q = 0.15; // a cinder — the Keeper will still take it, coldly
        this.toast_.stage = 'charred';
        this.toast('That is no longer toast. He may respect it anyway.');
      }
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

  /* ── Weather engine: telegraphed, answerable, cascading (doc §7.0) ── */

  private updateWeather(dt: number, now: number): void {
    // Barometer forecasts; the room follows when the cell actually arrives.
    const cells = this.config.cells;
    const active = cells.find((c) => this.shiftT >= c.at && this.shiftT < c.at + c.dur);
    const coming = cells.find(
      (c) => this.shiftT >= c.at - BAROMETER_LEAD_S && this.shiftT < c.at,
    );

    // Century Gale: the room itself tilts (the one earned physics beat, §7.5).
    for (const tilt of this.config.tilts) {
      if (this.shiftT >= tilt.at && !this.firedTilts.has(tilt.at)) {
        this.firedTilts.add(tilt.at);
        this.tiltUntil = now + tilt.dur * 1000;
        this.tiltDir = tilt.dir;
        this.toast('The whole rock leans on the swell — hold on!');
      }
    }
    if (now < this.tiltUntil) {
      for (const item of this.floorItems) {
        item.p.x += this.tiltDir * 34 * dt;
      }
    }
    this.weather = active?.state ?? 'fair';
    this.barometer = (coming ?? active)?.state ?? 'fair';

    if (active) {
      const into = this.shiftT - active.at;
      for (const g of active.gusts ?? []) {
        const key = `${active.at}:${g}`;
        if (into >= g - GUST_TELEGRAPH_S && into < g && !this.firedGusts.has(key)) {
          this.gustTelegraphUntil = now + GUST_TELEGRAPH_S * 1000;
        }
        if (into >= g && !this.firedGusts.has(key)) {
          this.firedGusts.add(key);
          this.fireGust();
        }
      }
      if (active.leakAt !== undefined && into >= active.leakAt && !this.firedLeaks.has(active.at)) {
        this.firedLeaks.add(active.at);
        this.openLeak();
      }
      for (const s of active.strikes ?? []) {
        const key = `${active.at}:${s}`;
        if (into >= s && !this.firedStrikes.has(key)) {
          this.firedStrikes.add(key);
          this.strike(now, active.state);
        }
      }
      if (this.leak && !active.leakAt && this.leak.active) {
        // A leak only drips while some cell is overhead; see below for closing.
      }
    } else if (this.leak?.active) {
      this.leak.active = false; // the cell passed; the puddle remains until mopped
    }

    // Shutter re-opens on its own.
    if (this.shutterClosedUntilShiftT > 0 && this.shiftT >= this.shutterClosedUntilShiftT) {
      this.shutterClosedUntilShiftT = 0;
      this.toast('The shutter creaks back open.');
    }

    // Leak drips grow the puddle.
    if (this.leak?.active) {
      this.leak.puddle = Math.min(this.leak.puddle + PUDDLE_GROWTH * dt, 1);
    }

    // Flying tickets drift; uncaught ones smudge into mystery slips.
    if (this.flying.length) {
      for (const f of this.flying) {
        f.p.x += f.v.x * dt;
        f.p.y += f.v.y * dt;
        f.v.y += 26 * dt;
        f.v.x *= 1 - 0.4 * dt;
      }
      const expired = this.flying.filter((f) => now - f.born >= TICKET_CATCH_S * 1000);
      if (expired.length) {
        for (const f of expired) {
          const tk = this.open.find((t) => t.id === f.ticketId);
          if (tk) tk.mystery = true;
        }
        this.flying = this.flying.filter((f) => now - f.born < TICKET_CATCH_S * 1000);
        this.toast('The rain ate the ink — what was that order?');
        this.emitTickets();
      }
    }

    // Dropped food despawns (the floor keeps nothing warm).
    if (this.floorItems.length) {
      this.floorItems = this.floorItems.filter((f) => now < f.despawnAt);
    }
  }

  /* ── The gull syndicate: raids keyed to exposed food (doc §7.3) ── */

  private updateGulls(dt: number, now: number): void {
    const exposure =
      (this.pot.ready ? 1 : 0) + (this.glass.ready ? 1 : 0) + (this.pan.stage === 'done' ? 1 : 0) +
      (this.floorItems.length > 0 ? 1 : 0);
    if (exposure > 0 && this.gulls.length === 0 && !this.bosunHere) {
      this.exposureS += dt * (1 + this.grudge / 90) * exposure;
    } else {
      this.exposureS = Math.max(0, this.exposureS - dt * 0.6);
    }

    if (this.exposureS >= GULL_EXPOSURE_S) {
      this.exposureS = 0;
      if (!this.bosunDone && this.grudge >= BOSUN_GRUDGE) {
        this.bosunDone = true;
        this.bosunHere = true;
        this.bosunUntil = now + BOSUN_BLOCK_S * 1000;
        this.toast('BOSUN lands on the pass. He wants the crumb tax — rolls, or patience.');
        this.emit({ kind: 'sfx', name: 'gull' });
      } else {
        this.gullShadowUntil = now + GULL_TELEGRAPH_S * 1000;
        this.emit({ kind: 'sfx', name: 'gull' });
        window.setTimeout(() => this.spawnGulls(), GULL_TELEGRAPH_S * 1000);
      }
    }

    if (this.bosunHere && now >= this.bosunUntil) {
      this.bosunHere = false;
      this.grudge = Math.max(0, this.grudge - 20);
      this.toast('Bosun leaves, unpaid and unimpressed.');
    }

    for (const g of this.gulls) {
      if (g.state === 'incoming') {
        const dx = g.target.p.x - g.p.x;
        const dy = g.target.p.y - g.p.y;
        const d = Math.hypot(dx, dy);
        if (d < 14) {
          g.state = 'pecking';
          g.peckStart = now;
        } else {
          const sp = 330 * dt;
          g.p.x += (dx / d) * sp;
          g.p.y += (dy / d) * sp;
        }
      } else if (g.state === 'pecking' && now - g.peckStart >= GULL_PECK_S * 1000) {
        this.gullSteal(g, now);
      } else if (g.state === 'fleeing') {
        g.p.x += 420 * dt * (g.p.x > this.layout.size.w / 2 ? 1 : -1);
        g.p.y -= 300 * dt;
      }
    }
    this.gulls = this.gulls.filter(
      (g) => g.p.x > -80 && g.p.x < this.layout.size.w + 80 && g.p.y > -80,
    );
  }

  private juiciestTarget(): Gull['target'] | null {
    const L = this.layout;
    if (this.pan.stage === 'done') return { kind: 'pan', p: { x: L.pan.x + L.pan.w / 2, y: L.pan.y + 8 } };
    if (this.pot.ready) return { kind: 'pot', p: potMouthCenter(L) };
    if (this.glass.ready) return { kind: 'glass', p: { x: L.glass.x + L.glass.w / 2, y: L.glass.y + 10 } };
    if (this.floorItems.length) {
      return { kind: 'floor', p: { ...this.floorItems[0].p }, floorIdx: 0 };
    }
    return null;
  }

  private spawnGulls(): void {
    if (this.ended) return;
    const target = this.juiciestTarget();
    if (!target) return;
    const L = this.layout;
    const count = this.weather === 'gale' || this.weather === 'century' || this.grudge > 40 ? 2 : 1;
    for (let i = 0; i < count; i++) {
      this.gulls.push({
        id: ++this.gullSeq,
        p: { x: i % 2 ? -50 : L.size.w + 50, y: 90 + i * 40 },
        state: 'incoming',
        target,
        taps: 0,
        peckStart: 0,
        prize: false,
      });
    }
    this.toast(count > 1 ? 'Wingmen inbound — shoo them!' : 'A gull slips in — shoo it!');
  }

  private gullSteal(g: Gull, now: number): void {
    const L = this.layout;
    g.state = 'fleeing';
    g.prize = true;
    if (g.target.kind === 'pot' && this.pot.ready) {
      this.pot = freshPot();
      this.floorItems.push({ ing: null, dish: 'ninefathom-chowder', processed: false, p: { x: L.pot.x - 30, y: L.pot.y + L.pot.h + 10 }, despawnAt: now + 6000 });
      this.toast('The chowder wears a seagull! It knocked the bowl to the floor!');
    } else if (g.target.kind === 'glass' && this.glass.ready) {
      this.glass = freshGlass();
      this.floorItems.push({ ing: null, dish: 'fogcutter', processed: false, p: { x: L.glass.x - 26, y: L.glass.y + L.glass.h + 14 }, despawnAt: now + 6000 });
      this.toast('The Fogcutter goes over! Grab it before the floor drinks it!');
    } else if (g.target.kind === 'pan' && this.pan.stage === 'done') {
      this.pan = freshPan();
      this.floorItems.push({ ing: null, dish: 'squall-rolls', processed: false, p: { x: L.pan.x - 20, y: L.pan.y + L.pan.h + 16 }, despawnAt: now + 6000 });
      this.toast('Rolls overboard — the gull only got one!');
    } else if (g.target.kind === 'floor' && this.floorItems.length) {
      this.floorItems.shift();
      this.toast('The floor food is gone. The gull looks proud.');
    }
    this.emit({ kind: 'sfx', name: 'splat' });
  }

  private shutterClosed(): boolean {
    return this.shiftT < this.shutterClosedUntilShiftT;
  }

  private fireGust(): void {
    if (this.shutterClosed()) {
      this.spawnFx('puff', { x: this.layout.porthole.x, y: this.layout.porthole.y });
      this.toast('The shutter takes the gust on the chin.');
      return;
    }
    // Tear slips off the line — one in lighter weather, two when it's truly blowing.
    const tearCount = this.weather === 'gale' || this.weather === 'century' ? 2 : 1;
    const candidates = this.open.filter(
      (t) => !t.mystery && !this.flying.some((f) => f.ticketId === t.id),
    );
    const torn = candidates.slice(0, tearCount);
    if (torn.length === 0) {
      this.toast('A gust rattles the empty line.');
      return;
    }
    const L = this.layout;
    torn.forEach((tk, i) => {
      this.flying.push({
        ticketId: tk.id,
        p: { x: L.size.w * (0.3 + i * 0.18), y: 60 },
        v: { x: 60 + i * 50, y: 30 + i * 24 },
        born: this.now,
      });
    });
    this.emit({ kind: 'sfx', name: 'gust' });
    this.toast('Gust! Catch those tickets!');
    this.emitTickets();
  }

  private openLeak(): void {
    if (this.leak) {
      this.leak.active = true;
      return;
    }
    const L = this.layout;
    // The drip lands on open floor between the board and the stove — right where
    // every carry route passes. That is the point.
    const p =
      L.size.w > L.size.h
        ? { x: L.size.w * 0.49, y: L.size.h * 0.86 }
        : { x: L.size.w * 0.5, y: L.size.h * 0.585 };
    this.leak = { p, active: true, puddle: 0.18, mopStrokes: 0 };
    this.toast('A drip finds the floor. It always finds the floor.');
  }

  private strike(now: number, state: WeatherState): void {
    this.flashUntil = now + 320;
    this.chargedUntil = now + CHARGED_BRINE_S * 1000;
    if (state === 'gale' || state === 'century') {
      // The Keeper's Lamplight favor keeps the dark short.
      this.blackoutUntil = now + (this.favor === 'keeper' ? 750 : 1500);
    }
    this.spawnFx('text', { x: this.layout.porthole.x, y: this.layout.porthole.y - 40 }, '⚡');
    this.emit({ kind: 'sfx', name: 'thunder' });
    this.toast('Lightning! The brine hums — pour it while it glows.');
  }

  private puddleRadius(): number {
    return this.leak ? 36 + this.leak.puddle * 74 : 0;
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
        short: tk.mystery ? '???' : tk.kind === 'alba' ? 'the usual???' : DISHES[tk.dishId].short,
        staleness: this.staleness(tk),
        mystery: tk.mystery,
        flying: this.flying.some((f) => f.ticketId === tk.id),
        kind: tk.kind,
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

    // Airborne tickets outrank everything — they are seconds from smudging.
    for (const f of this.flying) {
      if (dist(p, f.p) <= 52) {
        this.flying = this.flying.filter((x) => x !== f);
        this.spawnFx('text', f.p, 'caught!');
        this.emitTickets();
        return;
      }
    }

    // Shoo gulls (two quick taps each; every shoo feeds the grudge ledger).
    for (const g of this.gulls) {
      if (g.state !== 'fleeing' && dist(p, g.p) <= 46) {
        g.taps++;
        this.spawnFx('spark', { ...g.p });
        if (g.taps >= GULL_SHOO_TAPS) {
          g.state = 'fleeing';
          this.grudge = Math.min(100, this.grudge + GRUDGE_PER_SHOO);
          this.emit({ kind: 'sfx', name: 'gull' });
          this.spawnFx('text', g.p, 'shoo!');
        }
        return;
      }
    }

    // Bosun: pay the crumb tax with finished rolls, or wait him out.
    if (this.bosunHere && rectContains(inflate(L.pass, 20), p)) {
      if (this.pan.stage === 'done') {
        this.pan = freshPan();
        this.bosunHere = false;
        this.grudge = 0;
        this.toast('Bosun takes the rolls with terrible dignity. The tax is paid.');
        this.emit({ kind: 'sfx', name: 'gull' });
      } else {
        this.toast('Bosun wants rolls. He can smell that you have none.');
      }
      return;
    }

    // The Keeper's toast: hold the loaf to the flame…
    if (!this.config.menu.includes('black-toast')) {
      // The dumbwaiter sleeps until Wednesday.
    } else if (this.toast_.stage === 'resting' && rectContains(inflate(L.toastSpot, 12), p)) {
      this.toastHold = { startT: t, startChar: this.toast_.char };
      return;
    }
    // …pick up the charred slice…
    if (this.toast_.stage === 'charred' && rectContains(inflate(L.toastSpot, 12), p)) {
      this.carry = { ing: null, dish: 'black-toast', processed: false, pos: p, held: true };
      this.toast_.stage = 'idle';
      return;
    }
    // …and crank the docked slice upstairs.
    if (this.config.menu.includes('black-toast') && rectContains(inflate(L.dumbwaiter, 14), p)) {
      if (this.toast_.stage === 'docked') {
        this.cranking = { lastAngle: this.hatchAngle(p) };
      } else {
        this.toast('The dumbwaiter waits for Black Toast.');
      }
      return;
    }

    if (this.carry) {
      this.carry.held = true;
      this.carry.pos = p;
      return;
    }

    // Dropped food on the floor: grab it back before it despawns.
    for (const item of this.floorItems) {
      if (dist(p, item.p) <= 48) {
        this.floorItems = this.floorItems.filter((x) => x !== item);
        this.carry = { ing: item.ing, dish: item.dish, processed: item.processed, pos: p, held: true };
        return;
      }
    }

    // The shutter: pull down across the porthole to batten (doc §6).
    const ph = L.porthole;
    if (!this.shutterClosed() && dist(p, { x: ph.x, y: ph.y }) <= ph.r + 26) {
      this.stroke = { kind: 'shutter', anchor: p.y, armed: true, disarmAt: p.y };
      return;
    }

    // Mop a puddle (three scrub strokes clears it — the cascade breaker).
    if (this.leak && this.leak.puddle > 0 && dist(p, this.leak.p) <= this.puddleRadius() + 14) {
      this.stroke = { kind: 'mop', anchor: 0, armed: true, disarmAt: 0, anchorPt: p };
      return;
    }

    // Lightning Pickles: pop the jar lid on the glow peak (menu-gated).
    if (this.config.menu.includes('lightning-pickles') && rectContains(inflate(L.jar, 12), p)) {
      if (this.jarReady) {
        this.carry = { ing: null, dish: 'lightning-pickles', processed: false, pos: p, held: true };
        this.jarReady = false;
        return;
      }
      const phase = this.now % JAR_SPEC.pulsePeriodMs;
      const charged = this.now < this.chargedUntil;
      if (charged || phase <= JAR_SPEC.windowMs) {
        this.jarReady = true;
        this.jarQ = charged ? 1 : 1 - (phase / JAR_SPEC.windowMs) * 0.35;
        this.spawnFx('ring', { x: L.jar.x + L.jar.w / 2, y: L.jar.y + 8 });
        this.emit({ kind: 'sfx', name: 'ding' });
        this.toast('POP — the jar sighs a little storm. Serve it.');
      } else {
        this.spawnFx('text', { x: L.jar.x + L.jar.w / 2, y: L.jar.y }, 'wait for the glow…');
      }
      return;
    }

    // Wreck Platter waiting on the board after the fillet cut.
    if (this.boardDish && rectContains(inflate(L.board, 10), p)) {
      this.carry = { ing: null, dish: 'wreck-platter', processed: false, pos: p, held: true };
      this.boardDish = null;
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
    if (!this.config.menu.includes('fogcutter')) {
      // Drinks shelf not unlocked yet — nothing to press there.
    } else
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
    if (this.config.menu.includes('fogcutter') && rectContains(inflate(L.glass, 12), p)) {
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
    if (this.config.menu.includes('squall-rolls') && rectContains(inflate(L.pan, 12), p)) {
      if (this.pan.stage === 'cooking') {
        this.stroke = { kind: 'flip', anchor: p.y, armed: true, disarmAt: p.y };
      } else if (this.pan.stage === 'empty') {
        this.toast('Folded dough goes on the pan.');
      }
      return;
    }

    // Board → chop/fold/fillet strokes, or pick the processed item back up.
    if (rectContains(inflate(L.board, 10), p)) {
      if (this.board && !this.board.done) {
        if (this.board.mode === 'fillet') {
          this.stroke = { kind: 'fillet', anchor: p.x, armed: true, disarmAt: p.x };
          this.filletSamples = [];
        } else {
          this.stroke =
            this.board.mode === 'chop'
              ? { kind: 'chop', anchor: p.x, armed: true, disarmAt: p.x }
              : { kind: 'fold', anchor: p.y, armed: true, disarmAt: p.y };
        }
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
      // Slip cascade: hurrying a carry through a puddle can dump it on the floor.
      if (this.leak && this.leak.puddle > 0.12 && dist(p, this.leak.p) <= this.puddleRadius()) {
        const lm = this.lastMove;
        if (lm) {
          const speed = dist(p, lm.p) / Math.max(t - lm.t, 1); // px per ms
          if (speed > 1.5) {
            const c = this.carry;
            this.floorItems.push({
              ing: c.ing, dish: c.dish, processed: c.processed,
              p: { ...p }, despawnAt: t + 6000,
            });
            this.carry = null;
            this.spawnFx('puff', p);
            this.toast('The puddle takes its toll — grab it quick!');
            this.lastMove = { p, t };
            return;
          }
        }
      }
      this.carry.pos = p;
      this.lastMove = { p, t };
      return;
    }
    this.lastMove = { p, t };

    const st = this.stroke;
    if (st && st.kind === 'fillet' && this.board && !this.board.done) {
      // One steady drag along the chart lines; the fish grades your hand.
      const path = filletGuide(this.layout);
      this.filletSamples.push(distToPolyline(p, path));
      const L = this.layout;
      if (p.x >= L.board.x + L.board.w * 0.88) {
        const avg = this.filletSamples.reduce((s, v) => s + v, 0) / Math.max(this.filletSamples.length, 1);
        const q = clamp(1.15 - avg / FILLET_SPEC.tolerance, 0.1, 1);
        this.lastPlatterQ = q;
        this.boardDish = { q };
        this.board = null;
        this.stroke = null;
        this.spawnFx('text', { x: L.board.x + L.board.w / 2, y: L.board.y + 10 }, q >= 0.8 ? 'clean fillet!' : q >= 0.5 ? 'serviceable' : 'the fish objects');
        this.emit({ kind: 'sfx', name: 'chop' });
      }
      return;
    }

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

    if (st && st.kind === 'shutter') {
      if (p.y - st.anchor >= 64) {
        this.stroke = null;
        this.shutterClosedUntilShiftT = this.shiftT + SHUTTER_CLOSED_S;
        this.spawnFx('text', { x: this.layout.porthole.x, y: this.layout.porthole.y }, 'battened!');
        this.toast('Shutter down. The storm can knock all it likes.');
      }
      return;
    }

    if (st && st.kind === 'mop' && st.anchorPt && this.leak) {
      if (st.armed && dist(p, st.anchorPt) >= 38) {
        st.armed = false;
        this.leak.mopStrokes++;
        this.spawnFx('spark', { ...this.leak.p });
        if (this.leak.mopStrokes >= (this.favor === 'moss' ? 1 : MOP_STROKES)) {
          this.spawnFx('puff', { ...this.leak.p });
          this.toast(this.leak.active ? 'Dry — for now. That drip has plans.' : 'Dry floor, safe footing.');
          if (this.leak.active) {
            this.leak.puddle = 0.05;
            this.leak.mopStrokes = 0;
          } else {
            this.leak = null;
          }
          this.stroke = null;
        }
      } else if (!st.armed && dist(p, st.anchorPt) <= 16) {
        st.armed = true;
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

    if (this.cranking && this.toast_.stage === 'docked') {
      const angle = this.hatchAngle(p);
      const d = angleDelta(this.cranking.lastAngle, angle);
      if (Math.abs(d) < 1.2) {
        this.toast_.crankAngle += Math.abs(d);
        if (this.toast_.crankAngle >= CRANK_REVS * Math.PI * 2) {
          this.cranking = null;
          this.sendDumbwaiter();
        } else if (Math.floor(this.toast_.crankAngle / 1.6) !== Math.floor((this.toast_.crankAngle - Math.abs(d)) / 1.6)) {
          this.emit({ kind: 'sfx', name: 'crank' });
        }
      }
      this.cranking = this.cranking ? { lastAngle: angle } : null;
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
    if (this.toastHold) this.settleToast(t);
    this.stroke = null;
    this.stirring = null;
    this.cranking = null;

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
      // Black Toast rides the dumbwaiter, never the pass.
      if (c.dish === 'black-toast') {
        if (rectContains(inflate(L.dumbwaiter, 16), p)) {
          this.toast_.stage = 'docked';
          this.toast_.crankAngle = 0;
          this.toast('Docked. Crank it up to the lamp room.');
        } else if (rectContains(inflate(L.pass, 16), p)) {
          this.toast('He eats upstairs. The dumbwaiter, always.');
          this.toast_.stage = 'charred';
        } else {
          this.toast_.stage = 'charred';
        }
        this.carry = null;
        return;
      }
      if (rectContains(inflate(L.pass, 16), p)) {
        if (this.bosunHere) {
          this.toast('Bosun blocks the pass, wing out. Tax first.');
          this.returnDish(c.dish);
        } else {
          this.serve(c.dish);
        }
      } else {
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
      if (this.board || this.boardDish) {
        this.toast('The board is busy — finish that first.');
      } else {
        const mode: BoardState['mode'] = def.fillet ? 'fillet' : def.chopStrokes ? 'chop' : 'fold';
        const needed = def.chopStrokes ?? def.foldSlaps ?? 1;
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
    this.emit({ kind: 'sfx', name: 'chop' });
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

  private hatchAngle(p: Pt): number {
    const h = this.layout.dumbwaiter;
    return Math.atan2(p.y - (h.y + h.h / 2), p.x - (h.x + h.w / 2));
  }

  /** Release the loaf: the correct moment is after the panic cue (doc §4). */
  private settleToast(t: number): void {
    if (!this.toastHold) return;
    this.toast_.char = Math.min(
      this.toastHold.startChar + TOAST_SPEC.charRate * ((t - this.toastHold.startT) / 1000),
      1,
    );
    this.toastHold = null;
    const [lo] = TOAST_SPEC.releaseBand;
    if (this.toast_.char >= 1) return; // cinder path already handled in update
    if (this.toast_.char >= lo) {
      this.toast_.q = bandQuality(this.toast_.char, TOAST_SPEC.releaseBand);
      this.toast_.stage = 'charred';
      this.spawnFx('text', { x: this.layout.toastSpot.x + 40, y: this.layout.toastSpot.y }, 'past the panic!');
      this.emit({ kind: 'sfx', name: 'ding' });
    }
    // Under the band: keep holding next press — char is banked.
  }

  private sendDumbwaiter(): void {
    const tkIdx = this.open.findIndex((t) => t.kind === 'keeper');
    this.toast_.stage = 'idle';
    if (tkIdx === -1) {
      this.toast('The rope hums. Nothing comes back. He wasn’t waiting?');
      return;
    }
    const tk = this.open.splice(tkIdx, 1)[0];
    const craft = this.toast_.q;
    const lateMult = this.lateMult(tk);
    const score = Math.round(clamp(craft, 0, 1) * lateMult * 100) / 10;
    const result: DishResult = {
      dishName: DISHES['black-toast'].name,
      craft,
      lateMult,
      score,
      note: craft >= 0.8 ? null : 'Trust the note, not the panic — release later.',
    };
    this.served.push(result);
    this.emit({ kind: 'sfx', name: 'ding' });
    this.toast(craft >= 0.8 ? 'The dumbwaiter returns with a tip: one perfect whelk shell.' : 'The dumbwaiter returns. Slowly. Judgmentally.');
    this.emit({ kind: 'served', result, open: this.open.length });
    this.emitTickets();
    // Another keeper order still open → another loaf appears.
    if (this.open.some((t) => t.kind === 'keeper')) {
      this.toast_ = { stage: 'resting', char: 0, q: 0, crankAngle: 0 };
    }
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
    // Storm-charged brine pours perfectly while it glows (doc §7.2 — lightning gives).
    if (pour.source === 'brine' && this.now < this.chargedUntil) q = 1;
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
    else if (dish === 'squall-rolls') this.pan.stage = 'done';
    else if (dish === 'lightning-pickles') this.jarReady = true;
    else if (dish === 'wreck-platter') this.boardDish = { q: this.lastPlatterQ };
    else this.toast_.stage = 'charred';
  }

  private serve(dish: DishId): void {
    // Keeper slips never match the pass; Alba takes anything, reluctantly.
    let tkIdx = this.open.findIndex((t) => t.kind !== 'keeper' && t.dishId === dish);
    let albaWrong = false;
    if (tkIdx === -1) {
      tkIdx = this.open.findIndex((t) => t.kind === 'alba');
      if (tkIdx !== -1) {
        albaWrong = true;
      } else {
        this.toast(`No ticket wants ${DISHES[dish].short.toLowerCase()} right now.`);
        this.returnDish(dish);
        return;
      }
    }
    const tk = this.open.splice(tkIdx, 1)[0];
    if (tk.mystery) this.toast('You remembered the smudged order. Aunt Pet would nod.');
    if (tk.kind === 'alba') {
      if (albaWrong) {
        this.toast(`Alba blinks once. “…This is the usual now.” She means it.`);
        writeAlbaUsual(dish);
      } else {
        this.toast('Alba nods like a lighthouse: once, slowly. Exactly the usual.');
      }
    }
    this.flying = this.flying.filter((f) => f.ticketId !== tk.id);

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
    } else if (dish === 'squall-rolls') {
      const flipQ = this.pan.flips.length ? this.pan.flips.reduce((s, f) => s + f.q, 0) / this.pan.flips.length : 0;
      craft = this.pan.foldQ * 0.5 + flipQ * 0.5;
      note = craft >= 0.8 ? null : 'Fold in rhythm, flip on the first breath of shimmer.';
      this.pan = freshPan();
    } else if (dish === 'lightning-pickles') {
      craft = this.jarQ;
      note = craft >= 0.8 ? null : 'Pop the lid on the first blink of the glow — or after lightning.';
    } else {
      craft = this.lastPlatterQ;
      note = craft >= 0.8 ? null : 'One steady drag along the chart lines. Trust the fish.';
    }

    let lateMult = this.lateMult(tk);
    if (tk.kind === 'alba') lateMult *= albaWrong ? ALBA_WRONG_MULT : ALBA_BONUS;
    const score = Math.round(clamp(clamp(craft, 0, 1) * lateMult, 0, 1.1) * 100) / 10;
    const result: DishResult = { dishName: DISHES[dish].name, craft, lateMult, score, note };
    this.served.push(result);
    this.spawnFx('text', { x: this.layout.pass.x + this.layout.pass.w / 2, y: this.layout.pass.y + 40 }, '🔔');
    this.emit({ kind: 'sfx', name: 'bell' });
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

function qualityLabel(q: number, mode: 'chop' | 'fold' | 'fillet'): string {
  if (mode === 'chop') return q >= 0.85 ? 'clean cut!' : q >= 0.6 ? 'decent dice' : 'ragged…';
  if (mode === 'fillet') return q >= 0.85 ? 'clean fillet!' : q >= 0.6 ? 'serviceable' : 'the fish objects';
  return q >= 0.85 ? 'supple fold!' : q >= 0.6 ? 'workable' : 'overworked…';
}

/** The chart-line guide the fillet follows, derived from the board rect. */
export function filletGuide(L: GalleyLayout): Pt[] {
  const b = L.board;
  const cy = b.y + b.h * 0.42;
  return [
    { x: b.x + b.w * 0.08, y: cy - 4 },
    { x: b.x + b.w * 0.34, y: cy - 20 },
    { x: b.x + b.w * 0.62, y: cy + 14 },
    { x: b.x + b.w * 0.92, y: cy - 2 },
  ];
}

function distToPolyline(p: Pt, path: Pt[]): number {
  let best = Infinity;
  for (let i = 0; i < path.length - 1; i++) {
    const a = path[i];
    const b = path[i + 1];
    const abx = b.x - a.x;
    const aby = b.y - a.y;
    const len2 = abx * abx + aby * aby;
    const t = len2 > 0 ? clamp(((p.x - a.x) * abx + (p.y - a.y) * aby) / len2, 0, 1) : 0;
    const dx = p.x - (a.x + abx * t);
    const dy = p.y - (a.y + aby * t);
    best = Math.min(best, Math.hypot(dx, dy));
  }
  return best;
}

function readAlbaUsual(): DishId {
  try {
    const v = localStorage.getItem(ALBA_USUAL_KEY) as DishId | null;
    if (v && v in DISHES && v !== 'black-toast') return v;
  } catch {
    /* storage blocked */
  }
  return 'ninefathom-chowder';
}

function writeAlbaUsual(dish: DishId): void {
  if (dish === 'black-toast') return;
  try {
    localStorage.setItem(ALBA_USUAL_KEY, dish);
  } catch {
    /* fine */
  }
}

/** Shift grade in forecast language (doc §8): the weather you leave behind. */
export function forecastGrade(ratio: number): string {
  if (ratio >= 0.9) return 'Clear Skies';
  if (ratio >= 0.75) return 'Fair';
  if (ratio >= 0.55) return 'Passing Squalls';
  return 'Small Craft Advisory';
}
