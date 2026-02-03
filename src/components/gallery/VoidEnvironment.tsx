import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Stars, Grid, Float } from '@react-three/drei';
import { GALLERY_CONFIG } from '../../constants/galleryData';

/**
 * VoidEnvironment Component
 * 
 * Creates a minimalist, ethereal "void" space for the gallery:
 * - Infinite dark background
 * - Subtle grid floor
 * - Floating particles
 * - Ambient lighting
 * - Decorative geometric elements
 */
export function VoidEnvironment() {
  return (
    <group>
      {/* Background color and fog */}
      <color attach="background" args={['#030014']} />
      <fog attach="fog" args={['#030014', 15, 60]} />
      
      {/* Grid floor */}
      <GridFloor />
      
      {/* Stars/particles in background */}
      <Stars
        radius={80}
        depth={50}
        count={3000}
        factor={3}
        saturation={0}
        fade
        speed={0.3}
      />
      
      {/* Ambient lighting */}
      <AmbientLighting />
      
      {/* Floating geometric decorations */}
      <FloatingDecorations />
      
      {/* Boundary indicators */}
      <BoundaryIndicators />
    </group>
  );
}

/**
 * GridFloor - Subtle grid pattern on the floor
 */
function GridFloor() {
  return (
    <group>
      {/* Main grid */}
      <Grid
        position={[0, 0, 0]}
        args={[100, 100]}
        cellSize={2}
        cellThickness={0.5}
        cellColor="#1e1b4b"
        sectionSize={10}
        sectionThickness={1}
        sectionColor="#312e81"
        fadeDistance={50}
        fadeStrength={1}
        followCamera={false}
        infiniteGrid
      />
      
      {/* Floor plane for receiving shadows */}
      <mesh 
        rotation={[-Math.PI / 2, 0, 0]} 
        position={[0, -0.01, 0]}
        receiveShadow
      >
        <planeGeometry args={[100, 100]} />
        <meshStandardMaterial
          color="#050014"
          transparent
          opacity={0.95}
          roughness={0.9}
        />
      </mesh>
      
      {/* Center highlight */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.01, 0]}
      >
        <circleGeometry args={[3, 64]} />
        <meshBasicMaterial
          color="#6366f1"
          transparent
          opacity={0.05}
        />
      </mesh>
    </group>
  );
}

/**
 * AmbientLighting - Subtle ambient and directional lighting
 */
function AmbientLighting() {
  return (
    <group>
      {/* Very dim ambient */}
      <ambientLight intensity={0.1} color="#6366f1" />
      
      {/* Main directional light (simulating overhead) */}
      <directionalLight
        position={[0, 20, 0]}
        intensity={0.3}
        color="#ffffff"
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-far={50}
        shadow-camera-left={-20}
        shadow-camera-right={20}
        shadow-camera-top={20}
        shadow-camera-bottom={-20}
      />
      
      {/* Rim lights for depth */}
      <pointLight
        position={[-15, 5, -15]}
        intensity={0.5}
        color="#4338ca"
        distance={30}
      />
      <pointLight
        position={[15, 5, -15]}
        intensity={0.5}
        color="#7c3aed"
        distance={30}
      />
      
      {/* Fill light from front */}
      <pointLight
        position={[0, 3, 15]}
        intensity={0.3}
        color="#6366f1"
        distance={25}
      />
    </group>
  );
}

/**
 * FloatingDecorations - Ethereal geometric shapes floating in space
 */
function FloatingDecorations() {
  return (
    <group>
      {/* Floating cubes */}
      <FloatingShape
        position={[-12, 4, -10]}
        shape="cube"
        scale={0.5}
        color="#4338ca"
      />
      <FloatingShape
        position={[14, 6, -8]}
        shape="cube"
        scale={0.3}
        color="#6366f1"
      />
      <FloatingShape
        position={[-8, 8, -5]}
        shape="octahedron"
        scale={0.4}
        color="#7c3aed"
      />
      <FloatingShape
        position={[10, 3, -12]}
        shape="dodecahedron"
        scale={0.35}
        color="#818cf8"
      />
      
      {/* Floating rings */}
      <FloatingRing position={[-15, 5, 0]} />
      <FloatingRing position={[15, 7, -5]} />
      
      {/* Particle trails */}
      <ParticleTrail position={[0, 2, -15]} />
    </group>
  );
}

/**
 * FloatingShape - A single floating geometric shape
 */
interface FloatingShapeProps {
  position: [number, number, number];
  shape: 'cube' | 'octahedron' | 'dodecahedron' | 'icosahedron';
  scale: number;
  color: string;
}

function FloatingShape({ position, shape, scale, color }: FloatingShapeProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x += 0.003;
      meshRef.current.rotation.y += 0.005;
    }
  });
  
  const geometry = useMemo(() => {
    switch (shape) {
      case 'cube':
        return <boxGeometry args={[1, 1, 1]} />;
      case 'octahedron':
        return <octahedronGeometry args={[1]} />;
      case 'dodecahedron':
        return <dodecahedronGeometry args={[1]} />;
      case 'icosahedron':
        return <icosahedronGeometry args={[1]} />;
      default:
        return <boxGeometry args={[1, 1, 1]} />;
    }
  }, [shape]);
  
  return (
    <Float
      speed={2}
      rotationIntensity={0.5}
      floatIntensity={0.5}
      floatingRange={[-0.2, 0.2]}
    >
      <mesh ref={meshRef} position={position} scale={scale}>
        {geometry}
        <meshStandardMaterial
          color={color}
          metalness={0.8}
          roughness={0.2}
          emissive={color}
          emissiveIntensity={0.2}
          transparent
          opacity={0.7}
        />
      </mesh>
    </Float>
  );
}

/**
 * FloatingRing - Decorative ring floating in space
 */
function FloatingRing({ position }: { position: [number, number, number] }) {
  const ringRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (ringRef.current) {
      ringRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.3) * 0.3;
      ringRef.current.rotation.y += 0.01;
    }
  });
  
  return (
    <Float speed={1.5} floatIntensity={0.3}>
      <mesh ref={ringRef} position={position}>
        <torusGeometry args={[1, 0.05, 16, 100]} />
        <meshStandardMaterial
          color="#6366f1"
          metalness={0.9}
          roughness={0.1}
          emissive="#6366f1"
          emissiveIntensity={0.3}
        />
      </mesh>
    </Float>
  );
}

/**
 * ParticleTrail - Flowing particles for atmosphere
 */
function ParticleTrail({ position }: { position: [number, number, number] }) {
  const particlesRef = useRef<THREE.Points>(null);
  
  const particleCount = 50;
  
  const [positions, velocities] = useMemo(() => {
    const pos = new Float32Array(particleCount * 3);
    const vel = new Float32Array(particleCount * 3);
    
    for (let i = 0; i < particleCount; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 10;
      pos[i * 3 + 1] = Math.random() * 5;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 10;
      
      vel[i * 3] = (Math.random() - 0.5) * 0.02;
      vel[i * 3 + 1] = Math.random() * 0.01 + 0.01;
      vel[i * 3 + 2] = (Math.random() - 0.5) * 0.02;
    }
    
    return [pos, vel];
  }, []);
  
  useFrame(() => {
    if (!particlesRef.current) return;
    
    const positionAttribute = particlesRef.current.geometry.attributes.position;
    const posArray = positionAttribute.array as Float32Array;
    
    for (let i = 0; i < particleCount; i++) {
      posArray[i * 3] += velocities[i * 3];
      posArray[i * 3 + 1] += velocities[i * 3 + 1];
      posArray[i * 3 + 2] += velocities[i * 3 + 2];
      
      // Reset particles that go too high
      if (posArray[i * 3 + 1] > 8) {
        posArray[i * 3 + 1] = 0;
        posArray[i * 3] = (Math.random() - 0.5) * 10;
        posArray[i * 3 + 2] = (Math.random() - 0.5) * 10;
      }
    }
    
    positionAttribute.needsUpdate = true;
  });
  
  return (
    <points ref={particlesRef} position={position}>
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
        size={0.05}
        transparent
        opacity={0.6}
        sizeAttenuation
      />
    </points>
  );
}

/**
 * BoundaryIndicators - Subtle visual cues at the edges of the playable area
 */
function BoundaryIndicators() {
  const { bounds } = GALLERY_CONFIG;
  
  // Create corner markers
  const corners = [
    [bounds.minX, bounds.minZ],
    [bounds.maxX, bounds.minZ],
    [bounds.minX, bounds.maxZ],
    [bounds.maxX, bounds.maxZ],
  ];
  
  return (
    <group>
      {corners.map(([x, z], index) => (
        <mesh key={index} position={[x, 0.1, z]}>
          <boxGeometry args={[0.5, 0.2, 0.5]} />
          <meshBasicMaterial
            color="#312e81"
            transparent
            opacity={0.3}
          />
        </mesh>
      ))}
      
      {/* Edge lines */}
      <lineSegments>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={8}
            array={new Float32Array([
              bounds.minX, 0.1, bounds.minZ,
              bounds.maxX, 0.1, bounds.minZ,
              bounds.maxX, 0.1, bounds.minZ,
              bounds.maxX, 0.1, bounds.maxZ,
              bounds.maxX, 0.1, bounds.maxZ,
              bounds.minX, 0.1, bounds.maxZ,
              bounds.minX, 0.1, bounds.maxZ,
              bounds.minX, 0.1, bounds.minZ,
            ])}
            itemSize={3}
          />
        </bufferGeometry>
        <lineBasicMaterial color="#312e81" transparent opacity={0.2} />
      </lineSegments>
    </group>
  );
}

export default VoidEnvironment;
