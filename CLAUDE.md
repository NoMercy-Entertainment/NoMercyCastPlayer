# NoMercy Cast Player

Chromecast CAF receiver app for casting music playback.

> **TODO**: This project needs a full rewrite. The current codebase is broken and unreliable. Do not build on top of the existing code - plan a clean implementation from scratch.

## Tech Stack

- TypeScript + Vue 3
- Vite, PostCSS, Tailwind CSS
- Chromecast CAF (Cast Application Framework)

## Conventions

- Files: camelCase
- Vue components: PascalCase
- Path alias: `@/` maps to `src/`

## Rules

- This is a Chromecast receiver. All playback commands come from the sender app via the Cast SDK.
- Keep the bundle small. Chromecast devices have limited resources.
