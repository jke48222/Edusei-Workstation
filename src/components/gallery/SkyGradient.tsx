import { useRef, useMemo, Suspense } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useTexture } from '@react-three/drei';

/**
 * @file SkyGradient.tsx
 * @description Teal-to-peach gradient sky dome (sphere, BackSide) with drifting clouds; custom GLSL.
 */

const SKY_VERTEX = /* glsl */ `
  varying vec3 vWorldPosition;
  void main() {
    vec4 worldPos = modelMatrix * vec4(position, 1.0);
    vWorldPosition = worldPos.xyz;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const SKY_FRAGMENT = /* glsl */ `
  uniform vec3 uColorTop;
  uniform vec3 uColorMid;
  uniform vec3 uColorBottom;
  uniform float uTime;
  varying vec3 vWorldPosition;

  void main() {
    float height = normalize(vWorldPosition).y;

    // Remap from [-1, 1] to [0, 1]
    float t = height * 0.5 + 0.5;

    // Three-stop gradient: bottom (teal) -> mid (warm cream) -> top (peach/pink)
    vec3 color;
    if (t < 0.4) {
      color = mix(uColorBottom, uColorMid, t / 0.4);
    } else {
      color = mix(uColorMid, uColorTop, (t - 0.4) / 0.6);
    }

    // Subtle shimmer
    float shimmer = sin(vWorldPosition.x * 0.02 + uTime * 0.05) *
                    cos(vWorldPosition.z * 0.02 + uTime * 0.03) * 0.015;
    color += shimmer;

    gl_FragColor = vec4(color, 1.0);
  }
`;

export function SkyGradient() {
  return (
    <group>
      <SkyDome />
      <Suspense fallback={null}>
        <CloudField />
      </Suspense>
    </group>
  );
}

function SkyDome() {
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  const uniforms = useMemo(() => ({
    uColorTop: { value: new THREE.Color('#FFDAB9') },    // Soft peach
    uColorMid: { value: new THREE.Color('#FFF8E7') },    // Warm cream
    uColorBottom: { value: new THREE.Color('#2A6B6B') },  // Deep teal
    uTime: { value: 0 },
  }), []);

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.elapsedTime;
    }
  });

  return (
    <mesh>
      <sphereGeometry args={[200, 32, 32]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={SKY_VERTEX}
        fragmentShader={SKY_FRAGMENT}
        uniforms={uniforms}
        side={THREE.BackSide}
        depthWrite={false}
      />
    </mesh>
  );
}

/**
 * CloudField — soft cloud billboards
 */
function CloudField() {
  const cloudsRef = useRef<THREE.Group>(null);

  const cloudData = useMemo(() => {
    const data: { position: [number, number, number]; scale: number; speed: number; opacity: number }[] = [];

    // Clouds below the island
    for (let i = 0; i < 15; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = 30 + Math.random() * 80;
      data.push({
        position: [
          Math.cos(angle) * radius,
          -10 - Math.random() * 25,
          Math.sin(angle) * radius,
        ],
        scale: 10 + Math.random() * 18,
        speed: 0.015 + Math.random() * 0.03,
        opacity: 0.12 + Math.random() * 0.15,
      });
    }

    // Clouds above
    for (let i = 0; i < 8; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = 40 + Math.random() * 60;
      data.push({
        position: [
          Math.cos(angle) * radius,
          25 + Math.random() * 30,
          Math.sin(angle) * radius,
        ],
        scale: 12 + Math.random() * 22,
        speed: 0.01 + Math.random() * 0.02,
        opacity: 0.08 + Math.random() * 0.12,
      });
    }

    return data;
  }, []);

  useFrame((state) => {
    if (!cloudsRef.current) return;
    const t = state.clock.elapsedTime;
    cloudsRef.current.children.forEach((child, i) => {
      const data = cloudData[i];
      if (!data) return;
      child.position.x = data.position[0] + Math.sin(t * data.speed) * 5;
      child.position.z = data.position[2] + Math.cos(t * data.speed * 0.7) * 3;
    });
  });

  const cloudTexture = useTexture('/textures/cloud.png');

  return (
    <group ref={cloudsRef}>
      {cloudData.map((cloud, i) => (
        <mesh key={i} position={cloud.position}>
          <planeGeometry args={[cloud.scale, cloud.scale * 0.5]} />
          <meshBasicMaterial
            map={cloudTexture}
            transparent
            opacity={cloud.opacity}
            depthWrite={false}
            side={THREE.DoubleSide}
            color="#FFF8E7"
          />
        </mesh>
      ))}
    </group>
  );
}

export default SkyGradient;
