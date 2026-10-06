// Audio chime synthesizer for parking alarm warnings using Web Audio API and HTML5 Audio fallback
let audioCtx: AudioContext | null = null;
let isAudioUnlocked = false;

/**
 * Initializes and unlocks the AudioContext on user interaction (touch/click)
 * to comply with browser Autoplay policies so future background alerts can play sound.
 */
export function unlockAudioContext(): void {
  try {
    if (typeof window === 'undefined') return;
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;

    if (!audioCtx) {
      audioCtx = new AudioContextClass();
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume().then(() => {
        isAudioUnlocked = true;
      }).catch(() => {});
    } else {
      isAudioUnlocked = true;
    }

    // Play a tiny 1-sample silent sound buffer to fully prime the audio pipeline
    const buffer = audioCtx.createBuffer(1, 1, 22050);
    const source = audioCtx.createBufferSource();
    source.buffer = buffer;
    source.connect(audioCtx.destination);
    source.start(0);
  } catch (err) {
    console.warn('Could not unlock AudioContext:', err);
  }
}

// Global user-gesture listener to unlock audio on first touch/click
if (typeof window !== 'undefined') {
  const unlockEvents = ['click', 'touchstart', 'touchend', 'keydown'];
  const handleUserGesture = () => {
    unlockAudioContext();
    if (isAudioUnlocked) {
      unlockEvents.forEach((evt) => window.removeEventListener(evt, handleUserGesture));
    }
  };
  unlockEvents.forEach((evt) => {
    window.addEventListener(evt, handleUserGesture, { passive: true });
  });
}

/**
 * Plays a clear, attention-grabbing 3-pulse melody chime to alert the user
 * that their parking is expiring in 5 minutes or has expired.
 */
export function playParkingAlertSound(): void {
  // 1. Trigger mobile device vibration if supported
  try {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate([400, 150, 400, 150, 600]);
    }
  } catch {}

  // 2. Play Web Audio synthesizer
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!audioCtx && AudioContextClass) {
      audioCtx = new AudioContextClass();
    }

    if (audioCtx) {
      if (audioCtx.state === 'suspended') {
        audioCtx.resume().catch(() => {});
      }

      const ctx = audioCtx;
      const startTime = ctx.currentTime + 0.05;

      // Play 3 pairs of alert chimes (Attention-grabbing & distinct)
      const playChimePair = (offset: number, freq1: number, freq2: number, volume = 0.65) => {
        const t = startTime + offset;

        // Note 1
        const osc1 = ctx.createOscillator();
        const gain1 = ctx.createGain();
        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(freq1, t);
        gain1.gain.setValueAtTime(volume, t);
        gain1.gain.exponentialRampToValueAtTime(0.001, t + 0.35);
        osc1.connect(gain1);
        gain1.connect(ctx.destination);
        osc1.start(t);
        osc1.stop(t + 0.38);

        // Note 2 (Harmonic lift)
        const osc2 = ctx.createOscillator();
        const gain2 = ctx.createGain();
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(freq2, t + 0.12);
        gain2.gain.setValueAtTime(volume * 1.1, t + 0.12);
        gain2.gain.exponentialRampToValueAtTime(0.001, t + 0.55);
        osc2.connect(gain2);
        gain2.connect(ctx.destination);
        osc2.start(t + 0.12);
        osc2.stop(t + 0.58);
      };

      // Pulse 1: 880Hz -> 1174Hz (A5 -> D6)
      playChimePair(0.0, 880, 1174.66, 0.6);
      // Pulse 2: 880Hz -> 1174Hz
      playChimePair(0.45, 880, 1174.66, 0.65);
      // Pulse 3: 987Hz -> 1318Hz (B5 -> E6 - higher resolution)
      playChimePair(0.9, 987.77, 1318.51, 0.7);
      return;
    }
  } catch (err) {
    console.warn('Web Audio playback error:', err);
  }

  // 3. Fallback to HTML5 audio beep if Web Audio failed
  try {
    const audioEl = new Audio(
      'data:audio/wav;base64,UklGRl9vT19XQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YU' +
        'tvT18AAAAAAP///wAAAP///wAAAP///wAAAP///wAAAP///wAAAP///wAAAP///wAAAP///wAA'
    );
    audioEl.play().catch(() => {});
  } catch {}
}
