"use client";

import { useEffect, useMemo, useRef, useState, type CSSProperties, type PointerEvent as ReactPointerEvent } from "react";
import { TileView } from "./tile";
import type { Direction, Tile } from "@/lib/game/types";

interface BoardProps {
  size: number;
  tiles: Tile[];
  ghosts: Tile[];
  /** Incrementing bump marker; plays a tiny nudge toward `dir` on invalid moves. */
  bump: { dir: Direction; n: number } | null;
  onSwipe: (dir: Direction) => void;
}

const SWIPE_THRESHOLD = 24;

export function Board({ size, tiles, ghosts, bump, onSwipe }: BoardProps) {
  const boardRef = useRef<HTMLDivElement>(null);
  const [metrics, setMetrics] = useState<{ cell: number; gap: number } | null>(null);
  const pointerStart = useRef<{ x: number; y: number; id: number } | null>(null);
  const lastBump = useRef(0);

  // Measure the board once and on every resize; cell/gap become CSS vars so
  // tiles, background cells and glow shadows all stay pixel-aligned.
  useEffect(() => {
    const el = boardRef.current;
    if (!el) return;
    const measure = () => {
      const w = el.clientWidth;
      if (w <= 0) return;
      const gap = Math.max(6, Math.round(w * 0.024));
      const cell = (w - (size + 1) * gap) / size;
      setMetrics({ cell, gap });
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [size]);

  // Invalid-move feedback: a small directional nudge, skipped under reduced motion.
  useEffect(() => {
    if (!bump || bump.n === lastBump.current) return;
    lastBump.current = bump.n;
    const el = boardRef.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const dist = Math.min(7, Math.max(4, (metrics?.cell ?? 80) * 0.06));
    const dx = bump.dir === "left" ? -dist : bump.dir === "right" ? dist : 0;
    const dy = bump.dir === "up" ? -dist : bump.dir === "down" ? dist : 0;
    el.animate(
      [
        { transform: "translate(0, 0)" },
        { transform: `translate(${dx}px, ${dy}px)` },
        { transform: "translate(0, 0)" },
      ],
      { duration: 180, easing: "ease-out" }
    );
  }, [bump, metrics]);

  const handlePointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    pointerStart.current = { x: e.clientX, y: e.clientY, id: e.pointerId };
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // Pointer capture is best-effort; the gesture still works when the
      // pointer is released over the board.
    }
  };

  const handlePointerUp = (e: ReactPointerEvent<HTMLDivElement>) => {
    const start = pointerStart.current;
    pointerStart.current = null;
    if (!start || e.pointerId !== start.id) return;
    const dx = e.clientX - start.x;
    const dy = e.clientY - start.y;
    const absX = Math.abs(dx);
    const absY = Math.abs(dy);
    if (Math.max(absX, absY) < SWIPE_THRESHOLD) return;
    if (absX > absY) onSwipe(dx > 0 ? "right" : "left");
    else onSwipe(dy > 0 ? "down" : "up");
  };

  const ghostIds = useMemo(() => new Set(ghosts.map((g) => g.id)), [ghosts]);

  return (
    <div
      ref={boardRef}
      role="group"
      aria-label={`${size} by ${size} game board. Move tiles with the arrow keys, WASD, or a swipe.`}
      className="game-board relative aspect-square w-full select-none"
      style={
        (metrics
          ? { "--cell": `${metrics.cell}px`, "--gap": `${metrics.gap}px` }
          : {}) as CSSProperties
      }
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerCancel={() => (pointerStart.current = null)}
    >
      <div className="absolute inset-0" aria-hidden="true">
        <div
          key={size}
          className="board-cells-in grid h-full w-full"
          style={{
            gridTemplateColumns: `repeat(${size}, var(--cell))`,
            gap: "var(--gap)",
            padding: "var(--gap)",
          }}
        >
          {Array.from({ length: size * size }, (_, i) => (
            <div key={i} className="board-cell" />
          ))}
        </div>
      </div>
      {metrics && (
        <div className="absolute inset-0">
          {[...ghosts, ...tiles].map((tile) => (
            <TileView key={tile.id} tile={tile} ghost={ghostIds.has(tile.id)} />
          ))}
        </div>
      )}
    </div>
  );
}
