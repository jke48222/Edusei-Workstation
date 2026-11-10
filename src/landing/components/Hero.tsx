import { useRef } from "react";
import { Link } from "react-router-dom";
import { ArrowDown, Boxes, FileBadge, FileText, Github, Linkedin, Mail, type LucideIcon } from "lucide-react";
import { site } from "../content/site";
import { useScrollProgress, useIsNarrow } from "../lib/hooks";
import { getProjectBySlug } from "../../data";
import { EyebrowPill } from "./ui";

/** The footer's icon links, minus the source code, along the hero's bottom edge. */
const HERO_LINKS: { label: string; href: string; icon: LucideIcon; internal?: boolean }[] = [
  { label: "GitHub", href: site.socials.github, icon: Github },
  { label: "LinkedIn", href: site.socials.linkedin, icon: Linkedin },
  { label: "Email", href: site.socials.email, icon: Mail },
  { label: "Résumé", href: site.socials.resume, icon: FileText },
  { label: "CV", href: site.socials.cv, icon: FileBadge },
  { label: "3D Workstation", href: "/workstation", icon: Boxes, internal: true },
];

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
  // The scroll cue's opacity: gone by about a third of the way through the hero.
  const cue = Math.max(0, 1 - p * 3.2);
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

          {/* ── Icon links, bottom centre: they stay put for the whole hero ── */}
          {/* .hero-glass sets its own position, so the pill sits inside the placed wrapper */}
          <div className="absolute bottom-7 left-1/2 hidden -translate-x-1/2 md:block">
            <div className="hero-glass over-video flex items-center gap-1 rounded-full p-1.5">
              {HERO_LINKS.map(({ label, href, icon: Icon, internal }) => {
                const cls = "flex h-10 w-10 items-center justify-center rounded-full transition-colors hover:bg-white/15";
                const glyph = <Icon className="h-[18px] w-[18px]" strokeWidth={1.7} />;
                return internal ? (
                  <Link key={label} to={href} aria-label={label} title={label} className={cls}>{glyph}</Link>
                ) : (
                  // Web links and the two PDFs open in a new tab; the mailto does not.
                  <a
                    key={label}
                    href={href}
                    target={href.startsWith("mailto:") ? undefined : "_blank"}
                    rel="noreferrer"
                    aria-label={label}
                    title={label}
                    className={cls}
                  >
                    {glyph}
                  </a>
                );
              })}
            </div>
          </div>

          {/* ── Scroll cue, bottom right: a bouncing arrow that fades as the page scrolls ── */}
          <div
            className="absolute bottom-7 right-5 hidden md:block"
            style={{ opacity: cue, pointerEvents: cue > 0.5 ? "auto" : "none" }}
          >
            <button
              type="button"
              aria-label={hero.scrollCue}
              title={hero.scrollCue}
              tabIndex={cue > 0.5 ? 0 : -1}
              onClick={(e) =>
                e.currentTarget.closest(".landing")?.scrollBy({ top: window.innerHeight * 0.9, behavior: "smooth" })
              }
              className="over-video flex h-11 w-11 items-center justify-center transition-opacity hover:opacity-70"
            >
              <ArrowDown className="h-6 w-6 animate-bounceArrow" strokeWidth={1.6} aria-hidden />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
