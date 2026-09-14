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
      className="flex items-center gap-0.5 rounded-lg border border-border/70 bg-muted/60 p-1"
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
              "rounded-sm px-3 py-1 text-xs font-medium tabular-nums outline-none transition-[background-color,color,box-shadow,transform] duration-150 focus-visible:ring-2 focus-visible:ring-ring active:scale-[0.97]",
              selected
                ? "bg-background text-foreground shadow-elev-1"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {s}×{s}
          </button>
        );
      })}
    </div>
  );
}
