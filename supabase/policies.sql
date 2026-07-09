-- School Cup 2026 — Row Level Security policies
-- Run after schema.sql.  Keeps the publishable/anon key safe to ship in the
-- browser: anonymous visitors can READ everything but write nothing; only
-- authenticated admin users (Supabase Auth session) can mutate.

-- teams: read for anon + authenticated. No writes from the client.
drop policy if exists "teams_select" on public.teams;
create policy "teams_select"
  on public.teams
  for select
  to anon, authenticated
  using (true);

-- matches: read for anon + authenticated; update for authenticated (status
-- transitions and final-score snapshot written by the admin).
drop policy if exists "matches_select" on public.matches;
create policy "matches_select"
  on public.matches
  for select
  to anon, authenticated
  using (true);

drop policy if exists "matches_update" on public.matches;
create policy "matches_update"
  on public.matches
  for update
  to authenticated
  using (true)
  with check (true);

-- goal_events: read for anon + authenticated; insert + delete for
-- authenticated (record a goal / undo a goal).
drop policy if exists "goal_events_select" on public.goal_events;
create policy "goal_events_select"
  on public.goal_events
  for select
  to anon, authenticated
  using (true);

drop policy if exists "goal_events_insert" on public.goal_events;
create policy "goal_events_insert"
  on public.goal_events
  for insert
  to authenticated
  with check (true);

drop policy if exists "goal_events_delete" on public.goal_events;
create policy "goal_events_delete"
  on public.goal_events
  for delete
  to authenticated
  using (true);

-- standings: read for anon + authenticated; update for authenticated only
-- (the admin recomputes Female-group rows on Finish/Revert; anon stays read-only).
drop policy if exists "standings_select" on public.standings;
create policy "standings_select"
  on public.standings
  for select
  to anon, authenticated
  using (true);

drop policy if exists "standings_update" on public.standings;
create policy "standings_update"
  on public.standings
  for update
  to authenticated
  using (true)
  with check (true);

-- ---------------------------------------------------------------------------
-- Manual verification (do not commit the output, just sanity-check):
--   1. anon INSERT into goal_events -> rejected by RLS.
--   2. anon SELECT from goal_events  -> returns rows.
--   3. authenticated admin INSERT   -> succeeds.
--   4. anon UPDATE on standings     -> rejected; authenticated UPDATE -> succeeds.
-- ---------------------------------------------------------------------------