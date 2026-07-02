## Context

`MatchDesign.tsx` is a design prototype that demonstrates the approved visual design for the MatchSquad page. It uses mock data (`MOCK_SQUAD`, `MOCK_GOALS`) and a simplified inline `TeamCrest` component. The actual `MatchSquad.tsx` uses real data from `SQUADS` and `MATCH_EVENTS`, the shared `TeamCrest` component with logo support, and a compact row-based player list. This change ports the exact visual design from `MatchDesign.tsx` into `MatchSquad.tsx` while preserving all real data integration.

## Goals / Non-Goals

**Goals:**
- Implement the exact player card design from `MatchDesign.tsx`: 92px circular avatars, faded jersey number watermarks, position badges, goal badges
- Use real player data: names from `SQUADS`, profile photos from `player.profile_string_link`, goals from `MATCH_EVENTS`
- Maintain all existing functionality: match header, team tabs, routing, goal aggregation, profile photo fallbacks

**Non-Goals:**
- Changing the match header or team tabs design (already implemented correctly)
- Modifying the data model or how goals are aggregated
- Adding real position data to the `Player` interface (positions will be derived from jersey number)
- Changing the shared `TeamCrest` component

## Decisions

### 1. Position derivation from jersey number

Since the `Player` interface doesn't include position data, positions will be derived from jersey number using the same logic as `MatchDesign.tsx`:
- Number 1 = Goalkeeper (GK)
- Numbers 2-4 = Defender (DEF)
- Numbers 5-7 = Midfielder (MID)
- Numbers 8+ = Forward (FWD)

**Rationale**: Matches the design prototype exactly. Real position data could be added later as an enhancement.

**Alternative considered**: Adding position field to `Player` interface — rejected as it requires data model changes and manual data entry for all 13 teams.

### 2. Profile photo handling

The `PlayerCard` will use `player.profile_string_link` for the avatar image, with fallback to the football SVG if the URL is invalid or fails to load. This preserves the existing photo functionality from the current `MatchSquad.tsx`.

**Rationale**: Maintains the profile photo feature implemented in the previous change while matching the design's avatar styling.

### 3. Goal badge design

Replace `GoalIndicator` with `GoalBadge` from the design: a green-tinted pill showing football icons (up to 3) with "+N" for more goals. This matches the design prototype exactly.

**Rationale**: The design's goal badge is more visually polished than the current overlapping football icons.

### 4. Avatar size and layout

Use 92px circular avatars as shown in the design, with a 2px border. Scorers get green border (`border-green-500/60`) and green tinted background (`bg-green-500/10`). Non-scorers get subtle white border and background.

**Rationale**: Matches the design prototype. The large avatars make player cards more visually prominent.

### 5. Faded jersey number watermark

Add a 72px jersey number watermark positioned absolutely behind the player card content with 4% opacity (`text-foreground/[0.04]`). This creates a subtle visual accent without interfering with readability.

**Rationale**: Matches the design prototype exactly. Adds visual polish without functional impact.

## Risks / Trade-offs

- **[Large avatars on small screens]** → 92px avatars take more vertical space than the current compact rows. Mitigation: The card layout still fits well on 320px+ screens; vertical scrolling handles overflow.
- **[Position derivation accuracy]** → Deriving positions from jersey numbers is an approximation and may not match actual player positions. Mitigation: This is a visual design choice; if real position data is added later, the derivation logic can be replaced.
- **[Performance with large avatars and photos]** → Loading profile photos for all players may be slower than the current compact layout. Mitigation: Photos are already loaded in the current implementation; no additional performance impact expected.
