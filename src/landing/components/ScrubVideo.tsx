import { useEffect, useRef, useState } from "react";

/** Phone/tablet detection — kept in sync with useIsNarrow's md breakpoint (767px). */
const MOBILE_MEDIA = "(max-width: 767px), (pointer: coarse)";

/**
 * Fixed, full-viewport background video scrubbed by page scroll.
 * A rAF loop eases video.currentTime toward (scrollProgress * duration), reading the
 * landing's scroll container (#landing-scroll). The loop only runs while there is
 * work to do: it wakes on scroll/resize and stops again once the seek has settled.
 * Reduced-motion users get the static poster only — the video never downloads.
 *
 * iOS/Safari quirk: a paused video that has never been *played* will not repaint when
 * you set currentTime — it stays frozen on the poster, so scrubbing looks dead on
 * mobile. The fix is to "prime" the element with a muted play() → pause() (permitted
 * for muted + playsInline), after which seeks render normally. If autoplay is blocked
 * (e.g. Low-Power Mode), we prime on the first touch instead.
 */
export default function ScrubVideo() {
  const videoRef = useRef<HTMLVideoElement>(null);
  // Phones/tablets get a lighter 720p encode — same all-intra frames, ~7.5MB vs ~18MB —
  // so the decoder can keep up with rapid scrub seeks instead of stuttering.
  const [isMobile] = useState(
    () => typeof window !== "undefined" && window.matchMedia(MOBILE_MEDIA).matches
  );
  // No scrubbing will ever happen for reduced-motion users, so skip the video entirely.
  const [reduced] = useState(
    () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
  const src = isMobile ? "/media/hero-mobile.mp4" : "/media/hero.mp4";

  useEffect(() => {
    if (reduced) return; // poster image only — no video element mounted
    const video = videoRef.current;
    if (!video) return;

    let raf = 0;
    let current = 0;
    let ready = false;
    let primed = false;

    const prime = () => {
      if (primed || !video.paused) return;
      const p = video.play();
      if (p && typeof p.then === "function") {
        p.then(() => {
          primed = true;
          try { video.pause(); } catch {}
        }).catch(() => {
          /* autoplay blocked — a touch listener will prime it on the first gesture */
        });
      } else {
        primed = true;
        try { video.pause(); } catch {}
      }
    };

    // The landing scrolls inside #landing-scroll (a fixed container), not the window.
    const scroller = document.getElementById("landing-scroll");

    const loop = () => {
      raf = 0;
      if (!ready || !video.duration || !isFinite(video.duration)) return; // wake() re-arms via onReady
      const scrollTop = scroller ? scroller.scrollTop : window.scrollY;
      const total = scroller
        ? scroller.scrollHeight - scroller.clientHeight
        : document.documentElement.scrollHeight - window.innerHeight;
      const progress = total <= 0 ? 0 : Math.min(1, Math.max(0, scrollTop / total));
      // small bottom guard so the very last frame stays reachable
      const target = progress * (video.duration - 0.04);
      current += (target - current) * 0.18; // eased follow (snappier)
      if (Math.abs(target - current) < 0.0015) current = target;
      // gate on `seeking` so we never queue a backlog of seeks -> stays smooth.
      // (Desktop repaints seeks immediately; iOS repaints them once `prime()` has run.)
      if (!video.seeking && Math.abs(video.currentTime - current) > 0.008) {
        try {
          video.currentTime = current;
        } catch {}
      }
      // Keep looping only while the eased follow or an in-flight seek still has work;
      // once settled the loop stops and the next scroll/resize wakes it.
      const settled =
        current === target && !video.seeking && Math.abs(video.currentTime - current) <= 0.008;
      if (!settled) raf = requestAnimationFrame(loop);
    };

    const wake = () => {
      if (!raf) raf = requestAnimationFrame(loop);
    };

    // On mobile, autoplay-priming would make the muted video visibly play before the
    // user ever scrolls. So mobile skips the load-time prime and primes on the first
    // touch/pointer gesture instead (listeners below); desktop primes immediately.
    const onReady = () => {
      ready = true;
      if (!isMobile) prime(); // mobile waits for the first gesture (see below)
      wake();
    };
    video.addEventListener("loadedmetadata", onReady);
    video.addEventListener("loadeddata", onReady);
    if (video.readyState >= 1) onReady();

    // Fallback for blocked autoplay (iOS Low-Power Mode, strict settings).
    const primeOnGesture = () => {
      prime();
      wake();
    };
    window.addEventListener("touchstart", primeOnGesture, { passive: true });
    window.addEventListener("pointerdown", primeOnGesture, { passive: true });

    const scrollTarget: HTMLElement | Window = scroller ?? window;
    scrollTarget.addEventListener("scroll", wake, { passive: true } as AddEventListenerOptions);
    window.addEventListener("resize", wake);
    wake();

    return () => {
      cancelAnimationFrame(raf);
      video.removeEventListener("loadedmetadata", onReady);
      video.removeEventListener("loadeddata", onReady);
      window.removeEventListener("touchstart", primeOnGesture);
      window.removeEventListener("pointerdown", primeOnGesture);
      scrollTarget.removeEventListener("scroll", wake);
      window.removeEventListener("resize", wake);
    };
  }, [isMobile, reduced]);

  return (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none" aria-hidden>
      {reduced ? (
        <img
          src="/media/hero-poster.jpg"
          alt=""
          className="h-full w-full object-cover"
        />
      ) : (
        <video
          ref={videoRef}
          className="h-full w-full object-cover [transform:translateZ(0)] [will-change:transform]"
          src={src}
          poster="/media/hero-poster.jpg"
          muted
          playsInline
          preload="auto"
          disablePictureInPicture
        />
      )}
    </div>
  );
}
