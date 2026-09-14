"use client";

import { PartyPopper, RotateCcw, Undo2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { WIN_VALUE } from "@/lib/game/engine";

const fmt = new Intl.NumberFormat("en-US");

interface GameOverModalProps {
  variant: "win" | "over";
  open: boolean;
  score: number;
  best: number;
  moves: number;
  size: number;
  canUndo: boolean;
  onKeepPlaying: () => void;
  onNewGame: () => void;
  onUndo: () => void;
}

function StatChip({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex min-w-[4.5rem] flex-col items-center rounded-lg border border-border/70 bg-muted/50 px-3 py-2">
      <span className="text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
        {label}
      </span>
      <span className="text-lg font-bold leading-tight tabular-nums">{value}</span>
    </div>
  );
}

/** End-of-game dialog for both the win (2048 reached) and game-over states. */
export function GameOverModal({
  variant,
  open,
  score,
  best,
  moves,
  size,
  canUndo,
  onKeepPlaying,
  onNewGame,
  onUndo,
}: GameOverModalProps) {
  const isWin = variant === "win";
  const Icon = isWin ? PartyPopper : RotateCcw;

  return (
    <AlertDialog open={open}>
      <AlertDialogContent className="max-w-sm">
        <div className="flex flex-col items-center gap-1.5 pt-2 text-center">
          <div className="mb-2 grid size-12 place-items-center rounded-full bg-accent">
            <Icon className="size-6 text-primary" aria-hidden="true" />
          </div>
          <AlertDialogTitle className="text-xl">
            {isWin ? `You made ${WIN_VALUE}!` : "Game over"}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-balance">
            {isWin
              ? `Reached ${WIN_VALUE}. Keep going for a higher score, or start a fresh board.`
              : `No moves left on the ${size}×${size} board.`}
          </AlertDialogDescription>
        </div>

        <div className="flex justify-center gap-2">
          <StatChip label="Score" value={fmt.format(score)} />
          <StatChip label="Best" value={fmt.format(best)} />
          <StatChip label="Moves" value={moves} />
        </div>

        <div className="flex flex-col gap-2">
          {isWin ? (
            <>
              <Button onClick={onKeepPlaying} className="w-full">
                Keep Playing
              </Button>
              <Button variant="outline" onClick={onNewGame} className="w-full">
                New Game
              </Button>
            </>
          ) : (
            <Button onClick={onNewGame} className="w-full">
              Try Again
            </Button>
          )}
          {canUndo && (
            <Button variant="ghost" onClick={onUndo} className="w-full">
              <Undo2 className="size-4" aria-hidden="true" />
              Undo last move
            </Button>
          )}
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}
