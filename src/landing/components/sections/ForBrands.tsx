import { site } from "../../content/site";
import { EyebrowPill, Reveal, TagChip, BtnPrimary } from "../ui";

export default function ForBrands() {
  const { forBrands: s } = site;
  return (
    <section className="relative z-10 py-20 md:py-28">
      <div className="mx-auto max-w-container px-5 md:px-8">
        <Reveal>
          <div className="glass-strong rounded-3xl p-8 md:p-12">
            <div className="grid grid-cols-1 gap-8 md:grid-cols-[1fr_auto] md:items-start">
              <div>
                <div className="mb-6 flex flex-wrap items-center gap-3">
                  <EyebrowPill>{s.eyebrow}</EyebrowPill>
                  <span className="eyebrow">{s.label}</span>
                </div>
                <h2 className="max-w-[20ch] font-display text-[28px] leading-[1.05] text-ink md:text-[40px]">{s.title}</h2>
                <p className="mt-5 max-w-[60ch] text-[14px] leading-[1.6] text-ink-dim md:text-[15px]">{s.body}</p>
                <div className="mt-7 flex flex-wrap gap-2">
                  {s.tags.map((t) => <TagChip key={t}>{t}</TagChip>)}
                </div>
              </div>
              <div className="md:pt-2">
                <BtnPrimary href={s.cta.href} match target="_blank">{s.cta.label}</BtnPrimary>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
