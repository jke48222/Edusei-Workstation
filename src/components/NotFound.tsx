/**
 * @file NotFound.tsx
 * @description Custom 404 page themed to the 3D workstation: terminal-style layout with link back home.
 */

import { Link, useNavigate } from 'react-router-dom';
import { useWorkstationStore } from '../store/store';

export function NotFound() {
  const navigate = useNavigate();
  const setViewMode = useWorkstationStore((s) => s.setViewMode);

  const goTo = (mode: 'professional' | 'immersive') => {
    setViewMode(mode);
    navigate('/', { replace: true });
  };

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[#0a0a0a] px-6 font-mono text-[#fafafa]">
      {/* Faint purple/cyan hue (matches Hero background) */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-90"
        style={{
          background:
            'radial-gradient(ellipse 80% 60% at 75% 25%, rgba(168,85,247,0.08) 0%, transparent 60%), radial-gradient(ellipse 60% 50% at 15% 75%, rgba(6,182,212,0.06) 0%, transparent 60%)',
        }}
      />
      {/* Subtle grid (workstation-style) */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.15]"
        style={{
          backgroundImage: 'radial-gradient(circle, #525252 0.8px, transparent 0.8px)',
          backgroundSize: '20px 20px',
        }}
      />
      {/* Top accent line (terminal bar) */}
      <div className="absolute left-0 right-0 top-0 h-px bg-gradient-to-r from-transparent via-[#404040] to-transparent" />

      <div className="relative z-10 flex flex-col items-center gap-8 text-center">
        <p className="text-[11px] uppercase tracking-[0.3em] text-[#a3a3a3]">Error</p>
        <p className="font-mono text-[clamp(4rem,20vw,10rem)] font-bold leading-none tracking-tighter text-[#fafafa]/90">
          404
        </p>
        <p className="max-w-sm text-sm text-[#a3a3a3]">
          This URL doesn’t exist. The page may have moved or you followed a broken link.
        </p>

        <div className="flex flex-col items-center gap-4 sm:flex-row sm:gap-3">
          <Link
            to="/"
            onClick={() => setViewMode('professional')}
            className="rounded-full bg-[#fafafa] px-6 py-3 text-sm font-medium text-[#0a0a0a] transition-transform hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#fafafa]/50"
          >
            Back to home
          </Link>
          <span className="text-[#525252]">·</span>
          <div className="flex flex-wrap justify-center gap-2">
            <button
              type="button"
              onClick={() => goTo('professional')}
              className="rounded-full border border-[#404040] px-4 py-2 text-xs text-[#fafafa]/80 transition-colors hover:border-[#737373] hover:bg-white/5"
            >
              Portfolio
            </button>
            <button
              type="button"
              onClick={() => goTo('immersive')}
              className="rounded-full border border-[#404040] px-4 py-2 text-xs text-[#fafafa]/80 transition-colors hover:border-[#737373] hover:bg-white/5"
            >
              3D Workstation
            </button>
          </div>
        </div>
      </div>

      {/* Bottom line */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#404040] to-transparent" />
    </div>
  );
}
