'use client';

import { useRef, useEffect, useState, useCallback } from 'react';

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
 * The dot tracks the pointer 1:1; the ring eases behind it. The ring grows and
 * the dot fades when hovering links/buttons, and the whole cursor hides over
 * text fields so the native caret can show through.
 *
 * Position is written straight to the DOM in the rAF loop (no per-frame React
 * state) so the cursor never triggers a re-render while moving — only the rare
 * hover/visibility transitions re-render.
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
  const [visible, setVisible] = useState(false);
  const [hovering, setHovering] = useState(false);
  const [overText, setOverText] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number>();
  const targetRef = useRef({ x: -100, y: -100 });
  const currentRef = useRef({ x: -100, y: -100 });

  const ring = ringColor ?? (dark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)');
  const dot = dotColor ?? (dark ? 'rgba(255,255,255,0.95)' : 'rgba(0,0,0,0.9)');
  const accent = hoverColor ?? ring;

  const handleMove = useCallback((e: MouseEvent) => {
    targetRef.current = { x: e.clientX, y: e.clientY };
    if (!visible) setVisible(true);
    const el = e.target as HTMLElement | null;
    // React bails on unchanged primitives, so these only re-render on transitions.
    setOverText(!!el?.closest?.(TEXT_FIELD));
    setHovering(!!el?.closest?.(INTERACTIVE));
  }, [visible]);

  const handleLeave = useCallback(() => setVisible(false), []);

  useEffect(() => {
    document.addEventListener('mousemove', handleMove);
    document.addEventListener('mouseleave', handleLeave);
    return () => {
      document.removeEventListener('mousemove', handleMove);
      document.removeEventListener('mouseleave', handleLeave);
    };
  }, [handleMove, handleLeave]);

  // Hide the native cursor only while ours is on-screen and not over a text field.
  useEffect(() => {
    const root = document.documentElement;
    if (visible && !overText) root.classList.add('cursor-hidden');
    else root.classList.remove('cursor-hidden');
    return () => root.classList.remove('cursor-hidden');
  }, [visible, overText]);

  useEffect(() => {
    const tick = () => {
      const t = targetRef.current;
      const c = currentRef.current;
      const dx = (t.x - c.x) * smooth;
      const dy = (t.y - c.y) * smooth;
      if (Math.abs(dx) < 0.5 && Math.abs(dy) < 0.5) {
        currentRef.current = { x: t.x, y: t.y };
      } else {
        currentRef.current = { x: c.x + dx, y: c.y + dy };
      }
      const node = rootRef.current;
      if (node) node.style.transform = `translate(${currentRef.current.x}px, ${currentRef.current.y}px)`;
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [smooth]);

  // Over text fields we defer entirely to the native caret.
  if (!visible || overText) return null;

  const ringScale = hovering ? 1.6 : 1;
  const ringCol = hovering ? accent : ring;

  return (
    <div
      ref={rootRef}
      className="pointer-events-none fixed left-0 top-0"
      style={{
        zIndex,
        // Seed from the live position so the first paint isn't at the origin.
        transform: `translate(${currentRef.current.x}px, ${currentRef.current.y}px)`,
        willChange: 'transform',
      }}
      aria-hidden
    >
      <div
        style={{
          width: ringSize,
          height: ringSize,
          marginLeft: -ringSize / 2,
          marginTop: -ringSize / 2,
          border: `${ringStroke}px solid ${ringCol}`,
          borderRadius: '50%',
          transform: `scale(${ringScale})`,
          backgroundColor: hovering ? 'color-mix(in srgb, ' + accent + ' 12%, transparent)' : 'transparent',
          transition: 'transform 0.2s ease, border-color 0.2s ease, background-color 0.2s ease',
        }}
      />
      <div
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
          opacity: hovering ? 0 : 1,
          transition: 'opacity 0.2s ease, background-color 0.2s ease',
        }}
      />
    </div>
  );
}
