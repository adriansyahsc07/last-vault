// The guards: patrol waypoints, vision cones, and what happens when they spot the thief.
// A guard walks its loop, pauses briefly at each waypoint, and sweeps its cone. When it sees
// the thief it raises the alarm and, past the hunt threshold, hurries to the last seen spot.
// A noisemaker coin sends the nearest guard to investigate the clang instead.
import { ALARM, GUARD, GUARD_PATROLS, TOOLS } from './config.js';
import { hasLineOfSight, moveCircle } from './level.js';

/** Normalise an angle to (-PI, PI]. */
export function angleDifference(from, to) {
  let diff = to - from;
  while (diff > Math.PI) diff -= Math.PI * 2;
  while (diff <= -Math.PI) diff += Math.PI * 2;
  return diff;
}

/** True when `target` lies inside the watcher's cone and nothing blocks the view. */
export function canSee(watcher, target, range, halfAngle) {
  const dx = target.x - watcher.x;
  const dy = target.y - watcher.y;
  const distance = Math.hypot(dx, dy);
  if (distance > range) return false;
  if (distance < 1) return true;
  const facing = Math.atan2(dy, dx);
  if (Math.abs(angleDifference(watcher.angle, facing)) > halfAngle) return false;
  return hasLineOfSight(watcher.x, watcher.y, target.x, target.y);
}

export function createGuards() {
  return GUARD_PATROLS.map((def, index) => {
    const [startX, startY] = def.waypoints[0];
    return {
      name: def.name,
      colour: def.colour,
      x: startX,
      y: startY,
      radius: GUARD.radius,
      angle: 0,
      waypointIndex: 1,
      pause: 0,
      mode: 'patrol', // patrol | investigate | return
      investigateX: 0,
      investigateY: 0,
      investigateTimer: 0,
      seenTimer: 0, // how long this guard has held the thief in view
      patrolIndex: index,
    };
  });
}

function guardTargetAngle(guard, targetX, targetY) {
  return Math.atan2(targetY - guard.y, targetX - guard.x);
}

/** Turn the guard toward `targetAngle` at most `rate` radians per second. */
function turnToward(guard, targetAngle, rate, dt) {
  const diff = angleDifference(guard.angle, targetAngle);
  const step = Math.max(-rate * dt, Math.min(rate * dt, diff));
  guard.angle += step;
}

function advancePatrol(guard, dt) {
  const def = GUARD_PATROLS[guard.patrolIndex];
  if (guard.pause > 0) {
    guard.pause -= dt;
    return;
  }
  const [wx, wy] = def.waypoints[guard.waypointIndex];
  const dx = wx - guard.x;
  const dy = wy - guard.y;
  const distance = Math.hypot(dx, dy);
  if (distance < 6) {
    guard.waypointIndex = (guard.waypointIndex + 1) % def.waypoints.length;
    guard.pause = 0.8; // look around at the end of each leg
    return;
  }
  const speed = GUARD.patrolSpeed;
  const stepX = (dx / distance) * speed * dt;
  const stepY = (dy / distance) * speed * dt;
  moveCircle(guard, stepX, stepY);
  turnToward(guard, guardTargetAngle(guard, wx, wy), 5, dt);
}

/**
 * Step every guard one frame. Returns `{ seenByGuard, caught }`: whether any guard
 * currently holds the thief in its cone, and whether one is close enough to grab them.
 */
export function updateGuards(guards, thief, alarm, dt) {
  let seenByGuard = false;
  let caught = false;
  const hunting = alarm >= ALARM.huntAt;

  for (const guard of guards) {
    const sees = canSee(guard, thief, GUARD.coneRange, GUARD.coneHalfAngle);
    if (sees) {
      seenByGuard = true;
      guard.seenTimer += dt;
      guard.investigateX = thief.x;
      guard.investigateY = thief.y;
      guard.investigateTimer = 1.2; // remember the spot briefly even if the thief ducks away
      if (hunting) guard.mode = 'investigate';
    } else {
      guard.seenTimer = Math.max(0, guard.seenTimer - dt * 2);
    }

    if (guard.mode === 'investigate') {
      guard.investigateTimer -= dt;
      const dx = guard.investigateX - guard.x;
      const dy = guard.investigateY - guard.y;
      const distance = Math.hypot(dx, dy);
      if (distance < 10 || guard.investigateTimer <= 0) {
        guard.mode = 'patrol';
        guard.pause = 0.6;
      } else {
        const speed = hunting ? GUARD.chaseSpeed : GUARD.patrolSpeed * 1.35;
        moveCircle(guard, (dx / distance) * speed * dt, (dy / distance) * speed * dt);
        turnToward(guard, guardTargetAngle(guard, guard.investigateX, guard.investigateY), 6, dt);
      }
    } else {
      advancePatrol(guard, dt);
    }

    const touch = Math.hypot(thief.x - guard.x, thief.y - guard.y);
    if (touch < GUARD.catchRadius + thief.radius - 4) caught = true;
  }

  return { seenByGuard, caught };
}

/** Send the nearest guard to investigate a coin clang at (x, y). */
export function sendNearestGuardTo(guards, x, y) {
  let nearest = null;
  let nearestDistance = Infinity;
  for (const guard of guards) {
    const distance = Math.hypot(guard.x - x, guard.y - y);
    if (distance < nearestDistance) {
      nearest = guard;
      nearestDistance = distance;
    }
  }
  if (!nearest) return null;
  nearest.mode = 'investigate';
  nearest.investigateX = x;
  nearest.investigateY = y;
  nearest.investigateTimer = TOOLS.investigateSeconds;
  return nearest;
}
