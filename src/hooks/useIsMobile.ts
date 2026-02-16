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
 * Hook to detect if device has touch capability
 * (useful for showing touch hints even on large touch screens)
 */
export function useHasTouch(): boolean {
  const [hasTouch, setHasTouch] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  });

  useEffect(() => {
    const check = () => {
      setHasTouch('ontouchstart' in window || navigator.maxTouchPoints > 0);
    };
    check();
  }, []);

  return hasTouch;
}

/**
 * Hook to get current viewport dimensions
 */
export function useViewportSize(): { width: number; height: number } {
  const [size, setSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 1920,
    height: typeof window !== 'undefined' ? window.innerHeight : 1080,
  });

  useEffect(() => {
    const handleResize = () => {
      setSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return size;
}
