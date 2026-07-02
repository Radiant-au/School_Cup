## 1. Avatar Circle Always Uses Team Color

- [x] 1.1 In `MatchSquad.tsx` `PlayerAvatar`, remove the `isScorer` conditional from `borderColor` — always use `color`.
- [x] 1.2 In `MatchSquad.tsx` `PlayerAvatar`, remove the `isScorer` conditional from `bgColor` — always use `${color}15`.

## 2. Goal Badge Uses Green

- [x] 2.1 In `MatchSquad.tsx` `PlayerAvatar`, change goal badge `backgroundColor` from `color` to `"#22c55e"`.

## 3. Myanmar Timezone for TODAY

- [x] 3.1 In `FixtureTab.tsx`, replace `const TODAY = new Date().toISOString().slice(0, 10)` with `Intl.DateTimeFormat` using `timeZone: "Asia/Yangon"` and `en-CA` locale.

## 4. Table +/- Column Shows GF-GA Format

- [x] 4.1 In `TableTab.tsx`, change the "+/-" column from `formatSignedGD(row.gd)` to `${row.gf}-${row.ga}` format.

## 5. Verification

- [x] 5.1 Run `npm run typecheck` and fix any type errors.
- [x] 5.2 Run `npm run lint` and fix any lint violations.
- [x] 5.3 Run `npm run build` and verify the build succeeds.
