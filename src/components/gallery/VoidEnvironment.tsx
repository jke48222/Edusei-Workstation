import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Stars, Grid, Float, MeshReflectorMaterial } from '@react-three/drei';
import { GALLERY_CONFIG } from '../../constants/galleryData';

/**
 * @file VoidEnvironment.tsx
 * @description Alternate gallery space: stars, reflective floor, fog. Replaced by SpiritOasis in current flow.
 */
export function VoidEnvironment() {
  return (
    <group>
      {/* Background and volumetric fog */}
      <color attach="background" args={['#050510']} />
      <fog attach="fog" args={['#050510', 20, 70]} />

      {/* Reflective floor */}
      <ReflectiveFloor />

      {/* Stars */}
      <Stars
        radius={90}
        depth={60}
        count={4000}
        factor={3}
        saturation={0.1}
        fade
        speed={0.2}
      />

      {/* Lighting rig */}
      <Lighting />

      {/* Floating environment objects */}
      <EnvironmentObjects />

      {/* Ambient particles */}
      <AmbientParticles />

      {/* Boundary fog columns */}
      <BoundaryPillars />
    </group>
  );
}

/**
 * ReflectiveFloor — glass-like ground with subtle grid and reflections
 */
function ReflectiveFloor() {
  return (
    <group>
      {/* Reflective surface */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
        <planeGeometry args={[120, 120]} />
        <MeshReflectorMaterial
          blur={[300, 100]}
          resolution={1024}
          mixBlur={1}
          mixStrength={0.5}
          roughness={1}
          depthScale={1.2}
          minDepthThreshold={0.4}
          maxDepthThreshold={1.4}
          color="#080818"
          metalness={0.5}
          mirror={0}
        />
      </mesh>

      {/* Subtle grid overlay */}
      <Grid
        position={[0, 0.001, 0]}
        args={[100, 100]}
        cellSize={2}
        cellThickness={0.3}
        cellColor="#1a1a3e"
        sectionSize={10}
        sectionThickness={0.6}
        sectionColor="#252560"
        fadeDistance={45}
        fadeStrength={1.5}
        followCamera={false}
        infiniteGrid
      />

      {/* Center glow spot */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <circleGeometry args={[4, 64]} />
        <meshBasicMaterial color="#4f46e5" transparent opacity={0.04} />
      </mesh>
    </group>
  );
}

/**
 * Lighting — atmospheric multi-source lighting
 */
function Lighting() {
  return (
    <group>
      {/* Very low ambient */}
      <ambientLight intensity={0.06} color="#8b8bff" />

      {/* Overhead key light */}
      <directionalLight
        position={[0, 25, 0]}
        intensity={0.2}
        color="#ffffff"
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-far={50}
        shadow-camera-left={-25}
        shadow-camera-right={25}
        shadow-camera-top={25}
        shadow-camera-bottom={-25}
      />

      {/* Atmospheric colored rim lights */}
      <pointLight position={[-18, 6, -18]} intensity={0.4} color="#3b2ec0" distance={35} />
      <pointLight position={[18, 6, -18]} intensity={0.4} color="#6d28d9" distance={35} />
      <pointLight position={[0, 4, 20]} intensity={0.2} color="#4338ca" distance={30} />

      {/* Ground accent lights near video areas */}
      <pointLight position={[-8, 0.5, -5]} intensity={0.3} color="#6366f1" distance={8} />
      <pointLight position={[0, 0.5, -8]} intensity={0.3} color="#6366f1" distance={8} />
      <pointLight position={[8, 0.5, -5]} intensity={0.3} color="#6366f1" distance={8} />
    </group>
  );
}

/**
 * EnvironmentObjects — floating objects that give the space depth and life
 */
function EnvironmentObjects() {
  return (
    <group>
      {/* Glowing orbs scattered around */}
      <GlowOrb position={[-14, 5, -12]} color="#6366f1" size={0.4} speed={0.6} />
      <GlowOrb position={[16, 7, -10]} color="#7c3aed" size={0.3} speed={0.4} />
      <GlowOrb position={[-10, 9, 5]} color="#4338ca" size={0.25} speed={0.8} />
      <GlowOrb position={[12, 3.5, -16]} color="#818cf8" size={0.35} speed={0.5} />
      <GlowOrb position={[0, 11, -20]} color="#a78bfa" size={0.5} speed={0.3} />

      {/* Floating torus rings — portal-like elements */}
      <FloatingRing position={[-16, 5, -2]} scale={1.8} color="#4338ca" />
      <FloatingRing position={[16, 8, -8]} scale={1.2} color="#6d28d9" />

      {/* Wireframe geometric shapes for visual anchors */}
      <WireframeShape position={[-12, 6, -14]} shape="icosahedron" scale={1.2} />
      <WireframeShape position={[14, 4, -16]} shape="octahedron" scale={0.9} />
      <WireframeShape position={[0, 8, -22]} shape="dodecahedron" scale={1.0} />

      {/* Energy columns at regular intervals */}
      <EnergyColumn position={[-12, 0, -12]} height={8} />
      <EnergyColumn position={[12, 0, -12]} height={10} />
    </group>
  );
}

/**
 * GlowOrb — pulsing light sphere that floats gently
 */
function GlowOrb({
  position,
  color,
  size,
  speed,
}: {
  position: [number, number, number];
  color: string;
  size: number;
  speed: number;
}) {
  const ref = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.elapsedTime * speed;
    ref.current.position.y = position[1] + Math.sin(t) * 0.5;
    const s = size + Math.sin(t * 1.5) * size * 0.15;
    ref.current.scale.setScalar(s);
  });

  return (
    <Float speed={speed * 2} floatIntensity={0.3}>
      <mesh ref={ref} position={position}>
        <sphereGeometry args={[1, 24, 24]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.8}
          transparent
          opacity={0.5}
          roughness={0.1}
          metalness={0.3}
        />
      </mesh>
      {/* Inner glow point light */}
      <pointLight position={position} intensity={0.4} distance={6} color={color} />
    </Float>
  );
}

/**
 * FloatingRing — large torus that slowly rotates, portal-like feel
 */
function FloatingRing({
  position,
  scale,
  color,
}: {
  position: [number, number, number];
  scale: number;
  color: string;
}) {
  const ref = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!ref.current) return;
    ref.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.2) * 0.4;
    ref.current.rotation.y += 0.005;
  });

  return (
    <Float speed={1.2} floatIntensity={0.4}>
      <mesh ref={ref} position={position} scale={scale}>
        <torusGeometry args={[1, 0.03, 16, 100]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.6}
          metalness={0.9}
          roughness={0.05}
        />
      </mesh>
    </Float>
  );
}

/**
 * WireframeShape — transparent wireframe geometric for visual depth
 */
function WireframeShape({
  position,
  shape,
  scale,
}: {
  position: [number, number, number];
  shape: 'icosahedron' | 'octahedron' | 'dodecahedron';
  scale: number;
}) {
  const ref = useRef<THREE.Mesh>(null);

  useFrame(() => {
    if (!ref.current) return;
    ref.current.rotation.x += 0.002;
    ref.current.rotation.y += 0.003;
  });

  const geometry = useMemo(() => {
    switch (shape) {
      case 'icosahedron':
        return <icosahedronGeometry args={[1, 0]} />;
      case 'octahedron':
        return <octahedronGeometry args={[1, 0]} />;
      case 'dodecahedron':
        return <dodecahedronGeometry args={[1, 0]} />;
    }
  }, [shape]);

  return (
    <Float speed={0.8} floatIntensity={0.5}>
      <mesh ref={ref} position={position} scale={scale}>
        {geometry}
        <meshBasicMaterial
          color="#6366f1"
          wireframe
          transparent
          opacity={0.15}
        />
      </mesh>
    </Float>
  );
}

/**
 * EnergyColumn — vertical light beam / pillar effect
 */
function EnergyColumn({
  position,
  height,
}: {
  position: [number, number, number];
  height: number;
}) {
  const ref = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!ref.current) return;
    const mat = ref.current.material as THREE.MeshBasicMaterial;
    mat.opacity = 0.06 + Math.sin(state.clock.elapsedTime * 0.8) * 0.03;
  });

  return (
    <group position={position}>
      {/* The column beam */}
      <mesh ref={ref} position={[0, height / 2, 0]}>
        <cylinderGeometry args={[0.08, 0.08, height, 8]} />
        <meshBasicMaterial color="#6366f1" transparent opacity={0.08} />
      </mesh>

      {/* Base glow */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <circleGeometry args={[0.8, 32]} />
        <meshBasicMaterial color="#4338ca" transparent opacity={0.08} />
      </mesh>

      {/* Top point light */}
      <pointLight position={[0, height, 0]} intensity={0.15} distance={10} color="#6366f1" />
    </group>
  );
}

/**
 * AmbientParticles — large-scale floating particles for atmosphere
 */
function AmbientParticles() {
  const pointsRef = useRef<THREE.Points>(null);
  const particleCount = 200;

  const [positions, speeds] = useMemo(() => {
    const pos = new Float32Array(particleCount * 3);
    const spd = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 60;
      pos[i * 3 + 1] = Math.random() * 15;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 60;
      spd[i] = 0.005 + Math.random() * 0.01;
    }

    return [pos, spd];
  }, []);

  useFrame(() => {
    if (!pointsRef.current) return;

    const posAttr = pointsRef.current.geometry.attributes.position;
    const arr = posAttr.array as Float32Array;

    for (let i = 0; i < particleCount; i++) {
      arr[i * 3 + 1] += speeds[i];
      if (arr[i * 3 + 1] > 15) {
        arr[i * 3 + 1] = 0;
        arr[i * 3] = (Math.random() - 0.5) * 60;
        arr[i * 3 + 2] = (Math.random() - 0.5) * 60;
      }
    }
    posAttr.needsUpdate = true;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particleCount}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        color="#818cf8"
        size={0.04}
        transparent
        opacity={0.4}
        sizeAttenuation
      />
    </points>
  );
}

/**
 * BoundaryPillars — subtle glowing pillars at the boundary edges
 */
function BoundaryPillars() {
  const { bounds } = GALLERY_CONFIG;

  const pillarPositions: [number, number, number][] = [
    [bounds.minX, 0, bounds.minZ],
    [bounds.maxX, 0, bounds.minZ],
    [bounds.minX, 0, bounds.maxZ],
    [bounds.maxX, 0, bounds.maxZ],
    [0, 0, bounds.minZ],
    [bounds.minX, 0, 0],
    [bounds.maxX, 0, 0],
  ];

  return (
    <group>
      {pillarPositions.map((pos, i) => (
        <group key={i} position={pos}>
          <mesh position={[0, 2, 0]}>
            <cylinderGeometry args={[0.03, 0.03, 4, 6]} />
            <meshBasicMaterial color="#312e81" transparent opacity={0.15} />
          </mesh>
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
            <circleGeometry args={[0.5, 16]} />
            <meshBasicMaterial color="#312e81" transparent opacity={0.06} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

export default VoidEnvironment;
