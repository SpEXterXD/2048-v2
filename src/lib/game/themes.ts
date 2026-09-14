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
    hint: "Warm cream, original palette",
    swatch: ["#bbada0", "#f2b179", "#edc22e"],
    burst: ["#edc22e", "#f2b179", "#f67c5f", "#bbada0", "#8f7a66"],
    pageColor: "#faf8ef",
  },
  {
    id: "midnight",
    label: "Midnight",
    hint: "Deep space, neon glow",
    swatch: ["#12121c", "#22d3ee", "#8b5cf6"],
    burst: ["#22d3ee", "#8b5cf6", "#a5b4fc", "#67e8f9", "#e879f9"],
    pageColor: "#0a0a12",
  },
  {
    id: "pastel",
    label: "Pastel",
    hint: "Soft lavender, airy",
    swatch: ["#f9c8d8", "#cabdf5", "#bde9d7"],
    burst: ["#cabdf5", "#f9c8d8", "#bde9d7", "#fdf0bb", "#fbc3a0"],
    pageColor: "#f6f4fb",
  },
  {
    id: "mono",
    label: "Mono",
    hint: "Brutalist, high contrast",
    swatch: ["#0a0a0a", "#a3a3a3", "#ffffff"],
    burst: ["#0a0a0a", "#525252", "#a3a3a3", "#d4d4d4", "#737373"],
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
