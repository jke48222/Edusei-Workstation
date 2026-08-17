import { Link } from "react-router-dom";
import { site } from "../../content/site";
import { Eyebrow, EyebrowPill, Reveal, TagChip, ArrowUpRight } from "../ui";

export default function WhatIMake() {
  const { whatIMake: s } = site;
  return (
    <section id="topics" className="relative z-10">
      <div className="mx-auto max-w-container px-5 py-20 md:px-8 md:py-28">
        <div className="grid grid-cols-1 items-end gap-8 md:grid-cols-[1.4fr_1fr]">
          <Reveal>
            <EyebrowPill className="mb-6">{s.eyebrow}</EyebrowPill>
            <h2 className="over-video font-display text-[40px] leading-[0.98] md:text-[64px]">
              {s.title[0]} <span className="italic-accent">{s.title[1]}</span> {s.title[2]}
            </h2>
          </Reveal>
          <Reveal delay={120}>
            <div className="glass rounded-2xl p-5">
              <p className="text-[14px] leading-[1.55] text-ink-dim md:text-[15px]">{s.intro}</p>
            </div>
          </Reveal>
        </div>

        <div className="mt-14 grid gap-5 md:grid-cols-2">
          {s.pillars.map((p, i) => (
            <Reveal key={p.n} delay={i * 90}>
              <Link
                to={p.to}
                className="group block h-full glass rounded-2xl p-7 transition-transform duration-300 hover:-translate-y-1 md:p-9"
              >
                <div className="flex items-start justify-between">
                  <Eyebrow>{p.n}</Eyebrow>
                  <ArrowUpRight className="text-ink-mute transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                </div>
                <h3 className="mt-10 font-display text-[28px] leading-[1.02] text-ink md:text-[38px]">{p.title}</h3>
                <p className="mt-4 max-w-[40ch] text-[14px] leading-[1.55] text-ink-dim md:text-[15px]">{p.desc}</p>
                <div className="mt-7 flex flex-wrap gap-2">
                  {p.tags.map((t) => (
                    <TagChip key={t}>{t}</TagChip>
                  ))}
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
