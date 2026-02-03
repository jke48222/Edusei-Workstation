import { Suspense, useEffect, lazy } from 'react';
import { Analytics } from '@vercel/analytics/react';
import { Experience } from './components/Experience';
import { Overlay } from './components/Overlay';
import { GalleryControls } from './components/ui/GalleryControls';
import { MobileFallback } from './components/ui/MobileFallback';
import { GalleryKeyboardHandler } from './components/gallery/GalleryExperience';
import { useWorkstationStore, useSceneMode, useIsInGallery } from './store/store';
import { useIsMobile } from './hooks/useIsMobile';

/**
 * Loading screen while 3D content loads
 */
function LoadingScreen() {
  return (
    <div className="fixed inset-0 bg-terminal-bg flex items-center justify-center">
      <div className="text-center">
        <div className="phosphor-text-bright text-2xl font-mono mb-4 animate-pulse">
          INITIALIZING WORKSTATION
        </div>
        <div className="flex items-center justify-center gap-2">
          <div 
            className="w-2 h-2 bg-terminal-green rounded-full animate-bounce" 
            style={{ animationDelay: '0ms' }}
          />
          <div 
            className="w-2 h-2 bg-terminal-green rounded-full animate-bounce" 
            style={{ animationDelay: '150ms' }}
          />
          <div 
            className="w-2 h-2 bg-terminal-green rounded-full animate-bounce" 
            style={{ animationDelay: '300ms' }}
          />
        </div>
        <div className="mt-4 text-phosphor-dim text-sm font-mono">
          Loading 3D environment...
        </div>
      </div>
    </div>
  );
}

/**
 * Gallery transition overlay - shows during the portal transition
 */
function TransitionOverlay() {
  const sceneMode = useSceneMode();
  
  if (sceneMode !== 'vr-transition') return null;
  
  return (
    <div className="fixed inset-0 pointer-events-none z-30">
      {/* Vignette effect during transition */}
      <div 
        className="absolute inset-0 bg-gradient-radial from-transparent via-transparent to-black/50"
        style={{
          background: 'radial-gradient(circle at center, transparent 30%, rgba(139, 92, 246, 0.1) 60%, rgba(0, 0, 0, 0.3) 100%)'
        }}
      />
      
      {/* Loading hint */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
        <p className="text-purple-400/80 font-mono text-sm animate-pulse">
          Entering VR Gallery...
        </p>
      </div>
    </div>
  );
}

/**
 * Error boundary fallback
 */
function ErrorFallback() {
  return (
    <div className="fixed inset-0 bg-terminal-bg flex items-center justify-center p-4">
      <div className="glass-card p-8 max-w-md text-center rounded-xl">
        <div className="phosphor-text-bright text-xl font-mono mb-4">
          ⚠ SYSTEM ERROR
        </div>
        <div className="text-phosphor-dim text-sm font-mono mb-6">
          Failed to initialize 3D workstation.
          <br />
          Please refresh the page to try again.
        </div>
        <button
          onClick={() => window.location.reload()}
          className="
            px-6 py-2 rounded-lg
            border border-terminal-green
            phosphor-text font-mono text-sm
            transition-all duration-200
            hover:bg-terminal-green/10
          "
        >
          RESTART SYSTEM
        </button>
      </div>
    </div>
  );
}

/**
 * Desktop Experience - Full 3D workstation with gallery feature
 */
function DesktopExperience() {
  const { currentView, returnToMonitor, isAnimating } = useWorkstationStore();
  const sceneMode = useSceneMode();
  const isInGallery = useIsInGallery();
  
  // Keyboard shortcut: ESC to return to monitor OR exit gallery
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isAnimating) {
        if (isInGallery) {
          // Exit gallery handled by GalleryKeyboardHandler
          return;
        }
        if (currentView !== 'monitor') {
          returnToMonitor();
        }
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentView, isAnimating, returnToMonitor, isInGallery]);
  
  return (
    <div className="w-full h-screen bg-terminal-bg overflow-hidden">
      {/* 3D Canvas - renders the desk scene and gallery */}
      <Suspense fallback={<LoadingScreen />}>
        <Experience />
      </Suspense>
      
      {/* HTML Overlay - terminal UI and project cards (hidden in gallery) */}
      {sceneMode === 'workstation' && <Overlay />}
      
      {/* Gallery Controls Overlay - WASD hints, exit button */}
      <GalleryControls />
      
      {/* Transition Overlay */}
      <TransitionOverlay />
      
      {/* Gallery Keyboard Handler (WASD controls) */}
      <GalleryKeyboardHandler />
      
      {/* Keyboard shortcut hint - changes based on mode */}
      <div className="fixed bottom-4 left-4 text-phosphor-dim text-xs font-mono opacity-50 pointer-events-none">
        {isInGallery ? (
          'WASD to move • ESC to exit'
        ) : (
          'ESC to return • Click objects to explore'
        )}
      </div>
      
      {/* VR Gallery hint when viewing headset */}
      {currentView === 'vr' && sceneMode === 'workstation' && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 pointer-events-none">
          <div className="bg-purple-900/50 backdrop-blur-sm px-6 py-3 rounded-xl border border-purple-500/30">
            <p className="text-purple-300 font-mono text-sm text-center">
              Click the headset to enter the <span className="text-purple-200 font-bold">VR Gallery</span>
            </p>
          </div>
        </div>
      )}
      
      {/* Vercel Web Analytics */}
      <Analytics />
    </div>
  );
}

/**
 * Mobile Experience - Video card grid fallback
 */
function MobileExperience() {
  return (
    <div className="min-h-screen bg-terminal-bg">
      <MobileFallback />
      <Analytics />
    </div>
  );
}

/**
 * Main App Component
 * 
 * Key Architecture Decisions:
 * 1. Mobile detection happens BEFORE Canvas mount to prevent performance issues
 * 2. On mobile, we render a completely different component tree (no WebGL)
 * 3. The gallery state machine is integrated with the existing workstation store
 * 4. Keyboard handlers are separate components to prevent re-renders
 */
function App() {
  const isMobile = useIsMobile();
  
  // Critical: Don't even mount the Canvas on mobile devices
  // This prevents WebGL context creation and saves memory/battery
  if (isMobile) {
    return <MobileExperience />;
  }
  
  return <DesktopExperience />;
}

export default App;
