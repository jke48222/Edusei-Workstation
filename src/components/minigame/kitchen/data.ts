/**
 * @file data.ts
 * @description Kitchen Chaos game data, ported faithfully from the Unity VR project
 * (VR-Final-Project / FinalProject). Every constant, recipe, theme, and chaos event
 * mirrors the shipped Unity values (RoundManager.cs, Recipe assets, ChaosManager.cs,
 * CookableItem.cs, DishScorer.cs), with the source's known authoring bugs fixed and
 * noted inline:
 *   - `ing_bacon-raw` had no prefab (Breakfast Plate was uncraftable) → bacon exists here.
 *   - Misspelled extras (`ing_onion_half`, `ing_egg_half`, `ing_leek_half-*`,
 *     `ing_chocolate-wrapper`) → normalized so extras actually award their bonus.
 *   - Player plates shipped with an empty possibleRecipes list (every dish fell to the
 *     pity score) → the plate here scores against all 8 recipes as designed.
 */

/* ── Round / cooking constants (RoundManager.cs:12, HeatSource.cs:8, CookableItem.cs:27-30) ── */
export const ROUND_SECONDS = 120;
/** heatPerSecond 0.4 × cookRate 0.4 → raw→done in 6.25 s. */
export const COOK_SECONDS = 6.25;
/** heatPerSecond 0.4 × burnRate 0.3 → done→burnt in ~8.33 s. */
export const BURN_SECONDS = 8.33;
export const WHISK_COOLDOWN_MS = 500; // WhiskMixerHead.cs:17
export const BURNER_COUNT = 4; // four heat sources in CookingShowScene

/* ── Chaos scheduler (ChaosManager.cs:10-11, ChaosEvent.cs:10-13) ── */
export const CHAOS_MIN_GAP = 8;
export const CHAOS_MAX_GAP = 15;
export const CHAOS_DURATION = 5;
export const CHAOS_COOLDOWN = 10;

/* ── Scoring (Recipe assets / DishScorer.cs) ── */
export const BASE_SCORE = 50;
export const REQUIRED_WEIGHT = 20;
export const EXTRA_BONUS = 5;
export const STRAY_PENALTY = 3;
export const PITY_PER_INGREDIENT = 5;
export const PITY_MAX = 40;
/** Port addition: honoring the recipes' authored desiredCookState (the Unity scorer
 *  ignored it — the recipe book clearly intended it). Wrong doneness costs this much. */
export const DONENESS_PENALTY = 10;

export type CookState = 'raw' | 'cooking' | 'done' | 'burnt';

export interface IngredientDef {
  id: string;
  name: string;
  emoji: string;
  /** Cutting this item on the board yields these ids (single cut, CuttableItem.cs). */
  cutsInto?: string[];
  /** Item advances raw→cooking→done→burnt on a burner (CookableItem.cs). */
  cookable?: boolean;
  /** Shown in the pantry shelf (derived halves are not). */
  pantry?: boolean;
  /** Pantry shelf grouping. */
  group?: 'produce' | 'protein' | 'pantry' | 'sweets' | 'junk';
}

const D = (
  id: string,
  name: string,
  emoji: string,
  opts: Partial<IngredientDef> = {}
): IngredientDef => ({ id, name, emoji, ...opts });

export const INGREDIENTS: Record<string, IngredientDef> = Object.fromEntries(
  [
    /* produce (cuttable wholes + their halves) */
    D('tomato', 'Tomato', '🍅', { pantry: true, group: 'produce', cutsInto: ['tomato-half'] }),
    D('tomato-half', 'Tomato Half', '🍅'),
    D('cabbage', 'Cabbage', '🥬', { pantry: true, group: 'produce', cutsInto: ['cabbage-half'] }),
    D('cabbage-half', 'Cabbage Half', '🥬'),
    D('cucumber', 'Cucumber', '🥒', { pantry: true, group: 'produce', cutsInto: ['cucumber-half-a', 'cucumber-half-b'] }),
    D('cucumber-half-a', 'Cucumber Half', '🥒'),
    D('cucumber-half-b', 'Cucumber Half', '🥒'),
    D('carrot', 'Carrot', '🥕', { pantry: true, group: 'produce', cutsInto: ['carrot-half-a', 'carrot-half-b'] }),
    D('carrot-half-a', 'Carrot Half', '🥕'),
    D('carrot-half-b', 'Carrot Half', '🥕'),
    D('onion', 'Onion', '🧅', { pantry: true, group: 'produce', cutsInto: ['onion-half'] }),
    D('onion-half', 'Onion Half', '🧅'),
    D('pepper', 'Bell Pepper', '🫑', { pantry: true, group: 'produce', cutsInto: ['pepper-half-a', 'pepper-half-b'] }),
    D('pepper-half-a', 'Pepper Half', '🫑'),
    D('pepper-half-b', 'Pepper Half', '🫑'),
    D('mushroom', 'Mushroom', '🍄', { pantry: true, group: 'produce', cutsInto: ['mushroom-half'] }),
    D('mushroom-half', 'Mushroom Half', '🍄'),
    D('leek', 'Leek', '🥬', { pantry: true, group: 'produce', cutsInto: ['leek-half-a', 'leek-half-b'] }),
    D('leek-half-a', 'Leek Half', '🥬'),
    D('leek-half-b', 'Leek Half', '🥬'),
    D('paprika', 'Paprika', '🌶️', { pantry: true, group: 'produce', cutsInto: ['paprika-slice'] }),
    D('paprika-slice', 'Paprika Slice', '🌶️'),
    D('broccoli', 'Broccoli', '🥦', { pantry: true, group: 'produce' }),
    D('avocado', 'Avocado', '🥑', { pantry: true, group: 'produce', cutsInto: ['avocado-half'] }),
    D('avocado-half', 'Avocado Half', '🥑'),
    /* fruit */
    D('apple', 'Apple', '🍎', { pantry: true, group: 'produce', cutsInto: ['apple-half'] }),
    D('apple-half', 'Apple Half', '🍎'),
    D('banana', 'Banana', '🍌', { pantry: true, group: 'produce', cutsInto: ['banana-half-a', 'banana-half-b'] }),
    D('banana-half-a', 'Banana Half', '🍌'),
    D('banana-half-b', 'Banana Half', '🍌'),
    D('strawberry', 'Strawberry', '🍓', { pantry: true, group: 'produce', cutsInto: ['strawberry-half'] }),
    D('strawberry-half', 'Strawberry Half', '🍓'),
    D('grapes', 'Grapes', '🍇', { pantry: true, group: 'produce' }),
    D('orange', 'Orange', '🍊', { pantry: true, group: 'produce', cutsInto: ['orange-half'] }),
    D('orange-half', 'Orange Half', '🍊'),
    D('pear', 'Pear', '🍐', { pantry: true, group: 'produce', cutsInto: ['pear-half'] }),
    D('pear-half', 'Pear Half', '🍐'),
    D('watermelon', 'Watermelon', '🍉', { pantry: true, group: 'produce' }),
    /* proteins & cookables */
    D('egg', 'Egg', '🥚', { pantry: true, group: 'protein', cutsInto: ['egg-half'] }),
    D('egg-half', 'Cracked Egg', '🍳', { cookable: true }),
    D('bacon-raw', 'Bacon', '🥓', { pantry: true, group: 'protein', cookable: true }),
    D('meat-patty-raw', 'Meat Patty', '🥩', { pantry: true, group: 'protein', cookable: true }),
    D('meat-raw', 'Meat', '🍖', { pantry: true, group: 'protein', cookable: true }),
    D('salmon', 'Salmon', '🐟', { pantry: true, group: 'protein', cookable: true }),
    D('rice', 'Rice', '🍚', { pantry: true, group: 'protein', cookable: true }),
    D('sausage', 'Sausage', '🌭', { pantry: true, group: 'protein', cookable: true, cutsInto: ['sausage-half'] }),
    D('sausage-half', 'Sausage Half', '🌭', { cookable: true }),
    /* pantry staples */
    D('bread', 'Bread', '🍞', { pantry: true, group: 'pantry' }),
    D('nori', 'Nori', '🟩', { pantry: true, group: 'pantry' }),
    D('soy', 'Soy Sauce', '🍶', { pantry: true, group: 'pantry' }),
    D('bottle-ketchup', 'Ketchup', '🥫', { pantry: true, group: 'pantry' }),
    D('bottle-mustard', 'Mustard', '🟡', { pantry: true, group: 'pantry' }),
    D('cheese', 'Cheese', '🧀', { pantry: true, group: 'pantry', cutsInto: ['cheese-cut'] }),
    D('cheese-cut', 'Cheese Slice', '🧀'),
    D('skewer', 'Skewer', '🥢', { pantry: true, group: 'pantry' }),
    /* sweets & drinks */
    D('ice-cream', 'Ice Cream', '🍦', { pantry: true, group: 'sweets' }),
    D('whipped-cream', 'Whipped Cream', '🍥', { pantry: true, group: 'sweets' }),
    D('honey', 'Honey', '🍯', { pantry: true, group: 'sweets' }),
    D('candy-bar-wrapper', 'Candy Bar', '🍫', { pantry: true, group: 'sweets' }),
    D('lollipop', 'Lollipop', '🍭', { pantry: true, group: 'sweets' }),
    D('frappe', 'Frappe', '🥤', { pantry: true, group: 'sweets' }),
    D('soda', 'Soda', '🥤', { pantry: true, group: 'sweets' }),
    /* junk — legal to grab, scored as strays (DishScorer treats unknowns at −3) */
    D('fish', 'Whole Fish', '🐠', { pantry: true, group: 'junk' }),
    D('cookie', 'Cookie', '🍪', { pantry: true, group: 'junk' }),
    D('lemon', 'Lemon', '🍋', { pantry: true, group: 'junk', cutsInto: ['lemon-half'] }),
    D('lemon-half', 'Lemon Half', '🍋'),
    D('shaker-salt', 'Salt', '🧂', { pantry: true, group: 'junk' }),
    D('celery-stick', 'Celery', '🥬', { pantry: true, group: 'junk' }),
    D('can-small', 'Mystery Can', '🥫', { pantry: true, group: 'junk' }),
  ].map((d) => [d.id, d])
);

export interface RecipeReq {
  id: string;
  /** Authored desiredCookState (2 = Done in the Unity enum). */
  wantDone?: boolean;
}

export interface RecipeDef {
  id: string;
  dishId: string;
  name: string;
  emoji: string;
  required: RecipeReq[];
  extras: string[];
  /** Recipe book step-by-step text (RecipeBookPages content, adapted). */
  steps: string[];
}

/** The 8 shipped recipes (R_*.asset), ids normalized, bacon restored. */
export const RECIPES: RecipeDef[] = [
  {
    id: 'recipe_breakfast_plate', dishId: 'dish_breakfast_plate', name: 'Breakfast Plate', emoji: '🍳',
    required: [{ id: 'egg-half', wantDone: true }, { id: 'bacon-raw', wantDone: true }],
    extras: ['bread', 'frappe', 'soda'],
    steps: ['Crack an egg on the cutting board.', 'Cook the egg and the bacon until Done — do not burn them.', 'Combine in the bowl and whisk.', 'Plate the dish. Extra credit: bread, a frappe, or a soda.'],
  },
  {
    id: 'recipe_burger', dishId: 'dish_burger', name: 'Burger', emoji: '🍔',
    required: [{ id: 'meat-patty-raw', wantDone: true }, { id: 'bread' }],
    extras: ['cheese-cut', 'tomato-half', 'cabbage-half', 'bottle-ketchup', 'bottle-mustard'],
    steps: ['Cook the meat patty until Done.', 'Add the patty and bread to the bowl and whisk.', 'Plate it. Extra credit: cheese slice, tomato half, cabbage half, ketchup, mustard.'],
  },
  {
    id: 'recipe_fruit_salad', dishId: 'dish_fruit_salad', name: 'Fruit Salad', emoji: '🍇',
    required: [
      { id: 'apple-half' }, { id: 'banana-half-a' }, { id: 'banana-half-b' },
      { id: 'strawberry-half' }, { id: 'grapes' },
    ],
    extras: ['orange-half', 'pear-half', 'watermelon'],
    steps: ['Cut an apple, a banana (both halves go in!), and a strawberry.', 'Add the cut fruit plus grapes to the bowl and whisk.', 'Plate it. Extra credit: orange half, pear half, watermelon.'],
  },
  {
    id: 'recipe_garden_salad', dishId: 'dish_garden_salad', name: 'Garden Salad', emoji: '🥗',
    required: [
      { id: 'cabbage-half' }, { id: 'tomato-half' },
      { id: 'cucumber-half-a' }, { id: 'cucumber-half-b' },
    ],
    extras: ['carrot-half-a', 'carrot-half-b', 'paprika-slice', 'mushroom-half', 'onion-half'],
    steps: ['Cut cabbage, tomato, and a cucumber (both halves).', 'Combine in the bowl and whisk.', 'Plate it. Extra credit: carrot halves, paprika slice, mushroom half, onion half.'],
  },
  {
    id: 'recipe_ramen_bowl', dishId: 'dish_ramen_bowl', name: 'Ramen Bowl', emoji: '🍜',
    required: [
      { id: 'rice', wantDone: true }, { id: 'nori' }, { id: 'soy' },
      { id: 'meat-raw', wantDone: true }, { id: 'salmon', wantDone: true },
    ],
    extras: ['egg-half', 'mushroom-half', 'leek-half-a', 'leek-half-b', 'broccoli'],
    steps: ['Cook rice, meat, and salmon until Done.', 'Add nori and soy sauce.', 'Combine everything in the bowl and whisk.', 'Plate it. Extra credit: cracked egg, mushroom half, leek halves, broccoli.'],
  },
  {
    id: 'recipe_salmon_roll', dishId: 'dish_salmon_roll', name: 'Salmon Roll', emoji: '🍣',
    required: [{ id: 'rice', wantDone: true }, { id: 'nori' }, { id: 'salmon', wantDone: true }],
    extras: ['cucumber-half-a', 'cucumber-half-b', 'avocado-half'],
    steps: ['Cook rice and salmon until Done.', 'Combine with nori in the bowl and whisk.', 'Plate it. Extra credit: cucumber halves, avocado half.'],
  },
  {
    // "Gilled Veggie Skewer" (sic) in the Unity asset — typo kept out of the port.
    id: 'recipe_skewer_vegetables', dishId: 'dish_skewer_vegetables', name: 'Grilled Veggie Skewer', emoji: '🍢',
    required: [
      { id: 'skewer' }, { id: 'pepper-half-a' }, { id: 'pepper-half-b' },
      { id: 'onion-half' }, { id: 'mushroom-half' },
    ],
    extras: ['tomato-half', 'leek-half-a', 'leek-half-b'],
    steps: ['Cut a bell pepper (both halves), an onion, and a mushroom.', 'Combine with a skewer in the bowl and whisk.', 'Plate it. Extra credit: tomato half, leek halves.'],
  },
  {
    id: 'recipe_strawberry_sundae', dishId: 'dish_strawberry_sundae', name: 'Strawberry Sundae', emoji: '🍨',
    required: [{ id: 'ice-cream' }, { id: 'whipped-cream' }, { id: 'strawberry-half' }],
    extras: ['honey', 'candy-bar-wrapper', 'lollipop'],
    steps: ['Cut a strawberry.', 'Combine ice cream, whipped cream, and the strawberry half in the bowl. Whisk fast!', 'Plate it. Extra credit: honey, a candy bar, a lollipop.'],
  },
];

/** All 29 shipped round themes (CookingShowScene.unity:1573-1602) — cosmetic flavor. */
export const THEMES = [
  'Lazy Sunday Brunch', 'Late Night Snack Attack', 'Midnight Fridge Raid', 'Comfort Food Chaos',
  'Study Break Bites', 'Breakfast For Dinner', 'Bougie On A Budget', 'Five Minute Meal Panic',
  'Leftovers Glow Up', 'Date Night Disaster', 'Dorm Room Gourmet', 'Mom Would Be Proud',
  "Chef's Kiss or Miss", 'Hangry Hour', 'Sweet Tooth Showdown', 'Fresh And Fancy-ish',
  'Pantry Roulette', 'Clean Out The Fridge', 'I Saw This On TikTok', 'One Pot Wonder',
  'Plate It Like You Mean It', 'Oops All Carbs', 'Health-ish Choices', 'Spicy But Not Too Spicy',
  'Late For Work Lunch', 'Movie Night Munchies', 'Brunch With The Besties',
  'Campfire Classics Indoors', 'Chaos In The Kitchen',
];

export type ChaosId = 'flying-food' | 'levitate' | 'rubber-knife' | 'random-scale';

export const CHAOS_EVENTS: { id: ChaosId; name: string; blurb: string }[] = [
  { id: 'flying-food', name: 'Flying Pantry Food', blurb: 'Your ingredients are airborne — click them to get them back!' },
  { id: 'levitate', name: 'Levitating Items', blurb: 'Gravity called in sick. Grab your floating ingredients!' },
  { id: 'rubber-knife', name: 'Rubber Knife', blurb: 'The knife went floppy. Cutting is… unreliable.' },
  { id: 'random-scale', name: 'Scale Chaos', blurb: 'Why is the tomato enormous?' },
];

export const RANDOM_SCALE_MIN = 0.3; // RandomScaleChaosEvent.cs:16-22
export const RANDOM_SCALE_MAX = 2.5;
export const RANDOM_SCALE_MAX_ITEMS = 8;
export const RUBBER_KNIFE_SLIP_CHANCE = 0.4;
