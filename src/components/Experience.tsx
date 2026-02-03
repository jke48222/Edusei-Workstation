import { useRef, useState, Suspense, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { 
  Environment, 
  useGLTF,
  Sparkles,
  Center,
  PresentationControls,
  Stars,
} from '@react-three/drei';
import { Group, Mesh } from 'three';
import * as THREE from 'three';
import { 
  useWorkstationStore, 
  useSceneMode, 
  useHeadsetOpacity,
  useTransitionProgress,
} from '../store/store';
import { CameraRig } from './CameraRig';
import { GalleryExperience, TransitionPortal } from './gallery';
import type { ViewState } from '../store/store';

// Preload all models for faster loading
useGLTF.preload('/models/crt_monitor.glb');
useGLTF.preload('/models/robot_car.glb');
useGLTF.preload('/models/sleeping_dog.glb');
useGLTF.preload('/models/quest3.glb');
useGLTF.preload('/models/satellite.glb');
useGLTF.preload('/models/capital_one.glb');
useGLTF.preload('/models/desk_set.glb');

/**
 * LAYOUT CONFIGURATION
 * Objects are arranged in a line along the X-axis, far apart
 * Each object is 25 units apart so they're not visible from other views
 */
export const OBJECT_POSITIONS = {
  monitor: { x: 0, y: 1, z: 0 },
  car: { x: 25, y: 1.5, z: 0 },
  dog: { x: 50, y: 1.5, z: 0 },
  vr: { x: 75, y: 1.5, z: 0 },
  satellite: { x: 100, y: 1.5, z: 0 },
  tablet: { x: 125, y: 1.5, z: 0 },
};

/**
 * Floating platform under each object for visual grounding
 */
function FloatingPlatform({ position }: { position: [number, number, number] }) {
  return (
    <mesh position={[position[0], position[1] - 0.8, position[2]]} receiveShadow>
      <cylinderGeometry args={[1.5, 1.8, 0.1, 32]} />
      <meshStandardMaterial 
        color="#0a0a0a" 
        metalness={0.8} 
        roughness={0.2}
        emissive="#00ff41"
        emissiveIntensity={0.05}
      />
    </mesh>
  );
}

/**
 * Glowing ring around platform
 */
function PlatformRing({ position }: { position: [number, number, number] }) {
  return (
    <mesh position={[position[0], position[1] - 0.75, position[2]]} rotation={[-Math.PI / 2, 0, 0]}>
      <ringGeometry args={[1.6, 1.7, 64]} />
      <meshBasicMaterial color="#00ff41" transparent opacity={0.6} />
    </mesh>
  );
}

/**
 * Clickable 3D object wrapper with hover effects
 * Now includes PresentationControls for drag-to-spin
 */
interface ClickableObjectProps {
  viewId: ViewState;
  children: React.ReactNode;
  position: [number, number, number];
  isActive: boolean;
  onEnterGallery?: () => void;
}

function ClickableObject({ viewId, children, position, isActive, onEnterGallery }: ClickableObjectProps) {
  const { setView, currentView, isAnimating } = useWorkstationStore();
  const [hovered, setHovered] = useState(false);
  const groupRef = useRef<Group>(null);
  
  const canClick = !isAnimating && currentView === 'monitor';
  const isVRAndActive = viewId === 'vr' && isActive;
  
  const handleClick = (e: import('@react-three/fiber').ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    
    // If VR headset is active (we're viewing it), clicking enters the gallery
    if (isVRAndActive && onEnterGallery) {
      onEnterGallery();
      return;
    }
    
    if (canClick) {
      setView(viewId);
    }
  };
  
  return (
    <group ref={groupRef} position={position}>
      {/* Floating platform */}
      <FloatingPlatform position={[0, 0, 0]} />
      <PlatformRing position={[0, 0, 0]} />
      
      {/* Spotlight from above */}
      <spotLight
        position={[0, 4, 0]}
        angle={0.4}
        penumbra={0.8}
        intensity={isActive ? 2 : 0.5}
        color="#ffffff"
        castShadow
      />
      
      {/* Object glow light */}
      <pointLight
        position={[0, 0, 1]}
        intensity={isActive ? 1.5 : 0.3}
        color="#00ff41"
        distance={4}
      />
      
      {/* Drag-to-spin wrapper - only active when viewing this object */}
      <PresentationControls
        enabled={isActive && !isVRAndActive}
        global={false}
        cursor={isActive}
        snap={false}
        speed={2}
        zoom={1}
        rotation={[0, 0, 0]}
        polar={[-Math.PI / 4, Math.PI / 4]}
        azimuth={[-Infinity, Infinity]}
        config={{ mass: 1, tension: 170, friction: 26 }}
      >
        <group
          onClick={handleClick}
          onPointerOver={(e) => {
            e.stopPropagation();
            if (canClick || isVRAndActive) {
              setHovered(true);
              document.body.style.cursor = 'pointer';
            } else if (isActive) {
              document.body.style.cursor = 'grab';
            }
          }}
          onPointerOut={() => {
            setHovered(false);
            document.body.style.cursor = 'auto';
          }}
          scale={(hovered && canClick) || (hovered && isVRAndActive) ? 1.05 : 1}
        >
          {children}
        </group>
      </PresentationControls>
      
      {/* "Enter Gallery" hint when VR is active */}
      {isVRAndActive && (
        <group position={[0, -0.5, 0]}>
          <Sparkles 
            count={40}
            scale={[2, 1, 2]}
            size={3}
            speed={0.8}
            color="#a855f7"
            opacity={0.8}
          />
        </group>
      )}
      
      {/* Ambient particles when active */}
      {isActive && !isVRAndActive && (
        <Sparkles 
          count={30}
          scale={[3, 3, 3]}
          size={2}
          speed={0.4}
          color="#00ff41"
          opacity={0.5}
        />
      )}
    </group>
  );
}

/**
 * CRT Monitor - The main terminal display (Homepage)
 */
function CRTMonitor() {
  const { scene } = useGLTF('/models/crt_monitor.glb');
  const clonedScene = scene.clone();
  const pos = OBJECT_POSITIONS.monitor;
  
  return (
    <group position={[pos.x, pos.y, pos.z]}>
      <primitive 
        object={clonedScene} 
        scale={0.8}
        rotation={[0, 0, 0]}
      />
      
      {/* Screen glow effect */}
      <mesh position={[0, 0.15, 0.45]}>
        <planeGeometry args={[0.9, 0.7]} />
        <meshBasicMaterial 
          color="#00ff41" 
          transparent 
          opacity={0.1}
        />
      </mesh>
      
      {/* Ambient particles around monitor */}
      <Sparkles 
        count={50}
        scale={[3, 3, 3]}
        size={1.5}
        speed={0.3}
        color="#00ff41"
        opacity={0.4}
      />
      
      {/* Monitor glow */}
      <pointLight
        position={[0, 0.2, 1]}
        intensity={1.5}
        color="#00ff41"
        distance={5}
      />
    </group>
  );
}

/**
 * Robot Car - Audio Tracking Car project
 */
function RobotCar() {
  const { scene } = useGLTF('/models/robot_car.glb');
  const { currentView } = useWorkstationStore();
  const clonedScene = scene.clone();
  const pos = OBJECT_POSITIONS.car;
  const isActive = currentView === 'car';
  
  return (
    <ClickableObject 
      viewId="car" 
      position={[pos.x, pos.y, pos.z]} 
      isActive={isActive}
    >
      <Center>
        <primitive 
          object={clonedScene} 
          scale={0.012}
          rotation={[Math.PI / 2, 0, 0]}
        />
      </Center>
    </ClickableObject>
  );
}

/**
 * Sleeping Dog - AnimalDot project
 */
function SleepingDog() {
  const { scene } = useGLTF('/models/sleeping_dog.glb');
  const { currentView } = useWorkstationStore();
  const clonedScene = scene.clone();
  const pos = OBJECT_POSITIONS.dog;
  const isActive = currentView === 'dog';
  
  return (
    <ClickableObject 
      viewId="dog" 
      position={[pos.x, pos.y, pos.z]} 
      isActive={isActive}
    >
      <Center>
        <primitive 
          object={clonedScene} 
          scale={0.6}
          rotation={[0, 0, 0]}
        />
      </Center>
    </ClickableObject>
  );
}

/**
 * VR Headset - Kitchen Chaos VR project
 * NOW WITH DISSOLVE EFFECT AND GALLERY TRIGGER
 */
function VRHeadset() {
  const { scene } = useGLTF('/models/quest3.glb');
  const { currentView } = useWorkstationStore();
  const enterGallery = useWorkstationStore((state) => state.enterGallery);
  const sceneMode = useSceneMode();
  const headsetOpacity = useHeadsetOpacity();
  
  const groupRef = useRef<Group>(null);
  const pos = OBJECT_POSITIONS.vr;
  const isActive = currentView === 'vr';
  
  // Clone and setup materials for dissolve
  const clonedScene = scene.clone();
  
  // Apply dissolve effect to all meshes
  useEffect(() => {
    if (!groupRef.current) return;
    
    groupRef.current.traverse((child) => {
      if (child instanceof Mesh && child.material) {
        const materials = Array.isArray(child.material) ? child.material : [child.material];
        materials.forEach((mat) => {
          if (mat instanceof THREE.MeshStandardMaterial) {
            mat.transparent = true;
            mat.opacity = headsetOpacity;
            mat.needsUpdate = true;
            
            // Add emissive glow as it dissolves
            if (headsetOpacity < 1) {
              mat.emissive = new THREE.Color('#a855f7');
              mat.emissiveIntensity = (1 - headsetOpacity) * 0.5;
            } else {
              mat.emissiveIntensity = 0;
            }
          }
        });
      }
    });
  }, [headsetOpacity]);
  
  // Don't render in gallery mode
  if (sceneMode === 'gallery') return null;
  
  return (
    <ClickableObject 
      viewId="vr" 
      position={[pos.x, pos.y, pos.z]} 
      isActive={isActive}
      onEnterGallery={enterGallery}
    >
      <Center>
        <group ref={groupRef}>
          <primitive 
            object={clonedScene} 
            scale={6}
            rotation={[0, 0, 0]}
          />
        </group>
      </Center>
      
      {/* Portal effect when active - hint to click */}
      {isActive && sceneMode === 'workstation' && (
        <>
          {/* Glowing lens effect */}
          <mesh position={[0, 0, 0.3]}>
            <planeGeometry args={[0.8, 0.4]} />
            <meshBasicMaterial
              color="#a855f7"
              transparent
              opacity={0.2 + Math.sin(Date.now() * 0.003) * 0.1}
            />
          </mesh>
          
          {/* "Click to enter" particles */}
          <Sparkles
            count={50}
            scale={[2, 1, 2]}
            position={[0, 0, 0.5]}
            size={4}
            speed={1}
            color="#a855f7"
            opacity={0.8}
          />
        </>
      )}
    </ClickableObject>
  );
}

/**
 * CubeSat - MEMESat-1 project
 */
function CubeSat() {
  const { scene } = useGLTF('/models/satellite.glb');
  const { currentView } = useWorkstationStore();
  const clonedScene = scene.clone();
  const pos = OBJECT_POSITIONS.satellite;
  const isActive = currentView === 'satellite';
  
  return (
    <ClickableObject 
      viewId="satellite" 
      position={[pos.x, pos.y, pos.z]} 
      isActive={isActive}
    >
      <Center>
        <primitive 
          object={clonedScene} 
          scale={0.5}
          rotation={[Math.PI / 2, 0, 0]}
        />
      </Center>
    </ClickableObject>
  );
}

/**
 * Capital One Logo - Capital One Internship
 */
function CapitalOneLogo() {
  const { scene } = useGLTF('/models/capital_one.glb');
  const { currentView } = useWorkstationStore();
  const clonedScene = scene.clone();
  const pos = OBJECT_POSITIONS.tablet;
  const isActive = currentView === 'tablet';
  
  return (
    <ClickableObject 
      viewId="tablet" 
      position={[pos.x, pos.y, pos.z]} 
      isActive={isActive}
    >
      <Center>
        <primitive 
          object={clonedScene} 
          scale={8.0}
          rotation={[0, 0, 0]}
        />
      </Center>
    </ClickableObject>
  );
}

/**
 * Desk for homepage only
 */
function HomepageDesk() {
  const { scene } = useGLTF('/models/desk_set.glb');
  const clonedScene = scene.clone();
  const pos = OBJECT_POSITIONS.monitor;
  
  return (
    <primitive 
      object={clonedScene} 
      scale={1.8}
      position={[pos.x, 0, pos.z - 0.5]}
      rotation={[0, 0, 0]}
    />
  );
}

/**
 * Infinite floor
 */
function InfiniteFloor() {
  const sceneMode = useSceneMode();
  
  // Don't render in gallery mode
  if (sceneMode === 'gallery') return null;
  
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[60, -1, 0]} receiveShadow>
      <planeGeometry args={[300, 100]} />
      <meshStandardMaterial 
        color="#050505" 
        roughness={0.95}
      />
    </mesh>
  );
}

/**
 * Loading fallback for individual models
 */
function ModelFallback() {
  return (
    <mesh>
      <boxGeometry args={[0.5, 0.5, 0.5]} />
      <meshStandardMaterial color="#333333" wireframe />
    </mesh>
  );
}

/**
 * Workstation scene content (original scene)
 */
function WorkstationContent() {
  const sceneMode = useSceneMode();
  
  // Hide workstation content when fully in gallery
  if (sceneMode === 'gallery') return null;
  
  return (
    <>
      {/* Environment and lighting */}
      <color attach="background" args={['#030303']} />
      <fog attach="fog" args={['#030303', 10, 50]} />
      
      <Environment preset="night" />
      
      {/* Stars in background */}
      <Stars 
        radius={100} 
        depth={50} 
        count={2000} 
        factor={4} 
        saturation={0} 
        fade 
        speed={0.5}
      />
      
      {/* Global ambient light */}
      <ambientLight intensity={0.08} />
      
      {/* Main directional light */}
      <directionalLight
        position={[10, 20, 10]}
        intensity={0.3}
        castShadow
        shadow-mapSize={[2048, 2048]}
      />
      
      {/* Floor */}
      <InfiniteFloor />
      
      {/* Homepage: Desk with Monitor */}
      <Suspense fallback={<ModelFallback />}>
        <HomepageDesk />
      </Suspense>
      
      <Suspense fallback={<ModelFallback />}>
        <CRTMonitor />
      </Suspense>
      
      {/* Project objects - arranged in a line, far apart */}
      <Suspense fallback={<ModelFallback />}>
        <RobotCar />
      </Suspense>
      
      <Suspense fallback={<ModelFallback />}>
        <SleepingDog />
      </Suspense>
      
      <Suspense fallback={<ModelFallback />}>
        <VRHeadset />
      </Suspense>
      
      <Suspense fallback={<ModelFallback />}>
        <CubeSat />
      </Suspense>
      
      <Suspense fallback={<ModelFallback />}>
        <CapitalOneLogo />
      </Suspense>
    </>
  );
}

/**
 * Scene content wrapper that handles both workstation and gallery
 */
function SceneContent() {
  const sceneMode = useSceneMode();
  
  return (
    <>
      {/* Camera controller - handles transitions */}
      <CameraRig />
      
      {/* Transition portal - handles the zoom-through effect */}
      {sceneMode === 'vr-transition' && <TransitionPortal />}
      
      {/* Workstation content */}
      <WorkstationContent />
      
      {/* Gallery content */}
      <Suspense fallback={null}>
        <GalleryExperience />
      </Suspense>
    </>
  );
}

/**
 * Main Experience Component
 * Sets up the R3F Canvas with all scene elements
 */
export function Experience() {
  return (
    <Canvas
      className="canvas-container"
      shadows
      camera={{
        fov: 45,
        near: 0.1,
        far: 200,
        position: [0, 1.8, 4],
      }}
      gl={{ 
        antialias: true,
        alpha: false,
        powerPreference: 'high-performance',
      }}
      dpr={[1, 2]}
    >
      <SceneContent />
    </Canvas>
  );
}
