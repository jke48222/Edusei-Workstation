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
    <div className="fixed top-5 right-5 z-50 pointer-events-auto">
      <button
        type="button"
        onClick={handleToggle}
        role="switch"
        aria-checked={isPro}
        aria-label="Toggle view mode"
        className="group flex items-center gap-2.5 rounded-full px-3 py-2 text-[11px] font-mono backdrop-blur-xl transition-all duration-200 focus:outline-none focus-visible:ring-2"
        style={
          isPro
            ? {
                border: '1px solid rgba(10,10,10,0.1)',
                backgroundColor: 'rgba(255,255,255,0.8)',
                color: 'rgba(10,10,10,0.6)',
                boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
              }
            : {
                border: `1px solid ${theme.accent}40`,
                backgroundColor: `${theme.terminalBg}cc`,
                color: theme.textDim,
              }
        }
      >
        {/* Label */}
        <span className="hidden sm:inline">
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
