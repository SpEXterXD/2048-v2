type SoundName = "slide" | "merge" | "spawn" | "win" | "over";

/** Per-sound debounce so rapid moves never stack into mush. */
const DEBOUNCE_MS: Record<SoundName, number> = {
  slide: 45,
  merge: 40,
  spawn: 80,
  win: 1200,
  over: 1200,
};

/**
 * Merge pitch ladder: one note per doubling starting at 4, mapped onto a
 * pentatonic-ish scale so every merge lands musically and richer values
 * sound higher and fuller.
 */
const MERGE_FREQS = [
  261.63, 293.66, 329.63, 392.0, 440.0, 523.25, 587.33, 659.25, 783.99, 880.0, 1046.5, 1174.66,
];

/**
 * All effects are synthesized on the fly (oscillators plus one shared noise
 * buffer), so there are no audio files to load. Everything is short: the
 * longest figure, the win fanfare, lands fully under ~320 ms.
 */
class SoundEngine {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private noise: AudioBuffer | null = null;
  private enabled = false;
  private lastAt: Partial<Record<SoundName, number>> = {};

  setEnabled(on: boolean) {
    this.enabled = on;
    if (on) this.ensureContext();
  }

  /** Call from user-gesture handlers so the AudioContext is allowed to start. */
  unlock() {
    if (this.enabled) this.ensureContext();
  }

  private ensureContext(): AudioContext | null {
    if (typeof window === "undefined") return null;
    if (!this.ctx) {
      const Ctor: typeof AudioContext | undefined =
        window.AudioContext ??
        (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!Ctor) return null;
      this.ctx = new Ctor();
      this.master = this.ctx.createGain();
      this.master.gain.value = 0.6;
      this.master.connect(this.ctx.destination);

      const length = Math.floor(this.ctx.sampleRate * 0.25);
      this.noise = this.ctx.createBuffer(1, length, this.ctx.sampleRate);
      const data = this.noise.getChannelData(0);
      for (let i = 0; i < length; i++) data[i] = Math.random() * 2 - 1;
    }
    if (this.ctx.state === "suspended") void this.ctx.resume();
    return this.ctx;
  }

  play(name: SoundName, opts: { mergeValue?: number; delay?: number } = {}) {
    if (!this.enabled) return;
    const ctx = this.ensureContext();
    if (!ctx || !this.master) return;
    const now = performance.now();
    if (now - (this.lastAt[name] ?? -Infinity) < DEBOUNCE_MS[name]) return;
    this.lastAt[name] = now;
    const t0 = ctx.currentTime + (opts.delay ?? 0);
    switch (name) {
      case "slide":
        this.slide(t0);
        break;
      case "merge":
        this.merge(t0, opts.mergeValue ?? 4);
        break;
      case "spawn":
        this.spawn(t0);
        break;
      case "win":
        this.win(t0);
        break;
      case "over":
        this.over(t0);
        break;
    }
  }

  /** Soft filtered-noise whoosh, ~85 ms. */
  private slide(t: number) {
    const ctx = this.ctx!;
    const src = ctx.createBufferSource();
    src.buffer = this.noise;
    const bp = ctx.createBiquadFilter();
    bp.type = "bandpass";
    bp.Q.value = 1.1;
    bp.frequency.setValueAtTime(1150, t);
    bp.frequency.exponentialRampToValueAtTime(480, t + 0.07);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.07, t + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.085);
    src.connect(bp).connect(g).connect(this.master!);
    src.start(t);
    src.stop(t + 0.1);
  }

  /** Pop + chime; two detuned partials, pitch follows the merged value. */
  private merge(t: number, value: number) {
    const ctx = this.ctx!;
    const idx = Math.min(Math.max(Math.round(Math.log2(value)) - 2, 0), MERGE_FREQS.length - 1);
    const f = MERGE_FREQS[idx];

    const osc = ctx.createOscillator();
    osc.type = "sine";
    osc.frequency.setValueAtTime(f, t);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.14, t + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.22);

    const osc2 = ctx.createOscillator();
    osc2.type = "triangle";
    osc2.frequency.setValueAtTime(f * 2, t);
    const g2 = ctx.createGain();
    g2.gain.setValueAtTime(0.0001, t);
    g2.gain.exponentialRampToValueAtTime(0.045, t + 0.01);
    g2.gain.exponentialRampToValueAtTime(0.0001, t + 0.12);

    osc.connect(g).connect(this.master!);
    osc2.connect(g2).connect(this.master!);
    osc.start(t);
    osc.stop(t + 0.24);
    osc2.start(t);
    osc2.stop(t + 0.14);
  }

  /** Barely-there tick for the spawned tile, ~50 ms. */
  private spawn(t: number) {
    const ctx = this.ctx!;
    const osc = ctx.createOscillator();
    osc.type = "sine";
    osc.frequency.setValueAtTime(1320, t);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.022, t + 0.008);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.05);
    osc.connect(g).connect(this.master!);
    osc.start(t);
    osc.stop(t + 0.06);
  }

  /** Compact four-note fanfare: 0 / 70 / 140 / 210 ms offsets, ~110 ms tails. */
  private win(t: number) {
    const ctx = this.ctx!;
    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((f, i) => {
      const start = t + i * 0.07;
      const osc = ctx.createOscillator();
      osc.type = i === notes.length - 1 ? "triangle" : "sine";
      osc.frequency.setValueAtTime(f, start);
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.0001, start);
      g.gain.exponentialRampToValueAtTime(0.09, start + 0.014);
      g.gain.exponentialRampToValueAtTime(0.0001, start + 0.16);
      osc.connect(g).connect(this.master!);
      osc.start(start);
      osc.stop(start + 0.18);
    });
  }

  /** Low, gentle descending glide. A sigh, not a buzzer. */
  private over(t: number) {
    const ctx = this.ctx!;
    const osc = ctx.createOscillator();
    osc.type = "sine";
    osc.frequency.setValueAtTime(233.08, t);
    osc.frequency.exponentialRampToValueAtTime(103.83, t + 0.26);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.075, t + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.3);
    osc.connect(g).connect(this.master!);
    osc.start(t);
    osc.stop(t + 0.32);
  }
}

export const sound = new SoundEngine();
