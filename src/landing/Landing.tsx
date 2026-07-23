import { useLayoutEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { site } from "./content/site";
import ScrubVideo from "./components/ScrubVideo";
import Header from "./components/Header";
import Hero from "./components/Hero";
import WhatIMake from "./components/sections/WhatIMake";
import SelectedWork from "./components/sections/SelectedWork";
import Skills from "./components/sections/Skills";
import Experience from "./components/sections/Experience";
import Recognition from "./components/sections/Recognition";
import Certifications from "./components/sections/Certifications";
import StudyAbroad from "./components/sections/StudyAbroad";
import About from "./components/sections/About";
import Editorial from "./components/sections/Editorial";
import ForBrands from "./components/sections/ForBrands";
import StartHere from "./components/sections/StartHere";
import Footer from "./components/sections/Footer";

/**
 * The scroll-scrubbed video portfolio — the site's home at `/`.
 *
 * Scrolls inside its own `fixed inset-0` container (`#landing-scroll`) so the app's
 * global `overflow:hidden` (for the 3D canvas) is left intact. The whole tree is
 * namespaced under `.landing`; sections sit transparently over the fixed, scrubbed
 * video so the footage stays visible through the gaps as you scroll. The scrub +
 * scroll-progress logic reads this container's scrollTop (see ScrubVideo / hooks).
 */
/** sessionStorage key for the landing's scroll position (it scrolls in its own div,
 *  so native browser scroll restoration never applies). */
const SCROLL_KEY = "landing-scroll-top";

export function Landing() {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const { hash } = useLocation();

  useLayoutEffect(() => {
    const el = scrollerRef.current;
    // A #fragment deep link wins; otherwise restore where the user left off
    // (back navigation from /work etc.); otherwise start at the top.
    if (hash) {
      document.getElementById(hash.slice(1))?.scrollIntoView({ behavior: "auto", block: "start" });
    } else {
      let saved = 0;
      try { saved = Number(sessionStorage.getItem(SCROLL_KEY)) || 0; } catch { /* storage blocked */ }
      el?.scrollTo(0, saved);
    }
    const prevTitle = document.title;
    document.title = `${site.name} | ${site.tagline}`;
    return () => {
      document.title = prevTitle;
      try { sessionStorage.setItem(SCROLL_KEY, String(el?.scrollTop ?? 0)); } catch { /* storage blocked */ }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div ref={scrollerRef} id="landing-scroll" className="landing fixed inset-0 overflow-y-auto overflow-x-hidden">
      <main className="relative">
        {/* fixed, scroll-scrubbed background video (z-0) */}
        <ScrubVideo />

        <Header />

        {/* content scrolls over the video */}
        <div className="relative z-10">
          <Hero />
          <WhatIMake />
          <SelectedWork />
          <Skills />
          <Experience />
          <Recognition />
          <Certifications />
          <StudyAbroad />
          <About />
          <Editorial />
          <ForBrands />
          <StartHere />
          <Footer />
        </div>
      </main>
    </div>
  );
}

export default Landing;
