import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import * as THREE from 'three';

// ============================================================================
// Type Definitions
// ============================================================================

export type SceneMode = 'kitchen' | 'transition' | 'gallery';
export type CameraMode = 'orbit' | 'follow' | 'cinema';

export interface VideoProject {
  id: string;
  title: string;
  description: string;
  videoUrl: string;
  thumbnailUrl: string;
  platformPosition: THREE.Vector3;
  screenPosition: THREE.Vector3;
  screenRotation: THREE.Euler;
}

interface GameState {
  // Scene State Machine
  sceneMode: SceneMode;
  transitionProgress: number; // 0 to 1
  isTransitioning: boolean;

  // Camera State
  cameraMode: CameraMode;
  cinematicTarget: THREE.Vector3 | null;
  cinematicLookAt: THREE.Vector3 | null;

  // Avatar State
  avatarPosition: THREE.Vector3;
  avatarRotation: number; // Y-axis rotation in radians
  isMoving: boolean;

  // Video Interaction State
  activeVideoId: string | null;
  activePlatformId: string | null;
  videoPlaying: boolean;

  // UI State
  showControls: boolean;
  isLoading: boolean;

  // Input State (for keyboard controls)
  input: {
    forward: boolean;
    backward: boolean;
    left: boolean;
    right: boolean;
  };
}

interface GameActions {
  // Scene Transitions
  triggerTransition: () => void;
  setTransitionProgress: (progress: number) => void;
  completeTransition: () => void;
  returnToKitchen: () => void;

  // Camera Controls
  setCameraMode: (mode: CameraMode) => void;
  setCinematicTarget: (position: THREE.Vector3, lookAt: THREE.Vector3) => void;
  clearCinematicTarget: () => void;

  // Avatar Controls
  setAvatarPosition: (position: THREE.Vector3) => void;
  setAvatarRotation: (rotation: number) => void;
  setIsMoving: (moving: boolean) => void;

  // Video Controls
  setActiveVideo: (videoId: string | null, platformId: string | null) => void;
  setVideoPlaying: (playing: boolean) => void;

  // Input Controls
  setInput: (key: keyof GameState['input'], value: boolean) => void;
  resetInput: () => void;

  // UI Controls
  setShowControls: (show: boolean) => void;
  setIsLoading: (loading: boolean) => void;

  // Utility
  reset: () => void;
}

// ============================================================================
// Initial State
// ============================================================================

const initialState: GameState = {
  sceneMode: 'kitchen',
  transitionProgress: 0,
  isTransitioning: false,

  cameraMode: 'orbit',
  cinematicTarget: null,
  cinematicLookAt: null,

  avatarPosition: new THREE.Vector3(0, 0, 5),
  avatarRotation: 0,
  isMoving: false,

  activeVideoId: null,
  activePlatformId: null,
  videoPlaying: false,

  showControls: true,
  isLoading: false,

  input: {
    forward: false,
    backward: false,
    left: false,
    right: false,
  },
};

// ============================================================================
// Store Creation
// ============================================================================

export const useGameStore = create<GameState & GameActions>()(
  subscribeWithSelector((set, get) => ({
    ...initialState,

    // ========================================================================
    // Scene Transitions
    // ========================================================================
    
    triggerTransition: () => {
      const { sceneMode, isTransitioning } = get();
      if (sceneMode !== 'kitchen' || isTransitioning) return;

      set({
        sceneMode: 'transition',
        isTransitioning: true,
        transitionProgress: 0,
        isLoading: true,
      });
    },

    setTransitionProgress: (progress: number) => {
      set({ transitionProgress: Math.min(1, Math.max(0, progress)) });
    },

    completeTransition: () => {
      set({
        sceneMode: 'gallery',
        isTransitioning: false,
        transitionProgress: 1,
        cameraMode: 'follow',
        isLoading: false,
        showControls: true,
        // Reset avatar to gallery spawn point
        avatarPosition: new THREE.Vector3(0, 0, 8),
        avatarRotation: 0,
      });
    },

    returnToKitchen: () => {
      set({
        ...initialState,
        sceneMode: 'kitchen',
      });
    },

    // ========================================================================
    // Camera Controls
    // ========================================================================

    setCameraMode: (mode: CameraMode) => {
      set({ cameraMode: mode });
    },

    setCinematicTarget: (position: THREE.Vector3, lookAt: THREE.Vector3) => {
      set({
        cameraMode: 'cinema',
        cinematicTarget: position.clone(),
        cinematicLookAt: lookAt.clone(),
      });
    },

    clearCinematicTarget: () => {
      set({
        cameraMode: 'follow',
        cinematicTarget: null,
        cinematicLookAt: null,
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

    setIsMoving: (moving: boolean) => {
      set({ isMoving: moving });
    },

    // ========================================================================
    // Video Controls
    // ========================================================================

    setActiveVideo: (videoId: string | null, platformId: string | null) => {
      const { activeVideoId } = get();
      
      // Only update if actually changing
      if (activeVideoId === videoId) return;

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

    setInput: (key: keyof GameState['input'], value: boolean) => {
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
    // UI Controls
    // ========================================================================

    setShowControls: (show: boolean) => {
      set({ showControls: show });
    },

    setIsLoading: (loading: boolean) => {
      set({ isLoading: loading });
    },

    // ========================================================================
    // Utility
    // ========================================================================

    reset: () => {
      set(initialState);
    },
  }))
);

// ============================================================================
// Selectors (for optimized re-renders)
// ============================================================================

export const selectSceneMode = (state: GameState) => state.sceneMode;
export const selectCameraMode = (state: GameState) => state.cameraMode;
export const selectAvatarPosition = (state: GameState) => state.avatarPosition;
export const selectActiveVideo = (state: GameState) => state.activeVideoId;
export const selectIsTransitioning = (state: GameState) => state.isTransitioning;
export const selectInput = (state: GameState) => state.input;

// ============================================================================
// Subscriptions for side effects
// ============================================================================

// Example: Log state changes in development
if (import.meta.env.DEV) {
  useGameStore.subscribe(
    (state) => state.sceneMode,
    (sceneMode) => console.log('[GameStore] Scene mode changed:', sceneMode)
  );
}
