/**
 * @file layout.ts
 * @description Station geometry for both orientations, in virtual-canvas coordinates.
 * These rects are FITTED TO THE GENERATED BACKGROUND PLATES (public/game/kitchen-chaos/
 * bg-*.jpg) — porthole, lantern, stove top, counters and the warm serving hatch all line
 * up with the painted art, so hitboxes, sprites and pixels agree. Re-measure here if a
 * plate is ever regenerated.
 */

import type { Rect } from './core/geom';
import type { LayerSource } from './data';

export interface GalleyLayout {
  /** Virtual canvas size for this orientation. */
  size: { w: number; h: number };
  /** Round window onto the storm (animated rain clips to this). */
  porthole: { x: number; y: number; r: number };
  /** Wall lantern anchor — the flickering light cone hangs from here. */
  lantern: { x: number; y: number };
  /** Ingredient crates, keyed by ingredient id. */
  bins: Record<string, Rect>;
  /** Cutting board (chop + fold verbs). */
  board: Rect;
  /** Butterstone — flick-shave curls onto a finished chowder (garnish bonus). */
  butterstone: Rect;
  /** Copper pot on the stove burners (chowder). */
  pot: Rect;
  /** Fog kettle (hold-to-pour into the pot). */
  kettle: Rect;
  /** Cast-iron pan on the front burner (rolls). */
  pan: Rect;
  /** Drinks shelf: the Fogcutter glass plus its three pour bottles. */
  glass: Rect;
  bottles: Record<LayerSource, Rect>;
  /** The pass — the warm serving hatch; serve completed dishes here. */
  pass: Rect;
  /** The Keeper's dumbwaiter hatch (crank verb sends Black Toast up). */
  dumbwaiter: Rect;
  /** Toast rest by the stove flame — hold the loaf here to char it. */
  toastSpot: Rect;
}

export const LANDSCAPE: GalleyLayout = {
  size: { w: 1280, h: 720 },
  porthole: { x: 634, y: 318, r: 92 },
  lantern: { x: 1032, y: 180 },
  bins: {
    'grumbling-potato': { x: 398, y: 556, w: 126, h: 112 },
    wrackfish: { x: 538, y: 556, w: 126, h: 112 },
    'stormflour-dough': { x: 678, y: 576, w: 126, h: 108 },
  },
  board: { x: 96, y: 452, w: 250, h: 142 },
  butterstone: { x: 22, y: 468, w: 62, h: 58 },
  pot: { x: 872, y: 396, w: 208, h: 170 },
  kettle: { x: 1138, y: 428, w: 92, h: 132 },
  pan: { x: 830, y: 584, w: 118, h: 84 },
  glass: { x: 1040, y: 592, w: 56, h: 92 },
  bottles: {
    brine: { x: 1108, y: 596, w: 52, h: 88 },
    tea: { x: 1164, y: 596, w: 52, h: 88 },
    cream: { x: 1220, y: 596, w: 52, h: 88 },
  },
  pass: { x: 1012, y: 298, w: 202, h: 176 },
  dumbwaiter: { x: 1216, y: 160, w: 58, h: 92 },
  toastSpot: { x: 954, y: 596, w: 90, h: 66 },
};

export const PORTRAIT: GalleyLayout = {
  size: { w: 720, h: 1280 },
  porthole: { x: 361, y: 318, r: 84 },
  lantern: { x: 100, y: 550 },
  bins: {
    'grumbling-potato': { x: 26, y: 1092, w: 122, h: 106 },
    wrackfish: { x: 160, y: 1092, w: 122, h: 106 },
    'stormflour-dough': { x: 294, y: 1108, w: 118, h: 100 },
  },
  board: { x: 40, y: 858, w: 242, h: 152 },
  butterstone: { x: 332, y: 776, w: 58, h: 54 },
  pot: { x: 420, y: 828, w: 222, h: 188 },
  kettle: { x: 612, y: 752, w: 92, h: 136 },
  pan: { x: 560, y: 1044, w: 112, h: 80 },
  glass: { x: 262, y: 774, w: 52, h: 90 },
  bottles: {
    brine: { x: 48, y: 778, w: 50, h: 84 },
    tea: { x: 104, y: 778, w: 50, h: 84 },
    cream: { x: 160, y: 778, w: 50, h: 84 },
  },
  pass: { x: 528, y: 248, w: 148, h: 136 },
  dumbwaiter: { x: 30, y: 250, w: 54, h: 84 },
  toastSpot: { x: 466, y: 1128, w: 92, h: 62 },
};

export const layoutFor = (aspect: number): GalleyLayout =>
  aspect >= 1 ? LANDSCAPE : PORTRAIT;
