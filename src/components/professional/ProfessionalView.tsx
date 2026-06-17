/**
 * @file ProfessionalView.tsx
 * @description Redesigned recruiter-facing portfolio (2026). Built on the `.pf` design
 * system (src/index.css) with a signature emerald→violet accent, custom motifs, lucide
 * icons, kinetic typography, an animated gradient-mesh hero, and interactive Selected Work
 * tiles. Section components are exported for reuse by the standalone sub-page routes.
 */

import { Analytics } from '@vercel/analytics/react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Component, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  ArrowRight, ArrowUpRight, FileText, FileBadge, Mail,
  Linkedin, Github, Sparkles, GraduationCap, MapPin, Compass, Boxes,
  Trophy, Award, Plane, Users, Heart, Quote,
} from 'lucide-react';
import {
  profileData,
  featuredProjects,
  skillsData,
  workExperience,
  leadership,
  honors,
  certifications,
  studyAbroad,
  getSayHiMailto,
} from '../../data';
import { useThemeStore } from '../../store/themeStore';
import CountUp from '../CountUp';
import { BackToTop } from './BackToTop';
import { FloatingDock } from './FloatingDock';
import { HeroVideoTitle } from './HeroVideoTitle';
import { SectionHeading, MagneticButton, Reveal, SKILL_ICON } from './ui/Kit';
import { ProjectTile } from './ui/ProjectTile';
import { MotifDivider, CircuitMotif, WaveMotif, SpiritMotif } from './ui/Motifs';
import { SiteHeader } from './SectionPage';

/* -------------------------------------------------------------------------- */
/* Hero title fallback                                                          */
/* -------------------------------------------------------------------------- */

const HeroPlainTextFallback = () => (
  <span className="block text-[clamp(3.5rem,14vw,12rem)]">JALEN<br />EDUSEI</span>
);

class HeroTitleErrorBoundary extends Component<
  { children: React.ReactNode; fallback: React.ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false };
  static getDerivedStateFromError = () => ({ hasError: true });
  render() {
    return this.state.hasError ? this.props.fallback : this.props.children;
  }
}

function HeroTitleWithFallback({ dark }: { dark: boolean }) {
  return (
    <HeroTitleErrorBoundary fallback={<HeroPlainTextFallback />}>
      <HeroVideoTitle dark={dark} />
    </HeroTitleErrorBoundary>
  );
}

/* -------------------------------------------------------------------------- */
/* Root                                                                        */
/* -------------------------------------------------------------------------- */

export function ProfessionalView() {
  const location = useLocation();
  const portfolioDark = useThemeStore((s) => s.portfolioDark);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

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
      const t = setTimeout(() => el.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
      return () => clearTimeout(t);
    }
  }, [location.pathname, location.hash]);

  return (
    <div
      ref={scrollContainerRef}
      className={`pro-scroll pf fixed inset-0 z-40 overflow-y-auto font-sans transition-colors duration-300 ${portfolioDark ? 'dark' : ''}`}
      style={{ background: 'var(--pf-bg)', color: 'var(--pf-ink)' }}
      data-portfolio-dark={portfolioDark}
    >
      <SiteHeader />
      <Hero />
      <Marquee />
      <Stats />
      <AboutBand />
      <ProjectsList />
      <Timeline />
      <ExperienceSection />
      <SkillsCloud />
      <CertificationsSection />
      <StudyAbroadSection />
      <ContactCTA />
      <Footer />
      <FloatingDock />
      <BackToTop />
      <Analytics />
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Hero                                                                        */
/* -------------------------------------------------------------------------- */

function Hero() {
  const portfolioDark = useThemeStore((s) => s.portfolioDark);
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const yTitle = useTransform(scrollYProgress, [0, 1], [0, -80]);

  return (
    <header ref={ref} className="pf-mesh pf-grain relative min-h-[94vh] overflow-hidden">
      <div className="relative z-10 mx-auto flex min-h-[94vh] max-w-7xl flex-col justify-end px-6 pb-20 pt-28 md:px-12 lg:px-20">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="mb-6 flex flex-wrap items-center gap-3">
            <span className="pf-pill">
              <Sparkles className="h-3.5 w-3.5 text-[var(--pf-accent-deep)] dark:text-[var(--pf-accent-bright)]" />
              Computer Systems Engineering · UGA
            </span>
            {profileData.openForWork && (
              <a
                href={`https://${profileData.linkedin}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-full bg-[var(--pf-accent)]/12 px-3 py-1.5 text-xs font-semibold text-[var(--pf-accent-deep)] ring-1 ring-[var(--pf-accent)]/30 transition-colors hover:bg-[var(--pf-accent)]/20 dark:text-[var(--pf-accent-bright)]"
              >
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[var(--pf-accent)]" /> Open for Work
              </a>
            )}
          </div>

          <motion.h1
            style={{ y: yTitle }}
            className="font-display font-extrabold leading-[0.84] tracking-tighter text-[var(--pf-ink)]"
            aria-label="Jalen Edusei"
          >
            <HeroTitleWithFallback dark={portfolioDark} />
          </motion.h1>

          <div className="mt-8 flex flex-col gap-8 md:flex-row md:items-end md:justify-between md:gap-12">
            <p className="max-w-xl text-lg leading-relaxed text-[var(--pf-ink-soft)]">
              I build across the full stack, from{' '}
              <span className="pf-accent-text font-semibold">CubeSat flight software</span> and{' '}
              <span className="pf-accent-text font-semibold">contactless health sensors</span> to{' '}
              <span className="pf-accent-text font-semibold">AI-powered web apps</span> and immersive VR.
            </p>
            <div className="flex flex-wrap gap-3">
              <MagneticButton href={getSayHiMailto()} variant="solid">
                <Mail className="h-4 w-4" /> Say hi
              </MagneticButton>
              <MagneticButton href={profileData.resumeUrl} external variant="outline">
                <FileText className="h-4 w-4" /> Résumé
              </MagneticButton>
              <MagneticButton href={profileData.cvUrl} external variant="outline">
                <FileBadge className="h-4 w-4" /> CV
              </MagneticButton>
            </div>
          </div>
        </motion.div>
      </div>
    </header>
  );
}

/* -------------------------------------------------------------------------- */
/* Marquee                                                                     */
/* -------------------------------------------------------------------------- */

const marqueeItems = [
  'Python', 'Unity3D', 'Figma', 'C++', 'Signal Processing', 'JavaScript', '2U CubeSat',
  'STM32', 'Verilog', 'VR / XR', 'TypeScript', 'Next.js', 'Supabase', 'ESP32', 'Tailwind CSS',
  'React Native', 'Shopify', 'BLE / NimBLE', 'Sanity CMS', 'Node.js', 'MQTT', 'Microfluidics',
  'Photolithography', 'Claude API', 'LLM Agents', 'Wit.ai', 'Prompt Engineering', 'React Three Fiber',
  'Meta Quest 3', 'Embedded Systems', 'Xilinx', 'Raspberry Pi',
];

function shuffleArray<T>(array: T[]): T[] {
  const a = [...array];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function Marquee() {
  const trackRef = useRef<HTMLDivElement>(null);
  const copyWidthRef = useRef(0);
  const translateRef = useRef(0);
  const SPEED = 46;
  const [shuffledItems] = useState(() => shuffleArray(marqueeItems));

  const renderItems = (copyId: string) =>
    shuffledItems.map((item, i) => (
      <span key={`${copyId}-${i}`} className="mx-5 inline-flex shrink-0 items-center text-sm font-semibold uppercase tracking-[0.18em]">
        {item}
        <span className="ml-5 text-[var(--pf-accent-bright)]">✦</span>
      </span>
    ));

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const measure = () => {
      const firstCopy = track.querySelector(':scope > div:first-child') as HTMLElement;
      if (firstCopy) copyWidthRef.current = firstCopy.offsetWidth;
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(track);
    let rafId: number;
    let lastTime = performance.now();
    const animate = (now: number) => {
      const delta = (now - lastTime) / 1000;
      lastTime = now;
      if (copyWidthRef.current > 0) {
        translateRef.current -= SPEED * delta;
        if (translateRef.current <= -copyWidthRef.current) translateRef.current += copyWidthRef.current;
      }
      track.style.transform = `translate3d(${translateRef.current}px,0,0)`;
      rafId = requestAnimationFrame(animate);
    };
    rafId = requestAnimationFrame(animate);
    return () => {
      cancelAnimationFrame(rafId);
      ro.disconnect();
    };
  }, []);

  return (
    <div className="pf-band-dark relative overflow-hidden border-y border-[var(--pf-line)] py-3.5">
      <div ref={trackRef} className="flex whitespace-nowrap will-change-transform">
        <div className="flex shrink-0 items-center">{renderItems('a')}</div>
        <div className="flex shrink-0 items-center" aria-hidden>{renderItems('b')}</div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Stats                                                                       */
/* -------------------------------------------------------------------------- */

const stats = [
  { from: 0, to: 25, suffix: '+', label: 'Technical Projects', icon: Boxes, duration: 1.5, delay: 0 },
  { from: 0, to: 60, suffix: 'M+', label: 'Users Impacted', icon: Users, duration: 0.7, delay: 0.2 },
  { from: 2020, to: 2026, suffix: '', label: 'Graduated', icon: GraduationCap, duration: 1.9, delay: 0.4 },
  { from: 0, to: 100, suffix: '+', label: 'Members Led', icon: Heart, duration: 0.5, delay: 0.1 },
];

export function Stats() {
  const sectionRef = useRef<HTMLDivElement>(null);
  return (
    <div ref={sectionRef} className="mx-auto grid max-w-7xl grid-cols-2 gap-4 px-6 py-16 md:grid-cols-4 md:gap-6 md:px-12 lg:px-20">
      {stats.map((s) => (
        <Reveal key={s.label} delay={s.delay}>
          <div
            className="pf-stat-glass group relative overflow-hidden rounded-[var(--pf-radius)] p-5 text-center transition-all duration-500 hover:-translate-y-1 hover:shadow-[var(--pf-shadow)]"
            style={{ containerType: 'inline-size' }}
          >
            <s.icon className="mx-auto mb-3 h-5 w-5 text-[var(--pf-accent-deep)] transition-transform duration-500 group-hover:scale-125 dark:text-[var(--pf-accent-bright)]" />
            <p
              className="whitespace-nowrap font-sans font-bold leading-none tracking-tight text-[var(--pf-ink)]"
              style={{ fontSize: 'clamp(1.5rem, 20cqw, 3rem)' }}
            >
              <CountUp from={s.from} to={s.to} duration={s.duration} delay={s.delay} className="inline" triggerRef={sectionRef} />
              {s.suffix}
            </p>
            <p
              className="mt-2 font-mono uppercase tracking-[0.16em] text-[var(--pf-ink-faint)]"
              style={{ fontSize: 'clamp(0.6rem, 5cqw, 0.72rem)' }}
            >
              {s.label}
            </p>
          </div>
        </Reveal>
      ))}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* About                                                                       */
/* -------------------------------------------------------------------------- */

export function AboutBand() {
  const facts = [
    { label: 'Degree', value: profileData.degree, icon: GraduationCap },
    { label: 'University', value: `${profileData.university} · ${profileData.college}`, icon: MapPin },
    { label: 'Focus', value: 'Embedded · Full Stack · VR/XR · Design', icon: Compass },
    { label: 'Based in', value: 'Athens, GA', icon: Users },
  ];
  return (
    <section id="about" className="relative w-full">
      <div className="mx-auto max-w-7xl px-6 py-20 md:px-12 lg:px-20">
        <div className="grid items-start gap-12 md:grid-cols-[1.3fr,1fr]">
          <Reveal>
            <div className="mb-3 inline-flex items-center gap-2 text-[var(--pf-accent-deep)] dark:text-[var(--pf-accent-bright)]">
              <SpiritMotif className="h-4 w-4" />
              <span className="font-mono text-[11px] uppercase tracking-[0.32em]">About</span>
            </div>
            <h2 className="font-display text-3xl font-extrabold leading-[1.05] tracking-tight text-[var(--pf-ink)] md:text-5xl">
              I like building things
              <br />
              <span className="pf-accent-text">that don't exist yet.</span>
            </h2>
            <p className="mt-6 max-w-xl text-[15px] leading-relaxed text-[var(--pf-ink-soft)]">
              I earned my Computer Systems Engineering degree at UGA's College of Engineering and Morehead
              Honors College. My work spans C/C++ flight software for a 2U CubeSat, contactless animal-health
              sensing, AI-powered web platforms, and immersive VR, wherever hardware, software, and design meet.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <MagneticButton href="/work" variant="outline">
                <Boxes className="h-4 w-4" /> See the work
              </MagneticButton>
              <MagneticButton href={getSayHiMailto()} variant="ghost">
                Get in touch <ArrowRight className="h-4 w-4" />
              </MagneticButton>
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="overflow-hidden rounded-[var(--pf-radius-lg)] border border-[var(--pf-line)] bg-[var(--pf-bg-elev)] shadow-[var(--pf-shadow)]">
              {/* headshot — clean, cropped to the face */}
              <img
                src="/headshot.png"
                alt={profileData.name}
                className="h-72 w-full object-cover"
                style={{ objectPosition: '50% 18%' }}
              />
              <dl className="divide-y divide-[var(--pf-line)]">
                {facts.map((f) => (
                  <div key={f.label} className="flex items-start gap-3 px-5 py-3.5">
                    <f.icon className="mt-0.5 h-4 w-4 shrink-0 text-[var(--pf-accent-deep)] dark:text-[var(--pf-accent-bright)]" />
                    <div>
                      <dt className="font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--pf-ink-faint)]">{f.label}</dt>
                      <dd className="text-sm text-[var(--pf-ink)]">{f.value}</dd>
                    </div>
                  </div>
                ))}
              </dl>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/* Selected Work (tile grid)                                                    */
/* -------------------------------------------------------------------------- */

export function ProjectsList() {
  return (
    <section id="work" className="relative w-full">
      <div className="mx-auto max-w-7xl px-6 py-20 md:px-12 lg:px-20">
        <SectionHeading
          eyebrow="Selected Work"
          title="Things I've built."
          icon={Boxes}
          sub="A cross-section of embedded, AI, web, and immersive projects. Hover a tile, or open one for a description."
          action={
            <Link
              to="/work"
              className="group inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.16em] text-[var(--pf-ink-soft)] transition-colors hover:text-[var(--pf-accent-deep)] dark:hover:text-[var(--pf-accent-bright)]"
            >
              View all
              <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>
          }
        />
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {featuredProjects.map((project, i) => (
            <ProjectTile
              key={project.id}
              project={project}
              index={i}
              featured={i === 0 || i === featuredProjects.length - 1}
              cardId={`card-${project.id}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/* Timeline                                                                     */
/* -------------------------------------------------------------------------- */

function periodToSortKey(period: string): string {
  const months: Record<string, string> = { january: '01', february: '02', march: '03', april: '04', may: '05', june: '06', july: '07', august: '08', september: '09', october: '10', november: '11', december: '12' };
  const match = period.toLowerCase().match(/(january|february|march|april|may|june|july|august|september|october|november|december)\s*(\d{4})/);
  if (match) return `${match[2]}-${months[match[1]] ?? '01'}`;
  const yearMatch = period.match(/\d{4}/);
  return yearMatch ? `${yearMatch[0]}-01` : '0000-01';
}

function slugify(s: string): string {
  return s.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
}

type TimelineNode = { id: string; date: string; title: string; sortKey: string; kind: 'edu' | 'work' | 'project' };

function getTimelineNodes(): TimelineNode[] {
  const education: TimelineNode = {
    id: 'about',
    date: `May ${profileData.graduationYear}`,
    title: profileData.degree,
    sortKey: `${profileData.graduationYear}-05`,
    kind: 'edu',
  };
  const work: TimelineNode[] = workExperience.map((role) => ({
    id: slugify(role.company),
    date: role.period,
    title: role.title,
    sortKey: periodToSortKey(role.period),
    kind: 'work',
  }));
  const projects: TimelineNode[] = featuredProjects.map((p) => ({
    id: p.id,
    date: p.period,
    title: p.title,
    sortKey: periodToSortKey(p.period),
    kind: 'project',
  }));
  return [education, ...work, ...projects].sort((a, b) => a.sortKey.localeCompare(b.sortKey));
}

function scrollToCard(id: string) {
  (document.getElementById(`card-${id}`) ?? document.getElementById(id))?.scrollIntoView({
    behavior: 'smooth',
    block: 'start',
  });
}

export function Timeline() {
  const nodes = getTimelineNodes();
  return (
    <section id="timeline" className="relative w-full">
      <div className="mx-auto max-w-7xl px-6 py-20 md:px-12 lg:px-20">
        <SectionHeading
          eyebrow="Journey"
          title="A timeline."
          icon={Compass}
          sub="Education, experience, and projects in order. Click any node to jump to it."
        />
        <div className="timeline-scroll -mx-6 overflow-x-auto px-6 pb-4 md:-mx-12 md:px-12">
          <div className="relative flex min-w-max items-start gap-8 pt-1 md:gap-12">
            <div className="absolute left-0 right-0 top-[7px] h-0.5 min-w-full rounded-full bg-gradient-to-r from-[var(--pf-accent)] via-[var(--pf-accent)]/45 to-[var(--pf-accent-2)]" aria-hidden />
            {nodes.map((node) => (
              <button
                key={node.id}
                type="button"
                onClick={() => scrollToCard(node.id)}
                className="group relative z-10 flex shrink-0 flex-col items-center text-center"
              >
                <span
                  className={`h-3.5 w-3.5 shrink-0 rounded-full border-2 transition-all group-hover:scale-125 ${
                    node.kind === 'project'
                      ? 'border-[var(--pf-accent)] bg-[var(--pf-accent)]/20'
                      : node.kind === 'edu'
                        ? 'border-[var(--pf-accent-2)] bg-[var(--pf-accent-2)]/20'
                        : 'border-[var(--pf-ink-faint)] bg-[var(--pf-bg)]'
                  }`}
                  aria-hidden
                />
                <p className="mt-2 whitespace-nowrap font-mono text-[10px] uppercase tracking-wider text-[var(--pf-ink-faint)]">{node.date}</p>
                <span className="mt-1 max-w-[140px] text-xs font-semibold text-[var(--pf-ink-soft)] underline-offset-2 group-hover:text-[var(--pf-ink)] group-hover:underline md:max-w-[180px] md:text-sm">
                  {node.title}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/* Experience                                                                   */
/* -------------------------------------------------------------------------- */

export function ExperienceSection() {
  return (
    <section id="experience" className="pf-experience-band relative w-full overflow-hidden">
      <div className="pf-grain pointer-events-none absolute inset-0" aria-hidden />
      <div className="relative mx-auto max-w-7xl px-6 py-24 md:px-12 lg:px-20">
        <div className="mb-10">
          <div className="mb-3 inline-flex items-center gap-2 text-[var(--pf-accent-bright)]">
            <CircuitMotif className="h-4 w-4" />
            <span className="font-mono text-[11px] uppercase tracking-[0.32em]">Experience</span>
          </div>
          <h2 className="font-display text-4xl font-extrabold tracking-tight md:text-6xl">Where I've worked.</h2>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          {workExperience.map((role, i) => (
            <Reveal key={role.title + role.company} delay={(i % 2) * 0.08}>
              <article
                id={`card-${slugify(role.company)}`}
                className="flex h-full flex-col rounded-[var(--pf-radius-lg)] border border-white/10 bg-white/[0.04] p-6 backdrop-blur-sm transition-all duration-500 hover:-translate-y-1 hover:border-[var(--pf-accent)]/40 hover:bg-white/[0.07]"
                style={{ scrollMarginTop: '6rem' }}
              >
                <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-[var(--pf-accent-bright)]">{role.period}</p>
                <h3 className="mt-2 font-display text-xl font-bold text-white">{role.title}</h3>
                <p className="mt-0.5 text-sm text-white/55">{role.company} · {role.location}</p>
                <ul className="mt-4 space-y-2.5 text-[13px] leading-relaxed text-white/65">
                  {role.highlights.slice(0, 3).map((h) => (
                    <li key={h} className="flex gap-2.5">
                      <ArrowRight className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[var(--pf-accent-bright)]" />
                      <span>{h}</span>
                    </li>
                  ))}
                </ul>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/* Skills + Leadership + Honors                                                 */
/* -------------------------------------------------------------------------- */

const skillGroups: { label: string; items: string[] }[] = [
  { label: 'Programming', items: skillsData.programming },
  { label: 'AI & Machine Learning', items: skillsData.ai },
  { label: 'Software & Tools', items: skillsData.software },
  { label: 'Hardware', items: skillsData.hardware },
  { label: 'Core Strengths', items: skillsData.core },
];

/** Parse the earliest start year and latest end (or 'Present') from a list of periods. */
function spanFromPeriods(periods: string[]): string {
  const years = periods.flatMap((p) => (p.match(/\d{4}/g) ?? []).map(Number));
  const present = periods.some((p) => /present/i.test(p));
  if (!years.length) return '';
  const start = Math.min(...years);
  const end = present ? 'Present' : Math.max(...years);
  return start === end ? `${start}` : `${start} – ${end}`;
}

type LeadershipOrg = {
  organization: string;
  span: string;
  roles: { role: string; period: string }[];
};

/** Group leadership entries by organization, preserving first-appearance order and role progression. */
function groupLeadershipByOrg(items: typeof leadership): LeadershipOrg[] {
  const map = new Map<string, { role: string; period: string }[]>();
  for (const it of items) {
    if (!map.has(it.organization)) map.set(it.organization, []);
    map.get(it.organization)!.push({ role: it.role, period: it.period });
  }
  return Array.from(map.entries()).map(([organization, roles]) => ({
    organization,
    roles,
    span: spanFromPeriods(roles.map((r) => r.period)),
  }));
}

export function SkillsCloud() {
  return (
    <section id="skills" className="relative w-full">
      <div className="mx-auto max-w-7xl px-6 py-20 md:px-12 lg:px-20">
        <SectionHeading
          eyebrow="Toolkit"
          title="What I build with."
          icon={Sparkles}
          sub="Languages, frameworks, hardware, AI, and the strengths that tie them together."
        />
        <div className="grid gap-4 md:grid-cols-2">
          {skillGroups.map((g, i) => (
            <SkillCategory key={g.label} label={g.label} items={g.items} wide={i === 4} />
          ))}
        </div>

        <MotifDivider className="my-14" />

        <div className="grid gap-10 lg:grid-cols-[1.3fr,1fr]">
          <Reveal>
            <h3 className="mb-6 inline-flex items-center gap-2 font-display text-xl font-bold text-[var(--pf-ink)]">
              <Users className="h-5 w-5 text-[var(--pf-accent-deep)] dark:text-[var(--pf-accent-bright)]" /> Leadership & Service
            </h3>
            <div className="grid items-start gap-4 sm:grid-cols-2">
              {groupLeadershipByOrg(leadership).map((org) => (
                <div
                  key={org.organization}
                  className="flex flex-col rounded-[var(--pf-radius)] border border-[var(--pf-line)] bg-[var(--pf-bg-elev)] p-5 transition-colors hover:border-[var(--pf-accent)]/30"
                >
                  <p className="font-display text-base font-bold leading-snug text-[var(--pf-ink)]">{org.organization}</p>
                  <p className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--pf-ink-faint)]">{org.span}</p>
                  <ul className="mt-3 space-y-1.5">
                    {org.roles.map((r) => (
                      <li key={r.role + r.period} className="flex items-baseline justify-between gap-3 text-sm">
                        <span className="text-[var(--pf-ink-soft)]">{r.role}</span>
                        <span className="shrink-0 font-mono text-[10px] text-[var(--pf-ink-faint)]">{r.period}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <h3 className="mb-6 inline-flex items-center gap-2 font-display text-xl font-bold text-[var(--pf-ink)]">
              <Trophy className="h-5 w-5 text-[var(--pf-accent-deep)] dark:text-[var(--pf-accent-bright)]" /> Honors & Awards
            </h3>
            <div className="space-y-3">
              {honors.map((honor) => (
                <div
                  key={honor.title}
                  className="flex items-start gap-4 rounded-[var(--pf-radius)] border border-[var(--pf-line)] bg-[var(--pf-bg-elev)] p-4 transition-colors hover:border-[var(--pf-accent)]/30"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--pf-accent-3)]/15 text-[var(--pf-accent-3)]">
                    <Award className="h-4.5 w-4.5" />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-[var(--pf-ink)]">{honor.title}</p>
                    <p className="text-xs text-[var(--pf-ink-soft)]">{honor.org} · <span className="font-mono text-[var(--pf-ink-faint)]">{honor.date}</span></p>
                  </div>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function SkillCategory({ label, items, wide }: { label: string; items: string[]; wide?: boolean }) {
  const Icon = SKILL_ICON[label] ?? Sparkles;
  return (
    <Reveal className={wide ? 'md:col-span-2' : ''}>
      <div className="h-full rounded-[var(--pf-radius)] border border-[var(--pf-line)] bg-[var(--pf-bg-elev)] p-5 transition-colors hover:border-[var(--pf-accent)]/30">
        <div className="mb-4 inline-flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--pf-accent)]/12 text-[var(--pf-accent-deep)] dark:text-[var(--pf-accent-bright)]">
            <Icon className="h-4 w-4" />
          </span>
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-[var(--pf-ink-soft)]">{label}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {items.map((item) => (
            <span key={item} className="pf-pill">{item}</span>
          ))}
        </div>
      </div>
    </Reveal>
  );
}

/* -------------------------------------------------------------------------- */
/* Certifications                                                               */
/* -------------------------------------------------------------------------- */

export function CertificationsSection() {
  return (
    <section id="certifications" className="relative w-full">
      <div className="mx-auto max-w-7xl px-6 py-20 md:px-12 lg:px-20">
        <SectionHeading eyebrow="Credentials" title="Certifications." icon={FileBadge} />
        <div className="grid gap-5 md:grid-cols-2">
          {certifications.map((c, i) => (
            <Reveal key={c.title} delay={(i % 2) * 0.08}>
              <article className="group flex h-full flex-col rounded-[var(--pf-radius-lg)] border border-[var(--pf-line)] bg-[var(--pf-bg-elev)] p-6 transition-all duration-500 hover:-translate-y-1 hover:shadow-[var(--pf-shadow)]">
                <div className="mb-4 flex items-center justify-between">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--pf-accent)]/12 text-[var(--pf-accent-deep)] dark:text-[var(--pf-accent-bright)]">
                    <FileBadge className="h-5 w-5" />
                  </span>
                  <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-[var(--pf-ink-faint)]">{c.date}</span>
                </div>
                <h3 className="font-display text-lg font-bold text-[var(--pf-ink)]">{c.title}</h3>
                <p className="mt-1 text-sm text-[var(--pf-ink-soft)]">{c.org}</p>
                <p className="mt-3 text-sm leading-relaxed text-[var(--pf-ink-soft)]">{c.summary}</p>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/* Study Abroad                                                                 */
/* -------------------------------------------------------------------------- */

function StudyAbroadSection() {
  return (
    <section className="relative w-full">
      <div className="mx-auto max-w-7xl px-6 pb-8 md:px-12 lg:px-20">
        <div className="overflow-hidden rounded-[var(--pf-radius-lg)] border border-[var(--pf-line)]">
          <div className="pf-tile-atmo pf-grain relative grid gap-8 p-8 md:grid-cols-[1fr,1.4fr] md:p-12">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 text-[var(--pf-accent-bright)]">
                <Plane className="h-4 w-4" />
                <span className="font-mono text-[11px] uppercase tracking-[0.32em]">Study Abroad</span>
              </div>
              <h2 className="font-display text-3xl font-extrabold leading-tight text-white">{studyAbroad.title}</h2>
              <p className="mt-2 font-mono text-xs uppercase tracking-[0.2em] text-white/50">{studyAbroad.period}</p>
            </div>
            <ul className="space-y-3 self-center">
              {studyAbroad.highlights.map((h) => (
                <li key={h} className="flex gap-3 text-sm leading-relaxed text-white/80">
                  <ArrowRight className="mt-0.5 h-4 w-4 shrink-0 text-[var(--pf-accent-bright)]" />
                  <span>{h}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/* Contact                                                                      */
/* -------------------------------------------------------------------------- */

export function ContactCTA() {
  return (
    <section id="contact" className="pf-mesh pf-grain relative w-full overflow-hidden">
      <div className="relative mx-auto max-w-4xl px-6 py-28 text-center">
        <Reveal>
          <p className="mb-4 inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.3em] text-[var(--pf-accent-deep)] dark:text-[var(--pf-accent-bright)]">
            <Quote className="h-4 w-4" /> What's next
          </p>
          <h2 className="font-display text-5xl font-extrabold leading-[0.95] tracking-tight text-[var(--pf-ink)] md:text-7xl">
            Let's build something
            <br />
            <span className="pf-accent-text">together.</span>
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-[15px] leading-relaxed text-[var(--pf-ink-soft)]">
            Open for full-time software & systems roles. Always happy to talk hardware, AI, VR, or a good build.
          </p>
        </Reveal>
        <Reveal delay={0.1}>
          <div className="mt-10 flex flex-wrap justify-center gap-3">
            <MagneticButton href={getSayHiMailto()} variant="solid"><Mail className="h-4 w-4" /> Say hi</MagneticButton>
            <MagneticButton href={profileData.resumeUrl} external variant="outline"><FileText className="h-4 w-4" /> Résumé</MagneticButton>
            <MagneticButton href={profileData.cvUrl} external variant="outline"><FileBadge className="h-4 w-4" /> CV</MagneticButton>
            <MagneticButton href={`https://${profileData.linkedin}`} external variant="outline"><Linkedin className="h-4 w-4" /> LinkedIn</MagneticButton>
            <MagneticButton href={`https://${profileData.github}`} external variant="outline"><Github className="h-4 w-4" /> GitHub</MagneticButton>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/* Footer                                                                        */
/* -------------------------------------------------------------------------- */

export function Footer() {
  const year = new Date().getFullYear();
  const repoUrl = 'https://github.com/jke48222/edusei-workstation';
  return (
    <footer className="border-t border-[var(--pf-line)] px-6 py-8 md:px-12 lg:px-20" style={{ background: 'var(--pf-bg)' }}>
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-[var(--pf-ink-faint)]">
          <WaveMotif className="h-4 w-4 text-[var(--pf-accent)]" />
          <p className="text-[11px]">{profileData.name} © {year} · Built with React, Three.js & care.</p>
        </div>
        <div className="flex flex-wrap items-center gap-4 text-[11px] text-[var(--pf-ink-faint)]">
          {repoUrl && (
            <a href={repoUrl} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 transition-colors hover:text-[var(--pf-ink)]">Source</a>
          )}
          <p className="font-mono">Toggle the switch to explore the 3D workstation →</p>
        </div>
      </div>
    </footer>
  );
}
