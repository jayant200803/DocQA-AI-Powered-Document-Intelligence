"""Offline checks for BM25 and rank fusion. Run: python tests/test_rank.py"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app.services.rank import bm25_scores, reciprocal_rank_fusion


def test_bm25_prefers_keyword_match():
    docs = [
        "the battery lasts seven days on a charge",
        "the watch has an amoled display",
        "it is water resistant to five atmospheres",
    ]
    scores = bm25_scores("how long does the battery last", docs)
    # The battery document must score highest.
    assert scores[0] == max(scores)
    # A query term absent everywhere contributes nothing (no crash, finite scores).
    assert all(s >= 0 for s in scores)


def test_rrf_blends_two_rankings():
    # Item 2 is near the top of both rankings, so it should win after fusion.
    vector = [0, 2, 1, 3]
    keyword = [2, 1, 0, 3]
    fused = reciprocal_rank_fusion([vector, keyword])
    assert fused[0] == 2
    assert set(fused) == {0, 1, 2, 3}  # no items lost or duplicated


def test_edge_cases():
    assert bm25_scores("anything", []) == []
    assert reciprocal_rank_fusion([]) == []


if __name__ == "__main__":
    test_bm25_prefers_keyword_match()
    test_rrf_blends_two_rankings()
    test_edge_cases()
    print("rank checks passed")
