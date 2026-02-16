import { useRef, useMemo, Suspense } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Float } from '@react-three/drei';
import { PetalParticles } from './PetalParticles';

/**
 * @file SpiritTree.tsx
 * @description Central procedural tree: trunk, branches, blossom canopy; PetalParticles from crown. Focal point of main island.
 */
interface SpiritTreeProps {
  position?: [number, number, number];
  scale?: number;
}

export function SpiritTree({ position = [0, 0, 0], scale = 1 }: SpiritTreeProps) {
  const groupRef = useRef<THREE.Group>(null);

  return (
    <group ref={groupRef} position={position} scale={scale}>
      {/* Trunk */}
      <Trunk />

      {/* Major branches */}
      <Branches />

      {/* Blossom canopy */}
      <Canopy />

      {/* Inner glow light */}
      <pointLight
        position={[0, 6, 0]}
        intensity={0.8}
        color="#FFB7C5"
        distance={20}
      />

      {/* Ground glow beneath tree */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.05, 0]}>
        <circleGeometry args={[4, 32]} />
        <meshBasicMaterial
          color="#FFB7C5"
          transparent
          opacity={0.06}
        />
      </mesh>

      {/* Falling petals */}
      <Suspense fallback={null}>
        <PetalParticles
          origin={[0, 7, 0]}
          radius={6}
          count={80}
        />
      </Suspense>
    </group>
  );
}

/**
 * Trunk — twisted organic tree trunk
 */
function Trunk() {
  const trunkGeometry = useMemo(() => {
    const path = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(0.1, 1.5, 0.05),
      new THREE.Vector3(-0.1, 3, 0.1),
      new THREE.Vector3(0.15, 4.5, -0.05),
      new THREE.Vector3(0, 5.5, 0),
    ]);

    const geo = new THREE.TubeGeometry(path, 20, 0.4, 8, false);

    // Vary the radius along the trunk (thicker at base, thinner at top)
    const posAttr = geo.attributes.position;
    const arr = posAttr.array as Float32Array;
    for (let i = 0; i < posAttr.count; i++) {
      const y = arr[i * 3 + 1];
      const heightRatio = y / 5.5;
      const taper = 1.0 - heightRatio * 0.5;
      const x = arr[i * 3];
      const z = arr[i * 3 + 2];
      const dist = Math.sqrt(x * x + z * z);
      if (dist > 0.01) {
        const scale = taper;
        arr[i * 3] *= scale;
        arr[i * 3 + 2] *= scale;
      }
    }
    posAttr.needsUpdate = true;
    geo.computeVertexNormals();
    return geo;
  }, []);

  return (
    <mesh geometry={trunkGeometry} castShadow>
      <meshStandardMaterial
        color="#5C4033"
        roughness={0.9}
        metalness={0.05}
      />
    </mesh>
  );
}

/**
 * Branches — spreading limbs from the trunk
 */
function Branches() {
  const branchData = useMemo(() => [
    { start: [0, 3.5, 0], end: [3, 5.5, 1], thick: 0.15 },
    { start: [0, 3, 0], end: [-2.5, 5, -1.5], thick: 0.13 },
    { start: [0, 4, 0], end: [1.5, 6.5, -2], thick: 0.12 },
    { start: [0, 3.8, 0], end: [-1, 6, 2.5], thick: 0.11 },
    { start: [0, 4.5, 0], end: [2, 7, 0.5], thick: 0.1 },
    { start: [0, 4.2, 0], end: [-2, 6.8, -0.5], thick: 0.1 },
  ] as { start: number[]; end: number[]; thick: number }[], []);

  return (
    <group>
      {branchData.map((branch, i) => (
        <BranchSegment key={i} {...branch} />
      ))}
    </group>
  );
}

function BranchSegment({ start, end, thick }: { start: number[]; end: number[]; thick: number }) {
  const geometry = useMemo(() => {
    const s = new THREE.Vector3(...start);
    const e = new THREE.Vector3(...end);
    const mid = s.clone().lerp(e, 0.5);
    mid.y += 0.3;

    const curve = new THREE.QuadraticBezierCurve3(s, mid, e);
    return new THREE.TubeGeometry(curve, 8, thick, 6, false);
  }, [start, end, thick]);

  return (
    <mesh geometry={geometry} castShadow>
      <meshStandardMaterial
        color="#5C4033"
        roughness={0.85}
        metalness={0.05}
      />
    </mesh>
  );
}

/**
 * Canopy — clusters of blossom spheres with luminous pink material
 */
function Canopy() {
  const canopyRef = useRef<THREE.Group>(null);

  const blossomPositions = useMemo(() => [
    { pos: [0, 6.5, 0] as [number, number, number], size: 2.5 },
    { pos: [2, 5.8, 0.8] as [number, number, number], size: 1.8 },
    { pos: [-1.8, 5.5, -1.2] as [number, number, number], size: 2.0 },
    { pos: [1, 6.8, -1.5] as [number, number, number], size: 1.5 },
    { pos: [-1, 6.2, 2] as [number, number, number], size: 1.6 },
    { pos: [2.5, 6, -0.5] as [number, number, number], size: 1.3 },
    { pos: [-2.2, 6.5, 0.5] as [number, number, number], size: 1.4 },
    { pos: [0.5, 7.2, 0.5] as [number, number, number], size: 1.2 },
  ], []);

  useFrame((state) => {
    if (!canopyRef.current) return;
    const t = state.clock.elapsedTime;
    canopyRef.current.children.forEach((child, i) => {
      child.rotation.y = Math.sin(t * 0.2 + i) * 0.02;
      child.position.y = blossomPositions[i].pos[1] + Math.sin(t * 0.3 + i * 0.5) * 0.05;
    });
  });

  return (
    <Float speed={0.5} floatIntensity={0.05}>
      <group ref={canopyRef}>
        {blossomPositions.map((blossom, i) => (
          <mesh key={i} position={blossom.pos} castShadow>
            <sphereGeometry args={[blossom.size, 16, 12]} />
            <meshStandardMaterial
              color="#FFB7C5"
              roughness={0.6}
              metalness={0.1}
              transparent
              opacity={0.75}
              emissive="#FFB7C5"
              emissiveIntensity={0.15}
            />
          </mesh>
        ))}
      </group>
    </Float>
  );
}

export default SpiritTree;
