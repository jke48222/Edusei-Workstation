/**
 * @file layout.ts
 * @description Station geometry for both orientations, in virtual-canvas coordinates.
 * These rects are FITTED TO THE GENERATED BACKGROUND PLATES (public/game/kitchen-chaos/
 * bg-*.jpg) — the porthole circle, lantern anchor, stove top, counters and the warm
 * serving hatch all line up with the painted art, so hitboxes, sprites and pixels agree.
 * Re-measure here if a plate is ever regenerated.
 */

import type { Rect } from './core/geom';

export interface GalleyLayout {
  /** Virtual canvas size for this orientation. */
  size: { w: number; h: number };
  /** Round window onto the storm (animated rain clips to this). */
  porthole: { x: number; y: number; r: number };
  /** Wall lantern anchor — the flickering light cone hangs from here. */
  lantern: { x: number; y: number };
  /** Ingredient crates, keyed by ingredient id. */
  bins: Record<string, Rect>;
  /** Cutting board (chop verb). */
  board: Rect;
  /** Copper pot on the stove burners (stir verb, receives chopped items + pours). */
  pot: Rect;
  /** Fog kettle (hold-to-pour verb). */
  kettle: Rect;
  /** The pass — the warm serving hatch; serve completed dishes here. */
  pass: Rect;
}

export const LANDSCAPE: GalleyLayout = {
  size: { w: 1280, h: 720 },
  porthole: { x: 634, y: 318, r: 92 },
  lantern: { x: 1032, y: 180 },
  bins: {
    'grumbling-potato': { x: 398, y: 556, w: 132, h: 116 },
    wrackfish: { x: 546, y: 556, w: 132, h: 116 },
  },
  board: { x: 96, y: 452, w: 250, h: 142 },
  pot: { x: 872, y: 396, w: 208, h: 170 },
  kettle: { x: 1138, y: 428, w: 92, h: 132 },
  pass: { x: 1012, y: 298, w: 202, h: 176 },
};

export const PORTRAIT: GalleyLayout = {
  size: { w: 720, h: 1280 },
  porthole: { x: 361, y: 318, r: 84 },
  lantern: { x: 100, y: 550 },
  bins: {
    'grumbling-potato': { x: 30, y: 1088, w: 132, h: 112 },
    wrackfish: { x: 178, y: 1088, w: 132, h: 112 },
  },
  board: { x: 40, y: 858, w: 242, h: 152 },
  pot: { x: 420, y: 828, w: 222, h: 188 },
  kettle: { x: 612, y: 752, w: 92, h: 136 },
  pass: { x: 528, y: 248, w: 148, h: 136 },
};

export const layoutFor = (aspect: number): GalleyLayout =>
  aspect >= 1 ? LANDSCAPE : PORTRAIT;
