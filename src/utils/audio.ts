// Web Audio API Synthesizer for Cricket Sound Effects
// Works 100% offline with zero external audio assets!

class SoundEngine {
  private ctx: AudioContext | null = null;
  public isMuted: boolean = false;

  private getContext(): AudioContext | null {
    if (typeof window === "undefined") return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    return this.isMuted;
  }

  // Soft bat tap / dot ball
  public playDot() {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(320, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(140, ctx.currentTime + 0.05);

    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.06);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.06);
  }

  // Run scored click
  public playRun(runs: number) {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const freq = 440 + runs * 60;

    osc.type = "triangle";
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(freq * 1.4, ctx.currentTime + 0.09);

    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.1);
  }

  // Four boundary celebration fanfare
  public playFour() {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const notes = [440, 554.37, 659.25, 880]; // A major arpeggio
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const startTime = ctx.currentTime + idx * 0.07;

      osc.type = "square";
      osc.frequency.setValueAtTime(freq, startTime);

      gain.gain.setValueAtTime(0.18, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.2);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + 0.22);
    });
  }

  // Sixer massive booming celebration chord
  public playSix() {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    // Bass boom
    const bass = ctx.createOscillator();
    const bassGain = ctx.createGain();
    bass.type = "sine";
    bass.frequency.setValueAtTime(160, ctx.currentTime);
    bass.frequency.exponentialRampToValueAtTime(45, ctx.currentTime + 0.35);

    bassGain.gain.setValueAtTime(0.5, ctx.currentTime);
    bassGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);

    bass.connect(bassGain);
    bassGain.connect(ctx.destination);
    bass.start();
    bass.stop(ctx.currentTime + 0.45);

    // Triumphant chord
    const chordNotes = [523.25, 659.25, 783.99, 1046.5]; // C major high
    chordNotes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const start = ctx.currentTime + 0.05 + idx * 0.05;

      osc.type = "triangle";
      osc.frequency.setValueAtTime(freq, start);

      gain.gain.setValueAtTime(0.25, start);
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.38);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(start);
      osc.stop(start + 0.4);
    });
  }

  // Wicket alarm / crash
  public playWicket() {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    // Dramatic descending slide
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(600, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(110, ctx.currentTime + 0.28);

    gain.gain.setValueAtTime(0.35, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.32);
  }

  // Over completed chime
  public playOverEnd() {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const notes = [587.33, 880]; // D5, A5
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const start = ctx.currentTime + i * 0.12;

      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, start);

      gain.gain.setValueAtTime(0.25, start);
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.25);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(start);
      osc.stop(start + 0.26);
    });
  }

  // Victory fanfare
  public playVictory() {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const melody = [523.25, 523.25, 523.25, 659.25, 783.99, 1046.5];
    const durations = [0.12, 0.12, 0.12, 0.18, 0.18, 0.5];

    let current = ctx.currentTime;
    melody.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const dur = durations[idx];

      osc.type = "triangle";
      osc.frequency.setValueAtTime(freq, current);

      gain.gain.setValueAtTime(0.3, current);
      gain.gain.exponentialRampToValueAtTime(0.001, current + dur);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(current);
      osc.stop(current + dur);

      current += dur + 0.04;
    });
  }

  // Haptic feedback for mobile touch
  public vibrate(pattern: number | number[] = 30) {
    if (typeof window !== "undefined" && "navigator" in window && navigator.vibrate) {
      try {
        navigator.vibrate(pattern);
      } catch {
        // Ignore if denied or unsupported
      }
    }
  }
}

export const sounds = new SoundEngine();
