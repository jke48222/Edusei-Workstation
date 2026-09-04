import { useCallback, useEffect, useLayoutEffect } from 'react';

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

/**
 * The IDE workstation (rendered at /workstation). The editor shell owns the
 * whole viewport; project files open their 3D model in an inline viewer, so
 * there is no background scene anymore.
 */
function IdeWorkstation() {
  const theme = useActiveTheme();

  return (
    <div className="h-screen w-full overflow-hidden" style={{ backgroundColor: theme.bg }}>
      <Overlay />
    </div>
  );
}

/** Route: the IDE workstation sub-experience, linked from the landing. */
export function WorkstationRoute() {
  useGlobalChrome();

  useLayoutEffect(() => {
    setDarkClass(false); // the IDE drives its own palette via the theme preset
  }, []);

  return <IdeWorkstation />;
}
