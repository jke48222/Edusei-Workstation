/**
 * @file projectRegistry.ts
 * @description The IDE's project list, derived from the same source the public site
 * uses (`getAllProjectsForWork()`), so /workstation and /work can never drift apart.
 *
 * Each project becomes one "source file" in the explorer: a filename, a language, and
 * a category folder. Filenames are derived from the project id, with overrides below
 * for the ones that read better hand-named. Add a project to `src/data/index.ts` and
 * it shows up here — in the tree, Quick Open, the palette, search, and the terminal —
 * with no edit to this file.
 */

import { getAllProjectsForWork, projectsData } from './registryData';
import type { WorkProject, ProjectCategory } from '../../data';

export type ProjectId = string;

export type LangId =
  | 'py' | 'cpp' | 'cs' | 'c' | 'sql' | 'md' | 'json' | 'pdf'
  | 'swift' | 'ts' | 'tsx' | 'js' | 'ex' | 'v' | 'java';

export const LANG_LABELS: Record<LangId, string> = {
  py: 'Python',
  cpp: 'C++',
  cs: 'C#',
  c: 'C',
  sql: 'SQL',
  md: 'Markdown',
  json: 'JSON',
  pdf: 'PDF',
  swift: 'Swift',
  ts: 'TypeScript',
  tsx: 'TypeScript React',
  js: 'JavaScript',
  ex: 'Elixir',
  v: 'Verilog',
  java: 'Java',
};

const EXT: Record<LangId, string> = {
  py: 'py', cpp: 'cpp', cs: 'cs', c: 'c', sql: 'sql', md: 'md', json: 'json', pdf: 'pdf',
  swift: 'swift', ts: 'ts', tsx: 'tsx', js: 'js', ex: 'ex', v: 'v', java: 'java',
};

/* ------------------------------------------------------------------ */
/* Language inference                                                  */
/* ------------------------------------------------------------------ */

/**
 * First rule whose pattern matches the joined tech stack wins, so order is the
 * priority order. A project whose stack names no programming language at all
 * (a research or pure-hardware build) falls through to Markdown — a write-up
 * is the honest file type for it.
 */
const LANG_RULES: [RegExp, LangId][] = [
  [/\bVerilog\b/, 'v'],
  [/\bUnreal\b/, 'cpp'],
  [/\bUnity\b|C#/, 'cs'],
  [/\bSwift(UI)?\b|\bAppKit\b/, 'swift'],
  [/\bElixir\b|\bPhoenix\b/, 'ex'],
  [/\bJavaFX\b|\bJava\b/, 'java'],
  [/\bTypeScript\b/, 'ts'],
  [/\bMicroPython\b|\bPython\b/, 'py'],
  [/C\+\+/, 'cpp'],
  [/\bSQL\b/, 'sql'],
  [/\bJavaScript\b|\bJSX\b|\bWordPress\b/, 'js'],
  [/(^|[^+\w])C([^+\w]|$)/, 'c'],
];

function inferLang(project: WorkProject): LangId {
  const stack = project.techStack.join(' · ');
  for (const [pattern, lang] of LANG_RULES) {
    if (pattern.test(stack)) {
      // React/Next work is .tsx, not .ts — the components are the project.
      if (lang === 'ts' && /\bReact\b|\bNext\.js\b/.test(stack)) return 'tsx';
      return lang;
    }
  }
  return 'md';
}

/* ------------------------------------------------------------------ */
/* File names                                                          */
/* ------------------------------------------------------------------ */

/**
 * Hand-picked names. The first five preserve the filenames the IDE already
 * shipped; the rest are shortenings, because `smart_watering_assistant.py`
 * reads better in a tree than the full slug would.
 */
const FILE_NAME_OVERRIDES: Record<ProjectId, string> = {
  'audio-tracking-car': 'audio_tracking_car.py',
  animaldot: 'animaldot.cpp',
  'kitchen-chaos-vr': 'kitchen_chaos.cs',
  memesat: 'memesat_fsw.c',
  'capital-one': 'creditwise_case.sql',

  'smart-plant-watering-assistant': 'smart_plant_monitor.py',
  'travel-itinerary-application': 'travel_itinerary.java',
  'freight-carrier-website': 'freight_carrier_site.tsx',
  'freight-operations-portal': 'freight_ops_portal.tsx',
  'live-election-platform': 'live_election.js',
  'pdms-microfluidic-mixer': 'pdms_mixer.md',
  'led-frequency-filter': 'led_frequency_filter.md',
  'website-development': 'client_websites.js',
  'primeforge-fpga': 'primeforge.v',
  'damage-claim-verifier': 'claim_verifier.py',
  'paper-trading-harness': 'trading_harness.ts',
  'parmco-ble-motor': 'parmco_ble_motor.c',
  'ubersicht-widgets': 'ubersicht_widgets.js',
};

/** Reverse of EXT, so an overridden filename decides its own language. */
const LANG_BY_EXT: Record<string, LangId> = Object.fromEntries(
  (Object.entries(EXT) as [LangId, string][]).map(([lang, ext]) => [ext, lang])
);

/**
 * A project's filename and language, resolved together. When the name is
 * overridden its extension is authoritative — inference reads the whole tech
 * stack and would otherwise call `memesat_fsw.c` C++ and `creditwise_case.sql`
 * Python, since both stacks list more than one language.
 */
function resolveFile(project: WorkProject): { file: string; lang: LangId } {
  const override = FILE_NAME_OVERRIDES[project.id];
  if (override) {
    const ext = override.slice(override.lastIndexOf('.') + 1);
    return { file: override, lang: LANG_BY_EXT[ext] ?? inferLang(project) };
  }
  const lang = inferLang(project);
  return { file: `${project.id.replace(/-/g, '_')}.${EXT[lang]}`, lang };
}

/** `run <name>` in the terminal matches on this. */
function deriveExecutable(project: WorkProject): string {
  const legacy = projectsData.find((p) => p.id === project.id);
  return legacy?.executable ?? project.id.replace(/-/g, '');
}

/* ------------------------------------------------------------------ */
/* The registry                                                        */
/* ------------------------------------------------------------------ */

/** Explorer folder order — the tree reads top to bottom in this order. */
export const FOLDER_ORDER: ProjectCategory[] = ['ai', 'web', 'embedded', 'hardware', 'vr', 'research'];

export const FOLDER_LABELS: Record<ProjectCategory, string> = {
  ai: 'ai',
  web: 'web',
  embedded: 'embedded',
  hardware: 'hardware',
  vr: 'vr',
  research: 'research',
};

export interface IdeProject {
  id: ProjectId;
  /** Bare filename, e.g. `exocortex.swift`. */
  file: string;
  /** Full tree path, e.g. `projects/ai/exocortex.swift`. */
  path: string;
  lang: LangId;
  folder: ProjectCategory;
  executable: string;
  title: string;
  tagline: string;
  description: string[];
  techStack: string[];
  period: string;
  location: string;
  github?: string;
  liveUrl?: string;
  /** The full record, for the details panel and the preview pane. */
  project: WorkProject;
}

function build(): IdeProject[] {
  return getAllProjectsForWork().map((project) => {
    const { file, lang } = resolveFile(project);
    const folder = project.category ?? 'research';
    return {
      id: project.id,
      file,
      path: `projects/${FOLDER_LABELS[folder]}/${file}`,
      lang,
      folder,
      executable: deriveExecutable(project),
      title: project.title,
      tagline: project.tagline,
      description: project.description,
      techStack: project.techStack,
      period: project.period,
      location: project.location,
      github: project.github,
      liveUrl: project.liveUrl,
      project,
    };
  });
}

/** Every project the IDE can open, in the site's own order. */
export const IDE_PROJECTS: IdeProject[] = build();

const BY_ID = new Map(IDE_PROJECTS.map((p) => [p.id, p]));

export function getIdeProject(id: ProjectId): IdeProject | undefined {
  return BY_ID.get(id);
}

/**
 * Resolve what a visitor typed into a project. Accepts the bare filename, the
 * full `projects/<folder>/<file>` path, the executable name, and the raw id —
 * `open`/`run` in the terminal and Quick Open all funnel through here.
 */
export function findIdeProject(input: string): IdeProject | undefined {
  const q = input.trim().toLowerCase().replace(/\.exe$/, '');
  const bare = q.replace(/^projects\//, '').replace(/^[a-z]+\//, '');
  return IDE_PROJECTS.find(
    (p) =>
      p.file.toLowerCase() === bare ||
      p.path.toLowerCase() === q ||
      p.executable.toLowerCase() === q ||
      p.id.toLowerCase() === q
  );
}

export interface ProjectFolder {
  name: ProjectCategory;
  projects: IdeProject[];
}

/** The explorer tree: folders in FOLDER_ORDER, files alphabetical inside each. */
export const PROJECT_FOLDERS: ProjectFolder[] = FOLDER_ORDER.map((name) => ({
  name,
  projects: IDE_PROJECTS.filter((p) => p.folder === name).sort((a, b) => a.file.localeCompare(b.file)),
})).filter((f) => f.projects.length > 0);
