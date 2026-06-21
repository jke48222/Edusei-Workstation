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
          <div className="glass mx-auto mt-7 max-w-[58ch] rounded-2xl px-6 py-5">
            <p className="text-[14px] leading-[1.6] text-ink md:text-[16px]">{s.body}</p>
          </div>

          <div className="mt-10 flex justify-center">
            <a href={site.socials.email}
              className="group inline-flex items-center gap-3 whitespace-nowrap rounded-full bg-white px-6 py-3.5 font-display text-[14px] text-ink transition-transform duration-300 hover:-translate-y-0.5">
              {s.subscribeCta}
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-ink text-white transition-transform duration-300 group-hover:translate-x-0.5"><ArrowRight className="h-3.5 w-3.5" /></span>
            </a>
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
