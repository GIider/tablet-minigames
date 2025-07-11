import { config } from '../config.js';
const { edgeMargin, obstacleSize: size, emojis } = config;


export let obstacles = [];

export function spawnObstacles(count = 10) {
  obstacles = [];
  for (let i = 0; i < count; i++) {
    const x = Math.random() * (window.innerWidth - config.edgeMargin);
    const y = Math.random() * (window.innerHeight - config.edgeMargin);
    obstacles.push({ x, y, size });
  }
}

export function drawObstacles(ctx) {
  ctx.font = "32px serif";
  obstacles.forEach(o => {
	ctx.fillText(emojis.obstacle, o.x, o.y + 28);
  });
}
