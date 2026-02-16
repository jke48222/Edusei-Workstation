/**
 * @file App.tsx
 * @description Root application component. Renders either the immersive 3D workstation
 * or the professional portfolio view based on view mode. Includes cinematic loading
 * screen, theme-aware layout, and top-level headshot in professional mode.
 */

import { Suspense, useState, useEffect, useRef } from 'react';
import { Analytics } from '@vercel/analytics/react';
import { Experience } from './components/Experience';
import { Overlay } from './components/Overlay';
import { useWorkstationStore, useViewMode } from './store/store';
import { useActiveTheme } from './store/themeStore';
import { ModeToggle } from './components/ModeToggle';
import { ProfessionalView } from './components/professional/ProfessionalView';
import { ThemeSelector } from './components/ThemeSelector';
import { projectsData, asciiArt, profileData } from './data';

/* -----------------------------------------------------------------------------
 * Boot sequence copy: lines shown during loading (BIOS-style diagnostics).
 * Each entry: { text: string, delay: number } — delay in ms before next line.
 * ----------------------------------------------------------------------------- */

const bootLines = [
  { text: 'BIOS v2.026 — POST check..........OK', delay: 80 },
  { text: 'CPU: AMD Ryzen 9 7950X @ 5.7GHz', delay: 60 },
  { text: 'RAM: 64GB DDR5-6000 ..............OK', delay: 60 },
  { text: 'GPU: NVIDIA RTX 4090 24GB', delay: 60 },
  { text: 'STORAGE: 2TB NVMe SSD ............OK', delay: 60 },
  { text: '', delay: 30 },
  { text: 'Loading kernel modules...', delay: 100 },
  { text: '  [OK] three.js r165', delay: 70 },
  { text: '  [OK] react-three-fiber', delay: 70 },
  { text: '  [OK] zustand state', delay: 70 },
  { text: '  [OK] framer-motion', delay: 70 },
  { text: '', delay: 30 },
  { text: 'Mounting /dev/portfolio...', delay: 120 },
  { text: `Loading ${projectsData.length} project modules...`, delay: 100 },
  { text: 'Initializing 3D render pipeline...', delay: 150 },
  { text: '', delay: 50 },
  { text: 'System ready.', delay: 100 },
];

/**
 * Full-screen loading UI shown while the 3D experience loads. Displays ASCII art
 * briefly, then a typewriter-style boot log and "Press any key to continue";
 * dismisses on any key or click.
 * @returns {JSX.Element | null} Loading UI or null after user dismissal
 */
function LoadingScreen() {
  const [visibleLines, setVisibleLines] = useState(0);
  const [showAscii, setShowAscii] = useState(true);
  const [showPrompt, setShowPrompt] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const lineIndexRef = useRef(0);

  useEffect(() => {
    const asciiTimer = setTimeout(() => setShowAscii(false), 1200);
    return () => clearTimeout(asciiTimer);
  }, []);

  useEffect(() => {
    if (showAscii) return;
    if (lineIndexRef.current < bootLines.length) {
      const line = bootLines[lineIndexRef.current];
      const timer = setTimeout(() => {
        lineIndexRef.current++;
        setVisibleLines(lineIndexRef.current);
      }, line.delay);
      return () => clearTimeout(timer);
    } else {
      const promptTimer = setTimeout(() => setShowPrompt(true), 300);
      return () => clearTimeout(promptTimer);
    }
  }, [showAscii, visibleLines]);

  useEffect(() => {
    if (!showPrompt) return;
    const handleKey = () => setDismissed(true);
    const handleClick = () => setDismissed(true);
    window.addEventListener('keydown', handleKey);
    window.addEventListener('click', handleClick);
    return () => {
      window.removeEventListener('keydown', handleKey);
      window.removeEventListener('click', handleClick);
    };
  }, [showPrompt]); // Dismiss on first key or click so user can proceed

  if (dismissed) return null;

  return (
    <div className="fixed inset-0 bg-[#0a0a0a] flex items-center justify-center z-[100] font-mono text-sm">
      <div className="w-full max-w-2xl px-6">
        {showAscii ? (
          <pre className="text-[#4ade80]/80 text-[10px] sm:text-xs leading-tight whitespace-pre animate-pulse">
            {asciiArt}
          </pre>
        ) : (
          <div className="space-y-0.5">
            {bootLines.slice(0, visibleLines).map((line, i) => (
              <div
                key={i}
                className={`${
                  line.text.includes('[OK]')
                    ? 'text-[#4ade80]/70'
                    : line.text.includes('OK')
                    ? 'text-[#4ade80]/50'
                    : line.text === ''
                    ? ''
                    : 'text-[#4ade80]/60'
                }`}
              >
                {line.text || '\u00A0'}
              </div>
            ))}
            
            {showPrompt && (
              <div className="mt-6 text-center">
                <p className="text-[#4ade80] animate-pulse text-base">
                  Press any key to continue...
                </p>
              </div>
            )}
            
            {!showPrompt && visibleLines < bootLines.length && (
              <span className="inline-block h-4 w-2 bg-[#4ade80]/60 animate-pulse" />
            )}
          </div>
        )}
      </div>
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
    <div className="w-full h-screen overflow-hidden" style={{ backgroundColor: theme.bg }}>
      <Suspense fallback={<LoadingScreen />}>
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
