import { Plane } from "lucide-react";
import { site } from "../../content/site";
import { studyAbroad } from "../../../data";
import { Reveal } from "../ui";

/** Small labelled field — the repeated "GATE / SEAT / etc." cells of a ticket. */
function Field({ label, value, className = "" }: { label: string; value: string; className?: string }) {
  return (
    <div className={className}>
      <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-dark-ink-mute">{label}</div>
      <div className="mt-1.5 font-display text-[15px] tracking-[-0.01em] text-dark-ink">{value}</div>
    </div>
  );
}

/**
 * Scannable QR for the UGA StudyAway program page — generated offline from
 * `studyAbroad.url` (the boarding-pass "barcode"). Dark modules on white so it
 * actually scans; quiet zone is baked into the 0 0 45 45 viewBox.
 */
function ProgramQR({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 45 45" shapeRendering="crispEdges" className={className} role="img" aria-label="QR code to the UGA StudyAway program page">
      <path
        stroke="#ffffff"
        d="M4 4.5h7m2 0h1m2 0h1m1 0h1m3 0h4m6 0h1m1 0h7M4 5.5h1m5 0h1m2 0h1m3 0h5m2 0h3m4 0h2m1 0h1m5 0h1M4 6.5h1m1 0h3m1 0h1m1 0h8m2 0h1m2 0h2m3 0h2m2 0h1m1 0h3m1 0h1M4 7.5h1m1 0h3m1 0h1m1 0h4m1 0h1m1 0h3m1 0h1m3 0h1m1 0h2m3 0h1m1 0h3m1 0h1M4 8.5h1m1 0h3m1 0h1m1 0h1m1 0h1m1 0h1m1 0h1m3 0h4m1 0h1m2 0h1m1 0h1m1 0h1m1 0h3m1 0h1M4 9.5h1m5 0h1m1 0h1m1 0h1m1 0h1m1 0h1m1 0h1m3 0h2m2 0h1m1 0h3m1 0h1m5 0h1M4 10.5h7m1 0h1m1 0h1m1 0h1m1 0h1m1 0h1m1 0h1m1 0h1m1 0h1m1 0h1m1 0h1m1 0h7M12 11.5h4m3 0h2m1 0h2m1 0h2m3 0h1m1 0h1M4 12.5h1m1 0h5m3 0h2m1 0h1m1 0h4m3 0h1m1 0h4m2 0h5M4 13.5h1m1 0h2m3 0h5m3 0h1m1 0h1m1 0h2m2 0h1m1 0h2m1 0h2m1 0h1m2 0h2M5 14.5h2m1 0h5m4 0h4m5 0h1m4 0h1m2 0h3m1 0h3M4 15.5h3m1 0h1m2 0h1m1 0h2m1 0h2m1 0h1m3 0h4m1 0h1m1 0h1m1 0h2m1 0h1m4 0h1M6 16.5h1m3 0h1m1 0h5m1 0h2m1 0h2m3 0h1m1 0h2m1 0h10M5 17.5h4m2 0h2m2 0h3m2 0h2m1 0h2m2 0h1m4 0h2m1 0h1M5 18.5h1m1 0h4m1 0h2m2 0h1m2 0h2m5 0h1m2 0h4m1 0h4m1 0h2M5 19.5h3m1 0h1m1 0h1m2 0h2m2 0h2m3 0h3m4 0h2m3 0h2m2 0h2M5 20.5h1m3 0h2m1 0h3m2 0h1m1 0h1m2 0h2m2 0h1m1 0h1m1 0h5m1 0h1m1 0h1M4 21.5h1m1 0h4m2 0h3m2 0h1m1 0h3m1 0h1m3 0h1m1 0h4m2 0h1m2 0h2M4 22.5h1m2 0h6m1 0h1m1 0h2m3 0h1m3 0h1m2 0h4m1 0h8M4 23.5h4m1 0h1m5 0h1m2 0h1m1 0h1m2 0h1m1 0h4m3 0h1m1 0h4m2 0h1M4 24.5h1m1 0h1m1 0h1m1 0h2m2 0h5m7 0h1m1 0h3m2 0h2m1 0h1m1 0h1M5 25.5h1m9 0h2m1 0h3m1 0h2m1 0h1m1 0h1m2 0h1m1 0h2m3 0h1M5 26.5h2m1 0h3m2 0h3m3 0h2m1 0h1m3 0h1m1 0h1m2 0h2m1 0h4m1 0h2M5 27.5h1m3 0h1m1 0h1m1 0h2m4 0h2m1 0h1m2 0h3m3 0h1m1 0h4m3 0h1M5 28.5h1m3 0h4m5 0h2m2 0h3m1 0h2m1 0h2m2 0h2m1 0h1m1 0h3M4 29.5h3m2 0h1m2 0h5m2 0h1m3 0h2m1 0h2m2 0h1m4 0h1m2 0h1M4 30.5h1m2 0h4m2 0h1m1 0h2m2 0h1m1 0h1m2 0h1m1 0h1m3 0h5m1 0h1m2 0h2M4 31.5h1m4 0h1m2 0h1m2 0h2m1 0h1m1 0h1m1 0h1m2 0h1m1 0h1m2 0h1m2 0h2M4 32.5h1m4 0h3m2 0h1m1 0h1m1 0h2m1 0h1m2 0h1m1 0h1m1 0h9m2 0h1M12 33.5h1m2 0h1m2 0h1m1 0h1m2 0h3m1 0h2m3 0h1m3 0h2m1 0h1M4 34.5h7m3 0h1m1 0h2m1 0h2m3 0h3m2 0h1m2 0h1m1 0h1m1 0h1m1 0h3M4 35.5h1m5 0h1m1 0h3m1 0h3m2 0h2m1 0h3m1 0h1m3 0h1m3 0h2m1 0h1M4 36.5h1m1 0h3m1 0h1m1 0h1m6 0h1m2 0h1m3 0h1m1 0h9m1 0h1m1 0h1M4 37.5h1m1 0h3m1 0h1m1 0h1m2 0h1m1 0h1m2 0h1m1 0h4m1 0h1m3 0h1m1 0h2m1 0h2m2 0h1M4 38.5h1m1 0h3m1 0h1m1 0h3m3 0h2m5 0h2m2 0h2m6 0h1m1 0h2M4 39.5h1m5 0h1m3 0h5m5 0h2m1 0h1m2 0h1m1 0h2m2 0h1m3 0h1M4 40.5h7m1 0h1m2 0h1m1 0h1m2 0h2m1 0h1m2 0h5m2 0h2m1 0h1m1 0h3"
      />
    </svg>
  );
}

/**
 * Study Abroad — rendered as a literal dark frosted-glass boarding pass.
 *
 * Carrier wordmark, origin → destination codes with a gently drifting plane, a
 * grid of ticket fields with a short program blurb, a torn perforation seam,
 * and a stub whose QR scans straight to the UGA StudyAway program page. The one
 * section that frosts the scrubbed video in *dark* mode, so it reads as a
 * single ticket dropped into the page.
 */
export default function StudyAbroad() {
  const { title, from, to, visited, depart, ret, term, description, host, url } = studyAbroad;

  return (
    <section id="study-abroad" className="relative z-10 py-20 md:py-28">
      <div className="mx-auto max-w-container px-5 md:px-8">
        <Reveal>
          <article
            className="glass-dark relative mx-auto max-w-4xl overflow-hidden rounded-3xl text-dark-ink"
            style={{ background: "rgba(9,9,11,0.74)" }}
          >
            {/* soft top-right light for depth (monochrome) */}
            <div
              aria-hidden
              className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full"
              style={{ background: "radial-gradient(circle, rgba(255,255,255,0.08), transparent 70%)" }}
            />

            <div className="relative flex flex-col sm:flex-row">
              {/* ── Main ticket ─────────────────────────────────────────── */}
              <div className="flex-1 p-7 md:p-10">
                {/* carrier wordmark */}
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <img src="/logos/uga-global-education.png" alt="UGA Global Education" className="h-12 w-auto object-contain" />
                    <div>
                      <h2 className="font-display text-[21px] leading-none tracking-[-0.03em] text-dark-ink md:text-[24px]">{title}</h2>
                      <p className="mt-1.5 font-mono text-[10px] uppercase tracking-[0.22em] text-dark-ink-mute">Boarding Pass</p>
                    </div>
                  </div>
                  <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-dark-ink-mute">{term}</span>
                </div>

                {/* origin → destination */}
                <div className="mt-9 flex items-end justify-between gap-4">
                  <div>
                    <div className="font-display text-[42px] leading-[0.9] tracking-[-0.04em] text-dark-ink md:text-[56px]">{from.code}</div>
                    <div className="mt-2 font-mono text-[10px] uppercase tracking-[0.16em] text-dark-ink-mute">{from.city}</div>
                  </div>
                  <div className="relative mb-4 h-5 flex-1">
                    {/* one continuous dashed flight path */}
                    <div className="absolute inset-x-0 top-1/2 border-t border-dashed border-white/25" />
                    {/* plane glides the full length and eases back */}
                    <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 animate-fly motion-reduce:animate-none">
                      <Plane className="h-5 w-5 rotate-45 text-dark-ink-dim" />
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="font-display text-[42px] leading-[0.9] tracking-[-0.04em] text-dark-ink md:text-[56px]">{to.code}</div>
                    <div className="mt-2 font-mono text-[10px] uppercase tracking-[0.16em] text-dark-ink-mute">{to.city}</div>
                  </div>
                </div>

                {/* ticket fields */}
                <div className="mt-9 grid grid-cols-2 gap-x-6 gap-y-5 sm:grid-cols-3">
                  <Field label="Passenger" value={site.name} />
                  <Field label="Depart" value={depart} />
                  <Field label="Return" value={ret} />
                  <Field label="Visited" value={visited} className="col-span-2 sm:col-span-3" />
                </div>

                {/* program blurb */}
                <div className="mt-6 border-t border-dashed border-white/12 pt-5">
                  <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-dark-ink-mute">Program</div>
                  <p className="mt-1.5 max-w-[60ch] text-[13.5px] leading-[1.6] text-dark-ink-dim">{description}</p>
                </div>
              </div>

              {/* ── Perforation seam (row on mobile, column on desktop) ──── */}
              <div className="flex shrink-0 items-center justify-between px-7 sm:flex-col sm:px-0 sm:py-9">
                {Array.from({ length: 22 }).map((_, i) => (
                  <span
                    key={i}
                    className="h-[5px] w-[5px] rounded-full bg-black/35"
                    style={{ boxShadow: "inset 0 1px 1px rgba(0,0,0,0.5)" }}
                  />
                ))}
              </div>

              {/* ── Stub: scannable program QR (no repeated info) ────────── */}
              <div className="flex w-full shrink-0 flex-col items-center justify-center gap-4 p-7 sm:w-[220px] md:p-8">
                <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-dark-ink-mute">Scan to board</span>
                <a
                  href={url}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Open the UGA StudyAway program page"
                  className="group flex flex-col items-center gap-2.5 transition-transform duration-300 hover:-translate-y-0.5"
                >
                  <ProgramQR className="h-[124px] w-[124px] opacity-90 transition-opacity duration-300 group-hover:opacity-100" />
                  <span className="font-mono text-[9px] tracking-[0.18em] text-dark-ink-mute transition-colors group-hover:text-dark-ink">{host}</span>
                </a>
              </div>
            </div>
          </article>
        </Reveal>
      </div>
    </section>
  );
}
