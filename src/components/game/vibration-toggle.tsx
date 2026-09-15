"use client";

import { Vibrate, VibrateOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

export function VibrationToggle({
  enabled,
  onChange,
}: {
  enabled: boolean;
  onChange: (enabled: boolean) => void;
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="size-9 rounded-lg border-border/80 bg-card/60 backdrop-blur-sm shadow-sm hover:bg-accent/80 active:scale-[0.96]"
          aria-pressed={enabled}
          aria-label={enabled ? "Turn vibration off" : "Turn vibration on"}
          onClick={() => onChange(!enabled)}
        >
          {enabled ? (
            <Vibrate className="size-4" aria-hidden="true" />
          ) : (
            <VibrateOff className="size-4 text-muted-foreground" aria-hidden="true" />
          )}
        </Button>
      </TooltipTrigger>
      <TooltipContent>{enabled ? "Vibration on" : "Vibration off"}</TooltipContent>
    </Tooltip>
  );
}
