/* Sprite Trade Stop — tracker logic (vanilla JS, no build step). */

// Status values per sprite id: 0 = missing, 1 = have (collected), 2 = mastered.
const STATUS = { MISSING: 0, HAVE: 1, MASTERED: 2 };
const STORAGE_KEY = "sts_sprite_tracker_v1";

const state = {
  status: {},                 // id -> 0|1|2
  themeFilter: "all",
  statusFilter: "all",
  groupByCharacter: false,
  showUnreleased: false,
  hideMastered: false,
  view: "cards",              // cards | checklist
  sort: "default",
};

// Season facts (Chapter 7 Season 3 "Runners"). Source: fortnite.gg / Epic.
const SEASON = { name: "Runners", start: "2026-06-06", end: "2026-08-19" };
const RARITY_ORDER = { mythic: 0, legendary: 1, epic: 2, rare: 3, special: 4 };

// ---- persistence ---------------------------------------------------------
function load() {
  // URL share code wins (so a pasted link shows that collection), else storage.
  const params = new URLSearchParams(location.search);
  const code = params.get("c");
  if (code && unpackCode(code)) return;
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
    if (saved && typeof saved === "object") state.status = saved.status || {};
    if (saved.showUnreleased) state.showUnreleased = true;
    if (saved.view) state.view = saved.view;
    if (saved.sort) state.sort = saved.sort;
  } catch (_) { /* ignore */ }
}

function save() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({
    status: state.status, showUnreleased: state.showUnreleased,
    view: state.view, sort: state.sort,
  }));
}

// ---- share code: 2 bits per sprite in SHARE_ORDER, base64url ----------
function packCode() {
  const vals = SHARE_ORDER.map((id) => state.status[id] || 0);
  const bytes = [];
  for (let i = 0; i < vals.length; i += 4) {
    bytes.push((vals[i] || 0) | ((vals[i + 1] || 0) << 2) |
               ((vals[i + 2] || 0) << 4) | ((vals[i + 3] || 0) << 6));
  }
  let bin = "";
  bytes.forEach((b) => { bin += String.fromCharCode(b); });
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function unpackCode(code) {
  try {
    const bin = atob(code.replace(/-/g, "+").replace(/_/g, "/"));
    const status = {};
    for (let i = 0; i < SHARE_ORDER.length; i++) {
      const byte = bin.charCodeAt(i >> 2) || 0;
      status[SHARE_ORDER[i]] = (byte >> ((i % 4) * 2)) & 0b11;
    }
    state.status = status;
    return true;
  } catch (_) { return false; }
}

// ---- helpers -------------------------------------------------------------
function visibleSprites() {
  return SPRITES.filter((s) => state.showUnreleased || !s.unreleased);
}
function inScope(s) { return state.showUnreleased || !s.unreleased; }
function st(id) { return state.status[id] || 0; }

function progress() {
  const scope = visibleSprites();
  const total = scope.length;
  const collected = scope.filter((s) => st(s.id) >= 1).length;
  const mastered = scope.filter((s) => st(s.id) === 2).length;
  return { total, collected, mastered };
}

function matchesFilters(s) {
  if (!inScope(s)) return false;
  if (state.themeFilter !== "all" && s.theme !== state.themeFilter) return false;
  const v = st(s.id);
  if (state.hideMastered && v === 2) return false;
  if (state.statusFilter === "have" && v < 1) return false;
  if (state.statusFilter === "missing" && v !== 0) return false;
  if (state.statusFilter === "mastered" && v !== 2) return false;
  return true;
}

// Apply the chosen sort to a list (keeps the data-file order for "default").
function sortList(list) {
  const arr = list.slice();
  if (state.sort === "rarity") {
    arr.sort((a, b) => (RARITY_ORDER[a.rarity.toLowerCase()] - RARITY_ORDER[b.rarity.toLowerCase()])
      || a.name.localeCompare(b.name));
  } else if (state.sort === "character") {
    arr.sort((a, b) => a.character.localeCompare(b.character) || a.name.localeCompare(b.name));
  } else if (state.sort === "name") {
    arr.sort((a, b) => a.name.localeCompare(b.name));
  }
  return arr;
}

function statusLabel(v) { return v === 2 ? "MASTERED" : v === 1 ? "COLLECTED" : "MISSING"; }
function statusClass(v) { return v === 2 ? "mastered" : v === 1 ? "have" : "missing"; }

// ---- rendering -----------------------------------------------------------
const grid = document.getElementById("grid");

function cardHTML(s) {
  const v = st(s.id);
  const unrel = s.unreleased ? '<div class="unrel-badge">SOON</div>' : "";
  const master = v === 1
    ? '<div class="master-toggle" data-master="' + s.id + '" title="Mark Mastered">👑</div>' : "";
  return `
    <div class="card ${statusClass(v)} rarity-${s.rarity.toLowerCase()}" data-id="${s.id}">
      <div class="art">
        <img src="sprites/${s.id}.png" alt="${s.name}" loading="lazy"
             onerror="this.style.visibility='hidden'">
        <div class="status-badge">${statusLabel(v)}</div>
        ${unrel}${master}
        <div class="rarity-tag">${s.rarity.toUpperCase()}</div>
      </div>
      <div class="name">${s.name}</div>
    </div>`;
}

function render() {
  // progress bars
  const p = progress();
  document.getElementById("collectionCount").textContent = `${p.collected} / ${p.total}`;
  document.getElementById("masteryCount").textContent = `${p.mastered} / ${p.total}`;
  document.getElementById("collectionBar").style.width = p.total ? (p.collected / p.total * 100) + "%" : "0";
  document.getElementById("masteryBar").style.width = p.total ? (p.mastered / p.total * 100) + "%" : "0";

  const renderer = state.view === "checklist" ? checkHTML : cardHTML;
  grid.classList.toggle("checklist", state.view === "checklist");

  const shown = sortList(SPRITES.filter(matchesFilters));
  let html = "";
  if (state.groupByCharacter) {
    const order = [...new Set(SPRITES.map((s) => s.character))];
    order.forEach((char) => {
      const items = shown.filter((s) => s.character === char);
      if (!items.length) return;
      html += `<div class="group-head">${char}</div>`;
      html += items.map(renderer).join("");
    });
  } else {
    html = shown.map(renderer).join("");
  }
  grid.innerHTML = html || `<div class="group-head">Nothing matches this filter.</div>`;
  updateThemeChipCounts();
}

const RARITY_HEX = {
  rare: "#2ea4ff", epic: "#b15cff", legendary: "#ff8a2a", mythic: "#ffd23a", special: "#28e0c8",
};

// compact checklist tile
function checkHTML(s) {
  const v = st(s.id);
  return `
    <div class="check ${statusClass(v)}" data-id="${s.id}" title="${s.name} — ${s.rarity}">
      <span class="rar-dot" style="background:${RARITY_HEX[s.rarity.toLowerCase()] || "#888"}"></span>
      <img src="sprites/${s.id}.png" alt="${s.name}" loading="lazy" onerror="this.style.visibility='hidden'">
      <div class="box"></div>
      <div class="cname">${s.name}</div>
    </div>`;
}

// theme chips (built once)
function buildThemeChips() {
  const wrap = document.getElementById("themeFilters");
  const chips = [{ key: "all", label: "All lines" }].concat(
    THEMES.filter((t) => t.released || state.showUnreleased)
          .map((t) => ({ key: t.key, label: t.label }))
  );
  wrap.innerHTML = chips.map((c) =>
    `<button class="chip theme-chip ${c.key === state.themeFilter ? "active" : ""}"
       data-theme="${c.key}">${c.label}<span class="count" data-count="${c.key}"></span></button>`
  ).join("");
}

function updateThemeChipCounts() {
  document.querySelectorAll("[data-count]").forEach((el) => {
    const key = el.getAttribute("data-count");
    const pool = visibleSprites().filter((s) => key === "all" || s.theme === key);
    const have = pool.filter((s) => st(s.id) >= 1).length;
    el.textContent = pool.length ? `${have}/${pool.length}` : "";
  });
}

// ---- interactions --------------------------------------------------------
function cycle(id) {
  state.status[id] = (st(id) + 1) % 3; // missing -> have -> mastered -> missing
  save(); render();
}

grid.addEventListener("click", (e) => {
  const masterEl = e.target.closest("[data-master]");
  if (masterEl) {
    e.stopPropagation();
    const id = masterEl.getAttribute("data-master");
    state.status[id] = st(id) === 2 ? 1 : 2;
    save(); render();
    return;
  }
  const card = e.target.closest(".card, .check");
  if (card) cycle(card.getAttribute("data-id"));
});

// theme filter chips
document.getElementById("themeFilters").addEventListener("click", (e) => {
  const chip = e.target.closest(".theme-chip");
  if (!chip) return;
  state.themeFilter = chip.getAttribute("data-theme");
  document.querySelectorAll(".theme-chip").forEach((c) => c.classList.toggle("active", c === chip));
  render();
});

// status filter chips
document.getElementById("statusFilters").addEventListener("click", (e) => {
  const chip = e.target.closest(".status-chip");
  if (!chip) return;
  state.statusFilter = chip.getAttribute("data-status");
  document.querySelectorAll(".status-chip").forEach((c) => c.classList.toggle("active", c === chip));
  render();
});

document.getElementById("groupByCharacter").addEventListener("change", (e) => {
  state.groupByCharacter = e.target.checked; render();
});
document.getElementById("hideMastered").addEventListener("change", (e) => {
  state.hideMastered = e.target.checked; render();
});
document.getElementById("sortSelect").addEventListener("change", (e) => {
  state.sort = e.target.value; save(); render();
});
document.getElementById("viewToggle").addEventListener("click", (e) => {
  const btn = e.target.closest(".vt-btn");
  if (!btn) return;
  state.view = btn.getAttribute("data-view");
  document.querySelectorAll(".vt-btn").forEach((b) => b.classList.toggle("active", b === btn));
  save(); render();
});
document.getElementById("showUnreleased").addEventListener("change", (e) => {
  state.showUnreleased = e.target.checked; buildThemeChips(); save(); render();
});

// bulk actions operate on the CURRENTLY SHOWN (filtered) sprites
function shownNow() { return SPRITES.filter(matchesFilters); }
document.getElementById("markHaveBtn").addEventListener("click", () => {
  shownNow().forEach((s) => { if (st(s.id) === 0) state.status[s.id] = 1; });
  save(); render(); toast("Marked shown sprites as Have");
});
document.getElementById("markMissingBtn").addEventListener("click", () => {
  shownNow().forEach((s) => { state.status[s.id] = 0; });
  save(); render(); toast("Marked shown sprites as Missing");
});
document.getElementById("resetBtn").addEventListener("click", () => {
  if (!confirm("Reset your whole collection?")) return;
  state.status = {}; save(); render(); toast("Collection reset");
});

// share
document.getElementById("shareBtn").addEventListener("click", async () => {
  const url = `${location.origin}${location.pathname}?c=${packCode()}`;
  try { await navigator.clipboard.writeText(url); toast("Share link copied!"); }
  catch (_) { prompt("Copy your share link:", url); }
});

// copy just the sync code (for the Discord bot's /synccollection)
document.getElementById("syncBtn").addEventListener("click", async () => {
  const code = packCode();
  try { await navigator.clipboard.writeText(code); toast("Sync code copied — paste it into /synccollection"); }
  catch (_) { prompt("Copy your sync code, then run /synccollection in Discord:", code); }
});

// export (export.js)
document.getElementById("exportCollectionBtn").addEventListener("click", () => exportImage("collection"));
document.getElementById("exportMissingBtn").addEventListener("click", () => exportImage("missing"));

// toast
let toastTimer;
function toast(msg) {
  const t = document.getElementById("toast");
  t.textContent = msg; t.classList.add("show");
  clearTimeout(toastTimer); toastTimer = setTimeout(() => t.classList.remove("show"), 2200);
}
window.stsToast = toast;

// season countdown line in the header
function renderSeason() {
  const el = document.getElementById("seasonDays");
  if (!el) return;
  const end = new Date(SEASON.end + "T00:00:00Z");
  const days = Math.ceil((end - new Date()) / 86400000);
  el.textContent = days > 0
    ? `Sprites · ${days} days left (ends Aug 19)`
    : "Sprites";
}

// ---- boot ----------------------------------------------------------------
load();
document.getElementById("showUnreleased").checked = state.showUnreleased;
document.getElementById("sortSelect").value = state.sort;
document.querySelectorAll(".vt-btn").forEach((b) =>
  b.classList.toggle("active", b.getAttribute("data-view") === state.view));
buildThemeChips();
renderSeason();
render();
