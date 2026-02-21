/**
 * @file HeroVideoTitle.tsx
 * @description Video-based hero title with transparent background. Same behavior on desktop
 * and mobile: two video layers so we never show a blank frame — the current layer stays
 * visible until the other has decoded. 4 videos: black, white, transition-1, transition-2.
 * HEVC + WebM sources per layer; Safari uses HEVC, desktop browsers use WebM.
 */

import { useRef, useEffect, useState } from 'react';

export interface HeroVideoTitleProps {
  videoSrc?: string;
  dark?: boolean;
  className?: string;
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

  const getVideoSources = (baseName: string) => ({
    webm: `/videos/${baseName}.webm`,
    hevc: `/videos/hevc/${baseName}.mov`,
  });

  const setLayerSources = (video: HTMLVideoElement | null, name: string) => {
    if (!video) return;
    const { webm, hevc } = getVideoSources(name);
    video.innerHTML = '';
    const hevcSource = document.createElement('source');
    hevcSource.src = hevc;
    hevcSource.type = 'video/quicktime; codecs=hvc1.1.6.H120.b0';
    const webmSource = document.createElement('source');
    webmSource.src = webm;
    webmSource.type = 'video/webm; codecs=vp09.00.41.08';
    video.appendChild(hevcSource);
    video.appendChild(webmSource);
    video.load();
  };

  const currentRef = activeLayer === 'A' ? layerARef : layerBRef;
  const inactiveRef = activeLayer === 'A' ? layerBRef : layerARef;

  // Preload transition videos in hidden elements
  useEffect(() => {
    const preload = (video: HTMLVideoElement | null, name: string) => {
      if (!video) return;
      const { webm, hevc } = getVideoSources(name);
      const hevcSource = document.createElement('source');
      hevcSource.src = hevc;
      hevcSource.type = 'video/quicktime; codecs=hvc1.1.6.H120.b0';
      const webmSource = document.createElement('source');
      webmSource.src = webm;
      webmSource.type = 'video/webm; codecs=vp09.00.41.08';
      video.innerHTML = '';
      video.appendChild(hevcSource);
      video.appendChild(webmSource);
      video.preload = 'auto';
      video.load();
    };
    preload(transition1Ref.current, 'jalen-edusei-transition-1');
    preload(transition2Ref.current, 'jalen-edusei-transition-2');
  }, []);

  // First load: show base video on layer A
  useEffect(() => {
    if (videoSrcProp) return;
    if (previousDarkRef.current !== null) return;

    previousDarkRef.current = dark;
    const baseName = dark ? 'jalen-edusei-white' : 'jalen-edusei-black';
    setLayerSources(layerARef.current, baseName);
    setActiveLayer('A');
  }, [dark, videoSrcProp]);

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
    setLayerSources(inactive, transitionName);

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
  }, [dark, videoSrcProp]);

  // Playback and aspect ratio for the active layer
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

    video.addEventListener('loadedmetadata', onMeta);
    video.addEventListener('ended', onEnded);
    video.addEventListener('timeupdate', onTime);

    if (video.readyState >= 2) video.play().catch(() => {});
    else video.addEventListener('canplay', () => video.play().catch(() => {}), { once: true });

    return () => {
      video.removeEventListener('loadedmetadata', onMeta);
      video.removeEventListener('ended', onEnded);
      video.removeEventListener('timeupdate', onTime);
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

  return (
    <div className={`relative w-full pointer-events-none overflow-hidden ${className}`.trim()} style={containerStyle}>
      <video
        ref={layerARef}
        className="absolute inset-0 w-full h-full"
        style={{ ...videoStyle, opacity: activeLayer === 'A' ? 1 : 0, pointerEvents: 'none' }}
        playsInline
        muted
        preload="auto"
        loop={false}
        aria-hidden="true"
      />
      <video
        ref={layerBRef}
        className="absolute inset-0 w-full h-full"
        style={{ ...videoStyle, opacity: activeLayer === 'B' ? 1 : 0, pointerEvents: 'none' }}
        playsInline
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
