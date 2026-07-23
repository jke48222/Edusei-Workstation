/**
 * @file useIsMobile.ts
 * @description Hooks for device capability: mobile/touch detection (useIsMobile, useHasTouch)
 * and viewport dimensions (useViewportSize). Used for responsive UI and input hints.
 */

import { useState, useEffect } from 'react';

/**
 * Comprehensive mobile/touch device detection.
 * 
 * Uses multiple signals:
 * - Screen width (< 768px)
 * - Touch capability
 * - User agent parsing (fallback)
 * - Pointer type (coarse = touch)
 */
export function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = useState<boolean>(() => {
    // Initial check (SSR-safe)
    if (typeof window === 'undefined') return false;
    return checkIsMobile();
  });

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(checkIsMobile());
    };

    // Listen to resize and orientation changes
    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);

    // Initial check
    handleResize();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, []);

  return isMobile;
}

/**
 * Check if device is mobile/touch-primary
 */
function checkIsMobile(): boolean {
  if (typeof window === 'undefined') return false;

  // Check 1: Screen width
  const isNarrowScreen = window.innerWidth < 768;

  // Check 2: Touch capability
  const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

  // Check 3: Pointer type (most reliable for tablets)
  const hasCoarsePointer = window.matchMedia('(pointer: coarse)').matches;

  // Check 4: User agent (fallback)
  const mobileUserAgent = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );

  // Decision logic:
  // - Narrow screen + touch = definitely mobile
  // - Coarse pointer + narrow screen = likely tablet/mobile
  // - User agent match = mobile
  // - Narrow screen ALONE is NOT enough (could be resized desktop browser)
  return (isNarrowScreen && hasTouch) || (hasCoarsePointer && isNarrowScreen) || mobileUserAgent;
}

/**
 * Pure layout breakpoint (no device sniffing): true below `breakpoint` px.
 * Default 768 matches Tailwind's `md`. Use this for layout decisions; use
 * useIsMobile above only when you genuinely care about the device class.
 */
export function useIsNarrowViewport(breakpoint = 768): boolean {
  const [narrow, setNarrow] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia(`(max-width: ${breakpoint - 1}px)`).matches;
  });

  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${breakpoint - 1}px)`);
    const onChange = () => setNarrow(mq.matches);
    onChange();
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, [breakpoint]);

  return narrow;
}

/**
 * Hook to detect user's prefers-reduced-motion setting (accessibility).
 * When true, UI and 3D camera should minimize or disable animations.
 */
export function usePrefersReducedMotion(): boolean {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  });

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handleChange = () => setPrefersReducedMotion(mq.matches);
    mq.addEventListener('change', handleChange);
    return () => mq.removeEventListener('change', handleChange);
  }, []);

  return prefersReducedMotion;
}

