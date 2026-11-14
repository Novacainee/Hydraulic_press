// Procedural Audio Synthesizer using Web Audio API (Zero external assets needed)

class SoundEngine {
  constructor() {
    this.audioCtx = null;
    this.enabled = true;
    this.hydraulicGain = null;
    this.hydraulicOsc = null;
    this.isHydraulicPlaying = false;
  }

  init() {
    if (!this.audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        this.audioCtx = new AudioContext();
      }
    }
  }

  toggleSound() {
    this.enabled = !this.enabled;
    if (!this.enabled && this.isHydraulicPlaying) {
      this.stopHydraulic();
    }
    return this.enabled;
  }

  // Realistic metallic clink sound when dropping a brass weight onto the tray
  playClink() {
    if (!this.enabled) return;
    this.init();
    if (!this.audioCtx) return;

    const ctx = this.audioCtx;
    const now = ctx.currentTime;

    // Dual chime frequencies for metallic dissonance
    const freqs = [1800, 2450, 3900];
    freqs.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now);
      osc.frequency.exponentialRampToValueAtTime(freq * 0.85, now + 0.15);

      const amp = 0.15 / (idx + 1);
      gain.gain.setValueAtTime(amp, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18 + idx * 0.05);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.3);
    });
  }

  // Soft hydraulic whoosh / hum when fluid transfers between cylinders
  startHydraulic(intensity = 0.5) {
    if (!this.enabled) return;
    this.init();
    if (!this.audioCtx) return;

    if (this.isHydraulicPlaying) {
      if (this.hydraulicGain) {
        this.hydraulicGain.gain.setTargetAtTime(Math.min(0.08, intensity * 0.08), this.audioCtx.currentTime, 0.1);
      }
      return;
    }

    try {
      const ctx = this.audioCtx;
      const osc = ctx.createOscillator();
      const filter = ctx.createBiquadFilter();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(80, ctx.currentTime);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(350, ctx.currentTime);

      gain.gain.setValueAtTime(0.001, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(Math.min(0.06, intensity * 0.06), ctx.currentTime + 0.1);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      this.hydraulicOsc = osc;
      this.hydraulicGain = gain;
      this.isHydraulicPlaying = true;
    } catch (e) {
      console.warn('Audio start error', e);
    }
  }

  stopHydraulic() {
    if (!this.isHydraulicPlaying || !this.hydraulicGain) return;
    try {
      const ctx = this.audioCtx;
      this.hydraulicGain.gain.linearRampToValueAtTime(0.0001, ctx.currentTime + 0.2);
      setTimeout(() => {
        if (this.hydraulicOsc) {
          try { this.hydraulicOsc.stop(); } catch(e){}
          this.hydraulicOsc = null;
        }
        this.hydraulicGain = null;
        this.isHydraulicPlaying = false;
      }, 220);
    } catch (e) {
      this.isHydraulicPlaying = false;
    }
  }

  // Celebratory harmonious chime when perfect equilibrium is reached
  playSuccess() {
    if (!this.enabled) return;
    this.init();
    if (!this.audioCtx) return;

    const ctx = this.audioCtx;
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.08);

      gain.gain.setValueAtTime(0, ctx.currentTime + i * 0.08);
      gain.gain.linearRampToValueAtTime(0.12, ctx.currentTime + i * 0.08 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + i * 0.08 + 0.6);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(ctx.currentTime + i * 0.08);
      osc.stop(ctx.currentTime + i * 0.08 + 0.65);
    });
  }

  // Subtle click sound
  playClick() {
    if (!this.enabled) return;
    this.init();
    if (!this.audioCtx) return;
    const ctx = this.audioCtx;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.frequency.setValueAtTime(800, ctx.currentTime);
    gain.gain.setValueAtTime(0.05, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.03);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.04);
  }

  // Realistic Ear Equalization "Pop / Click" sound when swallowing/yawning
  playEarPop() {
    if (!this.enabled) return;
    this.init();
    if (!this.audioCtx) return;
    const ctx = this.audioCtx;
    const now = ctx.currentTime;

    // Resonant air pop sound
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(320, now);
    osc.frequency.exponentialRampToValueAtTime(110, now + 0.08);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(600, now);

    gain.gain.setValueAtTime(0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.14);
  }

  // Gulp / Swallow sound simulation
  playSwallow() {
    if (!this.enabled) return;
    this.init();
    if (!this.audioCtx) return;
    const ctx = this.audioCtx;
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(180, now);
    osc.frequency.linearRampToValueAtTime(140, now + 0.08);
    osc.frequency.linearRampToValueAtTime(190, now + 0.16);

    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.22);
  }

  // Acoustic wave transmission harp sound (ear to brain)
  playAcousticSequence() {
    if (!this.enabled) return;
    this.init();
    if (!this.audioCtx) return;
    const ctx = this.audioCtx;
    const now = ctx.currentTime;
    const notes = [440, 554.37, 659.25, 880, 1108.73, 1318.51, 1760]; // 7 notes for 7 steps

    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + i * 0.12);

      gain.gain.setValueAtTime(0, now + i * 0.12);
      gain.gain.linearRampToValueAtTime(0.08, now + i * 0.12 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.12 + 0.25);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + i * 0.12);
      osc.stop(now + i * 0.12 + 0.3);
    });
  }
}

window.sound = new SoundEngine();

