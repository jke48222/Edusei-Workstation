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
import { layoutFor } from './layout';
import { M0_TICKETS } from './data';
import { P } from './palette';

type Phase = 'ident' | 'title' | 'service' | 'report';

const IDENT_MS = 1600;

export function KitchenChaosGame() {
  const closeKitchenGame = useWorkstationStore((s) => s.closeKitchenGame);
  const prefersReducedMotion = useWorkstationStore((s) => s.prefersReducedMotion);

  const [phase, setPhase] = useState<Phase>('ident');
  const [paused, setPaused] = useState(false);
  const [tickets, setTickets] = useState<TicketSnapshot[]>([]);
  const [servedCount, setServedCount] = useState(0);
  const [toast, setToast] = useState<string | null>(null);
  const [report, setReport] = useState<ShiftReport | null>(null);
  const [lastServed, setLastServed] = useState<DishResult | null>(null);

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

    const sim = new Sim(layoutFor(host.clientWidth / Math.max(host.clientHeight, 1)), (e) => {
      if (e.kind === 'toast') showToast(e.text);
      else if (e.kind === 'tickets') setTickets(e.tickets);
      else if (e.kind === 'served') {
        setLastServed(e.result);
        setServedCount(M0_TICKETS - e.remaining);
        showToast(`${e.result.dishName} — ${e.result.score.toFixed(1)}/10`);
      } else if (e.kind === 'shift-complete') {
        setReport(e.report);
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
          weather: 'fair',
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
  }, [phase, prefersReducedMotion, showToast]);

  useEffect(() => {
    stageRef.current?.setPaused(paused);
  }, [paused]);

  /* Auto-pauses lift themselves via the stage's onVisible callback; player pauses don't. */

  useEffect(() => () => window.clearTimeout(toastTimer.current), []);

  const startShift = () => {
    setTickets([]);
    setServedCount(0);
    setReport(null);
    setLastServed(null);
    setPaused(false);
    setPhase('service');
  };

  /* ── Render ─────────────────────────────────────────────────────────── */

  const ticket = tickets[0];

  return (
    <div
      ref={rootRef}
      tabIndex={-1}
      role="application"
      aria-label="Kitchen Chaos — The Gale"
      className="fixed inset-0 z-[120] flex flex-col overflow-hidden font-sans outline-none select-none"
      style={{ background: P.charcoal, color: P.cream, touchAction: 'none' }}
    >
      {!prefersReducedMotion && (
        <style>{`
          @keyframes kc2Beam { 0% { transform: translateX(-130%) skewX(-18deg); } 100% { transform: translateX(320%) skewX(-18deg); } }
          @keyframes kc2Rise { 0% { opacity: 0; transform: translateY(10px); } 100% { opacity: 1; transform: translateY(0); } }
        `}</style>
      )}

      {/* ── Menu backdrop: the galley plate behind title/report ── */}
      {(phase === 'title' || phase === 'report') && (
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
            The Gale · storm season
          </p>
          <p className="max-w-md text-[13px] leading-relaxed" style={{ color: P.fog }}>
            Dry Dock build (M0): one dish, every verb. Chop with rhythm, pour to the band,
            stir until the spoon stands up — five bowls of Ninefathom Chowder out the pass.
          </p>
          <button
            type="button"
            onClick={startShift}
            className="rounded-full px-10 py-4 text-lg font-extrabold transition-transform hover:scale-105 active:scale-95"
            style={{ background: P.ember, color: P.cream, boxShadow: `0 6px 0 ${P.charcoal}` }}
          >
            ▶ First shift
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
            className="flex items-center gap-3 px-3 py-2"
            style={{ background: 'rgba(16,22,31,0.92)', borderBottom: `2px solid ${P.slate}` }}
          >
            {ticket ? (
              <div
                className="flex min-w-0 items-center gap-3 rounded-lg px-3 py-1.5"
                style={{ background: P.cream, color: P.charcoal, transform: 'rotate(-0.6deg)' }}
              >
                <span className="text-sm font-extrabold whitespace-nowrap">№{ticket.id} {ticket.dishName}</span>
                <span className="hidden gap-2 sm:flex">
                  {ticket.steps.map((s) => (
                    <span
                      key={s.label}
                      className="text-[11px] font-semibold whitespace-nowrap"
                      style={{ opacity: s.done ? 0.45 : 1, textDecoration: s.done ? 'line-through' : 'none' }}
                    >
                      {s.done ? '✓ ' : '· '}
                      {s.label}
                    </span>
                  ))}
                </span>
              </div>
            ) : (
              <span className="text-sm font-semibold opacity-60">…</span>
            )}
            <div className="ml-auto flex items-center gap-2">
              <span className="font-mono text-xs tabular-nums" style={{ color: P.fog }}>
                {servedCount}/{M0_TICKETS} served
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
            {report.total.toFixed(1)} / {report.maxTotal} across {report.served.length} bowls
          </p>
          <div className="w-full max-w-md space-y-1 text-left">
            {report.served.map((r, i) => (
              <div
                key={i}
                className="flex items-center justify-between rounded-lg px-4 py-2 text-sm"
                style={{ background: 'rgba(46,61,79,0.55)' }}
              >
                <span className="font-semibold">Bowl {i + 1}</span>
                <span className="font-mono text-xs" style={{ color: P.fog }}>
                  knife {Math.round(r.chopQ * 100)} · pour {Math.round(r.pourQ * 100)} · stir {Math.round(r.stirQ * 100)}
                </span>
                <span className="font-extrabold tabular-nums" style={{ color: P.butter }}>
                  {r.score.toFixed(1)}
                </span>
              </div>
            ))}
          </div>
          {lastServed?.tip && (
            <p className="max-w-sm text-xs italic" style={{ color: P.fog }}>
              Aunt Pet’s margin note: “{lastServed.tip}”
            </p>
          )}
          <div className="mt-2 flex gap-3">
            <button
              type="button"
              onClick={startShift}
              className="rounded-full px-8 py-3 text-base font-extrabold"
              style={{ background: P.ember, color: P.cream }}
            >
              ↻ Another shift
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
