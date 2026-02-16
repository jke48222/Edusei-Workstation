/**
 * @file GalleryControls.tsx
 * @description Spirit Oasis gallery HUD: gaze indicator, WASD/mouse hint, active island
 * info, cinema-mode controls, and exit button. Renders only when sceneMode === 'gallery'.
 */

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWorkstationStore, useIsInGallery, useGalleryCameraMode, useActiveIsland } from '../../store/store';
import { islandData } from '../../constants/galleryData';
import { GazeIndicator } from '../gallery/GazeIndicator';

/** Zen-themed overlay: gaze indicator, controls hint, island label, exit. */
export function GalleryControls() {
  const isInGallery = useIsInGallery();
  const cameraMode = useGalleryCameraMode();
  const activeIslandId = useActiveIsland();
  const exitGallery = useWorkstationStore((state) => state.exitGallery);

  const [showHint, setShowHint] = useState(true);

  useEffect(() => {
    if (isInGallery) {
      setShowHint(true);
      const timer = setTimeout(() => setShowHint(false), 8000);
      return () => clearTimeout(timer);
    }
  }, [isInGallery]);

  if (!isInGallery) return null;

  const activeIsland = activeIslandId ? islandData.find(i => i.id === activeIslandId) : null;

  return (
    <div className="fixed inset-0 pointer-events-none z-40">
      {/* Gaze indicator — center of screen */}
      <GazeIndicator />

      {/* Controls hint — bottom left */}
      <AnimatePresence>
        {showHint && cameraMode === 'follow' && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="absolute bottom-6 left-6"
          >
            <ControlsHint />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Exit button — top right */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="absolute top-4 right-4 pointer-events-auto"
      >
        <button
          onClick={exitGallery}
          className="
            flex items-center gap-2 px-3 py-1.5
            bg-black/30 hover:bg-black/40 backdrop-blur-md
            border border-white/10 hover:border-white/20
            rounded-lg text-white/70 hover:text-white
            transition-all duration-200
            font-mono text-[11px] shadow-lg shadow-black/20
          "
        >
          <kbd className="px-1 py-0.5 bg-white/10 rounded text-[10px]">ESC</kbd>
          <span>Return</span>
        </button>
      </motion.div>

      {/* Welcome message */}
      <AnimatePresence>
        {showHint && !activeIsland && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-4 left-1/2 -translate-x-1/2 text-center"
          >
            <p className="text-white/50 text-xs font-mono">
              Click + drag to look around · WASD to move · Look at islands to build bridges
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Active island info — bottom center */}
      <AnimatePresence>
        {activeIsland && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="absolute bottom-6 left-1/2 -translate-x-1/2"
          >
            <IslandInfoPanel island={activeIsland} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mini controls reminder */}
      {!showHint && cameraMode === 'follow' && !activeIsland && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.35 }}
          className="absolute bottom-3 right-4 text-white/25 text-[10px] font-mono"
        >
          WASD move · Mouse look · Gaze at islands
        </motion.div>
      )}
    </div>
  );
}

/**
 * ControlsHint — compact key display
 */
function ControlsHint() {
  const input = useWorkstationStore((state) => state.input);

  return (
    <div className="bg-black/25 backdrop-blur-md rounded-lg p-3 border border-white/8 shadow-lg shadow-black/10">
      <p className="text-white/30 text-[9px] font-mono mb-2 text-center tracking-wider uppercase">
        Controls
      </p>

      <div className="flex flex-col items-center gap-1 mb-2">
        <KeyDisplay letter="W" isPressed={input.forward} />
        <div className="flex gap-1">
          <KeyDisplay letter="A" isPressed={input.left} />
          <KeyDisplay letter="S" isPressed={input.backward} />
          <KeyDisplay letter="D" isPressed={input.right} />
        </div>
      </div>

      <p className="text-white/20 text-[9px] font-mono text-center">
        Click + drag to look
      </p>
    </div>
  );
}

/**
 * KeyDisplay — single key with warm theme
 */
function KeyDisplay({ letter, isPressed }: { letter: string; isPressed: boolean }) {
  return (
    <div
      className={`
        w-8 h-8 rounded
        flex items-center justify-center
        font-mono font-bold text-[11px]
        transition-all duration-100
        ${isPressed
          ? 'bg-[#FFB7C5]/70 text-white shadow-md shadow-[#FFB7C5]/25'
          : 'bg-white/6 text-white/40 border border-white/10'
        }
      `}
    >
      {letter}
    </div>
  );
}

/**
 * IslandInfoPanel — compact info about the current island
 */
function IslandInfoPanel({ island }: { island: typeof islandData[0] }) {
  return (
    <div
      className="backdrop-blur-md rounded-lg p-4 max-w-sm shadow-xl"
      style={{
        background: 'rgba(0, 0, 0, 0.3)',
        border: `1px solid ${island.accentColor}33`,
      }}
    >
      <div className="flex items-center gap-2 mb-2">
        <span
          className="w-2 h-2 rounded-full"
          style={{ backgroundColor: island.accentColor }}
        />
        <span
          className="text-[10px] font-mono uppercase tracking-wider"
          style={{ color: island.accentColor }}
        >
          {island.subtitle}
        </span>
      </div>

      <h2
        className="text-base font-bold mb-1.5 text-white"
        style={{ fontFamily: "'Space Grotesk', sans-serif" }}
      >
        {island.title}
      </h2>

      <p className="text-white/50 text-xs leading-relaxed mb-2">
        {island.description}
      </p>

      <div className="flex flex-wrap gap-1">
        {island.techStack.slice(0, 4).map((tech) => (
          <span
            key={tech}
            className="text-[9px] px-1.5 py-0.5 rounded-full font-medium"
            style={{
              backgroundColor: `${island.accentColor}15`,
              color: island.accentColor,
            }}
          >
            {tech}
          </span>
        ))}
      </div>

      {island.github && (
        <a
          href={island.github}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block mt-2 text-[10px] font-mono transition-colors pointer-events-auto"
          style={{ color: island.accentColor }}
        >
          View Source →
        </a>
      )}
    </div>
  );
}

export default GalleryControls;
