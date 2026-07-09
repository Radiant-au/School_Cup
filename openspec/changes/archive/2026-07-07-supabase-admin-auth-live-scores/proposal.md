## Why

The `fifaOwner` admin panel is currently unauthenticated and runs entirely on mock data — fixtures, players, scores, and goal events never reach the public app. Fans see scores only after a rebuild/deploy, and the admin "Start Match" / "Finish Match" actions mutate local component state that is discarded on navigation. We need the admin to be the single source of truth for live match state, with goal events (who scored) persisted to Supabase and reflected on the public site in real time, plus a reliable way to undo a misrecorded goal.

## What Changes

- **Admin authentication**: gate the `/fifaOwner` and `/fifaOwner/match/:id` routes behind Supabase email+password auth. Add a login screen and a session guard; redirect unauthenticated users to login and provide sign-out.
- **Live score recording**: replace `AdminLiveMatch.tsx` mock state with Supabase-backed goal events. Tapping a player inserts a goal event row; the score and goal log read from Supabase and update in real time.
- **Scorer identity per goal**: every goal event stores `matchId`, `teamId`, `playerId`, `playerNumber`, `playerName`, and a server timestamp — so the public "who scored" views (squad, top scorers) can be derived from the same rows.
- **Undo / revert**: an undo action on each goal event row deletes that exact event from Supabase, recomputing score and player goal counts. (Distinct from "Finish Match", which is still irreversible.)
- **Public realtime reads**: Home, MatchSquad, FixtureTab, TableTab, and TopScorersTab read matches, events, and derived standings/scorers from Supabase and subscribe to changes so live updates appear without a page reload.
- **Seed from existing real data**: migrate the current `TEAMS`, `MATCHES`, `SQUADS`, `STANDINGS`, and existing `MATCH_EVENTS` from `tournament.ts` / `squads.ts` into Supabase tables as the initial dataset.
- **Route fix**: align admin navigation (`AdminFixtures` navigates to `/admin/match/:id`, `AdminLiveMatch` navigates to `/admin`) with the registered `/fifaOwner` routes — these currently point at non-existent routes.
- **BREAKING**: the public app's source of truth for matches, events, standings, and scorers moves from static `tournament.ts` arrays to Supabase. The static arrays remain only as the seed source and offline fallback for teams/squads metadata.

## Capabilities

### New Capabilities
- `admin-auth`: Supabase email+password authentication gating the `fifaOwner` admin routes, with login screen, session persistence, and sign-out.
- `supabase-match-state`: Supabase-backed live match state — goal events with scorer identity, live score derivation, match status transitions (scheduled → live → finished), and per-event undo.
- `realtime-public-reads`: public pages subscribe to Supabase tables (matches, goal_events) and re-render on changes without a page reload.

### Modified Capabilities
- `match-goals`: goal events move from the static `MATCH_EVENTS` array in `tournament.ts` to the Supabase `goal_events` table; squad view and top-scorers aggregation read live from Supabase. The `{ matchId, teamId, playerId }` contract is preserved (extended with scorer name/number/timestamp).

## Impact

- **New dependency**: `@supabase/supabase-js` (already installed). No other deps added.
- **New env vars**: `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY` (already in `.env`/`.env.example`).
- **New Supabase schema**: tables `matches`, `goal_events`, `teams`, `standings`; RLS policies (public read, admin-auth write); a SQL migration/seed file under `supabase/`.
- **Affected code**:
  - `src/lib/supabase.ts` (exists) — extend with typed query helpers.
  - `src/pages/admin/AdminFixtures.tsx`, `src/pages/admin/AdminLiveMatch.tsx` — replace mock data with Supabase reads/writes; add auth guard.
  - New: `src/pages/admin/AdminLogin.tsx`, `src/hooks/useAdminSession.ts`, `src/hooks/useGoalEvents.ts`, `src/hooks/useMatches.ts`, `src/lib/admin-auth-guard.tsx`.
  - `src/pages/MatchSquad.tsx`, `src/components/fixtures/FixtureTab.tsx`, `src/components/table/TableTab.tsx`, `src/components/scorers/TopScorersTab.tsx`, `src/pages/Home.tsx` — switch from static imports to Supabase-backed hooks.
  - `src/App.tsx` — add `/fifaOwner/login` route and wrap admin routes in the auth guard.
- **Existing data**: `src/data/tournament.ts` and `src/data/squads.ts` are retained as the seed source and as a fallback for team/squad metadata that is not edited live; the `MATCH_EVENTS`, `STANDINGS`, `TOP_SCORERS_*` exports become deprecated once Supabase is the source of truth.
- **Security**: RLS must allow anonymous read of all public tables and restrict writes (insert/update/delete on `goal_events` and `matches` status changes) to authenticated admin users only.
- **No backend service**: all realtime via Supabase client subscriptions; no new server to host.
