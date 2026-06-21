import { Award, Users } from "lucide-react";
import { site } from "../../content/site";
import { honors, leadership } from "../../../data";
import { EyebrowPill, Reveal } from "../ui";

/** Earliest start → latest end (or Present) across a set of periods. */
function span(periods: string[]): string {
  const years = periods.flatMap((p) => (p.match(/\d{4}/g) ?? []).map(Number));
  const present = periods.some((p) => /present/i.test(p));
  if (!years.length) return "";
  const start = Math.min(...years);
  const end = present ? "Present" : Math.max(...years);
  return start === end ? `${start}` : `${start}–${end}`;
}

type Org = { organization: string; span: string; roles: { role: string; period: string }[] };

function groupByOrg(items: typeof leadership): Org[] {
  const map = new Map<string, { role: string; period: string }[]>();
  for (const it of items) {
    if (!map.has(it.organization)) map.set(it.organization, []);
    map.get(it.organization)!.push({ role: it.role, period: it.period });
  }
  return Array.from(map.entries()).map(([organization, roles]) => ({
    organization,
    roles,
    span: span(roles.map((r) => r.period)),
  }));
}

export default function Recognition() {
  const { recognition: s } = site;
  const orgs = groupByOrg(leadership);
  return (
    <section id="recognition" className="relative z-10 py-20 md:py-28">
      <div className="mx-auto max-w-container px-5 md:px-8">
        <Reveal className="mb-12">
          <EyebrowPill className="mb-6">{s.eyebrow}</EyebrowPill>
          <h2 className="over-video max-w-[22ch] font-display text-[34px] leading-[1.02] md:text-[52px]">
            {s.title[0]} <span className="italic-accent">{s.title[1]}</span>
          </h2>
        </Reveal>

        <div className="grid gap-8 lg:grid-cols-[1fr_1.25fr]">
          {/* Honors */}
          <Reveal>
            <h3 className="over-video mb-5 inline-flex items-center gap-2 font-display text-[18px] tracking-[-0.03em] text-white">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-ink"><Award className="h-4 w-4" /></span>
              Honors & Awards
            </h3>
            <div className="space-y-3">
              {honors.map((h) => (
                <div key={h.title} className="glass-strong rounded-2xl p-5">
                  <p className="font-display text-[16px] tracking-[-0.02em] text-ink">{h.title}</p>
                  <p className="mt-1 text-[13px] text-ink-dim">{h.org} · <span className="font-mono text-[11px] text-ink-mute">{h.date}</span></p>
                </div>
              ))}
            </div>
          </Reveal>

          {/* Leadership */}
          <Reveal delay={120}>
            <h3 className="over-video mb-5 inline-flex items-center gap-2 font-display text-[18px] tracking-[-0.03em] text-white">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-ink"><Users className="h-4 w-4" /></span>
              Leadership & Service
            </h3>
            <div className="grid gap-3 sm:grid-cols-2">
              {orgs.map((org) => (
                <div key={org.organization} className="glass-strong flex flex-col rounded-2xl p-5">
                  <p className="font-display text-[15px] leading-snug tracking-[-0.02em] text-ink">{org.organization}</p>
                  <p className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.14em] text-ink-mute">{org.span}</p>
                  <ul className="mt-3 space-y-1.5">
                    {org.roles.map((r) => (
                      <li key={r.role + r.period} className="flex items-baseline justify-between gap-3 text-[13px]">
                        <span className="text-ink-dim">{r.role}</span>
                        <span className="shrink-0 font-mono text-[10px] text-ink-mute">{r.period}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
