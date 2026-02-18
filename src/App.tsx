/**
 * @file App.tsx
 * @description Root application component. Renders either the immersive 3D workstation
 * or the professional portfolio view based on view mode. Includes cinematic loading
 * screen, theme-aware layout, and top-level headshot in professional mode.
 */

import { Suspense, useCallback, useEffect, useLayoutEffect, useState } from 'react';
import { Analytics } from '@vercel/analytics/react';
import { Experience } from './components/Experience';
import { Overlay } from './components/Overlay';
import { useKonamiCode } from './hooks/useKonamiCode';
import { usePrefersReducedMotion } from './hooks/useIsMobile';
import { useWorkstationStore, useViewMode } from './store/store';
import { useActiveTheme, useThemeStore, useResolvedThemeId, SYSTEM_THEME_ID } from './store/themeStore';
import { ModeToggle } from './components/ModeToggle';
import { PortfolioDarkToggle } from './components/PortfolioDarkToggle';
import { PortfolioSearch } from './components/PortfolioSearch';
import { ProfessionalView } from './components/professional/ProfessionalView';
import { ThemeSelector } from './components/ThemeSelector';
import { profileData } from './data';

const LOADING_STEPS = [
  'Initializing…',
  'Loading 3D models…',
  'Loading textures…',
  'Starting workstation…',
];

/** Loading screen with progress bar and step list while the 3D experience loads. */
function LoadingFallback() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((p) => Math.min(100, p + 3 + Math.random() * 5));
    }, 350);
    return () => clearInterval(interval);
  }, []);

  const displayProgress = Math.min(99, progress);
  const stepIndex = Math.min(
    LOADING_STEPS.length - 1,
    Math.floor((displayProgress / 100) * LOADING_STEPS.length)
  );

  return (
    <div className="fixed inset-0 bg-[#0a0a0a] flex flex-col items-center z-[100]">
      <div className="flex-1 w-full max-w-md flex flex-col items-center justify-center px-6 pt-24">
        <div className="font-mono text-xs text-white/40 uppercase tracking-wider mb-4">
          Loading workstation
        </div>
        <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden mb-6">
          <div
            className="h-full bg-white/70 rounded-full transition-all duration-300 ease-out"
            style={{ width: `${displayProgress}%` }}
          />
        </div>
        <ul className="font-mono text-sm text-white/50 space-y-1.5 list-none p-0 m-0">
          {LOADING_STEPS.map((label, i) => (
            <li
              key={label}
              className={i === stepIndex ? 'text-white/80' : i < stepIndex ? 'text-white/50' : 'text-white/30'}
            >
              {i < stepIndex ? '✓' : i === stepIndex ? '…' : '○'} {label}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

/**
 * Immersive 3D workstation view: scene, overlay, theme selector, and analytics.
 * Listens for Escape to return to monitor from any focused object. Works on all screen sizes.
 */
/** Same circle color as ThemeSelector so ESC hint matches the theme dot. */
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

function ImmersiveExperience() {
  const { currentView, returnToMonitor, isAnimating } = useWorkstationStore();
  const theme = useActiveTheme();
  const activeTheme = useThemeStore((s) => s.activeTheme);
  const resolvedId = useResolvedThemeId();
  const useAccentBg = activeTheme === 'uga';
  const hintColor = activeTheme === 'classic' ? theme.text : previewColors[resolvedId] ?? previewColors[activeTheme] ?? theme.accent;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isAnimating && currentView !== 'monitor') {
        returnToMonitor();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentView, isAnimating, returnToMonitor]);
  
  return (
    <div className="w-full h-screen overflow-hidden" style={{ backgroundColor: useAccentBg ? theme.accent : theme.bg }}>
      <Suspense fallback={<LoadingFallback />}>
        <Experience />
      </Suspense>
      
      <Overlay />
      
      <div
        className="fixed bottom-4 left-4 text-xs font-mono pointer-events-none hidden sm:block"
        style={{ color: hintColor, opacity: 0.85 }}
      >
        ESC to return · Click objects to explore
      </div>
      
      <ThemeSelector />
      
      <Analytics />
    </div>
  );
}

/**
 * Root component: switches between professional (scroll) and immersive (3D) view
 * via view mode. Renders mode toggle, active view, and optional headshot in professional mode.
 */
function App() {
  const viewMode = useViewMode();
  const prefersReducedMotion = usePrefersReducedMotion();
  const setPrefersReducedMotion = useWorkstationStore((s) => s.setPrefersReducedMotion);
  const setTheme = useThemeStore((s) => s.setTheme);
  const activeTheme = useThemeStore((s) => s.activeTheme);
  const portfolioDark = useThemeStore((s) => s.portfolioDark);

  const onKonami = useCallback(() => {
    const previous = activeTheme;
    setTheme('gold');
    setTimeout(() => setTheme(previous), 5000);
  }, [activeTheme, setTheme]);

  useKonamiCode(onKonami);

  useEffect(() => {
    setPrefersReducedMotion(prefersReducedMotion);
  }, [prefersReducedMotion, setPrefersReducedMotion]);

  // Sync Tailwind dark class on <html>. Only remove when leaving portfolio view; avoid cleanup on toggle so we don't flash previous mode.
  useLayoutEffect(() => {
    const root = document.documentElement;
    if (viewMode === 'professional' && portfolioDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [viewMode, portfolioDark]);

  return (
    <>
      <ModeToggle />
      {viewMode === 'professional' && (
        <>
          <PortfolioSearch />
          <PortfolioDarkToggle />
        </>
      )}
      <div>
        {viewMode === 'professional' ? <ProfessionalView /> : <ImmersiveExperience />}
        {viewMode === 'professional' && (
          <img
            src="/headshot.png"
            alt={profileData.name}
            className="fixed top-4 left-4 z-30 h-32 w-32 rounded-full object-cover ring-2 ring-[#0a0a0a]/10 shadow-xl dark:ring-white/20 md:h-40 md:w-40"
          />
        )}
      </div>
    </>
  );
}

export default App;
