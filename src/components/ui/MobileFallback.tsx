/**
 * @file MobileFallback.tsx
 * @description Fallback UI when 3D gallery is not shown (e.g. mobile): responsive grid of
 * video cards, modal video player, and MobileGalleryWrapper for conditional rendering.
 */

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { galleryVideos, GalleryVideo } from '../../constants/galleryData';

/** Responsive grid of video cards with thumbnails, play overlay, and modal player. */
export function MobileFallback() {
  const [selectedVideo, setSelectedVideo] = useState<GalleryVideo | null>(null);
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#030014] to-[#0a0525] py-8 px-4">
      {/* Header */}
      <header className="text-center mb-8">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl font-bold text-white mb-2"
        >
          VR Projects
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-indigo-300/70 text-sm"
        >
          Tap to watch project demos
        </motion.p>
      </header>
      
      {/* Video Grid */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto"
      >
        {galleryVideos.map((video, index) => (
          <VideoCard
            key={video.id}
            video={video}
            index={index}
            onSelect={() => setSelectedVideo(video)}
          />
        ))}
      </motion.div>
      
      {/* Video Modal */}
      <AnimatePresence>
        {selectedVideo && (
          <VideoModal
            video={selectedVideo}
            onClose={() => setSelectedVideo(null)}
          />
        )}
      </AnimatePresence>
      
      {/* Desktop hint */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="text-center text-indigo-400/50 text-xs mt-12"
      >
        💻 View on desktop for the full 3D experience
      </motion.p>
    </div>
  );
}

/** Props for a single video card in the grid. */
interface VideoCardProps {
  video: GalleryVideo;
  index: number;
  onSelect: () => void;
}

function VideoCard({ video, index, onSelect }: VideoCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="group"
    >
      <div
        className={`
          relative overflow-hidden rounded-xl
          bg-gradient-to-br from-indigo-900/30 to-purple-900/30
          border border-indigo-500/20
          transition-all duration-300
          ${isHovered ? 'border-indigo-500/50 shadow-lg shadow-indigo-500/20' : ''}
        `}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={onSelect}
      >
        {/* Thumbnail */}
        <div className="relative aspect-video overflow-hidden">
          <img
            src={video.thumbnailUrl}
            alt={video.title}
            className={`
              w-full h-full object-cover
              transition-transform duration-500
              ${isHovered ? 'scale-110' : 'scale-100'}
            `}
            onError={(e) => {
              // Fallback gradient if thumbnail fails to load
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
          
          {/* Fallback gradient background */}
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/50 to-purple-600/50 -z-10" />
          
          {/* Play button overlay */}
          <div className={`
            absolute inset-0 flex items-center justify-center
            bg-black/40 transition-opacity duration-300
            ${isHovered ? 'opacity-100' : 'opacity-0'}
          `}>
            <div className={`
              w-16 h-16 rounded-full
              bg-white/20 backdrop-blur-sm
              flex items-center justify-center
              transition-transform duration-300
              ${isHovered ? 'scale-100' : 'scale-75'}
            `}>
              <svg
                className="w-8 h-8 text-white ml-1"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
          </div>
          
          {/* Duration badge (placeholder) */}
          <div className="absolute bottom-2 right-2 px-2 py-1 rounded bg-black/70 text-white text-xs">
            Demo
          </div>
        </div>
        
        {/* Content */}
        <div className="p-4">
          <h3 className="text-white font-semibold text-lg mb-1 line-clamp-1">
            {video.title}
          </h3>
          <p className="text-indigo-300/70 text-sm line-clamp-2">
            {video.description}
          </p>
          
          {/* GitHub link */}
          {video.github && (
            <a
              href={video.github}
              target="_blank"
              rel="noopener noreferrer"
              className={`
                inline-flex items-center gap-1 mt-3
                text-xs text-indigo-400 hover:text-indigo-300
                transition-colors
              `}
              onClick={(e) => e.stopPropagation()}
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
              View Source
            </a>
          )}
        </div>
      </div>
    </motion.div>
  );
}

/** Props for the full-screen video modal. */
interface VideoModalProps {
  video: GalleryVideo;
  onClose: () => void;
}

function VideoModal({ video, onClose }: VideoModalProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState(false);
  
  // Auto-play when modal opens
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch(() => {
        setError(true);
      });
    }
  }, []);
  
  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onClose]);
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90"
      onClick={onClose}
    >
      {/* Close button */}
      <button
        className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
        onClick={onClose}
      >
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
      
      {/* Video container */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="relative w-full max-w-4xl aspect-video rounded-xl overflow-hidden bg-gray-900"
        onClick={(e) => e.stopPropagation()}
      >
        {error ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
            <svg className="w-16 h-16 text-red-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-lg mb-2">Unable to load video</p>
            <p className="text-sm text-gray-400">The video file may not be available yet</p>
          </div>
        ) : (
          <video
            ref={videoRef}
            src={video.videoUrl}
            className="w-full h-full object-contain"
            controls
            playsInline
            onError={() => setError(true)}
          />
        )}
      </motion.div>
      
      {/* Video info below */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 text-center"
      >
        <h2 className="text-white text-xl font-semibold">{video.title}</h2>
        <p className="text-indigo-300/70 text-sm mt-1">{video.description}</p>
      </motion.div>
    </motion.div>
  );
}

/** Renders MobileFallback when isMobile, else children (3D gallery). */
interface MobileGalleryWrapperProps {
  isMobile: boolean;
  children: React.ReactNode;
}

export function MobileGalleryWrapper({ isMobile, children }: MobileGalleryWrapperProps) {
  if (isMobile) {
    return <MobileFallback />;
  }
  
  return <>{children}</>;
}

export default MobileFallback;
