import { useEffect, useRef, useState } from "react";

/** Adds `.is-visible` when the element scrolls into view (one-shot). */
export function useInView<T extends HTMLElement = HTMLDivElement>(
  options: IntersectionObserverInit = { threshold: 0.18, rootMargin: "0px 0px -8% 0px" }
) {
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      setInView(true);
      return;
    }
    const obs = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          setInView(true);
          obs.unobserve(e.target);
        }
      });
    }, options);
    obs.observe(el);
    return () => obs.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { ref, inView };
}

/** 0→1 scroll progress over a given element (defaults to whole document). */
export function useScrollProgress(targetRef?: React.RefObject<HTMLElement | null>) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let raf = 0;
    const compute = () => {
      raf = 0;
      if (targetRef?.current) {
        const el = targetRef.current;
        const rect = el.getBoundingClientRect();
        const total = rect.height - window.innerHeight;
        const passed = -rect.top;
        setProgress(total <= 0 ? 0 : Math.min(1, Math.max(0, passed / total)));
      } else {
        const total = document.documentElement.scrollHeight - window.innerHeight;
        setProgress(total <= 0 ? 0 : Math.min(1, Math.max(0, window.scrollY / total)));
      }
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(compute);
    };
    compute();
    // The landing scrolls inside #landing-scroll (a fixed container), not the window.
    const scroller = document.getElementById("landing-scroll");
    const scrollTarget: Window | HTMLElement = scroller ?? window;
    scrollTarget.addEventListener("scroll", onScroll, { passive: true } as AddEventListenerOptions);
    window.addEventListener("resize", onScroll);
    return () => {
      scrollTarget.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [targetRef]);

  return progress;
}

export function prefersReducedMotion() {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
