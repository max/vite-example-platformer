import React, { useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";

const groundY = 246;
const gravity = 2300;
const jumpVelocity = -760;
const jumpCutVelocity = -260;
const baseSpeed = 360;
const bestKey = "dino-runner-best";
const colors = {
  screen: "#0000aa",
  ink: "#ffffff",
  bright: "#ffffff",
  muted: "#b9d7ff",
  dim: "#5f8fd8",
  cactus: "#00ffff",
  rock: "#c0c0c0",
};

function createGame() {
  return {
    dino: {
      x: 72,
      y: groundY - 54,
      width: 46,
      height: 54,
      vy: 0,
      grounded: true,
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

function drawDino(ctx, game) {
  const { dino } = game;
  const runningFrame = game.started && game.running && dino.grounded
    ? Math.floor(game.distance / 32) % 2
    : 0;

  ctx.fillStyle = colors.ink;
  ctx.fillRect(dino.x + 10, dino.y + 12, 24, 31);
  ctx.fillRect(dino.x + 22, dino.y, 25, 24);
  ctx.fillRect(dino.x + 41, dino.y + 7, 8, 7);
  ctx.fillRect(dino.x + 4, dino.y + 30, 10, 9);
  ctx.fillRect(dino.x, dino.y + 20, 12, 5);

  if (dino.grounded) {
    if (runningFrame === 0) {
      ctx.fillRect(dino.x + 12, dino.y + 43, 8, 13);
      ctx.fillRect(dino.x + 30, dino.y + 43, 8, 8);
      ctx.fillRect(dino.x + 34, dino.y + 51, 13, 5);
    } else {
      ctx.fillRect(dino.x + 12, dino.y + 43, 8, 8);
      ctx.fillRect(dino.x, dino.y + 51, 20, 5);
      ctx.fillRect(dino.x + 30, dino.y + 43, 8, 13);
    }
  } else {
    ctx.fillRect(dino.x + 12, dino.y + 43, 8, 12);
    ctx.fillRect(dino.x + 30, dino.y + 43, 8, 12);
  }

  ctx.fillStyle = colors.screen;
  ctx.fillRect(dino.x + 37, dino.y + 7, 4, 4);
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

  ctx.fillStyle = colors.bright;
  ctx.font = "700 28px ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace";
  ctx.textAlign = "center";
  ctx.fillText(game.message, width / 2, 116);

  ctx.font = "16px ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace";
  ctx.fillStyle = colors.muted;
  ctx.fillText("PRESS SPACE TO CONTINUE _", width / 2, 144);
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
  const dino = game.dino;
  game.distance += game.speed * delta;
  game.score = game.distance / 42;
  game.speed = baseSpeed + Math.min(280, game.score * 0.52);
  game.spawnTimer -= delta;

  if (game.spawnTimer <= 0) {
    spawnObstacle(game, width);
  }

  dino.vy += gravity * delta;
  dino.y += dino.vy * delta;

  if (dino.y >= groundY - dino.height) {
    dino.y = groundY - dino.height;
    dino.vy = 0;
    dino.grounded = true;
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

  const dinoHitbox = {
    x: dino.x + 8,
    y: dino.y + 6,
    width: dino.width - 14,
    height: dino.height - 10,
  };

  for (const obstacle of game.obstacles) {
    const obstacleHitbox = {
      x: obstacle.x + 4,
      y: obstacle.y + 4,
      width: obstacle.width - 8,
      height: obstacle.height - 4,
    };

    if (rectsOverlap(dinoHitbox, obstacleHitbox)) {
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

function drawGame(ctx, game, width, height) {
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

  drawDino(ctx, game);
  drawMessage(ctx, game, width);
}

function App() {
  const canvasRef = useRef(null);
  const gameRef = useRef(createGame());
  const lastTimeRef = useRef(0);
  const animationRef = useRef(0);
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

    if (game.dino.grounded) {
      game.dino.vy = jumpVelocity;
      game.dino.grounded = false;
    }
  };

  const cutJumpShort = () => {
    const dino = gameRef.current.dino;

    if (!dino.grounded && dino.vy < jumpCutVelocity) {
      dino.vy = jumpCutVelocity;
    }
  };

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

      drawGame(ctx, game, canvas.width, canvas.height);
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

  return (
    <main className="game-shell" aria-label="Dino Runner">
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
      <canvas ref={canvasRef} width="900" height="320" aria-label="Dino runner game canvas" />
      <div className="controls">
        <button type="button" onClick={jump}>Jump</button>
        <button type="button" className="restart-button" onClick={reset}>Restart</button>
      </div>
    </main>
  );
}

createRoot(document.querySelector("#root")).render(<App />);
