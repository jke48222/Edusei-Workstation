'use client';

import { useEffect, useRef, useState } from 'react';

/** DOM affordances inside the Overlay that should "lock" the reticle. */
const INTERACTIVE = 'a, button, [role="button"], [data-cursor="hover"]';
/** The terminal input — yield to the native caret here. */
const TEXT_FIELD = 'input, textarea, [contenteditable="true"], [data-cursor="text"]';

export interface ReticleCursorProps {
  /** Reticle + glow color (defaults to phosphor green). */
  color?: string;
  /** Base reticle size (px). */
  size?: number;
  /** Smooth follow speed (0–1, higher = snappier). */
  smooth?: number;
  zIndex?: number;
  /** Disable continuous rotation / use instant follow. */
  reducedMotion?: boolean;
}

/**
 * A sci-fi targeting reticle for the immersive Workstation. A center crosshair
 * with rotating corner brackets and a phosphor glow that picks up the active
 * theme accent. It "locks" (brackets close in, center fills) when hovering an
 * interactive DOM control or a clickable 3D object — the latter detected by
 * reading the inline `body.style.cursor` the 3D scene sets to `pointer`.
 *
 * Position and rotation are written straight to the DOM in the rAF loop (no
 * per-frame React state), so movement never triggers a re-render — only the
 * rare lock/visibility transitions do.
 */
export default function ReticleCursor({
  color = '#33FF00',
  size = 38,
  smooth = 0.28,
  zIndex = 9999,
  reducedMotion = false,
}: ReticleCursorProps) {
  const [visible, setVisible] = useState(false);
  const [locked, setLocked] = useState(false);
  const [overText, setOverText] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const gRef = useRef<SVGGElement>(null);
  const targetRef = useRef({ x: -100, y: -100 });
  const currentRef = useRef({ x: -100, y: -100 });
  const rotRef = useRef(0);
  const lockedRef = useRef(false);
  const rafRef = useRef<number>();

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      targetRef.current = { x: e.clientX, y: e.clientY };
      if (!visible) setVisible(true);
      const el = e.target as HTMLElement | null;
      setOverText(!!el?.closest?.(TEXT_FIELD));
      const domInteractive = !!el?.closest?.(INTERACTIVE);
      // The 3D scene signals a clickable object by setting body cursor to 'pointer'.
      const sceneInteractive = document.body.style.cursor === 'pointer';
      const next = domInteractive || sceneInteractive;
      lockedRef.current = next;
      setLocked(next);
    };
    const onLeave = () => setVisible(false);
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseleave', onLeave);
    return () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseleave', onLeave);
    };
  }, [visible]);

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
      const s = reducedMotion ? 1 : smooth;
      currentRef.current = { x: c.x + (t.x - c.x) * s, y: c.y + (t.y - c.y) * s };
      if (!reducedMotion) rotRef.current = (rotRef.current + 0.35) % 360;
      const node = rootRef.current;
      if (node) node.style.transform = `translate(${currentRef.current.x}px, ${currentRef.current.y}px)`;
      const g = gRef.current;
      if (g) g.style.transform = `rotate(${lockedRef.current ? rotRef.current * 0.4 : rotRef.current}deg)`;
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [smooth, reducedMotion]);

  if (!visible || overText) return null;

  const scale = locked ? 1.18 : 1;
  const bracketRot = locked ? rotRef.current * 0.4 : rotRef.current;

  return (
    <div
      ref={rootRef}
      className="pointer-events-none fixed left-0 top-0"
      style={{
        zIndex,
        transform: `translate(${currentRef.current.x}px, ${currentRef.current.y}px)`,
        willChange: 'transform',
      }}
      aria-hidden
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 40 40"
        style={{
          transform: `translate(-50%, -50%) scale(${scale})`,
          filter: `drop-shadow(0 0 ${locked ? 6 : 3}px ${color})`,
          transition: 'transform 0.18s ease, filter 0.18s ease',
          overflow: 'visible',
        }}
      >
        {/* Rotating corner brackets — the "scanning" frame. */}
        <g
          ref={gRef}
          stroke={color}
          strokeWidth={1.6}
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity={0.95}
          style={{ transform: `rotate(${bracketRot}deg)`, transformOrigin: '20px 20px' }}
        >
          <path d="M7 12 V7 H12" />
          <path d="M28 7 H33 V12" />
          <path d="M33 28 V33 H28" />
          <path d="M12 33 H7 V28" />
        </g>

        {/* Static crosshair ticks. */}
        <g stroke={color} strokeWidth={1.3} strokeLinecap="round">
          <line x1="20" y1="2" x2="20" y2="9" />
          <line x1="20" y1="31" x2="20" y2="38" />
          <line x1="2" y1="20" x2="9" y2="20" />
          <line x1="31" y1="20" x2="38" y2="20" />
        </g>

        {/* Center pip — fills when locked onto a target. */}
        <circle cx="20" cy="20" r={locked ? 3 : 1.5} fill={color} />
      </svg>
    </div>
  );
}
