"use client";

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

export interface ConfirmRequest {
  title: string;
  description: string;
  confirmLabel: string;
  onConfirm: () => void;
}

/** Guard against throwing away a game in progress (new game, board-size change). */
export function ConfirmDialog({
  request,
  onCancel,
}: {
  request: ConfirmRequest | null;
  onCancel: () => void;
  }) {
  return (
    <AlertDialog
      open={request !== null}
      onOpenChange={(open) => {
        if (!open) onCancel();
      }}
    >
      <AlertDialogContent className="max-w-sm rounded-2xl border-border/80 bg-card/95 p-6 shadow-elev-2 backdrop-blur-2xl">
        <AlertDialogTitle className="font-display text-xl font-bold tracking-tight">
          {request?.title}
        </AlertDialogTitle>
        <AlertDialogDescription className="text-sm text-muted-foreground">
          {request?.description}
        </AlertDialogDescription>
        <div className="mt-4 flex justify-end gap-2.5">
          <AlertDialogCancel className="h-9 rounded-lg font-medium">Cancel</AlertDialogCancel>
          <Button onClick={() => request?.onConfirm()} className="h-9 rounded-lg font-semibold shadow-elev-1">
            {request?.confirmLabel ?? "Confirm"}
          </Button>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}
