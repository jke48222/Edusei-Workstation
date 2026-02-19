/**
 * @file App.tsx
 * @description Root application component that conditionally renders either the immersive
 * 3D workstation view or the professional portfolio view based on the current view mode.
 * Manages theme synchronization, view mode toggling, and displays a headshot image in professional mode.
 */

import { Suspense, useCallback, useEffect, useLayoutEffect } from 'react';
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
      <Suspense fallback={null}>
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
 * Root App component that manages view mode switching between professional portfolio
 * and immersive 3D workstation views. Renders the mode toggle, active view component,
 * and optional headshot image overlay in professional mode.
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

  // Synchronize Tailwind dark mode class on HTML root element
  // Only removes class when leaving portfolio view to prevent visual flashing during theme toggles
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
