/**
 * @file ThemeSelector.tsx
 * @description Theme picker UI: dropdown of presets (clean, classic, blue, etc.). Position
 * differs by viewport (mobile: top-right near ModeToggle; desktop: top-left). Uses
 * themeStore and themePresets from themeStore.
 */

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useWorkstationStore } from '../store/store';
import { useThemeStore, themePresets, useActiveTheme, useResolvedThemeId, SYSTEM_THEME_ID } from '../store/themeStore';

/** Order of theme presets in the dropdown. System first, then light (Modern) and dark, then rest. */
const presetOrder = [SYSTEM_THEME_ID, 'clean', 'dark', 'classic', 'blue', 'pink', 'purple', 'uga', 'grayBlue'];

const previewColors: Record<string, string> = {
  [SYSTEM_THEME_ID]: '#71717a',
  clean: '#ffffff',
  dark: '#262626',
  classic: '#4ade80',
  blue: '#90c9f5',
  pink: '#f5bcce',
  purple: '#cbbcf5',
  uga: '#BA0C2F',
  grayBlue: '#8a9bb5',
  gold: '#daa520',
};

const themeDisplayNames: Record<string, string> = {
  [SYSTEM_THEME_ID]: 'System',
};

export function ThemeSelector() {
  const { activeTheme, setTheme } = useThemeStore();
  const resolvedId = useResolvedThemeId();
  const theme = useActiveTheme();
  const prefersReducedMotion = useWorkstationStore((s) => s.prefersReducedMotion);
  const [expanded, setExpanded] = useState(false);
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth < 640 : false
  );

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640);
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  const circleColor = activeTheme === 'classic' ? theme.text : previewColors[resolvedId] ?? previewColors[activeTheme] ?? theme.accent;
  const motionTransition = prefersReducedMotion ? { delay: 0, duration: 0 } : { delay: 0.2, duration: 0.25 };

  return (
    <motion.div
      className={`fixed z-[100] isolate ${
        isMobile
          ? 'top-[3.25rem] right-5'
          : 'top-4 left-6'
      }`}
      initial={prefersReducedMotion ? false : { opacity: 0, x: isMobile ? 20 : -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={motionTransition}
    >
      {/* Toggle button — clean: black bg; uga: white bg + black border; other: transparent */}
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        aria-expanded={expanded}
        aria-haspopup="listbox"
        aria-controls="theme-selector-listbox"
        aria-label={`Theme: ${themeDisplayNames[activeTheme] ?? themePresets[activeTheme]?.name ?? activeTheme}. ${expanded ? 'Close menu' : 'Open theme menu'}.`}
        className={`relative z-10 flex items-center gap-1.5 rounded-full border px-3 py-2 text-[11px] font-mono transition-all ${
          activeTheme === 'clean' || (activeTheme === SYSTEM_THEME_ID && resolvedId === 'clean')
            ? 'border-white/20 bg-[#333333] hover:bg-[#404040] text-white'
            : activeTheme === 'uga'
              ? 'border-black bg-white hover:bg-[#f0f0f0]'
              : activeTheme === 'gold'
                ? 'border-[#b8860b] bg-[#2a2218] hover:bg-[#352a1a] text-[#f4e4bc]'
                : activeTheme === 'dark' || (activeTheme === SYSTEM_THEME_ID && resolvedId === 'dark')
                  ? 'border-white/20 bg-[#171717] hover:bg-[#262626]'
                  : 'border-transparent bg-transparent hover:bg-transparent'
        }`}
        title="Change theme"
      >
        <span
          className="h-4 w-4 shrink-0 rounded-full border border-white/20"
          style={{ backgroundColor: circleColor }}
        />
        <span className="font-mono text-[10px] hidden sm:inline" style={{ color: (activeTheme === 'clean' || (activeTheme === SYSTEM_THEME_ID && resolvedId === 'clean')) ? '#ffffff' : activeTheme === 'classic' ? theme.text : (resolvedId === 'dark' ? '#fafafa' : circleColor) }}>
          {themeDisplayNames[activeTheme] ?? themePresets[activeTheme]?.name}
        </span>
        <svg
          className={`h-3 w-3 transition-transform ${expanded ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          style={{ color: (activeTheme === 'dark' || (activeTheme === SYSTEM_THEME_ID && resolvedId === 'dark') || activeTheme === 'clean' || (activeTheme === SYSTEM_THEME_ID && resolvedId === 'clean')) ? '#fafafa' : circleColor }}
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            id="theme-selector-listbox"
            role="listbox"
            aria-label="Theme options"
            initial={prefersReducedMotion ? false : { opacity: 0, y: -8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={prefersReducedMotion ? undefined : { opacity: 0, y: -8, scale: 0.95 }}
            transition={{ duration: prefersReducedMotion ? 0 : 0.15 }}
            className={`mt-2 rounded-xl border border-white/10 bg-black/60 p-2 backdrop-blur-xl ${
              isMobile ? 'absolute right-0' : ''
            }`}
          >
            <div className="space-y-0.5">
              {presetOrder.map((id) => {
                const preset = themePresets[id];
                const displayName = themeDisplayNames[id] ?? preset?.name ?? id;
                const dotColor = id === 'classic' && preset ? preset.text : previewColors[id];
                const isActive = activeTheme === id;
                return (
                  <button
                    key={id}
                    type="button"
                    role="option"
                    aria-selected={isActive}
                    aria-current={isActive ? 'true' : undefined}
                    onClick={() => {
                      setTheme(id);
                      setExpanded(false);
                    }}
                    className={`
                      flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left
                      transition-colors whitespace-nowrap
                      ${isActive ? 'bg-white/15' : 'hover:bg-white/8'}
                    `}
                  >
                    <span
                      className="h-3.5 w-3.5 shrink-0 rounded-full border border-white/20"
                      style={{ backgroundColor: dotColor }}
                    />
                    <span className={`font-mono text-[11px] ${isActive ? 'text-white' : 'text-white/60'}`}>
                      {displayName}
                    </span>
                    {isActive && (
                      <svg className="ml-auto h-3 w-3 text-white/60" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
