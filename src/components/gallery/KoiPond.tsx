import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { MeshReflectorMaterial } from '@react-three/drei';

/**
 * @file KoiPond.tsx
 * @description Reflective water, procedural emissive koi (circular/figure-8 paths). Placed on main island.
 */
interface KoiPondProps {
  position?: [number, number, number];
  radius?: number;
}

export function KoiPond({ position = [5, 0.05, 3], radius = 3.5 }: KoiPondProps) {
  return (
    <group position={position}>
      {/* Pond basin — slight depression visual */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]}>
        <circleGeometry args={[radius + 0.3, 32]} />
        <meshStandardMaterial
          color="#4A5D4A"
          roughness={1}
          metalness={0}
        />
      </mesh>

      {/* Stone border */}
      <PondBorder radius={radius} />

      {/* Water surface */}
      <WaterSurface radius={radius} />

      {/* Koi fish */}
      <KoiFish
        pathRadius={radius * 0.5}
        offset={0}
        color="#FF6B35"
        glowColor="#FF8C5A"
        speed={0.4}
      />
      <KoiFish
        pathRadius={radius * 0.35}
        offset={Math.PI}
        color="#FFFFFF"
        glowColor="#FFE4D6"
        speed={0.3}
      />
      <KoiFish
        pathRadius={radius * 0.6}
        offset={Math.PI * 0.7}
        color="#FFD700"
        glowColor="#FFE88A"
        speed={0.35}
      />

      {/* Underwater light */}
      <pointLight
        position={[0, -0.3, 0]}
        intensity={0.4}
        color="#2A6B6B"
        distance={8}
      />
    </group>
  );
}

/**
 * WaterSurface — reflective, slightly transparent water
 */
function WaterSurface({ radius }: { radius: number }) {
  const waterRef = useRef<THREE.Mesh>(null);

  return (
    <mesh ref={waterRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
      <circleGeometry args={[radius, 32]} />
      <MeshReflectorMaterial
        blur={[200, 100]}
        resolution={512}
        mixBlur={1}
        mixStrength={0.6}
        roughness={0.3}
        depthScale={0.8}
        minDepthThreshold={0.4}
        maxDepthThreshold={1.4}
        color="#2A6B6B"
        metalness={0.4}
        mirror={0.3}
      />
    </mesh>
  );
}

/**
 * PondBorder — ring of small stones around the pond edge
 */
function PondBorder({ radius }: { radius: number }) {
  const stones = useMemo(() => {
    const data: { pos: [number, number, number]; scale: [number, number, number]; rot: number }[] = [];
    const count = Math.floor(radius * 8);
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      const r = radius + 0.1 + Math.random() * 0.15;
      data.push({
        pos: [
          Math.cos(angle) * r,
          -0.05 + Math.random() * 0.1,
          Math.sin(angle) * r,
        ],
        scale: [
          0.15 + Math.random() * 0.12,
          0.08 + Math.random() * 0.08,
          0.15 + Math.random() * 0.12,
        ],
        rot: Math.random() * Math.PI * 2,
      });
    }
    return data;
  }, [radius]);

  return (
    <group>
      {stones.map((stone, i) => (
        <mesh
          key={i}
          position={stone.pos}
          rotation={[0, stone.rot, 0]}
          scale={stone.scale}
        >
          <sphereGeometry args={[1, 6, 4]} />
          <meshStandardMaterial
            color="#8A9A8A"
            roughness={0.95}
            metalness={0.05}
            flatShading
          />
        </mesh>
      ))}
    </group>
  );
}

/**
 * KoiFish — procedural animated fish swimming in circular paths
 */
function KoiFish({
  pathRadius,
  offset,
  color,
  glowColor,
  speed,
}: {
  pathRadius: number;
  offset: number;
  color: string;
  glowColor: string;
  speed: number;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const tailRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.elapsedTime * speed + offset;

    // Figure-8 path
    const x = Math.sin(t) * pathRadius;
    const z = Math.sin(t * 2) * pathRadius * 0.4;
    const y = -0.15 + Math.sin(t * 3) * 0.03;

    groupRef.current.position.set(x, y, z);

    // Face movement direction
    const dx = Math.cos(t) * pathRadius * speed;
    const dz = Math.cos(t * 2) * pathRadius * 0.4 * speed * 2;
    groupRef.current.rotation.y = Math.atan2(dx, dz);

    // Tail wiggle
    if (tailRef.current) {
      tailRef.current.rotation.y = Math.sin(t * 8) * 0.4;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Body */}
      <mesh castShadow>
        <capsuleGeometry args={[0.06, 0.15, 4, 8]} />
        <meshStandardMaterial
          color={color}
          emissive={glowColor}
          emissiveIntensity={0.4}
          roughness={0.3}
          metalness={0.4}
        />
      </mesh>

      {/* Tail fin */}
      <mesh ref={tailRef} position={[0, 0, 0.12]}>
        <coneGeometry args={[0.05, 0.08, 4]} />
        <meshStandardMaterial
          color={color}
          emissive={glowColor}
          emissiveIntensity={0.3}
          transparent
          opacity={0.8}
        />
      </mesh>

      {/* Point light for glow */}
      <pointLight
        position={[0, 0.05, 0]}
        intensity={0.2}
        color={glowColor}
        distance={2}
      />
    </group>
  );
}

export default KoiPond;
