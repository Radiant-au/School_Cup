## Why

Squad data files are in an inconsistent state: 7 files are bare JSON arrays without exports or player IDs (causing lint errors), 4 files are empty, and only 2 of 14 squads are wired into the barrel index. This prevents the squad view from displaying player data for most teams and breaks type safety.

## What Changes

- Convert all 7 bare JSON squad files to proper TypeScript modules with `export const`, typed `Player[]` arrays, and unique player IDs following the `{major}_{group}_{seq}` convention.
- Create proper empty-array exports for the 4 empty squad files (CE_female, EcE_female, IS_female, PrE_B_male).
- Wire all 14 squads into `src/data/squads/index.ts` so `SQUADS[teamId]` returns the correct player array for every team.
- Normalize `profile_string_link` values from `"none"` to `""` for consistency with existing IS_A/IS_B files.

## Capabilities

### New Capabilities

### Modified Capabilities
- `squad-data`: All squad files must be proper TypeScript modules with exports, typed arrays, and player IDs. The barrel index must include all 14 teams.

## Impact

- **`src/data/squads/CE_male.ts`**: Convert from bare JSON to typed export with player IDs.
- **`src/data/squads/EcE_A_male.ts`**: Convert from bare JSON to typed export with player IDs.
- **`src/data/squads/EcE_B_male.ts`**: Convert from bare JSON to typed export with player IDs.
- **`src/data/squads/AME_male.ts`**: Convert from bare JSON to typed export with player IDs.
- **`src/data/squads/PrE_A_male.ts`**: Convert from bare JSON to typed export with player IDs.
- **`src/data/squads/AME_female.ts`**: Convert from bare JSON to typed export with player IDs.
- **`src/data/squads/PrE_female.ts`**: Convert from bare JSON to typed export with player IDs.
- **`src/data/squads/CE_female.ts`**: Create proper empty typed export.
- **`src/data/squads/EcE_female.ts`**: Create proper empty typed export.
- **`src/data/squads/IS_female.ts`**: Create proper empty typed export.
- **`src/data/squads/PrE_B_male.ts`**: Create proper empty typed export.
- **`src/data/squads/index.ts`**: Import and wire all 14 squads into the SQUADS map.
