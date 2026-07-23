/**
 * @file ProjectTile.tsx
 * @description Interactive Selected Work tile. The media area is rendered by the shared
 * <ProjectMedia> (3D model / live site embed / site card / image / atmospheric glass).
 *
 * Navigation model: the card is NOT one big <Link> because interactive media (a draggable
 * 3D model, or a usable embedded site) must receive pointer events. Instead, the title, the
 * corner arrow, and — for non-interactive media — a transparent overlay link handle routing
 * to /work/:id. Heavy media mounts only when the tile scrolls into view.
 */

import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import { ArrowUpRight, Github } from 'lucide-react';
import type { WorkProject } from '../../../data';
import { CATEGORY_ICON, CATEGORY_LABEL } from './Kit';
import { ProjectMedia, resolveMedia } from './ProjectMedia';

export function ProjectTile({
  project,
  index = 0,
}: {
  project: WorkProject;
  index?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-40px' });
  const [hovered, setHovered] = useState(false);
  const media = resolveMedia(project);

  const Icon = project.category ? CATEGORY_ICON[project.category] : undefined;
  const catLabel = project.category ? CATEGORY_LABEL[project.category] : project.location;

  const isModel = media.kind === 'model';
  const isEmbed = media.kind === 'embed';
  const isCard = media.kind === 'card';
  const tag = isModel ? '3D' : isEmbed ? 'Live' : isCard ? 'Site' : null;
  const tagColor = isModel ? 'var(--pf-accent-2)' : 'var(--pf-accent)';
  // Models are interactive (drag to rotate) on hover; the rest stay clickable to navigate.
  const mediaInteractive = isModel && hovered;
  const overlayLink = !isModel; // model media must keep pointer events for orbit control

  const to = `/work/${project.id}`;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay: (index % 3) * 0.08, ease: [0.22, 1, 0.36, 1] }}
    >
      <div
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className={`group relative flex flex-col overflow-hidden rounded-[var(--pf-radius-lg)] border border-[var(--pf-line)] bg-[var(--pf-bg-elev)] shadow-[var(--pf-shadow-sm)] transition-all duration-500 hover:-translate-y-1.5 hover:shadow-[var(--pf-shadow-accent)] min-h-[22rem]`}
      >
        {/* Media area */}
        <div className="relative w-full overflow-hidden h-52">
          {!inView ? (
            <div className="pf-liquid-glass absolute inset-0" />
          ) : (
            <ProjectMedia project={project} interactive={mediaInteractive} />
          )}

          {/* Transparent nav overlay for non-interactive media — mouse affordance only;
              the title link below is the tile's single keyboard/SR entry point. */}
          {overlayLink && (
            <Link to={to} tabIndex={-1} aria-hidden className="absolute inset-0 z-[1]" />
          )}

          {/* Category badge */}
          <div className="pointer-events-none absolute left-4 top-4 z-[3] inline-flex items-center gap-1.5 rounded-full bg-black/55 px-3 py-1 text-[11px] font-medium text-white backdrop-blur-md">
            {Icon && <Icon className="h-3.5 w-3.5" strokeWidth={2} />}
            {catLabel}
          </div>

          {/* Media-type tag */}
          {tag && (
            <div
              className="pointer-events-none absolute right-4 top-4 z-[3] inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-[var(--pf-on-accent)]"
              style={{ backgroundColor: tagColor }}
            >
              {(isEmbed || isCard) && <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[var(--pf-on-accent)]" />}
              {tag}
            </div>
          )}

          {/* Open arrow (always navigates; duplicate of the title link, so out of tab order) */}
          <Link
            to={to}
            tabIndex={-1}
            aria-hidden
            className="absolute bottom-4 right-4 z-[3] flex h-10 w-10 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur-md transition-all duration-500 hover:bg-[var(--pf-accent)] hover:text-[var(--pf-on-accent)] group-hover:bg-[var(--pf-accent)] group-hover:text-[var(--pf-on-accent)]"
          >
            <ArrowUpRight className="h-5 w-5 transition-transform duration-500 group-hover:rotate-45" />
          </Link>

          {/* Drag hint for interactive models */}
          {isModel && (
            <div className="pointer-events-none absolute bottom-4 left-4 z-[3] rounded-full bg-black/45 px-2.5 py-1 font-mono text-[9px] uppercase tracking-wider text-white/70 opacity-0 backdrop-blur-md transition-opacity duration-500 group-hover:opacity-100">
              drag to rotate
            </div>
          )}
        </div>

        {/* Text area */}
        <div className="flex flex-1 flex-col p-5 md:p-6">
          <div className="flex items-start justify-between gap-3">
            <Link
              to={to}
              className={`font-display font-bold leading-tight text-[var(--pf-ink)] underline-offset-4 transition-colors hover:text-[var(--pf-accent-deep)] hover:underline dark:hover:text-[var(--pf-accent-bright)] text-xl`}
            >
              {project.title}
            </Link>
            {project.github && (
              <a
                href={project.github}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${project.title} on GitHub`}
                className="mt-1 shrink-0 text-[var(--pf-ink-faint)] transition-colors hover:text-[var(--pf-ink)]"
              >
                <Github className="h-4 w-4" />
              </a>
            )}
          </div>
          <p className="mt-1 font-mono text-[11px] uppercase tracking-[0.14em] text-[var(--pf-ink-faint)]">
            {project.period}
          </p>
          <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-[var(--pf-ink-soft)]">{project.tagline}</p>

          <div className="mt-auto flex flex-wrap gap-1.5 pt-4">
            {project.techStack.slice(0, 3).map((t) => (
              <span key={t} className="pf-pill !py-1 !text-[10px]">
                {t}
              </span>
            ))}
            {project.techStack.length > 3 && (
              <span className="self-center font-mono text-[10px] text-[var(--pf-ink-faint)]">
                +{project.techStack.length - 3}
              </span>
            )}
          </div>
        </div>

        <span
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 h-1 origin-left scale-x-0 bg-gradient-to-r from-[var(--pf-accent)] to-[var(--pf-accent-2)] transition-transform duration-500 group-hover:scale-x-100"
        />
      </div>
    </motion.div>
  );
}
