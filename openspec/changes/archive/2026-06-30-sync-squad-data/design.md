## Context

The `src/data/squads/` directory contains 14 squad files (one per team) plus a barrel `index.ts`. Two files (`IS_A_male.ts`, `IS_B_male.ts`) are properly formatted TypeScript modules with exports, typed `Player[]` arrays, and unique player IDs. The remaining 12 files are in one of two broken states:

- **7 files** (`CE_male.ts`, `EcE_A_male.ts`, `EcE_B_male.ts`, `AME_male.ts`, `PrE_A_male.ts`, `AME_female.ts`, `PrE_female.ts`) are bare JSON arrays — no `import`, no `export`, no `id` field on players, and `profile_string_link` set to `"none"` instead of `""`.
- **4 files** (`CE_female.ts`, `EcE_female.ts`, `IS_female.ts`, `PrE_B_male.ts`) are empty (0 bytes).

The barrel `index.ts` only imports and wires `IS_A_male` and `IS_B_male`. The other 12 teams are missing from the `SQUADS` map, so the squad view shows "Squad data not available yet" for those teams.

The `team-color` spec is already satisfied — `Team.color` exists on all teams and `MatchSquad.tsx` already reads it for accent colors.

## Goals / Non-Goals

**Goals:**
- Convert all 7 bare JSON squad files to proper TypeScript modules matching the `IS_A_male.ts` pattern.
- Assign unique player IDs using the `{major}_{group}_{seq}` convention (e.g., `CE_B_01`, `AME_F_03`).
- Create proper empty typed exports for the 4 empty squad files.
- Wire all 14 squads into `index.ts` so `SQUADS[teamId]` works for every team.
- Normalize `profile_string_link` from `"none"` to `""`.

**Non-Goals:**
- Adding new player data beyond what's already in the files.
- Changing the `Player` interface.
- Modifying team colors or the `team-color` spec.
- Changing the squad view UI.

## Decisions

### 1. Player ID convention for each team

**Decision**: Use the team's major abbreviation + group letter/identifier + zero-padded sequence number, matching the existing `IS_A_01` pattern.

| Team ID | ID prefix | Example |
|---------|-----------|---------|
| `PrE(A)` | `PrE_A_` | `PrE_A_01` |
| `IS(A)` | `IS_A_` | `IS_A_01` (already done) |
| `AME` | `AME_` | `AME_01` |
| `EcE(A)` | `EcE_A_` | `EcE_A_01` |
| `CE_M` | `CE_B_` | `CE_B_01` |
| `EcE(B)` | `EcE_B_` | `EcE_B_01` |
| `IS(B)` | `IS_B_` | `IS_B_01` (already done) |
| `PrE(B)` | `PrE_B_` | `PrE_B_01` |
| `IS_F` | `IS_F_` | `IS_F_01` |
| `CE_F` | `CE_F_` | `CE_F_01` |
| `PrE_F` | `PrE_F_` | `PrE_F_01` |
| `AME_F` | `AME_F_` | `AME_F_01` |
| `EcE_F` | `EcE_F_` | `EcE_F_01` |

**Rationale**: Consistency with the existing `IS_A_*` and `IS_B_*` IDs. The prefix is derived from the team ID to keep IDs globally unique.

### 2. Empty squad files export empty arrays

**Decision**: The 4 empty files (`CE_female.ts`, `EcE_female.ts`, `IS_female.ts`, `PrE_B_male.ts`) will export typed empty arrays (`Player[] = []`). They will still be wired into `index.ts`.

**Rationale**: The squad view already handles empty arrays gracefully ("Squad data not available yet"). Having the files as proper modules avoids special-casing in the barrel.

### 3. File naming convention

**Decision**: Keep existing file names. Each file name maps to a team:

| File | Team ID |
|------|---------|
| `PrE_A_male.ts` | `PrE(A)` |
| `IS_A_male.ts` | `IS(A)` |
| `AME_male.ts` | `AME` |
| `EcE_A_male.ts` | `EcE(A)` |
| `CE_male.ts` | `CE_M` |
| `EcE_B_male.ts` | `EcE(B)` |
| `IS_B_male.ts` | `IS(B)` |
| `PrE_B_male.ts` | `PrE(B)` |
| `IS_female.ts` | `IS_F` |
| `CE_female.ts` | `CE_F` |
| `PrE_female.ts` | `PrE_F` |
| `AME_female.ts` | `AME_F` |
| `EcE_female.ts` | `EcE_F` |

**Rationale**: File names already exist and follow a consistent pattern. The mapping to team IDs is straightforward.

## Risks / Trade-offs

- **[Manual ID assignment]** → Player IDs are assigned sequentially by file position. If players are reordered later, IDs won't match. Mitigation: IDs are stable as long as players aren't reordered; this is acceptable for a static dataset.
- **[Empty squads]** → 4 teams have no player data. Mitigation: The UI already handles this gracefully; data can be added later without code changes.
