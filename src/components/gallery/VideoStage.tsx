import { useRef, useEffect, useMemo, useState, Suspense } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { Html, useVideoTexture, Sparkles } from '@react-three/drei';
import { useWorkstationStore } from '../../store/store';
import { GALLERY_CONFIG, GalleryVideo } from '../../constants/galleryData';

interface VideoStageProps {
  video: GalleryVideo;
}

/**
 * @file VideoStage.tsx
 * @description Floating screen with video texture, platform trigger, and title. Structure:
 * - Floating screen with video texture
 * - Decorative frame/border
 * - Platform on the ground (trigger zone)
 * - Title label
 * - Ambient effects when active
 */
export function VideoStage({ video }: VideoStageProps) {
  const activeVideoId = useWorkstationStore((state) => state.activeVideoId);
  const isActive = activeVideoId === video.id;
  
  return (
    <group>
      {/* Platform (trigger zone) */}
      <TriggerPlatform
        position={video.platformPosition}
        isActive={isActive}
        videoId={video.id}
      />
      
      {/* Floating Screen */}
      <FloatingScreen
        video={video}
        position={video.screenPosition}
        rotation={video.screenRotation}
        isActive={isActive}
      />
      
      {/* Connection beam between platform and screen */}
      <ConnectionBeam
        platformPos={video.platformPosition}
        screenPos={video.screenPosition}
        isActive={isActive}
      />
    </group>
  );
}

/**
 * TriggerPlatform - The floor platform that activates video playback
 */
interface TriggerPlatformProps {
  position: [number, number, number];
  isActive: boolean;
  videoId: string;
}

function TriggerPlatform({ position, isActive, videoId }: TriggerPlatformProps) {
  const ringRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);
  const outerRef = useRef<THREE.Mesh>(null);

  const { radius, height } = GALLERY_CONFIG.platform;

  useFrame((state) => {
    if (ringRef.current) {
      ringRef.current.rotation.z = state.clock.elapsedTime * 0.4;
    }
    if (glowRef.current && isActive) {
      const pulse = Math.sin(state.clock.elapsedTime * 2.5) * 0.08 + 0.92;
      glowRef.current.scale.setScalar(pulse);
    }
    if (outerRef.current) {
      outerRef.current.rotation.z = -state.clock.elapsedTime * 0.2;
    }
  });

  return (
    <group position={position}>
      {/* Main platform disc */}
      <mesh receiveShadow position={[0, height / 2, 0]}>
        <cylinderGeometry args={[radius, radius * 1.1, height, 32]} />
        <meshStandardMaterial
          color={isActive ? '#4f46e5' : '#151535'}
          metalness={0.85}
          roughness={0.15}
          emissive={isActive ? '#4f46e5' : '#1e1b4b'}
          emissiveIntensity={isActive ? 0.4 : 0.05}
        />
      </mesh>

      {/* Inner animated ring */}
      <mesh
        ref={ringRef}
        position={[0, height + 0.01, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <ringGeometry args={[radius * 0.6, radius * 0.85, 32]} />
        <meshBasicMaterial
          color={isActive ? '#818cf8' : '#3730a3'}
          transparent
          opacity={isActive ? 0.7 : 0.25}
        />
      </mesh>

      {/* Outer pulsing ring */}
      <mesh
        ref={glowRef}
        position={[0, height + 0.02, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <ringGeometry args={[radius * 0.92, radius * 1.02, 32]} />
        <meshBasicMaterial
          color={isActive ? '#6366f1' : '#312e81'}
          transparent
          opacity={isActive ? 0.5 : 0.12}
        />
      </mesh>

      {/* Outer decorative ring — counter-rotates */}
      <mesh
        ref={outerRef}
        position={[0, height + 0.015, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <ringGeometry args={[radius * 1.1, radius * 1.15, 6]} />
        <meshBasicMaterial
          color="#4338ca"
          transparent
          opacity={isActive ? 0.35 : 0.08}
        />
      </mesh>

      {/* Active glow light */}
      {isActive && (
        <pointLight position={[0, 0.5, 0]} intensity={1.5} distance={6} color="#6366f1" />
      )}

      {/* Sparkles when active */}
      {isActive && (
        <Sparkles
          count={25}
          scale={[radius * 2.5, 1.5, radius * 2.5]}
          size={2}
          speed={0.4}
          color="#a5b4fc"
          opacity={0.5}
        />
      )}
    </group>
  );
}

/**
 * FloatingScreen - The video display screen
 */
interface FloatingScreenProps {
  video: GalleryVideo;
  position: [number, number, number];
  rotation: [number, number, number];
  isActive: boolean;
}

function FloatingScreen({ video, position, rotation, isActive }: FloatingScreenProps) {
  const groupRef = useRef<THREE.Group>(null);
  const { width, height } = GALLERY_CONFIG.screen;
  
  // Subtle floating animation
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
    }
  });
  
  return (
    <group ref={groupRef} position={position} rotation={rotation}>
      {/* Screen frame */}
      <ScreenFrame width={width} height={height} isActive={isActive} />
      
      {/* Video surface */}
      <Suspense fallback={<VideoPlaceholder width={width} height={height} />}>
        <VideoSurface
          videoUrl={video.videoUrl}
          thumbnailUrl={video.thumbnailUrl}
          width={width}
          height={height}
          isActive={isActive}
        />
      </Suspense>
      
      {/* Title label */}
      <Html
        position={[0, -height / 2 - 0.4, 0.1]}
        center
        distanceFactor={10}
        style={{
          pointerEvents: 'none',
          userSelect: 'none',
        }}
      >
        <div className="text-center">
          <h3 className={`
            font-mono text-lg font-bold tracking-wide
            transition-all duration-500
            ${isActive ? 'text-indigo-300' : 'text-gray-500'}
          `}>
            {video.title}
          </h3>
          <p className={`
            font-mono text-xs mt-1
            transition-all duration-500
            ${isActive ? 'text-indigo-400/80' : 'text-gray-600'}
          `}>
            {isActive ? '▶ NOW PLAYING' : 'Step on platform to play'}
          </p>
        </div>
      </Html>
      
      {/* Back glow when active — layered for depth */}
      {isActive && (
        <group>
          <mesh position={[0, 0, -0.15]}>
            <planeGeometry args={[width + 0.6, height + 0.6]} />
            <meshBasicMaterial color="#4338ca" transparent opacity={0.2} />
          </mesh>
          <mesh position={[0, 0, -0.25]}>
            <planeGeometry args={[width + 1.5, height + 1.5]} />
            <meshBasicMaterial color="#6366f1" transparent opacity={0.08} />
          </mesh>
        </group>
      )}
    </group>
  );
}

/**
 * ScreenFrame - Decorative frame around the video
 */
function ScreenFrame({ 
  width, 
  height, 
  isActive 
}: { 
  width: number; 
  height: number; 
  isActive: boolean;
}) {
  const frameThickness = 0.15;
  const frameDepth = 0.1;
  
  const frameMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: isActive ? '#3730a3' : '#151535',
    metalness: 0.92,
    roughness: 0.08,
    emissive: isActive ? '#4f46e5' : '#1e1b4b',
    emissiveIntensity: isActive ? 0.25 : 0.03,
  }), [isActive]);
  
  return (
    <group>
      {/* Top */}
      <mesh position={[0, height / 2 + frameThickness / 2, 0]}>
        <boxGeometry args={[width + frameThickness * 2, frameThickness, frameDepth]} />
        <primitive object={frameMaterial} attach="material" />
      </mesh>
      
      {/* Bottom */}
      <mesh position={[0, -height / 2 - frameThickness / 2, 0]}>
        <boxGeometry args={[width + frameThickness * 2, frameThickness, frameDepth]} />
        <primitive object={frameMaterial} attach="material" />
      </mesh>
      
      {/* Left */}
      <mesh position={[-width / 2 - frameThickness / 2, 0, 0]}>
        <boxGeometry args={[frameThickness, height, frameDepth]} />
        <primitive object={frameMaterial} attach="material" />
      </mesh>
      
      {/* Right */}
      <mesh position={[width / 2 + frameThickness / 2, 0, 0]}>
        <boxGeometry args={[frameThickness, height, frameDepth]} />
        <primitive object={frameMaterial} attach="material" />
      </mesh>
    </group>
  );
}

/**
 * VideoSurface - The actual video playback surface
 */
interface VideoSurfaceProps {
  videoUrl: string;
  thumbnailUrl: string;
  width: number;
  height: number;
  isActive: boolean;
}

function VideoSurface({ videoUrl, thumbnailUrl, width, height, isActive }: VideoSurfaceProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoElement, setVideoElement] = useState<HTMLVideoElement | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  
  // Create video element manually for better control
  useEffect(() => {
    const video = document.createElement('video');
    video.src = videoUrl;
    video.crossOrigin = 'anonymous';
    video.loop = true;
    video.muted = true; // Start muted for autoplay
    video.playsInline = true;
    video.preload = 'metadata';
    
    video.onloadeddata = () => {
      setIsLoaded(true);
    };
    
    setVideoElement(video);
    videoRef.current = video;
    
    return () => {
      video.pause();
      video.src = '';
      video.load();
    };
  }, [videoUrl]);
  
  // Control playback based on active state
  useEffect(() => {
    if (!videoRef.current) return;
    
    if (isActive) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch((e) => {
        console.warn('Video autoplay prevented:', e);
      });
    } else {
      videoRef.current.pause();
    }
  }, [isActive]);
  
  // Create texture from video element
  const texture = useMemo(() => {
    if (!videoElement) return null;
    
    const tex = new THREE.VideoTexture(videoElement);
    tex.minFilter = THREE.LinearFilter;
    tex.magFilter = THREE.LinearFilter;
    tex.format = THREE.RGBAFormat;
    tex.colorSpace = THREE.SRGBColorSpace;
    
    return tex;
  }, [videoElement]);
  
  // Update texture each frame when active
  useFrame(() => {
    if (texture && isActive && videoElement && !videoElement.paused) {
      texture.needsUpdate = true;
    }
  });
  
  if (!texture || !isLoaded) {
    return <VideoPlaceholder width={width} height={height} />;
  }
  
  return (
    <mesh position={[0, 0, 0.01]}>
      <planeGeometry args={[width, height]} />
      <meshBasicMaterial map={texture} toneMapped={false} />
    </mesh>
  );
}

/**
 * VideoPlaceholder - Loading state for video
 */
function VideoPlaceholder({ width, height }: { width: number; height: number }) {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      const material = meshRef.current.material as THREE.MeshBasicMaterial;
      material.opacity = 0.5 + Math.sin(state.clock.elapsedTime * 2) * 0.2;
    }
  });
  
  return (
    <mesh ref={meshRef} position={[0, 0, 0.01]}>
      <planeGeometry args={[width, height]} />
      <meshBasicMaterial color="#1e1b4b" transparent opacity={0.5} />
    </mesh>
  );
}

/**
 * ConnectionBeam - Visual connection between platform and screen
 */
interface ConnectionBeamProps {
  platformPos: [number, number, number];
  screenPos: [number, number, number];
  isActive: boolean;
}

function ConnectionBeam({ platformPos, screenPos, isActive }: ConnectionBeamProps) {
  const beamRef = useRef<THREE.Mesh>(null);
  
  // Calculate beam geometry
  const start = new THREE.Vector3(...platformPos);
  const end = new THREE.Vector3(...screenPos);
  const direction = end.clone().sub(start);
  const length = direction.length();
  const midpoint = start.clone().add(end).multiplyScalar(0.5);
  
  // Calculate rotation to point at screen
  const quaternion = new THREE.Quaternion();
  quaternion.setFromUnitVectors(
    new THREE.Vector3(0, 1, 0),
    direction.clone().normalize()
  );
  const euler = new THREE.Euler().setFromQuaternion(quaternion);
  
  useFrame((state) => {
    if (beamRef.current && isActive) {
      const mat = beamRef.current.material as THREE.MeshBasicMaterial;
      mat.opacity = 0.15 + Math.sin(state.clock.elapsedTime * 3) * 0.1;
    }
  });

  if (!isActive) return null;

  return (
    <group>
      {/* Main beam */}
      <mesh
        ref={beamRef}
        position={[midpoint.x, midpoint.y, midpoint.z]}
        rotation={[euler.x, euler.y, euler.z]}
      >
        <cylinderGeometry args={[0.015, 0.015, length, 6]} />
        <meshBasicMaterial color="#6366f1" transparent opacity={0.2} />
      </mesh>
      {/* Outer glow cylinder */}
      <mesh
        position={[midpoint.x, midpoint.y, midpoint.z]}
        rotation={[euler.x, euler.y, euler.z]}
      >
        <cylinderGeometry args={[0.06, 0.06, length, 6]} />
        <meshBasicMaterial color="#4338ca" transparent opacity={0.04} />
      </mesh>
    </group>
  );
}

/**
 * VideoStageGroup - Renders all video stages
 */
export function VideoStageGroup({ videos }: { videos: GalleryVideo[] }) {
  return (
    <group>
      {videos.map((video) => (
        <VideoStage key={video.id} video={video} />
      ))}
    </group>
  );
}

export default VideoStage;
