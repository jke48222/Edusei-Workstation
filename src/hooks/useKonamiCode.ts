/**
 * @file useKonamiCode.ts
 * @description Listens for the Konami sequence (↑↑↓↓←→←→BA) and invokes a callback once per session.
 */

import { useEffect, useRef } from 'react';

const KONAMI_SEQUENCE = [
  'ArrowUp',
  'ArrowUp',
  'ArrowDown',
  'ArrowDown',
  'ArrowLeft',
  'ArrowRight',
  'ArrowLeft',
  'ArrowRight',
  'KeyB',
  'KeyA',
] as const;

const SESSION_KEY = 'konami-done';

/** Returns true if Konami was already triggered this session. */
export function wasKonamiTriggered(): boolean {
  if (typeof sessionStorage === 'undefined') return false;
  return sessionStorage.getItem(SESSION_KEY) === '1';
}

/**
 * Subscribes to keydown and calls onSuccess when the Konami code is entered.
 * Only fires once per session (uses sessionStorage). Does not fire again after onSuccess.
 */
export function useKonamiCode(onSuccess: () => void): void {
  const triggered = useRef(false);
  const sequence = useRef<string[]>([]);

  useEffect(() => {
    if (wasKonamiTriggered() || triggered.current) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.code;
      if (!KONAMI_SEQUENCE.includes(key as (typeof KONAMI_SEQUENCE)[number])) {
        sequence.current = [];
        return;
      }
      sequence.current = [...sequence.current, key].slice(-KONAMI_SEQUENCE.length);
      if (
        sequence.current.length === KONAMI_SEQUENCE.length &&
        sequence.current.every((k, i) => k === KONAMI_SEQUENCE[i])
      ) {
        triggered.current = true;
        if (typeof sessionStorage !== 'undefined') sessionStorage.setItem(SESSION_KEY, '1');
        onSuccess();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onSuccess]);
}
