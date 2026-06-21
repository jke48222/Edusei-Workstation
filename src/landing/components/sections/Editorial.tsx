import { site } from "../../content/site";
import { Reveal, BtnPrimary } from "../ui";
import Terminal from "./Terminal";

function NoteCard({
  eyebrow, title, body, cta, align = "left",
}: {
  eyebrow: string; title: string; body: string;
  cta: { label: string; href: string }; align?: "left" | "right";
}) {
  return (
    <Reveal className={align === "right" ? "md:ml-auto" : ""}>
      <div className="glass-strong max-w-[440px] rounded-2xl p-7 md:p-9">
        <span className="eyebrow-pill">{eyebrow}</span>
        <h3 className="mt-6 font-display text-[28px] leading-[1.02] text-ink md:text-[36px]">{title}</h3>
        <p className="mt-4 text-[14px] leading-[1.55] text-ink-dim md:text-[15px]">{body}</p>
        <div className="mt-7">
          <BtnPrimary href={cta.href} target={cta.href.startsWith("http") ? "_blank" : undefined}>
            {cta.label}
          </BtnPrimary>
        </div>
      </div>
    </Reveal>
  );
}

export default function Editorial() {
  const { editorial: e } = site;
  return (
    <div className="relative z-10">
      {/* The Workstation + terminal */}
      <section className="py-20 md:py-28">
        <div className="mx-auto grid w-full max-w-container items-stretch gap-6 px-5 md:grid-cols-2 md:px-8">
          <div className="flex items-center">
            <NoteCard {...e.community} align="left" />
          </div>
          <Reveal delay={120} className="h-[420px]">
            <Terminal />
          </Reveal>
        </div>
      </section>
    </div>
  );
}
