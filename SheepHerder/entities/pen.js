export let pen = { x: 0, y: 0, size: 80 };

export function spawnPen() {
  pen.x = Math.random() * (window.innerWidth - 100);
  pen.y = Math.random() * (window.innerHeight - 100);
}
