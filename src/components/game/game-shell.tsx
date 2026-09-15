"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AmbientBackground } from "./ambient-background";
import { Board } from "./board";
import { BoardSizeControl } from "./board-size-control";
import { ConfirmDialog, type ConfirmRequest } from "./confirm-dialog";
import { Confetti } from "./confetti";
import { Controls } from "./controls";
import { GameOverModal } from "./game-over-modal";
import { ScoreBoard } from "./score-board";
import { SoundToggle } from "./sound-toggle";
import { ThemeSwitcher } from "./theme-switcher";
import { VibrationToggle } from "./vibration-toggle";
import { sound } from "@/lib/game/sound";
import { storage } from "@/lib/game/storage";
import { vibration } from "@/lib/game/vibration";
import { isThemeId, systemThemeId, THEMES } from "@/lib/game/themes";
import type { BoardSize, Direction, ThemeId } from "@/lib/game/types";
import { useGame } from "@/lib/game/use-game";
import { TooltipProvider } from "@/components/ui/tooltip";

const KEY_DIRS: Record<string, Direction> = {
  ArrowUp: "up",
  ArrowDown: "down",
  ArrowLeft: "left",
  ArrowRight: "right",
  w: "up",
  a: "left",
  s: "down",
  d: "right",
  W: "up",
  A: "left",
  S: "down",
  D: "right",
};

function Kbd({ children }: { children: string }) {
  return <kbd className="kbd">{children}</kbd>;
}

export function GameShell() {
  const game = useGame();
  const [theme, setTheme] = useState<ThemeId>("classic");
  const [soundOn, setSoundOn] = useState(false);
  const [vibrationOn, setVibrationOn] = useState(true);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [confirm, setConfirm] = useState<ConfirmRequest | null>(null);
  const confirmOpen = useRef(false);
  confirmOpen.current = confirm !== null;

  // Hydrate preferences (theme, sound, motion) after mount to stay SSR-safe.
  useEffect(() => {
    const stored = storage.get<unknown>("theme", null);
    setTheme(isThemeId(stored) ? stored : systemThemeId());
    setSoundOn(storage.get("sound", false));
    setVibrationOn(storage.get("vibration", true));
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  // Apply the theme to <html>. The inline head script already set it before
  // hydration to avoid a flash; hover previews in the switcher write the
  // same attribute directly and restore it on leave.
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme === "midnight" ? "dark" : "light";
    const pageColor = THEMES.find((t) => t.id === theme)?.pageColor;
    if (pageColor) {
      document
        .querySelector('meta[name="theme-color"]')
        ?.setAttribute("content", pageColor);
    }
  }, [theme]);

  // Persist only explicit choices; a followed OS default stays dynamic.
  const changeTheme = useCallback((next: ThemeId) => {
    setTheme(next);
    storage.set("theme", next);
  }, []);

  useEffect(() => {
    sound.setEnabled(soundOn);
    storage.set("sound", soundOn);
  }, [soundOn]);

  useEffect(() => {
    vibration.setEnabled(vibrationOn);
    storage.set("vibration", vibrationOn);
  }, [vibrationOn]);

  useEffect(() => {
    game.setInputBlocked(confirmOpen.current);
  }, [confirm, game.setInputBlocked]);

  // AudioContext creation needs a user gesture; any key or pointer counts.
  useEffect(() => {
    const unlock = () => sound.unlock();
    window.addEventListener("keydown", unlock);
    window.addEventListener("pointerdown", unlock);
    return () => {
      window.removeEventListener("keydown", unlock);
      window.removeEventListener("pointerdown", unlock);
    };
  }, []);

  const { move, undo } = game;
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (confirmOpen.current) return;
      const dir = KEY_DIRS[e.key];
      if (dir) {
        e.preventDefault();
        move(dir);
        return;
      }
      if (e.key === "z" || e.key === "Z") undo();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [move, undo]);

  const gameInProgress = game.moves > 0 && !game.over;

  // Reset continuity: fade the old board out, swap in the fresh game, and
  // let the new tiles stagger in.
  const [boardPhase, setBoardPhase] = useState<"live" | "resetting">("live");
  const resetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => { if (resetTimer.current) clearTimeout(resetTimer.current); }, []);
  const performReset = useCallback(
    (start: () => void) => {
      if (resetTimer.current) clearTimeout(resetTimer.current);
      if (reducedMotion) {
        start();
        return;
      }
      setBoardPhase("resetting");
      resetTimer.current = setTimeout(() => {
        start();
        setBoardPhase("live");
      }, 200);
    },
    [reducedMotion]
  );

  const requestNewGame = useCallback(() => {
    if (gameInProgress) {
      setConfirm({
        title: "Start a new game?",
        description: "Your current board and score will be reset.",
        confirmLabel: "New Game",
        onConfirm: () => {
          performReset(game.startNewGame);
          setConfirm(null);
        },
      });
    } else {
      performReset(game.startNewGame);
    }
  }, [gameInProgress, game.startNewGame, performReset]);

  const requestSize = useCallback(
    (next: BoardSize) => {
      if (next === game.size) return;
      if (gameInProgress) {
        setConfirm({
          title: `Switch to ${next}×${next}?`,
          description: "Changing the board size starts a fresh game. Your current progress will be reset.",
          confirmLabel: `Play ${next}×${next}`,
          onConfirm: () => {
            performReset(() => game.startWithSize(next));
            setConfirm(null);
          },
        });
      } else {
        performReset(() => game.startWithSize(next));
      }
    },
    [gameInProgress, game.size, game.startWithSize, performReset]
  );

  const burstColors = THEMES.find((t) => t.id === theme)?.burst ?? THEMES[0].burst;
  const hasBest = game.best > 0;

  return (
    <TooltipProvider delayDuration={250}>
      <AmbientBackground />
      <main className="relative mx-auto flex min-h-dvh w-full max-w-[34rem] sm:max-w-[36rem] flex-col justify-between px-4 pb-8 pt-6 sm:px-6 sm:pt-8">
        {/* Top Header & Settings Pill */}
        <header className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <h1 className="font-display text-4xl sm:text-5xl font-black leading-none tracking-tighter">
              2048<span className="text-primary inline-block">.</span>
            </h1>
            <p className="mt-1 text-xs sm:text-sm font-medium text-muted-foreground">
              Join tiles. Reach <span className="font-bold text-foreground">2048</span>.
            </p>
          </div>
          <div className="glass-panel flex shrink-0 items-center gap-1 rounded-xl p-1 shadow-sm">
            <ThemeSwitcher theme={theme} onChange={changeTheme} />
            <SoundToggle enabled={soundOn} onChange={setSoundOn} />
            <VibrationToggle enabled={vibrationOn} onChange={setVibrationOn} />
          </div>
        </header>

        {/* Central Game Arena */}
        <div className="my-auto flex flex-col gap-4 sm:gap-5 py-4">
          {/* Precision Score Strip */}
          <ScoreBoard
            score={game.score}
            best={game.best}
            moves={game.moves}
            gained={game.gained}
            hasBest={hasBest}
          />

          {/* Hero Board */}
          <div
            className={
              "board-holder relative " + (boardPhase === "resetting" ? "board-holder-out" : "")
            }
          >
            <Board
              size={game.size}
              tiles={game.tiles}
              ghosts={game.ghosts}
              bump={game.bump}
              onSwipe={move}
            />
          </div>

          {/* Floating Action Dock */}
          <div className="glass-dock flex flex-wrap items-center justify-between gap-2.5 rounded-2xl p-2 sm:p-2.5">
            <Controls
              onNewGame={requestNewGame}
              onUndo={undo}
              canUndo={game.canUndo}
              undoCount={game.undoCount}
            />
            <BoardSizeControl size={game.size} onChange={requestSize} />
          </div>
        </div>

        {/* Footnote Keyboard Hints */}
        <footer className="flex flex-col items-center justify-center text-center text-xs text-muted-foreground/80">
          <p className="hidden sm:block">
            <Kbd>←</Kbd> <Kbd>↑</Kbd> <Kbd>↓</Kbd> <Kbd>→</Kbd> or <Kbd>WASD</Kbd> to move · <Kbd>Z</Kbd> to undo
          </p>
          <p className="sm:hidden">Swipe anywhere on the board to slide tiles</p>
        </footer>

        {/* Modals & Portals */}
        <GameOverModal
          variant={game.overOpen ? "over" : "win"}
          open={game.winOpen || game.overOpen}
          score={game.score}
          best={game.best}
          moves={game.moves}
          size={game.size}
          canUndo={game.canUndo}
          onKeepPlaying={game.keepPlaying}
          onNewGame={() => performReset(game.startNewGame)}
          onUndo={undo}
        />

        <ConfirmDialog request={confirm} onCancel={() => setConfirm(null)} />

        {game.winOpen && !reducedMotion && <Confetti colors={burstColors} />}

        <div role="status" aria-live="polite" className="sr-only">
          {game.announcement}
        </div>
      </main>
    </TooltipProvider>
  );
}
