import type { ThemeId } from "./types";

export interface ThemeDef {
  id: ThemeId;
  label: string;
  hint: string;
  /** Three dots shown in the switcher. */
  swatch: [string, string, string];
  /** Particle palette for the win confetti. */
  burst: string[];
  /** Approximate page background, for the dynamic theme-color meta. */
  pageColor: string;
}

export const THEMES: ThemeDef[] = [
  {
    id: "classic",
    label: "Classic",
    hint: "Warm sand, amber & terracotta",
    swatch: ["#b8a99a", "#ea8a56", "#eab308"],
    burst: ["#eab308", "#ea8a56", "#e11d48", "#b8a99a", "#786452"],
    pageColor: "#f7f5f0",
  },
  {
    id: "midnight",
    label: "Midnight",
    hint: "Cosmic OLED, radiant neon",
    swatch: ["#12121c", "#06b6d4", "#a855f7"],
    burst: ["#22d3ee", "#a855f7", "#38bdf8", "#c084fc", "#f43f5e"],
    pageColor: "#08080e",
  },
  {
    id: "pastel",
    label: "Pastel",
    hint: "Tokyo lavender, soft iris",
    swatch: ["#c4b5fd", "#fbcfe8", "#6ee7b7"],
    burst: ["#a855f7", "#ec4899", "#10b981", "#f59e0b", "#6366f1"],
    pageColor: "#f5f3fa",
  },
  {
    id: "mono",
    label: "Mono",
    hint: "Swiss brutalist, high contrast",
    swatch: ["#171717", "#737373", "#f5f5f5"],
    burst: ["#171717", "#404040", "#737373", "#a3a3a3", "#e5e5e5"],
    pageColor: "#ffffff",
  },
];

export function isThemeId(value: unknown): value is ThemeId {
  return typeof value === "string" && THEMES.some((t) => t.id === value);
}

/** The theme used when the visitor has not picked one yet. */
export function systemThemeId(): ThemeId {
  if (typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches) {
    return "midnight";
  }
  return "classic";
}
