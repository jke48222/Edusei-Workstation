/**
 * @file FloatingDock.tsx
 * @description Fixed bottom navigation for professional view: Experience, Work, Skills, Contact.
 * Scroll-spy highlights the current section; smooth scroll on click. Centered on all viewports.
 */

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

/** Section ids and labels for scroll-spy and anchor links (order matches page). */
const sections = [
  { id: 'experience', label: 'Experience' },
  { id: 'work', label: 'Work' },
  { id: 'skills', label: 'Skills' },
  { id: 'contact', label: 'Contact' },
];

/** Fixed pill nav; visible after scrolling past threshold; active section from scroll position. */
export function FloatingDock() {
  const [active, setActive] = useState('');
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const container = document.querySelector('.pro-scroll');
    if (!container) return;

    const handleScroll = () => {
      const scrollY = container.scrollTop;
      const scrollHeight = container.scrollHeight;
      const clientHeight = container.clientHeight;
      setVisible(scrollY > 400);

      /* Near bottom of page → contact is active */
      if (scrollHeight - clientHeight - scrollY < 80) {
        setActive('contact');
        return;
      }

      /* Otherwise: last section (in document order) whose top is at or above the threshold */
      let current = '';
      for (const s of sections) {
        const el = document.getElementById(s.id);
        if (el) {
          const top = el.getBoundingClientRect().top;
          if (top <= 200) current = s.id;
        }
      }
      setActive(current);
    };

    handleScroll();
    container.addEventListener('scroll', handleScroll, { passive: true });
    return () => container.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <motion.nav
      aria-label="Page navigation"
      initial={{ y: 60, opacity: 0 }}
      animate={visible ? { y: 0, opacity: 1 } : { y: 60, opacity: 0 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className="fixed bottom-0 left-0 right-0 z-50 flex justify-center px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-2 sm:pt-0 sm:bottom-6 sm:top-auto sm:px-4"
    >
      <div
        className="
          flex items-center justify-center gap-0.5 sm:gap-1
          rounded-full border border-[#0a0a0a]/10 bg-white/80
          px-1 sm:px-1.5 py-1 sm:py-1.5 font-mono text-[10px] sm:text-xs
          shadow-xl shadow-black/5 backdrop-blur-xl
          overflow-x-auto no-scrollbar w-fit max-w-[calc(100vw-2rem)]
        "
      >
        {sections.map((s) => (
          <a
            key={s.id}
            href={`#${s.id}`}
            className={`
              relative shrink-0 rounded-full px-3 sm:px-4 py-1.5 sm:py-2 transition-colors duration-200
              ${
                active === s.id
                  ? 'text-white'
                  : 'text-[#0a0a0a]/60 hover:text-[#0a0a0a]'
              }
            `}
            onClick={(e) => {
              e.preventDefault();
              document.getElementById(s.id)?.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            {active === s.id && (
              <motion.span
                layoutId="dock-pill"
                className="absolute inset-0 rounded-full bg-[#0a0a0a]"
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              />
            )}
            <span className="relative z-10">{s.label}</span>
          </a>
        ))}
      </div>
    </motion.nav>
  );
}
