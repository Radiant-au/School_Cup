## Context

The standings table currently uses `generateInitialTable()` which creates zeroed `TableRow` objects from `TEAMS`. Stats can only be changed by editing component code. The fixture date picker hardcodes `TODAY = "2026-06-29"`. Match cards show time alongside finished scores. Player names use `font-barlow` (Barlow Condensed) which has no Myanmar glyphs, causing browser fallback rendering with incorrect spacing.

## Goals / Non-Goals

**Goals:**
- Make standings data editable as a JSON-like structure in `tournament.ts`.
- Show larger scores and hide time for finished matches in fixture cards.
- Auto-select the actual current date in the date picker.
- Load Padauk (Myanmar web font) and fix squad view typography for Burmese names.

**Non-Goals:**
- Auto-computing standings from match results (manual editing only).
- Changing the knockout/cup bracket view.
- Adding assists or other event types beyond goals.
- Desktop-specific responsive breakpoints.

## Decisions

### 1. STANDINGS as a flat array in tournament.ts

**Decision**: Add a `StandingEntry` interface and a `STANDINGS: StandingEntry[]` array in `tournament.ts`. Each entry has `teamId`, `p`, `w`, `d`, `l`, `gf`, `ga`, `gd`, `pts`. `TableTab` filters by group/gender using the `TEAMS` array to match team IDs.

**Rationale**: A flat array is the simplest structure to edit manually. Each entry is one team's stats — easy to find and update. Keeping it in `tournament.ts` alongside `TEAMS` and `MATCHES` keeps all tournament data co-located.

**Alternative considered**: Separate JSON file per group. Rejected because it fragments data and adds file management overhead for a small dataset.

### 2. Dynamic TODAY using actual date

**Decision**: Replace `const TODAY = "2026-06-29"` with `const TODAY = new Date().toISOString().slice(0, 10)`. If the current date doesn't match any tournament date, the picker falls back to the nearest date or index 0 (existing fallback logic already handles this).

**Rationale**: Zero dependencies, uses native `Date`. The existing fallback (`todayIdx >= 0 ? todayIdx : 0`) already handles the case where TODAY isn't in the tournament dates array.

### 3. Finished match: bigger score, no time

**Decision**: In `MatchCard`, when `isFinished` is true, remove the time display entirely and increase the score font size from `text-3xl` to `text-4xl`.

**Rationale**: The time is irrelevant once the match is over. A larger score draws attention to the result, which is what users care about for finished matches.

### 4. Padauk font from Google Fonts for Myanmar text

**Decision**: Import Padauk (weights 400, 700) from Google Fonts. Add a `--font-myanmar` CSS variable. Apply it to player names in `MatchSquad.tsx` instead of `font-barlow`. Remove `tracking-wide` from player names. Increase `leading-tight` to `leading-normal` for Myanmar script vertical spacing.

**Rationale**: Padauk is the most widely-used open-source Myanmar font with good hinting. Google Fonts provides CDN delivery with no build step. Removing `font-barlow` and `tracking-wide` prevents the Latin condensed font from interfering with Myanmar glyph rendering.

**Alternative considered**: Pyidaungsu (Microsoft's Myanmar font). Rejected because it's not freely available on Google Fonts and requires manual hosting.

## Risks / Trade-offs

- **[Manual standings updates]** → Stats must be manually edited after each match. Mitigation: This is intentional for now; auto-computation can be added later.
- **[Date picker on non-tournament days]** → If the user opens the app on a day with no matches, the picker shows the first tournament date. Mitigation: The existing fallback logic handles this gracefully.
- **[Padauk font loading delay]** → Brief FOUT (flash of unstyled text) while the font loads. Mitigation: `display=swap` in the Google Fonts URL shows fallback text immediately, then swaps to Padauk.
