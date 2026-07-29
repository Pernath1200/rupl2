# RUPL2 · Reading and Use of Polish · 2

Productive **A1 Polish grammar** for English speakers (city / everyday).  
Sibling of **RUCZ2** (Czech grammar shell) and **RUPL3** (Polish vocab) — **Polish syllabus from first principles**.

**Live:** [https://pernath1200.github.io/rupl2/](https://pernath1200.github.io/rupl2/)  
**Repo:** [Pernath1200/rupl2](https://github.com/Pernath1200/rupl2)  
**Sibling vocab:** [https://pernath1200.github.io/rupl3/](https://pernath1200.github.io/rupl3/)

Read **[CHARTER.md](./CHARTER.md)** before changing scope.

## One-liner

Grow usable A1 Polish: high-frequency grammar patterns you can **understand and produce**, with honest local progress — not a full case textbook.

## GitHub Pages

Deploy: branch **`main`** · folder **`/` (root)** →  
`https://pernath1200.github.io/rupl2/`

Progress is **local to each browser** (`localStorage`).

## Run locally

```powershell
cd C:\Users\ADMIN\documents\projects\rupl2
py -m http.server 8095
```

Open **http://localhost:8095** · hard-refresh **Ctrl+F5** after code changes.

(Port **8095** — 8092 rucz2 · 8093 rucz3 · 8094 rupl3 · **8095 rupl2**.)

## What exists (v0.1 seedling)

- **CHARTER** locked  
- **Path** — A1 open; A2+ locked · suggested order  
- **Roots** — Formy · Czasowniki · Zdanie · Chunki · Spójniki (+ kół)  
- **Ladder** — Wstęp → Kontrola → Pisanie → Użycie  
- **Live packs (6)** — Hello · Gender · Present · **Present gym** · Mieć · **Acc -ę gym**  
- **Type** — `ending_gap` default on morphology (`stem` + ending only)  
- **Syllabus locks** — past → **A2** · drill purity · typed automaticity  
- **Accent** — copper `#c87840` (one shade off RUPL3 amber)  
- **Progress** — `localStorage` key `rupl2-v0.1-progress`  
- **Direction** — EN → PL production core  
- **UI** — Polish chrome · fields `en` + `pl` · no diacritic chips  

## Smoke path

1. Open http://localhost:8095  
2. Continue / open **Cześć i grzeczność** (or another live node)  
3. Complete Wstęp → Kontrola → Pisanie → Użycie  
4. Return to map — progress should stick (status / fruit)

## Folder

```
rupl2/
  CHARTER.md
  README.md
  index.html
  css/app.css
  js/app.js
  js/practice.js
  js/progress.js
  data/tree.json
  data/blocks/
```

## Not this project

| Path | Role |
|------|------|
| `rucz2` | Czech grammar template — do not edit from RUPL2 sessions |
| `rupl3` | Polish vocab — separate storage and packs |
| Full case / aspect / exam apps | Out of scope for v0.1 |

## Version

**v0.1-seedling** · personal local tool · no student deploy until amber
