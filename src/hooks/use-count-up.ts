"use client";

import { useEffect, useRef, useState } from "react";

function prefersReducedMotion(): boolean {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

/**
 * Tweens the displayed number toward `target` with an ease-out curve.
 * Snaps instantly when the user prefers reduced motion.
 */
export function useCountUp(target: number, duration = 450): number {
  const [display, setDisplay] = useState(target);
  const displayRef = useRef(target);

  useEffect(() => {
    const from = displayRef.current;
    if (from === target) return;
    if (prefersReducedMotion() || duration <= 0) {
      displayRef.current = target;
      setDisplay(target);
      return;
    }
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      const v = Math.round(from + (target - from) * eased);
      displayRef.current = v;
      setDisplay(v);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      displayRef.current = target;
    };
  }, [target, duration]);

  return display;
}

/**
 * One-shot count-up on mount, used by merged tiles so the label rolls from
 * the pre-merge value (4 → 8) instead of snapping. Non-merged tiles pass
 * from === to and render statically.
 */
export function useMergeCount(from: number, to: number, duration = 170): number {
  const [display, setDisplay] = useState(from);

  useEffect(() => {
    if (from === to || prefersReducedMotion()) {
      setDisplay(to);
      return;
    }
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - p, 2);
      setDisplay(Math.round(from + (to - from) * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // Mount-only by design: merged tiles are freshly mounted components.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return display;
}
