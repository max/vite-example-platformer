# Nosy Run

A small Chrome Dino-style endless runner built with React, Vite, and the Canvas 2D API. The game uses a retro blue-screen/DOS visual style, keyboard and pointer controls, obstacle spawning, collision detection, score tracking, and local best-score storage.

## Requirements

- Node.js 22 or newer
- npm 10 or newer

## Getting Started

Install dependencies:

```sh
npm install
```

Start the Vite development server:

```sh
npm run dev
```

Open the local URL printed by Vite, usually:

```text
http://127.0.0.1:5173/
```

To make the dev server reachable from another device on your network, pass an explicit host and port:

```sh
npm run dev -- --host 0.0.0.0 --port 5173
```

## Controls

- Press `Space` or `ArrowUp` to start and jump.
- Release `Space` or `ArrowUp` early for a shorter jump.
- Tap or click the game on touch and pointer devices.
- Press `Enter` after a game over to restart.

## Available Scripts

```sh
npm run dev
```

Runs the development server.

```sh
npm run build
```

Creates a production build in `dist/`.

```sh
npm run preview
```

Serves the production build locally for a final smoke test.

## Package Manager

This project uses npm. Commit `package-lock.json` with dependency changes so installs stay reproducible:

```sh
npm install
```

Do not use Bun for this project; `bun.lock` is intentionally not part of the npm setup.
