/**
 * @file terminalSound.ts
 * @description Optional terminal sounds (keystroke, boot complete) via Web Audio API.
 * No asset files; generates subtle tones. Callers must check muted + prefersReducedMotion.
 */

let audioContext: AudioContext | null = null;

function getContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioContext) audioContext = new AudioContext();
  return audioContext;
}

/** Resume context on user gesture (call from input focus or first keydown). */
export function resumeAudioContext(): void {
  const ctx = getContext();
  if (ctx?.state === 'suspended') ctx.resume().catch(() => {});
}

/** Very short keystroke click (subtle sine). */
export function playKeystroke(): void {
  const ctx = getContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.type = 'sine';
  osc.frequency.setValueAtTime(720, now);
  osc.frequency.exponentialRampToValueAtTime(400, now + 0.02);
  gain.gain.setValueAtTime(0.04, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.02);

  osc.start(now);
  osc.stop(now + 0.02);
}

/** Short two-tone "ready" sound when boot sequence completes. */
export function playBootComplete(): void {
  const ctx = getContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.type = 'sine';
  osc.frequency.setValueAtTime(440, now);
  osc.frequency.setValueAtTime(440, now + 0.08);
  osc.frequency.setValueAtTime(554, now + 0.08); // C5 -> D5
  gain.gain.setValueAtTime(0, now);
  gain.gain.linearRampToValueAtTime(0.06, now + 0.02);
  gain.gain.setValueAtTime(0.06, now + 0.08);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

  osc.start(now);
  osc.stop(now + 0.2);
}
