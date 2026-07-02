## 1. Column Header Redesign

- [x] 1.1 Update column header row with subtle background fill and stronger uppercase typography (Player, #, G headers)
- [x] 1.2 Adjust column header padding and alignment to match new card-style row width

## 2. Player Row Card Styling

- [x] 2.1 Refactor non-scorer player rows to use card-style treatment (rounded-xl background, muted fill, consistent padding)
- [x] 2.2 Refactor scorer player rows to use team-color-tinted card with visible team-color border
- [x] 2.3 Add left-edge gradient accent to scorer rows using active team color
- [x] 2.4 Ensure non-scorer rows have no left-edge gradient accent

## 3. Spacing and Alignment

- [x] 3.1 Add uniform vertical gap spacing between player rows
- [x] 3.2 Ensure avatar, name, jersey number, and goal indicator are vertically centered within each row
- [x] 3.3 Adjust internal row padding for consistent visual rhythm

## 4. Typography Refinements

- [x] 4.1 Tighten line-height on player name (`font-myanmar`, `font-bold`)
- [x] 4.2 Increase visual weight on jersey number (`font-barlow`, larger size or bolder weight)
- [x] 4.3 Verify goal column header uses active team color

## 5. Verification

- [x] 5.1 Run `npm run typecheck` and confirm no type errors
- [x] 5.2 Run `npm run lint` and confirm no lint errors
- [x] 5.3 Run `npm run build` and confirm successful production build
- [x] 5.4 Visual check: verify player list renders correctly on mobile viewport (320px+)
