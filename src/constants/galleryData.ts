/**
 * @file galleryData.ts
 * @description Spirit Oasis gallery configuration: island layout, gaze targets, bridge
 * anchors, video/platform data, and GALLERY_CONFIG (avatar, platform, physics). Types:
 * GalleryVideo, IslandData. Exports islandData, galleryVideos, and related constants.
 */

import * as THREE from 'three';

// ============================================================================
// Type Definitions
// ============================================================================

export interface GalleryVideo {
  id: string;
  title: string;
  description: string;
  videoUrl: string;
  thumbnailUrl: string;

  // 3D positioning
  platformPosition: [number, number, number];
  screenPosition: [number, number, number];
  screenRotation: [number, number, number];

  // Camera position when in cinema mode
  cameraOffset?: [number, number, number];

  // GitHub link if available
  github?: string;
}

export interface IslandData {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  accentColor: string;
  propModel?: string;  // path to GLB prop
  techStack: string[];
  github?: string;

  // Island positioning
  islandPosition: [number, number, number];
  islandRadius: number;

  // Gaze target (invisible sphere center the user looks at)
  gazeTargetPosition: [number, number, number];

  // Bridge anchor points (main island edge → project island edge)
  bridgeStart: [number, number, number];
  bridgeEnd: [number, number, number];

  // Video data (if this island has a video)
  video?: {
    url: string;
    thumbnailUrl: string;
    screenPosition: [number, number, number]; // relative to island
    screenRotation: [number, number, number];
  };

  // Sub-projects listed on the info panel
  subProjects?: { title: string; period: string }[];
}

// ============================================================================
// Gallery Configuration
// ============================================================================

export const GALLERY_CONFIG = {
  avatar: {
    height: 1.8,
    radius: 0.4,
    speed: 1.8,
    rotationSpeed: 2,
  },

  platform: {
    radius: 1.5,
    height: 0.1,
    triggerRadius: 2.5,
    exitRadius: 3.5,
  },

  screen: {
    width: 16 / 3,
    height: 9 / 3,
  },

  camera: {
    followDistance: 8,
    followHeight: 4,
    followDamping: 0.25,
    cinemaDamping: 0.2,
    cinemaDistance: 5,
  },

  // Main island bounds (circular, radius-based)
  mainIsland: {
    radius: 13,
    center: [0, 0, 0] as [number, number, number],
  },

  // Gaze mechanic
  gaze: {
    targetSphereRadius: 4,   // invisible sphere around each island
    gazeTime: 2.0,           // seconds to hold gaze
    bridgeBuildTime: 1.5,    // seconds for bridge animation
    bridgeWidth: 1.5,        // walkable width
    stepCount: 10,           // stone steps per bridge
  },

  // Expanded bounds to include all islands + bridges
  bounds: {
    minX: -35,
    maxX: 35,
    minZ: -35,
    maxZ: 25,
  },
} as const;

// ============================================================================
// Island Data — 6 Project Islands
// ============================================================================

const ISLAND_DISTANCE = 22; // distance from main island center to project islands
const ISLAND_Y = -1; // same height as main island

export const islandData: IslandData[] = [
  {
    id: 'vr-xr',
    title: 'VR / XR Experiences',
    subtitle: 'Quest 3 Development',
    description: 'Built immersive VR games and XR environments for Meta Quest 3 in Unity — from multiplayer cooking chaos to spatial audio museums.',
    accentColor: '#a855f7',
    propModel: '/models/quest3.glb',
    techStack: ['Unity3D', 'C#', 'Meta Quest 3', 'OpenXR', 'VelNet'],
    github: 'https://github.com/jke48222/VR-Final-Project',
    islandPosition: [
      Math.cos(-Math.PI / 6) * ISLAND_DISTANCE,
      ISLAND_Y,
      Math.sin(-Math.PI / 6) * ISLAND_DISTANCE,
    ],
    islandRadius: 5,
    gazeTargetPosition: [
      Math.cos(-Math.PI / 6) * ISLAND_DISTANCE,
      2,
      Math.sin(-Math.PI / 6) * ISLAND_DISTANCE,
    ],
    bridgeStart: [
      Math.cos(-Math.PI / 6) * 12,
      0,
      Math.sin(-Math.PI / 6) * 12,
    ],
    bridgeEnd: [
      Math.cos(-Math.PI / 6) * (ISLAND_DISTANCE - 5),
      0,
      Math.sin(-Math.PI / 6) * (ISLAND_DISTANCE - 5),
    ],
    video: {
      url: '/videos/kitchen-chaos.mp4',
      thumbnailUrl: '/thumbnails/kitchen-chaos.jpg',
      screenPosition: [0, 3, -2],
      screenRotation: [0, 0, 0],
    },
    subProjects: [
      { title: 'VR Portfolio 2 — XR Environments', period: 'Oct–Nov 2025' },
      { title: 'VR Portfolio 1 — VR Design Principles', period: 'Aug–Oct 2025' },
    ],
  },
  {
    id: 'memesat',
    title: 'MEMESat-1 Flight Software',
    subtitle: 'NASA CubeSat Mission',
    description: 'Developed flight software in C++ using NASA F Prime framework for a 2U CubeSat at UGA\'s Small Satellite Research Lab.',
    accentColor: '#06b6d4',
    propModel: '/models/satellite.glb',
    techStack: ['C++', 'NASA F Prime', 'Raspberry Pi CM4', 'Linux', 'Embedded'],
    islandPosition: [
      Math.cos(-Math.PI / 2) * ISLAND_DISTANCE,
      ISLAND_Y,
      Math.sin(-Math.PI / 2) * ISLAND_DISTANCE,
    ],
    islandRadius: 4.5,
    gazeTargetPosition: [
      Math.cos(-Math.PI / 2) * ISLAND_DISTANCE,
      2,
      Math.sin(-Math.PI / 2) * ISLAND_DISTANCE,
    ],
    bridgeStart: [
      Math.cos(-Math.PI / 2) * 12,
      0,
      Math.sin(-Math.PI / 2) * 12,
    ],
    bridgeEnd: [
      Math.cos(-Math.PI / 2) * (ISLAND_DISTANCE - 4.5),
      0,
      Math.sin(-Math.PI / 2) * (ISLAND_DISTANCE - 4.5),
    ],
    subProjects: [
      { title: 'Website Development — WordPress & JS', period: 'Sep 2022–May 2024' },
      { title: 'Travel Itinerary App — JavaFX + APIs', period: 'Dec 2023' },
    ],
  },
  {
    id: 'hardware',
    title: 'Hardware & Robotics',
    subtitle: 'Embedded Systems',
    description: 'Engineered a Python-controlled audio-tracking car, LED frequency filter, and smart plant watering system with sensor fusion.',
    accentColor: '#ff6b35',
    propModel: '/models/robot_car.glb',
    techStack: ['Python', 'Raspberry Pi', 'PID Control', 'Signal Processing', 'Sensors'],
    github: 'https://github.com/jke48222/Audio-Tracking-Car',
    islandPosition: [
      Math.cos(-5 * Math.PI / 6) * ISLAND_DISTANCE,
      ISLAND_Y,
      Math.sin(-5 * Math.PI / 6) * ISLAND_DISTANCE,
    ],
    islandRadius: 4.5,
    gazeTargetPosition: [
      Math.cos(-5 * Math.PI / 6) * ISLAND_DISTANCE,
      2,
      Math.sin(-5 * Math.PI / 6) * ISLAND_DISTANCE,
    ],
    bridgeStart: [
      Math.cos(-5 * Math.PI / 6) * 12,
      0,
      Math.sin(-5 * Math.PI / 6) * 12,
    ],
    bridgeEnd: [
      Math.cos(-5 * Math.PI / 6) * (ISLAND_DISTANCE - 4.5),
      0,
      Math.sin(-5 * Math.PI / 6) * (ISLAND_DISTANCE - 4.5),
    ],
    subProjects: [
      { title: 'LED Frequency Filter', period: 'Aug–Dec 2024' },
      { title: 'Smart Plant Watering Assistant', period: 'Aug–Nov 2025' },
    ],
  },
  {
    id: 'animaldot',
    title: 'AnimalDot',
    subtitle: 'Capstone Design',
    description: 'Designing a contactless smart sensing bed to monitor animal heart rate and respiration using geophone-based vibration sensing.',
    accentColor: '#4ecdc4',
    propModel: '/models/raspberry_pi_3.glb',
    techStack: ['Geophones', 'Load Cells', 'Signal Processing', 'Embedded Systems', 'Mobile'],
    islandPosition: [
      Math.cos(Math.PI / 6) * ISLAND_DISTANCE,
      ISLAND_Y,
      Math.sin(Math.PI / 6) * ISLAND_DISTANCE,
    ],
    islandRadius: 4.5,
    gazeTargetPosition: [
      Math.cos(Math.PI / 6) * ISLAND_DISTANCE,
      2,
      Math.sin(Math.PI / 6) * ISLAND_DISTANCE,
    ],
    bridgeStart: [
      Math.cos(Math.PI / 6) * 12,
      0,
      Math.sin(Math.PI / 6) * 12,
    ],
    bridgeEnd: [
      Math.cos(Math.PI / 6) * (ISLAND_DISTANCE - 4.5),
      0,
      Math.sin(Math.PI / 6) * (ISLAND_DISTANCE - 4.5),
    ],
    subProjects: [
      { title: 'BreakBuddy — Stress Management App', period: 'Aug–Dec 2025' },
    ],
  },
  {
    id: 'capital-one',
    title: 'Capital One Internship',
    subtitle: 'Business Analyst',
    description: 'Spearheaded a business case for CreditWise Notifications Preferences Center impacting 60M+ users. Analyzed email campaigns and presented to senior leadership.',
    accentColor: '#ef4444',
    propModel: '/models/tablet.glb',
    techStack: ['SQL', 'Python', 'Excel', 'Data Visualization', 'Product Strategy'],
    islandPosition: [
      Math.cos(Math.PI / 2) * ISLAND_DISTANCE,
      ISLAND_Y,
      Math.sin(Math.PI / 2) * ISLAND_DISTANCE,
    ],
    islandRadius: 4,
    gazeTargetPosition: [
      Math.cos(Math.PI / 2) * ISLAND_DISTANCE,
      2,
      Math.sin(Math.PI / 2) * ISLAND_DISTANCE,
    ],
    bridgeStart: [
      Math.cos(Math.PI / 2) * 12,
      0,
      Math.sin(Math.PI / 2) * 12,
    ],
    bridgeEnd: [
      Math.cos(Math.PI / 2) * (ISLAND_DISTANCE - 4),
      0,
      Math.sin(Math.PI / 2) * (ISLAND_DISTANCE - 4),
    ],
  },
  {
    id: 'software',
    title: 'Software Projects',
    subtitle: 'Web & Mobile',
    description: 'Built WordPress and JavaScript websites increasing engagement by 500+ monthly visitors, and a JavaFX travel app integrating Google Places APIs.',
    accentColor: '#8B9F7B',
    propModel: '/models/capital_one.glb',
    techStack: ['JavaScript', 'WordPress', 'JavaFX', 'REST APIs', 'UX Design'],
    islandPosition: [
      Math.cos(5 * Math.PI / 6) * ISLAND_DISTANCE,
      ISLAND_Y,
      Math.sin(5 * Math.PI / 6) * ISLAND_DISTANCE,
    ],
    islandRadius: 4,
    gazeTargetPosition: [
      Math.cos(5 * Math.PI / 6) * ISLAND_DISTANCE,
      2,
      Math.sin(5 * Math.PI / 6) * ISLAND_DISTANCE,
    ],
    bridgeStart: [
      Math.cos(5 * Math.PI / 6) * 12,
      0,
      Math.sin(5 * Math.PI / 6) * 12,
    ],
    bridgeEnd: [
      Math.cos(5 * Math.PI / 6) * (ISLAND_DISTANCE - 4),
      0,
      Math.sin(5 * Math.PI / 6) * (ISLAND_DISTANCE - 4),
    ],
  },
];

// ============================================================================
// Legacy video data (kept for backward compatibility with VideoStage)
// ============================================================================

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

// ============================================================================
// Helper Functions
// ============================================================================

export const getVideoById = (id: string): GalleryVideo | undefined => {
  return galleryVideos.find(v => v.id === id);
};

export const getIslandById = (id: string): IslandData | undefined => {
  return islandData.find(i => i.id === id);
};

export const calculateCinemaCamera = (
  screenPosition: THREE.Vector3,
  screenRotation: THREE.Euler
): { position: THREE.Vector3; lookAt: THREE.Vector3 } => {
  const { cinemaDistance } = GALLERY_CONFIG.camera;
  const forward = new THREE.Vector3(0, 0, 1);
  forward.applyEuler(screenRotation);
  const cameraPos = screenPosition.clone().add(forward.multiplyScalar(cinemaDistance));
  cameraPos.y = screenPosition.y;
  return { position: cameraPos, lookAt: screenPosition.clone() };
};

export const getPlatformPositions = (): Map<string, THREE.Vector3> => {
  const positions = new Map<string, THREE.Vector3>();
  galleryVideos.forEach((video) => {
    positions.set(video.id, new THREE.Vector3(...video.platformPosition));
  });
  return positions;
};

/**
 * Check if a position is within the main island radius
 */
export const isOnMainIsland = (position: THREE.Vector3): boolean => {
  const { radius, center } = GALLERY_CONFIG.mainIsland;
  const dx = position.x - center[0];
  const dz = position.z - center[2];
  return Math.sqrt(dx * dx + dz * dz) <= radius;
};

/**
 * Check if a position is on a specific project island
 */
export const isOnIsland = (position: THREE.Vector3, island: IslandData): boolean => {
  const dx = position.x - island.islandPosition[0];
  const dz = position.z - island.islandPosition[2];
  return Math.sqrt(dx * dx + dz * dz) <= island.islandRadius;
};

/**
 * Check if a position is on a bridge path
 */
export const isOnBridge = (
  position: THREE.Vector3,
  island: IslandData,
  bridgeWidth: number = GALLERY_CONFIG.gaze.bridgeWidth
): boolean => {
  const start = new THREE.Vector3(...island.bridgeStart);
  const end = new THREE.Vector3(...island.bridgeEnd);
  const line = end.clone().sub(start);
  const lineLen = line.length();
  const lineDir = line.normalize();

  const toPos = position.clone().sub(start);
  const proj = toPos.dot(lineDir);

  if (proj < -0.5 || proj > lineLen + 0.5) return false;

  const closest = start.clone().add(lineDir.multiplyScalar(Math.max(0, Math.min(lineLen, proj))));
  const dist = position.distanceTo(closest);
  return dist <= bridgeWidth;
};

export const isWithinBounds = (position: THREE.Vector3): boolean => {
  const { bounds } = GALLERY_CONFIG;
  return (
    position.x >= bounds.minX &&
    position.x <= bounds.maxX &&
    position.z >= bounds.minZ &&
    position.z <= bounds.maxZ
  );
};

export const clampToBounds = (position: THREE.Vector3): THREE.Vector3 => {
  const { bounds } = GALLERY_CONFIG;
  return new THREE.Vector3(
    Math.max(bounds.minX, Math.min(bounds.maxX, position.x)),
    position.y,
    Math.max(bounds.minZ, Math.min(bounds.maxZ, position.z))
  );
};
