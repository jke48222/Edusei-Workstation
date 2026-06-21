import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { BtnPrimary } from '../../landing/components/ui';

/**
 * Light, bone-themed header for /work and /work/:id, matching the home page's
 * DM Sans + ink design system (the 3D workstation keeps its own theme).
 */
export function WorkHeader({ active }: { active?: 'work' }) {
  return (
    <header
      className="sticky top-0 z-30 border-b border-[var(--line)] backdrop-blur-md"
      style={{ background: 'color-mix(in srgb, var(--bg) 82%, transparent)' }}
    >
      <div className="mx-auto flex max-w-container items-center justify-between gap-4 px-5 py-3.5 md:px-8">
        <Link to="/" className="inline-flex items-center gap-2 font-display text-[17px] tracking-[-0.04em] text-ink">
          <ArrowLeft className="h-4 w-4 text-ink-mute" />
          Jalen Edusei
        </Link>
        <nav className="flex items-center gap-1 sm:gap-2">
          <Link
            to="/work"
            className={`rounded-full px-3.5 py-1.5 font-display text-[13px] tracking-[-0.03em] transition-colors hover:bg-black/5 hover:text-ink ${
              active === 'work' ? 'text-ink' : 'text-ink-dim'
            }`}
          >
            Work
          </Link>
          <Link
            to="/workstation"
            className="rounded-full px-3.5 py-1.5 font-display text-[13px] tracking-[-0.03em] text-ink-dim transition-colors hover:bg-black/5 hover:text-ink"
          >
            Workstation
          </Link>
          <span className="ml-1 hidden sm:block">
            <BtnPrimary href="/resume.pdf" target="_blank">Résumé</BtnPrimary>
          </span>
        </nav>
      </div>
    </header>
  );
}
