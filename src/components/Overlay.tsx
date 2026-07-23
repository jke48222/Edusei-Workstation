import { useState, useEffect, useRef, useMemo, useLayoutEffect } from 'react';
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

import { useIsNarrowViewport as useIsMobile } from '../hooks/useIsMobile';

function getStaggerList(reducedMotion: boolean) {
  return { visible: { transition: { staggerChildren: reducedMotion ? 0 : 0.015 } } };
}
function getFadeSlideUp(reducedMotion: boolean) {
  return {
    hidden: { opacity: 0, y: reducedMotion ? 0 : 8 },
    visible: { opacity: 1, y: 0, transition: { duration: reducedMotion ? 0 : 0.25, ease: [0.22, 1, 0.36, 1] } },
  };
}

function BootSequence({ lines, onComplete, reducedMotion }: { lines: string[]; onComplete: () => void; reducedMotion?: boolean }) {
  const theme = useActiveTheme();
  const [visibleLines, setVisibleLines] = useState(0);
  const lineDelay = reducedMotion ? 0 : 250;
  const doneDelay = reducedMotion ? 100 : 2000;

  // Latest-callback ref: the parent passes an inline arrow, and having it in the
  // effect deps would restart the pending timer on every parent re-render.
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  useEffect(() => {
    if (visibleLines < lines.length) {
      const timer = setTimeout(() => setVisibleLines((p) => p + 1), lineDelay);
      return () => clearTimeout(timer);
    } else {
      const done = setTimeout(() => onCompleteRef.current(), doneDelay);
      return () => clearTimeout(done);
    }
  }, [visibleLines, lines.length, lineDelay, doneDelay]);

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

/** Theme display name to command form (no spaces), e.g. "Bulldog Red" -> "bulldogred". */
function toThemeCommand(name: string): string {
  return name.toLowerCase().replace(/\s+/g, '');
}

/** Map theme name (user input) to theme id. Uses no-space command forms for multi-word themes. */
const THEME_NAME_TO_ID: Record<string, string> = {
  light: 'clean',
  modern: 'clean',
  dark: 'dark',
  crt: 'classic',
  classic: 'classic',
  sky: 'blue',
  blue: 'blue',
  cherry: 'pink',
  cherryblossom: 'pink',
  pink: 'pink',
  nova: 'purple',
  purple: 'purple',
  bulldog: 'uga',
  bulldogred: 'uga',
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

/** Commands that can be tab-completed (no secrets). */
const COMPLETE_COMMANDS = ['help', 'list', 'run', 'theme', 'about', 'skills', 'resume', 'cv', 'clear'];

const MAX_HISTORY = 50;

/** One-line (or multi-line) teaser shown before "Loading [title]..." when running a project (terminal or click). */
const PROJECT_TEASERS: Partial<Record<ViewState, string | string[]>> = {
  'audio-tracking-car': 'Vroom vroom 🏎️',
  animaldot: 'Go Dawgs! 🐾',
  'kitchen-chaos-vr': 'Entering virtual reality...',
  memesat: 'lol',
  'capital-one': ['Still open for work...', `https://${profileData.linkedin}`],
};

/** Theme command names for "theme " completion (no spaces; same order as theme list). */
function getThemeCompletionCandidates(): string[] {
  return [
    'system',
    ...(['clean', 'dark', 'classic', 'blue', 'pink', 'purple', 'uga', 'grayBlue'] as const).map(
      (id) => toThemeCommand(themePresets[id].name),
    ),
  ];
}

/** Returns the suffix to append for tab completion, or '' if none. */
function getCompletionSuffix(inputValue: string): string {
  const trimmed = inputValue.trimStart();
  if (!trimmed.length) return '';

  const lower = trimmed.toLowerCase();
  if (lower.startsWith('run ')) {
    const rawAfterRun = lower.slice(4);
    const prefix = rawAfterRun.trim(); // trim so "kitchen " -> "kitchen", suffix includes space e.g. " chaos"
    if (!prefix) return ''; // no suggestion until at least one character after "run "
    const candidates = projectsData.map((p) => p.executable.toLowerCase());
    const matches = candidates.filter((c) => c.startsWith(prefix));
    if (matches.length === 0) return '';
    const common = matches.reduce((a, b) => {
      let i = 0;
      while (i < a.length && i < b.length && a[i] === b[i]) i++;
      return a.slice(0, i);
    });
    return common.length > prefix.length ? common.slice(prefix.length) : matches[0].slice(prefix.length);
  }
  if (lower.startsWith('theme ')) {
    const prefix = lower.slice(6).trim();
    if (!prefix) return ''; // no suggestion until at least one character after "theme "
    const candidates = getThemeCompletionCandidates();
    const matches = candidates.filter((c) => c.startsWith(prefix));
    if (matches.length === 0) return '';
    const common = matches.reduce((a, b) => {
      let i = 0;
      while (i < a.length && i < b.length && a[i] === b[i]) i++;
      return a.slice(0, i);
    });
    return common.length > prefix.length ? common.slice(prefix.length) : matches[0].slice(prefix.length);
  }

  const prefix = lower.split(/\s/)[0] ?? '';
  const matches = COMPLETE_COMMANDS.filter((c) => c.startsWith(prefix));
  if (matches.length === 0) return '';
  const common = matches.reduce((a, b) => {
    let i = 0;
    while (i < a.length && i < b.length && a[i] === b[i]) i++;
    return a.slice(0, i);
  });
  return common.length > prefix.length ? common.slice(prefix.length) : matches[0].slice(prefix.length);
}

function TerminalView() {
  const setView = useWorkstationStore((s) => s.setView);
  const isAnimating = useWorkstationStore((s) => s.isAnimating);
  const terminalBooted = useWorkstationStore((s) => s.terminalBooted);
  const setTerminalBooted = useWorkstationStore((s) => s.setTerminalBooted);
  const prefersReducedMotion = useWorkstationStore((s) => s.prefersReducedMotion);
  const soundMuted = useWorkstationStore((s) => s.soundMuted);
  const setSoundMuted = useWorkstationStore((s) => s.setSoundMuted);
  const setTheme = useThemeStore((s) => s.setTheme);
  const theme = useActiveTheme();
  const staggerList = useMemo(() => getStaggerList(prefersReducedMotion), [prefersReducedMotion]);
  const fadeSlideUp = useMemo(() => getFadeSlideUp(prefersReducedMotion), [prefersReducedMotion]);
  const [inputValue, setInputValue] = useState('');
  const [commandOutput, setCommandOutput] = useState<string[]>([]);
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [caretLeft, setCaretLeft] = useState(0);
  const [inputFocused, setInputFocused] = useState(true);
  const draftRef = useRef('');
  const inputRef = useRef<HTMLInputElement>(null);
  const mirrorRef = useRef<HTMLSpanElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputWrapperRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();

  const completionSuggestion = useMemo(() => getCompletionSuffix(inputValue), [inputValue]);
  // Avoid double space when input already ends with space (e.g. "run kitchen " + " chaos" -> "chaos")
  const completionToShow = useMemo(() => {
    if (!completionSuggestion) return '';
    if (inputValue.endsWith(' ') && completionSuggestion.startsWith(' ')) return completionSuggestion.trimStart();
    return completionSuggestion;
  }, [inputValue, completionSuggestion]);

  // When the typed text is wider than the field, the input scrolls internally but the
  // absolutely-positioned underlay/caret can't follow — fall back to native rendering.
  const [inputOverflowing, setInputOverflowing] = useState(false);
  useLayoutEffect(() => {
    if (mirrorRef.current) {
      const w = mirrorRef.current.offsetWidth;
      setCaretLeft(w);
      const field = inputRef.current;
      setInputOverflowing(field ? w > field.clientWidth - 8 : false);
    }
  }, [inputValue]);

  // One launch sequence at a time: teaser timers are tracked so a second `run`
  // can't interleave output, and unmount clears them (no setState-after-unmount).
  const runTimersRef = useRef<number[]>([]);
  const launchPending = () => runTimersRef.current.length > 0;
  useEffect(() => {
    const timers = runTimersRef.current;
    return () => timers.forEach(clearTimeout);
  }, []);

  const startLaunchSequence = (viewId: ViewState, title: string, echoLine: string) => {
    const teaser = PROJECT_TEASERS[viewId];
    const teaserLines = teaser ? (Array.isArray(teaser) ? teaser : [teaser]) : [];
    const lineDelayMs = 400;
    setCommandOutput((prev) => [...prev, echoLine]);
    teaserLines.forEach((line, i) => {
      runTimersRef.current.push(
        window.setTimeout(() => setCommandOutput((prev) => [...prev, line]), (i + 1) * lineDelayMs)
      );
    });
    runTimersRef.current.push(
      window.setTimeout(() => {
        setCommandOutput((prev) => [...prev, `Loading ${title}...`]);
        runTimersRef.current.push(
          window.setTimeout(() => {
            // Mutate (don't replace) so the unmount cleanup's captured array stays live.
            runTimersRef.current.length = 0;
            setView(viewId);
          }, 500)
        );
      }, (teaserLines.length + 1) * lineDelayMs)
    );
  };

  const handleCommand = (cmd: string) => {
    const raw = cmd.trim();
    const trimmedCmd = raw.toLowerCase();
    let response: string[] = [];

    if (trimmedCmd === 'help') {
      response = helpText;
    } else if (trimmedCmd === 'go dawgs' || trimmedCmd === 'uga') {
      setTheme('uga');
      response = ['Go Dawgs! 🐾 Theme set to Bulldog Red.'];
    } else if (trimmedCmd === 'golden' || trimmedCmd === 'secret') {
      setTheme('gold');
      response = ['Theme set to Gold.'];
    } else if (Object.prototype.hasOwnProperty.call(GAG_COMMANDS, trimmedCmd)) {
      // hasOwnProperty guard: bare indexing would also "find" Object.prototype
      // keys, so typing `constructor` would hand back a function, not lines.
      response = GAG_COMMANDS[trimmedCmd];
    } else     if (trimmedCmd === 'clear') {
      if (raw) {
        setCommandHistory((h) => (h[h.length - 1] === raw ? h : [...h.slice(-(MAX_HISTORY - 1)), raw]));
      }
      setHistoryIndex(-1);
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
          (id) => `  → theme ${toThemeCommand(themePresets[id].name)}`,
        ),
      ];
      if (!name) {
        response = ['Available themes:', ...themeList];
      } else {
        const normalizedName = toThemeCommand(name);
        const themeId = THEME_NAME_TO_ID[normalizedName] ?? THEME_NAME_TO_ID[name] ?? Object.keys(themePresets).find((id) => toThemeCommand(themePresets[id].name) === normalizedName);
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
      const execName = trimmedCmd.replace('run ', '').trim();
      const normalized = execName.replace(/\.exe$/i, '').trim();
      const project = projectsData.find(
        (p) => p.executable.toLowerCase() === normalized,
      );
      if (project) {
        // History records the full command (`run x.exe`), not just the executable.
        setCommandHistory((h) => (h[h.length - 1] === raw ? h : [...h.slice(-(MAX_HISTORY - 1)), raw]));
        setHistoryIndex(-1);
        setInputValue('');
        if (launchPending() || isAnimating) {
          setCommandOutput((prev) => [...prev, `> ${cmd}`, 'A program is already launching — hold on.']);
          return;
        }
        startLaunchSequence(project.id, project.title, `> ${cmd}`);
        return;
      } else {
        response = [
          `Error: '${execName}' not found.`,
          'Available projects:',
          ...projectsData.map((p) => `  → run ${p.executable}`),
        ];
      }
    } else if (trimmedCmd) {
      response = [`Command not recognized: '${trimmedCmd}'. Type 'help' for commands.`];
    }

    if (raw) {
      setCommandHistory((h) => (h[h.length - 1] === raw ? h : [...h.slice(-(MAX_HISTORY - 1)), raw]));
    }
    setHistoryIndex(-1);
    setCommandOutput((prev) => [...prev, `> ${cmd}`, ...response]);
    setInputValue('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Tab' && completionToShow) {
      e.preventDefault();
      setInputValue((prev) => prev + completionToShow);
      return;
    }
    if (e.key === 'ArrowUp') {
      if (commandHistory.length === 0) return;
      e.preventDefault();
      if (historyIndex === -1) draftRef.current = inputValue;
      const nextIndex = historyIndex === -1 ? commandHistory.length - 1 : Math.max(0, historyIndex - 1);
      setHistoryIndex(nextIndex);
      setInputValue(commandHistory[nextIndex] ?? '');
      return;
    }
    if (e.key === 'ArrowDown') {
      if (historyIndex === -1) return;
      e.preventDefault();
      if (historyIndex >= commandHistory.length - 1) {
        setHistoryIndex(-1);
        setInputValue(draftRef.current);
      } else {
        const nextIndex = historyIndex + 1;
        setHistoryIndex(nextIndex);
        setInputValue(commandHistory[nextIndex] ?? '');
      }
      return;
    }
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
    if (isAnimating || launchPending()) return;
    const project = getProjectById(id);
    if (project) {
      startLaunchSequence(id, project.title, `> run ${project.executable}`);
    }
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [commandOutput]);

  // Scroll input into view on mobile when keyboard appears
  useEffect(() => {
    if (isMobile && inputFocused && inputRef.current) {
      // Small delay to ensure keyboard has appeared
      const timeoutId = setTimeout(() => {
        inputRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
          inline: 'nearest',
        });
      }, 300);
      return () => clearTimeout(timeoutId);
    }
  }, [inputFocused, isMobile]);

  return (
    <div
      className="absolute inset-0 flex items-center justify-center p-3 sm:p-6"
      onClick={(e) => {
        // Refocus the prompt on background clicks only: never steal focus from
        // interactive children, and never pop the on-screen keyboard on touch taps.
        if ((e.target as HTMLElement).closest('button, a, input, [role="button"]')) return;
        if (window.matchMedia('(pointer: coarse)').matches) return;
        inputRef.current?.focus();
      }}
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
                  {profileData.openForWork && (
                    <a
                      href={`https://${profileData.linkedin}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2 inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-mono text-[10px] transition-opacity hover:opacity-90"
                      style={{
                        borderColor: `${theme.accent}50`,
                        color: theme.accent,
                        backgroundColor: `${theme.accent}12`,
                      }}
                      aria-label="Open for work – view LinkedIn"
                    >
                      <span className="h-1 w-1 rounded-full bg-current animate-pulse" aria-hidden /> Open for work
                    </a>
                  )}
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
                        {line.startsWith('Email: ') ? (
                          <>Email: <a href={`mailto:${profileData.email}`} target="_blank" rel="noopener noreferrer" className="underline hover:opacity-90" style={{ color: theme.accent }}>{profileData.email}</a></>
                        ) : line.startsWith('LinkedIn: ') ? (
                          <>LinkedIn: <a href={`https://${profileData.linkedin}`} target="_blank" rel="noopener noreferrer" className="underline hover:opacity-90" style={{ color: theme.accent }}>{profileData.linkedin}</a></>
                        ) : line.startsWith('GitHub: ') ? (
                          <>GitHub: <a href={`https://${profileData.github}`} target="_blank" rel="noopener noreferrer" className="underline hover:opacity-90" style={{ color: theme.accent }}>{profileData.github}</a></>
                        ) : line.startsWith('http://') || line.startsWith('https://') ? (
                          <a href={line} target="_blank" rel="noopener noreferrer" className="underline hover:opacity-90" style={{ color: theme.accent }}>{line}</a>
                        ) : (
                          line
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* ── Command input bar ───────────────────────── */}
              <div
                ref={inputWrapperRef}
                className="px-4 py-3 terminal-input-wrap cursor-text"
                style={{
                  borderTop: `1px solid ${theme.terminalBorder}`,
                  backgroundColor: theme.terminalBg === '#ffffff' ? '#fafafa' : `${theme.terminalBg}`,
                  ['--placeholder-color' as string]: theme.textDim,
                  ['--placeholder-opacity' as string]: '0.6',
                }}
              >
                <div className="flex items-center gap-2 font-mono text-xs sm:text-sm cursor-text">
                  <span className="shrink-0" style={{ color: theme.textDim }}>
                    guest@edusei:~$
                  </span>
                  <div className="relative flex-1 min-w-0 flex items-center cursor-text">
                    {/* Mirror span to measure input width for custom caret */}
                    <span
                      ref={mirrorRef}
                      className="invisible absolute left-0 font-mono text-xs sm:text-sm whitespace-pre"
                      style={{ font: 'inherit' }}
                      aria-hidden
                    >
                      {inputValue}
                    </span>
                    {/* Visible text: typed value + completion suggestion; when empty show placeholder */}
                    <div
                      className="absolute left-0 flex items-center overflow-hidden pointer-events-none font-mono text-xs sm:text-sm whitespace-nowrap"
                      aria-hidden
                    >
                      {inputValue ? (
                        !inputOverflowing && (
                          <>
                            <span style={{ color: theme.text }}>{inputValue}</span>
                            <span style={{ color: theme.textDim, opacity: 0.35 }}>{completionToShow}</span>
                          </>
                        )
                      ) : (
                        <span style={{ color: theme.textDim, opacity: 0.6 }}>type 'help' for commands</span>
                      )}
                    </div>
                    {/* Custom blinking caret (accent color; inverse for light/dark) */}
                    {inputFocused && !inputOverflowing && (
                      <span
                        className="terminal-caret absolute top-1/2 -translate-y-1/2 w-0.5 pointer-events-none"
                        style={{
                          left: caretLeft,
                          height: '1em',
                          backgroundColor: (() => {
                            const bg = theme.bg.toLowerCase();
                            if (bg === '#ffffff' || bg.startsWith('#fff') || bg === '#fafaf8') return '#0a0a0a';
                            if (bg === '#0a0a0a' || bg === '#141414') return '#fafafa';
                            return theme.accent;
                          })(),
                        }}
                        aria-hidden
                      />
                    )}
                    <input
                      ref={inputRef}
                      type="text"
                      aria-label="Terminal command input"
                      value={inputValue}
                      onChange={(e) => {
                        setHistoryIndex(-1);
                        setInputValue(e.target.value);
                      }}
                      onKeyDown={handleKeyDown}
                      onFocus={() => {
                        setInputFocused(true);
                        resumeAudioContext();
                      }}
                      onBlur={() => setInputFocused(false)}
                      className="terminal-input absolute inset-0 z-10 w-full bg-transparent outline-none font-mono text-xs sm:text-sm cursor-text"
                      style={{
                        color: theme.text,
                        // Native caret takes over once the text overflows the field.
                        caretColor: inputOverflowing ? theme.text : 'transparent',
                        cursor: 'text',
                      }}
                      autoFocus
                    />
                  </div>
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
  const currentView = useWorkstationStore((s) => s.currentView);
  const returnToMonitor = useWorkstationStore((s) => s.returnToMonitor);
  const isAnimating = useWorkstationStore((s) => s.isAnimating);
  const prefersReducedMotion = useWorkstationStore((s) => s.prefersReducedMotion);
  const theme = useActiveTheme();
  const isMobile = useIsMobile();
  // During the exit animation the store has already flipped back to 'monitor';
  // keep rendering the last project so AnimatePresence has content to animate out
  // (returning null here is what used to make the exit animation impossible).
  const liveProject = getProjectById(currentView);
  const lastProjectRef = useRef(liveProject);
  if (currentView !== 'monitor' && liveProject) lastProjectRef.current = liveProject;
  const project = currentView === 'monitor' ? lastProjectRef.current : liveProject;
  const [expandedRelated, setExpandedRelated] = useState<Record<number, boolean>>({});
  const [mobileExpanded, setMobileExpanded] = useState(true);
  const d = prefersReducedMotion ? 0 : 0.25;
  const delay = prefersReducedMotion ? 0 : 0.1;

  // Reset minimized state when switching to desktop so the panel isn't stuck minimized with no expand button
  useEffect(() => {
    if (!isMobile) setMobileExpanded(true);
  }, [isMobile]);

  // Move keyboard focus into the panel when a project opens — otherwise it stays
  // wherever it was and keyboard/SR users get no indication anything happened.
  // Wait for the camera animation to finish: the Back button is disabled (and
  // therefore unfocusable) while isAnimating is true.
  const backRef = useRef<HTMLButtonElement>(null);
  const projectId = project?.id;
  useEffect(() => {
    if (projectId && !isAnimating && currentView !== 'monitor') backRef.current?.focus();
  }, [projectId, isAnimating, currentView]);

  if (!project) return null;

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
              ref={backRef}
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
          ref={backRef}
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
  const currentView = useWorkstationStore((s) => s.currentView);
  const prefersReducedMotion = useWorkstationStore((s) => s.prefersReducedMotion);
  const theme = useActiveTheme();
  // Mounting is gated by the parent (inside AnimatePresence) so the exit animation runs.

  return (
    <motion.div
      initial={prefersReducedMotion ? false : { opacity: 0, y: -8, x: '-50%' }}
      animate={{ opacity: 1, y: 0, x: '-50%' }}
      exit={prefersReducedMotion ? undefined : { opacity: 0, y: -8, x: '-50%' }}
      transition={{ duration: prefersReducedMotion ? 0 : 0.2 }}
      className="fixed top-4 z-50"
      style={{ left: '50%' }}
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
  const currentView = useWorkstationStore((s) => s.currentView);
  const isAnimating = useWorkstationStore((s) => s.isAnimating);
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
        {isAnimating && <TransitionIndicator key="transition" />}
      </AnimatePresence>
    </div>
  );
}
