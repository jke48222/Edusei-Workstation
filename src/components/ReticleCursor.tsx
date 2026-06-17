'use client';

import { useEffect, useRef } from 'react';

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
 * Fully imperative: renders once, then never re-renders. `mousemove` only
 * records the pointer target; the rAF loop eases position, spins the brackets,
 * and (only on element change) updates the lock state via direct DOM writes —
 * keeping bursty mouse movement off the React render path so it never stutters.
 */
export default function ReticleCursor({
  color = '#33FF00',
  size = 38,
  smooth = 0.28,
  zIndex = 9999,
  reducedMotion = false,
}: ReticleCursorProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const gRef = useRef<SVGGElement>(null);
  const pipRef = useRef<SVGCircleElement>(null);
  const targetRef = useRef({ x: -100, y: -100 });
  const currentRef = useRef({ x: -100, y: -100 });
  const rotRef = useRef(0);
  const elRef = useRef<HTMLElement | null>(null);
  const lastElRef = useRef<HTMLElement | null | undefined>(undefined);
  const visibleRef = useRef(false);
  const overTextRef = useRef(false);
  const lockedRef = useRef(false);
  const shownRef = useRef(false);
  const rafRef = useRef<number>();

  const cfg = useRef({ smooth, color, reducedMotion });
  cfg.current = { smooth, color, reducedMotion };

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
    const applyLock = (locked: boolean) => {
      const { color } = cfg.current;
      const svg = svgRef.current;
      const pip = pipRef.current;
      if (svg) {
        svg.style.transform = `translate(-50%, -50%) scale(${locked ? 1.18 : 1})`;
        svg.style.filter = `drop-shadow(0 0 ${locked ? 6 : 3}px ${color})`;
      }
      if (pip) pip.setAttribute('r', locked ? '3' : '1.5');
    };

    const tick = () => {
      const t = targetRef.current;
      const c = currentRef.current;
      const { smooth, reducedMotion } = cfg.current;
      const s = reducedMotion ? 1 : smooth;
      currentRef.current = { x: c.x + (t.x - c.x) * s, y: c.y + (t.y - c.y) * s };
      if (!reducedMotion) rotRef.current = (rotRef.current + 0.35) % 360;

      const root = rootRef.current;
      if (root) root.style.transform = `translate(${currentRef.current.x}px, ${currentRef.current.y}px)`;
      const g = gRef.current;
      if (g) g.style.transform = `rotate(${lockedRef.current ? rotRef.current * 0.4 : rotRef.current}deg)`;

      const el = elRef.current;
      if (el !== lastElRef.current) {
        lastElRef.current = el;
        overTextRef.current = !!el?.closest?.(TEXT_FIELD);
        const domInteractive = !!el?.closest?.(INTERACTIVE);
        const sceneInteractive = document.body.style.cursor === 'pointer';
        const locked = !overTextRef.current && (domInteractive || sceneInteractive);
        if (locked !== lockedRef.current) {
          lockedRef.current = locked;
          applyLock(locked);
        }
      }

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
      style={{ zIndex, transform: 'translate(-100px, -100px)', opacity: 0, willChange: 'transform', transition: 'opacity 0.15s ease' }}
      aria-hidden
    >
      <svg
        ref={svgRef}
        width={size}
        height={size}
        viewBox="0 0 40 40"
        style={{
          transform: 'translate(-50%, -50%) scale(1)',
          filter: `drop-shadow(0 0 3px ${color})`,
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
          style={{ transformOrigin: '20px 20px' }}
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
        <circle ref={pipRef} cx="20" cy="20" r="1.5" fill={color} />
      </svg>
    </div>
  );
}
