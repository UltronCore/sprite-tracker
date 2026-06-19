# 🎮 Sprite Trade Stop — Fortnite Sprites Tracker

A fast, no-login web tracker for the **Fortnite Sprites** collection. Tap a sprite
to mark it **Missing → Have → Mastered**, filter by variant line
(**Normal / Gold / Gummy / Galaxy**), and export a shareable image of your
collection or your wishlist to post for trading.

**Live:** https://ultroncore.github.io/sprite-tracker/

Built for the **Sprite Trade Stop** Discord. No accounts, no server — your
collection is saved in your browser and encoded in the share link.

---

## ✨ Features
- **All 41 released sprites** (10 characters × Normal/Gold/Gummy/Galaxy + Burnt Peanut), data verified against [fortnite.gg/sprites](https://fortnite.gg/sprites). Toggle **unreleased** lines (Gem / Holofoil / Rift) as they get art.
- **Two views:** rich **Cards** or a dense **Checklist** (one tap = check it off) — the at-a-glance grid for "what do I still need."
- **One-tap status:** Missing → Have → Mastered (👑). Hover a "Have" card for the crown to jump straight to Mastered. (In-game, *Mastery* = extracting a sprite at max level.)
- **Filter by variant line** — see *all Gold*, *all Gummy*, *all Galaxy* at once (the headline ask), plus filter by status, **sort** by rarity/character/name, **hide mastered**, and **group by character**.
- **Live progress:** Collection x/41 and Mastery x/41 bars, plus a have/total count on every line chip and a **Runners season countdown**.
- **Bulk actions:** "Mark shown: Have / Missing" respect the current filter (e.g. filter Gold → mark all Gold have in one click).
- **Export images** styled like the ones people post:
  - 🖼️ **My Collection** (green) — everything you have + mastered.
  - 🔎 **Looking For** (red) — everything you still need.
- **Share link:** `?c=…` encodes your whole collection in the URL — paste it anywhere, it loads instantly. Also saved to `localStorage`.

## 🕹️ How to use
1. Open the site, tap sprites to set their status.
2. Use the **line chips** to focus on Gold / Gummy / Galaxy, etc.
3. Click **Export "Looking For"** and post the image in `#trade-portal` / `#show-collection`.
4. Click **Copy share link** to send your live collection to anyone.

## 🛠️ Editing the sprite list
Everything lives in [`data.js`](data.js). To add or release a sprite:
1. Add an entry to `SPRITES` (set `unreleased: false` to make it live).
2. Drop a matching `sprites/<id>.png` (512×512, transparent).
That's it — the grid, filters, progress, and exports pick it up automatically.

## 📁 Structure
```
sprite-tracker/
├── index.html      # shell
├── styles.css      # theme
├── data.js         # the sprite list (edit here)
├── app.js          # state, filters, save/share
├── export.js       # canvas export of the shareable images
├── sprites/        # one PNG per sprite (id.png)
└── siteimages/     # mascot used in the export header
```

## ⚖️ Disclaimer
Unofficial **fan-made** collection tracker. **Sprite artwork © Epic Games, Inc.**
Not affiliated with or endorsed by Epic Games. No personal data is collected or
uploaded — collection state stays in your browser and in the share link.

MIT licensed (code only; sprite images are Epic's property).
