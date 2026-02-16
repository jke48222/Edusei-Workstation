import { useGazeProgress, useGazeTarget } from '../../store/store';
import { islandData } from '../../constants/galleryData';

/**
 * @file GazeIndicator.tsx
 * @description HUD: circular progress ring at screen center while gazing at an island; shows island name on completion.
 */
export function GazeIndicator() {
  const gazeProgress = useGazeProgress();
  const gazeTarget = useGazeTarget();

  if (!gazeTarget || gazeProgress <= 0) return null;

  const island = islandData.find(i => i.id === gazeTarget);
  const isComplete = gazeProgress >= 1;

  const circumference = 2 * Math.PI * 24;
  const dashOffset = circumference * (1 - gazeProgress);

  return (
    <div
      style={{
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 50,
        pointerEvents: 'none',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '12px',
      }}
    >
      {/* Circular progress ring */}
      <svg
        width="64"
        height="64"
        viewBox="0 0 64 64"
        style={{
          filter: `drop-shadow(0 0 8px ${island?.accentColor || '#FFB7C5'}44)`,
        }}
      >
        {/* Background circle */}
        <circle
          cx="32"
          cy="32"
          r="24"
          fill="none"
          stroke="rgba(255, 248, 231, 0.2)"
          strokeWidth="3"
        />
        {/* Progress arc */}
        <circle
          cx="32"
          cy="32"
          r="24"
          fill="none"
          stroke={island?.accentColor || '#FFB7C5'}
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          transform="rotate(-90 32 32)"
          style={{ transition: 'stroke-dashoffset 0.1s ease' }}
        />
        {/* Center dot */}
        <circle
          cx="32"
          cy="32"
          r={isComplete ? 4 : 2}
          fill={island?.accentColor || '#FFB7C5'}
          style={{ transition: 'r 0.3s ease' }}
        />
      </svg>

      {/* Island name hint */}
      {island && (
        <div
          style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: '13px',
            fontWeight: 600,
            color: 'rgba(255, 248, 231, 0.9)',
            textShadow: '0 2px 8px rgba(0,0,0,0.5)',
            textAlign: 'center',
            opacity: gazeProgress > 0.2 ? 1 : 0,
            transition: 'opacity 0.3s ease',
          }}
        >
          {isComplete ? `Bridge forming to ${island.title}` : island.title}
        </div>
      )}
    </div>
  );
}

export default GazeIndicator;
