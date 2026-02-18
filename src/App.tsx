/**
 * @file App.tsx
 * @description Root application component. Renders either the immersive 3D workstation
 * or the professional portfolio view based on view mode. Includes cinematic loading
 * screen, theme-aware layout, and top-level headshot in professional mode.
 */

import { Suspense, useEffect } from 'react';
import { Analytics } from '@vercel/analytics/react';
import { Experience } from './components/Experience';
import { Overlay } from './components/Overlay';
import { useWorkstationStore, useViewMode } from './store/store';
import { useActiveTheme, useThemeStore } from './store/themeStore';
import { ModeToggle } from './components/ModeToggle';
import { ProfessionalView } from './components/professional/ProfessionalView';
import { ThemeSelector } from './components/ThemeSelector';
import { profileData } from './data';

/** Minimal fallback while the 3D experience loads; no user interaction required. */
function LoadingFallback() {
  return (
    <div className="fixed inset-0 bg-[#0a0a0a] flex items-center justify-center z-[100]">
      <div className="font-mono text-sm text-white/50 animate-pulse">Loading...</div>
    </div>
  );
}

/**
 * Immersive 3D workstation view: scene, overlay, theme selector, and analytics.
 * Listens for Escape to return to monitor from any focused object. Works on all screen sizes.
 */
function ImmersiveExperience() {
  const { currentView, returnToMonitor, isAnimating } = useWorkstationStore();
  const theme = useActiveTheme();
  const activeTheme = useThemeStore((s) => s.activeTheme);
  const useAccentBg = activeTheme === 'uga'; // Bulldog Red: accent bg on desktop and mobile

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
        className="fixed bottom-4 left-4 text-xs font-mono opacity-50 pointer-events-none hidden sm:block"
        style={{ color: theme.textDim }}
      >
        ESC to return • Click objects to explore
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
  
  return (
    <>
      <ModeToggle />
      {viewMode === 'professional' ? <ProfessionalView /> : <ImmersiveExperience />}
      {viewMode === 'professional' && (
        <img
          src="/headshot.png"
          alt={profileData.name}
          className="fixed top-4 left-4 z-30 h-32 w-32 rounded-full object-cover ring-2 ring-[#0a0a0a]/10 shadow-xl md:h-40 md:w-40"
        />
      )}
    </>
  );
}

export default App;
