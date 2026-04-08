/**
 * @file HeroVideoTitle.tsx
 * @description Video-based hero title with transparent background. Shows an instant
 * text fallback while videos load, and permanently falls back to text on browsers
 * that can't play alpha-channel video (e.g. LinkedIn's in-app browser).
 *
 * Two video layers so we never show a blank frame during theme transitions.
 * 4 videos: black, white, transition-1, transition-2.
 * HEVC (.mov) + VP9 WebM sources per layer; Safari uses HEVC, Chrome/Firefox use WebM.
 */

import { useRef, useEffect, useState, useCallback } from 'react';

export interface HeroVideoTitleProps {
  videoSrc?: string;
  dark?: boolean;
  className?: string;
}

/** How long to wait (ms) before giving up on video playback and sticking with text. */
const VIDEO_READY_TIMEOUT = 3000;

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

  // 'loading' = waiting for first frame, 'playing' = video confirmed working, 'failed' = use text
  const [videoState, setVideoState] = useState<'loading' | 'playing' | 'failed'>('loading');
  const videoStateRef = useRef(videoState);
  videoStateRef.current = videoState;

  const getVideoSources = (baseName: string) => ({
    webm: `/videos/${baseName}.webm`,
    hevc: `/videos/hevc/${baseName}.mov`,
  });

  const setLayerSources = useCallback((video: HTMLVideoElement | null, name: string) => {
    if (!video) return;
    const { webm, hevc } = getVideoSources(name);
    video.innerHTML = '';
    // HEVC alpha (.mov) — Safari / iOS WKWebView
    const hevcSource = document.createElement('source');
    hevcSource.src = hevc;
    hevcSource.type = 'video/mp4; codecs=hvc1';
    // VP9 alpha (.webm) — Chrome, Firefox, Android WebView
    const webmSource = document.createElement('source');
    webmSource.src = webm;
    webmSource.type = 'video/webm; codecs=vp9';
    video.appendChild(hevcSource);
    video.appendChild(webmSource);
    video.load();
  }, []);

  const currentRef = activeLayer === 'A' ? layerARef : layerBRef;
  const inactiveRef = activeLayer === 'A' ? layerBRef : layerARef;

  // Preload transition videos (low priority — defer until after initial paint)
  useEffect(() => {
    const id = requestAnimationFrame(() => {
      const preload = (video: HTMLVideoElement | null, name: string) => {
        if (!video) return;
        const { webm, hevc } = getVideoSources(name);
        video.innerHTML = '';
        const hevcSource = document.createElement('source');
        hevcSource.src = hevc;
        hevcSource.type = 'video/mp4; codecs=hvc1';
        const webmSource = document.createElement('source');
        webmSource.src = webm;
        webmSource.type = 'video/webm; codecs=vp9';
        video.appendChild(hevcSource);
        video.appendChild(webmSource);
        video.preload = 'auto';
        video.load();
      };
      preload(transition1Ref.current, 'jalen-edusei-transition-1');
      preload(transition2Ref.current, 'jalen-edusei-transition-2');
    });
    return () => cancelAnimationFrame(id);
  }, []);

  // First load: show base video on layer A, with timeout fallback
  useEffect(() => {
    if (videoSrcProp) return;
    if (previousDarkRef.current !== null) return;

    previousDarkRef.current = dark;
    const baseName = dark ? 'jalen-edusei-white' : 'jalen-edusei-black';
    const video = layerARef.current;
    setLayerSources(video, baseName);
    setActiveLayer('A');

    // Timeout: if video hasn't produced a frame, fall back to text
    const timeout = setTimeout(() => {
      if (videoStateRef.current === 'loading') setVideoState('failed');
    }, VIDEO_READY_TIMEOUT);

    const onError = () => {
      if (videoStateRef.current === 'loading') setVideoState('failed');
    };

    video?.addEventListener('error', onError);
    // Also listen on source children — some browsers fire error on <source>, not <video>
    const sources = video?.querySelectorAll('source');
    sources?.forEach((s) => s.addEventListener('error', onError));

    return () => {
      clearTimeout(timeout);
      video?.removeEventListener('error', onError);
      sources?.forEach((s) => s.removeEventListener('error', onError));
    };
  }, [dark, videoSrcProp, setLayerSources]);

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
  }, [dark, videoSrcProp, setLayerSources]);

  // Playback, aspect ratio, and "playing" confirmation for the active layer
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
      // Mark video as confirmed working once it actually advances
      if (videoStateRef.current === 'loading' && video.currentTime > 0) {
        setVideoState('playing');
      }
      if (video.duration && video.currentTime >= video.duration - 0.1) {
        video.pause();
        if (video.duration) video.currentTime = video.duration;
      }
    };
    const onPlaying = () => {
      if (videoStateRef.current === 'loading') setVideoState('playing');
    };

    video.addEventListener('loadedmetadata', onMeta);
    video.addEventListener('ended', onEnded);
    video.addEventListener('timeupdate', onTime);
    video.addEventListener('playing', onPlaying);

    const tryPlay = () => {
      video.play().catch(() => {
        // Autoplay blocked or codec unsupported — fall back to text
        if (videoStateRef.current === 'loading') setVideoState('failed');
      });
    };

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

  const showVideo = videoState === 'playing';
  const showFallback = videoState !== 'playing';

  return (
    <div className={`relative w-full pointer-events-none overflow-hidden ${className}`.trim()} style={containerStyle}>
      {/* Instant text fallback — visible until video plays, permanent if video fails */}
      {showFallback && (
        <div
          className="absolute inset-0 flex items-end"
          style={{
            transition: 'opacity 0.3s ease-out',
            opacity: showVideo ? 0 : 1,
            pointerEvents: 'none',
          }}
        >
          <span
            className="block leading-[0.85] font-bold tracking-tight"
            style={{
              fontSize: 'clamp(3.5rem, 14vw, 12rem)',
              color: dark ? '#fff' : '#000',
            }}
          >
            JALEN<br />EDUSEI
          </span>
        </div>
      )}

      <video
        ref={layerARef}
        className="absolute inset-0 w-full h-full"
        style={{
          ...videoStyle,
          opacity: showVideo && activeLayer === 'A' ? 1 : 0,
          transition: 'opacity 0.3s ease-out',
          pointerEvents: 'none',
        }}
        playsInline
        muted
        preload="auto"
        loop={false}
        aria-hidden="true"
      />
      <video
        ref={layerBRef}
        className="absolute inset-0 w-full h-full"
        style={{
          ...videoStyle,
          opacity: showVideo && activeLayer === 'B' ? 1 : 0,
          transition: 'opacity 0.3s ease-out',
          pointerEvents: 'none',
        }}
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
