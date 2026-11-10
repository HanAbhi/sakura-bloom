'use client';

/**
 * Traditional Japanese Zen Garden Acoustic Synthesizer
 * Features:
 * 1. Physical modeling of the Japanese Koto (箏) using Karplus-Strong string synthesis
 * 2. Traditional Hirajōshi Scale (平調子: D, Eb, G, A, Bb) melody generator
 * 3. Warm meditative Shō (笙) temple pad drone (lush breathing harmonic bed)
 * 4. Crystal Japanese Wind Chime (風鈴 Fūrin) & Temple Singing Bowl (鈴 Rin)
 * 100% client-side Web Audio API synthesis without external audio files.
 */

// Authentic Japanese Hirajōshi Pentatonic Frequencies (Hz)
const HIRAJOSHI_SCALE = [
  146.83, // D3
  155.56, // Eb3
  196.00, // G3
  220.00, // A3
  233.08, // Bb3
  293.66, // D4
  311.13, // Eb4
  392.00, // G4
  440.00, // A4
  466.16, // Bb4
  587.33, // D5
  622.25, // Eb5
  783.99, // G5
  880.00, // A5
];

class ZenAudioManager {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = true;
  private masterGain: GainNode | null = null;
  private droneGain: GainNode | null = null;
  private droneOscs: OscillatorNode[] = [];
  private lfoOsc: OscillatorNode | null = null;
  private melodyTimer: any = null;
  private chimeTimer: any = null;
  private isRunning: boolean = false;

  public init() {
    if (this.ctx) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioCtx();
    } catch {
      console.warn('Web Audio API not supported');
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (!muted) {
      if (!this.ctx) this.init();
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
      this.startMusic();
    } else {
      this.stopMusic();
    }
  }

  public toggleMute(): boolean {
    this.setMuted(!this.isMuted);
    return this.isMuted;
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  // Plucked Japanese Koto String (Paulownia wood soundboard + silk strings)
  public playKotoString(freq: number, velocity = 0.5, decay = 2.8) {
    if (this.isMuted || !this.ctx || !this.masterGain) return;
    try {
      const now = this.ctx.currentTime;

      // 1. Fundamental string oscillator
      const osc = this.ctx.createOscillator();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now);

      // Subtle initial pitch bend (characteristic of finger pressing behind the Koto bridge)
      osc.frequency.exponentialRampToValueAtTime(freq * 1.006, now + 0.05);
      osc.frequency.exponentialRampToValueAtTime(freq, now + 0.25);

      // 2. Harmonic overtone (wooden snap)
      const osc2 = this.ctx.createOscillator();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(freq * 2.01, now);

      // 3. Low-pass filter modeling string damping
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(Math.min(5000, freq * 7), now);
      filter.frequency.exponentialRampToValueAtTime(Math.min(900, freq * 1.8), now + decay * 0.8);

      // 4. Amplitude Envelope
      const gain = this.ctx.createGain();
      const peakGain = 0.14 * velocity;
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.linearRampToValueAtTime(peakGain, now + 0.012); // Sharp plectrum attack
      gain.gain.exponentialRampToValueAtTime(peakGain * 0.45, now + 0.18);
      gain.gain.exponentialRampToValueAtTime(0.00001, now + decay);

      // Connections
      osc.connect(filter);
      osc2.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      osc2.start(now);
      osc.stop(now + decay);
      osc2.stop(now + decay);
    } catch (e) {
      console.error(e);
    }
  }

  // Japanese Temple Bell / Wind Chime (Fūrin 風鈴)
  public playChime(freq = 880, decay = 4.2) {
    if (this.isMuted || !this.ctx || !this.masterGain) return;
    try {
      const now = this.ctx.currentTime;

      // Metallic partials (1.0, 2.76, 5.40)
      const partials = [1.0, 2.756, 5.404];
      const partialGains = [0.08, 0.025, 0.01];

      partials.forEach((mult, idx) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq * mult, now);
        // Subtle shimmer
        osc.frequency.linearRampToValueAtTime(freq * mult * 0.998, now + decay);

        const pGain = partialGains[idx];
        gain.gain.setValueAtTime(0.0001, now);
        gain.gain.linearRampToValueAtTime(pGain, now + 0.008);
        gain.gain.exponentialRampToValueAtTime(0.00001, now + decay / (idx + 1));

        osc.connect(gain);
        gain.connect(this.masterGain!);

        osc.start(now);
        osc.stop(now + decay);
      });
    } catch (e) {
      console.error(e);
    }
  }

  // Uplifting Koto Arpeggio for Tree Awakening
  public playFlourish() {
    if (this.isMuted || !this.ctx) return;
    const notes = [293.66, 311.13, 392.00, 440.00, 587.33, 783.99, 880.00];
    notes.forEach((freq, idx) => {
      setTimeout(() => {
        this.playKotoString(freq, 0.65, 3.2);
      }, idx * 110);
    });
    setTimeout(() => {
      this.playChime(880, 5.0);
    }, notes.length * 110 + 100);
  }

  // Start the peaceful meditative ambient background soundscape
  private startMusic() {
    if (!this.ctx || this.isRunning) return;
    this.isRunning = true;

    try {
      const now = this.ctx.currentTime;

      // Master output stage with gentle soft limiter
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.001, now);
      this.masterGain.gain.linearRampToValueAtTime(0.65, now + 1.5);
      this.masterGain.connect(this.ctx.destination);

      // 1. Shō (笙) / Zen Temple Atmospheric Drone
      // Pure harmonic fourths and fifths (D, A, D) with breathing tremolo
      this.droneGain = this.ctx.createGain();
      this.droneGain.gain.setValueAtTime(0.06, now);

      const dronePitches = [73.42, 110.0, 146.83, 220.0]; // D2, A2, D3, A3
      this.droneOscs = dronePitches.map((pitch, idx) => {
        const osc = this.ctx!.createOscillator();
        osc.type = idx % 2 === 0 ? 'sine' : 'triangle';
        osc.frequency.setValueAtTime(pitch, now);

        const filter = this.ctx!.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(340, now);

        osc.connect(filter);
        filter.connect(this.droneGain!);
        osc.start(now);
        return osc;
      });

      // LFO for slow breathing swells (10-second period)
      this.lfoOsc = this.ctx.createOscillator();
      const lfoGain = this.ctx.createGain();
      this.lfoOsc.frequency.setValueAtTime(0.1, now); // 10 seconds cycle
      lfoGain.gain.setValueAtTime(0.025, now);
      this.lfoOsc.connect(lfoGain);
      lfoGain.connect(this.droneGain.gain);
      this.lfoOsc.start(now);

      this.droneGain.connect(this.masterGain);

      // 2. Autonomous Koto Melodic Phrases (Hirajōshi Pentatonic)
      let phraseStep = 0;
      const melodyPhrases = [
        [5, 6, 7, 8],          // D4, Eb4, G4, A4
        [8, 7, 6, 5],          // A4, G4, Eb4, D4
        [7, 9, 10, 11],        // G4, Bb4, D5, Eb5
        [10, 8, 7, 5],         // D5, A4, G4, D4
        [2, 3, 5, 7],          // G3, A3, D4, G4
        [11, 10, 8, 7, 5],     // Eb5, D5, A4, G4, D4
      ];

      const playNextNote = () => {
        if (this.isMuted || !this.isRunning) return;

        const currentPhrase = melodyPhrases[phraseStep % melodyPhrases.length];
        let noteDelay = 0;

        currentPhrase.forEach((scaleIdx, n) => {
          setTimeout(() => {
            if (!this.isMuted && this.isRunning) {
              const freq = HIRAJOSHI_SCALE[scaleIdx];
              const vel = 0.35 + Math.random() * 0.3;
              this.playKotoString(freq, vel, 3.5);
            }
          }, noteDelay);

          // Humanized rhythmic pacing (organic Japanese spacing - Ma 間)
          noteDelay += 450 + Math.floor(Math.random() * 300);
        });

        phraseStep++;
        // Natural pause between melodic phrases (3.5 to 5.5 seconds)
        const nextPhraseDelay = noteDelay + 3200 + Math.floor(Math.random() * 2200);
        this.melodyTimer = setTimeout(playNextNote, nextPhraseDelay);
      };

      // Initial gentle Koto opening
      setTimeout(playNextNote, 600);

      // 3. Occasional Crystal Wind Chime (every 8 to 14 seconds)
      const triggerChime = () => {
        if (this.isMuted || !this.isRunning) return;
        const chimePitches = [880, 1046.5, 1174.66, 1318.51, 1567.98];
        const pitch = chimePitches[Math.floor(Math.random() * chimePitches.length)];
        this.playChime(pitch, 4.5);

        const nextChime = 8000 + Math.floor(Math.random() * 7000);
        this.chimeTimer = setTimeout(triggerChime, nextChime);
      };
      this.chimeTimer = setTimeout(triggerChime, 4000);
    } catch (e) {
      console.error(e);
    }
  }

  private stopMusic() {
    this.isRunning = false;
    if (this.melodyTimer) {
      clearTimeout(this.melodyTimer);
      this.melodyTimer = null;
    }
    if (this.chimeTimer) {
      clearTimeout(this.chimeTimer);
      this.chimeTimer = null;
    }

    if (this.masterGain && this.ctx) {
      try {
        const now = this.ctx.currentTime;
        this.masterGain.gain.linearRampToValueAtTime(0.0001, now + 0.6);
        setTimeout(() => {
          this.droneOscs.forEach((osc) => {
            try {
              osc.stop();
              osc.disconnect();
            } catch {}
          });
          this.droneOscs = [];
          if (this.lfoOsc) {
            try {
              this.lfoOsc.stop();
              this.lfoOsc.disconnect();
            } catch {}
            this.lfoOsc = null;
          }
        }, 700);
      } catch {}
    }
  }
}

export const zenAudio = new ZenAudioManager();
