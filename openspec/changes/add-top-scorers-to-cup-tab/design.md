## Context

The repo root contains a stray, unintegrated `TopScorersTab.tsx` that imports `TOP_SCORERS_MALE`, `TOP_SCORERS_FEMALE`, `Scorer`, and `getTeamName` from `@/data/tournament`. Those scorer exports do not exist yet, and the component's asset import (`@assets/image_1782741719591.png`) does not resolve under this Vite config (project assets live under `@/assets/`, e.g. `@/assets/football.svg`). Meanwhile `MATCH_EVENTS` already records every scored goal per match/team/player, and `SQUADS` holds every player's name and number — so deterministic, real top-scorer data is derivable today. The "Cup" bottom-nav tab currently renders `KnockoutTab` (finals/bronze cards); product wants the Cup tab to show top scorers instead.

## Goals / Non-Goals

**Goals:**
- Establish a first-class, hand-curated top-scorer dataset in `tournament.ts` authoritative for rendering.
- Move `TopScorersTab.tsx` into the project tree, fix its imports, and render it under the Cup tab.
- Remove the now-unused `KnockoutTab.tsx`.

**Non-Goals:**
- No runtime derivation/aggregation code shipping — the arrays are hand-curated (the implementation task will cross-check them against `MATCH_EVENTS` once and keep them in sync manually thereafter).
- No new bottom-nav tab; the Cup tab slot is reused (`id: "knockout"`, label "Cup", Trophy icon).
- No changes to `MATCH_EVENTS`, `MATCHES`, `STANDINGS`, or the `MatchSquad` page.
- No backend, persistence, or per-matchday "updated" timestamp wiring beyond the existing static footer text.

## Decisions

### D1: Hand-curated arrays instead of runtime derivation
**Choice:** Add static `TOP_SCORERS_MALE` / `TOP_SCORERS_FEMALE` arrays in `tournament.ts`, populated by aggregating `MATCH_EVENTS` once (during this change) and committed as literals.
**Why:** User-selected. Keeps `tournament.ts` the single source of truth in the same style as `STANDINGS` (also hand-curated), avoids introducing selector/helper code in the data layer, and makes the top-scorer list editable for spot-fixes.
**Alternatives:** A `getTopScorers(gender)` selector computing from `MATCH_EVENTS`+`SQUADS` at runtime — rejected per user choice; would need re-validation if events change.

### D2: Scorer shape
**Choice:** `interface Scorer { teamId: string; playerId: string; name: string; number: string; profile_string_link: string; goals: number; }`. Include `playerId` (maps back to `SQUADS`) and `profile_string_link` (the Cloudinary photo URL, copied verbatim from the matching squad entry) so cards can render real player photos without a squad lookup at runtime.
**Why:** Superset of what `TopScorersTab.tsx` consumes plus the photo URL, matching the `Player` interface in `tournament.ts` (`id`/`name`/`number`/`profile_string_link`).

### D3: Rename the bottom-nav tab to "Scorers"
**Choice:** `Home.tsx` renders `<TopScorersTab key="scorers" />` for `activeTab === "scorers"`; `MobileLayout`'s third bottom-nav entry changes from `{ id: "knockout", label: "Cup", icon: Trophy }` to `{ id: "scorers", label: "Scorers", icon: Goal }` (lucide-react `Goal`); delete `KnockoutTab.tsx`.
**Why:** User feedback — the tab is no longer a "cup/knockout" view, so the label "Cup" + `Trophy` icon are misleading. `Goal` is the most semantically appropriate lucide icon for a goal-scorers tab (verified exported by `lucide-react`). Renaming the id (not just the label) keeps the internal state consistent with the visible theme and avoids a stale `knockout` string lingering in code.
**Alternatives:** Keep id `knockout` and only change label+icon — rejected as it leaves misleading internal naming. `Target`/`Award`/`Medal` icons considered; `Goal` is the clearest.

### D4: Reuse existing TeamCrest + cloudinary photo patterns
**Choice:** Relocate `TopScorersTab.tsx` to `src/components/scorers/`. Delete the component's local `TeamCrest` helper and import the shared `@/components/shared/TeamCrest` (which already accepts a `logo` prop and renders the team logo image). Pass the team `logo` looked up from `TEAMS` (e.g. `TEAMS.find(t => t.id === scorer.teamId)?.logo`). Replace the football-placeholder avatar with the real player profile photo: apply `cloudinary(scorer.profile_string_link)` (same helper `MatchSquad.PlayerCard` uses) and render `<img onError={() => setImgError(true)} .../>`, falling back to `@/assets/football.svg` when `profile_string_link` is empty/`"none"` or the image errors. Reuse the existing `isValidPhotoUrl` semantics from `MatchSquad`.
**Why:** User feedback — "I already have photo and person, connect with existing thing instead of create new." The shared `TeamCrest`, `cloudinary`, and `@/assets/football.svg` fallback already exist and are battle-tested in `MatchSquad`. Removing the duplicate local `TeamCrest` shrinks the moved component and keeps crest rendering consistent across the app.
**Alternatives:** Extract `MatchSquad`'s `FootballBall`/`GoalBadge` into a shared module too — deferred (scope creep; the top-scorers card uses a goal-count badge already, not the per-goal ball pips).

### D5: Concrete curated data (derived now, committed as literals)
Aggregating `MATCH_EVENTS` per player, joined with `TEAMS` (gender) and the matching squad (name/number):

**Male** (goals ≥ 1; ties share the top):
- CE_B_03 — CE — 3 goals
- AME_03 — AME (#10) — 3 goals
- EcE_A_03 — EcE(A) — 2 goals
- PrE_B_10 — PrE(B) — 2 goals
- PrE_A_03 — PrE(A) — 2 goals
- 1-goal scorers: CE_B_15 (CE), CE_B_01 (CE), EcE_B_07 (EcE(B)), EcE_B_13 (EcE(B)), IS_A_14 (IS(A)), AME_09 (AME #7), EcE_B_10 (EcE(B)), PrE_B_13 (PrE(B)), CE_B_13 (CE), IS_B_10 (IS(B)), PrE_A_09 (PrE(A))

**Female** (goals ≥ 1):
- EcE_F_09 — EcE (#17) — 1 goal
- EcE_F_06 — EcE (#15) — 1 goal

The two goals-from-MATCH_EVENTS counts that the curated arrays MUST match: 3 (CE_B_03), 3 (AME_03), 2 (EcE_A_03), 2 (PrE_B_10), 2 (PrE_A_03), and the rest 1; female 1 each for EcE_F_09 and EcE_F_06. Implementation MUST join names/numbers from `SQUADS` (e.g. CE_B_03 → CE_male #...); squad `number` strings are committed verbatim from the squad files.

## Risks / Trade-offs

- [Dual source of truth divergence] `MATCH_EVENTS` and the curated `TOP_SCORERS_*` could drift as new matches are scored. → Mitigation: tasks include a one-time cross-check of totals vs events; spec's "totals match events" requirement documents the invariant. Accept manual upkeep, consistent with how `STANDINGS` is already hand-maintained.
- [Tie ordering] Two players share 3 male goals; the rank-1 amber styling applies to "i === 0" only, so only the first tied entry gets the gold treatment. → Acceptable; matches the existing component logic. Could be revisited to style all `goals === max` entries, but out of scope here.
- [Moved file imports] The repo-root `TopScorersTab.tsx` also imports `footballImg` and uses an `@assets/...` alias that isn't configured. → Mitigation: task explicitly swaps to `@/assets/football.svg` and runs `npm run typecheck`+`npm run build`.
- [Removed knockout content] Users lose the finals/bronze cards. → Reversible: `KnockoutTab.tsx` is recoverable from git history; re-adding is a follow-up change.