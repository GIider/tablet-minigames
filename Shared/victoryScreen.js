export function showVictoryScreen({
  message = "🎉 You Win!",
  duration = 3000,
  onComplete = () => {},
  type = "win" // "win" or "lose"
} = {}) {
  const screen = document.getElementById("victoryScreen");
  const canvas = document.getElementById("confettiCanvas");
  const ctx = canvas.getContext("2d");
  const skipButton = document.getElementById("skipVictory");

  if (!screen || !canvas) {
    console.warn("Victory screen or canvas element not found.");
    onComplete();
    return;
  }

  let W = canvas.width = window.innerWidth;
  let H = canvas.height = window.innerHeight;
  let hasEnded = false;

  // Particle setup
  const particles = Array.from({ length: 100 }, () => ({
    x: Math.random() * W,
    y: type === "win" ? Math.random() * H - H : Math.random() * H,
    r: Math.random() * 6 + 4,
    d: Math.random() * 100 + 50,
    color:
      type === "win"
        ? `hsl(${Math.random() * 360}, 100%, 50%)`
        : `rgba(80,80,80,${Math.random() * 0.6 + 0.2})`,
    tilt: Math.random() * 10 - 5,
    tiltAngleIncremental: Math.random() * 0.07 + 0.05,
    tiltAngle: 0,
    emoji: type === "win" ? null : ["💀", "🥀", "☁️"][Math.floor(Math.random() * 3)]
  }));

  // Show screen and set message
  screen.style.display = "flex";
  const messageElement = document.getElementById("victoryMessage");
  if (messageElement) {
    messageElement.textContent = message;
  }

  const draw = () => {
    ctx.clearRect(0, 0, W, H);
    ctx.font = "30px serif";

    particles.forEach(p => {
      if (type === "win") {
        ctx.beginPath();
        ctx.lineWidth = p.r;
        ctx.strokeStyle = p.color;
        ctx.moveTo(p.x + p.tilt + p.r / 2, p.y);
        ctx.lineTo(p.x + p.tilt, p.y + p.tilt + p.r / 2);
        ctx.stroke();
      } else {
        ctx.globalAlpha = 0.6;
        ctx.fillText(p.emoji, p.x, p.y);
        ctx.globalAlpha = 1;
      }
    });

    update();
  };

  const update = () => {
    particles.forEach(p => {
      p.tiltAngle += p.tiltAngleIncremental;

      if (type === "win") {
        p.y += (Math.cos(p.d) + 3 + p.r / 2) / 2;
        p.x += Math.sin(p.d);
        p.tilt = Math.sin(p.tiltAngle - p.d / 3) * 15;

        if (p.y > H) {
          p.y = -10;
          p.x = Math.random() * W;
        }
      } else {
        p.y -= 0.3; // float up
        if (p.y < -30) {
          p.y = H + Math.random() * 20;
          p.x = Math.random() * W;
        }
      }
    });
  };

  const animId = setInterval(draw, 30);

  function endVictoryScreen() {
    if (hasEnded) return;
    hasEnded = true;
    clearInterval(animId);
    screen.style.display = "none";
    onComplete();
  }

  screen.onclick = endVictoryScreen;
  if (skipButton) skipButton.onclick = endVictoryScreen;

  setTimeout(endVictoryScreen, duration);
}
