"""Smoke: packs + ending_gap item shape."""
import json
import pathlib
import re

root = pathlib.Path(__file__).resolve().parents[1]


def norm_ending(s: str) -> str:
    return re.sub(r"""[!?.,;:"'()\s]""", "", s.lower()).strip()


def main() -> None:
    for p in sorted((root / "data" / "blocks").glob("*.json")):
        d = json.loads(p.read_text(encoding="utf-8"))
        mode = (d.get("type") or {}).get("mode")
        n_type = len(d.get("type_items") or [])
        print(f"{p.name}: mode={mode} kind={d.get('kind')} type_items={n_type}")
        for i in d.get("type_items") or []:
            if i.get("mode") == "full_word":
                assert i.get("answer"), i
                continue
            if mode == "ending_gap" or i.get("stem") is not None:
                assert i.get("stem") is not None and i.get("ending") is not None, i
                assert len(i["ending"]) <= 4, i

    tree = json.loads((root / "data" / "tree.json").read_text(encoding="utf-8"))
    live = [n for n in tree["nodes"] if n["status"] == "live"]
    assert len(live) == 6, len(live)
    for n in live:
        assert (root / "data" / n["content"]).exists(), n["id"]

    assert norm_ending("ę") == "ę"
    assert norm_ending(" e ") == "e"
    assert norm_ending("ę") != norm_ending("e")
    print("ALL OK")


if __name__ == "__main__":
    main()
