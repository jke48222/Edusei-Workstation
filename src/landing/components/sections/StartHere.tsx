import { site, socialRow } from "../../content/site";
import { EyebrowPill, Reveal, ArrowRight } from "../ui";

export default function StartHere() {
  const { startHere: s } = site;
  return (
    <section id="contact" className="on-dark relative z-10 overflow-hidden">
      <div className="relative mx-auto max-w-container px-5 py-24 text-center md:px-8 md:py-32">
        <Reveal>
          <EyebrowPill className="mb-7">{s.eyebrow}</EyebrowPill>
          <h2 className="over-video mx-auto max-w-[16ch] font-display text-[40px] leading-[1.0] md:text-[80px]">
            {s.title[0]} <span className="italic-accent">{s.title[1]}</span>
          </h2>
          <p className="over-video-dim mx-auto mt-6 max-w-[54ch] text-[14px] leading-[1.6] md:text-[16px]">{s.body}</p>

          <div className="mx-auto mt-10 flex max-w-[460px] items-center gap-2 rounded-full bg-white p-1.5 pl-2">
            <a href={site.socials.email}
              className="inline-flex items-center gap-2 whitespace-nowrap rounded-full bg-ink px-5 py-3 font-display text-[13px] text-white">
              {s.subscribeCta}
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white text-ink"><ArrowRight className="h-3.5 w-3.5" /></span>
            </a>
            <input
              type="email"
              placeholder={s.emailPlaceholder}
              className="min-w-0 flex-1 bg-transparent px-3 text-[14px] text-ink outline-none placeholder:text-ink-mute"
            />
          </div>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
            {socialRow.map((soc) => (
              <a key={soc.label} href={soc.href} target="_blank" rel="noreferrer"
                className="over-video link-underline font-display text-[12px] tracking-[0.08em] text-white">
                {soc.short}
              </a>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
