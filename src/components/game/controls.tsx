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
          <Button size="sm" onClick={onNewGame}>
            <RotateCcw className="size-3.5" aria-hidden="true" />
            New Game
          </Button>
        </TooltipTrigger>
        <TooltipContent>Starts over. Confirms first while a game is running.</TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button size="sm" variant="outline" onClick={onUndo} disabled={!canUndo} className="gap-2">
            <Undo2 className="size-3.5" aria-hidden="true" />
            <span>Undo</span>
            <span className="flex items-center gap-1" aria-hidden="true">
              {[0, 1, 2].map((idx) => (
                <span
                  key={idx}
                  className={`size-1.5 rounded-full transition-colors duration-150 ${
                    idx < undoCount ? "bg-primary" : "bg-muted-foreground/25"
                  }`}
                />
              ))}
            </span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>Undo last move. Up to 3 available (Z).</TooltipContent>
      </Tooltip>
    </div>
  );
}
