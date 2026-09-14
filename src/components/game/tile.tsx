"use client";

import type { CSSProperties } from "react";
import { useMergeCount } from "@/hooks/use-count-up";
import { cn } from "@/lib/utils";
import type { Tile } from "@/lib/game/types";

interface TileViewProps {
  tile: Tile;
  ghost?: boolean;
}

/**
 * A single tile. Position comes from --row/--col custom properties through a
 * translate() transform, so movement is a compositor transition. Ghost tiles
 * (consumed by a merge) keep their React identity and slide underneath while
 * the merged tile blooms over them.
 */
export function TileView({ tile, ghost = false }: TileViewProps) {
  const valueClass = tile.value <= 2048 ? `tile-v${tile.value}` : "tile-vsuper";
  const countFrom = ghost ? tile.value : (tile.countFrom ?? tile.value);
  const shown = useMergeCount(countFrom, tile.value);
  // The opening two tiles stagger their entrance; later spawns keep the
  // class-level 70 ms delay.
  const enterDelay =
    !ghost && tile.spawnIndex != null ? `${90 + tile.spawnIndex * 110}ms` : undefined;

  return (
    <div
      className={cn(
        "tile",
        valueClass,
        ghost && "tile-ghost",
        tile.isNew && "tile-spawn",
        tile.isMerged && "tile-merge",
        tile.restored && "tile-restored"
      )}
      style={
        { "--row": tile.row, "--col": tile.col, animationDelay: enterDelay } as CSSProperties
      }
      data-len={Math.min(String(tile.value).length, 5)}
      aria-hidden="true"
    >
      {shown}
    </div>
  );
}
