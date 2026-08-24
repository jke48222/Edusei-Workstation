import { Suspense, useEffect, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { Center, Environment, OrbitControls, useGLTF } from '@react-three/drei';
import type { ViewState } from '../../store/store';

/**
 * Standalone 3D custom editor: renders one project's model as the contents of
 * its file, VS Code 3D-preview style. Loaded lazily so three.js stays out of
 * the IDE's initial bundle and a model is only fetched when its file opens.
 */

interface ModelConfig {
  url: string;
  scale: number;
  rotation: [number, number, number];
  /** Camera distance tuned per model so each one fills the viewport nicely. */
  distance: number;
}

const MODEL_CONFIG: Partial<Record<ViewState, ModelConfig>> = {
  'audio-tracking-car': { url: '/models/robot_car.glb', scale: 0.012, rotation: [Math.PI / 2, 0, 0], distance: 4.4 },
  animaldot: { url: '/models/sleeping_dog.glb', scale: 0.6, rotation: [0, 0, 0], distance: 4.4 },
  'kitchen-chaos-vr': { url: '/models/quest3.glb', scale: 6, rotation: [0, 0, 0], distance: 4.2 },
  memesat: { url: '/models/satellite.glb', scale: 0.5, rotation: [Math.PI / 2, 0, 0], distance: 4.6 },
  'capital-one': { url: '/models/capital_one.glb', scale: 8.0, rotation: [0, 0, 0], distance: 4.4 },
};

function Model({ config, onReady }: { config: ModelConfig; onReady: () => void }) {
  const { scene } = useGLTF(config.url);
  // Clone once per loaded scene: a fresh clone every render hands <primitive> a
  // new object identity, forcing R3F to tear down and remount the subtree.
  const cloned = useMemo(() => scene.clone(), [scene]);

  useEffect(() => {
    onReady();
  }, [onReady]);

  return (
    <Center>
      <primitive object={cloned} scale={config.scale} rotation={config.rotation} />
    </Center>
  );
}

export interface ModelViewerProps {
  id: ViewState;
  accent: string;
  isDark: boolean;
  reducedMotion: boolean;
  onReady: () => void;
}

export default function ModelViewer({ id, accent, isDark, reducedMotion, onReady }: ModelViewerProps) {
  const config = MODEL_CONFIG[id];
  if (!config) return null;

  return (
    <Canvas
      camera={{ fov: 38, near: 0.1, far: 100, position: [0, 0.5, config.distance] }}
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      style={{ cursor: 'grab', touchAction: 'none' }}
      frameloop={reducedMotion ? 'demand' : 'always'}
    >
      {/* Self-hosted HDR so materials read well without any external fetch. */}
      <Suspense fallback={null}>
        <Environment files="/textures/dikhololo_night_1k.hdr" environmentIntensity={isDark ? 1 : 0.75} />
      </Suspense>

      <ambientLight intensity={isDark ? 0.4 : 0.75} />
      <directionalLight position={[4, 6, 4]} intensity={isDark ? 1.1 : 1.35} />
      <directionalLight position={[-5, 2, -3]} intensity={0.35} />
      <pointLight position={[0, -1.2, 2]} intensity={0.5} color={accent} distance={8} />

      <Suspense fallback={null}>
        <Model config={config} onReady={onReady} />
      </Suspense>

      <OrbitControls
        makeDefault
        enablePan={false}
        enableZoom
        minDistance={1.4}
        maxDistance={7}
        minPolarAngle={0.25}
        maxPolarAngle={Math.PI - 0.45}
        autoRotate={!reducedMotion}
        autoRotateSpeed={0.9}
      />
    </Canvas>
  );
}
