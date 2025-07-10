export function showVictoryScreen({ message = "🎉 You Win!", duration = 3000, onComplete = () => {} } = {}) {
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

  const particles = Array.from({ length: 100 }, () => ({
    x: Math.random() * W,
    y: Math.random() * H - H,
    r: Math.random() * 6 + 4,
    d: Math.random() * 100 + 50,
    color: `hsl(${Math.random() * 360}, 100%, 50%)`,
    tilt: Math.random() * 10 - 5,
    tiltAngleIncremental: Math.random() * 0.07 + 0.05,
    tiltAngle: 0
  }));

  // Show screen and set message
  screen.style.display = "flex";
  const messageElement = document.getElementById("victoryMessage");
  if (messageElement) {
    messageElement.textContent = message;
  }

  const draw = () => {
    ctx.clearRect(0, 0, W, H);
    particles.forEach(p => {
      ctx.beginPath();
      ctx.lineWidth = p.r;
      ctx.strokeStyle = p.color;
      ctx.moveTo(p.x + p.tilt + p.r / 2, p.y);
      ctx.lineTo(p.x + p.tilt, p.y + p.tilt + p.r / 2);
      ctx.stroke();
    });
    update();
  };

  const update = () => {
    particles.forEach(p => {
      p.tiltAngle += p.tiltAngleIncremental;
      p.y += (Math.cos(p.d) + 3 + p.r / 2) / 2;
      p.x += Math.sin(p.d);
      p.tilt = Math.sin(p.tiltAngle - p.d / 3) * 15;

      if (p.y > H) {
        p.y = -10;
        p.x = Math.random() * W;
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
