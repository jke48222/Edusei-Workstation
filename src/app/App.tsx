import { Suspense, lazy, useCallback, useEffect, useLayoutEffect } from 'react';
import { Link } from 'react-router-dom';
import { Home, LayoutGrid } from 'lucide-react';
import { Analytics } from '@vercel/analytics/react';

// Lazy-loaded: keeps three.js / R3F out of the initial bundle for the default
// landing + professional views; only fetched when the user enters the 3D workstation.
const Experience = lazy(() => import('../components/Experience').then((m) => ({ default: m.Experience })));
const KitchenChaosGame = lazy(() => import('../components/minigame/KitchenChaosGame').then((m) => ({ default: m.KitchenChaosGame })));
import { Overlay } from '../components/Overlay';
import { useKonamiCode } from '../hooks/useKonamiCode';
import { usePrefersReducedMotion } from '../hooks/useIsMobile';
import { useWorkstationStore } from '../store/store';
import { useActiveTheme, useThemeStore, useResolvedThemeId, SYSTEM_THEME_ID, setDarkClass } from '../store/themeStore';
import { ThemeSelector } from '../components/ThemeSelector';

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

/**
 * Shared, route-agnostic chrome: Konami easter egg + reduced-motion sync.
 * Mounted by both the workstation and portfolio routes (the landing manages its own).
 */
function useGlobalChrome() {
  const prefersReducedMotion = usePrefersReducedMotion();
  const setPrefersReducedMotion = useWorkstationStore((s) => s.setPrefersReducedMotion);
  const setTheme = useThemeStore((s) => s.setTheme);
  const activeTheme = useThemeStore((s) => s.activeTheme);

  const onKonami = useCallback(() => {
    const previous = activeTheme;
    setTheme('gold');
    setTimeout(() => setTheme(previous), 5000);
  }, [activeTheme, setTheme]);

  useKonamiCode(onKonami);

  useEffect(() => {
    setPrefersReducedMotion(prefersReducedMotion);
  }, [prefersReducedMotion, setPrefersReducedMotion]);
}

/** Themed pill on the workstation that routes back to the landing / DOM portfolio. */
function WorkstationNav() {
  const theme = useActiveTheme();
  const linkCls =
    'flex h-9 items-center gap-1.5 rounded-full px-3 text-[11px] font-mono backdrop-blur-xl transition-all duration-200';
  const style = {
    border: `1px solid ${theme.accent}40`,
    backgroundColor: `${theme.terminalBg}cc`,
    color: theme.accent,
  };
  return (
    <div className="fixed top-3 right-5 z-[110] flex items-center gap-2 pointer-events-auto">
      <Link to="/" aria-label="Back to home" className={linkCls} style={style}>
        <Home className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">Home</span>
      </Link>
      <Link to="/work" aria-label="Open the work archive" className={linkCls} style={style}>
        <LayoutGrid className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">Work</span>
      </Link>
    </div>
  );
}

/** The immersive 3D workstation scene + overlay (rendered at /workstation). */
function ImmersiveExperience() {
  const { currentView, returnToMonitor, isAnimating } = useWorkstationStore();
  const kitchenGameOpen = useWorkstationStore((s) => s.kitchenGameOpen);
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

      {kitchenGameOpen && (
        <Suspense fallback={null}>
          <KitchenChaosGame />
        </Suspense>
      )}

      <div
        className="fixed bottom-4 left-4 text-xs font-mono pointer-events-none hidden sm:block"
        style={{ color: hintColor, opacity: 0.85 }}
      >
        ESC to return · Click objects to explore
      </div>

      <WorkstationNav />
      <ThemeSelector />

      <Analytics />
    </div>
  );
}

/** Route: the 3D workstation sub-experience, linked from the landing. */
export function WorkstationRoute() {
  const setViewMode = useWorkstationStore((s) => s.setViewMode);
  useGlobalChrome();

  useLayoutEffect(() => {
    setDarkClass(false); // the canvas drives its own palette via the theme preset
  }, []);

  useEffect(() => {
    setViewMode('immersive');
  }, [setViewMode]);

  return <ImmersiveExperience />;
}
