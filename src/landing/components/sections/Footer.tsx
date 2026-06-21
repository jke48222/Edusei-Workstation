import { Link } from "react-router-dom";
import { Github, Linkedin, Mail, FileText, FileBadge, Code2, Boxes, type LucideIcon } from "lucide-react";
import { site } from "../../content/site";

type IconLink = { label: string; href: string; icon: LucideIcon; internal?: boolean };

const ICON_LINKS: IconLink[] = [
  { label: "GitHub", href: site.socials.github, icon: Github },
  { label: "LinkedIn", href: site.socials.linkedin, icon: Linkedin },
  { label: "Email", href: site.socials.email, icon: Mail },
  { label: "Résumé", href: site.socials.resume, icon: FileText },
  { label: "CV", href: site.socials.cv, icon: FileBadge },
  { label: "Source code", href: site.socials.source, icon: Code2 },
  { label: "3D Workstation", href: "/workstation", icon: Boxes, internal: true },
];

function IconButton({ item }: { item: IconLink }) {
  const cls = "flex h-11 w-11 items-center justify-center rounded-full border border-[var(--line)] bg-bg-elev text-ink-dim transition-all hover:-translate-y-0.5 hover:border-ink hover:text-ink";
  const inner = <item.icon className="h-[18px] w-[18px]" strokeWidth={1.8} />;
  return item.internal ? (
    <Link to={item.href} aria-label={item.label} title={item.label} className={cls}>{inner}</Link>
  ) : (
    <a href={item.href} target={item.href.startsWith("http") ? "_blank" : undefined} rel="noreferrer" aria-label={item.label} title={item.label} className={cls}>{inner}</a>
  );
}

export default function Footer() {
  return (
    <footer className="relative z-10 overflow-hidden bg-bg pt-16 text-ink">
      <div className="mx-auto max-w-container px-5 md:px-8">
        <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
          <p className="max-w-[32ch] text-[14px] leading-[1.5] text-ink-dim">
            {site.degree}. Open to software, technology, business, and data roles.
          </p>
          <div className="flex flex-wrap gap-2.5">
            {ICON_LINKS.map((l) => <IconButton key={l.label} item={l} />)}
          </div>
        </div>

        {/* oversized wordmark */}
        <div className="pointer-events-none select-none pt-10">
          <div className="font-display text-[18vw] leading-[0.8] tracking-[-0.05em] text-ink md:text-[15vw]">
            {site.name}
          </div>
        </div>

        <div className="flex flex-col items-start justify-between gap-3 border-t border-[var(--line)] py-7 md:flex-row md:items-center">
          <span className="text-[12px] text-ink-mute">{site.footer.copyright}</span>
          <span className="font-mono text-[11px] tracking-[0.06em] text-ink-mute">Athens, GA · {site.email}</span>
        </div>
      </div>
    </footer>
  );
}
