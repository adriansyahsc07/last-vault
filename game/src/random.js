// A tiny deterministic random-number generator (mulberry32) so a fixed seed always replays
// the same patrol phases and coin bounces. The game itself needs no randomness at runtime
// beyond a seedable source; screenshots pin the seed, so every frame is reproducible.
export function mulberry32(seed) {
  let a = seed >>> 0;
  return function next() {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** A random angle in [0, 2 PI). */
export function randomAngle(rng) {
  return rng() * Math.PI * 2;
}

/** Pick one element of an array with the seeded generator. */
export function pick(rng, items) {
  return items[Math.floor(rng() * items.length)];
}
