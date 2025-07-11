import { config } from '../config.js';
import { sheep } from './sheep.js';

const { emojis, wolf: wolfCfg } = config;
const { size: wolfSize, speed: wolfSpeed, eatDistance } = wolfCfg;

export let wolves = [];

function randomEdgeSpawn() {
  const fromLeftOrRight = Math.random() > 0.5;
  const fromTop = Math.random() > 0.5;

  const x = fromLeftOrRight
    ? (Math.random() > 0.5 ? -wolfSize : window.innerWidth + wolfSize)
    : Math.random() * window.innerWidth;

  const y = !fromLeftOrRight
    ? (fromTop ? -wolfSize : window.innerHeight + wolfSize)
    : Math.random() * window.innerHeight;

  return { x, y };
}

export function spawnWolf() {
  const pos = randomEdgeSpawn();
  wolves.push({
    ...pos,
    dx: 0,
    dy: 0,
    target: null,
    dead: false,
    alpha: 1,
    state: "spawning",
    stateSince: Date.now()
  });
}

function findClosestSheep(wolf) {
  let closest = null;
  let closestDist = Infinity;

  for (const s of sheep) {
    if (s.herded || s.eaten) continue;

    const dist = Math.hypot(wolf.x - s.x, wolf.y - s.y);
    if (dist < closestDist) {
      closestDist = dist;
      closest = s;
    }
  }

  return closest;
}

export function updateWolves() {
  const now = Date.now();

  wolves.forEach(wolf => {
    if (wolf.dead) {
      wolf.alpha -= 0.01;
      return;
    }

    switch (wolf.state) {
      case "spawning": {
        // After a short delay, start hunting
        if (now - wolf.stateSince > 1000) {
          wolf.state = "hunting";
          wolf.stateSince = now;
        }
        break;
      }

      case "hunting": {
        if (!wolf.target || wolf.target.herded || wolf.target.eaten) {
          wolf.target = findClosestSheep(wolf);
        }

        if (wolf.target) {
          const dx = wolf.target.x - wolf.x;
          const dy = wolf.target.y - wolf.y;
          const dist = Math.hypot(dx, dy);

          if (dist > 0) {
            wolf.dx = (dx / dist) * wolfSpeed;
            wolf.dy = (dy / dist) * wolfSpeed;
          }

          wolf.x += wolf.dx;
          wolf.y += wolf.dy;

          if (dist < eatDistance) {
            wolf.target.eaten = true;
            wolf.target = null;
            wolf.dx = 0;
            wolf.dy = 0;
            wolf.state = "eating";
            wolf.stateSince = now;
          }
        }
        break;
      }

      case "eating": {
        if (now - wolf.stateSince > 3000) {
          wolf.state = "hunting";
          wolf.stateSince = now;
        }
        break;
      }
    }
  });
}

export function drawWolves(ctx) {
  ctx.font = `${wolfSize}px serif`;

  wolves.forEach(w => {
    if (w.dead) {
      ctx.globalAlpha = w.alpha;
      ctx.fillText(emojis.dead, w.x - wolfSize / 2, w.y + wolfSize / 2);
      ctx.globalAlpha = 1.0;
    } else {
      ctx.fillText(emojis.wolf, w.x - wolfSize / 2, w.y + wolfSize / 2);
    }
  });

  // Filter out faded dead wolves
  wolves = wolves.filter(w => !w.dead || w.alpha > 0);
}

export function killWolfAt(x, y) {
  wolves.forEach(w => {
    if (
      !w.dead &&
      x > w.x - wolfSize / 2 &&
      x < w.x + wolfSize / 2 &&
      y > w.y - wolfSize / 2 &&
      y < w.y + wolfSize / 2
    ) {
      w.dead = true;
      w.alpha = 1;
      w.dx = 0;
      w.dy = 0;
      w.target = null;
      w.state = "dead";
    }
  });
}

export function resetWolves() {
  wolves.length = 0;
}
