/**
 * @file main.tsx
 * @description Application entry point. The scroll-scrubbed video portfolio is the home
 * route ("/"); the 3D workstation and the project pages are lazy-loaded so their heavy
 * dependencies (three.js / framer-motion) stay out of the home page's initial bundle.
 */

import { StrictMode, Suspense, lazy, useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { Analytics } from '@vercel/analytics/react';
import { ErrorBoundary } from '../components/ErrorBoundary';
import DotRingCursor from '../components/DotRingCursor';
import { usePrefersReducedMotion } from '../hooks/useIsMobile';
import { EmbeddedSplash } from '../components/EmbeddedSplash';
import { Landing } from '../landing/Landing';
import '../styles/index.css';

// Lazy routes — heavy work (three.js / framer-motion) is deferred until the user
// leaves the home page.
const WorkstationRoute = lazy(() => import('./App').then((m) => ({ default: m.WorkstationRoute })));
const WorkPage = lazy(() => import('../components/work/WorkPage').then((m) => ({ default: m.WorkPage })));
const ProjectDetailPage = lazy(() => import('../components/work/ProjectDetailPage').then((m) => ({ default: m.ProjectDetailPage })));
const NotFound = lazy(() => import('../components/NotFound').then((m) => ({ default: m.NotFound })));

if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {});
  });
}

/** Detect being rendered inside an iframe (e.g. a project tile embedding this site). */
function isEmbedded(): boolean {
  try {
    return window.self !== window.top;
  } catch {
    return true; // cross-origin access throws → we're framed
  }
}

/**
 * Picks the right custom cursor: an ink dot+ring on the bone portfolio + work
 * pages. The IDE workstation uses the platform's native cursors (arrow over
 * chrome, I-beam over text), exactly like a real editor, so it renders none.
 * Renders nothing on touch / coarse-pointer devices either.
 */
function SiteCursor() {
  const location = useLocation();
  const reducedMotion = usePrefersReducedMotion();
  const [finePointer, setFinePointer] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(pointer: fine)');
    const update = () => setFinePointer(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  if (!finePointer) return null;

  if (location.pathname.startsWith('/workstation')) {
    return null;
  }

  // White ink + difference blending: renders as dark ink on the bone
  // background and flips to white over black surfaces, per pixel.
  return (
    <DotRingCursor
      ringColor="rgba(255,255,255,0.5)"
      dotColor="#ffffff"
      hoverColor="#ffffff"
      smooth={reducedMotion ? 1 : 0.18}
    />
  );
}

const root = createRoot(document.getElementById('root') as HTMLElement);

if (isEmbedded()) {
  root.render(
    <StrictMode>
      <EmbeddedSplash />
    </StrictMode>
  );
} else {
  root.render(
    <StrictMode>
      <ErrorBoundary>
        <BrowserRouter>
          <SiteCursor />
          {/* Visible fallback: a null fallback blanks the whole page while a lazy
              route chunk downloads on slow connections. */}
          <Suspense
            fallback={
              <div className="fixed inset-0 grid place-items-center" aria-label="Loading page">
                <span className="h-8 w-8 animate-spin rounded-full border-2 border-black/15 border-t-black/60" />
              </div>
            }
          >
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/workstation" element={<WorkstationRoute />} />
              <Route path="/work" element={<WorkPage />} />
              <Route path="/work/:projectId" element={<ProjectDetailPage />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
          {/* Site-wide analytics — previously only the /workstation route reported. */}
          <Analytics />
        </BrowserRouter>
      </ErrorBoundary>
    </StrictMode>
  );
}
