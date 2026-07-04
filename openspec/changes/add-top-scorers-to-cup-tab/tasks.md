## 1. Curate top-scorer data in `tournament.ts`

- [x] 1.1 Add a `Scorer` interface to `src/data/tournament.ts` with fields `teamId`, `playerId`, `name`, `number`, `goals`
- [x] 1.2 Aggregate `MATCH_EVENTS` per `playerId`, join with `TEAMS` (for gender) and the matching squad in `SQUADS` (for `name` and `number`), and verify the totals match the design: male 3 (CE_B_03), 3 (AME_03), 2 (EcE_A_03), 2 (PrE_B_10), 2 (PrE_A_03), and the 1-goal scorers; female 1 (EcE_F_09) and 1 (EcE_F_06)
- [x] 1.3 Add the hand-curated `TOP_SCORERS_MALE` array to `tournament.ts` (sorted descending by `goals`, squad `name`/`number` strings copied verbatim from the squad files)
- [x] 1.4 Add the hand-curated `TOP_SCORERS_FEMALE` array to `tournament.ts` (sorted descending by `goals`)
- [x] 1.5 Re-export the `Scorer` type so `TopScorersTab.tsx` can `import type { Scorer } from "@/data/tournament"`
- [x] 1.6 Add `profile_string_link: string` to the `Scorer` interface and copy each scorer's photo URL verbatim from their squad entry into `TOP_SCORERS_MALE` / `TOP_SCORERS_FEMALE`

## 2. Move and fix `TopScorersTab.tsx`

- [x] 2.1 Move `TopScorersTab.tsx` from the repo root to `src/components/scorers/TopScorersTab.tsx` and delete the original repo-root file
- [x] 2.2 Replace the unresolvable `@assets/image_1782741719591.png` import with `@/assets/football.svg` (used by `MatchSquad.tsx`) in both the card and modal avatar `<img>` sources
- [x] 2.3 Verify the existing import `{ TOP_SCORERS_MALE, TOP_SCORERS_FEMALE, getTeamName, type Scorer } from "@/data/tournament"` resolves with the new exports
- [x] 2.4 Remove the local `PlayerPreviewModal`/`ScorerCard` reliance on `number` keys if a `playerId` is now available; otherwise keep keying by `teamId-number` (no change needed, additive `playerId` only)
- [x] 2.5 Delete the local `TeamCrest` helper from `TopScorersTab.tsx` and import the shared `TeamCrest` from `@/components/shared/TeamCrest`; pass the team `logo` looked up from `TEAMS` (e.g. `TEAMS.find(t => t.id === scorer.teamId)?.logo`)
- [x] 2.6 Replace the football-placeholder avatar in `ScorerCard` and `PlayerPreviewModal` with the real player photo: apply `cloudinary(scorer.profile_string_link)` (from `@/lib/cloudinary`) with an `onError` fallback to `@/assets/football.svg` when the URL is empty/`"none"` or the image fails to load — matching `MatchSquad.PlayerCard`

## 3. Wire the "Scorers" tab to render `TopScorersTab`

- [x] 3.1 Import `TopScorersTab` into `src/pages/Home.tsx`
- [x] 3.2 Update `Home.tsx`: default `activeTab` state to `"scorers"` and render `<TopScorersTab key="scorers" />` for `activeTab === "scorers"` (replacing the `knockout` branch)
- [x] 3.3 Remove the `KnockoutTab` import from `Home.tsx`
- [x] 3.4 Delete `src/components/knockout/KnockoutTab.tsx`
- [x] 3.5 Update `MobileLayout`'s third bottom-nav entry: id `knockout` → `scorers`, label "Cup" → "Scorers", icon `Trophy` → `Goal` (import `Goal` from `lucide-react`)

## 4. Verify

- [x] 4.1 Run `npm run typecheck` and fix any errors
- [x] 4.2 Run `npm run lint` and fix any errors
- [x] 4.3 Run `npm run build` and confirm a clean build output to `dist/public`
- [ ] 4.4 Manually verify in `npm run dev`: the "Scorers" tab (Goal icon) shows TopScorersTab; male list default with real player photos + team crests, female toggle works, top scorer amber styling, tapping a card opens the preview modal (real photo) and it closes via the X button and the backdrop