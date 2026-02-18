/**
 * @file ErrorBoundary.tsx
 * @description Catches React errors in the tree and shows a simple fallback
 * with "Something went wrong" and a reload button.
 */

import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error('ErrorBoundary caught an error:', error, info);
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div
          style={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '1rem',
            padding: '1.5rem',
            fontFamily: 'IBM Plex Mono, monospace',
            backgroundColor: '#050505',
            color: 'rgba(255,255,255,0.9)',
            textAlign: 'center',
          }}
        >
          <p style={{ fontSize: '1rem', margin: 0 }}>Something went wrong.</p>
          <button
            type="button"
            onClick={() => window.location.reload()}
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
            Reload
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
