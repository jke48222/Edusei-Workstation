import { createContext, useContext } from 'react';
import type { IdeTokens } from './tokens';
import type { DocId } from './files';
import type { ViewState } from '../../store/store';

export type SidebarView = 'explorer' | 'search' | 'scm' | 'run' | 'extensions';
export type PanelTab = 'problems' | 'output' | 'debug' | 'terminal' | 'ports';
/** A tab is either one of the doc files or the single 3D project slot. */
export type TabKind = DocId | 'project';

export interface IdeApi {
  tokens: IdeTokens;
  isMobile: boolean;
  reducedMotion: boolean;
  isMac: boolean;

  /* Tabs */
  openDocs: DocId[];
  activeTab: TabKind;
  projectTab: ViewState | null;
  setActiveTab: (tab: TabKind) => void;
  openDocTab: (id: DocId) => void;
  closeDocTab: (id: DocId) => void;
  closeProjectTab: () => void;

  /* Files */
  openFileByName: (name: string) => boolean;
  openProject: (id: ViewState) => void;

  /* Side bar */
  sidebarView: SidebarView;
  sidebarOpen: boolean;
  selectSidebarView: (view: SidebarView) => void;
  toggleSidebar: () => void;
  mobileDrawerOpen: boolean;
  setMobileDrawerOpen: (v: boolean) => void;

  /* Panel */
  panelOpen: boolean;
  panelTab: PanelTab;
  setPanelTab: (tab: PanelTab) => void;
  setPanelOpen: (v: boolean) => void;
  togglePanel: () => void;
  toggleTerminal: () => void;
  focusTerminal: () => void;
  registerTerminalFocus: (fn: (() => void) | null) => void;

  /* Terminal + output buffers (lifted so launches can echo into them) */
  termLines: string[];
  runCommand: (raw: string) => void;
  outputLines: string[];

  /* Quick input */
  openPalette: (prefill?: string) => void;

  /* Progress + status */
  busy: boolean;
  statusMessage: string | null;
  viewerLoading: boolean;
  setViewerLoading: (v: boolean) => void;
  cursorLine: number;
  setCursorLine: (n: number) => void;

  /* Theme */
  themeName: string;
  activeThemeId: string;
  setThemeId: (id: string) => void;

  /* Sound */
  soundMuted: boolean;
  setSoundMuted: (v: boolean) => void;

  /* Extras */
  openKitchenGame: () => void;
}

export const IdeContext = createContext<IdeApi | null>(null);

export function useIde(): IdeApi {
  const ctx = useContext(IdeContext);
  if (!ctx) throw new Error('useIde must be used inside <Ide>');
  return ctx;
}
