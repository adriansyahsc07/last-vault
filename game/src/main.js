// The Last Vault — game loop and rules. Owns the state machine (title / playing / caught /
// win), the alarm, the tools, the vault crack, loot pickup and the getaway, and wires the
// other modules together. ?shot=start|play|alarm|win stages a deterministic scene for
// screenshots; without it the game starts on the title screen.
import { ALARM, GAME, GUARD, THIEF, TOOLS, VIEW } from './config.js';
import { createInput } from './input.js';
import {
  allLootTaken,
  circleHitsSolid,
  freshLoot,
  lootTakenCount,
  moveCircle,
  pointIsSolid,
  thiefAtExit,
  thiefAtVault,
  vaultLoot,
} from './level.js';
import { anyCameraSees, createCameras, updateCameras } from './cameras.js';
import { createGuards, sendNearestGuardTo, updateGuards } from './guards.js';
import {
  playCaught,
  playCoinToss,
  playJammer,
  playPickup,
  playVaultCrack,
  playWin,
  setAlarmSound,
  unlockAudio,
} from './audio.js';
import { render, SCREEN_CAUGHT, SCREEN_PLAY, SCREEN_TITLE, SCREEN_WIN } from './render.js';
import { applyShot } from './shots.js';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

function freshState() {
  return {
    screen: SCREEN_TITLE,
    frozen: false, // a staged ?shot= scene holds its pose for the screenshot
    thief: { x: 480, y: 560, radius: THIEF.radius },
    thiefAngle: -Math.PI / 2,
    guards: createGuards(),
    cameras: createCameras(),
    loot: freshLoot(),
    alarm: 0,
    score: 0,
    timeLeft: GAME.timeLimitSeconds,
    jammers: TOOLS.jammer,
    jammerTimer: 0,
    coins: TOOLS.coin,
    coinsInFlight: [],
    crackProgress: 0,
    spotted: false,
    elapsed: 0,
  };
}

const input = createInput(canvas);
const state = freshState();

function resetGame() {
  const next = freshState();
  Object.assign(state, next);
  state.screen = SCREEN_PLAY;
}

function startHeist() {
  unlockAudio();
  resetGame();
}

function endCaught() {
  state.screen = SCREEN_CAUGHT;
  state.spotted = false;
  setAlarmSound(false);
  playCaught();
}

function endWin() {
  state.screen = SCREEN_WIN;
  state.spotted = false;
  setAlarmSound(false);
  playWin();
}

function collectLoot() {
  for (const item of state.loot) {
    if (item.taken || item.kind === 'vault') continue;
    const distance = Math.hypot(state.thief.x - item.x, state.thief.y - item.y);
    if (distance < THIEF.radius + 26) {
      item.taken = true;
      state.score += item.value;
      playPickup();
    }
  }
}

function crackVault(dt) {
  const vault = vaultLoot(state.loot);
  if (!vault || vault.taken) {
    state.crackProgress = 0;
    return;
  }
  if (thiefAtVault(state.thief) && input.isDown('e')) {
    state.crackProgress += dt / TOOLS.crackSeconds;
    if (state.crackProgress >= 1) {
      vault.taken = true;
      state.score += vault.value;
      state.crackProgress = 0;
      playVaultCrack();
    }
  } else {
    state.crackProgress = Math.max(0, state.crackProgress - dt * 2);
  }
}

function useTools(dt) {
  if (state.jammerTimer > 0) state.jammerTimer -= dt;

  if ((input.isDown('j') || input.isDown('1')) && state.jammers > 0 && state.jammerTimer <= 0) {
    state.jammers -= 1;
    state.jammerTimer = TOOLS.jammerSeconds;
    playJammer();
  }

  for (const click of input.drainClicks()) {
    if (state.coins <= 0) continue;
    if (click.y < 0 || click.y > 640 || click.x < 0 || click.x > 960) continue;
    if (pointIsSolid(click.x, click.y)) continue;
    state.coins -= 1;
    state.coinsInFlight.push({ x: click.x, y: click.y, age: 0 });
    sendNearestGuardTo(state.guards, click.x, click.y);
    playCoinToss();
  }

  for (const coin of state.coinsInFlight) coin.age += dt;
  state.coinsInFlight = state.coinsInFlight.filter((coin) => coin.age < 1.2);
}

function stepPlaying(dt) {
  state.elapsed += dt;
  state.timeLeft = Math.max(0, state.timeLeft - dt);
  if (state.timeLeft <= 0) {
    endCaught();
    return;
  }

  const move = input.moveVector();
  if (move.x !== 0 || move.y !== 0) {
    state.thiefAngle = Math.atan2(move.y, move.x);
    moveCircle(state.thief, move.x * THIEF.speed * dt, move.y * THIEF.speed * dt);
  }

  useTools(dt);
  collectLoot();
  crackVault(dt);

  updateCameras(state.cameras, state.jammerTimer, dt);
  const guardResult = updateGuards(state.guards, state.thief, state.alarm, dt);
  const cameraSees = anyCameraSees(state.cameras, state.thief, state.jammerTimer);
  state.spotted = guardResult.seenByGuard || cameraSees;
  if (state.spotted) {
    const rise = (guardResult.seenByGuard ? ALARM.riseGuard : 0) + (cameraSees ? ALARM.riseCamera : 0);
    state.alarm = Math.min(ALARM.max, state.alarm + rise * dt);
  } else {
    state.alarm = Math.max(0, state.alarm - ALARM.decay * dt);
  }
  setAlarmSound(state.spotted);

  if (guardResult.caught || state.alarm >= ALARM.max) {
    endCaught();
    return;
  }

  if (allLootTaken(state.loot) && thiefAtExit(state.thief)) {
    endWin();
  }
}

function step(dt) {
  if (state.frozen) return; // a staged ?shot= scene holds its pose for the screenshot
  if (state.screen === SCREEN_TITLE) {
    if (input.consumeConfirm()) startHeist();
    return;
  }
  if (state.screen === SCREEN_PLAY) {
    stepPlaying(dt);
    return;
  }
  if (input.consumeRestart() || input.consumeConfirm()) startHeist();
}

let lastTimestamp = 0;
function frame(timestamp) {
  const dt = Math.min(0.05, lastTimestamp === 0 ? 0.016 : (timestamp - lastTimestamp) / 1000);
  lastTimestamp = timestamp;
  step(dt);
  render(ctx, state);
  requestAnimationFrame(frame);
}

// A staged scene for screenshots: ?shot=play (and friends) replaces the title screen.
const shot = new URLSearchParams(window.location.search).get('shot');
if (shot) {
  applyShot(state, shot);
}

// Exposed for headless play-testing: the live state and a way to reset it.
window.__heist = {
  state,
  reset: resetGame,
  screenOf: () => state.screen,
  thiefIsInsideSolid: () => circleHitsSolid(state.thief.x, state.thief.y, state.thief.radius),
};

canvas.width = VIEW.width;
canvas.height = VIEW.height;
requestAnimationFrame(frame);
