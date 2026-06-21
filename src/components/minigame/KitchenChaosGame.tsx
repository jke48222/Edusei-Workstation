/**
 * @file KitchenChaosGame.tsx
 * @description Self-contained, click-driven "Kitchen Chaos" mini-game — a web demake of
 * Jalen's Meta Quest 3 VR cooking game. Players build sushi dishes (Onigiri, Maki, Nigiri,
 * Salmon Roll) from ingredients to fulfil a queue of orders before the timer runs out,
 * while periodic chaos events (Levitating Items, Flying Pantry, Gravity Tilt, Giant Utensils)
 * disrupt the kitchen. Pure DOM + framer-motion; no physics engine. Launched from the 3D
 * Quest 3 headset in the workstation scene.
 */

import { useCallback, useEffect, useReducer, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWorkstationStore } from '../../store/store';

const GITHUB_URL = 'https://github.com/jke48222/VR-Final-Project';
const BEST_KEY = 'kitchen-chaos-best';
const ROUND_TIME = 90; // seconds

// ── Content ─────────────────────────────────────────────────────────────────
type IngredientId = 'rice' | 'nori' | 'salmon' | 'cucumber' | 'avocado';

const INGREDIENTS: Record<IngredientId, { name: string; emoji: string; color: string }> = {
  rice: { name: 'Rice', emoji: '🍚', color: '#f6efe0' },
  nori: { name: 'Nori', emoji: '🟩', color: '#3f5a34' },
  salmon: { name: 'Salmon', emoji: '🐟', color: '#e8896b' },
  cucumber: { name: 'Cucumber', emoji: '🥒', color: '#8aa86a' },
  avocado: { name: 'Avocado', emoji: '🥑', color: '#6f8f4e' },
};
const INGREDIENT_ORDER: IngredientId[] = ['rice', 'nori', 'salmon', 'cucumber', 'avocado'];

type DishKey = 'onigiri' | 'maki' | 'nigiri' | 'salmonRoll';
const DISHES: Record<DishKey, { name: string; emoji: string; req: IngredientId[] }> = {
  onigiri: { name: 'Onigiri', emoji: '🍙', req: ['rice', 'nori'] },
  maki: { name: 'Maki', emoji: '🍣', req: ['rice', 'nori', 'cucumber'] },
  nigiri: { name: 'Nigiri', emoji: '🍣', req: ['rice', 'salmon'] },
  salmonRoll: { name: 'Salmon Roll', emoji: '🍥', req: ['rice', 'nori', 'salmon'] },
};
const DISH_KEYS = Object.keys(DISHES) as DishKey[];
const TICKET_COLORS = ['#e2725b', '#6f9b53', '#5b86c2', '#d29b3e'];

type ChaosType = 'levitate' | 'shuffle' | 'tilt' | 'giant';
const CHAOS: Record<ChaosType, { label: string; tag: string }> = {
  levitate: { label: 'Levitating Items!', tag: 'Ingredients float away' },
  shuffle: { label: 'Flying Pantry!', tag: 'The pantry keeps moving' },
  tilt: { label: 'Gravity Tilt!', tag: 'The kitchen is sliding' },
  giant: { label: 'Giant Utensils!', tag: 'Everything is huge' },
};
const CHAOS_KEYS = Object.keys(CHAOS) as ChaosType[];

interface Order {
  id: number;
  dish: DishKey;
  color: string;
  bornAt: number; // elapsed seconds when spawned
  patience: number; // seconds allowed
}

// ── Helpers ─────────────────────────────────────────────────────────────────
const sortedKey = (ids: IngredientId[]) => [...ids].sort().join(',');
const isSubset = (plate: IngredientId[], req: IngredientId[]) => {
  const pool = [...req];
  for (const p of plate) {
    const i = pool.indexOf(p);
    if (i === -1) return false;
    pool.splice(i, 1);
  }
  return true;
};

// ── Game state (kept in a ref, mirrored to React via a tick) ────────────────
interface GameRef {
  phase: 'boot' | 'playing' | 'over';
  elapsed: number;
  timeLeft: number;
  score: number;
  combo: number;
  served: number;
  best: number;
  orders: Order[];
  plate: IngredientId[];
  chaos: ChaosType | null;
  chaosEndsAt: number;
  nextChaosAt: number;
  nextOrderAt: number;
  seq: number;
  flash: 'good' | 'bad' | null;
  flashUntil: number;
  shuffleOrder: IngredientId[];
  nextShuffleAt: number;
}

function freshGame(best: number): GameRef {
  return {
    phase: 'boot',
    elapsed: 0,
    timeLeft: ROUND_TIME,
    score: 0,
    combo: 0,
    served: 0,
    best,
    orders: [],
    plate: [],
    chaos: null,
    chaosEndsAt: 0,
    nextChaosAt: 14,
    nextOrderAt: 0,
    seq: 0,
    flash: null,
    flashUntil: 0,
    shuffleOrder: [...INGREDIENT_ORDER],
    nextShuffleAt: 0,
  };
}

function spawnOrder(g: GameRef) {
  const dish = DISH_KEYS[Math.floor(Math.random() * DISH_KEYS.length)];
  // Difficulty: patience shrinks as the round progresses.
  const patience = Math.max(8, 18 - g.elapsed * 0.07);
  g.orders.push({
    id: g.seq++,
    dish,
    color: TICKET_COLORS[g.seq % TICKET_COLORS.length],
    bornAt: g.elapsed,
    patience,
  });
}

export function KitchenChaosGame() {
  const close = useWorkstationStore((s) => s.closeKitchenGame);
  const reducedMotion = useWorkstationStore((s) => s.prefersReducedMotion);

  const best = (() => {
    try { return Number(localStorage.getItem(BEST_KEY)) || 0; } catch { return 0; }
  })();

  const g = useRef<GameRef>(freshGame(best));
  const [, render] = useReducer((x) => x + 1, 0);

  const start = useCallback(() => {
    const prevBest = g.current.best;
    g.current = freshGame(prevBest);
    g.current.phase = 'playing';
    // Seed a couple of orders.
    spawnOrder(g.current);
    g.current.nextOrderAt = 3;
    render();
  }, []);

  // Boot → auto-start after the headset animation.
  useEffect(() => {
    const t = setTimeout(() => { if (g.current.phase === 'boot') start(); }, reducedMotion ? 600 : 2200);
    return () => clearTimeout(t);
  }, [start, reducedMotion]);

  // Master game loop.
  useEffect(() => {
    const STEP = 0.1;
    const id = setInterval(() => {
      const s = g.current;
      if (s.phase !== 'playing') return;

      s.elapsed += STEP;
      s.timeLeft = Math.max(0, s.timeLeft - STEP);

      // Clear stale "good/bad" flash.
      if (s.flash && s.elapsed >= s.flashUntil) s.flash = null;

      // Order expiry.
      const before = s.orders.length;
      s.orders = s.orders.filter((o) => s.elapsed - o.bornAt < o.patience);
      if (s.orders.length < before) {
        s.combo = 0;
        s.score = Math.max(0, s.score - 25);
        s.flash = 'bad';
        s.flashUntil = s.elapsed + 0.4;
      }

      // Spawn orders, scaling the active queue up over time.
      const maxOrders = Math.min(4, 2 + Math.floor(s.elapsed / 30));
      if (s.orders.length < maxOrders && s.elapsed >= s.nextOrderAt) {
        spawnOrder(s);
        s.nextOrderAt = s.elapsed + Math.max(2.2, 5 - s.elapsed * 0.02);
      }

      // Chaos lifecycle.
      if (!s.chaos && s.elapsed >= s.nextChaosAt) {
        s.chaos = CHAOS_KEYS[Math.floor(Math.random() * CHAOS_KEYS.length)];
        s.chaosEndsAt = s.elapsed + 6.5;
        s.nextShuffleAt = s.elapsed + 1.4;
      } else if (s.chaos && s.elapsed >= s.chaosEndsAt) {
        s.chaos = null;
        s.shuffleOrder = [...INGREDIENT_ORDER];
        s.nextChaosAt = s.elapsed + 16 + Math.random() * 8;
      }
      if (s.chaos === 'shuffle' && s.elapsed >= s.nextShuffleAt) {
        s.shuffleOrder = [...s.shuffleOrder].sort(() => Math.random() - 0.5);
        s.nextShuffleAt = s.elapsed + 1.4;
      }

      // End of round.
      if (s.timeLeft <= 0) {
        s.phase = 'over';
        if (s.score > s.best) {
          s.best = s.score;
          try { localStorage.setItem(BEST_KEY, String(s.score)); } catch { /* ignore */ }
        }
      }
      render();
    }, 100);
    return () => clearInterval(id);
  }, []);

  // ESC closes the game.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') close(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [close]);

  const addIngredient = useCallback((ing: IngredientId) => {
    const s = g.current;
    if (s.phase !== 'playing') return;
    const plate = [...s.plate, ing];

    // Exact match against any active order → serve it.
    const key = sortedKey(plate);
    const matchIdx = s.orders.findIndex((o) => sortedKey(DISHES[o.dish].req) === key);
    if (matchIdx !== -1) {
      s.orders.splice(matchIdx, 1);
      s.combo += 1;
      s.served += 1;
      s.score += 100 * s.combo;
      s.plate = [];
      s.flash = 'good';
      s.flashUntil = s.elapsed + 0.4;
      render();
      return;
    }

    // Still a valid prefix of some order → keep building.
    const stillValid = s.orders.some((o) => isSubset(plate, DISHES[o.dish].req));
    if (stillValid) {
      s.plate = plate;
    } else {
      // Dead-end → mistake.
      s.plate = [];
      s.combo = 0;
      s.score = Math.max(0, s.score - 50);
      s.flash = 'bad';
      s.flashUntil = s.elapsed + 0.4;
    }
    render();
  }, []);

  const trash = useCallback(() => { g.current.plate = []; render(); }, []);

  const s = g.current;
  const chaosInfo = s.chaos ? CHAOS[s.chaos] : null;
  const tilt = s.chaos === 'tilt' && !reducedMotion;

  return (
    <motion.div
      className="kc-root"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
    >
      <style>{KC_CSS}</style>

      {/* Top-right HUD */}
      {s.phase === 'playing' && (
        <div className="kc-hud">
          <div className="kc-timer">
            <span className="kc-clock">⏱</span>
            <span className={`kc-score ${s.flash === 'good' ? 'pop' : ''}`}>{s.score}</span>
            <span className="kc-fire">🔥</span>
          </div>
          {s.combo > 1 && (
            <motion.div key={s.combo} className="kc-combo" initial={{ scale: 1.4 }} animate={{ scale: 1 }}>
              x{s.combo} <span>Combo</span>
            </motion.div>
          )}
        </div>
      )}

      {/* Time bar */}
      {s.phase === 'playing' && (
        <div className="kc-timebar"><div className="kc-timebar-fill" style={{ width: `${(s.timeLeft / ROUND_TIME) * 100}%` }} /></div>
      )}

      {/* Order rail */}
      {s.phase === 'playing' && (
        <div className="kc-orders">
          <AnimatePresence>
            {s.orders.map((o) => {
              const remain = Math.max(0, 1 - (s.elapsed - o.bornAt) / o.patience);
              const dish = DISHES[o.dish];
              return (
                <motion.div
                  key={o.id}
                  className="kc-ticket"
                  initial={{ y: -60, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -20, opacity: 0, scale: 0.8 }}
                  layout
                >
                  <div className="kc-ticket-bar" style={{ background: o.color, width: `${remain * 100}%` }} />
                  <div className="kc-ticket-emoji">{dish.emoji}</div>
                  <div className="kc-ticket-name">{dish.name}</div>
                  <div className="kc-ticket-dots">
                    {dish.req.map((r, i) => (
                      <span key={i} className="kc-dot" style={{ background: INGREDIENTS[r].color }} />
                    ))}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* Chaos banner */}
      <AnimatePresence>
        {chaosInfo && (
          <motion.div
            className="kc-chaos"
            initial={{ y: -30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <strong>{chaosInfo.label}</strong>
            <span>{chaosInfo.tag}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Kitchen board */}
      <motion.div
        className="kc-board"
        animate={tilt ? { rotate: [0, 2.5, -2.5, 0] } : { rotate: 0 }}
        transition={tilt ? { duration: 2.2, repeat: Infinity, ease: 'easeInOut' } : { duration: 0.3 }}
      >
        {/* Prep plate */}
        <div className="kc-prep">
          <div className="kc-prep-label">Prep</div>
          <div className="kc-prep-slots">
            <AnimatePresence>
              {s.plate.length === 0 && <span className="kc-prep-empty">Tap ingredients →</span>}
              {s.plate.map((p, i) => (
                <motion.span
                  key={`${p}-${i}`}
                  className="kc-prep-item"
                  initial={{ scale: 0, y: 20 }}
                  animate={{ scale: 1, y: 0 }}
                  exit={{ scale: 0 }}
                >
                  {INGREDIENTS[p].emoji === '🟩' ? <span className="kc-nori-chip" /> : INGREDIENTS[p].emoji}
                </motion.span>
              ))}
            </AnimatePresence>
          </div>
          {s.plate.length > 0 && <button className="kc-trash" onClick={trash}>✕ Toss</button>}
        </div>

        {/* Ingredient stations */}
        <div className={`kc-stations ${s.chaos === 'levitate' && !reducedMotion ? 'levitate' : ''} ${s.chaos === 'giant' && !reducedMotion ? 'giant' : ''}`}>
          {s.shuffleOrder.map((ing, idx) => {
            const meta = INGREDIENTS[ing];
            return (
              <motion.button
                key={ing}
                layout={s.chaos === 'shuffle'}
                className="kc-station"
                onClick={() => addIngredient(ing)}
                whileTap={{ scale: 0.9 }}
                style={{ ['--kc-delay' as string]: `${idx * 0.3}s` }}
              >
                <span className="kc-station-emoji">
                  {meta.emoji === '🟩' ? <span className="kc-nori-chip big" /> : meta.emoji}
                </span>
                <span className="kc-station-name" style={{ color: meta.color === '#f6efe0' ? '#7a6a4f' : meta.color }}>{meta.name}</span>
              </motion.button>
            );
          })}
        </div>
      </motion.div>

      {/* Mistake / serve flash overlay */}
      <AnimatePresence>
        {s.flash && (
          <motion.div
            key={s.flashUntil}
            className={`kc-flash ${s.flash}`}
            initial={{ opacity: 0.5 }}
            animate={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
          />
        )}
      </AnimatePresence>

      {/* Boot screen */}
      <AnimatePresence>
        {s.phase === 'boot' && (
          <motion.div className="kc-screen" exit={{ opacity: 0 }}>
            <motion.div
              className="kc-visor"
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.6 }}
            >🥽</motion.div>
            <div className="kc-boot-title">PUTTING ON THE HEADSET…</div>
            <div className="kc-boot-sub">Loading Kitchen Chaos</div>
            <div className="kc-boot-bar"><motion.div initial={{ width: 0 }} animate={{ width: '100%' }} transition={{ duration: reducedMotion ? 0.5 : 2 }} /></div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Game over */}
      <AnimatePresence>
        {s.phase === 'over' && (
          <motion.div className="kc-screen over" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="kc-over-emoji">🍣</div>
            <div className="kc-over-title">Service Over!</div>
            <div className="kc-over-score">{s.score}</div>
            <div className="kc-over-stats">{s.served} dishes served · best {s.best}</div>
            <div className="kc-over-actions">
              <button className="kc-btn primary" onClick={start}>↺ Play again</button>
              <a className="kc-btn" href={GITHUB_URL} target="_blank" rel="noreferrer">⌥ See the real Quest 3 build</a>
              <button className="kc-btn ghost" onClick={close}>Exit</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Persistent exit */}
      <button className="kc-exit" onClick={close} aria-label="Exit game">✕</button>
    </motion.div>
  );
}

// ── Styles ──────────────────────────────────────────────────────────────────
const KC_CSS = `
.kc-root{position:fixed;inset:0;z-index:60;display:flex;flex-direction:column;align-items:center;justify-content:center;
  font-family:'Nunito',ui-rounded,'Segoe UI',system-ui,sans-serif;color:#5b4a36;overflow:hidden;background-color:#f0d6ad;
  background:radial-gradient(130% 120% at 50% 12%,#fdf3e0 0%,#f0d6ad 45%,#e0b07f 100%);}
.kc-root *{box-sizing:border-box;}
.kc-hud{position:absolute;top:60px;right:24px;display:flex;flex-direction:column;align-items:flex-end;gap:8px;z-index:5;}
.kc-timer{display:flex;align-items:center;gap:10px;background:#fff7ea;border:2px solid #e7d3ad;border-radius:18px;
  padding:8px 16px;box-shadow:0 6px 0 #d8b98a,0 10px 18px rgba(120,80,30,.25);font-weight:800;font-size:26px;}
.kc-clock{font-size:22px;}.kc-fire{font-size:20px;}
.kc-score{min-width:54px;text-align:right;transition:transform .15s;}
.kc-score.pop{transform:scale(1.25);color:#d9722f;}
.kc-combo{background:linear-gradient(#b07cff,#8a5cf0);color:#fff;font-weight:800;border-radius:16px;padding:5px 14px;
  font-size:18px;box-shadow:0 4px 0 #6b46c8;}
.kc-combo span{font-size:11px;opacity:.85;display:block;line-height:1;margin-top:-2px;}
.kc-timebar{position:absolute;top:0;left:0;right:0;height:7px;background:rgba(120,80,30,.18);z-index:5;}
.kc-timebar-fill{height:100%;background:linear-gradient(90deg,#7ec46b,#e2c14e,#e0795f);transition:width .1s linear;}
.kc-orders{position:absolute;top:20px;left:24px;display:flex;gap:12px;z-index:5;}
.kc-ticket{position:relative;width:108px;background:#fffaf0;border:2px solid #ecd9b6;border-radius:16px;padding:14px 8px 10px;
  display:flex;flex-direction:column;align-items:center;box-shadow:0 6px 0 #ddc096,0 10px 16px rgba(120,80,30,.2);overflow:hidden;}
.kc-ticket-bar{position:absolute;top:0;left:0;height:6px;transition:width .1s linear;}
.kc-ticket-emoji{font-size:34px;line-height:1;}
.kc-ticket-name{font-weight:800;font-size:15px;margin-top:2px;}
.kc-ticket-dots{display:flex;gap:5px;margin-top:7px;}
.kc-dot{width:13px;height:13px;border-radius:50%;box-shadow:inset 0 -2px 0 rgba(0,0,0,.18);}
.kc-chaos{position:absolute;top:120px;left:50%;transform:translateX(-50%);z-index:6;text-align:center;
  background:#ffe7d6;border:3px solid #e8896b;border-radius:18px;padding:8px 22px;box-shadow:0 6px 0 #d36c4f;}
.kc-chaos strong{display:block;color:#cf5436;font-size:22px;font-weight:900;letter-spacing:.3px;}
.kc-chaos span{font-size:13px;color:#9a6b53;}
.kc-board{display:flex;flex-direction:column;align-items:center;gap:26px;padding:30px;border-radius:34px;
  background:linear-gradient(#ecca9d,#e2b884);border:5px solid #cf9a64;
  box-shadow:0 18px 0 #b9824f,0 30px 50px rgba(120,70,20,.35);}
.kc-prep{display:flex;flex-direction:column;align-items:center;gap:8px;background:#f3e3c6;border:4px solid #d8b482;
  border-radius:24px;padding:14px 26px;min-width:330px;box-shadow:inset 0 4px 10px rgba(150,100,40,.25);}
.kc-prep-label{font-size:12px;font-weight:800;letter-spacing:2px;color:#a98a5d;text-transform:uppercase;}
.kc-prep-slots{display:flex;gap:10px;align-items:center;min-height:46px;font-size:38px;}
.kc-prep-empty{font-size:15px;color:#b59a6f;font-weight:700;}
.kc-prep-item{filter:drop-shadow(0 4px 4px rgba(120,80,30,.3));}
.kc-trash{background:#e8896b;color:#fff;border:none;border-radius:12px;padding:4px 14px;font-weight:800;font-size:13px;
  cursor:pointer;box-shadow:0 3px 0 #c5654a;}
.kc-stations{display:flex;gap:16px;flex-wrap:wrap;justify-content:center;max-width:560px;}
.kc-station{display:flex;flex-direction:column;align-items:center;gap:6px;width:96px;padding:16px 8px 12px;cursor:pointer;
  background:linear-gradient(#fffaf0,#f6e8cd);border:4px solid #e3cda3;border-radius:22px;
  box-shadow:0 8px 0 #cdb083,0 14px 20px rgba(120,80,30,.25);transition:transform .12s,box-shadow .12s;}
.kc-station:hover{transform:translateY(-3px);box-shadow:0 11px 0 #cdb083,0 18px 24px rgba(120,80,30,.3);}
.kc-station:active{transform:translateY(4px);box-shadow:0 4px 0 #cdb083;}
.kc-station-emoji{font-size:46px;line-height:1;filter:drop-shadow(0 5px 4px rgba(120,80,30,.3));}
.kc-station-name{font-weight:800;font-size:14px;}
.kc-nori-chip{display:inline-block;width:26px;height:30px;border-radius:5px;background:linear-gradient(135deg,#46603a,#2f4327);
  box-shadow:inset 0 -3px 0 rgba(0,0,0,.25);}
.kc-nori-chip.big{width:36px;height:42px;}
.kc-stations.levitate .kc-station{animation:kc-float 2.6s ease-in-out infinite;animation-delay:var(--kc-delay);}
@keyframes kc-float{0%,100%{transform:translateY(0) rotate(0)}25%{transform:translateY(-16px) rotate(-3deg)}
  50%{transform:translateY(-26px) rotate(2deg)}75%{transform:translateY(-12px) rotate(3deg)}}
.kc-stations.giant .kc-station{animation:kc-giant 1.6s ease-in-out infinite;animation-delay:var(--kc-delay);}
@keyframes kc-giant{0%,100%{transform:scale(1)}50%{transform:scale(1.28)}}
.kc-flash{position:absolute;inset:0;z-index:7;pointer-events:none;}
.kc-flash.good{background:radial-gradient(circle at 50% 60%,rgba(120,200,100,.4),transparent 60%);}
.kc-flash.bad{background:radial-gradient(circle at 50% 60%,rgba(220,80,60,.45),transparent 60%);}
.kc-screen{position:absolute;inset:0;z-index:9;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;
  background:radial-gradient(120% 120% at 50% 30%,#2a2118,#140f0a);color:#f6e8cd;}
.kc-screen.over{background:radial-gradient(120% 120% at 50% 30%,#3a2c1d,#1b130c);}
.kc-visor{font-size:90px;}
.kc-boot-title{font-weight:900;letter-spacing:3px;font-size:24px;margin-top:10px;}
.kc-boot-sub{color:#c9a36f;font-weight:700;}
.kc-boot-bar{width:260px;height:10px;border-radius:6px;background:rgba(255,255,255,.12);overflow:hidden;margin-top:14px;}
.kc-boot-bar div{height:100%;background:linear-gradient(90deg,#e8896b,#e2c14e);}
.kc-over-emoji{font-size:72px;}
.kc-over-title{font-size:30px;font-weight:900;letter-spacing:1px;}
.kc-over-score{font-size:64px;font-weight:900;color:#f1b24a;line-height:1;}
.kc-over-stats{color:#c9a36f;font-weight:700;margin-bottom:18px;}
.kc-over-actions{display:flex;flex-direction:column;gap:10px;align-items:center;}
.kc-btn{display:inline-block;text-decoration:none;border:none;cursor:pointer;font-weight:800;font-size:16px;
  padding:12px 26px;border-radius:16px;background:#f3e3c6;color:#5b4a36;box-shadow:0 5px 0 #c9a878;min-width:260px;text-align:center;}
.kc-btn.primary{background:linear-gradient(#7ec46b,#5ea84d);color:#fff;box-shadow:0 5px 0 #468a37;}
.kc-btn.ghost{background:transparent;color:#c9a36f;box-shadow:none;font-size:14px;min-width:0;padding:6px;}
.kc-exit{position:absolute;bottom:18px;right:20px;z-index:10;width:40px;height:40px;border-radius:50%;border:none;cursor:pointer;
  background:rgba(255,255,255,.55);color:#5b4a36;font-weight:900;font-size:16px;box-shadow:0 3px 8px rgba(0,0,0,.2);}
@media (max-width:640px){.kc-board{transform:scale(.82);}.kc-orders{gap:8px;}.kc-ticket{width:84px;}}
`;
