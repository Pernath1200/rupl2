/**
 * RUPL2 ladder: Wstęp → Kontrola → Pisanie → Użycie
 * EN → PL production. Diacritics kept (not stripped).
 *
 * Shell patterns ported from RUE2 spirit:
 * - single Enter router (state.enterAdvance) — never exits to map
 * - ← Wstecz do mapy is mouse-only (shell #btn-practice-back, tabindex -1)
 * - intro nav: Wstecz / Dalej · Enter = Dalej · Backspace = Wstecz
 * - Polish chrome labels
 *
 * Type modes: full_word | ending_gap (morphology packs)
 */

import { completeMode, touchBlock, PASS_RATIO } from "./progress.js";
import { setSmokeContext } from "./smoke-flags.js";

function shuffle(a) {
  const arr = a.slice();
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function norm(s) {
  return String(s)
    .toLowerCase()
    .replace(/[!?.,;:"'()]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function normEnding(s) {
  return String(s)
    .toLowerCase()
    .replace(/[!?.,;:"'()\s]/g, "")
    .trim();
}

function typeModeOf(pack, item) {
  if (item && item.mode) return item.mode;
  if (pack?.type?.mode) return pack.type.mode;
  if (pack?.default_type_mode) return pack.default_type_mode;
  if (pack?.kind === "morphology" || pack?.morphology === true) return "ending_gap";
  return "full_word";
}

function fullFormOf(item) {
  if (item.full != null && item.full !== "") return String(item.full);
  if (item.stem != null && item.ending != null) return `${item.stem}${item.ending}`;
  if (item.answer != null) return String(item.answer);
  return "";
}

function acceptsList(item, mode) {
  const raw = [];
  if (mode === "ending_gap") {
    if (item.ending != null) raw.push(item.ending);
    if (Array.isArray(item.accepts)) raw.push(...item.accepts);
    return [...new Set(raw.map(normEnding).filter((x) => x !== ""))];
  }
  if (item.answer != null) raw.push(item.answer);
  if (Array.isArray(item.accepts)) raw.push(...item.accepts);
  return [...new Set(raw.map(norm).filter(Boolean))];
}

function isCorrect(user, item, mode) {
  if (mode === "ending_gap") {
    const u = normEnding(user);
    if (!u) return false;
    return acceptsList(item, mode).includes(u);
  }
  const u = norm(user);
  if (!u) return false;
  return acceptsList(item, mode).includes(u);
}

function el(html) {
  const d = document.createElement("div");
  d.innerHTML = html.trim();
  return d.firstElementChild;
}

function pairPl(p) {
  return p.pl || p.cz || "";
}

/**
 * @param {object} pack
 * @param {HTMLElement} root
 * @param {{ onExit: () => void }} opts
 */
export function startPractice(pack, root, opts) {
  touchBlock(pack.id);

  setSmokeContext({
    packId: pack.id || pack.tree_node || "",
    packTitle: pack.title || "",
    stage: "intro",
    checkPhase: "",
    itemIndex: null,
    en: "",
    pl: "",
    gap: "",
    gap_answer: "",
    typed: "",
  });

  const state = {
    stage: "intro",
    checkPhase: "match",
    introIndex: 0,
    matchPairs: [],
    matchChoices: {},
    matchSubmitted: false,
    quizItems: [],
    quizIndex: 0,
    quizScore: 0,
    typeItems: [],
    typeIndex: 0,
    typeScore: 0,
    useItems: [],
    useIndex: 0,
    useScore: 0,
    checkScore: 0,
    checkTotal: 0,
    /** @type {null | (() => void)} */
    enterAdvance: null,
    /** @type {null | (() => void)} */
    onBackKey: null,
    enterOnSelect: false,
    /** @type {null | ((e: KeyboardEvent) => void)} */
    digitHandler: null,
  };

  // ---- RUE2-style key router (one capture handler for the whole practice) ----
  function clearAdvance() {
    if (state.digitHandler) {
      document.removeEventListener("keydown", state.digitHandler, true);
      state.digitHandler = null;
    }
    state.enterAdvance = null;
    state.onBackKey = null;
    state.enterOnSelect = false;
  }

  function isTypingTarget(t) {
    if (!t || !t.closest) return false;
    return !!t.closest("input, textarea, [contenteditable=true]");
  }

  function onPracticeKeydown(e) {
    const t = e.target;

    // Back to map: never leave on Enter/Space — advance ladder instead (RUE2)
    if (t && t.closest && t.closest("#btn-practice-back")) {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        e.stopPropagation();
        if (e.key === "Enter" && typeof state.enterAdvance === "function") {
          state.enterAdvance();
        }
      }
      return;
    }

    if (e.key === "Backspace" && typeof state.onBackKey === "function") {
      if (isTypingTarget(t)) return;
      e.preventDefault();
      e.stopPropagation();
      state.onBackKey();
      return;
    }

    if (e.key !== "Enter" || e.shiftKey) return;
    if (t && t.closest && t.closest("textarea")) return;
    if (t && t.tagName === "SELECT" && !state.enterOnSelect) return;

    if (typeof state.enterAdvance !== "function") return;

    e.preventDefault();
    e.stopPropagation();
    state.enterAdvance();
  }

  document.addEventListener("keydown", onPracticeKeydown, true);

  function teardown() {
    clearAdvance();
    document.removeEventListener("keydown", onPracticeKeydown, true);
    root._rupl2UnbindKeys = null;
  }

  root._rupl2UnbindKeys = teardown;

  const exitToMap = () => {
    teardown();
    opts.onExit();
  };

  function setStage(s) {
    state.stage = s;
    render();
  }

  function ladderHtml() {
    const steps = [
      ["intro", "1 · Wstęp"],
      ["check", "2 · Kontrola"],
      ["type", "3 · Pisanie"],
      ["use", "4 · Użycie"],
    ];
    const order = ["intro", "check", "type", "use", "done"];
    const cur = order.indexOf(state.stage);
    const banners = {
      intro: {
        title: "Etap 1 · Wstęp",
        sub: "Czytaj · Enter = Dalej · Backspace = Wstecz",
      },
      check: {
        title: "Etap 2 · Kontrola",
        sub:
          state.checkPhase === "quiz"
            ? "Quiz · klawisze 1–4 · Enter = dalej"
            : "Dopasuj · lewo → prawo · Enter = dalej gdy skończysz",
      },
      type: {
        title: "Etap 3 · Pisanie",
        sub: "Napisz formę · Enter = sprawdź · Enter = dalej",
      },
      use: {
        title: "Etap 4 · Użycie",
        sub: "Całe zdanie po polsku · Enter = sprawdź · Enter = dalej",
      },
      done: {
        title: "Gotowe",
        sub: "Enter = mapa",
      },
    };
    const ban = banners[state.stage] || banners.done;
    return `
      <div class="ladder-wrap">
        <div class="ladder" role="list" aria-label="Etapy ćwiczenia">
          ${steps
            .map(([id, label], i) => {
              let cls = "ladder-step";
              if (state.stage === id || (state.stage === "done" && id === "use"))
                cls += " is-current";
              else if (i < cur) cls += " is-done";
              const arrow =
                i < steps.length - 1
                  ? `<span class="ladder-arrow" aria-hidden="true">→</span>`
                  : "";
              return `<span class="${cls}" role="listitem">${label}</span>${arrow}`;
            })
            .join("")}
        </div>
        <div class="stage-banner">
          <div class="stage-banner-title">${ban.title}</div>
          <div class="stage-banner-sub">${ban.sub}</div>
        </div>
      </div>`;
  }

  function focusPrimary(sel) {
    const b = root.querySelector(sel);
    if (!b) return;
    try {
      b.focus({ preventScroll: true });
    } catch {
      b.focus();
    }
  }

  // ---- Intro ----
  function renderIntro() {
    clearAdvance();
    const cards = pack.intro || [];
    if (!cards.length) {
      completeMode(pack.id, "intro");
      beginCheck();
      return;
    }
    const card = cards[state.introIndex];
    setSmokeContext({
      stage: "intro",
      checkPhase: "",
      itemIndex: state.introIndex,
      en: card.title || "",
      pl: card.title_pl || card.body_pl || "",
      gap: "",
      gap_answer: "",
      typed: "",
    });
    let body = "";
    if (card.body) body += `<p>${esc(card.body)}</p>`;
    if (card.body_pl) body += `<p><em>${esc(card.body_pl)}</em></p>`;
    if (card.table) {
      const h = card.table.headers || [];
      body += `<table class="intro-table"><thead><tr>${h
        .map((x) => `<th>${esc(x)}</th>`)
        .join("")}</tr></thead><tbody>${(card.table.rows || [])
        .map(
          (row) =>
            `<tr>${row.map((c) => `<td>${esc(c)}</td>`).join("")}</tr>`,
        )
        .join("")}</tbody></table>`;
    }
    if (card.examples) {
      body += card.examples
        .map((ex) => {
          const pl = ex.pl || ex.cz || "";
          let line = `<div class="intro-ex"><span class="pl">${esc(pl)}</span>`;
          if (ex.en) line += ` <span class="en">· ${esc(ex.en)}</span>`;
          line += `</div>`;
          return line;
        })
        .join("");
    }

    const last = state.introIndex >= cards.length - 1;
    const n = cards.length;
    const i = state.introIndex;

    root.innerHTML = `
      ${ladderHtml()}
      <div class="practice-head"><h2>${esc(pack.title)}</h2></div>
      <div class="intro-card">
        <p class="intro-kicker">Wstęp · ${i + 1} / ${n}</p>
        <h3>${esc(card.title || "Wstęp")}</h3>
        ${card.title_pl ? `<p><em>${esc(card.title_pl)}</em></p>` : ""}
        ${body}
        <div class="nav">
          <button type="button" class="btn" id="btn-prev" ${i === 0 ? "disabled" : ""}>← Wstecz</button>
          <button type="button" class="btn primary" id="btn-next">${
            last ? "Kontrola →" : "Dalej →"
          }</button>
        </div>
      </div>
    `;

    const goPrev = () => {
      if (state.introIndex > 0) {
        state.introIndex -= 1;
        render();
      }
    };
    const goNext = () => {
      if (last) {
        completeMode(pack.id, "intro");
        beginCheck();
      } else {
        state.introIndex += 1;
        render();
      }
    };

    root.querySelector("#btn-prev")?.addEventListener("click", goPrev);
    root.querySelector("#btn-next")?.addEventListener("click", goNext);
    state.enterAdvance = goNext;
    state.onBackKey = goPrev;
    focusPrimary("#btn-next");
  }

  // ---- Check ----
  /**
   * Always use the full pack.match set (no random drop).
   * Only shuffle order of left rows and right chips so the board still varies.
   * Keep match lists small in the pack if you need one-screen boards.
   */
  function newMatchBoard() {
    const raw = (pack.match || []).slice();
    // Shuffle left order so it's not always the same top-to-bottom list
    const leftSrc = shuffle(raw);
    const left = leftSrc.map((p, i) => ({
      id: i,
      t: p.en || p.prompt || "",
      ans: pairPl(p),
    }));
    // Right chips: same pairs, independent shuffle; id must match left's pair
    // Rebuild right from left so ids stay aligned with ans
    const right = shuffle(
      left.map((row) => ({
        id: row.id,
        t: row.ans,
      })),
    );
    state.matchBoard = {
      left,
      right,
      sel: null,
      doneLeft: new Set(),
      doneRight: new Set(),
      total: left.length,
      wrongFlash: 0,
    };
  }

  function beginCheck() {
    state.stage = "check";
    state.checkPhase = "match";
    state.matchSubmitted = false;
    state.matchBoard = null;
    state.quizItems = shuffle((pack.quiz || []).slice());
    state.quizIndex = 0;
    state.quizScore = 0;
    state.checkScore = 0;
    state.checkTotal = 0;
    const hasMatch = (pack.match || []).length > 0;
    if (!hasMatch && !state.quizItems.length) {
      completeMode(pack.id, "check", { score: 1, total: 1 });
      beginType();
      return;
    }
    if (!hasMatch) state.checkPhase = "quiz";
    else newMatchBoard();
    render();
  }

  /**
   * RUE2-style two-column match: click left, click right.
   * Instant pair feedback · no dropdowns · no page scroll needed.
   */
  function renderMatch() {
    clearAdvance();
    if (!state.matchBoard) newMatchBoard();
    const m = state.matchBoard;
    const doneCount = m.doneLeft.size;
    setSmokeContext({
      stage: "check",
      checkPhase: "match",
      itemIndex: doneCount,
      en: (m.left || []).map((x) => x.t).join(" | ").slice(0, 120),
      pl: (m.right || []).map((x) => x.t).join(" | ").slice(0, 120),
      gap: "",
      gap_answer: "",
      typed: "",
    });

    // Finished board
    if (m.total > 0 && doneCount >= m.total) {
      // Full credit for completing the board (wrong tries already flashed)
      if (!state.matchSubmitted) {
        state.checkScore += m.total;
        state.checkTotal += m.total;
        state.matchSubmitted = true;
      }
      root.innerHTML = `
        ${ladderHtml()}
        <div class="practice-head"><h2>${esc(pack.title)} · Dopasuj</h2></div>
        <p class="practice-prompt">Dopasowano ${doneCount} / ${m.total}</p>
        <p class="practice-hint">Enter = dalej</p>
        <div class="nav">
          <button type="button" class="btn" id="m-again">Jeszcze raz</button>
          <button type="button" class="btn primary" id="m-next">${
            state.quizItems.length ? "Dalej do quizu →" : "Dalej →"
          }</button>
        </div>
      `;
      root.querySelector("#m-again")?.addEventListener("click", () => {
        state.matchSubmitted = false;
        newMatchBoard();
        // undo score from previous complete if replaying
        state.checkScore = Math.max(0, state.checkScore - m.total);
        state.checkTotal = Math.max(0, state.checkTotal - m.total);
        render();
      });
      const goNext = () => {
        if (state.quizItems.length) {
          state.checkPhase = "quiz";
          render();
        } else finishCheck();
      };
      root.querySelector("#m-next")?.addEventListener("click", goNext);
      state.enterAdvance = goNext;
      focusPrimary("#m-next");
      return;
    }

    const col = (arr, side) =>
      arr
        .map((x) => {
          const done =
            side === "L" ? m.doneLeft.has(x.id) : m.doneRight.has(x.id);
          const cls = done ? "m done" : "m";
          const label = done ? "✓ " + x.t : x.t;
          return `<button type="button" class="${cls}" data-side="${side}" data-id="${x.id}" ${
            done ? "disabled" : ""
          }>${esc(label)}</button>`;
        })
        .join("");

    root.innerHTML = `
      ${ladderHtml()}
      <div class="practice-head"><h2>${esc(pack.title)} · Dopasuj</h2></div>
      <p class="score-line">${doneCount} / ${m.total} · kliknij lewo, potem prawo</p>
      <div class="match" id="match-board">
        <div class="match-col">${col(m.left, "L")}</div>
        <div class="match-col">${col(m.right, "R")}</div>
      </div>
    `;

    root.querySelectorAll(".m:not(.done)").forEach((btnEl) => {
      btnEl.addEventListener("click", () => {
        const id = Number(btnEl.dataset.id);
        const side = btnEl.dataset.side;
        if (!m.sel) {
          m.sel = { id, side, el: btnEl };
          btnEl.classList.add("sel");
          return;
        }
        if (m.sel.side === side) {
          m.sel.el.classList.remove("sel");
          m.sel = { id, side, el: btnEl };
          btnEl.classList.add("sel");
          return;
        }
        const leftId = m.sel.side === "L" ? m.sel.id : id;
        const rightId = m.sel.side === "R" ? m.sel.id : id;
        const leftRow = m.left.find((x) => x.id === leftId);
        const rightRow = m.right.find((x) => x.id === rightId);
        const ok =
          leftRow &&
          rightRow &&
          norm(leftRow.ans) === norm(rightRow.t) &&
          !m.doneLeft.has(leftId) &&
          !m.doneRight.has(rightId);

        if (ok) {
          m.doneLeft.add(leftId);
          m.doneRight.add(rightId);
          m.sel.el.classList.remove("sel");
          m.sel.el.classList.add("done");
          m.sel.el.disabled = true;
          m.sel.el.textContent =
            "✓ " + m.sel.el.textContent.replace(/^✓\s*/, "");
          btnEl.classList.add("done");
          btnEl.disabled = true;
          btnEl.textContent = "✓ " + btnEl.textContent.replace(/^✓\s*/, "");
          m.sel = null;
          const nextDone = m.doneLeft.size;
          setTimeout(() => render(), nextDone >= m.total ? 280 : 0);
        } else {
          const a = m.sel.el;
          a.classList.add("wrong");
          btnEl.classList.add("wrong");
          setTimeout(() => {
            a.classList.remove("wrong", "sel");
            btnEl.classList.remove("wrong");
          }, 450);
          m.sel = null;
        }
      });
    });
  }

  function quizKeyToIndex(e, optCount) {
    const codeMap = {
      Digit1: 0,
      Digit2: 1,
      Digit3: 2,
      Digit4: 3,
      Digit5: 4,
      Digit6: 5,
      Numpad1: 0,
      Numpad2: 1,
      Numpad3: 2,
      Numpad4: 3,
      Numpad5: 4,
      Numpad6: 5,
    };
    if (Object.prototype.hasOwnProperty.call(codeMap, e.code)) {
      const i = codeMap[e.code];
      return i < optCount ? i : null;
    }
    const n = parseInt(e.key, 10);
    if (n >= 1 && n <= optCount) return n - 1;
    return null;
  }

﻿  function renderQuiz() {
    clearAdvance();
    const items = state.quizItems;
    if (state.quizIndex >= items.length) {
      finishCheck();
      return;
    }
    const item = items[state.quizIndex];
    setSmokeContext({
      stage: "check",
      checkPhase: "quiz",
      itemIndex: state.quizIndex,
      en: item.prompt || "",
      pl: item.answer || "",
      gap: "",
      gap_answer: item.answer || "",
      typed: "",
    });
    const choices = shuffle((item.choices || []).slice());
    root.innerHTML = `
      ${ladderHtml()}
      <div class="practice-head"><h2>${esc(pack.title)} · Quiz</h2></div>
      <p class="score-line">${state.quizIndex + 1} / ${items.length}</p>
      <p class="practice-prompt">${esc(item.prompt)}</p>
      <p class="practice-hint">Klawisze <strong>1–${choices.length}</strong> · po odpowiedzi Enter = dalej</p>
      <div class="choices" id="choices"></div>
      <div class="feedback" id="feedback"></div>
    `;
    const box = root.querySelector("#choices");
    let locked = false;
    let advanceTimer = null;

    const goNextQ = () => {
      if (advanceTimer) {
        clearTimeout(advanceTimer);
        advanceTimer = null;
      }
      state.quizIndex += 1;
      render();
    };

    const pick = (i) => {
      if (locked || i < 0 || i >= choices.length) return;
      locked = true;
      const c = choices[i];
      const buttons = [...box.querySelectorAll(".choice")];
      const good = c === item.answer;
      if (good) state.quizScore += 1;
      if (buttons[i]) buttons[i].classList.add(good ? "is-correct" : "is-wrong");
      buttons.forEach((ch) => {
        ch.disabled = true;
        if (ch.dataset.answer === item.answer) ch.classList.add("is-correct");
      });
      const fb = root.querySelector("#feedback");
      fb.className = "feedback " + (good ? "ok" : "bad");
      fb.textContent = good ? "Tak." : `→ ${item.answer}`;
      state.enterAdvance = goNextQ;
      advanceTimer = setTimeout(goNextQ, 900);
    };

    function onDigit(e) {
      if (e.target.closest("input, textarea, select")) return;
      if (locked) return;
      const n = quizKeyToIndex(e, choices.length);
      if (n != null) {
        e.preventDefault();
        e.stopPropagation();
        pick(n);
      }
    }
    state.digitHandler = onDigit;
    document.addEventListener("keydown", onDigit, true);

    choices.forEach((c, i) => {
      const b = el(
        `<button type="button" class="choice" data-answer="${escAttr(c)}"><span class="knum">${i + 1}</span> ${esc(c)}</button>`,
      );
      b.addEventListener("click", () => pick(i));
      box.appendChild(b);
    });

    if (document.activeElement && root.contains(document.activeElement)) {
      document.activeElement.blur();
    }
  }

  function finishCheck() {
    state.checkScore += state.quizScore;
    state.checkTotal += state.quizItems.length;
    const score = state.checkTotal ? state.checkScore : 1;
    const total = state.checkTotal || 1;
    completeMode(pack.id, "check", { score, total });
    beginType();
  }

  function beginType() {
    state.stage = "type";
    state.typeItems = shuffle((pack.type_items || []).slice());
    state.typeIndex = 0;
    state.typeScore = 0;
    if (!state.typeItems.length) {
      completeMode(pack.id, "type", { score: 1, total: 1 });
      beginUse();
      return;
    }
    render();
  }

  function beginUse() {
    state.stage = "use";
    state.useItems = shuffle((pack.use_items || []).slice());
    state.useIndex = 0;
    state.useScore = 0;
    if (!state.useItems.length) {
      completeMode(pack.id, "use");
      state.stage = "done";
      render();
      return;
    }
    render();
  }

  function renderTypedStage(kind) {
    clearAdvance();
    const items = kind === "type" ? state.typeItems : state.useItems;
    const idx = kind === "type" ? state.typeIndex : state.useIndex;
    const score = kind === "type" ? state.typeScore : state.useScore;

    if (idx >= items.length) {
      if (kind === "type") {
        completeMode(pack.id, "type", {
          score: state.typeScore,
          total: state.typeItems.length,
        });
        beginUse();
      } else {
        completeMode(pack.id, "use", {
          score: state.useScore,
          total: state.useItems.length,
        });
        state.stage = "done";
        render();
      }
      return;
    }

    const item = items[idx];
    const mode = kind === "use" ? "full_word" : typeModeOf(pack, item);
    const isGap = mode === "ending_gap" && item.stem != null;
    const prompt =
      item.prompt_en || item.prompt || item.en || "Napisz po polsku:";
    setSmokeContext({
      stage: kind === "type" ? "type" : "use",
      checkPhase: "",
      itemIndex: idx,
      en: prompt,
      pl: item.answer || fullFormOf(item) || "",
      gap: isGap ? item.stem || "" : "",
      gap_answer: isGap ? item.ending || "" : item.answer || "",
      typed: "",
    });
    const hint = item.hint
      ? `<p class="practice-hint">${esc(item.hint)}</p>`
      : "";

    const inputBlock = isGap
      ? `<div class="gap-row" aria-label="Uzupełnij końcówkę">
          <span class="gap-stem">${esc(item.stem)}</span>
          <input type="text" id="ans" class="gap-input" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="__" lang="pl" />
          <button type="button" class="btn primary" id="btn-submit">Sprawdź</button>
        </div>`
      : `<div class="input-row">
          <input type="text" id="ans" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="po polsku…" lang="pl" />
          <button type="button" class="btn primary" id="btn-submit">Sprawdź</button>
        </div>`;

    const stageLabel =
      kind === "type" ? (isGap ? "Końcówki" : "Pisanie") : "Użycie";

    root.innerHTML = `
      ${ladderHtml()}
      <div class="practice-head"><h2>${esc(pack.title)} · ${stageLabel}</h2></div>
      <p class="score-line">${idx + 1} / ${items.length} · wynik ${score}</p>
      <p class="practice-prompt">${esc(prompt)}</p>
      ${hint}
      ${
        isGap
          ? `<p class="practice-hint gap-hint">Tylko <strong>końcówka</strong> · diakrytyki ważne</p>`
          : ""
      }
      ${inputBlock}
      <div class="feedback" id="feedback"></div>
    `;

    const input = root.querySelector("#ans");
    const btn = root.querySelector("#btn-submit");
    const fb = root.querySelector("#feedback");
    input.focus();

    let answered = false;
    let advanceTimer = null;

    const goNext = () => {
      if (advanceTimer) {
        clearTimeout(advanceTimer);
        advanceTimer = null;
      }
      if (kind === "type") state.typeIndex += 1;
      else state.useIndex += 1;
      render();
    };

    const grade = () => {
      if (answered) return;
      answered = true;
      const good = isCorrect(input.value, item, mode);
      if (good) {
        if (kind === "type") state.typeScore += 1;
        else state.useScore += 1;
        fb.className = "feedback ok";
        fb.textContent = isGap
          ? `Tak. · ${fullFormOf(item) || item.stem + item.ending}`
          : "Tak.";
      } else {
        fb.className = "feedback bad";
        fb.textContent = isGap
          ? `→ ${item.ending}  ·  ${fullFormOf(item)}`
          : `→ ${item.answer}`;
      }
      input.disabled = true;
      btn.textContent = idx >= items.length - 1 ? "Dalej →" : "Dalej →";
      btn.onclick = goNext;
      focusPrimary("#btn-submit");
      state.enterAdvance = goNext;
      advanceTimer = setTimeout(goNext, isGap ? 750 : 900);
    };

    const onEnter = () => {
      if (answered) goNext();
      else grade();
    };

    btn.addEventListener("click", onEnter);
    state.enterAdvance = onEnter;
  }

  function renderDone() {
    clearAdvance();
    const bCheck = state.checkTotal
      ? Math.round((state.checkScore / state.checkTotal) * 100)
      : null;
    const bType = state.typeItems.length
      ? Math.round((state.typeScore / state.typeItems.length) * 100)
      : null;
    const fruit =
      (bCheck == null || bCheck >= PASS_RATIO * 100) &&
      (bType == null || bType >= PASS_RATIO * 100);

    root.innerHTML = `
      ${ladderHtml()}
      <div class="practice-head"><h2>${esc(pack.title)} · Gotowe</h2></div>
      <p class="practice-prompt">${
        fruit
          ? "Owoc zdobyty (uczciwie)."
          : "Drabinka skończona — dostań ≥80 % w Kontroli i Pisaniu, żeby zebrać owoc."
      }</p>
      <p class="score-line">
        ${bCheck != null ? `Kontrola: ${bCheck} % · ` : ""}
        ${bType != null ? `Pisanie: ${bType} % · ` : ""}
        Użycie: ${
          state.useItems.length
            ? `${state.useScore}/${state.useItems.length}`
            : "—"
        }
      </p>
      <p class="practice-hint">Postęp lokalny · EN → PL</p>
      <div class="nav">
        <button type="button" class="btn" id="btn-retry">Ćwicz ponownie</button>
        <button type="button" class="btn primary" id="btn-map">← Do mapy</button>
      </div>
    `;
    root.querySelector("#btn-retry")?.addEventListener("click", () => {
      state.introIndex = 0;
      setStage("intro");
    });
    root.querySelector("#btn-map")?.addEventListener("click", exitToMap);
    state.enterAdvance = exitToMap;
    focusPrimary("#btn-map");
  }

  function render() {
    if (state.stage === "intro") return renderIntro();
    if (state.stage === "check") {
      if (state.checkPhase === "match") return renderMatch();
      return renderQuiz();
    }
    if (state.stage === "type") return renderTypedStage("type");
    if (state.stage === "use") return renderTypedStage("use");
    if (state.stage === "done") return renderDone();
  }

  function esc(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function escAttr(s) {
    return esc(s).replace(/'/g, "&#39;");
  }

  render();
}
