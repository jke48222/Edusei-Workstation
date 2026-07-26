/**
 * @file assets.ts
 * @description Loader for the generated art set under /game/kitchen-chaos/. Loading
 * kicks off when the game mounts — i.e. during the camera dive + boot ident, which is
 * screen time we already own — so service starts with zero pop-in. Every draw call has
 * a flat-vector fallback, so a missing or still-loading image degrades gracefully to
 * the placeholder shapes rather than breaking play.
 */

export type SpriteId =
  | 'prop-pot'
  | 'prop-kettle'
  | 'prop-board'
  | 'prop-crate'
  | 'prop-pan'
  | 'prop-glass'
  | 'bottle-brine'
  | 'bottle-tea'
  | 'bottle-cream'
  | 'ing-potato-raw'
  | 'ing-potato-chopped'
  | 'ing-fish-raw'
  | 'ing-fish-chopped'
  | 'ing-dough-ball'
  | 'ing-dough-folded'
  | 'dish-chowder'
  | 'dish-fogcutter'
  | 'dish-rolls'
  | 'gull-flying'
  | 'gull-standing'
  | 'bosun-gull'
  | 'prop-dumbwaiter'
  | 'ing-loaf'
  | 'dish-black-toast'
  | 'portrait-alba'
  | 'portrait-moss'
  | 'prop-picklejar'
  | 'ing-wreckfish-whole'
  | 'dish-pickles'
  | 'dish-wreck-platter';

export interface GameAssets {
  bgLandscape: HTMLImageElement | null;
  bgPortrait: HTMLImageElement | null;
  sprites: Partial<Record<SpriteId, HTMLImageElement>>;
}

const BASE = '/game/kitchen-chaos';

const SPRITE_IDS: SpriteId[] = [
  'prop-pot',
  'prop-kettle',
  'prop-board',
  'prop-crate',
  'prop-pan',
  'prop-glass',
  'bottle-brine',
  'bottle-tea',
  'bottle-cream',
  'ing-potato-raw',
  'ing-potato-chopped',
  'ing-fish-raw',
  'ing-fish-chopped',
  'ing-dough-ball',
  'ing-dough-folded',
  'dish-chowder',
  'dish-fogcutter',
  'dish-rolls',
  'gull-flying',
  'gull-standing',
  'bosun-gull',
  'prop-dumbwaiter',
  'ing-loaf',
  'dish-black-toast',
  'portrait-alba',
  'portrait-moss',
  'prop-picklejar',
  'ing-wreckfish-whole',
  'dish-pickles',
  'dish-wreck-platter',
];

async function loadImage(src: string): Promise<HTMLImageElement | null> {
  try {
    const img = new Image();
    img.src = src;
    await img.decode();
    return img;
  } catch {
    // Missing/failed asset → vector fallback handles it.
    return null;
  }
}

let cached: Promise<GameAssets> | null = null;

export function loadGameAssets(): Promise<GameAssets> {
  if (!cached) {
    cached = (async () => {
      const [bgLandscape, bgPortrait, ...sprites] = await Promise.all([
        loadImage(`${BASE}/bg-landscape.jpg`),
        loadImage(`${BASE}/bg-portrait.jpg`),
        ...SPRITE_IDS.map((id) => loadImage(`${BASE}/sprites/${id}.png`)),
      ]);
      const map: GameAssets['sprites'] = {};
      SPRITE_IDS.forEach((id, i) => {
        const img = sprites[i];
        if (img) map[id] = img;
      });
      return { bgLandscape, bgPortrait, sprites: map };
    })();
  }
  return cached;
}

/** drawImage fitted inside a box (contain), anchored bottom-center — props sit on counters. */
export function blitContain(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  x: number,
  y: number,
  w: number,
  h: number,
  anchorBottom = true,
): void {
  const s = Math.min(w / img.width, h / img.height);
  const dw = img.width * s;
  const dh = img.height * s;
  const dx = x + (w - dw) / 2;
  const dy = anchorBottom ? y + h - dh : y + (h - dh) / 2;
  ctx.drawImage(img, dx, dy, dw, dh);
}
