// Simple sound effect system using Web Audio API
class SoundEffects {
  private audioContext: AudioContext | null = null;
  private activeOscillators: Set<OscillatorNode> = new Set();
  private activeGainNodes: Set<GainNode> = new Set();

  constructor() {
    if (typeof window !== 'undefined') {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
  }

  private playTone(frequency: number, duration: number, type: OscillatorType = 'sine', volume: number = 0.1) {
    if (!this.audioContext) return;

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    oscillator.frequency.value = frequency;
    oscillator.type = type;

    gainNode.gain.setValueAtTime(volume, this.audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);

    oscillator.start(this.audioContext.currentTime);
    oscillator.stop(this.audioContext.currentTime + duration);

    this.activeOscillators.add(oscillator);
    this.activeGainNodes.add(gainNode);

    oscillator.onended = () => {
      this.activeOscillators.delete(oscillator);
      this.activeGainNodes.delete(gainNode);
      gainNode.disconnect(); // Clean up connections
    };
  }

  stopAll() {
    this.activeOscillators.forEach(osc => {
      try {
        osc.stop();
        osc.disconnect();
      } catch (e) {
        // Ignore errors if already stopped
      }
    });
    this.activeOscillators.clear();

    this.activeGainNodes.forEach(gain => {
      try {
        gain.disconnect();
      } catch (e) {
        // Ignore
      }
    });
    this.activeGainNodes.clear();
  }

  shoot() {
    // Quick high-pitched beep
    this.playTone(800, 0.1, 'square', 0.05);
  }

  explosion() {
    if (!this.audioContext) return;
    // Multiple frequencies for explosion effect
    this.playTone(100, 0.3, 'sawtooth', 0.1);
    setTimeout(() => this.playTone(50, 0.2, 'sawtooth', 0.08), 50);
  }

  powerUp() {
    // Ascending tone
    if (!this.audioContext) return;
    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    oscillator.frequency.setValueAtTime(400, this.audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(1200, this.audioContext.currentTime + 0.2);
    oscillator.type = 'sine';

    gainNode.gain.setValueAtTime(0.08, this.audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.2);

    oscillator.start(this.audioContext.currentTime);
    oscillator.stop(this.audioContext.currentTime + 0.2);

    this.activeOscillators.add(oscillator);
    this.activeGainNodes.add(gainNode);

    oscillator.onended = () => {
      this.activeOscillators.delete(oscillator);
      this.activeGainNodes.delete(gainNode);
      gainNode.disconnect();
    };
  }

  hit() {
    // Sharp descending tone
    if (!this.audioContext) return;
    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    oscillator.frequency.setValueAtTime(600, this.audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(200, this.audioContext.currentTime + 0.15);
    oscillator.type = 'sawtooth';

    gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.15);

    oscillator.start(this.audioContext.currentTime);
    oscillator.stop(this.audioContext.currentTime + 0.15);

    this.activeOscillators.add(oscillator);
    this.activeGainNodes.add(gainNode);

    oscillator.onended = () => {
      this.activeOscillators.delete(oscillator);
      this.activeGainNodes.delete(gainNode);
      gainNode.disconnect();
    };
  }

  bossWarning() {
    // Ominous low tone
    this.playTone(150, 0.5, 'sawtooth', 0.15);
    setTimeout(() => this.playTone(180, 0.5, 'sawtooth', 0.15), 200);
  }

  gameOver() {
    // Descending notes
    this.playTone(400, 0.3, 'sine', 0.1);
    setTimeout(() => this.playTone(350, 0.3, 'sine', 0.1), 300);
    setTimeout(() => this.playTone(300, 0.3, 'sine', 0.1), 600);
    setTimeout(() => this.playTone(250, 0.5, 'sine', 0.1), 900);
  }

  bomb() {
    // Massive explosion sound
    if (!this.audioContext) return;
    this.playTone(80, 0.5, 'sawtooth', 0.15);
    setTimeout(() => this.playTone(60, 0.4, 'sawtooth', 0.12), 100);
    setTimeout(() => this.playTone(40, 0.3, 'sawtooth', 0.08), 200);
  }

  graze() {
    // Quick high beep for graze
    this.playTone(1200, 0.05, 'sine', 0.03);
  }

  shieldBreak() {
    // Glass shattering sound
    if (!this.audioContext) return;
    this.playTone(800, 0.1, 'sawtooth', 0.1);
    setTimeout(() => this.playTone(600, 0.1, 'square', 0.1), 50);
    setTimeout(() => this.playTone(400, 0.2, 'sawtooth', 0.1), 100);
  }
}

export const soundSystem = new SoundEffects();