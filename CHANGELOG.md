# Changelog — Sprite Trade Stop Sprites Tracker

## [1.1.0] — 2026-06-19
Research + QA pass (validated against fortnite.gg/sprites for the "Runners" season).
### Added
- **Checklist view** — dense compact grid (sprite thumb + check box: empty = missing,
  green dot = have, 👑 = mastered), matching the community "Sprite Checklist" style.
- **Sort** by Rarity / Character / Name (plus Default data order).
- **Hide mastered** filter and a **Runners (Ch7 S3)** season banner with a live countdown.
### Verified / fixed
- Confirmed the 41-sprite set + rarities against fortnite.gg; Galaxy is correctly
  marked released (went live 2026-06-18). Documented that game-data Cube/Quack
  variants exist but lack icons, so they're intentionally omitted until art ships.
- QA'd share-link round-trip, export images, filters, and mobile layout.

## [1.0.0] — 2026-06-19
Initial tracker: 41 sprites, variant-line filters, Have/Missing/Mastered, progress
bars, share link, and canvas export of "My Collection" / "Looking For" images.
