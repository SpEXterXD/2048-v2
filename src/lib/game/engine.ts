import type { BoardSize, Direction, MoveOutcome, Tile } from "./types";

export const WIN_VALUE = 2048;

let nextId = 1;

function emptyCells(tiles: Tile[], size: number): Array<[number, number]> {
  const occupied = new Set(tiles.map((t) => t.row * size + t.col));
  const cells: Array<[number, number]> = [];
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (!occupied.has(r * size + c)) cells.push([r, c]);
    }
  }
  return cells;
}

export function spawnRandomTile(
  tiles: Tile[],
  size: number,
  rng: () => number = Math.random
): Tile | null {
  const empty = emptyCells(tiles, size);
  if (empty.length === 0) return null;
  const [row, col] = empty[Math.floor(rng() * empty.length)];
  const value = rng() < 0.9 ? 2 : 4;
  return { id: nextId++, value, row, col, isNew: true };
}

export function createInitialTiles(
  size: BoardSize,
  rng: () => number = Math.random
): Tile[] {
  nextId = 1;
  const tiles: Tile[] = [];
  for (let i = 0; i < 2; i++) {
    const tile = spawnRandomTile(tiles, size, rng);
    if (tile) tiles.push(tile);
  }
  return tiles.map((tile, i) => ({ ...tile, spawnIndex: i }));
}

export function hasMoves(tiles: Tile[], size: number): boolean {
  if (tiles.length < size * size) return true;
  const grid = new Map<number, number>();
  for (const t of tiles) grid.set(t.row * size + t.col, t.value);
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      const v = grid.get(r * size + c);
      if (v === undefined) return true;
      if (c + 1 < size && grid.get(r * size + c + 1) === v) return true;
      if (r + 1 < size && grid.get((r + 1) * size + c) === v) return true;
    }
  }
  return false;
}

/**
 * Slides and merges tiles in `dir` following standard 2048 rules: tiles
 * collapse toward the direction, equal neighbours merge once per move, and
 * merged results are locked so chains resolve in traversal order (2,2,4
 * becomes 4,4). Pure: returns new tile objects, never mutates the input.
 */
export function move(
  tiles: Tile[],
  size: BoardSize,
  dir: Direction,
  winValue = WIN_VALUE
): MoveOutcome {
  const grid: Array<Array<Tile | null>> = Array.from({ length: size }, () =>
    Array<Tile | null>(size).fill(null)
  );
  for (const t of tiles) {
    const { isNew: _i, isMerged: _m, countFrom: _c, spawnIndex: _s, restored: _r, ...clean } = t;
    grid[t.row][t.col] = clean;
  }

  const out: Array<Array<Tile | null>> = Array.from({ length: size }, () =>
    Array<Tile | null>(size).fill(null)
  );
  const ghosts: Tile[] = [];
  const merges: MoveOutcome["merges"] = [];
  let moved = false;
  let gained = 0;
  let topMerge = 0;
  let reachedTarget = false;

  // Maps a line index plus slot-along-movement to a board coordinate, so
  // every direction shares the same forward-order traversal.
  const coordAt = (line: number, slot: number): [number, number] => {
    switch (dir) {
      case "left":
        return [line, slot];
      case "right":
        return [line, size - 1 - slot];
      case "up":
        return [slot, line];
      case "down":
        return [size - 1 - slot, line];
    }
  };

  for (let line = 0; line < size; line++) {
    const lineTiles: Tile[] = [];
    for (let slot = 0; slot < size; slot++) {
      const [r, c] = coordAt(line, slot);
      const tile = grid[r][c];
      if (tile) lineTiles.push(tile);
    }

    let write = 0;
    let lastTileCanMerge = false;
    for (const tile of lineTiles) {
      if (lastTileCanMerge && write > 0) {
        const [mr, mc] = coordAt(line, write - 1);
        const target = out[mr][mc];
        if (target && target.value === tile.value) {
          ghosts.push(
            { ...target, row: mr, col: mc, isNew: false, isMerged: false },
            { ...tile, row: mr, col: mc, isNew: false, isMerged: false }
          );
          const value = tile.value * 2;
          out[mr][mc] = {
            id: nextId++,
            value,
            row: mr,
            col: mc,
            isMerged: true,
            countFrom: tile.value,
          };
          gained += value;
          topMerge = Math.max(topMerge, value);
          merges.push({ value, row: mr, col: mc });
          if (value >= winValue) reachedTarget = true;
          moved = true;
          lastTileCanMerge = false;
          continue;
        }
      }
      const [r, c] = coordAt(line, write);
      if (tile.row !== r || tile.col !== c) moved = true;
      out[r][c] = { ...tile, row: r, col: c };
      lastTileCanMerge = true;
      write++;
    }
  }

  const finalTiles: Tile[] = [];
  for (const row of out) {
    for (const tile of row) {
      if (tile) finalTiles.push(tile);
    }
  }

  return { moved, gained, merges, topMerge, reachedTarget, tiles: finalTiles, ghosts };
}
