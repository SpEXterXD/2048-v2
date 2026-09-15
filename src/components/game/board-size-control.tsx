"use client";

import type { BoardSize } from "@/lib/game/types";
import { cn } from "@/lib/utils";

const SIZES: BoardSize[] = [3, 4, 5];

export function BoardSizeControl({
  size,
  onChange,
}: {
  size: BoardSize;
  onChange: (size: BoardSize) => void;
}) {
  return (
    <div
      role="radiogroup"
      aria-label="Board size"
      className="flex h-9 items-center gap-1 rounded-lg border border-border/80 bg-card/60 p-1 backdrop-blur-sm shadow-sm"
    >
      {SIZES.map((s) => {
        const selected = s === size;
        return (
          <button
            key={s}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(s)}
            className={cn(
              "flex h-full items-center justify-center rounded-md px-2.5 text-xs font-bold tabular-nums outline-none transition-all duration-150 focus-visible:ring-2 focus-visible:ring-ring active:scale-[0.96]",
              selected
                ? "bg-primary text-primary-foreground shadow-elev-1"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
            )}
          >
            {s}×{s}
          </button>
        );
      })}
    </div>
  );
}
