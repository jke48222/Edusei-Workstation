import { useRef, useMemo, useState, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Vector3 } from 'three';
import * as easing from 'maath/easing';
import { useWorkstationStore } from '../store';
import type { ViewState } from '../store';

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
 * 
 * DESKTOP: Offset camera target to push model to left side (text panel on right)
 * MOBILE: Center the model (bottom sheet doesn't block it as much)
 */
function getCameraConfigs(isMobile: boolean): Record<ViewState, CameraConfig> {
  // Desktop: offset to left. Mobile: centered
  const TARGET_X_OFFSET = isMobile ? 0 : -2;
  
  // Mobile: slightly closer and higher to see model above bottom sheet
  const CAMERA_DISTANCE = isMobile ? 5.5 : 7;
  const CAMERA_HEIGHT = isMobile ? 2.8 : 2.5;

  return {
    // Monitor: Homepage view (always centered)
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

    // Car: Audio Tracking Car
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

    // Dog: AnimalDot sleeping dog
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

    // VR: Kitchen Chaos VR headset
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

    // Satellite: MEMESat-1 CubeSat
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

    // Tablet: Capital One
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
 * RESPONSIVE BEHAVIOR:
 * - Desktop: Model offset to left side (room for text panel on right)
 * - Mobile: Model centered (bottom sheet slides up from below)
 */
export function CameraRig() {
  const { camera } = useThree();
  const { currentView, isAnimating, completeAnimation } = useWorkstationStore();
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
    const initialConfig = getCameraConfigs(false).monitor; // Start with desktop config
    currentPosition.current.copy(initialConfig.position);
    currentTarget.current.copy(initialConfig.target);
    camera.position.copy(initialConfig.position);
    camera.lookAt(initialConfig.target);
    initialized.current = true;
  }

  useFrame((_, delta) => {
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
