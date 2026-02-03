import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWorkstationStore, useIsInGallery, useGalleryCameraMode, useActiveVideo } from '../../store/store';
import { getVideoById } from '../../constants/galleryData';

/**
 * GalleryControls Component
 * 
 * Overlay UI for the gallery scene showing:
 * - WASD/Arrow key hints
 * - Current video info when in cinema mode
 * - Exit instructions
 * - Active video title
 */
export function GalleryControls() {
  const isInGallery = useIsInGallery();
  const cameraMode = useGalleryCameraMode();
  const activeVideoId = useActiveVideo();
  const exitGallery = useWorkstationStore((state) => state.exitGallery);
  
  const [showHint, setShowHint] = useState(true);
  
  // Hide hint after 5 seconds of being in gallery
  useEffect(() => {
    if (isInGallery) {
      setShowHint(true);
      const timer = setTimeout(() => setShowHint(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [isInGallery]);
  
  // Don't render if not in gallery
  if (!isInGallery) return null;
  
  const activeVideo = activeVideoId ? getVideoById(activeVideoId) : null;
  
  return (
    <div className="fixed inset-0 pointer-events-none z-40">
      {/* Controls hint - bottom left */}
      <AnimatePresence>
        {showHint && cameraMode === 'follow' && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="absolute bottom-8 left-8"
          >
            <ControlsHint />
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Exit button - top right */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="absolute top-6 right-6 pointer-events-auto"
      >
        <button
          onClick={exitGallery}
          className="
            flex items-center gap-2 px-4 py-2
            bg-black/50 hover:bg-black/70 backdrop-blur-sm
            border border-white/10 hover:border-white/20
            rounded-lg text-white/80 hover:text-white
            transition-all duration-200
            font-mono text-sm
          "
        >
          <kbd className="px-1.5 py-0.5 bg-white/10 rounded text-xs">ESC</kbd>
          <span>Exit Gallery</span>
        </button>
      </motion.div>
      
      {/* Active video info - bottom center */}
      <AnimatePresence>
        {activeVideo && cameraMode === 'cinema' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="absolute bottom-8 left-1/2 -translate-x-1/2"
          >
            <VideoInfoPanel video={activeVideo} />
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Move away hint when watching video */}
      <AnimatePresence>
        {cameraMode === 'cinema' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ delay: 2 }}
            className="absolute bottom-32 left-1/2 -translate-x-1/2"
          >
            <p className="text-white/50 text-sm font-mono">
              Move away to exit cinema mode
            </p>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Mini controls reminder - bottom right */}
      {!showHint && cameraMode === 'follow' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.5 }}
          className="absolute bottom-4 right-4 text-white/30 text-xs font-mono"
        >
          WASD to move
        </motion.div>
      )}
    </div>
  );
}

/**
 * ControlsHint - Visual WASD key display
 */
function ControlsHint() {
  const input = useWorkstationStore((state) => state.input);
  
  return (
    <div className="bg-black/50 backdrop-blur-sm rounded-xl p-4 border border-white/10">
      <p className="text-white/60 text-xs font-mono mb-3 text-center">MOVEMENT</p>
      
      {/* WASD Keys */}
      <div className="flex flex-col items-center gap-1">
        {/* W key */}
        <KeyDisplay letter="W" isPressed={input.forward} />
        
        {/* A, S, D row */}
        <div className="flex gap-1">
          <KeyDisplay letter="A" isPressed={input.left} />
          <KeyDisplay letter="S" isPressed={input.backward} />
          <KeyDisplay letter="D" isPressed={input.right} />
        </div>
      </div>
      
      {/* Arrow keys alternative */}
      <p className="text-white/30 text-xs font-mono mt-3 text-center">
        or Arrow keys
      </p>
    </div>
  );
}

/**
 * KeyDisplay - Individual key visual
 */
function KeyDisplay({ letter, isPressed }: { letter: string; isPressed: boolean }) {
  return (
    <div
      className={`
        w-10 h-10 rounded-lg
        flex items-center justify-center
        font-mono font-bold text-sm
        transition-all duration-100
        ${isPressed 
          ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/50' 
          : 'bg-white/10 text-white/60 border border-white/20'
        }
      `}
    >
      {letter}
    </div>
  );
}

/**
 * VideoInfoPanel - Shows info about the currently playing video
 */
function VideoInfoPanel({ video }: { video: { title: string; description: string; github?: string } }) {
  return (
    <div className="bg-black/70 backdrop-blur-md rounded-xl p-6 border border-indigo-500/30 max-w-md">
      {/* Now playing indicator */}
      <div className="flex items-center gap-2 mb-3">
        <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
        <span className="text-red-400 text-xs font-mono uppercase tracking-wider">
          Now Playing
        </span>
      </div>
      
      {/* Video title */}
      <h2 className="text-white text-xl font-bold mb-2">{video.title}</h2>
      
      {/* Description */}
      <p className="text-white/60 text-sm leading-relaxed">{video.description}</p>
      
      {/* GitHub link */}
      {video.github && (
        <a
          href={video.github}
          target="_blank"
          rel="noopener noreferrer"
          className="
            inline-flex items-center gap-2 mt-4
            text-indigo-400 hover:text-indigo-300
            text-sm font-mono transition-colors
            pointer-events-auto
          "
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
          </svg>
          View Source Code
        </a>
      )}
    </div>
  );
}

export default GalleryControls;
