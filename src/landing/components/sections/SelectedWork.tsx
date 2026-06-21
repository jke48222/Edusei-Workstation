import { useLayoutEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Globe, Cpu, Radio, Headset, FlaskConical, Brain, Github, type LucideIcon,
} from "lucide-react";
import { getProjectBySlug, type WorkProject, type ProjectCategory } from "../../../data";

/** Curated Selected Work for the home page (decoupled from /work's featured order). */
const HOME_WORK_IDS = [
  "animaldot",
  "personal-portfolio",
  "musical-artist-site",
  "kitchen-chaos-vr",
  "live-election-platform",
  "primeforge-fpga",
  "parmco-ble-motor",
  "ubersicht-widgets",
];
import { useInView } from "../../lib/hooks";
import { EyebrowPill, Reveal, ArrowUpRight } from "../ui";

const CAT_ICON: Record<ProjectCategory, LucideIcon> = {
  web: Globe, embedded: Cpu, hardware: Radio, vr: Headset, research: FlaskConical, ai: Brain,
};
const CAT_LABEL: Record<ProjectCategory, string> = {
  web: "Web & Product", embedded: "Embedded", hardware: "Hardware",
  vr: "VR / XR", research: "Research", ai: "AI Application",
};

/** A live, width-filling iframe preview of a real site — mounted only once scrolled into view. */
function SiteFrame({ url }: { url: string }) {
  const { ref, inView } = useInView<HTMLDivElement>({ threshold: 0.1 });
  const [w, setW] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const LOGICAL_W = 1280;

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const update = () => setW(el.clientWidth);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [ref]);

  const scale = w ? w / LOGICAL_W : 0;
  return (
    <div ref={ref} className="absolute inset-0 overflow-hidden bg-[#0c0d10]">
      {inView && scale > 0 && (
        <iframe
          src={url}
          title="Live preview"
          loading="lazy"
          tabIndex={-1}
          aria-hidden
          onLoad={() => setLoaded(true)}
          className="absolute left-0 top-0 origin-top-left border-0 bg-white"
          style={{ width: LOGICAL_W, height: LOGICAL_W * 0.62, transform: `scale(${scale})`, pointerEvents: "none" }}
        />
      )}
      {!loaded && <div className="absolute inset-0 grid place-items-center"><span className="h-6 w-6 animate-spin rounded-full border-2 border-white/25 border-t-white/70" /></div>}
    </div>
  );
}

function TileMedia({ project }: { project: WorkProject }) {
  const m = project.tileMedia;
  const Glyph = project.category ? CAT_ICON[project.category] : Globe;

  if (m?.kind === "video") {
    return (
      <>
        <video className="absolute inset-0 h-full w-full object-cover" src={m.src} poster={m.poster} autoPlay loop muted playsInline preload="metadata" aria-label={m.alt} />
        <span className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-black/5" />
      </>
    );
  }
  if (m?.kind === "image") {
    return <img src={m.src} alt={m.alt} loading="lazy" className="absolute inset-0 h-full w-full object-cover" />;
  }
  // Live site → real iframe preview.
  if (m?.kind === "site") {
    return <SiteFrame url={m.url} />;
  }
  // model / globe / self-framing site → branded charcoal panel with the category glyph
  return (
    <div className="absolute inset-0 overflow-hidden bg-[#14151b]">
      <div className="absolute inset-0 opacity-[0.14]" style={{ backgroundImage: "radial-gradient(#ffffff 1px, transparent 1.4px)", backgroundSize: "22px 22px" }} aria-hidden />
      <Glyph className="absolute left-1/2 top-1/2 h-20 w-20 -translate-x-1/2 -translate-y-1/2 text-white/25" strokeWidth={1} />
    </div>
  );
}

function WorkCard({ project, featured = false }: { project: WorkProject; featured?: boolean }) {
  const to = `/work/${project.id}`;
  const catLabel = project.category ? CAT_LABEL[project.category] : project.location;
  const Icon = project.category ? CAT_ICON[project.category] : Globe;
  const isLive = project.tileMedia?.kind === "site" || Boolean(project.liveUrl);

  return (
    <Reveal className={featured ? "md:col-span-2" : ""}>
      <article className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-[var(--line)] bg-bg-elev shadow-[0_10px_40px_rgba(10,10,10,0.08)] transition-all duration-500 hover:-translate-y-1.5 hover:shadow-[0_22px_60px_rgba(10,10,10,0.18)]">
        <div className={`relative w-full overflow-hidden ${featured ? "h-60 md:h-72" : "h-52"}`}>
          <TileMedia project={project} />
          <Link to={to} aria-label={`Open ${project.title}`} className="absolute inset-0 z-[1]" />
          <span className="pointer-events-none absolute left-4 top-4 z-[2] inline-flex items-center gap-1.5 rounded-full bg-black/55 px-3 py-1 text-[11px] font-medium text-white backdrop-blur-md">
            <Icon className="h-3.5 w-3.5" strokeWidth={2} /> {catLabel}
          </span>
          {isLive && (
            <span className="pointer-events-none absolute right-4 top-4 z-[2] inline-flex items-center gap-1.5 rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-ink">
              <span className="h-1.5 w-1.5 animate-pulseDot rounded-full bg-ink" /> Live
            </span>
          )}
          <Link to={to} aria-label={`Open ${project.title}`} className="absolute bottom-4 right-4 z-[2] flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-ink backdrop-blur-md transition-all duration-500 group-hover:bg-ink group-hover:text-white">
            <ArrowUpRight className="h-5 w-5" />
          </Link>
        </div>

        <div className="flex flex-1 flex-col p-5 md:p-6">
          <div className="flex items-start justify-between gap-3">
            <Link to={to} className={`font-display tracking-[-0.03em] text-ink transition-colors hover:opacity-70 ${featured ? "text-[24px]" : "text-[20px]"}`}>
              {project.title}
            </Link>
            {project.github && (
              <a href={project.github} target="_blank" rel="noopener noreferrer" aria-label={`${project.title} on GitHub`} className="mt-1 shrink-0 text-ink-mute transition-colors hover:text-ink">
                <Github className="h-4 w-4" />
              </a>
            )}
          </div>
          <p className="mt-1.5 font-mono text-[11px] uppercase tracking-[0.12em] text-ink-mute">{project.period}</p>
          <p className="mt-3 line-clamp-2 text-[14px] leading-[1.55] text-ink-dim">{project.tagline}</p>
          <div className="mt-auto flex flex-wrap gap-1.5 pt-5">
            {project.techStack.slice(0, featured ? 5 : 3).map((t) => (
              <span key={t} className="tag-chip !py-1 !text-[10px]">{t}</span>
            ))}
            {project.techStack.length > (featured ? 5 : 3) && (
              <span className="self-center font-mono text-[10px] text-ink-mute">+{project.techStack.length - (featured ? 5 : 3)}</span>
            )}
          </div>
        </div>
      </article>
    </Reveal>
  );
}

export default function SelectedWork() {
  const projects = HOME_WORK_IDS
    .map((id) => getProjectBySlug(id))
    .filter((p): p is WorkProject => Boolean(p));
  return (
    <section id="work" className="relative z-10 py-20 md:py-28">
      <div className="mx-auto max-w-container px-5 md:px-8">
        <Reveal className="mb-12">
          <EyebrowPill className="mb-5">SELECTED WORK</EyebrowPill>
          <Link to="/work" className="over-bright group inline-flex items-baseline gap-2 font-display text-[36px] leading-[0.98] md:text-[56px]">
            View all work
            <ArrowUpRight className="h-6 w-6 self-center transition-transform group-hover:translate-x-1 group-hover:-translate-y-1 md:h-8 md:w-8" />
          </Link>
        </Reveal>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {projects.map((p, i) => (
            <WorkCard key={p.id} project={p} featured={i === 0} />
          ))}
        </div>
      </div>
    </section>
  );
}
