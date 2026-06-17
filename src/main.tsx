/**
 * @file main.tsx
 * @description Application entry point that mounts the root React component within
 * StrictMode and BrowserRouter. Applies global styles and registers PWA service worker
 * in production builds for offline functionality.
 */

import { StrictMode, useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { ErrorBoundary } from './components/ErrorBoundary';
import DotRingCursor from './components/DotRingCursor';
import ReticleCursor from './components/ReticleCursor';
import { useViewMode } from './store/store';
import { useActiveTheme, useThemeStore } from './store/themeStore';
import { usePrefersReducedMotion } from './hooks/useIsMobile';
import { NotFound } from './components/NotFound';
import { WorkPage } from './components/work/WorkPage';
import { ProjectDetailPage } from './components/work/ProjectDetailPage';
import {
  AboutPage,
  ExperiencePage,
  SkillsPage,
  CertificationsPage,
  ContactPage,
} from './components/professional/SubPages';
import { EmbeddedSplash } from './components/EmbeddedSplash';
import './index.css';
import App from './App.tsx';

if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {});
  });
}

/** Detect being rendered inside an iframe (e.g. our own "Personal Portfolio" tile). */
function isEmbedded(): boolean {
  try {
    return window.self !== window.top;
  } catch {
    return true; // cross-origin access throws → we're framed
  }
}

/**
 * Picks the right custom cursor for the active "site": the reticle for the
 * immersive Workstation (only live at `/`), the dot+ring everywhere else on the
 * professional portfolio. Renders nothing on touch / coarse-pointer devices.
 */
function SiteCursor() {
  const viewMode = useViewMode();
  const location = useLocation();
  const theme = useActiveTheme();
  const portfolioDark = useThemeStore((s) => s.portfolioDark);
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

  // The Workstation only renders at `/`; every other route is the portfolio.
  const isWorkstation = viewMode === 'immersive' && location.pathname === '/';

  if (isWorkstation) {
    return <ReticleCursor color={theme.accent} reducedMotion={reducedMotion} />;
  }

  return (
    <DotRingCursor
      dark={portfolioDark}
      ringColor="color-mix(in srgb, var(--pf-ink) 55%, transparent)"
      dotColor="var(--pf-accent)"
      hoverColor="var(--pf-accent)"
      smooth={reducedMotion ? 1 : 0.18}
    />
  );
}

const root = createRoot(document.getElementById('root') as HTMLElement);

if (isEmbedded()) {
  // Avoid recursively booting the full app (and its 3D/iframe tiles) inside a frame.
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
          <Routes>
            <Route path="/" element={<App />} />
            <Route path="/work" element={<WorkPage />} />
            <Route path="/work/:projectId" element={<ProjectDetailPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/experience" element={<ExperiencePage />} />
            <Route path="/skills" element={<SkillsPage />} />
            <Route path="/certifications" element={<CertificationsPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </ErrorBoundary>
    </StrictMode>
  );
}
