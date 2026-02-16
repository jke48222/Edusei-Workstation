import { Suspense, useMemo } from 'react';
import { SkyGradient } from './SkyGradient';
import { FloatingIsland } from './FloatingIsland';
import { SpiritTree } from './SpiritTree';
import { KoiPond } from './KoiPond';

/**
 * @file SpiritOasis.tsx
 * @description Main VR gallery environment: floating island, sky, Spirit Tree, Koi Pond. Performance notes:
 * - Grass reduced from 200 to 80 instances
 * - Lanterns reduced from 6 to 4
 * - Fog distance tuned for visual quality + perf
 */
export function SpiritOasis() {
  return (
    <group>
      {/* Warm fog for atmospheric depth */}
      <fog attach="fog" args={['#C4A882', 50, 150]} />

      {/* Sky dome */}
      <SkyGradient />

      {/* Lighting rig — golden hour */}
      <GoldenHourLighting />

      {/* Main island */}
      <FloatingIsland
        position={[0, -1, 0]}
        radius={14}
        height={4}
        grassColor="#8B9F7B"
        rockColor="#6B7B8D"
        bobSpeed={0.15}
        bobAmount={0.06}
      >
        {/* Spirit Tree */}
        <Suspense fallback={null}>
          <SpiritTree position={[0, 0, -1]} scale={1.3} />
        </Suspense>

        {/* Koi Pond */}
        <Suspense fallback={null}>
          <KoiPond position={[5, 0.02, 3]} radius={3} />
        </Suspense>

        {/* Stone lanterns */}
        <StoneLanterns radius={11} />

        {/* Decorative grass */}
        <GrassPatches radius={12} />
      </FloatingIsland>
    </group>
  );
}

/**
 * GoldenHourLighting — warm directional + ambient light
 */
function GoldenHourLighting() {
  return (
    <group>
      <ambientLight intensity={0.5} color="#FFF8E7" />

      {/* Main sun */}
      <directionalLight
        position={[30, 25, 20]}
        intensity={1.0}
        color="#FFD89B"
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-camera-far={60}
        shadow-camera-left={-25}
        shadow-camera-right={25}
        shadow-camera-top={25}
        shadow-camera-bottom={-25}
        shadow-bias={-0.0002}
      />

      {/* Cool fill */}
      <directionalLight
        position={[-20, 15, -10]}
        intensity={0.25}
        color="#B8D4E3"
      />

      {/* Warm accents */}
      <pointLight position={[8, 2, 5]} intensity={0.12} color="#FFB7C5" distance={12} />
      <pointLight position={[-6, 2, -7]} intensity={0.12} color="#FFDAB9" distance={12} />
    </group>
  );
}

/**
 * StoneLanterns — 4 marker lanterns at the island edges
 */
function StoneLanterns({ radius }: { radius: number }) {
  const lanterns = useMemo(() => {
    return Array.from({ length: 4 }, (_, i) => {
      const angle = (i / 4) * Math.PI * 2 - Math.PI / 2;
      return {
        x: Math.cos(angle) * radius,
        z: Math.sin(angle) * radius,
      };
    });
  }, [radius]);

  return (
    <group>
      {lanterns.map((lantern, i) => (
        <group key={i} position={[lantern.x, 0, lantern.z]}>
          <mesh position={[0, 0.15, 0]} castShadow>
            <cylinderGeometry args={[0.12, 0.18, 0.3, 6]} />
            <meshStandardMaterial color="#8A9A8A" roughness={0.95} flatShading />
          </mesh>
          <mesh position={[0, 0.45, 0]} castShadow>
            <cylinderGeometry args={[0.08, 0.12, 0.3, 6]} />
            <meshStandardMaterial color="#9AA89A" roughness={0.9} flatShading />
          </mesh>
          <mesh position={[0, 0.7, 0]} castShadow>
            <coneGeometry args={[0.15, 0.2, 4]} />
            <meshStandardMaterial color="#7A8A7A" roughness={0.9} flatShading />
          </mesh>
          <pointLight position={[0, 0.45, 0]} intensity={0.2} color="#FFD89B" distance={3} />
        </group>
      ))}
    </group>
  );
}

/**
 * GrassPatches — reduced count (80) for performance
 */
function GrassPatches({ radius }: { radius: number }) {
  const grassData = useMemo(() => {
    const data: { pos: [number, number, number]; scale: number; rot: number }[] = [];
    const count = 80;

    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const r = Math.random() * radius * 0.85;
      data.push({
        pos: [Math.cos(angle) * r, 0, Math.sin(angle) * r],
        scale: 0.15 + Math.random() * 0.25,
        rot: Math.random() * Math.PI * 2,
      });
    }
    return data;
  }, [radius]);

  return (
    <group>
      {grassData.map((g, i) => (
        <mesh
          key={i}
          position={g.pos}
          rotation={[0, g.rot, 0]}
          scale={[g.scale, g.scale * 2, g.scale]}
        >
          <coneGeometry args={[0.08, 0.5, 3]} />
          <meshStandardMaterial color="#7A9B6A" roughness={0.9} metalness={0} side={2} />
        </mesh>
      ))}
    </group>
  );
}

export default SpiritOasis;
