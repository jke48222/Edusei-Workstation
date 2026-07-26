/**
 * @file data.ts
 * @description Pantry, menu, and shift definitions (docs/kitchen-chaos-2d.md §4–§5).
 * M1 ships the Service slice: three dishes across three build kinds — pot (Ninefathom
 * Chowder), glass (The Fogcutter's layered pours), pan (Squall Rolls' fold-and-flip) —
 * plus the 3.5-minute shift timeline with the ferry wave. M2/M4 add entries, not fields.
 */

import type { WeatherState } from './palette';

/* ── Ingredients ─────────────────────────────────────────────────────── */

export type IngredientId =
  | 'grumbling-potato'
  | 'wrackfish'
  | 'stormflour-dough';

export interface IngredientDef {
  id: IngredientId;
  name: string;
  /** One-line personality — surfaces in hints and the journal. */
  flavor: string;
  /** Knife strokes to chop (board, horizontal rhythm). */
  chopStrokes?: number;
  /** Slap-folds to work dough (board, downward rhythm). */
  foldSlaps?: number;
}

export const INGREDIENTS: Record<IngredientId, IngredientDef> = {
  'grumbling-potato': {
    id: 'grumbling-potato',
    name: 'Grumbling Potato',
    flavor: 'Mutters audibly. Hops when the barometer falls.',
    chopStrokes: 4,
  },
  wrackfish: {
    id: 'wrackfish',
    name: 'Wrackfish',
    flavor: 'Flat fish marked like a nautical chart.',
    chopStrokes: 3,
  },
  'stormflour-dough': {
    id: 'stormflour-dough',
    name: 'Stormflour Dough',
    flavor: 'Rises only in bad weather. Jam-swirled by Aunt Pet’s standing order.',
    foldSlaps: 3,
  },
};

/* ── Dishes ──────────────────────────────────────────────────────────── */

export type DishId = 'ninefathom-chowder' | 'fogcutter' | 'squall-rolls' | 'black-toast';

export type LayerSource = 'brine' | 'tea' | 'cream';

export interface PotSpec {
  kind: 'pot';
  needs: IngredientId[];
  pourBand: [number, number];
  stirRevs: number;
}

export interface GlassSpec {
  kind: 'glass';
  /** Poured in this order; each layer has its own fill band within the glass. */
  layers: { source: LayerSource; band: [number, number] }[];
  /** A layer must settle this long before the next pour, or the drink muddies. */
  settleMs: number;
}

export interface PanSpec {
  kind: 'pan';
  dough: IngredientId;
  flips: number;
  /** The pan shimmer cycle — flips only land inside the shimmer window. */
  shimmerPeriodMs: number;
  shimmerWindowMs: number;
}

export interface ToastSpec {
  kind: 'toast';
  /** Char meter release band — deliberately PAST the panic cue (doc §4/§6). */
  releaseBand: [number, number];
  /** Char climbs at this rate per second while held to the flame. */
  charRate: number;
  /** The safe-looking cue starts panicking here; the truth is later. */
  panicAt: number;
}

export interface DishDef {
  id: DishId;
  name: string;
  short: string;
  tagline: string;
  spec: PotSpec | GlassSpec | PanSpec | ToastSpec;
}

export const DISHES: Record<DishId, DishDef> = {
  'ninefathom-chowder': {
    id: 'ninefathom-chowder',
    name: 'Ninefathom Chowder',
    short: 'Chowder',
    tagline: 'Nine fathoms deep; the spoon stands up on its own.',
    spec: {
      kind: 'pot',
      needs: ['grumbling-potato', 'wrackfish'],
      pourBand: [0.58, 0.78],
      stirRevs: 3,
    },
  },
  fogcutter: {
    id: 'fogcutter',
    name: 'The Fogcutter',
    short: 'Fogcutter',
    tagline: 'Required by harbor law before a night crossing.',
    spec: {
      kind: 'glass',
      layers: [
        { source: 'brine', band: [0.24, 0.36] },
        { source: 'tea', band: [0.55, 0.68] },
        { source: 'cream', band: [0.86, 0.97] },
      ],
      settleMs: 900,
    },
  },
  'squall-rolls': {
    id: 'squall-rolls',
    name: 'Squall Rolls',
    short: 'Rolls',
    tagline: 'The dough only cooperates when the weather doesn’t.',
    spec: {
      kind: 'pan',
      dough: 'stormflour-dough',
      flips: 2,
      shimmerPeriodMs: 1700,
      shimmerWindowMs: 620,
    },
  },
  'black-toast': {
    id: 'black-toast',
    name: 'The Keeper’s Black Toast',
    short: 'Black Toast',
    tagline: 'The correct moment to stop is after the panic.',
    spec: {
      kind: 'toast',
      releaseBand: [0.78, 0.92],
      charRate: 0.16,
      panicAt: 0.62,
    },
  },
};

export const LAYER_LABEL: Record<LayerSource, string> = {
  brine: 'lightning brine',
  tea: 'sea-smoke tea',
  cream: 'the cream cap',
};

/* ── Verb tuning ─────────────────────────────────────────────────────── */

/** Stir tempo band in rad/s — inside the band builds body (doc §6). */
export const STIR_TEMPO: [number, number] = [2.0, 5.0];

/** Pour fill rate while a vessel is held, in bar-fractions per second. */
export const POUR_RATE = 0.42;

/** How far a chop stroke must travel across the board, in virtual px. */
export const CHOP_STROKE_PX = 44;

/** How far a slap-fold must travel downward, in virtual px. */
export const FOLD_STROKE_PX = 40;

/** Upward travel that counts as a flip flick over the pan. */
export const FLIP_STROKE_PX = 48;

/* ── The shift ───────────────────────────────────────────────────────── */

export const SHIFT_SECONDS = 210;

/** A ticket loses value as it waits: full marks inside GRACE, floor at the end. */
export const TICKET_GRACE_S = 75;
export const TICKET_FLOOR_MULT = 0.55;

export interface WavePlan {
  at: number;
  tickets: DishId[];
  toast?: string;
}

/** The authored 3.5-minute arc: calm open → build → ferry wave → last call (doc §5). */
export const SHIFT_WAVES: WavePlan[] = [
  { at: 0, tickets: ['ninefathom-chowder'] },
  { at: 16, tickets: ['fogcutter'] },
  { at: 52, tickets: ['squall-rolls', 'ninefathom-chowder'] },
  {
    at: 92,
    tickets: ['fogcutter', 'ninefathom-chowder', 'squall-rolls', 'fogcutter'],
    toast: 'The ferry’s in — all six stools at once!',
  },
  { at: 148, tickets: ['squall-rolls'] },
  { at: 170, tickets: ['ninefathom-chowder', 'fogcutter'] },
];

/* ── Weather (doc §7): telegraphed, answerable, cascading, funny ─────── */

export interface WeatherCell {
  /** Cell arrives at this shift second and lasts `dur` seconds. */
  at: number;
  dur: number;
  state: WeatherState;
  /** Gust moments (offsets into the cell, seconds). */
  gusts?: number[];
  /** A leak opens this many seconds into the cell. */
  leakAt?: number;
  /** Lightning strikes (offsets into the cell, seconds). */
  strikes?: number[];
}

/** One shift's weather script — the barometer forecasts each cell BAROMETER_LEAD_S early. */
export const WEATHER_CELLS: WeatherCell[] = [
  { at: 28, dur: 22, state: 'fresh', gusts: [6, 15] },
  { at: 64, dur: 26, state: 'squall', gusts: [5, 17], leakAt: 9 },
  { at: 104, dur: 30, state: 'gale', gusts: [4, 13, 22], strikes: [8, 19], leakAt: 14 },
  { at: 158, dur: 20, state: 'squall', gusts: [7], strikes: [12] },
];

/** How far ahead the barometer needle moves before a cell lands. */
export const BAROMETER_LEAD_S = 10;

/** Seconds a gust telegraphs (line flutter + whistle icon) before it hits. */
export const GUST_TELEGRAPH_S = 2.5;

/** Flying tickets stay catchable this long before smudging into mystery slips. */
export const TICKET_CATCH_S = 3.2;

/** The shutter closes for this long once latched, then creaks back open. */
export const SHUTTER_CLOSED_S = 14;

/** Lightning charges the brine this long — pours in that window are perfect. */
export const CHARGED_BRINE_S = 12;

/** Puddles: drip growth per second, mop strokes to clear, slip drag through them. */
export const PUDDLE_GROWTH = 0.09;
export const MOP_STROKES = 3;

/* ── The regulars (doc §3, §7.3) ─────────────────────────────────────── */

/** The Keeper orders by dumbwaiter; his notes track the barometer down. */
export const KEEPER_ORDERS: { at: number; note: string }[] = [
  { at: 44, note: 'Toast. Black as the ninth wave. — K' },
  { at: 126, note: 'No crusts. The sea counts them. — K' },
];

/** Crank revolutions to send the dumbwaiter up. */
export const CRANK_REVS = 1.5;

/** Alba's slip arrives here; she is certain you already know what it means. */
export const ALBA_AT = 58;
export const ALBA_BONUS = 1.1;
export const ALBA_WRONG_MULT = 0.75;

/** Gull syndicate: exposure-driven raids (doc §7.3). */
export const GULL_EXPOSURE_S = 7;
export const GULL_TELEGRAPH_S = 1.4;
export const GULL_PECK_S = 1.8;
export const GULL_SHOO_TAPS = 2;
export const GRUDGE_PER_SHOO = 18;
export const BOSUN_GRUDGE = 60;
export const BOSUN_BLOCK_S = 12;

/** Moss surfaces between shifts and tips in what the seabed coughs up. */
export const MOSS_FINDS = [
  'a brass button, polished by the tide',
  'half a chess knight, coral-crusted',
  'a bottle with the cork still in (empty — he checked)',
  'a spoon that is definitely one of yours',
  'a tiny anchor from a very confident model ship',
];

/** Alba's 5-beat leftover-special arc (doc §8) — one beat per shift close. */
export const ALBA_ARC: string[][] = [
  [
    'Alba turns her mug like a wheel. “First storm week, and you kept the pass moving.”',
    '“Pet used to say the ferry crossing tastes of whatever she cooked that morning.”',
    '“Tomorrow’s crossing tastes of chowder, then.” She almost smiles.',
  ],
  [
    '“Held the nine o’clock for a man chasing his hat down the dock,” she says.',
    '“Eleven minutes. Harbor master says I owe him a report. I say I owe the hat.”',
    'She taps the leftover tin. “Pet fed the hat-chasers too. Same tin.”',
  ],
  [
    '“You’ll hear it from someone: I’m the reason the old Gale closed a winter.”',
    '“Ran her aground on Wrack Point in a century blow. Pet fed the whole rescue.”',
    '“Never told her sorry. Told her tonnage. She understood tonnage.”',
  ],
  [
    'Alba sets something on the counter: a ferry token, worn smooth. “Pet’s fare.”',
    '“She rode free thirty years and paid every time. I kept them all.”',
    '“You cook like the fare’s already paid. Good. Keep that.”',
  ],
  [
    'She stands in the doorway with the storm behind her like a coat.',
    '“Century Gale’s coming Sunday. My crossing’s cancelled. First time in years.”',
    '“So I’ll be here at six. Table by the window. Cook like she’s watching.”',
  ],
];

