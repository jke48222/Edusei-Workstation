/**
 * Company / organization logos (monochrome black-on-transparent, in /public/logos),
 * keyed by the exact company / org / certification name from data.ts. Falls back to a
 * monogram badge when no logo exists.
 */
const LOGO_FILE: Record<string, string> = {
  // Experience
  "Capital One": "capitalone",
  "University of Georgia Housing": "uga-housing",
  "Joyner Research Laboratory": "uga-research",
  "Great American Cookies & Marble Slab Creamery": "great-american-cookies",
  // Leadership & service
  "National Society of Black Engineers (NSBE)": "nsbe",
  "Tau Beta Pi Honor Society": "tau-beta-pi",
  "Theta Tau Fraternity, Iota Epsilon Chapter": "theta-tau",
  "UGA STEM Academic Success Program": "student-success",
  "Office of Engagement, Leadership, and Service": "uga-els",
  // Certifications (keyed by title)
  "Emerging Engineering Leadership Development (EELD) Program": "eeld",
  "CITI Program: SBE Foundations, Human Subjects Research": "citi",
};

export function orgLogoSrc(name: string): string | undefined {
  return LOGO_FILE[name] ? `/logos/${LOGO_FILE[name]}.png` : undefined;
}

function monogram(name: string): string {
  return name
    .split(/\s+/)
    .filter((w) => /^[A-Za-z]/.test(w))
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

/** Square badge: the org's monochrome logo, or a monogram when none exists. */
export function OrgLogo({ name, size = "h-11 w-11" }: { name: string; size?: string }) {
  const src = orgLogoSrc(name);
  if (src) {
    return (
      <span className={`flex ${size} shrink-0 items-center justify-center overflow-hidden rounded-xl border border-[var(--line)] bg-bg-elev p-1.5`}>
        <img src={src} alt="" aria-hidden loading="lazy" className="max-h-full max-w-full object-contain" />
      </span>
    );
  }
  return (
    <span className={`flex ${size} shrink-0 items-center justify-center rounded-xl bg-ink font-display text-[13px] font-semibold tracking-tight text-white`}>
      {monogram(name)}
    </span>
  );
}
