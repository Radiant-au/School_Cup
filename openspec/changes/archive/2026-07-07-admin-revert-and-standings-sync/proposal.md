## Why

The `fifaOwner` admin panel can record and undo goals live, but the undo fires **immediately** on a single tap with no confirmation — an accidental tap silently deletes a goal. There is also no way to revert a started/finished match back to `scheduled`, so the admin cannot re-test the real-time goal flow end-to-end. Finally, the public **standings table is a static snapshot**: finishing a match does not update it, so the Female group-stage table is stale even as female matches complete (the Male groups A/B are already final and must not be touched).

## What Changes

- **Undo-goal confirmation**: replace the immediate `DELETE` on `goal_events` with a two-step confirmation dialog that shows the scorer's name, number, and team before deleting. The revert mechanism stays a `DELETE` on `goal_events` (live, not deferred until finish).
- **Match-status revert**: add a "Revert to Scheduled" control on the admin live-match screen, available when a match is `live` or `finished`. Reverting sets `matches.status='scheduled'`, clears `score_a`/`score_b` to `null`, and deletes that match's `goal_events` rows — yielding a clean slate for re-testing the real-time flow. Guarded by its own confirmation dialog.
- **Standings auto-sync (Female group only)**: when a `group='Female'` group-stage match transitions to or from `finished`, recompute the Female group's `standings` rows from the set of currently-finished female matches (using `score_a`/`score_b` snapshots) and upsert them. Male groups (A/B) are never recomputed (already final; respects any manual adjustments). Knockout groups (`Semi-final`, `Final`, `Bronze Final`) never affect standings.
- **RLS policy addition (BREAKING-adjacent)**: add an `UPDATE` policy on `public.standings` for `authenticated` users only, so the admin client can upsert recomputed rows. Today `standings` is read-only even for authenticated users.
- **One-time backfill**: recompute the Female group standings once against already-finished female matches, so the public table is correct before any new match finishes.

## Capabilities

### New Capabilities

- `admin-revert-controls`: Admin-side revert UX on the live-match screen — confirmation-gated undo of a single goal event, and confirmation-gated revert of a match (`live`/`finished` → `scheduled`) that clears scores and the match's goal events. Covers the dialogs, the Supabase mutations, and the post-mutation cache invalidation.

### Modified Capabilities

- `editable-standings`: Standings are no longer purely a manually-edited snapshot. For the Female group, standings rows are auto-recomputed from finished matches on Finish/Revert and upserted into the `standings` table; male groups remain a static snapshot. Adds the authenticated `UPDATE` policy requirement on `standings`.

## Impact

- **Affected code**:
  - `src/pages/admin/AdminLiveMatch.tsx` — add undo-confirmation dialog state + match-revert control + revert handler; call standings recompute on Finish and on Revert for female matches.
  - `src/pages/admin/AdminFixtures.tsx` — no structural change (Start Match flow unchanged), but `MatchRow` may show a "Revert" affordance on `finished` rows as a convenience (optional, see design).
  - `src/lib/supabase.ts` — add a `recomputeStandingsForGroup(groupId)` helper (reads finished matches in the group, computes P/W/D/L/GF/GA/GD/PTS, upserts `standings`).
  - `src/hooks/useStandings.ts` — no change (already realtime-subscribed); benefits from the new `UPDATE` policy indirectly.
- **Supabase schema/policies**:
  - `supabase/policies.sql` — add `standings_update` policy for `authenticated` (and re-run in the SQL editor).
  - No `schema.sql` change needed for standings (table already exists); the `standings` table stays read-from by the public.
- **Prerequisite (not part of this change)**: `supabase/schema.sql` currently has an unquoted `group` column that fails to create on a fresh database. That must be fixed (`"group"`) and applied before any of this change's mutations are exercised. Tracked separately.
- **Dependencies**: none new. Uses existing `@supabase/supabase-js`, TanStack Query, framer-motion, and the shadcn-style dialog patterns already in `AdminLiveMatch.tsx`.
- **Security**: the new `standings` `UPDATE` policy is scoped to `authenticated` only; anon remains read-only. Recomputation is deterministic and derived from finished-match snapshots, so a compromised admin account can only re-derive (not invent) standings values for the Female group.
- **Non-goals**: no public-UI redesign of the standings table (`standings-table-redesign` spec owns that); no changes to male-group standings; no Postgres RPC function (recompute is client-side, matching the existing admin-write pattern); no archive of the `supabase-admin-auth-live-scores` change.
