/**
 * @file WorkPage.tsx
 * @description Full project index at /work. Bone/ink themed to match the home page:
 * light header, category filter chips, and the interactive ProjectTile grid (re-skinned
 * monochrome via the `.work-theme` palette remap in index.css).
 */

import { useEffect, useLayoutEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { getAllProjectsForWork, type ProjectCategory } from '../../data';
import { ProjectTile } from './ui/ProjectTile';
import { SectionHeading, CATEGORY_LABEL, CATEGORY_ICON } from './ui/Kit';
import { Boxes, LayoutGrid } from 'lucide-react';
import { WorkHeader } from './WorkHeader';
import Footer from '../../landing/components/sections/Footer';

const ALL = 'all' as const;

export function WorkPage() {
  const projects = useMemo(() => getAllProjectsForWork(), []);
  const [filter, setFilter] = useState<ProjectCategory | typeof ALL>(ALL);

  // These pages are always light bone — clear any inherited portfolio dark class.
  useLayoutEffect(() => {
    document.documentElement.classList.remove('dark');
  }, []);

  useEffect(() => {
    const prev = document.title;
    document.title = 'Work | Jalen Edusei';
    return () => { document.title = prev; };
  }, []);

  const categories = useMemo(() => {
    const order: ProjectCategory[] = ['web', 'ai', 'embedded', 'hardware', 'vr', 'research'];
    const present = new Set(projects.map((p) => p.category).filter(Boolean) as ProjectCategory[]);
    return order.filter((c) => present.has(c));
  }, [projects]);

  const visible = filter === ALL ? projects : projects.filter((p) => p.category === filter);

  return (
    <div className="landing work-theme work-page-scroll fixed inset-0 z-40 overflow-y-auto">
      <WorkHeader active="work" />
      <main className="mx-auto max-w-container px-5 py-16 md:px-8 lg:py-20">
        <SectionHeading
          eyebrow="Archive"
          title="All the work."
          icon={Boxes}
          sub={`${projects.length} projects across web, AI, embedded, hardware, VR, and research.`}
        />

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
  active, onClick, label, icon: Icon, count,
}: {
  active: boolean; onClick: () => void; label: string; icon: typeof Boxes; count: number;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-all ${
        active
          ? 'border-transparent bg-[var(--pf-ink)] text-[var(--pf-bg)]'
          : 'border-[var(--pf-line)] text-[var(--pf-ink-soft)] hover:border-[var(--pf-ink)]/40 hover:text-[var(--pf-ink)]'
      }`}
    >
      <Icon className="h-4 w-4" />
      {label}
      <span className={`font-mono text-[10px] ${active ? 'text-[var(--pf-bg)]/60' : 'text-[var(--pf-ink-faint)]'}`}>{count}</span>
    </button>
  );
}
