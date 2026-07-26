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
  | 'stormflour-dough'
  | 'wreckfish-whole';

export interface IngredientDef {
  id: IngredientId;
  name: string;
  /** One-line personality — surfaces in hints and the journal. */
  flavor: string;
  /** Knife strokes to chop (board, horizontal rhythm). */
  chopStrokes?: number;
  /** Slap-folds to work dough (board, downward rhythm). */
  foldSlaps?: number;
  /** Filleted along the chart-line guide (board, one precise drag). */
  fillet?: boolean;
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
  'wreckfish-whole': {
    id: 'wreckfish-whole',
    name: 'Whole Wreckfish',
    flavor: 'The big catch. Its chart-markings are the cutting guide.',
    fillet: true,
  },
};

/* ── Dishes ──────────────────────────────────────────────────────────── */

export type DishId =
  | 'ninefathom-chowder'
  | 'fogcutter'
  | 'squall-rolls'
  | 'black-toast'
  | 'lightning-pickles'
  | 'wreck-platter';

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

export interface JarSpec {
  kind: 'jar';
  /** The jar's charge pulse cycle — pop the lid on the glow peak. */
  pulsePeriodMs: number;
  windowMs: number;
}

export interface FilletSpec {
  kind: 'fillet';
  /** Mean distance from the chart-line guide that still scores full (virtual px). */
  tolerance: number;
}

export interface DishDef {
  id: DishId;
  name: string;
  short: string;
  tagline: string;
  spec: PotSpec | GlassSpec | PanSpec | ToastSpec | JarSpec | FilletSpec;
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
  'lightning-pickles': {
    id: 'lightning-pickles',
    name: 'Lightning Pickles',
    short: 'Pickles',
    tagline: 'The only dish that improves during storms.',
    spec: { kind: 'jar', pulsePeriodMs: 2400, windowMs: 520 },
  },
  'wreck-platter': {
    id: 'wreck-platter',
    name: 'Wreck Platter',
    short: 'Platter',
    tagline: 'Fillet along the chart lines. The fish knows the way.',
    spec: { kind: 'fillet', tolerance: 30 },
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

/* ── The season: seven shifts, Monday's drizzle to the Century Gale (§7.5) ── */

export interface ShiftConfig {
  day: string;
  forecast: string;
  menu: DishId[];
  waves: WavePlan[];
  cells: WeatherCell[];
  keeperOrders: { at: number; note: string }[];
  albaAt: number | null;
  /** Century Gale only: the room itself misbehaves. */
  tilts: { at: number; dur: number; dir: 1 | -1 }[];
}

const W = (at: number, tickets: DishId[], toast?: string): WavePlan => ({ at, tickets, toast });

export const SEASON: ShiftConfig[] = [
  {
    day: 'Monday',
    forecast: 'Drizzle',
    menu: ['ninefathom-chowder'],
    waves: [W(0, ['ninefathom-chowder']), W(40, ['ninefathom-chowder']), W(95, ['ninefathom-chowder', 'ninefathom-chowder'], 'Two at once — storm season begins.'), W(150, ['ninefathom-chowder'])],
    cells: [{ at: 70, dur: 18, state: 'fresh', gusts: [8] }],
    keeperOrders: [],
    albaAt: 58,
    tilts: [],
  },
  {
    day: 'Tuesday',
    forecast: 'Fresh breeze',
    menu: ['ninefathom-chowder', 'fogcutter'],
    waves: [W(0, ['ninefathom-chowder']), W(20, ['fogcutter']), W(60, ['fogcutter', 'ninefathom-chowder']), W(100, ['ninefathom-chowder', 'fogcutter'], 'The ferry’s in!'), W(155, ['fogcutter'])],
    cells: [
      { at: 44, dur: 20, state: 'fresh', gusts: [6] },
      { at: 110, dur: 22, state: 'squall', gusts: [7], leakAt: 10 },
    ],
    keeperOrders: [],
    albaAt: 52,
    tilts: [],
  },
  {
    day: 'Wednesday',
    forecast: 'Squall',
    menu: ['ninefathom-chowder', 'fogcutter', 'squall-rolls', 'black-toast'],
    waves: SHIFT_WAVES,
    cells: WEATHER_CELLS,
    keeperOrders: KEEPER_ORDERS,
    albaAt: ALBA_AT,
    tilts: [],
  },
  {
    day: 'Thursday',
    forecast: 'Chop',
    menu: ['ninefathom-chowder', 'fogcutter', 'squall-rolls', 'black-toast', 'lightning-pickles'],
    waves: [W(0, ['ninefathom-chowder']), W(14, ['lightning-pickles']), W(46, ['fogcutter', 'squall-rolls']), W(90, ['lightning-pickles', 'ninefathom-chowder', 'fogcutter'], 'The ferry’s in — brace!'), W(140, ['squall-rolls', 'lightning-pickles']), W(172, ['fogcutter'])],
    cells: [
      { at: 30, dur: 24, state: 'squall', gusts: [6, 16], strikes: [10] },
      { at: 96, dur: 30, state: 'gale', gusts: [5, 14, 23], strikes: [8, 20], leakAt: 12 },
      { at: 160, dur: 22, state: 'squall', strikes: [9], gusts: [14] },
    ],
    keeperOrders: [{ at: 70, note: 'Darker. The fog listens. — K' }],
    albaAt: 50,
    tilts: [],
  },
  {
    day: 'Friday',
    forecast: 'Gale',
    menu: ['ninefathom-chowder', 'fogcutter', 'squall-rolls', 'black-toast', 'lightning-pickles', 'wreck-platter'],
    waves: [W(0, ['wreck-platter'], 'The big catch came in. Fillet like she taught.'), W(30, ['ninefathom-chowder', 'fogcutter']), W(74, ['lightning-pickles', 'squall-rolls']), W(100, ['wreck-platter', 'fogcutter', 'ninefathom-chowder'], 'Double ferry — all hands!'), W(150, ['wreck-platter']), W(175, ['lightning-pickles'])],
    cells: [
      { at: 26, dur: 26, state: 'squall', gusts: [6, 17], leakAt: 9 },
      { at: 92, dur: 34, state: 'gale', gusts: [4, 12, 24], strikes: [7, 18, 28], leakAt: 15 },
      { at: 164, dur: 24, state: 'gale', gusts: [8, 18], strikes: [12] },
    ],
    keeperOrders: [{ at: 58, note: 'Two, tonight. The light is hungry. — K' }, { at: 132, note: 'No crusts. The sea counts them. — K' }],
    albaAt: 46,
    tilts: [],
  },
  {
    day: 'Saturday',
    forecast: 'Storm',
    menu: ['ninefathom-chowder', 'fogcutter', 'squall-rolls', 'black-toast', 'lightning-pickles', 'wreck-platter'],
    waves: [W(0, ['fogcutter', 'ninefathom-chowder']), W(28, ['wreck-platter', 'lightning-pickles']), W(66, ['squall-rolls', 'fogcutter', 'ninefathom-chowder'], 'Ferry one!'), W(108, ['wreck-platter', 'fogcutter', 'lightning-pickles', 'squall-rolls'], 'Ferry two — Saturday doesn’t blink.'), W(154, ['ninefathom-chowder', 'lightning-pickles']), W(178, ['fogcutter'])],
    cells: [
      { at: 20, dur: 28, state: 'gale', gusts: [5, 15, 24], strikes: [9, 21], leakAt: 11 },
      { at: 86, dur: 36, state: 'gale', gusts: [6, 16, 27], strikes: [10, 24], leakAt: 18 },
      { at: 150, dur: 30, state: 'gale', gusts: [7, 19], strikes: [13, 25] },
    ],
    keeperOrders: [{ at: 48, note: 'The gulls talk about you. Toast. — K' }, { at: 124, note: 'Blacker. Tonight matters. — K' }],
    albaAt: 44,
    tilts: [],
  },
  {
    day: 'Sunday',
    forecast: 'THE CENTURY GALE',
    menu: ['ninefathom-chowder', 'fogcutter', 'squall-rolls', 'black-toast', 'lightning-pickles', 'wreck-platter'],
    waves: [W(0, ['ninefathom-chowder'], 'The lifeboat crew is coming. Feed whoever knocks.'), W(24, ['fogcutter', 'lightning-pickles']), W(58, ['wreck-platter', 'squall-rolls']), W(96, ['ninefathom-chowder', 'fogcutter', 'wreck-platter'], 'The lifeboat crew, soaked to the bone!'), W(140, ['lightning-pickles', 'fogcutter']), W(168, ['ninefathom-chowder', 'squall-rolls'], 'Last knock before the eye passes.')],
    cells: [
      { at: 14, dur: 40, state: 'century', gusts: [5, 15, 26, 36], strikes: [8, 19, 31], leakAt: 10 },
      { at: 74, dur: 44, state: 'century', gusts: [6, 17, 29, 40], strikes: [9, 22, 35], leakAt: 16 },
      { at: 138, dur: 52, state: 'century', gusts: [7, 18, 30, 44], strikes: [11, 25, 39, 48] },
    ],
    keeperOrders: [{ at: 40, note: 'The lamp dims. One slice, perfect. — K' }, { at: 150, note: 'For the light itself. After the panic. Always. — K' }],
    albaAt: 36,
    tilts: [
      { at: 66, dur: 4, dir: 1 },
      { at: 156, dur: 4, dir: -1 },
    ],
  },
];

export const SEASON_KEYS = {
  shift: 'kc2:seasonShift',
  grades: 'kc2:seasonGrades',
  favor: 'kc2:favor',
  favorsUnlocked: 'kc2:favorsUnlocked',
} as const;

/** Favors — earned through the regulars, one equipped per shift (doc §8). */
export const FAVORS: Record<string, { name: string; blurb: string }> = {
  alba: { name: 'Alba radios the ferry', blurb: 'Ferry waves arrive split in two, a breath apart.' },
  moss: { name: 'Moss’s second bucket', blurb: 'Puddles mop dry in a single stroke.' },
  keeper: { name: 'Lamplight', blurb: 'Blackouts pass in half the time.' },
};

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

