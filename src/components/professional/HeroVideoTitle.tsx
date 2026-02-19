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
  const [isTransitioning, setIsTransitioning] = useState<boolean>(false);
  
  // Preload transition videos on mount to eliminate delay when switching themes
  useEffect(() => {
    const transition1 = transition1Ref.current;
    const transition2 = transition2Ref.current;
    
    if (transition1) {
      transition1.src = '/videos/jalen-edusei-transition-1.webm';
      transition1.preload = 'auto';
      transition1.load();
    }
    
    if (transition2) {
      transition2.src = '/videos/jalen-edusei-transition-2.webm';
      transition2.preload = 'auto';
      transition2.load();
    }
  }, []);
  
  // Determine video source based on state
  useEffect(() => {
    // If custom video source is provided, use it
    if (videoSrc) {
      setCurrentVideoSrc(videoSrc);
      return;
    }

    // Check if this is the first load (no previous dark state)
    const isFirstLoad = previousDarkRef.current === null;
    
    if (isFirstLoad) {
      // First visit/refresh/page switch: show base video
      const baseVideoSrc = dark ? '/videos/jalen-edusei-white.webm' : '/videos/jalen-edusei-black.webm';
      setCurrentVideoSrc(baseVideoSrc);
    } else if (previousDarkRef.current !== dark) {
      // Theme changed: use transition video (preloaded for instant playback)
      const transitionVideoSrc = dark ? '/videos/jalen-edusei-transition-1.webm' : '/videos/jalen-edusei-transition-2.webm';
      setIsTransitioning(true);
      setCurrentVideoSrc(transitionVideoSrc);
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

    // Update video source when it changes
    const fullSrc = `${window.location.origin}${currentVideoSrc}`;
    const isTransition = currentVideoSrc.includes('transition');
    
    if (video.src !== fullSrc) {
      // For transition videos, check if preloaded version is ready
      if (isTransition && currentVideoSrc.includes('transition-1')) {
        const preloaded = transition1Ref.current;
        if (preloaded && preloaded.readyState >= 3) {
          // Preloaded video is ready - set source and it should load quickly
          video.src = currentVideoSrc;
          video.currentTime = 0; // Reset to start
        } else {
          video.src = currentVideoSrc;
        }
      } else if (isTransition && currentVideoSrc.includes('transition-2')) {
        const preloaded = transition2Ref.current;
        if (preloaded && preloaded.readyState >= 3) {
          video.src = currentVideoSrc;
          video.currentTime = 0;
        } else {
          video.src = currentVideoSrc;
        }
      } else {
        video.src = currentVideoSrc;
      }
    }

    // Calculate and store aspect ratio when video metadata loads
    const handleLoadedMetadata = () => {
      if (video.videoWidth > 0 && video.videoHeight > 0) {
        setAspectRatio(video.videoWidth / video.videoHeight);
      }
    };

    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    
    // Optimize playback for transition videos - use canplaythrough for smoother start
    const handleCanPlay = () => {
      video.play().catch((err) => {
        console.warn('Video autoplay prevented:', err);
      });
    };
    
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
      video.removeEventListener('canplaythrough', handleCanPlay);
    };

    // Handle video end: stay on last frame (never loop)
    const handleEnded = () => {
      video.pause();
      if (video.duration) {
        video.currentTime = video.duration;
      }
    };

    // Handle time update to ensure we stay on last frame when video ends
    const handleTimeUpdate = () => {
      if (video.duration && video.currentTime >= video.duration - 0.1) {
        video.pause();
        video.currentTime = video.duration;
      }
    };

    video.addEventListener('ended', handleEnded);
    video.addEventListener('timeupdate', handleTimeUpdate);
    
    return () => {
      video.removeEventListener('ended', handleEnded);
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
    };
  }, [currentVideoSrc]);

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
      {/* Main visible video */}
      <video
        ref={videoRef}
        src={currentVideoSrc}
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
      />
      
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
