import React, { useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import jumpSoundSrc from "./assets/chrome-button-press.ogg";
import nosyFaceSrc from "./assets/nosy-face.svg";
import "./styles.css";

const groundY = 246;
const gravity = 2300;
const jumpVelocity = -760;
const jumpCutVelocity = -260;
const baseSpeed = 360;
const bestKey = "coin-runner-best";
const coinSize = 54;
const colors = {
  screen: "#0000aa",
  ink: "#ffffff",
  bright: "#ffffff",
  muted: "#b9d7ff",
  dim: "#5f8fd8",
  coin: "#ffffff",
  coinDark: "#b9d7ff",
  coinLine: "#b9d7ff",
  cactus: "#00ffff",
  rock: "#c0c0c0",
};

function createGame() {
  return {
    coin: {
      x: 72,
      y: groundY - coinSize,
      width: coinSize,
      height: coinSize,
      vy: 0,
      grounded: true,
      flip: 0,
    },
    clouds: [
      { x: 160, y: 72, speed: 22 },
      { x: 520, y: 46, speed: 18 },
      { x: 780, y: 86, speed: 25 },
    ],
    obstacles: [],
    spawnTimer: 1.35,
    score: 0,
    distance: 0,
    speed: baseSpeed,
    started: false,
    running: true,
    message: "Press Space",
  };
}

function padScore(value) {
  return String(Math.floor(value)).padStart(5, "0");
}

function rectsOverlap(a, b) {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  );
}

function drawCloud(ctx, cloud) {
  ctx.fillStyle = colors.dim;
  ctx.fillRect(cloud.x, cloud.y + 12, 68, 12);
  ctx.fillRect(cloud.x + 12, cloud.y, 18, 18);
  ctx.fillRect(cloud.x + 32, cloud.y + 5, 24, 18);
}

function drawCoin(ctx, game, faceImage) {
  const { coin } = game;
  const centerX = coin.x + coin.width / 2;
  const centerY = coin.y + coin.height / 2;
  const rollAngle = game.distance / 14;
  const faceScale = coin.grounded ? 1 : Math.max(0.16, Math.abs(Math.cos(coin.flip)));
  const radius = coin.width / 2;

  ctx.save();
  ctx.translate(centerX, centerY);
  ctx.scale(faceScale, 1);
  ctx.rotate(coin.grounded ? rollAngle : 0);

  ctx.fillStyle = colors.coinDark;
  ctx.beginPath();
  ctx.arc(2, 2, radius - 1, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = colors.coin;
  ctx.beginPath();
  ctx.arc(0, 0, radius - 2, 0, Math.PI * 2);
  ctx.fill();

  if (faceImage?.complete) {
    ctx.drawImage(faceImage, -17, -17, 34, 34);
  }

  ctx.restore();

  if (!coin.grounded) {
    ctx.fillStyle = colors.coinLine;
    ctx.fillRect(centerX - 3, coin.y - 10, 6, 6);
  }
}

function drawObstacle(ctx, obstacle) {
  ctx.fillStyle = obstacle.type === "cactus" ? colors.cactus : colors.rock;

  if (obstacle.type === "cactus") {
    ctx.fillRect(obstacle.x + 10, obstacle.y, 12, obstacle.height);
    ctx.fillRect(obstacle.x, obstacle.y + 24, 11, 10);
    ctx.fillRect(obstacle.x + 21, obstacle.y + 14, 11, 10);
    ctx.fillRect(obstacle.x + 2, obstacle.y + 18, 8, 22);
    ctx.fillRect(obstacle.x + 22, obstacle.y + 8, 8, 20);
  } else {
    ctx.fillRect(obstacle.x, obstacle.y + 14, obstacle.width, 24);
    ctx.fillRect(obstacle.x + 10, obstacle.y, 24, 18);
  }
}

function drawGround(ctx, game, width) {
  ctx.strokeStyle = colors.ink;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(0, groundY + 1);
  ctx.lineTo(width, groundY + 1);
  ctx.stroke();

  ctx.fillStyle = colors.dim;
  const offset = Math.floor(game.distance % 80);
  for (let x = -offset; x < width; x += 80) {
    ctx.fillRect(x + 18, groundY + 18, 28, 3);
    ctx.fillRect(x + 58, groundY + 34, 14, 3);
  }
}

function drawMessage(ctx, game, width) {
  if (game.started && game.running) return;

  ctx.font = "16px ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace";
  ctx.fillStyle = colors.muted;
  ctx.textAlign = "center";
  ctx.fillText("PRESS SPACE TO CONTINUE _", width / 2, 128);
}

function spawnObstacle(game, width) {
  const tall = Math.random() > 0.45;
  const obstacleWidth = tall ? 30 : 46;
  const height = tall ? 64 : 38;

  game.obstacles.push({
    x: width + obstacleWidth,
    y: groundY - height,
    width: obstacleWidth,
    height,
    type: tall ? "cactus" : "rock",
  });

  const speedFactor = Math.max(0.68, baseSpeed / game.speed);
  game.spawnTimer = (0.95 + Math.random() * 0.7) * speedFactor;
}

function updateGame(game, delta, width, setBestScore) {
  const coin = game.coin;
  game.distance += game.speed * delta;
  game.score = game.distance / 42;
  game.speed = baseSpeed + Math.min(280, game.score * 0.52);
  game.spawnTimer -= delta;

  if (game.spawnTimer <= 0) {
    spawnObstacle(game, width);
  }

  coin.vy += gravity * delta;
  coin.y += coin.vy * delta;

  if (coin.y >= groundY - coin.height) {
    coin.y = groundY - coin.height;
    coin.vy = 0;
    coin.grounded = true;
  } else {
    coin.flip += delta * 13;
    coin.grounded = false;
  }

  for (const cloud of game.clouds) {
    cloud.x -= cloud.speed * delta;
    if (cloud.x < -90) {
      cloud.x = width + Math.random() * 180;
      cloud.y = 42 + Math.random() * 62;
    }
  }

  for (const obstacle of game.obstacles) {
    obstacle.x -= game.speed * delta;
  }

  game.obstacles = game.obstacles.filter((obstacle) => obstacle.x + obstacle.width > -20);

  const coinHitbox = {
    x: coin.x + 8,
    y: coin.y + 8,
    width: coin.width - 16,
    height: coin.height - 16,
  };

  for (const obstacle of game.obstacles) {
    const obstacleHitbox = {
      x: obstacle.x + 4,
      y: obstacle.y + 4,
      width: obstacle.width - 8,
      height: obstacle.height - 4,
    };

    if (rectsOverlap(coinHitbox, obstacleHitbox)) {
      game.running = false;
      game.message = "Game Over";
      const score = Math.floor(game.score);
      setBestScore((currentBest) => {
        const nextBest = Math.max(currentBest, score);
        localStorage.setItem(bestKey, String(nextBest));
        return nextBest;
      });
      break;
    }
  }
}

function drawGame(ctx, game, width, height, faceImage) {
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = colors.screen;
  ctx.fillRect(0, 0, width, height);

  for (const cloud of game.clouds) {
    drawCloud(ctx, cloud);
  }

  drawGround(ctx, game, width);

  for (const obstacle of game.obstacles) {
    drawObstacle(ctx, obstacle);
  }

  drawCoin(ctx, game, faceImage);
  drawMessage(ctx, game, width);
}

function App() {
  const canvasRef = useRef(null);
  const gameRef = useRef(createGame());
  const lastTimeRef = useRef(0);
  const animationRef = useRef(0);
  const faceImageRef = useRef(null);
  const jumpSoundRef = useRef(null);
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState(() => Number(localStorage.getItem(bestKey) || 0));

  const reset = () => {
    gameRef.current = createGame();
    lastTimeRef.current = performance.now();
    setScore(0);
  };

  const jump = () => {
    const game = gameRef.current;

    if (!game.running) {
      reset();
      return;
    }

    game.started = true;
    game.message = "";

    if (game.coin.grounded) {
      game.coin.vy = jumpVelocity;
      game.coin.grounded = false;
      game.coin.flip = Math.PI / 2;

      if (jumpSoundRef.current) {
        jumpSoundRef.current.currentTime = 0;
        jumpSoundRef.current.play().catch(() => {});
      }
    }
  };

  const cutJumpShort = () => {
    const { coin } = gameRef.current;

    if (!coin.grounded && coin.vy < jumpCutVelocity) {
      coin.vy = jumpCutVelocity;
    }
  };

  useEffect(() => {
    const faceImage = new Image();
    faceImage.src = nosyFaceSrc;
    faceImageRef.current = faceImage;

    const jumpSound = new Audio(jumpSoundSrc);
    jumpSound.preload = "auto";
    jumpSoundRef.current = jumpSound;
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    const loop = (now) => {
      const game = gameRef.current;
      const delta = Math.min(0.033, (now - lastTimeRef.current) / 1000 || 0);
      lastTimeRef.current = now;

      if (game.started && game.running) {
        updateGame(game, delta, canvas.width, setBestScore);
        setScore(game.score);
      }

      drawGame(ctx, game, canvas.width, canvas.height, faceImageRef.current);
      animationRef.current = requestAnimationFrame(loop);
    };

    lastTimeRef.current = performance.now();
    animationRef.current = requestAnimationFrame(loop);

    return () => cancelAnimationFrame(animationRef.current);
  }, []);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.code === "Space" || event.code === "ArrowUp") {
        event.preventDefault();
        if (event.repeat) return;
        jump();
      }

      if (event.code === "Enter" && !gameRef.current.running) {
        reset();
      }
    };

    const handleKeyUp = (event) => {
      if (event.code === "Space" || event.code === "ArrowUp") {
        cutJumpShort();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  });

  const handlePointerDown = () => {
    jump();
  };

  const handlePointerUp = () => {
    cutJumpShort();
  };

  return (
    <main
      className="game-shell"
      aria-label="Nosy Run"
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
    >
      <section className="hud" aria-label="Game status">
        <div>
          <span className="label">Score</span>
          <strong>{padScore(score)}</strong>
        </div>
        <div>
          <span className="label">Best</span>
          <strong>{padScore(bestScore)}</strong>
        </div>
      </section>
      <canvas ref={canvasRef} width="900" height="320" aria-label="Nosy Run game canvas" />
    </main>
  );
}

createRoot(document.querySelector("#root")).render(<App />);
