## Why

The standings table uses hardcoded zeroed stats that can't be edited without code changes. The fixture cards show match time even after a match finishes (cluttering the display). The date picker is hardcoded to June 29 instead of auto-selecting the current date. Player names use a Latin-only font (Barlow Condensed) with no Myanmar font support, causing rendering issues with Burmese script.

## What Changes

- Replace the zeroed `generateInitialTable()` with an editable `STANDINGS` JSON data structure in `tournament.ts` so table stats can be manually updated after each match.
- In fixture match cards, hide the time and display a larger score when a match is finished.
- Replace the hardcoded `TODAY = "2026-06-29"` with the actual current date so the date picker auto-selects today.
- Add a Myanmar/Burmese web font (Padauk from Google Fonts) and fix squad view styling (remove `font-barlow` and `tracking-wide` from player names, adjust line-height and padding for Myanmar script).

## Capabilities

### New Capabilities
- `editable-standings`: Editable JSON standings data replacing zeroed table generation.
- `finished-match-display`: Larger score and hidden time for finished matches in fixture cards.
- `dynamic-today`: Date picker auto-selects the actual current date.
- `myanmar-font-support`: Myanmar web font loading and squad view typography fixes for Burmese script.

### Modified Capabilities


## Impact

- **`src/data/tournament.ts`**: Add `STANDINGS` data structure with per-team stats.
- **`src/components/table/TableTab.tsx`**: Read from `STANDINGS` instead of `generateInitialTable()`.
- **`src/components/fixtures/FixtureTab.tsx`**: Replace hardcoded `TODAY`, update `MatchCard` finished state display.
- **`src/pages/MatchSquad.tsx`**: Remove `font-barlow` and `tracking-wide` from player names, adjust padding/line-height.
- **`src/index.css`**: Add Padauk font import, add Myanmar font-family variable.
- **`index.html`**: Add Padauk font preconnect/link.
