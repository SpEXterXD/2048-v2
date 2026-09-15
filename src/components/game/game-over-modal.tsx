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
    <div className="flex min-w-[5rem] flex-col items-center rounded-xl border border-border/70 bg-card/80 px-3 py-2 shadow-sm backdrop-blur-sm">
      <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground/80">
        {label}
      </span>
      <span className="mt-0.5 font-display text-lg font-bold leading-tight tabular-nums">
        {value}
      </span>
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
      <AlertDialogContent className="max-w-sm rounded-2xl border-border/80 bg-card/95 p-6 shadow-elev-2 backdrop-blur-2xl">
        <div className="flex flex-col items-center gap-1.5 pt-1 text-center">
          <div className="mb-2 grid size-12 place-items-center rounded-2xl bg-accent text-primary shadow-sm border border-border/60">
            <Icon className="size-6 text-primary" aria-hidden="true" />
          </div>
          <AlertDialogTitle className="font-display text-2xl font-bold tracking-tight">
            {isWin ? `You reached ${WIN_VALUE}!` : "Game Over"}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-balance text-sm text-muted-foreground">
            {isWin
              ? `Congratulations! Continue pushing for a record score or start a fresh run.`
              : `No moves left on the ${size}×${size} grid.`}
          </AlertDialogDescription>
        </div>

        <div className="my-2 flex justify-center gap-2.5">
          <StatChip label="Score" value={fmt.format(score)} />
          <StatChip label="Best" value={fmt.format(best)} />
          <StatChip label="Moves" value={moves} />
        </div>

        <div className="flex flex-col gap-2 pt-1">
          {isWin ? (
            <>
              <Button onClick={onKeepPlaying} className="h-10 w-full font-semibold shadow-elev-1">
                Keep Playing
              </Button>
              <Button variant="outline" onClick={onNewGame} className="h-10 w-full font-semibold">
                New Game
              </Button>
            </>
          ) : (
            <Button onClick={onNewGame} className="h-10 w-full font-semibold shadow-elev-1">
              Try Again
            </Button>
          )}
          {canUndo && (
            <Button variant="ghost" onClick={onUndo} className="h-9 w-full gap-2 font-medium text-muted-foreground hover:text-foreground">
              <Undo2 className="size-4" aria-hidden="true" />
              Undo last move
            </Button>
          )}
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}
