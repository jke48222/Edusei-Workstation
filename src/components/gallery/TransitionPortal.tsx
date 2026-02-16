import { useRef, useEffect, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import * as easing from 'maath/easing';
import { useWorkstationStore, useSceneMode, useTransitionProgress } from '../../store/store';

/**
 * @file TransitionPortal.tsx
 * @description Workstation → gallery transition: camera flies into Quest headset lens, dissolve effect, keyframe-driven.
 */

/** Lens offset from headset center (tune for Quest 3 geometry). */
const LENS_OFFSET = {
  left: new THREE.Vector3(-0.032, 0.01, -0.05),  // Left lens
  right: new THREE.Vector3(0.032, 0.01, -0.05), // Right lens
  center: new THREE.Vector3(0, 0.01, -0.05),    // Between lenses (our target)
};

/**
 * Headset world position (must match Experience.tsx)
 */
const VR_HEADSET_POSITION = new THREE.Vector3(75, 1.5, 0);

/**
 * Transition keyframes
 * Progress 0.0 - 1.0 mapped to camera journey
 */
const TRANSITION_KEYFRAMES = {
  // Phase 1: Approach (0.0 - 0.3)
  approach: {
    start: 0,
    end: 0.3,
    cameraStart: new THREE.Vector3(75, 2.5, 7), // Initial VR view position
    cameraEnd: new THREE.Vector3(75, 1.6, 1.5), // Close to headset
  },
  // Phase 2: Enter lens (0.3 - 0.7)
  enterLens: {
    start: 0.3,
    end: 0.7,
    cameraStart: new THREE.Vector3(75, 1.6, 1.5),
    cameraEnd: new THREE.Vector3(75, 1.55, -0.3), // Through the lens
  },
  // Phase 3: Into gallery (0.7 - 1.0)
  intoGallery: {
    start: 0.7,
    end: 1.0,
    cameraStart: new THREE.Vector3(75, 1.55, -0.3),
    cameraEnd: new THREE.Vector3(0, 3, 12), // Gallery spawn camera
  },
};

interface TransitionPortalProps {
  headsetRef?: React.RefObject<THREE.Group>;
}

/**
 * TransitionPortal Component
 * 
 * Handles the camera animation when entering the gallery:
 * 1. Camera zooms towards the VR headset lens
 * 2. Headset geometry dissolves via opacity
 * 3. Scene transitions seamlessly to gallery
 * 
 * Uses maath/easing for smooth, heavy camera movements
 */
export function TransitionPortal({ headsetRef }: TransitionPortalProps) {
  const { camera } = useThree();
  const sceneMode = useSceneMode();
  const transitionProgress = useTransitionProgress();
  
  const setTransitionProgress = useWorkstationStore((state) => state.setTransitionProgress);
  const completeGalleryTransition = useWorkstationStore((state) => state.completeGalleryTransition);
  
  // Animation state
  const progressRef = useRef(0);
  const currentCameraPos = useRef(new THREE.Vector3());
  const currentLookAt = useRef(new THREE.Vector3());
  const transitionStartTime = useRef<number | null>(null);
  
  // Transition duration in seconds
  const TRANSITION_DURATION = 3.5;
  
  // Initialize camera position refs on mount
  useEffect(() => {
    currentCameraPos.current.copy(camera.position);
    currentLookAt.current.copy(VR_HEADSET_POSITION);
  }, [camera]);

  // Reset transition when starting
  useEffect(() => {
    if (sceneMode === 'vr-transition') {
      progressRef.current = 0;
      transitionStartTime.current = null;
      currentCameraPos.current.copy(TRANSITION_KEYFRAMES.approach.cameraStart);
    }
  }, [sceneMode]);

  useFrame((state, delta) => {
    // Only run during transition
    if (sceneMode !== 'vr-transition') return;

    // Initialize start time
    if (transitionStartTime.current === null) {
      transitionStartTime.current = state.clock.getElapsedTime();
    }

    // Calculate progress based on time
    const elapsed = state.clock.getElapsedTime() - transitionStartTime.current;
    const targetProgress = Math.min(1, elapsed / TRANSITION_DURATION);
    
    // Smooth the progress
    progressRef.current = THREE.MathUtils.lerp(
      progressRef.current,
      targetProgress,
      delta * 2
    );
    
    // Update store with current progress
    setTransitionProgress(progressRef.current);
    
    // Calculate target camera position based on progress
    const targetCameraPos = calculateCameraPosition(progressRef.current);
    const targetLookAt = calculateLookAtPosition(progressRef.current);
    
    // Smooth camera movement using maath/easing
    // Slower damping for heavier, more cinematic feel
    const dampingFactor = progressRef.current < 0.7 ? 0.25 : 0.15;
    
    easing.damp3(
      currentCameraPos.current,
      targetCameraPos,
      dampingFactor,
      Math.min(delta, 0.1)
    );
    
    easing.damp3(
      currentLookAt.current,
      targetLookAt,
      dampingFactor * 0.8,
      Math.min(delta, 0.1)
    );
    
    // Apply camera transform
    camera.position.copy(currentCameraPos.current);
    camera.lookAt(currentLookAt.current);
    
    // Check for completion
    if (progressRef.current >= 0.99) {
      completeGalleryTransition();
    }
  });

  return null;
}

/**
 * Calculate camera position at a given progress point
 */
function calculateCameraPosition(progress: number): THREE.Vector3 {
  const { approach, enterLens, intoGallery } = TRANSITION_KEYFRAMES;
  
  if (progress <= approach.end) {
    // Phase 1: Approach
    const t = mapRange(progress, approach.start, approach.end, 0, 1);
    const eased = easeInOutCubic(t);
    return new THREE.Vector3().lerpVectors(
      approach.cameraStart,
      approach.cameraEnd,
      eased
    );
  } else if (progress <= enterLens.end) {
    // Phase 2: Enter lens
    const t = mapRange(progress, enterLens.start, enterLens.end, 0, 1);
    const eased = easeInOutQuad(t);
    return new THREE.Vector3().lerpVectors(
      enterLens.cameraStart,
      enterLens.cameraEnd,
      eased
    );
  } else {
    // Phase 3: Into gallery
    const t = mapRange(progress, intoGallery.start, intoGallery.end, 0, 1);
    const eased = easeOutCubic(t);
    return new THREE.Vector3().lerpVectors(
      intoGallery.cameraStart,
      intoGallery.cameraEnd,
      eased
    );
  }
}

/**
 * Calculate look-at target at a given progress point
 */
function calculateLookAtPosition(progress: number): THREE.Vector3 {
  // Always look at where we're heading
  if (progress < 0.7) {
    // Look at lens center during approach and entry
    return VR_HEADSET_POSITION.clone().add(LENS_OFFSET.center);
  } else {
    // Transition to looking at gallery center
    const t = mapRange(progress, 0.7, 1.0, 0, 1);
    const lensTarget = VR_HEADSET_POSITION.clone().add(LENS_OFFSET.center);
    const galleryTarget = new THREE.Vector3(0, 1.5, 0); // Gallery center
    return new THREE.Vector3().lerpVectors(lensTarget, galleryTarget, easeOutQuad(t));
  }
}

/**
 * Map a value from one range to another
 */
function mapRange(
  value: number,
  inMin: number,
  inMax: number,
  outMin: number,
  outMax: number
): number {
  const clamped = Math.max(inMin, Math.min(inMax, value));
  return ((clamped - inMin) / (inMax - inMin)) * (outMax - outMin) + outMin;
}

/**
 * Easing functions for different phases
 */
function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function easeInOutQuad(t: number): number {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
}

function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

function easeOutQuad(t: number): number {
  return 1 - (1 - t) * (1 - t);
}

/**
 * Dissolve shader material for the headset
 * Can be applied to the headset mesh to create dissolve effect
 */
export function createDissolveMaterial(
  originalMaterial: THREE.Material,
  opacity: number
): THREE.Material {
  if (originalMaterial instanceof THREE.MeshStandardMaterial) {
    const cloned = originalMaterial.clone();
    cloned.transparent = true;
    cloned.opacity = opacity;
    // Add slight emissive glow as it dissolves
    if (opacity < 1) {
      cloned.emissive = new THREE.Color('#FFB7C5');
      cloned.emissiveIntensity = (1 - opacity) * 0.3;
    }
    return cloned;
  }
  return originalMaterial;
}

/**
 * Hook to apply dissolve effect to a mesh
 */
export function useDissolveEffect(
  meshRef: React.RefObject<THREE.Mesh | THREE.Group>,
  opacity: number
) {
  const originalMaterials = useRef<Map<THREE.Mesh, THREE.Material | THREE.Material[]>>(new Map());
  
  useEffect(() => {
    if (!meshRef.current) return;
    
    // Store original materials on first run
    meshRef.current.traverse((child) => {
      if (child instanceof THREE.Mesh && !originalMaterials.current.has(child)) {
        originalMaterials.current.set(child, child.material);
      }
    });
    
    // Apply dissolve effect
    meshRef.current.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        const original = originalMaterials.current.get(child);
        if (original) {
          if (Array.isArray(original)) {
            child.material = original.map((m) => createDissolveMaterial(m, opacity));
          } else {
            child.material = createDissolveMaterial(original, opacity);
          }
        }
      }
    });
    
    // Cleanup: restore original materials when component unmounts
    return () => {
      if (meshRef.current) {
        meshRef.current.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            const original = originalMaterials.current.get(child);
            if (original) {
              child.material = original;
            }
          }
        });
      }
    };
  }, [opacity, meshRef]);
}
