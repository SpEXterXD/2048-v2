"use client";

import type { CSSProperties } from "react";
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
  // The opening two tiles stagger their entrance immediately; subsequent
  // spawns inherit the CSS-level 100ms slide delay.
  const enterDelay =
    !ghost && tile.spawnIndex != null ? `${tile.spawnIndex * 80}ms` : undefined;

  return (
    <div
      className={cn(
        "tile",
        ghost && "tile-ghost",
        tile.isMerged && "tile-is-merged",
        tile.isNew && "tile-is-new"
      )}
      style={
        { "--row": tile.row, "--col": tile.col } as CSSProperties
      }
      data-len={Math.min(String(tile.value).length, 5)}
      aria-hidden="true"
    >
      <div
        className={cn(
          "tile-inner",
          valueClass,
          tile.isNew && "tile-new",
          tile.isMerged && "tile-merged",
          tile.restored && "tile-restored"
        )}
        style={enterDelay ? { animationDelay: enterDelay } : undefined}
      >
        {tile.value}
      </div>
    </div>
  );
}
