/**
 * @file audio.ts
 * @description Synthesized audio — zero asset files, a few dozen lines of WebAudio.
 * The context is created lazily on the first real pointer gesture (never on mount:
 * no audio before user interaction). Rain ambience is a looped noise buffer whose
 * gain follows the barometer; SFX are tiny procedural voices. Mute persists.
 */

import type { WeatherState } from '../palette';

export type SfxName =
  | 'bell' | 'chop' | 'gust' | 'thunder' | 'gull' | 'flutter' | 'crank' | 'splat' | 'ding';

const MUTE_KEY = 'kc2:muted';

const RAIN_GAIN: Record<WeatherState, number> = {
  fair: 0.012,
  fresh: 0.022,
  squall: 0.038,
  gale: 0.055,
  century: 0.07,
};

class GameAudio {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private rainGain: GainNode | null = null;
  private muted: boolean;

  constructor() {
    let stored = false;
    try {
      stored = localStorage.getItem(MUTE_KEY) === 'true';
    } catch {
      /* storage blocked — default unmuted */
    }
    this.muted = stored;
  }

  get isMuted(): boolean {
    return this.muted;
  }

  setMuted(muted: boolean): void {
    this.muted = muted;
    try {
      localStorage.setItem(MUTE_KEY, String(muted));
    } catch {
      /* fine */
    }
    if (this.master && this.ctx) {
      this.master.gain.setTargetAtTime(muted ? 0 : 1, this.ctx.currentTime, 0.05);
    }
  }

  /** Call from a genuine pointer event — creates and starts everything. */
  unlock(): void {
    if (this.ctx) {
      void this.ctx.resume();
      return;
    }
    const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return;
    const ctx = new Ctor();
    this.ctx = ctx;
    this.master = ctx.createGain();
    this.master.gain.value = this.muted ? 0 : 1;
    this.master.connect(ctx.destination);

    // Rain: 2 s of looped filtered noise.
    const len = ctx.sampleRate * 2;
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const data = buf.getChannelData(0);
    let seed = 22222;
    for (let i = 0; i < len; i++) {
      seed = (seed * 1664525 + 1013904223) >>> 0;
      data[i] = ((seed & 0xffff) / 0x8000 - 1) * 0.6;
    }
    const src = ctx.createBufferSource();
    src.buffer = buf;
    src.loop = true;
    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = 900;
    this.rainGain = ctx.createGain();
    this.rainGain.gain.value = RAIN_GAIN.fair;
    src.connect(lp).connect(this.rainGain).connect(this.master);
    src.start();
  }

  setWeather(state: WeatherState): void {
    if (this.rainGain && this.ctx) {
      this.rainGain.gain.setTargetAtTime(RAIN_GAIN[state], this.ctx.currentTime, 0.8);
    }
  }

  play(name: SfxName): void {
    const ctx = this.ctx;
    const master = this.master;
    if (!ctx || !master || this.muted) return;
    const t = ctx.currentTime;

    const tone = (freq: number, dur: number, type: OscillatorType, gain: number, glideTo?: number) => {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = type;
      o.frequency.setValueAtTime(freq, t);
      if (glideTo) o.frequency.exponentialRampToValueAtTime(glideTo, t + dur);
      g.gain.setValueAtTime(gain, t);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      o.connect(g).connect(master);
      o.start(t);
      o.stop(t + dur + 0.02);
    };
    const noise = (dur: number, freq: number, q: number, gain: number) => {
      const len = Math.ceil(ctx.sampleRate * dur);
      const buf = ctx.createBuffer(1, len, ctx.sampleRate);
      const d = buf.getChannelData(0);
      for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len);
      const s = ctx.createBufferSource();
      s.buffer = buf;
      const f = ctx.createBiquadFilter();
      f.type = 'bandpass';
      f.frequency.value = freq;
      f.Q.value = q;
      const g = ctx.createGain();
      g.gain.value = gain;
      s.connect(f).connect(g).connect(master);
      s.start(t);
    };

    switch (name) {
      case 'bell':
      case 'ding':
        tone(1568, 0.5, 'sine', 0.12);
        tone(2093, 0.35, 'sine', 0.07);
        break;
      case 'chop':
        noise(0.07, 700, 1.2, 0.22);
        break;
      case 'gust':
        noise(0.9, 420, 0.8, 0.16);
        break;
      case 'thunder':
        noise(1.6, 110, 0.6, 0.3);
        break;
      case 'gull':
        tone(1250, 0.16, 'sawtooth', 0.05, 750);
        tone(1180, 0.14, 'sawtooth', 0.04, 700);
        break;
      case 'flutter':
        noise(0.12, 1500, 1.5, 0.1);
        noise(0.1, 1800, 1.5, 0.07);
        break;
      case 'crank':
        tone(240, 0.05, 'square', 0.05);
        tone(300, 0.05, 'square', 0.05);
        break;
      case 'splat':
        tone(95, 0.25, 'sine', 0.2, 55);
        break;
    }
  }
}

export const gameAudio = new GameAudio();
