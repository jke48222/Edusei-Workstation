import { create } from 'zustand';

/**
 * Session state for the /workstation IDE.
 *
 * The camera/view state this store used to carry (`currentView`, `setView`,
 * `returnToMonitor`, the animation clock) belonged to the original 3D desk
 * scene and died with it — the IDE addresses projects by id through
 * `components/ide/projectRegistry.ts` instead.
 */
interface WorkstationState {
  /** Whether the terminal boot sequence has completed (shown only once per session). */
  terminalBooted: boolean;

  /** User preference for reduced motion (from prefers-reduced-motion media query). */
  prefersReducedMotion: boolean;

  /** Whether terminal sound effects are muted (persisted to localStorage). */
  soundMuted: boolean;

}

interface WorkstationActions {
  setTerminalBooted: (booted: boolean) => void;
  setPrefersReducedMotion: (value: boolean) => void;
  setSoundMuted: (muted: boolean) => void;
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
  terminalBooted: false,
  prefersReducedMotion: false,
  soundMuted: getStoredSoundMuted(),
};

export const useWorkstationStore = create<WorkstationState & WorkstationActions>()((set) => ({
  ...initialWorkstationState,

  setTerminalBooted: (booted: boolean) => set({ terminalBooted: booted }),

  setPrefersReducedMotion: (value: boolean) => set({ prefersReducedMotion: value }),

  setSoundMuted: (muted: boolean) => {
    set({ soundMuted: muted });
    try {
      localStorage.setItem(SOUND_MUTED_STORAGE_KEY, String(muted));
    } catch (_) {}
  },

}));

if (import.meta.env?.DEV) {
  (window as unknown as { __ws?: typeof useWorkstationStore }).__ws = useWorkstationStore;
}
