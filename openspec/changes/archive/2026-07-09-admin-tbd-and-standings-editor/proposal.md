## Why

The knockout/final matches ship with `TBD` placeholder teams seeded from `tournament.ts` (the male final's `team_b`, the female final's `team_a`/`team_b`). Once the semifinals are decided, the admin has no way to set the actual finalists from the admin site — it has to be hand-edited in `tournament.ts` and re-seeded into Supabase. Separately, the `standings` table is auto-recomputed only for the Female group on finish/revert; male groups are a seeded snapshot, and there is no admin UI to correct any row (male or female) when the snapshot drifts or a correction is needed. Both gaps push the owner out of the admin panel and into SQL/seed edits during a live tournament.

## What Changes

- Add an admin control to assign a real team to each `TBD` side of a knockout match (Semi-final / Final / Bronze Final). The admin picks a team from `TEAMS` (gender-appropriate) for each `TBD` slot; the `matches` row's `team_a`/`team_b`/`logo_a`/`logo_b` is updated in place, and the public fixture list and match page reflect the assignment in real time.
- Add an editable standings table to the admin site. Each `standings` row's `p`/`w`/`d`/`l`/`gf`/`ga`/`gd`/`pts` can be edited and saved. This is a manual correction path that coexists with the existing Female auto-recompute (finish/revert) and gives the admin control over male-group rows that are otherwise a frozen snapshot.
- Reuse the existing authenticated `UPDATE` RLS policies on `matches` and `standings` — no new tables, no schema changes, and (expected) no policy changes; the design phase verifies this.

## Capabilities

### New Capabilities

- `admin-knockout-assignment`: Admin can assign a real team to each `TBD` side of a knockout match (`Semi-final`, `Final`, `Bronze Final`) by updating the `matches` row's `team_a`/`team_b`/`logo_a`/`logo_b`. Covers when the control is shown (only for `TBD` slots in knockout matches), the team picker (gender-filtered `TEAMS`), and the realtime reflection in public views.

### Modified Capabilities

- `editable-standings`: Add a requirement that an authenticated admin can manually edit any `standings` row's `p`/`w`/`d`/`l`/`gf`/`ga`/`gd`/`pts` from the admin site. This is a manual override path independent of the Female auto-recompute (which still runs on finish/revert) and is the only mutation path for male-group rows. The existing "male rows are not recomputed by the system" requirement is unchanged — admin manual edit is not a system recompute.

## Impact

- **Admin UI**: `src/pages/admin/AdminFixtures.tsx` (or a new admin section) gains the TBD-assignment control; a new editable standings view is added (likely under `src/components/table/` or a new admin standings page). `AdminLiveMatch.tsx` is unaffected.
- **Data layer**: `src/lib/supabase.ts` may gain small helpers (`updateMatchTeams`, `updateStandingRow`); the existing `useMatches`/`useStandings` realtime hooks already cover public refresh.
- **RLS/policies**: `supabase/policies.sql` — verify authenticated `UPDATE` on `matches` covers `team_a`/`team_b`/`logo_*` and authenticated `UPDATE` on `standings` covers all stat columns. Expected to need no change (the `admin-revert-and-standings-sync` change already added `standings_update` and matches already allow authenticated UPDATE). Design confirms.
- **No schema changes**: `matches.team_a/team_b/logo_a/logo_b` and all `standings` columns already exist.
- **Realtime**: `matches` and `standings` are already in `supabase_realtime`; assignments/edits surface on the public app without a rebuild.
