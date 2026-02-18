/**
 * @file WorkPage.tsx
 * @description Project list at /work. Links to individual project pages for sharing and SEO.
 */

import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getAllProjectsForWork, profileData } from '../../data';

const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.06 } } };
const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } },
};

export function WorkPage() {
  return (
    <div className="work-page-scroll h-screen overflow-y-auto overflow-x-hidden bg-[#fafaf8] font-sans text-[#0a0a0a]">
      <header className="border-b border-[#0a0a0a]/10 bg-white/60 backdrop-blur-sm sticky top-0 z-10">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-4 md:px-10">
          <Link to="/" className="font-display text-lg font-bold tracking-tight text-[#0a0a0a]">
            {profileData.name}
          </Link>
          <nav className="flex items-center gap-4">
            <Link to="/" className="font-mono text-xs text-[#0a0a0a]/60 transition-colors hover:text-[#0a0a0a]">
              Portfolio
            </Link>
            <Link to="/#work" className="font-mono text-xs text-[#0a0a0a]/60 transition-colors hover:text-[#0a0a0a]">
              Work
            </Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-6 py-16 md:px-10">
        <motion.div
          variants={stagger}
          initial="hidden"
          animate="visible"
          className="space-y-2"
        >
          <motion.h1 variants={fadeUp} className="text-3xl font-bold tracking-tight md:text-4xl">
            Project Experience
          </motion.h1>
          <motion.p variants={fadeUp} className="text-[15px] text-[#0a0a0a]/60">
            All projects from VR and embedded systems to web and product design.
          </motion.p>
        </motion.div>

        <ul className="mt-12 space-y-3">
          {getAllProjectsForWork().map((project, i) => (
            <motion.li
              key={project.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: 0.05 * i, ease: [0.22, 1, 0.36, 1] }}
            >
              <Link
                to={`/work/${project.id}`}
                className="group flex flex-col gap-1 rounded-lg border border-[#0a0a0a]/10 bg-white p-4 transition-all hover:border-[#0a0a0a]/25 hover:shadow-md md:flex-row md:items-center md:justify-between md:gap-6 md:p-5"
              >
                <div className="min-w-0 flex-1">
                  <h2 className="text-lg font-bold text-[#0a0a0a] group-hover:underline md:text-xl">
                    {project.title}
                  </h2>
                  <p className="mt-0.5 font-mono text-[11px] uppercase tracking-wider text-[#0a0a0a]/40">
                    {project.location} · {project.period}
                  </p>
                  <p className="mt-2 text-sm text-[#0a0a0a]/60 line-clamp-2">{project.tagline}</p>
                </div>
                <div className="mt-2 flex flex-wrap gap-1.5 md:mt-0 md:w-44 md:justify-end">
                  {(project.techStack ?? []).slice(0, 3).map((tech) => (
                    <span
                      key={tech}
                      className="rounded-full bg-[#0a0a0a]/5 px-2.5 py-1 text-[10px] font-mono text-[#0a0a0a]/60"
                    >
                      {tech}
                    </span>
                  ))}
                  {(project.techStack?.length ?? 0) > 3 && (
                    <span className="font-mono text-[10px] text-[#0a0a0a]/40">
                      +{project.techStack!.length - 3}
                    </span>
                  )}
                </div>
                <span className="text-[#0a0a0a]/40 group-hover:text-[#0a0a0a]" aria-hidden>
                  →
                </span>
              </Link>
            </motion.li>
          ))}
        </ul>

        <p className="mt-16 text-center text-sm text-[#0a0a0a]/50">
          <Link to="/" className="underline underline-offset-2 hover:text-[#0a0a0a]">
            Back to portfolio
          </Link>
        </p>
      </main>
    </div>
  );
}
