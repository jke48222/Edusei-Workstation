/**
 * @file main.tsx
 * @description Application entry point that mounts the root React component within
 * StrictMode and BrowserRouter. Applies global styles and registers PWA service worker
 * in production builds for offline functionality.
 */

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ErrorBoundary } from './components/ErrorBoundary';
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
