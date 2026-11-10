import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { IDE_PROJECTS, PROJECT_FOLDERS, LANG_LABELS, type IdeProject } from "../../../components/ide/projectRegistry";
import { useInView } from "../../lib/hooks";
import { useAutoplayInView } from "../../../hooks/useOnScreen";
import { ArrowUpRight } from "../ui";

/**
 * A miniature of the real workstation, built from the same registry the IDE reads:
 * the explorer lists actual project files and the editor shows the selected
 * project's own footage. Every file links into /workstation with that file open.
 */

const MAX_FILES = 5;
const ADVANCE_MS = 5200;

type Still = { kind: "video"; src: string; poster?: string; alt: string } | { kind: "image"; src: string; alt: string };

/** Only footage that already ships in /public: no iframes, no 3D canvases in a preview. */
function stillFor(p: IdeProject): Still | undefined {
  const m = p.project.tileMedia;
  if (!m) return undefined;
  if (m.kind === "video") return m;
  if (m.kind === "image") return m;
  if (m.kind === "site" && m.screenshot) return { kind: "image", src: m.screenshot, alt: `${p.title} home page` };
  return undefined;
}

function Footage({ still }: { still: Still }) {
  const videoRef = useAutoplayInView<HTMLVideoElement>(0.3);
  const cls = "absolute inset-0 h-full w-full object-cover";
  return still.kind === "video" ? (
    <video ref={videoRef} src={still.src} poster={still.poster} muted loop playsInline preload="metadata" aria-label={still.alt} className={cls} />
  ) : (
    <img src={still.src} alt={still.alt} loading="lazy" className={cls} />
  );
}

export default function IdePreview() {
  const files = useMemo(
    () => IDE_PROJECTS.filter((p) => stillFor(p)).slice(0, MAX_FILES),
    []
  );
  const { ref, inView } = useInView<HTMLDivElement>({ threshold: 0.3 });
  const [active, setActive] = useState(0);
  const [pinned, setPinned] = useState(false);

  useEffect(() => {
    if (!inView || pinned || files.length < 2) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = setInterval(() => setActive((i) => (i + 1) % files.length), ADVANCE_MS);
    return () => clearInterval(id);
  }, [inView, pinned, files.length]);

  const current = files[active];
  if (!current) return null;
  const still = stillFor(current)!;
  const href = `/workstation?file=${encodeURIComponent(current.file)}`;

  return (
    <div
      ref={ref}
      className="glass-dark flex h-full flex-col overflow-hidden rounded-2xl !bg-[rgba(12,12,12,0.88)] font-mono text-[12px] leading-relaxed"
      onMouseEnter={() => setPinned(true)}
      onFocus={() => setPinned(true)}
    >
      {/* title bar: the open file's real path */}
      <div className="flex items-center gap-3 border-b border-[var(--dark-line)] px-4 py-3">
        <span className="flex gap-1.5" aria-hidden>
          <span className="h-2.5 w-2.5 rounded-full bg-white/30" />
          <span className="h-2.5 w-2.5 rounded-full bg-white/30" />
          <span className="h-2.5 w-2.5 rounded-full bg-white/30" />
        </span>
        <span className="min-w-0 flex-1 truncate text-dark-ink-dim">{current.path}</span>
        <span className="hidden shrink-0 text-dark-ink-mute sm:inline">{LANG_LABELS[current.lang]}</span>
      </div>

      <div className="flex min-h-0 flex-1">
        {/* explorer */}
        <nav aria-label="Project files" className="hidden w-[204px] shrink-0 flex-col border-r border-[var(--dark-line)] py-3 sm:flex">
          <p className="px-4 pb-2 text-[10px] uppercase tracking-[0.16em] text-dark-ink-mute">Explorer</p>
          <ul>
            {files.map((p, i) => (
              <li key={p.id}>
                <button
                  type="button"
                  onClick={() => { setActive(i); setPinned(true); }}
                  aria-current={i === active}
                  className={`block w-full truncate border-l-2 px-4 py-1.5 text-left transition-colors ${
                    i === active
                      ? "border-dark-ink bg-white/[0.07] text-dark-ink"
                      : "border-transparent text-dark-ink-dim hover:bg-white/[0.04] hover:text-dark-ink"
                  }`}
                >
                  {p.file}
                </button>
              </li>
            ))}
          </ul>
          <p className="mt-auto px-4 pt-3 text-[11px] text-dark-ink-mute">
            {IDE_PROJECTS.length} files in {PROJECT_FOLDERS.length} folders
          </p>
        </nav>

        {/* editor: the project's own footage, then what it is */}
        <Link to={href} className="group flex min-w-0 flex-1 flex-col" aria-label={`Open ${current.file} in the workstation`}>
          <div className="relative min-h-0 flex-1 overflow-hidden bg-black">
            {/* keyed so each file mounts its own player and autoplay observer */}
            <Footage key={still.src} still={still} />
          </div>
          <div className="flex items-start gap-3 border-t border-[var(--dark-line)] px-4 py-3">
            <div className="min-w-0 flex-1 font-sans">
              <p className="truncate text-[14px] font-medium text-dark-ink">{current.project.shortTitle ?? current.title}</p>
              <p className="mt-0.5 line-clamp-3 sm:line-clamp-2 text-[12.5px] leading-[1.45] text-dark-ink-dim">{current.tagline}</p>
            </div>
            <ArrowUpRight className="mt-0.5 shrink-0 text-dark-ink-mute transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </div>
        </Link>
      </div>

      {/* phone: the explorer collapses to steps */}
      <div className="flex items-center justify-center gap-1 border-t border-[var(--dark-line)] py-1.5 sm:hidden">
        {files.map((p, i) => (
          <button
            key={p.id}
            type="button"
            onClick={() => { setActive(i); setPinned(true); }}
            aria-label={`Show ${p.file}`}
            aria-current={i === active}
            className="flex h-6 w-6 items-center justify-center"
          >
            <span className={`h-2 rounded-full transition-all ${i === active ? "w-5 bg-white" : "w-2 bg-white/45"}`} />
          </button>
        ))}
      </div>
    </div>
  );
}
