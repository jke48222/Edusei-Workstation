/**
 * @file KitchenChaosGame.tsx
 * @description Kitchen Chaos — The Gale. Fullscreen overlay game (design:
 * docs/kitchen-chaos-2d.md). This is the M0 "Dry Dock" build: boot ident → title →
 * one-ticket chowder service on canvas → shift report. Mounts on the existing contract:
 * `kitchenGameOpen` renders it, `closeKitchenGame` unmounts it; ESC is owned here while
 * mounted (pause first, quit second). The overlay deliberately ignores the workstation
 * theme presets — it ships its own palette (storm-flat, §1.2).
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { useWorkstationStore } from '../../store/store';
import { CanvasStage } from './core/engine';
import { Sim, type DishResult, type ShiftReport, type TicketSnapshot } from './core/sim';
import { drawGalley } from './core/draw';
import { loadGameAssets, type GameAssets } from './core/assets';
import { gameAudio } from './core/audio';
import { layoutFor } from './layout';
import { ALBA_ARC, DISHES, FAVORS, MOSS_FINDS, SEASON, SEASON_KEYS, type DishId, type ShiftConfig } from './data';
import type { FavorId } from './core/sim';
import { P } from './palette';

const dishName = (d: DishId): string => DISHES[d].name;
const dishTagline = (d: DishId): string => DISHES[d].tagline;

type Phase = 'ident' | 'title' | 'service' | 'report' | 'journal' | 'scene' | 'season-end';

const ARC_KEY = 'kc2:arcAlba';
const FINDS_KEY = 'kc2:mossFinds';
const KEEPER_FAVOR_KEY = 'kc2:keeperFavor';

/** Shift config for any index — 0–6 are the authored week; 7+ is Storm Season+. */
function configFor(idx: number, favor: FavorId): ShiftConfig {
  const base = idx < SEASON.length ? SEASON[idx] : SEASON[SEASON.length - 1];
  let cfg: ShiftConfig = base;
  if (idx >= SEASON.length) {
    cfg = {
      ...base,
      day: `Storm Season+ · night ${idx - SEASON.length + 1}`,
      forecast: 'It never really ended',
      albaAt: null,
    };
  }
  if (favor === 'alba') {
    // Alba radios the ferry: big waves arrive split in two, a breath apart.
    const waves = cfg.waves.flatMap((w) =>
      w.tickets.length >= 3
        ? [
            { ...w, tickets: w.tickets.slice(0, Math.ceil(w.tickets.length / 2)) },
            { at: w.at + 7, tickets: w.tickets.slice(Math.ceil(w.tickets.length / 2)) },
          ]
        : [w],
    );
    cfg = { ...cfg, waves };
  }
  return cfg;
}

function readGrades(): string[] {
  try {
    return JSON.parse(localStorage.getItem(SEASON_KEYS.grades) ?? '[]') as string[];
  } catch {
    return [];
  }
}

const readInt = (key: string): number => {
  try {
    return Number(localStorage.getItem(key)) || 0;
  } catch {
    return 0;
  }
};
const writeInt = (key: string, v: number): void => {
  try {
    localStorage.setItem(key, String(v));
  } catch {
    /* fine */
  }
};

const IDENT_MS = 1600;

export function KitchenChaosGame() {
  const closeKitchenGame = useWorkstationStore((s) => s.closeKitchenGame);
  const prefersReducedMotion = useWorkstationStore((s) => s.prefersReducedMotion);

  const [phase, setPhase] = useState<Phase>('ident');
  const [paused, setPaused] = useState(false);
  const [tickets, setTickets] = useState<TicketSnapshot[]>([]);
  const [servedCount, setServedCount] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [toast, setToast] = useState<string | null>(null);
  const [report, setReport] = useState<ShiftReport | null>(null);
  const [lastServed, setLastServed] = useState<DishResult | null>(null);
  const [muted, setMuted] = useState(gameAudio.isMuted);
  const [sceneLine, setSceneLine] = useState(0);
  const [seasonIdx, setSeasonIdx] = useState(() => readInt(SEASON_KEYS.shift));
  const [favor, setFavor] = useState<FavorId>(null);
  const arcBeat = readInt(ARC_KEY);
  const favorsUnlocked: FavorId[] = [
    ...(arcBeat >= ALBA_ARC.length ? (['alba'] as const) : []),
    ...(readInt(FINDS_KEY) >= 3 ? (['moss'] as const) : []),
    ...(readInt(KEEPER_FAVOR_KEY) > 0 ? (['keeper'] as const) : []),
  ];
  const shiftCfg = configFor(seasonIdx, favor);
  /** Dishes tomorrow's shift adds — drives the journal interstitial. */
  const nextUnlocks: DishId[] =
    seasonIdx + 1 < SEASON.length
      ? SEASON[seasonIdx + 1].menu.filter((d) => !SEASON[seasonIdx].menu.includes(d))
      : [];

  const rootRef = useRef<HTMLDivElement>(null);
  const canvasHostRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stageRef = useRef<CanvasStage | null>(null);
  const simRef = useRef<Sim | null>(null);
  const assetsRef = useRef<GameAssets | null>(null);
  const mountedAtRef = useRef(performance.now());
  const toastTimer = useRef<number | undefined>(undefined);
  const pausedRef = useRef(false);
  pausedRef.current = paused;
  /** Who paused: hiding the tab auto-pauses and auto-resumes; the player's pause stays. */
  const pauseSourceRef = useRef<'user' | 'auto'>('user');

  /* ── Art loads during the dive + ident — screen time we already own ── */
  useEffect(() => {
    let alive = true;
    loadGameAssets().then((a) => {
      if (alive) assetsRef.current = a;
    });
    // The Unity-port's old high-score key retires with it.
    try {
      localStorage.removeItem('kitchen-chaos-best');
    } catch {
      /* fine */
    }
    return () => {
      alive = false;
    };
  }, []);

  /* ── Focus management: trap-in on mount, restore on unmount ───────── */
  useEffect(() => {
    const prev = document.activeElement as HTMLElement | null;
    rootRef.current?.focus();
    return () => prev?.focus?.();
  }, []);

  /* ── Ident auto-advance (skippable) ────────────────────────────────── */
  useEffect(() => {
    if (phase !== 'ident') return;
    const t = window.setTimeout(() => setPhase('title'), prefersReducedMotion ? 700 : IDENT_MS);
    return () => window.clearTimeout(t);
  }, [phase, prefersReducedMotion]);

  /* ── ESC: pause first, quit second (App.tsx defers to us while open) ─ */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (phase === 'service') {
          pauseSourceRef.current = 'user';
          setPaused((p) => !p);
        } else {
          closeKitchenGame();
        }
        return;
      }
      if (phase === 'ident' && (e.key === 'Enter' || e.key === ' ')) setPhase('title');
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [phase, closeKitchenGame]);

  /* ── Sim + stage lifecycle for the service phase ───────────────────── */
  const showToast = useCallback((text: string) => {
    setToast(text);
    window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(null), 2200);
  }, []);

  useEffect(() => {
    if (phase !== 'service') return;
    const canvas = canvasRef.current;
    const host = canvasHostRef.current;
    if (!canvas || !host) return;

    const sim = new Sim(layoutFor(host.clientWidth / Math.max(host.clientHeight, 1)), configFor(seasonIdx, favor), favor, (e) => {
      if (e.kind === 'toast') showToast(e.text);
      else if (e.kind === 'sfx') gameAudio.play(e.name);
      else if (e.kind === 'tickets') setTickets(e.tickets);
      else if (e.kind === 'clock') {
        setSecondsLeft(e.secondsLeft);
        gameAudio.setWeather(sim.weather);
      } else if (e.kind === 'served') {
        setLastServed(e.result);
        setServedCount((n) => n + 1);
        if (e.result.dishName.includes('Black Toast') && e.result.craft >= 0.8) {
          writeInt(KEEPER_FAVOR_KEY, 1); // the Keeper remembers a perfect slice
        }
        showToast(`${e.result.dishName} — ${e.result.score.toFixed(1)}/10`);
      } else if (e.kind === 'shift-complete') {
        setReport(e.report);
        const grades = readGrades();
        grades[Math.min(seasonIdx, SEASON.length - 1 + 99)] = e.report.grade;
        try {
          localStorage.setItem(SEASON_KEYS.grades, JSON.stringify(grades.slice(0, 40)));
        } catch {
          /* fine */
        }
        window.setTimeout(() => setPhase('report'), 700);
      }
    });
    simRef.current = sim;

    const stage = new CanvasStage(canvas, host, {
      chooseVirtual: (aspect) => layoutFor(aspect).size,
      update: (dt, now) => sim.update(dt, now),
      draw: (ctx, view) =>
        drawGalley(ctx, view, sim, {
          t: prefersReducedMotion ? 0 : (performance.now() - mountedAtRef.current) / 1000,
          reducedMotion: prefersReducedMotion,
          assets: assetsRef.current,
        }),
      pointer: (ev) => {
        // Only a deliberate (user) pause blocks input. Auto-pause exists to stop the
        // clock while the tab is hidden — no real pointer can arrive then anyway.
        if (!(pausedRef.current && pauseSourceRef.current === 'user')) sim.pointer(ev);
      },
      onViewChange: (view) => sim.setLayout(layoutFor(view.aspect)),
      onHidden: () => {
        if (!pausedRef.current) {
          pauseSourceRef.current = 'auto';
          // Mutate the gate synchronously — input arriving before React re-renders
          // must already see the right state (and same again on resume below).
          pausedRef.current = true;
          setPaused(true);
        }
      },
      onVisible: () => {
        if (pausedRef.current && pauseSourceRef.current === 'auto') {
          pausedRef.current = false;
          setPaused(false);
        }
      },
    });
    stageRef.current = stage;

    // Dev-only handle for E2E drivers and debugging; absent from production builds.
    if (import.meta.env.DEV) {
      (window as unknown as Record<string, unknown>).__kc2 = { sim, stage };
    }

    return () => {
      stage.destroy();
      stageRef.current = null;
      simRef.current = null;
      if (import.meta.env.DEV) {
        delete (window as unknown as Record<string, unknown>).__kc2;
      }
    };
    // Recreating the whole sim on reduced-motion flips is acceptable and rare.
  }, [phase, prefersReducedMotion, showToast, seasonIdx, favor]);

  /** Advance the calendar after a shift's interstitials are done. */
  const advanceDay = useCallback(() => {
    const next = seasonIdx + 1;
    setSeasonIdx(next);
    writeInt(SEASON_KEYS.shift, next);
    setSceneLine(0);
    setPhase(next === SEASON.length ? 'season-end' : 'title');
  }, [seasonIdx]);

  const afterReport = () => {
    if (nextUnlocks.length > 0) setPhase('journal');
    else if (arcBeat < ALBA_ARC.length && seasonIdx < SEASON.length) setPhase('scene');
    else advanceDay();
  };
  const afterJournal = () => {
    if (arcBeat < ALBA_ARC.length && seasonIdx < SEASON.length) setPhase('scene');
    else advanceDay();
  };

  useEffect(() => {
    stageRef.current?.setPaused(paused);
  }, [paused]);

  /* Auto-pauses lift themselves via the stage's onVisible callback; player pauses don't. */

  useEffect(() => () => window.clearTimeout(toastTimer.current), []);

  const startShift = () => {
    setTickets([]);
    setServedCount(0);
    setSecondsLeft(0);
    setReport(null);
    setLastServed(null);
    setPaused(false);
    setPhase('service');
  };

  /* ── Render ─────────────────────────────────────────────────────────── */

  const clock = `${Math.floor(secondsLeft / 60)}:${String(secondsLeft % 60).padStart(2, '0')}`;

  return (
    <div
      ref={rootRef}
      tabIndex={-1}
      role="application"
      aria-label="Kitchen Chaos — The Gale"
      className="fixed inset-0 z-[120] flex flex-col overflow-hidden font-sans outline-none select-none"
      style={{ background: P.charcoal, color: P.cream, touchAction: 'none' }}
      onPointerDown={() => gameAudio.unlock()}
    >
      {!prefersReducedMotion && (
        <style>{`
          @keyframes kc2Beam { 0% { transform: translateX(-130%) skewX(-18deg); } 100% { transform: translateX(320%) skewX(-18deg); } }
          @keyframes kc2Rise { 0% { opacity: 0; transform: translateY(10px); } 100% { opacity: 1; transform: translateY(0); } }
        `}</style>
      )}

      {/* ── Menu backdrop: the galley plate behind the framing screens ── */}
      {(phase === 'title' || phase === 'report' || phase === 'journal' || phase === 'season-end') && (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage: 'url(/game/kitchen-chaos/bg-landscape.jpg)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            opacity: 0.45,
            maskImage: 'linear-gradient(180deg, rgba(0,0,0,0.9), rgba(0,0,0,0.55))',
            WebkitMaskImage: 'linear-gradient(180deg, rgba(0,0,0,0.9), rgba(0,0,0,0.55))',
          }}
        />
      )}

      {/* ── Boot ident ── */}
      {phase === 'ident' && (
        <button
          type="button"
          onClick={() => setPhase('title')}
          className="relative flex flex-1 cursor-default flex-col items-center justify-center gap-3 overflow-hidden"
          aria-label="Skip intro"
        >
          <div className="relative overflow-hidden px-6 py-2">
            <p className="font-mono text-xs uppercase tracking-[0.5em]" style={{ color: P.fog }}>
              a game by
            </p>
            <h2 className="mt-1 text-3xl font-extrabold tracking-[0.18em]" style={{ color: P.cream }}>
              JALEN EDUSEI
            </h2>
            {!prefersReducedMotion && (
              <span
                aria-hidden
                className="pointer-events-none absolute inset-y-0 w-16"
                style={{ background: 'rgba(242,166,90,0.25)', animation: 'kc2Beam 1.3s ease-in-out 1' }}
              />
            )}
          </div>
          <p className="font-mono text-[11px] uppercase tracking-[0.4em] opacity-60">presents</p>
        </button>
      )}

      {/* ── Title ── */}
      {phase === 'title' && (
        <div
          className="flex flex-1 flex-col items-center justify-center gap-5 px-6 text-center"
          style={prefersReducedMotion ? undefined : { animation: 'kc2Rise 0.5s ease-out both' }}
        >
          <p className="font-mono text-[11px] uppercase tracking-[0.4em]" style={{ color: P.fog }}>
            last hot meal before open water
          </p>
          <h1 className="text-6xl font-extrabold leading-[0.95] tracking-tight sm:text-7xl">
            KITCHEN
            <br />
            CHAOS
          </h1>
          <p className="text-sm font-semibold" style={{ color: P.amber }}>
            {shiftCfg.day} · forecast: {shiftCfg.forecast}
          </p>
          <p className="max-w-md text-[13px] leading-relaxed" style={{ color: P.fog }}>
            {seasonIdx === 0
              ? 'First shift of storm season. One dish on the menu — Aunt Pet’s journal will give up the rest as the week worsens.'
              : `Menu tonight: ${shiftCfg.menu.map((d) => d.split('-').join(' ')).length} dishes. The barometer is not your friend.`}
          </p>
          {favorsUnlocked.length > 0 && (
            <div className="flex flex-wrap items-center justify-center gap-2">
              <span className="font-mono text-[10px] uppercase tracking-[0.3em]" style={{ color: P.fog }}>
                favor
              </span>
              {favorsUnlocked.map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setFavor(favor === f ? null : f)}
                  title={FAVORS[f as string].blurb}
                  className="rounded-full px-3 py-1 text-xs font-bold"
                  style={{
                    background: favor === f ? P.tide : P.slate,
                    color: P.cream,
                    outline: favor === f ? `2px solid ${P.lightning}` : 'none',
                  }}
                >
                  {FAVORS[f as string].name}
                </button>
              ))}
            </div>
          )}
          <button
            type="button"
            onClick={startShift}
            className="rounded-full px-10 py-4 text-lg font-extrabold transition-transform hover:scale-105 active:scale-95"
            style={{ background: P.ember, color: P.cream, boxShadow: `0 6px 0 ${P.charcoal}` }}
          >
            ▶ {seasonIdx === 0 ? 'First shift' : seasonIdx >= SEASON.length ? 'Another night' : `Open for ${shiftCfg.day}`}
          </button>
          <button type="button" onClick={closeKitchenGame} className="text-xs underline opacity-60 hover:opacity-100">
            Back to the workstation
          </button>
        </div>
      )}

      {/* ── Service ── */}
      {phase === 'service' && (
        <>
          <header
            className="flex items-center gap-2 overflow-x-auto px-3 py-2"
            style={{ background: 'rgba(16,22,31,0.92)', borderBottom: `2px solid ${P.slate}` }}
          >
            {tickets.length === 0 ? (
              <span className="text-xs font-semibold whitespace-nowrap opacity-50">the line is quiet…</span>
            ) : (
              tickets.map((tk, i) => (
                <div
                  key={tk.id}
                  className="relative shrink-0 rounded-md px-2.5 pt-1.5 pb-2"
                  style={{
                    background: tk.kind === 'keeper' ? P.charcoal : P.cream,
                    color: tk.kind === 'keeper' ? P.cream : P.charcoal,
                    border: tk.kind === 'keeper' ? `1px solid ${P.harbor}` : tk.kind === 'alba' ? `2px solid ${P.tide}` : 'none',
                    opacity: tk.flying ? 0.35 : 1,
                    transform: `rotate(${i % 2 === 0 ? -1.2 : 0.9}deg)`,
                    boxShadow: '0 2px 4px rgba(0,0,0,0.35)',
                  }}
                >
                  {/* Clothespin */}
                  <span
                    aria-hidden
                    className="absolute -top-1 left-1/2 h-2 w-3 -translate-x-1/2 rounded-sm"
                    style={{ background: P.harbor }}
                  />
                  <span className="text-[12px] font-extrabold whitespace-nowrap">
                    №{tk.id} {tk.short}
                  </span>
                  {/* Patience: the slip yellows and its edge burns down as it waits */}
                  <span
                    aria-hidden
                    className="absolute bottom-0 left-0 h-1 rounded-b-md"
                    style={{
                      width: `${Math.max(4, (1 - tk.staleness) * 100)}%`,
                      background: tk.staleness > 0.6 ? P.alert : tk.staleness > 0.25 ? P.amber : P.tide,
                    }}
                  />
                </div>
              ))
            )}
            <div className="ml-auto flex shrink-0 items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  const next = !muted;
                  setMuted(next);
                  gameAudio.setMuted(next);
                }}
                aria-label={muted ? 'Unmute game audio' : 'Mute game audio'}
                className="rounded-full px-2.5 py-1 text-sm font-bold"
                style={{ background: P.slate, color: P.cream, opacity: muted ? 0.55 : 1 }}
              >
                {muted ? '🔇' : '🔊'}
              </button>
              <span
                className="rounded-full px-3 py-1 font-mono text-sm font-bold tabular-nums"
                style={{
                  background: secondsLeft > 0 && secondsLeft <= 20 ? P.alert : P.charcoal,
                  color: P.cream,
                }}
              >
                {clock}
              </span>
              <span className="font-mono text-xs whitespace-nowrap tabular-nums" style={{ color: P.fog }}>
                {servedCount} out
              </span>
              <button
                type="button"
                onClick={() => {
                  pauseSourceRef.current = 'user';
                  setPaused(true);
                }}
                className="rounded-full px-3 py-1 text-sm font-bold"
                style={{ background: P.slate, color: P.cream }}
              >
                ⏸ Pause
              </button>
            </div>
          </header>

          <div ref={canvasHostRef} className="relative min-h-0 flex-1">
            <canvas ref={canvasRef} className="absolute inset-0" style={{ touchAction: 'none' }} />
            {toast && (
              <div
                role="status"
                className="pointer-events-none absolute bottom-5 left-1/2 -translate-x-1/2 rounded-full px-5 py-2 text-sm font-bold"
                style={{ background: 'rgba(16,22,31,0.9)', color: P.cream, border: `1px solid ${P.harbor}` }}
              >
                {toast}
              </div>
            )}
          </div>

          {paused && (
            <div
              role="dialog"
              aria-modal="true"
              aria-label="Paused"
              className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-4"
              style={{ background: 'rgba(16,22,31,0.86)' }}
            >
              <h2 className="text-3xl font-extrabold">Paused</h2>
              <p className="text-xs" style={{ color: P.fog }}>
                The chowder waits. The storm doesn’t, usually. (It does right now.)
              </p>
              <button
                type="button"
                onClick={() => setPaused(false)}
                className="rounded-full px-8 py-3 text-base font-extrabold"
                style={{ background: P.ember, color: P.cream }}
              >
                Resume
              </button>
              <button
                type="button"
                onClick={startShift}
                className="rounded-full px-6 py-2 text-sm font-bold"
                style={{ background: P.slate, color: P.cream }}
              >
                Restart shift
              </button>
              <button type="button" onClick={closeKitchenGame} className="text-xs underline opacity-70 hover:opacity-100">
                Quit to workstation
              </button>
            </div>
          )}
        </>
      )}

      {/* ── Shift report ── */}
      {phase === 'report' && report && (
        <div className="flex flex-1 flex-col items-center justify-center gap-4 overflow-y-auto px-6 py-8 text-center">
          <p className="font-mono text-[11px] uppercase tracking-[0.4em]" style={{ color: P.fog }}>
            shift report — the forecast you leave behind
          </p>
          <h2 className="text-5xl font-extrabold" style={{ color: P.amber }}>
            {report.grade}
          </h2>
          <p className="font-mono text-sm tabular-nums" style={{ color: P.fog }}>
            {report.total.toFixed(1)} / {report.maxTotal} · {report.served.length} served
            {report.missed > 0 ? ` · ${report.missed} still waiting at close` : ' · nobody left hungry'}
          </p>
          <div className="w-full max-w-md space-y-1 overflow-y-auto text-left" style={{ maxHeight: '38vh' }}>
            {report.served.map((r, i) => (
              <div
                key={i}
                className="flex items-center justify-between gap-3 rounded-lg px-4 py-2 text-sm"
                style={{ background: 'rgba(46,61,79,0.55)' }}
              >
                <span className="min-w-0 truncate font-semibold">{r.dishName}</span>
                <span className="font-mono text-xs whitespace-nowrap" style={{ color: P.fog }}>
                  craft {Math.round(r.craft * 100)}
                  {r.lateMult < 0.995 ? ` · late ×${r.lateMult.toFixed(2)}` : ''}
                </span>
                <span className="font-extrabold tabular-nums" style={{ color: P.butter }}>
                  {r.score.toFixed(1)}
                </span>
              </div>
            ))}
          </div>
          {lastServed?.note && (
            <p className="max-w-sm text-xs italic" style={{ color: P.fog }}>
              Aunt Pet’s margin note: “{lastServed.note}”
            </p>
          )}
          <div className="mt-2 flex flex-wrap justify-center gap-3">
            <button
              type="button"
              onClick={afterReport}
              className="rounded-full px-8 py-3 text-base font-extrabold"
              style={{ background: P.ember, color: P.cream }}
            >
              {nextUnlocks.length > 0 ? '📖 Pet’s journal' : arcBeat < ALBA_ARC.length && seasonIdx < SEASON.length ? '🕯 Close up' : 'Lock up'}
            </button>
            <button
              type="button"
              onClick={closeKitchenGame}
              className="rounded-full px-8 py-3 text-base font-bold"
              style={{ background: P.slate, color: P.cream }}
            >
              Back out
            </button>
          </div>
        </div>
      )}

      {/* ── Pet's journal: tomorrow's page dries out enough to read (doc §8) ── */}
      {phase === 'journal' && (
        <div className="flex flex-1 flex-col items-center justify-center gap-5 px-6 text-center">
          <p className="font-mono text-[11px] uppercase tracking-[0.4em]" style={{ color: P.fog }}>
            aunt pet’s journal — a page dries out
          </p>
          {nextUnlocks.map((d) => (
            <div
              key={d}
              className="w-full max-w-md rounded-xl px-6 py-5 text-left"
              style={{ background: P.cream, color: P.charcoal, transform: 'rotate(-0.8deg)', boxShadow: '0 6px 18px rgba(0,0,0,0.45)' }}
            >
              <h3 className="text-xl font-extrabold">{dishName(d)}</h3>
              <p className="mt-1 text-sm italic opacity-80">“{dishTagline(d)}”</p>
              <p className="mt-3 font-mono text-[11px] uppercase tracking-widest opacity-60">
                the method is water-damaged — cook it once and your hands will remember
              </p>
            </div>
          ))}
          <button
            type="button"
            onClick={afterJournal}
            className="rounded-full px-8 py-3 text-base font-extrabold"
            style={{ background: P.ember, color: P.cream }}
          >
            Tuck it under the barometer
          </button>
        </div>
      )}

      {/* ── Season over: the week you cooked ── */}
      {phase === 'season-end' && (
        <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
          <p className="font-mono text-[11px] uppercase tracking-[0.4em]" style={{ color: P.fog }}>
            storm season — the week’s forecasts
          </p>
          <h2 className="text-4xl font-extrabold" style={{ color: P.amber }}>
            The Gale held.
          </h2>
          <div className="w-full max-w-sm space-y-1 text-left">
            {SEASON.map((s, i) => (
              <div key={s.day} className="flex items-center justify-between rounded-lg px-4 py-1.5 text-sm" style={{ background: 'rgba(46,61,79,0.55)' }}>
                <span className="font-semibold">{s.day}</span>
                <span className="font-mono text-xs" style={{ color: P.butter }}>
                  {readGrades()[i] ?? '—'}
                </span>
              </div>
            ))}
          </div>
          <p className="max-w-md text-xs italic" style={{ color: P.fog }}>
            Alba took the window table through the Century Gale. The Keeper’s light never went out.
            Somewhere on the roof, Bosun files a formal complaint.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <button
              type="button"
              onClick={() => setPhase('title')}
              className="rounded-full px-7 py-3 text-base font-extrabold"
              style={{ background: P.ember, color: P.cream }}
            >
              ⛈ Storm Season+
            </button>
            <button
              type="button"
              onClick={() => {
                writeInt(SEASON_KEYS.shift, 0);
                try {
                  localStorage.setItem(SEASON_KEYS.grades, '[]');
                } catch { /* fine */ }
                setSeasonIdx(0);
                setPhase('title');
              }}
              className="rounded-full px-7 py-3 text-base font-bold"
              style={{ background: P.slate, color: P.cream }}
            >
              Restart the week
            </button>
            <button type="button" onClick={closeKitchenGame} className="rounded-full px-7 py-3 text-base font-bold" style={{ background: P.slate, color: P.cream }}>
              Back out
            </button>
          </div>
        </div>
      )}

      {/* ── Between shifts: the cozy beat, quarantined from service (doc §5) ── */}
      {phase === 'scene' && (
        <div className="relative flex flex-1 flex-col items-center justify-end gap-4 px-6 pb-10 text-center">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              backgroundImage: 'url(/game/kitchen-chaos/bg-landscape.jpg)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              opacity: 0.3,
            }}
          />
          <img
            src="/game/kitchen-chaos/sprites/portrait-alba.png"
            alt="Captain Alba at the counter, mug in hand"
            className="relative w-40 sm:w-52"
            style={{ filter: 'drop-shadow(0 8px 14px rgba(0,0,0,0.5))' }}
          />
          <div
            className="relative max-w-lg rounded-2xl px-6 py-4 text-left"
            style={{ background: 'rgba(16,22,31,0.92)', border: `1px solid ${P.harbor}` }}
          >
            <p className="mb-1 font-mono text-[10px] uppercase tracking-[0.3em]" style={{ color: P.fog }}>
              Captain Alba · beat {Math.min(arcBeat + 1, ALBA_ARC.length)} of {ALBA_ARC.length}
            </p>
            <p className="text-sm leading-relaxed">{ALBA_ARC[Math.min(arcBeat, ALBA_ARC.length - 1)][sceneLine]}</p>
          </div>
          <div className="relative flex gap-3">
            {sceneLine < ALBA_ARC[Math.min(arcBeat, ALBA_ARC.length - 1)].length - 1 ? (
              <button
                type="button"
                onClick={() => setSceneLine((n) => n + 1)}
                className="rounded-full px-7 py-2.5 text-sm font-extrabold"
                style={{ background: P.slate, color: P.cream }}
              >
                …
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  writeInt(ARC_KEY, arcBeat + 1);
                  const finds = readInt(FINDS_KEY);
                  writeInt(FINDS_KEY, finds + 1);
                  showToast(`Moss surfaces, leaves ${MOSS_FINDS[finds % MOSS_FINDS.length]}.`);
                  advanceDay();
                }}
                className="rounded-full px-7 py-2.5 text-sm font-extrabold"
                style={{ background: P.ember, color: P.cream }}
              >
                Give her the leftover special
              </button>
            )}
            <button
              type="button"
              onClick={advanceDay}
              className="rounded-full px-5 py-2.5 text-sm font-bold opacity-70 hover:opacity-100"
              style={{ background: P.slate, color: P.cream }}
            >
              Lock up quietly
            </button>
          </div>
        </div>
      )}

      {/* Always-available exit in the corner (not during ident). */}
      {phase !== 'ident' && phase !== 'service' && (
        <button
          type="button"
          onClick={closeKitchenGame}
          aria-label="Exit Kitchen Chaos"
          className="absolute right-3 top-3 rounded-full px-3 py-1 text-sm font-bold"
          style={{ background: P.slate, color: P.cream }}
        >
          ✕
        </button>
      )}
    </div>
  );
}
