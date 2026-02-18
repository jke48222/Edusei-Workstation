/**
 * @file Overlay.tsx
 * @description Terminal-style overlay for the immersive workstation: boot sequence, system
 * status, project grid, command input, and contact links. Theme-driven colors; supports
 * mobile detail panel with minimize/expand. CRT-style and scrollbar styling via theme.
 */

import { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWorkstationStore } from '../store/store';
import { useActiveTheme, useThemeStore, themePresets, SYSTEM_THEME_ID } from '../store/themeStore';
import {
  projectsData,
  profileData,
  getSayHiMailto,
  getBootSequence,
  getProjectById,
  helpText,
  skillsData,
} from '../data';
import type { ViewState } from '../store/store';
import { resumeAudioContext, playKeystroke, playBootComplete } from '../utils/terminalSound';

/** Local responsive hook: true when viewport width < 768px. */
function useIsMobile() {
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window !== 'undefined') return window.innerWidth < 768;
    return false;
  });

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  return isMobile;
}

/** Framer Motion variants for list animations (duration/stagger zero when reduced motion). */
function getStaggerList(reducedMotion: boolean) {
  return { visible: { transition: { staggerChildren: reducedMotion ? 0 : 0.015 } } };
}
function getFadeSlideUp(reducedMotion: boolean) {
  return {
    hidden: { opacity: 0, y: reducedMotion ? 0 : 8 },
    visible: { opacity: 1, y: 0, transition: { duration: reducedMotion ? 0 : 0.25, ease: [0.22, 1, 0.36, 1] } },
  };
}

/** Typewriter boot lines in terminal; calls onComplete when finished. */
function BootSequence({ lines, onComplete, reducedMotion }: { lines: string[]; onComplete: () => void; reducedMotion?: boolean }) {
  const theme = useActiveTheme();
  const [visibleLines, setVisibleLines] = useState(0);
  const lineDelay = reducedMotion ? 0 : 250;
  const doneDelay = reducedMotion ? 100 : 2000;

  useEffect(() => {
    if (visibleLines < lines.length) {
      const timer = setTimeout(() => setVisibleLines((p) => p + 1), lineDelay);
      return () => clearTimeout(timer);
    } else {
      const done = setTimeout(onComplete, doneDelay);
      return () => clearTimeout(done);
    }
  }, [visibleLines, lines.length, onComplete, lineDelay, doneDelay]);

  return (
    <div className="flex h-full flex-col items-center justify-center font-mono text-sm">
      <div className="w-full max-w-md space-y-1">
        {lines.slice(0, visibleLines).map((line, i) => (
          <motion.div
            key={i}
            initial={{ opacity: reducedMotion ? 1 : 0, x: reducedMotion ? 0 : -6 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: reducedMotion ? 0 : 0.15 }}
            style={{ color: theme.textDim }}
          >
            {line || '\u00A0'}
          </motion.div>
        ))}
        {visibleLines < lines.length && (
          <span
            className="inline-block h-4 w-2 animate-pulse"
            style={{ backgroundColor: theme.accent, opacity: 0.6 }}
          />
        )}
      </div>
    </div>
  );
}

/** Sidebar block: clock, date, and theme-driven styling. */
function SystemStatus() {
  const theme = useActiveTheme();
  const [clock, setClock] = useState('');
  const [date, setDate] = useState('');

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      setClock(now.toLocaleTimeString('en-US', { hour12: false }));
      setDate(now.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }));
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const dimStyle = { color: theme.textDim };
  const textStyle = { color: theme.text, opacity: 0.8 };
  const labelStyle = { color: theme.textDim, opacity: 0.6 };

  return (
    <div className="space-y-5 font-mono text-[11px]">
      <div>
        <p className="mb-1 uppercase tracking-widest text-[9px]" style={labelStyle}>System</p>
        <p className="tabular-nums" style={textStyle}>{date}</p>
        <p className="tabular-nums" style={textStyle}>{clock}</p>
      </div>

      <div>
        <p className="mb-1 uppercase tracking-widest text-[9px]" style={labelStyle}>User</p>
        <p style={textStyle}>{profileData.name}</p>
        <p className="text-[10px]" style={dimStyle}>{profileData.title}</p>
      </div>

      <div>
        <p className="mb-1 uppercase tracking-widest text-[9px]" style={labelStyle}>Education</p>
        <p className="text-[10px] leading-relaxed" style={dimStyle}>
          {profileData.degree}
          <br />
          {profileData.university}
          <br />
          {profileData.college}
        </p>
      </div>

      <div>
        <p className="mb-1.5 uppercase tracking-widest text-[9px]" style={labelStyle}>Links</p>
        <div className="space-y-1">
          <a
            href={`mailto:${profileData.email}`}
            className="block transition-opacity hover:opacity-100"
            style={{ color: theme.text, opacity: 0.6 }}
          >
            → {profileData.email}
          </a>
          <a
            href={`https://${profileData.linkedin}`}
            target="_blank"
            rel="noopener noreferrer"
            className="block transition-opacity hover:opacity-100"
            style={{ color: theme.text, opacity: 0.6 }}
          >
            → LinkedIn
          </a>
          <a
            href={`https://${profileData.github}`}
            target="_blank"
            rel="noopener noreferrer"
            className="block transition-opacity hover:opacity-100"
            style={{ color: theme.text, opacity: 0.6 }}
          >
            → GitHub
          </a>
        </div>
      </div>

      <div>
        <p className="mb-1 uppercase tracking-widest text-[9px]" style={labelStyle}>Modules</p>
        <p style={dimStyle}>
          {projectsData.length} projects loaded
        </p>
      </div>
    </div>
  );
}

// ─── Project card ────────────────────────────────────────────────

function ProjectCard({
  project,
  index,
  onClick,
  disabled,
  variants,
}: {
  project: (typeof projectsData)[number];
  index: number;
  onClick: () => void;
  disabled: boolean;
  variants?: { hidden: { opacity: number; y: number }; visible: { opacity: number; y: number; transition: object } };
}) {
  const theme = useActiveTheme();
  const cardVariants = variants ?? getFadeSlideUp(false);

  return (
    <motion.button
      layout={false}
      variants={cardVariants}
      onClick={onClick}
      disabled={disabled}
      className={`
        group relative w-full text-left rounded-md
        p-3 sm:p-4 font-mono transition-all duration-200
        ${disabled ? 'cursor-not-allowed opacity-40' : 'cursor-pointer active:scale-[0.99]'}
      `}
      style={{
        border: `1px solid ${theme.projectBorder}`,
        backgroundColor: theme.projectBg,
      }}
    >
      {/* Accent bar — uses theme base color */}
      <span
        className="absolute left-0 top-0 h-full w-[3px] rounded-l-md transition-all group-hover:w-1"
        style={{ backgroundColor: theme.accent }}
      />

      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px]" style={{ color: theme.textDim }}>
              {String(index + 1).padStart(2, '0')}
            </span>
            <span className="text-sm font-medium truncate" style={{ color: theme.text }}>
              {project.title}
            </span>
          </div>
          <p className="mt-1 text-[10px] line-clamp-1" style={{ color: theme.textDim }}>
            {project.tagline}
          </p>
        </div>

        <span
          className="shrink-0 rounded px-1.5 py-0.5 text-[9px] transition-colors"
          style={{
            backgroundColor: `${theme.accent}15`,
            color: theme.textDim,
          }}
        >
          run
        </span>
      </div>

      <div className="mt-2 flex flex-wrap gap-1 opacity-0 transition-opacity group-hover:opacity-100">
        {project.techStack.slice(0, 3).map((t) => (
          <span
            key={t}
            className="rounded-sm px-1.5 py-0.5 text-[8px]"
            style={{
              backgroundColor: `${theme.accent}12`,
              color: theme.textDim,
            }}
          >
            {t}
          </span>
        ))}
      </div>
    </motion.button>
  );
}

// ─── Main Terminal View ──────────────────────────────────────────

/** Map theme name (user input) to theme id. */
const THEME_NAME_TO_ID: Record<string, string> = {
  light: 'clean',
  modern: 'clean',
  dark: 'dark',
  crt: 'classic',
  classic: 'classic',
  sky: 'blue',
  blue: 'blue',
  cherry: 'pink',
  'cherry blossom': 'pink',
  pink: 'pink',
  nova: 'purple',
  purple: 'purple',
  bulldog: 'uga',
  'bulldog red': 'uga',
  uga: 'uga',
  red: 'uga',
  apollo: 'grayBlue',
  grayblue: 'grayBlue',
  greyblue: 'grayBlue',
  system: SYSTEM_THEME_ID,
  secret: 'gold',
  golden: 'gold',
};

/** Gag commands that print a fun response instead of running. */
const GAG_COMMANDS: Record<string, string[]> = {
  'rm -rf /': ['Nice try.'],
  'rm -rf *': ['Nice try.'],
  'format c:': ['Access denied.'],
  'del system32': ['Nice try.'],
  'sudo rm -rf /': ['Nice try.'],
};

function TerminalView() {
  const { setView, isAnimating, terminalBooted, setTerminalBooted, prefersReducedMotion, soundMuted, setSoundMuted } = useWorkstationStore();
  const setTheme = useThemeStore((s) => s.setTheme);
  const theme = useActiveTheme();
  const staggerList = useMemo(() => getStaggerList(prefersReducedMotion), [prefersReducedMotion]);
  const fadeSlideUp = useMemo(() => getFadeSlideUp(prefersReducedMotion), [prefersReducedMotion]);
  const [inputValue, setInputValue] = useState('');
  const [commandOutput, setCommandOutput] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();

  const handleCommand = (cmd: string) => {
    const trimmedCmd = cmd.trim().toLowerCase();
    let response: string[] = [];

    if (trimmedCmd === 'help') {
      response = helpText;
    } else if (trimmedCmd === 'go dawgs' || trimmedCmd === 'uga') {
      setTheme('uga');
      response = ['Go Dawgs! 🐾 Theme set to Bulldog Red.'];
    } else if (trimmedCmd === 'golden' || trimmedCmd === 'secret') {
      setTheme('gold');
      response = ['Theme set to Gold.'];
    } else if (GAG_COMMANDS[trimmedCmd]) {
      response = GAG_COMMANDS[trimmedCmd];
    } else if (trimmedCmd === 'clear') {
      setCommandOutput([]);
      setInputValue('');
      return;
    } else if (trimmedCmd === 'list') {
      response = ['Available projects:', ...projectsData.map((p) => `  → run ${p.executable}`)];
    } else if (trimmedCmd === 'about') {
      response = [
        `Name: ${profileData.name}`,
        `Title: ${profileData.title}`,
        `Education: ${profileData.degree}`,
        `University: ${profileData.university}`,
        `College: ${profileData.college}`,
        `Email: ${profileData.email}`,
        `LinkedIn: ${profileData.linkedin}`,
        `GitHub: ${profileData.github}`,
      ];
    } else if (trimmedCmd === 'skills') {
      response = [
        'PROGRAMMING:',
        `  ${skillsData.programming.join(', ')}`,
        '',
        'SOFTWARE:',
        `  ${skillsData.software.join(', ')}`,
        '',
        'HARDWARE:',
        `  ${skillsData.hardware.join(', ')}`,
      ];
    } else if (trimmedCmd === 'resume') {
      response = ['Opening resume...'];
      window.open('/resume.pdf', '_blank');
    } else if (trimmedCmd === 'cv') {
      response = ['Opening CV...'];
      window.open('/cv.pdf', '_blank');
    } else if (trimmedCmd === 'theme' || trimmedCmd.startsWith('theme ')) {
      const name = trimmedCmd === 'theme' ? '' : trimmedCmd.replace('theme ', '').trim();
      const themeList = [
        '  → theme system',
        ...(['clean', 'dark', 'classic', 'blue', 'pink', 'purple', 'uga', 'grayBlue'] as const).map(
          (id) => `  → theme ${themePresets[id].name.toLowerCase()}`,
        ),
      ];
      if (!name) {
        response = ['Available themes:', ...themeList];
      } else {
        const themeId = THEME_NAME_TO_ID[name] ?? Object.keys(themePresets).find((id) => themePresets[id].name.toLowerCase() === name);
        if (themeId && (themeId === SYSTEM_THEME_ID || themePresets[themeId])) {
          setTheme(themeId);
          response = [`Theme set to ${themePresets[themeId]?.name ?? 'System'}.`];
        } else {
          response = [`Theme '${name}' not found.`, 'Available themes:', ...themeList];
        }
      }
    } else if (trimmedCmd === 'run') {
      response = ['Available projects:', ...projectsData.map((p) => `  → run ${p.executable}`)];
    } else if (trimmedCmd.startsWith('run ')) {
      const raw = trimmedCmd.replace('run ', '').trim();
      const normalized = raw.toLowerCase().replace(/\.exe$/i, '').trim();
      const project = projectsData.find(
        (p) => p.executable.toLowerCase() === normalized,
      );
      if (project) {
        setCommandOutput((prev) => [...prev, `> ${cmd}`, `Loading ${project.title}...`]);
        setInputValue('');
        setTimeout(() => setView(project.id), 300);
        return;
      } else {
        response = [
          `Error: '${raw}' not found.`,
          'Available projects:',
          ...projectsData.map((p) => `  → run ${p.executable}`),
        ];
      }
    } else if (trimmedCmd) {
      response = [`Command not recognized: '${trimmedCmd}'. Type 'help' for commands.`];
    }

    setCommandOutput((prev) => [...prev, `> ${cmd}`, ...response]);
    setInputValue('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleCommand(inputValue);
      return;
    }
    if (!soundMuted && !prefersReducedMotion && e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
      resumeAudioContext();
      playKeystroke();
    }
  };

  const handleProjectClick = (id: ViewState) => {
    if (!isAnimating) {
      const project = getProjectById(id);
      if (project) {
        setCommandOutput((prev) => [...prev, `> run ${project.executable}`, `Loading ${project.title}...`]);
        setTimeout(() => setView(id), 300);
      }
    }
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [commandOutput]);

  return (
    <div
      className="absolute inset-0 flex items-center justify-center p-3 sm:p-6"
      onClick={() => inputRef.current?.focus()}
    >
      <div
        className="w-full max-w-5xl h-[92vh] sm:h-[82vh] max-h-[780px] flex flex-col rounded-xl overflow-hidden shadow-2xl crt-scanlines"
        style={{
          border: `1px solid ${theme.terminalBorder}`,
          backgroundColor: theme.terminalBg,
        }}
      >
        {/* ── Window chrome ─────────────────────────────────── */}
        <div
          className="flex items-center justify-between px-4 py-2.5"
          style={{
            borderBottom: `1px solid ${theme.terminalBorder}`,
            backgroundColor: theme.terminalBg === '#ffffff' ? '#f5f5f5' : `${theme.terminalBg}dd`,
          }}
        >
          <div className="flex items-center gap-2">
            <div className="flex gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
              <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
              <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
            </div>
            <span
              className="ml-3 font-mono text-[10px] tracking-wider"
              style={{ color: theme.textDim }}
            >
              EDUSEI WORKSTATION v2.026
            </span>
          </div>
          <span
            className="font-mono text-[10px] hidden sm:block"
            style={{ color: theme.textDim, opacity: 0.5 }}
          >
            bash · {profileData.name.toLowerCase().replace(' ', '_')}@workstation
          </span>
        </div>

        {/* ── Body ──────────────────────────────────────────── */}
        {!terminalBooted ? (
          <div className="flex-1 p-4">
            <BootSequence
              lines={getBootSequence()}
              onComplete={() => {
                setTerminalBooted(true);
                if (!soundMuted && !prefersReducedMotion) {
                  resumeAudioContext();
                  playBootComplete();
                }
              }}
              reducedMotion={prefersReducedMotion}
            />
          </div>
        ) : (
          <div className="flex flex-1 min-h-0">
            {/* ── Main content ─────────────────────────────── */}
            <div className="flex flex-1 flex-col min-h-0 overflow-hidden">
              <div
                className="flex-1 overflow-y-auto p-4 sm:p-5 terminal-scroll"
                ref={scrollRef}
                style={{
                  WebkitOverflowScrolling: 'touch',
                  touchAction: 'pan-y',
                  overscrollBehavior: 'contain',
                  '--scrollbar-color': `${theme.scrollbar}50`,
                  '--scrollbar-color-hover': `${theme.scrollbar}80`,
                } as React.CSSProperties}
              >
                {/* Welcome header */}
                <div
                  className="mb-5 pb-4"
                  style={{ borderBottom: `1px solid ${theme.projectBorder}` }}
                >
                  <h1
                    className="text-lg sm:text-xl font-bold tracking-tight"
                    style={{ color: theme.text }}
                  >
                    {profileData.name}
                  </h1>
                  <p className="mt-0.5 font-mono text-[11px]" style={{ color: theme.textDim }}>
                    {profileData.title} · {profileData.university} · Class of {profileData.graduationYear}
                  </p>
                  {/* Contact links — visible on mobile where sidebar is hidden. Backgrounds use theme.projectBg; edit here or in themeStore presets. */}
                  <div className="mt-2 flex flex-wrap gap-2 md:hidden">
                    <a
                      href={getSayHiMailto()}
                      className="rounded-md px-2.5 py-1 font-mono text-[10px] transition-colors"
                      style={{
                        border: `1px solid ${theme.accent}30`,
                        backgroundColor: theme.projectBg,
                        color: theme.text,
                        opacity: 0.7,
                      }}
                    >
                      Say hi
                    </a>
                    <a
                      href={`https://${profileData.linkedin}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-md px-2.5 py-1 font-mono text-[10px] transition-colors"
                      style={{
                        border: `1px solid ${theme.accent}30`,
                        backgroundColor: theme.projectBg,
                        color: theme.text,
                        opacity: 0.7,
                      }}
                    >
                      LinkedIn
                    </a>
                    <a
                      href={`https://${profileData.github}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-md px-2.5 py-1 font-mono text-[10px] transition-colors"
                      style={{
                        border: `1px solid ${theme.accent}30`,
                        backgroundColor: theme.projectBg,
                        color: theme.text,
                        opacity: 0.7,
                      }}
                    >
                      GitHub
                    </a>
                    <a
                      href="/resume.pdf"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-md px-2.5 py-1 font-mono text-[10px] transition-colors"
                      style={{
                        border: `1px solid ${theme.accent}30`,
                        backgroundColor: theme.projectBg,
                        color: theme.text,
                        opacity: 0.7,
                      }}
                    >
                      Resume
                    </a>
                  </div>
                </div>

                {/* Projects grid — always at top, shifts up when output present */}
                <div className="mb-4">
                  <p
                    className="mb-3 font-mono text-[10px] uppercase tracking-widest"
                    style={{ color: theme.textDim, opacity: 0.6 }}
                  >
                    Select project
                  </p>
                  <motion.div
                    variants={staggerList}
                    initial="hidden"
                    animate="visible"
                    className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3"
                  >
                    {projectsData.map((project, i) => (
                      <ProjectCard
                        key={project.id}
                        project={project}
                        index={i}
                        onClick={() => handleProjectClick(project.id)}
                        disabled={isAnimating}
                        variants={fadeSlideUp}
                      />
                    ))}
                  </motion.div>
                </div>

                {/* Command output — appears BELOW the projects */}
                {commandOutput.length > 0 && (
                  <div
                    className="mt-2 pt-4 space-y-0.5 font-mono text-[11px] sm:text-xs"
                    style={{ borderTop: `1px solid ${theme.projectBorder}` }}
                  >
                    <p
                      className="mb-2 font-mono text-[10px] uppercase tracking-widest"
                      style={{ color: theme.textDim, opacity: 0.6 }}
                    >
                      Output
                    </p>
                    {commandOutput.map((line, i) => (
                      <div
                        key={i}
                        style={{
                          color: line.startsWith('>')
                            ? theme.text
                            : theme.textDim,
                          opacity: line.startsWith('>') ? 0.8 : 0.6,
                        }}
                      >
                        {line}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* ── Command input bar ───────────────────────── */}
              <div
                className="px-4 py-3 terminal-input-wrap"
                style={{
                  borderTop: `1px solid ${theme.terminalBorder}`,
                  backgroundColor: theme.terminalBg === '#ffffff' ? '#fafafa' : `${theme.terminalBg}`,
                  ['--placeholder-color' as string]: theme.textDim,
                  ['--placeholder-opacity' as string]: '0.6',
                }}
              >
                <div className="flex items-center gap-2 font-mono text-xs sm:text-sm">
                  <span className="shrink-0" style={{ color: theme.textDim }}>
                    guest@edusei:~$
                  </span>
                  <input
                    ref={inputRef}
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onFocus={resumeAudioContext}
                    className="terminal-input flex-1 min-w-0 bg-transparent outline-none"
                    style={{
                      color: theme.text,
                      caretColor: theme.accent,
                    }}
                    placeholder="type 'help' for commands"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setSoundMuted(!soundMuted)}
                    className="shrink-0 rounded p-1.5 transition-opacity hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-offset-transparent"
                    style={{ color: theme.textDim }}
                    aria-label={soundMuted ? 'Unmute terminal sound' : 'Mute terminal sound'}
                    title={soundMuted ? 'Unmute terminal sound' : 'Mute terminal sound'}
                  >
                    {soundMuted ? (
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                        <path d="M11 5L6 9H2v6h4l5 4V5z" />
                        <line x1="23" y1="9" x2="17" y2="15" />
                        <line x1="17" y1="9" x2="23" y2="15" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                        <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* ── Sidebar (desktop only) ───────────────────── */}
            {!isMobile && (
              <aside
                className="hidden md:block w-52 shrink-0 p-4 overflow-y-auto terminal-scroll"
                style={{
                  borderLeft: `1px solid ${theme.terminalBorder}`,
                  backgroundColor: theme.terminalBg === '#ffffff' ? '#f8f8f8' : `${theme.terminalBg}`,
                  '--scrollbar-color': `${theme.scrollbar}50`,
                  '--scrollbar-color-hover': `${theme.scrollbar}80`,
                } as React.CSSProperties}
              >
                <SystemStatus />
              </aside>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Project Detail Panel ────────────────────────────────────────

function ProjectDetailPanel() {
  const { currentView, returnToMonitor, isAnimating, prefersReducedMotion } = useWorkstationStore();
  const theme = useActiveTheme();
  const isMobile = useIsMobile();
  const project = getProjectById(currentView);
  const [expandedRelated, setExpandedRelated] = useState<Record<number, boolean>>({});
  const [mobileExpanded, setMobileExpanded] = useState(true);
  const d = prefersReducedMotion ? 0 : 0.25;
  const delay = prefersReducedMotion ? 0 : 0.1;

  // Reset minimized state when switching to desktop so the panel isn't stuck minimized with no expand button
  useEffect(() => {
    if (!isMobile) setMobileExpanded(true);
  }, [isMobile]);

  if (!project || currentView === 'monitor') return null;

  if (isMobile) {
    return (
      <motion.div
        initial={prefersReducedMotion ? false : { opacity: 0, y: '100%' }}
        animate={{ opacity: 1, y: mobileExpanded ? 0 : 'calc(100% - 56px)' }}
        exit={prefersReducedMotion ? undefined : { opacity: 0, y: '100%' }}
        transition={{ duration: d, ease: [0.25, 0.1, 0.25, 1] }}
        className="absolute bottom-0 left-0 right-0 z-10"
        style={{ maxHeight: '85vh' }}
      >
        <div
          className="rounded-t-2xl backdrop-blur-md overflow-hidden"
          style={{
            borderTop: `1px solid ${theme.terminalBorder}`,
            backgroundColor: `${theme.terminalBg}f2`,
          }}
        >
          {/* Header with minimize/expand + back */}
          <div className="flex items-center justify-between px-4 py-3"
            style={{ borderBottom: `1px solid ${theme.projectBorder}` }}>
            <button
              onClick={() => !isAnimating && returnToMonitor()}
              disabled={isAnimating}
              className="font-mono text-xs transition-colors disabled:opacity-40"
              style={{ color: theme.textDim }}
            >
              ← Back
            </button>
            <button
              onClick={() => setMobileExpanded(!mobileExpanded)}
              className="flex items-center gap-1.5 rounded-full px-2.5 py-1 font-mono text-[10px] transition-colors"
              style={{
                border: `1px solid ${theme.accent}30`,
                color: theme.textDim,
              }}
            >
              {mobileExpanded ? '▼ Minimize' : '▲ Expand'}
            </button>
          </div>

          {mobileExpanded && (
            <div
              className="overflow-y-auto px-4 pb-6 terminal-scroll"
              style={{
                maxHeight: 'calc(85vh - 56px)',
                '--scrollbar-color': `${theme.scrollbar}50`,
                '--scrollbar-color-hover': `${theme.scrollbar}80`,
              } as React.CSSProperties}
            >
              <div className="pt-3">
                <h1 className="text-lg font-bold" style={{ color: theme.text }}>{project.title}</h1>
                <p className="mt-0.5 font-mono text-[10px]" style={{ color: theme.textDim }}>
                  {project.period} · {project.location}
                </p>

                {project.github && (
                  <a
                    href={project.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 inline-block rounded-md px-3 py-1.5 font-mono text-[11px] transition-colors"
                    style={{
                      border: `1px solid ${theme.accent}50`,
                      backgroundColor: `${theme.accent}12`,
                      color: theme.text,
                      opacity: 0.8,
                    }}
                  >
                    GitHub ↗
                  </a>
                )}

                <div className="mt-4 space-y-2">
                  {project.description.map((line, i) => (
                    <p key={i} className="font-mono text-[11px] leading-relaxed" style={{ color: theme.textDim }}>
                      • {line}
                    </p>
                  ))}
                </div>

                <div className="mt-4">
                  <p className="mb-1.5 font-mono text-[9px] uppercase tracking-widest" style={{ color: theme.textDim, opacity: 0.6 }}>
                    Tech Stack
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {project.techStack.map((t) => (
                      <span
                        key={t}
                        className="rounded px-2 py-0.5 font-mono text-[10px]"
                        style={{
                          border: `1px solid ${theme.accent}30`,
                          color: theme.textDim,
                        }}
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>

                {project.additionalProjects?.map((add, i) => (
                  <div key={i} className="mt-4 pl-3" style={{ borderLeft: `2px solid ${theme.accent}30` }}>
                    <h4 className="font-mono text-xs font-medium" style={{ color: theme.text, opacity: 0.8 }}>
                      {add.title}
                    </h4>
                    <p className="font-mono text-[10px]" style={{ color: theme.textDim }}>{add.period}</p>
                    {add.github && (
                      <a href={add.github} target="_blank" rel="noopener noreferrer"
                        className="mt-1 inline-block font-mono text-[10px] underline"
                        style={{ color: theme.textDim }}>
                        GitHub ↗
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={prefersReducedMotion ? false : { opacity: 0, x: 48 }}
      animate={{ opacity: 1, x: 0 }}
      exit={prefersReducedMotion ? undefined : { opacity: 0, x: 48 }}
      transition={{ duration: d, delay, ease: [0.22, 1, 0.36, 1] }}
      className="absolute right-0 top-0 h-full flex items-center justify-center p-8 w-full md:w-[48%]"
    >
      <div
        className="w-full max-w-xl max-h-[88vh] overflow-y-auto rounded-xl p-6 sm:p-8 shadow-2xl backdrop-blur-sm terminal-scroll"
        style={{
          border: `1px solid ${theme.terminalBorder}`,
          backgroundColor: `${theme.terminalBg}f2`,
          '--scrollbar-color': `${theme.scrollbar}50`,
          '--scrollbar-color-hover': `${theme.scrollbar}80`,
        } as React.CSSProperties}
      >
        <motion.button
          onClick={() => !isAnimating && returnToMonitor()}
          disabled={isAnimating}
          className="mb-5 font-mono text-xs transition-colors disabled:opacity-40"
          style={{ color: theme.textDim }}
          whileHover={!isAnimating && !prefersReducedMotion ? { x: -3 } : {}}
        >
          ← Back to Terminal
        </motion.button>

        <motion.div
          initial={prefersReducedMotion ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: d, delay }}
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold" style={{ color: theme.text }}>{project.title}</h1>
              <p className="mt-1 font-mono text-xs" style={{ color: theme.textDim }}>
                {project.period} · {project.location}
              </p>
            </div>
            <span
              className="mt-1 h-3 w-3 shrink-0 rounded-full"
              style={{ backgroundColor: theme.accent }}
            />
          </div>

          {project.github && (
            <a
              href={project.github}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-block rounded-md px-4 py-2 font-mono text-xs transition-colors"
              style={{
                border: `1px solid ${theme.accent}40`,
                backgroundColor: `${theme.accent}12`,
                color: theme.text,
                opacity: 0.8,
              }}
            >
              View on GitHub ↗
            </a>
          )}
        </motion.div>

        <motion.div
          className="mt-6 space-y-3"
          initial={prefersReducedMotion ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: d, delay: delay + 0.05 }}
        >
          {project.description.map((para, i) => (
            <p key={i} className="font-mono text-[13px] leading-relaxed" style={{ color: theme.textDim }}>
              • {para}
            </p>
          ))}
        </motion.div>

        <motion.div
          className="mt-6"
          initial={prefersReducedMotion ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: d, delay: delay * 2 }}
        >
          <p
            className="mb-2 font-mono text-[10px] uppercase tracking-widest"
            style={{ color: theme.textDim, opacity: 0.6 }}
          >
            Technologies
          </p>
          <div className="flex flex-wrap gap-2">
            {project.techStack.map((tech) => (
              <span
                key={tech}
                className="rounded px-2.5 py-1 font-mono text-[11px]"
                style={{
                  border: `1px solid ${theme.accent}30`,
                  backgroundColor: `${theme.accent}08`,
                  color: theme.textDim,
                }}
              >
                {tech}
              </span>
            ))}
          </div>
        </motion.div>

        {project.additionalProjects?.length ? (
          <motion.div
            className="mt-8"
            initial={prefersReducedMotion ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: d, delay: delay * 2.5 }}
          >
            <p
              className="mb-3 font-mono text-[10px] uppercase tracking-widest"
              style={{ color: theme.textDim, opacity: 0.6 }}
            >
              Related Projects
            </p>
            <div className="space-y-3">
              {project.additionalProjects.map((add, i) => (
                <div key={i} className="pl-4" style={{ borderLeft: `2px solid ${theme.accent}25` }}>
                  <div className="flex items-center gap-2">
                    <h4 className="font-mono text-sm font-medium" style={{ color: theme.text, opacity: 0.8 }}>
                      {add.title}
                    </h4>
                    {add.github && (
                      <a
                        href={add.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-mono text-[10px] underline transition-opacity hover:opacity-100"
                        style={{ color: theme.textDim, opacity: 0.6 }}
                      >
                        GitHub ↗
                      </a>
                    )}
                  </div>
                  <p className="font-mono text-[10px]" style={{ color: theme.textDim, opacity: 0.6 }}>{add.period}</p>

                  <AnimatePresence>
                    {expandedRelated[i] && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: d }}
                        className="overflow-hidden"
                      >
                        <div className="mt-2 space-y-1.5">
                          {add.description.map((d, j) => (
                            <p key={j} className="font-mono text-[11px] leading-relaxed" style={{ color: theme.textDim }}>
                              • {d}
                            </p>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {add.description.length > 0 && (
                    <button
                      onClick={() =>
                        setExpandedRelated((prev) => ({ ...prev, [i]: !prev[i] }))
                      }
                      className="mt-1 font-mono text-[10px] underline transition-opacity hover:opacity-100"
                      style={{ color: theme.textDim, opacity: 0.6 }}
                    >
                      {expandedRelated[i] ? 'collapse' : `+${add.description.length} details`}
                    </button>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        ) : null}

        <motion.div
          className="mt-8 pt-4 text-center"
          style={{ borderTop: `1px solid ${theme.projectBorder}` }}
          initial={prefersReducedMotion ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: d, delay: delay * 3 }}
        >
          <span className="font-mono text-[10px]" style={{ color: theme.textDim, opacity: 0.5 }}>
            ↺ Drag the 3D model to rotate · ESC to return
          </span>
        </motion.div>
      </div>
    </motion.div>
  );
}

// ─── Transition indicator ────────────────────────────────────────

function TransitionIndicator() {
  const { isAnimating, currentView, prefersReducedMotion } = useWorkstationStore();
  const theme = useActiveTheme();
  if (!isAnimating) return null;

  return (
    <motion.div
      initial={prefersReducedMotion ? false : { opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={prefersReducedMotion ? undefined : { opacity: 0, y: -8 }}
      transition={{ duration: prefersReducedMotion ? 0 : 0.2 }}
      className="absolute left-1/2 top-4 z-50 -translate-x-1/2"
    >
      <div
        className="flex items-center gap-2 rounded-full px-4 py-2 font-mono text-xs backdrop-blur-sm"
        style={{
          border: `1px solid ${theme.terminalBorder}`,
          backgroundColor: `${theme.terminalBg}e6`,
          color: theme.textDim,
        }}
      >
        <span className="overlay-spinner" aria-hidden>◐</span>
        {currentView === 'monitor' ? 'Returning...' : 'Loading...'}
      </div>
    </motion.div>
  );
}

// ─── Main Overlay Export ─────────────────────────────────────────

export function Overlay() {
  const { currentView } = useWorkstationStore();
  const isMonitor = currentView === 'monitor';

  // Keep TerminalView mounted and toggle visibility so "Back" never shows a black frame
  return (
    <div className="overlay-container">
      <div
        className="absolute inset-0"
        style={{
          visibility: isMonitor ? 'visible' : 'hidden',
          pointerEvents: isMonitor ? 'auto' : 'none',
          zIndex: isMonitor ? 1 : 0,
        }}
      >
        <TerminalView />
      </div>
      <AnimatePresence mode="sync">
        {!isMonitor && <ProjectDetailPanel key="project-detail" />}
      </AnimatePresence>

      <AnimatePresence>
        <TransitionIndicator key="transition" />
      </AnimatePresence>
    </div>
  );
}
