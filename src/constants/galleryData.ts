import * as THREE from 'three';

/**
 * Video project data for the gallery
 * Each video corresponds to a floating screen with a trigger platform
 */
export interface GalleryVideo {
  id: string;
  title: string;
  description: string;
  videoUrl: string;
  thumbnailUrl: string;
  
  // 3D positioning
  platformPosition: [number, number, number];
  screenPosition: [number, number, number];
  screenRotation: [number, number, number]; // Euler angles
  
  // Optional: camera position when in cinema mode
  cameraOffset?: [number, number, number];
  
  // GitHub link if available
  github?: string;
}

/**
 * Gallery layout configuration
 */
export const GALLERY_CONFIG = {
  // Avatar settings
  avatar: {
    height: 1.8,
    radius: 0.4,
    speed: 5,
    rotationSpeed: 3,
  },
  
  // Platform settings (trigger zones)
  platform: {
    radius: 1.5,
    height: 0.1,
    triggerRadius: 2.0, // Distance to trigger video
    exitRadius: 2.5,    // Distance to exit video
  },
  
  // Screen settings
  screen: {
    width: 16 / 3,  // 16:9 aspect ratio scaled
    height: 9 / 3,
  },
  
  // Camera settings
  camera: {
    followDistance: 6,
    followHeight: 3,
    followDamping: 0.3,
    cinemaDamping: 0.2,
    cinemaDistance: 5,
  },
  
  // Environment bounds
  bounds: {
    minX: -20,
    maxX: 20,
    minZ: -15,
    maxZ: 15,
  },
} as const;

/**
 * VR Project videos for the gallery
 * Arranged in a semicircle facing the spawn point
 */
export const galleryVideos: GalleryVideo[] = [
  {
    id: 'kitchen-chaos',
    title: 'Kitchen Chaos VR',
    description: 'Overcooked-style multiplayer VR cooking game for Meta Quest 3',
    videoUrl: '/videos/kitchen-chaos.mp4',
    thumbnailUrl: '/thumbnails/kitchen-chaos.jpg',
    platformPosition: [-8, 0, -5],
    screenPosition: [-8, 3, -8],
    screenRotation: [0, Math.PI / 6, 0],
    github: 'https://github.com/jke48222/VR-Final-Project',
  },
  {
    id: 'vr-portfolio-2',
    title: 'VR Portfolio 2',
    description: 'Quest 3 XR environments with spatial audio, physics, and hand-tracking',
    videoUrl: '/videos/vr-portfolio-2.mp4',
    thumbnailUrl: '/thumbnails/vr-portfolio-2.jpg',
    platformPosition: [0, 0, -8],
    screenPosition: [0, 3, -12],
    screenRotation: [0, 0, 0],
    github: 'https://github.com/jke48222/VR-Portfolio-2',
  },
  {
    id: 'vr-portfolio-1',
    title: 'VR Portfolio 1',
    description: 'Four-part Unity portfolio: transformation, physics, immersion, interaction',
    videoUrl: '/videos/vr-portfolio-1.mp4',
    thumbnailUrl: '/thumbnails/vr-portfolio-1.jpg',
    platformPosition: [8, 0, -5],
    screenPosition: [8, 3, -8],
    screenRotation: [0, -Math.PI / 6, 0],
    github: 'https://github.com/jke48222/VR-Portfolio-1',
  },
];

/**
 * Get video by ID
 */
export const getVideoById = (id: string): GalleryVideo | undefined => {
  return galleryVideos.find(v => v.id === id);
};

/**
 * Calculate camera position for cinema mode
 * Positions camera to frame the screen nicely
 */
export const calculateCinemaCamera = (
  screenPosition: THREE.Vector3,
  screenRotation: THREE.Euler
): { position: THREE.Vector3; lookAt: THREE.Vector3 } => {
  const { cinemaDistance } = GALLERY_CONFIG.camera;
  
  // Calculate forward direction from screen rotation
  const forward = new THREE.Vector3(0, 0, 1);
  forward.applyEuler(screenRotation);
  
  // Position camera in front of screen
  const cameraPos = screenPosition.clone().add(
    forward.multiplyScalar(cinemaDistance)
  );
  cameraPos.y = screenPosition.y; // Keep at screen height
  
  return {
    position: cameraPos,
    lookAt: screenPosition.clone(),
  };
};

/**
 * Platform positions for proximity detection (Vector3 for calculations)
 */
export const getPlatformPositions = (): Map<string, THREE.Vector3> => {
  const positions = new Map<string, THREE.Vector3>();
  
  galleryVideos.forEach((video) => {
    positions.set(
      video.id,
      new THREE.Vector3(...video.platformPosition)
    );
  });
  
  return positions;
};

/**
 * Check if a position is within bounds
 */
export const isWithinBounds = (position: THREE.Vector3): boolean => {
  const { bounds } = GALLERY_CONFIG;
  return (
    position.x >= bounds.minX &&
    position.x <= bounds.maxX &&
    position.z >= bounds.minZ &&
    position.z <= bounds.maxZ
  );
};

/**
 * Clamp position to bounds
 */
export const clampToBounds = (position: THREE.Vector3): THREE.Vector3 => {
  const { bounds } = GALLERY_CONFIG;
  return new THREE.Vector3(
    Math.max(bounds.minX, Math.min(bounds.maxX, position.x)),
    position.y,
    Math.max(bounds.minZ, Math.min(bounds.maxZ, position.z))
  );
};
