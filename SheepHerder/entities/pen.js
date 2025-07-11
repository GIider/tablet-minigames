import { config } from '../config.js';

export let pen = {
  x: 0,
  y: 0,
  size: config.penSize
};

export function spawnPen() {
  const margin = 100;
  const centerX = window.innerWidth / 2;
  const centerY = window.innerHeight / 2;

  // Spawn pen somewhere within a "center zone" instead of near edges
  pen.x = centerX + (Math.random() - 0.5) * margin;
  pen.y = centerY + (Math.random() - 0.5) * margin;
}
