import { Suspense, useEffect } from 'react';
import { useWorkstationStore, useSceneMode, useIsInGallery } from '../../store/store';
import { galleryVideos } from '../../constants/galleryData';
import { useKeyboardControls } from '../../hooks/useKeyboardControls';

// Gallery components
import { Avatar } from './Avatar';
import { AvatarController } from './AvatarController';
import { VideoStageGroup } from './VideoStage';
import { VoidEnvironment } from './VoidEnvironment';

/**
 * GalleryExperience Component
 * 
 * The main entry point for the gallery scene.
 * Orchestrates all gallery sub-components:
 * - VoidEnvironment (background, lighting, decorations)
 * - VideoStageGroup (all video platforms and screens)
 * - Avatar (the player character)
 * - AvatarController (movement and camera logic)
 * 
 * This component is conditionally rendered based on sceneMode.
 */
export function GalleryExperience() {
  const sceneMode = useSceneMode();
  const isInGallery = useIsInGallery();
  
  // Only render when we're in the gallery
  if (sceneMode !== 'gallery') {
    return null;
  }
  
  return (
    <group>
      {/* Environment - background, floor, lighting, decorations */}
      <VoidEnvironment />
      
      {/* Video screens and platforms */}
      <Suspense fallback={null}>
        <VideoStageGroup videos={galleryVideos} />
      </Suspense>
      
      {/* Player avatar */}
      <Suspense fallback={null}>
        <Avatar />
      </Suspense>
      
      {/* Movement and camera controller */}
      <AvatarController />
      
      {/* Spawn point marker (optional visual) */}
      <SpawnPointMarker />
    </group>
  );
}

/**
 * SpawnPointMarker - Visual indicator of where the player starts
 */
function SpawnPointMarker() {
  return (
    <group position={[0, 0.01, 8]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.8, 1, 32]} />
        <meshBasicMaterial
          color="#22c55e"
          transparent
          opacity={0.3}
        />
      </mesh>
    </group>
  );
}

/**
 * GalleryKeyboardHandler - Handles keyboard input for the gallery
 * This is a separate component to avoid re-renders in the main experience
 */
export function GalleryKeyboardHandler() {
  const isInGallery = useIsInGallery();
  
  // Enable keyboard controls only when in gallery
  useKeyboardControls(isInGallery);
  
  // Handle ESC to exit gallery
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
 * GalleryLoadingState - Loading placeholder while gallery initializes
 */
export function GalleryLoadingState() {
  return (
    <group>
      <color attach="background" args={['#030014']} />
      <ambientLight intensity={0.2} />
      
      {/* Loading indicator */}
      <mesh position={[0, 1.5, 0]}>
        <boxGeometry args={[0.5, 0.5, 0.5]} />
        <meshStandardMaterial
          color="#6366f1"
          wireframe
          emissive="#6366f1"
          emissiveIntensity={0.5}
        />
      </mesh>
    </group>
  );
}

export default GalleryExperience;
