/**
 * @file ThemeSelector.tsx
 * @description Theme picker UI: dropdown of presets (clean, classic, blue, etc.). Position
 * differs by viewport (mobile: top-right near ModeToggle; desktop: top-left). Uses
 * themeStore and themePresets from themeStore.
 */

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useThemeStore, themePresets } from '../store/themeStore';

/** Order of theme presets in the dropdown. */
const presetOrder = ['clean', 'classic', 'blue', 'pink', 'purple', 'uga', 'grayBlue'];

const previewColors: Record<string, string> = {
  clean: '#ffffff',
  classic: '#4ade80',
  blue: '#90c9f5',
  pink: '#f5bcce',
  purple: '#cbbcf5',
  uga: '#BA0C2F',
  grayBlue: '#6b8ab8',
};

export function ThemeSelector() {
  const { activeTheme, setTheme } = useThemeStore();
  const [expanded, setExpanded] = useState(false);
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth < 640 : false
  );

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640);
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  return (
    <motion.div
      className={`fixed z-50 ${
        isMobile
          ? 'top-16 right-5'
          : 'top-4 left-4'
      }`}
      initial={{ opacity: 0, x: isMobile ? 20 : -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 1, duration: 0.4 }}
    >
      {/* Toggle button — same size as ModeToggle on mobile (gap-2.5 px-3 py-2 text-[11px]) */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-2.5 rounded-full border border-white/10 bg-black/30 px-3 py-2 text-[11px] font-mono backdrop-blur-md transition-all hover:bg-black/40"
        title="Change theme"
      >
        <span
          className="h-4 w-4 rounded-full border border-white/20"
          style={{ backgroundColor: previewColors[activeTheme] }}
        />
        <span className="font-mono text-[10px] text-white/60 hidden sm:inline">
          {themePresets[activeTheme]?.name}
        </span>
        <svg
          className={`h-3 w-3 text-white/40 transition-transform ${expanded ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className={`mt-2 rounded-xl border border-white/10 bg-black/60 p-2 backdrop-blur-xl ${
              isMobile ? 'absolute right-0' : ''
            }`}
          >
            <div className="space-y-0.5">
              {presetOrder.map((id) => {
                const preset = themePresets[id];
                const isActive = activeTheme === id;
                return (
                  <button
                    key={id}
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
                      style={{ backgroundColor: previewColors[id] }}
                    />
                    <span className={`font-mono text-[11px] ${isActive ? 'text-white' : 'text-white/60'}`}>
                      {preset.name}
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
