# RUPL2 — Decisions log

Charter is law. This file records *why* so we don’t re-argue under content pressure.

---

## 2026-07-28 — Past = A2; drill purity; typing first

### Past tense timing

**Decision:** A1 = present + light cases. **Past ruthlessness opens A2.**

**Why not EN-style early past?**  
English past simple is mostly one cheap pattern (*worked / went*). Polish past is a **person × gender** ending system (`-łem / -łam / -ł / -ła / -ło / -li / -ły` …). Early dump without an ending gym produces either freeze or fake “topic complete.”

**Why not a tiny A1 past seed as a pack?**  
Optional recognition in a chunk is fine later if needed. A full past *pack* on the A1 rail would steal reps from present + Acc/Gen — the real A1 fluency blockers. Better one clean A2 past gym than a soft A1 taste.

**A2 open move (when we build it):** past ending gym first (grids + `ending_gap`), closed verb set, high volume — then stories.

### Drill purity

**Decision:** Morphology packs start pure (paradigm + ruthless ending Type + short Use). Communicative frames build *on top* later.

**Why:** The user’s barrier is automatic endings, not café scripts. Story-first packs hide the ending under vocab and “feel finished” after one ladder.

### Speaking vs typing

**Decision:** Win condition for current ship = **typed automaticity**. Speaking layer delayed.

**Why:** Mic/TTS is a whole product layer; delaying it lets the morphology app ship and get reps now. Speaking can attach later to the same packs once forms are hot in the fingers.

### Open (user to answer later)

- Weakest slots now (present / Acc -ę / Gen-after-neg / adj / pronouns…)  
- Strict fruit threshold for morph packs (keep 80% vs raise to 90%)

---

## 2026-07-28 — ending_gap engine + first gyms

**Decision:** Type mode `ending_gap` is default for packs with `kind: "morphology"` or `type.mode: "ending_gap"`.

**Item shape:** `{ prompt_en, stem, ending, hint? }` — user types only `ending`. Diacritics required; no auto-accept of full word or stripped forms.

**Per-item override:** `"mode": "full_word"` for irregular short forms (e.g. mam/masz in mieć pack).

**Live gyms:** `a1_present_gym`, `a1_acc_gym`. Path: concept pack then volume gym. Gyms are **not** spine steps (`pedagogy: drill`).

---

## 2026-07-28 — Nom check before Acc

**Decision:** Insert `a1_gender_check` (gender + light *dobry/a/e*, still Nom) **after** być and **before** *Mieć + biernik*.

**Why:** Acc (kawę) needs automatic gender. One *to jest* pack is not enough.

Path: gender+to jest → być → **gender check + adj** → Acc.

---

## 2026-07-28 — Shell + first unit (after audit)

**Shell:** Practice chrome aligned to RUE2 *patterns* (not a full port):
- single `enterAdvance` router · Enter never triggers map exit
- Polish nav: Wstecz / Dalej · one ladder hint line
- map exit = mouse on `← Wstecz do mapy`

**First unit `a1_gender`:** ONE teaching target only —
`To jest + nominative noun` + m/f/n feel.  
Adjective agreement deferred (separate pack later).  
PL case/gender is the hard part vs EN — sequence one slot at a time.

---

## 2026-07-28 — RUPL2 ↔ RUPL3 soft spine

**Source of truth:** `projects/PL-A1-SPINE.md` + `projects/pl-a1-spine.json` → copy into both `data/spine.json`.

**Rules:**
- RUPL2 = teach system · RUPL3 = use on topics
- Soft deep links only · no shared localStorage
- Instrumental identity (`a1_inst_job`) **after** Acc + place preps
- Zigzag card already in both apps
- `path_order` follows spine case ladder; gyms sit right after their teach pack

**Do not:** rebuild shell · hard cross-app locks · Inst in early seed · English RUE2 topic list

---

## Related product rules (same day)

- Path nodes name **grammar targets**, not vocab themes (no bare “Shop & café”).  
- Fields `en` + `pl`. No diacritic chips. Storage `rupl2-v0.1-progress`. Port 8095. Accent `#c87840`.
