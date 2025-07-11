const emoji = "🌲";

export function drawTrees(ctx) {
  const spacing = 30;
  for (let x = 0; x < window.innerWidth; x += spacing) {
    ctx.fillText(emoji, x, 24);
    ctx.fillText(emoji, x, window.innerHeight - 4);
  }
  for (let y = 0; y < window.innerHeight; y += spacing) {
    ctx.fillText(emoji, 0, y);
    ctx.fillText(emoji, window.innerWidth - 24, y);
  }
}
