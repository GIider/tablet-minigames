import { killWolfAt } from '../entities/wolf.js';

export let pointer = { x: null, y: null };

export function setupPointerListeners(canvas) {
  canvas.addEventListener("pointermove", e => {
    pointer.x = e.clientX;
    pointer.y = e.clientY;
  });

  canvas.addEventListener("pointerleave", () => {
    pointer.x = null;
    pointer.y = null;
  });

  canvas.addEventListener("click", e => {
    killWolfAt(e.clientX, e.clientY);
  });
}
