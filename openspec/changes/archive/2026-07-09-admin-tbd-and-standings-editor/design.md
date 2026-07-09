## Context

The admin site (`/fifaOwner`) currently drives live matches: `AdminFixtures` lists matches by date and starts them; `AdminLiveMatch` records goals, finishes, and reverts. Two gaps remain:

1. **Knockout TBD slots**: the Finals (and any future Bronze Final) are seeded with `team_a`/`team_b` = `"TBD"` in `tournament.ts` and mirrored into the `matches` table. As semifinals conclude, the admin has no in-app way to set the actual finalists — it requires editing `tournament.ts` and re-running the seed. The `matches` table already has `team_a`/`team_b`/`logo_a`/`logo_b` columns, and the `matches_update` RLS policy (`for update to authenticated using (true) with check (true)`) already permits authenticated updates of those columns, so the only missing piece is UI.
2. **Standings corrections**: the `standings` table is auto-recomputed for the Female group on finish/revert (`recomputeStandingsForGroup`); male groups (`A`, `B`) are a frozen seeded snapshot. There is no admin UI to correct any row when the snapshot drifts or a manual fix is needed. The `standings_update` RLS policy already permits authenticated updates of all stat columns.

Public reads flow through `useMatches` / `useStandings` (TanStack Query + `supabase_realtime`), so any admin write surfaces on the public app without a rebuild. `TEAMS` (static, in `tournament.ts`) is the source of team metadata (id, name, gender, logo) used to populate the picker and resolve logos on assignment.

## Goals / Non-Goals

**Goals:**
- Admin can assign a real team to each `TBD` side of a **scheduled** knockout match (Semi-final / Final / Bronze Final) from within `AdminFixtures`, with the logo resolved automatically.
- Admin can edit any `standings` row's `p`/`w`/`d`/`l`/`gf`/`ga` from a new admin standings view; `gd` and `pts` are derived on save.
- Both writes are authenticated, realtime-reflected on the public app, and require no schema or RLS policy changes.

**Non-Goals:**
- Auto-deriving finalists from semifinal winners (no bracket-wiring; the bracket is seeded, and the admin may want manual control). The male final's `teamA` was set this way manually.
- Editing `gd`/`pts` directly (kept derived to stay consistent with `recomputeStandingsForGroup`).
- Editing standings for a female row *while* its match is being finished (the finish-recompute may overwrite; manual edits are expected between matches).
- Assigning teams to non-knockout or already-live/finished matches (teams are immutable once a match is live, consistent with "finish is irreversible").

## Decisions

### Decision 1: TBD assignment is an inline per-side control in `AdminFixtures.MatchRow`
For a `scheduled` knockout match, render a tappable affordance on each side (the `TBD` label, or the team name to re-pick). Tapping opens a bottom-sheet team picker (reusing the framer-motion sheet pattern from `AdminLiveMatch`'s finish/undo dialogs) listing `TEAMS` filtered by the match's `gender`. Selecting a team calls `matches.update({ team_[a|b]: id, logo_[a|b]: logo }).eq("id", matchId)` and invalidates the `matches` query key.

**Why inline vs. a dedicated "Set finalists" form**: inline keeps the match in context, is faster for a single admin on mobile, and reuses the existing `MatchRow`. **Why gender-filtered**: prevents assigning a female team to the male final. **Why only when `scheduled`**: once live/finished, teams are immutable (matches the existing irreversibility rule); the control is hidden otherwise.

*Alternatives considered:* (a) auto-derive finalists from semifinal results — rejected, no bracket wiring and the data has no female semifinal; (b) a separate "Knockout bracket" admin page — rejected, over-built for ~3 TBD slots.

### Decision 2: Editable standings is a new route `/fifaOwner/standings` with a per-row bottom-sheet editor
Add `AdminStandings` (under `AdminAuthGuard`, like the other `/fifaOwner*` routes) at `/fifaOwner/standings`. It renders the same three groups as `TableTab` (Group A / Group B / Female) but each row is tappable. Tapping a row opens a bottom-sheet with number inputs for `p`/`w`/`d`/`l`/`gf`/`ga`; `gd` and `pts` are shown read-only and derived (`gd = gf - ga`, `pts = w*3 + d`). Save calls `standings.update({ p, w, d, l, gf, ga, gd, pts }).eq("team_id", id)` and invalidates the `standings` key. A segmented tab in the admin header (**Fixtures | Table**) switches between `/fifaOwner` and `/fifaOwner/standings`.

**Why a per-row sheet vs. inline cells**: 8 columns on a 430px-wide mobile layout is too cramped for inline editing; a sheet gives large touch targets and a clear Save/Cancel. **Why derive gd/pts**: keeps standings internally consistent with `recomputeStandingsForGroup` and prevents the admin from entering contradictory values. **Why a route vs. a tab-in-place**: wouter routes are the established pattern (`/fifaOwner`, `/fifaOwner/match/:id`); a route is deep-linkable and keeps `AdminFixtures` focused.

*Alternatives considered:* (a) inline editable table cells — rejected on mobile-width grounds; (b) allow editing gd/pts too — rejected for consistency.

### Decision 3: Small typed write-helpers in `src/lib/supabase.ts`
Add `updateMatchTeamSide(matchId, side: "A" | "B", team: Pick<Team, "id" | "logo">)` and `updateStandingRow(teamId, stats: { p, w, d, l, gf, ga, gd, pts })` next to the existing `recomputeStandingsForGroup`. Reads stay on `useMatches`/`useStandings`. This centralises the write shape and keeps components thin.

### Decision 4: No schema or policy changes
Verified in `supabase/policies.sql`: `matches_update` and `standings_update` are column-agnostic (`using (true) with check (true)` for authenticated), so updating `team_a`/`team_b`/`logo_*` and all `standings` stat columns is already permitted. `matches` and `standings` columns already exist. No migration SQL is produced by this change.

## Risks / Trade-offs

- **[Admin edits a female standings row that a later finish-recompute overwrites]** → Mitigation: document that manual edits are best between matches; the recompute only runs on Female finish/revert. Acceptable for a single-admin live tournament.
- **[Race: admin saves a standings row while the realtime recompute is in flight]** → Mitigation: low likelihood (single admin); the explicit `update` wins last. The editor reads the current row before editing.
- **[Admin picks a team, then realises it's wrong]** → Mitigation: the side stays tappable to re-pick while the match is still `scheduled`.
- **[TBD control renders on a semifinal that already has real teams]** → Mitigation: the control targets `TBD` sides specifically; sides with real teams are only re-pickable (not blanked) and only while `scheduled`.

## Migration Plan

- No data migration, no schema change, no policy change.
- Deploy: `npm run build` + serve. The admin immediately gains the Fixtures-side TBD control and the new Table tab/route.
- Rollback: revert the code; no DB side-effects to undo (admin writes are ordinary row updates).

## Open Questions

- Should the female-final picker be restricted to the (future) female-semifinal winners? Today there is no female semifinal in the data, so any female team is pickable. Refine if/when a female bracket is added.
- Should the standings editor offer a "recompute Female from finished matches" button (mirroring the finish-recompute) as a convenience? Out of scope for v1; the finish/revert path already does this.
