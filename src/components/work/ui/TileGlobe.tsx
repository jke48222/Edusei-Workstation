/**
 * @file TileGlobe.tsx
 * @description A slowly spinning dot-matrix globe rendered on a canvas. Continents are
 * sampled from Natural Earth land data baked into the bit grid below and projected onto a
 * rotating sphere. Adapted from a desktop-widget globe (cities/arcs/pins removed) and made
 * responsive to its container. Default-exported for React.lazy().
 */

import { useEffect, useRef } from 'react';

const GRID_COLS = 120;
const GRID_ROWS = 60;
const GRID_S = 3;
const TILT = 20;

// Land/water bitmask: 120x60 cells at 3-degree resolution, baked from Natural Earth.
const GRID_B64 =
  'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAgH/wHwAAAAAAAAAAAAAA8Mf/PwALAAAYAAAAAACY9OP/HwAAAATAAQAAAAAYfQP+HwAAQID/LwgAwAPA0x/8BwAwAOz///8B4f///3X8AQD+8+//////wP///z04YAD3//////9/4P//HwwwAMD7//////86AMH/H1wAAETz/////wcCAAD/f/wAAAT5/////wEDAAD+//0BAPr//////w8BAAD4/z8AAPj//////w8AAAD4/z8AAPi/3v///wsAAAD4/x8AALof7v///wkAAAD4/wcAAA7O3///bwAAAAD4/wcAAA7p3///XwQAAADw/wMAAHwA////DwMAAADg/wEAAP4Z////nwAAAACADwEAAP9/7///HwAAAAAADwAAgP//H///DwAAAAAABgIAgP///vj7AwAAAAAAThAAgP//fPB4AQAAAAAAeAAAwP//PXD4EAAAAAAAwAAAwP//D2DgAAAAAAAAgLgAgP//H2CAAAAAAAAAAPwAAP//HwAAIAAAAAAAAPwHAML/DwAQDAAAAAAAAPwHAID/BwBgBwAAAAAAAP4fAID/AwBAFgEAAAAAAP5/AAD/AQBAAA4AAAAAAP7/AAD/AQAAAxwAAAAAAPz/AAD/AQAAAAAAAAAAAPh/AAD/EwAAgAkAAAAAAPB/AAD/GQAA4BsAAAAAAOB/AAD/CAAA8B8AAAAAAOA/AAD+DAAA/D8AAAAAAPAPAAB+AAAA/H8AAAAAAPAPAAB+AAAA/H8AAAAAAPAHAAA8AAAA+H8AAAAAAPADAAAEAAAACDwAAAAAAPgBAAAAAAAAADhAAAAAAHgAAAAAAAAAAABAAAAAADAAAAAAAAAAAAAgAAAAADgAAAAAAAAAAAAQAAAAABgAAAAAAAAAAAAAAAAAABgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAIAAAAAAAAAAAAAAAAAAACAAAAAA8ID//x8AAAAAAHAAAED3//f///8DAAAI9PIAgP////////8PAPj//x8A+P////////8HQPz//wM4/P////////8DAP7////8//////////8H//v/////////////////////////////////////';

const RAD = Math.PI / 180;

type Cell = { lat: number; lng: number };

const GRID: { land: Cell[]; water: Cell[] } = (() => {
  const bin = atob(GRID_B64);
  const land: Cell[] = [];
  const water: Cell[] = [];
  for (let r = 0; r < GRID_ROWS; r++) {
    const lat = 90 - (r + 0.5) * GRID_S;
    for (let c = 0; c < GRID_COLS; c++) {
      const lng = -180 + (c + 0.5) * GRID_S;
      const idx = r * GRID_COLS + c;
      const bit = (bin.charCodeAt(idx >> 3) >> (idx & 7)) & 1;
      (bit ? land : water).push({ lat, lng });
    }
  }
  return { land, water };
})();

function proj3(lat: number, lng: number, rot: number, tiltDeg: number) {
  const f = lat * RAD;
  const l = (lng - rot) * RAD;
  const t = tiltDeg * RAD;
  const cf = Math.cos(f), sf = Math.sin(f), cl = Math.cos(l), sl = Math.sin(l);
  const ct = Math.cos(t), st = Math.sin(t);
  return { x: cf * sl, y: ct * sf - st * cf * cl, z: st * sf + ct * cf * cl };
}

const landColor = (lat: number, z: number) =>
  Math.abs(lat) > 72 ? `rgba(228,236,240,${0.3 + 0.6 * z})` : `rgba(108,222,148,${0.3 + 0.62 * z})`;
const waterColor = (lat: number, z: number) =>
  Math.abs(lat) > 75 ? `rgba(205,222,236,${0.2 + 0.5 * z})` : `rgba(64,132,210,${0.16 + 0.5 * z})`;

export default function TileGlobe() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const cv = ref.current;
    if (!cv) return;
    const ctx = cv.getContext('2d');
    if (!ctx) return;

    let raf = 0;
    let rot = 0;
    let W = 0, H = 0, dpr = 1, R = 0, CX = 0, CY = 0;
    const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;

    const resize = () => {
      const rect = cv.getBoundingClientRect();
      dpr = window.devicePixelRatio || 1;
      W = rect.width || 1;
      H = rect.height || 1;
      cv.width = Math.max(1, Math.round(W * dpr));
      cv.height = Math.max(1, Math.round(H * dpr));
      R = Math.min(W, H) * 0.42;
      CX = W / 2;
      CY = H / 2;
    };
    resize();
    // Repaint on resize so idle canvases (reduced motion / off-screen) don't go stale.
    const ro = new ResizeObserver(() => {
      resize();
      drawFrame();
    });
    ro.observe(cv);

    const dot = (x: number, y: number, r: number) => {
      ctx.beginPath();
      ctx.arc(x, y, r, 0, 6.2832);
      ctx.fill();
    };

    const drawFrame = () => {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);
      const s = R / 80; // dot sizing relative to the source design (R=80)

      const g = ctx.createRadialGradient(CX - R * 0.3, CY - R * 0.3, R * 0.1, CX, CY, R);
      g.addColorStop(0, 'rgba(28,58,96,0.5)');
      g.addColorStop(1, 'rgba(8,20,40,0.22)');
      ctx.fillStyle = g;
      dot(CX, CY, R);

      for (let i = 0; i < GRID.water.length; i++) {
        const w = GRID.water[i];
        const p = proj3(w.lat, w.lng, rot, TILT);
        if (p.z <= 0.02) continue;
        ctx.fillStyle = waterColor(w.lat, p.z);
        dot(CX + p.x * R, CY - p.y * R, 0.85 * s);
      }
      for (let i = 0; i < GRID.land.length; i++) {
        const ld = GRID.land[i];
        const p = proj3(ld.lat, ld.lng, rot, TILT);
        if (p.z <= 0.02) continue;
        ctx.fillStyle = landColor(ld.lat, p.z);
        dot(CX + p.x * R, CY - p.y * R, 1.15 * s);
      }
    };

    // The loop only runs while the canvas is on screen; reduced-motion users get a
    // single static frame instead of a 60fps redraw of an unchanging image.
    let visible = true;
    const loop = () => {
      raf = requestAnimationFrame(loop);
      drawFrame();
      rot = (rot + 0.4) % 360;
    };
    const start = () => {
      if (!raf && visible && !reduced) raf = requestAnimationFrame(loop);
    };
    const stop = () => {
      cancelAnimationFrame(raf);
      raf = 0;
    };

    drawFrame();
    start();

    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) {
        if (reduced) drawFrame();
        else start();
      } else {
        stop();
      }
    });
    io.observe(cv);

    return () => {
      stop();
      ro.disconnect();
      io.disconnect();
    };
  }, []);

  return <canvas ref={ref} aria-hidden style={{ width: '100%', height: '100%', display: 'block' }} />;
}
