"use client";

import { Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

export function SoundToggle({
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
          aria-label={enabled ? "Turn sound off" : "Turn sound on"}
          onClick={() => onChange(!enabled)}
        >
          {enabled ? (
            <Volume2 className="size-4" aria-hidden="true" />
          ) : (
            <VolumeX className="size-4 text-muted-foreground" aria-hidden="true" />
          )}
        </Button>
      </TooltipTrigger>
      <TooltipContent>{enabled ? "Sound on" : "Sound off"}</TooltipContent>
    </Tooltip>
  );
}
