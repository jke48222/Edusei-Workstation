import { Suspense, useEffect } from 'react';
import { useWorkstationStore, useSceneMode, useIsInGallery, useBridgeStates } from '../../store/store';
import { islandData } from '../../constants/galleryData';
import { useKeyboardControls } from '../../hooks/useKeyboardControls';

// Gallery components
import { Avatar } from './Avatar';
import { AvatarController } from './AvatarController';
import { SpiritOasis } from './SpiritOasis';
import { GalleryPostProcessing } from './GalleryPostProcessing';
import { ProjectIslandGroup } from './ProjectIsland';
import { GazeBridgeGroup } from './GazeBridge';
import { SpatialAudioManager } from './SpatialAudioManager';

/**
 * @file GalleryExperience.tsx
 * @description Main entry point for the Spirit Oasis gallery scene. Orchestrates:
 * - SpiritOasis (sky, main island, Spirit Tree, Koi Pond, atmosphere)
 * - GalleryPostProcessing (bloom, vignette)
 * - ProjectIslandGroup (6 floating project islands)
 * - GazeBridgeGroup (stone-step bridges between islands)
 * - Avatar (player character)
 * - AvatarController (movement, camera, gaze raycasting)
 */
export function GalleryExperience() {
  const sceneMode = useSceneMode();
  const bridgeStates = useBridgeStates();

  if (sceneMode !== 'gallery') {
    return null;
  }

  return (
    <group>
      {/* Post-processing effects */}
      <GalleryPostProcessing />

      {/* Spirit Oasis environment (sky, main island, tree, pond) */}
      <SpiritOasis />

      {/* Project islands (6 floating exhibits) */}
      <Suspense fallback={null}>
        <ProjectIslandGroup islands={islandData} />
      </Suspense>

      {/* Gaze bridges (stone steps between main and project islands) */}
      <GazeBridgeGroup islands={islandData} bridgeStates={bridgeStates} />

      {/* Player avatar */}
      <Suspense fallback={null}>
        <Avatar />
      </Suspense>

      {/* Movement, camera, and gaze controller */}
      <AvatarController />

      {/* Spatial audio (wind, water, chimes, birds) */}
      <SpatialAudioManager />

      {/* Spawn point marker */}
      <SpawnPointMarker />
    </group>
  );
}

/**
 * SpawnPointMarker — soft glow ring where the player spawns
 */
function SpawnPointMarker() {
  return (
    <group position={[0, 0.05, 8]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.6, 0.8, 32]} />
        <meshBasicMaterial
          color="#FFB7C5"
          transparent
          opacity={0.3}
        />
      </mesh>
    </group>
  );
}

/**
 * GalleryKeyboardHandler — handles keyboard input for the gallery
 */
export function GalleryKeyboardHandler() {
  const isInGallery = useIsInGallery();

  useKeyboardControls(isInGallery);

  const exitGallery = useWorkstationStore((state) => state.exitGallery);

  useEffect(() => {
    if (!isInGallery) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        exitGallery();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isInGallery, exitGallery]);

  return null;
}

/**
 * GalleryLoadingState — loading placeholder with warm colors
 */
export function GalleryLoadingState() {
  return (
    <group>
      <color attach="background" args={['#2A6B6B']} />
      <ambientLight intensity={0.3} color="#FFF8E7" />

      <mesh position={[0, 1.5, 0]}>
        <octahedronGeometry args={[0.4, 0]} />
        <meshStandardMaterial
          color="#FFB7C5"
          wireframe
          emissive="#FFB7C5"
          emissiveIntensity={0.5}
        />
      </mesh>
    </group>
  );
}

export default GalleryExperience;
