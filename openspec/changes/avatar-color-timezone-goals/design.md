## Context

Three small UX issues in the squad view and fixture date picker, plus a table display issue:

1. **Player avatar circle**: `PlayerAvatar` in `MatchSquad.tsx` only applies team color (border + background tint) when `isScorer` is true. Non-scorers get a generic gray border. The user wants every player's circle to show team color.

2. **Today date**: `TODAY` in `FixtureTab.tsx` uses `new Date().toISOString().slice(0, 10)` which is UTC. Myanmar is UTC+6:30, so between 12:00am–6:30am Myanmar time, UTC reports the previous day.

3. **Goal badge**: The goal count badge on player avatars uses team color. The user wants it to be green (`#22c55e`) to clearly signal "goal scored."

4. **Table +/- column**: The "+/-" column currently shows the signed goal difference (e.g., "+1", "-1"). The user wants it to show the actual goals for/against format (e.g., "2-1") to make the goal difference calculation transparent. The "GD" column will continue to show the signed difference.

## Goals / Non-Goals

**Goals:**
- Player avatar circle always uses team color for border and background tint.
- TODAY computed using Myanmar timezone (UTC+6:30).
- Goal badge uses green instead of team color.
- Table "+/-" column shows "GF-GA" format (e.g., "2-1").

**Non-Goals:**
- Adding profile images to avatar circles (future work).
- Supporting multiple timezones — Myanmar only.
- Changing the GoalIndicator component (football ball icons stay as-is).
- Changing the "GD" column behavior (it already shows signed goal difference correctly).

## Decisions

### 1. Avatar always uses team color

**Decision**: Remove the `isScorer` conditional from `borderColor` and `bgColor` in `PlayerAvatar`. Always apply team color. Keep the football image opacity change for non-scorers.

**Rationale**: Team color on every player reinforces team identity. Simpler code — no conditional.

### 2. Myanmar timezone for TODAY

**Decision**: Use `Intl.DateTimeFormat` with `timeZone: "Asia/Yangon"` to get the current date in Myanmar time:

```ts
const TODAY = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Yangon", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
```

`en-CA` locale produces `YYYY-MM-DD` format directly.

**Alternative considered**: Manual UTC+6:30 offset math. Rejected because `Intl.DateTimeFormat` handles DST and is more readable. (Myanmar doesn't observe DST, but this is still cleaner.)

### 3. Goal badge green

**Decision**: Change `backgroundColor: color` to `backgroundColor: "#22c55e"` (green-500) on the goal badge div in `PlayerAvatar`.

**Rationale**: Green universally signals "goal/score." Team color on the badge was visually noisy when combined with the already-colored avatar circle.

### 4. Table +/- column shows GF-GA format

**Decision**: Change the "+/-" column in `TableTab.tsx` from `formatSignedGD(row.gd)` to `${row.gf}-${row.ga}`. This shows the actual goals scored and conceded (e.g., "2-1" for AME, "1-2" for EcE(A)). The "GD" column continues to show the signed goal difference (+1, -1).

**Rationale**: Showing "2-1" makes it immediately clear how the goal difference was calculated. It's more informative than just "+1" and helps users understand the team's offensive/defensive performance at a glance.

## Risks / Trade-offs

- **[Asia/Yangon support]** → Very old browsers may not support the `Asia/Yangon` timezone ID. Mitigation: All modern browsers support it. Fallback would be UTC, which is acceptable.
- **[Goal badge contrast]** → Green badge on dark backgrounds is fine. On light backgrounds it might clash. Mitigation: The app is dark-mode only.
- **[Table column width]** → "2-1" takes more space than "+1". Mitigation: The column is already wide enough for 3-character strings. No layout change needed.
