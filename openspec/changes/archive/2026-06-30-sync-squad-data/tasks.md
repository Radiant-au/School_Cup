## 1. Convert Bare JSON Squad Files to TypeScript Modules

- [x] 1.1 Convert `PrE_A_male.ts` (15 players) to proper TS module with `import type { Player }`, `export const PrE_A_male: Player[]`, and IDs `PrE_A_01` through `PrE_A_15`.
- [x] 1.2 Convert `AME_male.ts` (15 players) to proper TS module with IDs `AME_01` through `AME_15`.
- [x] 1.3 Convert `EcE_A_male.ts` (15 players) to proper TS module with IDs `EcE_A_01` through `EcE_A_15`.
- [x] 1.4 Convert `CE_male.ts` (16 players) to proper TS module with IDs `CE_B_01` through `CE_B_16`.
- [x] 1.5 Convert `EcE_B_male.ts` (15 players) to proper TS module with IDs `EcE_B_01` through `EcE_B_15`.
- [x] 1.6 Convert `AME_female.ts` (10 players) to proper TS module with IDs `AME_F_01` through `AME_F_10`.
- [x] 1.7 Convert `PrE_female.ts` (10 players) to proper TS module with IDs `PrE_F_01` through `PrE_F_10`.

## 2. Create Empty Squad File Exports

- [x] 2.1 Create `CE_female.ts` with `import type { Player }` and `export const CE_female: Player[] = []`.
- [x] 2.2 Create `EcE_female.ts` with `import type { Player }` and `export const EcE_female: Player[] = []`.
- [x] 2.3 Create `IS_female.ts` with `import type { Player }` and `export const IS_female: Player[] = []`.
- [x] 2.4 Create `PrE_B_male.ts` with `import type { Player }` and `export const PrE_B_male: Player[] = []`.

## 3. Wire All Squads into Barrel Index

- [x] 3.1 Update `src/data/squads/index.ts` to import all 14 squad files and add entries for all 14 team IDs in the `SQUADS` map.

## 4. Verification

- [x] 4.1 Run `npm run typecheck` and fix any type errors.
- [x] 4.2 Run `npm run lint` and fix any lint violations.
- [x] 4.3 Run `npm run build` and verify the build succeeds.
