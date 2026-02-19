'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';

export interface DotRingCursorProps {
  /** Outer ring size (px). */
  ringSize?: number;
  /** Inner dot size (px). */
  dotSize?: number;
  /** Ring border width (px). */
  ringStroke?: number;
  /** Ring color (e.g. currentColor or hex). */
  ringColor?: string;
  /** Dot fill color. */
  dotColor?: string;
  /** Smooth follow speed (0–1, higher = snappier). */
  smooth?: number;
  zIndex?: number;
  /** Use dark-mode colors (light ring/dot on dark bg). */
  dark?: boolean;
}

export default function DotRingCursor({
  ringSize = 32,
  dotSize = 6,
  ringStroke = 1.5,
  ringColor,
  dotColor,
  smooth = 0.18,
  zIndex = 150,
  dark = false,
}: DotRingCursorProps) {
  const [pos, setPos] = useState({ x: -100, y: -100 });
  const [visible, setVisible] = useState(false);
  const rafRef = useRef<number>();
  const targetRef = useRef({ x: -100, y: -100 });
  const currentRef = useRef({ x: -100, y: -100 });

  const ring = ringColor ?? (dark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)');
  const dot = dotColor ?? (dark ? 'rgba(255,255,255,0.95)' : 'rgba(0,0,0,0.9)');

  const handleMove = useCallback((e: MouseEvent) => {
    targetRef.current = { x: e.clientX, y: e.clientY };
    if (!visible) setVisible(true);
  }, [visible]);

  const handleLeave = useCallback(() => {
    setVisible(false);
  }, []);

  useEffect(() => {
    document.addEventListener('mousemove', handleMove);
    document.addEventListener('mouseleave', handleLeave);
    return () => {
      document.removeEventListener('mousemove', handleMove);
      document.removeEventListener('mouseleave', handleLeave);
      document.body.style.cursor = '';
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [handleMove, handleLeave]);

  useEffect(() => {
    document.body.style.cursor = visible ? 'none' : '';
    return () => {
      document.body.style.cursor = '';
    };
  }, [visible]);

  useEffect(() => {
    const tick = () => {
      const t = targetRef.current;
      const c = currentRef.current;
      const dx = (t.x - c.x) * smooth;
      const dy = (t.y - c.y) * smooth;
      if (Math.abs(dx) < 0.5 && Math.abs(dy) < 0.5) {
        currentRef.current = { x: t.x, y: t.y };
      } else {
        currentRef.current = { x: c.x + dx, y: c.y + dy };
      }
      setPos({ ...currentRef.current });
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [smooth]);

  if (!visible) return null;

  return (
    <div
      className="pointer-events-none fixed left-0 top-0"
      style={{
        zIndex,
        transform: `translate(${pos.x}px, ${pos.y}px)`,
        willChange: 'transform',
      }}
      aria-hidden
    >
      <div
        style={{
          width: ringSize,
          height: ringSize,
          marginLeft: -ringSize / 2,
          marginTop: -ringSize / 2,
          border: `${ringStroke}px solid ${ring}`,
          borderRadius: '50%',
          transition: 'border-color 0.2s ease',
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          width: dotSize,
          height: dotSize,
          marginLeft: -dotSize / 2,
          marginTop: -dotSize / 2,
          borderRadius: '50%',
          backgroundColor: dot,
          transition: 'background-color 0.2s ease',
        }}
      />
    </div>
  );
}
