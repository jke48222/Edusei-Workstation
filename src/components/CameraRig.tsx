import { useRef, useMemo } from 'react';
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
 * Camera framing constants
 */
const CAMERA_DISTANCE = 7;
const CAMERA_HEIGHT = 2.5;

/**
 * THIS controls left/right screen framing
 * Increase this to push the object further LEFT on screen
 */
const TARGET_X_OFFSET = -2;

/**
 * Define camera positions and look-at targets for every view state
 */
const cameraConfigs: Record<ViewState, CameraConfig> = {
  // Monitor: Homepage view (centered)
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

/**
 * CameraRig Component
 *
 * Handles smooth camera transitions between different view states
 * using maath easing for a heavy, cinematic feel.
 */
export function CameraRig() {
  const { camera } = useThree();
  const { currentView, isAnimating, completeAnimation } = useWorkstationStore();

  const currentPosition = useRef(new Vector3());
  const currentTarget = useRef(new Vector3());
  const initialized = useRef(false);

  const ARRIVAL_THRESHOLD = 0.05;

  const targetConfig = useMemo(() => {
    return cameraConfigs[currentView];
  }, [currentView]);

  // Initialize camera on first render
  if (!initialized.current) {
    const initialConfig = cameraConfigs.monitor;
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
 * Export camera configs for reuse
 */
export { cameraConfigs, OBJECT_POSITIONS };
export type { CameraConfig };
