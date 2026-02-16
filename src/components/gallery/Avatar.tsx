import { useRef, forwardRef, Suspense } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useWorkstationStore } from '../../store/store';
import { CharacterAvatar } from './CharacterAvatar';

/**
 * @file Avatar.tsx
 * @description Player representation in the Spirit Oasis. Uses CharacterAvatar (FBX) or
 * procedural capsule fallback. Headset dissolve and store-driven visibility.
 */

/** Capsule avatar configuration (fallback when FBX fails). */
const AVATAR_CONFIG = {
  capsuleRadiusTop: 0.35,
  capsuleHeight: 1.0,
  bodyColor: '#6B7B8D',
  headColor: '#8A9A8A',
  eyeColor: '#FFF8E7',
  bobAmplitude: 0.05,
  bobFrequency: 3,
  leanAngle: 0.15,
} as const;

export const Avatar = forwardRef<THREE.Group>(() => {
  return (
    <Suspense fallback={<CapsuleAvatar />}>
      <CharacterAvatar />
    </Suspense>
  );
});

Avatar.displayName = 'Avatar';

/**
 * CapsuleAvatar — fallback procedural avatar
 */
function CapsuleAvatar() {
  const groupRef = useRef<THREE.Group>(null);
  const avatarPosition = useWorkstationStore((state) => state.avatarPosition);
  const avatarRotation = useWorkstationStore((state) => state.avatarRotation);
  const isMoving = useWorkstationStore((state) => state.isMoving);

  useFrame((state) => {
    if (!groupRef.current) return;

    groupRef.current.position.set(
      avatarPosition.x,
      avatarPosition.y,
      avatarPosition.z
    );
    groupRef.current.rotation.y = avatarRotation;

    // Bob and lean animations
    const t = state.clock.elapsedTime;
    const bobOffset = isMoving
      ? Math.sin(t * AVATAR_CONFIG.bobFrequency) * AVATAR_CONFIG.bobAmplitude
      : 0;
    const leanAngle = isMoving
      ? Math.sin(t * AVATAR_CONFIG.bobFrequency * 0.5) * AVATAR_CONFIG.leanAngle * 0.3
      : 0;

    const body = groupRef.current.children[0];
    if (body) {
      body.position.y = 0.7 + bobOffset;
      body.rotation.z = leanAngle;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Body */}
      <mesh position={[0, 0.7, 0]} castShadow>
        <capsuleGeometry args={[0.35, 1.0, 8, 16]} />
        <meshStandardMaterial
          color={AVATAR_CONFIG.bodyColor}
          roughness={0.7}
          metalness={0.3}
          emissive={AVATAR_CONFIG.bodyColor}
          emissiveIntensity={isMoving ? 0.1 : 0.02}
        />
      </mesh>

      {/* Head */}
      <mesh position={[0, 1.5, 0]} castShadow>
        <sphereGeometry args={[0.25, 16, 12]} />
        <meshStandardMaterial
          color={AVATAR_CONFIG.headColor}
          roughness={0.5}
          metalness={0.3}
        />
      </mesh>

      {/* Eyes */}
      <group position={[0, 1.55, 0.18]}>
        <mesh position={[-0.08, 0, 0]}>
          <sphereGeometry args={[0.04, 8, 8]} />
          <meshBasicMaterial color={AVATAR_CONFIG.eyeColor} />
        </mesh>
        <mesh position={[0.08, 0, 0]}>
          <sphereGeometry args={[0.04, 8, 8]} />
          <meshBasicMaterial color={AVATAR_CONFIG.eyeColor} />
        </mesh>
      </group>

      {/* Shadow */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <circleGeometry args={[0.4, 16]} />
        <meshBasicMaterial color="#000000" transparent opacity={0.15} />
      </mesh>
    </group>
  );
}

export default Avatar;
