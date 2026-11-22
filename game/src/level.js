// The room itself: walls, furniture, loot spots and the exit. This module owns geometry —
// what blocks movement, what blocks a line of sight, where the loot sits — and nothing else.
import { EXIT_ZONE, LOOT, OBSTACLES, ROOM, VAULT_CRACK_ZONE, WALL } from './config.js';

/** The room's solid rectangles: the four walls plus every piece of furniture. */
export function solidRects() {
  const walls = [
    { x: 0, y: 0, w: ROOM.width, h: WALL }, // north wall (vault side)
    { x: 0, y: ROOM.height - WALL, w: ROOM.width, h: WALL }, // south wall (exit side)
    { x: 0, y: 0, w: WALL, h: ROOM.height }, // west wall
    { x: ROOM.width - WALL, y: 0, w: WALL, h: ROOM.height }, // east wall
  ];
  return walls.concat(OBSTACLES);
}

/** True when the circle at (x, y) with `radius` overlaps any solid rectangle. */
export function circleHitsSolid(x, y, radius) {
  for (const rect of solidRects()) {
    const nearestX = Math.max(rect.x, Math.min(x, rect.x + rect.w));
    const nearestY = Math.max(rect.y, Math.min(y, rect.y + rect.h));
    const dx = x - nearestX;
    const dy = y - nearestY;
    if (dx * dx + dy * dy < radius * radius) return true;
  }
  return false;
}

/** Move a circle by (dx, dy), sliding along walls instead of sticking to them. */
export function moveCircle(body, dx, dy) {
  const nextX = body.x + dx;
  if (!circleHitsSolid(nextX, body.y, body.radius)) body.x = nextX;
  const nextY = body.y + dy;
  if (!circleHitsSolid(body.x, nextY, body.radius)) body.y = nextY;
}

/** True when the point is inside any solid rectangle (used for coin landing spots). */
export function pointIsSolid(x, y) {
  for (const rect of solidRects()) {
    if (x >= rect.x && x <= rect.x + rect.w && y >= rect.y && y <= rect.y + rect.h) return true;
  }
  return false;
}

// --- line of sight -----------------------------------------------------------

/** True when the segment from (x1, y1) to (x2, y2) crosses the rectangle. */
function segmentCrossesRect(x1, y1, x2, y2, rect) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  let tMin = 0;
  let tMax = 1;
  // Slab test, axis by axis; a zero-length axis is skipped.
  const pairs = [
    [dx, rect.x - x1, rect.x + rect.w - x1],
    [dy, rect.y - y1, rect.y + rect.h - y1],
  ];
  for (const [d, low, high] of pairs) {
    if (Math.abs(d) < 1e-9) {
      if (low > 0 || high < 0) return false;
      continue;
    }
    let t1 = low / d;
    let t2 = high / d;
    if (t1 > t2) [t1, t2] = [t2, t1];
    tMin = Math.max(tMin, t1);
    tMax = Math.min(tMax, t2);
    if (tMin > tMax) return false;
  }
  return true;
}

/** True when no furniture stands between the watcher and the target. Walls count too. */
export function hasLineOfSight(x1, y1, x2, y2) {
  for (const rect of solidRects()) {
    if (segmentCrossesRect(x1, y1, x2, y2, rect)) return false;
  }
  return true;
}

/** True when the point is inside the rectangle (with a small margin). */
export function pointInRect(x, y, rect, margin = 0) {
  return (
    x >= rect.x - margin &&
    x <= rect.x + rect.w + margin &&
    y >= rect.y - margin &&
    y <= rect.y + rect.h + margin
  );
}

// --- loot, vault, exit -------------------------------------------------------

/** Fresh loot state: every target present, nothing collected yet. */
export function freshLoot() {
  return LOOT.map((item) => ({ ...item, taken: false }));
}

export function lootTakenCount(loot) {
  return loot.filter((item) => item.taken).length;
}

export function allLootTaken(loot) {
  return loot.every((item) => item.taken);
}

/** The vault loot entry, for the crack-the-safe interaction. */
export function vaultLoot(loot) {
  return loot.find((item) => item.kind === 'vault');
}

/** True when the thief stands close enough to the vault door to work the lock. */
export function thiefAtVault(thief) {
  return pointInRect(thief.x, thief.y, VAULT_CRACK_ZONE, 10);
}

/** True when the thief stands in the service exit. */
export function thiefAtExit(thief) {
  return pointInRect(thief.x, thief.y, EXIT_ZONE, 0);
}

export function exitZone() {
  return EXIT_ZONE;
}
