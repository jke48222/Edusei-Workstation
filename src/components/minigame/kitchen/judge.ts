/**
 * @file judge.ts
 * @description Dish scoring + judge commentary, ported from the Unity project's
 * DishScorer.cs (exact formula) and AIDishJudgeController.cs (the GPT judge's rubric,
 * recreated with canned lines: 2–3 TV-judge sentences mentioning ingredients, doneness,
 * and plating; never a 0 — a zero becomes a random 10–50 with the encouragement
 * template, exactly like the Unity zero-score fix).
 */

import {
  BASE_SCORE, REQUIRED_WEIGHT, EXTRA_BONUS, STRAY_PENALTY,
  PITY_PER_INGREDIENT, PITY_MAX, DONENESS_PENALTY,
  INGREDIENTS, RECIPES, type RecipeDef, type CookState,
} from './data';

export interface PlatedItem {
  defId: string;
  state: CookState;
}

export interface ScoreResult {
  score: number;
  recipe: RecipeDef | null;
  /** DishScorer-style breakdown lines, shown verbatim in the results UI. */
  breakdown: string[];
  /** Judge's spoken commentary (2–3 sentences). */
  commentary: string[];
  dishName: string;
}

const nameOf = (defId: string) => INGREDIENTS[defId]?.name ?? defId;

/**
 * DishScorer.ScorePlate (DishScorer.cs:25-167):
 *  - empty plate → 0
 *  - best recipe = all required present; ties → most required ingredients
 *  - no match → pity: clamp(count × 5, 0, 40)
 *  - match → 50 + 20/required + 5/listed extra − 3/stray, clamped to [0, 100]
 * Port addition (designer intent): −10 per required ingredient at the wrong doneness.
 */
export function scorePlate(items: PlatedItem[]): ScoreResult {
  if (items.length === 0) {
    return {
      score: 0, recipe: null, dishName: 'Empty Plate',
      breakdown: ['Plate is empty. Score 0.'],
      commentary: [],
    };
  }

  const idsOnPlate = new Set(items.map((i) => i.defId));

  // Matching is by ingredient id only, like the Unity combiner/scorer.
  let best: RecipeDef | null = null;
  for (const r of RECIPES) {
    const qualifies = r.required.every((req) => idsOnPlate.has(req.id));
    if (qualifies && (!best || r.required.length > best.required.length)) best = r;
  }

  const breakdown: string[] = [];

  if (!best) {
    const score = Math.min(PITY_MAX, items.length * PITY_PER_INGREDIENT);
    breakdown.push('Improvised plate (no full recipe matched).');
    breakdown.push(`Pity points for effort: ${items.length} × ${PITY_PER_INGREDIENT} = ${score}`);
    return { score, recipe: null, dishName: 'Improvised Plate', breakdown, commentary: [] };
  }

  let score = BASE_SCORE;
  breakdown.push(`Matched recipe: ${best.name}`);
  breakdown.push(`Base score: ${BASE_SCORE}`);

  const donenessIssues: string[] = [];
  for (const req of best.required) {
    score += REQUIRED_WEIGHT;
    breakdown.push(`+${REQUIRED_WEIGHT} ${nameOf(req.id)}`);
    if (req.wantDone) {
      const plated = items.find((i) => i.defId === req.id);
      if (plated && plated.state !== 'done') {
        score -= DONENESS_PENALTY;
        const stateWord = plated.state === 'burnt' ? 'burnt' : 'undercooked';
        breakdown.push(`−${DONENESS_PENALTY} ${nameOf(req.id)} was ${stateWord}`);
        donenessIssues.push(`${nameOf(req.id).toLowerCase()} was ${stateWord}`);
      }
    }
  }

  const extraSet = new Set(best.extras);
  const requiredSet = new Set(best.required.map((r) => r.id));
  const extrasScored = new Set<string>();
  let strayCount = 0;
  for (const item of items) {
    if (requiredSet.has(item.defId)) continue;
    if (extraSet.has(item.defId) && !extrasScored.has(item.defId)) {
      extrasScored.add(item.defId);
      score += EXTRA_BONUS;
      breakdown.push(`+${EXTRA_BONUS} extra credit: ${nameOf(item.defId)}`);
    } else if (!extraSet.has(item.defId)) {
      strayCount++;
      score -= STRAY_PENALTY;
      breakdown.push(`−${STRAY_PENALTY} stray ingredient: ${nameOf(item.defId)}`);
    }
  }

  score = Math.max(0, Math.min(100, score));
  breakdown.push(`Final score: ${score.toFixed(1)}`);

  return {
    score, recipe: best, dishName: best.name, breakdown,
    commentary: buildCommentary(best, score, donenessIssues, extrasScored.size, strayCount),
  };
}

/* ── Judge personality (AIDishJudgeController.cs system prompt, canned) ── */

const pick = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

function buildCommentary(
  recipe: RecipeDef, score: number, donenessIssues: string[], extraCount: number, strayCount: number
): string[] {
  const lines: string[] = [];

  if (score >= 90) {
    lines.push(pick([
      `Now THAT is a ${recipe.name}. The composition is confident and the plate tells a story.`,
      `A ${recipe.name} that would survive a close-up. Beautiful work.`,
      `This ${recipe.name} is doing exactly what it promised — nothing hiding, nothing missing.`,
    ]));
  } else if (score >= 70) {
    lines.push(pick([
      `A solid ${recipe.name} — the fundamentals are all on the plate.`,
      `I can see the ${recipe.name} you were going for, and you mostly got there.`,
      `Respectable ${recipe.name}. The bones of this dish are good.`,
    ]));
  } else {
    lines.push(pick([
      `This ${recipe.name} had a rough night in that kitchen, and I suspect the kitchen started it.`,
      `I recognize the ${recipe.name}… technically. Let's talk about the journey.`,
      `A ${recipe.name} with ambition, if not execution.`,
    ]));
  }

  if (donenessIssues.length > 0) {
    lines.push(`On doneness: the ${donenessIssues.join(' and the ')} — the pan is your friend, but only up to a point.`);
  } else if (strayCount > 0) {
    lines.push(pick([
      `I did find ${strayCount === 1 ? 'a stowaway ingredient' : `${strayCount} stowaway ingredients`} on this plate that the recipe never asked for.`,
      `Editing matters — ${strayCount === 1 ? 'one item here' : 'a few items here'} wandered in from another dish entirely.`,
    ]));
  } else if (extraCount > 0) {
    lines.push(`The extra touches earned their place — ${extraCount === 1 ? 'that addition' : 'those additions'} lifted the whole plate.`);
  } else {
    lines.push('Clean, disciplined plating — nothing on this plate by accident.');
  }

  return lines;
}

/**
 * The Unity zero-score fix (AIDishJudgeController.cs:238-277): a judged 0 becomes a
 * random whole 10–50 plus the canned encouragement, verbatim template included.
 */
export function applyZeroScoreFix(result: ScoreResult): ScoreResult {
  if (result.score > 0) return result;
  const score = 10 + Math.floor(Math.random() * 41);
  return {
    ...result,
    score,
    commentary: [
      'Every great chef has a round like this one — what matters is that you kept cooking.',
      'I saw real moments of intent out there, even when the kitchen fought back.',
      `Overall, I'm giving this a ${score}. It reflects both the strengths you demonstrated and the room for growth.`,
    ],
  };
}
