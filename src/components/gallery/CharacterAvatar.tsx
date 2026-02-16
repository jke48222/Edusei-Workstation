import { useRef, useEffect } from 'react';
import { useFrame, useLoader } from '@react-three/fiber';
import * as THREE from 'three';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';
import { useTexture } from '@react-three/drei';
import { useWorkstationStore } from '../../store/store';

/**
 * @file CharacterAvatar.tsx
 * @description FBX rigged character: IdleCharacter.fbx, Walking.fbx, Zuko textures. Store-driven position/rotation/action.
 */
export function CharacterAvatar() {
  const groupRef = useRef<THREE.Group>(null);
  const mixerRef = useRef<THREE.AnimationMixer | null>(null);
  const actionsRef = useRef<Record<string, THREE.AnimationAction>>({});
  const currentAction = useRef<string>('idle');

  const avatarPosition = useWorkstationStore((state) => state.avatarPosition);
  const avatarRotation = useWorkstationStore((state) => state.avatarRotation);
  const isMoving = useWorkstationStore((state) => state.isMoving);

  const characterModel = useLoader(FBXLoader, '/models/character/IdleCharacter.fbx');
  const walkingAnim = useLoader(FBXLoader, '/models/character/Walking.fbx');

  // Load the Zuko textures
  const bodyTexture = useTexture('/models/character/Zuko_B_d.png');
  const headTexture = useTexture('/models/character/Zuko_H_d.png');

  useEffect(() => {
    if (!characterModel) return;

    // Scale — Mixamo FBX is in cm, so 0.01 = 1m human height roughly
    // Increase to 0.022 for better visibility in the scene
    characterModel.scale.setScalar(0.022);

    // Flip textures for correct UV mapping
    bodyTexture.flipY = false;
    headTexture.flipY = false;

    // Apply Zuko textures to the character meshes
    characterModel.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.castShadow = true;
        child.receiveShadow = true;

        if (child.material) {
          const mat = child.material as THREE.MeshStandardMaterial;
          // Apply body texture to most meshes, head texture to head-like meshes
          const meshName = child.name.toLowerCase();
          if (meshName.includes('head') || meshName.includes('face') || meshName.includes('hair')) {
            mat.map = headTexture;
          } else {
            mat.map = bodyTexture;
          }
          mat.roughness = 0.65;
          mat.metalness = 0.05;
          mat.needsUpdate = true;
        }
      }
    });

    // Create animation mixer
    const mixer = new THREE.AnimationMixer(characterModel);
    mixerRef.current = mixer;

    // Idle animation from the character model itself
    if (characterModel.animations.length > 0) {
      const idleClip = characterModel.animations[0];
      const idleAction = mixer.clipAction(idleClip);
      actionsRef.current['idle'] = idleAction;
      idleAction.play();
    }

    // Walking animation
    if (walkingAnim?.animations?.length > 0) {
      const walkClip = walkingAnim.animations[0];
      const walkAction = mixer.clipAction(walkClip);
      actionsRef.current['walk'] = walkAction;
    }

    return () => {
      mixer.stopAllAction();
    };
  }, [characterModel, walkingAnim, bodyTexture, headTexture]);

  // Blend animations based on movement
  useEffect(() => {
    const targetAction = isMoving ? 'walk' : 'idle';
    if (targetAction === currentAction.current) return;

    const prevAction = actionsRef.current[currentAction.current];
    const nextAction = actionsRef.current[targetAction];

    if (prevAction && nextAction) {
      nextAction.reset();
      nextAction.play();
      nextAction.crossFadeFrom(prevAction, 0.3, true);
    }

    currentAction.current = targetAction;
  }, [isMoving]);

  // Update animation mixer and transform
  useFrame((_, delta) => {
    if (mixerRef.current) {
      mixerRef.current.update(Math.min(delta, 0.1));
    }

    if (groupRef.current) {
      groupRef.current.position.set(
        avatarPosition.x,
        avatarPosition.y,
        avatarPosition.z
      );
      groupRef.current.rotation.y = avatarRotation;
    }
  });

  return (
    <group ref={groupRef}>
      <primitive object={characterModel} />
      {/* Shadow beneath character */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <circleGeometry args={[0.5, 16]} />
        <meshBasicMaterial color="#000000" transparent opacity={0.2} />
      </mesh>
    </group>
  );
}

export default CharacterAvatar;
