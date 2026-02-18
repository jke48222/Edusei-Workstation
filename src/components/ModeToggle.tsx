/**
 * @file ModeToggle.tsx
 * @description Toggle between professional (portfolio) and immersive (3D workstation) view.
 * Uses active theme for styling in immersive mode; fixed top-right placement.
 */

import { useCallback } from 'react';
import { useViewMode, useWorkstationStore, type ViewMode } from '../store/store';
import { useActiveTheme } from '../store/themeStore';

/** Fixed top-right switch: Portfolio (professional) vs 3D Workstation (immersive). */
export function ModeToggle() {
  const viewMode = useViewMode();
  const setViewMode = useWorkstationStore((state) => state.setViewMode);
  const theme = useActiveTheme();

  const isPro = viewMode === 'professional';

  const handleToggle = useCallback(() => {
    const next: ViewMode = isPro ? 'immersive' : 'professional';
    setViewMode(next);
  }, [setViewMode, isPro]);

  return (
    <div className="fixed top-3 right-5 z-[110] pointer-events-auto">
      <button
        type="button"
        onClick={handleToggle}
        role="switch"
        aria-checked={isPro}
        aria-label={isPro ? 'View mode: Portfolio. Switch to Workstation.' : 'View mode: Workstation. Switch to Portfolio.'}
        className={`group flex h-9 items-center gap-2.5 rounded-full px-3 text-[11px] font-mono backdrop-blur-xl transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0a0a0a]/30 dark:focus-visible:ring-white/30 ${
          isPro
            ? 'border-2 border-[#0a0a0a]/20 bg-white text-[#0a0a0a]/80 shadow-lg dark:border-white/20 dark:bg-[#262626] dark:text-white/90 hover:border-[#0a0a0a]/40 hover:bg-[#f0f0f0 dark:hover:border-white/40 dark:hover:bg-[#333]'
            : 'py-2'
        }`}
        style={
          isPro
            ? undefined
            : {
                border: `1px solid ${theme.accent}40`,
                backgroundColor: `${theme.terminalBg}cc`,
                color: theme.accent,
              }
        }
      >
        {/* Label — in pro view inherits button text color; in workstation view uses theme accent */}
        <span className="hidden sm:inline" style={isPro ? undefined : { color: theme.accent }}>
          {isPro ? 'Workstation' : 'Portfolio'}
        </span>

        {/* iOS-style switch track */}
        <span
          className="relative inline-flex h-5 w-9 items-center rounded-full transition-colors duration-200"
          style={{
            backgroundColor: isPro ? '#0a0a0a' : theme.accent,
          }}
        >
          <span
            className="inline-block h-3.5 w-3.5 rounded-full shadow-sm transform transition-transform duration-200"
            style={{
              transform: isPro ? 'translateX(18px)' : 'translateX(3px)',
              backgroundColor: isPro ? '#ffffff' : theme.terminalBg,
            }}
          />
        </span>
      </button>
    </div>
  );
}
