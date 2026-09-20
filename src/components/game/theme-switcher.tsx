"use client";

import { useState } from "react";
import { Check, Palette } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { THEMES } from "@/lib/game/themes";
import type { ThemeId } from "@/lib/game/types";
import { cn } from "@/lib/utils";

export function ThemeSwitcher({
  theme,
  onChange,
}: {
  theme: ThemeId;
  onChange: (theme: ThemeId) => void;
}) {
  const [open, setOpen] = useState(false);
  const active = THEMES.find((t) => t.id === theme) ?? THEMES[0];

  const selectTheme = (id: ThemeId) => {
    onChange(id);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="size-9 rounded-lg border-border/80 bg-card/60 backdrop-blur-sm shadow-sm hover:bg-accent/80 active:scale-[0.96]"
          aria-label={`Color theme: ${active.label}. Open to change the theme.`}
        >
          <Palette className="size-4" aria-hidden="true" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        sideOffset={8}
        className="w-72 rounded-2xl border border-border/80 bg-popover/95 p-2 shadow-elev-2 backdrop-blur-xl"
        role="radiogroup"
        aria-label="Color theme"
      >
        <div className="px-2 py-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
          Curated Palettes
        </div>
        <div className="space-y-1">
          {THEMES.map((t) => {
            const selected = t.id === theme;
            return (
              <button
                key={t.id}
                type="button"
                role="radio"
                aria-checked={selected}
                onClick={() => selectTheme(t.id)}
                className={cn(
                  "flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left outline-none transition-all duration-150 focus-visible:ring-2 focus-visible:ring-ring active:scale-[0.98]",
                  selected
                    ? "bg-accent text-accent-foreground font-semibold shadow-sm"
                    : "hover:bg-accent/60 text-foreground"
                )}
              >
                <span className="flex shrink-0 items-center" aria-hidden="true">
                  {t.swatch.map((color, i) => (
                    <span
                      key={i}
                      className={cn(
                        "size-4 rounded-full border border-black/10 ring-2 ring-popover shadow-sm",
                        i > 0 && "-ml-1.5"
                      )}
                      style={{ background: color }}
                    />
                  ))}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-medium leading-snug">{t.label}</span>
                  <span className="block truncate text-xs text-muted-foreground">{t.hint}</span>
                </span>
                {selected && (
                  <Check className="size-4 shrink-0 text-primary" aria-hidden="true" />
                )}
              </button>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}
