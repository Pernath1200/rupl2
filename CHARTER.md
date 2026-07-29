# RUPL2 — Charter (v0.1 seedling)

**Status:** open 2026-07-28 · greenfield · A1 Polish grammar for English speakers  
**Folder:** `projects/rupl2` only  
**Layout source:** `rucz2` (roots map · ladder · progress · EN→L2 production)  
**Sibling:** **RUPL3** (Polish vocab · amber `#e0a050`) — same family, not a merge  
**Shared case path:** [`../PL-A1-SPINE.md`](../PL-A1-SPINE.md) + `data/spine.json` (soft zigzag only)

---

## One-liner

**RUPL2** (Reading and Use of Polish · 2) is a local practice path for **productive A1 Polish grammar**: understand and produce high-frequency patterns for everyday life (Warsaw / city frames OK), with honest progress and a soft ladder — not a university case book.

---

## Purpose

| App | Language | Domain | Tree metaphor | Accent |
|-----|----------|--------|---------------|--------|
| **RUE2** | EN for CZ speakers | Grammar | Roots | cyan |
| **RUE3** | EN for CZ speakers | Lexis | Trunk / leaves | teal |
| **RUCZ2** | CZ for EN speakers | Grammar | Roots | magenta `#d656b8` |
| **RUCZ3** | CZ for EN speakers | Lexis | Trunk / leaves | rose |
| **RUPL3** | PL for EN speakers | Lexis | Trunk / leaves | amber `#e0a050` |
| **RUPL2** | **PL for EN speakers** | **Grammar** | **Roots** | **copper `#c87840`** |

Direction of production: **EN → PL** is core. Recognition (PL → EN) is support, not the goal.  
**UI chrome is Polish** (same pattern as RUPL3 / rucz3).

---

## Scope for v0.1 (this seedling)

1. **Greenfield** under `rupl2` — no edits to rucz2 / rupl3 / rue2.
2. **A1 only** on the open rail; A2+ locked / not yet.
3. **Vertical slice:** shell + path + thin root map + **4 live packs** + local progress.
4. **Polish-first syllabus** — morphology, chunks, light case; not English topic clones. Sound deferred.
5. **Ladder:** Intro → Check → Type → Use (same shape as RUCZ2).
6. **Data-driven packs** (JSON) · static local shell (`py -m http.server 8095`).
7. **Polish UI** · EN prompts · PL target forms · fields `en` + `pl` (never fake `cz`).
8. **Typing:** proper Polish required (diacritics matter); **no** chip strip.
9. **Local only** — `localStorage` key `rupl2-v0.1-progress`.

### Success for v0.1

You can open the map, follow a short A1 path, complete a live pack through the ladder, see progress saved, and know what *not* to build next.

---

## Design principles

1. **Production over recognition** when possible.
2. **One clear teaching target** per item (ending, chunk, or pattern — not mixed).
3. **City / everyday frames** — shop, café, tram, flat, greetings (Warsaw-first OK).
4. **Gender-safe and form-safe** — mark gender where needed; nom/acc first.
5. **Morphology is central** — endings and agreement are first-class practice.
6. **Sound is not in-app for v0.1.**
7. **Diacritics matter** — ą ≠ a, ę ≠ e, ł ≠ l, etc. Soft accepts only when explicitly listed (no free strip).
8. **Sharp vertical slice** over empty architecture.
9. **Prefer correct Polish over volume.**

---

## Six roots (Polish A1 — not English VP/NP)

| Root id | Student label | What it grows |
|---------|---------------|----------------|
| **tap_root** | Kół / fundament | Hello + być + basic sentence machinery (`foundation: true`) |
| `forms` | Formy | Gender (m/f/n), nominative basics, light adjective agreement, accusative light |
| `verbs` | Czasowniki | być, mieć, present conjugations light, negation (**past = A2**) |
| `sentence` | Zdanie | Questions (czy, wh-), word order feel, pronouns in context |
| `chunks` | Chunki | Frames that *force* a known ending (title = grammar target, not vocab theme) |
| `links` | Spójniki | a / ale / bo · high-freq prepositions that pull a case (light) |

**Lateral fill** = average honest progress of live children under that root.  
**Tap fill** = average of `foundation: true` topics.  
**Fruit** = ladder finished and best Check & Type ≥ **80%** when scored.  
**A1 gate** = later; not required for v0.1 ship.

---

## Locked syllabus decisions (2026-07-28)

See also [docs/DECISIONS.md](./docs/DECISIONS.md).

### 1. Past tense → **A2 ruthlessness**, not A1 spine

EN past simple is early A1 and cheap. PL past is a **person × gender ending system** — if it lands mid-A1 without an ending gym, it either scares learners off or gets “finished” once and never automatic.

| Level | Past |
|-------|------|
| **A1** | **No past spine.** Optional one-line recognition only if a chunk needs it — not a pack goal. |
| **A2 open** | **Past ending gym** (był/była/byłem/byłam → full person×gender on a closed verb set). Ruthless reps. |

A1 owns: present person endings · gender · Acc light · Gen-after-neg light · Loc light · negation · questions/szyk.

### 2. Drill purity on morphology packs

Morphology packs (person endings, case endings, adj agreement) start **pure**:

- Intro = **mini paradigm only** (table / 3 lines), almost no story  
- Check = person↔ending / form↔slot  
- Type = **`ending_gap` primary** (stem fixed · type only ending); some `full_word`  
- Use = **short coda** (few sentences, one target)

Communicative / city frames come **later**, only when they load endings already drilled. Pack titles name the grammar target.

### 3. Win condition v0.1–v0.x = **typed automaticity**

The app measures typing. Speaking / “say the ending aloud” is a **later layer** (sound/TTS/mic) — deliberately deferred so this version can ship. Outside-app speaking habit is fine; not product scope now.

### 4. Diacritics on endings

On morphology Type items, missing diacritic on the target ending **fails** (`kawę` ≠ `kawe`, `chcę` ≠ `chce`). Soft accepts only when explicitly listed for a real variant — not free strip.

---

## Practice modes — locked for v0.1+

| Mode | Stage | What you type / do |
|------|--------|---------------------|
| **paradigm / intro cards** | Intro | Mini tables; show over essay |
| **match / quiz** | Check | Form ↔ person, or EN gloss ↔ PL form |
| **ending_gap** | Type (**default on morphology**) | Stem shown · gap only the ending |
| **full_word** | Type (support / non-morph packs) | Type the whole Polish word/form |
| **produce** | Use | EN prompt → full PL sentence; short coda on morph packs |

**No diacritic chips.**

---

## Live packs (v0.1 seedling)

1. **Hello & polite + być seed** — `a1_hello`  
2. **Gender + to jest + adj light** — `a1_gender`  
3. **Present I / you / he** — `a1_present` (Type = ending_gap)  
4. **Present ending gym** — `a1_present_gym` (pure morphology volume)  
5. **Mieć + Acc light** — `a1_miec` (verb full_word + Acc gaps)  
6. **Acc -ę gym** — `a1_acc_gym` (pure f -a → -ę)

**Shared path:** [`../PL-A1-SPINE.md`](../PL-A1-SPINE.md) — zigzag soft links with RUPL3 (`data/spine.json`).  
**A1 spine next (content):** `a1_prep_place` → then `a1_inst_job` (narzędnik identity — not before Acc+prep). Also: negation · Acc more · questions.  
**A2 open later:** past ending gym first — not buried inside stories.

**Defer:** full aspect, full case encyclopedia, sound/TTS/speaking layer, RUPL3 vocab merge, AI chat.

---

## Explicit non-goals for v0.1

- Past tense as A1 path content (→ A2)  
- Speaking / mic / TTS curriculum  
- Full seven-case system / full declension tables as product goal  
- Full aspect system  
- A2+ maps with real content (until past gym designed)  
- Exam prep theatre  
- AI chat / tutor  
- Merging with RUPL3 codebase  
- Diacritic chip strip  
- Student deploy / PWA polish / accounts  
- Perfect organic root SVG (thin map OK)

---

## Relation to family

**Sibling of RUCZ2** (shell), **sibling of RUPL3** (Polish branding / UI habits).

| | RUCZ2 | RUPL3 | **RUPL2** |
|---|-------|-------|-----------|
| Domain | CZ grammar | PL vocab | **PL grammar** |
| Direction | EN → CZ | EN → PL | **EN → PL** |
| UI | Czech | Polish | **Polish** |
| Fields | `en` + `cz` | `en` + `pl` | **`en` + `pl`** |
| Accent | magenta | amber `#e0a050` | **copper `#c87840`** |
| Storage | `rucz2-v0.1-progress` | `rupl3-v0.1-progress` | **`rupl2-v0.1-progress`** |
| Port | 8092 | 8094 | **8095** |

Share: product language (rail, ladder, fruit, dark UI, JSON packs, local shell).  
Do not share: Czech content, English grammar topic clones, git history as a product.

---

## Folder law

| Path | Role |
|------|------|
| `projects/rupl2` | **This product** |
| `projects/rucz2` | Czech grammar shell — read-only template |
| `projects/rupl3` | Polish vocab sibling — branding / UI habits reference |
| `projects/rue2-*` | English grammar — density only; not syllabus |

---

## Version

**v0.1-seedling** — charter + path + shell + first packs.  
After scaffold: smoke the shell before flooding more packs.
