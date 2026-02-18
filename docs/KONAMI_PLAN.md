# Konami Code – Implementation Plan

## What

The Konami code is a classic cheat sequence: **↑ ↑ ↓ ↓ ← → ← → B A** (or on keyboard: Arrow Up, Arrow Up, Arrow Down, Arrow Down, Arrow Left, Arrow Right, Arrow Left, Arrow Right, B, A).

When the user types this sequence anywhere on the site (or only in the immersive view), trigger a one-time easter egg.

## Where to implement

1. **Listener**
   - Add a `useEffect` in `App.tsx` (or in the immersive root, e.g. the component that wraps `Experience` + `Overlay`) that:
     - Listens for `keydown` on `window`.
     - Maintains an array or string of the last N keys (e.g. last 10).
     - On each key, appends the key (e.g. `ArrowUp`, `ArrowDown`, `KeyB`, `KeyA`) and trims to length 10.
     - If the sequence matches `['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','KeyB','KeyA']`, trigger the easter egg and optionally clear the sequence / set a “already triggered” flag so it only runs once per session or page load.

2. **Trigger options (pick one or combine)**
   - **Theme switch**: Temporarily switch to the Gold (secret) theme for a few seconds, then restore previous theme.
   - **Camera**: Trigger a short cinematic spin or zoom in the 3D scene (e.g. call a store action that CameraRig reads to run a one-off animation).
   - **Terminal**: Append a hidden line to the terminal output, e.g. `Achievement unlocked: Konami.`
   - **Confetti**: Use a small library (e.g. canvas-confetti) or CSS particles for a brief burst.
   - **Sound**: Play a short “unlock” or “achievement” sound (respect `soundMuted` and `prefersReducedMotion`).

3. **State**
   - Store “konami triggered” in a ref or in the Zustand store so it only fires once per visit (or once per session). Optionally persist in `sessionStorage` so it doesn’t retrigger on refresh in the same tab.

4. **Accessibility**
   - Don’t rely on the Konami code for any critical functionality.
   - If the effect is visual (theme/camera), ensure it doesn’t break reduced-motion preferences: either skip the effect when `prefersReducedMotion` is true or make the effect very subtle.

## Suggested first implementation

- **Place**: `App.tsx` or a small hook `useKonamiCode(onSuccess)` used in the immersive view.
- **Sequence**: Normalize keys to `ArrowUp`, `ArrowDown`, `ArrowLeft`, `ArrowRight`, `KeyB`, `KeyA` and match the 10-step sequence.
- **Effect**: Set theme to Gold for 5 seconds, then restore previous theme (store previous in a ref before applying Gold).
- **Once per session**: Use a ref or `sessionStorage.getItem('konami-done')` so it only runs once.

## Files to touch

- New: `src/hooks/useKonamiCode.ts` (optional) – returns `triggered` and exposes a way to run the effect.
- Or: logic directly in `App.tsx` / immersive wrapper.
- `src/store/themeStore.ts` or store – no change required if you only switch theme via existing `setTheme` and a timeout to restore.
- If you add camera spin: `src/store/store.ts` (e.g. `konamiCameraSpin: boolean`) and `CameraRig.tsx` to react to it.
