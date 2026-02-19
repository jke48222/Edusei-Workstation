/**
 * @file Experience.tsx
 * @description Main 3D workstation scene component built with React Three Fiber. Renders
 * themed platforms, clickable 3D objects (monitor, robot car, sleeping dog, VR headset,
 * satellite, Capital One logo), camera rig, and optional gallery transition effects.
 * Preloads GLTF models and exports OBJECT_POSITIONS constant for camera alignment.
 */

import { useRef, useState, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { 
  Environment, 
  useGLTF,
  Sparkles,
  Center,
  PresentationControls,
  Stars,
  Html,
} from '@react-three/drei';
import { Group } from 'three';
import { useWorkstationStore } from '../store/store';
import { useActiveTheme, useThemeStore } from '../store/themeStore';
import { getProjectById } from '../data';
import { CameraRig } from './CameraRig';
import type { ViewState } from '../store/store';

/** Preload all GLTF models to improve initial load performance and reduce loading delays. */
useGLTF.preload('/models/crt_monitor.glb');
useGLTF.preload('/models/robot_car.glb');
useGLTF.preload('/models/sleeping_dog.glb');
useGLTF.preload('/models/quest3.glb');
useGLTF.preload('/models/satellite.glb');
useGLTF.preload('/models/capital_one.glb');
useGLTF.preload('/models/desk_set.glb');

/** World-space coordinate positions for each workstation object, aligned with CameraRig target positions. */
export const OBJECT_POSITIONS = {
  monitor: { x: 0, y: 1, z: 0 },
  'audio-tracking-car': { x: 25, y: 1.5, z: 0 },
  animaldot: { x: 50, y: 1.5, z: 0 },
  'kitchen-chaos-vr': { x: 75, y: 1.5, z: 0 },
  memesat: { x: 100, y: 1.5, z: 0 },
  'capital-one': { x: 125, y: 1.5, z: 0 },
};

/** Themed cylinder platform under each clickable object. */
function FloatingPlatform({ position }: { position: [number, number, number] }) {
  const theme = useActiveTheme();
  return (
    <mesh position={[position[0], position[1] - 0.8, position[2]]} receiveShadow>
      <cylinderGeometry args={[1.5, 1.8, 0.1, 32]} />
      <meshStandardMaterial 
        color={theme.podiumColor} 
        metalness={theme.podiumMetalness} 
        roughness={theme.podiumRoughness}
        emissive={theme.podiumEmissive}
        emissiveIntensity={theme.podiumEmissiveIntensity}
      />
    </mesh>
  );
}

/** Themed ring geometry component displayed around each platform base. */
function PlatformRing({ position }: { position: [number, number, number] }) {
  const theme = useActiveTheme();
  return (
    <mesh position={[position[0], position[1] - 0.75, position[2]]} rotation={[-Math.PI / 2, 0, 0]}>
      <ringGeometry args={[1.6, 1.7, 64]} />
      <meshBasicMaterial color={theme.ringColor} transparent opacity={0.6} />
    </mesh>
  );
}

/** Props interface for clickable 3D object components. */
interface ClickableObjectProps {
  viewId: ViewState;
  children: React.ReactNode;
  position: [number, number, number];
  isActive: boolean;
}

function ClickableObject({ viewId, children, position, isActive }: ClickableObjectProps) {
  const { setView, currentView, isAnimating } = useWorkstationStore();
  const theme = useActiveTheme();
  const [hovered, setHovered] = useState(false);
  const groupRef = useRef<Group>(null);
  const project = getProjectById(viewId);
  const tooltipLabel = project?.title ?? viewId;

  const canClick = !isAnimating && currentView === 'monitor';

  const handleClick = (e: import('@react-three/fiber').ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    if (canClick) {
      setView(viewId);
    }
  };

  return (
    <group ref={groupRef} position={position}>
      <FloatingPlatform position={[0, 0, 0]} />
      <PlatformRing position={[0, 0, 0]} />

      {hovered && canClick && (
        <Html position={[0, 1.4, 0]} center distanceFactor={8} zIndexRange={[0, 0]}>
          <div
            className="pointer-events-none whitespace-nowrap rounded px-2 py-1 font-mono text-xs shadow-lg"
            style={{
              color: theme.text,
              backgroundColor: theme.terminalBg,
              border: `1px solid ${theme.terminalBorder}`,
            }}
          >
            {tooltipLabel}
          </div>
        </Html>
      )}

      <spotLight
        position={[0, 4, 0]}
        angle={0.4}
        penumbra={0.8}
        intensity={(isActive ? 2 : 0.5) * theme.spotlightIntensity}
        color={theme.spotlightColor}
        castShadow
      />
      
      <pointLight
        position={[0, 0, 1]}
        intensity={isActive ? 1.5 : 0.3}
        color={theme.glowColor}
        distance={4}
      />
      
      <PresentationControls
        enabled={isActive}
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
            if (canClick) {
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
          scale={hovered && canClick ? 1.05 : 1}
        >
          {children}
        </group>
      </PresentationControls>
      
      {isActive && (
        <Sparkles 
          count={30}
          scale={[3, 3, 3]}
          size={2}
          speed={0.4}
          color={theme.accent}
          opacity={0.5}
        />
      )}
    </group>
  );
}

/**
 * CRT Monitor component representing the main terminal display object in the workstation scene.
 */
function CRTMonitor() {
  const { scene } = useGLTF('/models/crt_monitor.glb');
  const theme = useActiveTheme();
  const clonedScene = scene.clone();
  const pos = OBJECT_POSITIONS.monitor;
  
  return (
    <group position={[pos.x, pos.y, pos.z]}>
      <primitive 
        object={clonedScene} 
        scale={0.8}
        rotation={[0, 0, 0]}
      />
      
      <mesh position={[0, 0.15, 0.45]}>
        <planeGeometry args={[0.9, 0.7]} />
        <meshBasicMaterial 
          color={theme.accent} 
          transparent 
          opacity={0.1}
        />
      </mesh>
      
      <Sparkles 
        count={50}
        scale={[3, 3, 3]}
        size={1.5}
        speed={0.3}
        color={theme.particles}
        opacity={0.4}
      />
      
      <pointLight
        position={[0, 0.2, 1]}
        intensity={1.5}
        color={theme.glowColor}
        distance={5}
      />
    </group>
  );
}

function RobotCar() {
  const { scene } = useGLTF('/models/robot_car.glb');
  const { currentView } = useWorkstationStore();
  const clonedScene = scene.clone();
  const pos = OBJECT_POSITIONS['audio-tracking-car'];
  
  return (
    <ClickableObject viewId="audio-tracking-car" position={[pos.x, pos.y, pos.z]} isActive={currentView === 'audio-tracking-car'}>
      <Center>
        <primitive object={clonedScene} scale={0.012} rotation={[Math.PI / 2, 0, 0]} />
      </Center>
    </ClickableObject>
  );
}

function SleepingDog() {
  const { scene } = useGLTF('/models/sleeping_dog.glb');
  const { currentView } = useWorkstationStore();
  const clonedScene = scene.clone();
  const pos = OBJECT_POSITIONS.animaldot;
  
  return (
    <ClickableObject viewId="animaldot" position={[pos.x, pos.y, pos.z]} isActive={currentView === 'animaldot'}>
      <Center>
        <primitive object={clonedScene} scale={0.6} rotation={[0, 0, 0]} />
      </Center>
    </ClickableObject>
  );
}

function VRHeadset() {
  const { scene } = useGLTF('/models/quest3.glb');
  const { currentView } = useWorkstationStore();
  const clonedScene = scene.clone();
  const pos = OBJECT_POSITIONS['kitchen-chaos-vr'];
  
  return (
    <ClickableObject viewId="kitchen-chaos-vr" position={[pos.x, pos.y, pos.z]} isActive={currentView === 'kitchen-chaos-vr'}>
      <Center>
        <primitive object={clonedScene} scale={6} rotation={[0, 0, 0]} />
      </Center>
    </ClickableObject>
  );
}

function CubeSat() {
  const { scene } = useGLTF('/models/satellite.glb');
  const { currentView } = useWorkstationStore();
  const clonedScene = scene.clone();
  const pos = OBJECT_POSITIONS.memesat;
  
  return (
    <ClickableObject viewId="memesat" position={[pos.x, pos.y, pos.z]} isActive={currentView === 'memesat'}>
      <Center>
        <primitive object={clonedScene} scale={0.5} rotation={[Math.PI / 2, 0, 0]} />
      </Center>
    </ClickableObject>
  );
}

function CapitalOneLogo() {
  const { scene } = useGLTF('/models/capital_one.glb');
  const { currentView } = useWorkstationStore();
  const clonedScene = scene.clone();
  const pos = OBJECT_POSITIONS['capital-one'];
  
  return (
    <ClickableObject viewId="capital-one" position={[pos.x, pos.y, pos.z]} isActive={currentView === 'capital-one'}>
      <Center>
        <primitive object={clonedScene} scale={8.0} rotation={[0, 0, 0]} />
      </Center>
    </ClickableObject>
  );
}

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

function InfiniteFloor() {
  const theme = useActiveTheme();
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[60, -1, 0]} receiveShadow>
      <planeGeometry args={[300, 100]} />
      <meshStandardMaterial color={theme.floorColor} roughness={0.95} />
    </mesh>
  );
}

function ModelFallback() {
  return (
    <mesh>
      <boxGeometry args={[0.5, 0.5, 0.5]} />
      <meshStandardMaterial color="#333333" wireframe />
    </mesh>
  );
}

/**
 * Workstation scene content component. Manages theming, lighting, environment,
 * and all 3D objects within the workstation scene.
 */
function WorkstationContent() {
  const theme = useActiveTheme();
  const activeTheme = useThemeStore((s) => s.activeTheme);
  const bgColor = activeTheme === 'uga' ? theme.accent : theme.bg; // Bulldog Red: accent on both viewports
  const isUga = activeTheme === 'uga';
  // Bulldog Red: dim environment so the white pedestal spotlight dominates; more ambient fill so objects aren't silhouetted
  const envIntensity = isUga ? 0.15 : 1;
  const ambientIntensity = isUga ? 0.45 : 0.08;
  const directionalIntensity = isUga ? 0.6 : 0.3;

  return (
    <>
      <color attach="background" args={[bgColor]} />
      <fog attach="fog" args={[theme.fogColor, 10, 50]} />
      
      <Environment preset="night" environmentIntensity={envIntensity} />
      
      <Stars 
        radius={100} 
        depth={50} 
        count={2000} 
        factor={4} 
        saturation={0} 
        fade 
        speed={0.5}
      />
      
      <ambientLight intensity={ambientIntensity} />
      
      <directionalLight
        position={[10, 20, 10]}
        intensity={directionalIntensity}
        castShadow
        shadow-mapSize={[2048, 2048]}
      />
      
      <InfiniteFloor />
      
      <Suspense fallback={<ModelFallback />}>
        <HomepageDesk />
      </Suspense>
      
      <Suspense fallback={<ModelFallback />}>
        <CRTMonitor />
      </Suspense>
      
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

function SceneContent() {
  return (
    <>
      <CameraRig />
      <WorkstationContent />
    </>
  );
}

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
