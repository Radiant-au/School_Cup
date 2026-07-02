## Context

The MatchSquad page (`src/pages/MatchSquad.tsx`) displays a match scorecard and team squad rosters. The player list section renders a scrollable list of players for the selected team tab, showing each player's avatar, name (Myanmar script), jersey number, and goal count. The current styling uses minimal visual separation between rows, small column headers, and basic scorer highlighting with a subtle border and tinted background. The page already uses team colors, framer-motion animations, and shadcn/ui primitives.

## Goals / Non-Goals

**Goals:**
- Improve visual hierarchy and readability of the player list
- Better spacing, padding, and row separation for a polished look
- Enhanced scorer highlighting that clearly distinguishes goal scorers
- Refined column header styling with stronger typography
- Improved alignment of avatars, names, jersey numbers, and goal indicators
- Card-like row treatment with subtle dividers or backgrounds

**Non-Goals:**
- Changing the data model or how goals/squad data is fetched
- Adding new features (position grouping, search, filtering)
- Redesigning the match header/scorecard or team tab bar
- Changing the `PlayerAvatar` or `GoalIndicator` component behavior (only styling)
- Adding new dependencies

## Decisions

### 1. Card-style rows with rounded backgrounds

Each player row will use a card-like treatment with `rounded-xl` background, subtle border, and consistent padding. Non-scorers get a muted card style; scorers get a team-color-tinted card with stronger border.

**Rationale**: Card-style rows create clear visual separation without heavy dividers, matching the app's existing dark-mode design language. This is more polished than the current flat-row approach.

**Alternative considered**: Heavy dividers between rows — rejected as visually noisy on mobile.

### 2. Enhanced column header with full-width background

The column header row (Player, #, G) will get a sticky-like visual treatment with a subtle background fill and stronger uppercase typography to clearly delineate it from the player rows.

**Rationale**: The current header is too understated and blends with player rows. A background fill creates clear separation.

### 3. Improved scorer row with gradient accent

Scorer rows will use a gradient background tinted with the team color on the left edge, combined with a slightly elevated card appearance. The goal badge on the avatar remains green (`#22c55e`).

**Rationale**: Gradient accent draws the eye to scorers without being garish. Keeps the existing green goal badge convention.

### 4. Larger avatar with better alignment

Avatar size stays at 44px (`w-11 h-11`) but gets improved vertical alignment within the row via `items-center` and consistent gap spacing. The avatar's border and background tint remain team-colored.

**Rationale**: Current alignment is functional but can be tightened. No size change needed — just better gap/padding consistency.

### 5. Typography improvements

- Player names: Keep `font-myanmar text-[17px] font-bold` but add tighter line-height
- Jersey numbers: Keep `font-barlow` but increase visual weight with slightly larger size
- Goal column: Keep team-color header but improve indicator alignment

**Rationale**: Small typography tweaks improve readability without changing the font system.

## Risks / Trade-offs

- **[Visual consistency across devices]** → Test on small mobile screens (320px width) to ensure card rows don't feel cramped. Mitigation: use responsive padding if needed.
- **[Performance with many players]** → Card-style rows with backgrounds are slightly heavier than flat rows. Mitigation: framer-motion animations already handle rendering; no additional performance concern expected for ~20 player rows.
- **[Scorer highlight too subtle or too strong]** → Tune opacity values for the team-color tint. Start with `${color}10` background and `${color}30` border, adjust as needed.
