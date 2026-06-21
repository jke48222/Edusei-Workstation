import { useEffect, useRef } from "react";

/**
 * Fixed, full-viewport background video scrubbed by page scroll.
 * A rAF loop eases video.currentTime toward (scrollProgress * duration).
 * Reduced-motion users get a static poster frame only.
 *
 * The landing IS the whole-document scroll container at `/`, so this maps
 * window.scrollY → clip time directly.
 */
export default function ScrubVideo() {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return; // poster frame only

    let raf = 0;
    let current = 0;
    let ready = false;

    const onMeta = () => {
      ready = true;
      try {
        video.pause();
      } catch {}
    };
    video.addEventListener("loadedmetadata", onMeta);
    if (video.readyState >= 1) onMeta();

    const loop = () => {
      raf = requestAnimationFrame(loop);
      if (!ready || !video.duration || !isFinite(video.duration)) return;
      // The landing scrolls inside #landing-scroll (a fixed container), not the window.
      const scroller = document.getElementById("landing-scroll");
      const scrollTop = scroller ? scroller.scrollTop : window.scrollY;
      const total = scroller
        ? scroller.scrollHeight - scroller.clientHeight
        : document.documentElement.scrollHeight - window.innerHeight;
      const progress = total <= 0 ? 0 : Math.min(1, Math.max(0, scrollTop / total));
      // small bottom guard so the very last frame stays reachable
      const target = progress * (video.duration - 0.04);
      current += (target - current) * 0.18; // eased follow (snappier)
      if (Math.abs(target - current) < 0.0015) current = target;
      // gate on `seeking` so we never queue a backlog of seeks -> stays smooth
      if (!video.seeking && Math.abs(video.currentTime - current) > 0.008) {
        try {
          video.currentTime = current;
        } catch {}
      }
    };
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      video.removeEventListener("loadedmetadata", onMeta);
    };
  }, []);

  return (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none" aria-hidden>
      <video
        ref={videoRef}
        className="h-full w-full object-cover [transform:translateZ(0)] [will-change:transform]"
        src="/media/hero.mp4"
        poster="/media/hero-poster.jpg"
        muted
        playsInline
        preload="auto"
        disablePictureInPicture
      />
    </div>
  );
}
