import { useRef } from "react";
import { Link } from "react-router-dom";
import { site } from "../content/site";
import { useScrollProgress, useIsNarrow } from "../lib/hooks";
import { getProjectBySlug } from "../../data";
import { EyebrowPill } from "./ui";

/** Additive reveal: a block fades + slides in once scroll passes `start`, and stays. */
function appear(p: number, start: number, span = 0.12) {
  const o = Math.max(0, Math.min(1, (p - start) / span));
  return { opacity: o, transform: `translateY(${(1 - o) * 18}px)`, pointerEvents: o > 0.5 ? ("auto" as const) : ("none" as const) };
}

export default function Hero() {
  const zoneRef = useRef<HTMLDivElement>(null);
  const p = useScrollProgress(zoneRef);
  const isMobile = useIsNarrow();
  const { hero } = site;
  const projects = hero.recentProjectIds
    .map((id) => getProjectBySlug(id))
    .filter((x): x is NonNullable<typeof x> => Boolean(x));

  // ── Mobile: no scroll-scrub. The first screen is the initial view (headline over
  //    the video); the supporting lines sit already-rendered right under it, in normal
  //    flow, so a small scroll lands on them — nothing fades/reveals. ──
  if (isMobile) {
    return (
      <section id="top" ref={zoneRef} className="relative">
        {/* Initial starting view — one screen, headline over the dark video */}
        <div className="relative flex h-screen flex-col justify-end px-5 pb-[16vh]">
          <EyebrowPill className="mb-5">{hero.eyebrow}</EyebrowPill>
          <h1 className="over-video font-display text-[34px] leading-[1.02] sm:text-[48px]">
            {hero.headline.line1}<br />
            {hero.headline.line2} <span className="italic-accent">{hero.headline.accent}</span>
          </h1>
        </div>

        {/* Supporting lines — already on the page, right under the initial view */}
        <div className="flex flex-col items-start gap-10 px-5 pb-24 pt-8">
          {hero.reveals.map((line, i) => (
            <p
              key={i}
              className="hero-glass over-video max-w-[440px] rounded-2xl px-4 py-3 text-[14px] leading-[1.55]"
            >
              {line}
            </p>
          ))}
        </div>
      </section>
    );
  }

  // ── Desktop: sticky, scroll-scrubbed hero with additive reveals. ──
  return (
    <section id="top" ref={zoneRef} className="relative" style={{ height: "300vh" }}>
      <div id="hero-zone" className="sticky top-0 h-screen overflow-hidden">
        <div className="relative mx-auto h-full max-w-container px-5 md:px-8">
          {/* ── Left: headline + additive supporting lines (white, over the dark video) ── */}
          <div className="absolute bottom-[15%] left-5 right-5 md:left-8 md:max-w-[680px]">
            <EyebrowPill className="mb-5">{hero.eyebrow}</EyebrowPill>
            <h1 className="over-video font-display text-[34px] leading-[1.02] sm:text-[48px] md:text-[64px]">
              {hero.headline.line1}<br />
              {hero.headline.line2} <span className="italic-accent">{hero.headline.accent}</span>
            </h1>
            <div className="mt-5 flex flex-col items-start gap-2.5">
              {hero.reveals.map((line, i) => (
                <p
                  key={i}
                  className="hero-glass over-video max-w-[420px] rounded-2xl px-4 py-2.5 text-[14px] leading-[1.55] md:text-[15px]"
                  style={appear(p, 0.16 + i * 0.22)}
                >
                  {line}
                </p>
              ))}
            </div>
          </div>

          {/* ── Right: tagline + recent projects revealed additively, each linked ── */}
          <div className="absolute right-5 top-1/2 hidden w-[230px] -translate-y-1/2 text-right md:block">
            <p className="over-video font-display text-[11px] leading-[1.6] tracking-[0.04em]">{hero.tagline}</p>
            <p className="over-video-dim mt-7 font-display text-[10px] tracking-[0.14em]">{hero.recentLabel}</p>
            <div className="mt-2.5 space-y-2.5">
              {projects.map((proj, i) => {
                const reveal = appear(p, 0.1 + i * 0.18);
                const shown = reveal.opacity > 0.5;
                return (
                <Link
                  key={proj.id}
                  to={`/work/${proj.id}`}
                  className="group block"
                  style={reveal}
                  // Invisible links must leave the tab order: opacity:0 +
                  // pointer-events:none still allows keyboard focus/activation.
                  tabIndex={shown ? 0 : -1}
                  aria-hidden={!shown}
                >
                  <span className="over-video block font-display text-[15px] leading-[1.2] tracking-[-0.03em] transition-opacity group-hover:opacity-60">
                    {proj.shortTitle ?? proj.title}
                  </span>
                  <span className="over-video-dim block font-mono text-[9px] uppercase tracking-[0.1em]">{proj.period}</span>
                </Link>
                );
              })}
            </div>
          </div>

          {/* ── Scroll cue: fades out as the page scrolls ── */}
          <div
            className="over-video-dim absolute bottom-6 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-1.5 md:flex"
            style={{ opacity: Math.max(0, 1 - p * 3.2) }}
          >
            <span className="font-display text-[11px] tracking-[0.08em]">{hero.scrollCue}</span>
            <svg className="animate-bounceArrow" width="14" height="14" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M12 5v14" /><path d="m6 13 6 6 6-6" />
            </svg>
          </div>
        </div>
      </div>
    </section>
  );
}
