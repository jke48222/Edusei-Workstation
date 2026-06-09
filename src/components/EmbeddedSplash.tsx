/**
 * @file EmbeddedSplash.tsx
 * @description Lightweight view rendered when the site is loaded inside an iframe (e.g. the
 * "Personal Portfolio" tile embeds jalenedusei.com). It avoids recursively booting the full
 * app — no nested tiles, iframes, or 3D — and instead shows a branded hero that opens the
 * real site in the top-level window.
 */

import { profileData } from '../data';

export function EmbeddedSplash() {
  return (
    <div className="pf pf-mesh pf-grain fixed inset-0 flex items-center justify-center overflow-hidden font-sans">
      <div className="relative z-10 px-8 text-center">
        <p className="mb-4 font-mono text-[11px] uppercase tracking-[0.32em] text-[var(--pf-accent-deep)]">
          {profileData.title} · {profileData.university}
        </p>
        <h1 className="font-display text-5xl font-extrabold leading-[0.9] tracking-tighter text-[var(--pf-ink)] sm:text-6xl md:text-7xl">
          JALEN
          <br />
          EDUSEI
        </h1>
        <p className="mx-auto mt-5 max-w-md text-sm leading-relaxed text-[var(--pf-ink-soft)]">
          Immersive 3D workstation portfolio for embedded systems, AI applications, VR/XR, and design.
        </p>
        <a
          href="https://www.jalenedusei.com"
          target="_top"
          rel="noopener noreferrer"
          className="mt-7 inline-flex items-center gap-2 rounded-full bg-[var(--pf-accent)] px-6 py-3 text-sm font-semibold text-[var(--pf-on-accent)] transition-transform hover:scale-105 active:scale-95"
        >
          Open the live site ↗
        </a>
      </div>
    </div>
  );
}
