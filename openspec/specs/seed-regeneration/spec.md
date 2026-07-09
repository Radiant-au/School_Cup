# seed-regeneration

## Purpose

Describes how `supabase/seed.sql` and `supabase/resync.sql` are regenerated from `src/data/tournament.ts` and applied to keep Supabase in sync with the static source of truth. Covers the corrective `ON CONFLICT (id) DO UPDATE` semantics that re-assert existing rows, live-match status/goal preservation during a mid-tournament resync, and the disallowed practice of hand-editing `supabase/seed.sql` directly.

## Requirements

### Requirement: Seed generator emits corrective-on-conflict inserts

`supabase/generate-seed.mts` SHALL emit `INSERT ... ON CONFLICT (id) DO UPDATE SET <all non-PK columns>=excluded.<col>` for the `teams`, `matches`, and `standings` tables. Re-running the generated `supabase/seed.sql` SHALL update every existing row to match the current `tournament.ts`/`squads.ts` exports rather than silently skipping changed rows. The generator SHALL NOT emit `ON CONFLICT (id) DO NOTHING` for those tables.

#### Scenario: Edited match gets updated on re-run

- **WHEN** match 18 in `tournament.ts` is edited to remove `disbanded` and move its date to 2026-07-06, and the owner runs `npx tsx supabase/generate-seed.mts` and pastes the regenerated `supabase/seed.sql` into the Supabase SQL editor
- **THEN** the `matches` row with `id = '18'` is updated to `disbanded = false`, `date = '2026-07-06'`, `time = '4:00 PM'`, and `status = 'scheduled'`.

#### Scenario: New match gets inserted on re-run

- **WHEN** a new match with `id = '22'` (PrE_F vs EcE_F on 2026-07-08 5:00PM) is added to `tournament.ts`
- **THEN** regenerating and re-running the seed inserts a new `matches` row with that data, while pre-existing rows are left intact (or updated if they changed).

#### Scenario: Renumbered match ID is handled

- **WHEN** the old match 20 was deleted from `tournament.ts` and old IDs 21/22 were reassigned to different fixtures
- **THEN** the regenerated seed inserts the new fixtures with ids 20 and 21 under their corrected data, and (combined with `resync.sql`) drops the orphaned old-match-20 row.

### Requirement: Resync preserves live-recorded goal events

`supabase/resync.sql` SHALL NOT delete `goal_events` rows whose `match_id` refers to a match whose status is `live`. It SHALL only delete `goal_events` whose `match_id` no longer exists in the corrected `matches` set, plus the existing delete-finished-then-insert for historical events during seed regeneration.

#### Scenario: Live goal survives a mid-tournament resync

- **WHEN** an admin has recorded 2 goal events on a still-running match 20 (PrE(A) vs CE_M) and the owner then runs `supabase/resync.sql` to correct unrelated match metadata drift
- **THEN** match 20's 2 goal events remain in `goal_events` after the resync, and the derived score continues to read `2 - 0` (or whatever it was).

#### Scenario: Orphaned events for a deleted match are pruned

- **WHEN** the old match 20 (PrE_F vs EcE_F, deleted from `tournament.ts`) has stray `goal_events` rows due to a prior test insert
- **THEN** `supabase/resync.sql` deletes those rows before the corrected seed re-asserts the new matches set, so no orphaned events remain.

### Requirement: Resync never demotes a live match status

The corrective `ON CONFLICT DO UPDATE` for `matches.status` SHALL preserve an existing `'live'` status. The seed generator emits only `'scheduled'` or `'finished'` for `status` (derived from `tournament.ts.finished`); when an updated row's existing `status` in the database is `'live'`, the resync SHALL keep it `'live'` instead of resetting it to the seed value.

#### Scenario: Live match is not reset to scheduled by resync

- **WHEN** a match row in `matches` is currently `status = 'live'` (admin started it) and the owner runs the corrected seed whose `tournament.ts` has that match with `finished: false`
- **THEN** the `ON CONFLICT DO UPDATE` clause leaves `status = 'live'` rather than overwriting it with `'scheduled'`.

### Requirement: Regenerate-then-resync is the supported drift workflow

Editing `tournament.ts` SHALL be the only supported way to change match metadata, and the only path to propagate those changes to Supabase SHALL be: run `npx tsx supabase/generate-seed.mts`, then run the regenerated `supabase/seed.sql` (or `supabase/resync.sql` if a `matches` row was deleted) in the Supabase SQL editor. Hand-editing `supabase/seed.sql` directly SHALL be disallowed.

#### Scenario: Workflow after editing tournament.ts

- **WHEN** the owner edits `tournament.ts` to move the finals date, then runs `npx tsx supabase/generate-seed.mts`
- **THEN** `supabase/seed.sql` is rewritten with the new finals date and `ON CONFLICT (id) DO UPDATE` clauses, ready to paste into the SQL editor.

#### Scenario: Deleted match requires resync.sql, not only seed.sql

- **WHEN** a match was removed from `tournament.ts` (its row no longer exists in the seed) but the row still exists in the live `matches` table
- **THEN** re-running only `supabase/seed.sql` would leave the orphaned match (corrective INSERT does not DELETE); the owner runs `supabase/resync.sql` instead, which deletes the orphan row and its `goal_events` first.