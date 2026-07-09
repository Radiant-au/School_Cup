## 1. Supabase schema, seed, and RLS

- [x] 1.1 Create `supabase/schema.sql` with `teams`, `matches`, `goal_events`, `standings` tables per design (column types, PKs, `gen_random_uuid()` for `goal_events.id`, `created_at timestamptz default now()`).
- [x] 1.2 Enable `row level security` on all four tables.
- [x] 1.3 Write `supabase/policies.sql`: anon + authenticated `SELECT` on all tables; `INSERT`/`DELETE` on `goal_events` for `authenticated` only; `UPDATE` on `matches` for `authenticated` only.
- [x] 1.4 Generate `supabase/seed.sql` from the existing `TEAMS`, `MATCHES`, `STANDINGS`, and `MATCH_EVENTS` exports in `src/data/tournament.ts` (idempotent `on conflict (id) do nothing`).
- [ ] 1.5 Run schema + policies + seed against the Supabase project via the SQL editor (or `supabase db push`).
- [ ] 1.6 Create the admin user in the Supabase Auth dashboard (email + password) — record credentials out of repo.
- [ ] 1.7 Manually verify RLS: an anonymous `INSERT` into `goal_events` is rejected; an anonymous `SELECT` succeeds.

## 2. Supabase client + typed helpers

- [x] 2.1 Add typed row types (`MatchRow`, `GoalEventRow`, `TeamRow`, `StandingRow`) to `src/lib/supabase.ts` matching the schema.
- [x] 2.2 Confirm `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` are read in `src/lib/supabase.ts` and that the client instantiates with the anon key only (no service role).
- [ ] 2.3 Add a quick smoke read (`supabase.from('matches').select().limit(1)`) in a throwaway check and confirm rows return.

## 3. Admin auth (login, session, guard, sign-out)

- [x] 3.1 Create `src/hooks/useAdminSession.ts` subscribing via `supabase.auth.onAuthStateChange` + initial `getSession()`, exposing `{ session, loading }`.
- [x] 3.2 Create `src/pages/admin/AdminLogin.tsx` with email+password form: calls `supabase.auth.signInWithPassword`, shows errors, disables submit while loading, redirects to `/fifaOwner` on success, redirects already-authenticated visitors to `/fifaOwner`.
- [x] 3.3 Create `src/lib/admin-auth-guard.tsx` (`AdminAuthGuard`) that renders children when `session` exists, the loading state while `loading`, and redirects to `/fifaOwner/login` otherwise.
- [x] 3.4 Register `/fifaOwner/login` route in `src/App.tsx`; wrap the `/fifaOwner` and `/fifaOwner/match/:id` routes with `AdminAuthGuard`.
- [x] 3.5 Replace the `LogOut` icon button in `AdminFixtures.tsx` with a real sign-out handler calling `supabase.auth.signOut()` then navigating to `/fifaOwner/login`.
- [ ] 3.6 Verify: visiting `/fifaOwner` while logged out shows login; reloading `/fifaOwner/match/2` while logged in stays; sign-out returns to login.

## 4. Public data hooks (Supabase reads + realtime)

- [x] 4.1 Create `src/hooks/useMatches.ts` returning all `matches` rows via TanStack Query, subscribing to `postgres_changes` on `matches` and invalidating `['matches']` on any change.
- [x] 4.2 Create `src/hooks/useGoalEvents.ts` taking `matchId`, returning `goal_events` for that match, subscribing to `postgres_changes` filtered by `match_id`, invalidating `['goal_events', matchId]`.
- [x] 4.3 Create `src/hooks/useStandings.ts` returning the `standings` rows, realtime-invalidated.
- [x] 4.4 Create `src/hooks/useTopScorers.ts` deriving male/female top scorers from `goal_events` joined with `SQUADS` (player name/number/photo) at read time; realtime-invalidate on `goal_events` changes.
- [x] 4.5 Ensure all hooks use `refetchOnReconnect` and `refetchOnWindowFocus` (TanStack Query defaults) and that subscriptions are cleaned up on unmount.

## 5. Public pages wired to Supabase

- [x] 5.1 `src/pages/MatchSquad.tsx`: replace `MATCHES` lookup with `useMatches`, replace `MATCH_EVENTS` filter with `useGoalEvents(match.id)`; keep `SQUADS` import for player lists.
- [x] 5.2 `src/components/fixtures/FixtureTab.tsx`: replace `MATCHES`/team imports with `useMatches` + `TEAMS` (metadata) lookup.
- [x] 5.3 `src/components/table/TableTab.tsx`: replace `STANDINGS` import with `useStandings`.
- [x] 5.4 `src/components/scorers/TopScorersTab.tsx`: replace `TOP_SCORERS_MALE/FEMALE` with `useTopScorers(gender)`.
- [x] 5.5 `src/pages/Home.tsx`: switch any direct `MATCHES`/event/standings imports to the new hooks.
- [x] 5.6 Remove now-unused `MATCH_EVENTS`, `STANDINGS`, `TOP_SCORERS_*` imports from `src/`; leave the exports in `tournament.ts` marked `@deprecated` (pre-migration seed only).

## 6. Admin fixtures list (real data)

- [x] 6.1 In `AdminFixtures.tsx`, remove `MOCK_DATES`/`MOCK_MATCHES`; source the date list and per-date matches from `useMatches`.
- [x] 6.2 Map Supabase `matches` rows to the existing `MatchSummary` shape (status: scheduled | live | finished derived from `finished` + presence of live flag; team names from `TEAMS` metadata).
- [x] 6.3 Fix navigation: change `/admin/match/:id` → `/fifaOwner/match/:id` in `handleStart` and the row click handler.
- [ ] 6.4 Implement "Start Match" as an `UPDATE matches SET finished=false` (status live) — confirm via `useMatches` realtime that the public FixtureTab shows LIVE without a reload.

## 7. Admin live match (real scores + undo + finish)

- [x] 7.1 In `AdminLiveMatch.tsx`, remove `MOCK_MATCH`/`getMockMatch`; load match + teams from `useMatches` and players from `SQUADS[teamA.id]`/`SQUADS[teamB.id]`.
- [x] 7.2 Replace local `events` state with `useGoalEvents(matchId)`; compute `scoreA`/`scoreB` and `goalCounts` from the returned rows.
- [x] 7.3 `handleScore`: `supabase.from('goal_events').insert({ match_id, team_id, player_id, player_number, player_name })`; surface insert errors via toast; disable the +1 button while in flight.
- [x] 7.4 `handleUndo`: `supabase.from('goal_events').delete().eq('id', eventId)`; hide the undo control when `finished=true`.
- [x] 7.5 Sort the goal log by `created_at desc` (server timestamp); confirm newest appears on top.
- [x] 7.6 `handleFinish`: `UPDATE matches SET finished=true, score_a=<derived>, score_b=<derived>`; navigate to `/fifaOwner`; confirm undo controls disappear.
- [x] 7.7 Fix navigation: change `/admin` → `/fifaOwner` in back/finish handlers.
- [ ] 7.8 Verify two-admin-device behavior: a goal recorded on device A appears on device B's live-match screen within the realtime window.

## 8. Verification, lint, typecheck

- [x] 8.1 `npm run typecheck` passes with zero errors.
- [x] 8.2 `npm run lint` passes with zero errors (fix any unused-import warnings from the migration).
- [x] 8.3 `npm run build` succeeds and outputs to `dist/public`.
- [ ] 8.4 Manual end-to-end: login → start match → record 2 goals (different players) → verify public MatchSquad + score update live → undo one → verify score drops to 1 → finish match → verify FULL TIME state on public view.
- [ ] 8.5 Verify anonymous RLS: in a fresh incognito tab, public pages load and show live data; attempting a write from the browser console is rejected.
- [x] 8.6 Update `AGENTS.md` (or a note in `supabase/README.md`) stating `supabase/seed.sql` is the post-migration source of truth and `tournament.ts` is the pre-migration seed only.
