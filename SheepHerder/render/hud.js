import { sheep } from '../entities/sheep.js';

export function drawHUD(ctx) {
  const herded = sheep.filter(s => s.herded).length;
  const eaten = sheep.filter(s => s.eaten).length;

  ctx.save();
  ctx.font = "20px sans-serif";
  ctx.fillStyle = "black";
  ctx.fillText(`🐑 Herded: ${herded}`, 20, 30);
  ctx.fillText(`🍖 Eaten: ${eaten}`, 20, 60);
  ctx.restore();
}
