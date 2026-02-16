import { useRef, useEffect, useCallback } from 'react';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useIsInGallery } from '../../store/store';

/**
 * @file SpatialAudioManager.tsx
 * @description Ambient audio in gallery: wind, birds, music. Refs for mutable state to avoid re-render loops.
 */
const AUDIO_FILES = {
  wind: '/audio/freesound_community-a-gentle-breeze-wind-2-76065.mp3',
  birds: '/audio/soul_serenity_sounds-birds-chirping-241045.mp3',
  ambient: '/audio/krnbeatz-tectonic-passage-418836.mp3',
};

export function SpatialAudioManager() {
  const isInGallery = useIsInGallery();
  const { camera } = useThree();
  const listenerRef = useRef<THREE.AudioListener | null>(null);
  const audioRef = useRef<Record<string, THREE.Audio>>({});
  const initializedRef = useRef(false);
  const loaderRef = useRef<THREE.AudioLoader | null>(null);

  const loadGlobalAudio = useCallback((
    name: string,
    url: string,
    listener: THREE.AudioListener,
    volume: number,
    loop: boolean
  ) => {
    if (!loaderRef.current) return;
    const audio = new THREE.Audio(listener);
    audioRef.current[name] = audio;

    loaderRef.current.load(
      url,
      (buffer) => {
        if (audio.context.state === 'closed') return;
        audio.setBuffer(buffer);
        audio.setVolume(volume);
        audio.setLoop(loop);
        audio.play();
      },
      undefined,
      (err) => {
        console.warn(`[Audio] Failed to load ${name}:`, err);
      }
    );
  }, []);

  useEffect(() => {
    if (!isInGallery) return;

    const initAudio = () => {
      if (initializedRef.current) return;
      initializedRef.current = true;

      const listener = new THREE.AudioListener();
      camera.add(listener);
      listenerRef.current = listener;
      loaderRef.current = new THREE.AudioLoader();

      loadGlobalAudio('wind', AUDIO_FILES.wind, listener, 0.12, true);
      loadGlobalAudio('ambient', AUDIO_FILES.ambient, listener, 0.06, true);
      loadGlobalAudio('birds', AUDIO_FILES.birds, listener, 0.05, true);
    };

    const handleInteraction = () => {
      initAudio();
      window.removeEventListener('click', handleInteraction);
      window.removeEventListener('keydown', handleInteraction);
    };

    window.addEventListener('click', handleInteraction);
    window.addEventListener('keydown', handleInteraction);

    return () => {
      window.removeEventListener('click', handleInteraction);
      window.removeEventListener('keydown', handleInteraction);

      Object.values(audioRef.current).forEach((audio) => {
        try {
          if (audio.isPlaying) audio.stop();
          audio.disconnect();
        } catch {
          // Audio context might already be closed
        }
      });
      audioRef.current = {};

      if (listenerRef.current) {
        camera.remove(listenerRef.current);
        listenerRef.current = null;
      }
      initializedRef.current = false;
    };
  }, [isInGallery, camera, loadGlobalAudio]);

  return null;
}

export default SpatialAudioManager;
