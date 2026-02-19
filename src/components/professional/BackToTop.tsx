/**
 * @file BackToTop.tsx
 * @description Back-to-top button for portfolio scroll view. Appears after scrolling past the hero.
 */

import { motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';

const SCROLL_THRESHOLD = 500;

function ChevronUpIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="m18 15-6-6-6 6" />
    </svg>
  );
}

export function BackToTop() {
  const [visible, setVisible] = useState(false);
  const rafRef = useRef<number | null>(null);
  const tickingRef = useRef(false);

  useEffect(() => {
    const container = document.querySelector('.pro-scroll');
    if (!container) return;

    const updateFromScroll = () => {
      tickingRef.current = false;
      setVisible(container.scrollTop > SCROLL_THRESHOLD);
    };

    const handleScroll = () => {
      if (tickingRef.current) return;
      tickingRef.current = true;
      rafRef.current = requestAnimationFrame(updateFromScroll);
    };

    updateFromScroll();
    container.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      container.removeEventListener('scroll', handleScroll);
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const scrollToTop = () => {
    document.querySelector('.pro-scroll')?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <motion.button
      type="button"
      onClick={scrollToTop}
      aria-label="Back to top"
      initial={{ y: 16, opacity: 0 }}
      animate={visible ? { y: 0, opacity: 1 } : { y: 16, opacity: 0 }}
      transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
      className="fixed bottom-24 right-4 z-50 flex h-10 w-10 items-center justify-center rounded-full border border-[#0a0a0a]/10 bg-white/80 shadow-lg backdrop-blur-xl transition-colors hover:bg-[#0a0a0a]/10 hover:border-[#0a0a0a]/20 dark:border-[#333333] dark:bg-[#141414]/90 dark:hover:bg-[#1a1a1a] dark:hover:border-[#404040] sm:bottom-8 sm:right-6 sm:h-11 sm:w-11"
      style={{ pointerEvents: visible ? 'auto' : 'none' }}
    >
      <ChevronUpIcon className="h-5 w-5 text-[#0a0a0a]/70 dark:text-[#fafafa]/80 sm:h-5 sm:w-5" />
    </motion.button>
  );
}
