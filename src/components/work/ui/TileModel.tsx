/**
 * @file TileModel.tsx
 * @description Lightweight R3F mini-viewer for a project's 3D model. Spins the model in place
 * around its own center (a true turntable), frames it upright to fit, and lets the user drag to
 * rotate when `interactive`. Self-contained lighting (no network HDR) so it works offline and
 * loads fast. Default-exported for React.lazy().
 */

import { Suspense, useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF, OrbitControls, Bounds } from '@react-three/drei';
import { clone as cloneSkeleton } from 'three/examples/jsm/utils/SkeletonUtils.js';
import { Box3, Vector3, type Group } from 'three';

/**
 * Renders the model centered on its own bounding-box center and slowly spins it about the vertical
 * axis *through that center* — a genuine in-place turntable, not a camera orbit around the scene
 * origin (which made off-center models like Capital One swing around like a planet). Centering is
 * done synchronously (here in `useMemo`, not via drei's <Center>, which offsets in a layout effect)
 * so <Bounds> measures an already-centered, stable model and frames it correctly. `delta`-based
 * rotation keeps the speed frame-rate independent.
 */
function Model({
  src,
  rotation,
  speed = 0.4,
}: {
  src: string;
  rotation?: [number, number, number];
  speed?: number;
}) {
  const { scene } = useGLTF(src);
  const spinRef = useRef<Group>(null);

  const { model, center } = useMemo(() => {
    // Deep clone (skeleton-aware) so the same model can render in multiple tiles at once.
    const m = cloneSkeleton(scene);
    if (rotation) m.rotation.set(rotation[0], rotation[1], rotation[2]);
    m.updateMatrixWorld(true);
    const c = new Box3().setFromObject(m).getCenter(new Vector3());
    return { model: m, center: c };
  }, [scene, rotation]);

  useFrame((_, delta) => {
    const g = spinRef.current;
    if (g) g.rotation.y += delta * speed;
  });

  return (
    <group ref={spinRef}>
      <group position={[-center.x, -center.y, -center.z]}>
        <primitive object={model} />
      </group>
    </group>
  );
}

export default function TileModel({
  src,
  interactive = false,
  rotation,
}: {
  src: string;
  interactive?: boolean;
  rotation?: [number, number, number];
}) {
  return (
    <Canvas
      camera={{ position: [2.4, 1.4, 3.4], fov: 38 }}
      dpr={[1, 1.8]}
      gl={{ antialias: true, alpha: true, powerPreference: 'low-power' }}
      style={{ width: '100%', height: '100%' }}
    >
      {/* Studio-ish lighting (no external HDR). */}
      <ambientLight intensity={0.75} />
      <hemisphereLight intensity={0.5} groundColor="#1a1c22" color="#ffffff" />
      <directionalLight position={[5, 8, 5]} intensity={1.5} />
      <directionalLight position={[-5, 3, -4]} intensity={0.5} color="#60a5fa" />
      <Suspense fallback={null}>
        <Bounds fit clip margin={1.15}>
          <Model src={src} rotation={rotation} />
        </Bounds>
      </Suspense>
      <OrbitControls
        makeDefault
        enablePan={false}
        enableZoom={false}
        enableRotate={interactive}
        target={[0, 0, 0]}
        minPolarAngle={Math.PI * 0.30}
        maxPolarAngle={Math.PI * 0.62}
      />
    </Canvas>
  );
}
