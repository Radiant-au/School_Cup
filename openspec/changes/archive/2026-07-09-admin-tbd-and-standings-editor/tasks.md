## 1. Data layer

- [x] 1.1 Add `updateMatchTeamSide(matchId: string, side: "A" | "B", team: Pick<Team, "id" | "logo">)` to `src/lib/supabase.ts`: `supabase.from("matches").update(side === "A" ? { team_a: team.id, logo_a: team.logo ?? null } : { team_b: team.id, logo_b: team.logo ?? null }).eq("id", matchId)`, returning `{ error }`.
- [x] 1.2 Add `updateStandingRow(teamId: string, stats: { p: number; w: number; d: number; l: number; gf: number; ga: number; gd: number; pts: number })` to `src/lib/supabase.ts`: `supabase.from("standings").update(stats).eq("team_id", teamId)`, returning `{ error }`. The caller derives `gd`/`pts` before calling.
- [x] 1.3 Verify (read-only, no edit) in `supabase/policies.sql` that `matches_update` and `standings_update` permit authenticated `UPDATE` on the columns touched (`team_a`/`team_b`/`logo_a`/`logo_b` and all `standings` stat columns). No SQL changes are expected; if a gap is found, add the minimal policy and re-run `policies.sql` in the Supabase SQL editor. _(Verified: both policies are column-agnostic `for update to authenticated using (true) with check (true)`; no SQL changes needed.)_

## 2. TBD assignment UI (AdminFixtures)

- [x] 2.1 In `src/pages/admin/AdminFixtures.tsx`, extend `MatchSummary` to carry `logoA`/`logoB` (from `useMatches`) and switch `MatchRow`'s inline `TeamCrest` to the shared `@/components/shared/TeamCrest` (logo-aware) so an assigned team renders its crest.
- [x] 2.2 In `MatchRow`, use `isKnockoutGroup(match.group)` (from `@/lib/knockout`) to detect knockout matches; render a tappable "Assign" control on each side whose team id is `"TBD"`, and a re-pick affordance on already-assigned sides — but only when `match.status === "scheduled"`. Hide the control entirely when `status` is `live` or `finished`.
- [x] 2.3 Add a bottom-sheet team picker (framer-motion, reuse the sheet pattern from `AdminLiveMatch`'s finish/undo dialogs) that lists `TEAMS` filtered by `match.gender`, each row showing the team crest + name.
- [x] 2.4 On team select, call `updateMatchTeamSide(match.id, side, team)`, `await queryClient.invalidateQueries({ queryKey: ["matches"] })`, close the sheet; surface failures via `toast` (destructive).

## 3. Editable standings admin page

- [x] 3.1 Add route `/fifaOwner/standings` in `src/App.tsx` (wrapped in `AdminAuthGuard`) rendering a new `src/pages/admin/AdminStandings.tsx` component.
- [x] 3.2 `AdminStandings`: read standings via `useStandings`, render three sections (GROUP A · MALE / GROUP B · MALE / FEMALE) mirroring `TableTab`'s structure, each row tappable to open an editor sheet.
- [x] 3.3 Editor bottom-sheet: number inputs for `p`/`w`/`d`/`l`/`gf`/`ga`; show `gd` and `pts` read-only and derived live (`gd = gf - ga`, `pts = w * 3 + d`). Pre-fill with the row's current values.
- [x] 3.4 On save, call `updateStandingRow(teamId, { p, w, d, l, gf, ga, gd, pts })`, `await queryClient.invalidateQueries({ queryKey: ["standings"] })`, close the sheet; surface failures via `toast` (destructive).
- [x] 3.5 Add a segmented tab (**Fixtures | Table**) in the admin header of both `AdminFixtures` and `AdminStandings` that navigates between `/fifaOwner` and `/fifaOwner/standings` (active state per route). _(Extracted as `src/components/shared/AdminTabBar.tsx`, used in both pages.)_

## 4. Verification

- [x] 4.1 Run `npm run typecheck` and `npm run lint`; fix any issues. Do not introduce new test commands (none are configured). _(Typecheck: 0 errors. Lint: 0 errors, 8 pre-existing react-refresh warnings in generated `ui/` primitives. Build also passes.)_
- [ ] 4.2 Hand-verify in `npm run dev`: assign a team to a TBD final side and confirm the public fixture list (`/`) and the match page (`/match/:id`) update the team + crest in real time; edit a standings row and confirm the public table (`TableTab`) updates in real time. _(Owner-run: requires admin session + live Supabase.)_
- [x] 4.3 Confirm the assign control is hidden on a `live`/`finished` knockout match, and that the admin standings/assign controls are unreachable without a Supabase session (anon is rejected by RLS — verify the public app exposes no admin controls). _(By code: `canAssign = isKnockout && status === "scheduled"` → `renderSide` renders a plain `<div>` (no button) when not scheduled; `/fifaOwner*` routes are wrapped in `AdminAuthGuard`; public `FixtureTab` has no assign control; RLS `matches_update`/`standings_update` are authenticated-only — verified in `policies.sql`.)_
