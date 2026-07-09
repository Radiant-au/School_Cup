## Context

The `fifaOwner` admin panel already records and undoes goals live against the Supabase `goal_events` table, and transitions a match `scheduled → live → finished`. Three gaps motivate this change:

1. **Undo is one-tap and destructive.** `AdminLiveMatch.tsx:138-153` deletes a `goal_events` row immediately on tap of the undo icon — an accidental tap silently removes a goal with no way back.
2. **No status revert.** Once `live` (or `finished`), a match cannot return to `scheduled`, so the admin cannot re-test the real-time goal flow end-to-end (start → score → verify public realtime → reset → repeat).
3. **Standings are a static snapshot.** `handleFinish` (`AdminLiveMatch.tsx:155-180`) only writes `matches.status` + `score_a`/`score_b`; it never touches `standings`. The public `TableTab` reads the `standings` table via `useStandings`, which is seeded once and never updated. The Female group stage is still in round-robin, so the female table is stale; the male groups (A/B) are already final and must not be touched.

Constraint: `policies.sql` has no `UPDATE` policy on `standings`, so even an authenticated admin client cannot write to it today. The schema itself is read-from by the public and is fine; only the policy needs extending.

Stakeholders: the tournament admin (sole writer) and public visitors (read-only via anon key + realtime).

## Goals / Non-Goals

**Goals:**

- Guard `goal_events` deletion behind a confirmation dialog showing scorer identity (name, number, team).
- Let the admin revert a `live`/`finished` match to `scheduled`, clearing scores and the match's goal events, so the real-time flow is re-testable.
- Keep the Female group's `standings` correct as female matches finish or revert, by recomputing from finished-match score snapshots.
- Add an authenticated `UPDATE` policy on `standings` (anon stays read-only).

**Non-Goals:**

- Modifying male-group (A/B) standings — they are final by user instruction.
- Redesigning the public standings table UI (owned by `standings-table-redesign`).
- Introducing a Postgres RPC/function for the recompute — stay client-side to match the existing admin-write pattern.
- Archiving or syncing the prior `supabase-admin-auth-live-scores` change.
- Fixing the unrelated `schema.sql` unquoted-`group` bug (prerequisite, tracked separately).

## Decisions

### Decision 1: Undo confirmation reuses the existing bottom-sheet dialog pattern

Reuse the same `framer-motion` bottom-sheet dialog already used by "Finish Match" (`AdminLiveMatch.tsx:361-402`) for the undo confirmation, showing scorer name/number/team.

**Alternatives considered:** inline swipe-to-delete (hidden affordance, discoverability problem on mobile); a native `confirm()` (jarring, not styled, blocks the thread). The bottom-sheet is consistent with the existing Finish dialog and mobile-first.

### Decision 2: Revert clears `goal_events` and scores (clean slate)

"Revert to Scheduled" sets `status='scheduled'`, `score_a=null`, `score_b=null`, and deletes all `goal_events` for that `match_id`.

**Alternatives considered:** preserve goal events but flip status only (leaves stale goals attached to a "scheduled" match → confusing and would corrupt the next live session's derived score). The user's explicit intent is to re-test the real-time flow, which requires a clean slate.

### Decision 3: Standings recompute is client-side, not a Postgres RPC

Implement `recomputeStandingsForGroup(groupId)` in `src/lib/supabase.ts`: fetch finished matches in the group, compute P/W/D/L/GF/GA/GD/PTS per team, and `upsert` into `standings`. Called from `AdminLiveMatch` on Finish and on Revert, gated to `group==='Female'`.

**Alternatives considered:** a `recompute_standings(g)` SQL function invoked via `supabase.rpc(...)` (cleaner atomicity, but adds a SQL artifact to maintain and a migration step; the project has no `migrations/` folder and runs SQL manually). Client-side matches the existing admin pattern (direct authenticated writes to `matches`/`goal_events`) and the recompute is simple arithmetic over a small dataset (≤6 teams, ≤5 matches).

### Decision 4: Recompute reads `score_a`/`score_b` snapshots, not `goal_events` counts

Standings derive goals-for/against from the finished matches' `score_a`/`score_b` (the authoritative snapshot written on Finish), not by counting `goal_events`.

**Rationale:** the public scoreline already uses `score_a`/`score_b` for finished matches (`AdminFixtures.tsx:111-121`), so standings must agree with that same source. Counting events could diverge if an event were deleted after finish. For reverted matches, `score_a`/`score_b` are null and the match is no longer `finished`, so it drops out of the recompute set automatically.

### Decision 5: Recompute scoped to Female group only

The recompute trigger fires only when the transitioning match's `group === 'Female'`. Male groups (A/B) and knockout groups are skipped.

**Alternatives considered:** recompute all groups idempotently (male recomputation would yield the same final numbers). Rejected because (a) user instruction "male done, don't touch", and (b) male standings may carry manual adjustments from earlier operations that a recompute would silently overwrite. Scoping to Female is safer and matches intent.

### Decision 6: Backfill via a one-shot SQL script

After deploying, run a one-time recompute for the Female group. Delivered as a small SQL snippet the admin pastes into the Supabase SQL editor (computes from existing finished female matches and `UPDATE`s the female `standings` rows), rather than a hidden admin UI action.

**Alternatives considered:** a hidden "Recompute standings" button in the admin panel (extra surface area, one-time need); relying on the next female match's Finish to correct it (leaves the table stale in the interim). A SQL script is the lowest-surface, most auditable option.

## Risks / Trade-offs

- **[Client-side recompute race]** Two admins finishing female matches simultaneously could interleave upserts. → *Mitigation:* the upsert is idempotent and recomputes the full group from the finished set; last write wins and is correct. Tournament has a single admin in practice.
- **[Revert deletes goal_events]** Destructive and irreversible for that match's history. → *Mitigation:* guarded by a confirmation dialog; only reachable by an authenticated admin; the user's explicit purpose is re-testing, so loss is intended.
- **[Widened standings write surface]** Adding an `UPDATE` policy on `standings` for `authenticated` lets a compromised admin write arbitrary standings values, not just recomputed ones. → *Mitigation:* scoped to `authenticated` (anon still read-only); recompute values are deterministic; this matches the trust model already applied to `matches` (full UPDATE for authenticated).
- **[Stale male standings if a male match is later unfinished/refinished]** Out of scope by user instruction; male groups are final. → *Mitigation:* documented as a non-goal; if ever needed, the recompute gate can be widened to `A`/`B` later.
- **[schema.sql `group` bug blocks apply]** The unquoted `group` column prevents `schema.sql` from running on a fresh database, so none of this change's mutations can be exercised until it's fixed. → *Mitigation:* tracked as a prerequisite; must fix (`"group"`) and apply schema + policies + resync before testing.

## Migration Plan

1. **Prerequisite (separate):** fix `supabase/schema.sql` unquoted `group` → `"group"` on the `teams` and `matches` tables.
2. **Apply DB layer:** in the Supabase SQL editor, run (in order): updated `schema.sql` → updated `policies.sql` (now containing the new `standings_update` policy) → `resync.sql`.
3. **Deploy app code:** undo-confirmation dialog, "Revert to Scheduled" control + handler, `recomputeStandingsForGroup` helper wired into Finish and Revert (Female-gated).
4. **Backfill:** run the one-shot female-standings recompute SQL snippet to correct the currently-finished female matches.
5. **Verify:** (a) tapping undo shows the dialog with scorer identity and only deletes on confirm; (b) reverting a live match resets it to `scheduled` with empty goal log; (c) finishing a female match updates the public Female standings table in real time; (d) male standings are unchanged.

**Rollback:** revert the app code; the `standings_update` policy can be dropped (`drop policy "standings_update" on public.standings;`) to restore the prior read-only posture. The `standings` table and seeded rows are unaffected.

## Open Questions

- **Undo-ADD too?** Should recording a goal (the `+1` tap) also require confirmation, or only the undo? *Recommendation:* only undo — ADD is rapid-fire during live scoring and confirmation there would harm UX. Awaiting confirmation.
- **Revert entry point:** should "Revert to Scheduled" also appear on the `AdminFixtures` MatchRow for `finished` matches, or only inside `AdminLiveMatch`? *Recommendation:* inside `AdminLiveMatch` only, to keep the fixtures list tap-targets uncluttered.
- **Backfill delivery:** SQL snippet vs. a one-time `npx tsx` script that calls the same recompute helper. *Recommendation:* SQL snippet, consistent with how `resync.sql` is applied.
