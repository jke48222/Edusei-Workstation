import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import * as THREE from 'three';

/**
 * ViewState type representing all possible camera positions and object views in the workstation scene.
 */
export type ViewState = 'monitor' | 'audio-tracking-car' | 'animaldot' | 'kitchen-chaos-vr' | 'memesat' | 'capital-one';

/**
 * High-level view mode type for the entire application.
 * - 'immersive': Renders the 3D workstation scene with VR gallery experience
 * - 'professional': Renders a DOM-based, recruiter-friendly portfolio view
 */
export type ViewMode = 'immersive' | 'professional';

/**
 * Scene mode type tracking the current major scene context within the immersive experience.
 */
export type SceneMode = 'workstation' | 'vr-transition' | 'gallery';

/**
 * Gallery camera mode type defining available camera behaviors within the gallery scene.
 */
export type GalleryCameraMode = 'follow' | 'cinema';

/**
 * Gallery state interface defining all state properties for the gamified gallery experience.
 */
interface GalleryState {
  /** Current scene mode within the gallery experience state machine. */
  sceneMode: SceneMode;
  /** Transition progress value ranging from 0 to 1. */
  transitionProgress: number;
  /** Whether a scene transition is currently in progress. */
  isSceneTransitioning: boolean;

  /** Current avatar position in 3D world space. */
  avatarPosition: THREE.Vector3;
  /** Avatar rotation around Y-axis in radians. */
  avatarRotation: number;
  /** Current avatar velocity vector. */
  avatarVelocity: THREE.Vector3;
  /** Whether the avatar is currently moving. */
  isMoving: boolean;

  /** Current camera mode within the gallery scene. */
  galleryCameraMode: GalleryCameraMode;
  /** Target position for cinematic camera mode. */
  cinematicTarget: THREE.Vector3 | null;
  /** Look-at target for cinematic camera mode. */
  cinematicLookAt: THREE.Vector3 | null;

  /** Currently active video identifier, or null if no video is active. */
  activeVideoId: string | null;
  /** Currently active platform identifier associated with the active video. */
  activePlatformId: string | null;
  /** Whether the active video is currently playing. */
  videoPlaying: boolean;

  /** Keyboard input state for movement controls. */
  input: {
    forward: boolean;
    backward: boolean;
    left: boolean;
    right: boolean;
  };

  /** Opacity value for the headset dissolve effect (0 to 1). */
  headsetOpacity: number;

  /** Spirit Oasis gaze bridge state properties. */
  /** Target island identifier for gaze bridge construction. */
  gazeTargetIsland: string | null;
  /** Progress of gaze bridge construction (0 to 1). */
  gazeProgress: number;
  /** Bridge state mapping for each island (none, building, complete, dissolving). */
  bridgeStates: Record<string, 'none' | 'building' | 'complete' | 'dissolving'>;
  /** Currently active island identifier. */
  activeIslandId: string | null;
}

/** Gallery actions interface defining all available actions for gallery state management. */
interface GalleryActions {
  /** Scene transition actions. */
  enterGallery: () => void;
  setTransitionProgress: (progress: number) => void;
  completeGalleryTransition: () => void;
  exitGallery: () => void;

  /** Avatar control actions. */
  setAvatarPosition: (position: THREE.Vector3) => void;
  setAvatarRotation: (rotation: number) => void;
  setAvatarVelocity: (velocity: THREE.Vector3) => void;
  setIsMoving: (moving: boolean) => void;

  /** Camera control actions. */
  setGalleryCameraMode: (mode: GalleryCameraMode) => void;
  enterCinemaMode: (cameraPos: THREE.Vector3, lookAt: THREE.Vector3) => void;
  exitCinemaMode: () => void;

  /** Video interaction control actions. */
  setActiveVideo: (videoId: string | null, platformId: string | null) => void;
  setVideoPlaying: (playing: boolean) => void;

  /** Keyboard input control actions. */
  setInput: (key: keyof GalleryState['input'], value: boolean) => void;
  resetInput: () => void;

  /** Headset dissolve effect control actions. */
  setHeadsetOpacity: (opacity: number) => void;

  /** Spirit Oasis gaze bridge control actions. */
  setGazeTarget: (islandId: string | null) => void;
  setGazeProgress: (progress: number) => void;
  setBridgeState: (islandId: string, state: 'none' | 'building' | 'complete' | 'dissolving') => void;
  setActiveIsland: (islandId: string | null) => void;
}

/** Workstation state interface defining core application state properties. */
interface WorkstationState {
  /** High-level site view mode (immersive or professional). */
  viewMode: ViewMode;

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
}

interface WorkstationActions {
  setViewMode: (mode: ViewMode) => void;
  setView: (view: ViewState) => void;
  returnToMonitor: () => void;
  completeAnimation: () => void;
  canNavigate: () => boolean;
  setTerminalBooted: (booted: boolean) => void;
  setPrefersReducedMotion: (value: boolean) => void;
  setSoundMuted: (muted: boolean) => void;
}

type StoreState = WorkstationState & GalleryState;
type StoreActions = WorkstationActions & GalleryActions;

const VIEW_MODE_STORAGE_KEY = 'edusei-workstation-viewMode';
const SOUND_MUTED_STORAGE_KEY = 'edusei-workstation-soundMuted';

function getStoredViewMode(): ViewMode {
  if (typeof window === 'undefined') return 'professional';
  try {
    const stored = localStorage.getItem(VIEW_MODE_STORAGE_KEY);
    if (stored === 'immersive' || stored === 'professional') return stored;
  } catch (_) {}
  return 'professional';
}

function getStoredSoundMuted(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const stored = localStorage.getItem(SOUND_MUTED_STORAGE_KEY);
    if (stored === 'true' || stored === 'false') return stored === 'true';
  } catch (_) {}
  return false;
}

const initialWorkstationState: WorkstationState = {
  viewMode: getStoredViewMode(),
  currentView: 'monitor',
  isAnimating: false,
  animationStartTime: null,
  transitionDuration: 1500,
  terminalBooted: false,
  prefersReducedMotion: false,
  soundMuted: getStoredSoundMuted(),
};

const initialGalleryState: GalleryState = {
  sceneMode: 'workstation',
  transitionProgress: 0,
  isSceneTransitioning: false,

  avatarPosition: new THREE.Vector3(0, 0, 8),
  avatarRotation: 0,
  avatarVelocity: new THREE.Vector3(0, 0, 0),
  isMoving: false,

  galleryCameraMode: 'follow',
  cinematicTarget: null,
  cinematicLookAt: null,

  activeVideoId: null,
  activePlatformId: null,
  videoPlaying: false,

  input: {
    forward: false,
    backward: false,
    left: false,
    right: false,
  },

  headsetOpacity: 1,

  gazeTargetIsland: null,
  gazeProgress: 0,
  bridgeStates: {},
  activeIslandId: null,
};

export const useWorkstationStore = create<StoreState & StoreActions>()(
  subscribeWithSelector((set, get) => ({
    ...initialWorkstationState,
    ...initialGalleryState,

    setViewMode: (mode: ViewMode) => {
      set({ viewMode: mode });
      try {
        localStorage.setItem(VIEW_MODE_STORAGE_KEY, mode);
      } catch (_) {}
    },

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

      set({
        currentView: 'monitor',
        isAnimating: true,
        animationStartTime: Date.now(),
      });

      setTimeout(() => {
        const currentState = get();
        if (currentState.isAnimating) {
          set({ isAnimating: false, animationStartTime: null });
        }
      }, duration + 200);
    },

    completeAnimation: () => {
      set({ isAnimating: false, animationStartTime: null });
    },

    canNavigate: () => {
      const state = get();
      return !state.isAnimating && state.sceneMode === 'workstation';
    },

    setTerminalBooted: (booted: boolean) => set({ terminalBooted: booted }),

    setPrefersReducedMotion: (value: boolean) => set({ prefersReducedMotion: value }),

    setSoundMuted: (muted: boolean) => {
      set({ soundMuted: muted });
      try {
        localStorage.setItem(SOUND_MUTED_STORAGE_KEY, String(muted));
      } catch (_) {}
    },

    enterGallery: () => {
      const state = get();
      if (state.sceneMode !== 'workstation' || state.isSceneTransitioning) return;

      set({
        sceneMode: 'vr-transition',
        isSceneTransitioning: true,
        transitionProgress: 0,
        headsetOpacity: 1,
      });
    },

    setTransitionProgress: (progress: number) => {
      const clamped = Math.min(1, Math.max(0, progress));
      const dissolveStart = 0.3;
      const dissolveEnd = 0.7;
      let headsetOpacity = 1;
      
      if (clamped >= dissolveStart) {
        headsetOpacity = 1 - ((clamped - dissolveStart) / (dissolveEnd - dissolveStart));
        headsetOpacity = Math.max(0, Math.min(1, headsetOpacity));
      }

      set({ 
        transitionProgress: clamped,
        headsetOpacity,
      });
    },

    completeGalleryTransition: () => {
      set({
        sceneMode: 'gallery',
        isSceneTransitioning: false,
        transitionProgress: 1,
        galleryCameraMode: 'follow',
        headsetOpacity: 0,
        avatarPosition: new THREE.Vector3(0, 0, 8),
        avatarRotation: Math.PI,
        avatarVelocity: new THREE.Vector3(0, 0, 0),
      });
    },

    exitGallery: () => {
      set({
        ...initialGalleryState,
        sceneMode: 'workstation',
        headsetOpacity: 1,
      });
    },

    setAvatarPosition: (position: THREE.Vector3) => {
      set({ avatarPosition: position.clone() });
    },

    setAvatarRotation: (rotation: number) => {
      set({ avatarRotation: rotation });
    },

    setAvatarVelocity: (velocity: THREE.Vector3) => {
      set({ avatarVelocity: velocity.clone() });
    },

    setIsMoving: (moving: boolean) => {
      set({ isMoving: moving });
    },

    setGalleryCameraMode: (mode: GalleryCameraMode) => {
      set({ galleryCameraMode: mode });
    },

    enterCinemaMode: (cameraPos: THREE.Vector3, lookAt: THREE.Vector3) => {
      set({
        galleryCameraMode: 'cinema',
        cinematicTarget: cameraPos.clone(),
        cinematicLookAt: lookAt.clone(),
      });
    },

    exitCinemaMode: () => {
      set({
        galleryCameraMode: 'follow',
        cinematicTarget: null,
        cinematicLookAt: null,
      });
    },

    setActiveVideo: (videoId: string | null, platformId: string | null) => {
      const state = get();
      if (state.activeVideoId === videoId) return;

      set({
        activeVideoId: videoId,
        activePlatformId: platformId,
        videoPlaying: videoId !== null,
      });
    },

    setVideoPlaying: (playing: boolean) => {
      set({ videoPlaying: playing });
    },

    setInput: (key: keyof GalleryState['input'], value: boolean) => {
      set((state) => ({
        input: { ...state.input, [key]: value },
      }));
    },

    resetInput: () => {
      set({
        input: {
          forward: false,
          backward: false,
          left: false,
          right: false,
        },
      });
    },

    setHeadsetOpacity: (opacity: number) => {
      set({ headsetOpacity: Math.min(1, Math.max(0, opacity)) });
    },

    setGazeTarget: (islandId: string | null) => {
      const state = get();
      if (state.gazeTargetIsland !== islandId) {
        set({ gazeTargetIsland: islandId, gazeProgress: 0 });
      }
    },

    setGazeProgress: (progress: number) => {
      set({ gazeProgress: Math.min(1, Math.max(0, progress)) });
    },

    setBridgeState: (islandId: string, state: 'none' | 'building' | 'complete' | 'dissolving') => {
      set((prev) => ({
        bridgeStates: { ...prev.bridgeStates, [islandId]: state },
      }));
    },

    setActiveIsland: (islandId: string | null) => {
      set({ activeIslandId: islandId });
    },
  }))
);

export const useViewMode = () => useWorkstationStore((state) => state.viewMode);
export const useCurrentView = () => useWorkstationStore((state) => state.currentView);
export const useIsAnimating = () => useWorkstationStore((state) => state.isAnimating);
export const useCanNavigate = () => useWorkstationStore((state) => !state.isAnimating && state.sceneMode === 'workstation');

export const useSceneMode = () => useWorkstationStore((state) => state.sceneMode);
export const useGalleryCameraMode = () => useWorkstationStore((state) => state.galleryCameraMode);
export const useActiveVideo = () => useWorkstationStore((state) => state.activeVideoId);
export const useAvatarPosition = () => useWorkstationStore((state) => state.avatarPosition);
export const useInput = () => useWorkstationStore((state) => state.input);
export const useIsInGallery = () => useWorkstationStore((state) => state.sceneMode === 'gallery');
export const useTransitionProgress = () => useWorkstationStore((state) => state.transitionProgress);
export const useHeadsetOpacity = () => useWorkstationStore((state) => state.headsetOpacity);

export const useGazeTarget = () => useWorkstationStore((state) => state.gazeTargetIsland);
export const useGazeProgress = () => useWorkstationStore((state) => state.gazeProgress);
export const useBridgeStates = () => useWorkstationStore((state) => state.bridgeStates);
export const useActiveIsland = () => useWorkstationStore((state) => state.activeIslandId);

if (import.meta.env?.DEV) {
  useWorkstationStore.subscribe(
    (state) => state.sceneMode,
    (sceneMode) => console.log('[Store] Scene mode:', sceneMode)
  );
  
  useWorkstationStore.subscribe(
    (state) => state.activeVideoId,
    (videoId) => console.log('[Store] Active video:', videoId)
  );
}
