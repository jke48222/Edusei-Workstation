/**
 * @file ProfessionalView.tsx
 * @description Full-page scrollable portfolio view: hero, marquee, stats, about, projects,
 * experience, skills, study abroad, contact, footer, and FloatingDock. Data from ../../data.
 */

import { Analytics } from '@vercel/analytics/react';
import { motion, useInView } from 'framer-motion';
import { useEffect, useLayoutEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  profileData,
  projectsData,
  skillsData,
  workExperience,
  leadership,
  honors,
  studyAbroad,
  getSayHiMailto,
} from '../../data';
import { useThemeStore } from '../../store/themeStore';
import { BackToTop } from './BackToTop';
import { FloatingDock } from './FloatingDock';

/** Framer Motion variants for section stagger and fade-up. */
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.08 } } };
const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
};

/** Wrapper that triggers stagger when in view (once, with margin). */
function Section({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  return (
    <motion.div ref={ref} variants={stagger} initial="hidden" animate={inView ? 'visible' : 'hidden'} className={className}>
      {children}
    </motion.div>
  );
}

/** Root professional layout: scroll container with all sections and dock. */
export function ProfessionalView() {
  const location = useLocation();
  const portfolioDark = useThemeStore((s) => s.portfolioDark);

  // Keep <html> in sync with portfolio dark mode (no cleanup on toggle to avoid flashing previous mode).
  useLayoutEffect(() => {
    const root = document.documentElement;
    if (portfolioDark) root.classList.add('dark');
    else root.classList.remove('dark');
  }, [portfolioDark]);

  useEffect(() => {
    const hash = location.hash.slice(1);
    if (!hash) return;
    const el = document.getElementById(hash);
    if (el) {
      const t = setTimeout(() => {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
      return () => clearTimeout(t);
    }
  }, [location.pathname, location.hash]);

  return (
    <div
      className={`pro-scroll fixed inset-0 z-40 overflow-y-auto font-sans transition-[background-color,color] duration-300 ease-in-out ${portfolioDark ? 'dark bg-[#0d0d0d] text-[#fafafa]' : 'bg-[#fafaf8] text-[#0a0a0a]'}`}
      data-portfolio-dark={portfolioDark}
    >
      <Hero />
      <Marquee />
      <Stats />
      <AboutBand />
      <Timeline />
      <ExperienceSection />
      <ProjectsList />
      <SkillsCloud />
      <StudyAbroadSection />
      <ContactCTA />
      <Footer />
      <FloatingDock />
      <BackToTop />
      <Analytics />
    </div>
  );
}

/** Hero section: gradient background, title, open-for-work badge, CTA buttons. */
function Hero() {
  return (
    <header className="relative min-h-[92vh] overflow-hidden bg-[#fafaf8] dark:bg-[#0d0d0d] transition-colors duration-300 ease-in-out">
      <div aria-hidden className="pointer-events-none absolute inset-0 opacity-[0.4] dark:hidden" style={{ backgroundImage: 'radial-gradient(circle, #0a0a0a 0.8px, transparent 0.8px)', backgroundSize: '24px 24px' }} />
      <div aria-hidden className="pointer-events-none absolute inset-0 hidden opacity-30 dark:block" style={{ backgroundImage: 'radial-gradient(circle, #333333 0.8px, transparent 0.8px)', backgroundSize: '24px 24px' }} />
      <div aria-hidden className="pointer-events-none absolute inset-0 dark:opacity-90" style={{ background: 'radial-gradient(ellipse 80% 60% at 75% 25%, rgba(168,85,247,0.08) 0%, transparent 60%), radial-gradient(ellipse 60% 50% at 15% 75%, rgba(6,182,212,0.06) 0%, transparent 60%)' }} />
      <div className="relative z-10 flex min-h-[92vh] flex-col justify-end px-6 pb-20 md:px-12 lg:px-20">
        <motion.div initial={{ opacity: 0, y: 48 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}>
          <div className="mb-5 flex flex-wrap items-center gap-3">
            <p className="font-mono text-xs uppercase tracking-[0.3em] text-[#0a0a0a]/50 dark:text-[#fafafa]/50">Computer Systems Engineering · University of Georgia</p>
            {profileData.openForWork && (
              <a
                href={`https://${profileData.linkedin}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-700 transition-colors hover:bg-emerald-200 dark:bg-emerald-900/40 dark:text-emerald-300 dark:hover:bg-emerald-900/60"
                aria-label="Open for work – view my LinkedIn"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse dark:bg-emerald-400" /> Open for Work
              </a>
            )}
          </div>
          <h1 className="font-display text-[clamp(3.5rem,14vw,12rem)] font-extrabold leading-[0.85] tracking-tighter text-[#0a0a0a] dark:text-[#fafafa]">JALEN<br />EDUSEI</h1>
          <div className="mt-10 flex flex-col gap-6 md:flex-row md:items-end md:gap-12">
            <p className="max-w-lg text-base leading-relaxed text-[#0a0a0a]/60 md:text-lg dark:text-[#fafafa]/60">Senior at UGA studying computer systems engineering. Open for full-time opportunities starting May 2026.</p>
            <div className="flex flex-wrap gap-3 shrink-0">
              <a href={getSayHiMailto()} className="rounded-full bg-[#0a0a0a] px-6 py-3 text-sm font-medium text-white transition-transform hover:scale-105 active:scale-95 dark:bg-white dark:text-[#0a0a0a] dark:hover:bg-white/90">Say hi</a>
              <a href={profileData.resumeUrl} target="_blank" rel="noopener noreferrer" className="rounded-full border-2 border-[#0a0a0a]/15 px-6 py-3 text-sm font-medium text-[#0a0a0a] transition-all hover:border-[#0a0a0a] hover:bg-[#0a0a0a]/5 dark:border-[#333333] dark:text-[#fafafa] dark:hover:border-[#404040] dark:hover:bg-[#141414]">Resume ↗</a>
              <a href={profileData.cvUrl} target="_blank" rel="noopener noreferrer" className="rounded-full border-2 border-[#0a0a0a]/15 px-6 py-3 text-sm font-medium text-[#0a0a0a] transition-all hover:border-[#0a0a0a] hover:bg-[#0a0a0a]/5 dark:border-[#333333] dark:text-[#fafafa] dark:hover:border-[#404040] dark:hover:bg-[#141414]">CV ↗</a>
            </div>
          </div>
        </motion.div>
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#0a0a0a]/20 to-transparent dark:via-[#333333]/60" />
    </header>
  );
}

/** Repeating strip of tech/domain labels in the marquee. */
const marqueeItems = ['C / C++', 'Python', 'Verilog', 'Unity3D', 'React Three Fiber', 'Meta Quest 3', 'NASA F Prime', 'Embedded Systems', 'VR / XR', 'Signal Processing', 'Figma', 'Raspberry Pi', 'WebGL', 'Human-Computer Interaction'];

/** Horizontal scrolling marquee band. */
function Marquee() {
  return (
    <div className="relative overflow-hidden border-y border-[#0a0a0a]/10 bg-[#0a0a0a] py-3 dark:border-[#333333] dark:bg-[#171717] transition-colors duration-300 ease-in-out">
      <div className="flex animate-marquee whitespace-nowrap">
        {[...marqueeItems, ...marqueeItems].map((item, i) => (
          <span key={i} className="mx-6 text-sm font-medium uppercase tracking-widest text-white/80">{item}<span className="ml-6 text-white/30">•</span></span>
        ))}
      </div>
    </div>
  );
}

/** Key metrics for the stats strip. */
const stats = [
  { value: '10+', label: 'Technical Projects' },
  { value: '60M+', label: 'Users Impacted' },
  { value: '2026', label: 'Graduating' },
  { value: '100+', label: 'NSBE Members Led' },
];

function Stats() {
  return (
    <div className="mx-auto grid max-w-6xl grid-cols-2 gap-6 px-6 py-16 md:grid-cols-4 md:px-12 lg:px-20">
      {stats.map((s) => (
        <div key={s.label} className="text-center">
          <p className="text-4xl font-bold tracking-tight text-[#0a0a0a] dark:text-[#fafafa] md:text-5xl">{s.value}</p>
          <p className="mt-1 font-mono text-[11px] uppercase tracking-[0.2em] text-[#0a0a0a]/50 dark:text-[#fafafa]/50">{s.label}</p>
        </div>
      ))}
    </div>
  );
}

function AboutBand() {
  return (
    <section id="about" className="bg-[#fafaf8] dark:bg-[#111111] transition-colors duration-300 ease-in-out">
      <Section className="mx-auto max-w-6xl px-6 py-16 md:px-12 lg:px-20">
      <motion.div variants={fadeUp} className="grid gap-10 md:grid-cols-[1.4fr,1fr]">
        <div>
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl dark:text-[#fafafa]">I work across the full stack —<br /><span className="text-[#0a0a0a]/40 dark:text-[#fafafa]/40">from circuits to interfaces.</span></h2>
          <p className="mt-6 max-w-lg text-[15px] leading-relaxed text-[#0a0a0a]/70 dark:text-[#fafafa]/70">I study Computer Systems Engineering at UGA's College of Engineering and Morehead Honors College. My projects range from writing C++ flight software for a 2U CubeSat to building multiplayer VR cooking games in Unity to designing contactless animal health monitors.</p>
        </div>
        <div className="space-y-4">
          {(['Education', 'University', 'College', 'Focus', 'Currently'] as const).map((label, i) => {
            const values = [profileData.degree, profileData.university, profileData.college, 'Embedded Systems, VR/XR, Design', 'VP, National Society of Black Engineers'];
            return (
              <div key={label} className="flex items-start gap-4 border-b border-[#0a0a0a]/10 pb-3 dark:border-[#333333]">
                <span className="w-24 shrink-0 font-mono text-[11px] uppercase tracking-[0.16em] text-[#0a0a0a]/40 dark:text-[#fafafa]/40">{label}</span>
                <span className="text-sm text-[#0a0a0a] dark:text-[#fafafa]">{values[i]}</span>
              </div>
            );
          })}
        </div>
      </motion.div>
    </Section>
    </section>
  );
}

function ProjectRow({ project, index, cardId }: { project: (typeof projectsData)[number]; index: number; cardId?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-40px' });
  return (
    <motion.div ref={ref} initial={{ opacity: 0, y: 24 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.5, delay: index * 0.06, ease: [0.22, 1, 0.36, 1] }}>
      <article {...(cardId ? { id: cardId } : {})} className="group relative flex flex-col gap-4 overflow-hidden border border-[#0a0a0a]/10 bg-white p-5 transition-all duration-300 hover:border-[#0a0a0a]/30 hover:shadow-lg dark:border-[#333333] dark:bg-[#141414] dark:hover:border-[#404040] md:flex-row md:items-start md:gap-8 md:p-6 scroll-mt-24">
        <div className="absolute left-0 top-0 h-full w-1 transition-all duration-300 group-hover:w-1.5 bg-[#0a0a0a]/20 dark:bg-[#333333]/80" />
        <span className="ml-3 shrink-0 font-mono text-4xl font-bold text-[#0a0a0a]/10 dark:text-white/10 md:ml-4 md:text-5xl">{String(index + 1).padStart(2, '0')}</span>
        <div className="ml-3 flex-1 md:ml-0">
          <div className="flex flex-wrap items-baseline gap-3">
            <Link to={`/work/${project.id}`} className="text-xl font-bold text-[#0a0a0a] dark:text-[#fafafa] md:text-2xl underline-offset-2 transition-colors hover:underline">
              {project.title}
            </Link>
            {project.github && <a href={project.github} target="_blank" rel="noopener noreferrer" className="font-mono text-xs text-[#0a0a0a]/40 dark:text-[#fafafa]/40 underline-offset-2 transition-colors hover:text-[#0a0a0a] dark:hover:text-[#fafafa]">GitHub ↗</a>}
          </div>
          <p className="mt-1 font-mono text-[11px] uppercase tracking-[0.16em] text-[#0a0a0a]/40 dark:text-[#fafafa]/40">{project.location} · {project.period}</p>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[#0a0a0a]/70 dark:text-[#fafafa]/70">{project.tagline}</p>
          <div className="mt-3 max-h-0 space-y-1 overflow-hidden transition-all duration-500 group-hover:max-h-[400px]">
            {project.description.map((line) => (
              <p key={line} className="flex gap-2 text-xs leading-relaxed text-[#0a0a0a]/60 dark:text-[#fafafa]/60"><span className="mt-[7px] h-px w-4 shrink-0 bg-[#0a0a0a]/20 dark:bg-[#333333]/80" /><span>{line}</span></p>
            ))}
          </div>
        </div>
        <div className="ml-3 flex flex-wrap gap-1.5 md:ml-0 md:w-48 md:shrink-0 md:justify-end">
          {project.techStack.slice(0, 4).map((tech) => (
            <span key={tech} className="rounded-full bg-[#0a0a0a]/5 px-2.5 py-1 text-[10px] font-mono text-[#0a0a0a]/60 transition-colors group-hover:bg-[#0a0a0a] group-hover:text-white dark:bg-white/10 dark:text-[#fafafa]/60 dark:group-hover:bg-white dark:group-hover:text-[#0a0a0a]">{tech}</span>
          ))}
          {project.techStack.length > 4 && <span className="font-mono text-[10px] text-[#0a0a0a]/30 dark:text-white/30">+{project.techStack.length - 4}</span>}
        </div>
      </article>
    </motion.div>
  );
}

/** Selected Work section: project rows (original design). Timeline clicks scroll to card-{project.id}. */
function ProjectsList() {
  return (
    <section id="work" className="mx-auto max-w-6xl px-6 py-16 md:px-12 lg:px-20 bg-[#fafaf8] dark:bg-[#0a0a0a] transition-colors duration-300 ease-in-out">
      <Section>
        <motion.div variants={fadeUp} className="mb-2 flex flex-wrap items-baseline justify-between gap-4">
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl dark:text-[#fafafa]">Selected Work</h2>
          <Link to="/work" className="font-mono text-xs text-[#0a0a0a]/50 dark:text-[#fafafa]/50 underline-offset-2 transition-colors hover:text-[#0a0a0a] dark:hover:text-[#fafafa]">
            View all →
          </Link>
        </motion.div>
        <motion.p variants={fadeUp} className="mb-10 text-[15px] text-[#0a0a0a]/60 dark:text-[#fafafa]/60">Projects across VR, embedded systems, and product engineering.</motion.p>
      </Section>
      <div className="space-y-4">
        {projectsData.map((project, i) => (
          <ProjectRow key={project.id} project={project} index={i} cardId={`card-${project.id}`} />
        ))}
      </div>
    </section>
  );
}

/** Parse period string to a sort key (YYYY-MM). */
function periodToSortKey(period: string): string {
  const months: Record<string, string> = { january: '01', february: '02', march: '03', april: '04', may: '05', june: '06', july: '07', august: '08', september: '09', october: '10', november: '11', december: '12' };
  const match = period.toLowerCase().match(/(january|february|march|april|may|june|july|august|september|october|november|december)\s*(\d{4})/);
  if (match) return `${match[2]}-${months[match[1]] ?? '01'}`;
  const yearMatch = period.match(/\d{4}/);
  return yearMatch ? `${yearMatch[0]}-01` : '0000-01';
}

/** Slug for scroll id from company name. */
function slugify(s: string): string {
  return s.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
}

/** Single timeline node: id (scroll target), date (display), title (display), sortKey. */
type TimelineNode = { id: string; date: string; title: string; sortKey: string };

function getTimelineNodes(): TimelineNode[] {
  const education: TimelineNode = {
    id: 'education',
    date: `May ${profileData.graduationYear}`,
    title: profileData.degree,
    sortKey: `${profileData.graduationYear}-05`,
  };
  const work: TimelineNode[] = workExperience.map((role) => ({
    id: slugify(role.company),
    date: role.period,
    title: role.title,
    sortKey: periodToSortKey(role.period),
  }));
  const projects: TimelineNode[] = projectsData.map((p) => ({
    id: p.id,
    date: p.period,
    title: p.title,
    sortKey: periodToSortKey(p.period),
  }));
  const all = [education, ...work, ...projects];
  all.sort((a, b) => a.sortKey.localeCompare(b.sortKey));
  return all;
}

function scrollToCard(id: string) {
  document.getElementById(`card-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

/** Horizontal timeline: dates + titles only; click scrolls to Experience or Selected Work card. */
function Timeline() {
  const nodes = getTimelineNodes();
  return (
    <section id="timeline" className="mx-auto max-w-6xl px-6 py-16 md:px-12 lg:px-20 bg-[#fafaf8] dark:bg-[#111111] transition-colors duration-300 ease-in-out">
      <Section>
        <motion.h2 variants={fadeUp} className="mb-2 text-3xl font-bold tracking-tight md:text-4xl dark:text-[#fafafa]">Timeline</motion.h2>
        <motion.p variants={fadeUp} className="mb-8 text-[15px] text-[#0a0a0a]/60 dark:text-[#fafafa]/60">Education, experience, and projects. Click a title to jump to its section.</motion.p>
      </Section>
      <div className="timeline-scroll overflow-x-auto pb-4 -mx-6 px-6 md:-mx-12 md:px-12">
        <div className="relative flex items-start gap-8 md:gap-12 min-w-max pt-1">
          <div className="absolute left-0 right-0 top-[6px] h-px bg-[#0a0a0a]/15 dark:bg-[#333333] min-w-full" aria-hidden />
          {nodes.map((node) => (
            <button
              key={node.id}
              type="button"
              onClick={() => scrollToCard(node.id)}
              className="group relative z-10 flex shrink-0 flex-col items-center text-center transition-colors hover:text-[#0a0a0a] dark:hover:text-[#fafafa]"
            >
              <span className="h-3 w-3 rounded-full border-2 border-[#0a0a0a]/25 bg-[#fafaf8] dark:border-[#333333] dark:bg-[#141414] shrink-0 group-hover:border-[#0a0a0a]/50 dark:group-hover:border-[#404040]" aria-hidden />
              <p className="mt-2 font-mono text-[10px] uppercase tracking-wider text-[#0a0a0a]/50 dark:text-[#fafafa]/50 whitespace-nowrap">{node.date}</p>
              <span className="mt-1 max-w-[140px] text-xs font-semibold text-[#0a0a0a]/80 dark:text-[#fafafa]/80 underline-offset-2 group-hover:underline md:max-w-[180px] md:text-sm">
                {node.title}
              </span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

/** Experience section (original design): dark grid with education + work. Timeline clicks scroll to card-education / card-{company}. */
function ExperienceSection() {
  return (
    <section id="experience" className="bg-[#0a0a0a] py-20 text-white dark:bg-[#141414] dark:text-white transition-colors duration-300 ease-in-out">
      <div className="mx-auto max-w-6xl px-6 md:px-12 lg:px-20">
        <Section>
          <motion.h2 variants={fadeUp} className="mb-2 text-3xl font-bold tracking-tight md:text-4xl">Experience</motion.h2>
          <motion.p variants={fadeUp} className="mb-10 text-[15px] text-white/50">Where I've applied my engineering and product thinking.</motion.p>
        </Section>
        {/* Education card (timeline scroll target) */}
        <Section>
          <motion.article
            id="card-education"
            variants={fadeUp}
            className="mb-4 flex flex-col justify-between border border-white/10 bg-white/5 p-5 transition-colors hover:border-white/20 hover:bg-white/10 dark:border-[#333333] dark:bg-[#1a1a1a] dark:hover:border-[#404040] dark:hover:bg-[#262626] scroll-mt-24"
          >
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-white/40">May {profileData.graduationYear}</p>
            <h3 className="mt-2 text-lg font-bold">{profileData.degree}</h3>
            <p className="mt-0.5 text-sm text-white/50">{profileData.university} · {profileData.college} · Athens, GA</p>
          </motion.article>
        </Section>
        <div className="grid gap-4 md:grid-cols-2">
          {workExperience.map((role) => (
            <Section key={role.title + role.company}>
              <motion.article
                id={`card-${slugify(role.company)}`}
                variants={fadeUp}
                className="flex h-full flex-col justify-between border border-white/10 bg-white/5 p-5 transition-colors hover:border-white/20 hover:bg-white/10 dark:border-[#333333] dark:bg-[#1a1a1a] dark:hover:border-[#404040] dark:hover:bg-[#262626] scroll-mt-24"
              >
                <div>
                  <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-white/40">{role.period}</p>
                  <h3 className="mt-2 text-lg font-bold">{role.title}</h3>
                  <p className="mt-0.5 text-sm text-white/50">{role.company} — {role.location}</p>
                  <ul className="mt-4 space-y-2 text-xs leading-relaxed text-white/60">
                    {role.highlights.slice(0, 3).map((h) => (
                      <li key={h} className="flex gap-2"><span className="mt-[7px] h-px w-3 shrink-0 bg-white/30" /><span>{h}</span></li>
                    ))}
                  </ul>
                </div>
              </motion.article>
            </Section>
          ))}
        </div>
      </div>
    </section>
  );
}

function SkillsCloud() {
  return (
    <section id="skills" className="mx-auto max-w-6xl px-6 py-20 md:px-12 lg:px-20 bg-[#fafaf8] dark:bg-[#111111] transition-colors duration-300 ease-in-out">
      <Section>
        <motion.h2 variants={fadeUp} className="mb-2 text-3xl font-bold tracking-tight md:text-4xl dark:text-[#fafafa]">Toolkit</motion.h2>
        <motion.p variants={fadeUp} className="mb-10 text-[15px] text-[#0a0a0a]/60 dark:text-[#fafafa]/60">Languages, frameworks, hardware, and core strengths.</motion.p>
      </Section>
      <div className="grid gap-8 md:grid-cols-2">
        <Section className="space-y-6">
          <SkillCategory label="Programming" items={skillsData.programming} />
          <SkillCategory label="Software & Tools" items={skillsData.software} />
        </Section>
        <Section className="space-y-6">
          <SkillCategory label="Hardware" items={skillsData.hardware} />
          <SkillCategory label="Core Strengths" items={skillsData.core} />
        </Section>
      </div>
      <Section className="mt-16 grid gap-8 border-t border-[#0a0a0a]/10 pt-10 dark:border-[#333333] md:grid-cols-2">
        <motion.div variants={fadeUp}>
          <h3 className="mb-4 text-lg font-bold dark:text-[#fafafa]">Leadership & Community</h3>
          <ul className="space-y-2">
            {leadership.map((item) => (
              <li key={`${item.role}-${item.organization}`} className="text-sm text-[#0a0a0a]/70 dark:text-[#fafafa]/70">
                <span className="font-medium text-[#0a0a0a] dark:text-[#fafafa]">{item.role}</span> — {item.organization}
                <span className="ml-2 font-mono text-[10px] text-[#0a0a0a]/40 dark:text-[#fafafa]/40">{item.period}</span>
              </li>
            ))}
          </ul>
        </motion.div>
        <motion.div variants={fadeUp}>
          <h3 className="mb-4 text-lg font-bold dark:text-[#fafafa]">Honors & Awards</h3>
          <ul className="space-y-2">
            {honors.map((honor) => (
              <li key={honor.title} className="text-sm text-[#0a0a0a]/70 dark:text-[#fafafa]/70">
                <span className="font-medium text-[#0a0a0a] dark:text-[#fafafa]">{honor.title}</span> — {honor.org}
                <span className="ml-2 font-mono text-[10px] text-[#0a0a0a]/40 dark:text-[#fafafa]/40">{honor.date}</span>
              </li>
            ))}
          </ul>
        </motion.div>
      </Section>
    </section>
  );
}

function SkillCategory({ label, items }: { label: string; items: string[] }) {
  return (
    <motion.div variants={fadeUp}>
      <p className="mb-2 font-mono text-[11px] uppercase tracking-[0.2em] text-[#0a0a0a]/40 dark:text-[#fafafa]/40">{label}</p>
      <div className="flex flex-wrap gap-2">
        {items.map((item) => (
          <span key={item} className="rounded-full border border-[#0a0a0a]/10 bg-white px-3 py-1.5 text-xs text-[#0a0a0a]/80 transition-colors hover:border-[#0a0a0a] hover:bg-[#0a0a0a] hover:text-white dark:border-[#333333] dark:bg-[#141414] dark:text-[#fafafa]/80 dark:hover:border-[#404040] dark:hover:bg-white dark:hover:text-[#0a0a0a]">{item}</span>
        ))}
      </div>
    </motion.div>
  );
}

function StudyAbroadSection() {
  return (
    <section className="border-t border-[#0a0a0a]/10 bg-[#f5f5f3] dark:border-[#333333] dark:bg-[#1a1a1a] transition-colors duration-300 ease-in-out">
      <div className="mx-auto max-w-6xl px-6 py-16 md:px-12 lg:px-20">
        <Section>
          <motion.h2 variants={fadeUp} className="mb-2 text-3xl font-bold tracking-tight md:text-4xl dark:text-[#fafafa]">Study Abroad</motion.h2>
          <motion.p variants={fadeUp} className="mb-8 font-mono text-[11px] uppercase tracking-[0.2em] text-[#0a0a0a]/40 dark:text-[#fafafa]/40">{studyAbroad.title} · {studyAbroad.period}</motion.p>
          <motion.ul variants={fadeUp} className="max-w-2xl space-y-3">
            {studyAbroad.highlights.map((h) => (
              <li key={h} className="flex gap-3 text-sm leading-relaxed text-[#0a0a0a]/70 dark:text-[#fafafa]/70"><span className="mt-[7px] h-px w-4 shrink-0 bg-[#0a0a0a]/20 dark:bg-[#333333]/80" /><span>{h}</span></li>
            ))}
          </motion.ul>
        </Section>
      </div>
    </section>
  );
}

function ContactCTA() {
  return (
    <section id="contact" className="relative overflow-hidden bg-[#0a0a0a] py-24 text-center text-white dark:bg-[#111111] dark:text-white transition-colors duration-300 ease-in-out">
      <div aria-hidden className="pointer-events-none absolute inset-0" style={{ background: 'radial-gradient(ellipse 70% 50% at 50% 50%, rgba(168,85,247,0.12) 0%, transparent 70%)' }} />
      <Section className="relative mx-auto max-w-3xl px-6">
        <motion.p variants={fadeUp} className="mb-4 font-mono text-xs uppercase tracking-[0.3em] text-white/40">What's next?</motion.p>
        <motion.h2 variants={fadeUp} className="text-4xl font-bold tracking-tight md:text-6xl">Let's build<br />something together.</motion.h2>
        <motion.div variants={fadeUp} className="mt-10 flex flex-wrap justify-center gap-3">
          <a href={getSayHiMailto()} className="rounded-full bg-white px-6 py-3 text-sm font-medium text-[#0a0a0a] transition-transform hover:scale-105 dark:bg-white dark:text-[#0a0a0a] dark:hover:bg-white/90">Say hi</a>
          <a href={`sms:+1${profileData.phone.replace(/\D/g, '')}`} className="rounded-full border border-white/20 px-6 py-3 text-sm font-medium text-white transition-colors hover:border-white hover:bg-white/10">Text me</a>
          <a href={profileData.resumeUrl} target="_blank" rel="noopener noreferrer" className="rounded-full border border-white/20 px-6 py-3 text-sm font-medium text-white transition-colors hover:border-white hover:bg-white/10">Resume ↗</a>
          <a href={profileData.cvUrl} target="_blank" rel="noopener noreferrer" className="rounded-full border border-white/20 px-6 py-3 text-sm font-medium text-white transition-colors hover:border-white hover:bg-white/10">CV ↗</a>
          <a href={`https://${profileData.linkedin}`} target="_blank" rel="noopener noreferrer" className="rounded-full border border-white/20 px-6 py-3 text-sm font-medium text-white transition-colors hover:border-white hover:bg-white/10">LinkedIn</a>
          <a href={`https://${profileData.github}`} target="_blank" rel="noopener noreferrer" className="rounded-full border border-white/20 px-6 py-3 text-sm font-medium text-white transition-colors hover:border-white hover:bg-white/10">GitHub</a>
        </motion.div>
      </Section>
    </section>
  );
}

function Footer() {
  const year = new Date().getFullYear();
  const repoUrl = 'https://github.com/jke48222/edusei-workstation'; // optional: set to '' if private
  return (
    <footer className="border-t border-[#0a0a0a]/10 bg-[#fafaf8] px-6 py-6 dark:border-[#333333] dark:bg-[#111111] md:px-12 lg:px-20 transition-colors duration-300 ease-in-out">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 text-[11px] text-[#0a0a0a]/40 dark:text-[#fafafa]/40">
        <p>{profileData.name} © {year}. Built with React & Three.js.</p>
        <div className="flex flex-wrap items-center gap-3">
          {repoUrl && (
            <a href={repoUrl} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-[#0a0a0a] dark:hover:text-[#fafafa]">Source</a>
          )}
          <p className="font-mono">Toggle the switch to explore the 3D workstation →</p>
        </div>
      </div>
    </footer>
  );
}
