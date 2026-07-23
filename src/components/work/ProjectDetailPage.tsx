/**
 * @file ProjectDetailPage.tsx
 * @description Single project page at /work/:projectId. Redesigned with the `.pf` system:
 * atmospheric hero header, category badge, live/GitHub CTAs, bulleted story, tech pills,
 * and related-project tiles. Sets document title and meta for SEO/sharing.
 */

import { useEffect, useLayoutEffect, useMemo, useRef } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowUpRight, Github, Globe } from 'lucide-react';
import { getProjectBySlug, profileData, RELATED_TITLE_TO_SLUG } from '../../data';
import { ProjectTile } from './ui/ProjectTile';
import { ProjectMedia, resolveMedia } from './ui/ProjectMedia';
import { CATEGORY_ICON, CATEGORY_LABEL, MagneticButton } from './ui/Kit';
import { ZoomableImage } from './ui/ZoomableImage';
import { WorkHeader } from './WorkHeader';
import Footer from '../../landing/components/sections/Footer';

const SITE_URL = 'https://www.jalenedusei.com';
const DEFAULT_OG_IMAGE = `${SITE_URL}/headshot.png`;

/** Legacy slugs preserved for shared links after a rename. */
const SLUG_REDIRECTS: Record<string, string> = {
  'nsbe-election': 'live-election-platform',
};

function setPageMeta(title: string, description: string, path: string, ogImage?: string) {
  document.title = title;
  const desc = document.querySelector('meta[name="description"]');
  if (desc) desc.setAttribute('content', description);
  const ogTitle = document.querySelector('meta[property="og:title"]');
  if (ogTitle) ogTitle.setAttribute('content', title);
  const ogDesc = document.querySelector('meta[property="og:description"]');
  if (ogDesc) ogDesc.setAttribute('content', description);
  const ogUrl = document.querySelector('meta[property="og:url"]');
  if (ogUrl) ogUrl.setAttribute('content', `${SITE_URL}${path}`);
  const ogImageEl = document.querySelector('meta[property="og:image"]');
  if (ogImageEl) ogImageEl.setAttribute('content', ogImage ?? DEFAULT_OG_IMAGE);
  const twitterImage = document.querySelector('meta[name="twitter:image"]');
  if (twitterImage) twitterImage.setAttribute('content', ogImage ?? DEFAULT_OG_IMAGE);
}

export function ProjectDetailPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const project = useMemo(() => (projectId ? getProjectBySlug(projectId) : undefined), [projectId]);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Always light bone — clear any inherited portfolio dark class.
  useLayoutEffect(() => {
    document.documentElement.classList.remove('dark');
  }, []);

  // The page scrolls inside its own fixed container, so the browser never resets it:
  // navigating between projects (e.g. via Related tiles) reuses the same element and
  // would otherwise land the next project at the previous scroll depth.
  useLayoutEffect(() => {
    scrollRef.current?.scrollTo(0, 0);
  }, [projectId]);

  useEffect(() => {
    if (!project) return;
    const title = `${project.title} | ${profileData.name}`;
    const description = project.tagline || project.description[0] || `${project.title} · ${profileData.title}`;
    setPageMeta(title, description, `/work/${project.id}`, DEFAULT_OG_IMAGE);
    return () => {
      document.title = `${profileData.name} | Software Engineer · UGA 2026`;
    };
  }, [project]);

  if (projectId && SLUG_REDIRECTS[projectId]) {
    return <Navigate to={`/work/${SLUG_REDIRECTS[projectId]}`} replace />;
  }
  if (!projectId || !project) {
    return <Navigate to="/work" replace />;
  }

  const Icon = project.category ? CATEGORY_ICON[project.category] : Globe;
  const catLabel = project.category ? CATEGORY_LABEL[project.category] : project.location;

  // Resolve related project slugs (both explicit relatedProjects and additionalProjects).
  const related = [
    ...(project.relatedProjects ?? []).map((r) => r.slug),
    ...(project.additionalProjects ?? []).map((a) => RELATED_TITLE_TO_SLUG[a.title]).filter(Boolean),
  ];
  const relatedProjects = Array.from(new Set(related))
    .map((slug) => getProjectBySlug(slug))
    .filter((p): p is NonNullable<typeof p> => Boolean(p) && p!.id !== project.id)
    .slice(0, 3);

  return (
    <div ref={scrollRef} className="landing work-theme work-page-scroll fixed inset-0 z-40 overflow-y-auto">
      <WorkHeader active="work" />

      {/* Atmospheric hero header */}
      <header className="pf-tile-atmo pf-grain relative overflow-hidden">
        <div className="absolute -right-10 -top-10 text-white/10" aria-hidden>
          <Icon className="h-72 w-72" strokeWidth={0.8} />
        </div>
        <div className="relative mx-auto max-w-4xl px-6 py-16 md:px-10 md:py-24">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="inline-flex items-center gap-2 rounded-full bg-black/40 px-3 py-1 text-[11px] font-medium text-white backdrop-blur-md">
              <Icon className="h-3.5 w-3.5" /> {catLabel}
            </div>
            <h1 className="mt-4 font-display text-4xl font-extrabold leading-[0.98] tracking-tight text-white md:text-6xl">
              {project.title}
            </h1>
            <p className="mt-3 max-w-2xl text-lg text-white/75">{project.tagline}</p>
            <p className="mt-2 font-mono text-[11px] uppercase tracking-[0.2em] text-white/45">
              {project.location} · {project.period}
            </p>

            {(project.liveUrl || project.github) && (
              <div className="mt-7 flex flex-wrap gap-3">
                {project.liveUrl && (
                  <a
                    href={project.liveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-full bg-[var(--pf-accent)] px-5 py-2.5 text-sm font-semibold text-[var(--pf-on-accent)] transition-transform hover:scale-105 active:scale-95"
                  >
                    <Globe className="h-4 w-4" /> View live
                  </a>
                )}
                {project.github && (
                  <a
                    href={project.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-full border border-white/25 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-white/10"
                  >
                    <Github className="h-4 w-4" /> GitHub
                  </a>
                )}
              </div>
            )}
          </motion.div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-6 py-14 md:px-10">
        {/* Interactive media — the same 3D model / live site shown on the tile, larger */}
        {resolveMedia(project).kind !== 'atmo' && (
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="relative mb-14 h-[20rem] w-full overflow-hidden rounded-[var(--pf-radius-lg)] border border-[var(--pf-line)] shadow-[var(--pf-shadow)] md:h-[30rem]"
          >
            <ProjectMedia project={project} interactive />
            {resolveMedia(project).kind === 'model' && (
              <div className="pointer-events-none absolute bottom-4 left-4 rounded-full bg-black/45 px-3 py-1 font-mono text-[10px] uppercase tracking-wider text-white/75 backdrop-blur-md">
                drag to rotate
              </div>
            )}
          </motion.div>
        )}

        {/* Story — prose, not bullets */}
        <div className="max-w-2xl space-y-5">
          {project.description.map((line, i) => (
            <motion.p
              key={i}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.45, delay: i * 0.05 }}
              className={`leading-relaxed text-[var(--pf-ink-soft)] ${i === 0 ? 'text-lg text-[var(--pf-ink)]' : 'text-[15px]'}`}
            >
              {line}
            </motion.p>
          ))}
        </div>

        {/* Tech */}
        {project.techStack.length > 0 && (
          <div className="mt-12">
            <h2 className="mb-3 font-mono text-[11px] uppercase tracking-[0.2em] text-[var(--pf-ink-faint)]">Technologies</h2>
            <div className="flex flex-wrap gap-2">
              {project.techStack.map((tech) => (
                <span key={tech} className="pf-pill">{tech}</span>
              ))}
            </div>
          </div>
        )}

        {/* Demos — embedded YouTube videos */}
        {project.demos && project.demos.length > 0 && (
          <div className="mt-16 border-t border-[var(--pf-line)] pt-12">
            <h2 className="mb-6 font-mono text-[11px] uppercase tracking-[0.2em] text-[var(--pf-ink-faint)]">Demos</h2>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              {project.demos.map((d) => (
                <motion.div
                  key={d.youtubeId}
                  initial={{ opacity: 0, y: 14 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-40px' }}
                  transition={{ duration: 0.4 }}
                >
                  <div className="aspect-video w-full overflow-hidden rounded-xl border border-[var(--pf-line)] bg-black shadow-[var(--pf-shadow-sm)]">
                    <iframe
                      className="h-full w-full"
                      src={`https://www.youtube-nocookie.com/embed/${d.youtubeId}`}
                      title={d.title}
                      loading="lazy"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                    />
                  </div>
                  <p className="mt-2 text-sm font-medium text-[var(--pf-ink-soft)]">{d.title}</p>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Gallery — real screenshots pulled from the project's GitHub */}
        {project.gallery && project.gallery.length > 0 && (
          <div className="mt-16 border-t border-[var(--pf-line)] pt-12">
            <h2 className="mb-6 font-mono text-[11px] uppercase tracking-[0.2em] text-[var(--pf-ink-faint)]">Gallery</h2>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
              {project.gallery.map((g, i) => (
                <motion.div
                  key={g.src}
                  initial={{ opacity: 0, y: 14 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-40px' }}
                  transition={{ duration: 0.4, delay: (i % 3) * 0.06 }}
                  className="overflow-hidden rounded-xl border border-[var(--pf-line)] bg-[var(--pf-bg-elev)] shadow-[var(--pf-shadow-sm)]"
                >
                  <ZoomableImage
                    src={g.src}
                    alt={g.alt}
                    className="aspect-video w-full object-cover transition-transform duration-500 group-hover/zoom:scale-105"
                  />
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Related as tiles */}
        {relatedProjects.length > 0 && (
          <div className="mt-16 border-t border-[var(--pf-line)] pt-12">
            <h2 className="mb-6 font-display text-2xl font-bold text-[var(--pf-ink)]">Related projects</h2>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {relatedProjects.map((rp, i) => (
                <ProjectTile key={rp.id} project={rp} index={i} />
              ))}
            </div>
          </div>
        )}

        {/* Nav */}
        <nav className="mt-16 flex flex-wrap items-center justify-between gap-4 border-t border-[var(--pf-line)] pt-8">
          <MagneticButton href="/work" variant="ghost">
            <ArrowLeft className="h-4 w-4" /> All projects
          </MagneticButton>
          <MagneticButton href="/" variant="outline">
            Back to home <ArrowUpRight className="h-4 w-4" />
          </MagneticButton>
        </nav>
      </main>
      <Footer />
    </div>
  );
}
