/**
 * @file HeroVideoTitle.tsx
 * @description Video-based hero title component that displays an animated video
 * with transparent background for the "JALEN EDUSEI" title. Automatically selects
 * theme-appropriate video source based on dark mode preference.
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
 */
export function HeroVideoTitle({ 
  videoSrc, 
  dark = false, 
  className = '' 
}: HeroVideoTitleProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [aspectRatio, setAspectRatio] = useState<number | null>(null);
  
  // Select video source based on theme: white variant for dark mode, black for light mode
  const defaultVideoSrc = dark ? '/videos/jalen-edusei-white.webm' : '/videos/jalen-edusei-black.webm';
  const finalVideoSrc = videoSrc || defaultVideoSrc;

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Update video source when theme or custom source changes
    if (video.src !== `${window.location.origin}${finalVideoSrc}`) {
      video.src = finalVideoSrc;
    }

    // Calculate and store aspect ratio when video metadata loads
    const handleLoadedMetadata = () => {
      if (video.videoWidth > 0 && video.videoHeight > 0) {
        setAspectRatio(video.videoWidth / video.videoHeight);
      }
    };

    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    
    // Attempt to play video automatically on mount or source change
    video.play().catch((err) => {
      console.warn('Video autoplay prevented:', err);
    });

    // Reset video to beginning when playback completes
    const handleEnded = () => {
      video.currentTime = 0;
    };

    video.addEventListener('ended', handleEnded);
    return () => {
      video.removeEventListener('ended', handleEnded);
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
    };
  }, [finalVideoSrc]);

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
      <video
        ref={videoRef}
        src={finalVideoSrc}
        className="w-full h-full"
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
          boxSizing: 'border-box'
        }}
        playsInline
        muted
        preload="auto"
        aria-hidden="true"
      />
    </div>
  );
}
