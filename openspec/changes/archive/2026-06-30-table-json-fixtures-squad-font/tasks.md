## 1. Editable Standings Data

- [x] 1.1 Add `StandingEntry` interface to `src/data/tournament.ts` with fields: `teamId`, `p`, `w`, `d`, `l`, `gf`, `ga`, `gd`, `pts`.
- [x] 1.2 Add `STANDINGS: StandingEntry[]` array to `tournament.ts` with one entry per team (all stats initially 0).
- [x] 1.3 Update `TableTab.tsx` to read stats from `STANDINGS` instead of `generateInitialTable()`, matching by `teamId`.
- [x] 1.4 Remove the `generateInitialTable()` function from `TableTab.tsx`.

## 2. Finished Match Display

- [x] 2.1 In `FixtureTab.tsx` `MatchCard`, remove the time display when `isFinished` is true.
- [x] 2.2 Increase the score font size from `text-3xl` to `text-4xl` for finished matches.

## 3. Dynamic Today

- [x] 3.1 Replace `const TODAY = "2026-06-29"` in `FixtureTab.tsx` with `const TODAY = new Date().toISOString().slice(0, 10)`.

## 4. Myanmar Font Support

- [x] 4.1 Add Padauk font import to `src/index.css` (Google Fonts, weights 400 and 700).
- [x] 4.2 Add `--font-myanmar: "Padauk", sans-serif` to the `@theme inline` block in `index.css`.
- [x] 4.3 Add Padauk preconnect and link tags to `index.html`.
- [x] 4.4 In `MatchSquad.tsx`, replace `font-barlow` with `font-myanmar` on player name elements.
- [x] 4.5 Remove `tracking-wide` from player name elements in `MatchSquad.tsx`.
- [x] 4.6 Change `leading-tight` to `leading-normal` on player name elements in `MatchSquad.tsx`.

## 5. Verification

- [x] 5.1 Run `npm run typecheck` and fix any type errors.
- [x] 5.2 Run `npm run lint` and fix any lint violations.
- [x] 5.3 Run `npm run build` and verify the build succeeds.
