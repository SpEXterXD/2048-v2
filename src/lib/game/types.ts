export type Direction = "up" | "down" | "left" | "right";

export type BoardSize = 3 | 4 | 5;

export type ThemeId = "classic" | "midnight" | "pastel" | "mono";

export interface Tile {
  id: number;
  value: number;
  row: number;
  col: number;
  /** Spawned this move; plays the spring scale-in. */
  isNew?: boolean;
  /** Created by a merge this move; plays the pop and glow flash. */
  isMerged?: boolean;
  /** Value before the merge, so the label can count up from it. */
  countFrom?: number;
  /** Entrance order for the opening two tiles (staggered first paint). */
  spawnIndex?: number;
  /** Restored by undo; plays a short fade while survivors slide back. */
  restored?: boolean;
}

export interface MergeEvent {
  value: number;
  row: number;
  col: number;
}

export interface MoveOutcome {
  moved: boolean;
  /** Points earned this move (sum of merged values). */
  gained: number;
  merges: MergeEvent[];
  /** Highest value produced by a merge this move (drives sound pitch). */
  topMerge: number;
  /** True when a merge reached the win value. */
  reachedTarget: boolean;
  /** Final tiles: survivors in their new positions plus freshly merged tiles. */
  tiles: Tile[];
  /** Consumed tiles, positioned at their merge destination so they slide under the new tile. */
  ghosts: Tile[];
}
