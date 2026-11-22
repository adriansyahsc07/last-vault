// Keyboard and mouse input for the heist. WASD or arrow keys move the thief; E (held) cracks
// the vault; J or 1 fires the camera jammer; K, 2 or a mouse click tosses a noisemaker coin to
// the clicked floor point. Space starts or restarts; R restarts after a win or a catch.
export function createInput(canvas) {
  const keys = new Set();
  const clicks = [];
  let mouse = { x: 0, y: 0 };

  function keyName(event) {
    return event.key.length === 1 ? event.key.toLowerCase() : event.key;
  }

  function onKeyDown(event) {
    const key = keyName(event);
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(event.key)) {
      event.preventDefault();
    }
    keys.add(key);
  }

  function onKeyUp(event) {
    keys.delete(keyName(event));
  }

  function onMouseMove(event) {
    const rect = canvas.getBoundingClientRect();
    mouse = {
      x: ((event.clientX - rect.left) / rect.width) * canvas.width,
      y: ((event.clientY - rect.top) / rect.height) * canvas.height,
    };
  }

  function onClick(event) {
    onMouseMove(event);
    clicks.push({ x: mouse.x, y: mouse.y - 60 }); // room space: below the HUD strip
  }

  window.addEventListener('keydown', onKeyDown);
  window.addEventListener('keyup', onKeyUp);
  canvas.addEventListener('mousemove', onMouseMove);
  canvas.addEventListener('click', onClick);

  return {
    /** The movement direction from held keys, normalised, in room space. */
    moveVector() {
      let x = 0;
      let y = 0;
      if (keys.has('a') || keys.has('ArrowLeft')) x -= 1;
      if (keys.has('d') || keys.has('ArrowRight')) x += 1;
      if (keys.has('w') || keys.has('ArrowUp')) y -= 1;
      if (keys.has('s') || keys.has('ArrowDown')) y += 1;
      if (x === 0 && y === 0) return { x: 0, y: 0 };
      const length = Math.hypot(x, y);
      return { x: x / length, y: y / length };
    },
    isDown(key) {
      return keys.has(key);
    },
    /** True once per physical press of Space or Enter. */
    consumeConfirm() {
      if (keys.has(' ') || keys.has('Enter')) {
        keys.delete(' ');
        keys.delete('Enter');
        return true;
      }
      return false;
    },
    /** True once per physical press of R. */
    consumeRestart() {
      if (keys.has('r')) {
        keys.delete('r');
        return true;
      }
      return false;
    },
    /** Drain queued mouse clicks (room-space points). */
    drainClicks() {
      return clicks.splice(0, clicks.length);
    },
    mousePosition() {
      return mouse;
    },
  };
}
