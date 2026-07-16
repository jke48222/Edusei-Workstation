import { lazy, Suspense, useLayoutEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Globe, Cpu, Radio, Headset, FlaskConical, Brain, Github, type LucideIcon,
} from "lucide-react";
import { getProjectBySlug, type WorkProject, type ProjectCategory } from "../../../data";
import { useInView } from "../../lib/hooks";
import { EyebrowPill, Reveal, ArrowUpRight } from "../ui";

// Lazy 3D mini-viewer — keeps three.js out of the home's initial bundle; mounts in-view.
const TileModel = lazy(() => import("../../../components/work/ui/TileModel"));

/** Bento tile footprint. Spans are applied from `md` up; base is a uniform 1-col stack. */
type BentoSize = "lg" | "wide" | "tall" | "sm";

/**
 * Curated Selected Work as a bento mosaic (decoupled from /work's featured order).
 * Source order + per-tile size is tuned so the tiles pack with no gaps on both the
 * 2-col (md) and 4-col (xl) grids, and each project's medium sits in a shape that
 * flatters it: models/videos fill the large squares, the CubeSat model stands in the
 * tall tile, and the landscape live-site iframes take the small/wide cells.
 *
 *   xl (4 cols)          md (2 cols)
 *   ┌─────┬──┬──┐        ┌─────┐
 *   │ ani │me│ms│        │ ani │
 *   │ mal │me│le│        │ mal │
 *   ├──┴──┼──┴──┤        ├──┬──┤
 *   │ kit │ pri │        │me│ms│
 *   ├──┬──┤ me  │        │me│le│
 *   │pp│pa│ for │        ├──┴──┤   … (kitchen, primeforge, pp, parmco follow)
 *   └──┴──┴─────┘        └─────┘
 */
const BENTO_LAYOUT: { id: string; size: BentoSize }[] = [
  { id: "animaldot", size: "lg" },
  { id: "memesat", size: "tall" },
  { id: "musical-artist-site", size: "sm" },
  { id: "live-election-platform", size: "sm" },
  { id: "kitchen-chaos-vr", size: "wide" },
  { id: "primeforge-fpga", size: "lg" },
  { id: "personal-portfolio", size: "sm" },
  { id: "parmco-ble-motor", size: "sm" },
];

/** Column/row spans per size — `md:` prefixes persist up into the xl grid unchanged. */
const SIZE_SPAN: Record<BentoSize, string> = {
  lg: "md:col-span-2 md:row-span-2",
  wide: "md:col-span-2",
  tall: "md:row-span-2",
  sm: "",
};

const CAT_ICON: Record<ProjectCategory, LucideIcon> = {
  web: Globe, embedded: Cpu, hardware: Radio, vr: Headset, research: FlaskConical, ai: Brain,
};

/** Interactive 3D model preview (auto-rotates), mounted only once scrolled into view. */
function ModelMedia({ src, rotation }: { src: string; rotation?: [number, number, number] }) {
  const { ref, inView } = useInView<HTMLDivElement>({ threshold: 0.1 });
  return (
    <div ref={ref} className="absolute inset-0 overflow-hidden bg-[#14151b]">
      <div className="absolute inset-0 opacity-[0.12]" style={{ backgroundImage: "radial-gradient(#ffffff 1px, transparent 1.4px)", backgroundSize: "22px 22px" }} aria-hidden />
      {inView && (
        <Suspense fallback={null}>
          <TileModel src={src} interactive={false} rotation={rotation} />
        </Suspense>
      )}
    </div>
  );
}
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
  if (m?.kind === "model") {
    return <ModelMedia src={m.src} rotation={m.rotation} />;
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

function WorkCard({ project, size, delay = 0 }: { project: WorkProject; size: BentoSize; delay?: number }) {
  const to = `/work/${project.id}`;
  const catLabel = project.category ? CAT_LABEL[project.category] : project.location;
  const Icon = project.category ? CAT_ICON[project.category] : Globe;
  const isLive = project.tileMedia?.kind === "site" || Boolean(project.liveUrl);
  const large = size === "lg";
  // Two-column tiles (lg/wide) have room for a wrapping chip row; one-column tiles
  // (sm/tall) keep a single, non-wrapping line so every footer — and the media above
  // it — stays a consistent height across the mosaic.
  const twoCol = size === "lg" || size === "wide";
  const title = project.shortTitle ?? project.title;
  const chipCount = twoCol ? 5 : 2;

  return (
    <Reveal delay={delay} className={`min-w-0 ${SIZE_SPAN[size]}`}>
      <article className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-[var(--line)] bg-bg-elev shadow-[0_10px_40px_rgba(10,10,10,0.08)] transition-all duration-500 hover:-translate-y-1.5 hover:shadow-[0_22px_60px_rgba(10,10,10,0.18)]">
        {/* Media fills a fixed strip on mobile, then flexes to fill the bento cell from md up. */}
        <div className="relative h-52 w-full overflow-hidden md:h-auto md:min-h-0 md:flex-1">
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

        <div className="flex flex-col p-4 md:p-5">
          <div className="flex items-start justify-between gap-3">
            <Link to={to} className={`block font-display tracking-[-0.03em] text-ink transition-colors [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:2] overflow-hidden hover:opacity-70 ${large ? "text-[24px] leading-[1.05]" : "text-[18px] leading-[1.1]"}`}>
              {title}
            </Link>
            {project.github && (
              <a href={project.github} target="_blank" rel="noopener noreferrer" aria-label={`${project.title} on GitHub`} className="mt-1 shrink-0 text-ink-mute transition-colors hover:text-ink">
                <Github className="h-4 w-4" />
              </a>
            )}
          </div>
          <p className="mt-1.5 font-mono text-[11px] uppercase tracking-[0.12em] text-ink-mute">{project.period}</p>
          <p className={`mt-2 text-[13px] leading-[1.5] text-ink-dim ${large ? "line-clamp-2 md:mt-3 md:text-[14px]" : "line-clamp-1"}`}>{project.tagline}</p>
          <div className={`mt-3 flex gap-1.5 ${twoCol ? "flex-wrap" : "flex-nowrap overflow-hidden"}`}>
            {project.techStack.slice(0, chipCount).map((t) => (
              <span key={t} className="tag-chip whitespace-nowrap !py-1 !text-[10px]">{t}</span>
            ))}
            {project.techStack.length > chipCount && (
              <span className="self-center whitespace-nowrap font-mono text-[10px] text-ink-mute">+{project.techStack.length - chipCount}</span>
            )}
          </div>
        </div>
      </article>
    </Reveal>
  );
}

export default function SelectedWork() {
  const items = BENTO_LAYOUT
    .map(({ id, size }) => ({ project: getProjectBySlug(id), size }))
    .filter((x): x is { project: WorkProject; size: BentoSize } => Boolean(x.project));
  return (
    <section id="work" className="relative z-10 py-20 md:py-28">
      <div className="mx-auto max-w-container px-5 md:px-8">
        <Reveal className="mb-12">
          <div className="mb-5">
            <EyebrowPill>SELECTED WORK</EyebrowPill>
          </div>
          <Link to="/work" className="over-bright group flex w-fit items-baseline gap-2 font-display text-[36px] leading-[0.98] md:text-[56px]">
            View all work
            <ArrowUpRight className="h-6 w-6 self-center transition-transform group-hover:translate-x-1 group-hover:-translate-y-1 md:h-8 md:w-8" />
          </Link>
        </Reveal>

        {/* Bento mosaic: 1-col stack on mobile → 2-col (md) → 4-col (xl), with a fixed
            row height so the lg/tall tiles span two rows and the media flexes to fill. */}
        <div className="grid grid-cols-1 gap-4 md:auto-rows-[264px] md:grid-cols-2 xl:grid-cols-4">
          {items.map(({ project, size }, i) => (
            <WorkCard key={project.id} project={project} size={size} delay={i * 55} />
          ))}
        </div>
      </div>
    </section>
  );
}
