import { useRef, useCallback } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import * as easing from 'maath/easing';
import { useWorkstationStore } from '../../store/store';
import { 
  GALLERY_CONFIG, 
  galleryVideos,
  clampToBounds,
  calculateCinemaCamera,
} from '../../constants/galleryData';
import { getMovementVector } from '../../hooks/useKeyboardControls';

/**
 * AvatarController Component
 * 
 * Handles:
 * 1. WASD/Arrow key movement with smooth acceleration
 * 2. Camera following with maath damping
 * 3. Platform proximity detection (Vector3 distance checks)
 * 4. Cinema mode camera transitions
 * 
 * This is a "controller" component that runs in the render loop
 * but doesn't render any visible geometry itself.
 */
export function AvatarController() {
  const { camera } = useThree();
  
  // Store state and actions
  const input = useWorkstationStore((state) => state.input);
  const galleryCameraMode = useWorkstationStore((state) => state.galleryCameraMode);
  const cinematicTarget = useWorkstationStore((state) => state.cinematicTarget);
  const cinematicLookAt = useWorkstationStore((state) => state.cinematicLookAt);
  const activeVideoId = useWorkstationStore((state) => state.activeVideoId);
  
  const setAvatarPosition = useWorkstationStore((state) => state.setAvatarPosition);
  const setAvatarRotation = useWorkstationStore((state) => state.setAvatarRotation);
  const setIsMoving = useWorkstationStore((state) => state.setIsMoving);
  const setActiveVideo = useWorkstationStore((state) => state.setActiveVideo);
  const enterCinemaMode = useWorkstationStore((state) => state.enterCinemaMode);
  const exitCinemaMode = useWorkstationStore((state) => state.exitCinemaMode);
  
  // Internal refs for smooth movement
  const position = useRef(new THREE.Vector3(0, 0, 8));
  const velocity = useRef(new THREE.Vector3(0, 0, 0));
  const rotation = useRef(0);
  const targetRotation = useRef(0);
  
  // Camera refs
  const cameraPosition = useRef(new THREE.Vector3(0, 5, 14));
  const cameraLookAt = useRef(new THREE.Vector3(0, 1, 8));
  
  // Platform detection cache
  const platformPositions = useRef<Map<string, THREE.Vector3>>(new Map());
  
  // Initialize platform positions
  if (platformPositions.current.size === 0) {
    galleryVideos.forEach((video) => {
      platformPositions.current.set(
        video.id,
        new THREE.Vector3(...video.platformPosition)
      );
    });
  }
  
  // Configuration
  const { speed, rotationSpeed } = GALLERY_CONFIG.avatar;
  const { 
    followDistance, 
    followHeight, 
    followDamping,
    cinemaDamping,
  } = GALLERY_CONFIG.camera;
  const { triggerRadius, exitRadius } = GALLERY_CONFIG.platform;
  
  /**
   * Check proximity to all platforms
   * Returns the ID of the platform the avatar is standing on, or null
   */
  const checkPlatformProximity = useCallback((): string | null => {
    let closestId: string | null = null;
    let closestDistance = Infinity;
    
    platformPositions.current.forEach((platformPos, videoId) => {
      // Calculate horizontal distance (ignore Y)
      const dx = position.current.x - platformPos.x;
      const dz = position.current.z - platformPos.z;
      const distance = Math.sqrt(dx * dx + dz * dz);
      
      if (distance < triggerRadius && distance < closestDistance) {
        closestDistance = distance;
        closestId = videoId;
      }
    });
    
    return closestId;
  }, [triggerRadius]);
  
  /**
   * Check if avatar has exited the current platform
   */
  const hasExitedPlatform = useCallback((platformId: string): boolean => {
    const platformPos = platformPositions.current.get(platformId);
    if (!platformPos) return true;
    
    const dx = position.current.x - platformPos.x;
    const dz = position.current.z - platformPos.z;
    const distance = Math.sqrt(dx * dx + dz * dz);
    
    return distance > exitRadius;
  }, [exitRadius]);
  
  useFrame((state, delta) => {
    const clampedDelta = Math.min(delta, 0.1); // Prevent huge jumps
    
    // ========================================================================
    // Movement Processing
    // ========================================================================
    
    // Get movement direction from input
    const movement = getMovementVector(input);
    const isMoving = movement.x !== 0 || movement.z !== 0;
    
    if (isMoving) {
      // Calculate target rotation based on movement direction
      targetRotation.current = Math.atan2(movement.x, movement.z);
      
      // Apply movement with camera-relative direction
      // This makes WASD always relative to the screen, not the character
      const cameraForward = new THREE.Vector3(0, 0, -1);
      cameraForward.applyQuaternion(camera.quaternion);
      cameraForward.y = 0;
      cameraForward.normalize();
      
      const cameraRight = new THREE.Vector3(1, 0, 0);
      cameraRight.applyQuaternion(camera.quaternion);
      cameraRight.y = 0;
      cameraRight.normalize();
      
      // Combine forward/back and left/right movement
      const moveDirection = new THREE.Vector3();
      moveDirection.addScaledVector(cameraForward, -movement.z);
      moveDirection.addScaledVector(cameraRight, movement.x);
      moveDirection.normalize();
      
      // Calculate target rotation to face movement direction
      if (moveDirection.lengthSq() > 0) {
        targetRotation.current = Math.atan2(moveDirection.x, moveDirection.z);
      }
      
      // Apply velocity
      velocity.current.copy(moveDirection).multiplyScalar(speed * clampedDelta);
    } else {
      // Decelerate when not moving
      velocity.current.multiplyScalar(0.85);
    }
    
    // Smoothly rotate towards target rotation
    const rotationDiff = targetRotation.current - rotation.current;
    // Handle rotation wrapping
    let normalizedDiff = ((rotationDiff + Math.PI) % (Math.PI * 2)) - Math.PI;
    if (normalizedDiff < -Math.PI) normalizedDiff += Math.PI * 2;
    
    rotation.current += normalizedDiff * rotationSpeed * clampedDelta;
    
    // Update position
    position.current.add(velocity.current);
    
    // Clamp to bounds
    const clampedPos = clampToBounds(position.current);
    position.current.copy(clampedPos);
    
    // Update store
    setAvatarPosition(position.current);
    setAvatarRotation(rotation.current);
    setIsMoving(isMoving);
    
    // ========================================================================
    // Platform Proximity Detection
    // ========================================================================
    
    const currentPlatform = checkPlatformProximity();
    
    if (galleryCameraMode === 'follow') {
      // Check if we've entered a platform
      if (currentPlatform && currentPlatform !== activeVideoId) {
        // Enter cinema mode for this platform
        const video = galleryVideos.find(v => v.id === currentPlatform);
        if (video) {
          const screenPos = new THREE.Vector3(...video.screenPosition);
          const screenRot = new THREE.Euler(...video.screenRotation);
          const { position: cameraPos, lookAt } = calculateCinemaCamera(screenPos, screenRot);
          
          enterCinemaMode(cameraPos, lookAt);
          setActiveVideo(video.id, video.id);
        }
      }
    } else if (galleryCameraMode === 'cinema' && activeVideoId) {
      // Check if we've exited the current platform
      if (hasExitedPlatform(activeVideoId)) {
        exitCinemaMode();
        setActiveVideo(null, null);
      }
    }
    
    // ========================================================================
    // Camera Control
    // ========================================================================
    
    if (galleryCameraMode === 'follow') {
      // Third-person follow camera
      // Position camera behind and above the avatar
      const targetCameraPos = new THREE.Vector3(
        position.current.x - Math.sin(rotation.current) * followDistance,
        position.current.y + followHeight,
        position.current.z - Math.cos(rotation.current) * followDistance
      );
      
      const targetLookAt = new THREE.Vector3(
        position.current.x,
        position.current.y + 1.2, // Look at upper body
        position.current.z
      );
      
      // Smooth camera movement with maath easing
      easing.damp3(cameraPosition.current, targetCameraPos, followDamping, clampedDelta);
      easing.damp3(cameraLookAt.current, targetLookAt, followDamping * 0.8, clampedDelta);
      
    } else if (galleryCameraMode === 'cinema' && cinematicTarget && cinematicLookAt) {
      // Cinema mode - lock camera on screen
      easing.damp3(cameraPosition.current, cinematicTarget, cinemaDamping, clampedDelta);
      easing.damp3(cameraLookAt.current, cinematicLookAt, cinemaDamping * 0.8, clampedDelta);
    }
    
    // Apply camera transform
    camera.position.copy(cameraPosition.current);
    camera.lookAt(cameraLookAt.current);
  });
  
  // This component doesn't render anything visible
  return null;
}

/**
 * Dedicated camera rig for the gallery
 * Alternative implementation if you want to separate camera logic
 */
export function GalleryCameraRig() {
  const { camera } = useThree();
  const galleryCameraMode = useWorkstationStore((state) => state.galleryCameraMode);
  const avatarPosition = useWorkstationStore((state) => state.avatarPosition);
  const avatarRotation = useWorkstationStore((state) => state.avatarRotation);
  const cinematicTarget = useWorkstationStore((state) => state.cinematicTarget);
  const cinematicLookAt = useWorkstationStore((state) => state.cinematicLookAt);
  
  const cameraPosition = useRef(new THREE.Vector3(0, 5, 14));
  const cameraLookAt = useRef(new THREE.Vector3(0, 1, 8));
  
  const { 
    followDistance, 
    followHeight, 
    followDamping,
    cinemaDamping,
  } = GALLERY_CONFIG.camera;
  
  useFrame((_, delta) => {
    const clampedDelta = Math.min(delta, 0.1);
    
    if (galleryCameraMode === 'follow') {
      const targetCameraPos = new THREE.Vector3(
        avatarPosition.x - Math.sin(avatarRotation) * followDistance,
        avatarPosition.y + followHeight,
        avatarPosition.z - Math.cos(avatarRotation) * followDistance
      );
      
      const targetLookAt = new THREE.Vector3(
        avatarPosition.x,
        avatarPosition.y + 1.2,
        avatarPosition.z
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
