import { FileBadge } from "lucide-react";
import { site } from "../../content/site";
import { certifications } from "../../../data";
import { EyebrowPill, Reveal } from "../ui";

export default function Certifications() {
  const { certifications: s } = site;
  return (
    <section id="certifications" className="relative z-10 py-20 md:py-28">
      <div className="mx-auto max-w-container px-5 md:px-8">
        <Reveal className="mb-12">
          <EyebrowPill className="mb-6">{s.eyebrow}</EyebrowPill>
          <h2 className="over-video font-display text-[34px] leading-[1.02] md:text-[52px]">
            {s.title[0]} <span className="italic-accent">{s.title[1]}</span>
          </h2>
        </Reveal>

        <div className="grid gap-5 md:grid-cols-2">
          {certifications.map((c, i) => (
            <Reveal key={c.title} delay={(i % 2) * 90}>
              <article className="glass-strong flex h-full flex-col rounded-2xl p-7 md:p-8">
                <div className="mb-4 flex items-center justify-between">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-ink text-white"><FileBadge className="h-5 w-5" /></span>
                  <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-ink-mute">{c.date}</span>
                </div>
                <h3 className="font-display text-[19px] tracking-[-0.02em] text-ink">{c.title}</h3>
                <p className="mt-1 text-[13px] text-ink-dim">{c.org}</p>
                <p className="mt-3 text-[14px] leading-[1.55] text-ink-dim">{c.summary}</p>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
