import { Suspense, useEffect } from 'react';
import { Experience } from './components/Experience';
import { Overlay } from './components/Overlay';
import { useWorkstationStore } from './store';

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
 * Main App Component
 * 
 * Combines the 3D Canvas (Experience) with the HTML Overlay
 * The Canvas renders behind the Overlay, creating a seamless
 * integration between 3D scene and 2D UI elements.
 */
function App() {
  const { currentView, returnToMonitor, isAnimating } = useWorkstationStore();
  
  // Keyboard shortcut: ESC to return to monitor
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && currentView !== 'monitor' && !isAnimating) {
        returnToMonitor();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentView, isAnimating, returnToMonitor]);
  
  return (
    <div className="w-full h-screen bg-terminal-bg overflow-hidden">
      {/* 3D Canvas - renders the desk scene */}
      <Suspense fallback={<LoadingScreen />}>
        <Experience />
      </Suspense>
      
      {/* HTML Overlay - terminal UI and project cards */}
      <Overlay />
      
      {/* Keyboard shortcut hint */}
      <div className="fixed bottom-4 left-4 text-phosphor-dim text-xs font-mono opacity-50">
        ESC to return • Click objects to explore
      </div>
    </div>
  );
}

export default App;
