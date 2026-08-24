import { Suspense, lazy, useCallback, useEffect, useLayoutEffect } from 'react';

// Lazy-loaded: keeps three.js / R3F out of the initial bundle for the default
// landing + professional views; only fetched when the user enters the 3D workstation.
const Experience = lazy(() => import('../components/Experience').then((m) => ({ default: m.Experience })));
const KitchenChaosGame = lazy(() => import('../components/game/KitchenChaosGame').then((m) => ({ default: m.KitchenChaosGame })));
import { Overlay } from '../components/Overlay';
import { useKonamiCode } from '../hooks/useKonamiCode';
import { usePrefersReducedMotion } from '../hooks/useIsMobile';
import { useWorkstationStore } from '../store/store';
import { useActiveTheme, useThemeStore, setDarkClass } from '../store/themeStore';

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

/** The immersive 3D workstation scene + IDE overlay (rendered at /workstation). */
function ImmersiveExperience() {
  const currentView = useWorkstationStore((s) => s.currentView);
  const returnToMonitor = useWorkstationStore((s) => s.returnToMonitor);
  const isAnimating = useWorkstationStore((s) => s.isAnimating);
  const kitchenGameOpen = useWorkstationStore((s) => s.kitchenGameOpen);
  const theme = useActiveTheme();
  const activeTheme = useThemeStore((s) => s.activeTheme);
  const useAccentBg = activeTheme === 'uga';

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // While the minigame overlay is open, ESC belongs to the game (closing it);
      // without this guard the same keypress would also yank the camera back.
      if (kitchenGameOpen) return;
      if (e.key === 'Escape' && !isAnimating && currentView !== 'monitor') {
        returnToMonitor();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentView, isAnimating, returnToMonitor, kitchenGameOpen]);

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
    </div>
  );
}

/** Route: the 3D workstation sub-experience, linked from the landing. */
export function WorkstationRoute() {
  useGlobalChrome();

  useLayoutEffect(() => {
    setDarkClass(false); // the canvas drives its own palette via the theme preset
  }, []);

  return <ImmersiveExperience />;
}
