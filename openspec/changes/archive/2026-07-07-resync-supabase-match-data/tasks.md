## 1. Generator correctness (code)

- [x] 1.1 In `supabase/generate-seed.mts`, change the `teams` emit to `ON CONFLICT (id) DO UPDATE SET name=excluded.name, "group"=excluded."group", gender=excluded.gender, logo=excluded.logo, color=excluded.color`.
- [x] 1.2 In `supabase/generate-seed.mts`, change the `matches` emit to `ON CONFLICT (id) DO UPDATE SET date=excluded.date, time=excluded.time, team_a=excluded.team_a, team_b=excluded.team_b, logo_a=excluded.logo_a, logo_b=excluded.logo_b, "group"=excluded."group", gender=excluded.gender, status=(case when matches.status='live' then 'live' else excluded.status end), score_a=excluded.score_a, score_b=excluded.score_b, disbanded=excluded.disbanded`.
- [x] 1.3 In `supabase/generate-seed.mts`, change the `standings` emit to `ON CONFLICT (team_id) DO UPDATE SET p=excluded.p, w=excluded.w, d=excluded.d, l=excluded.l, gf=excluded.gf, ga=excluded.ga, gd=excluded.gd, pts=excluded.pts`.
- [x] 1.4 Confirm `goal_events` block already does `delete from goal_events where match_id in (select id from matches where status='finished');` then unguarded inserts — leave unchanged (preserves live goals by scope).
- [x] 1.5 Run `npx tsx supabase/generate-seed.mts` and verify the new `supabase/seed.sql` contains the `DO UPDATE` clauses and reflects the current `tournament.ts` (match 18 not disbanded, finals on 2026-07-12, new match 22 present).

## 2. One-shot resync script

- [x] 2.1 Create `supabase/resync.sql` that begins with `begin;`.
- [x] 2.2 Add a `delete from public.goal_events ge where not exists (select 1 from public.matches m where m.id = ge.match_id);` prune for orphaned events (defensive — for this resync no orphaned `match_id` exists, since IDs were renumbered/reused rather than freed, but the clause is cheap and protects against future drift if a match is ever removed outright).
- [x] 2.3 Append the regenerated `supabase/seed.sql` contents to `resync.sql` so it can be pasted into the Supabase SQL editor in one go (`\i` is not supported in the SQL editor).
- [x] 2.4 Add a header to `resync.sql` dated `<current date>` explaining what it corrects (match 18 disband cleared, finals date moved to 2026-07-12, matches 20–24 renumbered, etc.).
- [x] 2.5 Add an explicit `commit;` at the end.

## 3. AGENTS.md note

- [x] 3.1 Append to the Supabase section in `AGENTS.md`: "After editing `src/data/tournament.ts`, regenerate the seed and re-run it: `npx tsx supabase/generate-seed.mts`, then paste `supabase/seed.sql` (or `supabase/resync.sql` if a match row was deleted) into the Supabase SQL editor. The seed emits `ON CONFLICT (id) DO UPDATE`, so re-running corrects stale rows; it never demotes a `status='live'` match."

## 4. Verification

- [x] 4.1 Review the diff: confirm `supabase/seed.sql` regenerates from the current `tournament.ts` (sanity-check match 18, 22, 25, 26 against the file).
- [x] 4.2 Run `npx tsx supabase/generate-seed.mts` and reverse-run the generator a second time — confirm no functional drift in `supabase/seed.sql` (same set of corrective statements).
- [ ] 4.3 (Owner runs, in Supabase) Paste `supabase/seed.sql` into the SQL editor → Run → verify `select id, date, time, status, disbanded from public.matches where id in ('18','22','25','26') order by id` returns the corrected values.
- [ ] 4.4 (Owner runs, in Supabase) Confirm `select count(*) from public.goal_events` matches the number of `MATCH_EVENTS` entries (27) — i.e. the live-recorded goal(s) if any survived, plus the historical seed.
- [ ] 4.5 (Owner runs, app) Reload the public fixture tab and verify match 18 shows on 2026-07-06 (no DISBAND pill), the finals show on 2026-07-12, and the TableTab shows the 13 corrected standings rows.