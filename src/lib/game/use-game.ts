"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  createInitialTiles,
  hasMoves,
  move as applyMove,
  spawnRandomTile,
  WIN_VALUE,
} from "./engine";
import { sound } from "./sound";
import { storage } from "./storage";
import { vibration } from "./vibration";
import type { BoardSize, Direction, Tile } from "./types";

export const UNDO_LIMIT = 3;

/** Keep in sync with the `.tile` CSS transition duration (matching play2048.co). */
const SLIDE_MS = 100;
/** Ghost tiles unmount exactly when the slide ends and pop bloom begins. */
const GHOST_MS = 100;

interface Snapshot {
  tiles: Tile[];
  score: number;
  won: boolean;
  keepPlaying: boolean;
  moves: number;
}

function stripTransient(tiles: Tile[]): Tile[] {
  return tiles.map(({ isNew: _i, isMerged: _m, countFrom: _c, spawnIndex: _s, ...rest }) => rest);
}

export function useGame() {
  const [size, setSize] = useState<BoardSize>(4);
  const [tiles, setTiles] = useState<Tile[]>([]);
  const [ghosts, setGhosts] = useState<Tile[]>([]);
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(0);
  const [won, setWon] = useState(false);
  const [over, setOver] = useState(false);
  const [winOpen, setWinOpen] = useState(false);
  const [overOpen, setOverOpen] = useState(false);
  const [canUndo, setCanUndo] = useState(false);
  const [undoCount, setUndoCount] = useState(0);
  const [moves, setMoves] = useState(0);
  const [gained, setGained] = useState<{ id: number; amount: number } | null>(null);
  const [bump, setBump] = useState<{ dir: Direction; n: number } | null>(null);
  const [announcement, setAnnouncement] = useState("");

  // Mirrors of the state above: `move` reads these so rapid key presses that
  // land inside one render batch always act on the freshest board.
  const sizeRef = useRef<BoardSize>(4);
  const tilesRef = useRef<Tile[]>([]);
  const scoreRef = useRef(0);
  const bestRef = useRef(0);
  const wonRef = useRef(false);
  const keepPlayingRef = useRef(false);
  const overRef = useRef(false);
  const historyRef = useRef<Snapshot[]>([]);
  const movesRef = useRef(0);
  const bumpNRef = useRef(0);
  const gainIdRef = useRef(0);
  const blockedRef = useRef(false);
  const ghostTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const modalTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const reset = useCallback((nextSize: BoardSize) => {
    if (ghostTimer.current) clearTimeout(ghostTimer.current);
    if (modalTimer.current) clearTimeout(modalTimer.current);
    sizeRef.current = nextSize;
    const fresh = createInitialTiles(nextSize);
    tilesRef.current = fresh;
    const storedBest = storage.get<number>(`best-${nextSize}`, 0);
    bestRef.current = storedBest;
    historyRef.current = [];
    movesRef.current = 0;
    scoreRef.current = 0;
    wonRef.current = false;
    keepPlayingRef.current = false;
    overRef.current = false;
    setSize(nextSize);
    setTiles(fresh);
    setGhosts([]);
    setScore(0);
    setBest(storedBest);
    setWon(false);
    setOver(false);
    setWinOpen(false);
    setOverOpen(false);
    setCanUndo(false);
    setUndoCount(0);
    setMoves(0);
    setGained(null);
    setBump(null);
    storage.set("size", nextSize);
  }, []);

  // Hydrate persisted preferences once, then start the first game.
  useEffect(() => {
    const stored = storage.get<number>("size", 4);
    reset(stored === 3 || stored === 5 ? stored : 4);
  }, [reset]);

  useEffect(() => {
    return () => {
      if (ghostTimer.current) clearTimeout(ghostTimer.current);
      if (modalTimer.current) clearTimeout(modalTimer.current);
    };
  }, []);

  const move = useCallback((dir: Direction) => {
    const size = sizeRef.current;
    if (overRef.current || (wonRef.current && !keepPlayingRef.current) || blockedRef.current) return;

    const outcome = applyMove(tilesRef.current, size, dir, WIN_VALUE);
    if (!outcome.moved) {
      bumpNRef.current += 1;
      setBump({ dir, n: bumpNRef.current });
      return;
    }

    historyRef.current = [
      ...historyRef.current.slice(-(UNDO_LIMIT - 1)),
      {
        tiles: stripTransient(tilesRef.current),
        score: scoreRef.current,
        won: wonRef.current,
        keepPlaying: keepPlayingRef.current,
        moves: movesRef.current,
      },
    ];
    setCanUndo(true);
    setUndoCount(historyRef.current.length);

    const spawned = spawnRandomTile(outcome.tiles, size);
    const nextTiles = spawned ? [...outcome.tiles, spawned] : outcome.tiles;
    tilesRef.current = nextTiles;
    setTiles(nextTiles);
    setGhosts(outcome.ghosts);

    const nextScore = scoreRef.current + outcome.gained;
    scoreRef.current = nextScore;
    setScore(nextScore);
    if (nextScore > bestRef.current) {
      bestRef.current = nextScore;
      setBest(nextScore);
      storage.set(`best-${size}`, nextScore);
    }

    movesRef.current += 1;
    setMoves(movesRef.current);
    if (outcome.gained > 0) {
      gainIdRef.current += 1;
      setGained({ id: gainIdRef.current, amount: outcome.gained });
    }

    const mergeNote =
      outcome.merges.length > 0
        ? ` Merged into ${outcome.topMerge} for ${outcome.gained} points.`
        : "";
    setAnnouncement(`Moved ${dir}.${mergeNote} Score ${nextScore}.`);

    sound.play("slide");
    if (outcome.merges.length > 0) {
      sound.play("merge", { mergeValue: outcome.topMerge, delay: 0.055 });
      vibration.trigger(10);
    }
    sound.play("spawn", { delay: 0.11 });

    if (ghostTimer.current) clearTimeout(ghostTimer.current);
    ghostTimer.current = setTimeout(() => setGhosts([]), GHOST_MS);

    if (outcome.reachedTarget && !wonRef.current) {
      wonRef.current = true;
      setWon(true);
      setAnnouncement(`You reached ${WIN_VALUE}! Score ${nextScore}.`);
      sound.play("win", { delay: 0.28 });
      vibration.trigger([25, 40, 30]);
      if (modalTimer.current) clearTimeout(modalTimer.current);
      modalTimer.current = setTimeout(() => setWinOpen(true), 520);
    } else if (!hasMoves(nextTiles, size)) {
      overRef.current = true;
      setOver(true);
      setAnnouncement(`Game over, no moves left. Final score ${nextScore}.`);
      sound.play("over", { delay: 0.32 });
      vibration.trigger([30, 50, 30]);
      if (modalTimer.current) clearTimeout(modalTimer.current);
      modalTimer.current = setTimeout(() => setOverOpen(true), 620);
    }
  }, []);

  const undo = useCallback(() => {
    const history = historyRef.current;
    if (history.length === 0) return;
    const snap = history[history.length - 1];
    historyRef.current = history.slice(0, -1);
    if (ghostTimer.current) clearTimeout(ghostTimer.current);
    if (modalTimer.current) clearTimeout(modalTimer.current);

    tilesRef.current = snap.tiles.map((t) => ({ ...t, restored: true }));
    scoreRef.current = snap.score;
    wonRef.current = snap.won;
    keepPlayingRef.current = snap.keepPlaying;
    movesRef.current = snap.moves;
    overRef.current = false;
    setTiles(tilesRef.current);
    setGhosts([]);
    setScore(snap.score);
    setWon(snap.won);
    setOver(false);
    setWinOpen(false);
    setOverOpen(false);
    setMoves(snap.moves);
    setCanUndo(historyRef.current.length > 0);
    setUndoCount(historyRef.current.length);
    setGained(null);
    setAnnouncement("Undo. Restored the previous move.");
  }, []);

  const keepPlaying = useCallback(() => {
    keepPlayingRef.current = true;
    setWinOpen(false);
  }, []);

  const setInputBlocked = useCallback((blocked: boolean) => {
    blockedRef.current = blocked;
  }, []);

  const startNewGame = useCallback(() => reset(sizeRef.current), [reset]);
  const startWithSize = useCallback((s: BoardSize) => reset(s), [reset]);

  return {
    size,
    tiles,
    ghosts,
    score,
    best,
    won,
    over,
    winOpen,
    overOpen,
    canUndo,
    undoCount,
    moves,
    gained,
    bump,
    announcement,
    move,
    undo,
    keepPlaying,
    startNewGame,
    startWithSize,
    setInputBlocked,
  };
}
