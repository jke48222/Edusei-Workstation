/**
 * @file engine.ts
 * @description Canvas host for the game: fits a virtual coordinate space (1280×720 or
 * 720×1280, chosen by container aspect) into the real canvas with letterboxing, runs the
 * fixed rAF loop, and normalizes pointer events (mouse/touch/pen) into virtual-space
 * coordinates. One pointer at a time — every verb in the game is single-finger (doc §6).
 */

import type { Pt } from './geom';

export interface StageView {
  /** Virtual space size. */
  vw: number;
  vh: number;
  /** Virtual→CSS-pixel scale and centering offsets (letterbox). */
  scale: number;
  offX: number;
  offY: number;
  aspect: number;
}

export interface StagePointerEvent {
  type: 'down' | 'move' | 'up' | 'cancel';
  p: Pt;
  /** performance.now() timestamp, ms. */
  t: number;
}

export interface StageCallbacks {
  /** Choose the virtual space for a given container aspect ratio. */
  chooseVirtual: (aspect: number) => { w: number; h: number };
  update: (dtSeconds: number, now: number) => void;
  draw: (ctx: CanvasRenderingContext2D, view: StageView) => void;
  pointer: (ev: StagePointerEvent) => void;
  /** Fired after any resize/orientation change, before the next draw. */
  onViewChange?: (view: StageView) => void;
  /** Fired when the tab is hidden — the shell uses it to auto-pause. */
  onHidden?: () => void;
  /** Fired when the tab becomes visible again — the shell lifts auto-pauses here. */
  onVisible?: () => void;
}

export class CanvasStage {
  private canvas: HTMLCanvasElement;
  private container: HTMLElement;
  private cbs: StageCallbacks;
  private ctx: CanvasRenderingContext2D;
  private view: StageView = { vw: 1280, vh: 720, scale: 1, offX: 0, offY: 0, aspect: 16 / 9 };
  private dpr = 1;
  private raf = 0;
  private last = 0;
  private paused = false;
  private destroyed = false;
  private activePointer: number | null = null;
  private ro: ResizeObserver;

  constructor(canvas: HTMLCanvasElement, container: HTMLElement, cbs: StageCallbacks) {
    this.canvas = canvas;
    this.container = container;
    this.cbs = cbs;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas2D unavailable');
    this.ctx = ctx;

    this.ro = new ResizeObserver(() => this.fit());
    this.ro.observe(container);
    this.fit();

    canvas.addEventListener('pointerdown', this.onDown);
    canvas.addEventListener('pointermove', this.onMove);
    canvas.addEventListener('pointerup', this.onUp);
    canvas.addEventListener('pointercancel', this.onCancel);
    document.addEventListener('visibilitychange', this.onVisibility);

    this.last = performance.now();
    this.raf = requestAnimationFrame(this.tick);
  }

  destroy(): void {
    this.destroyed = true;
    cancelAnimationFrame(this.raf);
    this.ro.disconnect();
    this.canvas.removeEventListener('pointerdown', this.onDown);
    this.canvas.removeEventListener('pointermove', this.onMove);
    this.canvas.removeEventListener('pointerup', this.onUp);
    this.canvas.removeEventListener('pointercancel', this.onCancel);
    document.removeEventListener('visibilitychange', this.onVisibility);
  }

  setPaused(paused: boolean): void {
    this.paused = paused;
    if (!paused) this.last = performance.now();
  }

  getView(): StageView {
    return this.view;
  }

  private fit(): void {
    const cssW = Math.max(1, this.container.clientWidth);
    const cssH = Math.max(1, this.container.clientHeight);
    const aspect = cssW / cssH;
    const v = this.cbs.chooseVirtual(aspect);
    // DPR capped at 2: flat shapes gain nothing above that, mobile GPUs pay plenty.
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.canvas.width = Math.round(cssW * this.dpr);
    this.canvas.height = Math.round(cssH * this.dpr);
    this.canvas.style.width = `${cssW}px`;
    this.canvas.style.height = `${cssH}px`;

    const scale = Math.min(cssW / v.w, cssH / v.h);
    this.view = {
      vw: v.w,
      vh: v.h,
      scale,
      offX: (cssW - v.w * scale) / 2,
      offY: (cssH - v.h * scale) / 2,
      aspect,
    };
    this.cbs.onViewChange?.(this.view);
  }

  private toVirtual(e: PointerEvent): Pt {
    const rect = this.canvas.getBoundingClientRect();
    const cssX = e.clientX - rect.left;
    const cssY = e.clientY - rect.top;
    return {
      x: (cssX - this.view.offX) / this.view.scale,
      y: (cssY - this.view.offY) / this.view.scale,
    };
  }

  private onDown = (e: PointerEvent): void => {
    if (this.activePointer !== null) return; // single-pointer game
    this.activePointer = e.pointerId;
    try {
      this.canvas.setPointerCapture(e.pointerId);
    } catch {
      // Capture is best-effort — synthetic pointers (tests) have no capture target.
    }
    e.preventDefault();
    this.cbs.pointer({ type: 'down', p: this.toVirtual(e), t: e.timeStamp });
  };

  private onMove = (e: PointerEvent): void => {
    if (e.pointerId !== this.activePointer) return;
    this.cbs.pointer({ type: 'move', p: this.toVirtual(e), t: e.timeStamp });
  };

  private onUp = (e: PointerEvent): void => {
    if (e.pointerId !== this.activePointer) return;
    this.activePointer = null;
    this.cbs.pointer({ type: 'up', p: this.toVirtual(e), t: e.timeStamp });
  };

  private onCancel = (e: PointerEvent): void => {
    if (e.pointerId !== this.activePointer) return;
    this.activePointer = null;
    this.cbs.pointer({ type: 'cancel', p: this.toVirtual(e), t: e.timeStamp });
  };

  private onVisibility = (): void => {
    if (document.hidden) this.cbs.onHidden?.();
    else this.cbs.onVisible?.();
  };

  private tick = (now: number): void => {
    if (this.destroyed) return;
    const dt = Math.min(Math.max(now - this.last, 0), 50) / 1000;
    this.last = now;

    if (!this.paused) {
      this.cbs.update(dt, now);
      const { ctx, dpr, view } = this;
      // Device-space clear (letterbox bars), then the virtual transform for the world.
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.fillStyle = '#10161F';
      ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
      ctx.setTransform(dpr * view.scale, 0, 0, dpr * view.scale, dpr * view.offX, dpr * view.offY);
      this.cbs.draw(ctx, view);
    }

    this.raf = requestAnimationFrame(this.tick);
  };
}
