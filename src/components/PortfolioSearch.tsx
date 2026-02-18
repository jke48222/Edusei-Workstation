/**
 * @file PortfolioSearch.tsx
 * @description Search overlay for professional view: jump to sections or projects by name.
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { projectsData } from '../data';

type SearchItem = { id: string; label: string; subtitle?: string };

const SECTIONS: SearchItem[] = [
  { id: 'about', label: 'About' },
  { id: 'timeline', label: 'Timeline' },
  { id: 'experience', label: 'Experience' },
  { id: 'work', label: 'Selected Work' },
  { id: 'skills', label: 'Toolkit' },
  { id: 'contact', label: 'Contact' },
];

function getProjectItems(): SearchItem[] {
  return projectsData.map((p) => ({
    id: `card-${p.id}`,
    label: p.title,
    subtitle: p.tagline,
  }));
}

const ALL_ITEMS: SearchItem[] = [...SECTIONS, ...getProjectItems()];

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.35-4.35" />
    </svg>
  );
}

export function PortfolioSearch() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const filtered = query.trim()
    ? ALL_ITEMS.filter((item) => {
        const q = query.toLowerCase();
        const matchLabel = item.label.toLowerCase().includes(q);
        const matchSub = item.subtitle?.toLowerCase().includes(q);
        return matchLabel || matchSub;
      })
    : ALL_ITEMS;

  const scrollTo = useCallback((id: string) => {
    const el = document.getElementById(id);
    if (el) {
      const scrollContainer = document.querySelector('.pro-scroll');
      if (scrollContainer) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
    setOpen(false);
    setQuery('');
  }, []);

  useEffect(() => {
    if (open) {
      inputRef.current?.focus();
      setQuery('');
    }
  }, [open]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (!open) return;
      if (e.key === 'Escape') {
        setOpen(false);
        setQuery('');
      }
      if (e.key === 'Enter' && filtered[0]) {
        e.preventDefault();
        scrollTo(filtered[0].id);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, filtered, scrollTo]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Search portfolio"
        className="fixed top-3 right-14 z-[110] flex h-9 w-9 items-center justify-center rounded-full border-2 border-[#0a0a0a]/20 bg-white text-[#0a0a0a]/80 shadow-lg backdrop-blur-xl transition-all hover:border-[#0a0a0a]/40 hover:bg-[#f0f0f0] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0a0a0a]/30 dark:border-white/20 dark:bg-[#262626] dark:text-white/90 dark:hover:border-white/40 dark:hover:bg-[#333] sm:right-[10.8rem]"
      >
        <SearchIcon className="h-4 w-4" />
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[120] flex items-start justify-center bg-black/40 pt-[20vh] px-4"
          onClick={() => setOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-label="Search"
        >
          <div
            className="w-full max-w-md rounded-2xl border border-[#0a0a0a]/10 bg-[#fafaf8] shadow-2xl dark:border-[#333333] dark:bg-[#1a1a1a]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-2 border-b border-[#0a0a0a]/10 px-4 py-3 dark:border-[#333333]">
              <SearchIcon className="h-4 w-4 shrink-0 text-[#0a0a0a]/50 dark:text-white/50" />
              <input
                ref={inputRef}
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search sections & projects..."
                className="flex-1 bg-transparent text-[#0a0a0a] placeholder-[#0a0a0a]/40 dark:text-[#fafafa] dark:placeholder-white/40 focus:outline-none"
                autoComplete="off"
              />
            </div>
            <ul className="search-modal-scroll max-h-[60vh] overflow-y-auto py-2">
              {filtered.length === 0 ? (
                <li className="px-4 py-6 text-center text-sm text-[#0a0a0a]/50 dark:text-white/50">No matches</li>
              ) : (
                filtered.map((item) => (
                  <li key={item.id}>
                    <button
                      type="button"
                      onClick={() => scrollTo(item.id)}
                      className="flex w-full flex-col items-start gap-0.5 px-4 py-2.5 text-left transition-colors hover:bg-[#0a0a0a]/5 dark:hover:bg-white/10"
                    >
                      <span className="font-medium text-[#0a0a0a] dark:text-[#fafafa]">{item.label}</span>
                      {item.subtitle && (
                        <span className="text-xs text-[#0a0a0a]/50 dark:text-white/50 line-clamp-1">{item.subtitle}</span>
                      )}
                    </button>
                  </li>
                ))
              )}
            </ul>
          </div>
        </div>
      )}
    </>
  );
}
