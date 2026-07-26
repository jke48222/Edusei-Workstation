/**
 * @file data.ts
 * @description Pantry, menu, and shift definitions (docs/kitchen-chaos-2d.md §4–§5).
 * M1 ships the Service slice: three dishes across three build kinds — pot (Ninefathom
 * Chowder), glass (The Fogcutter's layered pours), pan (Squall Rolls' fold-and-flip) —
 * plus the 3.5-minute shift timeline with the ferry wave. M2/M4 add entries, not fields.
 */

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

export type DishId = 'ninefathom-chowder' | 'fogcutter' | 'squall-rolls';

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

export interface DishDef {
  id: DishId;
  name: string;
  short: string;
  tagline: string;
  spec: PotSpec | GlassSpec | PanSpec;
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
