'use client';

import { useRef, useEffect } from 'react';

/** Elements that should grow the ring (clickable affordances). */
const INTERACTIVE = 'a, button, [role="button"], summary, label[for], [data-cursor="hover"]';
/** Elements that should yield to the native text caret (cursor hides itself). */
const TEXT_FIELD = 'input, textarea, select, [contenteditable="true"], [data-cursor="text"]';

export interface DotRingCursorProps {
  /** Outer ring size (px). */
  ringSize?: number;
  /** Inner dot size (px). */
  dotSize?: number;
  /** Ring border width (px). */
  ringStroke?: number;
  /** Ring color (e.g. currentColor or hex). */
  ringColor?: string;
  /** Dot fill color. */
  dotColor?: string;
  /** Color the ring/dot take when hovering an interactive element. */
  hoverColor?: string;
  /** Smooth follow speed (0–1, higher = snappier). */
  smooth?: number;
  zIndex?: number;
  /** Use dark-mode colors (light ring/dot on dark bg). */
  dark?: boolean;
}

/**
 * A minimal "dot + trailing ring" cursor for the professional portfolio.
 *
 * Fully imperative: the component renders its structure once and then never
 * re-renders. `mousemove` only records the pointer target (cheap), and the rAF
 * loop does everything else — easing the position, and (only when the element
 * under the pointer changes) recomputing hover/text state and applying it via
 * direct DOM writes. This keeps fast, bursty mouse movement off the React
 * render path entirely, so the cursor never stutters.
 */
export default function DotRingCursor({
  ringSize = 30,
  dotSize = 5,
  ringStroke = 1.5,
  ringColor,
  dotColor,
  hoverColor,
  smooth = 0.18,
  zIndex = 9999,
  dark = false,
}: DotRingCursorProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);
  const targetRef = useRef({ x: -100, y: -100 });
  const currentRef = useRef({ x: -100, y: -100 });
  const elRef = useRef<HTMLElement | null>(null);
  const lastElRef = useRef<HTMLElement | null | undefined>(undefined);
  const visibleRef = useRef(false);
  const overTextRef = useRef(false);
  const hoverRef = useRef(false);
  const shownRef = useRef(false);
  const rafRef = useRef<number>();

  const ring = ringColor ?? (dark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)');
  const dot = dotColor ?? (dark ? 'rgba(255,255,255,0.95)' : 'rgba(0,0,0,0.9)');
  const accent = hoverColor ?? ring;

  // Latest tuning in a ref so the rAF loop never has to restart on prop changes.
  const cfg = useRef({ smooth, ring, dot, accent });
  cfg.current = { smooth, ring, dot, accent };

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      targetRef.current = { x: e.clientX, y: e.clientY };
      elRef.current = e.target as HTMLElement | null;
      visibleRef.current = true;
    };
    const onLeave = () => {
      visibleRef.current = false;
    };
    document.addEventListener('mousemove', onMove, { passive: true });
    document.addEventListener('mouseleave', onLeave);

    const applyShow = (show: boolean) => {
      const root = rootRef.current;
      if (root) root.style.opacity = show ? '1' : '0';
      const cls = document.documentElement.classList;
      if (show) cls.add('cursor-hidden');
      else cls.remove('cursor-hidden');
    };
    const applyHover = (hover: boolean) => {
      const { ring, dot, accent } = cfg.current;
      const r = ringRef.current;
      const d = dotRef.current;
      if (r) {
        r.style.transform = `scale(${hover ? 1.6 : 1})`;
        r.style.borderColor = hover ? accent : ring;
        r.style.backgroundColor = hover ? `color-mix(in srgb, ${accent} 12%, transparent)` : 'transparent';
      }
      if (d) {
        d.style.backgroundColor = dot;
        d.style.opacity = hover ? '0' : '1';
      }
    };

    const tick = () => {
      const t = targetRef.current;
      const c = currentRef.current;
      const { smooth } = cfg.current;
      if (Math.abs(t.x - c.x) < 0.5 && Math.abs(t.y - c.y) < 0.5) {
        currentRef.current = { x: t.x, y: t.y };
      } else {
        currentRef.current = { x: c.x + (t.x - c.x) * smooth, y: c.y + (t.y - c.y) * smooth };
      }
      const root = rootRef.current;
      if (root) root.style.transform = `translate(${currentRef.current.x}px, ${currentRef.current.y}px)`;

      // Hover/text detection runs only when the element under the pointer changes.
      const el = elRef.current;
      if (el !== lastElRef.current) {
        lastElRef.current = el;
        overTextRef.current = !!el?.closest?.(TEXT_FIELD);
        const hover = !overTextRef.current && !!el?.closest?.(INTERACTIVE);
        if (hover !== hoverRef.current) {
          hoverRef.current = hover;
          applyHover(hover);
        }
      }

      // Visibility (enter/leave + over-text) — trivial boolean check each frame.
      const show = visibleRef.current && !overTextRef.current;
      if (show !== shownRef.current) {
        shownRef.current = show;
        applyShow(show);
      }

      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);

    return () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseleave', onLeave);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      document.documentElement.classList.remove('cursor-hidden');
    };
  }, []);

  return (
    <div
      ref={rootRef}
      className="pointer-events-none fixed left-0 top-0"
      style={{
        zIndex,
        transform: 'translate(-100px, -100px)',
        opacity: 0,
        willChange: 'transform',
        transition: 'opacity 0.15s ease',
      }}
      aria-hidden
    >
      <div
        ref={ringRef}
        style={{
          width: ringSize,
          height: ringSize,
          marginLeft: -ringSize / 2,
          marginTop: -ringSize / 2,
          border: `${ringStroke}px solid ${ring}`,
          borderRadius: '50%',
          transform: 'scale(1)',
          backgroundColor: 'transparent',
          transition: 'transform 0.2s ease, border-color 0.2s ease, background-color 0.2s ease',
        }}
      />
      <div
        ref={dotRef}
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          width: dotSize,
          height: dotSize,
          marginLeft: -dotSize / 2,
          marginTop: -dotSize / 2,
          borderRadius: '50%',
          backgroundColor: dot,
          opacity: 1,
          transition: 'opacity 0.2s ease, background-color 0.2s ease',
        }}
      />
    </div>
  );
}
