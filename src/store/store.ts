import { create } from 'zustand';

/**
 * ViewState type representing all possible camera positions and object views in the workstation scene.
 */
export type ViewState = 'monitor' | 'audio-tracking-car' | 'animaldot' | 'kitchen-chaos-vr' | 'memesat' | 'capital-one';

/** Workstation state interface defining core application state properties. */
interface WorkstationState {
  /** Current workstation view state identifier. */
  currentView: ViewState;
  /** Whether a camera animation is currently in progress. */
  isAnimating: boolean;
  /** Timestamp when the current animation started, or null if not animating. */
  animationStartTime: number | null;
  /** Duration of camera transition animations in milliseconds. */
  transitionDuration: number;

  /** Whether the terminal boot sequence has completed (shown only once per session). */
  terminalBooted: boolean;

  /** User preference for reduced motion (from prefers-reduced-motion media query). */
  prefersReducedMotion: boolean;

  /** Whether terminal sound effects are muted (persisted to localStorage). */
  soundMuted: boolean;

  /** Whether the Kitchen Chaos mini-game overlay is currently open. */
  kitchenGameOpen: boolean;
}

interface WorkstationActions {
  setView: (view: ViewState) => void;
  returnToMonitor: () => void;
  completeAnimation: () => void;
  setTerminalBooted: (booted: boolean) => void;
  setPrefersReducedMotion: (value: boolean) => void;
  setSoundMuted: (muted: boolean) => void;
  openKitchenGame: () => void;
  closeKitchenGame: () => void;
}

const SOUND_MUTED_STORAGE_KEY = 'edusei-workstation-soundMuted';

function getStoredSoundMuted(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const stored = localStorage.getItem(SOUND_MUTED_STORAGE_KEY);
    if (stored === 'true' || stored === 'false') return stored === 'true';
  } catch (_) {}
  return false;
}

const initialWorkstationState: WorkstationState = {
  currentView: 'monitor',
  isAnimating: false,
  animationStartTime: null,
  transitionDuration: 1500,
  terminalBooted: false,
  prefersReducedMotion: false,
  soundMuted: getStoredSoundMuted(),
  kitchenGameOpen: false,
};

export const useWorkstationStore = create<WorkstationState & WorkstationActions>()((set, get) => ({
  ...initialWorkstationState,

  setView: (view: ViewState) => {
    const state = get();
    if (state.isAnimating || state.currentView === view) return;

    const duration = state.prefersReducedMotion ? 0 : state.transitionDuration;

    set({
      currentView: view,
      isAnimating: true,
      animationStartTime: Date.now(),
    });

    setTimeout(() => {
      const currentState = get();
      if (currentState.isAnimating && currentState.animationStartTime) {
        const elapsed = Date.now() - currentState.animationStartTime;
        const effectiveDuration = currentState.prefersReducedMotion ? 0 : currentState.transitionDuration;
        if (elapsed >= effectiveDuration * 0.9 || effectiveDuration === 0) {
          set({ isAnimating: false, animationStartTime: null });
        }
      }
    }, duration + 200);
  },

  returnToMonitor: () => {
    const state = get();
    if (state.isAnimating || state.currentView === 'monitor') return;

    const duration = state.prefersReducedMotion ? 0 : state.transitionDuration;
    const startedAt = Date.now();

    set({
      currentView: 'monitor',
      isAnimating: true,
      animationStartTime: startedAt,
    });

    setTimeout(() => {
      const currentState = get();
      // Only clear the animation THIS call started — a stale fallback timer must
      // not cut short a newer, unrelated transition.
      if (currentState.isAnimating && currentState.animationStartTime === startedAt) {
        set({ isAnimating: false, animationStartTime: null });
      }
    }, duration + 200);
  },

  completeAnimation: () => {
    set({ isAnimating: false, animationStartTime: null });
  },

  setTerminalBooted: (booted: boolean) => set({ terminalBooted: booted }),

  setPrefersReducedMotion: (value: boolean) => set({ prefersReducedMotion: value }),

  setSoundMuted: (muted: boolean) => {
    set({ soundMuted: muted });
    try {
      localStorage.setItem(SOUND_MUTED_STORAGE_KEY, String(muted));
    } catch (_) {}
  },

  openKitchenGame: () => set({ kitchenGameOpen: true }),
  closeKitchenGame: () => set({ kitchenGameOpen: false }),
}));

if (import.meta.env?.DEV) {
  (window as unknown as { __ws?: typeof useWorkstationStore }).__ws = useWorkstationStore;
}
