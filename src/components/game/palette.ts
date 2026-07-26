/**
 * @file palette.ts
 * @description The complete color system for Kitchen Chaos — the 12-swatch "storm-flat"
 * palette from docs/kitchen-chaos-2d.md §1.2. The rule the art direction hangs on:
 * cold flat world, hot flat food. Warm swatches (amber/cream/butter/ember) are reserved
 * for food, flame, and lantern light; everything else lives in the storm bands.
 */

export const P = {
  // Storm neutrals
  charcoal: '#1B2430',
  slate: '#2E3D4F',
  harbor: '#46617A',
  fog: '#93A7B8',
  // Sea greens
  kelp: '#24463F',
  tide: '#3E6B5C',
  // Warm core — food, flame, and lantern light ONLY
  amber: '#F2A65A',
  cream: '#F4E3C1',
  butter: '#F7C873',
  ember: '#D9603B',
  // Signals
  lightning: '#CDE7F0',
  alert: '#C24A3F',
} as const;

/**
 * Barometer-driven global weather states (§7.1). Each state tints the whole canvas via
 * one composite pass — weather is a palette, not a particle count. M0 ships the type and
 * the Fair state; M2 wires the barometer to the rest.
 */
export type WeatherState = 'fair' | 'fresh' | 'squall' | 'gale' | 'century';

export const WEATHER_TINT: Record<WeatherState, { color: string; alpha: number }> = {
  fair: { color: '#1B2430', alpha: 0 },
  fresh: { color: '#1B2430', alpha: 0.08 },
  squall: { color: '#141C2B', alpha: 0.16 },
  gale: { color: '#101725', alpha: 0.26 },
  century: { color: '#0B111C', alpha: 0.34 },
};

/** Utility: hex → rgba() string at the given alpha. */
export function rgba(hex: string, alpha: number): string {
  const n = parseInt(hex.slice(1), 16);
  const r = (n >> 16) & 255;
  const g = (n >> 8) & 255;
  const b = n & 255;
  return `rgba(${r},${g},${b},${alpha})`;
}
