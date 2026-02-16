import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * @file FloatingIsland.tsx
 * @description Procedural floating landmass: grass top, rocky underside, bob animation. Params: radius,
 * height, grassColor, rockColor, bobSpeed, bobAmount.
 */
interface FloatingIslandProps {
  position: [number, number, number];
  radius: number;
  height?: number;
  grassColor?: string;
  rockColor?: string;
  bobSpeed?: number;
  bobAmount?: number;
  children?: React.ReactNode;
}

export function FloatingIsland({
  position,
  radius,
  height = 3,
  grassColor = '#8B9F7B',
  rockColor = '#6B7B8D',
  bobSpeed = 0.3,
  bobAmount = 0.15,
  children,
}: FloatingIslandProps) {
  const groupRef = useRef<THREE.Group>(null);
  const baseY = position[1];

  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.elapsedTime * bobSpeed;
    groupRef.current.position.y = baseY + Math.sin(t) * bobAmount;
  });

  const topGeometry = useMemo(() => {
    const geo = new THREE.CylinderGeometry(radius, radius * 0.95, height * 0.25, 32, 4);
    const posAttr = geo.attributes.position;
    const arr = posAttr.array as Float32Array;

    for (let i = 0; i < posAttr.count; i++) {
      const x = arr[i * 3];
      const y = arr[i * 3 + 1];
      const z = arr[i * 3 + 2];

      const dist = Math.sqrt(x * x + z * z) / radius;

      // Add organic edge displacement
      if (dist > 0.6) {
        const angle = Math.atan2(z, x);
        const noise = Math.sin(angle * 5) * 0.3 + Math.cos(angle * 7) * 0.2;
        arr[i * 3] += noise * (dist - 0.6) * radius * 0.15;
        arr[i * 3 + 2] += noise * (dist - 0.6) * radius * 0.1;
      }

      // Slight surface undulation for top vertices
      if (y > 0) {
        const surfaceNoise = Math.sin(x * 0.8) * Math.cos(z * 0.8) * 0.08;
        arr[i * 3 + 1] += surfaceNoise;
      }
    }

    posAttr.needsUpdate = true;
    geo.computeVertexNormals();
    return geo;
  }, [radius, height]);

  const bottomGeometry = useMemo(() => {
    const bottomHeight = height * 0.75;
    const geo = new THREE.ConeGeometry(radius * 0.95, bottomHeight, 32, 6);
    const posAttr = geo.attributes.position;
    const arr = posAttr.array as Float32Array;

    for (let i = 0; i < posAttr.count; i++) {
      const x = arr[i * 3];
      const y = arr[i * 3 + 1];
      const z = arr[i * 3 + 2];

      // Add craggy displacement to sides
      const angle = Math.atan2(z, x);
      const heightFactor = (y + bottomHeight / 2) / bottomHeight;
      const crags = Math.sin(angle * 8 + y * 2) * 0.15 +
                    Math.cos(angle * 13 + y * 3) * 0.1;

      if (heightFactor < 0.9) {
        arr[i * 3] += x * crags * 0.3;
        arr[i * 3 + 2] += z * crags * 0.3;
      }
    }

    posAttr.needsUpdate = true;
    geo.computeVertexNormals();
    return geo;
  }, [radius, height]);

  return (
    <group ref={groupRef} position={position}>
      {/* Top grass surface */}
      <mesh geometry={topGeometry} castShadow receiveShadow>
        <meshStandardMaterial
          color={grassColor}
          roughness={0.9}
          metalness={0.05}
          flatShading
        />
      </mesh>

      {/* Bottom rocky portion (inverted cone) */}
      <mesh
        geometry={bottomGeometry}
        position={[0, -height * 0.5, 0]}
        rotation={[Math.PI, 0, 0]}
        castShadow
      >
        <meshStandardMaterial
          color={rockColor}
          roughness={0.95}
          metalness={0.1}
          flatShading
        />
      </mesh>

      {/* Edge rocks for detail */}
      <EdgeRocks radius={radius} rockColor={rockColor} />

      {/* Children (trees, props, etc.) placed on top surface */}
      <group position={[0, height * 0.125, 0]}>
        {children}
      </group>
    </group>
  );
}

/**
 * EdgeRocks — small rock meshes scattered around the island edge
 */
function EdgeRocks({ radius, rockColor }: { radius: number; rockColor: string }) {
  const rocks = useMemo(() => {
    const data: { pos: [number, number, number]; scale: [number, number, number]; rot: number }[] = [];
    const count = Math.floor(radius * 1.5);

    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2 + Math.random() * 0.3;
      const r = radius * (0.85 + Math.random() * 0.15);
      const size = 0.2 + Math.random() * 0.4;
      data.push({
        pos: [
          Math.cos(angle) * r,
          -0.2 + Math.random() * 0.3,
          Math.sin(angle) * r,
        ],
        scale: [size, size * (0.6 + Math.random() * 0.8), size],
        rot: Math.random() * Math.PI * 2,
      });
    }

    return data;
  }, [radius]);

  return (
    <group>
      {rocks.map((rock, i) => (
        <mesh
          key={i}
          position={rock.pos}
          rotation={[0, rock.rot, Math.random() * 0.3]}
          scale={rock.scale}
          castShadow
        >
          <dodecahedronGeometry args={[1, 0]} />
          <meshStandardMaterial
            color={rockColor}
            roughness={0.95}
            metalness={0.05}
            flatShading
          />
        </mesh>
      ))}
    </group>
  );
}

export default FloatingIsland;
