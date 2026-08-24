import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useIde } from './context';
import type { IdeApi } from './context';
import { profileData, projectsData, themeChoices, getSayHiMailto } from './registryData';
import { PROJECT_FILES } from './files';
import { CheckIcon, ChevronRightIcon, LayoutPanelIcon, LayoutSidebarIcon, SearchIcon } from './icons';

interface MenuEntry {
  label?: string;
  hint?: string;
  href?: string;
  action?: () => void;
  checked?: boolean;
  submenu?: MenuEntry[];
  sep?: boolean;
}

interface Menu {
  label: string;
  entries: MenuEntry[];
}

function buildMenus(api: IdeApi, navigate: (to: string) => void): Menu[] {
  const mod = api.isMac ? '⌘' : 'Ctrl+';
  const shiftMod = api.isMac ? '⇧⌘' : 'Ctrl+Shift+';
  const copy = (text: string) => {
    try {
      void navigator.clipboard?.writeText(text);
    } catch (_) {
      /* clipboard unavailable */
    }
  };
  return [
    {
      label: 'File',
      entries: [
        { label: 'Open Resume (PDF)', href: '/resume.pdf' },
        { label: 'Open CV (PDF)', href: '/cv.pdf' },
        { sep: true },
        { label: 'Say Hi by Email', href: getSayHiMailto() },
        { sep: true },
        { label: 'Close Window', hint: 'Back to home', action: () => navigate('/') },
      ],
    },
    {
      label: 'Edit',
      entries: [
        { label: 'Copy Email Address', action: () => copy(profileData.email) },
        { label: 'Copy Site Link', action: () => copy('https://www.jalenedusei.com') },
        { sep: true },
        { label: 'Find in Files', hint: shiftMod + 'F', action: () => api.selectSidebarView('search') },
      ],
    },
    {
      label: 'View',
      entries: [
        { label: 'Command Palette...', hint: shiftMod + 'P', action: () => api.openPalette('>') },
        { label: 'Quick Open...', hint: mod + 'P', action: () => api.openPalette() },
        { sep: true },
        {
          label: 'Appearance',
          submenu: themeChoices().map((t) => ({
            label: t.name,
            checked: api.activeThemeId === t.id,
            action: () => api.setThemeId(t.id),
          })),
        },
        { sep: true },
        { label: 'Toggle Primary Side Bar', hint: mod + 'B', action: api.toggleSidebar },
        { label: 'Toggle Panel', hint: mod + 'J', action: api.togglePanel },
        { label: 'Toggle Terminal', hint: '⌃`', action: api.toggleTerminal },
        { sep: true },
        { label: 'Terminal Sound', checked: !api.soundMuted, action: () => api.setSoundMuted(!api.soundMuted) },
      ],
    },
    {
      label: 'Go',
      entries: [
        { label: 'Go to File...', hint: mod + 'P', action: () => api.openPalette() },
        { sep: true },
        { label: 'Home', action: () => navigate('/') },
        { label: 'Work Archive', action: () => navigate('/work') },
        { sep: true },
        { label: 'GitHub Profile', href: `https://${profileData.github}` },
        { label: 'LinkedIn', href: `https://${profileData.linkedin}` },
      ],
    },
    {
      label: 'Run',
      entries: [
        ...projectsData.map((p) => ({
          label: PROJECT_FILES[p.id]?.file ?? p.executable,
          hint: p.title,
          action: () => api.openProject(p.id),
        })),
        { sep: true },
        { label: 'Kitchen Chaos (mini-game)', action: api.openKitchenGame },
      ],
    },
    {
      label: 'Terminal',
      entries: [
        { label: 'New Terminal', hint: '⌃`', action: () => { api.setPanelOpen(true); api.setPanelTab('terminal'); api.focusTerminal(); } },
        { label: 'Clear Terminal', action: () => api.runCommand('clear') },
        { sep: true },
        { label: 'Sound', checked: !api.soundMuted, action: () => api.setSoundMuted(!api.soundMuted) },
      ],
    },
    {
      label: 'Help',
      entries: [
        { label: 'Welcome', action: () => api.openDocTab('welcome') },
        { label: 'About', action: () => api.openDocTab('about') },
        { label: 'Contact', action: () => api.openDocTab('contact') },
        { sep: true },
        { label: 'jalenedusei.com', href: 'https://www.jalenedusei.com' },
        { label: 'Source of this Site', href: 'https://github.com/jke48222/edusei-workstation' },
      ],
    },
  ];
}

export type { MenuEntry };

export function MenuDropdown({ entries, onClose, depth = 0 }: { entries: MenuEntry[]; onClose: () => void; depth?: number }) {
  const { tokens } = useIde();
  const [subOpen, setSubOpen] = useState<number | null>(null);

  return (
    <div
      className="min-w-[220px] rounded-md py-1"
      style={{
        backgroundColor: tokens.menuBg,
        border: `1px solid ${tokens.menuBorder}`,
        boxShadow: `0 6px 16px ${tokens.widgetShadow}`,
        ['--ide-menu-hover' as string]: tokens.listActiveBg,
      }}
      role="menu"
    >
      {entries.map((entry, i) => {
        if (entry.sep) {
          return <div key={i} className="mx-2 my-1 h-px" style={{ backgroundColor: tokens.menuBorder }} />;
        }
        const inner = (
          <>
            <span className="flex w-4 shrink-0 items-center" style={{ color: tokens.chromeFg }}>
              {entry.checked ? <CheckIcon size={13} /> : null}
            </span>
            <span className="flex-1 truncate text-left">{entry.label}</span>
            {entry.hint && (
              <span className="pl-6 text-[11px]" style={{ color: tokens.chromeFgDim }}>
                {entry.hint}
              </span>
            )}
            {entry.submenu && (
              <span style={{ color: tokens.chromeFgDim }}>
                <ChevronRightIcon size={12} />
              </span>
            )}
          </>
        );
        const rowClass = 'flex w-full items-center gap-1 px-2 py-[3px] text-[13px]';
        const rowStyle = (hover: boolean) => ({
          color: tokens.chromeFg,
          backgroundColor: hover ? tokens.listActiveBg : 'transparent',
        });
        if (entry.submenu) {
          return (
            <div
              key={i}
              className="relative"
              onMouseEnter={() => setSubOpen(i)}
              onMouseLeave={() => setSubOpen((v) => (v === i ? null : v))}
            >
              <button type="button" className={rowClass} style={rowStyle(subOpen === i)} role="menuitem">
                {inner}
              </button>
              {subOpen === i && (
                <div className="absolute left-full top-[-4px] z-10 pl-0.5" style={{ minWidth: 200 }}>
                  <MenuDropdown entries={entry.submenu} onClose={onClose} depth={depth + 1} />
                </div>
              )}
            </div>
          );
        }
        if (entry.href) {
          const external = entry.href.startsWith('http') || entry.href.startsWith('mailto:');
          return (
            <a
              key={i}
              href={entry.href}
              target={external && !entry.href.startsWith('mailto:') ? '_blank' : undefined}
              rel="noopener noreferrer"
              className={`${rowClass} ide-menu-row`}
              style={rowStyle(false)}
              role="menuitem"
              onClick={onClose}
            >
              {inner}
            </a>
          );
        }
        return (
          <button
            key={i}
            type="button"
            className={`${rowClass} ide-menu-row`}
            style={rowStyle(false)}
            role="menuitem"
            onClick={() => {
              entry.action?.();
              onClose();
            }}
          >
            {inner}
          </button>
        );
      })}
    </div>
  );
}

export function TitleBar() {
  const api = useIde();
  const { tokens, isMobile, isMac } = api;
  const navigate = useNavigate();
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!openMenu) return;
    const onDown = (e: MouseEvent) => {
      if (barRef.current && !barRef.current.contains(e.target as Node)) setOpenMenu(null);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        setOpenMenu(null);
      }
    };
    window.addEventListener('mousedown', onDown);
    window.addEventListener('keydown', onKey, true);
    return () => {
      window.removeEventListener('mousedown', onDown);
      window.removeEventListener('keydown', onKey, true);
    };
  }, [openMenu]);

  const menus = buildMenus(api, navigate);

  const toggleFullscreen = () => {
    try {
      if (document.fullscreenElement) void document.exitFullscreen();
      else void document.documentElement.requestFullscreen();
    } catch (_) {
      /* fullscreen unavailable */
    }
  };

  return (
    <div
      ref={barRef}
      className="relative z-40 flex h-9 shrink-0 items-center px-3"
      style={{
        backgroundColor: tokens.chromeBg,
        borderBottom: `1px solid ${tokens.border}`,
        color: tokens.chromeFg,
      }}
    >
      {/* Traffic lights */}
      <div className="flex items-center gap-2">
        <Link
          to="/"
          aria-label="Close the IDE and return home"
          title="Close (back to home)"
          className="block h-3 w-3 rounded-full transition-transform hover:scale-110"
          style={{ backgroundColor: '#FF5F57' }}
        />
        <button
          type="button"
          aria-label="Toggle the bottom panel"
          title="Minimize (toggle panel)"
          onClick={api.togglePanel}
          className="block h-3 w-3 rounded-full transition-transform hover:scale-110"
          style={{ backgroundColor: '#FEBC2E' }}
        />
        <button
          type="button"
          aria-label="Toggle fullscreen"
          title="Fullscreen"
          onClick={toggleFullscreen}
          className="block h-3 w-3 rounded-full transition-transform hover:scale-110"
          style={{ backgroundColor: '#28C840' }}
        />
      </div>

      {/* Menu bar */}
      {!isMobile && (
        <div className="ml-3 flex items-center">
          {menus.map((menu) => (
            <div key={menu.label} className="relative">
              <button
                type="button"
                className="rounded px-2 py-0.5 text-[13px]"
                style={{
                  color: tokens.chromeFg,
                  backgroundColor: openMenu === menu.label ? tokens.listHoverBg : 'transparent',
                }}
                onClick={() => setOpenMenu((v) => (v === menu.label ? null : menu.label))}
                onMouseEnter={() => {
                  if (openMenu) setOpenMenu(menu.label);
                }}
                aria-haspopup="menu"
                aria-expanded={openMenu === menu.label}
              >
                {menu.label}
              </button>
              {openMenu === menu.label && (
                <div className="absolute left-0 top-full z-50 pt-0.5">
                  <MenuDropdown entries={menu.entries} onClose={() => setOpenMenu(null)} />
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Command center */}
      <div className="pointer-events-none absolute inset-x-0 flex justify-center">
        <button
          type="button"
          onClick={() => api.openPalette()}
          className="pointer-events-auto flex h-[22px] items-center justify-center gap-1.5 rounded-md px-3 text-[12px]"
          style={{
            width: isMobile ? '46vw' : 'min(34vw, 480px)',
            backgroundColor: tokens.inputBg,
            border: `1px solid ${tokens.inputBorder}`,
            color: tokens.chromeFgDim,
          }}
          aria-label={`Search files (${isMac ? 'Cmd' : 'Ctrl'}+P)`}
        >
          <SearchIcon size={12} />
          <span className="truncate">Edusei-Workstation</span>
        </button>
      </div>

      {/* Layout controls */}
      <div className="ml-auto flex items-center gap-1">
        {!isMobile && (
          <>
            <button
              type="button"
              onClick={api.toggleSidebar}
              title="Toggle Primary Side Bar"
              aria-label="Toggle primary side bar"
              className="rounded p-1 ide-chrome-btn"
              style={{ color: api.sidebarOpen ? tokens.chromeFg : tokens.chromeFgDim }}
            >
              <LayoutSidebarIcon size={15} />
            </button>
            <button
              type="button"
              onClick={api.togglePanel}
              title="Toggle Panel"
              aria-label="Toggle panel"
              className="rounded p-1 ide-chrome-btn"
              style={{ color: api.panelOpen ? tokens.chromeFg : tokens.chromeFgDim }}
            >
              <LayoutPanelIcon size={15} />
            </button>
          </>
        )}
        {isMobile && (
          <button
            type="button"
            onClick={() => api.setMobileDrawerOpen(true)}
            aria-label="Open the file explorer"
            className="rounded p-1"
            style={{ color: tokens.chromeFg }}
          >
            <LayoutSidebarIcon size={16} />
          </button>
        )}
      </div>
    </div>
  );
}
