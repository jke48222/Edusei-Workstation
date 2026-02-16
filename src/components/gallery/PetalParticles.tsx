import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useTexture } from '@react-three/drei';

/**
 * @file PetalParticles.tsx
 * @description Instanced cherry blossom petals: drift, wind sway, rotation; reset at ground. Used by SpiritTree.
 */
interface PetalParticlesProps {
  origin: [number, number, number];
  radius: number;
  count: number;
}

interface PetalData {
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  rotation: THREE.Euler;
  rotSpeed: THREE.Vector3;
  phase: number;
  windPhase: number;
  size: number;
}

export function PetalParticles({ origin, radius, count }: PetalParticlesProps) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  const petalTexture = useTexture('/textures/petal.png');

  const petals = useMemo<PetalData[]>(() => {
    return Array.from({ length: count }, () => ({
      position: new THREE.Vector3(
        origin[0] + (Math.random() - 0.5) * radius * 2,
        origin[1] + Math.random() * 3,
        origin[2] + (Math.random() - 0.5) * radius * 2,
      ),
      velocity: new THREE.Vector3(
        (Math.random() - 0.5) * 0.3,
        -(0.2 + Math.random() * 0.4),
        (Math.random() - 0.5) * 0.3,
      ),
      rotation: new THREE.Euler(
        Math.random() * Math.PI * 2,
        Math.random() * Math.PI * 2,
        Math.random() * Math.PI * 2,
      ),
      rotSpeed: new THREE.Vector3(
        (Math.random() - 0.5) * 2,
        (Math.random() - 0.5) * 1.5,
        (Math.random() - 0.5) * 2,
      ),
      phase: Math.random() * Math.PI * 2,
      windPhase: Math.random() * Math.PI * 2,
      size: 0.08 + Math.random() * 0.12,
    }));
  }, [origin, radius, count]);

  useFrame((state, delta) => {
    if (!meshRef.current) return;
    const t = state.clock.elapsedTime;
    const clampedDelta = Math.min(delta, 0.1);

    petals.forEach((petal, i) => {
      // Wind sway
      const windX = Math.sin(t * 0.5 + petal.windPhase) * 0.3;
      const windZ = Math.cos(t * 0.4 + petal.windPhase * 1.3) * 0.2;

      // Update position
      petal.position.x += (petal.velocity.x + windX) * clampedDelta;
      petal.position.y += petal.velocity.y * clampedDelta;
      petal.position.z += (petal.velocity.z + windZ) * clampedDelta;

      // Update rotation (tumbling)
      petal.rotation.x += petal.rotSpeed.x * clampedDelta;
      petal.rotation.y += petal.rotSpeed.y * clampedDelta;
      petal.rotation.z += petal.rotSpeed.z * clampedDelta;

      // Reset when below ground
      if (petal.position.y < -2) {
        petal.position.set(
          origin[0] + (Math.random() - 0.5) * radius * 2,
          origin[1] + Math.random() * 2,
          origin[2] + (Math.random() - 0.5) * radius * 2,
        );
        petal.velocity.set(
          (Math.random() - 0.5) * 0.3,
          -(0.2 + Math.random() * 0.4),
          (Math.random() - 0.5) * 0.3,
        );
      }

      // Apply to instanced mesh
      dummy.position.copy(petal.position);
      dummy.rotation.copy(petal.rotation);
      dummy.scale.setScalar(petal.size);
      dummy.updateMatrix();
      meshRef.current!.setMatrixAt(i, dummy.matrix);
    });

    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh
      ref={meshRef}
      args={[undefined, undefined, count]}
      frustumCulled={false}
    >
      <planeGeometry args={[1, 0.7]} />
      <meshStandardMaterial
        map={petalTexture}
        color="#FFB7C5"
        transparent
        opacity={0.85}
        alphaTest={0.1}
        side={THREE.DoubleSide}
        emissive="#FFB7C5"
        emissiveIntensity={0.1}
        depthWrite={false}
      />
    </instancedMesh>
  );
}

export default PetalParticles;
