import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useWorkstationStore } from '../../store/store';
import type { ViewState } from '../../store/store';
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
import type { DocId } from './files';
import {
  getBootSequence,
  helpText,
  profileData,
  projectsData,
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

export function Ide() {
  const currentView = useWorkstationStore((s) => s.currentView);
  const isAnimating = useWorkstationStore((s) => s.isAnimating);
  const terminalBooted = useWorkstationStore((s) => s.terminalBooted);
  const setTerminalBooted = useWorkstationStore((s) => s.setTerminalBooted);
  const reducedMotion = useWorkstationStore((s) => s.prefersReducedMotion);
  const soundMuted = useWorkstationStore((s) => s.soundMuted);
  const setSoundMuted = useWorkstationStore((s) => s.setSoundMuted);
  const setView = useWorkstationStore((s) => s.setView);
  const returnToMonitor = useWorkstationStore((s) => s.returnToMonitor);
  const openKitchenGame = useWorkstationStore((s) => s.openKitchenGame);

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
  const [projectTab, setProjectTab] = useState<ViewState | null>(null);
  const lastDocRef = useRef<DocId>('welcome');
  if (activeTab !== 'project') lastDocRef.current = activeTab;

  /* ----- layout ----- */
  const [sidebarOpen, setSidebarOpen] = useState(true);
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

  /* ----- launch sequencing ----- */
  const [launching, setLaunching] = useState(false);
  const launchTimersRef = useRef<number[]>([]);
  useEffect(() => {
    const timers = launchTimersRef.current;
    return () => timers.forEach(clearTimeout);
  }, []);

  const startLaunchSequence = useCallback(
    (viewId: ViewState, echoLine: string) => {
      const meta = PROJECT_FILES[viewId];
      const teaser = PROJECT_TEASERS[viewId];
      const teaserLines = teaser ? (Array.isArray(teaser) ? teaser : [teaser]) : [];
      const lineDelayMs = 400;
      setLaunching(true);
      setProjectTab(viewId);
      setActiveTabState('project');
      setPanelOpenState(true);
      setPanelTab('terminal');
      setTermLines((prev) => [...prev, echoLine]);
      setOutputLines((prev) => [...prev, `[launch] ${meta?.file ?? viewId}`]);
      teaserLines.forEach((line, i) => {
        launchTimersRef.current.push(
          window.setTimeout(() => setTermLines((prev) => [...prev, line]), (i + 1) * lineDelayMs)
        );
      });
      launchTimersRef.current.push(
        window.setTimeout(() => {
          setTermLines((prev) => [...prev, `Opening ${meta?.file ?? viewId}...`]);
          launchTimersRef.current.push(
            window.setTimeout(() => {
              launchTimersRef.current.length = 0;
              setLaunching(false);
              setView(viewId);
            }, 500)
          );
        }, (teaserLines.length + 1) * lineDelayMs)
      );
    },
    [setView]
  );

  const openProject = useCallback(
    (id: ViewState) => {
      if (isAnimating || launching) return;
      setMobileDrawerOpen(false);
      if (currentView === id) {
        setProjectTab(id);
        setActiveTabState('project');
        return;
      }
      startLaunchSequence(id, `$ open projects/${projectFileName(id)}`);
    },
    [isAnimating, launching, currentView, startLaunchSequence]
  );

  /* Keep the tab model in sync with the 3D scene. */
  useEffect(() => {
    if (currentView !== 'monitor') {
      setProjectTab(currentView);
      setActiveTabState('project');
    } else if (!isAnimating && !launching) {
      setProjectTab(null);
      setActiveTabState((t) => (t === 'project' ? lastDocRef.current : t));
    }
  }, [currentView, isAnimating, launching]);

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
    if (launching) {
      launchTimersRef.current.forEach(clearTimeout);
      launchTimersRef.current.length = 0;
      setLaunching(false);
      setTermLines((prev) => [...prev, 'Canceled.']);
      setProjectTab(null);
      setActiveTabState(lastDocRef.current);
      return;
    }
    if (currentView !== 'monitor') {
      if (!isAnimating) returnToMonitor();
      return;
    }
    setProjectTab(null);
    setActiveTabState(lastDocRef.current);
  }, [launching, currentView, isAnimating, returnToMonitor]);

  const openFileByName = useCallback(
    (name: string): boolean => {
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
    },
    [openProject, openDocTab]
  );

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
      } else if (trimmedCmd === 'play') {
        openKitchenGame();
        response = ['Launching Kitchen Chaos...'];
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
          if (launching || isAnimating) {
            setTermLines((prev) => [...prev, `$ ${cmd}`, 'A file is already opening. Hold on.']);
            return;
          }
          startLaunchSequence(project.id, `$ ${cmd}`);
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
          response = [
            `Error: '${argRaw}' not found.`,
            'Files:',
            ...projectsData.map((p) => `  open ${PROJECT_FILES[p.id]?.file ?? p.executable}`),
          ];
        }
      } else if (trimmedCmd) {
        response = [`Command not recognized: '${trimmedCmd}'. Type 'help' for commands.`];
      }

      setTermLines((prev) => [...prev, `$ ${cmd}`, ...response]);
    },
    [setTheme, openKitchenGame, openDocTab, launching, isAnimating, startLaunchSequence]
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
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [openPalette, selectSidebarView, toggleSidebar, togglePanel, toggleTerminal]);

  /* ----- derived ----- */
  const busy = launching || isAnimating || booting;
  const statusMessage = booting
    ? 'Restoring workspace...'
    : launching || (isAnimating && currentView !== 'monitor')
      ? `Opening ${projectTab ? projectFileName(projectTab) : 'file'}...`
      : isAnimating
        ? 'Closing file...'
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
    cursorLine,
    setCursorLine,
    themeName,
    activeThemeId,
    setThemeId,
    soundMuted,
    setSoundMuted,
    currentView,
    isAnimating,
    returnToMonitor,
    openKitchenGame,
  };

  return (
    <IdeContext.Provider value={api}>
      <div
        className="fixed inset-0 z-10 flex flex-col"
        style={{
          pointerEvents: 'none',
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
              className="pointer-events-auto z-20 w-[260px] shrink-0"
              style={{ borderRight: `1px solid ${tokens.border}` }}
            >
              <SideBarBody />
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
