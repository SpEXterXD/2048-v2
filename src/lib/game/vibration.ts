"use client";

class VibrationEngine {
  private enabled = true;

  setEnabled(on: boolean) {
    this.enabled = on;
  }

  get isEnabled() {
    return this.enabled;
  }

  trigger(pattern: number | number[]) {
    if (!this.enabled) return;
    if (typeof navigator !== "undefined" && "vibrate" in navigator) {
      try {
        navigator.vibrate(pattern);
      } catch {
        // Ignore devices with restricted vibration permissions
      }
    }
  }
}

export const vibration = new VibrationEngine();
