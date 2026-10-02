/**
 * Web Audio API Sound Synthesizer for Theme Transitions
 * Synthesizes harmonious, zero-latency musical cues for Dim vs Daylight modes.
 * No external audio files or network requests required.
 */

let audioCtx = null;

function getAudioContext() {
  if (typeof window === 'undefined') return null;
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) return null;

  if (!audioCtx) {
    audioCtx = new AudioContextClass();
  }

  if (audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }

  return audioCtx;
}

/**
 * Play a delicate, satisfying musical cue based on target theme.
 * @param {'Dim' | 'Daylight'} targetMode
 */
export function playThemeSound(targetMode) {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    // Safety: ensure context is running on user gesture
    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }

    const now = ctx.currentTime;

    if (targetMode === 'Daylight') {
      /* ══════════════════════════════════════════════════
         Daylight: Warm, crystalline sunrise arpeggio
         Notes: C5 (523Hz) → E5 (659Hz) → G5 (784Hz) → C6 (1046Hz)
         Timbre: Soft sine + gentle triangle with exponential bell decay
         ══════════════════════════════════════════════════ */
      const notes = [
        { freq: 523.25, time: 0.00, dur: 0.50, gain: 0.065, type: 'sine' },
        { freq: 659.25, time: 0.05, dur: 0.50, gain: 0.070, type: 'sine' },
        { freq: 783.99, time: 0.10, dur: 0.55, gain: 0.075, type: 'sine' },
        { freq: 1046.50, time: 0.15, dur: 0.65, gain: 0.065, type: 'triangle' },
      ];

      notes.forEach(({ freq, time, dur, gain, type }) => {
        const osc = ctx.createOscillator();
        const gainNode = ctx.createGain();

        osc.type = type;
        osc.frequency.setValueAtTime(freq, now + time);

        const start = now + time;
        gainNode.gain.setValueAtTime(0.0001, start);
        gainNode.gain.exponentialRampToValueAtTime(gain, start + 0.018);
        gainNode.gain.exponentialRampToValueAtTime(0.0001, start + dur);

        osc.connect(gainNode);
        gainNode.connect(ctx.destination);

        osc.start(start);
        osc.stop(start + dur);
      });

      // High-register morning chime shimmer
      const shimmer = ctx.createOscillator();
      const shimmerGain = ctx.createGain();
      shimmer.type = 'sine';
      shimmer.frequency.setValueAtTime(1567.98, now + 0.12); // G6
      shimmerGain.gain.setValueAtTime(0.0001, now + 0.12);
      shimmerGain.gain.exponentialRampToValueAtTime(0.022, now + 0.15);
      shimmerGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.70);

      shimmer.connect(shimmerGain);
      shimmerGain.connect(ctx.destination);
      shimmer.start(now + 0.12);
      shimmer.stop(now + 0.70);

    } else {
      /* ══════════════════════════════════════════════════
         Dim: Sleek, futuristic cyberpunk nightfall chord
         Notes: Descending chord G4 (392Hz) → Eb4 (311Hz) → C4 (261Hz)
         Timbre: Resonant lowpass filter sweep + warm sub-bass hum
         ══════════════════════════════════════════════════ */
      const notes = [
        { freq: 392.00, time: 0.00, dur: 0.45, gain: 0.07 },
        { freq: 311.13, time: 0.04, dur: 0.48, gain: 0.075 },
        { freq: 261.63, time: 0.08, dur: 0.55, gain: 0.08 },
      ];

      notes.forEach(({ freq, time, dur, gain }) => {
        const osc = ctx.createOscillator();
        const gainNode = ctx.createGain();
        const filter = ctx.createBiquadFilter();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + time);
        // Gentle downward pitch drift
        osc.frequency.exponentialRampToValueAtTime(freq * 0.96, now + time + dur);

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(1400, now + time);
        filter.frequency.exponentialRampToValueAtTime(320, now + time + dur);

        const start = now + time;
        gainNode.gain.setValueAtTime(0.0001, start);
        gainNode.gain.exponentialRampToValueAtTime(gain, start + 0.02);
        gainNode.gain.exponentialRampToValueAtTime(0.0001, start + dur);

        osc.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(ctx.destination);

        osc.start(start);
        osc.stop(start + dur);
      });

      // Warm sub-bass rumble (C3 → C2 sweep)
      const sub = ctx.createOscillator();
      const subGain = ctx.createGain();
      sub.type = 'sine';
      sub.frequency.setValueAtTime(130.81, now + 0.02);
      sub.frequency.exponentialRampToValueAtTime(65.41, now + 0.45);

      subGain.gain.setValueAtTime(0.0001, now + 0.02);
      subGain.gain.exponentialRampToValueAtTime(0.075, now + 0.05);
      subGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.50);

      sub.connect(subGain);
      subGain.connect(ctx.destination);
      sub.start(now + 0.02);
      sub.stop(now + 0.50);
    }
  } catch (err) {
    // Graceful fallback: audio failure should never interrupt interaction
    console.debug('[ThemeAudio] Playback skipped:', err);
  }
}
