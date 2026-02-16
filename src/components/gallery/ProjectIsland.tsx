import { useRef, Suspense, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Html, Float, useGLTF } from '@react-three/drei';
import { FloatingIsland } from './FloatingIsland';
import type { IslandData } from '../../constants/galleryData';
import { useWorkstationStore } from '../../store/store';

/**
 * @file ProjectIsland.tsx
 * @description Single project exhibit: FloatingIsland base, shrine platform, 3D prop, info panel, accent light, gaze target.
 */

/** Model scale overrides (GLB assets ship at varying scales). */
const MODEL_SCALES: Record<string, number> = {
  '/models/quest3.glb': 0.3,
  '/models/satellite.glb': 0.008,
  '/models/robot_car.glb': 0.005,
  '/models/raspberry_pi_3.glb': 0.01,
  '/models/tablet.glb': 0.008,
  '/models/capital_one.glb': 0.015,
};

interface ProjectIslandProps {
  island: IslandData;
}

export function ProjectIsland({ island }: ProjectIslandProps) {
  const activeIslandId = useWorkstationStore((state) => state.activeIslandId);
  const isActive = activeIslandId === island.id;

  return (
    <group>
      {/* Floating island base */}
      <FloatingIsland
        position={island.islandPosition}
        radius={island.islandRadius}
        height={3}
        grassColor="#7A9B6A"
        rockColor="#6B7B8D"
        bobSpeed={0.25}
        bobAmount={0.12}
      >
        {/* Shrine platform */}
        <ShrinePlatform accentColor={island.accentColor} isActive={isActive} />

        {/* 3D Prop model — properly scaled */}
        <Suspense fallback={<PropFallback color={island.accentColor} />}>
          {island.propModel ? (
            <PropModel modelPath={island.propModel} accentColor={island.accentColor} />
          ) : (
            <PropFallback color={island.accentColor} />
          )}
        </Suspense>

        {/* Info panel — compact */}
        <InfoPanel island={island} visible={isActive} />

        {/* Accent light */}
        <pointLight
          position={[0, 3, 0]}
          intensity={isActive ? 0.8 : 0.3}
          color={island.accentColor}
          distance={10}
        />
      </FloatingIsland>

      {/* Invisible gaze target sphere */}
      <mesh
        position={island.gazeTargetPosition}
        visible={false}
        userData={{ islandId: island.id, isGazeTarget: true }}
      >
        <sphereGeometry args={[4, 8, 8]} />
        <meshBasicMaterial visible={false} />
      </mesh>
    </group>
  );
}

/**
 * ShrinePlatform — stone pedestal at the center of each island
 */
function ShrinePlatform({ accentColor, isActive }: { accentColor: string; isActive: boolean }) {
  const ringRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!ringRef.current) return;
    ringRef.current.rotation.y = state.clock.elapsedTime * 0.2;
    const mat = ringRef.current.material as THREE.MeshStandardMaterial;
    mat.emissiveIntensity = isActive ? 0.4 : 0.1;
  });

  return (
    <group position={[0, 0.01, 0]}>
      {/* Stone base */}
      <mesh castShadow receiveShadow>
        <cylinderGeometry args={[1.0, 1.2, 0.15, 8]} />
        <meshStandardMaterial color="#8A9A8A" roughness={0.95} metalness={0.05} flatShading />
      </mesh>

      {/* Glowing accent ring */}
      <mesh ref={ringRef} position={[0, 0.12, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.7, 0.9, 32]} />
        <meshStandardMaterial
          color={accentColor}
          emissive={accentColor}
          emissiveIntensity={0.1}
          transparent
          opacity={0.5}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
}

/**
 * PropModel — loads GLB model with proper scale normalization
 */
function PropModel({ modelPath, accentColor }: { modelPath: string; accentColor: string }) {
  const groupRef = useRef<THREE.Group>(null);
  const { scene } = useGLTF(modelPath);

  // Clone and normalize the model scale
  const clonedScene = useMemo(() => {
    const clone = scene.clone(true);

    // Compute bounding box to auto-scale
    const box = new THREE.Box3().setFromObject(clone);
    const size = new THREE.Vector3();
    box.getSize(size);
    const maxDim = Math.max(size.x, size.y, size.z);

    // Use known scale override or auto-normalize to ~1.2 units tall
    const knownScale = MODEL_SCALES[modelPath];
    if (knownScale) {
      clone.scale.setScalar(knownScale);
    } else if (maxDim > 5) {
      clone.scale.setScalar(1.2 / maxDim);
    }

    // Center the model
    const newBox = new THREE.Box3().setFromObject(clone);
    const center = new THREE.Vector3();
    newBox.getCenter(center);
    clone.position.sub(center);

    return clone;
  }, [scene, modelPath]);

  useFrame((state) => {
    if (!groupRef.current) return;
    // Gentle slow rotation, not spinning wildly
    groupRef.current.rotation.y = state.clock.elapsedTime * 0.15;
    groupRef.current.position.y = 1.8 + Math.sin(state.clock.elapsedTime * 0.4) * 0.08;
  });

  return (
    <group ref={groupRef} position={[0, 1.8, 0]}>
      <primitive object={clonedScene} />
      <pointLight position={[0, -0.3, 0]} intensity={0.2} color={accentColor} distance={3} />
    </group>
  );
}

/**
 * PropFallback — geometric placeholder
 */
function PropFallback({ color }: { color: string }) {
  const ref = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!ref.current) return;
    ref.current.rotation.y = state.clock.elapsedTime * 0.2;
    ref.current.position.y = 1.8 + Math.sin(state.clock.elapsedTime * 0.4) * 0.08;
  });

  return (
    <Float speed={1} floatIntensity={0.15}>
      <mesh ref={ref} position={[0, 1.8, 0]} castShadow>
        <octahedronGeometry args={[0.4, 0]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.2}
          roughness={0.3}
          metalness={0.6}
          flatShading
        />
      </mesh>
    </Float>
  );
}

/**
 * InfoPanel — compact floating HTML panel with project info
 */
function InfoPanel({ island, visible }: { island: IslandData; visible: boolean }) {
  if (!visible) return null;

  return (
    <Html
      position={[0, 3.5, 1.5]}
      center
      distanceFactor={5}
      occlude={false}
      style={{
        transition: 'opacity 0.5s ease',
        opacity: visible ? 1 : 0,
        pointerEvents: visible ? 'auto' : 'none',
      }}
    >
      <div style={{
        background: 'rgba(255, 248, 231, 0.92)',
        backdropFilter: 'blur(12px)',
        borderRadius: '8px',
        padding: '12px 16px',
        width: '200px',
        boxShadow: `0 4px 20px rgba(0,0,0,0.15), 0 0 12px ${island.accentColor}22`,
        border: `1px solid ${island.accentColor}33`,
        fontFamily: "'Space Grotesk', sans-serif",
        color: '#2C2C2C',
      }}>
        <div style={{
          fontSize: '12px',
          fontWeight: 700,
          marginBottom: '3px',
          color: island.accentColor,
        }}>
          {island.title}
        </div>

        <div style={{
          fontSize: '9px',
          fontWeight: 500,
          color: '#6B7B8D',
          marginBottom: '6px',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
        }}>
          {island.subtitle}
        </div>

        <div style={{
          fontSize: '10px',
          lineHeight: '1.4',
          color: '#4A4A4A',
          marginBottom: '8px',
        }}>
          {island.description.slice(0, 100)}{island.description.length > 100 ? '...' : ''}
        </div>

        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '3px',
        }}>
          {island.techStack.slice(0, 4).map((tech) => (
            <span key={tech} style={{
              fontSize: '8px',
              padding: '1px 5px',
              borderRadius: '8px',
              background: `${island.accentColor}15`,
              color: island.accentColor,
              fontWeight: 500,
            }}>
              {tech}
            </span>
          ))}
        </div>
      </div>
    </Html>
  );
}

/**
 * ProjectIslandGroup — renders all 6 project islands
 */
export function ProjectIslandGroup({ islands }: { islands: IslandData[] }) {
  return (
    <group>
      {islands.map((island) => (
        <Suspense key={island.id} fallback={null}>
          <ProjectIsland island={island} />
        </Suspense>
      ))}
    </group>
  );
}

export default ProjectIsland;
