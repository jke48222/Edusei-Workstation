/**
 * @file CameraRig.tsx
 * @description R3F camera controller: smooth transitions between workstation views (monitor,
 * car, dog, vr, satellite, tablet) using maath damp easing. Configs vary by viewport
 * (mobile vs desktop). Exports OBJECT_POSITIONS and CameraConfig for alignment with Experience.
 */

import { useRef, useMemo, useState, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Vector3 } from 'three';
import * as easing from 'maath/easing';
import { useWorkstationStore } from '../store/store';
import type { ViewState } from '../store/store';

/** Camera position and look-at target for a single view. */
interface CameraConfig {
  position: Vector3;
  target: Vector3;
}

/** World positions for each view; must match Experience.tsx (25 units apart on X). */
const OBJECT_POSITIONS = {
  monitor: { x: 0, y: 1, z: 0 },
  car: { x: 25, y: 1.5, z: 0 },
  dog: { x: 50, y: 1.5, z: 0 },
  vr: { x: 75, y: 1.5, z: 0 },
  satellite: { x: 100, y: 1.5, z: 0 },
  tablet: { x: 125, y: 1.5, z: 0 },
};

/** In-component mobile check (viewport width < 768). */
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

/** Builds position/target configs for all views; distance and height vary by isMobile. */
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
 * R3F component (returns null). Drives camera position and lookAt from currentView
 * with damped easing; calls completeAnimation when within ARRIVAL_THRESHOLD.
 */
export function CameraRig() {
  const { camera } = useThree();
  const { currentView, isAnimating, completeAnimation } = useWorkstationStore();
  const isMobile = useIsMobile();

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

/** Exported for alignment with Experience and tests. */
export { OBJECT_POSITIONS };
export type { CameraConfig };
