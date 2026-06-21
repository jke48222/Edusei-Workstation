import { Code2, Boxes, Cpu, Brain, Sparkles, type LucideIcon } from "lucide-react";
import { site } from "../../content/site";
import { skillsData } from "../../../data";
import { Eyebrow, EyebrowPill, Reveal } from "../ui";
import { TechGlyph } from "../../lib/techIcons";

type Category = { title: string; icon: LucideIcon; items: string[] };

/** Full skill set, grouped, sourced from data.ts (single source of truth). */
const CATEGORIES: Category[] = [
  { title: "Languages", icon: Code2, items: skillsData.programming },
  { title: "Software & Tools", icon: Boxes, items: skillsData.software },
  { title: "Embedded & Hardware", icon: Cpu, items: skillsData.hardware },
  { title: "AI & Machine Learning", icon: Brain, items: skillsData.ai },
  { title: "Core Strengths", icon: Sparkles, items: skillsData.core },
];

function Chip({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--line)] bg-white/70 px-2.5 py-1.5 text-[12px] font-medium tracking-[-0.01em] text-ink-dim transition-colors hover:border-[var(--line-strong)] hover:text-ink">
      <TechGlyph label={label} />
      {label}
    </span>
  );
}

export default function Skills() {
  const { stack: s } = site;
  return (
    <section id="skills" className="relative z-10 py-20 md:py-28">
      <div className="mx-auto max-w-container px-5 md:px-8">
        <Reveal className="mb-10 flex flex-col items-start gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <EyebrowPill className="mb-5">{s.eyebrow}</EyebrowPill>
            <h2 className="over-video max-w-[16ch] font-display text-[34px] leading-[1.0] md:text-[52px]">
              {s.title}
            </h2>
          </div>
          <Eyebrow className="over-video-dim shrink-0">{s.count}</Eyebrow>
        </Reveal>

        <div className="grid items-start gap-4 md:grid-cols-2 xl:grid-cols-3">
          {CATEGORIES.map((cat, i) => (
            <Reveal key={cat.title} delay={(i % 3) * 80} className={cat.title === "Software & Tools" ? "xl:col-span-2" : ""}>
              <div className="glass-strong h-full rounded-2xl p-6 md:p-7">
                <div className="mb-5 flex items-center gap-2.5">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-ink text-white">
                    <cat.icon className="h-4 w-4" strokeWidth={2} />
                  </span>
                  <h3 className="font-display text-[18px] tracking-[-0.03em] text-ink">{cat.title}</h3>
                  <span className="ml-auto font-mono text-[11px] text-ink-mute">{cat.items.length}</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {cat.items.map((label) => (
                    <Chip key={cat.title + label} label={label} />
                  ))}
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
