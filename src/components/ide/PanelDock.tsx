import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useIde } from './context';
import type { PanelTab } from './context';
import { getCompletionSuffix, MAX_HISTORY } from './files';
import { profileData } from './registryData';
import { resumeAudioContext, playKeystroke } from '../../utils/terminalSound';
import { ChevronDownIcon, ChevronUpIcon, CloseIcon, PlusIcon, SplitIcon, TerminalIcon, TrashIcon } from './icons';

const PANEL_TABS: { id: PanelTab; label: string }[] = [
  { id: 'problems', label: 'Problems' },
  { id: 'output', label: 'Output' },
  { id: 'debug', label: 'Debug Console' },
  { id: 'terminal', label: 'Terminal' },
  { id: 'ports', label: 'Ports' },
];

/* ------------------------------------------------------------------ */
/* Terminal                                                            */
/* ------------------------------------------------------------------ */

function TerminalBody() {
  const api = useIde();
  const { tokens } = api;
  const [inputValue, setInputValue] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [caretLeft, setCaretLeft] = useState(0);
  const [inputFocused, setInputFocused] = useState(false);
  const [inputOverflowing, setInputOverflowing] = useState(false);
  const draftRef = useRef('');
  const inputRef = useRef<HTMLInputElement>(null);
  const mirrorRef = useRef<HTMLSpanElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const completionSuggestion = useMemo(() => getCompletionSuffix(inputValue), [inputValue]);
  const completionToShow = useMemo(() => {
    if (!completionSuggestion) return '';
    if (inputValue.endsWith(' ') && completionSuggestion.startsWith(' ')) return completionSuggestion.trimStart();
    return completionSuggestion;
  }, [inputValue, completionSuggestion]);

  useLayoutEffect(() => {
    if (mirrorRef.current) {
      const w = mirrorRef.current.offsetWidth;
      setCaretLeft(w);
      const field = inputRef.current;
      setInputOverflowing(field ? w > field.clientWidth - 8 : false);
    }
  }, [inputValue]);

  useEffect(() => {
    api.registerTerminalFocus(() => inputRef.current?.focus());
    return () => api.registerTerminalFocus(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [api.termLines]);

  const submit = (raw: string) => {
    if (raw.trim()) {
      setHistory((h) => (h[h.length - 1] === raw ? h : [...h.slice(-(MAX_HISTORY - 1)), raw]));
    }
    setHistoryIndex(-1);
    setInputValue('');
    api.runCommand(raw);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Tab' && completionToShow) {
      e.preventDefault();
      setInputValue((prev) => prev + completionToShow);
      return;
    }
    if (e.key === 'ArrowUp') {
      if (history.length === 0) return;
      e.preventDefault();
      if (historyIndex === -1) draftRef.current = inputValue;
      const nextIndex = historyIndex === -1 ? history.length - 1 : Math.max(0, historyIndex - 1);
      setHistoryIndex(nextIndex);
      setInputValue(history[nextIndex] ?? '');
      return;
    }
    if (e.key === 'ArrowDown') {
      if (historyIndex === -1) return;
      e.preventDefault();
      if (historyIndex >= history.length - 1) {
        setHistoryIndex(-1);
        setInputValue(draftRef.current);
      } else {
        const nextIndex = historyIndex + 1;
        setHistoryIndex(nextIndex);
        setInputValue(history[nextIndex] ?? '');
      }
      return;
    }
    if (e.key === 'Enter') {
      submit(inputValue);
      return;
    }
    if (!api.soundMuted && !api.reducedMotion && e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
      resumeAudioContext();
      playKeystroke();
    }
  };

  const promptUser = profileData.name.toLowerCase().split(' ')[0];

  return (
    <div
      className="flex h-full min-h-0 flex-col"
      onClick={(e) => {
        if ((e.target as HTMLElement).closest('button, a, input')) return;
        if (window.matchMedia('(pointer: coarse)').matches) return;
        inputRef.current?.focus();
      }}
    >
      <div
        ref={scrollRef}
        className="terminal-scroll min-h-0 flex-1 cursor-text select-text overflow-y-auto px-3 py-1.5"
        style={{
          WebkitOverflowScrolling: 'touch',
          touchAction: 'pan-y',
          overscrollBehavior: 'contain',
          '--scrollbar-color': `${tokens.scrollbar}55`,
          '--scrollbar-color-hover': `${tokens.scrollbar}88`,
        } as React.CSSProperties}
      >
        {api.termLines.length === 0 && (
          <p className="ide-code-sm" style={{ color: tokens.terminalFgDim }}>
            {promptUser}@portfolio: type 'help' for commands
          </p>
        )}
        <div className="space-y-px">
          {api.termLines.map((line, i) => (
            <div
              key={i}
              className="ide-code-sm whitespace-pre-wrap"
              style={{ color: line.startsWith('$') ? tokens.terminalFg : tokens.terminalFgDim }}
            >
              {line.startsWith('Email: ') ? (
                <>
                  Email:{' '}
                  <a href={`mailto:${profileData.email}`} className="underline" style={{ color: tokens.link }}>
                    {profileData.email}
                  </a>
                </>
              ) : line.startsWith('http://') || line.startsWith('https://') ? (
                <a href={line} target="_blank" rel="noopener noreferrer" className="underline" style={{ color: tokens.link }}>
                  {line}
                </a>
              ) : (
                line || ' '
              )}
            </div>
          ))}
        </div>

        {/* Prompt */}
        <div className="mt-0.5 flex items-center gap-2">
          <span className="ide-code-sm shrink-0">
            <span style={{ color: tokens.terminalPrompt }}>{promptUser}@portfolio</span>
            <span style={{ color: tokens.terminalFgDim }}> $</span>
          </span>
          <div className="relative flex h-[19px] min-w-0 flex-1 items-center">
            <span ref={mirrorRef} className="ide-code-sm invisible absolute left-0 whitespace-pre" aria-hidden>
              {inputValue}
            </span>
            <div className="ide-code-sm pointer-events-none absolute left-0 flex items-center overflow-hidden whitespace-nowrap" aria-hidden>
              {inputValue ? (
                !inputOverflowing && (
                  <>
                    <span style={{ color: tokens.terminalFg }}>{inputValue}</span>
                    <span style={{ color: tokens.terminalFgDim, opacity: 0.5 }}>{completionToShow}</span>
                  </>
                )
              ) : (
                <span style={{ color: tokens.terminalFgDim, opacity: 0.55 }}>open animaldot.cpp</span>
              )}
            </div>
            {inputFocused && !inputOverflowing && (
              <span
                className="terminal-caret pointer-events-none absolute top-1/2 h-[15px] w-[7px] -translate-y-1/2"
                style={{ left: caretLeft, backgroundColor: tokens.terminalFg, opacity: 0.8 }}
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
              className="ide-code-sm terminal-input absolute inset-0 z-10 w-full cursor-text bg-transparent outline-none"
              style={{
                color: inputOverflowing ? tokens.terminalFg : 'transparent',
                caretColor: inputOverflowing ? tokens.terminalFg : 'transparent',
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Static bodies                                                       */
/* ------------------------------------------------------------------ */

function ProblemsBody() {
  const { tokens } = useIde();
  return (
    <p className="px-4 py-2 text-[13px]" style={{ color: tokens.chromeFgDim }}>
      No problems have been detected in the workspace.
    </p>
  );
}

function OutputBody() {
  const api = useIde();
  const { tokens } = api;
  const scrollRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [api.outputLines]);
  return (
    <div
      ref={scrollRef}
      className="terminal-scroll h-full cursor-text select-text overflow-y-auto px-3 py-1.5"
      style={{ '--scrollbar-color': `${tokens.scrollbar}55`, '--scrollbar-color-hover': `${tokens.scrollbar}88` } as React.CSSProperties}
    >
      {api.outputLines.map((line, i) => (
        <div key={i} className="ide-code-sm whitespace-pre-wrap" style={{ color: tokens.terminalFgDim }}>
          {line || ' '}
        </div>
      ))}
    </div>
  );
}

function DebugBody() {
  const { tokens } = useIde();
  return (
    <p className="px-4 py-2 text-[13px] italic" style={{ color: tokens.chromeFgDim }}>
      Nothing is being debugged. Run a project file from the Run and Debug view.
    </p>
  );
}

function PortsBody() {
  const { tokens } = useIde();
  const cell = 'px-4 py-1 text-left text-[12px]';
  return (
    <table className="mt-1 w-full border-collapse">
      <thead>
        <tr style={{ color: tokens.chromeFgDim }}>
          <th className={`${cell} font-normal uppercase tracking-wide text-[10px]`}>Port</th>
          <th className={`${cell} font-normal uppercase tracking-wide text-[10px]`}>Forwarded Address</th>
          <th className={`${cell} font-normal uppercase tracking-wide text-[10px]`}>Origin</th>
        </tr>
      </thead>
      <tbody style={{ color: tokens.chromeFg }}>
        <tr>
          <td className={cell}>443</td>
          <td className={cell}>
            <a href="https://www.jalenedusei.com" target="_blank" rel="noopener noreferrer" className="underline" style={{ color: tokens.link }}>
              jalenedusei.com
            </a>
          </td>
          <td className={cell} style={{ color: tokens.chromeFgDim }}>
            Vercel edge
          </td>
        </tr>
      </tbody>
    </table>
  );
}

/* ------------------------------------------------------------------ */
/* Panel shell                                                         */
/* ------------------------------------------------------------------ */

export function PanelDock() {
  const api = useIde();
  const { tokens } = api;

  if (!api.panelOpen) return null;

  return (
    <div
      className="pointer-events-auto flex shrink-0 flex-col"
      style={{
        height: api.isMobile ? '34vh' : 'clamp(160px, 26vh, 300px)',
        backgroundColor: tokens.chromeBg,
        borderTop: `1px solid ${tokens.border}`,
      }}
    >
      {/* Header */}
      <div className="flex h-[35px] shrink-0 items-center pl-3 pr-1.5">
        <div className="no-scrollbar flex min-w-0 flex-1 items-center gap-1 overflow-x-auto">
          {PANEL_TABS.map((t) => {
            const active = api.panelTab === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => api.setPanelTab(t.id)}
                className="relative shrink-0 px-2 py-1 text-[11px] uppercase tracking-wide"
                style={{ color: active ? tokens.chromeFg : tokens.chromeFgDim }}
              >
                {t.label}
                {active && (
                  <span className="absolute inset-x-2 -bottom-px h-px" style={{ backgroundColor: tokens.accent }} />
                )}
              </button>
            );
          })}
        </div>
        <div className="flex shrink-0 items-center gap-0.5" style={{ color: tokens.chromeFgDim }}>
          {api.panelTab === 'terminal' && (
            <>
              <span className="hidden items-center gap-1 px-1 text-[12px] sm:flex">
                <TerminalIcon size={13} />
                zsh
              </span>
              <button type="button" className="ide-chrome-btn rounded p-1" title="New Terminal" aria-label="New terminal" onClick={api.focusTerminal}>
                <PlusIcon size={13} />
              </button>
              <span className="hidden p-1 sm:block" title="Split Terminal">
                <SplitIcon size={13} />
              </span>
              <button
                type="button"
                className="ide-chrome-btn rounded p-1"
                title="Clear Terminal"
                aria-label="Clear terminal"
                onClick={() => api.runCommand('clear')}
              >
                <TrashIcon size={13} />
              </button>
              <button
                type="button"
                className="ide-chrome-btn rounded p-1"
                title={api.soundMuted ? 'Sound: off' : 'Sound: on'}
                aria-label={api.soundMuted ? 'Enable terminal sound' : 'Mute terminal sound'}
                onClick={() => api.setSoundMuted(!api.soundMuted)}
                style={{ color: api.soundMuted ? tokens.chromeFgDim : tokens.chromeFg }}
              >
                <span className="block text-[10px] leading-3">{api.soundMuted ? 'muted' : 'sound'}</span>
              </button>
            </>
          )}
          <button type="button" className="ide-chrome-btn rounded p-1" title="Maximize Panel Size" aria-label="Maximize panel" onClick={() => {}}>
            <ChevronUpIcon size={13} />
          </button>
          <button type="button" className="ide-chrome-btn rounded p-1" title="Hide Panel" aria-label="Hide panel" onClick={() => api.setPanelOpen(false)}>
            <ChevronDownIcon size={13} />
          </button>
          <button type="button" className="ide-chrome-btn rounded p-1" title="Close Panel" aria-label="Close panel" onClick={() => api.setPanelOpen(false)}>
            <CloseIcon size={13} />
          </button>
        </div>
      </div>

      {/* Body: the terminal stays mounted so its buffer and input survive tab switches */}
      <div className="min-h-0 flex-1" style={{ backgroundColor: tokens.editorBg }}>
        <div className="h-full" style={{ display: api.panelTab === 'terminal' ? 'block' : 'none' }}>
          <TerminalBody />
        </div>
        {api.panelTab === 'problems' && <ProblemsBody />}
        {api.panelTab === 'output' && <OutputBody />}
        {api.panelTab === 'debug' && <DebugBody />}
        {api.panelTab === 'ports' && <PortsBody />}
      </div>
    </div>
  );
}
