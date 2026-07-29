/**
 * RUPL2 progress — localStorage only.
 * Fruit = ladder done + best Check & Type ≥ PASS_RATIO when those stages scored.
 */

const STORAGE_KEY = "rupl2-v0.1-progress";
export const PASS_RATIO = 0.8;

function emptyProgress() {
  return {
    version: 1,
    authorUnlock: false,
    unlocked: ["A1"],
    blocks: {},
  };
}

export function loadProgress() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyProgress();
    const data = JSON.parse(raw);
    if (!data || typeof data !== "object") return emptyProgress();
    if (!data.blocks) data.blocks = {};
    if (!Array.isArray(data.unlocked)) data.unlocked = ["A1"];
    return data;
  } catch {
    return emptyProgress();
  }
}

function saveProgress(p) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(p));
}

export function isAuthorUnlock() {
  return !!loadProgress().authorUnlock;
}

export function setAuthorUnlock(on) {
  const p = loadProgress();
  p.authorUnlock = !!on;
  if (on) {
    for (const lv of ["A1", "A2", "B1", "B2"]) {
      if (!p.unlocked.includes(lv)) p.unlocked.push(lv);
    }
  }
  saveProgress(p);
}

export function isLevelUnlocked(level) {
  const p = loadProgress();
  if (p.authorUnlock) return true;
  return (p.unlocked || []).includes(level);
}

export function getBlockProgress(blockId) {
  const p = loadProgress();
  return p.blocks[blockId] || null;
}

export function touchBlock(blockId) {
  const p = loadProgress();
  if (!p.blocks[blockId]) {
    p.blocks[blockId] = {
      modes: {},
      best: {},
      touchedAt: Date.now(),
    };
  } else {
    p.blocks[blockId].touchedAt = Date.now();
  }
  saveProgress(p);
}

/**
 * @param {string} blockId
 * @param {"intro"|"check"|"type"|"use"} mode
 * @param {{ score?: number, total?: number } | null} result
 */
export function completeMode(blockId, mode, result = null) {
  const p = loadProgress();
  if (!p.blocks[blockId]) {
    p.blocks[blockId] = { modes: {}, best: {}, touchedAt: Date.now() };
  }
  const b = p.blocks[blockId];
  b.modes[mode] = true;
  b.touchedAt = Date.now();
  if (result && typeof result.score === "number" && result.total > 0) {
    const ratio = result.score / result.total;
    const prev = b.best[mode];
    if (prev == null || ratio > prev) b.best[mode] = ratio;
  }
  saveProgress(p);
}

function modeDone(b, mode) {
  return !!(b && b.modes && b.modes[mode]);
}

function bestOk(b, mode) {
  if (!b || !b.best || b.best[mode] == null) {
    return modeDone(b, mode);
  }
  return b.best[mode] >= PASS_RATIO;
}

/** Honest fruit for a live node with content. */
export function hasFruit(blockId) {
  const b = getBlockProgress(blockId);
  if (!b) return false;
  const ladderDone =
    modeDone(b, "intro") &&
    modeDone(b, "check") &&
    modeDone(b, "type") &&
    modeDone(b, "use");
  if (!ladderDone) return false;
  return bestOk(b, "check") && bestOk(b, "type");
}

export function progressLabel(node) {
  if (node.status === "planned") return "planowane";
  if (hasFruit(node.id)) return "owoc";
  const b = getBlockProgress(node.id);
  if (!b || !b.modes) return "żywe";
  const done = ["intro", "check", "type", "use"].filter((m) => b.modes[m]);
  if (done.length === 0) return "żywe";
  return `${done.length}/4`;
}

export function nodeProgressState(node) {
  if (node.status !== "live") return "planned";
  if (hasFruit(node.id)) return "fruit";
  const b = getBlockProgress(node.id);
  if (b && b.modes && Object.keys(b.modes).length) return "started";
  return "live";
}

/** 0–1 fill for a root from live children. */
export function rootFill(tree, rootId) {
  const live = (tree.nodes || []).filter(
    (n) => n.root === rootId && n.status === "live" && n.levels?.includes("A1"),
  );
  if (!live.length) return 0;
  let sum = 0;
  for (const n of live) {
    if (hasFruit(n.id)) sum += 1;
    else {
      const b = getBlockProgress(n.id);
      if (b?.modes) {
        const parts = ["intro", "check", "type", "use"];
        sum += parts.filter((m) => b.modes[m]).length / 4;
      }
    }
  }
  return sum / live.length;
}

export function tapFill(tree) {
  const live = (tree.nodes || []).filter(
    (n) => n.foundation && n.status === "live" && n.levels?.includes("A1"),
  );
  if (!live.length) return 0;
  let sum = 0;
  for (const n of live) {
    if (hasFruit(n.id)) sum += 1;
    else {
      const b = getBlockProgress(n.id);
      if (b?.modes) {
        const parts = ["intro", "check", "type", "use"];
        sum += parts.filter((m) => b.modes[m]).length / 4;
      }
    }
  }
  return sum / live.length;
}

export function resetAllProgress() {
  localStorage.removeItem(STORAGE_KEY);
}
