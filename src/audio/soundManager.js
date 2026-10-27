/**
 * Operation: Rescue Motku - Audio Engine
 * Uses Web Audio API synthesizer for 100% self-contained romantic background music
 * and dynamic sound effects without external file dependencies.
 */

class SoundManager {
  constructor() {
    this.ctx = null;
    this.isMuted = false;
    this.masterGain = null;
    this.bgmGain = null;
    this.sfxGain = null;
    this.currentMode = 'none'; // 'intro', 'running', 'rescue', 'none'
    this.stepTimer = null;
    this.arpeggioTimer = null;
    this.bassTimer = null;
    this.initialized = false;
  }

  init() {
    if (this.initialized) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      this.ctx = new AudioCtx();

      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.7, this.ctx.currentTime);

      this.bgmGain = this.ctx.createGain();
      this.bgmGain.gain.setValueAtTime(0.4, this.ctx.currentTime);
      this.bgmGain.connect(this.masterGain);

      this.sfxGain = this.ctx.createGain();
      this.sfxGain.gain.setValueAtTime(0.6, this.ctx.currentTime);
      this.sfxGain.connect(this.masterGain);

      this.masterGain.connect(this.ctx.destination);
      this.initialized = true;
    } catch (e) {
      console.warn('AudioContext failed to initialize:', e);
    }
  }

  resume() {
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.masterGain && this.ctx) {
      const now = this.ctx.currentTime;
      this.masterGain.gain.cancelScheduledValues(now);
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : 0.7, now);
    }
    return this.isMuted;
  }

  setMute(mute) {
    this.isMuted = mute;
    if (this.masterGain && this.ctx) {
      const now = this.ctx.currentTime;
      this.masterGain.gain.cancelScheduledValues(now);
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : 0.7, now);
    }
  }

  // --- Sound Effects ---

  playCoin() {
    if (!this.initialized || this.isMuted) return;
    this.resume();
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(987.77, now); // B5
      osc.frequency.exponentialRampToValueAtTime(1318.51, now + 0.08); // E6

      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(now);
      osc.stop(now + 0.25);
    } catch (_) {}
  }

  playJump() {
    if (!this.initialized || this.isMuted) return;
    this.resume();
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(220, now);
      osc.frequency.exponentialRampToValueAtTime(587.33, now + 0.18);

      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(now);
      osc.stop(now + 0.2);
    } catch (_) {}
  }

  playSlide() {
    if (!this.initialized || this.isMuted) return;
    this.resume();
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.exponentialRampToValueAtTime(110, now + 0.22);

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(now);
      osc.stop(now + 0.25);
    } catch (_) {}
  }

  playCorrectAnswer() {
    if (!this.initialized || this.isMuted) return;
    this.resume();
    try {
      const now = this.ctx.currentTime;
      const notes = [523.25, 659.25, 783.99, 1046.50, 1318.51]; // C5, E5, G5, C6, E6
      notes.forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const startTime = now + idx * 0.07;

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, startTime);

        gain.gain.setValueAtTime(0.25, startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.45);

        osc.connect(gain);
        gain.connect(this.sfxGain);

        osc.start(startTime);
        osc.stop(startTime + 0.45);
      });
    } catch (_) {}
  }

  playGameOver() {
    if (!this.initialized || this.isMuted) return;
    this.resume();
    try {
      const now = this.ctx.currentTime;
      const notes = [440, 415.3, 392, 349.23];
      notes.forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const startTime = now + idx * 0.16;

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, startTime);

        gain.gain.setValueAtTime(0.2, startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.35);

        osc.connect(gain);
        gain.connect(this.sfxGain);

        osc.start(startTime);
        osc.stop(startTime + 0.35);
      });
    } catch (_) {}
  }

  playVillainSound() {
    if (!this.initialized || this.isMuted) return;
    this.resume();
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(140, now);
      osc.frequency.linearRampToValueAtTime(80, now + 0.15);
      osc.frequency.linearRampToValueAtTime(160, now + 0.3);

      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(now);
      osc.stop(now + 0.35);
    } catch (_) {}
  }

  playVictoryFanfare() {
    if (!this.initialized || this.isMuted) return;
    this.resume();
    try {
      const now = this.ctx.currentTime;
      // Triumphant romantic chords: C -> F -> G -> C(maj7)
      const fanfareChords = [
        { time: 0, notes: [261.63, 329.63, 392.00, 523.25], dur: 0.35 },
        { time: 0.38, notes: [349.23, 440.00, 523.25, 698.46], dur: 0.35 },
        { time: 0.76, notes: [392.00, 493.88, 587.33, 783.99], dur: 0.4 },
        { time: 1.2, notes: [523.25, 659.25, 783.99, 987.77, 1046.50], dur: 1.5 }
      ];

      fanfareChords.forEach(chord => {
        chord.notes.forEach(freq => {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          const st = now + chord.time;

          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, st);

          gain.gain.setValueAtTime(0.18, st);
          gain.gain.exponentialRampToValueAtTime(0.001, st + chord.dur);

          osc.connect(gain);
          gain.connect(this.sfxGain);

          osc.start(st);
          osc.stop(st + chord.dur);
        });
      });
    } catch (_) {}
  }

  // --- Dynamic Procedural Background Music ---

  stopBgm() {
    if (this.arpeggioTimer) {
      clearInterval(this.arpeggioTimer);
      this.arpeggioTimer = null;
    }
    if (this.bassTimer) {
      clearInterval(this.bassTimer);
      this.bassTimer = null;
    }
    this.currentMode = 'none';
  }

  startBgm(mode = 'running') {
    if (!this.initialized) this.init();
    if (!this.ctx) return;
    this.resume();

    if (this.currentMode === mode) return;
    this.stopBgm();
    this.currentMode = mode;

    if (mode === 'running') {
      // Energetic romantic synthwave runner loop
      // Chords: Am -> F -> C -> G
      const chords = [
        [440.0, 523.25, 659.25],      // Am
        [349.23, 440.0, 523.25],      // F
        [261.63, 329.63, 392.0],      // C
        [392.0, 493.88, 587.33]       // G
      ];
      const bassNotes = [110.0, 87.31, 130.81, 98.0];

      let chordIdx = 0;
      let arpStep = 0;

      this.arpeggioTimer = setInterval(() => {
        if (this.isMuted || !this.ctx) return;
        const now = this.ctx.currentTime;
        const currentChord = chords[chordIdx];
        const noteFreq = currentChord[arpStep % currentChord.length];

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(noteFreq, now);

        gain.gain.setValueAtTime(0.07, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);

        osc.connect(gain);
        gain.connect(this.bgmGain);

        osc.start(now);
        osc.stop(now + 0.14);

        arpStep++;
        if (arpStep % 8 === 0) {
          chordIdx = (chordIdx + 1) % chords.length;
        }
      }, 150);

      this.bassTimer = setInterval(() => {
        if (this.isMuted || !this.ctx) return;
        const now = this.ctx.currentTime;
        const bassFreq = bassNotes[chordIdx];

        const osc = this.ctx.createOscillator();
        const filter = this.ctx.createBiquadFilter();
        const gain = this.ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(bassFreq, now);

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(250, now);

        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.bgmGain);

        osc.start(now);
        osc.stop(now + 0.35);
      }, 600);

    } else if (mode === 'intro') {
      // Gentle romantic dreamy sunset melody
      const introNotes = [261.63, 329.63, 392.0, 440.0, 523.25, 659.25];
      let step = 0;
      this.arpeggioTimer = setInterval(() => {
        if (this.isMuted || !this.ctx) return;
        const now = this.ctx.currentTime;
        const freq = introNotes[step % introNotes.length];

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now);

        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

        osc.connect(gain);
        gain.connect(this.bgmGain);

        osc.start(now);
        osc.stop(now + 0.45);

        step++;
      }, 400);

    } else if (mode === 'rescue') {
      // Sweet romantic celebration
      this.playVictoryFanfare();
      const celebrationNotes = [523.25, 659.25, 783.99, 1046.50];
      let cStep = 0;
      this.arpeggioTimer = setInterval(() => {
        if (this.isMuted || !this.ctx) return;
        const now = this.ctx.currentTime;
        const freq = celebrationNotes[cStep % celebrationNotes.length];

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now);

        gain.gain.setValueAtTime(0.09, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

        osc.connect(gain);
        gain.connect(this.bgmGain);

        osc.start(now);
        osc.stop(now + 0.3);

        cStep++;
      }, 250);
    }
  }
}

export const soundManager = new SoundManager();
