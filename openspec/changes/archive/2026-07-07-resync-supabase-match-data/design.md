## Context

The School Cup app reads match/standings/scorer data from Supabase; `tournament.ts` (and `squads.ts`) remain the human-curated source for team/squad metadata and the *historical* fixtures/standings snapshot. The seed generator `supabase/generate-seed.mts` and the generated `supabase/seed.sql` migrate that static data into the Supabase tables (`teams`, `matches`, `standings`, `goal_events`).

`tournament.ts` is the thing a human edits when the real-world schedule changes. After each edit, the Supabase tables must catch up. The previous implementation ships seed INSERTs that are *safe to re-run* (`ON CONFLICT (id) DO NOTHING`) but **not corrective** — so re-running them against an already-stale database leaves the old values in place. Concretely, the current live database is stale in these ways:

- Match 18 (`IS_F vs PrE_F`) was seeded as `disbanded = true` on 2026-07-04; the real schedule now has it as a normal scheduled match on 2026-07-06 at 4:00 PM (disband flag cleared).
- The old match 20 (`PrE_F vs EcE_F` on 2026-07-06 5:00PM) was deleted; downstream IDs after it were renumbered (old 21→20, old 22→21), and a *new* match 22 (`PrE_F vs EcE_F` on 2026-07-08 5:00PM) was added.
- Matches 19, 23, 24 had their time/date edited.
- The finals (25, 26) moved from 2026-07-10 to 2026-07-12.

Re-running the current `seed.sql` would change none of that. A second, subtler risk: deleting a match that no longer exists in `tournament.ts` (the old match 20) would, if dropped from `matches`, orphan any `goal_events` rows referencing its `match_id` — but the deleted match was never played, so there are no live goals to protect there. For *retained* matches whose status is `live` (mid-match admin recording), the resync must preserve their `goal_events`.

Constraints:
- Runs as a Supabase dashboard SQL session (effectively service role), not the browser. RLS is not a concern for the resync itself.
- `goal_events` for *finished* historical matches are regenerated from `MATCH_EVENTS` (already the existing strategy: `delete from goal_events where match_id in (select id from matches where status='finished'); insert ...`), so correcting the historical snapshot is supported.
- `goal_events` for *unfinished* (live/scheduled) matches must be left untouched — those are admin-recorded live data.
- No `src/` runtime changes; the browser client continues to read via the existing TanStack Query hooks.

## Goals / Non-Goals

**Goals:**
- Bring `supabase/seed.sql` back in sync with current `tournament.ts` in one generation + run.
- Change the generator's emitted ON CONFLICT clause to be corrective (`DO UPDATE SET ...`) for `teams`/`matches`/`standings`, so future edits to `tournament.ts` flow through `regenerate → re-run seed.sql` automatically.
- Deliver a one-shot `supabase/resync.sql` that the owner runs after the steroid edit, which:
  1. updates `teams`/`matches`/`standings` to the corrected values;
  2. drops `matches` rows that no longer exist in the corrected data (old match 20);
  3. prunes any `goal_events` rows referencing those dropped matches (no live goals existed for them, so they were either pre-seed bugs or accidental test data);
  4. preserves `goal_events` on *retained* matches whose status is not `finished`.
- Delete + re-insert *historical* `goal_events` for finished matches from `MATCH_EVENTS`, so any prior mis-seed there is corrected too.
- Document the workflow in `AGENTS.md`.

**Non-Goals:**
- No change to live-match scoring, undo, or auth behavior (covered by `supabase-match-state`/`admin-auth`).
- No editing of historical finished-match scores from the admin UI (still write-once on Finish Match).
- No automatic scheduled re-sync; the owner runs the script manually after editing `tournament.ts`.
- No `src/` code changes — the resync is a data-only fix.
- No snapshotting standby teams (`TBD`) — they remain in `tournament.ts`/`matches` as placeholders.

## Decisions

### Decision 1: Generate with `ON CONFLICT (id) DO UPDATE SET ...`

For `teams`, `matches`, and `standings`, `supabase/generate-seed.mts` emits INSERTs like:

```sql
insert into public.matches (id, date, time, ...) values (...) on conflict (id) do update set date=excluded.date, time=excluded.time, team_a=excluded.team_a, ..., disbanded=excluded.disbanded;
```

This makes the seed **both** insertive and corrective, so re-running it after a `tournament.ts` edit repairs every row to match the new source. This is safe because `tournament.ts` is authoritative for these tables.

**Why not `DO NOTHING` (status quo):** rejected — silently leaves stale rows, which is the bug being fixed.
**Why not a separate `UPDATE.sql`:** doubles the SQL surface and the merge of insert+update is what `ON CONFLICT DO UPDATE` already does natively.

### Decision 2: `goal_events` keeps delete-finished + insert, preserves live goals

The historical-event strategy is unchanged from the previous change: `delete from goal_events where match_id in (select id from matches where status='finished');` then `insert` each `MATCH_EVENTS` row. Crucially this only touches *finished* matches, so live goals recorded by an admin during an in-progress match are never touched.

**Why not delete-all-then-insert for `goal_events`:** wipes live admin goals on any unfinished match — unacceptable.
**Why not `ON CONFLICT DO UPDATE` for `goal_events`:** the historical seed has no server-generated `id`/`created_at` to upsert on (PK is a fresh uuid), and we don't want to clobber the live `created_at` ordering used by the goal log. Delete-finished + insert is the minimal-and-correct scope.

### Decision 3: `resync.sql` wraps "drop deleted matches + prune orphaned goals" before re-running the seed

`supabase/resync.sql` is a one-shot (safe and idempotent) that:
1. Deletes `goal_events` rows whose `match_id` no longer appears in the corrected `matches` set (handles the deleted old-match-20 case).
2. Deletes from `matches` any row whose `id` is no longer in the regenerated seed set (`delete from matches where id not in (...)`).
3. Triggers the seed-generator-emitted corrective insert for `teams`/`matches`/`standings`/`goal_events`.

In practice, since `seed.sql` is corrective, `resync.sql` is simply: `delete orphans` then `\i seed.sql`. We'll write it as a self-contained file that pastes in the seed after a `delete from matches where id not in (...)` block, so it can be pasted into the SQL Editor in one shot without shell `\i` (which isn't supported there).

### Decision 4: Keep `tournament.ts` edits going through the generator, never hand-edit `seed.sql`

The generator is the only path from `tournament.ts` to `seed.sql`. Hand-editing `seed.sql` would diverge from the source-of-truth and break the next regeneration. `AGENTS.md` is updated with this rule.

## Risks / Trade-offs

- **Re-running the seed against a mid-tournament DB has deadline risk:** if the owner runs `resync.sql` while an admin is recording goals on a *retained* live match, the seed only touches finished matches' events — the live goals are not deleted. → Safe. The seed transaction is short; a recorded goal mid-resync either commits before or after the delete-finished block, and either way it remains because its status is `live`, not `finished`.
- **Dropping a deleted match's orphaned `goal_events` is destructive.** → Mitigated: the matches being dropped (the old match 20) were never played nor seeded with real goals; deleting their events just removes stray/test rows.
- **`ON CONFLICT DO UPDATE` could in principle overwrite admin edits to `matches` rows** (e.g. an admin who manually set `status='live'` from the SQL editor would be reset to `scheduled` by a resync that re-asserts `tournament.ts`). → This is intentional: `matches.status` is driven by the admin's Start/Finish actions, but those updates land via the browser using RLS, not the SQL editor; the seed only resets `status` to `'scheduled'`/'`finished'` for *historical* rows where `tournament.ts` is authoritative. **Mitigation:** the seed generator sets `status` from `m.finished` only (scheduled vs. finished), never emits `'live'` — so it never clobbers a live status, because there is no `finished: true` for a live match in `tournament.ts`. The corrected current data has no live match, so this is not a concern for this resync. We'll guard the generator so `status` is only ever set to `'scheduled'` or `'finished'`, preserving a row that was set `'live'` if any — implemented by emitting `case when excluded.status='live' then 'live' else excluded.status end` in the DO UPDATE, ensuring a resync never demotes a live match.
- **Mistakes in the generator → wrong live DB.** → Mitigated by idempotency and a manual review step (the resync.sql file is composable, each section is wrapped in an explicit transaction).
- **Column-list maintenance.** → Listing every column in `DO UPDATE SET` is verbose but explicit and TypeScript-safe (the generator is the source). Adding a new column later requires editing the generator once, not hand-editing the seed.