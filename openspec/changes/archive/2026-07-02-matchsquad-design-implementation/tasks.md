## 1. PlayerCard Component

- [x] 1.1 Create `PlayerCard` component with 92px circular avatar, faded jersey number watermark (72px, 4% opacity), position badge derived from jersey number, and player name in Myanmar font
- [x] 1.2 Add position derivation logic: 1=GK, 2-4=DEF, 5-7=MID, 8+=FWD with color-coded badges (yellow, blue, emerald, red)
- [x] 1.3 Add profile photo support with fallback to football SVG for invalid URLs or load errors
- [x] 1.4 Add green goal count badge (24px circle) on avatar bottom-right for scorers

## 2. GoalBadge Component

- [x] 2.1 Create `GoalBadge` component: green-tinted pill with football icons (up to 3) and "+N" overflow text
- [x] 2.2 Display goal badge below position info for scorers only, with "1 goal" / "N goals" text

## 3. Scorer Card Styling

- [x] 3.1 Apply green tinting to scorer cards: `bg-green-500/5 border-green-500/20`
- [x] 3.2 Apply standard card styling to non-scorers: `bg-card border-card-border`

## 4. Integration with Real Data

- [x] 4.1 Replace mock data rendering with real `SQUADS` data and `MATCH_EVENTS` goal aggregation
- [x] 4.2 Pass real player data (name, number, profile_string_link, goals) to `PlayerCard`
- [x] 4.3 Remove old `PlayerAvatar` and `GoalIndicator` components (replaced by `PlayerCard` and `GoalBadge`)

## 5. Layout and Spacing

- [x] 5.1 Update player list container to use card layout with `gap-3` spacing between cards
- [x] 5.2 Ensure cards use `rounded-2xl border` with proper padding (`px-5 py-5`)

## 6. Verification

- [x] 6.1 Run `npm run typecheck` and confirm no type errors
- [x] 6.2 Run `npm run lint` and confirm no lint errors
- [x] 6.3 Run `npm run build` and confirm successful production build
- [x] 6.4 Visual check: verify player cards render correctly with real data on mobile viewport (320px+)
