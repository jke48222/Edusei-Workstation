/**
 * @file useKeyboardControls.ts
 * @description Keyboard input for gallery avatar movement (WASD/arrows). Updates workstation
 * store input state; getMovementVector derives normalized direction for physics.
 */

import { useEffect, useCallback, useRef } from 'react';
import { useWorkstationStore } from '../store/store';

/** Key-to-direction mappings for movement (WASD and arrow keys). */
const KEY_MAPPINGS: Record<string, 'forward' | 'backward' | 'left' | 'right'> = {
  // WASD
  'w': 'forward',
  'W': 'forward',
  'a': 'left',
  'A': 'left',
  's': 'backward',
  'S': 'backward',
  'd': 'right',
  'D': 'right',
  // Arrow keys
  'ArrowUp': 'forward',
  'ArrowLeft': 'left',
  'ArrowDown': 'backward',
  'ArrowRight': 'right',
};

/**
 * Hook to handle keyboard input for character movement
 * 
 * Updates the Zustand store's input state, which is then
 * consumed by the AvatarController component.
 * 
 * @param enabled - Whether to listen for keyboard events
 */
export function useKeyboardControls(enabled: boolean = true): void {
  const setInput = useWorkstationStore((state) => state.setInput);
  const resetInput = useWorkstationStore((state) => state.resetInput);
  
  // Track which keys are currently pressed (for preventing repeat events)
  const pressedKeys = useRef<Set<string>>(new Set());

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    // Ignore if input is focused or key is already pressed
    if (
      document.activeElement?.tagName === 'INPUT' ||
      document.activeElement?.tagName === 'TEXTAREA' ||
      pressedKeys.current.has(event.key)
    ) {
      return;
    }

    const direction = KEY_MAPPINGS[event.key];
    if (direction) {
      event.preventDefault();
      pressedKeys.current.add(event.key);
      setInput(direction, true);
    }
  }, [setInput]);

  const handleKeyUp = useCallback((event: KeyboardEvent) => {
    pressedKeys.current.delete(event.key);
    
    const direction = KEY_MAPPINGS[event.key];
    if (direction) {
      event.preventDefault();
      setInput(direction, false);
    }
  }, [setInput]);

  // Handle window blur (reset all keys when window loses focus)
  const handleBlur = useCallback(() => {
    pressedKeys.current.clear();
    resetInput();
  }, [resetInput]);

  useEffect(() => {
    if (!enabled) {
      // Reset input state when disabled
      resetInput();
      pressedKeys.current.clear();
      return;
    }

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('blur', handleBlur);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('blur', handleBlur);
      resetInput();
      pressedKeys.current.clear();
    };
  }, [enabled, handleKeyDown, handleKeyUp, handleBlur, resetInput]);
}

/**
 * Hook to track if any movement key is pressed
 */
export function useIsAnyKeyPressed(): boolean {
  const input = useWorkstationStore((state) => state.input);
  return input.forward || input.backward || input.left || input.right;
}

/**
 * Get movement vector from input state
 * Returns a normalized 2D vector (x, z) for movement direction
 */
export function getMovementVector(input: {
  forward: boolean;
  backward: boolean;
  left: boolean;
  right: boolean;
}): { x: number; z: number } {
  let x = 0;
  let z = 0;

  if (input.forward) z -= 1;
  if (input.backward) z += 1;
  if (input.left) x -= 1;
  if (input.right) x += 1;

  // Normalize diagonal movement
  const length = Math.sqrt(x * x + z * z);
  if (length > 0) {
    x /= length;
    z /= length;
  }

  return { x, z };
}
