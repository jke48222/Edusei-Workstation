/**
 * @file data.ts
 * @description Pantry and menu definitions (docs/kitchen-chaos-2d.md §4). M0 ships the
 * Dry Dock subset — Ninefathom Chowder and the ingredients it needs. The shapes here are
 * final; M1/M4 only add entries (Fogcutter, Squall Rolls, journal unlocks…), not fields.
 */

export type IngredientId = 'grumbling-potato' | 'wrackfish' | 'sea-smoke-stock';

export interface IngredientDef {
  id: IngredientId;
  name: string;
  /** One-line personality — surfaces in hints and the journal. */
  flavor: string;
  /** Number of clean knife strokes a chop takes (undefined = not choppable). */
  chopStrokes?: number;
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
  'sea-smoke-stock': {
    id: 'sea-smoke-stock',
    name: 'Sea-Smoke Stock',
    flavor: 'Bottled morning fog. Pours like slow silver.',
  },
};

export type DishId = 'ninefathom-chowder';

export interface DishDef {
  id: DishId;
  name: string;
  tagline: string;
  /** Chopped ingredients the pot must receive. */
  needs: IngredientId[];
  /** Pour target band as fractions of the pot fill bar. */
  pourBand: [number, number];
  /** Full revolutions of good stirring the dish wants. */
  stirRevs: number;
}

export const DISHES: Record<DishId, DishDef> = {
  'ninefathom-chowder': {
    id: 'ninefathom-chowder',
    name: 'Ninefathom Chowder',
    tagline: 'Nine fathoms deep; the spoon stands up on its own.',
    needs: ['grumbling-potato', 'wrackfish'],
    pourBand: [0.58, 0.78],
    stirRevs: 3,
  },
};

/** Stir tempo band in rad/s — inside the band builds body, outside doesn't (doc §6). */
export const STIR_TEMPO: [number, number] = [2.0, 5.0];

/** Pour fill rate while the kettle is held, in bar-fractions per second. */
export const POUR_RATE = 0.42;

/** How far a chop stroke must travel across the board, in virtual px. */
export const CHOP_STROKE_PX = 44;

/** Tickets served in one Dry Dock shift. */
export const M0_TICKETS = 5;
