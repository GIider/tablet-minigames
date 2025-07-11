import { pen } from './pen.js';
import { pointer } from '../input/pointer.js';
import { obstacles } from './obstacles.js';
import { wolves } from './wolf.js';
import { config } from '../config.js';

const {
  sheep: { count, size, speed, repelRadius },
  edgeMargin,
  emojis
} = config;


export let sheep = [];

function isInsideObstacle(x, y) {
  return obstacles.some(o =>
    x > o.x - size &&
    x < o.x + o.size &&
    y > o.y - size &&
    y < o.y + o.size
  );
}

function isInsideBounds(x, y) {
  return (
    x > edgeMargin &&
    x < window.innerWidth - edgeMargin &&
    y > edgeMargin &&
    y < window.innerHeight - edgeMargin
  );
}

export function spawnSheep() {
  sheep = [];
  for (let i = 0; i < count; i++) {
    let attempts = 0;
    let x, y;
    do {
      x = Math.random() * (window.innerWidth - edgeMargin * 2) + edgeMargin;
      y = Math.random() * (window.innerHeight - edgeMargin * 2) + edgeMargin;
      attempts++;
    } while (
      (isInsideObstacle(x, y) || !isInsideBounds(x, y)) &&
      attempts < 100
    );
sheep.push({ x, y, dx: 0, dy: 0, herded: false, eaten: false });
  }
}


export function updateSheep() {
  sheep.forEach(s => {
  if (s.herded || s.eaten) return;

wolves.forEach(w => {
  const dist = Math.hypot(s.x - w.x, s.y - w.y);
  if (dist < 100) {
    const angle = Math.atan2(s.y - w.y, s.x - w.x);
    s.dx += Math.cos(angle) * 1.5;
    s.dy += Math.sin(angle) * 1.5;
  }
});


    s.dx += (Math.random() - 0.5) * 0.2;
    s.dy += (Math.random() - 0.5) * 0.2;

    const mag = Math.hypot(s.dx, s.dy);
    if (mag > speed) {
      s.dx = (s.dx / mag) * speed;
      s.dy = (s.dy / mag) * speed;
    }

    if (pointer.x !== null) {
      const dist = Math.hypot(pointer.x - s.x, pointer.y - s.y);
      if (dist < repelRadius) {
        const angle = Math.atan2(s.y - pointer.y, s.x - pointer.x);
        s.dx += Math.cos(angle) * 0.8;
        s.dy += Math.sin(angle) * 0.8;
      }
    }

    let nextX = s.x + s.dx;
    let nextY = s.y + s.dy;

    const blockedByObstacle = isInsideObstacle(nextX, nextY);
    const outOfBounds = !isInsideBounds(nextX, nextY);

    if (!blockedByObstacle && !outOfBounds) {
      s.x = nextX;
      s.y = nextY;
    } else {
      s.dx *= -0.5;
      s.dy *= -0.5;
    }

    if (
      s.x > pen.x &&
      s.x < pen.x + pen.size &&
      s.y > pen.y &&
      s.y < pen.y + pen.size
    ) {
      s.herded = true;
    }
  });
}


export function drawSheep(ctx) {
  ctx.font = `${size}px serif`;
  sheep.forEach(s => {
    if (!s.herded) {
	ctx.fillText(
  s.eaten ? emojis.meat : emojis.sheep,
  s.x - size / 2,
  s.y + size / 2
);

    }
  });
}

export function resetSheep() {
  spawnSheep();
}
