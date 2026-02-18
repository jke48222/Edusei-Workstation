/**
 * @file store.ts
 * @description Unified Zustand store for workstation views (monitor/car/dog/vr/satellite/tablet),
 * view mode (immersive vs professional), and gallery/VR experience (scene transitions, avatar,
 * camera, video, gaze bridge). Uses subscribeWithSelector for granular subscriptions.
 */

import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import * as THREE from 'three';

// ============================================================================
// Type Definitions
// ============================================================================

/**
 * ViewState enum representing all possible camera positions in the workstation
 */
export type ViewState = 'monitor' | 'car' | 'dog' | 'vr' | 'satellite' | 'tablet';

/**
 * High-level view mode for the site
 * - 'immersive' keeps the existing 3D workstation + VR gallery
 * - 'professional' mounts a DOM-first, recruiter-friendly view
 */
export type ViewMode = 'immersive' | 'professional';

/**
 * Scene mode - tracks which major scene the user is in
 */
export type SceneMode = 'workstation' | 'vr-transition' | 'gallery';

/**
 * Camera mode within the gallery
 */
export type GalleryCameraMode = 'follow' | 'cinema';

/**
 * Gallery state for the gamified experience
 */
interface GalleryState {
  // Scene state machine
  sceneMode: SceneMode;
  transitionProgress: number; // 0 to 1
  isSceneTransitioning: boolean;

  // Avatar state
  avatarPosition: THREE.Vector3;
  avatarRotation: number; // Y-axis rotation in radians
  avatarVelocity: THREE.Vector3;
  isMoving: boolean;

  // Camera state
  galleryCameraMode: GalleryCameraMode;
  cinematicTarget: THREE.Vector3 | null;
  cinematicLookAt: THREE.Vector3 | null;

  // Video interaction state
  activeVideoId: string | null;
  activePlatformId: string | null;
  videoPlaying: boolean;

  // Input state (for keyboard controls)
  input: {
    forward: boolean;
    backward: boolean;
    left: boolean;
    right: boolean;
  };

  // Headset dissolve effect
  headsetOpacity: number;

  // Spirit Oasis — Gaze bridge state
  gazeTargetIsland: string | null;
  gazeProgress: number;
  bridgeStates: Record<string, 'none' | 'building' | 'complete' | 'dissolving'>;
  activeIslandId: string | null;
}

interface GalleryActions {
  // Scene transitions
  enterGallery: () => void;
  setTransitionProgress: (progress: number) => void;
  completeGalleryTransition: () => void;
  exitGallery: () => void;

  // Avatar controls
  setAvatarPosition: (position: THREE.Vector3) => void;
  setAvatarRotation: (rotation: number) => void;
  setAvatarVelocity: (velocity: THREE.Vector3) => void;
  setIsMoving: (moving: boolean) => void;

  // Camera controls
  setGalleryCameraMode: (mode: GalleryCameraMode) => void;
  enterCinemaMode: (cameraPos: THREE.Vector3, lookAt: THREE.Vector3) => void;
  exitCinemaMode: () => void;

  // Video controls
  setActiveVideo: (videoId: string | null, platformId: string | null) => void;
  setVideoPlaying: (playing: boolean) => void;

  // Input controls
  setInput: (key: keyof GalleryState['input'], value: boolean) => void;
  resetInput: () => void;

  // Headset effect
  setHeadsetOpacity: (opacity: number) => void;

  // Spirit Oasis — Gaze bridge actions
  setGazeTarget: (islandId: string | null) => void;
  setGazeProgress: (progress: number) => void;
  setBridgeState: (islandId: string, state: 'none' | 'building' | 'complete' | 'dissolving') => void;
  setActiveIsland: (islandId: string | null) => void;
}

// ============================================================================
// Workstation Store (Original)
// ============================================================================

interface WorkstationState {
  // High-level site mode
  viewMode: ViewMode;

  currentView: ViewState;
  isAnimating: boolean;
  animationStartTime: number | null;
  transitionDuration: number;

  /** Terminal boot sequence has completed (show only once per session). */
  terminalBooted: boolean;

  /** User prefers reduced motion (from prefers-reduced-motion media query). */
  prefersReducedMotion: boolean;
}

interface WorkstationActions {
  setViewMode: (mode: ViewMode) => void;
  setView: (view: ViewState) => void;
  returnToMonitor: () => void;
  completeAnimation: () => void;
  canNavigate: () => boolean;
  setTerminalBooted: (booted: boolean) => void;
  setPrefersReducedMotion: (value: boolean) => void;
}

// ============================================================================
// Combined Store Type
// ============================================================================

type StoreState = WorkstationState & GalleryState;
type StoreActions = WorkstationActions & GalleryActions;

// ============================================================================
// Initial States
// ============================================================================

const VIEW_MODE_STORAGE_KEY = 'edusei-workstation-viewMode';

function getStoredViewMode(): ViewMode {
  if (typeof window === 'undefined') return 'professional';
  try {
    const stored = localStorage.getItem(VIEW_MODE_STORAGE_KEY);
    if (stored === 'immersive' || stored === 'professional') return stored;
  } catch (_) {}
  return 'professional';
}

const initialWorkstationState: WorkstationState = {
  viewMode: getStoredViewMode(),
  currentView: 'monitor',
  isAnimating: false,
  animationStartTime: null,
  transitionDuration: 1500,
  terminalBooted: false,
  prefersReducedMotion: false,
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

// ============================================================================
// Store Creation
// ============================================================================

export const useWorkstationStore = create<StoreState & StoreActions>()(
  subscribeWithSelector((set, get) => ({
    // Spread initial states
    ...initialWorkstationState,
    ...initialGalleryState,

    // ========================================================================
    // Workstation Actions (Original)
    // ========================================================================

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

    // ========================================================================
    // Gallery Scene Transitions
    // ========================================================================

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
      
      // Headset dissolves out as we go through (starts at 0.3, fully dissolved by 0.7)
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
        // Reset avatar to spawn point
        avatarPosition: new THREE.Vector3(0, 0, 8),
        avatarRotation: Math.PI, // Face towards screens
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

    // ========================================================================
    // Avatar Controls
    // ========================================================================

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

    // ========================================================================
    // Gallery Camera Controls
    // ========================================================================

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

    // ========================================================================
    // Video Controls
    // ========================================================================

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

    // ========================================================================
    // Input Controls
    // ========================================================================

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

    // ========================================================================
    // Headset Effect
    // ========================================================================

    setHeadsetOpacity: (opacity: number) => {
      set({ headsetOpacity: Math.min(1, Math.max(0, opacity)) });
    },

    // ========================================================================
    // Spirit Oasis — Gaze Bridge
    // ========================================================================

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

// ============================================================================
// Selectors for Optimized Re-renders
// ============================================================================

export const useViewMode = () => useWorkstationStore((state) => state.viewMode);
export const useCurrentView = () => useWorkstationStore((state) => state.currentView);
export const useIsAnimating = () => useWorkstationStore((state) => state.isAnimating);
export const useCanNavigate = () => useWorkstationStore((state) => !state.isAnimating && state.sceneMode === 'workstation');

// Gallery-specific selectors
export const useSceneMode = () => useWorkstationStore((state) => state.sceneMode);
export const useGalleryCameraMode = () => useWorkstationStore((state) => state.galleryCameraMode);
export const useActiveVideo = () => useWorkstationStore((state) => state.activeVideoId);
export const useAvatarPosition = () => useWorkstationStore((state) => state.avatarPosition);
export const useInput = () => useWorkstationStore((state) => state.input);
export const useIsInGallery = () => useWorkstationStore((state) => state.sceneMode === 'gallery');
export const useTransitionProgress = () => useWorkstationStore((state) => state.transitionProgress);
export const useHeadsetOpacity = () => useWorkstationStore((state) => state.headsetOpacity);

// Spirit Oasis selectors
export const useGazeTarget = () => useWorkstationStore((state) => state.gazeTargetIsland);
export const useGazeProgress = () => useWorkstationStore((state) => state.gazeProgress);
export const useBridgeStates = () => useWorkstationStore((state) => state.bridgeStates);
export const useActiveIsland = () => useWorkstationStore((state) => state.activeIslandId);

// ============================================================================
// Debug subscriptions (development only)
// ============================================================================

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
