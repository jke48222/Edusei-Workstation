/**
 * @file SectionPage.tsx
 * @description Standalone page wrapper for individual portfolio sections. Provides a
 * shared header (nav back to portfolio / work) and footer so sections can be deep-linked
 * as their own routes (/about, /experience, /skills, /certifications, /contact).
 *
 * This is the first step of the multi-page transition: the home route still renders the
 * full single-page ProfessionalView, while these routes expose each section in isolation.
 * The future redesign can promote these to first-class pages with a real nav.
 */

import { useEffect, useLayoutEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Moon, SunMedium, Boxes } from 'lucide-react';
import { profileData } from '../../data';
import { useThemeStore } from '../../store/themeStore';
import { useWorkstationStore } from '../../store/store';
import { PortfolioSearch } from '../PortfolioSearch';
import { Footer } from './ProfessionalView';

/** Navigation entries for the site header. */
const SITE_NAV: { to: string; label: string }[] = [
  { to: '/about', label: 'About' },
  { to: '/experience', label: 'Experience' },
  { to: '/work', label: 'Work' },
  { to: '/skills', label: 'Skills' },
  { to: '/certifications', label: 'Certifications' },
  { to: '/contact', label: 'Contact' },
];

/** Shared, persistent control cluster: search, light/dark, and the 3D workstation toggle. */
function HeaderControls() {
  const portfolioDark = useThemeStore((s) => s.portfolioDark);
  const setPortfolioDark = useThemeStore((s) => s.setPortfolioDark);
  const setViewMode = useWorkstationStore((s) => s.setViewMode);
  const navigate = useNavigate();

  const enterWorkstation = () => {
    setViewMode('immersive');
    navigate('/');
  };

  const btn =
    'flex h-9 w-9 items-center justify-center rounded-full border border-[var(--pf-line)] bg-[var(--pf-bg-elev)] text-[var(--pf-ink-soft)] transition-all hover:border-[var(--pf-accent)] hover:text-[var(--pf-ink)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--pf-accent)]/40';

  return (
    <div className="flex items-center gap-1.5">
      <PortfolioSearch inline />
      <button
        type="button"
        onClick={() => setPortfolioDark(!portfolioDark)}
        aria-label={portfolioDark ? 'Switch to light mode' : 'Switch to dark mode'}
        className={btn}
      >
        {portfolioDark ? <SunMedium className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
      </button>
      <button
        type="button"
        onClick={enterWorkstation}
        aria-label="Enter the 3D workstation"
        className="flex h-9 items-center gap-1.5 rounded-full border border-[var(--pf-line)] bg-[var(--pf-bg-elev)] px-3 text-[11px] font-mono text-[var(--pf-ink-soft)] transition-all hover:border-[var(--pf-accent)] hover:text-[var(--pf-ink)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--pf-accent)]/40"
      >
        <Boxes className="h-4 w-4" />
        <span className="hidden sm:inline">Workstation</span>
      </button>
    </div>
  );
}

export function SiteHeader({ active }: { active?: string }) {
  return (
    <header className="pf sticky top-0 z-30 border-b border-[var(--pf-line)] backdrop-blur-md" style={{ background: 'color-mix(in srgb, var(--pf-bg) 80%, transparent)' }}>
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-3 md:px-12 lg:px-20">
        <Link to="/" className="font-display text-lg font-bold tracking-tight text-[var(--pf-ink)]">
          {profileData.name}
        </Link>
        <nav className="hidden items-center gap-x-4 gap-y-1 md:flex">
          {SITE_NAV.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={`font-mono text-xs transition-colors hover:text-[var(--pf-ink)] ${
                active === item.to ? 'text-[var(--pf-ink)]' : 'text-[var(--pf-ink-faint)]'
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <HeaderControls />
      </div>
    </header>
  );
}

export function SectionPage({
  children,
  title,
  active,
}: {
  children: React.ReactNode;
  title?: string;
  active?: string;
}) {
  const portfolioDark = useThemeStore((s) => s.portfolioDark);
  const containerRef = useRef<HTMLDivElement>(null);

  // Keep the document root in sync with the portfolio's dark-mode preference.
  useLayoutEffect(() => {
    const root = document.documentElement;
    if (portfolioDark) root.classList.add('dark');
    else root.classList.remove('dark');
  }, [portfolioDark]);

  useEffect(() => {
    if (title) document.title = `${title} | ${profileData.name}`;
    return () => {
      document.title = `${profileData.name} | Software Engineer · UGA 2026`;
    };
  }, [title]);

  return (
    <div
      ref={containerRef}
      className={`pro-scroll fixed inset-0 z-40 overflow-y-auto font-sans transition-[background-color,color] duration-300 ease-in-out ${
        portfolioDark ? 'dark bg-[#0d0d0d] text-[#fafafa]' : 'bg-[#fafaf8] text-[#0a0a0a]'
      }`}
      data-portfolio-dark={portfolioDark}
    >
      <SiteHeader active={active} />
      <main>{children}</main>
      <Footer />
    </div>
  );
}
