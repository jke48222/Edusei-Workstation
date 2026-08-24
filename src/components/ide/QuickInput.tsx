import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useIde } from './context';
import { DOC_FILES, PDF_FILES, PROJECT_FILES, getFileLang } from './files';
import { projectsData, themeChoices } from './registryData';
import { FileTypeIcon } from './icons';

interface QuickItem {
  label: string;
  detail?: string;
  hint?: string;
  lang?: string;
  checked?: boolean;
  run: () => void;
  /** Theme id for live preview while navigating the theme picker. */
  previewThemeId?: string;
}

export function QuickInput({ initial, onClose }: { initial: string; onClose: () => void }) {
  const api = useIde();
  const { tokens } = api;
  const navigate = useNavigate();
  const [text, setText] = useState(initial);
  const [index, setIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const themeBeforeRef = useRef<string | null>(null);

  useEffect(() => {
    inputRef.current?.focus();
    requestAnimationFrame(() => inputRef.current?.focus());
  }, []);

  const isCommand = text.startsWith('>');
  const isTheme = text.startsWith('>theme ');
  const query = (isTheme ? text.slice(7) : isCommand ? text.slice(1) : text).trim().toLowerCase();

  const items: QuickItem[] = useMemo(() => {
    if (isTheme) {
      return themeChoices().map((t) => ({
        label: t.name,
        checked: api.activeThemeId === t.id,
        previewThemeId: t.id,
        run: () => api.setThemeId(t.id),
      }));
    }
    if (isCommand) {
      const mod = api.isMac ? '⌘' : 'Ctrl+';
      const shiftMod = api.isMac ? '⇧⌘' : 'Ctrl+Shift+';
      return [
        { label: 'Preferences: Color Theme', run: () => setText('>theme ') },
        { label: 'Go to File...', hint: mod + 'P', run: () => setText('') },
        { label: 'View: Toggle Primary Side Bar', hint: mod + 'B', run: () => { api.toggleSidebar(); onClose(); } },
        { label: 'View: Toggle Panel', hint: mod + 'J', run: () => { api.togglePanel(); onClose(); } },
        { label: 'View: Toggle Terminal', hint: '⌃`', run: () => { api.toggleTerminal(); onClose(); } },
        { label: 'View: Command Palette', hint: shiftMod + 'P', run: () => setText('>') },
        { label: 'Terminal: Clear', run: () => { api.runCommand('clear'); onClose(); } },
        { label: 'Terminal: Toggle Sound', run: () => { api.setSoundMuted(!api.soundMuted); onClose(); } },
        ...projectsData.map((p) => ({
          label: `Run: ${PROJECT_FILES[p.id]?.file ?? p.executable}`,
          detail: p.title,
          run: () => { api.openProject(p.id); onClose(); },
        })),
        { label: 'Run: Kitchen Chaos (mini-game)', run: () => { api.openKitchenGame(); onClose(); } },
        { label: 'Open Resume (PDF)', run: () => { window.open('/resume.pdf', '_blank'); onClose(); } },
        { label: 'Open CV (PDF)', run: () => { window.open('/cv.pdf', '_blank'); onClose(); } },
        { label: 'Go: Home', run: () => { onClose(); navigate('/'); } },
        { label: 'Go: Work Archive', run: () => { onClose(); navigate('/work'); } },
        { label: 'Help: Welcome', run: () => { api.openDocTab('welcome'); onClose(); } },
        { label: 'Help: About', run: () => { api.openDocTab('about'); onClose(); } },
        { label: 'Help: Contact', run: () => { api.openDocTab('contact'); onClose(); } },
      ];
    }
    return [
      ...projectsData.map((p) => {
        const meta = PROJECT_FILES[p.id];
        const file = meta?.file ?? p.executable;
        return {
          label: `projects/${file}`,
          detail: p.title,
          lang: meta?.lang ?? 'md',
          run: () => { api.openProject(p.id); onClose(); },
        };
      }),
      ...DOC_FILES.map((d) => ({
        label: d.file,
        lang: d.lang,
        run: () => { api.openDocTab(d.id); onClose(); },
      })),
      ...PDF_FILES.map((d) => ({
        label: d.file,
        detail: 'opens in a new tab',
        lang: getFileLang(d.file),
        run: () => { window.open(d.href, '_blank'); onClose(); },
      })),
    ];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isCommand, isTheme, api.activeThemeId, api.soundMuted, api.isMac]);

  const filtered = useMemo(() => {
    if (!query) return items;
    return items.filter(
      (i) => i.label.toLowerCase().includes(query) || (i.detail ?? '').toLowerCase().includes(query)
    );
  }, [items, query]);

  useEffect(() => {
    setIndex(0);
  }, [text]);

  /* Live theme preview while arrowing through the theme picker. Leaving the
     picker without committing restores the theme that was active before. */
  useEffect(() => {
    if (!isTheme) {
      if (themeBeforeRef.current !== null) {
        api.setThemeId(themeBeforeRef.current);
        themeBeforeRef.current = null;
      }
      return;
    }
    const item = filtered[index];
    if (!item?.previewThemeId) return;
    if (themeBeforeRef.current === null) themeBeforeRef.current = api.activeThemeId;
    api.setThemeId(item.previewThemeId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, isTheme, filtered]);

  const cancel = () => {
    if (themeBeforeRef.current !== null) {
      api.setThemeId(themeBeforeRef.current);
      themeBeforeRef.current = null;
    }
    onClose();
  };
  const cancelRef = useRef(cancel);
  cancelRef.current = cancel;

  /* Escape always dismisses the widget, even if focus wandered elsewhere. */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        e.preventDefault();
        cancelRef.current();
      }
    };
    window.addEventListener('keydown', onKey, true);
    return () => window.removeEventListener('keydown', onKey, true);
  }, []);

  const commit = (item: QuickItem) => {
    themeBeforeRef.current = null;
    item.run();
    if (item.previewThemeId) onClose();
  };

  return (
    <div className="pointer-events-auto absolute inset-x-0 top-0 z-50 flex justify-center" onMouseDown={(e) => {
      if (e.target === e.currentTarget) cancel();
    }}>
      <div
        className="mt-1 w-[560px] max-w-[92vw] overflow-hidden rounded-md"
        style={{
          backgroundColor: tokens.widgetBg,
          border: `1px solid ${tokens.menuBorder}`,
          boxShadow: `0 8px 24px ${tokens.widgetShadow}`,
        }}
      >
        <div className="p-1.5">
          <input
            ref={inputRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Escape') {
                e.preventDefault();
                e.stopPropagation();
                cancel();
                return;
              }
              if (e.key === 'ArrowDown') {
                e.preventDefault();
                setIndex((i) => Math.min(i + 1, filtered.length - 1));
                return;
              }
              if (e.key === 'ArrowUp') {
                e.preventDefault();
                setIndex((i) => Math.max(i - 1, 0));
                return;
              }
              if (e.key === 'Enter' && filtered[index]) {
                e.preventDefault();
                commit(filtered[index]);
              }
            }}
            placeholder={
              isTheme
                ? 'Select Color Theme (Up/Down to preview)'
                : isCommand
                  ? 'Type a command'
                  : `Search files by name (append > to search commands)`
            }
            aria-label="Quick input"
            className="w-full rounded-sm px-2 py-1 text-[13px] outline-none"
            style={{
              backgroundColor: tokens.inputBg,
              border: `1px solid ${tokens.focusBorder}`,
              color: tokens.editorFg,
            }}
          />
        </div>
        <div className="terminal-scroll max-h-[330px] overflow-y-auto pb-1" style={{ '--scrollbar-color': `${tokens.scrollbar}55`, '--scrollbar-color-hover': `${tokens.scrollbar}88` } as React.CSSProperties}>
          {filtered.length === 0 && (
            <p className="px-3 py-2 text-[13px]" style={{ color: tokens.chromeFgDim }}>
              No matching results
            </p>
          )}
          {filtered.map((item, i) => (
            <button
              key={`${item.label}-${i}`}
              type="button"
              onClick={() => commit(item)}
              onMouseEnter={() => setIndex(i)}
              className="flex w-full items-center gap-2 px-3 py-[3px] text-left text-[13px]"
              style={{
                color: i === index ? tokens.listActiveFg : tokens.chromeFg,
                backgroundColor: i === index ? tokens.listActiveBg : 'transparent',
              }}
            >
              {item.lang && <FileTypeIcon lang={item.lang} size={15} />}
              <span className="truncate">{item.label}</span>
              {item.checked && (
                <span className="text-[11px]" style={{ color: tokens.chromeFgDim }}>
                  current
                </span>
              )}
              <span className="ml-auto flex items-center gap-2 pl-3">
                {item.detail && (
                  <span className="truncate text-[11px]" style={{ color: tokens.chromeFgDim }}>
                    {item.detail}
                  </span>
                )}
                {item.hint && (
                  <span className="text-[11px]" style={{ color: tokens.chromeFgDim }}>
                    {item.hint}
                  </span>
                )}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
