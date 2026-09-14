"use client";

import { useEffect, useRef } from "react";
import { Check, Palette } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
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
  const active = THEMES.find((t) => t.id === theme) ?? THEMES[0];
  const committedRef = useRef<ThemeId>(theme);

  useEffect(() => {
    committedRef.current = theme;
  }, [theme]);

  const applyTheme = (id: ThemeId) => {
    document.documentElement.dataset.theme = id;
    document.documentElement.style.colorScheme = id === "midnight" ? "dark" : "light";
    const pageColor = THEMES.find((t) => t.id === id)?.pageColor;
    if (pageColor) {
      document.querySelector('meta[name="theme-color"]')?.setAttribute("content", pageColor);
    }
  };

  const preview = (id: ThemeId | null) => {
    if (typeof window !== "undefined" && !window.matchMedia("(hover: hover)").matches) {
      return;
    }
    applyTheme(id ?? committedRef.current);
  };

  const selectTheme = (id: ThemeId) => {
    committedRef.current = id;
    applyTheme(id);
    onChange(id);
  };

  return (
    <Popover
      onOpenChange={(open) => {
        if (!open) applyTheme(committedRef.current);
      }}
    >
      <Tooltip>
        <TooltipTrigger asChild>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              aria-label={`Color theme: ${active.label}. Open to change the theme.`}
            >
              <Palette className="size-4" aria-hidden="true" />
            </Button>
          </PopoverTrigger>
        </TooltipTrigger>
        <TooltipContent>Theme</TooltipContent>
      </Tooltip>
      <PopoverContent align="end" className="w-64 p-1.5" role="radiogroup" aria-label="Color theme">
        {THEMES.map((t) => {
          const selected = t.id === theme;
          return (
            <button
              key={t.id}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => selectTheme(t.id)}
              onPointerEnter={() => preview(t.id)}
              onPointerLeave={() => preview(null)}
              onFocus={() => preview(t.id)}
              onBlur={() => preview(null)}
              className={cn(
                "flex w-full items-center gap-2.5 rounded-sm px-2.5 py-2 text-left outline-none transition-[background-color,transform] duration-150 focus-visible:ring-2 focus-visible:ring-ring active:scale-[0.98]",
                selected ? "bg-accent" : "hover:bg-accent/60"
              )}
            >
              <span className="flex shrink-0" aria-hidden="true">
                {t.swatch.map((color, i) => (
                  <span
                    key={i}
                    className={cn(
                      "size-4 rounded-full border border-black/10 ring-2 ring-popover",
                      i > 0 && "-ml-1.5"
                    )}
                    style={{ background: color }}
                  />
                ))}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-medium leading-tight">{t.label}</span>
                <span className="block truncate text-xs text-muted-foreground">{t.hint}</span>
              </span>
              {selected && <Check className="size-4 shrink-0 text-primary" aria-hidden="true" />}
            </button>
          );
        })}
      </PopoverContent>
    </Popover>
  );
}
