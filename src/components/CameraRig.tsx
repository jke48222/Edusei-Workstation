/**
 * @file CameraRig.tsx
 * @description React Three Fiber camera controller component providing smooth transitions
 * between workstation object views (monitor, robot car, sleeping dog, VR headset, satellite,
 * Capital One logo) using maath damp easing functions. Camera configurations adapt based
 * on viewport size (mobile vs desktop). Exports OBJECT_POSITIONS and CameraConfig types
 * for alignment with the Experience component.
 */

import { useRef, useMemo, useState, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Vector3 } from 'three';
import * as easing from 'maath/easing';
import { useWorkstationStore } from '../store/store';
import type { ViewState } from '../store/store';

/** Camera configuration interface defining position and look-at target for a single view. */
interface CameraConfig {
  position: Vector3;
  target: Vector3;
}

/** World-space coordinate positions for each workstation object view. Must match Experience.tsx object positions (spaced 25 units apart on X-axis). */
const OBJECT_POSITIONS = {
  monitor: { x: 0, y: 1, z: 0 },
  'audio-tracking-car': { x: 25, y: 1.5, z: 0 },
  animaldot: { x: 50, y: 1.5, z: 0 },
  'kitchen-chaos-vr': { x: 75, y: 1.5, z: 0 },
  memesat: { x: 100, y: 1.5, z: 0 },
  'capital-one': { x: 125, y: 1.5, z: 0 },
};

/** Custom hook that detects mobile viewport (width < 768px) for responsive camera configuration. */
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

/** Generates camera position and target configurations for all workstation views. Distance and height parameters adapt based on mobile vs desktop viewport. */
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

    'audio-tracking-car': {
      position: new Vector3(
        OBJECT_POSITIONS['audio-tracking-car'].x,
        CAMERA_HEIGHT,
        CAMERA_DISTANCE
      ),
      target: new Vector3(
        OBJECT_POSITIONS['audio-tracking-car'].x - TARGET_X_OFFSET,
        OBJECT_POSITIONS['audio-tracking-car'].y,
        OBJECT_POSITIONS['audio-tracking-car'].z
      ),
    },

    animaldot: {
      position: new Vector3(
        OBJECT_POSITIONS.animaldot.x,
        CAMERA_HEIGHT,
        CAMERA_DISTANCE
      ),
      target: new Vector3(
        OBJECT_POSITIONS.animaldot.x - TARGET_X_OFFSET,
        OBJECT_POSITIONS.animaldot.y,
        OBJECT_POSITIONS.animaldot.z
      ),
    },

    'kitchen-chaos-vr': {
      position: new Vector3(
        OBJECT_POSITIONS['kitchen-chaos-vr'].x,
        CAMERA_HEIGHT,
        CAMERA_DISTANCE
      ),
      target: new Vector3(
        OBJECT_POSITIONS['kitchen-chaos-vr'].x - TARGET_X_OFFSET,
        OBJECT_POSITIONS['kitchen-chaos-vr'].y,
        OBJECT_POSITIONS['kitchen-chaos-vr'].z
      ),
    },

    memesat: {
      position: new Vector3(
        OBJECT_POSITIONS.memesat.x,
        CAMERA_HEIGHT,
        CAMERA_DISTANCE
      ),
      target: new Vector3(
        OBJECT_POSITIONS.memesat.x - TARGET_X_OFFSET,
        OBJECT_POSITIONS.memesat.y,
        OBJECT_POSITIONS.memesat.z
      ),
    },

    'capital-one': {
      position: new Vector3(
        OBJECT_POSITIONS['capital-one'].x,
        CAMERA_HEIGHT,
        CAMERA_DISTANCE
      ),
      target: new Vector3(
        OBJECT_POSITIONS['capital-one'].x - TARGET_X_OFFSET,
        OBJECT_POSITIONS['capital-one'].y,
        OBJECT_POSITIONS['capital-one'].z
      ),
    },
  };
}

/**
 * R3F component (returns null). Drives camera position and lookAt from currentView
 * with damped easing; calls completeAnimation when within ARRIVAL_THRESHOLD.
 */
export function CameraRig() {
  const { camera } = useThree();
  const { currentView, isAnimating, completeAnimation, prefersReducedMotion } = useWorkstationStore();
  const isMobile = useIsMobile();
  const dampingFactor = prefersReducedMotion ? 25 : 0.4;

  const currentPosition = useRef(new Vector3());
  const currentTarget = useRef(new Vector3());
  const initialized = useRef(false);

  const ARRIVAL_THRESHOLD = 0.05;

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
    const clampedDelta = Math.min(delta, 0.1);

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

/** Exported for alignment with Experience and tests. */
export { OBJECT_POSITIONS };
export type { CameraConfig };
