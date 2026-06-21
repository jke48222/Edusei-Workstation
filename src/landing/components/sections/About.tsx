import { Link } from "react-router-dom";
import { Github, Linkedin, Mail, FileText, FileBadge, Code2, Boxes, ArrowUpRight, type LucideIcon } from "lucide-react";
import { site } from "../../content/site";
import { EyebrowPill, Reveal } from "../ui";

type LinkItem = { label: string; sub: string; href: string; icon: LucideIcon; internal?: boolean };

const LINKS: LinkItem[] = [
  { label: "GitHub", sub: "jke48222", href: site.socials.github, icon: Github },
  { label: "LinkedIn", sub: "in/jalenedusei", href: site.socials.linkedin, icon: Linkedin },
  { label: "Email", sub: "jalen.edusei@gmail.com", href: site.socials.email, icon: Mail },
  { label: "Résumé", sub: "PDF", href: site.socials.resume, icon: FileText },
  { label: "CV", sub: "PDF", href: site.socials.cv, icon: FileBadge },
  { label: "Source", sub: "this site on GitHub", href: site.socials.source, icon: Code2 },
];

function LinkTile({ item }: { item: LinkItem }) {
  const inner = (
    <>
      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-ink text-white transition-transform duration-300 group-hover:scale-105">
        <item.icon className="h-4.5 w-4.5" strokeWidth={1.8} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block font-display text-[15px] tracking-[-0.02em] text-ink">{item.label}</span>
        <span className="block truncate font-mono text-[11px] text-ink-mute">{item.sub}</span>
      </span>
      <ArrowUpRight className="h-4 w-4 shrink-0 text-ink-mute transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
    </>
  );
  const cls = "group flex items-center gap-3 rounded-2xl border border-[var(--line)] bg-bg-elev p-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-[var(--line-strong)] hover:shadow-[0_12px_30px_rgba(10,10,10,0.1)]";
  return item.internal ? (
    <Link to={item.href} className={cls}>{inner}</Link>
  ) : (
    <a href={item.href} target={item.href.startsWith("http") ? "_blank" : undefined} rel="noreferrer" className={cls}>{inner}</a>
  );
}

export default function About() {
  const { about: s } = site;
  return (
    <section id="about" className="relative z-10 py-20 md:py-28">
      <div className="mx-auto max-w-container px-5 md:px-8">
        <Reveal className="mb-12">
          <EyebrowPill className="mb-6">{s.eyebrow}</EyebrowPill>
          <h2 className="over-video max-w-[20ch] font-display text-[36px] leading-[1.0] md:text-[56px]">
            {s.title[0]} <span className="italic-accent">{s.title[1]}</span> {s.title[2]}
          </h2>
        </Reveal>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-[1.05fr_0.95fr]">
          {/* Bio + info */}
          <Reveal>
            <div className="glass-strong h-full rounded-2xl p-7 md:p-9">
              <h3 className="font-display text-[28px] leading-[1.05] text-ink md:text-[34px]">{s.greeting}</h3>
              <p className="mt-4 max-w-[60ch] text-[14px] leading-[1.6] text-ink-dim md:text-[15px]">{s.bio}</p>
              <div className="mt-8 grid grid-cols-2 gap-x-6 gap-y-6 border-t border-[var(--line)] pt-8">
                {s.info.map((it) => (
                  <div key={it.label}>
                    <div className="eyebrow">{it.label}</div>
                    <div className="mt-1.5 font-display text-[15px] tracking-[-0.02em] text-ink">{it.value}</div>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>

          {/* Links (replaces the headshot) */}
          <Reveal delay={120}>
            <div className="grid h-full grid-cols-1 gap-3 sm:grid-cols-2">
              {LINKS.map((l) => <LinkTile key={l.label} item={l} />)}
              <Link
                to="/workstation"
                className="group col-span-1 flex items-center gap-3 rounded-2xl bg-ink p-4 text-white transition-all duration-300 hover:-translate-y-0.5 sm:col-span-2"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15"><Boxes className="h-4.5 w-4.5" /></span>
                <span className="flex-1">
                  <span className="block font-display text-[15px] tracking-[-0.02em]">Explore the 3D Workstation</span>
                  <span className="block font-mono text-[11px] text-white/60">a portfolio you can walk through</span>
                </span>
                <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </Link>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
