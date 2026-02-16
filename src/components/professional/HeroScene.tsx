/**
 * @file HeroScene.tsx
 * @description Optional 3D hero background: wireframe shapes (torus, icosahedron, etc.) and
 * particles on a warm background. Used in professional view for ambient motion.
 */

import { Canvas, useFrame } from '@react-three/fiber';
import { Float } from '@react-three/drei';
import * as THREE from 'three';
import { useRef, useMemo } from 'react';

/** Single wireframe mesh with rotation driven by useFrame; geometry type configurable. */
function WireShape({
  geometry,
  position,
  color,
  rotSpeed,
  scale = 1,
}: {
  geometry: 'torus' | 'icosa' | 'octahedron' | 'torusKnot';
  position: [number, number, number];
  color: string;
  rotSpeed: number;
  scale?: number;
}) {
  const ref = useRef<THREE.Mesh>(null);

  const geo = useMemo(() => {
    switch (geometry) {
      case 'torus':
        return new THREE.TorusGeometry(1, 0.35, 16, 40);
      case 'icosa':
        return new THREE.IcosahedronGeometry(1, 1);
      case 'octahedron':
        return new THREE.OctahedronGeometry(1, 0);
      case 'torusKnot':
        return new THREE.TorusKnotGeometry(0.8, 0.25, 80, 12);
    }
  }, [geometry]);

  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.getElapsedTime();
    ref.current.rotation.x = t * rotSpeed * 0.3;
    ref.current.rotation.y = t * rotSpeed * 0.5;
    ref.current.rotation.z = t * rotSpeed * 0.1;
  });

  return (
    <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.4}>
      <mesh ref={ref} position={position} scale={scale} geometry={geo}>
        <meshBasicMaterial color={color} wireframe opacity={0.35} transparent />
      </mesh>
    </Float>
  );
}

function Particles() {
  const ref = useRef<THREE.Points>(null);
  const count = 120;

  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 10;
      arr[i * 3 + 1] = (Math.random() - 0.5) * 6;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 6;
    }
    return arr;
  }, []);

  useFrame((state) => {
    if (!ref.current) return;
    ref.current.rotation.y = state.clock.getElapsedTime() * 0.02;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
          count={count}
        />
      </bufferGeometry>
      <pointsMaterial size={0.02} color="#0a0a0a" transparent opacity={0.2} sizeAttenuation />
    </points>
  );
}

export function HeroScene() {
  return (
    <Canvas
      camera={{ position: [0, 0, 6], fov: 45 }}
      dpr={[1, 1.5]}
      className="absolute inset-0"
      style={{ background: 'transparent' }}
      gl={{ powerPreference: 'high-performance', alpha: true }}
      onCreated={({ gl }) => {
        gl.setClearColor(0x000000, 0);
      }}
    >

      {/* Wireframe shapes at different depths */}
      <WireShape geometry="torusKnot" position={[-2, 0.5, 0]} color="#0a0a0a" rotSpeed={0.4} scale={0.7} />
      <WireShape geometry="icosa" position={[2.2, -0.3, -1]} color="#a855f7" rotSpeed={0.3} scale={0.9} />
      <WireShape geometry="torus" position={[0.5, 1.2, -2]} color="#06b6d4" rotSpeed={0.25} scale={0.6} />
      <WireShape geometry="octahedron" position={[-1.5, -1, -1.5]} color="#0a0a0a" rotSpeed={0.35} scale={0.5} />

      {/* Subtle dust particles */}
      <Particles />
    </Canvas>
  );
}
