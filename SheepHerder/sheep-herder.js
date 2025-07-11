import { setupCanvas, resizeCanvas, getContext } from './core/canvas.js';
import { spawnPen, pen } from './entities/pen.js';
import { spawnObstacles, drawObstacles } from './entities/obstacles.js';
import { spawnSheep, updateSheep, drawSheep, sheep, resetSheep } from './entities/sheep.js';
import { pointer, setupPointerListeners } from './input/pointer.js';
import { drawTrees } from './render/environment.js';
import { showVictoryScreen } from '../Shared/victoryScreen.js';
import { spawnWolf, updateWolves, drawWolves, resetWolves } from './entities/wolf.js';
import { drawHUD } from './render/hud.js';

const canvas = document.getElementById("game");
const ctx = getContext(canvas);

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawTrees(ctx);
  drawObstacles(ctx);
  ctx.font = "40px serif";
  ctx.fillText("🐏🏠", pen.x, pen.y + 40);
  drawSheep(ctx);
  drawWolves(ctx);
  drawHUD(ctx);
}

function gameLoop() {
  updateSheep();
  updateWolves();
  draw();

  const herdedCount = sheep.filter(s => s.herded).length;
  const eatenCount = sheep.filter(s => s.eaten).length;
  const totalCount = sheep.length;

  const allResolved = herdedCount + eatenCount === totalCount;

  if (allResolved) {
    if (eatenCount > herdedCount) {
      showVictoryScreen({
        message: "💀 More sheep were eaten than herded!",
        duration: 4000,
        type: "lose",
        onComplete: resetGame
      });
    } else {
      showVictoryScreen({
        message: "🎉 More sheep were herded than eaten!",
        duration: 4000,
        onComplete: resetGame
      });
    }
    return;
  }

  requestAnimationFrame(gameLoop);
}


function resetGame() {
  spawnPen();
  spawnObstacles();
  spawnSheep();
  resetWolves();
  gameLoop();
}

document.addEventListener("DOMContentLoaded", async () => {

  setupCanvas(canvas);
  resizeCanvas(canvas);
  spawnPen();
  spawnObstacles();
  spawnSheep();
  setupPointerListeners(canvas);
  gameLoop();

  setInterval(() => {
    spawnWolf();
  }, 6000);
});

window.addEventListener("resize", () => resizeCanvas(canvas));
