## 1. Data Layer

- [x] 1.1 Add optional `logo?: string` field to the `Team` interface in `src/data/tournament.ts`.
- [x] 1.2 Populate `logo` URLs on each team in the `TEAMS` array using the Cloudinary URLs from `MATCHES` (PrE, IS, AME, EcE, CE).

## 2. Shared TeamCrest Component

- [x] 2.1 Create `src/components/shared/TeamCrest.tsx` with `name`, `logo?`, and `size` props supporting `sm` (20px), `md` (40px), and `lg` (36px) variants.
- [x] 2.2 Replace the inline `TeamCrest` in `src/components/fixtures/FixtureTab.tsx` with an import from the shared component using `size="md"`.
- [x] 2.3 Replace the inline `TeamCrest` in `src/pages/MatchSquad.tsx` with an import from the shared component using `size="lg"`.

## 3. Fullscreen Mobile Layout

- [x] 3.1 Remove `max-w-[430px]` and `shadow-2xl` from the container div in `src/components/layout/MobileLayout.tsx`.
- [x] 3.2 Remove `max-w-[430px]` from the bottom nav element in `MobileLayout.tsx`.
- [x] 3.3 Reposition bottom nav tabs to right-aligned (replace `justify-around` with `justify-end` and add compact gap spacing).
- [x] 3.4 Remove `max-w-[430px]` from the container div in `src/pages/MatchSquad.tsx`.

## 4. Standings Table Redesign

- [x] 4.1 Update `TableTab.tsx` table headers from P/W/D/L/GF/GA/GD/Pts to PL/W/D/L/+/-/GD/PTS (remove GF and GA, add +/-).
- [x] 4.2 Add a `+/-` column cell to each table row that displays signed goal difference (e.g., `+2`, `-3`, `0`) with color coding (green positive, red negative, neutral for zero).
- [x] 4.3 Remove GF and GA column cells from each table row.
- [x] 4.4 Add shared `TeamCrest` with `size="sm"` inline before the team name in each table row, reading the `logo` field from the `Team` data.
- [x] 4.5 Update `generateInitialTable` to include `logo` from the `Team` object in each `TableRow`.

## 5. Verification

- [x] 5.1 Run `npm run typecheck` and fix any type errors.
- [x] 5.2 Run `npm run lint` and fix any lint violations.
- [x] 5.3 Run `npm run build` and verify the build succeeds.
