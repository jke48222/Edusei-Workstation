/**
 * @file HeroVideoTitle.tsx
 * @description Video-based hero title with transparent background. Two video layers
 * so we never show a blank frame during theme transitions.
 *
 * Source priority per <video> element:
 *   1. HEVC alpha (.mov)  — Safari / iOS WKWebView
 *   2. VP9  alpha (.webm) — Chrome, Firefox, Android WebView
 *   3. H.264      (.mp4)  — universal fallback (no alpha; uses mix-blend-mode)
 *
 * The H.264 fallback uses mix-blend-mode so the solid background blends away:
 *   dark  -> white text on black bg with screen  (black disappears)
 *   light -> black text on white bg with multiply (white disappears)
 */

import { useRef, useEffect, useState, useCallback } from 'react';

export interface HeroVideoTitleProps {
  videoSrc?: string;
  dark?: boolean;
  className?: string;
}

function h264Name(baseName: string, isDark: boolean): string {
  if (baseName === 'jalen-edusei-black') return 'h264/jalen-edusei-black';
  if (baseName === 'jalen-edusei-white') return 'h264/jalen-edusei-white';
  if (baseName === 'jalen-edusei-transition-1')
    return isDark ? 'h264/jalen-edusei-transition-1' : 'h264/jalen-edusei-transition-1-inv';
  if (baseName === 'jalen-edusei-transition-2')
    return isDark ? 'h264/jalen-edusei-transition-2' : 'h264/jalen-edusei-transition-2-inv';
  return `h264/${baseName}`;
}

export function HeroVideoTitle({
  dark = false,
  className = '',
  videoSrc: videoSrcProp,
}: HeroVideoTitleProps) {
  const layerARef = useRef<HTMLVideoElement>(null);
  const layerBRef = useRef<HTMLVideoElement>(null);
  const transition1Ref = useRef<HTMLVideoElement>(null);
  const transition2Ref = useRef<HTMLVideoElement>(null);
  const [activeLayer, setActiveLayer] = useState<'A' | 'B'>('A');
  const [aspectRatio, setAspectRatio] = useState<number | null>(null);
  const previousDarkRef = useRef<boolean | null>(null);
  const [usingFallback, setUsingFallback] = useState(false);
  const darkRef = useRef(dark);
  darkRef.current = dark;

  const addSources = useCallback((video: HTMLVideoElement | null, baseName: string) => {
    if (!video) return;
    video.innerHTML = '';

    // 1. HEVC alpha — Safari / iOS
    const hevc = document.createElement('source');
    hevc.src = `/videos/hevc/${baseName}.mov`;
    hevc.type = 'video/mp4; codecs=hvc1';
    video.appendChild(hevc);

    // 2. VP9 alpha — Chrome / Firefox / Android
    const webm = document.createElement('source');
    webm.src = `/videos/${baseName}.webm`;
    webm.type = 'video/webm; codecs=vp9';
    video.appendChild(webm);

    // 3. H.264 — universal fallback (no alpha)
    const mp4 = document.createElement('source');
    mp4.src = `/videos/${h264Name(baseName, darkRef.current)}.mp4`;
    mp4.type = 'video/mp4; codecs=avc1.42E01E';
    video.appendChild(mp4);

    video.load();
  }, []);

  const currentRef = activeLayer === 'A' ? layerARef : layerBRef;
  const inactiveRef = activeLayer === 'A' ? layerBRef : layerARef;

  // Preload transition videos — deferred so they don't compete with the initial video
  useEffect(() => {
    const id = requestAnimationFrame(() => {
      const preload = (video: HTMLVideoElement | null, baseName: string) => {
        if (!video) return;
        addSources(video, baseName);
        video.preload = 'auto';
      };
      preload(transition1Ref.current, 'jalen-edusei-transition-1');
      preload(transition2Ref.current, 'jalen-edusei-transition-2');
    });
    return () => cancelAnimationFrame(id);
  }, [addSources]);

  // First load: show base video on layer A
  useEffect(() => {
    if (videoSrcProp) return;
    if (previousDarkRef.current !== null) return;

    previousDarkRef.current = dark;
    const baseName = dark ? 'jalen-edusei-white' : 'jalen-edusei-black';
    addSources(layerARef.current, baseName);
    setActiveLayer('A');
  }, [dark, videoSrcProp, addSources]);

  // Theme change: load transition into inactive layer; when it has a frame, swap
  useEffect(() => {
    if (videoSrcProp) return;
    if (previousDarkRef.current === null) return;
    if (previousDarkRef.current === dark) return;

    const transitionName = dark ? 'jalen-edusei-transition-1' : 'jalen-edusei-transition-2';
    previousDarkRef.current = dark;

    const current = currentRef.current;
    const inactive = inactiveRef.current;
    if (!current || !inactive) return;

    current.pause();
    addSources(inactive, transitionName);

    const onReady = () => {
      setActiveLayer((prev) => (prev === 'A' ? 'B' : 'A'));
      inactive.currentTime = 0;
      inactive.play().catch(() => {});
    };

    if (inactive.readyState >= 2) {
      onReady();
    } else {
      inactive.addEventListener('loadeddata', onReady, { once: true });
    }

    return () => inactive.removeEventListener('loadeddata', onReady);
  }, [dark, videoSrcProp, addSources]);

  // Playback, aspect ratio, and fallback detection for the active layer
  useEffect(() => {
    const video = currentRef.current;
    if (!video) return;

    const onMeta = () => {
      if (video.videoWidth > 0 && video.videoHeight > 0) setAspectRatio(video.videoWidth / video.videoHeight);
    };
    const onEnded = () => {
      video.pause();
      if (video.duration) video.currentTime = video.duration;
    };
    const onTime = () => {
      if (video.duration && video.currentTime >= video.duration - 0.1) {
        video.pause();
        if (video.duration) video.currentTime = video.duration;
      }
    };
    const onPlaying = () => {
      setUsingFallback(video.currentSrc.includes('/h264/'));
    };

    video.addEventListener('loadedmetadata', onMeta);
    video.addEventListener('ended', onEnded);
    video.addEventListener('timeupdate', onTime);
    video.addEventListener('playing', onPlaying);

    const tryPlay = () => { video.play().catch(() => {}); };
    if (video.readyState >= 2) tryPlay();
    else video.addEventListener('canplay', tryPlay, { once: true });

    return () => {
      video.removeEventListener('loadedmetadata', onMeta);
      video.removeEventListener('ended', onEnded);
      video.removeEventListener('timeupdate', onTime);
      video.removeEventListener('playing', onPlaying);
    };
  }, [activeLayer]);

  const containerStyle: React.CSSProperties = {
    maxWidth: '100%',
    width: '100%',
    minWidth: 0,
    boxSizing: 'border-box',
  };
  if (aspectRatio) {
    containerStyle.aspectRatio = aspectRatio;
    containerStyle.height = 'auto';
  } else {
    containerStyle.height = 'clamp(12rem, min(60vw, 100vh * 0.5), 55rem)';
  }

  const videoStyle: React.CSSProperties = {
    display: 'block',
    width: '100%',
    height: '100%',
    maxWidth: '100%',
    maxHeight: '100%',
    minWidth: 0,
    minHeight: 0,
    objectFit: 'cover',
    objectPosition: 'left center',
    boxSizing: 'border-box',
  };

  // H.264 fallback: blend away the solid bg (screen for dark, multiply for light)
  const blendMode = usingFallback ? (dark ? 'screen' : 'multiply') : undefined;

  return (
    <div className={`relative w-full pointer-events-none overflow-hidden ${className}`.trim()} style={containerStyle}>
      <video
        ref={layerARef}
        className="absolute inset-0 w-full h-full"
        style={{ ...videoStyle, opacity: activeLayer === 'A' ? 1 : 0, mixBlendMode: blendMode, pointerEvents: 'none' }}
        playsInline
        autoPlay
        muted
        preload="auto"
        loop={false}
        aria-hidden="true"
      />
      <video
        ref={layerBRef}
        className="absolute inset-0 w-full h-full"
        style={{ ...videoStyle, opacity: activeLayer === 'B' ? 1 : 0, mixBlendMode: blendMode, pointerEvents: 'none' }}
        playsInline
        autoPlay
        muted
        preload="auto"
        loop={false}
        aria-hidden="true"
      />
      <video ref={transition1Ref} style={{ display: 'none' }} preload="auto" muted playsInline aria-hidden="true" />
      <video ref={transition2Ref} style={{ display: 'none' }} preload="auto" muted playsInline aria-hidden="true" />
    </div>
  );
}
