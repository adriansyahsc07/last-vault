// All drawing: the museum room, the vision cones, the thief, the guards, the cameras, the
// loot, the HUD and the title / caught / win screens. One canvas, drawn with plain 2D calls
// and the palette from config.js — no images, no fonts from anywhere but the system.
import {
  ALARM,
  CAMERA,
  COLORS,
  EXIT_ZONE,
  GAME,
  GUARD,
  HUD_HEIGHT,
  OBSTACLES,
  ROOM,
  THIEF,
  TOOLS,
  VIEW,
  WALL,
} from './config.js';
import { lootTakenCount } from './level.js';

export const SCREEN_TITLE = 'title';
export const SCREEN_PLAY = 'play';
export const SCREEN_CAUGHT = 'caught';
export const SCREEN_WIN = 'win';

function drawCone(ctx, x, y, angle, range, halfAngle, fill, edge) {
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.arc(x, y, range, angle - halfAngle, angle + halfAngle);
  ctx.closePath();
  ctx.fillStyle = fill;
  ctx.fill();
  ctx.strokeStyle = edge;
  ctx.lineWidth = 1.5;
  ctx.stroke();
}

function drawFloor(ctx) {
  ctx.fillStyle = COLORS.floorA;
  ctx.fillRect(0, 0, ROOM.width, ROOM.height);
  const tile = 80;
  for (let y = 0; y < ROOM.height; y += tile) {
    for (let x = 0; x < ROOM.width; x += tile) {
      if (((x + y) / tile) % 2 === 0) {
        ctx.fillStyle = COLORS.floorB;
        ctx.fillRect(x, y, tile, tile);
      }
    }
  }
  ctx.strokeStyle = COLORS.floorLine;
  ctx.lineWidth = 1;
  for (let x = 0; x <= ROOM.width; x += tile) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, ROOM.height);
    ctx.stroke();
  }
  for (let y = 0; y <= ROOM.height; y += tile) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(ROOM.width, y);
    ctx.stroke();
  }
  // A brass inlay ring around the centre pillar, for the museum look.
  ctx.strokeStyle = 'rgba(201, 162, 39, 0.35)';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(480, 322, 96, 0, Math.PI * 2);
  ctx.stroke();
}

function drawWalls(ctx) {
  ctx.fillStyle = COLORS.wall;
  ctx.fillRect(0, 0, ROOM.width, WALL);
  ctx.fillRect(0, ROOM.height - WALL, ROOM.width, WALL);
  ctx.fillRect(0, 0, WALL, ROOM.height);
  ctx.fillRect(ROOM.width - WALL, 0, WALL, ROOM.height);
  ctx.strokeStyle = COLORS.wallTrim;
  ctx.lineWidth = 2;
  ctx.strokeRect(WALL / 2, WALL / 2, ROOM.width - WALL, ROOM.height - WALL);
}

function drawObstacles(ctx) {
  for (const obstacle of OBSTACLES) {
    ctx.fillStyle =
      obstacle.kind === 'desk'
        ? COLORS.deskTop
        : obstacle.kind === 'crate'
          ? COLORS.crate
          : obstacle.kind === 'pillar'
            ? COLORS.pillar
            : COLORS.bench;
    ctx.fillRect(obstacle.x, obstacle.y, obstacle.w, obstacle.h);
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.45)';
    ctx.lineWidth = 2;
    ctx.strokeRect(obstacle.x + 1, obstacle.y + 1, obstacle.w - 2, obstacle.h - 2);
    if (obstacle.kind === 'pillar') {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.12)';
      ctx.beginPath();
      ctx.arc(obstacle.x + obstacle.w / 2, obstacle.y + obstacle.h / 2, 12, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.fillStyle = 'rgba(232, 226, 208, 0.55)';
    ctx.font = '10px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(obstacle.label, obstacle.x + obstacle.w / 2, obstacle.y + obstacle.h / 2 + 3);
  }
}

function drawExit(ctx, allLootTaken) {
  const exit = EXIT_ZONE;
  ctx.fillStyle = allLootTaken ? COLORS.exit : 'rgba(57, 217, 138, 0.35)';
  ctx.fillRect(exit.x, exit.y, exit.w, exit.h);
  ctx.strokeStyle = COLORS.exit;
  ctx.lineWidth = 2;
  ctx.strokeRect(exit.x, exit.y, exit.w, exit.h);
  ctx.fillStyle = '#0d1622';
  ctx.font = 'bold 13px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('EXIT', exit.x + exit.w / 2, exit.y + exit.h / 2 + 5);
  ctx.fillStyle = 'rgba(232, 226, 208, 0.75)';
  ctx.font = '10px system-ui, sans-serif';
  ctx.fillText('GETAWAY — NEEDS ALL LOOT', exit.x + exit.w / 2, exit.y - 6);
}

function drawLoot(ctx, loot, crackProgress) {
  for (const item of loot) {
    if (item.taken) continue;
    ctx.save();
    ctx.translate(item.x, item.y);
    if (item.kind === 'gold') {
      ctx.fillStyle = COLORS.gold;
      for (let i = 0; i < 3; i += 1) {
        ctx.fillRect(-14 + i * 2, 6 - i * 6, 26, 8);
      }
      ctx.strokeStyle = '#8a6d1f';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(-14, -12, 28, 20);
    } else if (item.kind === 'jewels') {
      ctx.fillStyle = '#274b5c';
      ctx.fillRect(-16, -12, 32, 24);
      ctx.fillStyle = COLORS.jewel;
      ctx.beginPath();
      ctx.moveTo(0, -10);
      ctx.lineTo(9, 0);
      ctx.lineTo(0, 10);
      ctx.lineTo(-9, 0);
      ctx.closePath();
      ctx.fill();
    } else {
      // The vault: a round brass door set into the north wall.
      ctx.fillStyle = '#3d3423';
      ctx.fillRect(-46, -34, 92, 40);
      ctx.fillStyle = COLORS.vault;
      ctx.beginPath();
      ctx.arc(0, -14, 22, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#8a6d1f';
      ctx.lineWidth = 3;
      ctx.stroke();
      ctx.fillStyle = '#3d3423';
      ctx.beginPath();
      ctx.arc(0, -14, 6, 0, Math.PI * 2);
      ctx.fill();
      if (crackProgress > 0) {
        ctx.fillStyle = COLORS.exit;
        ctx.fillRect(-30, 12, 60 * crackProgress, 5);
      }
    }
    ctx.restore();
    ctx.fillStyle = 'rgba(232, 226, 208, 0.85)';
    ctx.font = 'bold 10px system-ui, sans-serif';
    ctx.textAlign = 'center';
    const labelY = item.kind === 'vault' ? item.y + 30 : item.y + 26;
    ctx.fillText(item.label, item.x, labelY);
  }
}

function drawCamera(ctx, camera, jammed) {
  drawCone(
    ctx,
    camera.x,
    camera.y,
    camera.angle,
    CAMERA.range,
    CAMERA.halfAngle,
    jammed ? 'rgba(120, 120, 120, 0.10)' : COLORS.coneCamera,
    jammed ? 'rgba(120, 120, 120, 0.35)' : COLORS.coneCameraEdge,
  );
  ctx.fillStyle = jammed ? '#666' : '#ffc442';
  ctx.beginPath();
  ctx.arc(camera.x, camera.y, 9, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#0d1622';
  ctx.beginPath();
  ctx.arc(camera.x, camera.y, 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = jammed ? '#888' : '#ffc442';
  ctx.font = 'bold 10px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(jammed ? `${camera.id} · JAMMED` : camera.id, camera.x, camera.y + 24);
}

function drawGuard(ctx, guard, spotted) {
  drawCone(
    ctx,
    guard.x,
    guard.y,
    guard.angle,
    GUARD.coneRange,
    GUARD.coneHalfAngle,
    COLORS.coneGuard,
    COLORS.coneGuardEdge,
  );
  // Body: a dark uniform with the guard's colour trim, facing its cone.
  ctx.save();
  ctx.translate(guard.x, guard.y);
  ctx.rotate(guard.angle);
  ctx.fillStyle = '#20242c';
  ctx.beginPath();
  ctx.arc(0, 0, GUARD.radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = guard.colour;
  ctx.lineWidth = 3;
  ctx.stroke();
  ctx.fillStyle = guard.colour;
  ctx.beginPath();
  ctx.moveTo(GUARD.radius + 4, 0);
  ctx.lineTo(GUARD.radius - 6, -6);
  ctx.lineTo(GUARD.radius - 6, 6);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
  ctx.fillStyle = '#e8e2d0';
  ctx.font = 'bold 10px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(guard.name, guard.x, guard.y - GUARD.radius - 8);
  if (spotted) {
    ctx.fillStyle = '#ff5a4e';
    ctx.font = 'bold 20px system-ui, sans-serif';
    ctx.fillText('!', guard.x, guard.y - GUARD.radius - 22);
  } else if (guard.mode === 'investigate') {
    ctx.fillStyle = '#f2c14e';
    ctx.font = 'bold 16px system-ui, sans-serif';
    ctx.fillText('?', guard.x, guard.y - GUARD.radius - 20);
  }
}

function drawThief(ctx, thief, facingAngle) {
  ctx.save();
  ctx.translate(thief.x, thief.y);
  ctx.rotate(facingAngle);
  // A dark coat, a pale mask, and a slouch hat — the thief reads at a glance.
  ctx.fillStyle = COLORS.thiefCoat;
  ctx.beginPath();
  ctx.arc(0, 0, THIEF.radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = COLORS.thief;
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.fillStyle = COLORS.thief;
  ctx.beginPath();
  ctx.arc(4, 0, 7, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#0d1622';
  ctx.fillRect(8, -9, 8, 4);
  ctx.fillRect(8, 5, 8, 4);
  ctx.restore();
  ctx.fillStyle = '#e8e2d0';
  ctx.font = 'bold 10px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('MARA', thief.x, thief.y - THIEF.radius - 8);
}

function drawCoin(ctx, coin) {
  ctx.fillStyle = COLORS.gold;
  ctx.beginPath();
  ctx.arc(coin.x, coin.y, 6, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#8a6d1f';
  ctx.lineWidth = 1.5;
  ctx.stroke();
  ctx.strokeStyle = 'rgba(242, 193, 78, 0.7)';
  ctx.beginPath();
  ctx.arc(coin.x, coin.y, 10 + coin.age * 14, 0, Math.PI * 2);
  ctx.stroke();
}

function formatTime(seconds) {
  const total = Math.max(0, Math.ceil(seconds));
  const minutes = Math.floor(total / 60);
  const rest = total % 60;
  return `${minutes}:${String(rest).padStart(2, '0')}`;
}

function drawHud(ctx, state) {
  ctx.fillStyle = COLORS.hud;
  ctx.fillRect(0, 0, VIEW.width, HUD_HEIGHT);
  ctx.fillStyle = COLORS.hudText;
  ctx.font = 'bold 15px system-ui, sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('THE LAST VAULT', 14, 24);
  ctx.font = '11px system-ui, sans-serif';
  ctx.fillStyle = 'rgba(232, 226, 208, 0.7)';
  ctx.fillText('Mara Voss · Meridian Museum', 14, 42);

  // Loot pips.
  const taken = lootTakenCount(state.loot);
  ctx.fillStyle = COLORS.hudText;
  ctx.font = 'bold 13px system-ui, sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText(`LOOT ${taken}/3`, 300, 25);
  for (let i = 0; i < 3; i += 1) {
    ctx.fillStyle = i < taken ? COLORS.gold : 'rgba(232, 226, 208, 0.25)';
    ctx.beginPath();
    ctx.arc(370 + i * 22, 20, 7, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.fillStyle = 'rgba(232, 226, 208, 0.7)';
  ctx.font = '11px system-ui, sans-serif';
  ctx.fillText(`$${state.score.toLocaleString('en-US')}`, 300, 43);

  // Alarm meter.
  const alarm = state.alarm;
  const alarmColour =
    alarm >= ALARM.huntAt ? COLORS.alarmHigh : alarm >= ALARM.warnAt ? COLORS.alarmMid : COLORS.alarmLow;
  ctx.fillStyle = COLORS.hudText;
  ctx.font = 'bold 13px system-ui, sans-serif';
  ctx.fillText('ALARM', 470, 25);
  ctx.fillStyle = 'rgba(232, 226, 208, 0.2)';
  ctx.fillRect(470, 32, 180, 12);
  ctx.fillStyle = alarmColour;
  ctx.fillRect(470, 32, (180 * alarm) / ALARM.max, 12);
  ctx.strokeStyle = 'rgba(232, 226, 208, 0.6)';
  ctx.lineWidth = 1;
  ctx.strokeRect(470, 32, 180, 12);
  ctx.fillStyle = alarmColour;
  ctx.font = 'bold 11px system-ui, sans-serif';
  ctx.fillText(
    alarm >= ALARM.huntAt ? 'HUNTED!' : alarm >= ALARM.warnAt ? 'SUSPICIOUS' : 'QUIET',
    656,
    43,
  );

  // Tools.
  ctx.fillStyle = COLORS.hudText;
  ctx.font = 'bold 13px system-ui, sans-serif';
  ctx.fillText('TOOLS', 730, 25);
  ctx.font = '11px system-ui, sans-serif';
  ctx.fillStyle = 'rgba(232, 226, 208, 0.85)';
  ctx.fillText(`Jammer ×${state.jammers}  [J]`, 730, 43);
  ctx.fillText(`Coins ×${state.coins}  [click]`, 820, 43);
  if (state.jammerTimer > 0) {
    ctx.fillStyle = COLORS.jewel;
    ctx.fillText(`CAMS JAMMED ${state.jammerTimer.toFixed(1)}s`, 730, 58);
  }

  // Timer.
  ctx.textAlign = 'right';
  ctx.fillStyle = COLORS.hudText;
  ctx.font = 'bold 15px system-ui, sans-serif';
  ctx.fillText(formatTime(state.timeLeft), VIEW.width - 14, 25);
  ctx.font = '11px system-ui, sans-serif';
  ctx.fillStyle = 'rgba(232, 226, 208, 0.7)';
  ctx.fillText('left', VIEW.width - 14, 42);
  ctx.textAlign = 'left';
}

function drawOverlay(ctx, title, lines, accent) {
  ctx.fillStyle = 'rgba(8, 14, 22, 0.78)';
  ctx.fillRect(0, 0, VIEW.width, VIEW.height);
  ctx.fillStyle = accent;
  ctx.font = 'bold 44px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(title, VIEW.width / 2, 250);
  ctx.fillStyle = COLORS.hudText;
  ctx.font = '16px system-ui, sans-serif';
  lines.forEach((line, index) => {
    ctx.fillText(line, VIEW.width / 2, 300 + index * 28);
  });
  ctx.textAlign = 'left';
}

function drawTitleScreen(ctx, state) {
  drawOverlay(
    ctx,
    GAME.title,
    [
      GAME.subtitle,
      '',
      'Cross the gallery. Take the gold, the jewels and the vault.',
      'Stay out of the red cones and the camera sweeps — or the alarm fills.',
      'Then slip out the service exit with everything.',
      '',
      'Move: WASD / arrows · Crack vault: hold E · Jammer: J · Coin: click',
      '',
      'Press SPACE to begin the heist',
    ],
    COLORS.gold,
  );
  void state;
}

function drawCaughtScreen(ctx, state) {
  drawOverlay(
    ctx,
    'CAUGHT!',
    [
      `The alarm hit ${Math.round(state.alarm)}% — the gallery doors slammed shut.`,
      `Loot pocketed: ${lootTakenCount(state.loot)} of 3 · Score $${state.score.toLocaleString('en-US')}`,
      '',
      'Press R to case the joint again',
    ],
    COLORS.alarmHigh,
  );
}

function drawWinScreen(ctx, state) {
  drawOverlay(
    ctx,
    'CLEAN GETAWAY!',
    [
      'Every target pocketed, out the service exit before the alarm peaked.',
      `Loot $${state.score.toLocaleString('en-US')} · Time left ${formatTime(state.timeLeft)}`,
      `Final score: ${(state.score + Math.round(state.timeLeft) * 10).toLocaleString('en-US')}`,
      '',
      'Press R to run it again — faster, quieter',
    ],
    COLORS.exit,
  );
}

/** Draw the whole frame from the current state. */
export function render(ctx, state) {
  ctx.clearRect(0, 0, VIEW.width, VIEW.height);
  ctx.save();
  ctx.translate(0, HUD_HEIGHT);
  drawFloor(ctx);
  drawExit(ctx, state.loot.every((item) => item.taken));
  drawLoot(ctx, state.loot, state.crackProgress);
  drawObstacles(ctx);
  for (const camera of state.cameras) {
    drawCamera(ctx, camera, state.jammerTimer > 0);
  }
  for (const guard of state.guards) {
    const spotted = guard.seenTimer > 0;
    drawGuard(ctx, guard, spotted);
  }
  for (const coin of state.coinsInFlight) drawCoin(ctx, coin);
  drawThief(ctx, state.thief, state.thiefAngle);
  if (state.spotted) {
    ctx.fillStyle = 'rgba(226, 87, 76, 0.9)';
    ctx.font = 'bold 22px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('SPOTTED!', ROOM.width / 2, 96);
  }
  if (state.crackProgress > 0 && state.crackProgress < 1) {
    ctx.fillStyle = COLORS.hudText;
    ctx.font = 'bold 14px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('CRACKING THE VAULT… hold E', ROOM.width / 2, 170);
  }
  // Tension at a glance: a red frame creeps in as the alarm climbs, and pulses while seen.
  if (state.alarm >= ALARM.warnAt) {
    const strength = state.spotted
      ? 0.45 + 0.15 * Math.sin(Date.now() / 180)
      : 0.12 + (0.25 * (state.alarm - ALARM.warnAt)) / (ALARM.max - ALARM.warnAt);
    const gradient = ctx.createRadialGradient(
      ROOM.width / 2,
      ROOM.height / 2,
      ROOM.height * 0.32,
      ROOM.width / 2,
      ROOM.height / 2,
      ROOM.height * 0.72,
    );
    gradient.addColorStop(0, 'rgba(226, 87, 76, 0)');
    gradient.addColorStop(1, `rgba(226, 87, 76, ${Math.max(0, Math.min(0.6, strength)).toFixed(3)})`);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, ROOM.width, ROOM.height);
  }
  ctx.restore();
  drawHud(ctx, state);
  if (state.screen === SCREEN_TITLE) drawTitleScreen(ctx, state);
  if (state.screen === SCREEN_CAUGHT) drawCaughtScreen(ctx, state);
  if (state.screen === SCREEN_WIN) drawWinScreen(ctx, state);
}
