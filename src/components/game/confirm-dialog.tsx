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
      <AlertDialogContent className="max-w-sm">
        <AlertDialogTitle>{request?.title}</AlertDialogTitle>
        <AlertDialogDescription>{request?.description}</AlertDialogDescription>
        <div className="mt-2 flex justify-end gap-2">
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <Button onClick={() => request?.onConfirm()}>{request?.confirmLabel ?? "Confirm"}</Button>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}
