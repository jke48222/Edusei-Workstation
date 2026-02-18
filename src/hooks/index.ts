/**
 * @file index.ts
 * @description Public hook exports: device (useIsMobile, useHasTouch, useViewportSize)
 * and keyboard controls (useKeyboardControls, useIsAnyKeyPressed, getMovementVector).
 */
export { useIsMobile, useHasTouch, useViewportSize, usePrefersReducedMotion } from './useIsMobile';
export { useKeyboardControls, useIsAnyKeyPressed, getMovementVector } from './useKeyboardControls';
export { useKonamiCode, wasKonamiTriggered } from './useKonamiCode';