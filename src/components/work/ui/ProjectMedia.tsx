/**
 * @file ProjectMedia.tsx
 * @description Shared media renderer for a project, used by both the Selected Work tiles
 * and the project detail pages. Renders, based on `project.tileMedia`:
 *   - model : interactive 3D model (auto-rotates; drag to rotate when `interactive`)
 *   - site (embed): a live iframe of the real site, contain-fit so the WHOLE site is visible
 *                   (centered on liquid glass, never cropped to a corner)
 *   - site (card) : a browser-chrome card for sites that block embedding
 *   - image : a static screenshot (e.g. pulled from a GitHub README)
 *   - none  : an atmospheric liquid-glass panel with the category motif
 *
 * Backgrounds use the `.pf-liquid-glass` surface for a frosted, refractive look.
 */

import { lazy, Suspense, useLayoutEffect, useRef, useState } from 'react';
import { Globe } from 'lucide-react';
import type { WorkProject, ProjectCategory, TileMedia } from '../../../data';
import { CATEGORY_ICON } from './Kit';

const TileModel = lazy(() => import('./TileModel'));
const TileGlobe = lazy(() => import('./TileGlobe'));

/** Big decorative glyph for a tile = the project's category icon (matches the badge + detail page). */
export function categoryGlyph(category: ProjectCategory | undefined, className: string) {
  const Icon = category ? CATEGORY_ICON[category] : Globe;
  return <Icon className={className} strokeWidth={1.1} />;
}

/* -------------------------------------------------------------------------- */
/* Resolve                                                                     */
/* -------------------------------------------------------------------------- */

export type ResolvedMedia =
  | { kind: 'model'; src: string; rotation?: [number, number, number] }
  | { kind: 'embed'; url: string }
  | { kind: 'card'; url: string; screenshot?: string }
  | { kind: 'image'; src: string; alt: string }
  | { kind: 'video'; src: string; poster?: string; alt: string }
  | { kind: 'globe' }
  | { kind: 'atmo' };

export function resolveMedia(p: WorkProject): ResolvedMedia {
  const m: TileMedia | undefined = p.tileMedia;
  if (!m) return { kind: 'atmo' };
  if (m.kind === 'model') return { kind: 'model', src: m.src, rotation: m.rotation };
  if (m.kind === 'image') return { kind: 'image', src: m.src, alt: m.alt };
  if (m.kind === 'video') return { kind: 'video', src: m.src, poster: m.poster, alt: m.alt };
  if (m.kind === 'globe') return { kind: 'globe' };
  if (m.kind === 'site') {
    return m.embed ? { kind: 'embed', url: m.url } : { kind: 'card', url: m.url, screenshot: m.screenshot };
  }
  return { kind: 'atmo' };
}

/** Whether a project shows an interactive 3D model (used to avoid wrapping it in a nav link). */
export function isModelMedia(p: WorkProject): boolean {
  return p.tileMedia?.kind === 'model';
}

/* -------------------------------------------------------------------------- */
/* Element size (for contain-fit scaling)                                       */
/* -------------------------------------------------------------------------- */

function useElementSize<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [size, setSize] = useState({ w: 0, h: 0 });
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const update = () => setSize({ w: el.clientWidth, h: el.clientHeight });
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return { ref, size };
}

/* -------------------------------------------------------------------------- */
/* Renderers                                                                   */
/* -------------------------------------------------------------------------- */

function ModelMedia({
  src,
  interactive,
  rotation,
}: {
  src: string;
  interactive: boolean;
  rotation?: [number, number, number];
}) {
  return (
    <div className="pf-liquid-glass absolute inset-0 overflow-hidden">
      <Suspense fallback={null}>
        <TileModel src={src} interactive={interactive} rotation={rotation} />
      </Suspense>
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_90%_at_50%_120%,rgba(0,0,0,0.28),transparent_60%)]" />
    </div>
  );
}

/** Animated dot-matrix spinning globe on the liquid-glass surface. */
function GlobeMedia() {
  return (
    <div className="pf-liquid-glass absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 grid place-items-center p-4">
        <div className="aspect-square h-full max-h-full">
          <Suspense fallback={null}>
            <TileGlobe />
          </Suspense>
        </div>
      </div>
    </div>
  );
}

/** Looping, muted, autoplaying video preview (e.g. a hardware demo). */
function VideoMedia({ src, poster, alt }: { src: string; poster?: string; alt: string }) {
  return (
    <div className="pf-liquid-glass absolute inset-0 overflow-hidden">
      <video
        className="relative z-[1] h-full w-full object-cover"
        src={src}
        poster={poster}
        autoPlay
        loop
        muted
        playsInline
        preload="metadata"
        aria-label={alt}
      />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-black/10" />
    </div>
  );
}

/**
 * Live iframe preview scaled to FILL THE WIDTH of the tile (the full site spans the tile
 * edge-to-edge), top-anchored. Taller pages simply extend below the fold — no side letterbox
 * bars. `interactive` lets the user use the embedded site (detail page); tiles keep it
 * non-interactive so the card stays clickable.
 */
function SiteEmbed({ url, title, interactive = false }: { url: string; title: string; interactive?: boolean }) {
  const LOGICAL_W = 1280;
  const { ref, size } = useElementSize<HTMLDivElement>();
  const [loaded, setLoaded] = useState(false);
  const scale = size.w ? size.w / LOGICAL_W : 0;
  // Logical iframe height that, once scaled, fills the container height (so it covers the tile).
  const logicalH = scale > 0 ? size.h / scale : 0;
  return (
    <div ref={ref} className="pf-liquid-glass absolute inset-0 overflow-hidden">
      {scale > 0 && (
        <div
          className="absolute left-0 top-0 origin-top-left"
          style={{
            width: LOGICAL_W,
            height: logicalH,
            transform: `scale(${scale})`,
            pointerEvents: interactive ? 'auto' : 'none',
          }}
        >
          <iframe
            src={url}
            title={`${title} live preview`}
            loading="lazy"
            tabIndex={interactive ? 0 : -1}
            aria-hidden={!interactive}
            onLoad={() => setLoaded(true)}
            className="h-full w-full border-0 bg-white"
          />
        </div>
      )}
      {!loaded && (
        <div className="absolute inset-0 grid place-items-center">
          <span className="h-6 w-6 animate-spin rounded-full border-2 border-white/30 border-t-white/80" />
        </div>
      )}
    </div>
  );
}

function SiteCard({ url, title, screenshot }: { url: string; title: string; screenshot?: string }) {
  let host = url;
  try {
    host = new URL(url).host.replace(/^www\./, '');
  } catch {
    /* keep raw */
  }
  return (
    <div className="pf-liquid-glass absolute inset-0 flex flex-col p-3 md:p-4">
      <div className="relative z-[1] flex h-full w-full flex-col overflow-hidden rounded-xl border border-white/15 bg-[#0c0d10] shadow-2xl">
        <div className="flex items-center gap-2 border-b border-white/10 bg-white/5 px-3 py-2">
          <span className="flex gap-1.5" aria-hidden>
            <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
          </span>
          <span className="mx-auto flex max-w-[70%] items-center gap-1.5 truncate rounded-md bg-white/10 px-2.5 py-0.5 font-mono text-[10px] text-white/70">
            <Globe className="h-3 w-3" /> {host}
          </span>
        </div>
        <div className="relative flex-1 overflow-hidden bg-white">
          {screenshot ? (
            <img
              src={screenshot}
              alt={`${title} screenshot`}
              loading="lazy"
              className="absolute inset-0 h-full w-full object-contain"
            />
          ) : (
            <div className="absolute inset-0 grid place-items-center bg-[#0c0d10]">
              <span className="font-mono text-xs uppercase tracking-[0.3em] text-white/45">Visit site ↗</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ImageMedia({ src, alt }: { src: string; alt: string }) {
  return (
    <div className="pf-liquid-glass absolute inset-0 overflow-hidden">
      <img src={src} alt={alt} loading="lazy" className="relative z-[1] h-full w-full object-contain p-3 md:p-4" />
    </div>
  );
}

function AtmoPanel({ project }: { project: WorkProject }) {
  return (
    <div className="pf-liquid-glass pf-grain absolute inset-0 overflow-hidden">
      <div
        className="absolute inset-0 z-[1] opacity-[0.16]"
        style={{
          backgroundImage: 'radial-gradient(currentColor 1px, transparent 1.4px)',
          backgroundSize: '22px 22px',
          color: 'var(--pf-accent-bright)',
        }}
        aria-hidden
      />
      <div className="absolute -right-5 -top-5 z-[1] text-[var(--pf-accent)]/35 transition-transform duration-700 group-hover:scale-110 group-hover:-rotate-6">
        {categoryGlyph(project.category, 'h-48 w-48')}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Public component                                                             */
/* -------------------------------------------------------------------------- */

export function ProjectMedia({
  project,
  interactive = false,
}: {
  project: WorkProject;
  /** Allow user interaction (drag-to-rotate models / use embedded sites). */
  interactive?: boolean;
}) {
  const media = resolveMedia(project);
  switch (media.kind) {
    case 'model':
      return <ModelMedia src={media.src} interactive={interactive} rotation={media.rotation} />;
    case 'embed':
      return <SiteEmbed url={media.url} title={project.title} interactive={interactive} />;
    case 'card':
      return <SiteCard url={media.url} title={project.title} screenshot={media.screenshot} />;
    case 'image':
      return <ImageMedia src={media.src} alt={media.alt} />;
    case 'video':
      return <VideoMedia src={media.src} poster={media.poster} alt={media.alt} />;
    case 'globe':
      return <GlobeMedia />;
    default:
      return <AtmoPanel project={project} />;
  }
}
