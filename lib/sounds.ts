// ============================================================================
// SIMPLE SOUND UTILITIES USING WEB AUDIO API
// ============================================================================

let audioContext: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!audioContext) {
    audioContext = new AudioContext();
  }
  return audioContext;
}

/**
 * Play a beep with specific frequency and duration.
 */
function playBeep(
  frequency: number,
  duration: number,
  type: OscillatorType = "sine",
) {
  const ctx = getAudioContext();
  const oscillator = ctx.createOscillator();
  const gainNode = ctx.createGain();

  oscillator.connect(gainNode);
  gainNode.connect(ctx.destination);

  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, ctx.currentTime);

  gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);

  oscillator.start(ctx.currentTime);
  oscillator.stop(ctx.currentTime + duration);
}

/**
 * Play a sequence of beeps.
 */
function playSequence(
  beeps: { frequency: number; duration: number; delay: number }[],
) {
  const ctx = getAudioContext();
  let currentTime = ctx.currentTime;

  beeps.forEach(({ frequency, duration, delay }) => {
    currentTime += delay;
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(frequency, currentTime);

    gainNode.gain.setValueAtTime(0.3, currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, currentTime + duration);

    oscillator.start(currentTime);
    oscillator.stop(currentTime + duration);
  });
}

/**
 * Sound played when work session starts.
 */
export function playWorkStartSound() {
  playSequence([
    { frequency: 523, duration: 0.15, delay: 0 }, // C5
    { frequency: 659, duration: 0.15, delay: 0.1 }, // E5
    { frequency: 784, duration: 0.3, delay: 0.1 }, // G5
  ]);
}

/**
 * Sound played when work session ends / break starts.
 */
export function playBreakStartSound() {
  playSequence([
    { frequency: 784, duration: 0.15, delay: 0 }, // G5
    { frequency: 659, duration: 0.15, delay: 0.1 }, // E5
    { frequency: 523, duration: 0.3, delay: 0.1 }, // C5
  ]);
}

/**
 * Sound played when long break starts.
 */
export function playLongBreakSound() {
  playSequence([
    { frequency: 523, duration: 0.2, delay: 0 },
    { frequency: 659, duration: 0.2, delay: 0.15 },
    { frequency: 784, duration: 0.2, delay: 0.15 },
    { frequency: 1047, duration: 0.5, delay: 0.15 }, // C6
  ]);
}

export function playAllSessionsCompleteSound() {
  playSequence([
    { frequency: 523, duration: 0.15, delay: 0 }, // C5
    { frequency: 659, duration: 0.15, delay: 0.1 }, // E5
    { frequency: 784, duration: 0.15, delay: 0.1 }, // G5
    { frequency: 1047, duration: 0.3, delay: 0.1 }, // C6
    { frequency: 784, duration: 0.15, delay: 0.15 }, // G5
    { frequency: 1047, duration: 0.5, delay: 0.1 }, // C6
  ]);
}

/**
 * Sound played when pomodoro session is fully complete.
 */
export function playSessionCompleteSound() {
  playSequence([
    { frequency: 523, duration: 0.15, delay: 0 },
    { frequency: 659, duration: 0.15, delay: 0.12 },
    { frequency: 784, duration: 0.15, delay: 0.12 },
    { frequency: 1047, duration: 0.4, delay: 0.12 },
  ]);
}

/**
 * Simple click/tick sound for timer interactions.
 */
export function playClickSound() {
  playBeep(800, 0.05, "square");
}

/**
 * Sound for timer complete.
 */
export function playTimerCompleteSound() {
  playBeep(880, 0.5, "sine");
  setTimeout(() => playBeep(1100, 0.5, "sine"), 300);
}

/**
 * Resume audio context after user interaction (required by browsers).
 */
export function resumeAudioContext() {
  const ctx = getAudioContext();
  if (ctx.state === "suspended") {
    ctx.resume();
  }
}
