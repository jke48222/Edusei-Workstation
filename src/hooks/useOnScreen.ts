/**
 * @file useOnScreen.ts
 * @description Continuous-visibility helpers (unlike the landing's one-shot useInView):
 * media that renders or plays forever once mounted uses these to pause off-screen work.
 */

import { useEffect, useRef, useState } from 'react';

/** True only while the element actually intersects the viewport. */
export function useOnScreen<T extends HTMLElement = HTMLDivElement>(threshold = 0.01) {
  const ref = useRef<T>(null);
  // Start true so an in-view mount never blanks for a frame before the observer fires.
  const [onScreen, setOnScreen] = useState(true);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;
    const obs = new IntersectionObserver(
      ([entry]) => setOnScreen(entry.isIntersecting),
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);

  return { ref, onScreen };
}

/**
 * Drives a looping preview <video>: plays only while on screen, pauses otherwise.
 * Reduced-motion users never get autoplay — the poster/first frame stays put.
 * Attach the returned ref to the <video>; do NOT also set the autoPlay attribute.
 */
export function useAutoplayInView<T extends HTMLVideoElement = HTMLVideoElement>(threshold = 0.15) {
  const ref = useRef<T>(null);

  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (typeof IntersectionObserver === 'undefined') {
      void video.play().catch(() => {});
      return;
    }
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) void video.play().catch(() => {});
        else video.pause();
      },
      { threshold }
    );
    obs.observe(video);
    return () => obs.disconnect();
  }, [threshold]);

  return ref;
}
