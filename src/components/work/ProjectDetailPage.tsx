/**
 * @file ProjectDetailPage.tsx
 * @description Single project page at /work/:projectId. Sets document title and meta for SEO/sharing.
 */

import { useEffect, useMemo } from 'react';
import { Link, useParams, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getProjectBySlug, profileData, RELATED_TITLE_TO_SLUG } from '../../data';

const SITE_URL = 'https://www.jalenedusei.com';
const DEFAULT_OG_IMAGE = `${SITE_URL}/headshot.png`;

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
  const project = useMemo(() => {
    if (!projectId) return undefined;
    return getProjectBySlug(projectId);
  }, [projectId]);

  useEffect(() => {
    if (!project) return;
    const title = `${project.title} | ${profileData.name}`;
    const description = project.tagline || project.description[0] || `${project.title} — ${profileData.title}`;
    const path = `/work/${project.id}`;
    setPageMeta(title, description, path, DEFAULT_OG_IMAGE);
    return () => {
      document.title = `${profileData.name} | Software Engineer · UGA 2026`;
    };
  }, [project]);

  if (!projectId || !project) {
    return <Navigate to="/work" replace />;
  }

  return (
    <div className="work-page-scroll h-screen overflow-y-auto overflow-x-hidden bg-[#fafaf8] font-sans text-[#0a0a0a]">
      <header className="border-b border-[#0a0a0a]/10 bg-white/60 backdrop-blur-sm sticky top-0 z-10">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-4 md:px-10">
          <Link to="/" className="font-display text-lg font-bold tracking-tight text-[#0a0a0a]">
            {profileData.name}
          </Link>
          <nav className="flex items-center gap-4">
            <Link to="/work" className="font-mono text-xs text-[#0a0a0a]/60 transition-colors hover:text-[#0a0a0a]">
              All work
            </Link>
            <Link to="/" className="font-mono text-xs text-[#0a0a0a]/60 transition-colors hover:text-[#0a0a0a]">
              Portfolio
            </Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-12 md:px-10 md:py-16">
        <motion.article
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        >
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-[#0a0a0a]/40">
            {project.location} · {project.period}
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight md:text-4xl">{project.title}</h1>
          <p className="mt-3 text-lg text-[#0a0a0a]/70">{project.tagline}</p>

          {project.github && (
            <a
              href={project.github}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-block rounded-full border-2 border-[#0a0a0a]/15 px-5 py-2.5 text-sm font-medium text-[#0a0a0a] transition-all hover:border-[#0a0a0a] hover:bg-[#0a0a0a]/5"
            >
              View on GitHub ↗
            </a>
          )}

          <div className="mt-10 space-y-4">
            {project.description.map((line, i) => (
              <p key={i} className="flex gap-3 text-[15px] leading-relaxed text-[#0a0a0a]/80">
                <span className="mt-2 h-px w-4 shrink-0 bg-[#0a0a0a]/20" />
                <span>{line}</span>
              </p>
            ))}
          </div>

          {(project.techStack?.length ?? 0) > 0 && (
            <div className="mt-10">
              <h2 className="font-mono text-[11px] uppercase tracking-[0.2em] text-[#0a0a0a]/40">
                Technologies
              </h2>
              <div className="mt-3 flex flex-wrap gap-2">
                {project.techStack!.map((tech) => (
                  <span
                    key={tech}
                    className="rounded-full border border-[#0a0a0a]/10 bg-white px-3 py-1.5 text-xs font-mono text-[#0a0a0a]/80"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          )}

          {((project.additionalProjects && project.additionalProjects.length > 0) || (project.relatedProjects && project.relatedProjects.length > 0)) && (
            <div className="mt-14 border-t border-[#0a0a0a]/10 pt-10">
              <h2 className="font-mono text-[11px] uppercase tracking-[0.2em] text-[#0a0a0a]/40">
                Related projects
              </h2>
              <ul className="mt-4 list-none space-y-4">
                {project.relatedProjects?.map((rel, i) => (
                  <li key={i} className="text-[#0a0a0a]/80">
                    <div className="flex flex-wrap items-baseline gap-2">
                      <Link to={`/work/${rel.slug}`} className="font-semibold text-[#0a0a0a] underline underline-offset-2 hover:opacity-80">
                        {rel.title}
                      </Link>
                      {rel.period && <span className="font-mono text-[11px] text-[#0a0a0a]/40">{rel.period}</span>}
                    </div>
                  </li>
                ))}
                {project.additionalProjects?.map((add, i) => {
                  const slug = RELATED_TITLE_TO_SLUG[add.title];
                  return (
                    <li key={`add-${i}`} className="text-[#0a0a0a]/80">
                      <div className="flex flex-wrap items-baseline gap-2">
                        {slug ? (
                          <Link to={`/work/${slug}`} className="font-semibold text-[#0a0a0a] underline underline-offset-2 hover:opacity-80">
                            {add.title}
                          </Link>
                        ) : (
                          <span className="font-semibold text-[#0a0a0a]">{add.title}</span>
                        )}
                        <span className="font-mono text-[11px] text-[#0a0a0a]/40">{add.period}</span>
                        {add.github && (
                          <a
                            href={add.github}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-mono text-xs text-[#0a0a0a]/50 underline underline-offset-2 hover:text-[#0a0a0a]"
                          >
                            GitHub ↗
                          </a>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </motion.article>

        <nav className="mt-16 flex flex-wrap items-center justify-between gap-4 border-t border-[#0a0a0a]/10 pt-8">
          <Link to="/work" className="font-mono text-sm text-[#0a0a0a]/60 hover:text-[#0a0a0a]">
            ← All projects
          </Link>
          <Link to="/" className="font-mono text-sm text-[#0a0a0a]/60 hover:text-[#0a0a0a]">
            Back to portfolio
          </Link>
        </nav>
      </main>
    </div>
  );
}
