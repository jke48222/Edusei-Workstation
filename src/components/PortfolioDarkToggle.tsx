/**
 * @file PortfolioDarkToggle.tsx
 * @description Light/dark toggle for the portfolio (professional) scroll view.
 * Only shown when in professional view; persists preference in themeStore.
 */

import { useThemeStore } from '../store/themeStore';

export function PortfolioDarkToggle() {
  const portfolioDark = useThemeStore((s) => s.portfolioDark);
  const setPortfolioDark = useThemeStore((s) => s.setPortfolioDark);

  return (
    <button
      type="button"
      onClick={() => setPortfolioDark(!portfolioDark)}
      aria-label={portfolioDark ? 'Switch to light mode' : 'Switch to dark mode'}
      className={
        portfolioDark
          ? 'fixed top-3 left-14 z-[110] flex h-9 w-9 items-center justify-center rounded-full border-2 border-white/20 bg-[#262626] text-white/90 shadow-lg backdrop-blur-xl transition-all hover:border-white/40 hover:bg-[#333] focus:outline-none focus-visible:ring-2 focus-visible:ring-white/30 sm:left-auto sm:right-[13.55rem]'
          : 'fixed top-3 left-14 z-[110] flex h-9 w-9 items-center justify-center rounded-full border-2 border-[#0a0a0a]/20 bg-white text-[#0a0a0a]/80 shadow-lg backdrop-blur-xl transition-all hover:border-[#0a0a0a]/40 hover:bg-[#f0f0f0] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0a0a0a]/30 sm:left-auto sm:right-[13.55rem]'
      }
    >
      {portfolioDark ? (
        <SunIcon className="h-4 w-4" />
      ) : (
        <MoonIcon className="h-4 w-4" />
      )}
    </button>
  );
}

function SunIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
    </svg>
  );
}

function MoonIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}
