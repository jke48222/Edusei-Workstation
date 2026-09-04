import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useWorkstationStore } from '../../store/store';
import {
  themePresets,
  useResolvedThemeId,
  useThemeStore,
  SYSTEM_THEME_ID,
} from '../../store/themeStore';
import { useIsNarrowViewport } from '../../hooks/useIsMobile';
import { resumeAudioContext, playBootComplete } from '../../utils/terminalSound';
import { buildIdeTokens } from './tokens';
import { IdeContext } from './context';
import type { IdeApi, PanelTab, SidebarView, TabKind } from './context';
import {
  DOC_FILES,
  PDF_FILES,
  PROJECT_FILES,
  LANG_LABELS,
  getFileLang,
  projectFileName,
  GAG_COMMANDS,
  PROJECT_TEASERS,
} from './files';
import type { DocId, ProjectId } from './files';
import { IDE_PROJECTS, PROJECT_FOLDERS, findIdeProject, getIdeProject } from './projectRegistry';
import {
  getBootSequence,
  helpText,
  profileData,
  resolveThemeCommand,
  themeCommandNames,
} from './registryData';
import { TitleBar } from './TitleBar';
import { ActivityBar, SideBarBody } from './SideBar';
import { EditorArea } from './EditorArea';
import { PanelDock } from './PanelDock';
import { QuickInput } from './QuickInput';
import {
  BellIcon,
  BranchIcon,
  CircleFilledIcon,
  CloseIcon,
  DebugIcon,
  ErrorIcon,
  ExtensionsIcon,
  FilesIcon,
  RemoteIcon,
  SearchIcon,
  SourceControlIcon,
  SyncIcon,
  WarningIcon,
} from './icons';

const UI_FONT = "-apple-system, BlinkMacSystemFont, 'Segoe UI', Ubuntu, sans-serif";

/* ------------------------------------------------------------------ */
/* Status bar                                                          */
/* ------------------------------------------------------------------ */

function StatusBar({ api }: { api: IdeApi }) {
  const { tokens } = api;
  const itemCls = 'ide-status-item flex h-full items-center gap-1 px-2 text-[12px]';
  const langLabel =
    api.activeTab === 'project' && api.projectTab
      ? LANG_LABELS[PROJECT_FILES[api.projectTab]?.lang ?? 'md']
      : LANG_LABELS[getFileLang(DOC_FILES.find((d) => d.id === api.activeTab)?.file ?? 'welcome.md')];

  return (
    <div
      className="pointer-events-auto z-30 flex h-[22px] shrink-0 items-stretch overflow-hidden"
      style={{
        backgroundColor: tokens.chromeBg,
        borderTop: `1px solid ${tokens.border}`,
        color: tokens.chromeFg,
        fontFamily: UI_FONT,
      }}
    >
      <Link
        to="/"
        className="flex h-full items-center gap-1 px-2 text-[12px]"
        style={{ backgroundColor: tokens.statusRemoteBg, color: tokens.statusRemoteFg }}
        title="Back to jalenedusei.com"
      >
        <RemoteIcon size={12} />
        <span className="hidden sm:inline">jalenedusei.com</span>
      </Link>
      <a
        href="https://github.com/jke48222/edusei-workstation"
        target="_blank"
        rel="noopener noreferrer"
        className={itemCls}
        title="View the repository"
      >
        <BranchIcon size={12} />
        main
      </a>
      <span className={`${itemCls} hidden sm:flex`} title="Up to date">
        <SyncIcon size={12} />
      </span>
      <button
        type="button"
        className={itemCls}
        title="No problems"
        onClick={() => {
          api.setPanelOpen(true);
          api.setPanelTab('problems');
        }}
      >
        <ErrorIcon size={12} /> 0 <WarningIcon size={12} /> 0
      </button>
      {api.statusMessage ? (
        <span className={`${itemCls} hidden md:flex`} style={{ color: tokens.chromeFgDim }}>
          {api.statusMessage}
        </span>
      ) : (
        profileData.openForWork && (
          <a
            href={`https://${profileData.linkedin}`}
            target="_blank"
            rel="noopener noreferrer"
            className={`${itemCls} hidden md:flex`}
            title="Open to work: LinkedIn"
          >
            <span style={{ color: '#3FB950' }}>
              <CircleFilledIcon size={10} />
            </span>
            Open to work
          </a>
        )
      )}

      <span className="flex-1" />

      <span className={`${itemCls} hidden lg:flex`}>Ln {api.cursorLine}, Col 1</span>
      <span className={`${itemCls} hidden lg:flex`}>Spaces: 2</span>
      <span className={`${itemCls} hidden sm:flex`}>UTF-8</span>
      <span className={`${itemCls} hidden lg:flex`}>LF</span>
      <span className={itemCls}>{langLabel}</span>
      <button type="button" className={`${itemCls} hidden sm:flex`} title="Color theme" onClick={() => api.openPalette('>theme ')}>
        {api.themeName}
      </button>
      <span className={`${itemCls} hidden sm:flex`} title="No new notifications">
        <BellIcon size={12} />
      </span>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Mobile explorer drawer                                              */
/* ------------------------------------------------------------------ */

function MobileDrawer({ api }: { api: IdeApi }) {
  const { tokens } = api;
  const views: { view: SidebarView; label: string; icon: React.ReactNode }[] = [
    { view: 'explorer', label: 'Explorer', icon: <FilesIcon size={18} /> },
    { view: 'search', label: 'Search', icon: <SearchIcon size={18} /> },
    { view: 'scm', label: 'Source Control', icon: <SourceControlIcon size={18} /> },
    { view: 'run', label: 'Run', icon: <DebugIcon size={18} /> },
    { view: 'extensions', label: 'Extensions', icon: <ExtensionsIcon size={18} /> },
  ];
  return (
    <div className="pointer-events-auto fixed inset-0 z-50 flex">
      <div className="flex h-full w-[84vw] max-w-[320px] flex-col" style={{ backgroundColor: tokens.chromeBg, borderRight: `1px solid ${tokens.border}` }}>
        <div className="flex h-10 shrink-0 items-center gap-1 px-2" style={{ borderBottom: `1px solid ${tokens.border}` }}>
          {views.map((v) => (
            <button
              key={v.view}
              type="button"
              className="rounded p-2"
              aria-label={v.label}
              onClick={() => api.selectSidebarView(v.view)}
              style={{ color: api.sidebarView === v.view ? tokens.chromeFg : tokens.chromeFgDim }}
            >
              {v.icon}
            </button>
          ))}
          <button
            type="button"
            className="ml-auto rounded p-2"
            aria-label="Close explorer"
            onClick={() => api.setMobileDrawerOpen(false)}
            style={{ color: tokens.chromeFgDim }}
          >
            <CloseIcon size={16} />
          </button>
        </div>
        <div className="min-h-0 flex-1">
          <SideBarBody />
        </div>
      </div>
      <button
        type="button"
        className="h-full flex-1"
        aria-label="Close explorer"
        onClick={() => api.setMobileDrawerOpen(false)}
        style={{ backgroundColor: 'rgba(0,0,0,0.45)' }}
      />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* IDE shell                                                           */
/* ------------------------------------------------------------------ */

const SIDEBAR_DEFAULT_WIDTH = 300;
const SIDEBAR_MIN_WIDTH = 180;
const SIDEBAR_MAX_WIDTH = 560;
const SIDEBAR_WIDTH_STORAGE_KEY = 'edusei-workstation-sidebarWidth';

const clampSidebarWidth = (n: number) => Math.min(SIDEBAR_MAX_WIDTH, Math.max(SIDEBAR_MIN_WIDTH, n));

function getStoredSidebarWidth(): number {
  // try/catch, not a typeof guard: with site data blocked, merely touching
  // localStorage throws a SecurityError in some browsers.
  try {
    const raw = localStorage.getItem(SIDEBAR_WIDTH_STORAGE_KEY);
    if (raw !== null && Number.isFinite(Number(raw))) return clampSidebarWidth(Number(raw));
  } catch { /* storage blocked */ }
  return SIDEBAR_DEFAULT_WIDTH;
}

function storeSidebarWidth(width: number): void {
  try {
    localStorage.setItem(SIDEBAR_WIDTH_STORAGE_KEY, String(Math.round(width)));
  } catch { /* storage blocked */ }
}

/** The query param that makes a single file linkable: /workstation?file=exocortex.swift */
const FILE_PARAM = 'file';

export function Ide() {
  const terminalBooted = useWorkstationStore((s) => s.terminalBooted);
  const setTerminalBooted = useWorkstationStore((s) => s.setTerminalBooted);
  const reducedMotion = useWorkstationStore((s) => s.prefersReducedMotion);
  const soundMuted = useWorkstationStore((s) => s.soundMuted);
  const setSoundMuted = useWorkstationStore((s) => s.setSoundMuted);

  const activeThemeId = useThemeStore((s) => s.activeTheme);
  const setTheme = useThemeStore((s) => s.setTheme);
  const resolvedThemeId = useResolvedThemeId();
  const tokens = useMemo(
    () => buildIdeTokens(resolvedThemeId, themePresets[resolvedThemeId] ?? themePresets.clean),
    [resolvedThemeId]
  );

  const isMobile = useIsNarrowViewport();
  const isMac = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform ?? '');

  /* ----- tabs ----- */
  const [openDocs, setOpenDocs] = useState<DocId[]>(['welcome']);
  const [activeTab, setActiveTabState] = useState<TabKind>('welcome');
  const [projectTab, setProjectTab] = useState<ProjectId | null>(null);
  const lastDocRef = useRef<DocId>('welcome');
  if (activeTab !== 'project') lastDocRef.current = activeTab;

  /* ----- layout ----- */
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const [sidebarWidth, setSidebarWidth] = useState(getStoredSidebarWidth);
  const [resizingSidebar, setResizingSidebar] = useState(false);
  const [sidebarView, setSidebarView] = useState<SidebarView>('explorer');
  const [panelOpen, setPanelOpenState] = useState(true);
  const [panelTab, setPanelTab] = useState<PanelTab>('terminal');
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const userToggledLayoutRef = useRef(false);

  // The pane can mount at a temporarily narrow width, so keep defaults in sync
  // with the settled viewport until the user chooses a layout themselves.
  useEffect(() => {
    if (userToggledLayoutRef.current) return;
    setSidebarOpen(!isMobile);
    setPanelOpenState(!isMobile);
  }, [isMobile]);

  const setPanelOpen = useCallback((v: boolean) => {
    userToggledLayoutRef.current = true;
    setPanelOpenState(v);
  }, []);

  /** Pointer-capture drag on the side bar's right edge. Double-click resets. */
  const startSidebarResize = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    const handle = e.currentTarget;
    handle.setPointerCapture(e.pointerId);
    setResizingSidebar(true);
    const startX = e.clientX;
    const startWidth = handle.parentElement?.getBoundingClientRect().width ?? SIDEBAR_DEFAULT_WIDTH;

    let latestWidth = startWidth;

    const onMove = (ev: PointerEvent) => {
      latestWidth = clampSidebarWidth(startWidth + (ev.clientX - startX));
      setSidebarWidth(latestWidth);
    };
    const onUp = () => {
      setResizingSidebar(false);
      // Written once on release — a write per pointermove frame would hammer
      // localStorage for no benefit.
      storeSidebarWidth(latestWidth);
      handle.removeEventListener('pointermove', onMove);
      handle.removeEventListener('pointerup', onUp);
      handle.removeEventListener('pointercancel', onUp);
    };
    handle.addEventListener('pointermove', onMove);
    handle.addEventListener('pointerup', onUp);
    handle.addEventListener('pointercancel', onUp);
  }, []);

  /* ----- terminal + output buffers ----- */
  const [termLines, setTermLines] = useState<string[]>([]);
  const [outputLines, setOutputLines] = useState<string[]>([]);
  const terminalFocusRef = useRef<(() => void) | null>(null);
  const registerTerminalFocus = useCallback((fn: (() => void) | null) => {
    terminalFocusRef.current = fn;
  }, []);
  const focusTerminal = useCallback(() => {
    requestAnimationFrame(() => terminalFocusRef.current?.());
  }, []);

  /* ----- quick input ----- */
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [paletteInitial, setPaletteInitial] = useState('');
  const openPalette = useCallback((prefill = '') => {
    setPaletteInitial(prefill);
    setPaletteOpen(true);
  }, []);

  /* ----- editor status ----- */
  const [cursorLine, setCursorLine] = useState(1);

  /* ----- boot ----- */
  const [booting, setBooting] = useState(!terminalBooted);
  useEffect(() => {
    const lines = getBootSequence();
    if (terminalBooted) {
      setOutputLines(lines);
      setBooting(false);
      return;
    }
    const timers = lines.map((line, i) =>
      window.setTimeout(() => setOutputLines((prev) => [...prev, line]), 130 * i)
    );
    const done = window.setTimeout(() => {
      setBooting(false);
      setTerminalBooted(true);
      if (!soundMuted && !reducedMotion) {
        resumeAudioContext();
        playBootComplete();
      }
    }, 130 * lines.length + 300);
    return () => {
      timers.forEach(clearTimeout);
      clearTimeout(done);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ----- opening project files ----- */
  const [viewerLoading, setViewerLoading] = useState(false);
  const projectTabRef = useRef(projectTab);
  projectTabRef.current = projectTab;

  const openProject = useCallback(
    (id: ProjectId, echoLine?: string) => {
      setMobileDrawerOpen(false);
      if (projectTabRef.current !== id) {
        const meta = getIdeProject(id);
        const teaser = PROJECT_TEASERS[id];
        const teaserLines = teaser ? (Array.isArray(teaser) ? teaser : [teaser]) : [];
        setTermLines((lines) => [
          ...lines,
          echoLine ?? `$ open ${meta?.path ?? projectFileName(id)}`,
          ...teaserLines,
          `Opening ${meta?.file ?? id}...`,
        ]);
        setOutputLines((lines) => [...lines, `[open] ${meta?.file ?? id}`]);
        setViewerLoading(true);
        setProjectTab(id);
      }
      setActiveTabState('project');
    },
    []
  );

  /* ----- tab ops ----- */
  const setActiveTab = useCallback((tab: TabKind) => setActiveTabState(tab), []);

  const openDocTab = useCallback((id: DocId) => {
    setOpenDocs((prev) => (prev.includes(id) ? prev : [...prev, id]));
    setActiveTabState(id);
    setMobileDrawerOpen(false);
  }, []);

  const closeDocTab = useCallback(
    (id: DocId) => {
      setOpenDocs((prev) => {
        const idx = prev.indexOf(id);
        const next = prev.filter((d) => d !== id);
        setActiveTabState((t) => {
          if (t !== id) return t;
          if (next.length === 0) return projectTab ? 'project' : t;
          return next[Math.min(idx, next.length - 1)];
        });
        return next;
      });
    },
    [projectTab]
  );

  const closeProjectTab = useCallback(() => {
    setProjectTab(null);
    setViewerLoading(false);
    setActiveTabState((t) => (t === 'project' ? lastDocRef.current : t));
  }, []);

  const openFileByName = useCallback(
    (name: string): boolean => {
      const lower = name.toLowerCase();
      const project = findIdeProject(name);
      if (project) {
        openProject(project.id);
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
    },
    [openProject, openDocTab]
  );

  /* ----- deep links: /workstation?file=<name> ----- */

  // Kept in a ref so the open-on-mount effect does not re-fire when
  // openFileByName's identity changes.
  const openFileByNameRef = useRef(openFileByName);
  openFileByNameRef.current = openFileByName;
  const deepLinkOpened = useRef(false);

  useEffect(() => {
    if (deepLinkOpened.current) return;
    deepLinkOpened.current = true;
    const name = searchParams.get(FILE_PARAM);
    if (name) openFileByNameRef.current(name);
  }, [searchParams]);

  // Mirror the visible file back into the address bar so it can be copied and
  // shared. welcome.md is the default tab, so it stays out of the URL and a
  // plain visit keeps a clean address.
  const visibleFile =
    activeTab === 'project' && projectTab
      ? getIdeProject(projectTab)?.file
      : DOC_FILES.find((d) => d.id === activeTab)?.file;
  const linkedFile = visibleFile === 'welcome.md' ? undefined : visibleFile;

  useEffect(() => {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        if (linkedFile) next.set(FILE_PARAM, linkedFile);
        else next.delete(FILE_PARAM);
        return next;
      },
      { replace: true }
    );
  }, [linkedFile, setSearchParams]);

  /* ----- side bar / panel ops ----- */
  const selectSidebarView = useCallback(
    (view: SidebarView) => {
      userToggledLayoutRef.current = true;
      if (isMobile) {
        setSidebarView(view);
        setMobileDrawerOpen(true);
        return;
      }
      setSidebarView((current) => {
        if (sidebarOpen && current === view) {
          setSidebarOpen(false);
          return current;
        }
        setSidebarOpen(true);
        return view;
      });
    },
    [isMobile, sidebarOpen]
  );

  const toggleSidebar = useCallback(() => {
    userToggledLayoutRef.current = true;
    if (isMobile) {
      setMobileDrawerOpen((v) => !v);
      return;
    }
    setSidebarOpen((v) => !v);
  }, [isMobile]);

  const togglePanel = useCallback(() => {
    userToggledLayoutRef.current = true;
    setPanelOpenState((v) => !v);
  }, []);

  const toggleTerminal = useCallback(() => {
    userToggledLayoutRef.current = true;
    if (!panelOpen) {
      setPanelOpenState(true);
      setPanelTab('terminal');
      focusTerminal();
      return;
    }
    if (panelTab !== 'terminal') {
      setPanelTab('terminal');
      focusTerminal();
      return;
    }
    setPanelOpenState(false);
  }, [panelOpen, panelTab, focusTerminal]);

  /* ----- terminal commands ----- */
  const runCommand = useCallback(
    (cmd: string) => {
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
        setTermLines([]);
        return;
      } else if (trimmedCmd === 'list' || trimmedCmd === 'ls') {
        response = [
          'projects/',
          ...PROJECT_FOLDERS.flatMap((f) => [`  ${f.name}/`, ...f.projects.map((p) => `    ${p.file}`)]),
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
        const themeList = themeCommandNames().map((n) => `  theme ${n}`);
        if (!name) {
          response = ['Available themes:', ...themeList];
        } else {
          const themeId = resolveThemeCommand(name);
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
          `  ${IDE_PROJECTS.length} project files across ${PROJECT_FOLDERS.length} folders. Run 'ls' to list them.`,
          `  e.g. open ${IDE_PROJECTS[0]?.file ?? 'animaldot.cpp'}`,
        ];
      } else if (trimmedCmd.startsWith('run ') || trimmedCmd.startsWith('open ')) {
        const argRaw = raw.replace(/^(run|open)\s+/i, '').trim();
        const normalized = argRaw.replace(/\.exe$/i, '').replace(/^projects\//i, '').trim().toLowerCase();
        const project = findIdeProject(argRaw);
        if (project) {
          if (projectTabRef.current === project.id) {
            setTermLines((prev) => [...prev, `$ ${cmd}`, `${project.file} is already open.`]);
            setActiveTabState('project');
            return;
          }
          openProject(project.id, `$ ${cmd}`);
          return;
        }
        const doc = DOC_FILES.find((d) => d.file.toLowerCase() === normalized);
        const pdf = PDF_FILES.find((d) => d.file.toLowerCase() === normalized);
        if (doc) {
          openDocTab(doc.id);
          response = [`Opened ${doc.file}`];
        } else if (pdf) {
          window.open(pdf.href, '_blank');
          response = [`Opening ${pdf.file}...`];
        } else {
          const near = IDE_PROJECTS.filter(
            (p) => p.file.toLowerCase().includes(normalized) || p.title.toLowerCase().includes(normalized)
          ).slice(0, 5);
          response = [
            `Error: '${argRaw}' not found.`,
            ...(near.length
              ? ['Did you mean:', ...near.map((p) => `  open ${p.file}`)]
              : [`Run 'ls' to list all ${IDE_PROJECTS.length} project files.`]),
          ];
        }
      } else if (trimmedCmd) {
        response = [`Command not recognized: '${trimmedCmd}'. Type 'help' for commands.`];
      }

      setTermLines((prev) => [...prev, `$ ${cmd}`, ...response]);
    },
    [setTheme, openDocTab, openProject]
  );

  /* ----- global keybindings ----- */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const mod = e.metaKey || e.ctrlKey;
      if (mod && !e.shiftKey && e.key.toLowerCase() === 'p') {
        e.preventDefault();
        setPaletteOpen((v) => {
          if (!v) setPaletteInitial('');
          return !v;
        });
        return;
      }
      if (mod && e.shiftKey && e.key.toLowerCase() === 'p') {
        e.preventDefault();
        openPalette('>');
        return;
      }
      if (mod && e.shiftKey && e.key.toLowerCase() === 'f') {
        e.preventDefault();
        selectSidebarView('search');
        return;
      }
      if (mod && !e.shiftKey && e.key.toLowerCase() === 'b') {
        e.preventDefault();
        toggleSidebar();
        return;
      }
      if (mod && !e.shiftKey && e.key.toLowerCase() === 'j') {
        e.preventDefault();
        togglePanel();
        return;
      }
      if (e.ctrlKey && e.key === '`') {
        e.preventDefault();
        toggleTerminal();
        return;
      }
      // The palette, menus, and drawer handle their own Escape (with
      // stopPropagation), so reaching here means: close the open 3D file.
      if (e.key === 'Escape') {
        if (mobileDrawerOpen) {
          setMobileDrawerOpen(false);
          return;
        }
        closeProjectTab();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [openPalette, selectSidebarView, toggleSidebar, togglePanel, toggleTerminal, mobileDrawerOpen, closeProjectTab]);

  /* ----- derived ----- */
  const busy = booting || viewerLoading;
  const statusMessage = booting
    ? 'Restoring workspace...'
    : viewerLoading && projectTab
      ? `Loading ${projectFileName(projectTab)}...`
      : null;
  const themeName = activeThemeId === SYSTEM_THEME_ID ? 'System' : themePresets[activeThemeId]?.name ?? 'System';

  const setThemeId = useCallback((id: string) => setTheme(id), [setTheme]);

  const api: IdeApi = {
    tokens,
    isMobile,
    reducedMotion,
    isMac,
    openDocs,
    activeTab,
    projectTab,
    setActiveTab,
    openDocTab,
    closeDocTab,
    closeProjectTab,
    openFileByName,
    openProject,
    sidebarView,
    sidebarOpen,
    selectSidebarView,
    toggleSidebar,
    mobileDrawerOpen,
    setMobileDrawerOpen,
    panelOpen,
    panelTab,
    setPanelTab,
    setPanelOpen,
    togglePanel,
    toggleTerminal,
    focusTerminal,
    registerTerminalFocus,
    termLines,
    runCommand,
    outputLines,
    openPalette,
    busy,
    statusMessage,
    viewerLoading,
    setViewerLoading,
    cursorLine,
    setCursorLine,
    themeName,
    activeThemeId,
    setThemeId,
    soundMuted,
    setSoundMuted,
  };

  return (
    <IdeContext.Provider value={api}>
      <div
        className="fixed inset-0 z-10 flex select-none flex-col"
        style={{
          pointerEvents: 'none',
          cursor: 'default',
          fontFamily: UI_FONT,
          colorScheme: tokens.isDark ? 'dark' : 'light',
        }}
      >
        <div className="pointer-events-auto relative z-40">
          <TitleBar />
        </div>

        <div className="relative flex min-h-0 flex-1">
          {!isMobile && (
            <div className="pointer-events-auto z-30 flex">
              <ActivityBar />
            </div>
          )}
          {!isMobile && sidebarOpen && (
            <div
              className="pointer-events-auto z-20 flex shrink-0"
              style={{ width: sidebarWidth }}
            >
              <div className="min-w-0 flex-1" style={{ borderRight: `1px solid ${tokens.border}` }}>
                <SideBarBody />
              </div>
              {/* Drag handle: 30 project files need more room than 260px. */}
              <div
                role="separator"
                aria-orientation="vertical"
                aria-label="Resize side bar"
                onPointerDown={startSidebarResize}
                onDoubleClick={() => {
                  setSidebarWidth(SIDEBAR_DEFAULT_WIDTH);
                  storeSidebarWidth(SIDEBAR_DEFAULT_WIDTH);
                }}
                className="-ml-px w-[3px] shrink-0"
                style={{ cursor: 'col-resize', backgroundColor: resizingSidebar ? tokens.accent : 'transparent' }}
              />
            </div>
          )}
          <div className="flex min-h-0 min-w-0 flex-1 flex-col">
            <EditorArea />
            <PanelDock />
          </div>

          {paletteOpen && <QuickInput initial={paletteInitial} onClose={() => setPaletteOpen(false)} />}
        </div>

        <StatusBar api={api} />

        {isMobile && mobileDrawerOpen && <MobileDrawer api={api} />}
      </div>
    </IdeContext.Provider>
  );
}
