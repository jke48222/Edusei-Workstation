import { useRef, useCallback, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import * as easing from 'maath/easing';
import { useWorkstationStore } from '../../store/store';
import {
  GALLERY_CONFIG,
  islandData,
  isOnMainIsland,
  isOnIsland,
  isOnBridge,
  clampToBounds,
} from '../../constants/galleryData';
import { getMovementVector } from '../../hooks/useKeyboardControls';

/**
 * @file AvatarController.tsx
 * @description Movement, mouse-look camera, gaze raycasting, and bridge logic. Handles:
 * 1. WASD/Arrow key movement with smooth acceleration
 * 2. Mouse-look 360° camera orbit (click + drag or pointer lock)
 * 3. Gaze-based bridge mechanic (raycast from camera center)
 * 4. Island proximity detection for cinema mode
 * 5. Movement bounds (main island + bridges + project islands)
 */
export function AvatarController() {
  const { camera, scene, gl } = useThree();

  // Store state and actions
  const input = useWorkstationStore((state) => state.input);
  const galleryCameraMode = useWorkstationStore((state) => state.galleryCameraMode);
  const cinematicTarget = useWorkstationStore((state) => state.cinematicTarget);
  const cinematicLookAt = useWorkstationStore((state) => state.cinematicLookAt);
  const activeIslandId = useWorkstationStore((state) => state.activeIslandId);
  const bridgeStates = useWorkstationStore((state) => state.bridgeStates);
  const gazeTargetIsland = useWorkstationStore((state) => state.gazeTargetIsland);

  const setAvatarPosition = useWorkstationStore((state) => state.setAvatarPosition);
  const setAvatarRotation = useWorkstationStore((state) => state.setAvatarRotation);
  const setIsMoving = useWorkstationStore((state) => state.setIsMoving);
  const setActiveVideo = useWorkstationStore((state) => state.setActiveVideo);
  const enterCinemaMode = useWorkstationStore((state) => state.enterCinemaMode);
  const exitCinemaMode = useWorkstationStore((state) => state.exitCinemaMode);
  const setGazeTarget = useWorkstationStore((state) => state.setGazeTarget);
  const setGazeProgress = useWorkstationStore((state) => state.setGazeProgress);
  const setBridgeState = useWorkstationStore((state) => state.setBridgeState);
  const setActiveIsland = useWorkstationStore((state) => state.setActiveIsland);

  // Movement refs
  const position = useRef(new THREE.Vector3(0, 0, 8));
  const velocity = useRef(new THREE.Vector3(0, 0, 0));

  // Camera orbit refs (mouse-look)
  const orbitAngle = useRef(0); // horizontal angle around player
  const orbitPitch = useRef(0.3); // vertical angle (radians, 0 = level, positive = looking down)
  const isDragging = useRef(false);

  // Camera smooth refs
  const cameraPosition = useRef(new THREE.Vector3(0, 5, 14));
  const cameraLookAt = useRef(new THREE.Vector3(0, 1, 8));

  // Gaze refs
  const raycaster = useRef(new THREE.Raycaster());
  const gazeProgressRef = useRef(0);
  const screenCenter = useRef(new THREE.Vector2(0, 0));

  // Cache gaze targets to avoid scene.traverse every frame
  const gazeTargetsCache = useRef<THREE.Object3D[]>([]);
  const gazeTargetsCacheTick = useRef(0);

  // Configuration
  const { speed } = GALLERY_CONFIG.avatar;
  const {
    followDistance,
    followHeight,
    followDamping,
    cinemaDamping,
  } = GALLERY_CONFIG.camera;

  // Mouse-look: pointer lock + mouse move
  useEffect(() => {
    const canvas = gl.domElement;

    const onPointerDown = (e: PointerEvent) => {
      if (e.button === 0) {
        isDragging.current = true;
        canvas.requestPointerLock?.();
      }
    };

    const onPointerUp = () => {
      isDragging.current = false;
    };

    const onMouseMove = (e: MouseEvent) => {
      // Use pointer lock movement or dragging
      if (document.pointerLockElement === canvas || isDragging.current) {
        const sensitivity = 0.003;
        orbitAngle.current -= e.movementX * sensitivity;
        orbitPitch.current += e.movementY * sensitivity;
        // Clamp pitch (don't flip over)
        orbitPitch.current = Math.max(-0.4, Math.min(1.2, orbitPitch.current));
      }
    };

    const onPointerLockChange = () => {
      if (document.pointerLockElement !== canvas) {
        isDragging.current = false;
      }
    };

    canvas.addEventListener('pointerdown', onPointerDown);
    canvas.addEventListener('pointerup', onPointerUp);
    window.addEventListener('mousemove', onMouseMove);
    document.addEventListener('pointerlockchange', onPointerLockChange);

    return () => {
      canvas.removeEventListener('pointerdown', onPointerDown);
      canvas.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('pointerlockchange', onPointerLockChange);
      if (document.pointerLockElement === canvas) {
        document.exitPointerLock?.();
      }
    };
  }, [gl]);

  /**
   * Check if position is on valid ground
   */
  const isOnValidGround = useCallback((pos: THREE.Vector3): boolean => {
    if (isOnMainIsland(pos)) return true;
    for (const island of islandData) {
      if (isOnIsland(pos, island)) return true;
      const state = bridgeStates[island.id];
      if (state === 'complete' && isOnBridge(pos, island)) return true;
    }
    return false;
  }, [bridgeStates]);

  /**
   * Detect which island the player is on
   */
  const detectCurrentIsland = useCallback((): string | null => {
    for (const island of islandData) {
      if (isOnIsland(position.current, island)) return island.id;
    }
    return null;
  }, []);

  /**
   * Gaze raycast — uses cached targets, refreshes every 60 frames
   */
  const performGazeRaycast = useCallback((): string | null => {
    raycaster.current.setFromCamera(screenCenter.current, camera);

    // Refresh cache periodically
    gazeTargetsCacheTick.current++;
    if (gazeTargetsCacheTick.current > 60 || gazeTargetsCache.current.length === 0) {
      gazeTargetsCache.current = [];
      scene.traverse((child) => {
        if (child.userData?.isGazeTarget) {
          gazeTargetsCache.current.push(child);
        }
      });
      gazeTargetsCacheTick.current = 0;
    }

    const hits = raycaster.current.intersectObjects(gazeTargetsCache.current, false);
    if (hits.length > 0) {
      return hits[0].object.userData.islandId as string;
    }
    return null;
  }, [camera, scene]);

  useFrame((_state, delta) => {
    const clampedDelta = Math.min(delta, 0.1);

    // ========================================================================
    // Movement — camera-relative direction
    // ========================================================================

    const movement = getMovementVector(input);
    const isMoving = movement.x !== 0 || movement.z !== 0;

    if (isMoving) {
      // Build camera-relative movement using orbit angle
      const forward = new THREE.Vector3(
        -Math.sin(orbitAngle.current),
        0,
        -Math.cos(orbitAngle.current)
      );
      const right = new THREE.Vector3(
        Math.cos(orbitAngle.current),
        0,
        -Math.sin(orbitAngle.current)
      );

      const moveDirection = new THREE.Vector3();
      moveDirection.addScaledVector(forward, -movement.z);
      moveDirection.addScaledVector(right, movement.x);
      moveDirection.normalize();

      velocity.current.copy(moveDirection).multiplyScalar(speed * clampedDelta);
    } else {
      velocity.current.multiplyScalar(0.85);
    }

    // Calculate new position
    const newPosition = position.current.clone().add(velocity.current);

    // Validate against valid ground
    if (isOnValidGround(newPosition)) {
      position.current.copy(newPosition);
    } else {
      const slideX = position.current.clone();
      slideX.x = newPosition.x;
      if (isOnValidGround(slideX)) {
        position.current.copy(slideX);
      } else {
        const slideZ = position.current.clone();
        slideZ.z = newPosition.z;
        if (isOnValidGround(slideZ)) {
          position.current.copy(slideZ);
        }
      }
    }

    // Clamp to overall bounds
    const clampedPos = clampToBounds(position.current);
    position.current.copy(clampedPos);

    // Compute avatar facing direction from movement (for the avatar mesh rotation)
    let avatarRot = orbitAngle.current;
    if (isMoving && velocity.current.lengthSq() > 0.0001) {
      avatarRot = Math.atan2(velocity.current.x, velocity.current.z);
    }

    // Update store
    setAvatarPosition(position.current);
    setAvatarRotation(avatarRot);
    setIsMoving(isMoving);

    // ========================================================================
    // Island Detection
    // ========================================================================

    const currentIsland = detectCurrentIsland();
    if (currentIsland !== activeIslandId) {
      setActiveIsland(currentIsland);

      if (currentIsland) {
        const island = islandData.find(i => i.id === currentIsland);
        if (island) {
          const islandCenter = new THREE.Vector3(...island.islandPosition);
          islandCenter.y = 3;
          const cameraPos = islandCenter.clone();
          cameraPos.y = 4;
          cameraPos.z += 6;
          enterCinemaMode(cameraPos, islandCenter);
          setActiveVideo(currentIsland, currentIsland);
        }
      } else if (activeIslandId) {
        exitCinemaMode();
        setActiveVideo(null, null);
      }
    }

    // ========================================================================
    // Gaze-Based Bridge Mechanic
    // ========================================================================

    if (isOnMainIsland(position.current) && galleryCameraMode === 'follow') {
      const gazedIslandId = performGazeRaycast();

      if (gazedIslandId) {
        const currentBridgeState = bridgeStates[gazedIslandId];

        if (!currentBridgeState || currentBridgeState === 'none') {
          if (gazeTargetIsland === gazedIslandId) {
            gazeProgressRef.current += clampedDelta / GALLERY_CONFIG.gaze.gazeTime;
            gazeProgressRef.current = Math.min(1, gazeProgressRef.current);
            setGazeProgress(gazeProgressRef.current);

            if (gazeProgressRef.current >= 1) {
              setBridgeState(gazedIslandId, 'building');
              setTimeout(() => {
                setBridgeState(gazedIslandId, 'complete');
              }, GALLERY_CONFIG.gaze.bridgeBuildTime * 1000);
              gazeProgressRef.current = 0;
              setGazeProgress(0);
              setGazeTarget(null);
            }
          } else {
            setGazeTarget(gazedIslandId);
            gazeProgressRef.current = 0;
            setGazeProgress(0);
          }
        }
      } else {
        if (gazeTargetIsland) {
          setGazeTarget(null);
          gazeProgressRef.current = 0;
          setGazeProgress(0);
        }
      }
    } else {
      if (gazeTargetIsland) {
        setGazeTarget(null);
        gazeProgressRef.current = 0;
        setGazeProgress(0);
      }
    }

    // ========================================================================
    // Camera — mouse orbit around player
    // ========================================================================

    if (galleryCameraMode === 'follow') {
      const dist = followDistance;
      const heightOffset = followHeight + Math.sin(orbitPitch.current) * dist * 0.5;

      const targetCameraPos = new THREE.Vector3(
        position.current.x + Math.sin(orbitAngle.current) * Math.cos(orbitPitch.current) * dist,
        position.current.y + heightOffset,
        position.current.z + Math.cos(orbitAngle.current) * Math.cos(orbitPitch.current) * dist
      );

      const targetLookAt = new THREE.Vector3(
        position.current.x,
        position.current.y + 1.5,
        position.current.z
      );

      easing.damp3(cameraPosition.current, targetCameraPos, followDamping, clampedDelta);
      easing.damp3(cameraLookAt.current, targetLookAt, followDamping * 0.8, clampedDelta);
    } else if (galleryCameraMode === 'cinema' && cinematicTarget && cinematicLookAt) {
      easing.damp3(cameraPosition.current, cinematicTarget, cinemaDamping, clampedDelta);
      easing.damp3(cameraLookAt.current, cinematicLookAt, cinemaDamping * 0.8, clampedDelta);
    }

    camera.position.copy(cameraPosition.current);
    camera.lookAt(cameraLookAt.current);
  });

  return null;
}

export default AvatarController;
