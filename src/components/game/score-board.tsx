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
    <div className="glass-panel relative flex flex-1 flex-col items-center justify-center rounded-xl px-3 py-2.5 sm:px-4 sm:py-3 transition-[border-color,background-color,transform] duration-200">
      {float && float.amount > 0 && (
        <span
          key={float.id}
          aria-hidden="true"
          className="animate-float-up absolute -top-2.5 right-2 sm:right-3 rounded-full bg-primary px-2 py-0.5 text-[10.5px] font-bold tabular-nums text-primary-foreground shadow-elev-1 border border-primary-foreground/20"
        >
          +{fmt.format(float.amount)}
        </span>
      )}
      <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/80">
        {label}
      </span>
      <span className="mt-0.5 flex h-7 sm:h-8 items-center justify-center font-display leading-none">
        <span
          className={
            "text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight tabular-nums transition-colors duration-200 " +
            (empty ? "text-muted-foreground/40" : "text-foreground")
          }
        >
          {fmt.format(shown)}
        </span>
      </span>
    </div>
  );
}

/**
 * Precision score, best score, and move counter formatted in a clean horizontal strip.
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
    <div className="grid w-full grid-cols-3 gap-2 sm:gap-3" aria-hidden="true">
      <Stat label="Score" value={score} float={gained} />
      <Stat label="Best" value={best} empty={!hasBest} />
      <Stat label="Moves" value={moves} />
    </div>
  );
}
