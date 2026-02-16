import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';

/**
 * @file GalleryPostProcessing.tsx
 * @description Post stack: Bloom (emissives), Vignette. Warm golden-hour look for Spirit Oasis.
 */
export function GalleryPostProcessing() {
  return (
    <EffectComposer>
      <Bloom
        luminanceThreshold={0.5}
        luminanceSmoothing={0.3}
        intensity={0.5}
        mipmapBlur
      />
      <Vignette
        offset={0.3}
        darkness={0.4}
      />
    </EffectComposer>
  );
}

export default GalleryPostProcessing;
