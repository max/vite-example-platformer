# Dino Runner Project Summary

## Origin

This project started as a local experiment to build a small clone of the Google Chrome offline dinosaur runner. The initial goal was to get a minimal playable platformer running quickly, then shape it into a more polished React/Vite app.

## Goals

- Build a minimal Chrome Dino-style runner locally.
- Keep the first version small, fast, and easy to iterate on.
- Port the static prototype to a React + Vite app.
- Make the game reachable over Tailscale by binding the dev server to all interfaces.
- Tune the physics toward the feel of the original Chrome Dino runner.
- Apply an old MS-DOS-inspired theme, later shifted toward a blue-screen-of-death visual style.

## Work Completed

- Created a React + Vite app using Bun as the available local JavaScript runtime.
- Implemented a canvas-based endless runner with:
  - Player jump physics
  - Variable-height jump release behavior
  - Moving ground
  - Clouds
  - Random obstacle spawning
  - Collision detection
  - Score and best-score tracking
  - Restart behavior
  - Keyboard and button controls
- Tuned gameplay so the runner waits for the first jump before moving.
- Adjusted speed ramping, obstacle timing, and jump feel.
- Added a two-frame running animation for the dino while grounded.
- Styled the app with a retro BSOD/DOS-inspired look:
  - Solid blue screen background
  - White terminal-style text and borders
  - Square system-style buttons
  - Blue/white/cyan/gray canvas palette
- Added `.gitignore` entries for generated dependencies and build output.
- Verified the production build with `bun run build`.

## Tech Stack

- React
- Vite
- Bun
- Canvas 2D API
- Plain CSS

## Running Locally

Install dependencies:

```sh
bun install
```

Start the development server:

```sh
bun run dev -- --host 0.0.0.0 --port 5173
```

Build for production:

```sh
bun run build
```

## Notes

Node and npm were not available in the local shell, so Bun was used for package installation, builds, and the Vite development server.
