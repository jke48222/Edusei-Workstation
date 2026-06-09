/**
 * @file TileModel.tsx
 * @description Lightweight R3F mini-viewer for a project's 3D model. Auto-rotates around the
 * vertical axis, frames the model upright to fit, and lets the user drag to rotate when
 * `interactive`. Self-contained lighting (no network HDR) so it works offline and loads fast.
 * Default-exported for React.lazy().
 */

import { Suspense, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { useGLTF, OrbitControls, Center, Bounds } from '@react-three/drei';
import { clone as cloneSkeleton } from 'three/examples/jsm/utils/SkeletonUtils.js';

function Model({ src, rotation }: { src: string; rotation?: [number, number, number] }) {
  const { scene } = useGLTF(src);
  // Deep clone (skeleton-aware) so the same model can render in multiple tiles at once.
  const model = useMemo(() => cloneSkeleton(scene), [scene]);
  return <primitive object={model} rotation={rotation} />;
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
          <Center>
            <Model src={src} rotation={rotation} />
          </Center>
        </Bounds>
      </Suspense>
      <OrbitControls
        makeDefault
        enablePan={false}
        enableZoom={false}
        enableRotate={interactive}
        autoRotate
        autoRotateSpeed={1.1}
        target={[0, 0, 0]}
        minPolarAngle={Math.PI * 0.30}
        maxPolarAngle={Math.PI * 0.62}
      />
    </Canvas>
  );
}
