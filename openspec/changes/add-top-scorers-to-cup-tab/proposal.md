## Why

The "Cup" tab currently only shows knockout/finals cards, but there is no way to see which players are leading the tournament in goals. A top scorers view already exists as an un-integrated component (`TopScorersTab.tsx` at repo root) importing `TOP_SCORERS_MALE` / `TOP_SCORERS_FEMALE` / `Scorer` exports that do not yet exist in `src/data/tournament.ts`. We need real goal-scorer data and a live top scorers view to give the Cup tab meaningful, fan-facing content beyond the finals cards.

## What Changes

- Add a `Scorer` interface and hand-curated `TOP_SCORERS_MALE` / `TOP_SCORERS_FEMALE` arrays to `src/data/tournament.ts`, reflecting the real goals recorded in `MATCH_EVENTS` (cross-referenced with `SQUADS` for player name, number, AND `profile_string_link` photo, split by team gender).
- Move `TopScorersTab.tsx` from the repo root into `src/components/scorers/TopScorersTab.tsx` and refactor it to REUSE existing project patterns instead of duplicating: replace its local `TeamCrest` with the shared `@/components/shared/TeamCrest` (which already renders the team `logo`), and replace its football-placeholder avatar with the real player profile photo via `cloudinary()` + `profile_string_link` (the same pattern `MatchSquad.PlayerCard` uses), falling back to `@/assets/football.svg` only when no photo URL exists or the image errors.
- **BREAKING**: The bottom-nav tab currently labelled "Cup" with the `Trophy` icon (id `knockout`) is renamed to **"Scorers"** with the **`Goal`** icon (id changed to `scorers`), and it renders `TopScorersTab` instead of `KnockoutTab`. `KnockoutTab.tsx` is removed.
- Update `src/pages/Home.tsx` to render `TopScorersTab` for the `scorers` tab, and update `src/components/layout/MobileLayout.tsx` bottom-nav entry (id, label, icon).

## Capabilities

### New Capabilities
- `top-scorers`: Hand-curated per-player goal-scorer dataset and a top scorers view presented inside the Cup tab, with male/female toggle, ranked cards, and a player preview modal.

### Modified Capabilities
<!-- Existing capabilities whose REQUIREMENTS are changing. -->
- `match-goals`: Goal-scorer data now lives as first-class hand-curated arrays exported from `tournament.ts` (in addition to the existing `MATCH_EVENTS` stream), so the top-scorers view can render authoritative totals.

## Impact

- **Data layer** (`src/data/tournament.ts`): new `Scorer` interface and two exported scorer arrays; no change to `MATCH_EVENTS`/`MATCHES`/`STANDINGS` shapes.
- **Components**: new `src/components/scorers/TopScorersTab.tsx` (moved from repo root); `src/components/knockout/KnockoutTab.tsx` deleted.
- **Routing** (`src/pages/Home.tsx`): the Cup tab swaps `KnockoutTab` for `TopScorersTab`. The shared `TeamCrest`/`getTeamName` helpers are reused.
- **Assets**: TopScorersTab must use the resolved `@/assets/football.svg` instead of the missing `@assets/image_1782741719591.png`.
- **No new dependencies**; reuses framer-motion, lucide-react, and existing UI primitives.