  function renderQuiz() {
    clearAdvance();
    const items = state.quizItems;
    if (state.quizIndex >= items.length) {
      finishCheck();
      return;
    }
    const item = items[state.quizIndex];
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
      document.removeEventListener("keydown", onDigit, true);
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
    document.addEventListener("keydown", onDigit, true);

    const baseTeardown = teardown;
    root._rupl2UnbindKeys = () => {
      document.removeEventListener("keydown", onDigit, true);
      baseTeardown();
    };

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

