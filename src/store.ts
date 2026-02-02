import { create } from 'zustand';

/**
 * ViewState enum representing all possible camera positions
 * - 'monitor': The main CRT terminal view (default/home)
 * - 'car': Audio Tracking Car project
 * - 'dog': AnimalDot project
 * - 'vr': Kitchen Chaos VR / VR Portfolio projects
 * - 'satellite': MEMESat-1 project
 * - 'tablet': Capital One Internship
 */
export type ViewState = 'monitor' | 'car' | 'dog' | 'vr' | 'satellite' | 'tablet';

interface WorkstationStore {
  /** Current view/camera position */
  currentView: ViewState;
  
  /** Flag to prevent double-clicks during camera transitions */
  isAnimating: boolean;
  
  /** Timestamp of when animation started (for tracking) */
  animationStartTime: number | null;
  
  /** Duration of camera transitions in milliseconds */
  transitionDuration: number;
  
  /**
   * Navigate to a specific view
   * Sets isAnimating to true to prevent interruptions
   */
  setView: (view: ViewState) => void;
  
  /**
   * Return to the main monitor/terminal view
   */
  returnToMonitor: () => void;
  
  /**
   * Mark animation as complete
   * Called when camera reaches destination
   */
  completeAnimation: () => void;
  
  /**
   * Check if we can navigate (not currently animating)
   */
  canNavigate: () => boolean;
}

export const useWorkstationStore = create<WorkstationStore>((set, get) => ({
  currentView: 'monitor',
  isAnimating: false,
  animationStartTime: null,
  transitionDuration: 1500, // 1.5 seconds for smooth, cinematic feel
  
  setView: (view: ViewState) => {
    const state = get();
    
    // Prevent navigation if already animating or if already at target view
    if (state.isAnimating || state.currentView === view) {
      return;
    }
    
    set({
      currentView: view,
      isAnimating: true,
      animationStartTime: Date.now(),
    });
    
    // Auto-complete animation after transition duration
    // This is a fallback - the camera rig should call completeAnimation
    // when it actually reaches the destination
    setTimeout(() => {
      const currentState = get();
      if (currentState.isAnimating && currentState.animationStartTime) {
        const elapsed = Date.now() - currentState.animationStartTime;
        // Only auto-complete if enough time has passed
        if (elapsed >= currentState.transitionDuration * 0.9) {
          set({ isAnimating: false, animationStartTime: null });
        }
      }
    }, state.transitionDuration + 200);
  },
  
  returnToMonitor: () => {
    const state = get();
    
    if (state.isAnimating || state.currentView === 'monitor') {
      return;
    }
    
    set({
      currentView: 'monitor',
      isAnimating: true,
      animationStartTime: Date.now(),
    });
    
    // Same fallback auto-complete
    setTimeout(() => {
      const currentState = get();
      if (currentState.isAnimating) {
        set({ isAnimating: false, animationStartTime: null });
      }
    }, state.transitionDuration + 200);
  },
  
  completeAnimation: () => {
    set({
      isAnimating: false,
      animationStartTime: null,
    });
  },
  
  canNavigate: () => {
    const state = get();
    return !state.isAnimating;
  },
}));

/**
 * Selector hooks for common state access patterns
 */
export const useCurrentView = () => useWorkstationStore((state) => state.currentView);
export const useIsAnimating = () => useWorkstationStore((state) => state.isAnimating);
export const useCanNavigate = () => useWorkstationStore((state) => !state.isAnimating);
