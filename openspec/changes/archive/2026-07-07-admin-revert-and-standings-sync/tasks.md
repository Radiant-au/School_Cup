## 1. Database layer

- [x] 1.1 Add a `standings_update` RLS policy to `supabase/policies.sql`: `for update to authenticated using (true) with check (true)` (anon stays SELECT-only). Use the existing `drop policy if exists` first pattern so it is re-runnable.
- [ ] 1.2 Paste updated `supabase/policies.sql` into the Supabase SQL editor and Run. Verify with the sanity checks at the bottom of `policies.sql` plus: anon `UPDATE` on `standings` is rejected; authenticated `UPDATE` succeeds.
- [x] 1.3 Prerequisite (separate bug, but required before any of this can run): fix `supabase/schema.sql` unquoted `group` → `"group"` on the `teams` and `matches` CREATE TABLE statements, then apply `schema.sql` + `policies.sql` + `resync.sql` in order in the SQL editor. _(Schema fix already present in-file; applying schema+policies+resync in the SQL editor remains an owner-run deployment step — see 1.2.)_

## 2. Standings recompute helper

- [x] 2.1 Add `recomputeStandingsForGroup(groupId: string)` to `src/lib/supabase.ts`: fetch all `matches` rows where `status='finished'` and `group=groupId`; for each team in that group, compute `p`, `w`, `d`, `l`, `gf`, `ga`, `gd`, `pts` from `score_a`/`score_b`; `upsert` the recomputed rows into `standings` keyed by `team_id`. Return `{ error }` on failure.
- [x] 2.2 Hand-verify the arithmetic against the currently-finished female matches (e.g. matches 3, 6, 9, 12, 15) so the expected P/W/D/L/GF/GA/GD/PTS per female team is known before wiring it in. _(Verified: EcE_F 2/1/1/0/2/0/2/4; IS_F, CE_F, PrE_F 2/0/2/0/0/0/0/2; AME_F 2/0/1/1/0/2/-2/1.)_

## 3. Undo-goal confirmation (AdminLiveMatch)

- [x] 3.1 In `src/pages/admin/AdminLiveMatch.tsx`, add `undoConfirmEventId` state and a bottom-sheet confirmation dialog (reuse the `framer-motion` sheet pattern from the Finish dialog) that shows the selected event's `playerName`, `playerNumber`, and team name.
- [x] 3.2 Change the goal-log undo button `onClick` to open the dialog (`setUndoConfirmEventId(ev.id)`) instead of calling `handleUndo` directly.
- [x] 3.3 On dialog confirm, call `handleUndo(eventId)`; disable the confirm button while `undoingEventId === eventId`; close the dialog on success or error toast. On dismiss/cancel, clear `undoConfirmEventId` with no mutation.

## 4. Match revert to scheduled (AdminLiveMatch)

- [x] 4.1 Add `showRevertConfirm` state and a "Revert to Scheduled" control in the footer area, visible only when `match.status === 'live' || match.status === 'finished'` (hidden when `scheduled`).
- [x] 4.2 Implement `handleRevert`: with confirmation, `update matches set status='scheduled', score_a=null, score_b=null where id=match.id`; then `delete from goal_events where match_id=match.id`; then if `match.group === 'Female'`, call `recomputeStandingsForGroup('Female')`.
- [x] 4.3 After a successful revert, invalidate the `matches`, `goal-events`, and `standings` TanStack Query keys, then navigate to `/fifaOwner` (or stay on the page to re-test — pick one in implementation). _(Navigates to `/fifaOwner` after invalidation.)_

## 5. Wire standings recompute into Finish Match

- [x] 5.1 In `handleFinish` (`AdminLiveMatch.tsx`), after the `matches.update` to `finished` succeeds, if `match.group === 'Female'`, `await recomputeStandingsForGroup('Female')` before navigating.
- [x] 5.2 After the recompute, invalidate the `standings` query key so the public `TableTab` refreshes in real time (it is already realtime-subscribed, but explicit invalidation avoids a race on the same client).

## 6. Backfill + verification

- [x] 6.1 Write a one-shot SQL snippet (e.g. `supabase/recompute-female-standings.sql`) that recomputes the Female group `standings` rows from currently-finished female matches and `UPDATE`s them; paste it into the SQL editor and Run once. _(File written; pasting/running in the SQL editor remains owner-run.)_
- [ ] 6.2 Verify end-to-end: (a) undo shows the confirmation dialog with scorer identity and deletes only on confirm; (b) "Revert to Scheduled" resets a live/finished match to `scheduled` with an empty goal log and null scores; (c) finishing a female match updates the public Female standings table in real time; (d) male group standings are unchanged.
- [x] 6.3 Run `npm run typecheck` and `npm run lint`; fix any issues. Do not introduce new test commands (none are configured). _(Typecheck: 0 errors. Lint: 0 errors, 7 pre-existing react-refresh warnings in generated `ui/` primitives.)_
