import { profileData, projectsData, skillsData, getSayHiMailto, themeCommandNames } from './registryData';
import type { ViewState } from '../../store/store';

/* ------------------------------------------------------------------ */
/* File registry: every project and document the IDE can open          */
/* ------------------------------------------------------------------ */

export type LangId = 'py' | 'cpp' | 'cs' | 'c' | 'sql' | 'md' | 'json' | 'pdf';

export const LANG_LABELS: Record<LangId, string> = {
  py: 'Python',
  cpp: 'C++',
  cs: 'C#',
  c: 'C',
  sql: 'SQL',
  md: 'Markdown',
  json: 'JSON',
  pdf: 'PDF',
};

export interface ProjectFileMeta {
  file: string;
  lang: LangId;
}

/** Project executables rendered as source files in the explorer. */
export const PROJECT_FILES: Record<ViewState, ProjectFileMeta | undefined> = {
  monitor: undefined,
  'audio-tracking-car': { file: 'audio_tracking_car.py', lang: 'py' },
  animaldot: { file: 'animaldot.cpp', lang: 'cpp' },
  'kitchen-chaos-vr': { file: 'kitchen_chaos.cs', lang: 'cs' },
  memesat: { file: 'memesat_fsw.c', lang: 'c' },
  'capital-one': { file: 'creditwise_case.sql', lang: 'sql' },
};

export type DocId = 'welcome' | 'about' | 'skills' | 'contact';

export interface DocFile {
  id: DocId;
  file: string;
  lang: LangId;
}

export const DOC_FILES: DocFile[] = [
  { id: 'welcome', file: 'welcome.md', lang: 'md' },
  { id: 'about', file: 'about.md', lang: 'md' },
  { id: 'skills', file: 'skills.json', lang: 'json' },
  { id: 'contact', file: 'contact.md', lang: 'md' },
];

/** Rows in the tree that open a PDF in a new tab instead of an editor tab. */
export const PDF_FILES = [
  { file: 'resume.pdf', href: '/resume.pdf' },
  { file: 'cv.pdf', href: '/cv.pdf' },
];

export function projectFileName(id: ViewState): string {
  return PROJECT_FILES[id]?.file ?? 'file';
}

export function getFileLang(name: string): LangId {
  const project = (Object.keys(PROJECT_FILES) as ViewState[]).find((k) => PROJECT_FILES[k]?.file === name);
  if (project) return PROJECT_FILES[project]!.lang;
  const doc = DOC_FILES.find((d) => d.file === name);
  if (doc) return doc.lang;
  if (name.endsWith('.pdf')) return 'pdf';
  if (name.endsWith('.json')) return 'json';
  return 'md';
}

export function getAllFileNames(): string[] {
  return [
    ...projectsData.map((p) => PROJECT_FILES[p.id]?.file ?? p.executable),
    ...DOC_FILES.map((d) => d.file),
    ...PDF_FILES.map((d) => d.file),
  ];
}

/* ------------------------------------------------------------------ */
/* Terminal command plumbing                                           */
/* ------------------------------------------------------------------ */

export const COMPLETE_COMMANDS = ['help', 'list', 'run', 'open', 'theme', 'about', 'skills', 'resume', 'cv', 'clear', 'play'];

export const MAX_HISTORY = 50;

export const GAG_COMMANDS: Record<string, string[]> = {
  'rm -rf /': ['Nice try.'],
  'rm -rf *': ['Nice try.'],
  'format c:': ['Access denied.'],
  'del system32': ['Nice try.'],
  'sudo rm -rf /': ['Nice try.'],
};

export const PROJECT_TEASERS: Partial<Record<ViewState, string | string[]>> = {
  'audio-tracking-car': 'Vroom vroom.',
  animaldot: 'Go Dawgs!',
  'kitchen-chaos-vr': 'Entering virtual reality...',
  memesat: 'lol',
  'capital-one': ['Still open for work...', `https://${profileData.linkedin}`],
};

function longestCommon(matches: string[], prefix: string): string {
  if (matches.length === 0) return '';
  const common = matches.reduce((a, b) => {
    let i = 0;
    while (i < a.length && i < b.length && a[i] === b[i]) i++;
    return a.slice(0, i);
  });
  return common.length > prefix.length ? common.slice(prefix.length) : matches[0].slice(prefix.length);
}

export function getCompletionSuffix(inputValue: string): string {
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
    return longestCommon(themeCommandNames().filter((c) => c.startsWith(prefix)), prefix);
  }

  const prefix = lower.split(/\s/)[0] ?? '';
  return longestCommon(COMPLETE_COMMANDS.filter((c) => c.startsWith(prefix)), prefix);
}

/* ------------------------------------------------------------------ */
/* Document sources: each doc is plain source code, line by line       */
/* ------------------------------------------------------------------ */

export type Tone =
  | 'plain'
  | 'dim'
  | 'heading'
  | 'bold'
  | 'string'
  | 'comment'
  | 'keyword'
  | 'variable'
  | 'punct'
  | 'link';

export interface Span {
  t: string;
  tone?: Tone;
  href?: string;
  /** Internal action: open a file by name instead of following a URL. */
  openFile?: string;
}

export type DocLine = Span[];

const isMacPlatform = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform ?? '');
export const MOD_KEY = isMacPlatform ? 'Cmd' : 'Ctrl';

export function buildWelcomeLines(opts: { listFiles: boolean }): DocLine[] {
  const lines: DocLine[] = [
    [{ t: `# ${profileData.name}`, tone: 'heading' }],
    [],
    [{ t: `${profileData.title} · ${profileData.university} · Class of ${profileData.graduationYear}`, tone: 'plain' }],
    [
      { t: '**Open to work**', tone: 'bold' },
      { t: ' -> ', tone: 'dim' },
      { t: `linkedin.com/in/jalenedusei`, tone: 'link', href: `https://${profileData.linkedin}` },
    ],
    [],
    [{ t: '## Getting started', tone: 'heading' }],
    [],
    [
      { t: '1. Open a file in ', tone: 'plain' },
      { t: '`projects/`', tone: 'string' },
      { t: ' to load its 3D model as the file contents.', tone: 'plain' },
    ],
    [
      { t: '2. Press ', tone: 'plain' },
      { t: `\`${MOD_KEY}+P\``, tone: 'string' },
      { t: ' for Quick Open and ', tone: 'plain' },
      { t: `\`${MOD_KEY}+Shift+P\``, tone: 'string' },
      { t: ' for every command.', tone: 'plain' },
    ],
    [
      { t: '3. The ', tone: 'plain' },
      { t: '`TERMINAL`', tone: 'string' },
      { t: ' below runs real commands. Try ', tone: 'plain' },
      { t: '`help`', tone: 'string' },
      { t: '.', tone: 'plain' },
    ],
    [],
    [{ t: '<!-- The menus, traffic lights, and status bar all work. -->', tone: 'comment' }],
  ];

  if (opts.listFiles) {
    lines.push([], [{ t: '## Files', tone: 'heading' }], []);
    projectsData.forEach((p) => {
      const meta = PROJECT_FILES[p.id];
      if (!meta) return;
      lines.push([
        { t: '- ', tone: 'punct' },
        { t: `projects/${meta.file}`, tone: 'link', openFile: meta.file },
        { t: `  (${p.title})`, tone: 'dim' },
      ]);
    });
    DOC_FILES.filter((d) => d.id !== 'welcome').forEach((d) => {
      lines.push([
        { t: '- ', tone: 'punct' },
        { t: d.file, tone: 'link', openFile: d.file },
      ]);
    });
    PDF_FILES.forEach((d) => {
      lines.push([
        { t: '- ', tone: 'punct' },
        { t: d.file, tone: 'link', href: d.href },
      ]);
    });
  }
  return lines;
}

export function buildAboutLines(): DocLine[] {
  const field = (key: string, value: string): DocLine => [
    { t: key.padEnd(12, ' '), tone: 'variable' },
    { t: value, tone: 'plain' },
  ];
  return [
    [{ t: '# About', tone: 'heading' }],
    [],
    field('Name:', profileData.name),
    field('Title:', profileData.title),
    field('Degree:', profileData.degree),
    field('University:', profileData.university),
    field('College:', profileData.college),
    [],
    [
      { t: 'Email:'.padEnd(12, ' '), tone: 'variable' },
      { t: profileData.email, tone: 'link', href: `mailto:${profileData.email}` },
    ],
    [
      { t: 'LinkedIn:'.padEnd(12, ' '), tone: 'variable' },
      { t: profileData.linkedin, tone: 'link', href: `https://${profileData.linkedin}` },
    ],
    [
      { t: 'GitHub:'.padEnd(12, ' '), tone: 'variable' },
      { t: profileData.github, tone: 'link', href: `https://${profileData.github}` },
    ],
    [],
    [{ t: '<!-- Full CV: open cv.pdf from the explorer. -->', tone: 'comment' }],
  ];
}

export function buildContactLines(): DocLine[] {
  return [
    [{ t: '# Contact', tone: 'heading' }],
    [],
    [{ t: 'The fastest way to reach me is email.', tone: 'plain' }],
    [],
    [
      { t: '[', tone: 'punct' },
      { t: 'Say hi', tone: 'link', href: getSayHiMailto() },
      { t: '](', tone: 'punct' },
      { t: `mailto:${profileData.email}`, tone: 'string' },
      { t: ')', tone: 'punct' },
    ],
    [],
    [
      { t: 'Email:'.padEnd(10, ' '), tone: 'variable' },
      { t: profileData.email, tone: 'link', href: `mailto:${profileData.email}` },
    ],
    [
      { t: 'LinkedIn:'.padEnd(10, ' '), tone: 'variable' },
      { t: profileData.linkedin, tone: 'link', href: `https://${profileData.linkedin}` },
    ],
    [
      { t: 'GitHub:'.padEnd(10, ' '), tone: 'variable' },
      { t: profileData.github, tone: 'link', href: `https://${profileData.github}` },
    ],
  ];
}

export function buildSkillsLines(): DocLine[] {
  const raw = JSON.stringify(skillsData, null, 2).split('\n');
  return raw.map((line) => {
    const keyMatch = line.match(/^(\s*)"([^"]+)": (.*)$/);
    if (keyMatch) {
      const spans: DocLine = [
        { t: keyMatch[1], tone: 'punct' },
        { t: `"${keyMatch[2]}"`, tone: 'variable' },
        { t: ': ', tone: 'punct' },
      ];
      if (keyMatch[3]) spans.push({ t: keyMatch[3], tone: 'punct' });
      return spans;
    }
    const strMatch = line.match(/^(\s*)("(?:[^"\\]|\\.)*")(,?)$/);
    if (strMatch) {
      const spans: DocLine = [
        { t: strMatch[1], tone: 'punct' },
        { t: strMatch[2], tone: 'string' },
      ];
      if (strMatch[3]) spans.push({ t: strMatch[3], tone: 'punct' });
      return spans;
    }
    return [{ t: line, tone: 'punct' }];
  });
}

export function getDocLines(id: DocId, opts: { listFiles: boolean }): DocLine[] {
  switch (id) {
    case 'welcome':
      return buildWelcomeLines(opts);
    case 'about':
      return buildAboutLines();
    case 'skills':
      return buildSkillsLines();
    case 'contact':
      return buildContactLines();
  }
}
