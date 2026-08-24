import { useState, useEffect, useRef, useMemo, useLayoutEffect, useCallback } from 'react';
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

/* ------------------------------------------------------------------ */
/* File model: every project and document the IDE can open.            */
/* ------------------------------------------------------------------ */

/** Conventional file-type colors (GitHub linguist palette), used as the tree dots. */
const LANG_COLORS = {
  py: '#3572A5',
  cpp: '#f34b7d',
  cs: '#178600',
  c: '#555555',
  sql: '#e38c00',
  md: '#6a9fb5',
  json: '#cbcb41',
  pdf: '#b30b00',
} as const;

interface ProjectFileMeta {
  file: string;
  lang: keyof typeof LANG_COLORS;
}

/** Project executables rendered as source files in the explorer. */
const PROJECT_FILES: Record<ViewState, ProjectFileMeta | undefined> = {
  monitor: undefined,
  'audio-tracking-car': { file: 'audio_tracking_car.py', lang: 'py' },
  animaldot: { file: 'animaldot.cpp', lang: 'cpp' },
  'kitchen-chaos-vr': { file: 'kitchen_chaos.cs', lang: 'cs' },
  memesat: { file: 'memesat_fsw.c', lang: 'c' },
  'capital-one': { file: 'creditwise_case.sql', lang: 'sql' },
};

type DocId = 'welcome' | 'about' | 'skills' | 'contact';

interface DocFile {
  id: DocId;
  file: string;
  lang: keyof typeof LANG_COLORS;
}

const DOC_FILES: DocFile[] = [
  { id: 'welcome', file: 'welcome.md', lang: 'md' },
  { id: 'about', file: 'about.md', lang: 'md' },
  { id: 'skills', file: 'skills.json', lang: 'json' },
  { id: 'contact', file: 'contact.md', lang: 'md' },
];

/** Download rows in the tree that open a PDF instead of a tab. */
const PDF_FILES = [
  { file: 'resume.pdf', href: '/resume.pdf' },
  { file: 'cv.pdf', href: '/cv.pdf' },
];

export function projectFileName(id: ViewState): string {
  return PROJECT_FILES[id]?.file ?? 'file';
}

function getFileMeta(name: string): { lang: keyof typeof LANG_COLORS } | undefined {
  const project = (Object.keys(PROJECT_FILES) as ViewState[]).find((k) => PROJECT_FILES[k]?.file === name);
  if (project) return { lang: PROJECT_FILES[project]!.lang };
  const doc = DOC_FILES.find((d) => d.file === name);
  if (doc) return { lang: doc.lang };
  if (name.endsWith('.pdf')) return { lang: 'pdf' };
  return undefined;
}

function FileDot({ name }: { name: string }) {
  const lang = getFileMeta(name)?.lang ?? 'md';
  return (
    <span
      className="inline-block h-[7px] w-[7px] shrink-0 rounded-full"
      style={{ backgroundColor: LANG_COLORS[lang] }}
      aria-hidden
    />
  );
}

/* ------------------------------------------------------------------ */
/* Boot                                                                */
/* ------------------------------------------------------------------ */

function BootSequence({ lines, onComplete, reducedMotion }: { lines: string[]; onComplete: () => void; reducedMotion?: boolean }) {
  const theme = useActiveTheme();
  const [visibleLines, setVisibleLines] = useState(0);
  const lineDelay = reducedMotion ? 0 : 250;
  const doneDelay = reducedMotion ? 100 : 1600;

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
            initial={{ opacity: reducedMotion ? 1 : 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: reducedMotion ? 0 : 0.15 }}
            style={{ color: theme.textDim }}
          >
            {line || ' '}
          </motion.div>
        ))}
        {visibleLines < lines.length && (
          <span className="inline-block h-4 w-2" style={{ backgroundColor: theme.accent, opacity: 0.6 }} />
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Terminal command plumbing (unchanged behavior)                      */
/* ------------------------------------------------------------------ */

function toThemeCommand(name: string): string {
  return name.toLowerCase().replace(/\s+/g, '');
}

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

const GAG_COMMANDS: Record<string, string[]> = {
  'rm -rf /': ['Nice try.'],
  'rm -rf *': ['Nice try.'],
  'format c:': ['Access denied.'],
  'del system32': ['Nice try.'],
  'sudo rm -rf /': ['Nice try.'],
};

const COMPLETE_COMMANDS = ['help', 'list', 'run', 'open', 'theme', 'about', 'skills', 'resume', 'cv', 'clear'];

const MAX_HISTORY = 50;

const PROJECT_TEASERS: Partial<Record<ViewState, string | string[]>> = {
  'audio-tracking-car': 'Vroom vroom.',
  animaldot: 'Go Dawgs!',
  'kitchen-chaos-vr': 'Entering virtual reality...',
  memesat: 'lol',
  'capital-one': ['Still open for work...', `https://${profileData.linkedin}`],
};

function getThemeCompletionCandidates(): string[] {
  return [
    'system',
    ...(['clean', 'dark', 'classic', 'blue', 'pink', 'purple', 'uga', 'grayBlue'] as const).map(
      (id) => toThemeCommand(themePresets[id].name),
    ),
  ];
}

function getAllFileNames(): string[] {
  return [
    ...projectsData.map((p) => PROJECT_FILES[p.id]?.file ?? p.executable),
    ...DOC_FILES.map((d) => d.file),
    ...PDF_FILES.map((d) => d.file),
  ];
}

function longestCommon(matches: string[], prefix: string): string {
  if (matches.length === 0) return '';
  const common = matches.reduce((a, b) => {
    let i = 0;
    while (i < a.length && i < b.length && a[i] === b[i]) i++;
    return a.slice(0, i);
  });
  return common.length > prefix.length ? common.slice(prefix.length) : matches[0].slice(prefix.length);
}

function getCompletionSuffix(inputValue: string): string {
  const trimmed = inputValue.trimStart();
  if (!trimmed.length) return '';

  const lower = trimmed.toLowerCase();
  if (lower.startsWith('run ')) {
    const prefix = lower.slice(4).trim();
    if (!prefix) return '';
    const candidates = projectsData.map((p) => p.executable.toLowerCase());
    return longestCommon(candidates.filter((c) => c.startsWith(prefix)), prefix);
  }
  if (lower.startsWith('open ')) {
    const prefix = lower.slice(5).trim();
    if (!prefix) return '';
    const candidates = getAllFileNames().map((f) => f.toLowerCase());
    return longestCommon(candidates.filter((c) => c.startsWith(prefix)), prefix);
  }
  if (lower.startsWith('theme ')) {
    const prefix = lower.slice(6).trim();
    if (!prefix) return '';
    return longestCommon(getThemeCompletionCandidates().filter((c) => c.startsWith(prefix)), prefix);
  }

  const prefix = lower.split(/\s/)[0] ?? '';
  return longestCommon(COMPLETE_COMMANDS.filter((c) => c.startsWith(prefix)), prefix);
}

/* ------------------------------------------------------------------ */
/* Editor document contents                                            */
/* ------------------------------------------------------------------ */

function LineGutter({ n }: { n: number }) {
  const theme = useActiveTheme();
  return (
    <span
      className="w-8 shrink-0 select-none pr-3 text-right font-mono text-[11px] tabular-nums"
      style={{ color: theme.textDim, opacity: 0.45 }}
      aria-hidden
    >
      {n}
    </span>
  );
}

function DocLine({ n, children }: { n: number; children: React.ReactNode }) {
  return (
    <div className="flex items-baseline">
      <LineGutter n={n} />
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}

function WelcomeDoc({ onOpenFile }: { onOpenFile: (name: string) => void }) {
  const theme = useActiveTheme();
  const isMobile = useIsMobile();
  let n = 0;
  const line = () => ++n;
  const dim = { color: theme.textDim };
  return (
    <div className="space-y-1 py-1 font-mono text-[12px] leading-relaxed">
      <DocLine n={line()}>
        <span className="text-base font-bold" style={{ color: theme.text }}># {profileData.name}</span>
      </DocLine>
      <DocLine n={line()}>
        <span style={dim}>{profileData.title} · {profileData.university} · Class of {profileData.graduationYear}</span>
      </DocLine>
      <DocLine n={line()}>
        <span style={dim}>&nbsp;</span>
      </DocLine>
      {profileData.openForWork && (
        <DocLine n={line()}>
          <a
            href={`https://${profileData.linkedin}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 hover:underline"
            style={{ color: theme.accent }}
          >
            <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: theme.accent }} aria-hidden />
            Open to work
          </a>
        </DocLine>
      )}
      <DocLine n={line()}>
        <span style={dim}>&nbsp;</span>
      </DocLine>
      <DocLine n={line()}>
        <span className="font-bold" style={{ color: theme.text }}>## Getting started</span>
      </DocLine>
      <DocLine n={line()}>
        <span style={dim}>1. Open a file in <span style={{ color: theme.text }}>projects/</span> to load its 3D model.</span>
      </DocLine>
      <DocLine n={line()}>
        <span style={dim}>2. Press <span style={{ color: theme.text }}>{navigator.platform?.includes('Mac') ? 'Cmd' : 'Ctrl'}+P</span> to jump to any file.</span>
      </DocLine>
      <DocLine n={line()}>
        <span style={dim}>3. The terminal below runs real commands. Try <span style={{ color: theme.text }}>help</span>.</span>
      </DocLine>
      {isMobile && (
        <>
          <DocLine n={line()}>
            <span style={dim}>&nbsp;</span>
          </DocLine>
          <DocLine n={line()}>
            <span className="font-bold" style={{ color: theme.text }}>## Files</span>
          </DocLine>
          {projectsData.map((p) => {
            const meta = PROJECT_FILES[p.id];
            if (!meta) return null;
            return (
              <DocLine key={p.id} n={line()}>
                <button
                  onClick={() => onOpenFile(meta.file)}
                  className="inline-flex max-w-full items-center gap-2 text-left hover:underline"
                  style={{ color: theme.text }}
                >
                  <FileDot name={meta.file} />
                  <span className="truncate">projects/{meta.file}</span>
                  <span className="truncate" style={{ ...dim, opacity: 0.7 }}>{p.title}</span>
                </button>
              </DocLine>
            );
          })}
          {DOC_FILES.filter((d) => d.id !== 'welcome').map((d) => (
            <DocLine key={d.id} n={line()}>
              <button
                onClick={() => onOpenFile(d.file)}
                className="inline-flex items-center gap-2 hover:underline"
                style={{ color: theme.text }}
              >
                <FileDot name={d.file} />
                {d.file}
              </button>
            </DocLine>
          ))}
          {PDF_FILES.map((d) => (
            <DocLine key={d.file} n={line()}>
              <a href={d.href} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 hover:underline" style={{ color: theme.text }}>
                <FileDot name={d.file} />
                {d.file}
              </a>
            </DocLine>
          ))}
        </>
      )}
    </div>
  );
}

function AboutDoc() {
  const theme = useActiveTheme();
  let n = 0;
  const line = () => ++n;
  const dim = { color: theme.textDim };
  return (
    <div className="space-y-1 py-1 font-mono text-[12px] leading-relaxed">
      <DocLine n={line()}><span className="text-base font-bold" style={{ color: theme.text }}># About</span></DocLine>
      <DocLine n={line()}><span style={dim}>&nbsp;</span></DocLine>
      <DocLine n={line()}><span style={dim}>Name: <span style={{ color: theme.text }}>{profileData.name}</span></span></DocLine>
      <DocLine n={line()}><span style={dim}>Title: <span style={{ color: theme.text }}>{profileData.title}</span></span></DocLine>
      <DocLine n={line()}><span style={dim}>Education: <span style={{ color: theme.text }}>{profileData.degree}</span></span></DocLine>
      <DocLine n={line()}><span style={dim}>University: <span style={{ color: theme.text }}>{profileData.university}</span></span></DocLine>
      <DocLine n={line()}><span style={dim}>College: <span style={{ color: theme.text }}>{profileData.college}</span></span></DocLine>
      <DocLine n={line()}><span style={dim}>&nbsp;</span></DocLine>
      <DocLine n={line()}>
        <span style={dim}>Email: <a className="hover:underline" style={{ color: theme.accent }} href={`mailto:${profileData.email}`}>{profileData.email}</a></span>
      </DocLine>
      <DocLine n={line()}>
        <span style={dim}>LinkedIn: <a className="hover:underline" style={{ color: theme.accent }} href={`https://${profileData.linkedin}`} target="_blank" rel="noopener noreferrer">{profileData.linkedin}</a></span>
      </DocLine>
      <DocLine n={line()}>
        <span style={dim}>GitHub: <a className="hover:underline" style={{ color: theme.accent }} href={`https://${profileData.github}`} target="_blank" rel="noopener noreferrer">{profileData.github}</a></span>
      </DocLine>
    </div>
  );
}

function SkillsDoc() {
  const theme = useActiveTheme();
  const lines = useMemo(() => JSON.stringify(skillsData, null, 2).split('\n'), []);
  return (
    <div className="space-y-0.5 py-1 font-mono text-[11.5px] leading-relaxed">
      {lines.map((raw, i) => {
        const keyMatch = raw.match(/^(\s*)"([^"]+)":(.*)$/);
        return (
          <DocLine key={i} n={i + 1}>
            {keyMatch ? (
              <span className="whitespace-pre" style={{ color: theme.textDim }}>
                {keyMatch[1]}
                <span style={{ color: theme.accent }}>"{keyMatch[2]}"</span>
                :{keyMatch[3]}
              </span>
            ) : (
              <span className="whitespace-pre" style={{ color: theme.textDim }}>{raw || ' '}</span>
            )}
          </DocLine>
        );
      })}
    </div>
  );
}

function ContactDoc() {
  const theme = useActiveTheme();
  let n = 0;
  const line = () => ++n;
  const dim = { color: theme.textDim };
  return (
    <div className="space-y-1 py-1 font-mono text-[12px] leading-relaxed">
      <DocLine n={line()}><span className="text-base font-bold" style={{ color: theme.text }}># Contact</span></DocLine>
      <DocLine n={line()}><span style={dim}>&nbsp;</span></DocLine>
      <DocLine n={line()}><span style={dim}>The fastest way to reach me is email.</span></DocLine>
      <DocLine n={line()}><span style={dim}>&nbsp;</span></DocLine>
      <DocLine n={line()}>
        <a
          href={getSayHiMailto()}
          className="inline-block px-3 py-1.5 font-mono text-[12px] hover:opacity-80"
          style={{ border: `1px solid ${theme.projectBorder}`, backgroundColor: theme.projectBg, color: theme.text }}
        >
          Say hi
        </a>
      </DocLine>
      <DocLine n={line()}><span style={dim}>&nbsp;</span></DocLine>
      <DocLine n={line()}>
        <span style={dim}>Email: <a className="hover:underline" style={{ color: theme.accent }} href={`mailto:${profileData.email}`}>{profileData.email}</a></span>
      </DocLine>
      <DocLine n={line()}>
        <span style={dim}>LinkedIn: <a className="hover:underline" style={{ color: theme.accent }} href={`https://${profileData.linkedin}`} target="_blank" rel="noopener noreferrer">{profileData.linkedin}</a></span>
      </DocLine>
      <DocLine n={line()}>
        <span style={dim}>GitHub: <a className="hover:underline" style={{ color: theme.accent }} href={`https://${profileData.github}`} target="_blank" rel="noopener noreferrer">{profileData.github}</a></span>
      </DocLine>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* IDE view                                                            */
/* ------------------------------------------------------------------ */

function IdeView() {
  const setView = useWorkstationStore((s) => s.setView);
  const isAnimating = useWorkstationStore((s) => s.isAnimating);
  const terminalBooted = useWorkstationStore((s) => s.terminalBooted);
  const setTerminalBooted = useWorkstationStore((s) => s.setTerminalBooted);
  const prefersReducedMotion = useWorkstationStore((s) => s.prefersReducedMotion);
  const soundMuted = useWorkstationStore((s) => s.soundMuted);
  const setSoundMuted = useWorkstationStore((s) => s.setSoundMuted);
  const setTheme = useThemeStore((s) => s.setTheme);
  const activeThemeId = useThemeStore((s) => s.activeTheme);
  const theme = useActiveTheme();
  const isMobile = useIsMobile();

  const [openDocs, setOpenDocs] = useState<DocId[]>(['welcome']);
  const [activeDoc, setActiveDoc] = useState<DocId>('welcome');
  const [terminalOpen, setTerminalOpen] = useState(() => (typeof window === 'undefined' ? true : window.innerWidth >= 768));
  const [quickOpen, setQuickOpen] = useState(false);
  const [quickQuery, setQuickQuery] = useState('');
  const [quickIndex, setQuickIndex] = useState(0);

  const [inputValue, setInputValue] = useState('');
  const [commandOutput, setCommandOutput] = useState<string[]>([]);
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [caretLeft, setCaretLeft] = useState(0);
  const [inputFocused, setInputFocused] = useState(false);
  const draftRef = useRef('');
  const inputRef = useRef<HTMLInputElement>(null);
  const mirrorRef = useRef<HTMLSpanElement>(null);
  const termScrollRef = useRef<HTMLDivElement>(null);
  const quickInputRef = useRef<HTMLInputElement>(null);

  const surfaceBg = theme.terminalBg === '#ffffff' ? '#f7f7f7' : `${theme.terminalBg}`;
  const isMac = typeof navigator !== 'undefined' && navigator.platform?.includes('Mac');

  const completionSuggestion = useMemo(() => getCompletionSuffix(inputValue), [inputValue]);
  const completionToShow = useMemo(() => {
    if (!completionSuggestion) return '';
    if (inputValue.endsWith(' ') && completionSuggestion.startsWith(' ')) return completionSuggestion.trimStart();
    return completionSuggestion;
  }, [inputValue, completionSuggestion]);

  const [inputOverflowing, setInputOverflowing] = useState(false);
  useLayoutEffect(() => {
    if (mirrorRef.current) {
      const w = mirrorRef.current.offsetWidth;
      setCaretLeft(w);
      const field = inputRef.current;
      setInputOverflowing(field ? w > field.clientWidth - 8 : false);
    }
  }, [inputValue]);

  // The pane can mount at a temporary narrow size, so keep the terminal's
  // default visibility in sync with the settled viewport until the user
  // toggles it themselves.
  const userToggledTerminalRef = useRef(false);
  useEffect(() => {
    if (userToggledTerminalRef.current) return;
    setTerminalOpen(!isMobile);
  }, [isMobile]);
  const toggleTerminal = () => {
    userToggledTerminalRef.current = true;
    setTerminalOpen((v) => !v);
  };

  const runTimersRef = useRef<number[]>([]);
  const launchPending = () => runTimersRef.current.length > 0;
  useEffect(() => {
    const timers = runTimersRef.current;
    return () => timers.forEach(clearTimeout);
  }, []);

  const startLaunchSequence = useCallback((viewId: ViewState, echoLine: string) => {
    const meta = PROJECT_FILES[viewId];
    const teaser = PROJECT_TEASERS[viewId];
    const teaserLines = teaser ? (Array.isArray(teaser) ? teaser : [teaser]) : [];
    const lineDelayMs = 400;
    setTerminalOpen(true);
    setCommandOutput((prev) => [...prev, echoLine]);
    teaserLines.forEach((line, i) => {
      runTimersRef.current.push(
        window.setTimeout(() => setCommandOutput((prev) => [...prev, line]), (i + 1) * lineDelayMs)
      );
    });
    runTimersRef.current.push(
      window.setTimeout(() => {
        setCommandOutput((prev) => [...prev, `Opening ${meta?.file ?? viewId}...`]);
        runTimersRef.current.push(
          window.setTimeout(() => {
            runTimersRef.current.length = 0;
            setView(viewId);
          }, 500)
        );
      }, (teaserLines.length + 1) * lineDelayMs)
    );
  }, [setView]);

  const openProject = useCallback((id: ViewState) => {
    if (isAnimating || launchPending()) return;
    const meta = PROJECT_FILES[id];
    startLaunchSequence(id, `$ open projects/${meta?.file ?? id}`);
  }, [isAnimating, startLaunchSequence]);

  const openDocTab = useCallback((id: DocId) => {
    setOpenDocs((prev) => (prev.includes(id) ? prev : [...prev, id]));
    setActiveDoc(id);
  }, []);

  const closeDocTab = (id: DocId) => {
    if (id === 'welcome') return;
    setOpenDocs((prev) => {
      const next = prev.filter((d) => d !== id);
      if (activeDoc === id) setActiveDoc(next[next.length - 1] ?? 'welcome');
      return next.length ? next : ['welcome'];
    });
  };

  /** Open any file by name: project files fly to the model, docs open a tab, PDFs open a viewer. */
  const openFileByName = useCallback((name: string): boolean => {
    const lower = name.toLowerCase();
    const project = (Object.keys(PROJECT_FILES) as ViewState[]).find(
      (k) => PROJECT_FILES[k]?.file.toLowerCase() === lower
    );
    if (project) {
      openProject(project);
      return true;
    }
    const doc = DOC_FILES.find((d) => d.file.toLowerCase() === lower);
    if (doc) {
      openDocTab(doc.id);
      return true;
    }
    const pdf = PDF_FILES.find((d) => d.file.toLowerCase() === lower);
    if (pdf) {
      window.open(pdf.href, '_blank');
      return true;
    }
    return false;
  }, [openProject, openDocTab]);

  /* ---------------- terminal commands ---------------- */

  const handleCommand = (cmd: string) => {
    const raw = cmd.trim();
    const trimmedCmd = raw.toLowerCase();
    let response: string[] = [];

    if (trimmedCmd === 'help') {
      response = helpText;
    } else if (trimmedCmd === 'go dawgs' || trimmedCmd === 'uga') {
      setTheme('uga');
      response = ['Go Dawgs! Theme set to Bulldog Red.'];
    } else if (trimmedCmd === 'golden' || trimmedCmd === 'secret') {
      setTheme('gold');
      response = ['Theme set to Gold.'];
    } else if (Object.prototype.hasOwnProperty.call(GAG_COMMANDS, trimmedCmd)) {
      response = GAG_COMMANDS[trimmedCmd];
    } else if (trimmedCmd === 'clear') {
      if (raw) {
        setCommandHistory((h) => (h[h.length - 1] === raw ? h : [...h.slice(-(MAX_HISTORY - 1)), raw]));
      }
      setHistoryIndex(-1);
      setCommandOutput([]);
      setInputValue('');
      return;
    } else if (trimmedCmd === 'list' || trimmedCmd === 'ls') {
      response = [
        'projects/',
        ...projectsData.map((p) => `  ${PROJECT_FILES[p.id]?.file ?? p.executable}`),
        ...DOC_FILES.map((d) => d.file),
        ...PDF_FILES.map((d) => d.file),
      ];
    } else if (trimmedCmd === 'about') {
      openDocTab('about');
      response = ['Opened about.md'];
    } else if (trimmedCmd === 'skills') {
      openDocTab('skills');
      response = ['Opened skills.json'];
    } else if (trimmedCmd === 'resume') {
      response = ['Opening resume.pdf...'];
      window.open('/resume.pdf', '_blank');
    } else if (trimmedCmd === 'cv') {
      response = ['Opening cv.pdf...'];
      window.open('/cv.pdf', '_blank');
    } else if (trimmedCmd === 'theme' || trimmedCmd.startsWith('theme ')) {
      const name = trimmedCmd === 'theme' ? '' : trimmedCmd.replace('theme ', '').trim();
      const themeList = [
        '  theme system',
        ...(['clean', 'dark', 'classic', 'blue', 'pink', 'purple', 'uga', 'grayBlue'] as const).map(
          (id) => `  theme ${toThemeCommand(themePresets[id].name)}`,
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
    } else if (trimmedCmd === 'run' || trimmedCmd === 'open') {
      response = [
        'Usage: open [file]',
        ...projectsData.map((p) => `  open ${PROJECT_FILES[p.id]?.file ?? p.executable}`),
      ];
    } else if (trimmedCmd.startsWith('run ') || trimmedCmd.startsWith('open ')) {
      const argRaw = raw.replace(/^(run|open)\s+/i, '').trim();
      const normalized = argRaw.replace(/\.exe$/i, '').replace(/^projects\//i, '').trim().toLowerCase();
      const project = projectsData.find(
        (p) =>
          p.executable.toLowerCase() === normalized ||
          PROJECT_FILES[p.id]?.file.toLowerCase() === normalized
      );
      if (project) {
        setCommandHistory((h) => (h[h.length - 1] === raw ? h : [...h.slice(-(MAX_HISTORY - 1)), raw]));
        setHistoryIndex(-1);
        setInputValue('');
        if (launchPending() || isAnimating) {
          setCommandOutput((prev) => [...prev, `$ ${cmd}`, 'A file is already opening. Hold on.']);
          return;
        }
        startLaunchSequence(project.id, `$ ${cmd}`);
        return;
      }
      if (openFileByName(normalized)) {
        response = [`Opened ${normalized}`];
      } else {
        response = [
          `Error: '${argRaw}' not found.`,
          'Files:',
          ...projectsData.map((p) => `  open ${PROJECT_FILES[p.id]?.file ?? p.executable}`),
        ];
      }
    } else if (trimmedCmd) {
      response = [`Command not recognized: '${trimmedCmd}'. Type 'help' for commands.`];
    }

    if (raw) {
      setCommandHistory((h) => (h[h.length - 1] === raw ? h : [...h.slice(-(MAX_HISTORY - 1)), raw]));
    }
    setHistoryIndex(-1);
    setCommandOutput((prev) => [...prev, `$ ${cmd}`, ...response]);
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

  useEffect(() => {
    if (termScrollRef.current) {
      termScrollRef.current.scrollTop = termScrollRef.current.scrollHeight;
    }
  }, [commandOutput, terminalOpen]);

  /* ---------------- quick open ---------------- */

  const quickFiles = useMemo(() => {
    const all = [
      ...projectsData.map((p) => ({
        name: PROJECT_FILES[p.id]?.file ?? p.executable,
        path: `projects/${PROJECT_FILES[p.id]?.file ?? p.executable}`,
        hint: p.title,
      })),
      ...DOC_FILES.map((d) => ({ name: d.file, path: d.file, hint: '' })),
      ...PDF_FILES.map((d) => ({ name: d.file, path: d.file, hint: 'opens in a new tab' })),
    ];
    const q = quickQuery.trim().toLowerCase();
    if (!q) return all;
    return all.filter((f) => f.path.toLowerCase().includes(q) || f.hint.toLowerCase().includes(q));
  }, [quickQuery]);

  useEffect(() => {
    setQuickIndex(0);
  }, [quickQuery, quickOpen]);

  useEffect(() => {
    if (quickOpen) quickInputRef.current?.focus();
  }, [quickOpen]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'p') {
        e.preventDefault();
        setQuickOpen((v) => !v);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const pickQuickFile = (name: string) => {
    setQuickOpen(false);
    setQuickQuery('');
    openFileByName(name);
  };

  /* ---------------- render ---------------- */

  const themeName = activeThemeId === SYSTEM_THEME_ID ? 'System' : themePresets[activeThemeId]?.name ?? 'System';

  const treeRow = (opts: {
    key: string;
    depth: number;
    label: string;
    dotName?: string;
    hint?: string;
    active?: boolean;
    onClick?: () => void;
    href?: string;
  }) => {
    const inner = (
      <span className="flex min-w-0 items-center gap-2">
        {opts.dotName ? <FileDot name={opts.dotName} /> : null}
        <span className="truncate">{opts.label}</span>
        {opts.hint ? (
          <span className="ml-auto hidden truncate pl-2 text-[9px] lg:inline" style={{ color: theme.textDim, opacity: 0.55 }}>
            {opts.hint}
          </span>
        ) : null}
      </span>
    );
    const className = 'block w-full px-2 py-[3px] text-left font-mono text-[11.5px] transition-colors';
    const style: React.CSSProperties = {
      paddingLeft: 8 + opts.depth * 14,
      color: opts.active ? theme.text : theme.textDim,
      backgroundColor: opts.active ? theme.projectBg : 'transparent',
    };
    if (opts.href) {
      return (
        <a key={opts.key} href={opts.href} target="_blank" rel="noopener noreferrer" className={className} style={style}>
          {inner}
        </a>
      );
    }
    return (
      <button key={opts.key} onClick={opts.onClick} disabled={isAnimating} className={className} style={style}>
        {inner}
      </button>
    );
  };

  const activeDocMeta = DOC_FILES.find((d) => d.id === activeDoc)!;

  return (
    <div
      className="absolute inset-0 flex items-center justify-center p-3 sm:p-6"
    >
      <div
        className="flex h-[94vh] max-h-[820px] w-full max-w-6xl flex-col overflow-hidden rounded-lg sm:h-[86vh]"
        style={{
          border: `1px solid ${theme.terminalBorder}`,
          backgroundColor: theme.terminalBg,
          boxShadow: '0 24px 64px rgba(0,0,0,0.35)',
        }}
      >
        {/* Title bar */}
        <div
          className="flex shrink-0 items-center justify-between px-3 py-2"
          style={{ borderBottom: `1px solid ${theme.terminalBorder}`, backgroundColor: surfaceBg }}
        >
          <div className="flex items-center gap-2">
            <div className="flex gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
              <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
              <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
            </div>
            <span className="ml-2 font-mono text-[10px] tracking-wide" style={{ color: theme.textDim }}>
              portfolio [main] · Edusei IDE
            </span>
          </div>
          <button
            onClick={() => setQuickOpen(true)}
            className="hidden items-center gap-2 px-2 py-0.5 font-mono text-[10px] transition-opacity hover:opacity-80 sm:flex"
            style={{ border: `1px solid ${theme.projectBorder}`, backgroundColor: theme.terminalBg, color: theme.textDim }}
            aria-label="Go to file"
          >
            Go to file
            <span style={{ opacity: 0.6 }}>{isMac ? 'Cmd+P' : 'Ctrl+P'}</span>
          </button>
        </div>

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
          <>
            <div className="flex min-h-0 flex-1">
              {/* Explorer */}
              {!isMobile && (
                <aside
                  className="terminal-scroll hidden w-56 shrink-0 overflow-y-auto md:block"
                  style={{
                    borderRight: `1px solid ${theme.terminalBorder}`,
                    backgroundColor: surfaceBg,
                    '--scrollbar-color': `${theme.scrollbar}50`,
                    '--scrollbar-color-hover': `${theme.scrollbar}80`,
                  } as React.CSSProperties}
                >
                  <p className="px-3 pb-1 pt-3 font-mono text-[9px] uppercase tracking-widest" style={{ color: theme.textDim, opacity: 0.6 }}>
                    Explorer
                  </p>
                  <p className="px-3 pb-1 font-mono text-[10px] font-bold uppercase tracking-wide" style={{ color: theme.text, opacity: 0.75 }}>
                    portfolio
                  </p>
                  <div className="pb-3">
                    {treeRow({ key: 'dir', depth: 0, label: 'projects/', onClick: () => {} })}
                    {projectsData.map((p) => {
                      const meta = PROJECT_FILES[p.id];
                      if (!meta) return null;
                      return treeRow({
                        key: p.id,
                        depth: 1,
                        label: meta.file,
                        dotName: meta.file,
                        hint: p.title,
                        onClick: () => openProject(p.id),
                      });
                    })}
                    {DOC_FILES.filter((d) => d.id !== 'welcome').map((d) =>
                      treeRow({
                        key: d.id,
                        depth: 0,
                        label: d.file,
                        dotName: d.file,
                        active: activeDoc === d.id && openDocs.includes(d.id),
                        onClick: () => openDocTab(d.id),
                      })
                    )}
                    {PDF_FILES.map((d) =>
                      treeRow({ key: d.file, depth: 0, label: d.file, dotName: d.file, href: d.href })
                    )}
                  </div>
                </aside>
              )}

              {/* Editor column */}
              <div className="flex min-w-0 flex-1 flex-col">
                {/* Tabs */}
                <div
                  className="flex shrink-0 items-end gap-0 overflow-x-auto no-scrollbar"
                  style={{ borderBottom: `1px solid ${theme.terminalBorder}`, backgroundColor: surfaceBg }}
                >
                  {openDocs.map((id) => {
                    const doc = DOC_FILES.find((d) => d.id === id)!;
                    const active = id === activeDoc;
                    return (
                      <div
                        key={id}
                        className="flex items-center"
                        style={{
                          borderRight: `1px solid ${theme.terminalBorder}`,
                          backgroundColor: active ? theme.terminalBg : 'transparent',
                          borderTop: active ? `2px solid ${theme.accent}` : '2px solid transparent',
                        }}
                      >
                        <button
                          onClick={() => setActiveDoc(id)}
                          className="flex items-center gap-2 py-1.5 pl-3 pr-1 font-mono text-[11px]"
                          style={{ color: active ? theme.text : theme.textDim }}
                        >
                          <FileDot name={doc.file} />
                          {doc.file}
                        </button>
                        {id !== 'welcome' ? (
                          <button
                            onClick={() => closeDocTab(id)}
                            className="px-1.5 py-1 font-mono text-[11px] transition-opacity hover:opacity-100"
                            style={{ color: theme.textDim, opacity: 0.6 }}
                            aria-label={`Close ${doc.file}`}
                          >
                            x
                          </button>
                        ) : (
                          <span className="pr-2" />
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Breadcrumb */}
                <div
                  className="shrink-0 px-3 py-1 font-mono text-[10px]"
                  style={{ color: theme.textDim, opacity: 0.75, borderBottom: `1px solid ${theme.projectBorder}` }}
                >
                  portfolio <span style={{ opacity: 0.5 }}>/</span> {activeDocMeta.file}
                </div>

                {/* Editor content */}
                <div
                  className="terminal-scroll min-h-0 flex-1 overflow-y-auto px-3 py-2"
                  style={{
                    '--scrollbar-color': `${theme.scrollbar}50`,
                    '--scrollbar-color-hover': `${theme.scrollbar}80`,
                  } as React.CSSProperties}
                >
                  {activeDoc === 'welcome' && <WelcomeDoc onOpenFile={openFileByName} />}
                  {activeDoc === 'about' && <AboutDoc />}
                  {activeDoc === 'skills' && <SkillsDoc />}
                  {activeDoc === 'contact' && <ContactDoc />}
                </div>

                {/* Terminal panel */}
                <div
                  className="shrink-0"
                  style={{ borderTop: `1px solid ${theme.terminalBorder}`, backgroundColor: theme.terminalBg }}
                >
                  <div
                    className="flex items-center justify-between px-3"
                    style={{ backgroundColor: surfaceBg, borderBottom: terminalOpen ? `1px solid ${theme.projectBorder}` : 'none' }}
                  >
                    <button
                      onClick={toggleTerminal}
                      className="py-1.5 font-mono text-[10px] uppercase tracking-widest"
                      style={{
                        color: theme.text,
                        opacity: 0.8,
                        borderBottom: terminalOpen ? `1px solid ${theme.accent}` : '1px solid transparent',
                      }}
                      aria-expanded={terminalOpen}
                    >
                      Terminal
                    </button>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setSoundMuted(!soundMuted)}
                        className="p-1 font-mono text-[10px] transition-opacity hover:opacity-90"
                        style={{ color: theme.textDim }}
                        aria-label={soundMuted ? 'Unmute terminal sound' : 'Mute terminal sound'}
                      >
                        {soundMuted ? 'sound: off' : 'sound: on'}
                      </button>
                      <button
                        onClick={toggleTerminal}
                        className="p-1 font-mono text-[11px]"
                        style={{ color: theme.textDim }}
                        aria-label={terminalOpen ? 'Collapse terminal' : 'Expand terminal'}
                      >
                        {terminalOpen ? 'v' : '^'}
                      </button>
                    </div>
                  </div>

                  {terminalOpen && (
                    <div
                      className="flex flex-col"
                      onClick={(e) => {
                        if ((e.target as HTMLElement).closest('button, a, input')) return;
                        if (window.matchMedia('(pointer: coarse)').matches) return;
                        inputRef.current?.focus();
                      }}
                    >
                      <div
                        ref={termScrollRef}
                        className="terminal-scroll h-[16vh] min-h-[84px] overflow-y-auto px-3 py-2 sm:h-[18vh]"
                        style={{
                          WebkitOverflowScrolling: 'touch',
                          touchAction: 'pan-y',
                          overscrollBehavior: 'contain',
                          '--scrollbar-color': `${theme.scrollbar}50`,
                          '--scrollbar-color-hover': `${theme.scrollbar}80`,
                        } as React.CSSProperties}
                      >
                        {commandOutput.length === 0 && (
                          <p className="font-mono text-[11px]" style={{ color: theme.textDim, opacity: 0.6 }}>
                            {profileData.name.toLowerCase().replace(' ', '_')}@portfolio · type 'help' for commands
                          </p>
                        )}
                        <div className="space-y-0.5 font-mono text-[11px] sm:text-xs">
                          {commandOutput.map((line, i) => (
                            <div
                              key={i}
                              style={{
                                color: line.startsWith('$') ? theme.text : theme.textDim,
                                opacity: line.startsWith('$') ? 0.85 : 0.65,
                              }}
                            >
                              {line.startsWith('Email: ') ? (
                                <>Email: <a href={`mailto:${profileData.email}`} className="underline" style={{ color: theme.accent }}>{profileData.email}</a></>
                              ) : line.startsWith('http://') || line.startsWith('https://') ? (
                                <a href={line} target="_blank" rel="noopener noreferrer" className="underline" style={{ color: theme.accent }}>{line}</a>
                              ) : (
                                line
                              )}
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Prompt */}
                      <div
                        className="cursor-text px-3 py-2"
                        style={{
                          borderTop: `1px solid ${theme.projectBorder}`,
                          ['--placeholder-color' as string]: theme.textDim,
                          ['--placeholder-opacity' as string]: '0.6',
                        }}
                      >
                        <div className="flex items-center gap-2 font-mono text-xs sm:text-sm">
                          <span className="shrink-0" style={{ color: theme.accent }}>$</span>
                          <div className="relative flex min-w-0 flex-1 items-center">
                            <span
                              ref={mirrorRef}
                              className="invisible absolute left-0 whitespace-pre font-mono text-xs sm:text-sm"
                              style={{ font: 'inherit' }}
                              aria-hidden
                            >
                              {inputValue}
                            </span>
                            <div className="pointer-events-none absolute left-0 flex items-center overflow-hidden whitespace-nowrap font-mono text-xs sm:text-sm" aria-hidden>
                              {inputValue ? (
                                !inputOverflowing && (
                                  <>
                                    <span style={{ color: theme.text }}>{inputValue}</span>
                                    <span style={{ color: theme.textDim, opacity: 0.35 }}>{completionToShow}</span>
                                  </>
                                )
                              ) : (
                                <span style={{ color: theme.textDim, opacity: 0.6 }}>open animaldot.cpp</span>
                              )}
                            </div>
                            {inputFocused && !inputOverflowing && (
                              <span
                                className="terminal-caret pointer-events-none absolute top-1/2 w-0.5 -translate-y-1/2"
                                style={{
                                  left: caretLeft,
                                  height: '1em',
                                  backgroundColor: theme.accent,
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
                              className="terminal-input absolute inset-0 z-10 w-full cursor-text bg-transparent font-mono text-xs outline-none sm:text-sm"
                              style={{
                                color: theme.text,
                                caretColor: inputOverflowing ? theme.text : 'transparent',
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Status bar */}
            <div
              className="flex shrink-0 items-center justify-between px-3 py-1 font-mono text-[10px]"
              style={{ borderTop: `1px solid ${theme.terminalBorder}`, backgroundColor: surfaceBg, color: theme.textDim }}
            >
              <div className="flex min-w-0 items-center gap-3">
                <span>main</span>
                {profileData.openForWork && (
                  <a
                    href={`https://${profileData.linkedin}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 hover:underline"
                    style={{ color: theme.accent }}
                  >
                    <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: theme.accent }} aria-hidden />
                    Open to work
                  </a>
                )}
              </div>
              <div className="flex items-center gap-3">
                <span className="hidden sm:inline">{projectsData.length} projects</span>
                <span className="hidden sm:inline">{themeName}</span>
                <span>UTF-8</span>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Quick open */}
      <AnimatePresence>
        {quickOpen && (
          <motion.div
            initial={prefersReducedMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={prefersReducedMotion ? undefined : { opacity: 0 }}
            transition={{ duration: 0.12 }}
            className="absolute inset-0 z-20 flex items-start justify-center pt-[12vh]"
            onClick={() => setQuickOpen(false)}
          >
            <div
              className="w-full max-w-md overflow-hidden rounded-md"
              style={{
                border: `1px solid ${theme.terminalBorder}`,
                backgroundColor: theme.terminalBg,
                boxShadow: '0 16px 48px rgba(0,0,0,0.4)',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <input
                ref={quickInputRef}
                value={quickQuery}
                onChange={(e) => setQuickQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Escape') { setQuickOpen(false); return; }
                  if (e.key === 'ArrowDown') { e.preventDefault(); setQuickIndex((i) => Math.min(i + 1, quickFiles.length - 1)); return; }
                  if (e.key === 'ArrowUp') { e.preventDefault(); setQuickIndex((i) => Math.max(i - 1, 0)); return; }
                  if (e.key === 'Enter' && quickFiles[quickIndex]) { pickQuickFile(quickFiles[quickIndex].name); }
                }}
                placeholder="Go to file"
                aria-label="Go to file"
                className="w-full bg-transparent px-3 py-2.5 font-mono text-sm outline-none"
                style={{ color: theme.text, borderBottom: `1px solid ${theme.projectBorder}` }}
              />
              <div className="max-h-64 overflow-y-auto terminal-scroll" style={{
                '--scrollbar-color': `${theme.scrollbar}50`,
                '--scrollbar-color-hover': `${theme.scrollbar}80`,
              } as React.CSSProperties}>
                {quickFiles.length === 0 && (
                  <p className="px-3 py-2 font-mono text-[11px]" style={{ color: theme.textDim }}>No matching files</p>
                )}
                {quickFiles.map((f, i) => (
                  <button
                    key={f.path}
                    onClick={() => pickQuickFile(f.name)}
                    onMouseEnter={() => setQuickIndex(i)}
                    className="flex w-full items-center gap-2 px-3 py-1.5 text-left font-mono text-[12px]"
                    style={{
                      color: i === quickIndex ? theme.text : theme.textDim,
                      backgroundColor: i === quickIndex ? theme.projectBg : 'transparent',
                    }}
                  >
                    <FileDot name={f.name} />
                    <span className="truncate">{f.path}</span>
                    {f.hint && (
                      <span className="ml-auto truncate pl-3 text-[10px]" style={{ color: theme.textDim, opacity: 0.6 }}>
                        {f.hint}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Project detail panel: an editor tab whose contents are the 3D model */
/* ------------------------------------------------------------------ */

function ProjectDetailPanel() {
  const currentView = useWorkstationStore((s) => s.currentView);
  const returnToMonitor = useWorkstationStore((s) => s.returnToMonitor);
  const isAnimating = useWorkstationStore((s) => s.isAnimating);
  const prefersReducedMotion = useWorkstationStore((s) => s.prefersReducedMotion);
  const theme = useActiveTheme();
  const isMobile = useIsMobile();
  const liveProject = getProjectById(currentView);
  const lastProjectRef = useRef(liveProject);
  if (currentView !== 'monitor' && liveProject) lastProjectRef.current = liveProject;
  const project = currentView === 'monitor' ? lastProjectRef.current : liveProject;
  const [expandedRelated, setExpandedRelated] = useState<Record<number, boolean>>({});
  const [mobileExpanded, setMobileExpanded] = useState(true);
  const d = prefersReducedMotion ? 0 : 0.25;
  const delay = prefersReducedMotion ? 0 : 0.1;

  useEffect(() => {
    if (!isMobile) setMobileExpanded(true);
  }, [isMobile]);

  const backRef = useRef<HTMLButtonElement>(null);
  const projectId = project?.id;
  useEffect(() => {
    if (projectId && !isAnimating && currentView !== 'monitor') backRef.current?.focus();
  }, [projectId, isAnimating, currentView]);

  if (!project) return null;

  const fileName = projectFileName(project.id);

  const tabHeader = (
    <div
      className="flex items-center justify-between"
      style={{ borderBottom: `1px solid ${theme.projectBorder}` }}
    >
      <div className="flex min-w-0 items-center">
        <div
          className="flex items-center gap-2 px-3 py-2 font-mono text-[11px]"
          style={{ color: theme.text, borderTop: `2px solid ${theme.accent}`, borderRight: `1px solid ${theme.projectBorder}` }}
        >
          <FileDot name={fileName} />
          <span className="truncate">projects/{fileName}</span>
        </div>
      </div>
      <button
        ref={backRef}
        onClick={() => !isAnimating && returnToMonitor()}
        disabled={isAnimating}
        className="px-3 py-2 font-mono text-[11px] transition-opacity hover:opacity-90 disabled:opacity-40"
        style={{ color: theme.textDim }}
        aria-label="Close file and return"
      >
        Close x
      </button>
    </div>
  );

  const body = (
    <>
      <div className="px-4 pt-3 sm:px-5">
        <h1 className="text-lg font-bold sm:text-xl" style={{ color: theme.text }}>{project.title}</h1>
        <p className="mt-0.5 font-mono text-[10px] sm:text-xs" style={{ color: theme.textDim }}>
          {project.period} · {project.location}
        </p>
        {project.github && (
          <a
            href={project.github}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-block px-3 py-1.5 font-mono text-[11px] transition-opacity hover:opacity-80"
            style={{ border: `1px solid ${theme.projectBorder}`, backgroundColor: theme.projectBg, color: theme.text }}
          >
            View on GitHub
          </a>
        )}
      </div>

      <div className="mt-4 space-y-1.5 px-4 sm:px-5">
        {project.description.map((para, i) => (
          <div key={i} className="flex items-baseline">
            <span className="w-7 shrink-0 select-none pr-2 text-right font-mono text-[10px] tabular-nums" style={{ color: theme.textDim, opacity: 0.45 }} aria-hidden>
              {i + 1}
            </span>
            <p className="min-w-0 flex-1 font-mono text-[11.5px] leading-relaxed sm:text-[12.5px]" style={{ color: theme.textDim }}>
              {para}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-5 px-4 sm:px-5">
        <p className="mb-2 font-mono text-[9px] uppercase tracking-widest" style={{ color: theme.textDim, opacity: 0.6 }}>
          Technologies
        </p>
        <div className="flex flex-wrap gap-1.5">
          {project.techStack.map((tech) => (
            <span
              key={tech}
              className="px-2 py-0.5 font-mono text-[10.5px]"
              style={{ border: `1px solid ${theme.projectBorder}`, backgroundColor: theme.projectBg, color: theme.textDim }}
            >
              {tech}
            </span>
          ))}
        </div>
      </div>

      {project.additionalProjects?.length ? (
        <div className="mt-6 px-4 pb-2 sm:px-5">
          <p className="mb-2 font-mono text-[9px] uppercase tracking-widest" style={{ color: theme.textDim, opacity: 0.6 }}>
            Related projects
          </p>
          <div className="space-y-3">
            {project.additionalProjects.map((add, i) => (
              <div key={i} className="pl-3" style={{ borderLeft: `1px solid ${theme.projectBorder}` }}>
                <div className="flex items-center gap-2">
                  <h4 className="font-mono text-[12px] font-medium" style={{ color: theme.text, opacity: 0.85 }}>
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
                      GitHub
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
                      <div className="mt-1.5 space-y-1">
                        {add.description.map((para, j) => (
                          <p key={j} className="font-mono text-[11px] leading-relaxed" style={{ color: theme.textDim }}>
                            {para}
                          </p>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {add.description.length > 0 && (
                  <button
                    onClick={() => setExpandedRelated((prev) => ({ ...prev, [i]: !prev[i] }))}
                    className="mt-1 font-mono text-[10px] underline transition-opacity hover:opacity-100"
                    style={{ color: theme.textDim, opacity: 0.6 }}
                  >
                    {expandedRelated[i] ? 'collapse' : 'details'}
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      ) : null}

      <div className="mt-5 px-4 pb-4 sm:px-5" style={{ borderTop: `1px solid ${theme.projectBorder}` }}>
        <span className="mt-3 block font-mono text-[10px]" style={{ color: theme.textDim, opacity: 0.55 }}>
          Drag the 3D model to rotate it. ESC closes the file.
        </span>
      </div>
    </>
  );

  if (isMobile) {
    return (
      <motion.div
        initial={prefersReducedMotion ? false : { opacity: 0, y: '100%' }}
        animate={{ opacity: 1, y: mobileExpanded ? 0 : 'calc(100% - 44px)' }}
        exit={prefersReducedMotion ? undefined : { opacity: 0, y: '100%' }}
        transition={{ duration: d, ease: [0.25, 0.1, 0.25, 1] }}
        className="absolute bottom-0 left-0 right-0 z-10"
        style={{ maxHeight: '85vh' }}
      >
        <div
          className="overflow-hidden rounded-t-lg"
          style={{ borderTop: `1px solid ${theme.terminalBorder}`, backgroundColor: `${theme.terminalBg}f5` }}
        >
          <div className="flex items-center justify-between" style={{ borderBottom: `1px solid ${theme.projectBorder}` }}>
            <button
              onClick={() => setMobileExpanded(!mobileExpanded)}
              className="flex min-w-0 items-center gap-2 px-3 py-2.5 font-mono text-[11px]"
              style={{ color: theme.text }}
            >
              <FileDot name={fileName} />
              <span className="truncate">projects/{fileName}</span>
              <span style={{ color: theme.textDim, opacity: 0.6 }}>{mobileExpanded ? 'v' : '^'}</span>
            </button>
            <button
              ref={backRef}
              onClick={() => !isAnimating && returnToMonitor()}
              disabled={isAnimating}
              className="px-3 py-2.5 font-mono text-[11px] disabled:opacity-40"
              style={{ color: theme.textDim }}
            >
              Close x
            </button>
          </div>

          {mobileExpanded && (
            <div
              className="terminal-scroll overflow-y-auto pb-4"
              style={{
                maxHeight: 'calc(85vh - 44px)',
                '--scrollbar-color': `${theme.scrollbar}50`,
                '--scrollbar-color-hover': `${theme.scrollbar}80`,
              } as React.CSSProperties}
            >
              {body}
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
      className="absolute right-0 top-0 flex h-full w-full items-center justify-center p-8 md:w-[46%]"
    >
      <div
        className="terminal-scroll w-full max-w-xl overflow-y-auto rounded-lg"
        style={{
          maxHeight: '88vh',
          border: `1px solid ${theme.terminalBorder}`,
          backgroundColor: `${theme.terminalBg}f7`,
          boxShadow: '0 24px 64px rgba(0,0,0,0.35)',
          '--scrollbar-color': `${theme.scrollbar}50`,
          '--scrollbar-color-hover': `${theme.scrollbar}80`,
        } as React.CSSProperties}
      >
        {tabHeader}
        {body}
      </div>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/* Transition indicator                                                */
/* ------------------------------------------------------------------ */

function TransitionIndicator() {
  const currentView = useWorkstationStore((s) => s.currentView);
  const prefersReducedMotion = useWorkstationStore((s) => s.prefersReducedMotion);
  const theme = useActiveTheme();

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
        className="flex items-center gap-2 rounded-md px-4 py-2 font-mono text-xs"
        style={{
          border: `1px solid ${theme.terminalBorder}`,
          backgroundColor: `${theme.terminalBg}e6`,
          color: theme.textDim,
        }}
      >
        <span className="overlay-spinner" aria-hidden>◐</span>
        {currentView === 'monitor' ? 'Closing file...' : 'Opening file...'}
      </div>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/* Main overlay export                                                 */
/* ------------------------------------------------------------------ */

export function Overlay() {
  const currentView = useWorkstationStore((s) => s.currentView);
  const isAnimating = useWorkstationStore((s) => s.isAnimating);
  const isMonitor = currentView === 'monitor';

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
        <IdeView />
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
