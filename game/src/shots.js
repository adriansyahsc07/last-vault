// Deterministic screenshot scenes behind ?shot=start|play|alarm|win. Each one sets the exact
// same state every time it loads — fixed thief and guard positions, a fixed alarm level, fixed
// loot — so a screenshot taken today matches a screenshot taken tomorrow. The scenes are
// honest frames of the real game: the play and alarm scenes run the real update loop from
// their starting state, they only begin from a staged position.
import { SCREEN_CAUGHT, SCREEN_PLAY, SCREEN_TITLE, SCREEN_WIN } from './render.js';

/**
 * Put `state` into the named scene. Returns true for a known scene, false otherwise (the
 * caller then leaves the game on its title screen).
 */
export function applyShot(state, shot) {
  // Every staged scene freezes the simulation so the frame is exactly the staged pose.
  state.frozen = true;
  if (shot === 'start') {
    state.screen = SCREEN_TITLE;
    state.thief.x = 480;
    state.thief.y = 560;
    state.thiefAngle = -Math.PI / 2;
    return true;
  }

  if (shot === 'play') {
    state.screen = SCREEN_PLAY;
    state.thief.x = 480;
    state.thief.y = 400;
    state.thiefAngle = -Math.PI / 2;
    state.loot[0].taken = true; // the gold bars are already pocketed
    state.score = 400;
    state.alarm = 22;
    state.timeLeft = 232;
    state.guards[0].x = 420;
    state.guards[0].y = 128;
    state.guards[0].angle = 0;
    state.guards[1].x = 560;
    state.guards[1].y = 320;
    state.guards[1].angle = Math.PI;
    state.guards[2].x = 260;
    state.guards[2].y = 500;
    state.guards[2].angle = Math.PI / 2;
    state.cameras[0].angle = 0.9;
    state.cameras[1].angle = Math.PI - 0.9;
    state.cameras[2].angle = Math.PI + 0.9;
    return true;
  }

  if (shot === 'alarm') {
    state.screen = SCREEN_PLAY;
    state.thief.x = 600;
    state.thief.y = 300;
    state.thiefAngle = Math.PI / 2;
    state.loot[0].taken = true;
    state.loot[1].taken = true;
    state.score = 750;
    state.alarm = 82;
    state.spotted = true;
    state.timeLeft = 121;
    state.jammers = 1;
    state.coins = 1;
    // Bram is right on top of the thief, cone aimed at them; Sable turns to investigate.
    state.guards[0].x = 540;
    state.guards[0].y = 250;
    state.guards[0].angle = Math.atan2(50, 60);
    state.guards[0].seenTimer = 1.4;
    state.guards[1].x = 700;
    state.guards[1].y = 330;
    state.guards[1].angle = Math.PI;
    state.guards[1].mode = 'investigate';
    state.guards[1].investigateX = 600;
    state.guards[1].investigateY = 300;
    state.guards[2].x = 260;
    state.guards[2].y = 520;
    state.guards[2].angle = Math.PI / 2;
    state.cameras[0].angle = 0.75;
    state.cameras[1].angle = Math.PI - 0.6;
    return true;
  }

  if (shot === 'win') {
    state.screen = SCREEN_WIN;
    for (const item of state.loot) item.taken = true;
    state.score = 1350;
    state.alarm = 31;
    state.timeLeft = 134;
    state.thief.x = 480;
    state.thief.y = 610;
    state.thiefAngle = Math.PI / 2;
    return true;
  }

  if (shot === 'caught') {
    state.screen = SCREEN_CAUGHT;
    state.alarm = 100;
    state.loot[0].taken = true;
    state.score = 400;
    state.timeLeft = 96;
    state.guards[0].x = 480;
    state.guards[0].y = 380;
    state.guards[0].angle = Math.PI / 2;
    state.thief.x = 480;
    state.thief.y = 415;
    return true;
  }

  return false;
}

/** The scene names the game understands, in screenshot order. */
export const SHOT_NAMES = ['start', 'play', 'alarm', 'win'];
