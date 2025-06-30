const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const successMessage = document.getElementById("success-message");

const carImage = new Image();
carImage.src = "carro.png";
const parkedCarImage = new Image();
parkedCarImage.src = "carro2.png";

const playerCar = {
  x: 100, y: 250, width: 45, height: 80,
  angle: 0, speed: 0,
  maxSpeed: 3, acceleration: 0.05, deceleration: 0.02, turnSpeed: 0.03
};

let currentLevel = 0;

const staticParkedCars = [
  // LINHA 1
  { x: 180, y: 100, width: 45, height: 80, angle: 0 },
  { x: 380, y: 100, width: 45, height: 80, angle: 0 },
  { x: 580, y: 100, width: 45, height: 80, angle: 0 },
  // LINHA 2
  { x: 180, y: 200, width: 45, height: 80, angle: 0 },
  // { x: 380, y: 200, width: 45, height: 80, angle: 0 }, // <- Vaga do 1º nível
  { x: 580, y: 200, width: 45, height: 80, angle: 0 },
  // LINHA 3
  { x: 180, y: 300, width: 45, height: 80, angle: 0 },
  // { x: 380, y: 300, width: 45, height: 80, angle: 0 }, // vaga livre pro 3º nível
  { x: 580, y: 300, width: 45, height: 80, angle: 0 },
  // LINHA 4
  { x: 180, y: 400, width: 45, height: 80, angle: 0 },
  { x: 380, y: 400, width: 45, height: 80, angle: 0 },
  { x: 580, y: 400, width: 45, height: 80, angle: 0 },
  // CANTO DIREITO
  { x: 750, y: 100, width: 45, height: 80, angle: 0 },
  { x: 750, y: 200, width: 45, height: 80, angle: 0 },
  // { x: 750, y: 400, width: 45, height: 80, angle: 0 }, // vaga do 3º nível, removida
];

const levels = [
  { parkingSpot: { x: 380, y: 200, width: 60, height: 100, angle: 0 } },
  { parkingSpot: { x: 750, y: 200, width: 60, height: 100, angle: 0 } },
  { parkingSpot: { x: 380, y: 300, width: 60, height: 100, angle: 0 } }
];

const keys = { ArrowUp: false, ArrowDown: false, ArrowLeft: false, ArrowRight: false };
document.addEventListener('keydown', e => { if (keys.hasOwnProperty(e.key)) keys[e.key] = true; });
document.addEventListener('keyup', e => { if (keys.hasOwnProperty(e.key)) keys[e.key] = false; });

function drawRotatedImage(img, x, y, width, height, angle) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);
  ctx.drawImage(img, -width / 2, -height / 2, width, height);
  ctx.restore();
}

function rectsCollide(r1, r2) {
  return (
    r1.x < r2.x + r2.width &&
    r1.x + r1.width > r2.x &&
    r1.y < r2.y + r2.height &&
    r1.y + r1.height > r2.y
  );
}

function update() {
  if (keys.ArrowUp) {
    playerCar.speed = Math.min(playerCar.speed + playerCar.acceleration, playerCar.maxSpeed);
  } else if (keys.ArrowDown) {
    playerCar.speed = Math.max(playerCar.speed - playerCar.acceleration, -playerCar.maxSpeed / 2);
  } else {
    playerCar.speed *= 0.98;
  }

  if (keys.ArrowLeft) playerCar.angle -= playerCar.turnSpeed * playerCar.speed;
  if (keys.ArrowRight) playerCar.angle += playerCar.turnSpeed * playerCar.speed;

  const nextX = playerCar.x + Math.sin(playerCar.angle) * playerCar.speed;
  const nextY = playerCar.y - Math.cos(playerCar.angle) * playerCar.speed;

  const futureRect = {
    x: nextX - playerCar.width / 2,
    y: nextY - playerCar.height / 2,
    width: playerCar.width,
    height: playerCar.height
  };

  let collided = false;
  for (const car of staticParkedCars) {
    const parkedRect = {
      x: car.x - car.width / 2,
      y: car.y - car.height / 2,
      width: car.width,
      height: car.height
    };
    if (rectsCollide(futureRect, parkedRect)) {
      collided = true;
      break;
    }
  }

  if (!collided) {
    playerCar.x = nextX;
    playerCar.y = nextY;
  } else {
    playerCar.speed = 0;
  }

  playerCar.x = Math.max(playerCar.width / 2, Math.min(canvas.width - playerCar.width / 2, playerCar.x));
  playerCar.y = Math.max(playerCar.height / 2, Math.min(canvas.height - playerCar.height / 2, playerCar.y));

  const level = levels[currentLevel];
  const positionTolerance = 30;
  const angleTolerance = 0.4;
  const speedTolerance = 0.1;

  if (
    Math.abs(playerCar.x - level.parkingSpot.x) < positionTolerance &&
    Math.abs(playerCar.y - level.parkingSpot.y) < positionTolerance &&
    Math.abs(playerCar.angle - level.parkingSpot.angle) < angleTolerance &&
    Math.abs(playerCar.speed) < speedTolerance
  ) {
    if (currentLevel < levels.length - 1) {
      currentLevel++;
      resetGame();
    } else {
      successMessage.style.display = 'block';
    }
  }
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#2a3a4a';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 2;

  for (let y = 100; y <= 400; y += 100) {
    for (let x = 180; x <= 750; x += 200) {
      ctx.strokeRect(x - 30, y - 50, 60, 100);
    }
  }

  staticParkedCars.forEach(car => {
    drawRotatedImage(parkedCarImage, car.x, car.y, car.width, car.height, car.angle);
  });

  const level = levels[currentLevel];
  ctx.setLineDash([5, 5]);
  ctx.strokeStyle = '#4CAF50';
  ctx.strokeRect(
    level.parkingSpot.x - level.parkingSpot.width / 2,
    level.parkingSpot.y - level.parkingSpot.height / 2,
    level.parkingSpot.width,
    level.parkingSpot.height
  );
  ctx.setLineDash([]);

  drawRotatedImage(carImage, playerCar.x, playerCar.y, playerCar.width, playerCar.height, playerCar.angle);
}

function gameLoop() {
  update();
  draw();
  requestAnimationFrame(gameLoop);
}

function resetGame() {
  playerCar.speed = 0;
}

function restartGame() {
  currentLevel = 0;
  successMessage.style.display = "none";
  playerCar.x = 100;
  playerCar.y = 250;
  playerCar.angle = 0;
  playerCar.speed = 0;
}

carImage.onload = () => parkedCarImage.onload = () => gameLoop();
