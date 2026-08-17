import { useState } from "react";
import { Link } from "react-router-dom";
import { site } from "../content/site";
import { BtnPrimary } from "./ui";
import LandingSearch from "./LandingSearch";

export default function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <div className="mx-auto flex max-w-container items-center justify-between px-5 py-3.5 md:px-8">
        {/* Left: search + wordmark */}
        <div className="flex items-center gap-2.5 text-ink">
          <LandingSearch />
          <a href="#top" className="over-video hidden flex-col leading-none sm:flex">
            <span className="font-display text-[17px] tracking-[-0.04em]">{site.name}</span>
            <span className="font-display text-[9px] tracking-[0.18em] opacity-70">{site.role}</span>
          </a>
        </div>

        {/* Center nav pill */}
        <nav className="hidden items-center gap-1 rounded-full border border-[var(--line)] bg-white/55 px-1.5 py-1.5 backdrop-blur lg:flex">
          {site.nav.map((n) => (
            <a
              key={n.href}
              href={n.href}
              className="rounded-full px-3.5 py-1.5 font-display text-[13px] tracking-[-0.04em] text-ink-dim transition-colors hover:bg-black/5 hover:text-ink"
            >
              {n.label}
            </a>
          ))}
          <span className="mx-1 h-4 w-px bg-black/10" aria-hidden />
          <Link
            to="/workstation"
            className="rounded-full px-3.5 py-1.5 font-display text-[13px] tracking-[-0.04em] text-ink-dim transition-colors hover:bg-black/5 hover:text-ink"
          >
            Workstation
          </Link>
        </nav>

        {/* Right */}
        <div className="flex items-center gap-2">
          <div className="hidden md:block">
            <BtnPrimary href={site.socials.resume} match target="_blank">
              Résumé
            </BtnPrimary>
          </div>
          <button
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            aria-controls="landing-mobile-menu"
            onClick={() => setOpen((v) => !v)}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--line)] bg-white/60 text-ink backdrop-blur lg:hidden"
          >
            <span className="flex flex-col gap-[5px]">
              <span className="block h-[1.5px] w-4 bg-ink" />
              <span className="block h-[1.5px] w-4 bg-ink" />
            </span>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div id="landing-mobile-menu" className="glass-strong mx-4 rounded-2xl p-4 lg:hidden">
          <nav className="flex flex-col">
            {site.nav.map((n) => (
              <a
                key={n.href}
                href={n.href}
                onClick={() => setOpen(false)}
                className="border-b border-[var(--line)] py-3 font-display text-[15px] tracking-[-0.03em] text-ink"
              >
                {n.label}
              </a>
            ))}
            <Link
              to="/workstation"
              onClick={() => setOpen(false)}
              className="py-3 font-display text-[15px] tracking-[-0.03em] text-ink"
            >
              Workstation
            </Link>
            <a
              href={site.socials.resume}
              target="_blank"
              rel="noreferrer"
              className="mt-3 inline-flex justify-center rounded-xl bg-ink py-3 font-display text-[13px] text-white"
            >
              Download résumé
            </a>
          </nav>
        </div>
      )}
    </header>
  );
}
