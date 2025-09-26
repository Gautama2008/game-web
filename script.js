(() => {
  const levelSelect = document.getElementById('level-select');
  const gameScreen = document.getElementById('game');
  const finishScreen = document.getElementById('finish-screen');
  const finalScoreEl = document.getElementById('final-score');
  const backBtn = document.getElementById('btn-back');
  const scoreboard = document.getElementById('scoreboard');
  const canvas = document.getElementById('gameCanvas');
  const ctx = canvas.getContext('2d');
  const jumpBtn = document.getElementById('jump-button');

  // Resize canvas to fit screen width dynamically
  function resizeCanvas() {
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
  }
  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();

  const levels = {
    1: {scoreGoal: 10, obstacleSpeed: 5, label: 'Easy'},
    2: {scoreGoal: 15, obstacleSpeed: 7, label: 'Normal'},
    3: {scoreGoal: 20, obstacleSpeed: 10, label: 'Medium'},
    4: {scoreGoal: 25, obstacleSpeed: 13, label: 'Hard'},
    5: {scoreGoal: 30, obstacleSpeed: 18, label: 'Extreme'}
  };

  const character = {
    x: 50,
    y: 0,
    radius: 20,
    color: '#fff',
    vy: 0,
    gravity: 0.6,
    jumpForce: -12,
    isJumping: false,
  };

  let obstacles = [];
  let frameCount = 0;
  let score = 0;
  let currentLevel = 1;
  let gameOver = false;

  function drawCharacter() {
    const c = character;
    ctx.fillStyle = c.color;
    ctx.beginPath();
    ctx.arc(c.x, c.y, c.radius, 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    ctx.ellipse(c.x - 8, c.y - 30, 5, 12, Math.PI / 8, 0, Math.PI * 2);
    ctx.ellipse(c.x + 8, c.y - 30, 5, 12, -Math.PI / 8, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.arc(c.x - 6, c.y - 5, 3, 0, Math.PI * 2);
    ctx.arc(c.x + 6, c.y - 5, 3, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#ff6666';
    ctx.beginPath();
    ctx.moveTo(c.x, c.y + 3);
    ctx.lineTo(c.x - 4, c.y + 10);
    ctx.lineTo(c.x + 4, c.y + 10);
    ctx.closePath();
    ctx.fill();
  }

  class Obstacle {
    constructor(speed) {
      this.width = 20 + Math.random() * 20;
      this.height = 20 + Math.random() * 30;
      this.x = canvas.width + this.width;
      this.y = canvas.height - this.height - 20;
      this.color = '#e74c3c';
      this.speed = speed;
    }
    update() {
      this.x -= this.speed;
    }
    draw() {
      ctx.fillStyle = this.color;
      ctx.fillRect(this.x, this.y, this.width, this.height);
    }
  }

  function isColliding(circle, rect) {
    let distX = Math.abs(circle.x - rect.x - rect.width / 2);
    let distY = Math.abs(circle.y - rect.y - rect.height / 2);

    if (distX > (rect.width / 2 + circle.radius)) return false;
    if (distY > (rect.height / 2 + circle.radius)) return false;

    if (distX <= (rect.width / 2)) return true;
    if (distY <= (rect.height / 2)) return true;

    let dx = distX - rect.width / 2;
    let dy = distY - rect.height / 2;
    return (dx * dx + dy * dy <= (circle.radius * circle.radius));
  }

  function gameLoop() {
    if (gameOver) return;

    frameCount++;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#27ae60';
    ctx.fillRect(0, canvas.height - 20, canvas.width, 20);

    character.vy += character.gravity;
    character.y += character.vy;

    if (character.y > canvas.height - 60) {
      character.y = canvas.height - 60;
      character.vy = 0;
      character.isJumping = false;
    }

    drawCharacter();

    if (frameCount % 90 === 0) {
      obstacles.push(new Obstacle(levels[currentLevel].obstacleSpeed));
    }

    for (let i = obstacles.length - 1; i >= 0; i--) {
      obstacles[i].update();
      obstacles[i].draw();

      if (isColliding(character, obstacles[i])) {
        gameOver = true;
        showFinish(false);
      }

      if (obstacles[i].x + obstacles[i].width < 0) {
        obstacles.splice(i, 1);
        score++;
        scoreboard.textContent = `Score: ${score}`;
        if (score >= levels[currentLevel].scoreGoal) {
          gameOver = true;
          showFinish(true);
        }
      }
    }

    requestAnimationFrame(gameLoop);
  }

  function jump() {
    if (!character.isJumping) {
      character.vy = character.jumpForce;
      character.isJumping = true;
    }
  }

  function showFinish(win) {
    gameScreen.style.display = 'none';
    finishScreen.style.display = 'flex';

    if (win) {
      finalScoreEl.textContent = `You finished Level ${currentLevel} (${levels[currentLevel].label}) with score: ${score}`;
      finishScreen.querySelector('h1').textContent = 'Level Completed! 🎉';
    } else {
      finalScoreEl.textContent = `You hit an obstacle! Score: ${score}`;
      finishScreen.querySelector('h1').textContent = 'Game Over 😢';
    }
  }

  function startGame(level) {
    currentLevel = level;
    score = 0;
    frameCount = 0;
    gameOver = false;
    obstacles = [];
    character.x = 50;
    character.y = canvas.height - 60;
    character.vy = 0;
    character.isJumping = false;
    scoreboard.textContent = `Score: 0`;

    levelSelect.style.display = 'none';
    finishScreen.style.display = 'none';
    gameScreen.style.display = 'flex';

    resizeCanvas();
    gameLoop();
  }

  document.querySelectorAll('.level-button').forEach(btn => {
    btn.addEventListener('click', () => {
      const lvl = parseInt(btn.dataset.level);
      startGame(lvl);
    });
  });

  backBtn.addEventListener('click', () => {
    finishScreen.style.display = 'none';
    levelSelect.style.display = 'flex';
  });

  window.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
      e.preventDefault();
      jump();
    }
  });

  canvas.addEventListener('click', () => jump());
  jumpBtn.addEventListener('click', () => jump());
})();
