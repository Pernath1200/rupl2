/**
 * RUPL2 — A1 Polish grammar practice map (seedling shell)
 * Sibling product language of RUCZ2; Polish syllabus & EN→PL production.
 */

import { startPractice } from "./practice.js?v=2026-07-28-match-all";
import {
  loadProgress,
  isAuthorUnlock,
  setAuthorUnlock,
  isLevelUnlocked,
  progressLabel,
  nodeProgressState,
  rootFill,
  tapFill,
  hasFruit,
} from "./progress.js?v=2026-07-28-match-all";
import {
  mountSmokeFlagsUI,
  getSmokeApi,
  setSmokeContext,
  countFlags,
  updateFlagsBadge,
} from "./smoke-flags.js?v=2026-07-28-match-all";

const STATE = {
  level: "A1",
  tree: null,
  spine: null,
  selectedId: null,
  view: "map",
};

const THIS_APP = "rupl2";
const OTHER_APP = "rupl3";

async function loadJson(path) {
  const res = await fetch(path, { cache: "no-store" });
  if (!res.ok) throw new Error(`Could not load ${path}`);
  return res.json();
}

function showMap() {
  // Drop practice keyboard handlers if still attached
  const pr = document.getElementById("practice-root");
  if (pr && typeof pr._rupl2UnbindKeys === "function") {
    pr._rupl2UnbindKeys();
    pr._rupl2UnbindKeys = null;
  }
  STATE.view = "map";
  document.getElementById("view-map").hidden = false;
  document.getElementById("view-practice").hidden = true;
  renderAll();
}

function showPractice() {
  STATE.view = "practice";
  document.getElementById("view-map").hidden = true;
  document.getElementById("view-practice").hidden = false;
}

function nodesForLevel(level) {
  return (STATE.tree?.nodes || []).filter((n) => n.levels.includes(level));
}

function nodeById(id) {
  return (STATE.tree?.nodes || []).find((n) => n.id === id) || null;
}

function renderRail() {
  const rail = document.getElementById("level-rail");
  const levels = STATE.tree?.levels || ["A1", "A2", "B1", "B2"];
  if (!isLevelUnlocked(STATE.level)) STATE.level = "A1";

  rail.innerHTML = "";
  for (const lv of levels) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "level-btn";
    const locked = !isLevelUnlocked(lv);
    if (locked) {
      btn.classList.add("is-locked");
      btn.disabled = true;
      btn.innerHTML = `${lv}<span class="tag">zablokowane</span>`;
      btn.title = "A2+ później — lub tryb autorski";
    } else {
      btn.setAttribute("aria-pressed", lv === STATE.level ? "true" : "false");
      btn.textContent = lv;
      btn.addEventListener("click", () => {
        STATE.level = lv;
        renderAll();
      });
    }
    rail.appendChild(btn);
  }
}

function otherAppUrl() {
  const spine = STATE.spine;
  if (!spine?.urls) return "http://localhost:8094/";
  const local =
    typeof location !== "undefined" &&
    (location.hostname === "localhost" || location.hostname === "127.0.0.1");
  if (local) return spine.urls.rupl3_local || "http://localhost:8094/";
  return spine.urls.rupl3_pages || spine.urls.rupl3_local || "http://localhost:8094/";
}

/** First spine step where this app's live node lacks fruit. */
function spineStepForThisApp() {
  const steps = STATE.spine?.steps || [];
  for (const step of steps) {
    const side = step[THIS_APP];
    if (!side?.node_id || side.status === "planned" || side.status === "skip")
      continue;
    const node = nodeById(side.node_id);
    if (!node || node.status !== "live" || !node.levels.includes(STATE.level)) continue;
    if (!hasFruit(node.id)) return { step, side, node };
  }
  return null;
}

function renderUpNext() {
  const el = document.getElementById("up-next");
  if (!el) return;

  const spineHit = spineStepForThisApp();
  const order = STATE.tree?.path_order || [];
  const pathNext = order
    .map((id) => nodeById(id))
    .find(
      (n) =>
        n &&
        n.levels.includes(STATE.level) &&
        n.status === "live" &&
        !hasFruit(n.id),
    );
  const next = spineHit?.node || pathNext;
  const pair = spineHit?.step?.[OTHER_APP];
  const unitId = spineHit?.step?.id;
  const caseTags = (spineHit?.step?.case_tags || []).join(" · ");

  if (!next) {
    el.innerHTML = `
      <p class="tree-legend">Wszystkie żywe owoce A1 zebrane — albo otwórz węzeł poniżej. Planowane tematy odblokują się, gdy przyjdzie treść.</p>
      <p class="spine-pair"><a class="today-link" href="${escapeHtml(otherAppUrl())}" target="_blank" rel="noopener">Otwórz RUPL3 (słownictwo) →</a>
      <span class="today-muted"> · soft link · postęp osobny</span></p>`;
    return;
  }

  const pairLine = pair
    ? `<p class="spine-pair">
         <span class="spine-badge">ścieżka</span>
         ${unitId ? `<code>${escapeHtml(unitId)}</code>` : ""}
         ${caseTags ? ` · <span class="today-muted">${escapeHtml(caseTags)}</span>` : ""}
         <br />
         <strong>Potem RUPL3 (użycie):</strong>
         <a class="today-link" href="${escapeHtml(otherAppUrl())}" target="_blank" rel="noopener">${escapeHtml(pair.label || "RUPL3")}</a>
         <span class="today-muted"> · soft link (nie blokuje)</span>
       </p>`
    : `<p class="spine-pair"><span class="today-muted">Ścieżka: PL-A1-SPINE · zigzag z RUPL3</span></p>`;

  el.innerHTML = `
    <p class="tree-legend">Zigzag: <strong>RUPL2 uczy system</strong> → RUPL3 wydaje go w tematach. Grzeczność (Dzień dobry…) = tylko RUPL3.</p>
    <button type="button" class="btn primary" id="btn-continue-next">Pokaż na ścieżce · ${escapeHtml(next.label)}</button>
    <p class="tree-legend" style="margin-top:0.5rem">${escapeHtml(next.note || "")} · nie otwiera ćwiczenia — przewinie do przycisku <strong>Ćwicz</strong>.</p>
    ${pairLine}
    <p style="margin:0.65rem 0 0">
      <a class="btn" href="${escapeHtml(otherAppUrl())}" target="_blank" rel="noopener">RUPL3 →</a>
    </p>
  `;
  el.querySelector("#btn-continue-next")?.addEventListener("click", () => {
    focusNodeOnMap(next);
  });
}

/** Select a path node and scroll to its Ćwicz button — do not start practice. */
function focusNodeOnMap(node) {
  if (!node) return;
  STATE.selectedId = node.id;
  renderPath();
  renderDetail();
  requestAnimationFrame(() => {
    const detailCard =
      document.getElementById("node-detail-card") ||
      document.getElementById("node-detail")?.closest(".card") ||
      document.getElementById("node-detail");
    detailCard?.scrollIntoView({ behavior: "smooth", block: "center" });
    const go = document.querySelector("#node-actions .btn:not(:disabled)");
    if (go) {
      go.classList.add("is-focus-target");
      try {
        go.focus({ preventScroll: true });
      } catch {
        go.focus();
      }
      setTimeout(() => go.classList.remove("is-focus-target"), 1600);
    }
  });
}

function renderRoots() {
  const strip = document.getElementById("roots-strip");
  strip.innerHTML = "";
  const roots = STATE.tree?.roots || [];
  const tap = rootChip("Kół", tapFill(STATE.tree));
  strip.appendChild(tap);
  for (const r of roots) {
    strip.appendChild(rootChip(r.label, rootFill(STATE.tree, r.id)));
  }
}

function rootChip(name, fill) {
  const pct = Math.round((fill || 0) * 100);
  const div = document.createElement("div");
  div.className = "root-chip";
  div.innerHTML = `
    <div class="name">${escapeHtml(name)}</div>
    <div class="bar"><i style="width:${pct}%"></i></div>
    <div class="pct">${pct}%</div>
  `;
  return div;
}

function renderPath() {
  const list = document.getElementById("path-list");
  list.innerHTML = "";
  const order = STATE.tree?.path_order || [];
  let n = 0;
  for (const id of order) {
    const node = nodeById(id);
    if (!node || !node.levels.includes(STATE.level)) continue;
    n += 1;
    const li = document.createElement("li");
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "path-item";
    btn.setAttribute(
      "aria-pressed",
      STATE.selectedId === node.id ? "true" : "false",
    );
    const st = nodeProgressState(node);
    const label = progressLabel(node);
    let statusCls = "status";
    if (st === "fruit") statusCls += " is-fruit";
    else if (st === "planned") statusCls += " is-planned";
    else statusCls += " is-live";

    btn.innerHTML = `
      <span class="n">${n}</span>
      <span class="meta">
        <span class="title">${escapeHtml(node.label)}</span>
        ${node.label_en ? `<span class="title-pl"> · ${escapeHtml(node.label_en)}</span>` : ""}
        ${node.note ? `<span class="note">${escapeHtml(node.note)}</span>` : ""}
      </span>
      <span class="${statusCls}">${escapeHtml(label)}</span>
    `;
    btn.addEventListener("click", () => {
      STATE.selectedId = node.id;
      renderPath();
      renderDetail();
    });
    li.appendChild(btn);
    list.appendChild(li);
  }
}

function renderDetail() {
  const box = document.getElementById("node-detail");
  const node = nodeById(STATE.selectedId);
  if (!node) {
    box.innerHTML =
      "<p class=\"tree-legend\">Wybierz węzeł na ścieżce.</p>";
    return;
  }
  const st = nodeProgressState(node);
  const pills = [];
  if (node.status === "live") pills.push('<span class="pill live">żywe</span>');
  else pills.push('<span class="pill">planowane</span>');
  if (st === "fruit") pills.push('<span class="pill fruit">owoc</span>');
  if (node.foundation) pills.push('<span class="pill">fundament</span>');

  const rootLabel =
    node.root === "tap_root"
      ? "Kół"
      : STATE.tree.roots.find((r) => r.id === node.root)?.label || node.root;

  box.innerHTML = `
    <div>${pills.join("")}</div>
    <p class="practice-prompt" style="margin-top:0.5rem">${escapeHtml(node.label)}
      ${node.label_en ? `<span style="color:var(--muted);font-weight:400"> · ${escapeHtml(node.label_en)}</span>` : ""}
    </p>
    <p class="tree-legend">Korzeń: ${escapeHtml(rootLabel)} · ${escapeHtml(node.note || "")}</p>
    <div class="node-actions" id="node-actions"></div>
  `;
  const actions = box.querySelector("#node-actions");
  if (node.status === "live" && node.content) {
    const go = document.createElement("button");
    go.type = "button";
    go.className = "btn";
    go.textContent = "Ćwicz →";
    go.addEventListener("click", () => openNode(node));
    actions.appendChild(go);
  } else {
    const wait = document.createElement("button");
    wait.type = "button";
    wait.className = "btn";
    wait.disabled = true;
    wait.textContent = "Treść wkrótce";
    actions.appendChild(wait);
  }
}

async function openNode(node) {
  if (node.status !== "live" || !node.content) return;
  try {
    const pack = await loadJson(`./data/${node.content}`);
    showPractice();
    const root = document.getElementById("practice-root");
    startPractice(pack, root, {
      onExit: () => {
        // Drop any leftover Enter handlers from practice
        showMap();
      },
    });
  } catch (e) {
    const err = document.getElementById("boot-error");
    err.hidden = false;
    err.textContent = String(e.message || e);
  }
}

function renderAuthor() {
  const btn = document.getElementById("btn-author-unlock");
  const on = isAuthorUnlock();
  btn.setAttribute("aria-pressed", on ? "true" : "false");
  btn.textContent = on ? "Tryb autorski WŁ" : "Tryb autorski";
  const hint = document.getElementById("author-hint");
  if (on) {
    hint.hidden = false;
    hint.textContent =
      "Tryb autorski: poziomy A2–B2 otwarte (na razie bez treści). Tylko lokalnie.";
  } else {
    hint.hidden = true;
  }
}

function renderAll() {
  loadProgress();
  renderAuthor();
  renderRail();
  renderUpNext();
  renderRoots();
  renderPath();
  if (!STATE.selectedId) {
    const firstLive = (STATE.tree.path_order || [])
      .map((id) => nodeById(id))
      .find((n) => n?.status === "live");
    STATE.selectedId = firstLive?.id || STATE.tree.path_order?.[0] || null;
  }
  renderDetail();
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

async function boot() {
  const err = document.getElementById("boot-error");
  try {
    STATE.tree = await loadJson("./data/tree.json");
    try {
      STATE.spine = await loadJson("./data/spine.json");
    } catch {
      STATE.spine = null;
    }
    document.getElementById("btn-author-unlock").addEventListener("click", () => {
      setAuthorUnlock(!isAuthorUnlock());
      renderAll();
    });
    // Always-visible shell back (not inside pack re-renders / cache)
    document.getElementById("btn-practice-back")?.addEventListener("click", () => {
      showMap();
    });

    // Smoke flags (RUE2 model) — host + always-visible toolbar in practice
    const smokeHost = document.getElementById("smoke-flags-host");
    if (smokeHost) mountSmokeFlagsUI(smokeHost);
    updateFlagsBadge();
    document.getElementById("p-flag")?.addEventListener("click", () => {
      const ti = document.querySelector("#practice-root #ans");
      if (ti && "value" in ti) {
        setSmokeContext({ typed: String(ti.value || "") });
      }
      getSmokeApi()?.openForm();
    });
    document.getElementById("p-flag-list")?.addEventListener("click", () => {
      getSmokeApi()?.openList();
    });

    const params = new URLSearchParams(location.search);
    if (params.get("unlock") === "all") {
      setAuthorUnlock(true);
    }
    renderAll();
  } catch (e) {
    err.hidden = false;
    err.textContent = String(e.message || e);
  }
}

boot();
