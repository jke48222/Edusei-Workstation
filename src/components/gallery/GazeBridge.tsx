import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { GALLERY_CONFIG } from '../../constants/galleryData';

/**
 * @file GazeBridge.tsx
 * @description Animated stone steps between main island and project island. States: none, building, complete, dissolving.
 */
interface GazeBridgeProps {
  bridgeStart: [number, number, number];
  bridgeEnd: [number, number, number];
  bridgeState: 'none' | 'building' | 'complete' | 'dissolving';
  accentColor: string;
}

function easeOutBack(x: number): number {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2);
}

function easeInCubic(x: number): number {
  return x * x * x;
}

export function GazeBridge({ bridgeStart, bridgeEnd, bridgeState, accentColor }: GazeBridgeProps) {
  const groupRef = useRef<THREE.Group>(null);
  const buildStartTime = useRef<number | null>(null);
  const dissolveStartTime = useRef<number | null>(null);
  const stepCount = GALLERY_CONFIG.gaze.stepCount;
  const buildTime = GALLERY_CONFIG.gaze.bridgeBuildTime;

  // Calculate step positions along a slight arc between start and end
  const stepPositions = useMemo(() => {
    const start = new THREE.Vector3(...bridgeStart);
    const end = new THREE.Vector3(...bridgeEnd);
    const positions: THREE.Vector3[] = [];

    for (let i = 0; i < stepCount; i++) {
      const t = (i + 0.5) / stepCount;
      const pos = start.clone().lerp(end, t);
      // Add a slight upward arc
      pos.y = Math.sin(t * Math.PI) * 1.5;
      positions.push(pos);
    }

    return positions;
  }, [bridgeStart, bridgeEnd, stepCount]);

  // Calculate rotation to face along the bridge direction
  const bridgeRotation = useMemo(() => {
    const dx = bridgeEnd[0] - bridgeStart[0];
    const dz = bridgeEnd[2] - bridgeStart[2];
    return Math.atan2(dx, dz);
  }, [bridgeStart, bridgeEnd]);

  useFrame((state) => {
    if (!groupRef.current) return;
    const time = state.clock.elapsedTime;

    // Track build/dissolve start times
    if (bridgeState === 'building' && buildStartTime.current === null) {
      buildStartTime.current = time;
      dissolveStartTime.current = null;
    } else if (bridgeState === 'dissolving' && dissolveStartTime.current === null) {
      dissolveStartTime.current = time;
      buildStartTime.current = null;
    } else if (bridgeState === 'none') {
      buildStartTime.current = null;
      dissolveStartTime.current = null;
    }

    // Animate each step
    groupRef.current.children.forEach((child, i) => {
      const targetY = stepPositions[i]?.y ?? 0;
      const hiddenY = -8;
      const staggerDelay = (i / stepCount) * buildTime * 0.7;

      if (bridgeState === 'building' && buildStartTime.current !== null) {
        const elapsed = time - buildStartTime.current - staggerDelay;
        const stepDuration = buildTime * 0.5;
        const progress = Math.max(0, Math.min(1, elapsed / stepDuration));
        const eased = easeOutBack(progress);
        child.position.y = hiddenY + (targetY - hiddenY) * eased;

        // Slight wobble during rise
        child.rotation.z = Math.sin(elapsed * 8) * 0.05 * (1 - progress);
      } else if (bridgeState === 'complete') {
        child.position.y = targetY;
        child.rotation.z = 0;
      } else if (bridgeState === 'dissolving' && dissolveStartTime.current !== null) {
        const elapsed = time - dissolveStartTime.current - (stepCount - i - 1) * 0.05;
        const progress = Math.max(0, Math.min(1, elapsed / (buildTime * 0.4)));
        const eased = easeInCubic(progress);
        child.position.y = targetY + (hiddenY - targetY) * eased;
      } else if (bridgeState === 'none') {
        child.position.y = hiddenY;
      }
    });
  });

  if (bridgeState === 'none') return null;

  return (
    <group ref={groupRef}>
      {stepPositions.map((pos, i) => (
        <group key={i} position={[pos.x, -8, pos.z]} rotation={[0, bridgeRotation, 0]}>
          {/* Main stone step */}
          <mesh castShadow receiveShadow>
            <boxGeometry args={[GALLERY_CONFIG.gaze.bridgeWidth, 0.25, 1.2]} />
            <meshStandardMaterial
              color="#8A9A8A"
              roughness={0.95}
              metalness={0.05}
              flatShading
            />
          </mesh>

          {/* Accent glow on edges */}
          <mesh position={[0, 0.13, 0]}>
            <boxGeometry args={[GALLERY_CONFIG.gaze.bridgeWidth + 0.1, 0.02, 1.3]} />
            <meshStandardMaterial
              color={accentColor}
              emissive={accentColor}
              emissiveIntensity={0.3}
              transparent
              opacity={0.4}
            />
          </mesh>

          {/* Small point light on every 3rd step */}
          {i % 3 === 0 && (
            <pointLight
              position={[0, 0.3, 0]}
              intensity={0.15}
              color={accentColor}
              distance={3}
            />
          )}
        </group>
      ))}
    </group>
  );
}

/**
 * GazeBridgeGroup — renders bridges for all islands
 */
export function GazeBridgeGroup({
  islands,
  bridgeStates,
}: {
  islands: { id: string; bridgeStart: [number, number, number]; bridgeEnd: [number, number, number]; accentColor: string }[];
  bridgeStates: Record<string, 'none' | 'building' | 'complete' | 'dissolving'>;
}) {
  return (
    <group>
      {islands.map((island) => (
        <GazeBridge
          key={island.id}
          bridgeStart={island.bridgeStart}
          bridgeEnd={island.bridgeEnd}
          bridgeState={bridgeStates[island.id] || 'none'}
          accentColor={island.accentColor}
        />
      ))}
    </group>
  );
}

export default GazeBridge;
