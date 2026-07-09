## Why

`src/data/tournament.ts` is the human-curated source of truth for match metadata (teams, dates, times, IDs, disbandments, finals schedule). It was recently updated with the real current tournament data: match 18 is no longer disbanded and moved to 2026-07-06, the finals moved from 2026-07-10 to 2026-07-12, a deleted match caused downstream IDs to be renumbered, and a new match was added. The Supabase tables still hold the previous seed, which `supabase/seed.sql` generated before these edits — so the public app and admin panel are now showing stale match metadata.

The deeper bug: `supabase/seed.sql` (as currently generated) uses `ON CONFLICT (id) DO NOTHING` for `teams`, `matches`, and `standings`. That is *safe to re-run* (idempotent for inserts) but **not corrective** — re-running it against the live database silently leaves the stale match 18 still disbanded, the finals still on the 10th, the deleted match 20 still present, and match IDs still off-by-one. Fixing each drift by hand with ad-hoc `UPDATE`s is error-prone and risks wiping any admin-recorded live goals.

## What Changes

- **Regenerate `supabase/seed.sql`** from the current `tournament.ts`/`squads.ts` so the file reflects the real match schedule, statuses, disbandments, and the live `MATCH_EVENTS` history.
- **Make the seed generator corrective-on-conflict**: change the `INSERT`s it emits for `teams`, `matches`, and `standings` from `ON CONFLICT (id) DO NOTHING` to `ON CONFLICT (id) DO UPDATE SET <all non-PK columns>` so future re-runs repair stale rows instead of skipping them. `goal_events` keeps its existing delete-finished-then-insert strategy so it never clobbers admin-recorded live goals on unfinished matches.
- **Add `supabase/resync.sql`**, a single idempotent script the owner runs once in the Supabase SQL editor to bring the live tables in line with the corrected data, while preserving any `goal_events` rows on matches whose status is not `finished` (live goals survive a mid-tournament re-sync).
- **Document the re-sync workflow** so future `tournament.ts` edits funnel through `npx tsx supabase/generate-seed.mts` → re-run `supabase/seed.sql`, instead of ad-hoc SQL.
- **BREAKING**: none to runtime behavior. The `ON CONFLICT DO UPDATE` change only affects the seed/resync scripts (run by a Supabase dashboard user), not the browser client.

## Capabilities

### New Capabilities
- `seed-regeneration`: the workflow + SQL semantics that keep `supabase/seed.sql` the post-migration source of truth for matches/teams/standings metadata — generator emits corrective-on-conflict inserts, re-running updates stale rows, and a `resync.sql` one-shot updates the live database while preserving live-recorded goals.

### Modified Capabilities
<!-- None. `supabase-match-state` and `match-goals` requirements (derived scores, undo = DELETE, admin write auth) are unchanged. This change only affects the data/seed pipeline, not runtime behavior. -->

## Impact

- **`supabase/generate-seed.mts`** — switch the emits for `teams`/`matches`/`standings` from `do nothing` to `do update set ...`; keep the `goal_events` delete-finished-then-insert logic.
- **`supabase/seed.sql`** — regenerated from current `tournament.ts` with the new `do update` clauses.
- **`supabase/resync.sql`** — new, idempotent one-shot resync script that re-applies the corrected metadata and prunes `goal_events` for matches that no longer exist in `tournament.ts` (e.g. the deleted match 20) while protecting live goals on unfinished retained matches.
- **`AGENTS.md`** — extend the existing Supabase section with a one-line "to bring Supabase back in sync after editing `tournament.ts`, regenerate the seed and re-run `supabase/seed.sql` (corrective-on-conflict)" note.
- **No `src/` changes** — no hooks, components, or hooks change behavior; the app keeps reading from Supabase as before, just with corrected metadata.
- **Security**: the resync scripts run as the Supabase dashboard user (effectively service role in the SQL editor), not a browser; RLS for the anon/authenticated browser client is unchanged.