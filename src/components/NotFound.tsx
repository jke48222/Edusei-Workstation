/**
 * @file NotFound.tsx
 * @description Custom 404 page with links back to Portfolio and Workstation.
 */

import { useNavigate } from 'react-router-dom';
import { useWorkstationStore } from '../store/store';

export function NotFound() {
  const navigate = useNavigate();
  const setViewMode = useWorkstationStore((s) => s.setViewMode);

  const goTo = (mode: 'professional' | 'immersive') => {
    setViewMode(mode);
    navigate('/', { replace: true });
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '1.5rem',
        padding: '1.5rem',
        fontFamily: 'IBM Plex Mono, monospace',
        backgroundColor: '#050505',
        color: 'rgba(255,255,255,0.9)',
        textAlign: 'center',
      }}
    >
      <p style={{ fontSize: '1rem', margin: 0 }}>Page not found.</p>
      <p style={{ fontSize: '0.875rem', margin: 0, opacity: 0.7 }}>This URL doesn’t exist. Go back to the site.</p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', justifyContent: 'center' }}>
        <button
          type="button"
          onClick={() => goTo('professional')}
          style={{
            padding: '0.5rem 1rem',
            fontFamily: 'inherit',
            fontSize: '0.875rem',
            backgroundColor: 'rgba(255,255,255,0.15)',
            color: 'inherit',
            border: '1px solid rgba(255,255,255,0.3)',
            borderRadius: '6px',
            cursor: 'pointer',
          }}
        >
          Portfolio
        </button>
        <button
          type="button"
          onClick={() => goTo('immersive')}
          style={{
            padding: '0.5rem 1rem',
            fontFamily: 'inherit',
            fontSize: '0.875rem',
            backgroundColor: 'rgba(255,255,255,0.15)',
            color: 'inherit',
            border: '1px solid rgba(255,255,255,0.3)',
            borderRadius: '6px',
            cursor: 'pointer',
          }}
        >
          Workstation
        </button>
      </div>
    </div>
  );
}
