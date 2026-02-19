/**
 * @file HeroVideoTitle.tsx
 * @description Video-based hero title component that displays an animated video
 * with transparent background for the "JALEN EDUSEI" title. Shows base video on first
 * visit/refresh, then uses transition videos when switching between light/dark modes.
 */

import { useRef, useEffect, useState } from 'react';

export interface HeroVideoTitleProps {
  /** Optional custom video source path. If not provided, defaults to theme-based selection. */
  videoSrc?: string;
  /** Whether dark mode is active. Determines which video variant to load. */
  dark?: boolean;
  /** Optional CSS class names to apply to the container element. */
  className?: string;
}

/**
 * HeroVideoTitle Component
 * 
 * Renders a video element that plays an animated title sequence. The component
 * automatically manages video playback, aspect ratio calculation, and responsive
 * sizing to ensure the video fills the container width while maintaining its
 * aspect ratio to prevent cropping.
 * 
 * Behavior:
 * - First visit/refresh/page switch: Shows base video (black or white)
 * - Theme switch: Plays transition video, then stays on last frame
 */
export function HeroVideoTitle({ 
  videoSrc, 
  dark = false, 
  className = '' 
}: HeroVideoTitleProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const transition1Ref = useRef<HTMLVideoElement>(null);
  const transition2Ref = useRef<HTMLVideoElement>(null);
  const [aspectRatio, setAspectRatio] = useState<number | null>(null);
  const previousDarkRef = useRef<boolean | null>(null);
  const [currentVideoSrc, setCurrentVideoSrc] = useState<string>('');
  const [currentHevcSrc, setCurrentHevcSrc] = useState<string | null>(null);
  const [isTransitioning, setIsTransitioning] = useState<boolean>(false);
  
  // Helper function to get video sources (WebM and optional HEVC)
  const getVideoSources = (baseName: string) => {
    const webmSrc = `/videos/${baseName}.webm`;
    const hevcSrc = `/videos/hevc/${baseName}.mov`;
    return { webm: webmSrc, hevc: hevcSrc };
  };
  
  // Preload transition videos on mount to eliminate delay when switching themes
  useEffect(() => {
    const transition1 = transition1Ref.current;
    const transition2 = transition2Ref.current;
    
    if (transition1) {
      // Try HEVC first, fallback to WebM
      const hevcSrc = '/videos/hevc/jalen-edusei-transition-1.mov';
      const webmSrc = '/videos/jalen-edusei-transition-1.webm';
      transition1.src = hevcSrc;
      transition1.preload = 'auto';
      transition1.load();
      // If HEVC fails to load, fallback to WebM
      transition1.addEventListener('error', () => {
        transition1.src = webmSrc;
        transition1.load();
      }, { once: true });
    }
    
    if (transition2) {
      const hevcSrc = '/videos/hevc/jalen-edusei-transition-2.mov';
      const webmSrc = '/videos/jalen-edusei-transition-2.webm';
      transition2.src = hevcSrc;
      transition2.preload = 'auto';
      transition2.load();
      transition2.addEventListener('error', () => {
        transition2.src = webmSrc;
        transition2.load();
      }, { once: true });
    }
  }, []);
  
  // Determine video source based on state
  useEffect(() => {
    // If custom video source is provided, use it
    if (videoSrc) {
      setCurrentVideoSrc(videoSrc);
      setCurrentHevcSrc(null);
      return;
    }

    // Check if this is the first load (no previous dark state)
    const isFirstLoad = previousDarkRef.current === null;
    
    if (isFirstLoad) {
      // First visit/refresh/page switch: show base video
      const baseName = dark ? 'jalen-edusei-white' : 'jalen-edusei-black';
      const sources = getVideoSources(baseName);
      setCurrentVideoSrc(sources.webm);
      setCurrentHevcSrc(sources.hevc);
    } else if (previousDarkRef.current !== dark) {
      // Theme changed: use transition video (preloaded for instant playback)
      const transitionName = dark ? 'jalen-edusei-transition-1' : 'jalen-edusei-transition-2';
      const sources = getVideoSources(transitionName);
      setIsTransitioning(true);
      setCurrentVideoSrc(sources.webm);
      setCurrentHevcSrc(sources.hevc);
      // Reset transition state after a brief delay
      setTimeout(() => setIsTransitioning(false), 100);
    }
    // If theme hasn't changed, keep current video (don't update state)
    
    // Update previous dark state
    previousDarkRef.current = dark;
  }, [dark, videoSrc]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !currentVideoSrc) return;

    // When using <source> tags, React will update them automatically
    // We just need to reload the video when sources change
    const isTransition = currentVideoSrc.includes('transition');
    
    // Reload video to pick up new source tags
    video.load();

    // Calculate and store aspect ratio when video metadata loads
    const handleLoadedMetadata = () => {
      const v = videoRef.current;
      if (!v) return;
      if (v.videoWidth > 0 && v.videoHeight > 0) {
        setAspectRatio(v.videoWidth / v.videoHeight);
      }
    };

    // Optimize playback for transition videos - use canplaythrough for smoother start
    const handleCanPlay = () => {
      const v = videoRef.current;
      if (!v) return;
      v.play().catch((err) => {
        console.warn('Video autoplay prevented:', err);
      });
    };
    
    // Handle video end: stay on last frame (never loop)
    const handleEnded = () => {
      const v = videoRef.current;
      if (!v) return;
      v.pause();
      if (v.duration) {
        v.currentTime = v.duration;
      }
    };

    // Handle time update to ensure we stay on last frame when video ends
    const handleTimeUpdate = () => {
      const v = videoRef.current;
      if (!v) return;
      if (v.duration && v.currentTime >= v.duration - 0.1) {
        v.pause();
        v.currentTime = v.duration;
      }
    };

    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('ended', handleEnded);
    video.addEventListener('timeupdate', handleTimeUpdate);
    
    if (isTransition) {
      // For transition videos, wait for enough data to play smoothly
      video.addEventListener('canplaythrough', handleCanPlay, { once: true });
      // Also try immediate play if already buffered
      if (video.readyState >= 3) {
        video.play().catch((err) => {
          console.warn('Video autoplay prevented:', err);
        });
      }
    } else {
      // Base videos can play immediately
      video.play().catch((err) => {
        console.warn('Video autoplay prevented:', err);
      });
    }
    
    return () => {
      const v = videoRef.current;
      if (!v) return;
      v.removeEventListener('canplaythrough', handleCanPlay);
      v.removeEventListener('ended', handleEnded);
      v.removeEventListener('timeupdate', handleTimeUpdate);
      v.removeEventListener('loadedmetadata', handleLoadedMetadata);
    };
  }, [currentVideoSrc, currentHevcSrc]);

  // Calculate container dimensions based on video aspect ratio to prevent cropping
  const containerStyle: React.CSSProperties = {
    maxWidth: '100%',
    width: '100%',
    minWidth: 0,
    boxSizing: 'border-box'
  };

  if (aspectRatio) {
    // Use CSS aspect-ratio property to maintain video proportions while filling width
    containerStyle.aspectRatio = aspectRatio;
    containerStyle.height = 'auto';
  } else {
    // Fallback height calculation while video metadata is loading
    containerStyle.height = 'clamp(12rem, min(60vw, 100vh * 0.5), 55rem)';
  }

  return (
    <div
      className={`relative w-full pointer-events-none overflow-hidden ${className}`.trim()}
      style={containerStyle}
    >
      {/* Main visible video with dual-source support (HEVC for Safari, WebM for others) */}
      <video
        ref={videoRef}
        className="w-full h-full transition-opacity duration-200 ease-in-out"
        style={{ 
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
          opacity: isTransitioning ? 0.95 : 1
        }}
        playsInline
        muted
        preload="auto"
        loop={false}
        aria-hidden="true"
      >
        {/* HEVC source for Safari (must be first) */}
        {currentHevcSrc && (
          <source 
            src={currentHevcSrc} 
            type="video/quicktime; codecs=hvc1.1.6.H120.b0" 
          />
        )}
        {/* WebM source for Chrome/Firefox/Edge */}
        <source 
          src={currentVideoSrc} 
          type="video/webm; codecs=vp09.00.41.08" 
        />
      </video>
      
      {/* Hidden preloaded transition videos for instant playback */}
      <video
        ref={transition1Ref}
        style={{ display: 'none' }}
        preload="auto"
        muted
        playsInline
        aria-hidden="true"
      />
      <video
        ref={transition2Ref}
        style={{ display: 'none' }}
        preload="auto"
        muted
        playsInline
        aria-hidden="true"
      />
    </div>
  );
}
