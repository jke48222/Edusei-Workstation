/**
 * @file Motifs.tsx
 * @description Custom SVG motif set — the connective "character" tissue used as
 * section markers, dividers, and accents across the redesigned portfolio. Each motif
 * inherits `currentColor` so it adapts to accent / ink contexts.
 *
 * The marks nod to Jalen's domains: circuits (embedded), waveforms (signal/DSP/music),
 * orbits (CubeSat/space), spirit (the 3D oasis world), and a terminal caret (the
 * workstation identity).
 */

type MotifProps = { className?: string; strokeWidth?: number };

export function CircuitMotif({ className, strokeWidth = 1.5 }: MotifProps) {
  return (
    <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth={strokeWidth} className={className} aria-hidden>
      <path d="M4 24h10m20 0h10M24 4v10m0 20v10" strokeLinecap="round" />
      <rect x="14" y="14" width="20" height="20" rx="4" />
      <circle cx="24" cy="24" r="3.5" fill="currentColor" stroke="none" />
      <circle cx="4" cy="24" r="2" fill="currentColor" stroke="none" />
      <circle cx="44" cy="24" r="2" fill="currentColor" stroke="none" />
      <circle cx="24" cy="4" r="2" fill="currentColor" stroke="none" />
      <circle cx="24" cy="44" r="2" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function WaveMotif({ className, strokeWidth = 1.5 }: MotifProps) {
  return (
    <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth={strokeWidth} className={className} aria-hidden>
      <path d="M2 24c4 0 4-14 8-14s4 28 8 28 4-22 8-22 4 16 8 16 4-8 8-8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function OrbitMotif({ className, strokeWidth = 1.5 }: MotifProps) {
  return (
    <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth={strokeWidth} className={className} aria-hidden>
      <circle cx="24" cy="24" r="6" />
      <ellipse cx="24" cy="24" rx="20" ry="9" />
      <ellipse cx="24" cy="24" rx="20" ry="9" transform="rotate(60 24 24)" />
      <circle cx="44" cy="24" r="2.5" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function SpiritMotif({ className, strokeWidth = 1.5 }: MotifProps) {
  return (
    <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth={strokeWidth} className={className} aria-hidden>
      <path d="M24 4c6 8 12 12 12 22a12 12 0 1 1-24 0c0-10 6-14 12-22Z" strokeLinejoin="round" />
      <path d="M24 18v18M24 26l-5-5M24 30l5-5" strokeLinecap="round" />
    </svg>
  );
}

export function CaretMotif({ className, strokeWidth = 1.5 }: MotifProps) {
  return (
    <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth={strokeWidth} className={className} aria-hidden>
      <path d="M10 14l10 10-10 10M24 34h14" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** Decorative divider: a thin animated rule with a centered motif. */
export function MotifDivider({ className = '' }: { className?: string }) {
  return (
    <div className={`flex items-center gap-4 ${className}`} aria-hidden>
      <span className="h-px flex-1 bg-gradient-to-r from-transparent via-[var(--pf-line)] to-[var(--pf-line)]" />
      <WaveMotif className="h-5 w-5 text-[var(--pf-accent)]" />
      <span className="h-px flex-1 bg-gradient-to-l from-transparent via-[var(--pf-line)] to-[var(--pf-line)]" />
    </div>
  );
}
