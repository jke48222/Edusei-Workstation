import { profileData, skillsData, getSayHiMailto, themeCommandNames } from './registryData';
import { IDE_PROJECTS, LANG_LABELS, getIdeProject } from './projectRegistry';
import type { IdeProject, LangId, ProjectId } from './projectRegistry';

/* ------------------------------------------------------------------ */
/* File registry: every project and document the IDE can open          */
/* ------------------------------------------------------------------ */

export type { LangId, ProjectId };
export { LANG_LABELS };

export interface ProjectFileMeta {
  file: string;
  lang: LangId;
}

/**
 * Filename + language for every project, keyed by id. Derived from the registry,
 * which derives from the site's own project list — so the explorer shows exactly
 * what /work shows.
 */
export const PROJECT_FILES: Record<ProjectId, ProjectFileMeta | undefined> = Object.fromEntries(
  IDE_PROJECTS.map((p) => [p.id, { file: p.file, lang: p.lang }])
);

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

export function projectFileName(id: ProjectId): string {
  return getIdeProject(id)?.file ?? 'file';
}

export function getFileLang(name: string): LangId {
  const project = IDE_PROJECTS.find((p) => p.file === name);
  if (project) return project.lang;
  const doc = DOC_FILES.find((d) => d.file === name);
  if (doc) return doc.lang;
  if (name.endsWith('.pdf')) return 'pdf';
  if (name.endsWith('.json')) return 'json';
  return 'md';
}

export function getAllFileNames(): string[] {
  return [
    ...IDE_PROJECTS.map((p) => p.file),
    ...DOC_FILES.map((d) => d.file),
    ...PDF_FILES.map((d) => d.file),
  ];
}

/* ------------------------------------------------------------------ */
/* Terminal command plumbing                                           */
/* ------------------------------------------------------------------ */

export const COMPLETE_COMMANDS = ['help', 'list', 'run', 'open', 'theme', 'about', 'skills', 'resume', 'cv', 'clear'];

export const MAX_HISTORY = 50;

export const GAG_COMMANDS: Record<string, string[]> = {
  'rm -rf /': ['Nice try.'],
  'rm -rf *': ['Nice try.'],
  'format c:': ['Access denied.'],
  'del system32': ['Nice try.'],
  'sudo rm -rf /': ['Nice try.'],
};

export const PROJECT_TEASERS: Record<ProjectId, string | string[] | undefined> = {
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
    const candidates = IDE_PROJECTS.map((p) => p.executable.toLowerCase());
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
    IDE_PROJECTS.forEach((p) => {
      lines.push([
        { t: '- ', tone: 'punct' },
        { t: p.path, tone: 'link', openFile: p.file },
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

/**
 * A project rendered as the contents of its own file. Used for projects with no
 * model, video, screenshot, or embeddable site — they open as a document rather
 * than as an empty canvas, which is also why the details side-panel is hidden
 * for them: this view already carries everything it would have shown.
 */
export function buildProjectLines(p: IdeProject): DocLine[] {
  const field = (key: string, value: string): DocLine => [
    { t: key.padEnd(11, ' '), tone: 'variable' },
    { t: value, tone: 'plain' },
  ];
  const linkField = (key: string, value: string, href: string): DocLine => [
    { t: key.padEnd(11, ' '), tone: 'variable' },
    { t: value, tone: 'link', href },
  ];

  const lines: DocLine[] = [
    [{ t: `# ${p.title}`, tone: 'heading' }],
    [],
    [{ t: p.tagline, tone: 'dim' }],
    [],
    field('Period:', p.period),
    field('Location:', p.location),
  ];

  if (p.liveUrl) lines.push(linkField('Live:', p.liveUrl.replace(/^https?:\/\//, ''), p.liveUrl));
  if (p.github) lines.push(linkField('GitHub:', p.github.replace(/^https?:\/\//, ''), p.github));

  lines.push([], [{ t: '## Overview', tone: 'heading' }], []);
  p.description.forEach((para) => {
    lines.push([{ t: para, tone: 'plain' }], []);
  });

  lines.push([{ t: '## Stack', tone: 'heading' }], []);
  p.techStack.forEach((tech) => {
    lines.push([
      { t: '- ', tone: 'punct' },
      { t: tech, tone: 'string' },
    ]);
  });

  if (p.project.additionalProjects?.length) {
    lines.push([], [{ t: '## Related', tone: 'heading' }], []);
    p.project.additionalProjects.forEach((add) => {
      lines.push([
        { t: '- ', tone: 'punct' },
        { t: add.title, tone: 'bold' },
        { t: `  (${add.period})`, tone: 'dim' },
      ]);
    });
  }

  lines.push(
    [],
    [
      { t: '<!-- Full entry with gallery and demos: ', tone: 'comment' },
      { t: `/work/${p.id}`, tone: 'link', href: `/work/${p.id}` },
      { t: ' -->', tone: 'comment' },
    ]
  );
  return lines;
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
