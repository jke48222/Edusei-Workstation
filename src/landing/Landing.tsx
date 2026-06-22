import { useLayoutEffect, useRef } from "react";
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
export function Landing() {
  const scrollerRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    scrollerRef.current?.scrollTo(0, 0);
    const prevTitle = document.title;
    document.title = `${site.name} | ${site.tagline}`;
    return () => {
      document.title = prevTitle;
    };
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
