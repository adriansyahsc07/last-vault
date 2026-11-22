// The Last Vault — configuration: the room, its furniture, the patrols, the loot and the
// tuning numbers. Every coordinate lives in the 960x640 room space; the renderer translates
// the room below the 60px HUD strip. Nothing here is copied from another game.
export const VIEW = { width: 960, height: 700 };
export const HUD_HEIGHT = 60;
export const ROOM = { x: 0, y: 0, width: 960, height: 640 };
export const WALL = 20;

export const THIEF = { radius: 14, speed: 178, name: 'Mara Voss' };

export const GUARD = {
  radius: 15,
  patrolSpeed: 74,
  chaseSpeed: 122,
  coneRange: 235,
  coneHalfAngle: 0.56, // radians, about 32 degrees each side
  catchRadius: 26,
};

export const CAMERA = {
  range: 275,
  halfAngle: 0.5, // about 29 degrees each side
  sweepSpeed: 0.55, // radians per second
};

export const ALARM = {
  riseGuard: 26, // per second while a guard sees the thief
  riseCamera: 34, // per second while a camera sees the thief
  decay: 7, // per second while nobody sees the thief
  warnAt: 40,
  huntAt: 70,
  max: 100,
};

export const TOOLS = {
  jammer: 2, // uses; each jams every camera for jammerSeconds
  jammerSeconds: 6,
  coin: 3, // noisemaker coins; the nearest guard investigates the clang
  investigateSeconds: 4,
  crackSeconds: 2.5, // hold E beside the vault to crack it
};

export const GAME = {
  title: 'THE LAST VAULT',
  subtitle: 'a quiet heist in the Meridian Museum',
  timeLimitSeconds: 300,
};

// Furniture the thief and the guards walk around, and that blocks sight lines. Each rect is
// { x, y, w, h, kind, label }: desks and crates are cover, the pillar is the room's centre.
export const OBSTACLES = [
  { x: 150, y: 200, w: 140, h: 40, kind: 'desk', label: 'DISPLAY DESK' },
  { x: 670, y: 200, w: 140, h: 40, kind: 'desk', label: 'DISPLAY DESK' },
  { x: 150, y: 400, w: 80, h: 70, kind: 'crate', label: 'CRATES' },
  { x: 730, y: 400, w: 80, h: 70, kind: 'crate', label: 'CRATES' },
  { x: 440, y: 300, w: 80, h: 44, kind: 'pillar', label: 'MARBLE PILLAR' },
  { x: 330, y: 470, w: 120, h: 36, kind: 'bench', label: 'BENCH' },
  { x: 510, y: 470, w: 120, h: 36, kind: 'bench', label: 'BENCH' },
];

// The three loot targets. The vault core needs a lockpick hold; the other two are grab-and-go.
export const LOOT = [
  { id: 'gold', x: 108, y: 88, label: 'GOLD BARS', value: 400, kind: 'gold' },
  { id: 'jewels', x: 852, y: 88, label: 'JEWEL CASE', value: 350, kind: 'jewels' },
  { id: 'vault', x: 480, y: 52, label: 'THE LAST VAULT', value: 600, kind: 'vault' },
];

export const EXIT_ZONE = { x: 430, y: 600, w: 100, h: 40, label: 'SERVICE EXIT' };
export const VAULT_CRACK_ZONE = { x: 400, y: 60, w: 160, h: 90 };

// Guard patrols: name, colour, waypoints looped in order, and a facing start angle.
export const GUARD_PATROLS = [
  {
    name: 'BRAM',
    colour: '#e2574c',
    waypoints: [
      [300, 128], [660, 128], [660, 178], [300, 178],
    ],
  },
  {
    name: 'SABLE',
    colour: '#e08a3c',
    waypoints: [
      [205, 280], [755, 280], [755, 392], [205, 392],
    ],
  },
  {
    name: 'ROOK',
    colour: '#c94f7c',
    // A vertical beat down the west side of the gallery, guarding the approach to the
    // service exit: the thief's spawn at the exit door stays out of this cone, so the
    // heist starts quiet and the player chooses when to cross the beat.
    waypoints: [
      [260, 420], [260, 560],
    ],
  },
];

// Wall cameras: position, the centre of their sweep, and how far they swing each way.
export const CAMERA_DEFS = [
  { id: 'CAM-1', x: 62, y: 34, centre: 0.9, swing: 0.65 },
  { id: 'CAM-2', x: 898, y: 34, centre: Math.PI - 0.9, swing: 0.65 },
  { id: 'CAM-3', x: 898, y: 606, centre: Math.PI + 0.9, swing: 0.55 },
];

export const COLORS = {
  floorA: '#1d2f45',
  floorB: '#182838',
  floorLine: '#24394f',
  wall: '#0e1a28',
  wallTrim: '#c9a227',
  desk: '#3a2f22',
  deskTop: '#54432e',
  crate: '#4a3b28',
  pillar: '#5d6b7a',
  bench: '#2c3e50',
  gold: '#f2c14e',
  jewel: '#7fe3ff',
  vault: '#d8b25a',
  exit: '#39d98a',
  thief: '#f5f0e1',
  thiefCoat: '#2f6f5e',
  coneGuard: 'rgba(226, 87, 76, 0.20)',
  coneGuardEdge: 'rgba(226, 87, 76, 0.55)',
  coneCamera: 'rgba(255, 196, 66, 0.18)',
  coneCameraEdge: 'rgba(255, 196, 66, 0.55)',
  hud: '#0d1622',
  hudText: '#e8e2d0',
  alarmLow: '#39d98a',
  alarmMid: '#f2c14e',
  alarmHigh: '#e2574c',
};
