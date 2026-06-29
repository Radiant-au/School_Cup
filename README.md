# School Cup 2026

Tournament tracker for the School Cup 2026 — fixtures, group tables, knockout bracket, and match squads. Built as a static React + Vite app; match and team data lives in `src/data/tournament.ts`.

## Prerequisites

- **Node.js >= 18**
- npm (bundled with Node)

## Setup

```bash
npm install
```

Then copy the env example (optional — defaults work out of the box):

```bash
cp .env.example .env
```

## Environment variables

Both are optional; safe defaults are used when unset.

| Variable    | Default | Description                                             |
| ----------- | ------- | ------------------------------------------------------- |
| `PORT`      | `5173`  | Port for the dev (`npm run dev`) and preview servers.   |
| `BASE_PATH` | `/`     | Base path served from; also drives wouter's `<Router>`. |

An explicitly-set but invalid `PORT` (non-numeric or `<= 0`) will still throw a clear error.

## Scripts

| Command                | Description                                       |
| ---------------------- | ------------------------------------------------- |
| `npm run dev`          | Start the Vite dev server (host `0.0.0.0`).       |
| `npm run build`        | Production build → `dist/public`.                 |
| `npm run serve`        | Preview the production build (`vite preview`).    |
| `npm run typecheck`    | Run `tsc --noEmit`.                               |
| `npm run lint`         | Run ESLint (flat config) over the project.        |
| `npm run format`       | Format all files with Prettier (writes in place). |
| `npm run format:check` | Check formatting without writing (CI-friendly).   |

## Stack & structure

- **React 18** + **Vite 5** + **TypeScript 5**
- **Tailwind CSS v4** (via `@tailwindcss/vite`; theme tokens in `src/index.css`)
- **shadcn/ui** (new-york style, neutral base) — primitives in `src/components/ui`
- **wouter** routing — routes declared in `src/App.tsx`
- **TanStack Query** for data flow
- Feature components grouped by domain under `src/components/` (`fixtures`, `info`, `knockout`, `layout`, `table`)

Dark mode is the default (`class="dark"` on `<html>` in `index.html`).

## Agent guidance

See [`AGENTS.md`](./AGENTS.md) for conventions and gotchas relevant to AI-assisted work in this repo.
