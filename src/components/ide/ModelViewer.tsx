import { Suspense, useEffect, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { Center, Environment, OrbitControls, useGLTF } from '@react-three/drei';
import { Box3, Vector3 } from 'three';
import { modelUrlFor } from './projectModels';

/**
 * Standalone 3D custom editor: renders one project's model as the contents of
 * its file, VS Code 3D-preview style. Loaded lazily so three.js stays out of
 * the IDE's initial bundle and a model is only fetched when its file opens.
 *
 * Tuning is keyed by GLB path, not by project, because several projects share
 * a model (the three VR builds all show the Quest 3). A model with no entry
 * below is auto-fitted from its bounding box, so dropping a new .glb into
 * /public/models and pointing a project at it just works.
 */

interface ModelTuning {
  scale: number;
  rotation: [number, number, number];
  /** Camera distance tuned per model so each one fills the viewport nicely. */
  distance: number;
}

const MODEL_TUNING: Record<string, ModelTuning> = {
  '/models/robot_car.glb': { scale: 0.012, rotation: [Math.PI / 2, 0, 0], distance: 4.4 },
  '/models/sleeping_dog.glb': { scale: 0.6, rotation: [0, 0, 0], distance: 4.4 },
  '/models/quest3.glb': { scale: 6, rotation: [0, 0, 0], distance: 4.2 },
  '/models/satellite.glb': { scale: 0.5, rotation: [Math.PI / 2, 0, 0], distance: 4.6 },
  '/models/capital_one.glb': { scale: 8.0, rotation: [0, 0, 0], distance: 4.4 },
  '/models/raspberry_pi_3.glb': { scale: 0.9, rotation: [0, 0, 0], distance: 4.4 },
};

const DEFAULT_DISTANCE = 4.4;
/** Target size, in world units, that an auto-fitted model is scaled to fill. */
const AUTOFIT_SIZE = 2.2;

function Model({ url, tuning, onReady }: { url: string; tuning?: ModelTuning; onReady: () => void }) {
  const { scene } = useGLTF(url);
  // Clone once per loaded scene: a fresh clone every render hands <primitive> a
  // new object identity, forcing R3F to tear down and remount the subtree.
  const cloned = useMemo(() => scene.clone(), [scene]);

  // Untuned models are normalized by their bounding box so an unknown .glb
  // arrives at a sane size instead of a speck or a wall.
  const scale = useMemo(() => {
    if (tuning) return tuning.scale;
    const size = new Box3().setFromObject(cloned).getSize(new Vector3());
    const largest = Math.max(size.x, size.y, size.z);
    return largest > 0 ? AUTOFIT_SIZE / largest : 1;
  }, [cloned, tuning]);

  useEffect(() => {
    onReady();
  }, [onReady]);

  return (
    <Center>
      <primitive object={cloned} scale={scale} rotation={tuning?.rotation ?? [0, 0, 0]} />
    </Center>
  );
}

export interface ModelViewerProps {
  id: string;
  accent: string;
  isDark: boolean;
  reducedMotion: boolean;
  onReady: () => void;
}

export default function ModelViewer({ id, accent, isDark, reducedMotion, onReady }: ModelViewerProps) {
  const url = modelUrlFor(id);
  if (!url) return null;
  const tuning = MODEL_TUNING[url];
  const config = { distance: tuning?.distance ?? DEFAULT_DISTANCE };

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
        <Model url={url} tuning={tuning} onReady={onReady} />
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
