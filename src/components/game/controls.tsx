"use client";

import { RotateCcw, Undo2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

export function Controls({
  onNewGame,
  onUndo,
  canUndo,
  undoCount = 0,
}: {
  onNewGame: () => void;
  onUndo: () => void;
  canUndo: boolean;
  undoCount?: number;
}) {
  return (
    <div className="flex items-center gap-2">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            size="sm"
            onClick={onNewGame}
            className="h-9 gap-1.5 px-3.5 font-semibold shadow-elev-1 transition-all duration-150 active:scale-[0.96]"
          >
            <RotateCcw className="size-3.5" aria-hidden="true" />
            <span>New Game</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>Starts fresh. Confirms if a game is in progress.</TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            size="sm"
            variant="outline"
            onClick={onUndo}
            disabled={!canUndo}
            className="h-9 gap-2 px-3 font-semibold border-border/80 bg-card/60 backdrop-blur-sm transition-all duration-150 hover:bg-accent/80 active:scale-[0.96] disabled:opacity-40"
          >
            <Undo2 className="size-3.5" aria-hidden="true" />
            <span>Undo</span>
            <span className="flex items-center gap-1 pl-0.5" aria-hidden="true">
              {[0, 1, 2].map((idx) => {
                const active = idx < undoCount;
                return (
                  <span
                    key={idx}
                    className={`size-1.5 rounded-full transition-all duration-200 ${
                      active
                        ? "bg-primary shadow-[0_0_6px_hsl(var(--primary))]"
                        : "bg-muted-foreground/25"
                    }`}
                  />
                );
              })}
            </span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>Undo last move. Up to 3 stored snapshots (Z).</TooltipContent>
      </Tooltip>
    </div>
  );
}
