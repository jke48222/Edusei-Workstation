/**
 * @file KitchenChaosGame.tsx
 * @description Kitchen Chaos — a faithful single-player web port of the Unity VR game
 * from jke48222/VR-Final-Project. The full round loop is preserved: random theme
 * reveal → 120 s timed round with random chaos events → judged scoring with TV-judge
 * commentary → results. Stations mirror the VR kitchen: pantry, cutting board (single
 * cut), four heat sources (6.25 s cook / 8.33 s burn), mixing bowl + whisk (recipe
 * match or spit-back), and the plate that gets scored. Multiplayer/VelNet, OpenAI TTS,
 * and the GPT judge are replaced with a single-player high-score chase and canned
 * judge lines that follow the original judge prompt's rubric.
 *
 * Port conveniences (documented deviations): a trash bin (infinite pantry needs an
 * undo), and mixed dishes remember what went into them so plating the finished dish
 * scores like plating its ingredients — the shipped Unity build's empty
 * `possibleRecipes` wiring made every plate fall to the pity score.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { useWorkstationStore } from '../../store/store';
import {
  ROUND_SECONDS, COOK_SECONDS, BURN_SECONDS, WHISK_COOLDOWN_MS, BURNER_COUNT,
  CHAOS_MIN_GAP, CHAOS_MAX_GAP, CHAOS_DURATION, CHAOS_COOLDOWN,
  RANDOM_SCALE_MIN, RANDOM_SCALE_MAX, RANDOM_SCALE_MAX_ITEMS, RUBBER_KNIFE_SLIP_CHANCE,
  INGREDIENTS, RECIPES, THEMES, CHAOS_EVENTS,
  type ChaosId, type CookState, type RecipeDef,
} from './kitchen/data';
import { scorePlate, applyZeroScoreFix, type PlatedItem, type ScoreResult } from './kitchen/judge';

type Loc = 'counter' | 'hand' | 'board' | 'bowl' | 'plate' | 'flying' | 'floating' | `burner-${number}`;

interface GameItem {
  uid: number;
  defId: string;
  state: CookState;
  cookProgress: number;
  burnProgress: number;
  loc: Loc;
  /** Scatter position (viewport %) while flying/floating during chaos. */
  pos?: { x: number; y: number };
  /** Random-scale chaos multiplier. */
  scale?: number;
  /** For dish_* items: the exact bowl contents the mix consumed (drives scoring). */
  contents?: PlatedItem[];
}

type Phase = 'menu' | 'theme' | 'playing' | 'judging' | 'results';

const BEST_KEY = 'kitchen-chaos-best';
const readBest = () => { try { return Number(localStorage.getItem(BEST_KEY)) || 0; } catch { return 0; } };
const writeBest = (v: number) => { try { localStorage.setItem(BEST_KEY, String(v)); } catch { /* blocked */ } };

const rand = (min: number, max: number) => min + Math.random() * (max - min);
const fmt = (s: number) => {
  const clamped = Math.max(0, Math.ceil(s));
  return `${Math.floor(clamped / 60)}:${String(clamped % 60).padStart(2, '0')}`;
};

function itemVisual(item: GameItem): { emoji: string; name: string } {
  if (item.defId.startsWith('dish_')) {
    const r = RECIPES.find((x) => x.dishId === item.defId);
    return { emoji: r?.emoji ?? '🍽️', name: r?.name ?? 'Dish' };
  }
  const def = INGREDIENTS[item.defId];
  return { emoji: def?.emoji ?? '❓', name: def?.name ?? item.defId };
}

const STATE_BADGE: Record<CookState, { label: string; cls: string } | null> = {
  raw: null,
  cooking: { label: 'COOKING', cls: 'bg-amber-500 text-white' },
  done: { label: 'DONE', cls: 'bg-emerald-600 text-white' },
  burnt: { label: 'BURNT', cls: 'bg-neutral-800 text-red-300' },
};

/** Emoji chip for one item, with cook tint (CookableItem.cs color feedback) + badge. */
function ItemChip({
  item, onClick, size = 44, title,
}: { item: GameItem; onClick?: () => void; size?: number; title?: string }) {
  const { name, emoji } = itemVisual(item);
  const badge = STATE_BADGE[item.state];
  const cookFilter =
    item.state === 'burnt' ? 'brightness(0.35) sepia(0.6)' :
    item.state === 'done' ? 'sepia(0.35) saturate(1.4)' :
    item.state === 'cooking' ? `sepia(${0.3 * item.cookProgress})` : undefined;
  return (
    <button
      type="button"
      onClick={(e) => { e.stopPropagation(); onClick?.(); }}
      title={title ?? name}
      aria-label={title ?? name}
      className="relative inline-flex flex-col items-center justify-center rounded-xl border border-black/10 bg-white/80 shadow-sm transition-transform hover:scale-105 focus-visible:ring-2 focus-visible:ring-orange-500"
      style={{ width: size + 14, height: size + 14, transform: item.scale ? `scale(${item.scale})` : undefined }}
    >
      <span style={{ fontSize: size * 0.62, lineHeight: 1, filter: cookFilter }} aria-hidden>{emoji}</span>
      {badge && (
        <span className={`absolute -bottom-1.5 rounded-full px-1.5 py-px text-[8px] font-bold tracking-wide ${badge.cls}`}>
          {badge.label}
        </span>
      )}
    </button>
  );
}

export function KitchenChaosGame() {
  const closeKitchenGame = useWorkstationStore((s) => s.closeKitchenGame);
  const prefersReducedMotion = useWorkstationStore((s) => s.prefersReducedMotion);

  const [phase, setPhase] = useState<Phase>('menu');
  const [theme, setTheme] = useState('');
  const [timeLeft, setTimeLeft] = useState(ROUND_SECONDS);
  const [items, setItems] = useState<Record<number, GameItem>>({});
  const [hand, setHand] = useState<number | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [bookOpen, setBookOpen] = useState(false);
  const [bookPage, setBookPage] = useState(0);
  const [chaosActive, setChaosActive] = useState<ChaosId | null>(null);
  const [result, setResult] = useState<ScoreResult | null>(null);
  const [revealCount, setRevealCount] = useState(0);
  const [best, setBest] = useState(readBest);

  const uidRef = useRef(1);
  const gameTimeRef = useRef(0);
  const chaosRef = useRef({ nextAt: 0, endsAt: 0, active: null as ChaosId | null, cooldowns: {} as Record<string, number> });
  const lastWhiskRef = useRef(0);
  const toastTimerRef = useRef(0);

  const say = useCallback((msg: string) => {
    setToast(msg);
    clearTimeout(toastTimerRef.current);
    toastTimerRef.current = window.setTimeout(() => setToast(null), 2200);
  }, []);

  /* ── Round lifecycle ─────────────────────────────────────────────── */

  const startRound = useCallback(() => {
    setItems({});
    setHand(null);
    setResult(null);
    setRevealCount(0);
    setTimeLeft(ROUND_SECONDS);
    gameTimeRef.current = 0;
    chaosRef.current = { nextAt: rand(CHAOS_MIN_GAP, CHAOS_MAX_GAP), endsAt: 0, active: null, cooldowns: {} };
    setChaosActive(null);
    setTheme(THEMES[Math.floor(Math.random() * THEMES.length)]);
    setPhase('theme');
  }, []);

  // Theme reveal ("Tonight's theme is…", RoundManager.cs:175-177), then play.
  useEffect(() => {
    if (phase !== 'theme') return;
    const t = setTimeout(() => setPhase('playing'), 2600);
    return () => clearTimeout(t);
  }, [phase]);

  const endChaos = useCallback(() => {
    chaosRef.current.active = null;
    setChaosActive(null);
    setItems((prev) => {
      const next = { ...prev };
      for (const it of Object.values(next)) {
        if (it.loc === 'flying' || it.loc === 'floating') next[it.uid] = { ...it, loc: 'counter', pos: undefined };
        else if (it.scale) next[it.uid] = { ...it, scale: undefined };
      }
      return next;
    });
  }, []);

  const triggerChaos = useCallback(() => {
    const now = gameTimeRef.current;
    // Uniform pick among off-cooldown events (ChaosManager.cs:50-68) — the port
    // includes all four events, not just the levitation the shipped scene wired.
    const ready = CHAOS_EVENTS.filter((e) => (chaosRef.current.cooldowns[e.id] ?? 0) <= now);
    if (ready.length === 0) return;
    const ev = ready[Math.floor(Math.random() * ready.length)];
    chaosRef.current.active = ev.id;
    chaosRef.current.endsAt = now + CHAOS_DURATION;
    chaosRef.current.cooldowns[ev.id] = now + CHAOS_DURATION + CHAOS_COOLDOWN;
    setChaosActive(ev.id);

    if (ev.id === 'flying-food' || ev.id === 'levitate') {
      setItems((prev) => {
        const next = { ...prev };
        for (const it of Object.values(next)) {
          if (it.loc !== 'counter') continue;
          // Levitation lifts only cuttable-tagged items, like the Unity event.
          if (ev.id === 'levitate' && !INGREDIENTS[it.defId]?.cutsInto && !it.defId.startsWith('dish_')) continue;
          next[it.uid] = {
            ...it,
            loc: ev.id === 'flying-food' ? 'flying' : 'floating',
            pos: { x: rand(6, 88), y: rand(10, 62) },
          };
        }
        return next;
      });
    } else if (ev.id === 'random-scale') {
      setItems((prev) => {
        const all = Object.values(prev).filter((i) => i.loc !== 'hand');
        const chosen = [...all].sort(() => Math.random() - 0.5).slice(0, RANDOM_SCALE_MAX_ITEMS);
        const next = { ...prev };
        for (const it of chosen) next[it.uid] = { ...it, scale: rand(RANDOM_SCALE_MIN, RANDOM_SCALE_MAX) };
        return next;
      });
    }
  }, []);

  // The 0.1 s game tick (the Unity round also advances on 0.1 s steps).
  useEffect(() => {
    if (phase !== 'playing') return;
    const id = setInterval(() => {
      const dt = 0.1;
      gameTimeRef.current += dt;
      setTimeLeft((t) => t - dt);

      // Cooking on burners (HeatSource → CookableItem accumulation)
      setItems((prev) => {
        let changed = false;
        const next = { ...prev };
        for (const it of Object.values(next)) {
          if (!it.loc.startsWith('burner-') || !INGREDIENTS[it.defId]?.cookable || it.state === 'burnt') continue;
          changed = true;
          if (it.state !== 'done') {
            const p = it.cookProgress + dt / COOK_SECONDS;
            next[it.uid] = { ...it, cookProgress: Math.min(1, p), state: p >= 1 ? 'done' : 'cooking' };
          } else {
            const b = it.burnProgress + dt / BURN_SECONDS;
            next[it.uid] = { ...it, burnProgress: Math.min(1, b), state: b >= 1 ? 'burnt' : 'done' };
          }
        }
        return changed ? next : prev;
      });

      // Chaos scheduler
      const c = chaosRef.current;
      if (c.active && gameTimeRef.current >= c.endsAt) {
        endChaos();
        c.nextAt = gameTimeRef.current + rand(CHAOS_MIN_GAP, CHAOS_MAX_GAP);
      } else if (!c.active && gameTimeRef.current >= c.nextAt) {
        triggerChaos();
        if (!chaosRef.current.active) c.nextAt = gameTimeRef.current + rand(CHAOS_MIN_GAP, CHAOS_MAX_GAP);
      }
    }, 100);
    return () => clearInterval(id);
  }, [phase, endChaos, triggerChaos]);

  // Round end → judge.
  useEffect(() => {
    if (phase !== 'playing' || timeLeft > 0) return;
    endChaos();
    setItems((prev) => {
      // Mixed dishes expand to what actually went into them (see file header).
      const platedRaw = Object.values(prev).filter((i) => i.loc === 'plate');
      const expanded: PlatedItem[] = platedRaw.flatMap((i) =>
        i.contents ? i.contents : [{ defId: i.defId, state: i.state }]
      );
      const scored = applyZeroScoreFix(scorePlate(expanded));
      setResult(scored);
      setBest((b) => {
        if (scored.score > b) { writeBest(scored.score); return scored.score; }
        return b;
      });
      return prev;
    });
    setPhase('judging');
  }, [phase, timeLeft, endChaos]);

  // Judge commentary reveals line by line (AIDishJudgeController.cs:345-374), then results.
  useEffect(() => {
    if (phase !== 'judging' || !result) return;
    const total = result.commentary.length;
    if (revealCount >= total) {
      const t = setTimeout(() => setPhase('results'), total === 0 ? 400 : 1600);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setRevealCount((c) => c + 1), 1200);
    return () => clearTimeout(t);
  }, [phase, result, revealCount]);

  /* ── ESC + cleanup ───────────────────────────────────────────────── */

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      if (bookOpen) setBookOpen(false);
      else closeKitchenGame();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [bookOpen, closeKitchenGame]);

  useEffect(() => () => clearTimeout(toastTimerRef.current), []);

  /* ── Interactions (click-to-carry works for mouse and touch alike) ── */

  const spawnFromPantry = (defId: string) => {
    if (hand !== null) { say('Your hands are full — place that first.'); return; }
    const uid = uidRef.current++;
    setItems((prev) => ({ ...prev, [uid]: { uid, defId, state: 'raw', cookProgress: 0, burnProgress: 0, loc: 'hand' } }));
    setHand(uid);
  };

  const moveItem = (uid: number, loc: Loc) =>
    setItems((prev) => (prev[uid] ? { ...prev, [uid]: { ...prev[uid], loc, pos: undefined } } : prev));

  const pickUp = (uid: number) => {
    if (hand !== null) { say('Your hands are full.'); return; }
    moveItem(uid, 'hand');
    setHand(uid);
  };

  const placeHand = (loc: Loc, guard?: (item: GameItem) => string | null) => {
    if (hand === null) return;
    const item = items[hand];
    if (!item) { setHand(null); return; }
    const err = guard?.(item);
    if (err) { say(err); return; }
    moveItem(hand, loc);
    setHand(null);
  };

  const boardItem = Object.values(items).find((i) => i.loc === 'board');
  const bowlItems = Object.values(items).filter((i) => i.loc === 'bowl');
  const plateItems = Object.values(items).filter((i) => i.loc === 'plate');
  const counterItems = Object.values(items).filter((i) => i.loc === 'counter');
  const scattered = Object.values(items).filter((i) => i.loc === 'flying' || i.loc === 'floating');
  const handItem = hand !== null ? items[hand] : null;

  const cut = () => {
    if (!boardItem) return;
    if (chaosActive === 'rubber-knife' && Math.random() < RUBBER_KNIFE_SLIP_CHANCE) {
      say('The rubber knife flops right off the board!');
      return;
    }
    const halves = INGREDIENTS[boardItem.defId]?.cutsInto;
    if (!halves) return;
    setItems((prev) => {
      const next = { ...prev };
      delete next[boardItem.uid];
      for (const defId of halves) {
        const uid = uidRef.current++;
        next[uid] = { uid, defId, state: 'raw', cookProgress: 0, burnProgress: 0, loc: 'counter' };
      }
      return next;
    });
  };

  const whisk = () => {
    const now = performance.now();
    if (now - lastWhiskRef.current < WHISK_COOLDOWN_MS) return; // WhiskMixerHead cooldown
    lastWhiskRef.current = now;
    if (bowlItems.length === 0) { say('The bowl is empty.'); return; }

    // BowlRecipeCombiner.FindMatchingRecipe: all required present, nothing outside
    // required ∪ extras, ties broken by most required ingredients.
    const ids = new Set(bowlItems.map((i) => i.defId));
    let match: RecipeDef | null = null;
    for (const r of RECIPES) {
      if (!r.required.every((req) => ids.has(req.id))) continue;
      const legal = new Set([...r.required.map((x) => x.id), ...r.extras]);
      if (bowlItems.some((i) => !legal.has(i.defId))) continue;
      if (!match || r.required.length > match.required.length) match = r;
    }

    if (!match) {
      // Spit-back (BowlRecipeCombiner.cs:291-319)
      setItems((prev) => {
        const next = { ...prev };
        for (const it of bowlItems) next[it.uid] = { ...it, loc: 'counter' };
        return next;
      });
      say('The bowl rejects that combination — ingredients everywhere!');
      return;
    }

    const matched = match;
    const dishUid = uidRef.current++;
    const contents: PlatedItem[] = bowlItems.map((i) => ({ defId: i.defId, state: i.state }));
    setItems((prev) => {
      const next = { ...prev };
      for (const it of bowlItems) delete next[it.uid];
      next[dishUid] = {
        uid: dishUid, defId: matched.dishId, state: 'raw',
        cookProgress: 0, burnProgress: 0, loc: 'counter', contents,
      };
      return next;
    });
    say(`✨ ${matched.name} is ready — plate it!`);
  };

  const pantryGroups: { key: string; label: string }[] = [
    { key: 'produce', label: 'Produce' },
    { key: 'protein', label: 'Proteins' },
    { key: 'pantry', label: 'Pantry' },
    { key: 'sweets', label: 'Sweets & Drinks' },
    { key: 'junk', label: '???' },
  ];

  const anim = prefersReducedMotion ? '' : 'kc-animate';
  const chaosDef = chaosActive ? CHAOS_EVENTS.find((e) => e.id === chaosActive) : null;

  /* ── Render ──────────────────────────────────────────────────────── */

  return (
    <div className={`fixed inset-0 z-[120] flex flex-col overflow-hidden font-sans text-[#3b2a1e] ${anim}`}
      style={{ background: 'linear-gradient(180deg,#fde8cf 0%,#f8d9b8 55%,#eec49b 100%)' }}>
      <style>{`
        @keyframes kcFloat { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-14px); } }
        @keyframes kcWobble { 0%,100% { transform: rotate(-6deg); } 50% { transform: rotate(8deg); } }
        @keyframes kcBanner { 0%,66% { opacity: 1; } 100% { opacity: 0; } }
        .kc-animate .kc-scatter { animation: kcFloat 1.6s ease-in-out infinite; }
        .kc-animate .kc-wobble { animation: kcWobble 0.5s ease-in-out infinite; }
        .kc-animate .kc-chaos-banner { animation: kcBanner 3s linear forwards; }
      `}</style>

      {/* ── HUD ── */}
      <header className="flex items-center gap-3 border-b-2 border-[#c8933f]/40 bg-[#fff6e9]/80 px-4 py-2 backdrop-blur">
        <span className="text-2xl" aria-hidden>👨‍🍳</span>
        <div className="min-w-0">
          <h1 className="font-bold leading-tight">Kitchen Chaos</h1>
          {phase === 'playing' && <p className="truncate text-[11px] opacity-70">Theme: {theme}</p>}
        </div>
        <div className="ml-auto flex items-center gap-2">
          {phase === 'playing' && (
            <div className={`rounded-full px-4 py-1 font-mono text-lg font-bold tabular-nums ${timeLeft <= 15 ? 'bg-red-600 text-white' : 'bg-[#3b2a1e] text-amber-200'}`}>
              {fmt(timeLeft)}
            </div>
          )}
          <button
            type="button"
            onClick={() => setBookOpen((v) => !v)}
            className="rounded-full border-2 border-[#3b2a1e]/30 bg-white/70 px-3 py-1 text-sm font-semibold hover:bg-white"
            aria-expanded={bookOpen}
          >
            📖 Recipes
          </button>
          <button
            type="button"
            onClick={closeKitchenGame}
            aria-label="Exit Kitchen Chaos"
            className="rounded-full border-2 border-[#3b2a1e]/30 bg-white/70 px-3 py-1 text-sm font-semibold hover:bg-white"
          >
            ✕
          </button>
        </div>
      </header>

      {/* Chaos banner: full alpha ~2 s then 1 s fade (ChaosUI.cs timing, re-enabled) */}
      {chaosDef && (
        <div key={chaosDef.id + String(Math.round(chaosRef.current.endsAt))} className="kc-chaos-banner pointer-events-none absolute left-1/2 top-16 z-20 -translate-x-1/2 rounded-2xl bg-red-600/95 px-6 py-3 text-center text-white shadow-xl">
          <p className="text-lg font-extrabold tracking-wide">⚡ {chaosDef.name}!</p>
          <p className="text-xs opacity-90">{chaosDef.blurb}</p>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className="pointer-events-none absolute bottom-24 left-1/2 z-30 -translate-x-1/2 rounded-full bg-[#3b2a1e] px-5 py-2 text-sm font-semibold text-amber-100 shadow-lg" role="status">
          {toast}
        </div>
      )}

      {/* Scattered (chaos) items fly above everything */}
      {scattered.map((it) => (
        <div key={it.uid} className="kc-scatter absolute z-20" style={{ left: `${it.pos?.x ?? 50}%`, top: `${it.pos?.y ?? 40}%`, animationDelay: `${(it.uid % 7) * 0.2}s` }}>
          <ItemChip item={it} onClick={() => moveItem(it.uid, 'counter')} title={`Recover ${itemVisual(it).name}`} />
        </div>
      ))}

      {/* ── Screens ── */}
      {phase === 'menu' && (
        <div className="flex flex-1 flex-col items-center justify-center gap-6 px-6 text-center">
          <p className="text-7xl" aria-hidden>🍳</p>
          <h2 className="text-4xl font-extrabold">Kitchen Chaos</h2>
          <p className="max-w-md text-sm opacity-80">
            Two minutes. Eight recipes. A kitchen that actively fights back.
            Cut, cook, whisk, and plate the best dish you can before the timer —
            and the flying groceries — get the better of you.
          </p>
          <p className="text-xs font-semibold uppercase tracking-widest opacity-60">Best score: {best.toFixed(0)}</p>
          <button
            type="button"
            onClick={startRound}
            className="rounded-2xl bg-[#d36c4f] px-10 py-4 text-xl font-extrabold text-white shadow-[0_6px_0_#b4543a] transition-transform hover:scale-105 active:translate-y-1 active:shadow-none"
          >
            ▶ Start Round
          </button>
          <p className="text-xs opacity-60">Ported from my Unity VR final project — same recipes, timings, scoring, and chaos.</p>
        </div>
      )}

      {phase === 'theme' && (
        <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] opacity-60">Tonight's theme is</p>
          <h2 className="max-w-xl text-5xl font-extrabold leading-tight">{theme}</h2>
          <p className="mt-4 animate-pulse text-sm opacity-70">Get ready…</p>
        </div>
      )}

      {phase === 'playing' && (
        <div className="flex min-h-0 flex-1 flex-col gap-2 p-2 sm:flex-row sm:gap-3 sm:p-3">
          {/* Pantry */}
          <aside className="order-2 max-h-36 shrink-0 overflow-y-auto rounded-2xl border-2 border-[#c8933f]/40 bg-[#fff6e9]/70 p-2 sm:order-1 sm:max-h-none sm:w-52">
            <h3 className="mb-1 text-xs font-extrabold uppercase tracking-widest opacity-60">Pantry</h3>
            {pantryGroups.map((g) => (
              <div key={g.key} className="mb-2">
                <p className="mb-1 text-[10px] font-bold uppercase tracking-wider opacity-50">{g.label}</p>
                <div className="flex flex-wrap gap-1">
                  {Object.values(INGREDIENTS).filter((d) => d.pantry && d.group === g.key).map((d) => (
                    <button
                      key={d.id}
                      type="button"
                      onClick={() => spawnFromPantry(d.id)}
                      title={d.name}
                      aria-label={`Take ${d.name}`}
                      className="rounded-lg border border-black/10 bg-white/80 p-1 text-xl leading-none transition-transform hover:scale-110"
                    >
                      {d.emoji}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </aside>

          {/* Stations */}
          <main className="order-1 flex min-h-0 min-w-0 flex-1 flex-col gap-2 sm:order-2 sm:gap-3">
            <div className="grid flex-1 grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3">
              {/* Cutting board */}
              <section
                className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-[#c8933f]/40 bg-[#f3e0c2] p-2"
                onClick={() => !boardItem && placeHand('board', (i) => (INGREDIENTS[i.defId]?.cutsInto ? null : `${itemVisual(i).name} can't be cut.`))}
              >
                <h3 className="text-xs font-extrabold uppercase tracking-widest opacity-60">Cutting Board</h3>
                {boardItem ? (
                  <>
                    <ItemChip item={boardItem} onClick={() => pickUp(boardItem.uid)} />
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); cut(); }}
                      className={`rounded-xl bg-[#3b2a1e] px-4 py-1.5 text-sm font-bold text-amber-100 hover:bg-[#57402d] ${chaosActive === 'rubber-knife' ? 'kc-wobble' : ''}`}
                    >
                      🔪 Cut
                    </button>
                  </>
                ) : (
                  <p className="text-center text-[11px] opacity-50">{handItem ? 'Place to cut' : 'Empty'}</p>
                )}
              </section>

              {/* Burners */}
              <section className="col-span-2 flex flex-col gap-1 rounded-2xl border-2 border-[#c8933f]/40 bg-[#e8d0ae] p-2">
                <h3 className="text-xs font-extrabold uppercase tracking-widest opacity-60">Stove</h3>
                <div className="grid flex-1 grid-cols-4 gap-1.5">
                  {Array.from({ length: BURNER_COUNT }, (_, i) => {
                    const loc = `burner-${i}` as Loc;
                    const it = Object.values(items).find((x) => x.loc === loc);
                    return (
                      <div
                        key={i}
                        className="flex cursor-pointer flex-col items-center justify-center gap-1 rounded-xl bg-[#3b2a1e]/85 p-1.5"
                        onClick={() => !it && placeHand(loc, (x) => (INGREDIENTS[x.defId]?.cookable ? null : `${itemVisual(x).name} doesn't cook.`))}
                      >
                        {it ? (
                          <>
                            <ItemChip item={it} size={34} onClick={() => pickUp(it.uid)} />
                            <div className="h-1.5 w-full overflow-hidden rounded-full bg-black/40">
                              <div
                                className={`h-full transition-all ${it.state === 'done' ? 'bg-red-500' : it.state === 'burnt' ? 'bg-neutral-600' : 'bg-emerald-400'}`}
                                style={{ width: `${(it.state === 'done' ? it.burnProgress : it.state === 'burnt' ? 1 : it.cookProgress) * 100}%` }}
                                aria-hidden
                              />
                            </div>
                          </>
                        ) : (
                          <span className="text-xl opacity-60" aria-hidden>🔥</span>
                        )}
                      </div>
                    );
                  })}
                </div>
                <p className="text-center text-[10px] opacity-50">Done in {COOK_SECONDS}s — burnt {BURN_SECONDS.toFixed(1)}s later. Watch the red bar!</p>
              </section>

              {/* Bowl */}
              <section
                className="flex cursor-pointer flex-col items-center gap-1.5 rounded-2xl border-2 border-[#c8933f]/40 bg-[#f3e0c2] p-2"
                onClick={() => placeHand('bowl')}
              >
                <h3 className="text-xs font-extrabold uppercase tracking-widest opacity-60">Mixing Bowl 🥣</h3>
                <div className="flex min-h-10 flex-wrap items-center justify-center gap-1">
                  {bowlItems.length === 0 && <p className="text-[11px] opacity-50">{handItem ? 'Place to add' : 'Empty'}</p>}
                  {bowlItems.map((it) => (
                    <ItemChip key={it.uid} item={it} size={26} onClick={() => moveItem(it.uid, 'counter')} title={`Remove ${itemVisual(it).name}`} />
                  ))}
                </div>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); whisk(); }}
                  className="mt-auto rounded-xl bg-[#d36c4f] px-4 py-1.5 text-sm font-extrabold text-white shadow-[0_3px_0_#b4543a] hover:brightness-110 active:translate-y-0.5 active:shadow-none"
                >
                  🥄 Whisk!
                </button>
              </section>
            </div>

            {/* Counter */}
            <section
              className="min-h-20 cursor-pointer rounded-2xl border-2 border-[#c8933f]/40 bg-[#fff6e9]/70 p-2"
              onClick={() => placeHand('counter')}
            >
              <h3 className="text-xs font-extrabold uppercase tracking-widest opacity-60">Counter</h3>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {counterItems.length === 0 && <p className="text-[11px] opacity-50">{handItem ? 'Click to put down' : 'Grab something from the pantry'}</p>}
                {counterItems.map((it) => (
                  <ItemChip key={it.uid} item={it} size={36} onClick={() => pickUp(it.uid)} />
                ))}
              </div>
            </section>
          </main>

          {/* Plate + hand + trash */}
          <aside className="order-3 flex shrink-0 flex-row gap-2 sm:w-44 sm:flex-col sm:gap-3">
            <section
              className="flex flex-1 cursor-pointer flex-col items-center gap-1.5 rounded-2xl border-4 border-white bg-[#fdfaf4] p-2 shadow-inner"
              onClick={() => placeHand('plate')}
            >
              <h3 className="text-xs font-extrabold uppercase tracking-widest opacity-60">Plate 🍽️</h3>
              <p className="text-[10px] opacity-50">This is what gets judged</p>
              <div className="flex flex-wrap items-center justify-center gap-1">
                {plateItems.map((it) => (
                  <ItemChip key={it.uid} item={it} size={30} onClick={() => moveItem(it.uid, 'counter')} title={`Remove ${itemVisual(it).name}`} />
                ))}
              </div>
            </section>
            <div className="flex flex-col items-center gap-2">
              <div className="rounded-2xl border-2 border-[#c8933f]/40 bg-[#fff6e9]/70 px-3 py-2 text-center">
                <p className="text-[10px] font-bold uppercase tracking-widest opacity-60">In hand</p>
                {handItem ? <ItemChip item={handItem} size={34} onClick={() => placeHand('counter')} /> : <p className="text-lg opacity-40" aria-hidden>🤲</p>}
              </div>
              <button
                type="button"
                onClick={() => {
                  if (hand === null) { say('Pick something up to trash it.'); return; }
                  const uid = hand;
                  setItems((prev) => { const next = { ...prev }; delete next[uid]; return next; });
                  setHand(null);
                }}
                className="rounded-xl border-2 border-[#3b2a1e]/20 bg-white/60 px-3 py-1.5 text-sm hover:bg-white"
              >
                🗑️ Trash
              </button>
            </div>
          </aside>
        </div>
      )}

      {(phase === 'judging' || phase === 'results') && result && (
        <div className="flex flex-1 flex-col items-center justify-center gap-4 overflow-y-auto px-6 py-8 text-center">
          <p className="text-5xl" aria-hidden>🧑‍⚖️</p>
          <h2 className="text-2xl font-extrabold">The judge considers your {result.dishName}…</h2>
          <div className="min-h-24 max-w-xl space-y-2">
            {result.commentary.slice(0, phase === 'results' ? undefined : revealCount).map((line, i) => (
              <p key={i} className="text-[15px] italic leading-relaxed opacity-90">“{line}”</p>
            ))}
          </div>
          {phase === 'judging' && (
            <button type="button" onClick={() => setPhase('results')} className="text-xs underline opacity-60 hover:opacity-100">
              Skip
            </button>
          )}
          {phase === 'results' && (
            <>
              <p className="text-6xl font-extrabold tabular-nums">{result.score.toFixed(1)}</p>
              <p className="text-sm font-semibold opacity-70">
                {result.score >= best && best > 0 ? '🏆 New best score!' : `Best: ${best.toFixed(1)}`}
              </p>
              <details className="max-w-md text-left text-xs opacity-80">
                <summary className="cursor-pointer text-center font-bold">Score breakdown</summary>
                <ul className="mt-2 space-y-0.5 font-mono">
                  {result.breakdown.map((l, i) => <li key={i}>{l}</li>)}
                </ul>
              </details>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={startRound}
                  className="rounded-2xl bg-[#d36c4f] px-8 py-3 text-lg font-extrabold text-white shadow-[0_5px_0_#b4543a] hover:brightness-110 active:translate-y-1 active:shadow-none"
                >
                  ↻ Play Again
                </button>
                <button
                  type="button"
                  onClick={closeKitchenGame}
                  className="rounded-2xl border-2 border-[#3b2a1e]/30 bg-white/70 px-8 py-3 text-lg font-bold hover:bg-white"
                >
                  Exit
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {/* ── Recipe book overlay (RecipeBookManager/Pages, prev/next wrapping) ── */}
      {bookOpen && (
        <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/50 p-4" onClick={() => setBookOpen(false)}>
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Recipe book"
            className="max-h-full w-full max-w-md overflow-y-auto rounded-3xl border-4 border-[#c8933f] bg-[#fffaf0] p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {(() => {
              const r = RECIPES[bookPage];
              return (
                <>
                  <div className="mb-3 flex items-center justify-between">
                    <h2 className="text-xl font-extrabold">{r.emoji} {r.name}</h2>
                    <span className="font-mono text-xs opacity-60">{bookPage + 1} / {RECIPES.length}</span>
                  </div>
                  <p className="text-[11px] font-bold uppercase tracking-widest opacity-60">Required</p>
                  <p className="mb-2 text-sm">
                    {r.required.map((req) => `${INGREDIENTS[req.id]?.emoji ?? ''} ${INGREDIENTS[req.id]?.name ?? req.id}${req.wantDone ? ' (cooked)' : ''}`).join(' · ')}
                  </p>
                  <p className="text-[11px] font-bold uppercase tracking-widest opacity-60">Extra credit</p>
                  <p className="mb-2 text-sm">
                    {r.extras.map((id) => `${INGREDIENTS[id]?.emoji ?? ''} ${INGREDIENTS[id]?.name ?? id}`).join(' · ')}
                  </p>
                  <p className="text-[11px] font-bold uppercase tracking-widest opacity-60">Instructions</p>
                  <ol className="mb-4 list-decimal space-y-1 pl-5 text-sm">
                    {r.steps.map((s, i) => <li key={i}>{s}</li>)}
                  </ol>
                  <div className="flex items-center justify-between">
                    <button type="button" onClick={() => setBookPage((p) => (p - 1 + RECIPES.length) % RECIPES.length)} className="rounded-xl border-2 border-[#3b2a1e]/20 px-4 py-1.5 font-bold hover:bg-black/5">← Prev</button>
                    <button type="button" onClick={() => setBookOpen(false)} className="text-xs underline opacity-60 hover:opacity-100">Close</button>
                    <button type="button" onClick={() => setBookPage((p) => (p + 1) % RECIPES.length)} className="rounded-xl border-2 border-[#3b2a1e]/20 px-4 py-1.5 font-bold hover:bg-black/5">Next →</button>
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
}
