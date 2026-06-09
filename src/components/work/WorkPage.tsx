/**
 * @file WorkPage.tsx
 * @description Full project index at /work. Redesigned with the `.pf` design system:
 * shared site header, category filter chips, and the interactive ProjectTile grid.
 */

import { useMemo, useState } from 'react';
import { useLayoutEffect } from 'react';
import { motion } from 'framer-motion';
import { getAllProjectsForWork, type ProjectCategory } from '../../data';
import { useThemeStore } from '../../store/themeStore';
import { SiteHeader } from '../professional/SectionPage';
import { Footer } from '../professional/ProfessionalView';
import { ProjectTile } from '../professional/ui/ProjectTile';
import { SectionHeading, CATEGORY_LABEL, CATEGORY_ICON } from '../professional/ui/Kit';
import { Boxes, LayoutGrid } from 'lucide-react';

const ALL = 'all' as const;

export function WorkPage() {
  const portfolioDark = useThemeStore((s) => s.portfolioDark);
  const projects = useMemo(() => getAllProjectsForWork(), []);
  const [filter, setFilter] = useState<ProjectCategory | typeof ALL>(ALL);

  useLayoutEffect(() => {
    const root = document.documentElement;
    if (portfolioDark) root.classList.add('dark');
    else root.classList.remove('dark');
  }, [portfolioDark]);

  // Categories present in the data, in a stable display order.
  const categories = useMemo(() => {
    const order: ProjectCategory[] = ['web', 'ai', 'embedded', 'hardware', 'vr', 'research'];
    const present = new Set(projects.map((p) => p.category).filter(Boolean) as ProjectCategory[]);
    return order.filter((c) => present.has(c));
  }, [projects]);

  const visible = filter === ALL ? projects : projects.filter((p) => p.category === filter);

  return (
    <div
      className={`pro-scroll pf fixed inset-0 z-40 overflow-y-auto font-sans ${portfolioDark ? 'dark' : ''}`}
      style={{ background: 'var(--pf-bg)', color: 'var(--pf-ink)' }}
    >
      <SiteHeader active="/work" />
      <main className="mx-auto max-w-7xl px-6 py-16 md:px-12 lg:px-20">
        <SectionHeading
          eyebrow="Archive"
          title="All the work."
          icon={Boxes}
          sub={`${projects.length} projects across web, AI, embedded, hardware, VR, and research.`}
        />

        {/* Category filter chips */}
        <div className="mb-10 flex flex-wrap gap-2">
          <FilterChip active={filter === ALL} onClick={() => setFilter(ALL)} label="All" icon={LayoutGrid} count={projects.length} />
          {categories.map((c) => (
            <FilterChip
              key={c}
              active={filter === c}
              onClick={() => setFilter(c)}
              label={CATEGORY_LABEL[c]}
              icon={CATEGORY_ICON[c]}
              count={projects.filter((p) => p.category === c).length}
            />
          ))}
        </div>

        <motion.div layout className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((project, i) => (
            <ProjectTile key={project.id} project={project} index={i} />
          ))}
        </motion.div>
      </main>
      <Footer />
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  label,
  icon: Icon,
  count,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  icon: typeof Boxes;
  count: number;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-all ${
        active
          ? 'border-transparent bg-[var(--pf-ink)] text-[var(--pf-bg)]'
          : 'border-[var(--pf-line)] text-[var(--pf-ink-soft)] hover:border-[var(--pf-accent)]/50 hover:text-[var(--pf-ink)]'
      }`}
    >
      <Icon className="h-4 w-4" />
      {label}
      <span className={`font-mono text-[10px] ${active ? 'text-[var(--pf-bg)]/60' : 'text-[var(--pf-ink-faint)]'}`}>{count}</span>
    </button>
  );
}
