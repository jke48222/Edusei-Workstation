import { site } from "../../content/site";
import { workExperience } from "../../../data";
import { EyebrowPill, Reveal, ArrowRight } from "../ui";

/** Company monogram badges (real logos aren't available for most of these). */
const MONOGRAM: Record<string, string> = {
  "Capital One": "C1",
  "University of Georgia Housing": "UGA",
  "Joyner Research Laboratory": "JR",
  "Great American Cookies & Marble Slab Creamery": "GA",
};

function monogram(company: string): string {
  if (MONOGRAM[company]) return MONOGRAM[company];
  return company
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

export default function Experience() {
  const { experience: s } = site;
  return (
    <section id="experience" className="relative z-10 py-20 md:py-28">
      <div className="mx-auto max-w-container px-5 md:px-8">
        <Reveal className="mb-12">
          <EyebrowPill className="mb-6">{s.eyebrow}</EyebrowPill>
          <h2 className="over-video font-display text-[40px] leading-[0.98] md:text-[64px]">
            {s.title[0]} <span className="italic-accent">{s.title[1]}</span>
          </h2>
        </Reveal>

        <div className="grid gap-5 md:grid-cols-2">
          {workExperience.map((role, i) => (
            <Reveal key={role.title + role.company} delay={(i % 2) * 90}>
              <article className="glass-strong flex h-full flex-col rounded-2xl p-7 md:p-8">
                <div className="mb-4 flex items-center gap-3">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-ink font-display text-[13px] font-semibold tracking-tight text-white">
                    {monogram(role.company)}
                  </span>
                  <div className="min-w-0">
                    <h3 className="font-display text-[20px] leading-tight tracking-[-0.03em] text-ink">{role.title}</h3>
                    <p className="truncate text-[13px] text-ink-dim">{role.company}</p>
                  </div>
                </div>
                <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-ink-mute">{role.period} · {role.location}</p>
                <ul className="mt-4 space-y-2.5">
                  {role.highlights.slice(0, 3).map((h) => (
                    <li key={h} className="flex gap-2.5 text-[13px] leading-[1.55] text-ink-dim">
                      <ArrowRight className="mt-0.5 h-3.5 w-3.5 shrink-0 text-ink" />
                      <span>{h}</span>
                    </li>
                  ))}
                </ul>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
