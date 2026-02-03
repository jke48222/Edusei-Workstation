import { useRef, useMemo, forwardRef, Suspense } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useWorkstationStore } from '../../store/store';
import { GALLERY_CONFIG } from '../../constants/galleryData';

// Uncomment when you have a character model:
// import { useGLTF, useAnimations } from '@react-three/drei';

/**
 * Avatar configuration
 */
const AVATAR_CONFIG = {
  height: GALLERY_CONFIG.avatar.height,
  radius: GALLERY_CONFIG.avatar.radius,
  
  // Capsule geometry
  capsuleRadiusTop: 0.35,
  capsuleRadiusBottom: 0.35,
  capsuleHeight: 1.0,
  
  // Colors
  bodyColor: '#6366f1',      // Indigo
  headColor: '#818cf8',      // Lighter indigo
  eyeColor: '#ffffff',
  
  // Animation
  bobAmplitude: 0.05,
  bobFrequency: 3,
  leanAngle: 0.15, // Radians to lean when moving
};

interface AvatarProps {
  position?: THREE.Vector3;
  rotation?: number;
  isMoving?: boolean;
}

/**
 * Avatar Component
 * 
 * Currently renders a stylized capsule character.
 * Structured for easy swap to a rigged .glb model later.
 * 
 * To swap to a custom model:
 * 1. Import useGLTF and useAnimations from drei
 * 2. Load your .glb file
 * 3. Replace CapsuleAvatar with your model
 * 4. Wire up animations (idle, walk, run)
 */
export const Avatar = forwardRef<THREE.Group, AvatarProps>(
  function Avatar({ position, rotation = 0, isMoving = false }, ref) {
    const groupRef = useRef<THREE.Group>(null);
    const resolvedRef = (ref as React.RefObject<THREE.Group>) || groupRef;
    
    // Get position from store if not provided via props
    const storePosition = useWorkstationStore((state) => state.avatarPosition);
    const storeRotation = useWorkstationStore((state) => state.avatarRotation);
    const storeIsMoving = useWorkstationStore((state) => state.isMoving);
    
    const finalPosition = position || storePosition;
    const finalRotation = rotation || storeRotation;
    const finalIsMoving = isMoving || storeIsMoving;
    
    // Animation state
    const bobOffset = useRef(0);
    const leanOffset = useRef(0);
    
    useFrame((state) => {
      if (!resolvedRef.current) return;
      
      // Bob animation when moving
      if (finalIsMoving) {
        bobOffset.current = Math.sin(state.clock.elapsedTime * AVATAR_CONFIG.bobFrequency) 
          * AVATAR_CONFIG.bobAmplitude;
        
        // Lean into movement direction
        leanOffset.current = THREE.MathUtils.lerp(
          leanOffset.current,
          AVATAR_CONFIG.leanAngle,
          0.1
        );
      } else {
        bobOffset.current = THREE.MathUtils.lerp(bobOffset.current, 0, 0.1);
        leanOffset.current = THREE.MathUtils.lerp(leanOffset.current, 0, 0.1);
      }
    });
    
    return (
      <group 
        ref={resolvedRef}
        position={[finalPosition.x, finalPosition.y + bobOffset.current, finalPosition.z]}
        rotation={[leanOffset.current, finalRotation, 0]}
      >
        {/* 
          SWAP POINT: Replace CapsuleAvatar with your GLB model
          Example:
          <Suspense fallback={<CapsuleAvatar />}>
            <RiggedCharacter isMoving={finalIsMoving} />
          </Suspense>
        */}
        <CapsuleAvatar isMoving={finalIsMoving} />
        
        {/* Shadow caster */}
        <mesh 
          position={[0, 0.02, 0]} 
          rotation={[-Math.PI / 2, 0, 0]}
          receiveShadow
        >
          <circleGeometry args={[0.5, 32]} />
          <meshBasicMaterial 
            color="#000000" 
            transparent 
            opacity={0.3}
          />
        </mesh>
      </group>
    );
  }
);

/**
 * CapsuleAvatar - Placeholder character
 * A stylized capsule with a head, used until a proper model is available
 */
function CapsuleAvatar({ isMoving }: { isMoving: boolean }) {
  const bodyRef = useRef<THREE.Mesh>(null);
  const headRef = useRef<THREE.Mesh>(null);
  
  // Subtle body animation
  useFrame((state) => {
    if (bodyRef.current && headRef.current) {
      // Subtle breathing animation
      const breathe = Math.sin(state.clock.elapsedTime * 2) * 0.02;
      bodyRef.current.scale.setScalar(1 + breathe);
      
      // Head bob
      headRef.current.position.y = 1.1 + breathe * 2;
    }
  });
  
  // Materials
  const bodyMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: AVATAR_CONFIG.bodyColor,
    metalness: 0.3,
    roughness: 0.7,
    emissive: AVATAR_CONFIG.bodyColor,
    emissiveIntensity: isMoving ? 0.2 : 0.05,
  }), [isMoving]);
  
  const headMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: AVATAR_CONFIG.headColor,
    metalness: 0.3,
    roughness: 0.5,
    emissive: AVATAR_CONFIG.headColor,
    emissiveIntensity: 0.1,
  }), []);
  
  return (
    <group>
      {/* Body - Capsule shape */}
      <mesh ref={bodyRef} position={[0, 0.7, 0]} castShadow>
        <capsuleGeometry args={[
          AVATAR_CONFIG.capsuleRadiusBottom,
          AVATAR_CONFIG.capsuleHeight,
          8,
          16
        ]} />
        <primitive object={bodyMaterial} attach="material" />
      </mesh>
      
      {/* Head - Sphere */}
      <mesh ref={headRef} position={[0, 1.1, 0]} castShadow>
        <sphereGeometry args={[0.25, 16, 16]} />
        <primitive object={headMaterial} attach="material" />
      </mesh>
      
      {/* Eyes */}
      <group position={[0, 1.15, 0.18]}>
        {/* Left eye */}
        <mesh position={[-0.08, 0, 0]}>
          <sphereGeometry args={[0.04, 8, 8]} />
          <meshBasicMaterial color={AVATAR_CONFIG.eyeColor} />
        </mesh>
        {/* Right eye */}
        <mesh position={[0.08, 0, 0]}>
          <sphereGeometry args={[0.04, 8, 8]} />
          <meshBasicMaterial color={AVATAR_CONFIG.eyeColor} />
        </mesh>
      </group>
      
      {/* Glow ring when moving */}
      {isMoving && (
        <mesh position={[0, 0.1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.4, 0.5, 32]} />
          <meshBasicMaterial 
            color={AVATAR_CONFIG.bodyColor}
            transparent
            opacity={0.5}
          />
        </mesh>
      )}
      
      {/* Point light for self-illumination */}
      <pointLight 
        position={[0, 0.8, 0.5]}
        intensity={0.5}
        distance={3}
        color={AVATAR_CONFIG.bodyColor}
      />
    </group>
  );
}

/**
 * TEMPLATE: Rigged Character Component
 * Uncomment and modify when you have a character .glb file
 */
/*
function RiggedCharacter({ isMoving }: { isMoving: boolean }) {
  const group = useRef<THREE.Group>(null);
  
  // Load your character model
  const { scene, animations } = useGLTF('/models/character.glb');
  const { actions, names } = useAnimations(animations, group);
  
  // Play appropriate animation
  useEffect(() => {
    const actionName = isMoving ? 'Walk' : 'Idle';
    const action = actions[actionName];
    
    if (action) {
      // Crossfade to new animation
      action.reset().fadeIn(0.3).play();
      
      return () => {
        action.fadeOut(0.3);
      };
    }
  }, [isMoving, actions]);
  
  return (
    <primitive 
      ref={group}
      object={scene} 
      scale={1}
      rotation={[0, 0, 0]}
    />
  );
}

// Preload the model
useGLTF.preload('/models/character.glb');
*/

export default Avatar;
