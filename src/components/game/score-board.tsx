"use client";

import { useCountUp } from "@/hooks/use-count-up";

const fmt = new Intl.NumberFormat("en-US");

export interface Gained {
  id: number;
  amount: number;
}

function Stat({
  label,
  value,
  empty,
  float,
}: {
  label: string;
  value: number;
  /** True when there is no recorded value yet (e.g. fresh game before any finished runs). */
  empty?: boolean;
  float?: Gained | null;
}) {
  const shown = useCountUp(value);
  return (
    <div className="relative flex flex-1 flex-col rounded-xl border border-border/70 bg-card/60 px-3.5 py-2.5 shadow-elev-1 backdrop-blur-sm transition-[border-color,background-color] duration-150 sm:px-4 sm:py-3">
      {float && float.amount > 0 && (
        <span
          key={float.id}
          aria-hidden="true"
          className="animate-float-up absolute -top-2.5 right-2 rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-semibold tabular-nums text-primary-foreground shadow-elev-1"
        >
          +{fmt.format(float.amount)}
        </span>
      )}
      <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
        {label}
      </span>
      <span className="mt-1 flex h-7 items-end leading-none sm:h-9 xl:h-10">
        <span
          className={
            "text-2xl font-bold leading-none tracking-tight tabular-nums sm:text-3xl xl:text-4xl " +
            (empty ? "text-muted-foreground/45" : "text-foreground")
          }
        >
          {fmt.format(shown)}
        </span>
      </span>
    </div>
  );
}

/**
 * Current score, best score, and moves tracked in sleek cards. Values are
 * announced through the live region, so the block is decorative to screen readers.
 */
export function ScoreBoard({
  score,
  best,
  moves,
  gained,
  hasBest,
}: {
  score: number;
  best: number;
  moves: number;
  gained: Gained | null;
  /** False before the first finished game; Best shows 0 in muted tone. */
  hasBest: boolean;
}) {
  return (
    <div className="grid grid-cols-3 gap-2 sm:gap-3 md:flex md:flex-col md:gap-2.5" aria-hidden="true">
      <Stat label="Score" value={score} float={gained} />
      <Stat label="Best" value={best} empty={!hasBest} />
      <Stat label="Moves" value={moves} />
    </div>
  );
}
