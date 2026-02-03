import { useRef, useMemo, useState, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Vector3 } from 'three';
import * as easing from 'maath/easing';
import { 
  useWorkstationStore, 
  useSceneMode, 
  useIsInGallery 
} from '../store/store';
import type { ViewState } from '../store/store';

/**
 * Camera position and target configuration for each view
 */
interface CameraConfig {
  position: Vector3;
  target: Vector3;
}

/**
 * Object positions (must match Experience.tsx)
 * Objects are arranged in a line along X-axis, 25 units apart
 */
const OBJECT_POSITIONS = {
  monitor: { x: 0, y: 1, z: 0 },
  car: { x: 25, y: 1.5, z: 0 },
  dog: { x: 50, y: 1.5, z: 0 },
  vr: { x: 75, y: 1.5, z: 0 },
  satellite: { x: 100, y: 1.5, z: 0 },
  tablet: { x: 125, y: 1.5, z: 0 },
};

/**
 * Hook to detect mobile viewport (must be in component)
 */
function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  return isMobile;
}

/**
 * Generate camera configs based on screen size
 */
function getCameraConfigs(isMobile: boolean): Record<ViewState, CameraConfig> {
  const TARGET_X_OFFSET = isMobile ? 0 : -2;
  const CAMERA_DISTANCE = isMobile ? 6.8 : 7;
  const CAMERA_HEIGHT = isMobile ? 1.8 : 2.5;

  return {
    monitor: {
      position: new Vector3(
        OBJECT_POSITIONS.monitor.x,
        1.6,
        4
      ),
      target: new Vector3(
        OBJECT_POSITIONS.monitor.x,
        OBJECT_POSITIONS.monitor.y,
        OBJECT_POSITIONS.monitor.z
      ),
    },

    car: {
      position: new Vector3(
        OBJECT_POSITIONS.car.x,
        CAMERA_HEIGHT,
        CAMERA_DISTANCE
      ),
      target: new Vector3(
        OBJECT_POSITIONS.car.x - TARGET_X_OFFSET,
        OBJECT_POSITIONS.car.y,
        OBJECT_POSITIONS.car.z
      ),
    },

    dog: {
      position: new Vector3(
        OBJECT_POSITIONS.dog.x,
        CAMERA_HEIGHT,
        CAMERA_DISTANCE
      ),
      target: new Vector3(
        OBJECT_POSITIONS.dog.x - TARGET_X_OFFSET,
        OBJECT_POSITIONS.dog.y,
        OBJECT_POSITIONS.dog.z
      ),
    },

    vr: {
      position: new Vector3(
        OBJECT_POSITIONS.vr.x,
        CAMERA_HEIGHT,
        CAMERA_DISTANCE
      ),
      target: new Vector3(
        OBJECT_POSITIONS.vr.x - TARGET_X_OFFSET,
        OBJECT_POSITIONS.vr.y,
        OBJECT_POSITIONS.vr.z
      ),
    },

    satellite: {
      position: new Vector3(
        OBJECT_POSITIONS.satellite.x,
        CAMERA_HEIGHT,
        CAMERA_DISTANCE
      ),
      target: new Vector3(
        OBJECT_POSITIONS.satellite.x - TARGET_X_OFFSET,
        OBJECT_POSITIONS.satellite.y,
        OBJECT_POSITIONS.satellite.z
      ),
    },

    tablet: {
      position: new Vector3(
        OBJECT_POSITIONS.tablet.x,
        CAMERA_HEIGHT,
        CAMERA_DISTANCE
      ),
      target: new Vector3(
        OBJECT_POSITIONS.tablet.x - TARGET_X_OFFSET,
        OBJECT_POSITIONS.tablet.y,
        OBJECT_POSITIONS.tablet.z
      ),
    },
  };
}

/**
 * CameraRig Component
 *
 * Handles smooth camera transitions between different view states
 * using maath easing for a heavy, cinematic feel.
 * 
 * Now also handles scene mode changes (workstation vs gallery).
 * The TransitionPortal component handles the actual transition animation.
 */
export function CameraRig() {
  const { camera } = useThree();
  const { currentView, isAnimating, completeAnimation } = useWorkstationStore();
  const sceneMode = useSceneMode();
  const isInGallery = useIsInGallery();
  const isMobile = useIsMobile();

  const currentPosition = useRef(new Vector3());
  const currentTarget = useRef(new Vector3());
  const initialized = useRef(false);

  const ARRIVAL_THRESHOLD = 0.05;

  // Regenerate camera configs when screen size changes
  const cameraConfigs = useMemo(() => getCameraConfigs(isMobile), [isMobile]);

  const targetConfig = useMemo(() => {
    return cameraConfigs[currentView];
  }, [currentView, cameraConfigs]);

  // Initialize camera on first render
  if (!initialized.current) {
    const initialConfig = getCameraConfigs(false).monitor;
    currentPosition.current.copy(initialConfig.position);
    currentTarget.current.copy(initialConfig.target);
    camera.position.copy(initialConfig.position);
    camera.lookAt(initialConfig.target);
    initialized.current = true;
  }

  useFrame((_, delta) => {
    // Skip camera updates during transition (TransitionPortal handles it)
    // And skip during gallery mode (AvatarController handles it)
    if (sceneMode === 'vr-transition' || sceneMode === 'gallery') {
      return;
    }
    
    const clampedDelta = Math.min(delta, 0.1);
    const dampingFactor = 0.4;

    easing.damp3(
      currentPosition.current,
      targetConfig.position,
      dampingFactor,
      clampedDelta
    );

    easing.damp3(
      currentTarget.current,
      targetConfig.target,
      dampingFactor,
      clampedDelta
    );

    camera.position.copy(currentPosition.current);
    camera.lookAt(currentTarget.current);

    if (isAnimating) {
      const positionDistance =
        currentPosition.current.distanceTo(targetConfig.position);
      const targetDistance =
        currentTarget.current.distanceTo(targetConfig.target);

      if (
        positionDistance < ARRIVAL_THRESHOLD &&
        targetDistance < ARRIVAL_THRESHOLD
      ) {
        completeAnimation();
      }
    }
  });

  return null;
}

/**
 * Export for reuse
 */
export { OBJECT_POSITIONS };
export type { CameraConfig };
