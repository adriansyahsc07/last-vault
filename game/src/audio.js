// Sound, made in code with WebAudio — no audio files, no network. Short oscillator bleeps:
// a coin chime for loot, a soft click for a thrown coin, a rising two-tone alarm while the
// thief is spotted, and a little arpeggio for the getaway. Silent until the first key or
// click, when the browser allows audio to start.
let context = null;
let alarmOscillator = null;
let alarmGain = null;

function ensureContext() {
  if (context) return context;
  try {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return null;
    context = new AudioContextClass();
  } catch {
    context = null;
  }
  return context;
}

/** Call from any user gesture so the browser unlocks audio. */
export function unlockAudio() {
  const ctx = ensureContext();
  if (ctx && ctx.state === 'suspended') void ctx.resume();
}

function tone(frequency, duration, type = 'sine', volume = 0.12, when = 0) {
  const ctx = ensureContext();
  if (!ctx) return;
  try {
    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();
    oscillator.type = type;
    oscillator.frequency.value = frequency;
    const start = ctx.currentTime + when;
    gain.gain.setValueAtTime(0, start);
    gain.gain.linearRampToValueAtTime(volume, start + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
    oscillator.connect(gain);
    gain.connect(ctx.destination);
    oscillator.start(start);
    oscillator.stop(start + duration + 0.05);
  } catch {
    // Audio is decoration; a failure must never break the game.
  }
}

/** A bright two-note chime when loot is pocketed. */
export function playPickup() {
  tone(880, 0.12, 'sine', 0.14);
  tone(1318, 0.18, 'sine', 0.12, 0.09);
}

/** The metallic click of a tossed noisemaker coin. */
export function playCoinToss() {
  tone(2093, 0.05, 'square', 0.05);
  tone(1568, 0.08, 'square', 0.05, 0.12);
}

/** The low thunk of the vault's tumblers falling into place. */
export function playVaultCrack() {
  tone(196, 0.25, 'triangle', 0.16);
  tone(392, 0.2, 'triangle', 0.12, 0.12);
  tone(784, 0.3, 'sine', 0.12, 0.26);
}

/** The jammer's soft static burst. */
export function playJammer() {
  tone(1200, 0.3, 'sawtooth', 0.04);
  tone(800, 0.3, 'sawtooth', 0.04, 0.08);
}

/** Start (or keep) the pulsing alarm tone while the thief is spotted. */
export function setAlarmSound(spotted) {
  const ctx = ensureContext();
  if (!ctx) return;
  try {
    if (spotted && !alarmOscillator) {
      alarmOscillator = ctx.createOscillator();
      alarmGain = ctx.createGain();
      alarmOscillator.type = 'square';
      alarmOscillator.frequency.value = 620;
      alarmGain.gain.value = 0.035;
      alarmOscillator.connect(alarmGain);
      alarmGain.connect(ctx.destination);
      alarmOscillator.start();
    } else if (!spotted && alarmOscillator) {
      alarmOscillator.stop();
      alarmOscillator.disconnect();
      alarmOscillator = null;
      alarmGain = null;
    }
  } catch {
    alarmOscillator = null;
    alarmGain = null;
  }
}

/** A short descending sting for being caught. */
export function playCaught() {
  setAlarmSound(false);
  tone(392, 0.25, 'sawtooth', 0.1);
  tone(262, 0.4, 'sawtooth', 0.1, 0.2);
}

/** A rising arpeggio for slipping out with the loot. */
export function playWin() {
  setAlarmSound(false);
  const notes = [523, 659, 784, 1047];
  notes.forEach((frequency, index) => tone(frequency, 0.22, 'sine', 0.13, index * 0.11));
}
