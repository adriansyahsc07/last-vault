// The wall cameras: fixed mounts that sweep a cone back and forth. A camera that holds the
// thief in its cone raises the alarm faster than a guard does, but a jammer blacks every
// camera out for a few seconds — at the cost of one of only two jammers.
import { CAMERA, CAMERA_DEFS } from './config.js';
import { canSee } from './guards.js';

export function createCameras() {
  return CAMERA_DEFS.map((def) => ({
    id: def.id,
    x: def.x,
    y: def.y,
    centre: def.centre,
    swing: def.swing,
    angle: def.centre - def.swing,
    sweepPhase: 0,
    sweepDirection: 1,
  }));
}

/** Sweep each camera's cone; a jammed camera freezes with its light dark. */
export function updateCameras(cameras, jammerTimer, dt) {
  for (const camera of cameras) {
    if (jammerTimer > 0) continue;
    camera.sweepPhase += camera.sweepDirection * CAMERA.sweepSpeed * dt;
    if (camera.sweepPhase >= camera.swing) {
      camera.sweepPhase = camera.swing;
      camera.sweepDirection = -1;
    } else if (camera.sweepPhase <= -camera.swing) {
      camera.sweepPhase = -camera.swing;
      camera.sweepDirection = 1;
    }
    camera.angle = camera.centre + camera.sweepPhase;
  }
}

/** True when any live (unjammed) camera holds the thief in its cone. */
export function anyCameraSees(cameras, thief, jammerTimer) {
  if (jammerTimer > 0) return false;
  for (const camera of cameras) {
    if (canSee(camera, thief, CAMERA.range, CAMERA.halfAngle)) return true;
  }
  return false;
}

/** The camera currently watching the thief, if any (for the "SPOTTED" callout). */
export function spottingCamera(cameras, thief, jammerTimer) {
  if (jammerTimer > 0) return null;
  for (const camera of cameras) {
    if (canSee(camera, thief, CAMERA.range, CAMERA.halfAngle)) return camera;
  }
  return null;
}
