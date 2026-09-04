import { useMemo, useRef, useState, useEffect } from 'react';
import { useIde } from './context';
import type { SidebarView } from './context';
import { MenuDropdown } from './TitleBar';
import type { MenuEntry } from './TitleBar';
import {
  profileData,
  themeChoices,
  toThemeCommand,
} from './registryData';
import { IDE_PROJECTS, PROJECT_FOLDERS } from './projectRegistry';
import { themePresets, SYSTEM_THEME_ID } from '../../store/themeStore';
import { DOC_FILES, PDF_FILES, getDocLines, getFileLang } from './files';
import type { DocId } from './files';
import {
  AccountIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  CollapseAllIcon,
  DebugIcon,
  EllipsisIcon,
  ExtensionsIcon,
  FileTypeIcon,
  FilesIcon,
  FolderIcon,
  GearIcon,
  GitHubIcon,
  NewFileIcon,
  RefreshIcon,
  SearchIcon,
  SourceControlIcon,
} from './icons';

/* ------------------------------------------------------------------ */
/* Activity bar                                                        */
/* ------------------------------------------------------------------ */

const ACTIVITY_VIEWS: { view: SidebarView; label: string; icon: (active: boolean) => React.ReactNode }[] = [
  { view: 'explorer', label: 'Explorer', icon: () => <FilesIcon size={22} /> },
  { view: 'search', label: 'Search', icon: () => <SearchIcon size={22} /> },
  { view: 'scm', label: 'Source Control', icon: () => <SourceControlIcon size={22} /> },
  { view: 'run', label: 'Run and Debug', icon: () => <DebugIcon size={22} /> },
  { view: 'extensions', label: 'Extensions', icon: () => <ExtensionsIcon size={22} /> },
];

export function ActivityBar() {
  const api = useIde();
  const { tokens } = api;
  const [popup, setPopup] = useState<'account' | 'gear' | null>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!popup) return;
    const onDown = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setPopup(null);
    };
    window.addEventListener('mousedown', onDown);
    return () => window.removeEventListener('mousedown', onDown);
  }, [popup]);

  const accountEntries: MenuEntry[] = [
    { label: profileData.email, href: `mailto:${profileData.email}` },
    { sep: true },
    { label: 'GitHub Profile', href: `https://${profileData.github}` },
    { label: 'LinkedIn', href: `https://${profileData.linkedin}` },
  ];
  const gearEntries: MenuEntry[] = [
    { label: 'Command Palette...', action: () => api.openPalette('>') },
    { label: 'Color Theme', action: () => api.openPalette('>theme ') },
    { sep: true },
    { label: 'Terminal Sound', checked: !api.soundMuted, action: () => api.setSoundMuted(!api.soundMuted) },
    { sep: true },
    { label: 'Edusei IDE v3.026', action: () => api.openDocTab('welcome') },
  ];

  const itemClass = 'relative flex h-12 w-12 items-center justify-center';

  return (
    <div
      ref={wrapRef}
      className="relative z-30 flex w-12 shrink-0 flex-col"
      style={{ backgroundColor: tokens.chromeBg, borderRight: `1px solid ${tokens.border}` }}
    >
      {ACTIVITY_VIEWS.map(({ view, label, icon }) => {
        const active = api.sidebarOpen && api.sidebarView === view;
        return (
          <button
            key={view}
            type="button"
            className={itemClass}
            title={label}
            aria-label={label}
            onClick={() => api.selectSidebarView(view)}
            style={{ color: active ? tokens.chromeFg : tokens.chromeFgDim }}
          >
            {active && (
              <span className="absolute left-0 top-1/2 h-6 w-[2px] -translate-y-1/2" style={{ backgroundColor: tokens.accent }} />
            )}
            {icon(active)}
          </button>
        );
      })}
      <div className="mt-auto" />
      <button
        type="button"
        className={itemClass}
        title="Accounts"
        aria-label="Accounts"
        onClick={() => setPopup((v) => (v === 'account' ? null : 'account'))}
        style={{ color: tokens.chromeFgDim }}
      >
        <AccountIcon size={22} />
      </button>
      <button
        type="button"
        className={itemClass}
        title="Manage"
        aria-label="Manage"
        onClick={() => setPopup((v) => (v === 'gear' ? null : 'gear'))}
        style={{ color: tokens.chromeFgDim }}
      >
        <GearIcon size={22} />
      </button>
      {popup && (
        <div className="absolute bottom-2 left-full z-50 pl-1">
          <MenuDropdown entries={popup === 'account' ? accountEntries : gearEntries} onClose={() => setPopup(null)} />
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Shared side bar scaffolding                                         */
/* ------------------------------------------------------------------ */

function ViewHeader({ title, actions }: { title: string; actions?: React.ReactNode }) {
  const { tokens } = useIde();
  return (
    <div className="flex h-[35px] shrink-0 items-center justify-between pl-5 pr-2">
      <span className="text-[11px] uppercase tracking-wide" style={{ color: tokens.chromeFgDim }}>
        {title}
      </span>
      <div className="flex items-center gap-0.5" style={{ color: tokens.chromeFgDim }}>
        {actions ?? (
          <span className="p-1">
            <EllipsisIcon size={14} />
          </span>
        )}
      </div>
    </div>
  );
}

interface TreeRowProps {
  depth: number;
  label: string;
  icon?: React.ReactNode;
  chevron?: 'down' | 'right' | 'none';
  hint?: string;
  active?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  href?: string;
}

function TreeRow({ depth, label, icon, chevron = 'none', hint, active, disabled, onClick, href }: TreeRowProps) {
  const { tokens } = useIde();
  const [hover, setHover] = useState(false);
  const style: React.CSSProperties = {
    paddingLeft: 8 + depth * 12,
    height: 22,
    color: active ? tokens.listActiveFg : tokens.chromeFg,
    backgroundColor: active ? tokens.listActiveBg : hover ? tokens.listHoverBg : 'transparent',
    outline: active ? `1px solid ${tokens.focusBorder}` : 'none',
    outlineOffset: -1,
  };
  const inner = (
    <>
      <span className="flex w-4 shrink-0 items-center justify-center" style={{ color: tokens.chromeFgDim }}>
        {chevron === 'down' ? <ChevronDownIcon size={12} /> : chevron === 'right' ? <ChevronRightIcon size={12} /> : null}
      </span>
      {icon && <span className="mr-1.5 flex shrink-0 items-center">{icon}</span>}
      <span className="truncate text-[13px]">{label}</span>
      {hint && (
        // shrink-[10]: the filename is the row's real label, so the title hint
        // gives up width first instead of both truncating together.
        <span
          className="ml-auto shrink-[10] truncate pl-2 pr-2 text-[11px]"
          style={{ color: tokens.chromeFgDim, opacity: hover ? 1 : 0.7 }}
        >
          {hint}
        </span>
      )}
    </>
  );
  const cls = 'flex w-full items-center text-left';
  if (href) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={cls} style={style} onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
        {inner}
      </a>
    );
  }
  return (
    <button type="button" className={cls} style={style} disabled={disabled} onClick={onClick} onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
      {inner}
    </button>
  );
}

/* ------------------------------------------------------------------ */
/* Explorer                                                            */
/* ------------------------------------------------------------------ */

function ExplorerView() {
  const api = useIde();
  const { tokens } = api;
  const [projectsOpen, setProjectsOpen] = useState(true);
  const [rootOpen, setRootOpen] = useState(true);
  // Folders default to open: showing the whole body of work is the point.
  const [collapsedFolders, setCollapsedFolders] = useState<Record<string, boolean>>({});
  const toggleFolder = (name: string) =>
    setCollapsedFolders((prev) => ({ ...prev, [name]: !prev[name] }));

  const rootDocs = [...DOC_FILES.map((d) => ({ kind: 'doc' as const, file: d.file, id: d.id })), ...PDF_FILES.map((d) => ({ kind: 'pdf' as const, file: d.file, href: d.href }))].sort(
    (a, b) => a.file.localeCompare(b.file)
  );

  return (
    <>
      <ViewHeader title="Explorer" />
      <div className="min-h-0 flex-1 overflow-y-auto terminal-scroll" style={{ '--scrollbar-color': `${tokens.scrollbar}55`, '--scrollbar-color-hover': `${tokens.scrollbar}88` } as React.CSSProperties}>
        {/* Workspace section */}
        <div className="group/section">
          <button
            type="button"
            className="flex h-[22px] w-full items-center pr-2 text-left"
            style={{ color: tokens.chromeFg }}
            onClick={() => setRootOpen((v) => !v)}
            aria-expanded={rootOpen}
          >
            <span className="flex w-4 shrink-0 items-center justify-center">
              {rootOpen ? <ChevronDownIcon size={12} /> : <ChevronRightIcon size={12} />}
            </span>
            <span className="flex-1 truncate text-[11px] font-bold uppercase tracking-wide">Edusei-Workstation</span>
            <span className="hidden items-center gap-0.5 group-hover/section:flex" style={{ color: tokens.chromeFgDim }}>
              <span className="p-0.5" title="New File..."><NewFileIcon size={14} /></span>
              <span className="p-0.5" title="Refresh Explorer"><RefreshIcon size={14} /></span>
              <span className="p-0.5" title="Collapse Folders"><CollapseAllIcon size={14} /></span>
            </span>
          </button>

          {rootOpen && (
            <div className="relative pb-2">
              <TreeRow
                depth={0}
                chevron={projectsOpen ? 'down' : 'right'}
                icon={<FolderIcon size={15} open={projectsOpen} />}
                label="projects"
                hint={`${IDE_PROJECTS.length}`}
                onClick={() => setProjectsOpen((v) => !v)}
              />
              {projectsOpen && (
                <div className="relative">
                  <span
                    className="pointer-events-none absolute bottom-0 top-0 w-px"
                    style={{ left: 15, backgroundColor: tokens.indentGuide }}
                    aria-hidden
                  />
                  {PROJECT_FOLDERS.map((folder) => {
                    const open = !collapsedFolders[folder.name];
                    return (
                      <div key={folder.name}>
                        <TreeRow
                          depth={1}
                          chevron={open ? 'down' : 'right'}
                          icon={<FolderIcon size={15} open={open} />}
                          label={folder.name}
                          hint={`${folder.projects.length}`}
                          onClick={() => toggleFolder(folder.name)}
                        />
                        {open &&
                          folder.projects.map((p) => (
                            <TreeRow
                              key={p.id}
                              depth={2}
                              icon={<FileTypeIcon lang={p.lang} size={15} />}
                              label={p.file}
                              hint={p.title}
                              active={api.activeTab === 'project' && api.projectTab === p.id}
                              onClick={() => api.openProject(p.id)}
                            />
                          ))}
                      </div>
                    );
                  })}
                </div>
              )}
              {rootDocs.map((f) =>
                f.kind === 'doc' ? (
                  <TreeRow
                    key={f.file}
                    depth={0}
                    icon={<FileTypeIcon lang={getFileLang(f.file)} size={15} />}
                    label={f.file}
                    active={api.activeTab === f.id}
                    onClick={() => api.openDocTab(f.id as DocId)}
                  />
                ) : (
                  <TreeRow key={f.file} depth={0} icon={<FileTypeIcon lang="pdf" size={15} />} label={f.file} href={f.href} />
                )
              )}
            </div>
          )}
        </div>

        {/* Collapsed stock sections */}
        {(['Outline', 'Timeline'] as const).map((name) => (
          <button
            key={name}
            type="button"
            className="flex h-[22px] w-full items-center text-left"
            style={{ color: tokens.chromeFgDim, borderTop: `1px solid ${tokens.border}` }}
          >
            <span className="flex w-4 shrink-0 items-center justify-center">
              <ChevronRightIcon size={12} />
            </span>
            <span className="text-[11px] font-bold uppercase tracking-wide">{name}</span>
          </button>
        ))}
      </div>
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Search                                                              */
/* ------------------------------------------------------------------ */

interface SearchHit {
  file: string;
  lang: string;
  line: number;
  text: string;
  open: () => void;
}

function SearchView() {
  const api = useIde();
  const { tokens } = api;
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const corpus = useMemo(() => {
    const rows: SearchHit[] = [];
    DOC_FILES.forEach((d) => {
      getDocLines(d.id, { listFiles: false }).forEach((line, i) => {
        const text = line.map((s) => s.t).join('');
        if (text.trim()) rows.push({ file: d.file, lang: d.lang, line: i + 1, text, open: () => api.openDocTab(d.id) });
      });
    });
    IDE_PROJECTS.forEach((p) => {
      [p.title, p.tagline, ...p.description, p.techStack.join(', ')].forEach((text, i) => {
        rows.push({ file: p.path, lang: p.lang, line: i + 1, text, open: () => api.openProject(p.id) });
      });
    });
    return rows;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const q = query.trim().toLowerCase();
  const hits = q.length >= 2 ? corpus.filter((r) => r.text.toLowerCase().includes(q)).slice(0, 40) : [];
  const byFile = hits.reduce<Record<string, SearchHit[]>>((acc, h) => {
    (acc[h.file] ??= []).push(h);
    return acc;
  }, {});

  return (
    <>
      <ViewHeader title="Search" />
      <div className="px-3 pb-2">
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search"
          aria-label="Search across files"
          className="ide-input w-full rounded-sm px-2 py-1 text-[13px] outline-none"
          style={{
            backgroundColor: tokens.inputBg,
            border: `1px solid ${tokens.inputBorder}`,
            color: tokens.editorFg,
          }}
        />
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto terminal-scroll" style={{ '--scrollbar-color': `${tokens.scrollbar}55`, '--scrollbar-color-hover': `${tokens.scrollbar}88` } as React.CSSProperties}>
        {q.length >= 2 && hits.length === 0 && (
          <p className="px-5 py-2 text-[12px]" style={{ color: tokens.chromeFgDim }}>
            No results found.
          </p>
        )}
        {Object.entries(byFile).map(([file, rows]) => (
          <div key={file}>
            <div className="flex h-[22px] items-center gap-1.5 pl-3 pr-2" style={{ color: tokens.chromeFg }}>
              <FileTypeIcon lang={rows[0].lang} size={14} />
              <span className="truncate text-[13px]">{file.split('/').pop()}</span>
              <span
                className="ml-auto rounded-full px-1.5 text-[10px] leading-4"
                style={{ backgroundColor: tokens.badgeBg, color: tokens.badgeFg }}
              >
                {rows.length}
              </span>
            </div>
            {rows.map((r, i) => {
              const idx = r.text.toLowerCase().indexOf(q);
              return (
                <button
                  key={i}
                  type="button"
                  onClick={r.open}
                  className="ide-list-row flex w-full items-center pl-8 pr-2 text-left"
                  style={{ height: 22, color: tokens.chromeFgDim }}
                >
                  <span className="truncate text-[12px]">
                    {idx >= 0 ? (
                      <>
                        {r.text.slice(Math.max(0, idx - 12), idx)}
                        <span style={{ color: tokens.chromeFg, backgroundColor: `${tokens.accent}33` }}>
                          {r.text.slice(idx, idx + q.length)}
                        </span>
                        {r.text.slice(idx + q.length)}
                      </>
                    ) : (
                      r.text
                    )}
                  </span>
                </button>
              );
            })}
          </div>
        ))}
      </div>
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Source control                                                      */
/* ------------------------------------------------------------------ */

function ScmView() {
  const api = useIde();
  const { tokens } = api;
  return (
    <>
      <ViewHeader title="Source Control" />
      <div className="px-3">
        <input
          disabled
          placeholder="Message (working tree clean)"
          aria-label="Commit message"
          className="w-full rounded-sm px-2 py-1 text-[13px] outline-none"
          style={{ backgroundColor: tokens.inputBg, border: `1px solid ${tokens.inputBorder}`, color: tokens.chromeFgDim }}
        />
        <a
          href="https://github.com/jke48222/edusei-workstation"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 flex h-[26px] items-center justify-center gap-1.5 rounded-sm text-[13px]"
          style={{ backgroundColor: tokens.buttonBg, color: tokens.buttonFg }}
        >
          <GitHubIcon size={14} />
          View on GitHub
        </a>
      </div>
      <div className="mt-3">
        <TreeRow depth={0} chevron="down" label="Edusei-Workstation" hint="main" onClick={() => {}} />
        <TreeRow depth={1} icon={<SourceControlIcon size={14} />} label="No changes" hint="clean" onClick={() => {}} />
      </div>
      <p className="mt-4 px-5 text-[12px] leading-relaxed" style={{ color: tokens.chromeFgDim }}>
        This site is a public repository. The full archive of shipped work lives at{' '}
        <a href="/work" className="underline" style={{ color: tokens.link }}>
          /work
        </a>
        .
      </p>
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Run and debug                                                       */
/* ------------------------------------------------------------------ */

function RunView() {
  const api = useIde();
  const { tokens } = api;
  return (
    <>
      <ViewHeader title="Run and Debug" />
      <p className="px-5 pb-2 text-[12px] leading-relaxed" style={{ color: tokens.chromeFgDim }}>
        Run any of the {IDE_PROJECTS.length} project files to open it in the editor.
      </p>
      <div>
        {PROJECT_FOLDERS.map((folder) => (
          <div key={folder.name}>
            <p
              className="px-5 pb-0.5 pt-2 text-[11px] font-bold uppercase tracking-wide"
              style={{ color: tokens.chromeFgDim }}
            >
              {folder.name}
            </p>
            {folder.projects.map((p) => (
              <TreeRow
                key={p.id}
                depth={0}
                icon={
                  <span style={{ color: '#3FB950' }}>
                    <DebugIcon size={14} />
                  </span>
                }
                label={p.file}
                hint={p.title}
                onClick={() => api.openProject(p.id)}
              />
            ))}
          </div>
        ))}
      </div>
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Extension icons: marketplace-style square tiles                     */
/* ------------------------------------------------------------------ */

/** Rows of mock "code" inside a theme tile. */
function ThemeTileLines({ x, colors, widths }: { x: number; colors: string[]; widths: number[] }) {
  return (
    <>
      {widths.map((w, i) => (
        <rect key={i} x={x} y={9.5 + i * 3.4} width={w} height={1.9} rx={0.95} fill={colors[i % colors.length]} />
      ))}
    </>
  );
}

/** A miniature editor screenshot in the theme's own palette. */
function ThemeExtIcon({ themeId, size = 32 }: { themeId: string; size?: number }) {
  if (themeId === SYSTEM_THEME_ID) {
    const light = themePresets.clean;
    const dark = themePresets.dark;
    return (
      <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden>
        <defs>
          <clipPath id="ext-sys-l">
            <rect x="0" y="0" width="16" height="32" />
          </clipPath>
          <clipPath id="ext-sys-r">
            <rect x="16" y="0" width="16" height="32" />
          </clipPath>
        </defs>
        <g clipPath="url(#ext-sys-l)">
          <rect width="32" height="32" rx="7" fill={light.terminalBg} />
          <ThemeTileLines x={5} colors={[light.accent, light.text, 'rgba(10,10,10,0.35)']} widths={[9, 6.5, 8, 5.5]} />
        </g>
        <g clipPath="url(#ext-sys-r)">
          <rect width="32" height="32" rx="7" fill={dark.terminalBg} />
          <ThemeTileLines x={18} colors={['#569CD6', dark.text, 'rgba(250,250,250,0.35)']} widths={[9, 6.5, 8, 5.5]} />
        </g>
        <rect width="32" height="32" rx="7" fill="none" stroke="rgba(128,128,128,0.4)" strokeWidth="1" />
      </svg>
    );
  }
  const p = themePresets[themeId];
  if (!p) return null;
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden>
      <rect width="32" height="32" rx="7" fill={p.bg} />
      <rect x="4" y="5" width="24" height="22" rx="2.5" fill={p.terminalBg} stroke={p.terminalBorder} strokeWidth="1" />
      <rect x="6.5" y="9" width="3.4" height="14.5" rx="1" fill={p.textDim} opacity="0.55" />
      <ThemeTileLines x={12.5} colors={[p.accent, p.text, p.textDim]} widths={[12, 8.5, 13, 7, 10.5]} />
      <rect width="32" height="32" rx="7" fill="none" stroke="rgba(128,128,128,0.35)" strokeWidth="1" />
    </svg>
  );
}

/** Solid-color marketplace tile with a white glyph. */
function ExtTile({ bg, size = 32, children }: { bg: string; size?: number; children: React.ReactNode }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden>
      <rect width="32" height="32" rx="7" fill={bg} />
      {children}
    </svg>
  );
}

function SoundExtIcon({ muted, size = 32 }: { muted: boolean; size?: number }) {
  return (
    <ExtTile bg={muted ? '#6B7280' : '#16825D'} size={size}>
      <path d="M9 13.5h4l5-4v13l-5-4H9v-5z" fill="#FFFFFF" />
      {muted ? (
        <path d="M21 13l6 6M27 13l-6 6" stroke="#FFFFFF" strokeWidth="1.8" strokeLinecap="round" fill="none" />
      ) : (
        <>
          <path d="M21.5 12.5a5 5 0 0 1 0 7" stroke="#FFFFFF" strokeWidth="1.8" strokeLinecap="round" fill="none" />
          <path d="M24.2 10.2a8.4 8.4 0 0 1 0 11.6" stroke="#FFFFFF" strokeWidth="1.8" strokeLinecap="round" fill="none" opacity="0.75" />
        </>
      )}
    </ExtTile>
  );
}

function GitHubExtIcon({ size = 32 }: { size?: number }) {
  return (
    <ExtTile bg="#24292F" size={size}>
      <g transform="translate(6,6) scale(1.25)">
        <path
          fill="#FFFFFF"
          d="M8 .8a7.2 7.2 0 0 0-2.28 14.03c.36.07.5-.15.5-.35v-1.22c-2 .43-2.43-.97-2.43-.97-.32-.83-.8-1.05-.8-1.05-.65-.45.05-.44.05-.44.73.05 1.11.75 1.11.75.64 1.1 1.68.78 2.1.6.06-.47.25-.79.45-.97-1.6-.18-3.28-.8-3.28-3.56 0-.79.28-1.43.74-1.94-.07-.18-.32-.91.07-1.9 0 0 .6-.2 1.98.74a6.9 6.9 0 0 1 3.6 0c1.37-.93 1.97-.74 1.97-.74.4.99.15 1.72.07 1.9.46.5.74 1.15.74 1.94 0 2.77-1.69 3.38-3.3 3.56.26.22.49.66.49 1.33v1.97c0 .2.13.42.5.35A7.2 7.2 0 0 0 8 .8z"
        />
      </g>
    </ExtTile>
  );
}

function LinkedInExtIcon({ size = 32 }: { size?: number }) {
  return (
    <ExtTile bg="#0A66C2" size={size}>
      <text
        x="16"
        y="17.5"
        textAnchor="middle"
        dominantBaseline="central"
        fill="#FFFFFF"
        fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
        fontWeight={700}
        fontSize="15"
      >
        in
      </text>
    </ExtTile>
  );
}

function ResumeExtIcon({ size = 32 }: { size?: number }) {
  return (
    <ExtTile bg="#C0392B" size={size}>
      <path d="M11 7h7.5L23 11.5V25H11V7z" fill="#FFFFFF" />
      <path d="M18.5 7v4.5H23" fill="none" stroke="#C0392B" strokeWidth="1.2" />
      <g stroke="#C0392B" strokeWidth="1.4" strokeLinecap="round">
        <path d="M13.5 15h7M13.5 18h7M13.5 21h4.5" />
      </g>
    </ExtTile>
  );
}

/* ------------------------------------------------------------------ */
/* Extensions (theme gallery + links)                                  */
/* ------------------------------------------------------------------ */

function ExtensionsView() {
  const api = useIde();
  const { tokens } = api;
  const [filter, setFilter] = useState('');

  const themes = themeChoices().filter((t) => t.name.toLowerCase().includes(filter.toLowerCase()));

  const card = (opts: {
    key: string;
    icon: React.ReactNode;
    name: string;
    desc: string;
    active?: boolean;
    onClick?: () => void;
    href?: string;
  }) => {
    const inner = (
      <>
        <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center">
          {opts.icon}
        </span>
        <span className="min-w-0 flex-1">
          <span className="flex items-center gap-1.5">
            <span className="truncate text-[13px]" style={{ color: tokens.chromeFg }}>
              {opts.name}
            </span>
            {opts.active && (
              <span className="rounded-sm px-1 text-[9px] uppercase" style={{ backgroundColor: tokens.badgeBg, color: tokens.badgeFg }}>
                Active
              </span>
            )}
          </span>
          <span className="block truncate text-[11px]" style={{ color: tokens.chromeFgDim }}>
            {opts.desc}
          </span>
          <span className="block text-[11px]" style={{ color: tokens.chromeFgDim, opacity: 0.8 }}>
            jke48222
          </span>
        </span>
      </>
    );
    const cls = 'ide-list-row flex w-full items-start gap-2 px-3 py-1.5 text-left';
    return opts.href ? (
      <a key={opts.key} href={opts.href} target="_blank" rel="noopener noreferrer" className={cls}>
        {inner}
      </a>
    ) : (
      <button key={opts.key} type="button" className={cls} onClick={opts.onClick}>
        {inner}
      </button>
    );
  };

  return (
    <>
      <ViewHeader title="Extensions" />
      <div className="px-3 pb-2">
        <input
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          placeholder="Search Extensions in Marketplace"
          aria-label="Search extensions"
          className="w-full rounded-sm px-2 py-1 text-[13px] outline-none"
          style={{ backgroundColor: tokens.inputBg, border: `1px solid ${tokens.inputBorder}`, color: tokens.editorFg }}
        />
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto terminal-scroll" style={{ '--scrollbar-color': `${tokens.scrollbar}55`, '--scrollbar-color-hover': `${tokens.scrollbar}88` } as React.CSSProperties}>
        <p className="px-3 py-1 text-[11px] font-bold uppercase tracking-wide" style={{ color: tokens.chromeFgDim }}>
          Installed
        </p>
        {themes.map((t) =>
          card({
            key: t.id,
            icon: <ThemeExtIcon themeId={t.id} />,
            name: t.id === SYSTEM_THEME_ID ? 'System Theme' : `${t.name} Theme`,
            desc: t.id === SYSTEM_THEME_ID ? 'Follows the OS appearance' : `Color theme: theme ${toThemeCommand(themePresets[t.id]?.name ?? t.name)}`,
            active: api.activeThemeId === t.id,
            onClick: () => api.setThemeId(t.id),
          })
        )}
        {card({
          key: 'sounds',
          icon: <SoundExtIcon muted={api.soundMuted} />,
          name: 'Terminal Sounds',
          desc: api.soundMuted ? 'Disabled. Click to enable keystroke sound.' : 'Enabled. Click to disable keystroke sound.',
          active: !api.soundMuted,
          onClick: () => api.setSoundMuted(!api.soundMuted),
        })}
        <p className="px-3 pb-1 pt-3 text-[11px] font-bold uppercase tracking-wide" style={{ color: tokens.chromeFgDim }}>
          Recommended
        </p>
        {card({ key: 'gh', icon: <GitHubExtIcon />, name: 'GitHub Profile', desc: profileData.github, href: `https://${profileData.github}` })}
        {card({ key: 'li', icon: <LinkedInExtIcon />, name: 'LinkedIn', desc: profileData.linkedin, href: `https://${profileData.linkedin}` })}
        {card({ key: 'cv', icon: <ResumeExtIcon />, name: 'Resume + CV', desc: 'resume.pdf and cv.pdf', href: '/resume.pdf' })}
      </div>
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Side bar shell                                                      */
/* ------------------------------------------------------------------ */

export function SideBarBody() {
  const api = useIde();
  const { tokens } = api;
  return (
    <div
      className="flex h-full min-h-0 flex-col"
      style={{ backgroundColor: tokens.chromeBg, color: tokens.chromeFg }}
    >
      {api.sidebarView === 'explorer' && <ExplorerView />}
      {api.sidebarView === 'search' && <SearchView />}
      {api.sidebarView === 'scm' && <ScmView />}
      {api.sidebarView === 'run' && <RunView />}
      {api.sidebarView === 'extensions' && <ExtensionsView />}
    </div>
  );
}
