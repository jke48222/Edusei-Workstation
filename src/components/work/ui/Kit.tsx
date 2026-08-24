/**
 * @file Kit.tsx
 * @description Shared redesign UI kit — section headings, magnetic buttons, pills,
 * and category/skill icon maps. Built on framer-motion + lucide-react. Used across the
 * home page, /work, and project detail pages for a consistent characterful system.
 */

import { useRef, type ReactNode, type MouseEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useMotionValue, useSpring, useInView } from 'framer-motion';
import {
  Cpu, Headset, Brain,
  Radio, Globe, FlaskConical, type LucideIcon,
} from 'lucide-react';
import type { ProjectCategory } from '../../../data';

/* -------------------------------------------------------------------------- */
/* Icon maps                                                                   */
/* -------------------------------------------------------------------------- */

export const CATEGORY_ICON: Record<ProjectCategory, LucideIcon> = {
  web: Globe,
  embedded: Cpu,
  hardware: Radio,
  vr: Headset,
  research: FlaskConical,
  ai: Brain,
};

export const CATEGORY_LABEL: Record<ProjectCategory, string> = {
  web: 'Web & Product',
  embedded: 'Embedded',
  hardware: 'Hardware',
  vr: 'XR & Games',
  research: 'Research',
  ai: 'AI Application',
};

/* -------------------------------------------------------------------------- */
/* Section heading — eyebrow + kinetic title + optional action                  */
/* -------------------------------------------------------------------------- */

const titleStagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.05, delayChildren: 0.05 } },
};
const wordRise = {
  hidden: { y: '110%', opacity: 0 },
  visible: { y: '0%', opacity: 1, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
};

export function SectionHeading({
  eyebrow,
  title,
  icon: Icon,
  sub,
  action,
  align = 'left',
  id,
}: {
  eyebrow: string;
  title: string;
  icon?: LucideIcon;
  sub?: string;
  action?: ReactNode;
  align?: 'left' | 'center';
  id?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  const words = title.split(' ');
  return (
    <div
      ref={ref}
      id={id}
      className={`mb-10 flex flex-col gap-4 ${align === 'center' ? 'items-center text-center' : ''} ${
        action ? 'md:flex-row md:items-end md:justify-between' : ''
      }`}
    >
      <div className={align === 'center' ? 'flex flex-col items-center' : ''}>
        <div className="mb-3 inline-flex items-center gap-2 text-[var(--pf-accent-deep)] dark:text-[var(--pf-accent-bright)]">
          {Icon && <Icon className="h-4 w-4" strokeWidth={2} />}
          <span className="font-mono text-[11px] uppercase tracking-[0.32em]">{eyebrow}</span>
        </div>
        <motion.h2
          variants={titleStagger}
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
          className="font-display text-4xl font-extrabold leading-[0.95] tracking-tight text-[var(--pf-ink)] md:text-6xl"
        >
          {words.map((w, i) => (
            <span key={i} className="mr-[0.28em] inline-block overflow-hidden align-bottom">
              <motion.span variants={wordRise} className="inline-block">
                {w}
              </motion.span>
            </span>
          ))}
        </motion.h2>
        {sub && (
          <p className={`mt-4 max-w-xl text-[15px] leading-relaxed text-[var(--pf-ink-soft)] ${align === 'center' ? 'mx-auto' : ''}`}>
            {sub}
          </p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Magnetic button — pointer-following CTA                                      */
/* -------------------------------------------------------------------------- */

export function MagneticButton({
  children,
  href,
  onClick,
  variant = 'solid',
  external,
  className = '',
}: {
  children: ReactNode;
  href?: string;
  onClick?: () => void;
  variant?: 'solid' | 'outline' | 'ghost';
  external?: boolean;
  className?: string;
}) {
  const ref = useRef<HTMLAnchorElement>(null);
  const navigate = useNavigate();
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const x = useSpring(mx, { stiffness: 280, damping: 18 });
  const y = useSpring(my, { stiffness: 280, damping: 18 });

  function handleMove(e: MouseEvent) {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    mx.set((e.clientX - (r.left + r.width / 2)) * 0.25);
    my.set((e.clientY - (r.top + r.height / 2)) * 0.35);
  }
  function reset() {
    mx.set(0);
    my.set(0);
  }

  const base =
    'group relative inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-medium transition-colors';
  const styles = {
    solid:
      'bg-[var(--pf-ink)] text-[var(--pf-bg)] hover:bg-[var(--pf-accent-deep)] dark:hover:bg-[var(--pf-accent)] dark:hover:text-[var(--pf-on-accent)]',
    outline:
      'border border-[var(--pf-line)] text-[var(--pf-ink)] hover:border-[var(--pf-accent)] hover:text-[var(--pf-accent-deep)] dark:hover:text-[var(--pf-accent-bright)]',
    ghost: 'text-[var(--pf-ink-soft)] hover:text-[var(--pf-ink)]',
  }[variant];

  return (
    <motion.a
      ref={ref}
      href={href}
      onClick={(e) => {
        onClick?.();
        // Internal routes go through the SPA router — a raw <a href> would trigger
        // a full page reload. Modified clicks (new tab, etc.) keep native behavior.
        if (
          href?.startsWith('/') &&
          !external &&
          e.button === 0 &&
          !e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey
        ) {
          e.preventDefault();
          navigate(href);
        }
      }}
      onMouseMove={handleMove}
      onMouseLeave={reset}
      style={{ x, y }}
      target={external ? '_blank' : undefined}
      rel={external ? 'noopener noreferrer' : undefined}
      className={`${base} ${styles} ${className}`}
    >
      {children}
    </motion.a>
  );
}

/* -------------------------------------------------------------------------- */
/* Reveal wrapper — fade/rise on scroll into view                              */
/* -------------------------------------------------------------------------- */

export function Reveal({
  children,
  delay = 0,
  className = '',
  y = 28,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
  y?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
